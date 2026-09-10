# 06. 페이지네이션(Pagination) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.213-235. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 첫/끝·이전/다음·현재 번호·전체 수와 한 화면 한 영역, 10개 이내 번호를 확인한다.
- [ ] 모바일에서도 전체 수가 변하지 않아야 한다. 더보기 확장은 새 항목의 초점·읽기 순서와 실제 데이터 증가를 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [pagination.html](../upstream/html/code/pagination.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 페이지네이션에는 첫/마지막 화면, 이전/다음 화면으로 이동할 수 있는 수단을 제공한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.222](../reference/krds-p0213.md#pdf-p222))
- [ ] **R002** 전체 화면 수를 표시한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.222](../reference/krds-p0213.md#pdf-p222))
- [ ] **R003** 번호 링크에 현재 화면 숫자를 강조하여 표현한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.223](../reference/krds-p0213.md#pdf-p223))
- [ ] **R004** 페이지네이션은 전체 서비스에서 일관된 영역에 배치한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.224](../reference/krds-p0213.md#pdf-p224))
- [ ] **R005** 페이지네이션은 한 화면에 하나만 사용한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.224](../reference/krds-p0213.md#pdf-p224))
- [ ] **R006** 숫자 링크 목록에는 말줄임표를 포함하여 10개 이내의 항목을 표시한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.224](../reference/krds-p0213.md#pdf-p224))
- [ ] **R007** 화면당 항목 수를 최적화한다. ([p.221](../reference/krds-p0213.md#pdf-p221), [p.225](../reference/krds-p0213.md#pdf-p225))
- [ ] **R008** 화면 너비가 충분하지 않은 경우 이전/다음 버튼, 숫자 링크 목록을 수직으로 배치한다. ([p.226](../reference/krds-p0213.md#pdf-p226))
- [ ] **R009** 화면 너비가 충분하지 않은 경우 숫자 링크 목록은 말줄임표를 포함하여 최대 7개 링크를 표시한다. ([p.227](../reference/krds-p0213.md#pdf-p227))
- [ ] **R010** 화면 크기에 상관없이 전체 화면 수를 일정하게 유지한다. ([p.228](../reference/krds-p0213.md#pdf-p228))
- [ ] **R011** 페이지네이션의 컨테이너가 내비게이션 섹션임을 스크린 리더에서 인지할 수 있도록 한다. ([p.229](../reference/krds-p0213.md#pdf-p229))
- [ ] **R012** 숫자 링크 목록의 구조를 표현한다. ([p.229](../reference/krds-p0213.md#pdf-p229))
- [ ] **R013** 스크린 리더에서 확인할 수 있는 현재 화면 정보를 제공한다. ([p.229](../reference/krds-p0213.md#pdf-p229))
- [ ] **R014** 현재 화면 숫자 링크를 색상만으로 구분하지 않는다. ([p.230](../reference/krds-p0213.md#pdf-p230))
- [ ] **R015** 숫자 링크에 적절한 접근 가능한 이름을 제공한다. ([p.231](../reference/krds-p0213.md#pdf-p231))
- [ ] **R016** 이전/다음 화면 이동 버튼을 아이콘으로만 제공하는 경우 이름을 제공해야 한다. ([p.231](../reference/krds-p0213.md#pdf-p231))
- [ ] **R017** 페이지네이션의 구성 요소를 적절한 크기로 표현하고 영역 간 구분을 제공한다. ([p.231](../reference/krds-p0213.md#pdf-p231))
- [ ] **R018** 페이지네이션의 구성 요소를 일관된 순서로 제공한다. ([p.232](../reference/krds-p0213.md#pdf-p232))
- [ ] **R019** 목록 확장 페이지네이션을 사용할 때, 초점 이동 순서에 유의한다. ([p.232](../reference/krds-p0213.md#pdf-p232))

## 전체 원문 페이지

[213](../reference/krds-p0213.md#pdf-p213) · [214](../reference/krds-p0213.md#pdf-p214) · [215](../reference/krds-p0213.md#pdf-p215) · [216](../reference/krds-p0213.md#pdf-p216) · [217](../reference/krds-p0213.md#pdf-p217) · [218](../reference/krds-p0213.md#pdf-p218) · [219](../reference/krds-p0213.md#pdf-p219) · [220](../reference/krds-p0213.md#pdf-p220) · [221](../reference/krds-p0213.md#pdf-p221) · [222](../reference/krds-p0213.md#pdf-p222) · [223](../reference/krds-p0213.md#pdf-p223) · [224](../reference/krds-p0213.md#pdf-p224) · [225](../reference/krds-p0213.md#pdf-p225) · [226](../reference/krds-p0213.md#pdf-p226) · [227](../reference/krds-p0213.md#pdf-p227) · [228](../reference/krds-p0213.md#pdf-p228) · [229](../reference/krds-p0213.md#pdf-p229) · [230](../reference/krds-p0213.md#pdf-p230) · [231](../reference/krds-p0213.md#pdf-p231) · [232](../reference/krds-p0213.md#pdf-p232) · [233](../reference/krds-p0213.md#pdf-p233) · [234](../reference/krds-p0213.md#pdf-p234) · [235](../reference/krds-p0213.md#pdf-p235)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: 575f014a28fe0b6f1a703b22cf29176a50ac0576f9d5b1009a730ff864a3c82c. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
