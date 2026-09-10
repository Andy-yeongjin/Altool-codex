# 04. 헤더(Header) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.135-149. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 로고·유틸리티·메뉴·검색 순서를 화면별로 대조한다. 비정부 서비스는 정부 로고를 기본 CI로 쓰지 않는다.
- [ ] 메뉴 열기·닫기, 검색, 언어 선택, 스크롤 고정, 모바일 전환을 실제 조작하고 아이콘 이름·건너뛰기를 확인한다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [header.html](../upstream/html/code/header.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 헤더의 스타일 수정을 최소화한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.139](../reference/krds-p0135.md#pdf-p139))
- [ ] **R002** 정부 로고는 항상 헤더의 왼쪽 상단에 제공한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.139](../reference/krds-p0135.md#pdf-p139))
- [ ] **R003** 헤더의 내부 컴포넌트를 일관된 순서로 배치한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.139](../reference/krds-p0135.md#pdf-p139))
- [ ] **R004** 핵심적인 정보만 간결하게 제공한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.139](../reference/krds-p0135.md#pdf-p139))
- [ ] **R005** 유틸리티 링크 그룹은 헤더 우측 상단에 제공한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.140](../reference/krds-p0135.md#pdf-p140))
- [ ] **R006** 유틸리티 링크 그룹을 디바이더로 구분하여 표현한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.140](../reference/krds-p0135.md#pdf-p140))
- [ ] **R007** 유틸리티 링크가 5개 이상 필요한 경우 드롭다운 메뉴를 사용한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.141](../reference/krds-p0135.md#pdf-p141))
- [ ] **R008** 언어 설정을 위한 드롭다운 메뉴에 국기를 사용하지 않는다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.142](../reference/krds-p0135.md#pdf-p142))
- [ ] **R009** 아이콘 버튼/링크에 텍스트 레이블을 제공한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.143](../reference/krds-p0135.md#pdf-p143))
- [ ] **R010** 메인 메뉴와 검색의 위치는 웹사이트의 목적에 적합한 형태로 제공한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.144](../reference/krds-p0135.md#pdf-p144))
- [ ] **R011** 화면을 스크롤 했을 때 헤더를 뷰포트 상단에 고정한다. ([p.138](../reference/krds-p0135.md#pdf-p138), [p.145](../reference/krds-p0135.md#pdf-p145))
- [ ] **R012** 화면 너비가 충분하지 않아 메인 메뉴를 표시할 수 없을 때 햄버거 메뉴 형태로 제공할 수 있다. ([p.146](../reference/krds-p0135.md#pdf-p146))
- [ ] **R013** 건너뛰기 링크를 최상단에 배치한다. ([p.147](../reference/krds-p0135.md#pdf-p147))
- [ ] **R014** 로고 이미지에 대체 텍스트를 제공한다. ([p.147](../reference/krds-p0135.md#pdf-p147))

## 전체 원문 페이지

[135](../reference/krds-p0135.md#pdf-p135) · [136](../reference/krds-p0135.md#pdf-p136) · [137](../reference/krds-p0135.md#pdf-p137) · [138](../reference/krds-p0135.md#pdf-p138) · [139](../reference/krds-p0135.md#pdf-p139) · [140](../reference/krds-p0135.md#pdf-p140) · [141](../reference/krds-p0135.md#pdf-p141) · [142](../reference/krds-p0135.md#pdf-p142) · [143](../reference/krds-p0135.md#pdf-p143) · [144](../reference/krds-p0135.md#pdf-p144) · [145](../reference/krds-p0135.md#pdf-p145) · [146](../reference/krds-p0135.md#pdf-p146) · [147](../reference/krds-p0135.md#pdf-p147) · [148](../reference/krds-p0135.md#pdf-p148) · [149](../reference/krds-p0135.md#pdf-p149)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: cf3edd428f97de2900fb1202f66a84612f46cdd9b82a9b6a383738a288413c92. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
