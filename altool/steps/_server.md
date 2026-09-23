# 검증 서버 주소·생명주기 — Run/Analyze/Browser 공통 절차

독립 명령이 아니라 호출 step의 보조 절차다. 결과는 `_common.md`의 해당 step Step Check에 기록한다.

고정 포트 목록이나 무차별 포트 스캔 대신 다음 근거에서 현재 프로젝트 URL을 찾는다.

1. 현재 요청에 명시된 검증 URL.
2. 현재 프로젝트의 실행 중 터미널 출력·서버 기록(PID, cwd, 명령, URL).
3. 프로젝트 Playwright의 `use.baseURL`/`webServer.url`, package 실행 옵션, 프레임워크 host/port 설정. 설정을 실행하거나 `.env` 전체를 출력하지 않고 주소 관련 값만 읽는다. 환경 변수 참조는 실제 실행 로그/설정에서 해석한다.

- 후보가 충돌하면 PID의 cwd·명령과 앱의 대표 경로·제목/내용으로 소유권을 확인한다. 다른 프로젝트 서버는 재사용하지 않는다. 해결할 수 없으면 URL을 확인 요청한다.
- 선택 URL의 응답과 실제 브라우저의 앱 정체성을 확인하고 `runtime.url`, 주소 출처·소유권 근거를 Step Check `verification` 및 보고서에 기록한다. HTTP 200만으로 UI 검증 완료라고 하지 않는다.
- 서버가 없으면 Analyze는 직접 시작하지 않고 L1~L3 미검증과 프로젝트 실행 명령을 기록한다. UI 실측이 없으면 `visual.ui_contracts=failed` 갭이며 디자인 일치로 계산하지 않는다.
- Run과 Browser는 검증에 서버가 필요하고 실행 스크립트가 있으면 시작할 수 있다. 시작 로그의 최종 URL을 사용하고 포트 변경 시 테스트 baseURL도 맞춘다. Run의 사전 검증은 최종 Browser 단계를 대체하지 않는다.

## 서버 시작·정리

- 직접 또는 테스트 러너의 `webServer`로 시작한 서버는 호출 step 소유(`managedServer=true`)다. PID·cwd·명령·포트·시작 시각을 기록한다. 기존 프로젝트 서버를 재사용하면 `managedServer=false`이며 종료하지 않는다.
- Windows는 `npm.cmd` 또는 프로젝트 로컬 `.cmd` 실행 파일을 사용한다. PowerShell shim으로 해석될 수 있는 bare npm/npx/next를 서버 명령에 사용하지 않는다. POSIX는 프로젝트 실행 스크립트/로컬 실행 파일을 사용한다.
- 시작 후 HTTP 응답과 앱 정체성을 확인한다. 시작할 수 없으면 필요한 런타임/UI 검증을 실패로 기록하며 완료를 주장하지 않는다.
- 성공·실패·중단 여부와 관계없이 호출 step 종료 전에 자신이 시작한 PID와 그 하위 프로세스만 종료한다. Windows는 기록한 PID에 `Stop-Process`, POSIX는 `TERM` 후 필요할 때만 제한적으로 `KILL`을 사용한다. 포트에 있는 임의 프로세스를 종료하지 않는다.
- 종료 후 기록한 프로세스 종료와 URL/포트 상태를 확인하고 `server.cleanup`에 증거를 남긴다. 기존 서버는 `skipped(existing server)`, 서버가 필요 없으면 `skipped(no server needed)`와 근거를 기록한다. 정리 실패는 `failed`와 남은 PID/포트를 기록하며 완료로 숨기지 않는다.
