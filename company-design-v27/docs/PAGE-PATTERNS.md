# 화면 유형별 조합 예제

모든 예제는 `company.css`와 `.krds-2024-tokens.altool-ui` 내부에 넣습니다.
아래는 업무 연결용 구조 예제이며 API 주소나 실제 저장 로직은 포함하지 않습니다.
실행 가능한 조합은 `business-preview.html`, 전체 소스는 `examples/business-body.html`과 `business-demo.js`를 참고하세요.

## 조회형

```html
<main class="ui-page-content">
  <div class="ui-page-heading"><h1 class="ui-page-title">신청 조회</h1></div>
  <form id="search-form">
    <div class="ui-field-grid">
      <div class="ui-field"><label for="company">법인</label><select id="company" name="company" data-ui-select><option value="">전체</option></select></div>
      <div class="ui-field"><label for="status">상태</label><select id="status" name="status" multiple><option value="pending">대기</option></select></div>
    </div>
    <div class="ui-inline-actions"><button class="primary" type="submit">조회</button><button type="reset">초기화</button></div>
  </form>
  <p role="status" id="result-summary"></p>
  <div id="results"><!-- ui-table-toolbar + ui-table-scroll + table --></div>
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
  <div class="ui-filter-actions"><button type="submit" class="primary">조회</button><button type="reset">초기화</button></div>
</form>
```

`CompanyBusiness.dateRange(period)`와 `CompanySelect.enhanceAll()`을 한 번 초기화합니다. submit 핸들러에서 `period.validate()` 후 조회합니다.
