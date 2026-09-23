# 공통영역 v3 채택 대조표

2026-09-08. 제공 원문 `공통영역_개발표준_v3.md`는 변경 없이 보존한다. 이 표는 추적용이며 라우터의 활성 규칙을 대체하지 않는다. 원문 전체 복제·매 세션 강제 로딩 대신 다음 원천에서 해당 항목을 읽는다.

| 원문 | 처리 | 현재 원천/경계 |
| --- | --- | --- |
| 0 사용법 | 대체 | altool/standards.md의 작업 태그→원문→Spec→검증. 루트 SPEC.md/수동 순차 프롬프트 강제는 채택하지 않음 |
| 1 목적/전제/범위 | 기능 PRD | templates/prd/common-platform.md. 사내 배포가 모든 앱에 11개 관리 테이블을 요구하지 않음 |
| 1.3 기술 스택 | 기본값 | engineering.md#stack, internal-stack. 일반 신규 앱의 기본은 헌법; 버전·도구는 도입 시 결정 |
| 2 네 가지 원칙 | 분리/보정 | 명명→engineering/schema/glossary, 감사/수명→data, 일괄 입력→import. 세션/임시물까지 물리삭제 금지로 확대하지 않음 |
| 3 공통 명명 | 채택 | engineering.md#naming, glossary.md#terms, schema.md#naming. 외부 키/다른 언어의 합법적 경계는 보존 |
| 4 DB 명명 | 채택/보정 | schema.md의 접두어·FK·제약/인덱스·도메인 타입, data.md의 공통 컬럼. TIMESTAMP→시간대 있는 시각, 길이는 단일 도메인 기본값. EAV 일률 금지 대신 필요성 ADR |
| 5 앱 명명 | 채택/압축 | engineering.md APP-01~06. 파일 접미어·동사·React·Git 포함. 기존 공개 계약/예약 파일은 무단 개명하지 않음 |
| 6 ESLint | 실행 자원 | standards/tooling/eslint-company.mjs + README. 실제 lint 통합은 소비 앱에서; ORM/폴더/의미 검증은 별도 |
| 7 테이블 목록 | 기능 PRD | common-platform.md의 11개 엔티티 입력 |
| 8 테이블 정의 | 설계 입력/보정 | PRD 핵심 관계 + schema/data. role_id 문자열→role_code, password→password_hash, parent_dept_code, 범용 ref_value1/2 제외. 완성 DDL로 배포하지 않음 |
| 9 DDL 예시 | 예시 미복제 | 도입 DB·ORM·순환 FK·유일성 정책에 맞춰 Spec/마이그레이션 작성·검증 |
| 10 인증 | 경계+기능 후보 | access.md 인증 경계, PRD의 8시간/5회 등 후보. 비밀번호 세부 정책·세션/CSRF는 인증 Spec에서 확정 |
| 11 권한 | 채택/보정 | access.md + PRD 역할/범위. HTTP 메서드만으로 권한 결정하지 않고 작업/대상/내보내기까지 검사 |
| 12 변경이력 | 채택/보정 | data.md. ORM extension 자체가 아닌 누락 없는 공통 경계·동일 트랜잭션이 필수. 3년/파티셔닝은 PRD 후보 |
| 13 엑셀 엔진 | 채택/보정 | import.md + PRD. 엔진/서버 정의·검증·전건 커밋·배치 감사. raw:false로 이미 유실된 0 복구 불가, 서버 재검증/재전송/수식 방어 추가 |
| 14 화면 | 기능 PRD | common-platform.md의 관리 화면/마이페이지. 상품에 실인증·조직 관리 앱을 선구현하지 않음 |
| 15 공통 컴포넌트 | 기능+자산 구분 | PRD의 업무 컴포넌트 후보. 기본 UI는 회사 registry를 재사용하고 조직조회·업로드 저장 등의 업무 연결은 기능 구현 |
| 16 API | 채택/보정 | api.md. 응답/페이지/DTO/오류 코드 기본 계약, 비CRUD 동사 예외·HTTP 상태·외부 계약·민감 안내 경계 포함 |
| 17 구현 순서 | 기능 의존 | PRD의 의존 순서. 인증 전 업로드 엔진 테스트 가능하나 공개 API는 인증/권한 후 연결 |
| 18 프롬프트 | 대체 | 기능별 Altool Plan/Spec/Run/Analyze/Browser 절차. 수동 7개 프롬프트 복제 안 함 |
| 19 완료 체크 | 분산 채택 | engineering/schema/api/access/data/import의 검증 + PRD 인수 조건. lint/라우터 통과만으로 업무 준수 주장 안 함 |
| 부록 A 단어사전 | 채택 | glossary.md. his_ 접두어/hist 단어와 허용/금지 축약 구분 |
| 부록 B 코드 초기값 | 기능 후보 | common-platform.md의 초기 코드 그룹. BOOLEAN 저장과 Y/N 표시를 구분, 실제 seed는 기능 Spec |
| 부록 C 참고 | 출처 보존 | 원문 보존 + tooling/README의 실제 ESLint 공식 구성 링크. 참고문서 자체를 활성 규칙으로 승격하지 않음 |

원문에서 의미 없는 축약을 금지하면서 등재한 dept/req/cnt 등은 사전 등록 예외로 통일한다. API 동사 금지와 reset-password 예시는 비CRUD 동작 예외로 통일한다. 고정 수치 후보를 모든 고객·앱의 보안/용량/보관 정책으로 확정하지 않는다.

## Round 3 세부 대조 보완 — 2026-09-10

- 3.4: 보정 채택. engineering.md#naming의 APP-02 문맥에서 의미 없는 일반 명사를 구체화한다. api.md API-03의 data 등 승인 계약까지 단어 단위로 금지하는 부분은 비채택이다.
- 4.2: 채택. schema.md ENG-04의 tmp_는 임시·작업용이며 data.md DATA-01의 별도 수명 정책과 연결한다. 영속 업무 데이터의 삭제 정책 우회는 허용하지 않는다.
- 12.2: 채택. data.md#audit DATA-05에서 log_audit 계열의 수정·삭제 경로 미제공과 보관 종료 승인 경계를 명시한다. log_login까지의 확대는 원문 근거가 없어 채택하지 않는다.
- 13.6: 기능 PRD 후보로 채택. templates/prd/common-platform.md의 작성요령 시트에 공통코드→조직→역할→사용자→메뉴→역할별권한과 선행 생성 경로를 안내한다. 모든 앱의 표준 업로드 순서로 강제하지 않는다.
