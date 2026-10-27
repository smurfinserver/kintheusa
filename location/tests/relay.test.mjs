import { test } from "node:test";
import assert from "node:assert/strict";
import { createRelay } from "../server/server.mjs";
const adminKey = "a".repeat(64);
async function setup(t) {
  let time = Date.now();
  const server = createRelay({ adminKey, now: () => time });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (path, method = "GET", key = "", body) => {
    const r = await fetch(base + path, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: r.status, body: await r.json(), headers: r.headers };
  };
  const create = async () =>
    (await call("/api/sessions", "POST", adminKey, { ttlSeconds: 60 })).body;
  return {
    call,
    create,
    advance: (ms) => (time += ms),
    time: () => time,
    base,
  };
}
test("only owner can publish/delete, viewer can read, revocation removes data", async (t) => {
  const { call, create, time } = await setup(t);
  assert.equal((await call("/api/sessions", "POST", "bad")).status, 401);
  const s = await create(),
    p = "/api/sessions/" + s.id;
  assert.equal((await call(p)).status, 404);
  const fix = { lat: 33.4484, lon: -112.074, accuracy: 8, timestamp: time() };
  assert.equal((await call(p + "/position", "PUT", s.viewer, fix)).status, 403);
  assert.equal((await call(p + "/position", "PUT", s.owner, fix)).status, 200);
  const r = await call(p, "GET", s.viewer);
  assert.equal(r.body.position.lat, fix.lat);
  assert.equal(r.body.owner, undefined);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal((await call(p, "DELETE", s.viewer)).status, 403);
  assert.equal((await call(p, "DELETE", s.owner)).status, 200);
  assert.equal((await call(p, "GET", s.viewer)).status, 404);
  assert.equal((await call(p + "/position", "PUT", s.owner, fix)).status, 404);
});
test("expires server-side and never accepts old or invalid fixes", async (t) => {
  const { call, create, time, advance } = await setup(t);
  const s = await create(),
    p = "/api/sessions/" + s.id;
  const f = { lat: 33, lon: -112, accuracy: 8, timestamp: time() };
  assert.equal(
    (await call(p + "/position", "PUT", s.owner, { ...f, lat: 91 })).status,
    400,
  );
  assert.equal(
    (
      await call(p + "/position", "PUT", s.owner, {
        ...f,
        timestamp: time() - 130000,
      })
    ).status,
    400,
  );
  assert.equal((await call(p + "/position", "PUT", s.owner, f)).status, 200);
  assert.equal((await call(p + "/position", "PUT", s.owner, f)).status, 409);
  advance(61000);
  assert.equal((await call(p, "GET", s.viewer)).status, 404);
});
test("destinations independent, clear works, other sessions cannot access", async (t) => {
  const { call, create } = await setup(t);
  const s = await create(),
    other = await create(),
    p = "/api/sessions/" + s.id;
  assert.equal((await call(p, "GET", other.owner)).status, 404);
  assert.equal(
    (await call(p + "/destination", "PUT", s.owner, { lat: 33.5, lon: -112.1 }))
      .status,
    200,
  );
  assert.deepEqual((await call(p, "GET", s.viewer)).body.destination, {
    lat: 33.5,
    lon: -112.1,
  });
  await call(p + "/destination", "PUT", s.owner, null);
  assert.equal((await call(p, "GET", s.viewer)).body.destination, null);
});
test("cross-origin requests rejected, malformed body and TTL rejected", async (t) => {
  const { call, base } = await setup(t);
  assert.equal(
    (
      await fetch(base + "/api/sessions", {
        method: "POST",
        headers: {
          Origin: "https://other.example",
          Authorization: "Bearer " + adminKey,
        },
      })
    ).status,
    403,
  );
  assert.equal(
    (await call("/api/sessions", "POST", adminKey, { ttlSeconds: 86401 }))
      .status,
    400,
  );
  assert.equal(
    (
      await fetch(base + "/api/sessions", {
        method: "POST",
        headers: { Authorization: "Bearer " + adminKey },
        body: "bad json",
      })
    ).status,
    400,
  );
});
test('changing destination during routing computes the new route without another GPS fix', async (t) => {
  const { default: http } = await import('node:http');
  let firstResponse, announce;
  const firstRequest = new Promise(r => { announce = r; });
  let calls = 0;
  const response = (res, n) => res.end(JSON.stringify({code:'Ok',routes:[{geometry:{type:'LineString',coordinates:[[0,0],[n,n]]},distance:n,duration:n}]}));
  const osrm = http.createServer((req,res) => { calls++; if(calls===1){firstResponse=res;announce();}else response(res,calls); });
  await new Promise(r=>osrm.listen(0,'127.0.0.1',r));
  const server=createRelay({adminKey,osrm:`http://127.0.0.1:${osrm.address().port}`});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(async()=>{server.closeAllConnections();osrm.closeAllConnections();await Promise.all([new Promise(r=>server.close(r)),new Promise(r=>osrm.close(r))]);});
  const base=`http://127.0.0.1:${server.address().port}`;
  const call=async(p,m,k,d)=>{const r=await fetch(base+p,{method:m,headers:{Authorization:'Bearer '+k,'Content-Type':'application/json'},body:d===undefined?undefined:JSON.stringify(d)});assert.ok(r.ok);return r.json();};
  const s=await call('/api/sessions','POST',adminKey,{}),p='/api/sessions/'+s.id;
  await call(p+'/position','PUT',s.owner,{lat:33.4,lon:-112.1,accuracy:8,timestamp:Date.now()});
  await call(p+'/destination','PUT',s.owner,{lat:33.5,lon:-112.2});await firstRequest;
  await call(p+'/destination','PUT',s.owner,{lat:33.6,lon:-112.3});response(firstResponse,1);
  let data;for(let i=0;i<30;i++){data=await call(p,'GET',s.viewer);if(data.route)break;await new Promise(r=>setTimeout(r,50));}
  assert.equal(data.destination.lat,33.6);assert.equal(data.route.distance,2);assert.equal(calls,2);
});
