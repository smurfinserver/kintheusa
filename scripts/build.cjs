const fs = require("node:fs");
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");
// Explicit public allowlist: never publish tests, reports, inputs, or repository metadata.
for (const name of ["index.html", "assets", "tools", "original-forms"])
  fs.cpSync(name, `dist/${name}`, { recursive: true });
fs.writeFileSync("dist/.nojekyll", "");
