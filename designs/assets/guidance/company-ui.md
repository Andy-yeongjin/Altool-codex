# 회사 UI v27 적용 계약

회사 승인 원천에서 채택한 외형·공통 동작이다. 실제 배치/조작 검증 완료를 의미하지 않는다. 클래스·API 예제는 `designs/assets/ui-kit/internal/company/`의 GUIDE.md, components.json, docs/BUSINESS-USAGE.md에 있다. 선택 항목의 해당 API와 docs/CONSISTENCY.md·PAGE-PATTERNS.md 관련 절을 읽는다.

<a id="common"></a>
- V27-P01: 브랜드 색의 단일 원천은 ui-kit/design/theme.css 상단 COMPANY BRAND PALETTE다. 주색/hover/active/선택 배경/헤더/전경/메뉴 그림자는 --company-brand-*를 통해 바꾼다. 이 문서의 파란색 HEX는 기본 팔레트 설명이며 회사 팔레트 변경을 금지하는 고정 계약이 아니다. 오류·경고·성공·진행 상태색, 중립 회색, CI는 자동 브랜드 치환하지 않는다. 브랜드 교체 후 실제 선택/포커스/텍스트 대비를 검사한다.
일반 작업 버튼은 기본적으로 공통 아이콘 + 글자를 사용한다. 동작→아이콘 매핑의 원천은 internal/company/button-actions.json이다. 배포 CompanyBusiness는 표준 라벨의 버튼과 data-ui-action을 자동 장식하며 동적 추가·라벨 변경도 반영한다. 업무별 복합 라벨은 해당 동작 키를 명시한다(예: 신청 내용 확인→confirm). 알려지지 않은 동작은 임의 아이콘을 추정하지 말고 공통 매핑에 합의 후 추가한다. 날짜 셀·페이지 번호·탭·선택 옵션·정렬 버튼은 제외하며 달력·닫기는 기존 아이콘 전용 계약을 따른다. 기존 svg/img는 중복 추가하지 않는다. data-ui-icon="none"은 기능 계약에 비적용 이유가 있을 때만 사용한다. 표시된 글자와 접근성 이름은 유지한다.
## 공통

- V27-01: 모든 실행 UI는 foundation.company-ui의 company.css와 krds-2024-tokens altool-ui 범위 및 registry에 등록된 v27 변형만 사용한다. 부족한 기능은 회사 extensions/recipes로 제공하며 이전 basic/services/upstream CSS·HTML·아이콘으로 대체하지 않는다. KRDS 원문·추출 자료는 제공하지 않으며 출처·라이선스는 internal/ATTRIBUTION.md에 기록한다.
- V27-02: 공통 외형은 design/theme.css·components.css를 단일 코드 원본으로 사용한다. #1554A0 주요색, #18334F 상단, 컨트롤4px/굵기500, standard34px·compact30px·comfortable42px(16px root) 및 coarse pointer44px 예외를 유지한다. 원형 상태점·직각 영역선 등 원문의 예외를 전부4px로 바꾸지 않는다.
  - CompanyBusiness 배포 런타임은 날짜/월 선택(calendar), 이전·다음(chevron-left/right), 코드 검색(search), 대화상자 닫기(x), 첨부 추가·파일·삭제(plus/file/trash)에 공통 SVG를 기본 내장한다. 앱이 별도로 주입하지 않아도 표시하며 외부 fetch는 없다. 기존 첨부 icons 옵션은 기본값을 키별 대체하고 중복 표시하지 않는다. 장식 SVG는 aria-hidden이며 버튼 이름·포커스를 보존한다. 다른 업무 버튼에 아이콘을 무조건 추가하라는 뜻은 아니다.
- V27-03: 상태·오류 문구는 messages/ko.json을 사용한다. business.js 배포본의 문구는 이 정본에서 생성하며 직접 편집하지 않는다. DB·권한·통신·성공 여부는 소비 앱이 결정한다. 샘플 저장과 서버 저장을 혼동하지 않는다.
- V27-04: Pretendard는 기존 사내 승인 폰트 자산 또는 승인 경로로 로드하고 미로딩 대체 글꼴을 확인한다. 좁은 폭·긴 값·200% 확대·키보드·모달 복귀·오류/빈/로딩과 앱 CSS 충돌을 실브라우저에서 검증한다. 코드/DOM 대역 테스트를 시각 검증으로 보고하지 않는다.
- V27-05: 여러 ui-section을 grid/flex로 묶을 때 부모에 ui-section-group을 사용한다. 간격은 부모의 --company-section-gap 기반 gap만 담당하고 직계 섹션의 시작 여백은 0으로 유지한다. 열 비율·반응형 전환은 화면 계약에서 정하며, 가로 배치의 상단 정렬과 한 열 전환 후 간격 중복을 실측한다. 묶음 밖의 일반 세로 흐름은 기존 섹션 간 여백을 유지한다.
  - 같은 부모 아래 인접한 section/group 조합도 --company-section-gap을 한 번 적용한다. 그룹 내부는 부모 gap만 사용하며 모바일 세로 전환에서도 그룹 뒤 독립 섹션이 붙지 않아야 한다.
  - 주요 콘텐츠(폼·차트·목록·이력)는 ui-section-header 아래에 공통 강조선 한 줄을 둔다. --company-data-top-width(기본 2px)·--company-data-top-color(기본 #1554A0)를 공유한다. 표·상세정보·요약·독립 데이터 상태처럼 자체 상단선이 있으면 제목 선은 투명하게 하여 한 줄만 보이게 한다. 중첩 영역에 장식선을 반복 추가하지 않으며 내부 행·입력·버튼·탭 경계선은 변경하지 않는다.
  - 제목 영역은 border-box 기준 --company-section-header-height(기본 42px)의 최소 높이와 동일한 padding을 사용한다. 선이 숨겨져도 공간은 보존하고 제목·보조 설명의 기본 margin은 0이다. 한 줄 제목의 좌우 높이와 중심을 맞추되 긴 제목·모바일 줄바꿈은 높이가 늘어나도록 허용한다. 여러 줄 헤더를 가로로 배치하는 화면은 같은 행의 높이를 추가로 검증한다.
  - 제목→첫 콘텐츠는 기본 16px(--company-section-form-gap, 기존 토큰명 유지)를 둔다. 폼뿐 아니라 ui-inline-actions·설명·일반 래퍼도 포함한다. ui-section-body는 기존 내부 padding이 간격을 소유한다. 자체 상단선을 가진 표/스크롤 래퍼(중간 래퍼 포함)·상세·요약·지표·데이터 상태는 기존 데이터 배치를 유지하여 중복 여백을 만들지 않는다. 첫 조작부가 제목 선에 붙지 않는지 검증한다. 금액 표시·상세 열 구성은 변경하지 않는다.

<a id="form"></a>
날짜·월 입력의 팝업 열기 버튼은 달력 SVG만 보이는 공통 data-icon-only 정사각형을 사용한다. aria-label/title은 달력 열기·월 선택 열기로 유지하며 공통 밀도/터치 크기와 키보드 초점·disabled/readOnly 연동을 보존한다.
## 입력·첨부

- V27-F01: CompanySelect.enhanceAll/refresh, CompanyBusiness.datePicker/dateRange/lookup/multiselect/validateForm/attachments 중 필요한 API만 초기화한다. native select/input 값·폼 제출·초기화·destroy를 보존하고 업무 검증·저장·파일 업로드는 앱에서 연결한다.
  - 날짜 달력은 일요일 요일명과 선택 가능한 일요일 숫자를 --company-calendar-sunday(기본 #A2242C)로 표시한다. 오늘인 일요일도 빨간 숫자와 오늘 테두리를 함께 표시한다. 선택된 날짜는 기존 파란 배경·흰 글자, 비활성 날짜는 기존 비활성 색을 우선한다. 월 선택에는 요일 색을 적용하지 않는다.
  - ui-field의 라벨→컨트롤 간격은 부모 gap 6px 한 곳에서 소유하며 직계 label의 margin은 0이다. 일반 폼과 필터 모두 동일하게 적용한다. textarea/select/달력 래퍼에도 라벨 여백을 별도로 더하지 않는다. 제목→폼 16px는 V27-05의 별도 영역 간격이다.
- V27-F02: 필수 라벨·인접 오류·오류 요약을 제공한다. 저장 중 중복 실행 차단, 실패 시 입력 보존, 저장 응답 전 성공 표시 금지, 저장 중 추가 편집의 dirty 상태를 유지한다. 13개 업무 API의 입력 계약은 docs/BUSINESS-USAGE.md에서 읽는다.
- V27-F03: 첨부는 실제 FileList/FormData·추가/중복/개별 해제/초기화/취소를 브라우저에서 확인한다. DataTransfer 테스트 대역으로 실제 업로드 완료를 선언하지 않는다.

<a id="search"></a>
## 조회·목록

- V27-S01: 가로 조건은 ui-filter-bar/field/filter-actions로 구성하고 조건별 단일 라벨·입력, 시작일/종료일 개별 라벨, 오류 별도 행을 유지한다. 긴 라벨은 공통 예약 높이를 조정하고 좁은 화면 줄바꿈을 확인한다.
- 세로 사이드 필터는 같은 ui-filter-bar에 data-layout="stack"을 지정한다. 라벨이 있는 입력과 버튼을 나란히 놓는 작은 툴바는 ui-field-actions로 입력 하단에 정렬하고, 페이지 직접 이동은 ui-page-jump의 가로 label/input 구조를 사용한다.
- V27-S02: 조회 → 초기화 순, 입력 조건과 적용 결과 조건을 구분하고 늦은 이전 응답으로 현재 결과를 덮지 않는다. 표 전체 작업과 선택 행 작업, 선택 체크박스와 상세 열기를 분리한다. 초기화는 명시적 초기값 복원이다.
  - 일괄 작업 버튼은 `선택 승인`·`선택 재처리`처럼 `선택 + 실제 동작`으로 명명하고 의미가 불명확한 `선택 처리`를 사용하지 않는다. 확인창·결과 안내도 같은 동작 용어를 사용한다. 실제 동작은 PRD/업무 계약에서 정하며 라벨 때문에 승인·정산 등의 기능을 임의로 추가하지 않는다. 업무 상태상 실행 가능한 항목만 선택·실행 대상으로 삼고 성공 여부는 실제 처리 결과로 표시한다. 아이콘은 승인=approve/check, 재처리=retry/refresh 등 해당 동작 매핑을 사용하며 일반 process-selection 매핑은 제공하지 않는다.
  - 조회·검색 실행 버튼의 기본 외형은 왼쪽 icon.search 돋보기 + 오른쪽 조회/검색 글자다. 공통 ui-icon 16px·currentColor로 버튼 전경색을 따르고 SVG는 aria-hidden/focusable=false로 처리한다. 버튼 이름은 글자로 유지한다. CompanyBusiness.lookup은 자동 제공하며 앱이 작성하는 필터 조회 버튼도 같은 공통 SVG를 사용한다. 이미 아이콘이 있으면 중복 추가하지 않고 초기화·신청·재처리까지 일괄 적용하지 않는다.
- 선택 작업은 배경·테두리 없는 ui-table-toolbar에서 왼쪽 ui-table-selection-summary에 선택 건수와 그 바로 아래 ui-table-selection-help 안내문을 묶고 오른쪽 ui-table-selection-actions에 버튼을 묶는다. 안내가 없으면 안내문만 생략한다. 해제 같은 보조 액션을 먼저, 주요 처리 액션을 마지막에 둔다. CSV·열 표시 같은 비선택 작업은 별도 도구 영역에 둔다. 여러 페이지의 선택을 앱이 관리하면 ui-table-selection에 전체 범위·건수·필요한 대상을 한 번만 표시하고 data-selected-count는 생략한다. 기본 data-selected-count는 현재 표시 행만 집계하므로 전체 선택과 혼동하지 않는다. 600px 이하에서는 요약 아래에 버튼 묶음을 오른쪽 정렬하며 버튼 자체도 좁으면 줄바꿈한다. 선택 전후 요약·버튼 영역을 유지하고 선택이 없으면 처리 버튼을 비활성화한다.
- V27-S03: 회사 표·tableTools·filter-presets·상세 패널·systemState API를 우선 사용하며 조건 저장에는 사용자/화면 범위 key와 실제 store adapter를 제공한다. 중요 오류는 사라지는 toast만으로 전달하지 않는다.
- V27-S05: 표의 기본 정렬은 컬럼 제목과 본문 전체 가운데 정렬이며 ui-number 숫자 셀도 포함한다. 회색 머리글 배경은 thead에만 적용하고 tbody의 행 제목 th는 일반 본문과 같은 기본 배경을 사용한다. scope=row 의미 구조는 유지한다. hover·선택·줄무늬는 행의 th/td 전체에 동일하게 적용한다. 합계 tfoot의 별도 강조는 유지한다. 정렬 방향은 th의 aria-sort와 공통 CSS가 한 번만 표시하며 앱에서 화살표 문자열을 중복 추가하지 않는다. 입력 필드·차트의 숫자 정렬은 이 표 계약의 변경 대상이 아니다.
- V27-S04: 표의 보이는 제목은 table 밖의 ui-section-header/ui-section-title에 둔다. 이미 같은 의미의 섹션·모달 제목이나 펼침 summary가 있으면 중복 제목을 추가하지 않는다. 연도·단위·적용 조건은 보이는 보조 설명으로 분리한다. caption은 sr-only로 접근성용 이름을 보존하고 표/스크롤 영역은 고유한 제목 ID를 aria-labelledby로, 보조 설명 ID를 aria-describedby로 연결한다. caption을 숨기기 전에 그 안의 고유한 정보가 화면 밖으로 사라지지 않는지 확인한다.
  - 조회 건수는 보이는 소제목 옆에 `사용 내역 · 총 4건`처럼 함께 표시한다. 별도 문단으로 반복하지 않는다. 건수 span은 role=status/aria-atomic=true로 갱신을 알리고 전체 제목을 매번 교체하지 않는다. 총 건수는 적용된 조건의 전체 결과 수이며 현재 페이지 행 수·선택 건수와 구분한다. 전체 수를 모르면 `표시 4건`처럼 범위를 명시하고 로딩·실패를 0건으로 표시하지 않는다. 선택 건수·선택 안내·액션은 기존 ui-table-toolbar에 유지한다. 좁은 화면에서 제목과 건수가 잘리지 않는지 확인한다.
  - 표와 ui-detail-grid의 상단선은 V27-05의 공통 강조선 원칙을 따른다. 선은 데이터 컴포넌트가 소유하며 스크롤 래퍼 상단선과 해당 데이터 영역 제목 밑줄을 중복 표시하지 않는다. 중간 래퍼 유무와 모바일에서도 한 줄인지 확인한다. 내부 행 구분선·머리글 배경은 유지한다.

<a id="navigation"></a>
## 페이지·탐색

- V27-N01: 상단·좌측·현재 위치·탭·페이지 이동은 회사 클래스와 선택 상태를 사용한다. 페이지 제목22px/500·여백20px·하단 외형을 사용하되 열/카드 개수는 업무에 맞게 구성한다.
  - 회사명·CI 경로·담당부서·내선·운영시간·안내/문의 URL은 ui-kit/design/company.json이 단일 원천이다. 회사명은 CI 파일명에서 추론하지 않는다. companyFrame에 소비 앱의 assetsBaseUrl을 전달하여 등록 CI와 alt/푸터 이름을 연결한다. 헤더 맨 왼쪽에 높이34px의 비율 보존 CI, 그 옆에 업무 시스템 이름을 둔다. 남색 헤더는 inverse 변형을 사용한다.
  - 데스크톱 사이드바 토글은 ui-page-title-row 안의 본문 제목 왼쪽 ui-sidebar-toggle[data-sidebar-toggle]이다. 아이콘 menu 16px/조작영역44px, 기본 펼침, 접으면 별도 레일 없이 본문을 확장한다. aria-controls/expanded와 열기·닫기 이름을 갱신한다. 모바일은 본문 토글을 숨기고 헤더 우측 햄버거만 표시한다.
  - 푸터는 ui-shell-main 안에서 본문 다음에 두고 얇은 상단선, 왼쪽 회사명/문의 정보, 오른쪽 이용 안내·문의로 구성한다. 짧은 본문에서도 하단 배치하되 fixed로 본문을 가리지 않는다. 모바일은 두 줄 이상 자연스럽게 흐른다. CI·제작 버전·디자인 팩 설명은 반복하지 않는다. 빈 문의 필드는 숨기며 isExample=true인 연락처에는 예시 표시를 유지한다. 실제 도입 연락처를 확정하기 전 실제 정보처럼 표시하지 않는다. URL/콜백 없는 안내 버튼은 생성하지 않는다. 푸터의 보조 텍스트 액션은 아이콘 없는 예외다.
  - 기본 화면 골격: 단일 페이지는 헤더 중심으로 구성하고 불필요한 사이드바를 만들지 않는다. 여러 페이지는 데스크톱 ui-sidebar, 모바일(760px 이하) 헤더 우측의 아이콘 전용 햄버거를 기본으로 사용한다. CompanyBusiness.responsiveNavigation과 ui-app-shell/ui-responsive-navigation으로 같은 메뉴를 이동하며 중복 렌더링하지 않는다. 현재 페이지는 aria-current로 표시하고 페이지 내부 탭은 페이지 수에 포함하지 않는다. 모바일 목록은 기본 접힘, 회색 #F1F3F5 배경·옅은 공통 테두리·헤더 하단과 6px 간격·그림자 0 8px 20px rgba(24,51,79,.56)을 사용한다. menu 공통 아이콘과 44px 트리거, 접근 가능한 이름, Escape/바깥 클릭 닫힘, 키보드 페이지 이동을 유지한다. 명시적인 사용자 디자인·요구로 다른 구조를 쓰면 기능 계약에 근거를 남긴다.
- 이동용 a.button은 파란 채움 없이 파란 글자로 표시하고 hover/active 밑줄과 focus 외곽선을 유지한다. 주요 실행 button.primary와 구분한다. 어두운 ui-site-header에서는 ui-site-brand/ui-site-nav/ui-nav-item을 연결해 흰 글자·포커스를 유지한다.
- V27-N02: 모달·상세 패널은 닫기/Escape/포커스 복귀를 검증한다. 가장 안쪽 팝업부터 닫으며 숨긴 배경과 동시 편집하지 않는다. 조직 탐색은 native disclosure이며 ARIA tree 완전 구현으로 주장하지 않는다.

<a id="transaction"></a>
## 처리·이력

- V27-T01: 저장·승인·반려·취소는 실제 서버 결과와 구분하고 부분 성공은 성공/실패 건수와 실패 항목을 표시한다. 처리 이력의 담당자·시간·상태·의견은 실제 데이터에서 연결하며 예제의 처리 순서를 업무 정책으로 사용하지 않는다.
- V27-T02: 날짜는 YYYY-MM-DD, 월은 YYYY-MM, 표시 일시는 시간대 계약을 명시한다. UTC 저장/전송·Asia/Seoul 표시라는 헌법 계약을 유지하고 표시 예제로 저장 형식을 바꾸지 않는다. 코드 선행0과 0/빈값의 구분을 보존한다.

<a id="dashboard"></a>
## 대시보드

- V27-D01: 제목 → 조건 → 요약 → 차트 → 상세 표 순서를 기본으로 삼되 업무 흐름을 우선한다. ui-metric/summary와 barChart를 사용하고 차트마다 임의 카드 외형을 만들지 않는다. 차트 단위·음수/0/빈값·긴 항목·접근 가능한 대체 표를 유지한다.
- V27-D02: 합계·필터는 같은 데이터 원천에서 계산하며 큰 정수·금액의 정확한 계산은 승인된 십진 연산/서버가 담당한다. formatNumber는 표시용이다. 차트 실제 글자 크기·폭/축소·잘림은 UI-03으로 실측한다.
