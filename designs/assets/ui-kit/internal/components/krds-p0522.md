# 03. 텍스트 입력 필드(Text input) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.522-532. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 고정 레이블·길이에 맞는 입력폭·자동완성을 제공하고 placeholder로 레이블을 대신하지 않는다.
- [ ] 키보드·복사/붙여넣기·초점·오류 설명 연결·실제 형식 검증을 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [text_input.html](../upstream/html/code/text_input.html)
- [text_input_icon.html](../upstream/html/code/text_input_icon.html)
- [text_input_size.html](../upstream/html/code/text_input_size.html)
- [text_input_state.html](../upstream/html/code/text_input_state.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 입력 필드는 텍스트의 길이를 고려하여 적절한 크기로 제공한다. ([p.525](../reference/krds-p0522.md#pdf-p525), [p.526](../reference/krds-p0522.md#pdf-p526))
- [ ] **R002** 모든 텍스트 입력 필드에는 레이블을 제공한다. ([p.525](../reference/krds-p0522.md#pdf-p525), [p.527](../reference/krds-p0522.md#pdf-p527))
- [ ] **R003** 플레이스홀더가 레이블이나 도움말의 대체 수단으로 사용되어서는 안 된다. ([p.525](../reference/krds-p0522.md#pdf-p525), [p.528](../reference/krds-p0522.md#pdf-p528))
- [ ] **R004** 복사, 붙여넣기를 제한하지 않는다. ([p.525](../reference/krds-p0522.md#pdf-p525), [p.530](../reference/krds-p0522.md#pdf-p530))
- [ ] **R005** 사용자가 자주, 반복적으로 입력하는 값은 자동 완성될 수 있도록 구현한다. ([p.525](../reference/krds-p0522.md#pdf-p525), [p.530](../reference/krds-p0522.md#pdf-p530))
- [ ] **R006** 모든 입력 필드의 초점은 시각적으로 확인할 수 있도록 표현한다. ([p.531](../reference/krds-p0522.md#pdf-p531))
- [ ] **R007** 입력 필드와 인접 배경 간 명도 대비를 3:1 이상으로 표현한다. ([p.531](../reference/krds-p0522.md#pdf-p531))
- [ ] **R008** 텍스트 입력 필드에 접근 가능한 이름을 제공한다. ([p.531](../reference/krds-p0522.md#pdf-p531))

## 전체 원문 페이지

[522](../reference/krds-p0522.md#pdf-p522) · [523](../reference/krds-p0522.md#pdf-p523) · [524](../reference/krds-p0522.md#pdf-p524) · [525](../reference/krds-p0522.md#pdf-p525) · [526](../reference/krds-p0522.md#pdf-p526) · [527](../reference/krds-p0522.md#pdf-p527) · [528](../reference/krds-p0522.md#pdf-p528) · [529](../reference/krds-p0522.md#pdf-p529) · [530](../reference/krds-p0522.md#pdf-p530) · [531](../reference/krds-p0522.md#pdf-p531) · [532](../reference/krds-p0522.md#pdf-p532)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: 58686d52e902822b61f5fc036f303f468237642c8dce42f099727deda93065b6. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
