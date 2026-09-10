# 03. 체크박스(Checkbox) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.405-417. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 개별 선택·전체 선택·일부 선택의 indeterminate 상태, 그룹 레이블·옵션 순서를 확인한다.
- [ ] Space 토글·레이블 클릭·초점·선택값·disabled·비색상 표시를 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [checkbox.html](../upstream/html/code/checkbox.html)
- [checkbox_chip.html](../upstream/html/code/checkbox_chip.html)
- [checkbox_size.html](../upstream/html/code/checkbox_size.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 기본적으로 체크박스의 옵션은 가나다순으로 정렬한다. ([p.408](../reference/krds-p0405.md#pdf-p408), [p.409](../reference/krds-p0405.md#pdf-p409))
- [ ] **R002** 체크박스는 수직으로, 체크박스 레이블은 양식의 오른쪽에 배치한다. ([p.408](../reference/krds-p0405.md#pdf-p408), [p.410](../reference/krds-p0405.md#pdf-p410))
- [ ] **R003** 체크박스의 레이블은 분명하고 정확하게 제공한다. ([p.408](../reference/krds-p0405.md#pdf-p408), [p.411](../reference/krds-p0405.md#pdf-p411))
- [ ] **R004** 전체 선택 옵션이 제공되는 경우 중간 상태를 명확하게 표현한다. ([p.408](../reference/krds-p0405.md#pdf-p408), [p.412](../reference/krds-p0405.md#pdf-p412))
- [ ] **R005** 체크박스, 아이콘과 인접 배경 간 명도 대비를 3:1 이상으로 표현한다. ([p.413](../reference/krds-p0405.md#pdf-p413))
- [ ] **R006** 체크박스의 선택 상태를 색상으로만 구분하지 않는다. ([p.414](../reference/krds-p0405.md#pdf-p414))
- [ ] **R007** 체크박스를 키보드로 탐색하고 실행할 수 있도록 한다. ([p.415](../reference/krds-p0405.md#pdf-p415))
- [ ] **R008** 체크박스에 키보드 초점이 명확하게 표시되도록 한다. ([p.415](../reference/krds-p0405.md#pdf-p415))
- [ ] **R009** 체크박스에 접근 가능한 이름을 제공한다. ([p.416](../reference/krds-p0405.md#pdf-p416))
- [ ] **R010** 스크린 리더에서 그룹 레이블과 체크박스 그룹의 관계를 확인할 수 있도록 한다. ([p.416](../reference/krds-p0405.md#pdf-p416))

## 전체 원문 페이지

[405](../reference/krds-p0405.md#pdf-p405) · [406](../reference/krds-p0405.md#pdf-p406) · [407](../reference/krds-p0405.md#pdf-p407) · [408](../reference/krds-p0405.md#pdf-p408) · [409](../reference/krds-p0405.md#pdf-p409) · [410](../reference/krds-p0405.md#pdf-p410) · [411](../reference/krds-p0405.md#pdf-p411) · [412](../reference/krds-p0405.md#pdf-p412) · [413](../reference/krds-p0405.md#pdf-p413) · [414](../reference/krds-p0405.md#pdf-p414) · [415](../reference/krds-p0405.md#pdf-p415) · [416](../reference/krds-p0405.md#pdf-p416) · [417](../reference/krds-p0405.md#pdf-p417)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: 7d0c1aadb9854aa867dd0acf102b6164ef7b6ea756f7bb968ac0ee688c4ce918. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
