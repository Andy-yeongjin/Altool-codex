# 사내 공통 개발 표준 정리 Spec

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: 구현·로컬 검증 완료 · 2026-09-08

## 표준 적용

기존 constitution의 기본값/필수 계약 구분과 altool/standards.md의 선택·유지관리 절차를 따른다. 이 변경은 설치용 개발 표준이며 실제 회사 API/DB/UI를 구현하지 않는다. Plan은 `docs/01-plan/features/company-development-standards.plan.md`다.

| 계약 | 적용 | 검증 |
| --- | --- | --- |
| ENG-02/06 및 APP 규칙 | base engineering에서 앱 명명·코드 경계, 용어 의존 | 라우터·실제 ESLint fixture |
| ENG-03/04/05 및 DB 규칙 | base schema에서 스키마 작업만 선택 | 라우터·원문 이전 위치 회귀 |
| API 규칙 | base api에서 API 변경/검토·오류 계약 선택 | 라우터·응답/코드 문서 계약 회귀 |
| ACC/DATA/IMP | internal-common 유지; audit→schema 의존 | 비활성 및 전이 선택 회귀 |
| 제품 배포 보존 | standards 하위 린트 자원은 기존 재귀 설치 사용 | 신규 설치·기존 파일 보존 |

## 구조

- engineering.md는 naming/boundaries를 기본 선택한다. 기존 stack anchor는 internal-stack만 선택한다.
- glossary.md는 같은 의미의 이름을 고정하며 engineering의 의존으로 읽는다.
- schema.md는 DB 접두어·접미어 타입·FK/제약/인덱스 규칙을 소유한다. 데이터 수명·감사 구현은 data.md에 그대로 둔다.
- api.md는 신규 사내 JSON API의 경로·DTO·응답·페이지·오류 코드 계약을 소유한다. HTTP 성공/실패와 코드/사용자 문구 ID는 서로 다른 책임이다.
- standards/tooling의 ESLint flat-config 함수는 호출자가 설치한 typescript-eslint/unicorn을 받아 기존 구성에 합친다. 의존성 자동 설치·사용자 설정 교체·포괄적인 disable은 하지 않는다.
- standards/reference의 원문 대조표는 활성 규칙의 두 번째 원천이 아니다. 원문 0–19장/부록의 채택·수정·기능 이동·제외 근거를 기록한다.

## 검증 경계

Node/TypeScript 예시 린트의 식별자·파일명만 자동화한다. 단어 의미, 폴더, DB 매핑/DDL, API의 실제 응답·권한·감사 원자성은 도입 프로젝트에서 해당 테스트를 연결한다. 린트 성공을 전체 표준 준수로 표시하지 않는다. UI 및 QA8 팩 파일은 변경하지 않아 새 브라우저 QA 대상이 아니다.

실제 실행 결과는 [검증 보고서](../../03-analysis/features/company-development-standards.analysis.md)에 기록한다. 테스트용 peer 디렉터리를 지정해 실제 ESLint 회귀를 수행했고 일반 실행에서 peer가 없으면 해당 테스트가 명시적 skip을 보고하도록 했다.
