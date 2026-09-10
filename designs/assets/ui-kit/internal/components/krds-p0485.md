# 04. 코치마크(Coach mark) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.485-499. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 사용자 요청으로 시작하고 이전·다음·중단, 과업 완료가 필요한 단계 조건을 확인한다.
- [ ] 한 번에 한 코치마크·일관된 액션 순서·스포트라이트 대비·작은 화면 비가림·논리적 초점을 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [coach_mark.html](../upstream/html/code/coach_mark.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 코치마크는 정보를 제공하고자 하는 요소 주변에 배치한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.488](../reference/krds-p0485.md#pdf-p488))
- [ ] **R002** 팝오버 영역이 본문의 중요 콘텐츠를 가리지 않도록 표현한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.489](../reference/krds-p0485.md#pdf-p489))
- [ ] **R003** 팝오버 영역의 너비를 일관되게 유지한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.490](../reference/krds-p0485.md#pdf-p490))
- [ ] **R004** 코치마크의 제목과 지시 사항은 간결하고 명확하게 작성한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.490](../reference/krds-p0485.md#pdf-p490))
- [ ] **R005** 지나치게 많은 코치마크를 사용하지 않는다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.490](../reference/krds-p0485.md#pdf-p490))
- [ ] **R006** 코치마크는 전체 과업 플로 (Flow) 를 고려하여 논리적인 순서로 제공한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.491](../reference/krds-p0485.md#pdf-p491))
- [ ] **R007** 한 화면에 여러 개의 코치마크가 표시되지 않도록 한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.491](../reference/krds-p0485.md#pdf-p491))
- [ ] **R008** 코치마크가 표시된 상태에서 다른 메시지가 표시되지 않도록 한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.491](../reference/krds-p0485.md#pdf-p491))
- [ ] **R009** 지시 사항 내부 링크는 새 창으로 실행한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.491](../reference/krds-p0485.md#pdf-p491))
- [ ] **R010** 모든 단계에서 액션 버튼을 일관성 있는 순서로 배치하고 동일한 레이블을 사용한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.492](../reference/krds-p0485.md#pdf-p492))
- [ ] **R011** 액션 버튼을 적절한 강조 수준으로 표현한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.493](../reference/krds-p0485.md#pdf-p493))
- [ ] **R012** 사용자의 특정 행동 이후 다음 단계의 코치마크에 접근 가능한 경우, 사용자의 행동 완수 여부를 시스템이 확인하도록 한다. ([p.487](../reference/krds-p0485.md#pdf-p487), [p.494](../reference/krds-p0485.md#pdf-p494))
- [ ] **R013** 모든 화면 크기에서 팝오버 영역이 완전히 표시되는지 확인한다. ([p.495](../reference/krds-p0485.md#pdf-p495))
- [ ] **R014** 스포트라이트와 인접 배경 간 명도 대비를 3:1 이상으로 제공한다. ([p.496](../reference/krds-p0485.md#pdf-p496))
- [ ] **R015** 코치마크는 사용자가 요청한 경우에만 실행되어야 한다. ([p.496](../reference/krds-p0485.md#pdf-p496))
- [ ] **R016** 관련 요소와 코치마크 팝오버 콘텐츠를 적절한 순서로 제공한다. ([p.496](../reference/krds-p0485.md#pdf-p496))

## 전체 원문 페이지

[485](../reference/krds-p0485.md#pdf-p485) · [486](../reference/krds-p0485.md#pdf-p486) · [487](../reference/krds-p0485.md#pdf-p487) · [488](../reference/krds-p0485.md#pdf-p488) · [489](../reference/krds-p0485.md#pdf-p489) · [490](../reference/krds-p0485.md#pdf-p490) · [491](../reference/krds-p0485.md#pdf-p491) · [492](../reference/krds-p0485.md#pdf-p492) · [493](../reference/krds-p0485.md#pdf-p493) · [494](../reference/krds-p0485.md#pdf-p494) · [495](../reference/krds-p0485.md#pdf-p495) · [496](../reference/krds-p0485.md#pdf-p496) · [497](../reference/krds-p0485.md#pdf-p497) · [498](../reference/krds-p0485.md#pdf-p498) · [499](../reference/krds-p0485.md#pdf-p499)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: ac3046c2871afefbf4e372c3edc0ae997a1dc2b07ecc50bb088fad6a9d7d2880. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
