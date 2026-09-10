# 02. 버튼(Button) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.368-381. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 기능을 예측하는 동사형 레이블, 한 화면의 주 행동 위계, 버튼그룹 크기와 수직 우선순위를 확인한다.
- [ ] 키보드·이름·초점·disabled·처리중·중복 클릭을 확인한다. 데모 버튼에 운영 저장 성공을 가장하는 동작을 붙이지 않는다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [button.html](../upstream/html/code/button.html)
- [button_hierarchy.html](../upstream/html/code/button_hierarchy.html)
- [button_icon.html](../upstream/html/code/button_icon.html)
- [button_size.html](../upstream/html/code/button_size.html)
- [button_text.html](../upstream/html/code/button_text.html)
- [button_with_icon.html](../upstream/html/code/button_with_icon.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 버튼이 그룹으로 제공될 때 모든 버튼의 크기를 동일하게 제공한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.371](../reference/krds-p0368.md#pdf-p371))
- [ ] **R002** 버튼과 관련된 사용자 과업, 플로 (Flow) 의 중요도에 따라 버튼 간 위계를 명확하게 구분한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.372](../reference/krds-p0368.md#pdf-p372))
- [ ] **R003** 한 화면에 최상위 수준의 강조 버튼은 한 번만 사용한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.373](../reference/krds-p0368.md#pdf-p373))
- [ ] **R004** 버튼 그룹을 수직으로 배열할 때 최상위 수준의 강조 버튼을 첫 번째로 배치한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.374](../reference/krds-p0368.md#pdf-p374))
- [ ] **R005** 버튼의 텍스트 레이블은 버튼을 통해 실행되는 기능을 예측할 수 있는 명확한 내용을 동사형으로 제공한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.374](../reference/krds-p0368.md#pdf-p374))
- [ ] **R006** 아이콘은 중요한 작업에 그리고 반드시 필요한 경우에 사용한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.375](../reference/krds-p0368.md#pdf-p375))
- [ ] **R007** 사용자가 실수로 버튼을 두 번 이상 누르는 상황을 고려한다. ([p.370](../reference/krds-p0368.md#pdf-p370), [p.375](../reference/krds-p0368.md#pdf-p375))
- [ ] **R008** 모든 버튼에는 접근 가능한 이름을 제공한다. ([p.376](../reference/krds-p0368.md#pdf-p376))
- [ ] **R009** 버튼의 기능을 설명할 수 있는 텍스트 레이블이 있는 아이콘 버튼에 대체 텍스트를 제공하지 않는다. ([p.376](../reference/krds-p0368.md#pdf-p376))
- [ ] **R010** 버튼의 접근 가능한 이름은 버튼을 통해 실행되는 기능을 적절하게 설명할 수 있는 내용으로 제공한다. ([p.376](../reference/krds-p0368.md#pdf-p376))
- [ ] **R011** 모든 버튼은 키보드로 접근하고 조작할 수 있도록 한다. ([p.377](../reference/krds-p0368.md#pdf-p377))
- [ ] **R012** 버튼의 키보드 초점이 명확하게 표시되도록 한다. ([p.377](../reference/krds-p0368.md#pdf-p377))
- [ ] **R013** 버튼으로 작동하는 모든 요소는 스크린 리더에서 버튼으로 인지될 수 있도록 한다. ([p.377](../reference/krds-p0368.md#pdf-p377))
- [ ] **R014** 버튼을 적절한 크기로 제공한다. ([p.378](../reference/krds-p0368.md#pdf-p378))

## 전체 원문 페이지

[368](../reference/krds-p0368.md#pdf-p368) · [369](../reference/krds-p0368.md#pdf-p369) · [370](../reference/krds-p0368.md#pdf-p370) · [371](../reference/krds-p0368.md#pdf-p371) · [372](../reference/krds-p0368.md#pdf-p372) · [373](../reference/krds-p0368.md#pdf-p373) · [374](../reference/krds-p0368.md#pdf-p374) · [375](../reference/krds-p0368.md#pdf-p375) · [376](../reference/krds-p0368.md#pdf-p376) · [377](../reference/krds-p0368.md#pdf-p377) · [378](../reference/krds-p0368.md#pdf-p378) · [379](../reference/krds-p0368.md#pdf-p379) · [380](../reference/krds-p0368.md#pdf-p380) · [381](../reference/krds-p0368.md#pdf-p381)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: e6bb16d00ffaf4eb250512fe0d1035583cab02815481dae4dd8cc0a6ec9ebaf2. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
