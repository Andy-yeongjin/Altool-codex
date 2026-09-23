# 선택 작업 막대 부분 검증 · 2026-09-11

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

- 공통 팩 qa.12: ui-table-toolbar 배경 transparent, border 0; 선택 요약 margin 제거·줄바꿈 허용. data-selected-count 생략 시 앱이 전체 선택 요약을 소유한다. 기본 현재 행 집계 로직은 보존했다.
- 원본 CSS/JS, 회사 지침 V27-S02, BUSINESS-USAGE 및 Plan/Spec 동기화. 실행 중인 백업 test3 앱에 적용했으며 새 test3는 변경하지 않았다.
- 인앱 브라우저: 가람정밀/가온테크 선택 → 2/3개, 다음 페이지에서도 동일 선택 유지, 비교 모달의 두 기업 확인, 닫기·선택 해제 → 0/3개. 첫 페이지 복귀.
- 375×812: toolbar 배경 rgba(0,0,0,0), border 0px. width/scrollWidth 모두 319px. 요약 하단 1394.296875px, 작업 버튼 상단 1402.296875px: 8px 간격 줄바꿈. selection-summary는 정확히 1개. 콘솔 error/warn 없음.
- 앱 타입·린트·빌드 및 단위 테스트 7/7 통과. 관련 Python 정적 회귀 8/8, 공통 CSS 변수/대비, 팩 validate 및 생성물 check 통과.
- 이번 영역의 부분 검증이며 전체 oneshot 상태/과거 증거를 통과로 갱신하지 않았다. 다른 소비 앱 전체 시각 회귀는 미실시. 사용자 서버는 유지했다.
