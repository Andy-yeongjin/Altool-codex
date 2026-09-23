# 공통 섹션 프레이밍 · 2026-09-11

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

최신 보정: 제목→첫 콘텐츠 16px를 form/field-grid에서 일반 첫 콘텐츠로 확대한다. section-body는 padding, 표/상세/요약/지표/상태 및 표 래퍼는 기존 배치를 유지한다. ui-inline-actions의 검토 상태도 16px 적용 대상이다.

사용자 승인: 주요 콘텐츠 강조선 통일, 제목→폼 간격, 좌우 제목 높이 보정. 금액 표시와 상세 열 구성은 보존한다.

적용 표준: ui-change/form-ui → COMPANY-01/02, UI-02/03, FORM-01, 회사 guidance V27-05. 설치용 design.md의 TBD는 제품 원본 편집으로 확정하지 않는다.

구현 계약: theme.css의 헤더 최소 높이 42px·폼 간격 16px; components.css의 헤더 border-box·margin reset·2px 공통 선. 데이터 소유 선 앞의 헤더는 투명 border로 동일 공간을 유지한다. summary/metric/data-state도 기존 데이터 상단 토큰을 공유한다. 긴 텍스트는 고정 높이로 자르지 않는다. 표 내부 상태의 무테두리 예외는 유지한다.

검증: tests/test_data_top_border.py, test_section_group.py, fixtures/section-framing.html. 원본 생성 재현성·팩 무결성 및 브라우저 desktop/mobile의 제목 높이·폼 16px·단일 선을 확인한다. test5의 설치본은 자동 덮어쓰지 않는다.

후속 승인: 라벨 여백 중복 제거. runtime의 ui-field도 flex gap 6px를 소유하고 label margin은 0으로 통일한다. business/필터의 기존 6px와 합쳐지지 않는다. 고정 fixture에 텍스트·select·textarea·달력 래퍼를 포함하여 각각 6px를 실측하고 입력·날짜 선택·reset을 검사한다.

후속 승인: 인접 section/group의 모든 조합에 기존 section-gap을 적용하며 그룹 내부 중복은 금지한다. 날짜 달력 일요일은 #A2242C, 선택·비활성 상태의 기존 색은 우선한다. 일요일 시작 7열(요일 7칸+선행 공백 포함) 구조의 첫 열만 적용하고 월 그리드는 제외한다. 모바일 그룹→섹션 간격과 일요일 선택 전후를 실측한다.
