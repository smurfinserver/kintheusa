# KIN THE USA

미국에 사는 한국인을 위한 16가지 무료 생활 도구입니다.
여권 서식 작성, 사진 편집, PDF 병합, 단위·날짜 계산, 한영 타자 변환 등을 제공합니다.

배포 예정 주소: https://smurfinserver.github.io/kintheusa/ (현재 배포 설정 대기)

사진과 문서, 입력한 개인정보는 브라우저 안에서 처리합니다. 정부 공식 서비스가 아니므로 서류 제출 전 최신 공식 안내를 확인해 주세요.

로컬 실행: `npm ci && npm run build` 후 `node scripts/serve.cjs` → http://127.0.0.1:4173/kintheusa/

테스트: `npx playwright install chromium firefox` 후 `npm run check && npm test`.
