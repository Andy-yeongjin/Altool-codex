# 37개 컴포넌트 변형 대조

출처: KRDS 2024.02 PDF p.114–552. 아래는 재사용 경로의 대조이며 전 페이지 시각·접근성 준수 인증이 아니다. 마크업/CSS에 표현된 states와 실제 브라우저 검증은 구분한다. 원본 키트의 샘플 데이터와 서버 미연결 버튼은 구현 완료로 계산하지 않는다.

| 의미 ID | 원문 페이지 | 선택 가능 변형 | 경계·검증 사항 |
|---|---|---|---|
| component.masthead | 114–120 | default, verification-disclosure | 정부기관 한정. 일반 회사 선택 금지. |
| component.identifier | 121–127 | default, light, dark | 정부기관 한정. 원본 high-contrast는 후대 키트 모드로 분리. |
| component.footer | 128–134 | company | 원본 정부 푸터는 회사 allowlist 제외. 법률 문구·연락처는 호스트의 승인된 원문을 연결. |
| component.header | 135–149 | company-vertical, company-horizontal, company-scroll-reveal | 원본 정부 헤더는 회사 allowlist 제외. 아이콘 세로/가로 정렬은 PDF135/136 렌더 대조. 실제 브랜드·검색 경로는 호스트 계약. |
| component.skip-link | 150–158 | default, visible, focus-only | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.main-menu | 159–175 | mobile, pc, simple | 단순 링크는 실제 대상 연결. 공식 PC/모바일 메뉴의 샘플 경로는 앱 정보 구조로 연결 필요. |
| component.breadcrumb | 176–188 | default | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.side-navigation | 189–203 | default, simple, dropdown | 단순/헤더 목록/모바일 드롭다운 경로. 원본 다단계 메뉴는 호스트의 탐색 구조에 맞추고 키보드 동작 확인. |
| component.in-page-navigation | 204–212 | default, linked | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.pagination | 213–235 | default, numbered, load-more | 숫자/이전다음/직접 이동/더보기 구현. 정적 데이터 집합 기준; 서버 페이지 요청은 호스트. |
| component.structured-list | 236–242 | default, table | 공식 목록/표/상세 구조 경로. 검색·정렬·상세 링크의 실제 데이터는 호스트. |
| component.critical-alerts | 243–250 | default | 공식 표현 경로. 실제 경보 발행·해제 조건과 최신성은 호스트 데이터. |
| component.calendar | 251–261 | default, range | 공식 단일/기간 달력 UI 경로. 예약 가능일/업무일 데이터 및 모든 연월 키보드 접근성은 앱 검증 필요. |
| component.disclosure | 262–269 | default | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.modal | 270–281 | default, sample, information, scrollable, important, confirmation, approval | 정보/중요 안내/확정/승인 필수 4유형 구현. 승인 유형만 Escape 차단, 명시적 거절 경로 제공. |
| component.badge | 282–287 | default, number, size | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.accordion | 288–298 | default, line | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.image | 299–306 | informational, decorative, functional, fallback, default | 정보/장식/기능/네이티브 오류 대체 조각. 원문 사진의 대량 복제가 아니라 목적별 구조/대체텍스트 자산. |
| component.carousel | 307–327 | default, banner | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.tab | 328–341 | default, vertical | 공식 수평 스타일 + authored 수직 키보드 탭. 각 호스트 탭 내용 연결 필요. |
| component.table | 342–353 | default, sortable | 정렬 작동 조각과 기본/규격 공식 조각. 대용량 서버 정렬·페이징은 호스트. |
| component.link | 354–367 | default | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.button | 368–381 | default, hierarchy, icon, size, text, with-icon | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.radio-button | 382–396 | default, radio-chip, radio-size | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.select | 397–404 | default, size, sorting, state | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.checkbox | 405–417 | default, chip, size, select-all | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.tag | 418–429 | default, link, filter, removable, label, add-filter | 비대화형 레이블/필터 선택/삭제 태그. 실제 검색 필터링은 이벤트 소비자가 연결. |
| component.step-indicator | 430–436 | default, adaptive-optional | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.spinner | 437–445 | indeterminate, determinate | 공식 불확정 + authored 확정 진행률. 실제 작업 진행률은 altool:progress 이벤트로 전달. |
| component.help-panel | 446–458 | default | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.tutorial-panel | 459–467 | default, retained-session | 공식 단계 UI 경로. 사용자 완료/다시 보지 않기 영속 기록은 호스트. |
| component.contextual-help | 468–484 | default, information, help | 정보(i)/도움(?) 팝오버 조각. 필수 정보는 밖에 유지하며 Escape/닫기 초점 복귀. |
| component.coach-mark | 485–499 | default, action-driven | 공식 단계 UI 경로. 호스트 실제 대상 위치와 키보드 흐름/영속 상태 검증 필요. |
| component.date-input | 500–512 | default, parts, single, approximate-month, month-year | 단일/연월일 분리/대략적 월. 날짜는 브라우저·순수 달력 검증, 서버 업무 가능일은 호스트. |
| component.textarea | 513–521 | default, counted | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.text-input | 522–532 | default, icon, size, state | 공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도. |
| component.file-upload | 533–552 | default, single, multiple-drop, transfer-states, image-optimize | 단일/다중 드롭·제한 오류·삭제 + 호스트 제어 준비/전송/완료/실패/취소·재시도 요청 UI. 실제 전송·진행률·재시도·악성파일 검사는 호스트 책임. |
