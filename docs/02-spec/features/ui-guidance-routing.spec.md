# UI 지침·자산 라우팅 확장 Spec

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: 구현 완료 — 자동 회귀·설치 확인, 모델 완주/전수 UI 검증은 범위 밖

## 계약

- 라우터 v1 항목에 선택적 `asset_kinds`, `asset_ids`를 추가한다. 기존 항목은 호환한다. 후보는 강제 사용 목록이 아니며 실제 선택은 사용 기록에 둔다.
- `standards.py resolve/read`는 선택 원문과 `asset_routes`를 반환한다. `read`는 작업별 회사 지침 원문을 읽는다. 종류/ID 오류는 검증 실패다.
- 회사 팩의 `guidance`는 회사 적용 Markdown의 경로/anchor와 참고 MD를 분리한다. 선택 자산의 constraints·변형 states와 회사 지침 항목을 검증 요구로 연결한다. `assets.py read`는 선택 회사 지침만 출력하고 참고 원문은 자동 로드하지 않는다.
- 사용 JSON에 `routing`(standards resolve 결과), `requirementsSha256`, `checks`를 추가한다. `requirements --usage`는 필요한 검증 항목을 출력하며 성공 증거를 생성하지 않는다.
- 모든 요구 ID를 정확히 한 번 기록한다. passed는 실제 관찰/명령 설명과 현재 검증 파일 hash를, not-applicable은 범위·이유와 근거 파일을 요구한다. failed/pending/누락은 완료 실패다. 예외 승인은 N/A로 우회하지 않는다.
- requirements에는 소비 파일 hash도 포함한다. 구현·회사 지침·표준·검증 파일 변경 시 이전 증거는 실패한다. UI Step Check의 standards와 사용 기록 routing도 일치해야 한다. oneshot 자식은 기존 공통 검사로 동일 검증한다.

## 한계 및 검증

자동 검사는 탐색/증거 정합성이지 모델이 원문을 이해했는지의 증명은 아니다. 태그/자산/변경 UI 누락과 N/A 타당성은 Analyze에서 PRD·git diff·실제 화면으로 독립 대조한다. 앱 배치·키보드·반응형은 해당 앱의 브라우저 증거로 증명한다. 회사 적용 지침 기본값은 KRDS 인증을 뜻하지 않는다.

정상 라우팅, 비관련 제외, 모든 자산의 회사/참고 연결, 오타/앵커/지침 변경, 누락/중복/pending/N/A 근거 부재, 소비/관찰 파일 변경, 부모/자식 게이트 및 신규 설치/기존 보존을 회귀 검증한다.

## 검증 결과 (2026-09-08)

- `python3 -m unittest discover -s tests -p 'test_*.py' -q`: 121 PASS. 새 회귀13개는 `tests/test_ui_guidance_routing.py`; 기존 회사 자산 fixture 및 라우터 선택 기대값도 새 계약에 맞췄다.
- `node --test tests/*.cjs tests/test_company_runtime.mjs`: 80 PASS. 자산 런타임·컴포넌트/패턴·프로젝트 준비 도구 동작 회귀.
- macOS 실제 신규 설치 후 login-ui 라우팅과 설치된 컴포넌트의 회사 지침/KRDS 참고 경로 확인. 기존 라우터는 바이트를 유지하고 새 연결 필요 안내를 출력함.
- 실제 check.py CLI의 정상 UI 증거 PASS/라우팅 불일치 FAIL, oneshot 자식 pending FAIL을 확인했다. 테스트용 관찰은 합성 fixture이며 실제 앱 브라우저 통과로 사용하지 않는다.
- standards/assets validate, 동일 QA7 재생성 멱등성, `bash -n setup.command`, `git diff --check` PASS.
- 기존 데모 사용 기록은 QA6 증거로 보존한다. 이번 변경으로 새 앱이나 UI 코드를 만들지 않았으며 해당 기록을 QA7 지침 준수로 갱신하지 않았다. Windows 호스트 실행·모델 완주·기존 전수 UI QA 잔여는 미수행이다.
