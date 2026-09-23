# 화면 유형별 조합 예제

모든 예제는 `company.css`와 `.krds-2024-tokens.altool-ui` 내부에 넣습니다.
아래는 업무 연결용 구조 예제이며 API 주소나 실제 저장 로직은 포함하지 않습니다.
실행 가능한 조합은 `business-preview.html`, 전체 소스는 `examples/business-body.html`과 `business-demo.js`를 참고하세요.

## 조회형

공통 골격은 guidance/company-ui.md V27-N01을 따른다. 단일 페이지는 헤더 중심, 다중 페이지는 데스크톱 사이드바/모바일 우측 햄버거를 기본으로 사용한다. 같은 메뉴를 이동하며 중복 나열하지 않는다.

```html
<div class="altool-ui krds-2024-tokens" id="app">
  <header class="ui-site-header"><img data-company-ci="inverse"><span class="ui-site-brand">업무 시스템</span></header>
  <div class="ui-app-shell">
    <aside class="ui-sidebar">
      <details class="ui-responsive-navigation" open>
        <summary>업무 메뉴</summary>
        <nav aria-label="업무 페이지">
          <a class="ui-nav-item" href="list.html" aria-current="page">내역 조회</a>
          <a class="ui-nav-item" href="request.html">신청</a>
        </nav>
      </details>
    </aside>
    <div class="ui-shell-main">
      <main class="ui-page-content">
        <div class="ui-page-heading"><div class="ui-page-title-row">
          <button type="button" class="ui-sidebar-toggle" data-sidebar-toggle aria-label="사이드바 닫기"></button>
          <h1 class="ui-page-title">내역 조회</h1>
        </div></div>
        <!-- 업무 본문 -->
      </main>
      <footer data-company-footer></footer>
    </div>
  </div>
</div>
<script>
const app = document.querySelector('#app');
const navigation = CompanyBusiness.responsiveNavigation(app);
const frame = CompanyBusiness.companyFrame(app, {assetsBaseUrl: '/designs/assets/'});
</script>
```

company.css와 business.js 로드 후 DOM마다 한 번 초기화한다. API가 공통 menu 아이콘을 넣고 760px 이하에서 헤더로 이동한다. 해제 시 `navigation.destroy()`로 이벤트를 정리한다. 모바일 6px 간격·회색 배경·56% 그림자·현재 페이지 강조는 공통 CSS가 소유한다. 사이드바 기본 폭은 210px이며 앱의 다른 페이지 밀도 결정과 구분한다.

회사명과 CI/문의 정보는 design/company.json에서 읽어 번들에 포함한다. assetsBaseUrl은 소비 앱에서 배포한 designs/assets/에 해당하는 URL이며 하위 HTML이면 상대 경로를 조정한다. 파일명에서 회사명을 만들거나 footer 문구를 복제하지 않는다. 실제 안내/문의 URL을 설정하지 않으면 해당 링크는 숨긴다. 팝업 같은 앱 동작이 필요하면 companyFrame의 onGuide/onContact 콜백으로 연결한다. 목업은 시연 콜백을 제공하지만 운영 앱은 실제 도움말과 연락처를 연결한다. 단일 페이지에는 sidebar/navigation API를 생략하고 같은 CI·본문·푸터를 재사용한다.

```html
<main class="ui-page-content">
  <div class="ui-page-heading"><h1 class="ui-page-title">신청 조회</h1></div>
  <form id="search-form">
    <div class="ui-field-grid">
      <div class="ui-field"><label for="company">법인</label><select id="company" name="company" data-ui-select><option value="">전체</option></select></div>
      <div class="ui-field"><label for="status">상태</label><select id="status" name="status" multiple><option value="pending">대기</option></select></div>
    </div>
    <div class="ui-inline-actions"><button class="primary" type="submit"><svg class="ui-icon" data-asset="icon.search" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>조회</button><button type="reset">초기화</button></div>
  </form>
  <section class="ui-section">
    <header class="ui-section-header"><h2 class="ui-section-title">신청 내역 <span id="result-summary" role="status" aria-atomic="true"></span></h2></header>
    <div id="results"><!-- ui-table-toolbar + ui-table-scroll + table --></div>
  </section>
</main>
```

조회 전 필수값/기간 검증 → 적용 조건 snapshot → 로딩 표시 → 조회 성공 시 결과 교체.
조건 변경만으로 기존 결과의 제목을 새 조건으로 바꾸지 않습니다. 실패하면 입력값과 재시도 동선을 유지합니다.

## 등록·수정형

```html
<form id="edit-form" novalidate>
  <div class="ui-error-summary" hidden></div>
  <div class="ui-field-grid">
    <div class="ui-field"><label for="title">신청 제목 <span class="ui-required">필수</span></label><input id="title" name="title" required></div>
    <div class="ui-field"><label for="amount">금액 (원)</label><input id="amount" name="amount" inputmode="decimal"></div>
  </div>
  <div class="ui-alert" data-status="error" id="save-error" role="alert" hidden></div>
  <div class="ui-form-actions"><button type="button" id="cancel">취소</button><button class="primary" type="submit" id="save">저장</button></div>
</form>
```

`B.validateForm` → `B.busy` → 저장 API → 성공 알림/지속 오류.
`B.dirtyGuard`를 사용해 미저장 이동 확인. 취소는 단순 페이지 이동이 아니라 변경 여부 확인 후 초기화/이동합니다.

## 목록·상세형

### 표 제목과 설명

표 자체의 컬럼 제목·본문은 모두 가운데 정렬하며 숫자도 같습니다(V27-S05). 회색은 thead 머리글에만 사용하고 tbody의 행 제목은 일반 셀과 같은 배경으로 둡니다. 정렬 화살표는 aria-sort에 따라 공통 CSS에서만 표시합니다.

보이는 소제목은 표 밖에 둔다. 이미 같은 의미의 섹션/모달 제목이나 펼침 summary가 있으면 그 ID를 재사용한다. caption은 접근성용으로 숨기고 연도·단위·적용 조건은 보이는 설명에 남긴다. 제목/설명 ID는 화면 내에서 고유해야 한다. caption 전체를 CSS로 일괄 숨겨 유일한 설명을 잃게 만들지 않는다.

```html
<section class="ui-section">
  <header class="ui-section-header">
    <h2 id="results-title" class="ui-section-title">조회 결과 <span role="status" aria-atomic="true">· 총 4건</span></h2>
    <p id="results-description" class="ui-section-meta">2025년 · 금액 단위: 백만원</p>
  </header>
  <div class="ui-table-scroll" tabindex="0" role="region" aria-labelledby="results-title" aria-describedby="results-description">
    <table aria-labelledby="results-title" aria-describedby="results-description">
      <caption class="sr-only">조회 결과</caption>
      <thead><tr><th scope="col">부서</th><th scope="col">금액</th></tr></thead>
      <tbody><!-- 실제 조회 결과 --></tbody>
    </table>
  </div>
</section>
```

조회형 표의 마지막 열에 업무키를 가진 `보기` 버튼을 둡니다. 선택 체크박스와 분리합니다.

```js
const panel = B.dialog(app, '신청 상세', {drawer:true});
async function openDetail(id) {
  B.systemState(panel.body, {type:'loading'});
  panel.open();
  // 실제 앱: 요청 취소/요청 번호 확인으로 늦게 도착한 이전 상세 결과 방지
  // 성공: ui-detail-grid로 내용 표시, 실패: systemState의 error와 재시도 연결
}
```

데이터를 교체할 때 상태용 `ui-system-state` 클래스를 제거하거나 별도 자식 노드에 상태를 표시합니다.
패널이 열린 동안 배경은 비활성화됩니다. 배경과 동시에 편집할 필요가 있으면 별도 분할 화면 구조가 필요합니다.

## 대시보드형

여러 섹션의 배치에는 `ui-section-group`을 사용합니다. 기본은 한 열 grid이며 간격은 공통 토큰 `--company-section-gap`에서 가져옵니다. 페이지 CSS는 열 비율과 breakpoint만 정합니다. flex로 바꾸어도 자식 섹션에 margin을 추가하지 않습니다. 기존 일반 세로 흐름의 섹션 간 margin과 그룹의 gap을 중복 적용하지 않습니다.

```html
<div class="ui-section-group dashboard-charts">
  <section class="ui-section" aria-label="추이"><!-- 제목 + 차트 --></section>
  <section class="ui-section" aria-label="분포"><!-- 제목 + 차트 --></section>
</div>
```

```css
/* 이 화면의 예시 비율/분기점이며 공통 고정값이 아닙니다. */
.dashboard-charts { grid-template-columns:minmax(0,2fr) minmax(0,1fr); }
@media (max-width:760px) { .dashboard-charts { grid-template-columns:minmax(0,1fr); } }
```

```html
<main class="ui-page-content">
  <div class="ui-page-heading"><h1 class="ui-page-title">예산 현황</h1></div>
  <form id="filters"><!-- 공통 조회조건 + 조회/초기화 --></form>
  <section aria-label="요약"><!-- 기존 ui-metric / ui-summary --></section>
  <section class="ui-section"><h2>부서별 현황</h2><div id="chart"></div></section>
  <section aria-label="상세 내역"><!-- 공통 표 --></section>
</main>
```

```js
B.barChart(document.getElementById('chart'), {
  title:'부서별 예산', unit:'만원',
  items:[{label:'재무팀', value:1250}, {label:'영업팀', value:3400}]
});
```

차트 단위와 표 단위가 다르면 명시합니다. 합계와 필터는 같은 데이터 원본에서 계산합니다.
차트 padding을 페이지 전용 CSS로 제거하지 않습니다. 음수·0·빈 데이터·긴 부서명도 지원해야 합니다.

## 가로 조회조건 실행 예제 · v27

`filter-bar-preview.html`에서 동작을 확인할 수 있습니다.

```html
<form class="ui-filter-bar">
  <div class="ui-filter-range" id="period">
    <div class="ui-field"><label for="from">승인 시작일</label><input id="from" name="from"></div>
    <div class="ui-field"><label for="to">승인 종료일</label><input id="to" name="to"></div>
  </div>
  <div class="ui-field"><label for="department">부서</label><select id="department" data-ui-select><option>전체 부서</option></select></div>
  <div class="ui-filter-actions"><button type="submit" class="primary"><svg class="ui-icon" data-asset="icon.search" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>조회</button><button type="reset">초기화</button></div>
</form>
```

`CompanyBusiness.dateRange(period)`와 `CompanySelect.enhanceAll()`을 한 번 초기화합니다. submit 핸들러에서 `period.validate()` 후 조회합니다.
