# DB 설계·명명

<a id="naming"></a>
## 이름과 매핑

- 필수 ENG-03: DB 테이블·컬럼은 소문자 snake_case, 앱/ORM 필드는 camelCase로 두고 변환은 ORM 매핑 경계에서 정의한다. ORM이 없으면 단일 데이터 접근 어댑터가 경계를 소유한다. DB 불리언은 _yn, 앱 대응 값은 Yn을 유지한다.
- 필수 ENG-04: sys_(마스터), map_(매핑), log_(로그), his_(이력), biz_(업무), tmp_(임시·작업용)와 단수 테이블명을 사용한다. tmp_는 data.md DATA-01의 별도 수명 정책 대상이며 영속 업무 데이터를 임시로 위장하지 않는다. 업무 코드는 _code, 시스템 생성 식별자는 _id다. ADMIN 같은 역할 값은 role_code로 정의한다.
- 필수 DB-01: FK는 참조 PK 이름과 타입을 유지하고 같은 대상을 여러 번 참조할 때 manager_emp_no처럼 역할 수식어를 붙인다. 제약·인덱스는 pk_{table}, fk_{child}_{parent}, uk_{table}_{column}, ix_{table}_{purpose}, ck_{table}_{column}으로 구분하며 복수 관계의 충돌은 역할명을 추가한다.
- 기본값 DB-02: 테이블·컬럼은 30자 이내로 짓고 DB 한계를 넘으면 식별 가능한 단축 규칙을 스키마 한 곳에 기록한다. SQL 예약어 단독 사용, tb_/t_ 접두어, 중복 이름, field1 같은 무의미 컬럼, 쉼표 문자열 다중값을 피한다. EAV나 의미를 인코딩한 식별자를 기본 설계로 만들지 않고 필요한 경우 제약·검색·변경 비용을 ADR로 검토한다.

<a id="domains"></a>
## 도메인 타입

- 기본값 ENG-05: 아래는 PostgreSQL 출발값이며 다른 DB에 자동 전환을 요구하지 않는다. 같은 도메인의 길이·단위·정밀도는 확정 스키마 한 곳에 정의하고 참조에도 동일 적용한다. 금액 통화·비율 범위 등 업무 단위를 Spec에서 확정한다.

| 접미어 | 기본 타입 |
| --- | --- |
| _id | UUID 또는 시스템 생성 정수 |
| _code / _no / _type / _status | VARCHAR(20) |
| _name | VARCHAR(100) |
| _desc / _url | VARCHAR(200) |
| _content | TEXT |
| _yn | BOOLEAN |
| _at | TIMESTAMPTZ |
| _date | DATE |
| _cnt / _seq / _level | INT |
| _amt | DECIMAL(18,2) |
| _qty | DECIMAL(15,3) |
| _rate | DECIMAL(5,2) |
| _path | VARCHAR(300) |
| _json | JSONB |
| _ip | VARCHAR(45) |

번호의 앞자리 0을 보존하며 weight_kg 같은 단위를 이름 또는 명시적 도메인 계약으로 드러낸다. 시각·날짜 경계는 헌법을 따른다.

<a id="validation"></a>
## 검증과 수명 경계

- 필수 DB-03: 매핑 누락, 참조 타입·길이, 제약 이름/충돌, null·유일성·조회 인덱스를 실제 스키마/마이그레이션 검사로 확인한다. 명명 문서나 파일 존재만으로 완료하지 않는다.
- 마스터 공통 컬럼·논리삭제·감사·소속 스냅샷은 선택한 data.md 계약을 따른다. 사내 관리 기반이 아닌 DB에 11개 관리 테이블을 자동 추가하지 않는다. 기존 DB 이름 변경은 별도 호환 마이그레이션이다.
