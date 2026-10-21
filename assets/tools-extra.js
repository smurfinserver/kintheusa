/* Local-only tools. No uploads, telemetry, persistence, or remote dependencies. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const field = (id, label, type = "text", value = "") =>
    `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${value}" autocomplete="off"></div>`;
  const select = (id, label, options) =>
    `<div class="field"><label for="${id}">${label}</label><select id="${id}">${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div>`;
  const btn = (id, label) =>
    `<button class="subbtn" type="button" id="${id}">${label}</button>`;
  const status =
    '<p id="extraStatus" class="statusline" role="status" aria-live="polite"></p>';
  const note = (text) => `<div class="work-note">${text}</div>`;
  function say(text, error = false) {
    if ($("#extraStatus")) {
      $("#extraStatus").textContent = text;
      $("#extraStatus").dataset.error = error;
    }
  }
  function download(data, name, type = "text/plain;charset=utf-8") {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      say("복사했습니다.");
    } catch {
      say("복사 권한이 없습니다. 본문을 선택해 직접 복사해 주세요.", true);
    }
  }
  let libraryPromise;
  function pdfLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    if (!libraryPromise)
      libraryPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "assets/pdf-lib.min.js";
        s.onload = () => resolve(window.PDFLib);
        s.onerror = () => {
          libraryPromise = null;
          s.remove();
          reject(
            Error(
              "PDF 라이브러리를 불러오지 못했습니다. 페이지를 다시 열어 주세요.",
            ),
          );
        };
        document.head.append(s);
      });
    return libraryPromise;
  }
  function content(id) {
    switch (id) {
      case "document-checklist":
        return (
          select("scenario", "방문 목적", [
            ["passport", "여권 신청"],
            ["minor", "미성년자 여권"],
            ["custom", "직접 작성"],
          ]) +
          '<ul id="checkItems" class="extra-list"></ul>' +
          field("newItem", "추가할 서류") +
          `<div class="actions-row">${btn("addItem", "항목 추가")}</div><div class="field"><label for="checkMemo">메모</label><textarea id="checkMemo" class="text-area"></textarea></div><div class="actions-row">${btn("checkSave", "TXT 저장")}${btn("checkPrint", "인쇄")}</div>` +
          status +
          note(
            "참고용 목록입니다. 최신 공관 요구사항을 자동 확인하지 않습니다. 방문 전 해당 공관의 공식 안내를 확인하세요.",
          )
        );
      case "pdf-merge":
        return (
          field("pdfFiles", "PDF 파일 선택 (여러 개)", "file") +
          '<ul id="pdfItems" class="extra-list"></ul>' +
          btn("mergeSave", "PDF 병합 다운로드") +
          status +
          note(
            "파일 순서대로 모든 페이지를 병합합니다. 암호화된 PDF는 지원하지 않습니다. 파일은 브라우저에서만 처리하며 서버에 전송하지 않습니다.",
          )
        );
      case "image-pdf":
        return (
          field("imageFiles", "사진 선택 (여러 개)", "file") +
          '<ul id="imageItems" class="extra-list"></ul><div class="formgrid">' +
          select("paperSize", "용지", [
            ["a4", "A4"],
            ["letter", "Letter"],
          ]) +
          select("orientation", "방향", [
            ["portrait", "세로"],
            ["landscape", "가로"],
          ]) +
          field("margin", "여백 (mm)", "number", "10") +
          "</div>" +
          btn("imagePdfSave", "PDF 다운로드") +
          status
        );
      case "bg-remove":
        return (
          field("bgFile", "사진 선택", "file") +
          '<div class="formgrid">' +
          select("brushMode", "편집 모드", [
            ["remove", "클릭 영역 제거"],
            ["erase", "지우기 브러시"],
            ["restore", "복원 브러시"],
          ]) +
          field("tolerance", "색상 허용 오차 (0~255)", "number", "35") +
          field("brushSize", "브러시 크기 (px)", "number", "30") +
          '</div><div class="actions-row">' +
          btn("bgAuto", "가장자리 배경 제거") +
          btn("bgUndo", "실행 취소") +
          btn("bgSave", "투명 PNG 저장") +
          '</div><div class="brush-stage"><canvas id="bgCanvas" width="1" height="1" aria-label="배경 제거 편집 화면"></canvas></div>' +
          status +
          note(
            "단색 배경의 색상과 연결 영역을 이용합니다. AI 인물 분리 기능이 아닙니다. 복잡한 배경은 브러시로 보정하세요.",
          )
        );
      case "tax-helper":
        return (
          '<div class="formgrid">' +
          field("price", "상품 가격 ($)", "number", "100") +
          field("quantity", "수량", "number", "1") +
          field("tax", "판매세 (%)", "number", "8.5") +
          field("tip", "팁 (%)", "number", "15") +
          select("tipBasis", "팁 계산 기준", [
            ["before", "세전"],
            ["after", "세후"],
          ]) +
          '</div><div class="resulttile"><small>최종 결제액</small><strong id="taxTotal"></strong></div>' +
          status +
          note("입력한 세율로 결제액을 추정합니다. 세금 신고 도구가 아닙니다.")
        );
      case "address-helper":
        return (
          '<div class="formgrid">' +
          field("recipient", "수령인") +
          field("street", "거리 주소") +
          field("unit", "호수 (Apt / Unit)") +
          field("city", "도시") +
          field("state", "주 (2자리 약자)") +
          field("zip", "ZIP 코드") +
          '</div><label class="checkline"><input id="uppercase" type="checkbox" checked> 대문자로 정리</label><pre id="addressOutput" class="extra-preview"></pre><div class="actions-row">' +
          btn("addressCopy", "복사") +
          btn("addressSave", "TXT 저장") +
          "</div>" +
          status +
          note(
            "주소 표기를 정리하는 도구이며 실제 배송 가능한 주소인지 공식 검증하지 않습니다.",
          )
        );
      case "keyboard":
        return (
          select("keyboardDirection", "변환 방향", [
            ["ko", "영문 자판 → 한글"],
            ["en", "한글 → 영문 자판"],
          ]) +
          '<div class="field"><label for="keyboardInput">입력</label><textarea id="keyboardInput" class="text-area"></textarea></div><pre id="keyboardOutput" class="extra-preview"></pre>' +
          btn("keyboardCopy", "복사") +
          status +
          note("표준 두벌식 자판 기준입니다. 공백과 특수 문자는 유지됩니다.")
        );
      case "letter-template":
        return (
          '<div class="formgrid">' +
          select("letterType", "문구 선택", [
            ["appointment", "일정 문의"],
            ["absence", "결석 안내"],
            ["repair", "수리 요청"],
          ]) +
          field("letterName", "보내는 사람 이름") +
          field("letterDate", "일정") +
          '</div><div class="field"><label for="letterDetail">상세 내용</label><textarea id="letterDetail" class="text-area"></textarea></div><div class="field"><label for="letterBody">이메일 본문 (직접 수정 가능)</label><textarea id="letterBody" class="text-area"></textarea></div><div class="actions-row">' +
          btn("letterCopy", "복사") +
          btn("letterSave", "TXT 저장") +
          '<a id="letterMail" class="subbtn" href="mailto:">메일 앱 열기</a></div>' +
          status +
          note(
            "입력 내용을 바꾸면 문구를 다시 만듭니다. 메일 앱에서 수신인과 내용을 확인한 뒤 직접 보내세요. 자동 발송되지 않습니다.",
          )
        );
    }
    return "";
  }
  function initChecklist() {
    const scenarios = {
      passport: [
        "여권발급신청서",
        "여권용 사진",
        "신분증",
        "기존 여권 (해당 시)",
      ],
      minor: [
        "여권발급신청서",
        "여권용 사진",
        "법정대리인 동의서",
        "법정대리인 신분증",
      ],
      custom: [],
    };
    let items = [];
    function render() {
      $("#checkItems").innerHTML = items
        .map(
          (x, i) =>
            `<li><label class="checkline item-name"><input type="checkbox" data-check="${i}" ${x.done ? "checked" : ""}>${esc(x.text)}</label><button data-delete="${i}" aria-label="${esc(x.text)} 삭제">삭제</button></li>`,
        )
        .join("");
    }
    function reset() {
      items = scenarios[$("#scenario").value].map((text) => ({
        text,
        done: false,
      }));
      render();
    }
    $("#scenario").onchange = reset;
    $("#checkItems").onchange = (e) => {
      if (e.target.dataset.check !== undefined)
        items[+e.target.dataset.check].done = e.target.checked;
    };
    $("#checkItems").onclick = (e) => {
      if (e.target.dataset.delete !== undefined) {
        items.splice(+e.target.dataset.delete, 1);
        render();
      }
    };
    $("#addItem").onclick = () => {
      const text = $("#newItem").value.trim();
      if (text) {
        items.push({ text, done: false });
        $("#newItem").value = "";
        render();
      }
    };
    $("#checkSave").onclick = () =>
      download(
        items.map((x) => `[${x.done ? "✓" : " "}] ${x.text}`).join("\n") +
          "\n\n메모: " +
          $("#checkMemo").value,
        "checklist.txt",
      );
    $("#checkPrint").onclick = () => window.print();
    reset();
  }
  function fileList(list, selector, render) {
    $(selector).innerHTML = list
      .map(
        (x, i) =>
          `<li><span class="item-name">${esc(x.name)}</span><button data-up="${i}" ${i === 0 ? "disabled" : ""} aria-label="${esc(x.name)} 위로">↑</button><button data-down="${i}" ${i === list.length - 1 ? "disabled" : ""} aria-label="${esc(x.name)} 아래로">↓</button><button data-remove="${i}" aria-label="${esc(x.name)} 삭제">삭제</button></li>`,
      )
      .join("");
    $(selector).onclick = (e) => {
      const d = e.target.dataset;
      if (d.up !== undefined) {
        const i = +d.up;
        [list[i - 1], list[i]] = [list[i], list[i - 1]];
      } else if (d.down !== undefined) {
        const i = +d.down;
        [list[i + 1], list[i]] = [list[i], list[i + 1]];
      } else if (d.remove !== undefined) list.splice(+d.remove, 1);
      else return;
      render();
    };
  }
  function initPdf(images) {
    const list = [];
    const input = $(images ? "#imageFiles" : "#pdfFiles"),
      button = $(images ? "#imagePdfSave" : "#mergeSave");
    input.multiple = true;
    input.accept = images ? "image/jpeg,image/png" : "application/pdf,.pdf";
    let busy = false;
    const render = () =>
      fileList(list, images ? "#imageItems" : "#pdfItems", render);
    input.onchange = () => {
      list.push(...input.files);
      input.value = "";
      render();
    };
    button.onclick = async () => {
      if (busy) return;
      if (!list.length) {
        say("파일을 먼저 선택해 주세요.", true);
        return;
      }
      busy = true;
      button.disabled = true;
      input.disabled = true;
      say("PDF를 만드는 중입니다…");
      try {
        const { PDFDocument } = await pdfLib();
        const out = await PDFDocument.create();
        const files = [...list];
        for (const f of files) {
          if (f.size > 50 * 1024 * 1024)
            throw Error("파일 하나당 최대 50MB까지 지원합니다.");
          const data = await f.arrayBuffer();
          if (!images) {
            const doc = await PDFDocument.load(data);
            const pages = await out.copyPages(doc, doc.getPageIndices());
            pages.forEach((p) => out.addPage(p));
          } else {
            let size =
              $("#paperSize").value === "a4" ? [595.276, 841.89] : [612, 792];
            if ($("#orientation").value === "landscape") size.reverse();
            const mm = Number($("#margin").value);
            if (
              $("#margin").value === "" ||
              !Number.isFinite(mm) ||
              mm < 0 ||
              mm > 50
            )
              throw Error("여백은 0~50mm로 입력해 주세요.");
            const margin = (mm * 72) / 25.4;
            const bytes = new Uint8Array(data);
            let img;
            if (bytes[0] === 137 && bytes[1] === 80)
              img = await out.embedPng(data);
            else if (bytes[0] === 255 && bytes[1] === 216)
              img = await out.embedJpg(data);
            else throw Error("JPG 또는 PNG 사진을 선택해 주세요.");
            const scale = Math.min(
              (size[0] - 2 * margin) / img.width,
              (size[1] - 2 * margin) / img.height,
            );
            const page = out.addPage(size);
            page.drawImage(img, {
              x: (size[0] - img.width * scale) / 2,
              y: (size[1] - img.height * scale) / 2,
              width: img.width * scale,
              height: img.height * scale,
            });
          }
        }
        if (!out.getPageCount()) throw Error("PDF에 페이지가 없습니다.");
        download(
          await out.save(),
          images ? "photos.pdf" : "merged.pdf",
          "application/pdf",
        );
        say(`${out.getPageCount()}페이지 PDF를 저장했습니다.`);
      } catch {
        say(
          images
            ? "사진을 처리하지 못했습니다. JPG/PNG 형식, 50MB 이하 파일, 0~50mm 여백을 확인하세요."
            : "PDF를 열지 못했습니다. 손상되거나 암호화된 PDF는 지원하지 않습니다. 파일 크기(50MB 이하)를 확인하세요.",
          true,
        );
      } finally {
        busy = false;
        button.disabled = false;
        input.disabled = false;
      }
    };
  }
  function initBackground() {
    const canvas = $("#bgCanvas"),
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    let original = null,
      history = [],
      drawing = false;
    const snapshot = () => {
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (history.length > 8) history.shift();
    };
    $("#bgFile").accept = "image/*";
    $("#bgFile").onchange = () => {
      const file = $("#bgFile").files[0];
      if (!file) return;
      const url = URL.createObjectURL(file),
        img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 2000 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        original = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history = [];
        URL.revokeObjectURL(url);
        say(`편집 크기: ${canvas.width} × ${canvas.height}px (최대 2,000px)`);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        say("이미지를 열지 못했습니다.", true);
      };
      img.src = url;
    };
    function flood(seeds) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height),
        p = data.data,
        w = canvas.width,
        h = canvas.height,
        t = Math.max(0, Math.min(255, Number($("#tolerance").value) || 0));
      const seen = new Uint8Array(w * h);
      for (const start of seeds) {
        if (seen[start]) continue;
        const color = p.slice(start * 4, start * 4 + 3),
          stack = [start];
        while (stack.length) {
          const i = stack.pop();
          if (seen[i]) continue;
          const k = i * 4;
          if (Math.max(...color.map((v, j) => Math.abs(v - p[k + j]))) > t)
            continue;
          seen[i] = 1;
          p[k + 3] = 0;
          const x = i % w,
            y = Math.floor(i / w);
          if (x) stack.push(i - 1);
          if (x < w - 1) stack.push(i + 1);
          if (y) stack.push(i - w);
          if (y < h - 1) stack.push(i + w);
        }
      }
      ctx.putImageData(data, 0, 0);
    }
    function point(e) {
      const r = canvas.getBoundingClientRect();
      return [
        Math.max(
          0,
          Math.min(
            canvas.width - 1,
            Math.floor(((e.clientX - r.left) * canvas.width) / r.width),
          ),
        ),
        Math.max(
          0,
          Math.min(
            canvas.height - 1,
            Math.floor(((e.clientY - r.top) * canvas.height) / r.height),
          ),
        ),
      ];
    }
    function brush(e) {
      const [x, y] = point(e),
        size = Math.max(1, Math.min(200, Number($("#brushSize").value) || 30)),
        r = size / 2;
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (
        let yy = Math.max(0, Math.floor(y - r));
        yy < Math.min(canvas.height, y + r);
        yy++
      )
        for (
          let xx = Math.max(0, Math.floor(x - r));
          xx < Math.min(canvas.width, x + r);
          xx++
        ) {
          if ((xx - x) ** 2 + (yy - y) ** 2 > r * r) continue;
          const i = (yy * canvas.width + xx) * 4;
          if ($("#brushMode").value === "restore")
            d.data.set(original.data.subarray(i, i + 4), i);
          else d.data[i + 3] = 0;
        }
      ctx.putImageData(d, 0, 0);
    }
    canvas.onpointerdown = (e) => {
      if (!original) return;
      snapshot();
      canvas.setPointerCapture(e.pointerId);
      if ($("#brushMode").value === "remove") {
        const [x, y] = point(e);
        flood([y * canvas.width + x]);
      } else {
        drawing = true;
        brush(e);
      }
    };
    canvas.onpointermove = (e) => {
      if (drawing) brush(e);
    };
    canvas.onpointerup = canvas.onpointercancel = () => (drawing = false);
    $("#bgAuto").onclick = () => {
      if (!original) return;
      snapshot();
      const seeds = [];
      for (let x = 0; x < canvas.width; x++)
        seeds.push(x, (canvas.height - 1) * canvas.width + x);
      for (let y = 0; y < canvas.height; y++)
        seeds.push(y * canvas.width, y * canvas.width + canvas.width - 1);
      flood(seeds);
      say("가장자리 배경을 제거했습니다.");
    };
    $("#bgUndo").onclick = () => {
      if (history.length) ctx.putImageData(history.pop(), 0, 0);
    };
    $("#bgSave").onclick = () => {
      if (original)
        canvas.toBlob(
          (b) => download(b, "background-removed.png"),
          "image/png",
        );
      else say("사진을 먼저 선택해 주세요.", true);
    };
  }
  function initTax() {
    const update = () => {
      const ids = ["price", "quantity", "tax", "tip"];
      const nums = ids.map((id) => Number($("#" + id).value));
      if (
        ids.some((id) => $("#" + id).value === "") ||
        nums.some((n) => !Number.isFinite(n) || n < 0) ||
        !Number.isInteger(nums[1]) ||
        nums[1] < 1
      ) {
        $("#taxTotal").textContent = "—";
        say(
          "가격·세율·팁은 0 이상, 수량은 1 이상의 정수로 입력해 주세요.",
          true,
        );
        return;
      }
      const [p, q, tax, tip] = nums,
        subtotal = p * q,
        withTax = subtotal * (1 + tax / 100),
        total =
          withTax +
          (($("#tipBasis").value === "after" ? withTax : subtotal) * tip) / 100;
      if (!Number.isFinite(total)) {
        say("계산 가능한 범위를 넘었습니다.", true);
        $("#taxTotal").textContent = "—";
        return;
      }
      $("#taxTotal").textContent = total.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      say("");
    };
    ["price", "quantity", "tax", "tip", "tipBasis"].forEach((id) =>
      $("#" + id).addEventListener("input", update),
    );
    update();
  }
  function initAddress() {
    const update = () => {
      const get = (id) => $("#" + id).value.trim();
      let text = [
        get("recipient"),
        [get("street"), get("unit")].filter(Boolean).join(" "),
        [get("city"), [get("state"), get("zip")].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", "),
      ]
        .filter(Boolean)
        .join("\n");
      if ($("#uppercase").checked) text = text.toUpperCase();
      $("#addressOutput").textContent = text;
      const zip = get("zip"),
        state = get("state");
      say(
        zip && !/^\d{5}(-\d{4})?$/.test(zip)
          ? "ZIP은 숫자 5자리 또는 12345-6789 형식이어야 합니다."
          : state && !/^[a-z]{2}$/i.test(state)
            ? "주는 영문 2자리 약자로 입력해 주세요."
            : "",
        true,
      );
    };
    [
      "recipient",
      "street",
      "unit",
      "city",
      "state",
      "zip",
      "uppercase",
    ].forEach((id) => ($("#" + id).oninput = update));
    $("#addressCopy").onclick = () => copy($("#addressOutput").textContent);
    $("#addressSave").onclick = () =>
      download($("#addressOutput").textContent, "address.txt");
  }
  function initKeyboard() {
    const keys = "rRseEfaqQtTdwWczxvgkoiOjpuPhynbml",
      jamo =
        "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ";
    const update = () => {
      const text = $("#keyboardInput").value;
      if ($("#keyboardDirection").value === "ko")
        $("#keyboardOutput").textContent = Hangul.assemble(
          [...text].map((c) => {
            const i = keys.indexOf(c);
            return i < 0 ? c : jamo[i];
          }),
        );
      else
        $("#keyboardOutput").textContent = Hangul.disassemble(text)
          .map((c) => {
            const i = jamo.indexOf(c);
            return i < 0 ? c : keys[i];
          })
          .join("");
    };
    $("#keyboardInput").oninput = update;
    $("#keyboardDirection").onchange = update;
    $("#keyboardCopy").onclick = () => copy($("#keyboardOutput").textContent);
  }
  function initLetter() {
    const mail = () => {
      $("#letterMail").href =
        "mailto:?subject=" +
        encodeURIComponent(
          {
            appointment: "Appointment inquiry",
            absence: "Absence notice",
            repair: "Repair request",
          }[$("#letterType").value],
        ) +
        "&body=" +
        encodeURIComponent($("#letterBody").value);
    };
    const update = () => {
      const name = $("#letterName").value,
        date = $("#letterDate").value,
        detail = $("#letterDetail").value;
      const lines = {
        appointment: `I would like to ask about an appointment for ${date}.`,
        absence: `I am writing to let you know about an absence on ${date}.`,
        repair: `I would like to request a repair. My preferred date is ${date}.`,
      };
      $("#letterBody").value =
        `Hello,\n\n${lines[$("#letterType").value]}\n${detail}\n\nThank you,\n${name}`;
      mail();
    };
    ["letterType", "letterName", "letterDate", "letterDetail"].forEach(
      (id) => ($("#" + id).oninput = update),
    );
    $("#letterBody").oninput = mail;
    $("#letterCopy").onclick = () => copy($("#letterBody").value);
    $("#letterSave").onclick = () =>
      download($("#letterBody").value, "email.txt");
    update();
  }
  window.KIN_EXTRA = {
    content,
    init(id) {
      (
        ({
          "document-checklist": initChecklist,
          "pdf-merge": () => initPdf(false),
          "image-pdf": () => initPdf(true),
          "bg-remove": initBackground,
          "tax-helper": initTax,
          "address-helper": initAddress,
          keyboard: initKeyboard,
          "letter-template": initLetter,
        })[id] || (() => {})
      )();
    },
  };
})();
