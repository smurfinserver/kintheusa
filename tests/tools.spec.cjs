const { test: base, expect } = require("@playwright/test");
const { PDFDocument, PDFName, PDFNumber, PDFDict, rgb } = require("pdf-lib");
const { PNG } = require("pngjs");
const jpeg = require("jpeg-js");
const fs = require("node:fs/promises");
// Only synthetic data, held in memory; Playwright deletes its temporary downloads.
const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const errors = [],
      network = [];
    const origin = new URL(baseURL).origin;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (
        ["http:", "https:"].includes(u.protocol) &&
        (u.origin !== origin ||
          r.method() !== "GET" ||
          u.search ||
          r.postData())
      )
        network.push(r.url());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await use(page);
    expect(network, "No remote requests or input in requests").toEqual([]);
    expect(
      errors,
      "No console errors, failed resources or uncaught exceptions",
    ).toEqual([]);
  },
});
async function tool(page, id) {
  await page.goto("./");
  await page.locator(`a.tool-card[href="#tool/${id}"]`).click();
  await expect(page.locator("#toolPage")).toBeVisible();
}
async function download(page, selector) {
  const event = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await event;
  expect(await d.failure()).toBeNull();
  return {
    name: d.suggestedFilename(),
    bytes: await fs.readFile(await d.path()),
  };
}
function picture(type = "png") {
  const png = new PNG({ width: 120, height: 80 });
  for (let y = 0; y < 80; y++)
    for (let x = 0; x < 120; x++) {
      const i = (y * 120 + x) * 4;
      const center = x >= 40 && x < 80 && y >= 20 && y < 60;
      png.data.set(center ? [220, 30, 50, 255] : [255, 255, 255, 255], i);
    }
  return {
    name: `synthetic.${type}`,
    mimeType: type === "png" ? "image/png" : "image/jpeg",
    buffer: type === "png" ? PNG.sync.write(png) : jpeg.encode(png, 90).data,
  };
}
async function pdfFile(name, width = 300) {
  const doc = await PDFDocument.create();
  const p = doc.addPage([width, 400]);
  p.drawRectangle({ x: 20, y: 20, width: 50, height: 50, color: rgb(1, 0, 0) });
  p.drawText(name);
  return {
    name: name + ".pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(await doc.save()),
  };
}
async function parsedPdf(d, pages, width, height) {
  expect(d.name).toMatch(/\.pdf$/);
  expect(d.bytes.subarray(0, 5).toString()).toBe("%PDF-");
  const doc = await PDFDocument.load(d.bytes);
  expect(doc.getPageCount()).toBe(pages);
  if (width)
    for (const p of doc.getPages()) {
      expect(p.getWidth()).toBeCloseTo(width, 1);
      expect(p.getHeight()).toBeCloseTo(height, 1);
    }
  return doc;
}
async function printed(page, selector) {
  await page.evaluate(() => {
    window.print = () => (window.__printed = true);
  });
  await page.locator(selector).click();
  expect(await page.evaluate(() => window.__printed)).toBe(true);
}
async function copied(page, selector, text) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text) => (window.__copied = text) },
    });
  });
  await page.locator(selector).click();
  expect(await page.evaluate(() => window.__copied)).toBe(text);
}

test("00 home: sixteen cards, search, categories, reset, routes, refresh and mobile width", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".tool-card")).toHaveCount(16);
  const hrefs = await page
    .locator(".tool-card")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
  await page.locator("#search").fill("없는도구XYZ");
  await expect(page.locator(".tool-card")).toHaveCount(0);
  await page.locator("#resetFilter").click();
  await expect(page.locator(".tool-card")).toHaveCount(16);
  await page.locator('[data-cat="passport"]').click();
  await expect(page.locator(".tool-card")).toHaveCount(4);
  await page.locator('[data-cat="all"]').click();
  await page.locator("#search").fill("단위");
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.locator("#search").fill("");
  for (const href of hrefs) {
    await page.locator(`.tool-card[href="${href}"]`).click();
    await page.reload();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (href.startsWith("#")) {
      await expect(page.locator("#toolPage h1")).toBeVisible();
      await page.locator("#backHome").click();
    } else {
      await expect(page.locator(".paper")).not.toHaveCount(0);
      await page.locator(".kin-home").click();
    }
    await expect(page.locator(".tool-card")).toHaveCount(16);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.goto("./#tool/%");
  await expect(page.locator("#home")).toBeVisible();
  await page.locator("#search").focus();
  await page.keyboard.type("사진");
  await expect(page.locator(".tool-card")).not.toHaveCount(16);
});

test("01 passport photo: upload, zoom, pointer drag, KR/US JPG pixels", async ({
  page,
  isMobile,
}) => {
  await tool(page, "passport-photo");
  await page.locator("#passportUpload").setInputFiles(picture());
  await expect(page.locator("#passportDownload")).toBeEnabled();
  await page.locator("#passportZoom").fill("180");
  await expect(page.locator("#zoomLabel")).toHaveText("180%");
  const canvas = page.locator("#cropCanvas");
  const before = await canvas.evaluate((c) => c.toDataURL());
  const box = await canvas.boundingBox();
  if (isMobile) {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: box.x + box.width / 2 + 25, y: box.y + box.height / 2 + 10 },
      ],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  } else {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 25,
      box.y + box.height / 2 + 10,
    );
    await page.mouse.up();
  }
  expect(await canvas.evaluate((c) => c.toDataURL())).not.toBe(before);
  for (const [preset, w, h] of [
    ["kr", 413, 531],
    ["us", 600, 600],
  ]) {
    await page.locator("#passportPreset").selectOption(preset);
    const d = await download(page, "#passportDownload");
    expect(d.name).toMatch(/\.jpg$/);
    const img = jpeg.decode(d.bytes);
    expect([img.width, img.height]).toEqual([w, h]);
  }
  await expect(page.locator(".work-note")).toContainText(
    "자동으로 검증하지는 않습니다",
  );
});

for (const [id, count, date] of [
  ["passport", 2, "application_date"],
  ["guardian", 1, "signed_date"],
])
  test(`${id === "passport" ? "02" : "03"} ${id} form: synthetic fields, dates, JSON round trip, A4 PDF, print`, async ({
    page,
    browserName,
  }) => {
    await page.goto(`tools/${id}-form.html`);
    await page.locator("#f-child_name").fill("가상테스트");
    await page.locator("#f-child_id").fill("123456-1234567");
    await page.locator(`#f-${date}`).fill("2024-02-29");
    if (id === "guardian") {
      for (const n of [1, 2]) {
        await page.locator(`#f-p${n}_id`).fill("1234561234567");
        await expect(page.locator(`#f-p${n}_id`)).toHaveValue("123456-1234567");
        await page.locator(`#f-p${n}_name`).fill("가상대리인");
        await page
          .locator(`#f-p${n}_address`)
          .fill("123 Example Street, Test City");
        await page.locator(`#f-p${n}_relation`).fill(n === 1 ? "부" : "모");
      }
      await page.locator("#f-consent_type").selectOption("발급");
      await expect(page.locator(".page-mark")).toHaveText("✔");
    } else {
      await page.locator("#f-consent_date").fill("2024-03-01");
      await page.locator("#f-passport_type").selectOption("일반");
      await expect(page.locator(".page-mark")).toHaveText("✔");
    }
    await expect(page.locator(".overlay").first()).toContainText("2024");
    await expect(page.locator("#f-child_id")).toHaveValue("123456-1234567");
    const cfg = await page.evaluate(() => ({
      dates: cfg.overlays.filter((r) => r.type === "date"),
      values: { ...values },
      coord: coords,
    }));
    expect(cfg.dates.map((x) => x.points)).toEqual(
      id === "passport"
        ? [
            [
              [714, 907, 47],
              [780, 907, 29],
              [844, 907, 28],
            ],
            [
              [717, 1064, 47],
              [781, 1064, 27],
              [846, 1064, 27],
            ],
          ]
        : [
            [
              [714, 920, 50],
              [782, 920, 30],
              [843, 920, 30],
            ],
          ],
    );
    // Inspect canvas drawing as well as DOM: preserves date centers and rrn cell layout.
    const stamps = await page.evaluate(() => {
      const writes = [];
      stampOverlay({
        set fillStyle(v) {},
        set font(v) {},
        set textAlign(v) {},
        set textBaseline(v) {},
        measureText: (t) => ({ width: t.length * 10 }),
        fillText: (...args) => writes.push(args),
      });
      return writes;
    });
    for (const d of cfg.dates) {
      const dateValue = cfg.values[d.field];
      if (!dateValue) continue;
      d.points.forEach(([x, y, w], i) => {
        const part =
          i === 0
            ? dateValue.slice(0, 4)
            : String(Number(dateValue.split("-")[i]));
        expect(
          stamps.some((s) => s[0] === part && s[1] === x + w / 2 && s[2] === y),
        ).toBe(true);
      });
    }
    const json = await download(page, 'button[onclick="downloadJSON()"]');
    expect(JSON.parse(json.bytes).values.child_id).toBe("123456-1234567");
    await page.locator("#f-child_name").fill("변경");
    await page.locator("#jsonFile").setInputFiles({
      name: "synthetic.json",
      mimeType: "application/json",
      buffer: json.bytes,
    });
    await expect(page.locator("#f-child_name")).toHaveValue("가상테스트");
    const pdf = await download(page, "#downloadPdfButton");
    const parsed = await parsedPdf(pdf, count, 595.276, 841.89);
    // Decode the actual raster embedded in the downloaded PDF, not just its header.
    const xobjects = parsed
      .getPage(0)
      .node.Resources()
      .lookup(PDFName.of("XObject"));
    const raster = jpeg.decode(
      parsed.context.lookup(xobjects.values()[0]).getContents(),
    );
    expect(raster.width).toBeGreaterThan(1000);
    expect(raster.height).toBeGreaterThan(1000);
    await expect(page.locator("#actionStatus")).toContainText(
      "PDF를 만들었습니다",
    );
    await printed(page, 'button[onclick="doPrint()"]');
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".sidebar")).toBeHidden();
    if (browserName === "chromium") {
      await parsedPdf(
        {
          name: "print.pdf",
          bytes: await page.pdf({
            preferCSSPageSize: true,
            printBackground: true,
          }),
        },
        count,
        594.96,
        841.92,
      );
    }
    await page.emulateMedia({ media: "screen" });
    await expect(page.locator(".guide")).toContainText("서명은 인쇄 후");
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
    ).toEqual({ local: 0, session: 0 });
  });

test("04 checklist: scenario, check/uncheck, add/remove, memo, TXT and print", async ({
  page,
}) => {
  await tool(page, "document-checklist");
  await page.locator("#scenario").selectOption("minor");
  await expect(page.locator("#checkItems")).toContainText("법정대리인 동의서");
  const first = page.locator("#checkItems input").first();
  await first.check();
  await first.uncheck();
  await first.check();
  await page.locator("#newItem").fill("가상 추가서류");
  await page.locator("#addItem").click();
  await expect(page.locator("#checkItems li")).toHaveCount(5);
  await page.locator("#checkMemo").fill("가상 메모");
  const d = await download(page, "#checkSave");
  expect(d.name).toMatch(/\.txt$/);
  expect(d.bytes.toString()).toContain("[✓] 여권발급신청서");
  expect(d.bytes.toString()).toContain("가상 메모");
  await page.locator('[data-delete="4"]').click();
  await expect(page.locator("#checkItems li")).toHaveCount(4);
  await printed(page, "#checkPrint");
});

test("05 background removal: edge flood, undo, click, erase/restore, actual transparent PNG", async ({
  page,
}) => {
  await tool(page, "bg-remove");
  await page.locator("#bgFile").setInputFiles(picture());
  await expect(page.locator("#extraStatus")).toContainText("120");
  const alpha = () =>
    page.locator("#bgCanvas").evaluate((c) => {
      const x = c.getContext("2d");
      return [
        x.getImageData(0, 0, 1, 1).data[3],
        x.getImageData(60, 40, 1, 1).data[3],
      ];
    });
  await page.locator("#bgAuto").click();
  expect(await alpha()).toEqual([0, 255]);
  await page.locator("#bgUndo").click();
  expect(await alpha()).toEqual([255, 255]);
  await page.locator("#bgCanvas").click({ position: { x: 5, y: 5 } });
  expect(await alpha()).toEqual([0, 255]);
  await page.locator("#brushMode").selectOption("erase");
  await page.locator("#bgCanvas").click({ position: { x: 60, y: 40 } });
  expect(await alpha()).toEqual([0, 0]);
  await page.locator("#brushMode").selectOption("restore");
  await page.locator("#bgCanvas").click({ position: { x: 60, y: 40 } });
  expect(await alpha()).toEqual([0, 255]);
  const d = await download(page, "#bgSave");
  const png = PNG.sync.read(d.bytes);
  expect(png.data[3]).toBe(0);
  expect(png.data[(40 * 120 + 60) * 4 + 3]).toBe(255);
});

test("06 resize: JPG/PNG upload, aspect lock, dimensions, output formats and invalid size", async ({
  page,
}) => {
  await tool(page, "image-resize");
  for (const type of ["png", "jpg"]) {
    await page.locator("#resizeUpload").setInputFiles(picture(type));
    await expect(page.locator("#resizeW")).toHaveValue("120");
    await page.locator("#resizeW").fill("60");
    await expect(page.locator("#resizeH")).toHaveValue("40");
    await page.locator("#resizeLock").uncheck();
    await page.locator("#resizeH").fill("30");
    await page
      .locator("#resizeFormat")
      .selectOption(type === "png" ? "image/png" : "image/jpeg");
    const d = await download(page, "#resizeSave");
    const img = type === "png" ? PNG.sync.read(d.bytes) : jpeg.decode(d.bytes);
    expect([img.width, img.height]).toEqual([60, 30]);
    expect(d.name).toMatch(new RegExp("\\." + type + "$"));
    await page.locator("#resizeLock").check();
  }
  await page.locator("#resizeW").fill("7000");
  await page.locator("#resizeSave").click();
  await expect(page.locator("#resizeStatus")).toContainText("1~6,000px");
});

test("07 PDF merge: order, page count, local-only library, malformed/encrypted errors", async ({
  page,
}) => {
  await tool(page, "pdf-merge");
  await page
    .locator("#pdfFiles")
    .setInputFiles([await pdfFile("one", 300), await pdfFile("two", 500)]);
  await page.locator('[data-up="1"]').click();
  const doc = await parsedPdf(await download(page, "#mergeSave"), 2);
  expect(doc.getPages().map((p) => p.getWidth())).toEqual([500, 300]);
  await expect(page.locator('script[src="assets/pdf-lib.min.js"]')).toHaveCount(
    1,
  );
  await page.locator('[data-remove="1"]').click();
  await page.locator('[data-remove="0"]').click();
  await page.locator("#pdfFiles").setInputFiles({
    name: "broken.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("invalid synthetic PDF"),
  });
  await page.locator("#mergeSave").click();
  await expect(page.locator("#extraStatus")).toContainText("손상되거나 암호화");
  await page.locator('[data-remove="0"]').click();
  const encrypted = await PDFDocument.create();
  encrypted.addPage();
  encrypted.context.trailerInfo.Encrypt = encrypted.context.obj({
    Filter: "Standard",
    V: 1,
    R: 2,
    O: "synthetic",
    U: "synthetic",
    P: -4,
  });
  await page.locator("#pdfFiles").setInputFiles({
    name: "encrypted-marker.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(await encrypted.save()),
  });
  await page.locator("#mergeSave").click();
  await expect(page.locator("#extraStatus")).toContainText("손상되거나 암호화");
});

test("08 images to PDF: JPG/PNG, reorder/remove, A4/Letter, orientation and margins", async ({
  page,
}) => {
  await tool(page, "image-pdf");
  await page
    .locator("#imageFiles")
    .setInputFiles([picture("png"), picture("jpg")]);
  await page.locator('[data-up="1"]').click();
  await expect(page.locator("#imageItems li").first()).toContainText(".jpg");
  await parsedPdf(await download(page, "#imagePdfSave"), 2, 595.276, 841.89);
  await page.locator("#paperSize").selectOption("letter");
  await page.locator("#orientation").selectOption("landscape");
  await page.locator("#margin").fill("0");
  await parsedPdf(await download(page, "#imagePdfSave"), 2, 792, 612);
  await page.locator('[data-remove="1"]').click();
  await parsedPdf(await download(page, "#imagePdfSave"), 1, 792, 612);
  await page.locator("#margin").fill("-1");
  await page.locator("#imagePdfSave").click();
  await expect(page.locator("#extraStatus")).toContainText("0~50mm");
});

test("09 time zones: winter/summer DST and Phoenix", async ({ page }) => {
  for (const [date, times] of [
    ["2024-01-15T12:00:00Z", ["21:00", "05:00", "04:00", "07:00"]],
    ["2024-07-15T12:00:00Z", ["21:00", "05:00", "05:00", "08:00"]],
  ]) {
    await page.clock.setFixedTime(new Date(date));
    await tool(page, "time-zone");
    await expect(page.locator(".city")).toHaveText([
      "Asia/Seoul",
      "America/Phoenix",
      "America/Los_Angeles",
      "America/New_York",
    ]);
    await expect(page.locator(".clocktime")).toHaveText(times);
  }
});

test("10 unit converter: exact factors, both directions, decimals and blank", async ({
  page,
}) => {
  await tool(page, "unit-convert");
  for (const [type, input, output] of [
    ["f", "32", "0 °C"],
    ["c", "0", "32 °F"],
    ["mi", "1", "1.609344 km"],
    ["lb", "1", "0.45359237 kg"],
    ["in", "1", "2.54 cm"],
    ["km", "1.609344", "1 mi"],
    ["kg", "0.45359237", "1 lb"],
    ["cm", "2.54", "1 in"],
    ["ft", "1", "0.3048 m"],
    ["m", "0.3048", "1 ft"],
  ]) {
    await page.locator("#convertType").selectOption(type);
    await page.locator("#convertInput").fill(input);
    await expect(page.locator("#convertOutput")).toHaveText(output);
  }
  await page.locator("#convertInput").fill("");
  await expect(page.locator("#convertOutput")).toContainText("값을 입력");
});

test("11 dates: leap day, DST, reversed and missing dates", async ({
  page,
}) => {
  await tool(page, "date-calc");
  for (const [start, end, diff, inclusive] of [
    ["2024-02-28", "2024-03-01", "2일", "3일"],
    ["2024-03-09", "2024-03-11", "2일", "3일"],
    ["2024-03-11", "2024-03-09", "-2일", "3일"],
  ]) {
    await page.locator("#dateStart").fill(start);
    await page.locator("#dateEnd").fill(end);
    await expect(page.locator("#dateDiff")).toHaveText(diff);
    await expect(page.locator("#dateInclusive")).toHaveText(inclusive);
  }
  await page.locator("#dateEnd").fill("");
  await expect(page.locator("#dateDiff")).toHaveText("—");
  await page.locator("#dateEnd").evaluate((el) => {
    el.value = "invalid";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#dateDiff")).toHaveText("—");
});

test("12 tax: before/after tax tips and invalid values", async ({ page }) => {
  await tool(page, "tax-helper");
  await expect(page.locator("#taxTotal")).toHaveText("$123.50");
  await page.locator("#tipBasis").selectOption("after");
  await expect(page.locator("#taxTotal")).toHaveText("$124.78");
  for (const [id, v] of [
    ["price", "-1"],
    ["quantity", "1.5"],
    ["tax", ""],
  ]) {
    await page.locator("#" + id).fill(v);
    await expect(page.locator("#taxTotal")).toHaveText("—");
    await expect(page.locator("#extraStatus")).toContainText("입력");
    await page.locator("#" + id).fill("1");
  }
});

test("13 character count: Hangul, English, emoji codepoints and lines", async ({
  page,
}) => {
  await tool(page, "char-count");
  await page.locator("#charInput").fill("한글 A😀\nB");
  for (const [id, text] of [
    ["charAll", "7"],
    ["charNoSpace", "5"],
    ["charWords", "3"],
    ["charLines", "2"],
  ])
    await expect(page.locator("#" + id)).toHaveText(text);
  await page.locator("#charInput").fill("👨‍👩‍👧");
  await expect(page.locator("#charAll")).toHaveText("5");
  await page.locator("#charInput").fill("");
  await expect(page.locator("#charLines")).toHaveText("0");
});

test("14 address: fields, uppercase, ZIP validation, copy and TXT", async ({
  page,
}) => {
  await tool(page, "address-helper");
  for (const [id, v] of Object.entries({
    recipient: "Synthetic Person",
    street: "123 Example St",
    unit: "Apt 4",
    city: "Test City",
    state: "az",
    zip: "00000",
  }))
    await page.locator("#" + id).fill(v);
  const text = "SYNTHETIC PERSON\n123 EXAMPLE ST APT 4\nTEST CITY, AZ 00000";
  await expect(page.locator("#addressOutput")).toHaveText(text);
  await copied(page, "#addressCopy", text);
  expect((await download(page, "#addressSave")).bytes.toString()).toBe(text);
  await page.locator("#zip").fill("abc");
  await expect(page.locator("#extraStatus")).toContainText("ZIP");
  await page.locator("#uppercase").uncheck();
  await expect(page.locator("#addressOutput")).toContainText(
    "Synthetic Person",
  );
});

test("15 keyboard: standard Dubeolsik, reverse, mixed text and copy", async ({
  page,
}) => {
  await tool(page, "keyboard");
  await page.locator("#keyboardInput").fill("dkssudgktpdy");
  await expect(page.locator("#keyboardOutput")).toHaveText("안녕하세요");
  await page.locator("#keyboardDirection").selectOption("en");
  await page.locator("#keyboardInput").fill("안녕하세요");
  await expect(page.locator("#keyboardOutput")).toHaveText("dkssudgktpdy");
  await page.locator("#keyboardDirection").selectOption("ko");
  await page.locator("#keyboardInput").fill("dkssud 한글 123 !");
  await expect(page.locator("#keyboardOutput")).toHaveText("안녕 한글 123 !");
  await copied(page, "#keyboardCopy", "안녕 한글 123 !");
});

test("16 email: templates, name/date/detail, editable body, copy/TXT/mailto", async ({
  page,
}) => {
  await tool(page, "letter-template");
  await page.locator("#letterName").fill("Synthetic Person");
  await page.locator("#letterDate").fill("2026-11-01");
  await page.locator("#letterDetail").fill("Synthetic detail only.");
  for (const type of ["appointment", "absence", "repair"]) {
    await page.locator("#letterType").selectOption(type);
    const body = await page.locator("#letterBody").inputValue();
    expect(body).toContain("Synthetic Person");
    expect(body).toContain("2026-11-01");
    expect(body).toContain("Synthetic detail only.");
  }
  await page.locator("#letterBody").fill("Edited synthetic message");
  await copied(page, "#letterCopy", "Edited synthetic message");
  expect((await download(page, "#letterSave")).bytes.toString()).toBe(
    "Edited synthetic message",
  );
  const href = await page.locator("#letterMail").getAttribute("href");
  expect(href.startsWith("mailto:")).toBe(true);
  expect(new URL(href).searchParams.get("body")).toBe(
    "Edited synthetic message",
  );
});

test("privacy and offline computation: loaded PDF library works with network disabled", async ({
  page,
  context,
}) => {
  await tool(page, "pdf-merge");
  await page
    .locator("#pdfFiles")
    .setInputFiles([await pdfFile("one"), await pdfFile("two")]);
  await download(page, "#mergeSave");
  await context.setOffline(true);
  await parsedPdf(await download(page, "#mergeSave"), 2);
  expect(
    await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      caches: await caches.keys(),
      workers: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ local: 0, session: 0, caches: [], workers: 0 });
  await context.setOffline(false);
});

test("clipboard: native permission-backed copy and denied-permission fallback", async ({
  page,
  context,
  browserName,
}) => {
  await tool(page, "keyboard");
  await page.locator("#keyboardInput").fill("dkssudgktpdy");
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#keyboardCopy").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "안녕하세요",
    );
  }
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied for test");
        },
      },
    }),
  );
  await page.locator("#keyboardCopy").click();
  await expect(page.locator("#extraStatus")).toContainText("직접 복사");
});

test("image errors: invalid uploads have Korean feedback, no unhandled failures", async ({
  page,
}) => {
  const broken = {
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("synthetic invalid image"),
  };
  for (const [id, input, status] of [
    ["passport-photo", "#passportUpload", "#photoStatus"],
    ["image-resize", "#resizeUpload", "#resizeStatus"],
    ["bg-remove", "#bgFile", "#extraStatus"],
  ]) {
    await tool(page, id);
    await page.locator(input).setInputFiles(broken);
    await expect(page.locator(status)).toContainText(/열.*(없|못)/);
  }
});
