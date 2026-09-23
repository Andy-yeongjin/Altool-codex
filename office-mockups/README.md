# 사내 공통 UI 목업 5종

expenses.html에서 상단 메뉴로 다섯 화면을 이동한다. company.css/select.js/business.js를 원본 경로에서 읽으며 인터넷 의존성은 없다. 디자인 검토용이고 실서비스가 아니다. 동작 상태는 페이지 메모리만 사용한다.

- expenses.html: 경비 내역 조회·선택 처리
- request.html: 구매 신청·증빙 첨부
- detail.html: 결재 상세·처리 이력
- dashboard.html: 부서 예산·차트
- monitor.html: 연계 상태·실패 로그·모의 재처리

HTML 재생성: `node scripts/build-office-mockups.mjs` (저장소 루트에서 실행).
페이지 배치 CSS는 mockups.css, 시연 동작은 mockups.js. 공통 외형을 여기에 덮어쓰지 않는다.
조회 데이터의 날짜는 모두 2026-09-11로 가정한다. 시작일 이후 자료만 표시하며 날짜 자체는 이번 표의 표시 열에서 생략했다.
첨부는 공통 선택기를 연결했지만 실제 서버 업로드는 없다. 검토 상태 선택기로 정상·빈·오류·로딩을 볼 수 있다.
