# 09. 캐러셀(Carousel) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.307-327. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 주요 정보는 캐러셀에만 숨기지 않는다. 5개 이하 슬라이드와 짧은 문구, 현재/전체 수, 단일 항목의 컨트롤 생략을 확인한다.
- [ ] 이전/다음·식별자·정지/재생·스와이프·키보드를 실제 조작한다. 자동재생의 정지 기능, 콘텐츠와 컨트롤 비중첩을 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [carousel.html](../upstream/html/code/carousel.html)
- [carousel_banner.html](../upstream/html/code/carousel_banner.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 슬라이드 수를 5개 이내로 사용한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.314](../reference/krds-p0307.md#pdf-p314))
- [ ] **R002** 캐러셀 항목의 텍스트 콘텐츠는 1~2줄로 작성한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.315](../reference/krds-p0307.md#pdf-p315))
- [ ] **R003** 캐러셀 항목의 콘텐츠의 윤곽이 명확하게 드러나도록 표현한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.315](../reference/krds-p0307.md#pdf-p315))
- [ ] **R004** 캐러셀 관련 컨트롤, 항목 탐색 식별자가 캐러셀 항목과 중첩되지 않도록 한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.316](../reference/krds-p0307.md#pdf-p316))
- [ ] **R005** 캐러셀 관련 컨트롤과 항목 탐색 식별자가 명확하게 인지될 수 있도록 표현한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.317](../reference/krds-p0307.md#pdf-p317))
- [ ] **R006** 캐러셀 관련 컨트롤과 항목 탐색 식별자를 일관된 위치에 표시한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.318](../reference/krds-p0307.md#pdf-p318))
- [ ] **R007** 전체 슬라이드 수와 사용자의 탐색 위치를 표시한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.318](../reference/krds-p0307.md#pdf-p318))
- [ ] **R008** 캐러셀 관련 컨트롤 요소를 쉽게 조작할 수 있도록 충분히 크게 표현한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.318](../reference/krds-p0307.md#pdf-p318))
- [ ] **R009** 중요한 항목을 우선적으로 배치한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.319](../reference/krds-p0307.md#pdf-p319))
- [ ] **R010** 드래그 앤 드롭/스와이프로 슬라이드를 전환할 수 있도록 한다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.320](../reference/krds-p0307.md#pdf-p320))
- [ ] **R011** 표시할 캐러셀 항목 수가 1개인 경우 캐러셀과 관련된 단서를 숨긴다. ([p.313](../reference/krds-p0307.md#pdf-p313), [p.321](../reference/krds-p0307.md#pdf-p321))
- [ ] **R012** 화면 크기가 충분한 경우 도형형 항목 탐색 식별자를 버튼으로 제공한다. ([p.322](../reference/krds-p0307.md#pdf-p322))
- [ ] **R013** 화면 크기가 충분하지 않은 경우 도형형 항목 탐색 식별자는 분수형으로 전환한다. ([p.323](../reference/krds-p0307.md#pdf-p323))
- [ ] **R014** 자동 재생 캐러셀에서 정지 버튼이 상호작용 가능한 첫 요소로 제공되어야 한다. ([p.324](../reference/krds-p0307.md#pdf-p324))
- [ ] **R015** 단일 지점과의 상호작용을 통해 슬라이드를 탐색할 수 있는 수단을 제공한다. ([p.324](../reference/krds-p0307.md#pdf-p324))
- [ ] **R016** 캐러셀에서 제공되는 모든 기능을 키보드로 실행할 수 있도록 한다. ([p.324](../reference/krds-p0307.md#pdf-p324))
- [ ] **R017** 키보드와 스크린 리더는 기본 항목에만 접근하도록 한다. ([p.325](../reference/krds-p0307.md#pdf-p325))
- [ ] **R018** 텍스트가 포함된 이미지를 사용하지 않는다. ([p.325](../reference/krds-p0307.md#pdf-p325))

## 전체 원문 페이지

[307](../reference/krds-p0307.md#pdf-p307) · [308](../reference/krds-p0307.md#pdf-p308) · [309](../reference/krds-p0307.md#pdf-p309) · [310](../reference/krds-p0307.md#pdf-p310) · [311](../reference/krds-p0307.md#pdf-p311) · [312](../reference/krds-p0307.md#pdf-p312) · [313](../reference/krds-p0307.md#pdf-p313) · [314](../reference/krds-p0307.md#pdf-p314) · [315](../reference/krds-p0307.md#pdf-p315) · [316](../reference/krds-p0307.md#pdf-p316) · [317](../reference/krds-p0307.md#pdf-p317) · [318](../reference/krds-p0307.md#pdf-p318) · [319](../reference/krds-p0307.md#pdf-p319) · [320](../reference/krds-p0307.md#pdf-p320) · [321](../reference/krds-p0307.md#pdf-p321) · [322](../reference/krds-p0307.md#pdf-p322) · [323](../reference/krds-p0307.md#pdf-p323) · [324](../reference/krds-p0307.md#pdf-p324) · [325](../reference/krds-p0307.md#pdf-p325) · [326](../reference/krds-p0307.md#pdf-p326) · [327](../reference/krds-p0307.md#pdf-p327)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: f15e622c62bf8143d09e8309461266b21356f4ea887b8b5ade7a60630d250099. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
