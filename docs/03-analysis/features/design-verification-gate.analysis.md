# 디자인 실측 게이트·고정 포트 수정 검증

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: Verified — 설치 원본의 검증 흐름 변경

## 변경

- `check.py validate`와 oneshot 자식 검사에 `ui_gate.py`를 연결했다. Spec은 출처/hash·기대값·대상을 확인하고, Browser는 원시 관찰을 `ui-measurements.mjs`로 재비교한다. 비교 로직은 기존 `standards/tooling/ui-contracts.mjs`를 함께 사용한다.
- UI 태그, 선택 UI 표준, 명시 ui 증거, 기존 기능 계약으로 적용을 판단한다. 비UI에는 화면 구현을 요구하지 않는다. Analyze/Fix는 failed+이유로 갭을 기록할 수 있지만 최종 Browser는 미검증/실패를 허용하지 않는다.
- 계약/원천 hash·Spec 소유 계약·구현 fingerprint가 달라지면 기존 관찰을 거부한다. 실측 대상 ID·페이지/상태·viewport·개수·값을 검사하며 저장된 valid:true는 신뢰하지 않는다.
- 문자열 computed style도 지원해 색상·둥글기 등 디자인 값을 재비교한다. 숫자는 기존0.5px 허용 오차, 문자열은 실제 computed 표현과 정확히 비교한다.
- Analyze의3000 고정 주소와 Browser의3000/3001 후보를 제거했다. `_server.md`는 명시 URL→현재 프로젝트 실행 로그/기록→Playwright/package/프레임워크 설정을 확인하고 프로세스 cwd·앱 내용으로 소유권을 확인하도록 한다. 자동 포트 스캐너를 추가하지 않았다. 실제 runtime origin과 관찰 origin도 검사한다.
- Spec/Analyze/Fix/Browser/oneshot/Freedom 절차, Spec/Analyze/Browser 템플릿, 공통 표준 절차·tooling README·제품 README를 동기화했다. 헌법/AGENTS와 회사 팩은 이번 작업에서 수정하지 않았다.

## 검증

- 전체 Python: `.venv/bin/python -m unittest discover -s tests -p 'test_*.py'` **155/155 PASS**.
- 전체 Node: `ALTOOL_LINT_PEERS=/Users/andy/Desktop/project/altool-test node --test tests/test_*.cjs tests/test_*.mjs` **150/150 PASS**, skip0.

- 신규 Python17개: 실제 CLI 정상 통과 및 valid:true+fontSize25 거부, 숫자/색상/viewport/route/state/origin 오류, 숨김·누락·중복, 원천/구현/계약 변경, Spec owner 일치, Node 부재, 경로 이탈, Analyze/Fix 갭 허용·Browser 차단, oneshot 연결, 대소문자/잘못된 Freedom 생략 이유를 통한 우회 방지.
- Node 비교 회귀: 문자열 computed style과 text expectedCount를 추가 검사했다.
- 설치 회귀: 임시 설치본에 Python/Node 모듈이 배포되고 Node 비교 명령이 실행됨을 검증했다. 빈 계약은 실패한다.
- 절차 회귀: 공통 서버 절차 연결과 고정 주소 제거, 모든 관련 단계의 실측 계약 연결을 검사했다.
- 첫 전체 Python 검사에서 새 보조 절차의 `_common.md` 연결 누락을 발견해 호출 step의 Step Check에 기록한다는 책임을 명시했다. 검사 예외를 추가하지 않았다.
- standards router·회사 팩 QA9 무결성·skill sync·git diff --check PASS.

## 적용 경계

테스트의 원시 관찰은 실패 주입용 합성 데이터다. 이번 작업에서 대시보드 화면을 다시 작성하거나 전체 브라우저 검증을 재실행한 것은 아니다. 기존 altool-test 앱/엔진·251개 자산 pending·3100 서버는 변경하지 않았다. 설치 원본의 최신 게이트는 다음 설치/워크플로 실행에서 적용된다.

검사기는 수집된 데이터와 계약의 일치를 검사한다. 관찰이 실제 브라우저에서 수집됐는지, AI가 모든 필요한 계약을 선택했는지, 각 출처 문장의 의미와 기대값이 맞는지까지 자동 증명하지 않는다. 독립 Analyze와 실제 인앱 조작·스크린샷 대조를 계속 수행해야 한다. 서버 주소 선택도 에이전트가 실행하는 공통 절차이며 HTTP 응답만으로 앱을 인증하지 않는다.

커밋·푸시하지 않았다. 기존 작업 트리 변경을 보존했다.
