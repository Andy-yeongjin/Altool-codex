# 05. 모달(Modal) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.270-281. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 사용자 행동으로 열기, 초기 초점·모달 내부 순환·Escape/닫기·호출자 복귀를 확인한다.
- [ ] 명확한 제목·행동·콘텐츠 스크롤·작은 화면 크기와 닫기 버튼의 문서상 순서를 대조한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [modal.html](../upstream/html/code/modal.html)
- [modal_sample.html](../upstream/html/code/modal_sample.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 모달은 콘텐츠의 양을 고려하여 적절한 크기로 제공한다. ([p.274](../reference/krds-p0270.md#pdf-p274), [p.275](../reference/krds-p0270.md#pdf-p275))
- [ ] **R002** 콘텐츠 영역에 스크롤이 필요한 경우 사용자가 스크롤 영역을 인지할 수 있도록 표현하고 푸터가 항상 표시되도록 한다. ([p.274](../reference/krds-p0270.md#pdf-p274), [p.276](../reference/krds-p0270.md#pdf-p276))
- [ ] **R003** 헤더, 콘텐츠, 버튼 레이블은 명확한 내용으로 제공한다. ([p.274](../reference/krds-p0270.md#pdf-p274), [p.277](../reference/krds-p0270.md#pdf-p277))
- [ ] **R004** 모달 내 상호작용을 최소화한다. ([p.274](../reference/krds-p0270.md#pdf-p274), [p.278](../reference/krds-p0270.md#pdf-p278))
- [ ] **R005** 모달은 사용자의 행동을 통해 실행한다. ([p.274](../reference/krds-p0270.md#pdf-p274), [p.279](../reference/krds-p0270.md#pdf-p279))
- [ ] **R006** 모달과 내부 요소의 초점 이동 순서를 논리적으로 제공한다. ([p.280](../reference/krds-p0270.md#pdf-p280))
- [ ] **R007** 모달의 닫기 버튼은 모달의 가장 마지막 요소로 마크업한다. ([p.280](../reference/krds-p0270.md#pdf-p280))

## 전체 원문 페이지

[270](../reference/krds-p0270.md#pdf-p270) · [271](../reference/krds-p0270.md#pdf-p271) · [272](../reference/krds-p0270.md#pdf-p272) · [273](../reference/krds-p0270.md#pdf-p273) · [274](../reference/krds-p0270.md#pdf-p274) · [275](../reference/krds-p0270.md#pdf-p275) · [276](../reference/krds-p0270.md#pdf-p276) · [277](../reference/krds-p0270.md#pdf-p277) · [278](../reference/krds-p0270.md#pdf-p278) · [279](../reference/krds-p0270.md#pdf-p279) · [280](../reference/krds-p0270.md#pdf-p280) · [281](../reference/krds-p0270.md#pdf-p281)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: ea2a1eab7b367b559efb0b8be309c6ff37f8c84a0bfac295765d2b79b95e7a74. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
