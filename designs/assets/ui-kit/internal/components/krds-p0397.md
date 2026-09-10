# 02. 셀렉트(Select) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.397-404. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 항상 레이블을 제공하고 짧은 옵션을 사용한다. 값 변경만으로 폼 제출이 일어나지 않는지 확인한다.
- [ ] 키보드 선택·선택 상태·오류·비활성·아이콘 대비를 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [select.html](../upstream/html/code/select.html)
- [select_size.html](../upstream/html/code/select_size.html)
- [select_sorting.html](../upstream/html/code/select_sorting.html)
- [select_state.html](../upstream/html/code/select_state.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 옵션 텍스트를 간결하게 제공한다. ([p.400](../reference/krds-p0397.md#pdf-p400), [p.401](../reference/krds-p0397.md#pdf-p401))
- [ ] **R002** 모든 셀렉트에는 레이블을 제공한다. ([p.400](../reference/krds-p0397.md#pdf-p400), [p.401](../reference/krds-p0397.md#pdf-p401))
- [ ] **R003** 셀렉트의 값을 변경하였을 때 폼이 제출되어서는 안 된다. ([p.400](../reference/krds-p0397.md#pdf-p400), [p.401](../reference/krds-p0397.md#pdf-p401))
- [ ] **R004** 셀렉트에 접근 가능한 이름을 제공한다. ([p.402](../reference/krds-p0397.md#pdf-p402))
- [ ] **R005** 셀렉트 아이콘과 인접 배경 간 명도 대비를 3:1 이상으로 표현한다. ([p.402](../reference/krds-p0397.md#pdf-p402))

## 전체 원문 페이지

[397](../reference/krds-p0397.md#pdf-p397) · [398](../reference/krds-p0397.md#pdf-p398) · [399](../reference/krds-p0397.md#pdf-p399) · [400](../reference/krds-p0397.md#pdf-p400) · [401](../reference/krds-p0397.md#pdf-p401) · [402](../reference/krds-p0397.md#pdf-p402) · [403](../reference/krds-p0397.md#pdf-p403) · [404](../reference/krds-p0397.md#pdf-p404)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: cae13a9f570ff59a27b20872a518ffe3f3b5d509a0696a73fd2be7771bdfd65f. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
