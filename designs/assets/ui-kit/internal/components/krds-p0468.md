# 03. 맥락적 도움말(Contextual help) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.468-484. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 요청 시만 열기·닫기, 관련 컨트롤과 접근 가능한 이름·설명의 연결·초점 순서를 확인한다.
- [ ] 모바일 팝오버 경계와 중요 콘텐츠 비가림, 필수 정보 본문 제공, 중첩 도움말/모달 및 도움패널 동시 사용 금지를 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [contextual_help.html](../upstream/html/code/contextual_help.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 아이콘 버튼은 도움 정보를 제공하고자 하는 요소 주변에 배치한다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.473](../reference/krds-p0468.md#pdf-p473))
- [ ] **R002** 팝오버 영역이 화면을 벗어나지 않도록 표현한다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.474](../reference/krds-p0468.md#pdf-p474))
- [ ] **R003** 팝오버 영역이 본문의 중요 콘텐츠를 가리지 않도록 표현한다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.475](../reference/krds-p0468.md#pdf-p475))
- [ ] **R004** 사용자가 작업을 수행하기 위해 반드시 알아야 하는 필수 정보가 맥락적 도움말 콘텐츠에서만 제공되지 않도록 한다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.476](../reference/krds-p0468.md#pdf-p476))
- [ ] **R005** 맥락적 도움말에서 또 다른 맥락적 도움말을 실행하거나 모달을 실행하지 않도록 한다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.477](../reference/krds-p0468.md#pdf-p477))
- [ ] **R006** 도움말 내부 링크는 새 창으로 실행한다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.477](../reference/krds-p0468.md#pdf-p477))
- [ ] **R007** 맥락적 도움말과 도움 패널을 함께 사용하지 않는다. ([p.472](../reference/krds-p0468.md#pdf-p472), [p.478](../reference/krds-p0468.md#pdf-p478))
- [ ] **R008** 모든 화면 크기에서 팝오버 영역이 완전히 표시되는지 확인한다. ([p.479](../reference/krds-p0468.md#pdf-p479))
- [ ] **R009** 아이콘과 인접 배경 간 명도 대비를 3:1 이상으로 제공한다. ([p.480](../reference/krds-p0468.md#pdf-p480))
- [ ] **R010** 아이콘 버튼에 이름을 제공한다. ([p.480](../reference/krds-p0468.md#pdf-p480))
- [ ] **R011** 아이콘 버튼에 고유하고 적절한 이름을 제공한다. ([p.480](../reference/krds-p0468.md#pdf-p480))
- [ ] **R012** 맥락적 도움말은 사용자가 요청한 경우에만 실행되어야 한다. ([p.481](../reference/krds-p0468.md#pdf-p481))
- [ ] **R013** 아이콘 버튼과 도움말 팝오버 콘텐츠를 적절한 순서로 제공한다. ([p.481](../reference/krds-p0468.md#pdf-p481))
- [ ] **R014** 키보드 초점은 논리적인 순서로 이동해야 한다. ([p.482](../reference/krds-p0468.md#pdf-p482))
- [ ] **R015** 아이콘 버튼의 크기를 44px × 44px 이상으로 제공하는 방안을 고려한다. ([p.482](../reference/krds-p0468.md#pdf-p482))

## 전체 원문 페이지

[468](../reference/krds-p0468.md#pdf-p468) · [469](../reference/krds-p0468.md#pdf-p469) · [470](../reference/krds-p0468.md#pdf-p470) · [471](../reference/krds-p0468.md#pdf-p471) · [472](../reference/krds-p0468.md#pdf-p472) · [473](../reference/krds-p0468.md#pdf-p473) · [474](../reference/krds-p0468.md#pdf-p474) · [475](../reference/krds-p0468.md#pdf-p475) · [476](../reference/krds-p0468.md#pdf-p476) · [477](../reference/krds-p0468.md#pdf-p477) · [478](../reference/krds-p0468.md#pdf-p478) · [479](../reference/krds-p0468.md#pdf-p479) · [480](../reference/krds-p0468.md#pdf-p480) · [481](../reference/krds-p0468.md#pdf-p481) · [482](../reference/krds-p0468.md#pdf-p482) · [483](../reference/krds-p0468.md#pdf-p483) · [484](../reference/krds-p0468.md#pdf-p484)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: 27e6a82928d884e2efd41286d8b9751b9c2a8861b4431c3f59b72273cc5b951d. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
