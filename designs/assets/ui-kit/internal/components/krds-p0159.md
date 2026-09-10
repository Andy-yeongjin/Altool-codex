# 02. 메인 메뉴(Main menu) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.159-175. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 클릭·키보드로 드롭다운을 열고 닫는다. hover만으로 열리지 않는지, 메뉴 계층과 초점 순서를 확인한다.
- [ ] 최대 3수준, 영역 높이·스크롤, 선택·현재 항목, 좁은 화면의 대체 메뉴를 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [main_menu_mobile.html](../upstream/html/code/main_menu_mobile.html)
- [main_menu_pc.html](../upstream/html/code/main_menu_pc.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 드롭다운 메뉴 영역 내에서 레이블은 좌측으로 정렬한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.167](../reference/krds-p0159.md#pdf-p167))
- [ ] **R002** 드롭다운 영역의 최대 높이는 뷰포트를 초과하지 않도록 하고 최대 높이를 초과하는 경우에 스크롤이 생성되도록 제공한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.168](../reference/krds-p0159.md#pdf-p168))
- [ ] **R003** 링크의 활성화 상태, 선택 상태가 명확히 구분되도록 표현한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.169](../reference/krds-p0159.md#pdf-p169))
- [ ] **R004** 드롭다운 영역에 제목을 제공한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.169](../reference/krds-p0159.md#pdf-p169))
- [ ] **R005** 링크의 개수를 최소화한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.169](../reference/krds-p0159.md#pdf-p169))
- [ ] **R006** 서비스 정보 구조를 적절하게 반영하여 메인 메뉴를 구성하고 최대 3수준의 메뉴를 사용한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.170](../reference/krds-p0159.md#pdf-p170))
- [ ] **R007** 링크명에 이해하기 쉬운 용어를 사용한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.170](../reference/krds-p0159.md#pdf-p170))
- [ ] **R008** 링크는 우선순위에 따라 배치한다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.170](../reference/krds-p0159.md#pdf-p170))
- [ ] **R009** 마우스오버를 사용하여 드롭다운 목록을 확장하지 않는다. ([p.166](../reference/krds-p0159.md#pdf-p166), [p.171](../reference/krds-p0159.md#pdf-p171))
- [ ] **R010** 화면 너비가 충분한 경우에는 1수준 메뉴 전체를 확인할 수 있도록 표현한다. ([p.172](../reference/krds-p0159.md#pdf-p172))
- [ ] **R011** 메뉴의 컨테이너가 내비게이션 섹션임을 스크린 리더에서 인지할 수 있도록 한다. ([p.173](../reference/krds-p0159.md#pdf-p173))
- [ ] **R012** 메뉴 링크의 계층 구조를 표현한다. ([p.173](../reference/krds-p0159.md#pdf-p173))
- [ ] **R013** 활성화된 메뉴 정보가 스크린 리더로 전달될 수 있도록 한다. ([p.173](../reference/krds-p0159.md#pdf-p173))
- [ ] **R014** 메뉴 링크는 키보드로 탐색할 수 있도록 한다. ([p.174](../reference/krds-p0159.md#pdf-p174))
- [ ] **R015** 키보드의 초점은 메뉴의 계층 순서대로 이동하도록 한다. ([p.174](../reference/krds-p0159.md#pdf-p174))

## 전체 원문 페이지

[159](../reference/krds-p0159.md#pdf-p159) · [160](../reference/krds-p0159.md#pdf-p160) · [161](../reference/krds-p0159.md#pdf-p161) · [162](../reference/krds-p0159.md#pdf-p162) · [163](../reference/krds-p0159.md#pdf-p163) · [164](../reference/krds-p0159.md#pdf-p164) · [165](../reference/krds-p0159.md#pdf-p165) · [166](../reference/krds-p0159.md#pdf-p166) · [167](../reference/krds-p0159.md#pdf-p167) · [168](../reference/krds-p0159.md#pdf-p168) · [169](../reference/krds-p0159.md#pdf-p169) · [170](../reference/krds-p0159.md#pdf-p170) · [171](../reference/krds-p0159.md#pdf-p171) · [172](../reference/krds-p0159.md#pdf-p172) · [173](../reference/krds-p0159.md#pdf-p173) · [174](../reference/krds-p0159.md#pdf-p174) · [175](../reference/krds-p0159.md#pdf-p175)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: 9a9d83f6fa0abfa3a8ec2025043fa554a112c614bad3d0a5db53f49ef476d149. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
