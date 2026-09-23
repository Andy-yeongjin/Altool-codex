# 공통 용어

<a id="terms"></a>
## 단일 단어사전

- 필수 TERM-01: 같은 의미에는 아래 단어를 사용한다. AI는 새 업무 어휘를 이 표에 추가한 뒤 소비 계약을 동기화하며 임의 축약·한글 발음 영문 표기·동의어 혼용을 하지 않는다. 외부 API나 기존 회사 용어와 충돌하면 변환 경계 또는 공통 변경을 기록한다. 표는 DB 표기 기준이며 앱에서는 camelCase로 조합한다.

| 한글 | 사용값 | 한글 | 사용값 |
| --- | --- | --- | --- |
| 사용자 | user | 이력 | hist |
| 사번 | emp_no | 로그 | log |
| 부서/조직 | dept | 상태 | status |
| 역할 | role | 구분 | type |
| 권한 | auth | 순서 | seq |
| 메뉴 | menu | 사용여부 | use_yn |
| 코드 | code | 삭제여부 | del_yn |
| 그룹 | group | 등록자 | created_by |
| 상위 | parent | 수정자 | updated_by |
| 하위 | child | 비밀번호 | password |
| 이메일 | email | 연락처 | phone |
| 직위 | position | 관리자 | manager |
| 첨부파일 | attach | 제목 | title |
| 내용 | content | 비고 | remark |
| 시작 | start | 종료 | end |
| 기준 | base | 요청 | req |
| 승인 | approve | 반려 | reject |
| 일괄처리 | batch | 대상 | target |
| 건수 | cnt | 금액 | amt |
| 수량 | qty | 비율 | rate |

- 필수 TERM-02: usr/dpt/mng/mgr/cd/nm/dt 같은 미등록 축약을 추가하지 않는다. his_는 이력 테이블 접두어, hist는 이력 식별자 단어로 역할을 구분한다. 저장된 비밀번호 해시는 password_hash로 명시하며 password라는 원문 단어가 평문 저장을 허용하지 않는다.
