// Local PDF encoder reused from the existing form editor. No network or storage.
function pdfFromJpegs(pages) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let length = 0;
  function bytes(b) {
    chunks.push(b);
    length += b.length;
  }
  function str(s) {
    bytes(encoder.encode(s));
  }
  function openObj(id) {
    offsets[id] = length;
    str(id + " 0 obj\n");
  }
  function closeObj() {
    str("endobj\n");
  }
  const count = 2 + 3 * pages.length;
  str("%PDF-1.4\n%PDF Generated locally\n");
  openObj(1);
  str("<< /Type /Catalog /Pages 2 0 R >>\n");
  closeObj();
  openObj(2);
  str(
    "<< /Type /Pages /Count " +
      pages.length +
      " /Kids [" +
      pages.map((_, i) => 3 + i * 3 + " 0 R").join(" ") +
      "] >>\n",
  );
  closeObj();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i],
      page = 3 + 3 * i,
      contents = page + 1,
      img = page + 2;
    openObj(page);
    str(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.276 841.89] /Resources << /XObject << /FormImage" +
        i +
        " " +
        img +
        " 0 R >> >> /Contents " +
        contents +
        " 0 R >>\n",
    );
    closeObj();
    const draw = "q\n595.276 0 0 841.89 0 0 cm\n/FormImage" + i + " Do\nQ\n";
    openObj(contents);
    str(
      "<< /Length " +
        encoder.encode(draw).length +
        " >>\nstream\n" +
        draw +
        "endstream\n",
    );
    closeObj();
    openObj(img);
    str(
      "<< /Type /XObject /Subtype /Image /Width " +
        p.width +
        " /Height " +
        p.height +
        " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
        p.jpeg.length +
        " >>\nstream\n",
    );
    bytes(p.jpeg);
    str("\nendstream\n");
    closeObj();
  }
  const xref = length;
  str("xref\n0 " + (count + 1) + "\n0000000000 65535 f \n");
  for (let i = 1; i <= count; i++)
    str(String(offsets[i]).padStart(10, "0") + " 00000 n \n");
  str(
    "trailer\n<< /Size " +
      (count + 1) +
      " /Root 1 0 R >>\nstartxref\n" +
      xref +
      "\n%%EOF\n",
  );
  return new Blob(chunks, { type: "application/pdf" });
}
function jpegBytes(canvas) {
  const base64 = canvas.toDataURL("image/jpeg", 0.96).split(",")[1];
  const raw = atob(base64);
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  return data;
}
