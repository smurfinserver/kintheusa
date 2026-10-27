import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createRelay } from "../server/server.mjs";
const require = createRequire(import.meta.url),
  { chromium, firefox } = require("@playwright/test");
for (const [name, browserType] of [
  ["chromium", chromium],
  ["firefox", firefox],
])
  test(`${name}: two viewers, location moves, destination, revocation and no third-party requests`, async () => {
    const adminKey = "b".repeat(64),
      server = createRelay({ adminKey });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (p, method, key, data) => {
      const r = await fetch(base + p, {
        method,
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
        },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      assert.ok(r.ok);
      return r.json();
    };
    const browser = await browserType.launch();
    try {
      const s = await request("/api/sessions", "POST", adminKey, {}),
        path = "/api/sessions/" + s.id;
      const a = await browser.newPage(),
        b = await browser.newPage({ viewport: { width: 375, height: 812 } }),
        remote = [],
        errors = [];
      for (const p of [a, b]) {
        p.on("request", (r) => {
          if (!r.url().startsWith(base)) remote.push(r.url());
        });
        p.on("pageerror", (e) => errors.push(e.message));
        await p.goto(`${base}/#${s.id}.${s.viewer}`);
      }
      await request(path + "/position", "PUT", s.owner, {
        lat: 33.4484,
        lon: -112.074,
        accuracy: 10,
        timestamp: Date.now(),
      });
      await a.getByText("위치 정확도 약 10m", { exact: false }).waitFor();
      await b.getByText("위치 정확도 약 10m", { exact: false }).waitFor();
      await request(path + "/destination", "PUT", s.owner, {
        lat: 33.5,
        lon: -112.1,
      });
      await request(path + "/position", "PUT", s.owner, {
        lat: 33.449,
        lon: -112.07,
        accuracy: 9,
        timestamp: Date.now(),
      });
      await a.getByText("위치 정확도 약 9m", { exact: false }).waitFor();
      assert.equal(
        await b.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await request(path, "DELETE", s.owner);
      for (const p of [a, b]) {
        await p.getByText("공유가 종료되었거나 만료된 링크입니다.").waitFor();
        assert.equal(await p.locator(".leaflet-overlay-pane path").count(), 0);
      }
      assert.deepEqual(remote, []);
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
      await new Promise((r) => server.close(r));
    }
  });
test("owner map selection/revocation and viewer hides position offline", async () => {
  const base = "http://127.0.0.1:18879",
    adminKey = "c".repeat(64),
    server = createRelay({ adminKey, origin: base });
  await new Promise((r) => server.listen(18879, "127.0.0.1", r));
  const request = async (p, m, k, d) => {
    const r = await fetch(base + p, {
      method: m,
      headers: {
        Authorization: "Bearer " + k,
        "Content-Type": "application/json",
      },
      body: d === undefined ? undefined : JSON.stringify(d),
    });
    assert.ok(r.ok);
    return r.json();
  };
  const browser = await chromium.launch();
  try {
    const s = await request("/api/sessions", "POST", adminKey, {}),
      path = "/api/sessions/" + s.id;
    await request(path + "/position", "PUT", s.owner, {
      lat: 33.4484,
      lon: -112.074,
      accuracy: 10,
      timestamp: Date.now(),
    });
    const owner = await browser.newPage(),
      ctx = await browser.newContext(),
      viewer = await ctx.newPage();
    await owner.goto(`${base}/#${s.id}.${s.owner}.manage`);
    await viewer.goto(`${base}/#${s.id}.${s.viewer}`);
    await owner.getByText("위치 정확도 약 10m", { exact: false }).waitFor();
    await viewer.getByText("위치 정확도 약 10m", { exact: false }).waitFor();
    await owner.locator("#map").click({ position: { x: 800, y: 300 } });
    await owner
      .getByText("목적지를 지정했습니다. 경로를 계산합니다.")
      .waitFor();
    assert.ok((await request(path, "GET", s.viewer)).destination);
    await ctx.setOffline(true);
    await viewer
      .getByText("연결이 끊겨 위치 표시를 숨겼습니다. 다시 연결하고 있습니다.")
      .waitFor();
    assert.equal(await viewer.locator(".leaflet-overlay-pane path").count(), 0);
    await ctx.setOffline(false);
    await viewer.getByText("위치 정확도 약 10m", { exact: false }).waitFor();
    owner.on("dialog", (d) => d.accept());
    await owner.locator("#revoke").click();
    await viewer.getByText("공유가 종료되었거나 만료된 링크입니다.").waitFor();
    assert.equal(await viewer.locator(".leaflet-overlay-pane path").count(), 0);
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});
test("slow map tiles do not block link revocation polling", async () => {
  const { default: http } = await import("node:http");
  const timers = new Set();
  const tiles = http.createServer((req, res) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      res.writeHead(503);
      res.end();
    }, 15000);
    timers.add(timer);
  });
  await new Promise((r) => tiles.listen(0, "127.0.0.1", r));
  const adminKey = "d".repeat(64),
    server = createRelay({
      adminKey,
      tileUrl: `http://127.0.0.1:${tiles.address().port}`,
    });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (p, m, k, d) => {
    const r = await fetch(base + p, {
      method: m,
      headers: {
        Authorization: "Bearer " + k,
        "Content-Type": "application/json",
      },
      body: d === undefined ? undefined : JSON.stringify(d),
    });
    assert.ok(r.ok);
    return r.json();
  };
  const browser = await chromium.launch();
  try {
    const s = await call("/api/sessions", "POST", adminKey, {}),
      path = "/api/sessions/" + s.id;
    await call(path + "/position", "PUT", s.owner, {
      lat: 33.4484,
      lon: -112.074,
      accuracy: 8,
      timestamp: Date.now(),
    });
    const page = await browser.newPage();
    await page.goto(`${base}/#${s.id}.${s.viewer}`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByText("위치 정확도 약 8m", { exact: false }).waitFor();
    await page.waitForFunction(
      () => document.querySelectorAll(".leaflet-tile[src]").length >= 2,
    );
    await call(path, "DELETE", s.owner);
    await page
      .getByText("공유가 종료되었거나 만료된 링크입니다.")
      .waitFor({ timeout: 8000 });
  } finally {
    await browser.close();
    server.closeAllConnections();
    tiles.closeAllConnections();
    for (const timer of timers) clearTimeout(timer);
    await Promise.all([
      new Promise((r) => server.close(r)),
      new Promise((r) => tiles.close(r)),
    ]);
  }
});
