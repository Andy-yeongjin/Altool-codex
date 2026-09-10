# 검색·재검색 — 회사 적용 지침

Altool 기본 회사 계약. 기존 Altool 작성 적용 체크리스트에서 채택한 기본 지침이며 KRDS 인증이나 원문 전체 채택이 아니다. 회사 도입 전 조정 후 자산과 함께 버전 배포한다. 기능/상태에 해당하는 조건만 적용하고 없는 기능을 추가하지 않는다. 상충하는 회사 필수 계약은 공동 변경으로 해결하며 임의 N/A로 면제하지 않는다.

<a id="usage"></a>
## 사용·배치·동작

- G01: 모든 화면에서 일관된 헤더 우측 검색 수단과 명확한 레이블을 제공한다. 부분 검색은 목록 문맥에 배치한다.
- G02: 검색어 입력, 전체 범위, 삭제, 접근 가능한 실시간 도움을 제공한다. 추천은 ↓ 진입·↑↓ 순환·Enter 실행·Escape 닫기/초점 복귀를 지원한다.
- G03: 입력·조건을 유지한 채 로딩·전체 및 주제별 결과 수·관련도·0건 대안을 표시한다. 결과 정확성은 운영 데이터로 정기 확인한다.
- G04: 기본/복합/고급 검색은 메타데이터 복잡성과 조회 비용에 맞춰 선택한다. 기간·분류·정렬 순서, 전체 범위, 적용 상태, live-region을 제공한다.
- G05: 주제 분류는 7개 이하, 전체가 먼저다. 전체 결과는 관련도 목록이 기본이며 이미지·영상 같은 비텍스트 자료 또는 명확한 탐색 이점이 있을 때 분류별 배치를 허용한다(PDF p765). 제목·설명·분류·일치어와 기본 10개 결과를 제공한다.
- G06: 재검색 중 필터가 사라지거나 암묵적으로 초기화되지 않도록 한다. 조건 일괄 해제 수단을 제공한다.
- G07: 검색 성공·실패 모두 검색을 벗어나 메뉴나 다른 탐색 수단에 접근할 수 있어야 한다.

## 참고 출처

규칙의 권위는 위 회사 계약이다. 아래 문서는 근거·예외 검토가 필요할 때 읽으며 회사 계약을 자동 대체하지 않는다.

- [ui-kit/internal/reference/krds-p0707.md](../ui-kit/internal/reference/krds-p0707.md)
- [ui-kit/internal/reference/krds-p0716.md](../ui-kit/internal/reference/krds-p0716.md)
- [ui-kit/internal/reference/krds-p0732.md](../ui-kit/internal/reference/krds-p0732.md)
- [ui-kit/internal/reference/krds-p0747.md](../ui-kit/internal/reference/krds-p0747.md)
- [ui-kit/internal/reference/krds-p0759.md](../ui-kit/internal/reference/krds-p0759.md)
- [ui-kit/internal/reference/krds-p0771.md](../ui-kit/internal/reference/krds-p0771.md)
- [ui-kit/internal/reference/krds-p0777.md](../ui-kit/internal/reference/krds-p0777.md)
