"use strict";
const $ = (id) => document.getElementById(id);
const [id, key, role] = location.hash.slice(1).split(".");
// Secrets stay in the fragment, never in HTTP paths or referrers.
const manage = role === "manage";
const map = L.map("map", {
  zoomControl: false,
  zoomAnimation: false,
  fadeAnimation: false,
}).setView([33.4484, -112.074], 12);
L.control.zoom({ position: "topright" }).addTo(map);
// Reserve HTTP/1.1 connection capacity for position and revocation polling.
const tileQueue = [];
let activeTiles = 0;
function pumpTiles() {
  while (activeTiles < 2 && tileQueue.length) {
    const job = tileQueue.shift();
    if (job.cancelled) continue;
    activeTiles++;
    job.started = true;
    let timer;
    job.finish = (error) => {
      if (job.finished) return;
      job.finished = true;
      clearTimeout(timer);
      activeTiles--;
      job.image.onload = job.image.onerror = null;
      job.done(error, job.image);
      pumpTiles();
    };
    job.image.onload = () => job.finish(null);
    job.image.onerror = () =>
      job.finish(Error("지도 타일을 불러오지 못했습니다."));
    timer = setTimeout(() => {
      job.image.src = "";
      job.finish(Error("지도 응답 지연"));
    }, 45000);
    job.image.src = `tiles/${job.coords.z}/${job.coords.x}/${job.coords.y}.png`;
  }
}
const QueuedTiles = L.TileLayer.extend({
  createTile(coords, done) {
    const image = document.createElement("img");
    image.alt = "";
    const job = { image, coords, done };
    image.kinJob = job;
    tileQueue.push(job);
    queueMicrotask(pumpTiles);
    return image;
  },
});
let marker,
  circle,
  dest,
  line,
  first = true,
  ended = false,
  expires = 0,
  last = null;
function erase() {
  for (const layer of [marker, circle, dest, line])
    if (layer) map.removeLayer(layer);
  marker = circle = dest = line = null;
  last = null;
  $("fitRoute").hidden = true;
  $("details").textContent = "";
  $("routeStatus").textContent = "";
}
function end() {
  ended = true;
  erase();
  $("manage").hidden = true;
  $("status").textContent = "공유가 종료되었거나 만료된 링크입니다.";
}
async function api(method = "GET", suffix = "", body) {
  const r = await fetch(`api/sessions/${id}${suffix}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (r.status === 404) {
    end();
    throw Error("ended");
  }
  if (!r.ok) throw Error("request");
  return r.json();
}
function freshness() {
  if (expires && Date.now() >= expires) {
    end();
    return;
  }
  if (last && !ended) {
    const age = Math.max(0, Math.floor((Date.now() - last.timestamp) / 1000));
    $("status").textContent =
      age > 30
        ? `위치 갱신 지연 · ${age}초 전 위치`
        : `위치 공유 중 · ${age}초 전 갱신`;
  }
}
async function poll() {
  if (ended) return;
  try {
    const s = await api();
    expires = Date.now() + (s.expires - s.serverTime);
    last = s.position;
    if (last) {
      const ll = [last.lat, last.lon];
      if (!marker) {
        marker = L.circleMarker(ll, {
          radius: 9,
          color: "white",
          weight: 3,
          fillColor: "#2879ee",
          fillOpacity: 1,
        }).addTo(map);
        circle = L.circle(ll, {
          radius: last.accuracy,
          color: "#2879ee",
          weight: 1,
          fillOpacity: 0.08,
        }).addTo(map);
      } else {
        marker.setLatLng(ll);
        circle.setLatLng(ll).setRadius(last.accuracy);
      }
      if (first) {
        map.setView(ll, 15);
        first = false;
      }
      $("details").textContent =
        `위치 정확도 약 ${Math.round(last.accuracy)}m · 종료 ${new Date(expires).toLocaleTimeString("ko-KR")}`;
    } else
      $("status").textContent = "공유자가 위치를 보내기를 기다리고 있습니다.";
    for (const layer of [dest, line]) if (layer) map.removeLayer(layer);
    dest = line = null;
    if (s.destination)
      dest = L.circleMarker([s.destination.lat, s.destination.lon], {
        color: "#d54141",
        radius: 8,
      })
        .bindTooltip("목적지")
        .addTo(map);
    $("fitRoute").hidden = !s.route;
    if (s.route) {
      line = L.geoJSON(s.route.geometry, {
        style: { color: "#397bed", weight: 6, opacity: 0.7 },
      }).addTo(map);
      $("routeStatus").textContent =
        `자동차 경로 ${(s.route.distance / 1000).toFixed(1)}km · 약 ${Math.ceil(s.route.duration / 60)}분 (교통정보 미반영)`;
    } else
      $("routeStatus").textContent = s.destination
        ? "경로 계산 중이거나 이 구간의 경로를 찾지 못했습니다."
        : "";
    freshness();
  } catch {
    if (!ended) {
      erase();
      $("status").textContent =
        "연결이 끊겨 위치 표시를 숨겼습니다. 다시 연결하고 있습니다.";
    }
  } finally {
    if (!ended) setTimeout(poll, 3000);
  }
}
$("fitRoute").onclick = () => {
  if (line)
    map.fitBounds(line.getBounds(), {
      paddingTopLeft: innerWidth > 600 ? [380, 40] : [24, 24],
      paddingBottomRight:
        innerWidth > 600 ? [40, 40] : [24, innerHeight * 0.45],
    });
};
$("center").onclick = () => {
  if (last) map.setView([last.lat, last.lon], 15);
};
$("clear").onclick = async () => {
  try {
    await api("PUT", "/destination", null);
  } catch {
    if (!ended) $("status").textContent = "목적지 삭제 실패. 다시 시도하세요.";
  }
};
$("revoke").onclick = async () => {
  if (!confirm("공유를 종료하고 링크를 폐기할까요?")) return;
  try {
    await api("DELETE");
    end();
  } catch {
    if (!ended)
      $("status").textContent =
        "종료 요청이 전달되지 않았습니다. 연결 후 다시 시도하세요.";
  }
};
map.on("click", async (e) => {
  if (!manage || ended) return;
  try {
    await api("PUT", "/destination", { lat: e.latlng.lat, lon: e.latlng.lng });
    $("routeStatus").textContent = "목적지를 지정했습니다. 경로를 계산합니다.";
  } catch {
    if (!ended) $("status").textContent = "목적지 저장 실패. 다시 시도하세요.";
  }
});
fetch("api/config")
  .then((r) => r.json())
  .then((c) => {
    if (c.tiles)
      new QueuedTiles("tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        bounds: [
          [31.2, -114.9],
          [37.1, -109],
        ],
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
      })
        .on("tileunload", (e) => {
          const j = e.tile.kinJob;
          if (j) {
            j.cancelled = true;
            if (j.started && !j.finished) {
              j.image.src = "";
              j.finish(null);
            }
          }
        })
        .addTo(map);
    else
      $("routeStatus").textContent =
        "서버의 지도 데이터가 아직 준비되지 않았습니다.";
  })
  .catch(() => {
    $("status").textContent = "서버에 연결할 수 없습니다.";
  });
if (!/^[\w-]{43}$/.test(id || "") || !/^[\w-]{43}$/.test(key || "")) {
  end();
  $("status").textContent = "Android 앱에서 생성한 공유 링크로 접속하세요.";
} else {
  $("manage").hidden = !manage;
  poll();
  setInterval(freshness, 1000);
}
