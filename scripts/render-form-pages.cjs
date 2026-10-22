// Optional maintenance: regenerate committed previews from the official PDFs.
// Requires Poppler's pdftoppm; normal builds use the already committed PNG files.
const fs = require("node:fs"),
  vm = require("node:vm"),
  { execFileSync } = require("node:child_process");
const forms = vm.runInNewContext(
  fs.readFileSync("assets/form-catalog.js", "utf8") + "; FORM_CATALOG",
);
fs.mkdirSync("assets/form-pages", { recursive: true });
for (const form of forms.filter((f) => !f.example))
  execFileSync(
    "pdftoppm",
    [
      "-scale-to",
      "1684",
      "-png",
      `original-forms/official/${form.id}.pdf`,
      `assets/form-pages/${form.id}`,
    ],
    { stdio: "inherit" },
  );
