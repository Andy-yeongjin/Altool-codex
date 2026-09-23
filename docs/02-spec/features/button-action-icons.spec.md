# 작업 버튼 아이콘 기본 계약

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

상태: 구현 및 제한 범위 검증

## 범위·설계
사용자 승인: 일반 작업 버튼의 기본 외형을 아이콘+글자로 통일한다. 동작별 매핑은 internal/company/button-actions.json 한 곳에서 관리한다. 표준 라벨은 정확히 일치할 때만 자동 적용하고 업무 복합 라벨은 data-ui-action으로 의미를 지정한다. 알려지지 않은 라벨은 추정하지 않는다. 신규 의미는 매핑을 확장한다.

CompanyBusiness 배포 JS가 기존 공통 SVG에서 생성한 아이콘을 포함한다. 최초 DOM 준비 및 변경 시 .altool-ui 범위에서 적용한다. 기존 svg/img 보존, 자체 생성 SVG만 갱신한다. 동일 버튼 중복 방지, 링크는 data-ui-action 명시 시만 대상이다. aria-hidden/focusable=false로 이름은 글자가 소유한다.

제외: 날짜 셀·페이지 영역·탭·선택 옵션·정렬 버튼·아이콘 전용 버튼. data-ui-icon=none은 근거 있는 예외다. 달력 및 닫기 전용 계약과 버튼 실행/disabled/폼 submit 의미는 변경하지 않는다.

## 검증·잔여 범위
인앱 fixture에서 조회/초기화/해제/처리/명시 confirm의 매핑, 탭·none·알 수 없는 라벨 제외 확인. 조회 클릭→저장 라벨 변경 후 save 아이콘1개, 추가 클릭→동적 삭제 버튼 trash1개 확인. 375px 문서 overflow0. 기존 60 logic/API 검사 및 기본 아이콘 회귀 통과.

React hydration·대형 화면 성능과 모든 제품 버튼 전체 분모는 이번 fixture로 증명하지 않는다. 소비 프로젝트의 실제 브라우저·자산 검증 게이트를 유지한다. test5 자동 업그레이드 없음.
