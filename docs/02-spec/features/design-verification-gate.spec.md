# 디자인 실측 게이트 명세

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: Implemented / Verified

## 계약과 소유권

- UI 태그(`ui-change`, `*-ui`) 또는 명시된 ui 증거/기존 계약이 있으면 spec/analyze/fix/browser 완료 검사에 적용한다. oneshot은 자식 검증으로 동일 계약을 확인한다. 비UI 작업은 자동으로 UI 구현을 요구하지 않는다.
- `.altool/ui/{feature}.contracts.json`: schemaVersion1, feature, sources(path/sha256), implementation 경로 목록, contracts 배열. Spec은 이 파일의 경로/hash를 고정한다. 각 계약은 source(원천 파일 경로), page(상대 route), state, selector, viewport와 기대값을 갖는다.
- Step Check `ui.contracts`는 path/sha256이다. `ui.measurements`도 같은 형식으로 실측 파일을 연결한다. `visual.ui_contracts`는 검증 상태다.
- 실측 파일은 schemaVersion1, feature, contractsSha256, implementationSha256, observations를 보유한다. 각 observation은 계약 ID별 viewport·실제 값·url·state를 갖는다. 구현 fingerprint는 명세의 파일/디렉터리를 재귀적으로 hash하여 추가·삭제·수정도 감지한다.
- text 모음은 expectedCount를 필수로 지정한다. 실측 완료 check의 runtime에는 url/source/identity를 기록하고 관찰의 origin이 일치해야 한다. Browser의 계약 hash는 Spec 소유 check에 고정된 값과 같아야 한다.
- Spec은 계약과 출처 검증만 필요하다. Analyze/Fix는 visual.ui_contracts=failed와 구체적 이유를 기록하면 미검증 갭으로 남길 수 있다. done을 주장하면 실측을 재비교한다. Browser는 누락/실패를 허용하지 않는다. Freedom의 browser 실행에도 동일 게이트를 적용한다.
- 비교 로직은 기존 ui-contracts 모듈 한 원천을 사용한다. 숫자 px, computed 문자열, SVG 축소 글자, 방향, 목록 위치를 검사한다. Node 미설치/실행 실패도 통과로 우회하지 않는다.

## 서버 주소

Analyze/Browser가 공유하는 절차에서 명시 요청 URL, 현재 프로젝트 서버 실행 로그/기록, Playwright baseURL/webServer.url, package 실행 옵션과 프레임워크 설정 순으로 근거를 수집한다. 고정 포트 목록·무차별 포트 스캔·다른 프로젝트 서버 재사용은 금지한다. 후보가 충돌하면 현재 프로세스 cwd/실행 명령으로 소유권을 확인하고 모호하면 확인을 요청한다. 응답 성공만으로 올바른 앱이라고 확정하지 않는다. 서버가 없으면 Analyze는 런타임 미검증을 남기고 Browser는 기존 수명주기 규칙으로 시작/정리한다.

## 검증

정상 실측, 21→25px 충돌, 색상 불일치, 숨긴/없는 요소, 잘못된 viewport/route/state, 계약/원천/구현 변경, 빠진 계약/관찰, API 전용 적용 제외, Analyze 실패 기록과 최종 완료 차단, oneshot 자식 전파를 자동 검사한다. 이번 변경은 UI 화면 자체를 바꾸지 않는다.
