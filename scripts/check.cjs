const fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const html = [
  "index.html",
  "tools/passport-form.html",
  "tools/guardian-form.html",
  "tools/passport-forms.html",
];
for (const file of html) {
  const text = fs.readFileSync(file, "utf8");
  assert(text.startsWith("<!doctype html>"), file);
  for (const match of text.matchAll(
    /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g,
  ))
    new vm.Script(match[1], { filename: file });
  for (const m of text.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url = m[1];
    if (/^(data:|https?:|mailto:|#)/.test(url)) continue;
    assert(!url.startsWith("/"), "Root-absolute URL: " + url);
    assert(
      fs.existsSync(path.resolve(path.dirname(file), url.split("#")[0])),
      "Missing " + url,
    );
  }
  assert(
    !/fetch\(|XMLHttpRequest|sendBeacon|localStorage|indexedDB/.test(text),
    "Unexpected network/storage API",
  );
}
for (const f of ["assets/tools-extra.js", "assets/app.js"])
  new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
for (const file of ["passport-application", "legal-guardian-consent"])
  assert(
    fs.readFileSync(`original-forms/${file}.pdf`).subarray(0, 5).toString() ===
      "%PDF-",
  );
const licenses = JSON.parse(fs.readFileSync("assets/vendor-hashes.json"));
for (const [file, hash] of Object.entries(licenses))
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync("assets/" + file))
      .digest("hex"),
    hash,
  );
console.log(
  "HTML, JS syntax, relative resources, original PDFs and vendor hashes: PASS",
);

for (const file of ["assets/app.js", "assets/tools-extra.js"]) {
  const text = fs.readFileSync(file, "utf8");
  assert(
    !/fetch\(|XMLHttpRequest|sendBeacon|localStorage|indexedDB|https?:\/\//.test(
      text,
    ),
    "Unexpected network/storage API: " + file,
  );
}

for (const f of [
  "assets/forms.js",
  "assets/form-pdf.js",
  "assets/form-catalog.js",
])
  new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
const catalog = vm.runInNewContext(
  fs.readFileSync("assets/form-catalog.js", "utf8") + "; FORM_CATALOG",
);
assert.equal(catalog.length, 14);
for (const form of catalog) {
  const pdf = fs.readFileSync("original-forms/official/" + form.id + ".pdf");
  assert.equal(
    crypto.createHash("sha256").update(pdf).digest("hex"),
    form.sha256,
  );
  if (!form.example)
    for (let i = 1; i <= form.pages; i++)
      assert(fs.existsSync(`assets/form-pages/${form.id}-${i}.png`));
}
console.log("Official form catalog, 14 PDF hashes and page images: PASS");
