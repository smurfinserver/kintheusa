(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let current = null,
    annotations = [],
    selected = -1,
    history = [],
    images = [],
    dirty = false,
    loadingToken = 0;
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
  const status = (s) => {
    $("editorStatus").textContent = s;
  };
  function save(data, name, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function snapshot() {
    history.push(JSON.stringify(annotations));
    if (history.length > 40) history.shift();
    dirty = true;
  }
  function filtered() {
    const q = $("formSearch").value.trim().toLowerCase(),
      forms = FORM_CATALOG.filter((f) => f.title.toLowerCase().includes(q));
    $("formCount").textContent = `${forms.length}종 서식`;
    $("noForms").hidden = !!forms.length;
    $("formCards").innerHTML = forms
      .map(
        (f) =>
          `<article class="form-card"><span class="tag">${f.example ? "참고용 작성예시" : "원본 PDF · " + f.pages + "페이지"}</span><h3>${esc(f.title)}</h3><p>${f.example ? "공식 작성예시입니다. 제출용 빈 서식이 아닙니다." : "빈 원본을 내려받거나 작성 위치를 선택해 내용을 입력할 수 있습니다."}</p><div class="actions">${f.example ? "" : `<a class="edit-form" href="#${f.id}">웹 작성 열기</a>`}<a class="download-form" href="../original-forms/official/${f.id}.pdf" download="${esc(f.title)}.pdf">${f.example ? "작성예시" : "원본"} PDF 다운로드</a></div></article>`,
      )
      .join("");
  }
  function draw(canvas, pageIndex, highlight = true) {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(images[pageIndex], 0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top";
    annotations.forEach((a, i) => {
      if (a.page !== pageIndex) return;
      const px = (a.size * canvas.width) / 595.276;
      ctx.font = `${px}px "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif`;
      ctx.fillStyle = "#111";
      a.text
        .split("\n")
        .forEach((line, j) =>
          ctx.fillText(
            line,
            a.x * canvas.width,
            a.y * canvas.height + j * px * 1.3,
          ),
        );
      if (highlight && selected === i) {
        ctx.strokeStyle = "#1766d1";
        ctx.lineWidth = 2;
        const width = Math.max(
          20,
          ...a.text.split("\n").map((t) => ctx.measureText(t).width),
        );
        ctx.strokeRect(
          a.x * canvas.width - 3,
          a.y * canvas.height - 3,
          width + 6,
          a.text.split("\n").length * px * 1.3 + 6,
        );
      }
    });
  }
  function render(sync = true) {
    document.querySelectorAll("#pages canvas").forEach((c, i) => draw(c, i));
    $("removeText").disabled = selected < 0;
    $("undo").disabled = !history.length;
    $("textX").disabled = $("textY").disabled = selected < 0;
    if (selected >= 0 && sync) {
      const a = annotations[selected];
      $("entryText").value = a.text;
      $("fontSize").value = a.size;
      $("textX").value = (a.x * 100).toFixed(1);
      $("textY").value = (a.y * 100).toFixed(1);
    }
  }
  function selectOrAdd(page, x, y) {
    const found = annotations.findIndex(
      (a) =>
        a.page === page &&
        x >= a.x - 0.01 &&
        y >= a.y - 0.01 &&
        x <=
          a.x +
            Math.max(
              0.04,
              (a.text.split("\n").reduce((n, t) => Math.max(n, t.length), 0) *
                a.size) /
                595.276,
            ) &&
        y <= a.y + ((a.text.split("\n").length * a.size) / 841.89) * 1.3,
    );
    if (found >= 0) {
      selected = found;
      render();
      return;
    }
    const text = $("entryText").value.trim(),
      size = Number($("fontSize").value);
    if (!text) {
      status("왼쪽에 내용을 입력한 다음 원본의 빈칸을 선택하세요.");
      return;
    }
    if (!Number.isFinite(size) || size < 6 || size > 32) {
      status("글자 크기는 6~32pt로 입력하세요.");
      return;
    }
    if (annotations.length >= 200) {
      status("한 서식에 최대 200개 항목까지 추가할 수 있습니다.");
      return;
    }
    snapshot();
    annotations.push({
      page,
      text: text.slice(0, 500),
      size,
      x: Math.min(0.95, Math.max(0, x)),
      y: Math.min(0.97, Math.max(0, y)),
    });
    selected = annotations.length - 1;
    render();
    status("글자가 추가되었습니다. 위치와 크기를 확인하세요.");
  }
  async function route() {
    const id = location.hash.slice(1);
    if (current?.id === id && images.length) return;
    const form = FORM_CATALOG.find((f) => f.id === id && !f.example);
    if (
      dirty &&
      current?.id !== id &&
      !confirm("저장하지 않은 작성 내용이 있습니다. 이동할까요?")
    ) {
      location.hash = current.id;
      return;
    }
    const token = ++loadingToken;
    current = form;
    annotations = [];
    selected = -1;
    history = [];
    dirty = false;
    images = [];
    $("editor").hidden = !form;
    $("catalogSection").hidden = !!form;
    if (!form) return;
    $("formTitle").textContent = form.title;
    $("formHelp").textContent =
      "입력할 내용을 적고 원본에서 작성할 위치를 클릭하세요. 출력 전 원본과 내용·위치를 확인하세요.";
    $("blankPdf").href = `../original-forms/official/${form.id}.pdf`;
    $("blankPdf").download = form.title + ".pdf";
    $("pages").replaceChildren();
    $("entryText").value = "";
    $("savePdf").disabled = $("printForm").disabled = true;
    status("원본을 불러오는 중입니다…");
    try {
      const loaded = await Promise.all(
        Array.from(
          { length: form.pages },
          (_, i) =>
            new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.onerror = () =>
                reject(
                  Error(
                    "원본 이미지를 불러오지 못했습니다. 새로고침해 주세요.",
                  ),
                );
              image.src = `../assets/form-pages/${form.id}-${i + 1}.png`;
            }),
        ),
      );
      if (token !== loadingToken) return;
      images = loaded;
      images.forEach((img, i) => {
        const wrapper = document.createElement("div");
        wrapper.className = "page-wrap";
        const caption = document.createElement("p");
        caption.className = "page-caption";
        caption.textContent = `${i + 1} / ${form.pages}페이지`;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.tabIndex = 0;
        canvas.setAttribute(
          "aria-label",
          `${form.title} ${i + 1}페이지 작성 위치 선택`,
        );
        canvas.onclick = (e) => {
          const r = canvas.getBoundingClientRect();
          selectOrAdd(
            i,
            (e.clientX - r.left) / r.width,
            (e.clientY - r.top) / r.height,
          );
        };
        canvas.onkeydown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            selectOrAdd(i, 0.5, 0.5);
          }
          if (
            selected >= 0 &&
            annotations[selected].page === i &&
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            snapshot();
            const a = annotations[selected],
              step = e.shiftKey ? 0.01 : 0.001;
            if (e.key === "ArrowLeft") a.x = Math.max(0, a.x - step);
            if (e.key === "ArrowRight") a.x = Math.min(0.95, a.x + step);
            if (e.key === "ArrowUp") a.y = Math.max(0, a.y - step);
            if (e.key === "ArrowDown") a.y = Math.min(0.97, a.y + step);
            render();
          }
        };
        wrapper.append(caption, canvas);
        $("pages").append(wrapper);
      });
      render();
      $("savePdf").disabled = $("printForm").disabled = false;
      status("원본을 불러왔습니다.");
    } catch (e) {
      if (token === loadingToken) status(e.message);
    }
  }
  $("formSearch").oninput = filtered;
  $("newText").onclick = () => {
    selected = -1;
    $("entryText").value = "";
    render();
    $("entryText").focus();
  };
  $("checkMark").onclick = () => {
    selected = -1;
    $("entryText").value = "✓";
    render();
    status("체크할 위치를 원본에서 선택하세요.");
  };
  $("entryText").oninput = () => {
    if (selected < 0) return;
    snapshot();
    annotations[selected].text = $("entryText").value.slice(0, 500);
    render(false);
  };
  $("fontSize").oninput = () => {
    const size = Number($("fontSize").value);
    if (selected < 0 || size < 6 || size > 32 || !Number.isFinite(size)) return;
    snapshot();
    annotations[selected].size = size;
    render(false);
  };
  for (const [id, prop] of [
    ["textX", "x"],
    ["textY", "y"],
  ])
    $(id).oninput = () => {
      const value = Number($(id).value);
      if (
        selected < 0 ||
        $(id).value === "" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100
      )
        return;
      snapshot();
      annotations[selected][prop] = value / 100;
      render(false);
    };
  $("removeText").onclick = () => {
    if (selected < 0) return;
    snapshot();
    annotations.splice(selected, 1);
    selected = -1;
    render();
  };
  $("undo").onclick = () => {
    if (!history.length) return;
    annotations = JSON.parse(history.pop());
    selected = -1;
    render();
  };
  $("clearDraft").onclick = () => {
    if (confirm("작성 내용을 모두 지울까요?")) {
      snapshot();
      annotations = [];
      selected = -1;
      render();
    }
  };
  $("saveDraft").onclick = () => {
    save(
      JSON.stringify({ version: 1, form: current.id, annotations }, null, 2),
      current.id + "-draft.json",
      "application/json",
    );
    dirty = false;
    status("작성내용을 저장했습니다.");
  };
  $("loadDraft").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024)
        throw Error("작성내용 파일은 1MB 이하만 불러올 수 있습니다.");
      const data = JSON.parse(await file.text());
      if (
        data.version !== 1 ||
        data.form !== current.id ||
        !Array.isArray(data.annotations) ||
        data.annotations.length > 200
      )
        throw Error("이 서식의 작성내용 파일이 아닙니다.");
      const clean = data.annotations.map((a) => {
        if (
          !a ||
          typeof a.text !== "string" ||
          a.text.length > 500 ||
          !Number.isInteger(a.page) ||
          a.page < 0 ||
          a.page >= current.pages ||
          ![a.x, a.y, a.size].every(Number.isFinite) ||
          a.x < 0 ||
          a.x > 1 ||
          a.y < 0 ||
          a.y > 1 ||
          a.size < 6 ||
          a.size > 32
        )
          throw Error("작성내용의 위치·글자 정보가 올바르지 않습니다.");
        return { page: a.page, text: a.text, x: a.x, y: a.y, size: a.size };
      });
      snapshot();
      annotations = clean;
      selected = -1;
      render();
      status("작성내용을 불러왔습니다.");
    } catch (err) {
      status(err.message);
    } finally {
      e.target.value = "";
    }
  };
  $("savePdf").onclick = async () => {
    if ($("savePdf").disabled) return;
    $("savePdf").disabled = true;
    status("PDF 생성 중…");
    try {
      await document.fonts.ready;
      // Reuse the visible canvas so Firefox keeps identical font rasterization.
      const pages = Array.from(document.querySelectorAll("#pages canvas")).map(
        (c, i) => {
          draw(c, i, false);
          return { width: c.width, height: c.height, jpeg: jpegBytes(c) };
        },
      );
      save(pdfFromJpegs(pages), current.title + "-작성본.pdf");
      dirty = false;
      status(
        "PDF를 저장했습니다. 내용·위치와 제출기관의 작성 안내를 확인하세요.",
      );
    } catch {
      status("PDF를 만들지 못했습니다. 다시 시도해 주세요.");
    } finally {
      render(false);
      $("savePdf").disabled = false;
    }
  };
  $("printForm").onclick = () => {
    document
      .querySelectorAll("#pages canvas")
      .forEach((c, i) => draw(c, i, false));
    window.print();
    render();
  };
  window.addEventListener("beforeprint", () =>
    document
      .querySelectorAll("#pages canvas")
      .forEach((c, i) => draw(c, i, false)),
  );
  window.addEventListener("afterprint", render);
  window.addEventListener("beforeunload", (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  window.addEventListener("hashchange", route);
  filtered();
  route();
})();
