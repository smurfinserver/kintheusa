const { test: base, expect } = require("@playwright/test");
const { PDFDocument, PDFName } = require("pdf-lib");
const fs = require("node:fs/promises"),
  vm = require("node:vm");
const catalog = vm.runInNewContext(
  require("node:fs").readFileSync("assets/form-catalog.js", "utf8") +
    "; FORM_CATALOG",
);
const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const errors = [],
      requests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(r.status() + " " + r.url());
    });
    page.on("request", (r) => {
      if (
        r.url().startsWith("http") &&
        (new URL(r.url()).origin !== new URL(baseURL).origin ||
          r.method() !== "GET" ||
          new URL(r.url()).search)
      )
        requests.push(r.url());
    });
    await use(page);
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  },
});
async function download(page, id) {
  const event = page.waitForEvent("download");
  await page.locator(id).click();
  const d = await event;
  expect(await d.failure()).toBeNull();
  return {
    bytes: await fs.readFile(await d.path()),
    name: d.suggestedFilename(),
  };
}

test("official forms: home entry, 14 PDFs, source integrity and search", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator(".forms-banner a").click();
  await expect(page.locator(".form-card")).toHaveCount(14);
  await expect(page.locator(".edit-form")).toHaveCount(13);
  await expect(page.locator(".notice")).toContainText("수기로");
  await page.locator("#formSearch").fill("위임장");
  await expect(page.locator(".form-card")).toHaveCount(1);
  await page.locator("#formSearch").fill("없는서식");
  await expect(page.locator("#noForms")).toBeVisible();
});
for (const form of catalog)
  test(`official original ${form.id}: download and integrity`, async ({
    page,
  }) => {
    await page.goto("tools/passport-forms.html");
    const d = await download(page, `.download-form[href$="/${form.id}.pdf"]`);
    expect(
      require("node:crypto").createHash("sha256").update(d.bytes).digest("hex"),
    ).toBe(form.sha256);
    expect((await PDFDocument.load(d.bytes)).getPageCount()).toBe(form.pages);
  });
for (const form of catalog.filter((f) => !f.example))
  test(`official editor ${form.id}: type, position, JSON roundtrip, actual PDF pages`, async ({
    page,
    browserName,
  }) => {
    await page.goto("tools/passport-forms.html#" + form.id);
    await expect(page.locator("#savePdf")).toBeEnabled();
    await expect(page.locator("#pages canvas")).toHaveCount(form.pages);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.locator("#entryText").fill("가상테스트 2026-10-21");
    const canvas = page.locator("#pages canvas").first();
    await canvas.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#textX")).toHaveValue("49.9");
    await page.locator("#textX").fill("30");
    await page.locator("#textY").fill("40");
    await page.locator("#fontSize").fill("12");
    const draft = await download(page, "#saveDraft");
    const parsed = JSON.parse(draft.bytes);
    expect(parsed.form).toBe(form.id);
    expect(parsed.annotations[0]).toMatchObject({
      text: "가상테스트 2026-10-21",
      x: 0.3,
      y: 0.4,
      size: 12,
    });
    await page.locator("#removeText").click();
    await expect(page.locator("#removeText")).toBeDisabled();
    await page.locator("#undo").click();
    await page.locator("#loadDraft").setInputFiles({
      name: "draft.json",
      mimeType: "application/json",
      buffer: draft.bytes,
    });
    await expect(page.locator("#editorStatus")).toContainText("불러왔습니다");
    if (form.pages > 1) {
      await page.locator("#newText").click();
      await page.locator("#entryText").fill("두 번째 페이지 가상 입력");
      await page.locator("#pages canvas").last().focus();
      await page.keyboard.press("Enter");
    }
    await page.locator("#newText").click();
    const preview = await page
      .locator("#pages canvas")
      .evaluateAll((cs) =>
        cs.map((c) => c.toDataURL("image/jpeg", 0.96).split(",")[1]),
      );
    const output = await download(page, "#savePdf");
    const doc = await PDFDocument.load(output.bytes);
    expect(doc.getPageCount()).toBe(form.pages);
    for (let i = 0; i < form.pages; i++) {
      const p = doc.getPage(i);
      expect(p.getWidth()).toBeCloseTo(595.276, 1);
      expect(p.getHeight()).toBeCloseTo(841.89, 1);
      const objects = p.node.Resources().lookup(PDFName.of("XObject"));
      const jpeg = doc.context.lookup(objects.values()[0]).getContents();
      const decode = require("jpeg-js").decode;
      const actualImage = decode(Buffer.from(jpeg));
      const expectedImage = decode(Buffer.from(preview[i], "base64"));
      expect([actualImage.width, actualImage.height]).toEqual([
        expectedImage.width,
        expectedImage.height,
      ]);
      let delta = 0;
      for (let k = 0; k < actualImage.data.length; k++)
        delta += Math.abs(actualImage.data[k] - expectedImage.data[k]);
      // Firefox can encode onscreen/offscreen canvases with tiny raster differences.
      // Compare decoded pixels, including the typed region, rather than JPEG bytes.
      const region =
        i === 0
          ? { x: 0.3, y: 0.4, text: "가상테스트 2026-10-21" }
          : { x: 0.5, y: 0.5, text: "두 번째 페이지 가상 입력" };
      const w = actualImage.width,
        h = actualImage.height,
        px = (12 * w) / 595.276;
      let regionDelta = 0,
        samples = 0;
      for (
        let y = Math.floor(region.y * h);
        y < Math.min(h, region.y * h + px * 1.3);
        y++
      )
        for (
          let x = Math.floor(region.x * w);
          x < Math.min(w, region.x * w + region.text.length * px);
          x++
        )
          for (let c = 0; c < 3; c++) {
            const k = (y * w + x) * 4 + c;
            regionDelta += Math.abs(
              actualImage.data[k] - expectedImage.data[k],
            );
            samples++;
          }
      expect(regionDelta / samples).toBeLessThan(3);
      expect(delta / actualImage.data.length).toBeLessThan(1);
    }
    if (form.id === "passport-loss" && browserName === "chromium") {
      await page.emulateMedia({ media: "print" });
      expect(
        (
          await PDFDocument.load(
            await page.pdf({ preferCSSPageSize: true, printBackground: true }),
          )
        ).getPageCount(),
      ).toBe(2);
      await page.emulateMedia({ media: "screen" });
    }
    await page.locator("#loadDraft").setInputFiles({
      name: "wrong.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":1,"form":"wrong","annotations":[]}'),
    });
    await expect(page.locator("#editorStatus")).toContainText("이 서식의");
    expect(
      await page.evaluate(() => [localStorage.length, sessionStorage.length]),
    ).toEqual([0, 0]);
  });

test("official editor: mouse/touch placement, checkbox, selection, cancelled navigation and numeric typing", async ({
  page,
  isMobile,
}) => {
  await page.goto("tools/passport-forms.html#power-of-attorney");
  await expect(page.locator("#savePdf")).toBeEnabled();
  await page.locator("#checkMark").click();
  const c = page.locator("#pages canvas");
  await c.scrollIntoViewIfNeeded();
  const box = await c.boundingBox();
  if (isMobile)
    await page.touchscreen.tap(
      box.x + box.width * 0.3,
      box.y + box.height * 0.3,
    );
  else await c.click({ position: { x: box.width * 0.3, y: box.height * 0.3 } });
  await expect(page.locator("#entryText")).toHaveValue("✓");
  await page.locator("#textX").fill("");
  await page.locator("#textX").pressSequentially("25");
  await expect(page.locator("#textX")).toHaveValue("25");
  page.once("dialog", (d) => d.dismiss());
  await page.locator(".back").click();
  await expect(page).toHaveURL(/#power-of-attorney$/);
  const d = await download(page, "#saveDraft");
  expect(JSON.parse(d.bytes).annotations).toHaveLength(1);
  expect(JSON.parse(d.bytes).annotations[0]).toMatchObject({
    text: "✓",
    x: 0.25,
  });
});
