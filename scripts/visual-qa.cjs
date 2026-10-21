// Optional local-only visual review. Never upload this output directory.
const { chromium } = require("@playwright/test");
const fs = require("node:fs/promises");
const { execFileSync } = require("node:child_process");
(async () => {
  const dir = ".local-qa/visual";
  await fs.mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const base = process.env.BASE_URL || "http://127.0.0.1:4173/kintheusa/";
  await page.goto(base);
  await page.screenshot({ path: `${dir}/home-desktop.png`, fullPage: true });
  for (const type of ["passport", "guardian"]) {
    await page.goto(base + `tools/${type}-form.html`);
    await page.locator("#f-child_name").fill("가상테스트");
    await page.locator("#f-child_id").fill("123456-1234567");
    const dates =
      type === "passport"
        ? ["application_date", "consent_date"]
        : ["signed_date"];
    for (const date of dates)
      await page.locator("#f-" + date).fill("2024-02-29");
    if (type === "guardian") {
      for (const n of [1, 2]) {
        await page.locator(`#f-p${n}_name`).fill("가상대리인");
        await page.locator(`#f-p${n}_id`).fill("123456-1234567");
        await page.locator(`#f-p${n}_relation`).fill(n === 1 ? "부" : "모");
      }
      await page.locator("#f-consent_type").selectOption("발급");
    } else await page.locator("#f-passport_type").selectOption("일반");
    await page.screenshot({
      path: `${dir}/${type}-preview.png`,
      fullPage: true,
    });
    const event = page.waitForEvent("download");
    await page.locator("#downloadPdfButton").click();
    await (await event).saveAs(`${dir}/${type}.pdf`);
    execFileSync("pdftoppm", [
      "-scale-to",
      "1403",
      "-png",
      `${dir}/${type}.pdf`,
      `${dir}/${type}`,
    ]);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base);
  await page.screenshot({ path: `${dir}/home-mobile.png`, fullPage: true });
  await browser.close();
  console.log("Local visual artifacts: " + dir);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
