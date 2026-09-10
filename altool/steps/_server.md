# 검증 서버 주소 — Analyze/Browser 공통 절차

독립 명령이 아니라 호출 step의 보조 절차다. 결과는 `_common.md`의 해당 step Step Check에 기록한다.

고정 포트 목록이나 무차별 포트 스캔 대신 다음 근거에서 현재 프로젝트 URL을 찾는다.

1. 현재 요청에 명시된 검증 URL.
2. 현재 프로젝트의 실행 중 터미널 출력·서버 기록(PID, cwd, 명령, URL).
3. 프로젝트 Playwright의 `use.baseURL`/`webServer.url`, package 실행 옵션, 프레임워크 host/port 설정. 설정을 실행하거나 `.env` 전체를 출력하지 않고 주소 관련 값만 읽는다. 환경 변수 참조는 실제 실행 로그/설정에서 해석한다.

- 후보가 충돌하면 PID의 cwd·명령과 앱의 대표 경로·제목/내용으로 소유권을 확인한다. 다른 프로젝트 서버는 재사용하지 않는다. 해결할 수 없으면 URL을 확인 요청한다.
- 선택 URL의 응답과 실제 브라우저의 앱 정체성을 확인하고 `runtime.url`, 주소 출처·소유권 근거를 Step Check `verification` 및 보고서에 기록한다. HTTP 200만으로 UI 검증 완료라고 하지 않는다.
- 서버가 없으면 Analyze는 직접 시작하지 않고 L1~L3 미검증과 프로젝트 실행 명령을 기록한다. UI 실측이 없으면 `visual.ui_contracts=failed` 갭이며 디자인 일치로 계산하지 않는다.
- Browser는 자기 step의 서버 시작·정리 규칙을 따른다. 시작 로그의 최종 URL을 사용하고 포트 변경 시 테스트 baseURL도 맞춘다. 기존 서버는 종료하지 않는다.
