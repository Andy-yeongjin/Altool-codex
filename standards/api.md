# 사내 API·오류 계약

<a id="interface"></a>
## 경로·DTO·응답

- 필수 API-01: 신규 사내 JSON API 리소스는 소문자 kebab-case·단수 명사, JSON/쿼리 키는 camelCase로 통일한다. CRUD 외 동작만 reset-password/unlock처럼 하위 동사 경로를 허용한다. 2단계를 넘는 중첩은 필요성을 Spec에 기록한다. 기존/외부 API 계약은 임의 개명하지 않고 어댑터에서 연결한다.
- 필수 API-02: DTO는 UserListItem/UserDetail/UserCreateInput/UserUpdateInput/UserSearchParams처럼 용도로 나누고 ORM 모델과 구분한다. 입력 허용 필드만 수용하며 password_hash·내부 진단·민감 상태를 응답에 노출하지 않는다.
- 필수 API-03: 성공은 `{success:true,data:값,message:null}`, 실패는 `{success:false,data:null,message:안전한안내,code:등록코드}`로 통일한다. 적절한 HTTP 상태도 함께 사용하고 실패를 HTTP 200으로 감추지 않는다. 파일/스트림/204 응답에는 JSON 포장을 강제하지 않고 Spec에 응답 종류를 명시한다.
- 기본값 API-04: 목록 data는 `{content:[],page:1,size:50,totalCount:0}`이며 page는 1부터다. 쿼리는 page/size/sort/keyword, sort는 `field,asc|desc`다. 허용 정렬 필드·최대 size·입력 오류 처리는 서버에서 검증하며 안정적인 보조 정렬을 지정한다.
- 검증: 성공/실패/빈 목록의 실제 응답·HTTP 상태·페이지 경계·허용되지 않은 입력/정렬을 계약 테스트로 확인한다. 보안·권한은 헌법 및 활성 access.md를 함께 따른다.

<a id="errors"></a>
## 공통 오류 코드

- 필수 API-05: 같은 실패 의미에는 아래 동일 코드를 재사용한다. 기능별 신규 코드는 이 표에 의미·사용 범위를 등록한 뒤 쓴다. 이미 공개된 코드 의미를 변경하거나 번호만 바꿔 중복 등록하지 않는다.

| 대역 | 의미 | 기본 등록 코드 |
| --- | --- | --- |
| E1xxx | 인증 | E1001 로그인 실패, E1002 계정 잠김, E1003 세션 만료 |
| E2xxx | 권한 | E2001 작업 권한 없음, E2002 데이터 범위 초과 |
| E3xxx | 입력 검증 | E3001 필수값 누락, E3002 형식 오류 |
| E4xxx | 일괄 입력 | E4001 헤더 불일치, E4002 참조 무결성, E4003 중복 |
| E5xxx | 업무 규칙 | 기능 계약에서 등록 |
| E9xxx | 시스템 | 기능 계약에서 등록 |

- 필수 API-06: 오류 코드는 기계 계약, 사용자 문구는 회사 자산의 message ID다. UI 구현 시 api.md와 자산 registry를 읽고 API code→기존 message ID(없으면 공통 등록)의 매핑을 Spec/소비 어댑터에 한 곳으로 정한다. 코드명을 사용자 문구로 표시하거나 페이지마다 같은 오류 문구를 새로 만들지 않는다. 이 표 자체는 message 자산의 두 번째 원천이 아니다.
- 계정 존재·잠금 등 민감 상태 노출 여부는 인증 Spec에서 결정한다. 공개 안내를 일반화해야 하면 코드도 일반화하고 상세 원인은 안전한 서버 진단으로 분리한다. 등록된 모든 오류를 외부에 노출하라는 뜻이 아니다.
- 검증: 같은 실패의 코드/문구 매핑, 미등록 코드, 내부 예외·비밀정보 노출을 API 및 UI 경계에서 확인한다.
