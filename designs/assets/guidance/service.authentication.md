# 로그인·인증·세션 — 회사 적용 지침

Altool 기본 회사 계약. 기존 Altool 작성 적용 체크리스트에서 채택한 기본 지침이며 KRDS 인증이나 원문 전체 채택이 아니다. 회사 도입 전 조정 후 자산과 함께 버전 배포한다. 기능/상태에 해당하는 조건만 적용하고 없는 기능을 추가하지 않는다. 상충하는 회사 필수 계약은 공동 변경으로 해결하며 임의 N/A로 면제하지 않는다.

<a id="usage"></a>
## 사용·배치·동작

- G01: 지식·소유·생체·다중 요소 인증을 보안 요구에 따라 선택한다. UI만으로 신원/권한을 확인한 것으로 취급하지 않는다.
- G02: 일관된 로그인 링크는 항상 로그인 시작 화면에 연결한다. 작은 화면에서도 인지 가능하게 제공한다.
- G03: 필요한 작업에서만 로그인 안내한다. 기본/추천/제안은 목적에 따라 구분하며 모달에서 이점·맥락·로그인 안 함 선택을 유지한다.
- G04: 방식 수·주체·권한·빈도에 따라 목록/탭, 단일/단계/집중형을 선택한다. 같은 수준 방식은 비교 가능한 목록으로 제공하고 이용 범위 차이·도움을 인접하게 안내한다.
- G05: 명확한 입력 형식·비밀번호 표시·붙여넣기·방식 기억·계정 복구·인라인 오류·자동완성과 논리 초점을 제공한다. 실제 보안 오류는 계정 유출 위험도 함께 고려한다.
- G06: 로그인 상태를 명확히 표시하고 진입 원인에 맞는 이전 과업/대상으로 연결한다. 완료 문서 초점은 시작에 둔다.
- G07: 세션 제한과 만료를 사전에 알리고 가능한 연장·로그아웃을 제공한다. 경고 시간·연장 횟수는 회사 보안 계약과 함께 확정하며 KRDS 참고 수치를 서버 보안 정책 대신 사용하지 않는다.
- G08: 자발적 로그아웃은 피드백 후 홈, 시간 만료는 사유·다시 로그인·홈을 갖는 별도 화면으로 연결한다.

## 참고 출처

규칙의 권위는 위 회사 계약이다. 아래 문서는 근거·예외 검토가 필요할 때 읽으며 회사 계약을 자동 대체하지 않는다.

- [ui-kit/internal/reference/krds-p0782.md](../ui-kit/internal/reference/krds-p0782.md)
- [ui-kit/internal/reference/krds-p0785.md](../ui-kit/internal/reference/krds-p0785.md)
- [ui-kit/internal/reference/krds-p0793.md](../ui-kit/internal/reference/krds-p0793.md)
- [ui-kit/internal/reference/krds-p0803.md](../ui-kit/internal/reference/krds-p0803.md)
- [ui-kit/internal/reference/krds-p0819.md](../ui-kit/internal/reference/krds-p0819.md)
- [ui-kit/internal/reference/krds-p0832.md](../ui-kit/internal/reference/krds-p0832.md)
- [ui-kit/internal/reference/krds-p0839.md](../ui-kit/internal/reference/krds-p0839.md)
- [ui-kit/internal/reference/krds-p0848.md](../ui-kit/internal/reference/krds-p0848.md)
