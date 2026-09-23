# 사내 공통 개발 표준 검증

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

2026-09-08 · Asia/Seoul · 설치용 표준 정리

## 결과

기본 개발 계약과 선택형 관리 기능을 분리하고 원문 v3의 항목별 처리 위치를 기록했다. 새 설치용 표준·린트 설정 배치와 기존 파일 보존을 확인했다. 실제 회사의 관리 시스템이나 API/DB를 구현한 작업이 아니다.

| 요청 태그 / 기본 base | 선택된 표준 |
| --- | --- |
| code-change | engineering, glossary |
| schema-change | engineering, glossary, schema |
| api-change / error-contract | api, engineering, glossary |
| ui-change | design, ui-common, engineering, glossary |
| bulk-import | 활성 없음, import 비활성 후보. 실제 기능에 따라 AI가 internal-common 또는 필요한 계약 활성화 |
| status-only | 없음 |

internal-common 활성화 시 bulk-import는 import→audit→access/schema→engineering→glossary를 포함한다. internal-stack은 해당 프로필의 code/schema/api 작업에만 읽는다. 사내 배포를 이유로 일반 앱에 특정 DB·관리 화면을 생성하지 않는다.

## 확인한 변경

- 명명·용어는 base, DB 규칙은 schema, API 경로/DTO/응답/페이지/오류 코드는 api 원문이 소유한다. 기존 ENG-03~05는 schema로 이동해 중복 정의하지 않았다.
- 문구 자산과 API 오류 코드를 분리했다. 코드→기존 message ID 매핑은 소비 경계에서 확정하며 UI 문구를 표준에 다시 복제하지 않는다.
- 인증 수치·업로드 용량·보관기간·초기 코드와 관리 화면은 선택 PRD 후보로 남겼다. 원문0~19장 및 부록의 채택/보정/예시 제외는 standards/reference/common-v3-alignment.md에 연결했다.
- README·Altool 적용 절차·아키텍처·공통 기반 PRD·Plan/Spec을 실제 라우팅과 동기화했다. 헌법/원본 v3/디자인 팩은 수정하지 않았다.

## 실행

- `python3 -m unittest discover -s tests -p 'test_*.py' -q`: 133개 PASS. 신규5개는 기본 과업 범위, 선택형 스택, 용어/DB/오류 원천, 새 설치/린트 파일 보존, 용어/API 변경 후 증거 무효화를 확인한다. 기존 macOS 설치 회귀 포함.
- `ALTOOL_LINT_PEERS=/tmp/altool-standards-lint.ytxzJA node --test tests/*.cjs tests/test_company_runtime.mjs`: 137개 PASS, skip0. peer 경로는 이번 검증 임시 디렉터리이며 소비 프로젝트 설정값이 아니다.
- 실제 ESLint12사례: 정상 React/Props, Next 동적 폴더의 page.tsx, 모듈 상수, 정상 인터페이스, HTTP quoted key, 사유 있는 외부 키 단일 행 예외 통과. IUser, snake_case 변수/내부 객체 키, 지역 UPPER_CASE, PascalCase 파일, 동적 폴더 아래 잘못된 파일명은 지정 규칙으로 거부.
- 처음 선택한 ESLint9와 unicorn74의 peer 충돌은 강제 설치하지 않았다. 호환 조합 ESLint10.10.0 / typescript-eslint8.70.0 / unicorn74.0.0 / TypeScript5.9.3 / Node26.5.0으로 임시 경로에 install scripts 없이 설치해 재검증했다. 프로젝트 package.json/lockfile은 만들거나 변경하지 않았다.
- `standards.py validate --root .`, `assets.py validate`, `git diff --check`: PASS. 회사 UI 팩은 계속 `altool-company-ui@1.0.0-qa.8`,167개 ID다.

## 경계

문서·라우터·린트 설정 변경이며 UI 페이지 변경은 없어 새 브라우저 QA를 수행하지 않았다. Windows 실기기·임의 기존 ESLint/Node 조합·고객 API/DB 준수는 이번 통과 범위가 아니다. 실제 린트가 없는 환경의 테스트 skip을 PASS로 세지 않는다. 린트 배치만으로 소비 앱의 실행 연동이 완료되는 것은 아니며 AI가 기존 설정에 연결·검증해야 한다.

QA8 자산/브라우저 보고서는 당시 관측으로 보존했다. 이번 라우터·표준 변경 후 소비 프로젝트의 예전 표준 증거는 재검증해야 하며 hash만 교체하지 않는다. 기존 설치본의 자동 마이그레이션 및 git 커밋·푸시는 수행하지 않았다.
