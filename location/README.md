# KIN 위치 공유 — Android + 자체 호스팅

Android에서 사용자가 공유를 시작하면 `location` 유형의 foreground service가 지속 알림을 표시하면서 GPS/네트워크 위치를 본인 서버로 전송한다. 상대방은 읽기 전용 링크를 브라우저로 연다. 목적지와 자동차 도로 경로, 위치 정확도, 마지막 갱신 상태를 표시한다. 초기 지역은 미국 애리조나다.

## 구성

- `android/`: Java 기반 Android 앱, minSdk 26 / targetSdk 35. iPhone은 추후 아래 HTTP API를 그대로 사용한다.
- `server/`: Node 22 HTTP API와 Leaflet 1.9.4 로컬 웹 화면. 서버 의존 패키지 없음.
- OSRM 5.27.1: 애리조나 OSM 도로 데이터로 자동차 경로 계산. 대중교통·실시간 교통·음성 안내·차선 안내는 제공하지 않는다.
- 자체 호스팅 OSM 타일 서버: 지도 이미지를 생성한다. 브라우저/앱은 외부 지도 API로 좌표를 전송하지 않는다.
- GitHub Pages의 기존 파일/개인정보 처리 방식은 유지한다. `location/`은 기존 정적 배포 allowlist에 포함하지 않는다. 웹 화면은 중계 서버의 전용 HTTPS 도메인에서 제공한다.

## 현재 서버 준비

Ubuntu 24.04 및 Docker 확인. `location/.env`에 생성한 개인용 연결 키는 gitignore 대상이며 권한 0600이다. 앱의 연결 키 입력란에만 사용하고 공유 대상에게 전달하지 않는다. 현재 PUBLIC_ORIGIN은 로컬 검증용이다. 실제 HTTPS 도메인과 기존 프록시 경로가 확인되어야 외부 사용이 가능하다.

```sh
# 이미 준비된 데이터를 이용해 실행
cd location
docker compose -p kin-location up -d --build
# 로컬 상태 확인
curl http://127.0.0.1:8787/health
```

실제 연결 시 `.env`의 `PUBLIC_ORIGIN=https://전용도메인`을 설정하고 relay를 재생성한다. `deploy/nginx.example.conf`는 기존 HTTPS 프록시에 추가할 검토용 설정이다. 루트 `/`를 이 서비스에 연결하는 전용 호스트가 필요하다. 외부 프록시도 요청 URL/헤더/본문을 로깅하지 않도록 설정한다. DNS·인증서·방화벽을 자동 변경하지 않는다. 포트 8787은 `127.0.0.1`에만 바인딩하며 DB/OSRM/타일 서버는 외부 포트를 열지 않는다.

## 지도 데이터 최초 준비 / 재생성

공개 지리 데이터만 다운로드한다. 사용자 위치가 들어가는 작업이 아니다. 수 GB 이상의 여유 공간과 초기 import 시간이 필요하다. 데이터/DB는 공개 저장소에 넣지 않는다.

```sh
cd location
mkdir -p data/osrm
curl -fL https://download.geofabrik.de/north-america/us/arizona-latest.osm.pbf -o data/osrm/arizona-latest.osm.pbf
# 아래 명령은 이 디렉터리에서 실행
for step in extract partition customize; do
  if [ "$step" = extract ]; then
    docker run --rm --cpus=2 --memory=4g -v "$PWD/data/osrm:/data" ghcr.io/project-osrm/osrm-backend:v5.27.1 osrm-extract -t 2 -p /opt/car.lua /data/arizona-latest.osm.pbf
  else
    docker run --rm --cpus=2 --memory=4g -v "$PWD/data/osrm:/data" ghcr.io/project-osrm/osrm-backend:v5.27.1 "osrm-$step" -t 2 /data/arizona-latest.osrm
  fi
done
docker volume create kin-location-map-data
docker volume create kin-location-map-tiles
# 기존 DB가 있는 경우 덮어쓰기 전에 별도 볼륨으로 import/검증한다.
docker run --rm --cpus=2 --memory=5g --shm-size=256m -e THREADS=2 -e UPDATES=disabled \
  -v "$PWD/data/osrm/arizona-latest.osm.pbf:/data/region.osm.pbf:ro" \
  -v kin-location-map-data:/data/database/ -v kin-location-map-tiles:/data/tiles/ \
  overv/openstreetmap-tile-server:2.3.0 import
```

지도 데이터: [Geofabrik Arizona](https://download.geofabrik.de/north-america/us/arizona.html), © OpenStreetMap contributors, ODbL. 타일 생성은 openstreetmap-carto 스타일을 포함한 [Overv 이미지](https://github.com/Overv/openstreetmap-tile-server)를 사용한다. 지도 화면에 OSM 저작자 표시를 유지한다. 라이브러리 Leaflet의 BSD 라이선스는 `server/public/vendor/LICENSE`에 포함한다. 지도는 현재 내려받은 시점의 사본이며 애리조나 밖의 경로는 보장하지 않는다.

## Android APK

```sh
# 저장소 루트에서 실행
 docker build -t kin-location-android-build -f location/android/Dockerfile.build location/android
 docker run --rm -v "$PWD/location/android:/src" -v "$PWD/location/android/.android:/root/.android" kin-location-android-build
```

생성: `location/android/app/build/outputs/apk/debug/app-debug.apk`. 개발용 서명 APK이며 Play Store 출시본이 아니다. APK/서명 키/빌드 캐시를 커밋하지 않는다. Docker 빌드 이미지에 SDK 라이선스 수락 단계가 있다.

1. 휴대폰에 APK 설치 후 실제 HTTPS 주소와 연결 키 입력.
2. 위치 권한 허용(정확한 위치 권장), 알림 권한 선택.
3. 앱이 화면에 보이는 상태에서 ‘1시간 위치 공유 시작’.
4. ‘공유 링크 보내기’로 상대방에게 읽기 전용 링크 전달.
5. ‘지도 · 목적지 지정’으로 관리 화면을 열고 지도에서 목적지 선택. 이 관리 URL에는 소유자 권한이 들어 있으므로 공유하지 않는다.
6. 앱 알림/앱/관리 화면에서 공유 종료. 오프라인 종료는 서버 확인 전까지 대기로 표시된다.

위치 서비스는 사용자가 앱을 보고 있을 때 시작하며 별도 백그라운드 자동 시작·부팅 재시작·숨겨진 추적은 하지 않는다. ACCESS_BACKGROUND_LOCATION 없이 사용자 시작 location foreground service로 실행한다. Android의 일반 홈 화면 전환/화면 잠금에서 계속 실행되도록 구현했으나, 실기기 화면 잠금·Doze·제조사 절전 검증은 아직 필요하다. 강제 종료/재부팅/권한 해제/네트워크 단절 상태에서는 지속 전송을 보장하지 않는다. 기존 공유가 있는 상태에서 시작 버튼을 누르면 연결을 재개한다. GPS 업데이트 목표는 5초/5m이고 전송은 5초 주기지만 실제 OS/GPS 상태에 따라 달라진다.

## API v1 (iPhone 공통 계약)

요청은 HTTPS JSON, 인증은 `Authorization: Bearer <token>`. 좌표는 WGS84의 `lat`, `lon`, 시간은 Unix milliseconds. 인증 토큰을 쿼리 문자열로 받지 않는다.

| 요청 | 권한 | 동작 |
|---|---|---|
| POST `/api/sessions` `{ttlSeconds:3600}` | 서버 연결 키 | 256비트 무작위 id/owner/viewer, 만료시각, viewer URL 생성 |
| GET `/api/sessions/:id` | owner 또는 viewer | 최신 position/destination/route/expires/serverTime |
| PUT `/api/sessions/:id/position` `{lat,lon,accuracy,timestamp}` | owner | 유효한 최신 위치만 덮어쓰기 |
| PUT `/api/sessions/:id/destination` `{lat,lon}` 또는 `null` | owner | 목적지 지정/해제, 경로 재계산 |
| DELETE `/api/sessions/:id` | owner | 즉시 세션 삭제, 이후 토큰 사용 불가 |

전송 이력은 보관하지 않는다. 세션 데이터는 서버 메모리에만 있고 재시작하면 모두 종료된다. 앱은 개인용 연결 키를 저장하지 않고 세션 소유자 토큰만 앱 전용 저장소에 보관한다(백업 비활성화). 서버는 토큰 해시만 보관한다. 자동 만료는 기본 1시간, API 상한 24시간, 최대 동시 50세션이다. 조회는 약 3초 주기이며 온라인 viewer는 다음 조회에서 종료를 반영한다. 서버 연결 실패 시 화면의 위치/경로를 숨긴다. 이미 촬영/저장된 화면까지 회수할 수는 없다.

Map/OSRM/relay의 컨테이너 로그와 타일 HTTP 접근 로그를 비활성화했다. 실제 HTTPS 프록시도 같은 설정이 필요하다. 위치/링크/응답을 analytics, service worker, Cache Storage, 웹 localStorage에 저장하지 않는다. 모든 API 응답은 no-store. 사용자에게 보여 줄 개인정보 안내는 **위치 공유를 선택한 경우 본인 서버와 링크 수신자에게 위치를 전달한다**는 내용으로 기존 로컬 도구와 구분한다.

## 검증

```sh
node --test location/tests/relay.test.mjs location/tests/browser.test.mjs
npm run check
npm test
```

실기기 필수: 위치 허용/거부/대략적 위치, 알림 거부, 화면 잠금 15분, 다른 앱 전환, GPS 중단, 네트워크 복구, 오프라인 종료, 강제 종료 후 만료, 다른 휴대폰 브라우저, 실제 HTTPS 접근. 현재 자동 테스트는 가상의 피닉스 좌표만 사용한다.
