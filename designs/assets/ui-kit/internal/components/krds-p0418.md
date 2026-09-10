# 04. 태그(Tag) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.418-429. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 대화형/비대화형 태그를 같은 그룹에 섞지 않고 관련 요소 주변에 짧게 제공한다.
- [ ] 삭제·필터·링크 태그 각 기능과 이름·상태·초점 복구를 실제 조작하고 과도한 개수/색상을 피한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [tag.html](../upstream/html/code/tag.html)
- [tag_link.html](../upstream/html/code/tag_link.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 텍스트 레이블을 제공한다. ([p.421](../reference/krds-p0418.md#pdf-p421), [p.422](../reference/krds-p0418.md#pdf-p422))
- [ ] **R002** 레이블은 정확한 내용으로 간결하게 제공한다. ([p.421](../reference/krds-p0418.md#pdf-p421), [p.422](../reference/krds-p0418.md#pdf-p422))
- [ ] **R003** 태그는 관련 요소 주변에 배치한다. ([p.421](../reference/krds-p0418.md#pdf-p421), [p.422](../reference/krds-p0418.md#pdf-p422))
- [ ] **R004** 대화형 태그와 비대화형 태그를 같은 그룹에 포함하지 않는다. ([p.421](../reference/krds-p0418.md#pdf-p421), [p.422](../reference/krds-p0418.md#pdf-p422))
- [ ] **R005** 지나치게 많은 태그를 사용하지 않는다. ([p.421](../reference/krds-p0418.md#pdf-p421), [p.423](../reference/krds-p0418.md#pdf-p423))
- [ ] **R006** 태그의 표현에 지나치게 많은 색상을 사용하지 않는다. ([p.421](../reference/krds-p0418.md#pdf-p421), [p.424](../reference/krds-p0418.md#pdf-p424))
- [ ] **R007** 대화형 태그의 초점을 명확하게 표시한다. ([p.425](../reference/krds-p0418.md#pdf-p425))
- [ ] **R008** 대화형 태그에 기능 또는 상태 정보를 명확하게 제공한다. ([p.425](../reference/krds-p0418.md#pdf-p425))
- [ ] **R009** 태그의 색상으로 의미를 전달하지 않아야 한다. ([p.426](../reference/krds-p0418.md#pdf-p426))
- [ ] **R010** 태그 레이블, 아이콘이 인접 배경과 3:1 이상의 명도 대비를 갖도록 표현한다. ([p.426](../reference/krds-p0418.md#pdf-p426))

## 전체 원문 페이지

[418](../reference/krds-p0418.md#pdf-p418) · [419](../reference/krds-p0418.md#pdf-p419) · [420](../reference/krds-p0418.md#pdf-p420) · [421](../reference/krds-p0418.md#pdf-p421) · [422](../reference/krds-p0418.md#pdf-p422) · [423](../reference/krds-p0418.md#pdf-p423) · [424](../reference/krds-p0418.md#pdf-p424) · [425](../reference/krds-p0418.md#pdf-p425) · [426](../reference/krds-p0418.md#pdf-p426) · [427](../reference/krds-p0418.md#pdf-p427) · [428](../reference/krds-p0418.md#pdf-p428) · [429](../reference/krds-p0418.md#pdf-p429)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: cfb1eef89ecf9921dba2f7230a5bcf68d582591f34cd0e0f3f7a5c9197dd6a6f. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
