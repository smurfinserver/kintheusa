# KIN THE USA — PWA 전환 가능 아키텍처

## 2026-10-20 구현 상태

- **PWA-ready / PWA 미출시**: 서버 API 없는 정적 HTML/CSS/JS, 상대 경로, 배포 파일 허용 목록을 정리했다.
- 홈페이지 로직은 `assets/app.js`, 추가 도구는 `assets/tools-extra.js`로 분리했다. 두 서식은 기존 독립 HTML 및 PDF 생성 코드를 유지한다.
- `pdf-lib` 1.17.1과 `hangul-js` 0.2.6은 로컬 정적 파일이다. CDN fallback이 없으며 `assets/licenses/` 및 `assets/vendor-hashes.json`에 출처·라이선스·해시가 있다.
- CSP에서 `connect-src 'none'`, `form-action 'none'`으로 업로드/폼 제출을 차단한다. 홈페이지 스크립트는 동일 출처만 허용한다. 기존 서식만 inline script를 허용한다.
- 사용자 입력값을 자동 저장하지 않는다. localStorage/IndexedDB/서비스 워커/Cache Storage를 사용하지 않는다.
- Manifest, 앱 아이콘, 서비스 워커는 아직 추가하지 않았다. **설치·오프라인 재실행은 지원하지 않는다.** 온라인으로 라이브러리를 읽은 탭에서는 네트워크를 끊어도 PDF 병합이 동작하는 것을 별도로 검증한다.
- 향후 구현 순서: 실제 아이콘/manifest → 정적 파일 allowlist 캐시 → 사용자 확인 후 업데이트 → 오프라인 재실행/캐시 교체 테스트 → Android/iOS 실기기 설치 검증.
- GitHub Pages `/kintheusa/`와 도메인 루트에서 같은 정적 파일을 제공할 수 있다. `scripts/build.cjs`는 앱·로컬 라이브러리·빈 원본 서식만 `dist/`로 복사한다.

아래 Manifest/SW 예시는 **향후 설계**이며 현재 제공 기능이 아니다.

## 1. 현재 단계와 목표

현재 사이트는 정적 HTML/CSS/JS이다. 우선 정적 HTTPS 배포와 16개 도구의 정확한 작동을 확보하고, 추후 다음 PWA 기능을 단계적으로 제공한다.

- 홈 화면에 추가/설치 가능한 앱 정체성(Manifest, 아이콘).
- 설치 후 전체 카드 메뉴와 서식 편집기를 오프라인에서도 열 수 있는 앱 셸 캐시.
- 로컬 사진·PDF 변환 기능을 네트워크 없이 수행할 수 있는 구성.
- 최신 사이트 버전 배포 시 캐시 정리/업데이트 안내.
- 브라우저가 지원하지 않는 기능에는 명확한 안내 및 대체 동작.

**PWA-ready**(전환할 수 있는 구조)와 **PWA 출시/오프라인 검증 완료**는 별도 상태로 보고한다.

## 2. 앱 구조 및 경로

현재 파일 구조는 유지할 수 있다. 예시:

```text
index.html
assets/
  extra.css
  tools-extra.js
  pdf-lib.min.js             # 로컬에 제공: 버전 고정, 라이선스 확인
  icons/
    app-192.png
    app-512.png
    app-maskable-512.png
    apple-touch-icon.png
manifest.webmanifest          # 추후 PWA 최소 구현 시
sw.js                       # 추후 오프라인 지원 시
original-forms/
  passport-application.pdf
  legal-guardian-consent.pdf
tools/
  passport-form.html
  guardian-form.html
```

- `/assets/...`처럼 도메인 루트에 고정된 링크를 피하고 `./assets/...`, `assets/...`처럼 상대 경로를 쓴다. 하위 HTML에서는 `../assets/...`를 사용한다.
- GitHub Pages 프로젝트 URL `https://<user>.github.io/<repo>/`에서도 앱이 열려야 한다.
- `sw.js`를 앱 루트에 두어 해당 서브패스에서 정상 scope을 얻는다.
- 모든 앱 기능이 별도의 서버 API 없이 작동하도록 유지한다.

## 3. Manifest 준비

설치 기능을 구현한다면 `index.html`에 아래 연동을 추가한다.

```html
<link rel="manifest" href="./manifest.webmanifest">
<meta name="theme-color" content="#205095">
<link rel="apple-touch-icon" href="./assets/icons/apple-touch-icon.png">
```

기본 Manifest 예시(아이콘 파일 실제 생성 필요):

```json
{
  "name": "KIN THE USA - 미국 생활 도구",
  "short_name": "KIN THE USA",
  "description": "미국 거주 한국인을 위한 여권·사진·문서·생활 계산 도구",
  "id": "./",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "lang": "ko-KR",
  "theme_color": "#205095",
  "background_color": "#f7f9fc",
  "icons": [
    { "src": "./assets/icons/app-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./assets/icons/app-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "./assets/icons/app-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Manifest/아이콘이 존재해야 실 설치 가능 여부를 검증할 수 있다. 설치 여부는 브라우저/OS에 따라 UI가 다르며 모든 플랫폼에서 같은 설치 프롬프트를 보장하지 않는다.

## 4. 서비스 워커/오프라인 캐시

- 서비스 워커는 `https:` 또는 `http://localhost`에서만 활성화한다.
- 서비스 워커 등록 경로는 앱 기준 상대 경로를 사용한다. 예: `navigator.serviceWorker.register('./sw.js', {scope:'./'})`.
- 버전 문자열을 포함하는 Cache Storage 이름을 사용하고 버전 교체 시 구 캐시를 정리한다.
- 앱 셸과 실제 배포에 있는 정적 리소스(홈, CSS/JS, 빈 양식 HTML, 빈 PDF, 로컬 pdf-lib, 아이콘, 매니페스트)를 명시적으로 프리캐시한다.
- 캐시 범위를 `GET` + 동일 출처 + 허용된 정적 경로로 제한한다. 외부 출처를 무조건 캐시하지 않는다.
- 초기 설치 시 프리캐시 실패가 발생하면 원인을 로깅하고 문제를 명확히 드러낸다. 없는 파일을 precache 목록에 넣지 않는다.
- 탐색 요청은 최신성/오프라인 복구를 함께 고려한다(예: network-first with cached fallback). 고정 자산은 버전 처리와 캐시 전략을 명시한다.
- 캐시로 생성 파일, 사용자 업로드, JSON/PDF/PNG 내보내기, 주소·주민번호 등 입력값을 저장하지 않는다.
- `blob:`, `data:`, `file:` URL을 캐시 대상에 포함시키지 않는다.
- 오프라인 첫 실행 시 사용자는 앱을 최소 1회 정상 로드해 캐시를 설치해야 한다는 점을 안내한다.
- 업데이트 적용 시 기존 편집 중인 서식 내용이 사라지지 않도록 `skipWaiting()`/`clientsClaim()` 호출 시점과 업데이트 알림 동작을 신중하게 설계한다.
- 캐시 용량·기기 저장공간·iOS 정책에 따라 오프라인 자산이 제거될 수 있으므로 절대 보장을 하지 않는다.

## 5. `pdf-lib` 의존성 제거 계획

초기 작업 문서에는 CDN fallback 방식이 기재되어 있었으나 저장소에는 해당 구현 자체가 누락되어 있었다. 현재 `assets/tools-extra.js`의 `pdfLib()`는 로컬 `assets/pdf-lib.min.js`만 읽는다. 아래 단계 중 1~4는 적용했고, 5는 서비스 워커 도입 시 수행한다.

1. 검증된 `pdf-lib` 버전을 로컬 `assets/pdf-lib.min.js`로 추가한다.
2. 정확한 버전, 해시(가능 시), MIT 라이선스/저작권 공지를 보관한다.
3. 실제 병합 기능을 검증한다(두 PDF의 순서, 페이지 수, 저장 파일 열림 여부).
4. 로컬로 로드되는지 Network 검사 후 CDN fallback 제거 여부를 결정한다. 오프라인 목표는 로컬 의존으로만 달성할 수 있다.
5. SW 프리캐시에 이 파일을 포함하고 인터넷 차단 테스트를 통과해야 PDF 병합을 "오프라인 지원"으로 명시한다.

## 6. 개인정보 및 브라우저 보안

- 사용자 파일과 기입한 서식 데이터는 네트워크로 전송하지 않는다.
- 분석·로그·세션 리플레이 도구를 서식 입력에 연결하지 않는다.
- 동의받지 않은 상태로 주민번호, 이름, 주소, 사진, JSON 입력을 localStorage/IndexedDB/Cache Storage에 자동 저장하지 않는다.
- 사용자가 명시적으로 내려받는 PDF/JSON/TXT만 파일로 저장한다.
- 다운로드된 민감 파일의 보호는 사용자 기기 보안에 달려 있으므로 안내 문구를 유지한다.
- Content Security Policy를 도입할 경우 기존 서식 HTML의 inline JS/CSS를 고려해 테스트와 점진적 외부화가 필요하다.
- 배포 시 HTTPS 제공 여부와 브라우저 콘솔/Network에서 민감 정보가 포함된 외부 요청이 없는지 확인한다.

## 7. PWA 승인 기준 (나중 단계)

- Android Chrome 및 지원되는 iOS Safari에서 홈 화면 추가 가능 여부를 확인한다. 실기기 미보유는 미검증으로 표기.
- 일단 온라인으로 로딩 후 비행기 모드/네트워크 차단 상태에서 홈, 해시 라우트, 두 서식 편집기, 기본 사진·계산 도구를 다시 로드할 수 있다.
- `pdf-lib` 로컬 번들 이후 PDF 합치기도 오프라인에서 실행되고 유효한 PDF를 생성한다.
- PWA 새 버전 배포 뒤 서비스 워커 갱신 및 이전 캐시 정리 과정을 재현한다.
- 아이콘·앱명·화면 방향/모바일 레이아웃을 확인한다.
- 비공식 서비스 고지, 공식 신청 요건은 별도 확인해야 한다는 안내를 유지한다.
