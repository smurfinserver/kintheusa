const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};
http
  .createServer((req, res) => {
    let name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    ).replace(/^\/kintheusa(?=\/)/, "");
    if (name.endsWith("/")) name += "index.html";
    const file = path.resolve(root, "." + name);
    if (!file.startsWith(root + path.sep) || req.method !== "GET") {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(file, (err, data) => {
      res.writeHead(err ? 404 : 200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(err ? "Not found" : data);
    });
  })
  .listen(4173, "127.0.0.1");
