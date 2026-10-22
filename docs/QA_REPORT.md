# KIN THE USA 검증 보고서

검증일: 2026-10-20~21 (America/Los_Angeles). 실제 개인정보 없이 합성 이미지, 합성 PDF, 가상 입력만 사용했다. PASS는 아래 명시한 주요 기능의 통과이며 모든 브라우저·모든 입력에 대한 보증이 아니다.

## 배포 상태

- **정식 배포 완료 / HTTPS 검증 PASS**: https://smurfinserver.github.io/kintheusa/
- 사용자 승인 후 2026-10-21에 저장소를 public으로 전환하고 Pages를 GitHub Actions 방식으로 활성화했다. HTTPS 강제 적용 상태이며 HTTP 200 응답을 확인했다. DNS·유료 요금제 변경 없음.
- 배포 완료: **2026-10-21 20:14:25 PDT** (2026-10-22 03:14:25 UTC), 앱 커밋 `92808f5`.
- [GitHub Actions 실행 39545197739](https://github.com/smurfinserver/kintheusa/actions/runs/39545197739): 사전 테스트 60개 통과, 배포 성공, 실제 HTTPS 대상 Chromium 사후 테스트 20개 통과. 이전 실패 단계 재실행으로 완료했다.
- 추가로 실제 HTTPS 주소에 대해 Chromium / Firefox / 모바일 Chromium **60/60 PASS (1.0분)**. 16개 도구 주요 기능, 다운로드 파일 파싱, 경로, 오류 처리, 네트워크/저장 검사 모두 통과했다.
- 초기 배포는 비공개 저장소의 요금제 제한(HTTP 422)으로 중단됐으나 공개 전환 승인 후 해결했다. [GitHub 공식 Pages 요금제 안내](https://docs.github.com/en/pages/quickstart).
- `main` push 및 PR에서 구문·상대 경로·라이브러리 해시·Playwright 검증을 수행한다. `deploy`는 `needs: test`로 테스트 성공에 의존하며 실패 시 배포하지 않는다. PR은 배포하지 않는다.
- 배포 후 공개 URL에서 Chromium 전체 기능 테스트를 별도로 실행한다. 사후 검증 실패 시 워크플로가 실패하지만 자동 롤백은 하지 않는다.
- `dist/` 허용 목록: 홈페이지, 앱 자산, 두 서식 편집기, 빈 원본 PDF. 작업 문서·소스 테스트·테스트 결과·스크린샷·입력/출력 파일·node_modules·Git 메타데이터는 배포에서 제외한다.
- 복구 및 CI 구현 커밋: `9c8b7ea`. Pages 제한 기록 커밋: `9fdcb1c`.
- GitHub Pages 설정만 사용한다. DNS, 사용자 도메인, 유료 서비스는 변경하지 않는다.

## 초기 문제 및 수정

1. `index.html`이 AGENTS 지시문, `assets/extra.css`가 CODEX_TASK 지시문, `assets/tools-extra.js`가 홈페이지 HTML, 두 `tools/*.html`이 PDF 바이너리였다. 파일 내용과 Git 기준선을 비교해 올바른 위치로 복구했다.
2. `CODEX_PROMPT.txt`의 여권 편집기와 `CODEX_TASK.md`의 동의서 편집기를 복원했다. **두 편집기의 기존 JavaScript와 날짜 좌표는 변경하지 않았다.** 잘못된 확장자의 중복 파일을 제거하고 빈 PDF 경로를 `original-forms/`로 통일했다.
3. 누락된 추가 도구 8개(체크리스트, 배경 제거, PDF 병합, 사진 PDF, 세금, 주소, 타자, 이메일)를 정적 JS로 구현했다. 기존 홈페이지 카드 디자인과 한국어 UI를 유지했다.
4. `pdf-lib` 1.17.1 및 `hangul-js` 0.2.6을 로컬 정적 파일로 고정했다. 출처·MIT 라이선스·SHA-256을 `assets/licenses/`와 `assets/vendor-hashes.json`에 기록했다. CDN fallback은 없다.
5. 홈페이지 로직을 `assets/app.js`로 분리했다. 잘못된 URI 해시가 예외를 일으키지 않게 했고 단위 변환 정밀도를 소수 8자리까지 확대했다. 코드포인트 글자 수의 의미를 UI에 표시했다.
6. CSP로 원격 연결과 폼 제출을 차단하고, 공식 서식 확인 및 수기 서명 안내·빈 원본 다운로드 링크를 추가했다.
7. README를 짧은 사이트 소개와 로컬 실행/테스트 안내로 교체했다.

## 테스트 환경과 증거

- Playwright 1.56.1, Chromium 141.0.7390.37, Firefox 142.0.1.
- 데스크톱 1280×720, 모바일 Chromium 375×812 (터치 에뮬레이션), 추가 시각 검토 1440×1000.
- `/kintheusa/`에서 주요 기능·공통 시나리오 54/54 PASS. 추가 클립보드/손상 이미지 테스트 6/6 PASS. 도메인 루트 `/`에서는 Chromium 20개 시나리오가 통과했다(19개 통과 후 메시지 정규식 수정 테스트 1개 재실행). 최종 `/kintheusa/` 통합 실행은 **60/60 PASS (51.9초)**다.
- `npm run check`: HTML 형식, JS 구문, 상대 링크/자산 존재, 빈 PDF 헤더, 로컬 라이브러리 해시, 불필요한 네트워크/저장 API 검사 PASS.
- 다운로드는 파일명만 확인하지 않고 `pdf-lib`, `jpeg-js`, `pngjs`로 파싱했다. PDF 페이지 수·용지 크기·순서, 이미지 실제 픽셀과 alpha를 확인했다.
- 여권/동의서의 독립 PDF 생성 및 Chromium 인쇄용 PDF 모두 A4·2/1페이지를 검증했다. PDF 내부 JPEG도 실제 디코딩했다.
- `scripts/visual-qa.cjs`로 생성 PDF를 `pdftoppm`에서 렌더한 후 직접 확인: 한글·주민번호 칸·체크 표시·신청/동의 날짜, 여권 뒷면, 동의서의 대리인 1/2, 서명 공간 확인. 기존 날짜 보정 유지.
- 스크린샷·가상 작성 PDF는 `.local-qa/visual/`에만 보관하며 Git에서 제외했다. CI는 테스트 trace/video/screenshot/다운로드 결과를 업로드하지 않는다. Playwright 다운로드는 임시 저장소를 사용한다.
- 첫 실행의 여권 테스트 실패는 2페이지 `.overlay` 선택자의 모호성으로 발생했고 첫 페이지 선택으로 수정했다. 추가 손상 이미지 테스트의 메시지 정규식도 두 안내 문구를 허용하도록 수정했다. 실패를 숨기거나 기능을 끄지 않았다.

## 16개 도구 결과

아래 PASS는 Chromium / Firefox / 모바일 Chromium에서 동일하게 검증한 결과다. 테스트 근거는 `tests/tools.spec.cjs`의 ID 및 테스트명이다.

| ID | 도구 | 결과 | 주요 검증 |
|---|---|---|---|
| 01 | 여권사진 크롭 | PASS | 업로드, 확대, 마우스 드래그/모바일 터치 이동, 한국 413×531 및 미국 600×600 실제 JPG 픽셀, 공식 적합성 자동 판정 아님 안내 |
| 02 | 한국 여권 신청서 | PASS | 이름·하이픈 주민번호·체크·두 날짜, 원본 오버레이, JSON 저장/복원, A4 PDF 2페이지, 인쇄 호출/인쇄 PDF, 날짜 좌표 및 수기 서명 안내 |
| 03 | 법정대리인 동의서 | PASS | 대리인 1/2 주민번호 자동 하이픈·이름·주소·관계, 동의 체크·날짜, JSON 저장/복원, A4 PDF 1페이지 및 인쇄, 날짜 좌표 유지 |
| 04 | 영사 서류 체크리스트 | PASS | 목적 변경, 체크/해제, 추가/삭제, 메모, 실제 TXT 내용, 인쇄 호출, 최신 공관 요구사항 별도 확인 안내 |
| 05 | 사진 배경 제거 | PASS | 가장자리 제거·클릭 영역·지우기/복원·undo, PNG alpha=0인 배경과 불투명 피사체 확인, 색상 기반 기능 안내 |
| 06 | 이미지 크기 변경 | PASS | PNG/JPG 입력, 비율 잠금/해제, 실제 60×30 출력 및 확장자, 6,000px 초과 오류 |
| 07 | PDF 합치기 | PASS | 합성 PDF 2개, 파일 순서 변경 및 결과 페이지 순서·개수, 실제 PDF 파싱, 손상/암호화 표시 PDF 오류, 로컬 라이브러리 사용, 로드된 탭의 네트워크 차단 후 병합 |
| 08 | 사진을 PDF로 | PASS | PNG/JPG 2개, 정렬/제거, A4 세로·Letter 가로, 여백 변경 및 오류, 실제 PDF 페이지 수·크기 |
| 09 | 한국·미국 시간 비교 | PASS | 서울·피닉스·LA·뉴욕 TZ 식별자, 겨울/여름 고정 시각, 피닉스 DST 미적용 |
| 10 | 미국 단위 변환기 | PASS | 화씨/섭씨, mi/km, lb/kg, in/cm, ft/m 양방향, 소수점, 빈 값 안내 |
| 11 | 날짜 차이 계산기 | PASS | 윤일 2일/양끝 포함 3일, DST 전후, 역순 -2일/포함 3일, 빈 값 및 브라우저가 거부한 날짜 |
| 12 | 미국 세금 계산 도우미 | PASS | 세전 팁 $123.50, 세후 팁 $124.78, 음수·소수 수량·빈 값 오류, 세금 신고 도구 아님 안내 |
| 13 | 글자수 세기 | PASS | 한글·영문·이모지, 공백 포함/제외·단어·줄, 결합 이모지 코드포인트 의미, 빈 입력 |
| 14 | 미국 주소 표기 도우미 | PASS | 구성요소·대문자, ZIP 경고, 복사 호출/실제 TXT, 공식 배송 가능 주소 검증 아님 안내 |
| 15 | 한영 타자 변환 | PASS | `dkssudgktpdy` ↔ `안녕하세요`, 혼합 문자열·공백·특수문자, 복사 |
| 16 | 영문 이메일 문구 | PASS | 3종 문구, 이름·일정·상세 반영, 직접 수정·복사/TXT, mailto 본문 인코딩, 자동 발송 없음 |

## 공통·개인정보 검증

- 정확히 16개 카드, 검색/카테고리/초기화/홈 복귀/새로고침, 모든 도구 및 서식의 가로 넘침 없음 확인. 콘솔 오류·404·외부 요청은 테스트 실패로 처리한다.
- 파일 업로드와 서식 입력, 다운로드 생성 중 원격 호스트 요청, POST, 요청 본문, URL query 전송이 관찰되지 않았다. 로컬 이미지/PDF 처리는 File/Blob/Canvas API만 사용한다.
- CSP: `connect-src 'none'`, `form-action 'none'`, `object-src 'none'`; 홈페이지 JS는 동일 출처만 허용. 기존 서식의 inline 코드만 호환을 위해 허용한다. 분석/추적 SDK 없음.
- localStorage/sessionStorage가 비어 있고, 서비스 워커 및 Cache Storage가 없음을 검사했다. 입력값·작성 PDF·사진 자동 저장 없음. 사용자가 직접 내려받는 파일은 본인 기기에 저장된다.
- 호스팅 서버는 정적 페이지/자산 요청을 받는다. 이 검증은 브라우저 앱이 사용자 파일·입력 내용을 업로드하지 않는다는 범위이며 호스팅 제공자의 일반 접속 로그 정책 검증은 아니다.
- 키보드 검색, input label, 주요 버튼 focus 스타일, 상태 메시지, 사진 대체 설명을 점검했다. 전체 WCAG 적합성 감사나 스크린리더 실기기 검증은 수행하지 않았다.

## PWA 준비와 미해결 범위

- **PWA-ready**: 상대 경로, 서버 API 없는 정적 처리, 로컬 라이브러리·라이선스·해시, 공개 배포 허용 목록, 기능별 스크립트 분리, 개인정보 저장 금지 구조 정리 완료.
- **미구현 / BLOCKED**: Manifest, 앱 아이콘, 서비스 워커, 오프라인 재실행, 캐시 버전 교체·업데이트 UI. 설치 가능한 PWA 출시로 보고하지 않는다.
- 네트워크 차단 후 PDF 병합은 **이미 라이브러리를 로드한 탭에서만 PASS**다. 오프라인 첫 접속 또는 새로고침은 지원하지 않는다.
- **NOT TESTED**: Android/iOS 실기기 설치, Safari, 실제 프린터 출력, OS 메일 앱의 실제 실행·발송, 전체 접근성, 수십~수백 MB 극한 부하. 메일은 자동 발송하지 않는다.
- 암호화 PDF 테스트는 합성 Encrypt 표시 문서의 거부를 검증했다. 다양한 실사용 암호화 알고리즘/손상 유형 전체를 검증한 것은 아니다.
- PDF 순서는 파일 단위로 변경한다. 개별 PDF 내부 페이지 재배열 UI는 현재 제공하지 않는다.
- 배경 제거는 색상/브러시 방식이며 최대 2,000px로 축소한다. PDF 입력은 파일당 50MB까지다. 사진과 서식의 공식 적합성·최신 법적 요건을 보증하지 않는다.
- 다음 단계는 `docs/PWA_ARCHITECTURE.md`의 Manifest/SW/안전한 업데이트 및 실기기 테스트다.

## 재현

```sh
npm ci
npx playwright install --with-deps chromium firefox
npm run check
npm test
npm run build
node scripts/serve.cjs
# 별도 터미널: 로컬 시각 검토 (poppler의 pdftoppm 필요)
node scripts/visual-qa.cjs
# 실제 배포 검증
BASE_URL=https://smurfinserver.github.io/kintheusa/ npx playwright test --project=chromium
```

배포 방식 참고: [GitHub 공식 custom Pages workflows 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
