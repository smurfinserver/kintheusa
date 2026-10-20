<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#f7f9fc">
  <meta name="description" content="미국 사는 한국인을 위한 실용적인 온라인 도구 모음. 여권사진, 서류, 단위 변환, 날짜 계산 등을 한 곳에서.">
  <title>KIN THE USA | 미국 생활 도구 모음</title>
  <style>
    :root{--bg:#f7f9fc;--white:#fff;--ink:#172337;--sub:#687589;--border:#e7edf3;--brand:#244f9d;--brand-deep:#163c80;--shadow:0 7px 22px rgba(24,44,72,.035)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","Segoe UI",sans-serif;letter-spacing:-.025em;-webkit-font-smoothing:antialiased}button,input,select,textarea{font:inherit}button,a{touch-action:manipulation}a{text-decoration:none;color:inherit}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #94b9f7;outline-offset:3px}[hidden]{display:none!important}
    .wrap{max-width:1160px;margin:0 auto;padding-left:26px;padding-right:26px}
    .topbar{background:#fff;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30}.topinner{height:74px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{display:inline-flex;align-items:center;gap:11px;min-width:0}.brandmark{width:41px;height:41px;border-radius:13px;background:linear-gradient(140deg,#245aaf,#173d86);color:#fff;display:grid;place-items:center;font-size:21px;font-weight:850;letter-spacing:-.09em;padding-right:2px;box-shadow:0 5px 13px rgba(28,74,148,.18)}.brandcopy{display:flex;flex-direction:column;line-height:1.25}.brandname{font-weight:850;letter-spacing:-.05em;font-size:16px}.brandsub{font-size:11px;color:#8390a3;margin-top:4px;font-weight:500}.nav{display:flex;align-items:center;gap:28px;color:#64758c;font-size:13px;font-weight:700}.nav a:hover{color:var(--brand)}.headerbadge{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:9px 13px;border:1px solid #dfebff;border-radius:999px;color:#335da0;background:#f5f8ff}.dot{width:7px;height:7px;background:#54ad88;border-radius:50%}
    .mainhome{padding-top:51px;padding-bottom:75px}.eyebrow{font-size:11px;font-weight:850;letter-spacing:.13em;color:#426eb2;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px}.eyebrow::before{content:"";display:inline-block;width:18px;height:2px;background:#7fa0d9;border-radius:3px}.hero{display:flex;align-items:center;justify-content:space-between;gap:30px}.hero-title{font-size:clamp(31px,4vw,43px);line-height:1.32;letter-spacing:-.065em;font-weight:850;margin:17px 0 15px}.hero-title em{color:#3662a7;font-style:normal}.hero-sub{color:#768295;font-size:15px;line-height:1.8;margin:0}.hero-art{width:232px;min-width:232px;height:151px;position:relative;margin-right:24px}.art-sheet{position:absolute;background:#fff;border:1px solid #e8edf7;border-radius:16px;box-shadow:0 14px 40px #29568c0d;display:grid;place-items:center}.art-one{width:116px;height:116px;left:15px;top:22px;transform:rotate(-14deg);color:#5b8ccf}.art-two{width:121px;height:113px;right:5px;top:4px;transform:rotate(11deg);color:#63a0a4}.art-three{width:75px;height:75px;left:90px;top:75px;transform:rotate(8deg);color:#d49a67;border-radius:19px}.art-sheet svg{width:38px;height:38px}.art-one svg{width:44px;height:44px}
    .search-area{margin-top:37px;display:flex;align-items:center;gap:15px}.searchbox{max-width:708px;flex:1;min-width:0;height:56px;border-radius:15px;border:1px solid #dce5f0;display:flex;align-items:center;gap:12px;background:#fff;padding:0 16px;box-shadow:0 6px 17px #192c4b06;color:#9cabc0;transition:border-color .16s,box-shadow .16s}.searchbox:focus-within{border-color:#82a7e0;box-shadow:0 0 0 4px #a2c5ff26}.searchbox svg{flex:none}.searchbox input{height:100%;width:100%;border:0;background:transparent;color:#233048;outline:0;font-size:14px;letter-spacing:-.015em}.searchbox input::placeholder{color:#a3adbb}.search-kbd{font-size:11px;color:#a3adbd;padding:5px 7px;border:1px solid #e9edf3;background:#fafbfc;border-radius:6px;white-space:nowrap}.searchhint{margin-left:auto;color:#929eb0;font-size:12px;white-space:nowrap}.searchhint strong{color:#46668f}
    .filters{margin-top:24px;display:flex;flex-wrap:wrap;gap:9px;align-items:center}.filter{background:#fff;border:1px solid #e4ebf2;color:#617088;padding:10px 15px;display:flex;gap:8px;align-items:center;border-radius:999px;font-weight:700;font-size:12px;white-space:nowrap;transition:.18s}.filter svg{width:15px;height:15px;stroke-width:2}.filter:hover{border-color:#aec5e6;color:#385d9c}.filter.active{background:#1d477f;color:#fff;border-color:#1d477f;box-shadow:0 5px 11px #183e7e19}.filter-count{opacity:.72;font-variant-numeric:tabular-nums;font-weight:600}
    .section-title{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-top:46px;margin-bottom:18px}.section-title h2{font-size:19px;line-height:1.3;letter-spacing:-.04em;margin:0;font-weight:850;display:flex;align-items:center;gap:10px}.section-title h2:before{content:"";width:4px;height:19px;background:#4975b6;border-radius:5px}.section-title p{margin:0;color:#929eb0;font-size:12px}.section-title p span{color:#416eae;font-weight:800}.tools-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.tool-card{display:flex;flex-direction:column;min-height:194px;padding:21px 20px 18px;border:1px solid #e6ecf3;border-radius:17px;background:#fff;box-shadow:var(--shadow);position:relative;transition:transform .18s,border-color .18s,box-shadow .18s;outline-offset:3px}.tool-card:hover{transform:translateY(-3px);border-color:#c9d9ef;box-shadow:0 12px 27px #243f6812}.tool-card:active{transform:translateY(-1px)}.tool-card-top{display:flex;align-items:start;justify-content:space-between;gap:10px}.tool-icon{display:grid;place-items:center;width:49px;height:49px;border-radius:14px;flex:none}.tool-icon svg{width:25px;height:25px}.tone-blue{background:#eaf1ff;color:#4879c7}.tone-mint{background:#e8f7f0;color:#37997d}.tone-orange{background:#fff2e5;color:#d18a45}.tone-violet{background:#f1edff;color:#8867c6}.tone-rose{background:#fff0f0;color:#d67b86}.tone-slate{background:#edf3f6;color:#60809c}.tiny-tag{font-size:10px;line-height:1;letter-spacing:-.01em;font-weight:750;padding:7px 8px;border-radius:6px;color:#4b82b5;background:#eff6ff;white-space:nowrap}.tiny-tag.soon{color:#9ba5b1;background:#f3f5f7}.tool-name{margin:16px 0 5px;font-size:15px;letter-spacing:-.045em;font-weight:800;line-height:1.35}.tool-desc{margin:0;color:#8591a3;line-height:1.55;font-size:12px;min-height:36px;letter-spacing:-.02em}.card-bottom{margin-top:auto;padding-top:15px;display:flex;align-items:center;justify-content:space-between;color:#9ba5b3;font-size:10px;font-weight:650}.card-arrow{display:grid;place-items:center;width:19px;height:19px;color:#a1b1c5;transition:transform .2s,color .2s}.tool-card:hover .card-arrow{transform:translateX(3px);color:var(--brand)}.empty{text-align:center;background:#fff;border:1px dashed #d4deea;border-radius:16px;padding:52px 20px;color:#718198}.empty h3{font-size:17px;color:#334358}.empty button{border:0;color:#315ca0;background:#eaf2ff;padding:10px 18px;font-weight:750;border-radius:9px}
    .footer{border-top:1px solid #e8edf4;color:#93a0b1;background:#fff}.footerinner{display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:77px;font-size:12px}.footerbrand{font-weight:850;color:#576d87}.footerlinks{display:flex;gap:17px}.footerlinks a:hover{color:var(--brand)}
    .toolview{padding-top:36px;padding-bottom:80px;max-width:990px}.backlink{border:0;background:transparent;color:#6b819c;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;padding:5px 0}.backlink:hover{color:var(--brand)}.toolhead{margin-top:26px;display:flex;align-items:center;gap:17px}.toolhead .tool-icon{width:62px;height:62px;border-radius:17px}.toolhead .tool-icon svg{width:30px;height:30px}.toolhead h1{font-weight:850;letter-spacing:-.055em;font-size:28px;margin:0 0 5px}.toolhead p{font-size:14px;color:#748295;margin:0}.workspace{margin-top:25px;background:#fff;border:1px solid #e5ecf2;border-radius:19px;padding:28px;box-shadow:var(--shadow)}.work-title{font-size:16px;font-weight:800;margin:0 0 18px}.work-note{background:#f5f8fc;border-radius:11px;padding:13px 15px;color:#718095;font-size:12px;line-height:1.8;margin-top:18px}.work-note strong{color:#42659c}.placeholder{text-align:center;padding:46px 22px}.placeholder .tool-icon{margin:0 auto 19px;width:65px;height:65px}.placeholder h2{margin:0 0 9px;font-size:20px}.placeholder p{font-size:13px;line-height:1.9;color:#8190a3;max-width:430px;margin:0 auto}.placeholder .mainbtn{margin-top:25px}.formgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}.field{display:flex;flex-direction:column;gap:8px;min-width:0}.field label{font-size:12px;color:#66768d;font-weight:750}.field input:not([type=range]):not([type=file]),.field select,.text-area{height:44px;width:100%;border:1px solid #dce5ef;background:#fff;border-radius:10px;padding:10px 12px;color:#243349;outline:none}.field input:focus,.field select:focus,.text-area:focus{border-color:#8ab0ea}.field input[type=file]{max-width:100%;font-size:12px;color:#7a8ba1}.field select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23818ea0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-size:17px;background-position:right 11px center;padding-right:35px}.text-area{resize:vertical;min-height:170px;height:190px;line-height:1.8;font-size:14px}.mainbtn,.subbtn{background:#205095;color:#fff;border:0;border-radius:10px;padding:12px 18px;font-size:13px;font-weight:800}.mainbtn:hover{background:#133e7b}.mainbtn:disabled{background:#b4c1cf;cursor:not-allowed}.subbtn{background:#edf3fc;color:#365b96}.two-split{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}.resultbox{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin-top:20px}.resulttile{background:#f6f8fc;border:1px solid #eaf0f6;padding:16px;border-radius:12px}.resulttile small{display:block;color:#8190a2;font-size:11px;margin-bottom:6px}.resulttile strong{font-size:20px;color:#2c507f;letter-spacing:-.035em;font-variant-numeric:tabular-nums}.clockgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.clockcard{background:#f8fafe;border:1px solid #e8eef5;border-radius:13px;padding:21px}.clockcard strong{font-size:14px}.clockcard .city{color:#8190a1;font-size:12px;margin-top:3px}.clockcard .clocktime{font-size:25px;font-weight:850;letter-spacing:-.06em;margin-top:10px;font-variant-numeric:tabular-nums}.clockcard .clockdate{font-size:12px;color:#8190a1;margin-top:2px}.clockcard.seoul{background:#edf4ff;border-color:#dce9ff}.photo-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:25px}.photo-stage{background:#f7f9fc;border:1px dashed #d5e1f0;border-radius:13px;min-height:330px;padding:18px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;overflow:hidden}.photo-stage canvas{display:block;max-width:100%;max-height:420px;background:white;border:1px solid #dbe3eb;box-shadow:0 4px 18px #162a4017;cursor:grab;touch-action:none}.photo-stage canvas:active{cursor:grabbing}.photo-stage p{font-size:12px;color:#97a4b3;text-align:center}.rangebox{margin-top:20px}.rangebox input{width:100%;accent-color:#3569ac}.statusline{font-size:12px;color:#6d7f97;line-height:1.7;min-height:20px}.photo-control{display:flex;flex-direction:column;gap:20px}.file-style{background:#f8faff;border:1px solid #e7edf5;border-radius:11px;padding:13px}.feature-list{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.feature-list span{padding:7px 10px;background:#f3f6fa;color:#7c8a9c;border-radius:7px;font-size:11px;font-weight:700}.inline-result{font-size:14px;line-height:2;color:#516580;margin-top:14px}.inline-result strong{color:#22518e}.resize-preview{width:100%;max-height:280px;object-fit:contain;border:1px dashed #dce3ef;border-radius:11px;background:#fbfcff;padding:10px;margin-top:16px}.checkline{display:flex;align-items:center;gap:8px;color:#6b788a;font-size:12px}.checkline input{accent-color:#2d61aa}
    @media(max-width:990px){.tools-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.hero-art{margin-right:0}.searchhint{display:none}.nav{gap:17px}}
    @media(max-width:720px){.wrap{padding-left:20px;padding-right:20px}.topinner{height:65px}.nav{display:none}.headerbadge{font-size:11px;padding:8px 10px}.mainhome{padding-top:37px}.hero-art{display:none}.hero-title{font-size:33px;margin:14px 0 10px}.hero-sub{font-size:13px}.search-area{margin-top:28px}.searchbox{height:53px}.tools-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tool-card{padding:17px;min-height:190px}.section-title{margin-top:35px}.footerinner{flex-direction:column;align-items:flex-start;justify-content:center;padding-top:18px;padding-bottom:18px;gap:9px}.toolview{padding-top:24px}.two-split{grid-template-columns:1fr}.photo-layout{grid-template-columns:1fr}.photo-control{max-width:420px}.workspace{padding:20px}}
    @media(max-width:420px){.wrap{padding-left:15px;padding-right:15px}.brandmark{width:35px;height:35px;border-radius:11px}.brandname{font-size:14px}.brandsub{font-size:10px}.headerbadge{display:none}.hero-title{font-size:30px}.search-kbd{display:none}.filter{padding:9px 11px;font-size:11px}.tool-card{padding:14px;min-height:190px;border-radius:13px}.tool-icon{width:43px;height:43px;border-radius:12px}.tool-icon svg{width:23px;height:23px}.tool-name{font-size:14px}.tool-desc{font-size:11px}.tiny-tag{font-size:9px;padding:6px}.card-bottom{font-size:9px}.formgrid{grid-template-columns:1fr}.clockgrid{grid-template-columns:1fr}.toolhead h1{font-size:24px}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
  </style>
<link rel="stylesheet" href="assets/extra.css">
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
    <symbol id="ic-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></symbol>
    <symbol id="ic-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></symbol>
    <symbol id="ic-passport" viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M8 12h8m-4-4a8 8 0 0 1 0 8m0-8a8 8 0 0 0 0 8"/></symbol>
    <symbol id="ic-camera" viewBox="0 0 24 24"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/><path d="M17.5 10h.01"/></symbol>
    <symbol id="ic-file" viewBox="0 0 24 24"><path d="M6 2.5h8l5 5v14H6z"/><path d="M14 2.5v5h5M9 12h7M9 16h7"/></symbol>
    <symbol id="ic-pen" viewBox="0 0 24 24"><path d="m4 17.5-.5 3 3-.5L19 7.5 16.5 5 4 17.5z"/><path d="m14.5 7 2.5 2.5M4 13V4.5h9M10 20h10v-9"/></symbol>
    <symbol id="ic-people" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M16 5a3 3 0 0 1 0 6m1 3a4.5 4.5 0 0 1 3.5 4.5V20"/></symbol>
    <symbol id="ic-eraser" viewBox="0 0 24 24"><path d="M20 16 11 6a2 2 0 0 0-3 0l-5 6a2 2 0 0 0 0 3l5 5h12"/><path d="m7 19 9-10M15 20h6"/></symbol>
    <symbol id="ic-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m3 17 5-5 4 4 4-6 5 7"/></symbol>
    <symbol id="ic-scissors" viewBox="0 0 24 24"><circle cx="5.5" cy="6" r="2.5"/><circle cx="5.5" cy="18" r="2.5"/><path d="M8 8l12 12M8 16 20 4"/></symbol>
    <symbol id="ic-layers" viewBox="0 0 24 24"><rect x="3" y="4" width="13" height="16" rx="1"/><path d="M8 2h12v16M7 9h5M7 13h5"/></symbol>
    <symbol id="ic-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></symbol>
    <symbol id="ic-ruler" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="1.5" transform="rotate(-35 12 12)"/><path d="m8 11 2 2m1-5 2 2m1-5 2 2"/></symbol>
    <symbol id="ic-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M8 14h3m3 0h3"/></symbol>
    <symbol id="ic-calculator" viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 7h8m-8 4h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2"/></symbol>
    <symbol id="ic-type" viewBox="0 0 24 24"><path d="M4 6h16M12 6v13M7 19h10M6 6l-2 4M18 6l2 4"/></symbol>
    <symbol id="ic-map" viewBox="0 0 24 24"><path d="M12 22s-8-7-8-13a8 8 0 0 1 16 0c0 6-8 13-8 13z"/><circle cx="12" cy="9" r="2.5"/></symbol>
    <symbol id="ic-keyboard" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 13h1m3 0h1m3 0h1m3 0h1M7 16h10"/></symbol>
    <symbol id="ic-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol>
    <symbol id="ic-left" viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></symbol>
    <symbol id="ic-upload" viewBox="0 0 24 24"><path d="M12 16V3m-5 5 5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></symbol>
  </svg>
  <header class="topbar"><div class="wrap topinner"><a class="brand" href="#" aria-label="도구 모음 홈으로"><span class="brandmark">K</span><span class="brandcopy"><span class="brandname">KIN THE USA</span><span class="brandsub">미국 생활, 더 간단하게</span></span></a><nav class="nav"><a href="#">전체 도구</a><a href="#" data-shortcut="passport">여권 · 영사</a><a href="#" data-shortcut="photo">사진 · 문서</a><a href="#" data-shortcut="life">미국 생활</a></nav><div class="headerbadge"><span class="dot"></span>브라우저에서 바로 사용</div></div></header>
  <main id="home" class="wrap mainhome">
    <section class="hero" aria-labelledby="heroTitle"><div><div class="eyebrow">KOREAN LIFE IN THE USA</div><h1 id="heroTitle" class="hero-title">미국 생활의 작은 일들,<br><em>여기서 간단하게.</em></h1><p class="hero-sub">여권, 서류, 사진 편집부터 일상 계산까지.<br>미국에 사는 한국인에게 필요한 도구를 한곳에 모았습니다.</p></div><div class="hero-art" aria-hidden="true"><div class="art-sheet art-one"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-passport"/></svg></div><div class="art-sheet art-two"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-file"/></svg></div><div class="art-sheet art-three"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-clock"/></svg></div></div></section>
    <section class="search-area" aria-label="도구 검색"><label class="searchbox"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><use href="#ic-search"/></svg><input id="search" type="search" placeholder="어떤 도구가 필요하세요?  예: 여권, 사진, 시간, 단위" autocomplete="off" aria-label="도구 검색"><span class="search-kbd">/</span></label><span class="searchhint"><strong id="totalCount">0</strong>개의 생활 도구</span></section>
    <div id="filters" class="filters" role="group" aria-label="도구 카테고리"></div>
    <section aria-label="도구 목록"><div class="section-title"><h2 id="listTitle">전체 도구</h2><p id="resultCount"></p></div><div id="cards" class="tools-grid"></div><div id="empty" class="empty" hidden><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#afbdcf" stroke-width="1.5" stroke-linecap="round"><use href="#ic-search"/></svg><h3>검색 결과가 없어요</h3><p>검색어를 바꾸거나 전체 도구를 살펴보세요.</p><button id="resetFilter">전체 도구 보기</button></div></section>
  </main>
  <main id="toolPage" class="wrap toolview" hidden></main>
  <footer class="footer"><div class="wrap footerinner"><div><span class="footerbrand">KIN THE USA</span> <span> · 미국에 사는 한국인을 위한 작은 도구함</span></div><div class="footerlinks"><span>개인 제작 유틸리티 · 정부 공식 사이트가 아닙니다</span></div></div></footer>
  <script src="assets/tools-extra.js"></script>
  <script>
    'use strict';
    /* 나중에 개별 기능 페이지를 만들면 여기에 URL을 넣으세요.
       예: 'passport-form': './tools/passport-form.html',
       빈 상태에서는 카드 클릭 시 사이트 내부의 안내 화면이 열립니다. */
    const TOOL_URLS = {
      'passport-form':'tools/passport-form.html',
      'guardian-form':'tools/guardian-form.html'
    };
    const CATEGORIES = [
      {id:'all',title:'전체',icon:'grid'},
      {id:'passport',title:'여권 · 영사',icon:'passport'},
      {id:'photo',title:'사진 · 문서',icon:'image'},
      {id:'life',title:'생활 · 계산',icon:'clock'},
      {id:'text',title:'텍스트 · 기타',icon:'type'}
    ];
    const TOOLS = [
      {id:'passport-photo',name:'여권사진 크롭',desc:'한국·미국 여권사진 규격으로 자르기',cat:'passport',icon:'camera',tone:'blue',ready:true,tags:'여권 증명사진 사진 편집 passport crop'},
      {id:'passport-form',name:'한국 여권 신청서',desc:'여권 발급 신청서 작성 및 출력',cat:'passport',icon:'file',tone:'mint',ready:false,tags:'여권 발급 pdf 신청서 작성'},
      {id:'guardian-form',name:'법정대리인 동의서',desc:'미성년자 여권 동의서 작성',cat:'passport',icon:'pen',tone:'orange',ready:false,tags:'법정대리인 동의 미성년자 여권'},
      {id:'document-checklist',name:'영사 서류 체크리스트',desc:'방문 전 필요한 서류 항목 정리',cat:'passport',icon:'people',tone:'violet',ready:true,tags:'영사관 준비물 서류 체크리스트'},
      {id:'bg-remove',name:'사진 배경 제거',desc:'단색 배경 제거 · 브러시로 보정',cat:'photo',icon:'eraser',tone:'rose',ready:true,tags:'누끼 인물 분리 배경 투명'},
      {id:'image-resize',name:'이미지 크기 변경',desc:'사진 픽셀과 파일 형식 바꾸기',cat:'photo',icon:'image',tone:'mint',ready:true,tags:'jpg png 이미지 크기 리사이즈'},
      {id:'pdf-merge',name:'PDF 합치기',desc:'여러 PDF를 하나의 문서로',cat:'photo',icon:'layers',tone:'blue',ready:true,tags:'pdf 합치기 병합 문서'},
      {id:'image-pdf',name:'사진을 PDF로',desc:'이미지 파일을 PDF로 저장',cat:'photo',icon:'scissors',tone:'orange',ready:true,tags:'jpg pdf 이미지 문서 변환'},
      {id:'time-zone',name:'한국 · 미국 시간 비교',desc:'한국과 미국 주요 지역 시간 확인',cat:'life',icon:'clock',tone:'violet',ready:true,tags:'한국 서울 미국 la 뉴욕 피닉스 시차'},
      {id:'unit-convert',name:'미국 단위 변환기',desc:'온도 · 거리 · 무게 · 길이 변환',cat:'life',icon:'ruler',tone:'mint',ready:true,tags:'화씨 섭씨 마일 킬로 파운드 피트 인치'},
      {id:'date-calc',name:'날짜 차이 계산기',desc:'두 날짜 사이 일수 알아보기',cat:'life',icon:'calendar',tone:'blue',ready:true,tags:'날짜 dday 일수 기간 계산'},
      {id:'tax-helper',name:'미국 세금 계산 도우미',desc:'판매세 · 팁 · 최종 결제액 계산',cat:'life',icon:'calculator',tone:'orange',ready:true,tags:'세금 sales tax tax 미국'},
      {id:'char-count',name:'글자수 세기',desc:'공백 포함 · 제외, 단어 수 계산',cat:'text',icon:'type',tone:'rose',ready:true,tags:'글자 텍스트 문자 단어 글자수'},
      {id:'address-helper',name:'미국 주소 표기 도우미',desc:'영문 주소 구성요소 확인',cat:'text',icon:'map',tone:'violet',ready:true,tags:'주소 영문 영주소 street apt zip'},
      {id:'keyboard',name:'한영 타자 변환',desc:'두벌식 한영 오타 자판 변환',cat:'text',icon:'keyboard',tone:'slate',ready:true,tags:'한영 키보드 전환 자판'},
      {id:'letter-template',name:'영문 이메일 문구',desc:'자주 쓰는 생활 표현 모음',cat:'text',icon:'file',tone:'mint',ready:true,tags:'영어 이메일 영문 표현'}
    ];
    const $ = s => document.querySelector(s);
    const svg = (name,size=22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#ic-${name}"/></svg>`;
    const catName = id => CATEGORIES.find(c=>c.id===id)?.title || '';
    let activeCategory='all',query='';
    const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const fmt = n => Number(n).toLocaleString('ko-KR');
    function renderFilters(){
      $('#filters').innerHTML = CATEGORIES.map(c=>`<button type="button" class="filter ${activeCategory===c.id?'active':''}" data-cat="${c.id}" aria-pressed="${activeCategory===c.id}">${svg(c.icon,15)}${c.title}<span class="filter-count">${c.id==='all'?TOOLS.length:TOOLS.filter(t=>t.cat===c.id).length}</span></button>`).join('');
    }
    function renderCards(){
      let q=query.trim().toLocaleLowerCase();
      let found=TOOLS.filter(t=>(activeCategory==='all'||t.cat===activeCategory)&&(!q||`${t.name} ${t.desc} ${t.tags} ${catName(t.cat)}`.toLocaleLowerCase().includes(q)));
      $('#listTitle').textContent=activeCategory==='all'?'전체 도구':catName(activeCategory);
      $('#resultCount').innerHTML=`<span>${found.length}</span>개 도구 표시`;
      $('#totalCount').textContent=TOOLS.length;
      $('#cards').innerHTML=found.map(t=>`<a class="tool-card" href="${escapeHtml(TOOL_URLS[t.id]||'#tool/'+t.id)}" aria-label="${escapeHtml(t.name)}${t.ready||TOOL_URLS[t.id]?' 열기':' 준비 중'}"><div class="tool-card-top"><span class="tool-icon tone-${t.tone}">${svg(t.icon)}</span><span class="tiny-tag ${t.ready||TOOL_URLS[t.id]?'':'soon'}">${t.ready||TOOL_URLS[t.id]?'바로 사용':'준비 중'}</span></div><div class="tool-name">${escapeHtml(t.name)}</div><p class="tool-desc">${escapeHtml(t.desc)}</p><div class="card-bottom"><span>${escapeHtml(catName(t.cat))}</span><span class="card-arrow">${svg('arrow',16)}</span></div></a>`).join('');
      $('#empty').hidden=found.length>0;
    }
    function goHome(){location.hash='';}
    $('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;activeCategory=b.dataset.cat;renderFilters();renderCards();});
    $('#search').addEventListener('input',e=>{query=e.target.value;renderCards();});
    $('#resetFilter').addEventListener('click',()=>{query='';activeCategory='all';$('#search').value='';renderFilters();renderCards();});
    document.addEventListener('keydown',e=>{if(e.key==='/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName) && !e.ctrlKey && !e.metaKey){e.preventDefault();if(!$('#home').hidden)$('#search').focus();}});
    document.querySelectorAll('[data-shortcut]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();activeCategory=a.dataset.shortcut;query='';$('#search').value='';renderFilters();renderCards();goHome();}));
    function route(){
      const id=decodeURIComponent(location.hash.replace(/^#tool\//,''));
      const isTool=location.hash.startsWith('#tool/')&&TOOLS.some(t=>t.id===id);
      $('#home').hidden=isTool;$('#toolPage').hidden=!isTool;
      if(isTool){renderToolPage(TOOLS.find(t=>t.id===id));window.scrollTo(0,0);}
    }
    function renderToolPage(t){
      let content = t.ready ? toolContent(t.id):placeholderContent(t);
      $('#toolPage').innerHTML=`<button class="backlink" type="button" id="backHome">${svg('left',17)} 전체 도구로 돌아가기</button><div class="toolhead"><span class="tool-icon tone-${t.tone}">${svg(t.icon,30)}</span><div><h1>${escapeHtml(t.name)}</h1><p>${escapeHtml(t.desc)}</p></div></div><section class="workspace">${content}</section>`;
      $('#backHome').addEventListener('click',goHome);
      initTool(t.id);
    }
    function placeholderContent(t){
      return `<div class="placeholder"><span class="tool-icon tone-${t.tone}">${svg(t.icon,34)}</span><h2>이 도구는 준비 중이에요.</h2><p>${escapeHtml(t.desc)} 기능을 이 페이지에 연결할 예정입니다. 개별 HTML 도구가 완성되면 메인 페이지의 <strong>TOOL_URLS</strong> 설정에 주소만 추가하면 됩니다.</p><div class="feature-list" style="justify-content:center"><span>별도 로그인 없이 이용</span><span>모바일 화면 지원</span><span>필요한 기능만 연결 가능</span></div><button class="mainbtn" type="button" onclick="location.hash=''">다른 도구 살펴보기</button></div>`;
    }
    function toolContent(id){
      switch(id){
        case 'passport-photo':return `<h2 class="work-title">여권사진 자르기</h2><div class="photo-layout"><div><div class="photo-stage"><canvas id="cropCanvas" width="413" height="531" role="img" aria-label="사진 크롭 미리보기"></canvas><p>이미지를 업로드하면 미리보기가 나타납니다. 사진을 드래그해 위치를 조정하세요.</p></div><p id="photoStatus" class="statusline" role="status"></p></div><div class="photo-control"><div class="field"><label for="passportPreset">사진 규격</label><select id="passportPreset"><option value="kr">한국 여권: 3.5 × 4.5cm (413 × 531px)</option><option value="us">미국 여권: 2 × 2in (600 × 600px)</option></select></div><div class="field file-style"><label for="passportUpload">사진 파일 선택</label><input id="passportUpload" type="file" accept="image/*"></div><div class="field rangebox"><label for="passportZoom">확대 / 축소 <span id="zoomLabel">100%</span></label><input id="passportZoom" type="range" min="100" max="350" value="100" step="1"></div><button type="button" class="mainbtn" id="passportDownload" disabled>JPG 사진 저장</button><div class="work-note">선택한 비율과 픽셀 크기로 이미지를 자르는 기능입니다. <strong>여권사진의 실제 얼굴 크기, 배경색, 촬영 기준 등 공식 요건을 자동으로 검증하지는 않습니다.</strong> 파일은 서버에 전송하지 않습니다.</div></div></div>`;
        case 'image-resize':return `<h2 class="work-title">이미지 크기 변경</h2><div class="two-split"><div><div class="field file-style"><label for="resizeUpload">사진 선택</label><input type="file" accept="image/*" id="resizeUpload"></div><img id="resizePreview" class="resize-preview" alt="선택한 이미지 미리보기" hidden><div id="resizeStatus" class="statusline" role="status" style="margin-top:12px">이미지를 선택해주세요.</div></div><div><div class="formgrid"><div class="field"><label for="resizeW">가로(px)</label><input id="resizeW" type="number" min="1" max="6000" placeholder="가로"></div><div class="field"><label for="resizeH">세로(px)</label><input id="resizeH" type="number" min="1" max="6000" placeholder="세로"></div></div><label class="checkline" style="margin-top:13px"><input id="resizeLock" type="checkbox" checked> 가로·세로 비율 유지</label><div class="field" style="margin-top:18px"><label for="resizeFormat">저장 파일 형식</label><select id="resizeFormat"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></div><button class="mainbtn" type="button" id="resizeSave" style="margin-top:21px" disabled>변경한 이미지 다운로드</button><div class="work-note">이미지는 브라우저 내부에서만 처리됩니다. 지나치게 큰 크기는 기기 메모리를 많이 사용할 수 있어 최대 6,000px로 제한했습니다.</div></div></div>`;
        case 'time-zone':return `<h2 class="work-title">한국과 미국의 현재 시간</h2><div id="clockGrid" class="clockgrid"></div><div class="work-note">미국의 지역별 서머타임(DST)은 브라우저의 시간대 정보를 사용해 반영합니다. 기기에 설정된 시계가 부정확하면 표시도 달라질 수 있습니다.</div>`;
        case 'unit-convert':return `<h2 class="work-title">미국 단위 ↔ 한국 단위</h2><div class="formgrid"><div class="field"><label for="convertType">변환 종류</label><select id="convertType"><option value="f">온도: 화씨(°F) → 섭씨(°C)</option><option value="c">온도: 섭씨(°C) → 화씨(°F)</option><option value="mi">거리: 마일(mi) → 킬로미터(km)</option><option value="km">거리: 킬로미터(km) → 마일(mi)</option><option value="lb">무게: 파운드(lb) → 킬로그램(kg)</option><option value="kg">무게: 킬로그램(kg) → 파운드(lb)</option><option value="in">길이: 인치(in) → 센티미터(cm)</option><option value="cm">길이: 센티미터(cm) → 인치(in)</option><option value="ft">길이: 피트(ft) → 미터(m)</option><option value="m">길이: 미터(m) → 피트(ft)</option></select></div><div class="field"><label for="convertInput">변환할 값</label><input id="convertInput" type="number" step="any" value="100"></div></div><div class="resultbox" style="grid-template-columns:1fr"><div class="resulttile"><small>변환 결과</small><strong id="convertOutput">—</strong></div></div>`;
        case 'date-calc':return `<h2 class="work-title">두 날짜 사이 일수 계산</h2><div class="formgrid"><div class="field"><label for="dateStart">시작 날짜</label><input type="date" id="dateStart"></div><div class="field"><label for="dateEnd">종료 날짜</label><input type="date" id="dateEnd"></div></div><div class="resultbox"><div class="resulttile"><small>날짜 차이 (시작일 제외)</small><strong id="dateDiff">—</strong></div><div class="resulttile"><small>양쪽 날짜 모두 포함</small><strong id="dateInclusive">—</strong></div></div><div class="work-note">날짜만 비교하며 시간과 시간대는 계산하지 않습니다. 시작일 이후 날짜를 선택하면 양수로 표시됩니다.</div>`;
        case 'char-count':return `<h2 class="work-title">글자수 · 단어 수 세기</h2><textarea id="charInput" class="text-area" placeholder="여기에 문장을 입력하거나 붙여넣으세요."></textarea><div class="resultbox"><div class="resulttile"><small>글자 수 (공백 포함)</small><strong id="charAll">0</strong></div><div class="resulttile"><small>글자 수 (공백 제외)</small><strong id="charNoSpace">0</strong></div><div class="resulttile"><small>단어 수</small><strong id="charWords">0</strong></div><div class="resulttile"><small>줄 수</small><strong id="charLines">0</strong></div></div>`;
        default:return window.KIN_EXTRA ? KIN_EXTRA.content(id) : '<p>도구 스크립트를 불러오지 못했습니다.</p>';
      }
    }
    function initTool(id){
      if(id==='passport-photo')initPhotoCrop();
      if(id==='image-resize')initResize();
      if(id==='time-zone')initTimeZones();
      if(id==='unit-convert')initConvert();
      if(id==='date-calc')initDateCalc();
      if(id==='char-count')initCharCount();
      if(window.KIN_EXTRA) KIN_EXTRA.init(id);
    }
    function initTimeZones(){
      const zones=[{label:'대한민국 · 서울',zone:'Asia/Seoul',highlight:true},{label:'미국 · 피닉스',zone:'America/Phoenix'},{label:'미국 · 로스앤젤레스',zone:'America/Los_Angeles'},{label:'미국 · 뉴욕',zone:'America/New_York'}];
      const box=$('#clockGrid');
      const update=()=>{if(!document.contains(box))return;let now=new Date();box.innerHTML=zones.map(z=>{let time=new Intl.DateTimeFormat('ko-KR',{timeZone:z.zone,hour:'2-digit',minute:'2-digit',hour12:false}).format(now),date=new Intl.DateTimeFormat('ko-KR',{timeZone:z.zone,year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(now);return `<div class="clockcard ${z.highlight?'seoul':''}"><strong>${z.label}</strong><div class="city">${z.zone}</div><div class="clocktime">${time}</div><div class="clockdate">${date}</div></div>`;}).join('');};
      update();if(window.kinClockInterval)clearInterval(window.kinClockInterval);window.kinClockInterval=setInterval(()=>{if(!document.contains(box)){clearInterval(window.kinClockInterval);return;}update();},30000);
    }
    function initConvert(){
      const factors={f:[n=>(n-32)*5/9,'°C'],c:[n=>n*9/5+32,'°F'],mi:[n=>n*1.609344,'km'],km:[n=>n/1.609344,'mi'],lb:[n=>n*.45359237,'kg'],kg:[n=>n/.45359237,'lb'],in:[n=>n*2.54,'cm'],cm:[n=>n/2.54,'in'],ft:[n=>n*.3048,'m'],m:[n=>n/.3048,'ft']};
      const update=()=>{let raw=$('#convertInput').value;let [fn,unit]=factors[$('#convertType').value];let value=Number(raw);$('#convertOutput').textContent=raw.trim()===''||!Number.isFinite(value)?'값을 입력해주세요':`${new Intl.NumberFormat('ko-KR',{maximumFractionDigits:4}).format(fn(value))} ${unit}`;};
      $('#convertType').addEventListener('change',update);$('#convertInput').addEventListener('input',update);update();
    }
    function initDateCalc(){
      const today=new Date(),next=new Date(today.getTime()+30*86400000);
      const localISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      $('#dateStart').value=localISO(today);$('#dateEnd').value=localISO(next);
      const update=()=>{const a=$('#dateStart').value,b=$('#dateEnd').value;if(!a||!b){$('#dateDiff').textContent=$('#dateInclusive').textContent='—';return;}let days=Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);$('#dateDiff').textContent=`${fmt(days)}일`;$('#dateInclusive').textContent=`${fmt(Math.abs(days)+1)}일`;};
      $('#dateStart').addEventListener('input',update);$('#dateEnd').addEventListener('input',update);update();
    }
    function initCharCount(){
      const update=()=>{let t=$('#charInput').value;$('#charAll').textContent=fmt(Array.from(t).length);$('#charNoSpace').textContent=fmt(Array.from(t.replace(/\s/g,'')).length);$('#charWords').textContent=fmt(t.trim()?t.trim().split(/\s+/).length:0);$('#charLines').textContent=fmt(t? t.split(/\r\n|\n|\r/).length:0);};
      $('#charInput').addEventListener('input',update);update();
    }
    function saveBlob(blob,filename){if(!blob)return;let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
    function loadImageFile(file,callback,onError){
      if(!file||!file.type.startsWith('image/')){onError?.('이미지 파일을 선택해주세요.');return;}
      const objectURL=URL.createObjectURL(file),img=new Image();
      img.onload=()=>{URL.revokeObjectURL(objectURL);callback(img);};
      img.onerror=()=>{URL.revokeObjectURL(objectURL);onError?.('이 이미지 형식은 브라우저에서 열 수 없습니다.');};
      img.src=objectURL;
    }
    function initPhotoCrop(){
      const canvas=$('#cropCanvas'),ctx=canvas.getContext('2d');const preset=$('#passportPreset'),upload=$('#passportUpload'),zoomEl=$('#passportZoom'),down=$('#passportDownload'),status=$('#photoStatus');
      let img=null,offsetX=0,offsetY=0,drag=null;const sizes={kr:[413,531],us:[600,600]};
      function draw(){let [w,h]=sizes[preset.value];canvas.width=w;canvas.height=h;ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);if(!img){ctx.fillStyle='#9bb0c9';ctx.textAlign='center';ctx.font='20px system-ui';ctx.fillText('사진을 선택해주세요',w/2,h/2);return;}
        let scale=Math.max(w/img.naturalWidth,h/img.naturalHeight)*(Number(zoomEl.value)/100),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
        const maxX=Math.max(0,(dw-w)/2),maxY=Math.max(0,(dh-h)/2);offsetX=Math.min(maxX,Math.max(-maxX,offsetX));offsetY=Math.min(maxY,Math.max(-maxY,offsetY));
        ctx.drawImage(img,(w-dw)/2+offsetX,(h-dh)/2+offsetY,dw,dh);
      }
      preset.addEventListener('change',()=>{offsetX=offsetY=0;draw();});zoomEl.addEventListener('input',()=>{$('#zoomLabel').textContent=zoomEl.value+'%';draw();});
      upload.addEventListener('change',()=>{loadImageFile(upload.files[0],image=>{img=image;offsetX=offsetY=0;zoomEl.value=100;$('#zoomLabel').textContent='100%';down.disabled=false;status.textContent=`원본 크기: ${fmt(img.naturalWidth)} × ${fmt(img.naturalHeight)}px`;draw();},m=>{status.textContent=m;});});
      canvas.addEventListener('pointerdown',e=>{if(!img)return;drag={x:e.clientX,y:e.clientY,ox:offsetX,oy:offsetY};canvas.setPointerCapture(e.pointerId);});
      canvas.addEventListener('pointermove',e=>{if(!drag)return;let r=canvas.getBoundingClientRect();offsetX=drag.ox+(e.clientX-drag.x)*(canvas.width/r.width);offsetY=drag.oy+(e.clientY-drag.y)*(canvas.height/r.height);draw();});
      canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
      down.addEventListener('click',()=>{if(!img)return;canvas.toBlob(b=>saveBlob(b,`passport-photo-${preset.value}.jpg`),'image/jpeg',.95);});draw();
    }
    function initResize(){
      let img=null,ratio=1,previewUrl=null;const upload=$('#resizeUpload'),width=$('#resizeW'),height=$('#resizeH'),lock=$('#resizeLock'),save=$('#resizeSave'),preview=$('#resizePreview'),status=$('#resizeStatus');
      upload.addEventListener('change',()=>{loadImageFile(upload.files[0],image=>{img=image;ratio=image.naturalWidth/image.naturalHeight;width.value=image.naturalWidth;height.value=image.naturalHeight;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(upload.files[0]);preview.src=previewUrl;preview.hidden=false;save.disabled=false;status.textContent=`원본: ${fmt(image.naturalWidth)} × ${fmt(image.naturalHeight)}px`;},m=>{status.textContent=m;});});
      width.addEventListener('input',()=>{if(lock.checked&&Number(width.value)>0)height.value=Math.max(1,Math.round(Number(width.value)/ratio));});
      height.addEventListener('input',()=>{if(lock.checked&&Number(height.value)>0)width.value=Math.max(1,Math.round(Number(height.value)*ratio));});
      save.addEventListener('click',()=>{if(!img)return;let w=Number(width.value),h=Number(height.value);if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>6000||h>6000){status.textContent='가로·세로는 1~6,000px 사이의 정수를 입력해주세요.';return;}
        let c=document.createElement('canvas');c.width=w;c.height=h;let cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,w,h);cx.drawImage(img,0,0,w,h);let mime=$('#resizeFormat').value;try{c.toBlob(blob=>{if(!blob){status.textContent='이미지 저장에 실패했습니다.';return;}saveBlob(blob,`resized-${w}x${h}.${mime==='image/png'?'png':'jpg'}`);status.textContent=`${fmt(w)} × ${fmt(h)}px 이미지가 저장되었습니다.`;},mime,.93);}catch(e){status.textContent='이미지를 처리하지 못했습니다. 다른 파일을 시도해주세요.';}
      });
    }
    window.addEventListener('hashchange',route);renderFilters();renderCards();route();
  </script>
</body>
</html>
