"use strict";
/* 나중에 개별 기능 페이지를 만들면 여기에 URL을 넣으세요.
       예: 'passport-form': './tools/passport-form.html',
       빈 상태에서는 카드 클릭 시 사이트 내부의 안내 화면이 열립니다. */
const TOOL_URLS = {
  "passport-form": "tools/passport-form.html",
  "guardian-form": "tools/guardian-form.html",
};
const CATEGORIES = [
  { id: "all", title: "전체", icon: "grid" },
  { id: "passport", title: "여권 · 영사", icon: "passport" },
  { id: "photo", title: "사진 · 문서", icon: "image" },
  { id: "life", title: "생활 · 계산", icon: "clock" },
  { id: "text", title: "텍스트 · 기타", icon: "type" },
];
const TOOLS = [
  {
    id: "passport-photo",
    name: "여권사진 크롭",
    desc: "한국·미국 여권사진 규격으로 자르기",
    cat: "passport",
    icon: "camera",
    tone: "blue",
    ready: true,
    tags: "여권 증명사진 사진 편집 passport crop",
  },
  {
    id: "passport-form",
    name: "한국 여권 신청서",
    desc: "여권 발급 신청서 작성 및 출력",
    cat: "passport",
    icon: "file",
    tone: "mint",
    ready: false,
    tags: "여권 발급 pdf 신청서 작성",
  },
  {
    id: "guardian-form",
    name: "법정대리인 동의서",
    desc: "미성년자 여권 동의서 작성",
    cat: "passport",
    icon: "pen",
    tone: "orange",
    ready: false,
    tags: "법정대리인 동의 미성년자 여권",
  },
  {
    id: "document-checklist",
    name: "영사 서류 체크리스트",
    desc: "방문 전 필요한 서류 항목 정리",
    cat: "passport",
    icon: "people",
    tone: "violet",
    ready: true,
    tags: "영사관 준비물 서류 체크리스트",
  },
  {
    id: "bg-remove",
    name: "사진 배경 제거",
    desc: "단색 배경 제거 · 브러시로 보정",
    cat: "photo",
    icon: "eraser",
    tone: "rose",
    ready: true,
    tags: "누끼 인물 분리 배경 투명",
  },
  {
    id: "image-resize",
    name: "이미지 크기 변경",
    desc: "사진 픽셀과 파일 형식 바꾸기",
    cat: "photo",
    icon: "image",
    tone: "mint",
    ready: true,
    tags: "jpg png 이미지 크기 리사이즈",
  },
  {
    id: "pdf-merge",
    name: "PDF 합치기",
    desc: "여러 PDF를 하나의 문서로",
    cat: "photo",
    icon: "layers",
    tone: "blue",
    ready: true,
    tags: "pdf 합치기 병합 문서",
  },
  {
    id: "image-pdf",
    name: "사진을 PDF로",
    desc: "이미지 파일을 PDF로 저장",
    cat: "photo",
    icon: "scissors",
    tone: "orange",
    ready: true,
    tags: "jpg pdf 이미지 문서 변환",
  },
  {
    id: "time-zone",
    name: "한국 · 미국 시간 비교",
    desc: "한국과 미국 주요 지역 시간 확인",
    cat: "life",
    icon: "clock",
    tone: "violet",
    ready: true,
    tags: "한국 서울 미국 la 뉴욕 피닉스 시차",
  },
  {
    id: "unit-convert",
    name: "미국 단위 변환기",
    desc: "온도 · 거리 · 무게 · 길이 변환",
    cat: "life",
    icon: "ruler",
    tone: "mint",
    ready: true,
    tags: "화씨 섭씨 마일 킬로 파운드 피트 인치",
  },
  {
    id: "date-calc",
    name: "날짜 차이 계산기",
    desc: "두 날짜 사이 일수 알아보기",
    cat: "life",
    icon: "calendar",
    tone: "blue",
    ready: true,
    tags: "날짜 dday 일수 기간 계산",
  },
  {
    id: "tax-helper",
    name: "미국 세금 계산 도우미",
    desc: "판매세 · 팁 · 최종 결제액 계산",
    cat: "life",
    icon: "calculator",
    tone: "orange",
    ready: true,
    tags: "세금 sales tax tax 미국",
  },
  {
    id: "char-count",
    name: "글자수 세기",
    desc: "공백 포함 · 제외, 단어 수 계산",
    cat: "text",
    icon: "type",
    tone: "rose",
    ready: true,
    tags: "글자 텍스트 문자 단어 글자수",
  },
  {
    id: "address-helper",
    name: "미국 주소 표기 도우미",
    desc: "영문 주소 구성요소 확인",
    cat: "text",
    icon: "map",
    tone: "violet",
    ready: true,
    tags: "주소 영문 영주소 street apt zip",
  },
  {
    id: "keyboard",
    name: "한영 타자 변환",
    desc: "두벌식 한영 오타 자판 변환",
    cat: "text",
    icon: "keyboard",
    tone: "slate",
    ready: true,
    tags: "한영 키보드 전환 자판",
  },
  {
    id: "letter-template",
    name: "영문 이메일 문구",
    desc: "자주 쓰는 생활 표현 모음",
    cat: "text",
    icon: "file",
    tone: "mint",
    ready: true,
    tags: "영어 이메일 영문 표현",
  },
];
const $ = (s) => document.querySelector(s);
const svg = (name, size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ic-${name}"/></svg>`;
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.title || "";
let activeCategory = "all",
  query = "";
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fmt = (n) => Number(n).toLocaleString("ko-KR");
function renderFilters() {
  $("#filters").innerHTML = CATEGORIES.map(
    (c) =>
      `<button type="button" class="filter ${activeCategory === c.id ? "active" : ""}" data-cat="${c.id}" aria-pressed="${activeCategory === c.id}">${svg(c.icon, 15)}${c.title}<span class="filter-count">${c.id === "all" ? TOOLS.length : TOOLS.filter((t) => t.cat === c.id).length}</span></button>`,
  ).join("");
}
function renderCards() {
  let q = query.trim().toLocaleLowerCase();
  let found = TOOLS.filter(
    (t) =>
      (activeCategory === "all" || t.cat === activeCategory) &&
      (!q ||
        `${t.name} ${t.desc} ${t.tags} ${catName(t.cat)}`
          .toLocaleLowerCase()
          .includes(q)),
  );
  $("#listTitle").textContent =
    activeCategory === "all" ? "전체 도구" : catName(activeCategory);
  $("#resultCount").innerHTML = `<span>${found.length}</span>개 도구 표시`;
  $("#totalCount").textContent = TOOLS.length;
  $("#cards").innerHTML = found
    .map(
      (t) =>
        `<a class="tool-card" href="${escapeHtml(TOOL_URLS[t.id] || "#tool/" + t.id)}" aria-label="${escapeHtml(t.name)}${t.ready || TOOL_URLS[t.id] ? " 열기" : " 준비 중"}"><div class="tool-card-top"><span class="tool-icon tone-${t.tone}">${svg(t.icon)}</span><span class="tiny-tag ${t.ready || TOOL_URLS[t.id] ? "" : "soon"}">${t.ready || TOOL_URLS[t.id] ? "바로 사용" : "준비 중"}</span></div><div class="tool-name">${escapeHtml(t.name)}</div><p class="tool-desc">${escapeHtml(t.desc)}</p><div class="card-bottom"><span>${escapeHtml(catName(t.cat))}</span><span class="card-arrow">${svg("arrow", 16)}</span></div></a>`,
    )
    .join("");
  $("#empty").hidden = found.length > 0;
}
function goHome() {
  location.hash = "";
}
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  activeCategory = b.dataset.cat;
  renderFilters();
  renderCards();
});
$("#search").addEventListener("input", (e) => {
  query = e.target.value;
  renderCards();
});
$("#resetFilter").addEventListener("click", () => {
  query = "";
  activeCategory = "all";
  $("#search").value = "";
  renderFilters();
  renderCards();
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) &&
    !e.ctrlKey &&
    !e.metaKey
  ) {
    e.preventDefault();
    if (!$("#home").hidden) $("#search").focus();
  }
});
document.querySelectorAll("[data-shortcut]").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    activeCategory = a.dataset.shortcut;
    query = "";
    $("#search").value = "";
    renderFilters();
    renderCards();
    goHome();
  }),
);
function route() {
  const id = location.hash.replace(/^#tool\//, "");
  const isTool =
    location.hash.startsWith("#tool/") && TOOLS.some((t) => t.id === id);
  $("#home").hidden = isTool;
  $("#toolPage").hidden = !isTool;
  if (isTool) {
    renderToolPage(TOOLS.find((t) => t.id === id));
    window.scrollTo(0, 0);
  }
}
function renderToolPage(t) {
  let content = t.ready ? toolContent(t.id) : placeholderContent(t);
  $("#toolPage").innerHTML =
    `<button class="backlink" type="button" id="backHome">${svg("left", 17)} 전체 도구로 돌아가기</button><div class="toolhead"><span class="tool-icon tone-${t.tone}">${svg(t.icon, 30)}</span><div><h1>${escapeHtml(t.name)}</h1><p>${escapeHtml(t.desc)}</p></div></div><section class="workspace">${content}</section>`;
  $("#backHome").addEventListener("click", goHome);
  initTool(t.id);
}
function placeholderContent(t) {
  return `<div class="placeholder"><span class="tool-icon tone-${t.tone}">${svg(t.icon, 34)}</span><h2>이 도구는 준비 중이에요.</h2><p>${escapeHtml(t.desc)} 기능을 이 페이지에 연결할 예정입니다. 개별 HTML 도구가 완성되면 메인 페이지의 <strong>TOOL_URLS</strong> 설정에 주소만 추가하면 됩니다.</p><div class="feature-list" style="justify-content:center"><span>별도 로그인 없이 이용</span><span>모바일 화면 지원</span><span>필요한 기능만 연결 가능</span></div><button class="mainbtn" type="button" onclick="location.hash=''">다른 도구 살펴보기</button></div>`;
}
function toolContent(id) {
  switch (id) {
    case "passport-photo":
      return `<h2 class="work-title">여권사진 자르기</h2><div class="photo-layout"><div><div class="photo-stage"><canvas id="cropCanvas" width="413" height="531" role="img" aria-label="사진 크롭 미리보기"></canvas><p>이미지를 업로드하면 미리보기가 나타납니다. 사진을 드래그해 위치를 조정하세요.</p></div><p id="photoStatus" class="statusline" role="status"></p></div><div class="photo-control"><div class="field"><label for="passportPreset">사진 규격</label><select id="passportPreset"><option value="kr">한국 여권: 3.5 × 4.5cm (413 × 531px)</option><option value="us">미국 여권: 2 × 2in (600 × 600px)</option></select></div><div class="field file-style"><label for="passportUpload">사진 파일 선택</label><input id="passportUpload" type="file" accept="image/*"></div><div class="field rangebox"><label for="passportZoom">확대 / 축소 <span id="zoomLabel">100%</span></label><input id="passportZoom" type="range" min="100" max="350" value="100" step="1"></div><button type="button" class="mainbtn" id="passportDownload" disabled>JPG 사진 저장</button><div class="work-note">선택한 비율과 픽셀 크기로 이미지를 자르는 기능입니다. <strong>여권사진의 실제 얼굴 크기, 배경색, 촬영 기준 등 공식 요건을 자동으로 검증하지는 않습니다.</strong> 파일은 서버에 전송하지 않습니다.</div></div></div>`;
    case "image-resize":
      return `<h2 class="work-title">이미지 크기 변경</h2><div class="two-split"><div><div class="field file-style"><label for="resizeUpload">사진 선택</label><input type="file" accept="image/*" id="resizeUpload"></div><img id="resizePreview" class="resize-preview" alt="선택한 이미지 미리보기" hidden><div id="resizeStatus" class="statusline" role="status" style="margin-top:12px">이미지를 선택해주세요.</div></div><div><div class="formgrid"><div class="field"><label for="resizeW">가로(px)</label><input id="resizeW" type="number" min="1" max="6000" placeholder="가로"></div><div class="field"><label for="resizeH">세로(px)</label><input id="resizeH" type="number" min="1" max="6000" placeholder="세로"></div></div><label class="checkline" style="margin-top:13px"><input id="resizeLock" type="checkbox" checked> 가로·세로 비율 유지</label><div class="field" style="margin-top:18px"><label for="resizeFormat">저장 파일 형식</label><select id="resizeFormat"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></div><button class="mainbtn" type="button" id="resizeSave" style="margin-top:21px" disabled>변경한 이미지 다운로드</button><div class="work-note">이미지는 브라우저 내부에서만 처리됩니다. 지나치게 큰 크기는 기기 메모리를 많이 사용할 수 있어 최대 6,000px로 제한했습니다.</div></div></div>`;
    case "time-zone":
      return `<h2 class="work-title">한국과 미국의 현재 시간</h2><div id="clockGrid" class="clockgrid"></div><div class="work-note">미국의 지역별 서머타임(DST)은 브라우저의 시간대 정보를 사용해 반영합니다. 기기에 설정된 시계가 부정확하면 표시도 달라질 수 있습니다.</div>`;
    case "unit-convert":
      return `<h2 class="work-title">미국 단위 ↔ 한국 단위</h2><div class="formgrid"><div class="field"><label for="convertType">변환 종류</label><select id="convertType"><option value="f">온도: 화씨(°F) → 섭씨(°C)</option><option value="c">온도: 섭씨(°C) → 화씨(°F)</option><option value="mi">거리: 마일(mi) → 킬로미터(km)</option><option value="km">거리: 킬로미터(km) → 마일(mi)</option><option value="lb">무게: 파운드(lb) → 킬로그램(kg)</option><option value="kg">무게: 킬로그램(kg) → 파운드(lb)</option><option value="in">길이: 인치(in) → 센티미터(cm)</option><option value="cm">길이: 센티미터(cm) → 인치(in)</option><option value="ft">길이: 피트(ft) → 미터(m)</option><option value="m">길이: 미터(m) → 피트(ft)</option></select></div><div class="field"><label for="convertInput">변환할 값</label><input id="convertInput" type="number" step="any" value="100"></div></div><div class="resultbox" style="grid-template-columns:1fr"><div class="resulttile"><small>변환 결과</small><strong id="convertOutput">—</strong></div></div>`;
    case "date-calc":
      return `<h2 class="work-title">두 날짜 사이 일수 계산</h2><div class="formgrid"><div class="field"><label for="dateStart">시작 날짜</label><input type="date" id="dateStart"></div><div class="field"><label for="dateEnd">종료 날짜</label><input type="date" id="dateEnd"></div></div><div class="resultbox"><div class="resulttile"><small>날짜 차이 (시작일 제외)</small><strong id="dateDiff">—</strong></div><div class="resulttile"><small>양쪽 날짜 모두 포함</small><strong id="dateInclusive">—</strong></div></div><div class="work-note">날짜만 비교하며 시간과 시간대는 계산하지 않습니다. 시작일 이후 날짜를 선택하면 양수로 표시됩니다.</div>`;
    case "char-count":
      return `<h2 class="work-title">글자수 · 단어 수 세기</h2><label for="charInput">글자 수는 유니코드 코드포인트 기준입니다. 결합 이모지는 여러 글자로 셉니다.</label><textarea id="charInput" class="text-area" placeholder="여기에 문장을 입력하거나 붙여넣으세요."></textarea><div class="resultbox"><div class="resulttile"><small>글자 수 (공백 포함)</small><strong id="charAll">0</strong></div><div class="resulttile"><small>글자 수 (공백 제외)</small><strong id="charNoSpace">0</strong></div><div class="resulttile"><small>단어 수</small><strong id="charWords">0</strong></div><div class="resulttile"><small>줄 수</small><strong id="charLines">0</strong></div></div>`;
    default:
      return window.KIN_EXTRA
        ? KIN_EXTRA.content(id)
        : "<p>도구 스크립트를 불러오지 못했습니다.</p>";
  }
}
function initTool(id) {
  if (id === "passport-photo") initPhotoCrop();
  if (id === "image-resize") initResize();
  if (id === "time-zone") initTimeZones();
  if (id === "unit-convert") initConvert();
  if (id === "date-calc") initDateCalc();
  if (id === "char-count") initCharCount();
  if (window.KIN_EXTRA) KIN_EXTRA.init(id);
}
function initTimeZones() {
  const zones = [
    { label: "대한민국 · 서울", zone: "Asia/Seoul", highlight: true },
    { label: "미국 · 피닉스", zone: "America/Phoenix" },
    { label: "미국 · 로스앤젤레스", zone: "America/Los_Angeles" },
    { label: "미국 · 뉴욕", zone: "America/New_York" },
  ];
  const box = $("#clockGrid");
  const update = () => {
    if (!document.contains(box)) return;
    let now = new Date();
    box.innerHTML = zones
      .map((z) => {
        let time = new Intl.DateTimeFormat("ko-KR", {
            timeZone: z.zone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(now),
          date = new Intl.DateTimeFormat("ko-KR", {
            timeZone: z.zone,
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          }).format(now);
        return `<div class="clockcard ${z.highlight ? "seoul" : ""}"><strong>${z.label}</strong><div class="city">${z.zone}</div><div class="clocktime">${time}</div><div class="clockdate">${date}</div></div>`;
      })
      .join("");
  };
  update();
  if (window.kinClockInterval) clearInterval(window.kinClockInterval);
  window.kinClockInterval = setInterval(() => {
    if (!document.contains(box)) {
      clearInterval(window.kinClockInterval);
      return;
    }
    update();
  }, 30000);
}
function initConvert() {
  const factors = {
    f: [(n) => ((n - 32) * 5) / 9, "°C"],
    c: [(n) => (n * 9) / 5 + 32, "°F"],
    mi: [(n) => n * 1.609344, "km"],
    km: [(n) => n / 1.609344, "mi"],
    lb: [(n) => n * 0.45359237, "kg"],
    kg: [(n) => n / 0.45359237, "lb"],
    in: [(n) => n * 2.54, "cm"],
    cm: [(n) => n / 2.54, "in"],
    ft: [(n) => n * 0.3048, "m"],
    m: [(n) => n / 0.3048, "ft"],
  };
  const update = () => {
    let raw = $("#convertInput").value;
    let [fn, unit] = factors[$("#convertType").value];
    let value = Number(raw);
    $("#convertOutput").textContent =
      raw.trim() === "" || !Number.isFinite(value)
        ? "값을 입력해주세요"
        : `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 8 }).format(fn(value))} ${unit}`;
  };
  $("#convertType").addEventListener("change", update);
  $("#convertInput").addEventListener("input", update);
  update();
}
function initDateCalc() {
  const today = new Date(),
    next = new Date(today.getTime() + 30 * 86400000);
  const localISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  $("#dateStart").value = localISO(today);
  $("#dateEnd").value = localISO(next);
  const update = () => {
    const a = $("#dateStart").value,
      b = $("#dateEnd").value;
    if (!a || !b) {
      $("#dateDiff").textContent = $("#dateInclusive").textContent = "—";
      return;
    }
    let days = Math.round(
      (Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000,
    );
    $("#dateDiff").textContent = `${fmt(days)}일`;
    $("#dateInclusive").textContent = `${fmt(Math.abs(days) + 1)}일`;
  };
  $("#dateStart").addEventListener("input", update);
  $("#dateEnd").addEventListener("input", update);
  update();
}
function initCharCount() {
  const update = () => {
    let t = $("#charInput").value;
    $("#charAll").textContent = fmt(Array.from(t).length);
    $("#charNoSpace").textContent = fmt(
      Array.from(t.replace(/\s/g, "")).length,
    );
    $("#charWords").textContent = fmt(
      t.trim() ? t.trim().split(/\s+/).length : 0,
    );
    $("#charLines").textContent = fmt(t ? t.split(/\r\n|\n|\r/).length : 0);
  };
  $("#charInput").addEventListener("input", update);
  update();
}
function saveBlob(blob, filename) {
  if (!blob) return;
  let url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function loadImageFile(file, callback, onError) {
  if (!file || !file.type.startsWith("image/")) {
    onError?.("이미지 파일을 선택해주세요.");
    return;
  }
  const objectURL = URL.createObjectURL(file),
    img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(objectURL);
    callback(img);
  };
  img.onerror = () => {
    URL.revokeObjectURL(objectURL);
    onError?.("이 이미지 형식은 브라우저에서 열 수 없습니다.");
  };
  img.src = objectURL;
}
function initPhotoCrop() {
  const canvas = $("#cropCanvas"),
    ctx = canvas.getContext("2d");
  const preset = $("#passportPreset"),
    upload = $("#passportUpload"),
    zoomEl = $("#passportZoom"),
    down = $("#passportDownload"),
    status = $("#photoStatus");
  let img = null,
    offsetX = 0,
    offsetY = 0,
    drag = null;
  const sizes = { kr: [413, 531], us: [600, 600] };
  function draw() {
    let [w, h] = sizes[preset.value];
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    if (!img) {
      ctx.fillStyle = "#9bb0c9";
      ctx.textAlign = "center";
      ctx.font = "20px system-ui";
      ctx.fillText("사진을 선택해주세요", w / 2, h / 2);
      return;
    }
    let scale =
        Math.max(w / img.naturalWidth, h / img.naturalHeight) *
        (Number(zoomEl.value) / 100),
      dw = img.naturalWidth * scale,
      dh = img.naturalHeight * scale;
    const maxX = Math.max(0, (dw - w) / 2),
      maxY = Math.max(0, (dh - h) / 2);
    offsetX = Math.min(maxX, Math.max(-maxX, offsetX));
    offsetY = Math.min(maxY, Math.max(-maxY, offsetY));
    ctx.drawImage(img, (w - dw) / 2 + offsetX, (h - dh) / 2 + offsetY, dw, dh);
  }
  preset.addEventListener("change", () => {
    offsetX = offsetY = 0;
    draw();
  });
  zoomEl.addEventListener("input", () => {
    $("#zoomLabel").textContent = zoomEl.value + "%";
    draw();
  });
  upload.addEventListener("change", () => {
    loadImageFile(
      upload.files[0],
      (image) => {
        img = image;
        offsetX = offsetY = 0;
        zoomEl.value = 100;
        $("#zoomLabel").textContent = "100%";
        down.disabled = false;
        status.textContent = `원본 크기: ${fmt(img.naturalWidth)} × ${fmt(img.naturalHeight)}px`;
        draw();
      },
      (m) => {
        status.textContent = m;
      },
    );
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (!img) return;
    drag = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    let r = canvas.getBoundingClientRect();
    offsetX = drag.ox + (e.clientX - drag.x) * (canvas.width / r.width);
    offsetY = drag.oy + (e.clientY - drag.y) * (canvas.height / r.height);
    draw();
  });
  canvas.addEventListener("pointerup", () => (drag = null));
  canvas.addEventListener("pointercancel", () => (drag = null));
  down.addEventListener("click", () => {
    if (!img) return;
    canvas.toBlob(
      (b) => saveBlob(b, `passport-photo-${preset.value}.jpg`),
      "image/jpeg",
      0.95,
    );
  });
  draw();
}
function initResize() {
  let img = null,
    ratio = 1,
    previewUrl = null;
  const upload = $("#resizeUpload"),
    width = $("#resizeW"),
    height = $("#resizeH"),
    lock = $("#resizeLock"),
    save = $("#resizeSave"),
    preview = $("#resizePreview"),
    status = $("#resizeStatus");
  upload.addEventListener("change", () => {
    loadImageFile(
      upload.files[0],
      (image) => {
        img = image;
        ratio = image.naturalWidth / image.naturalHeight;
        width.value = image.naturalWidth;
        height.value = image.naturalHeight;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(upload.files[0]);
        preview.src = previewUrl;
        preview.hidden = false;
        save.disabled = false;
        status.textContent = `원본: ${fmt(image.naturalWidth)} × ${fmt(image.naturalHeight)}px`;
      },
      (m) => {
        status.textContent = m;
      },
    );
  });
  width.addEventListener("input", () => {
    if (lock.checked && Number(width.value) > 0)
      height.value = Math.max(1, Math.round(Number(width.value) / ratio));
  });
  height.addEventListener("input", () => {
    if (lock.checked && Number(height.value) > 0)
      width.value = Math.max(1, Math.round(Number(height.value) * ratio));
  });
  save.addEventListener("click", () => {
    if (!img) return;
    let w = Number(width.value),
      h = Number(height.value);
    if (
      !Number.isInteger(w) ||
      !Number.isInteger(h) ||
      w < 1 ||
      h < 1 ||
      w > 6000 ||
      h > 6000
    ) {
      status.textContent = "가로·세로는 1~6,000px 사이의 정수를 입력해주세요.";
      return;
    }
    let c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    let cx = c.getContext("2d");
    cx.fillStyle = "#fff";
    cx.fillRect(0, 0, w, h);
    cx.drawImage(img, 0, 0, w, h);
    let mime = $("#resizeFormat").value;
    try {
      c.toBlob(
        (blob) => {
          if (!blob) {
            status.textContent = "이미지 저장에 실패했습니다.";
            return;
          }
          saveBlob(
            blob,
            `resized-${w}x${h}.${mime === "image/png" ? "png" : "jpg"}`,
          );
          status.textContent = `${fmt(w)} × ${fmt(h)}px 이미지가 저장되었습니다.`;
        },
        mime,
        0.93,
      );
    } catch (e) {
      status.textContent =
        "이미지를 처리하지 못했습니다. 다른 파일을 시도해주세요.";
    }
  });
}
window.addEventListener("hashchange", route);
renderFilters();
renderCards();
route();
