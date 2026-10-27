import http from "node:http";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("./public/", import.meta.url));
const token = () => randomBytes(32).toString("base64url");
const hash = (s) => createHash("sha256").update(s).digest("hex");
const equal = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
const point = (p) =>
  p &&
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lon) &&
  Math.abs(p.lat) <= 90 &&
  Math.abs(p.lon) <= 180;
export function createRelay({
  adminKey,
  origin = "http://127.0.0.1:8787",
  osrm = "",
  tiles = "",
  tileUrl = "",
  now = Date.now,
} = {}) {
  if (!adminKey || adminKey.length < 32 || adminKey.startsWith("REPLACE_"))
    throw Error("ADMIN_KEY must contain at least 32 characters");
  const sessions = new Map();
  let requestWindow = now(),
    requestCount = 0,
    activeTiles = 0;

  function scheduleRoute(id, s) {
    if (
      sessions.get(id) === s &&
      s.expires > now() &&
      osrm &&
      s.position &&
      s.destination &&
      !s.routing &&
      now() - s.routeAt >= 30000
    ) {
      const version = s.version;
      s.routing = true;
      s.routeAt = now();
      const a = s.position,
        d = s.destination;
      fetch(
        `${osrm}/route/v1/driving/${a.lon},${a.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`,
        { signal: AbortSignal.timeout(8000) },
      )
        .then((r) => r.json())
        .then((data) => {
          if (sessions.get(id) !== s || s.version !== version) return;
          const r = data.routes?.[0];
          s.route =
            data.code === "Ok" && r
              ? {
                  geometry: r.geometry,
                  distance: r.distance,
                  duration: r.duration,
                  updatedAt: now(),
                }
              : null;
        })
        .catch(() => {
          if (s.version === version) s.route = null;
        })
        .finally(() => {
          s.routing = false;
          if (s.version !== version) scheduleRoute(id, s);
        });
    }
  }
  const purge = () => {
    for (const [id, s] of sessions) if (s.expires <= now()) sessions.delete(id);
  };
  const timer = setInterval(purge, 10000);
  timer.unref();
  const server = http.createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    const send = (code, data) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };
    try {
      if (now() - requestWindow >= 1000) {
        requestWindow = now();
        requestCount = 0;
      }
      if (++requestCount > 120) return send(429, { error: "rate_limit" });
      const url = new URL(req.url, "http://local");
      const p = url.pathname;
      purge();
      if (req.headers.origin && req.headers.origin !== origin)
        return send(403, { error: "origin" });
      const bearer = req.headers.authorization?.replace(/^Bearer /, "") || "";
      const body = async () => {
        let b = "";
        for await (const chunk of req) {
          b += chunk;
          if (b.length > 8192) throw Error("body");
        }
        return JSON.parse(b || "{}");
      };
      if (p === "/health" && req.method === "GET")
        return send(200, { ok: true });
      if (p === "/api/config" && req.method === "GET")
        return send(200, { tiles: !!(tiles || tileUrl), routing: !!osrm });
      if (p === "/api/sessions" && req.method === "POST") {
        if (!equal(bearer, adminKey)) return send(401, { error: "auth" });
        if (sessions.size >= 50) return send(429, { error: "capacity" });
        const b = await body();
        if (sessions.size >= 50) return send(429, { error: "capacity" });
        const ttl = b.ttlSeconds ?? 3600;
        if (!Number.isInteger(ttl) || ttl < 60 || ttl > 86400)
          return send(400, { error: "ttl" });
        const id = token(),
          owner = token(),
          viewer = token(),
          expires = now() + ttl * 1000;
        sessions.set(id, {
          owner: hash(owner),
          viewer: hash(viewer),
          expires,
          position: null,
          destination: null,
          route: null,
          routeAt: 0,
          version: 0,
        });
        return send(201, {
          id,
          owner,
          viewer,
          expires,
          url: `${origin}/#${id}.${viewer}`,
        });
      }
      const match = p.match(
        /^\/api\/sessions\/([A-Za-z0-9_-]{43})(?:\/(position|destination))?$/,
      );
      if (match) {
        const [, id, action] = match,
          s = sessions.get(id);
        if (!s) return send(404, { error: "ended" });
        const owner = equal(hash(bearer), s.owner),
          viewer = equal(hash(bearer), s.viewer);
        if (!owner && !viewer) return send(404, { error: "ended" });
        if (req.method === "GET" && !action)
          return send(200, {
            expires: s.expires,
            position: s.position,
            destination: s.destination,
            route: s.route,
            serverTime: now(),
          });
        if (!owner) return send(403, { error: "readonly" });
        if (req.method === "DELETE" && !action) {
          sessions.delete(id);
          return send(200, { ended: true });
        }
        if (
          req.method === "PUT" &&
          (action === "position" || action === "destination")
        ) {
          const b = await body();
          if (sessions.get(id) !== s || s.expires <= now())
            return send(404, { error: "ended" });
          if (action === "destination" && b === null) {
            s.destination = null;
            s.route = null;
            s.version++;
            return send(200, { ok: true });
          }
          if (!point(b)) return send(400, { error: "coordinates" });
          if (action === "position") {
            if (
              !Number.isFinite(b.accuracy) ||
              b.accuracy < 0 ||
              b.accuracy > 100000 ||
              !Number.isFinite(b.timestamp) ||
              b.timestamp > now() + 60000 ||
              b.timestamp < now() - 120000
            )
              return send(400, { error: "fix" });
            if (s.position && b.timestamp <= s.position.timestamp)
              return send(409, { error: "old_fix" });
            s.position = {
              lat: b.lat,
              lon: b.lon,
              accuracy: b.accuracy,
              timestamp: b.timestamp,
              receivedAt: now(),
            };
          } else {
            s.destination = { lat: b.lat, lon: b.lon };
            s.route = null;
            s.routeAt = 0;
            s.version++;
          }
          scheduleRoute(id, s);
          return send(200, { ok: true });
        }
        return send(405, { error: "method" });
      }
      if (req.method !== "GET") return send(404, { error: "not_found" });
      let file;
      if (p.startsWith("/tiles/")) {
        if (
          (!tiles && !tileUrl) ||
          !/^\/tiles\/\d{1,2}\/\d{1,8}\/\d{1,8}\.png$/.test(p)
        )
          return send(404, { error: "tile" });
        const [z, x, y] = p.slice(7).replace(".png", "").split("/").map(Number);
        if (z > 18 || x >= 2 ** z || y >= 2 ** z)
          return send(404, { error: "tile" });
        if (tileUrl) {
          if (activeTiles >= 32) return send(503, { error: "busy" });
          activeTiles++;
          try {
            const r = await fetch(`${tileUrl}/${z}/${x}/${y}.png`, {
              signal: AbortSignal.timeout(45000),
            });
            if (!r.ok) return send(503, { error: "tile_unavailable" });
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(Buffer.from(await r.arrayBuffer()));
            return;
          } finally {
            activeTiles--;
          }
        }
        file = path.join(tiles, p.slice(7));
      } else {
        const name = p === "/" ? "index.html" : p.slice(1);
        file = path.resolve(root, name);
        if (!file.startsWith(root)) return send(404, { error: "not_found" });
      }
      const data = await readFile(file);
      const ext = path.extname(file);
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript",
            ".css": "text/css",
            ".png": "image/png",
          }[ext] || "application/octet-stream",
      });
      res.end(data);
    } catch {
      if (!res.headersSent) send(400, { error: "invalid_request" });
      else res.end();
    }
  });
  server.headersTimeout = 10000;
  server.requestTimeout = 15000;
  server.on("close", () => clearInterval(timer));
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const adminKey = process.env.ADMIN_KEY;
  createRelay({
    adminKey,
    origin: process.env.PUBLIC_ORIGIN,
    osrm: process.env.OSRM_URL,
    tiles: process.env.TILES_DIR,
    tileUrl: process.env.TILE_URL,
  }).listen(
    Number(process.env.PORT || 8787),
    process.env.BIND || "127.0.0.1",
    () => console.log("Location relay ready"),
  );
}
