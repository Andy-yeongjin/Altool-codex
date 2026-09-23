# 공통 업무 요소 사용 가이드 · v27

기존 승인 디자인을 유지한 업무 자산입니다. v25 업무 요소 12종, v26 첨부 A, v27 가로 조회조건 패턴을 포함합니다. CSS의 외형, JS의 상호작용, 앱의 업무 처리를 구분합니다.
`business-preview.html`은 12개 요소를 한 화면에서 조작할 수 있는 독립 예제입니다.
예제 데이터는 DB와 연결되지 않으며 조건 저장은 메모리에만 저장합니다.

## 불러오기

CI 이미지 URL에는 빌드 시 원본 내용의 hash를 붙인다. 같은 파일명으로 CI를 교체해도 재빌드한 runtime을 배포하면 새 이미지를 요청한다. 소비 앱도 갱신된 runtime을 로드하도록 번들 fingerprint 또는 버전 URL을 사용한다.

회사 프레임은 `CompanyBusiness.companyFrame(root,{assetsBaseUrl,onGuide,onContact})`로 초기화한다. `assetsBaseUrl`은 필수 배포 자산 루트 URL이다. `data-company-ci="inverse"` 이미지와 `data-company-footer`를 회사 설정에서 채운다. 회사 정보 수정은 design/company.json→제품 재빌드/릴리스 순서이며 runtime을 직접 수정하지 않는다. links.guide/contact가 있으면 실제 링크, 없으면 제공한 콜백 버튼, 둘 다 없으면 숨김이다. 콜백을 사용하는 SPA는 해제 시 반환 객체의 destroy()로 이벤트를 정리한다. 이름은 alt와 저작권에 공통 사용하며 앱 시스템 이름과 분리한다.

responsiveNavigation은 본문 제목 왼쪽의 `ui-sidebar-toggle[data-sidebar-toggle]`을 지원한다. 데스크톱 접기 상태는 페이지 내에서 유지되며 새 페이지 진입 시 펼침으로 시작한다. 모바일 전환에서도 중복 메뉴를 만들지 않고 기존 헤더 햄버거만 사용한다. 골격은 PAGE-PATTERNS를 따른다.

```html
<link rel="stylesheet" href="/assets/company.css">
<div class="krds-2024-tokens altool-ui" id="company-app">
  <!-- 업무 화면 -->
</div>
<script src="/assets/select.js"></script>
<script src="/assets/business.js"></script>
<script>
  CompanySelect.enhanceAll();
  const B = CompanyBusiness;
  const app = document.getElementById('company-app');
</script>
```

`business.js`는 독립 실행 가능하며 `select.js`는 단일 드롭다운을 사용할 때 필요합니다.
자동으로 모든 필드를 변환하지 않습니다. 필요한 요소만 한 번 초기화하고 SPA 화면 제거 시 반환된 `destroy()`를 호출합니다.
`datePicker`가 들어 있는 범위를 `dateRange`로 또 초기화하지 마세요. 범위 함수가 두 선택기를 생성합니다.
날짜는 서버 날짜·시간대로 전환하지 않은 업무용 문자열입니다. 시간대가 필요한 기록은 ISO8601 오프셋을 함께 전달합니다.
모든 데이터 문자열은 DOM의 `textContent`로 출력합니다. HTML을 데이터에 넣지 않습니다.

## 제공 요소와 API

| 요소 | 공통 클래스 | 함수 / 데이터 계약 |
|---|---|---|
| 날짜·월 | `ui-date-field`, `ui-calendar` | `B.datePicker(input, {month:false})` → `validate`, `open`, `destroy` |
| 기간 | `ui-date-range` | `B.dateRange(root, {month:false})` → `validate`, `set(from,to)`, `destroy` |
| 코드 검색 | `ui-lookup-field`, `ui-lookup-name` | `B.lookup(root, {title, search, onSelect})` → `open`, `destroy` |
| 다중 선택 | `ui-multiselect`, `ui-multi-option` | `B.multiselect(select)` → `value`, `refresh`, `destroy` |
| 상세 폼 | `ui-field-grid`, `ui-field`, `ui-detail-grid` | 상세는 `dl/dt/dd`, 입력은 label과 input을 연결 |
| 표 작업 | `ui-table-toolbar`, `ui-table-scroll` | `B.tableTools(root, {onAction})` → `refresh`, `selected`, `setColumn`, `destroy` |
| 저장·오류 | `ui-error-summary`, `ui-alert`, `ui-toast` | `validateForm`, `busy`, `confirm`, `toast`, `dirtyGuard` |
| 상세 패널 | `ui-dialog ui-drawer` | `B.dialog(app, title, {drawer:true})` → `element`, `body`, `actions`, `open`, `close`, `destroy` |
| 조직 탐색 | `ui-org-tree` | `B.tree(root, items, {onSelect})` |
| 처리 이력 | `ui-history` | `B.timeline(root, items)` |
| 조건 저장 | `ui-presets` | `B.presets(root, {store,key,capture,apply})` → `ready`, `refresh`, `destroy` |
| 차트 | `ui-business-chart` | `B.barChart(root, {title,unit,items})` |
| 시스템 상태 | `ui-system-state` | `B.systemState(root, {type,message,onAction})` |

선택 작업 막대는 배경·테두리 없이 요약과 버튼을 배치합니다. 기본 `[data-selected-count]`는 현재 표시 행의 건수를 갱신합니다. 여러 페이지의 선택을 앱이 소유하면 이를 생략하고 `.ui-table-selection`에 앱의 전체 선택 요약을 한 번만 렌더링합니다(`role="status"`). `selected()`와 기본 batch action 활성화는 여전히 현재 표의 행 기준이며 전체 선택 실행/해제는 앱이 관리합니다.

날짜·월·기간은 조사 목록의 한 그룹으로, 전체 카탈로그에는 12개 그룹으로 표시됩니다.

## 01. 날짜·월·기간

```html
<div id="period" class="ui-date-range">
  <div><label for="from">시작일</label><input id="from" name="from"></div>
  <div><label for="to">종료일</label><input id="to" name="to"></div>
</div>
```

```js
const period = B.dateRange(document.getElementById('period'));
period.set('2026-09-01', '2026-09-30');
if (!period.validate()) return; // 조회 실행 전에 확인
// 월 범위는 {month:true}; YYYY-MM 형식 사용
```

입력은 text로 유지하며 직접 입력과 공통 달력을 함께 제공합니다. 윤년·존재하지 않는 날짜·역전 기간을 검증합니다.
`required`, `min`, `max`, `disabled`, `readonly`를 사용할 수 있습니다. 직접 `.value`를 변경하면 `validate()`를 호출하세요.
달력의 날짜 셀은 방향키로 이동하고 Enter/Space로 선택, Esc로 닫습니다. 이전/다음은 월 이동, 월 선택기는 연도 이동입니다.
기간 프리셋은 앱이 기준일과 회계 규칙을 정한 뒤 `period.set()`으로 연결합니다. 예제의 이번 달은 실행 장치의 오늘 기준입니다.
날짜 달력은 7열 가독성을 위해 별도 폭(최대 308px)을 사용합니다. 값 선택 드롭다운과 다중 선택 목록은 입력창 폭에 맞춥니다.

## 02. 코드·명칭 검색

```html
<label for="department">부서</label>
<div id="lookup" class="ui-lookup-field">
  <input id="department" name="department" aria-label="부서 코드">
  <button type="button">검색</button>
  <span class="ui-lookup-name" data-lookup-name aria-live="polite"></span>
</div>
```

```js
B.lookup(document.getElementById('lookup'), {
  title: '부서 검색',
  async search(query, {signal}) {
    // 권한·필터는 서버에서 적용. 반환: [{code:'FIN', name:'재무팀'}]
    return departmentService.search(query, {signal});
  },
  onSelect(row) { selectedDepartment = row.code; }
});
```

선택 시 원본 input의 값과 명칭을 바꾸고 `change`, `company:lookup` 이벤트를 보냅니다.
직접 입력 시 이전 명칭을 지우고 `company:lookup-input`을 보냅니다. 직접 입력한 코드의 존재·권한 확인은 앱이 검증합니다.
새 조회·닫기는 이전 요청을 취소하며, 늦게 도착한 이전 결과는 무시합니다.
결과는 한 번에 반환받는 목록입니다. 대규모 마스터 데이터는 서버 검색으로 결과 수를 제한하고 페이지 조회가 필요하면 별도 확장하세요.

## 03. 다중 선택

```html
<label for="targets">대상 부서</label>
<select id="targets" name="targets" multiple>
  <option value="FIN" selected>재무팀</option><option value="HR">인사팀</option>
</select>
```

```js
const targets = B.multiselect(document.getElementById('targets'));
targets.value = ['FIN', 'HR']; // 입력 상태만 변경
const values = targets.value; // 문자열 배열
```

원본 multiple select를 폼 데이터 기준으로 유지합니다. 사용자 변경은 input/change 이벤트를 보냅니다.
검색 결과 전체 선택은 현재 검색에 일치하고 사용 가능한 항목에만 적용됩니다. 선택 해제도 사용 가능한 항목 대상입니다.
비활성/숨김 항목은 선택 조작에서 제외합니다. 검색해도 기존 선택은 유지합니다. 체크박스는 Tab 이동·Space 선택을 사용합니다.
프로그래밍으로 option.selected를 변경한 뒤에는 `refresh()`를 호출합니다. form reset은 반영됩니다.

## 04. 폼·읽기 전용 상세

`ui-field-grid`는 기본 2열, 좁은 화면 1열입니다. 입력 항목은 `ui-field`로 묶고 라벨/필수 여부/도움말을 제공합니다.
`ui-detail-grid`는 `dl > div > dt + dd` 구조를 사용합니다. 읽기 전용 정보가 단순 조회 목적이면 input 대신 상세 표시를 사용합니다.
폼의 줄바꿈과 라벨 위치는 해당 화면 유형 내에서 일관되게 유지합니다. 금액은 단위와 오른쪽 정렬, 숫자는 `ui-number`를 사용합니다.

## 05. 표·일괄 작업

일괄 버튼은 `선택 승인`·`선택 반려`·`선택 재처리`처럼 실제 동작을 명시합니다(V27-S02). `선택 처리`/`data-ui-action="process-selection"`은 사용하지 않습니다. 기존 호출은 업무 의미에 맞는 approve/reject/retry 등으로 변경합니다. 내부 data-batch-action 키는 앱 콜백 식별자이며 표시 라벨·아이콘과 별개입니다. 승인 대기/실패 등 실행 가능한 상태의 선택과 확인창·결과 문구도 같은 업무 동작에 맞춥니다.

조회 건수는 V27-S04에 따라 ui-section-title 안의 별도 span(role=status, aria-atomic=true)에 `· 총 N건`으로 표시합니다. 전체 건수가 불명확하면 `· 표시 N건`으로 범위를 구분합니다. 선택 건수는 표 도구 영역에 별도로 유지하며 전체 건수를 별도 문단으로 반복하지 않습니다. 로딩·오류는 결과 0건과 다릅니다.

표의 컬럼 제목과 본문은 숫자(ui-number)까지 모두 가운데 정렬합니다. 회색 머리글은 thead에만 적용하며 tbody의 th scope=row는 일반 본문과 같은 배경입니다. 행 hover/선택/줄무늬는 th/td 모두에 적용하고 합계 강조는 유지합니다. 정렬 버튼은 라벨만 넣고 th의 aria-sort를 갱신합니다. 화살표는 공통 CSS가 표시하므로 앱에서 별도로 붙이지 않습니다. 폼 입력과 차트 숫자 정렬은 변경하지 않습니다.

공통 섹션 프레이밍은 guidance/company-ui.md의 V27-05를 따릅니다. ui-section-header의 제목·메타 margin을 재추가하지 않고, 제목 다음 form/ui-field-grid는 공통 16px 간격을 사용합니다. 주요 영역의 2px 강조선은 제목 또는 데이터 컴포넌트 한 곳만 소유합니다. ui-section-group의 한 줄 제목은 기본 42px 높이를 공유하며, 긴 제목은 자르지 않고 줄바꿈합니다.

예제의 전체 마크업은 `examples/business-body.html`의 `requests-table`을 참고하세요.
일반 작업 버튼의 기본은 아이콘 + 글자입니다. `button-actions.json`이 동작별 공통 매핑을 소유합니다. `business.js`는 표준 라벨을 자동 적용하며 비표준 업무 라벨은 `<button data-ui-action="confirm">신청 내용 확인</button>`처럼 의미를 지정합니다. 새 DOM과 라벨 변경도 반영합니다. 명시 호출이 필요하면 `CompanyBusiness.decorateButtons(root)`를 사용합니다. 기존 SVG/img는 보존하며 날짜 셀·페이지 번호·탭·선택 옵션·정렬 버튼은 자동 장식하지 않습니다. 알 수 없는 라벨은 무작위로 추정하지 않습니다. `data-ui-icon="none"` 예외에는 기능 계약상 근거를 남깁니다.
조회·검색 실행 버튼은 공통 icon.search를 글자 왼쪽에 넣는 것이 기본입니다. ui-icon(16px), currentColor, aria-hidden=true 및 focusable=false를 적용하고 글자 라벨을 유지합니다. CompanyBusiness.lookup은 자동 제공하지만 앱이 직접 만드는 조회 폼 버튼은 PAGE-PATTERNS.md의 SVG 포함 예제를 따릅니다.
날짜·월 입력 옆의 열기 버튼은 `data-icon-only` 정사각형 버튼이며 달력 SVG만 표시합니다. 접근성 이름과 title은 각각 `달력 열기`/`월 선택 열기`입니다. 크기는 기존 공통 밀도·터치 토큰을 따릅니다. 달력 내부 이전·다음 버튼은 이 변경 대상이 아닙니다.
배포 `business.js`는 공통 SVG 원본에서 생성한 기본 아이콘을 포함합니다. 날짜·월(calendar), 달력 이동(chevron-left/right), 코드 검색(search), 대화상자 닫기(x), 첨부(plus/file/trash)는 별도 아이콘 주입 없이 표시됩니다. 첨부 `icons` 옵션은 기존처럼 키별로 덮어쓰며 SVG를 중복 표시하지 않습니다. 자산 파일 로딩 경로를 앱이 따로 지정하거나 외부 요청을 추가할 필요가 없습니다. JS 제작 원본을 직접 배포하지 말고 생성된 dist/business.js를 사용합니다.
`data-select-all`, `data-row-select` 체크박스와 `data-table-toolbar`, `data-selected-count`, `data-batch-action`을 조합합니다.
선택 건수와 선택 조건 안내는 왼쪽 `ui-table-selection-summary`에 넣고 안내는 건수 아래 `ui-table-selection-help`로 표시합니다. 버튼은 오른쪽 `ui-table-selection-actions`에 보조 → 주요 순서로 묶습니다. 600px 이하에서는 버튼 묶음이 다음 줄로 이동합니다. CSV·열 표시 등 선택과 무관한 도구는 별도 영역에 둡니다. 선택 전후에도 영역을 유지합니다.

```html
<div class="ui-table-toolbar" data-table-toolbar>
  <div class="ui-table-selection-summary">
    <span data-selected-count role="status"></span>
    <p class="ui-table-selection-help">현재 표시된 행을 선택할 수 있습니다.</p>
  </div>
  <div class="ui-table-selection-actions">
    <button type="button" data-batch-action="reject">선택 반려</button>
    <button type="button" data-batch-action="approve" class="primary">선택 승인</button>
  </div>
</div>
```

각 행 체크박스의 value에는 표시 순번이 아닌 안정적인 업무키를 넣습니다.

```js
const table = B.tableTools(root, {
  async onAction(action, ids) {
    // 확인 → 서버 처리 → 응답 성공/실패별 표시 → 목록 갱신
  }
});
table.setColumn(2, false); // 0부터 시작하는 열 인덱스
```

전체 선택은 현재 DOM에 표시된 사용 가능한 행만 대상으로 합니다. 전체 서버 결과 선택이라고 표시하지 마세요.
행을 교체하면 `refresh()`를 호출합니다. 정렬 버튼은 초기화 시 있는 헤더에 연결됩니다.
`data-sort-column`은 열 인덱스, 숫자 정렬은 `data-sort-type="number"`와 셀의 `data-sort-value` 원시 숫자를 사용합니다.
서버 페이지 정렬·페이징은 앱의 별도 조회 로직으로 구현하고 이 클라이언트 정렬과 중복 연결하지 않습니다.
CSV 내보내기는 예제에 포함되어 있습니다. 서버 내보내기는 권한·범위·데이터 규모에 맞게 앱이 연결합니다.

## 06. 저장·오류·미저장 변경

```js
const guard = B.dirtyGuard(form);
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!B.validateForm(form)) return;
  const submittedSnapshot = guard.capture();
  B.busy(saveButton, async () => {
    await service.save(new FormData(form));
    guard.markClean(submittedSnapshot);
    B.toast(app, '저장되었습니다.');
  }).catch(error => showPersistentError(error));
});
// 내부 화면 이동 직전
if (await guard.mayLeave(app)) navigate();
```

`busy`는 중복 클릭을 차단하고 실패해도 버튼 상태를 복구합니다. 서버 중복 처리 방지는 서버의 업무키/멱등성 검증으로 처리하세요.
서버 성공 이후에만 `markClean`을 호출합니다. 저장 도중 추가 편집한 내용은 제출 시점 snapshot과 달라 미저장 상태로 남습니다.
`dirtyGuard`는 이름 있는 form 데이터 기준입니다. 커스텀 에디터·서버 상태·동일 파일명 파일 교체의 정밀 비교는 앱이 확장합니다.
미선택 파일 입력의 임시 File 생성 시각은 변경으로 취급하지 않으며, 이름 있는 0바이트 파일은 실제 선택으로 구분합니다. `mayLeave()`는 변경이 없거나 사용자가 **변경 내용 버리고 이동**을 선택한 경우에만 true입니다. 취소·Escape·닫기는 false이며 입력을 유지합니다. 이 확인은 저장을 수행하지 않습니다.
페이지 종료 경고는 브라우저의 기본 beforeunload 동작이며 표시 문구와 노출 여부는 브라우저가 결정합니다.
폼을 `novalidate`로 설정하고 `validateForm`을 호출하면 오류 요약 링크 및 필드 강조를 제공합니다.
서버 오류는 지속되는 `ui-alert`로 표시하세요. 여러 건 부분 실패는 성공/실패 개수와 실패 업무키 목록을 남깁니다.
`toast(app, message, {duration:7000})`는 중요하지 않은 완료 알림용입니다. 처리 실패·필수 조치를 자동으로 사라지는 알림만으로 처리하지 마세요.
`confirm(app,{title,message,action,danger})`는 Promise<boolean>을 반환하고 취소에 초기 포커스를 둡니다.

## 07. 상세 패널

`B.dialog(app, '신청 상세', {drawer:true})`로 만든 뒤 `body`와 `actions`에 DOM을 추가하고 `open()`합니다.
모달형 우측 패널입니다. 열린 동안 배경은 비활성화되며 목록 스크롤 위치는 유지합니다. 닫으면 열기 버튼으로 포커스를 되돌립니다.
배경과 패널을 동시에 편집하는 비모달 분할 화면은 이번 제공 범위가 아닙니다.

## 08. 조직 탐색

데이터: `[{id, label, expanded?, disabled?, children?: [...] }]`.
계층 목록과 native details를 사용합니다. 부서 선택과 하위 항목 펼치기를 구분하며 Tab/Enter/Space로 조작합니다.
ARIA tree 역할이나 방향키 전용 트리 탐색을 선언하지 않습니다. 대규모 지연 로딩 트리는 앱이 확장합니다.

## 09. 처리 이력

데이터: `[{status, statusLabel, actor, time, timeLabel?, comment?}]`.
`time`은 시간대 포함 ISO8601, `timeLabel`은 표시용 문자열입니다. 앱이 전달한 순서를 유지합니다.
전사 기본은 오래된 기록 → 최신 기록 순으로 제안합니다. 담당자·시간·상태·의견은 색상 없이도 읽을 수 있어야 합니다.

## 10. 조회조건 저장

```js
B.presets(root, {
  key: 'company:app:screen:user:v1',
  store: {get: async key => [], set: async (key, records) => {}},
  capture: () => ({from: from.value, to: to.value}),
  apply: values => period.set(values.from, values.to)
});
```

실제 store는 앱의 사용자별 API를 연결합니다. 예제는 메모리 Map이므로 새로고침 시 초기화됩니다.
키는 회사·앱·화면·사용자·스키마 버전을 포함합니다. 권한이 다른 사용자 간 저장 조건을 공유하지 않습니다.
`capture`는 JSON으로 저장 가능한 명시적 허용 필드만 반환하고 `apply`는 허용된 값만 적용합니다.
불러오기는 입력값만 복원하며 조회를 자동 실행하지 않는 것이 기본입니다. 삭제는 저장된 조건 한 건만 삭제합니다.
현재 제공 기능은 추가·불러오기·삭제입니다. 덮어쓰기·이름 변경·공유·기본값 지정은 포함하지 않습니다.
저장 adapter의 저장 실패·조회 실패는 안내문으로 남깁니다. 데이터 병합·동시 수정 충돌은 store 계층이 처리합니다.

## 11. 차트

`B.barChart(root,{title,unit,items:[{label,value}]})`는 공통 가로 막대 차트와 펼칠 수 있는 데이터 표를 함께 만듭니다.
음수·양수·0을 같은 척도로 표시합니다. 내부 위 여백 16px, 항목 간격 14px, 기본 파랑, 음수 빨강, 숫자 오른쪽 정렬을 사용합니다.
값은 유한 숫자만 허용합니다. 빈값과 0을 혼동하지 마세요. 데이터가 없으면 빈 상태를 표시합니다.
CSS 변수 `--company-chart-primary`, `--company-chart-negative`, `--company-chart-grid`를 제공하며 다른 차트 라이브러리에도 같은 값을 적용합니다.
선·누적·원형 차트의 렌더러는 이번 배포에 포함하지 않습니다. 다른 유형을 사용하면 축·단위·범례·데이터 표 규칙을 그대로 적용합니다.

## 12. 시스템 상태

`type`: `error`, `forbidden`, `expired`, `empty`, `loading`.
`message`는 상황 설명, `onAction`은 재조회·권한 안내·재로그인·조건 변경 등의 앱 함수입니다.
권한 검사, 인증 갱신, 통신 재시도 자체를 공통 UI가 수행하지 않습니다.
인증 토큰을 CSS·예제·저장조건에 넣지 않습니다. 세션 만료 시 저장되지 않은 내용의 처리 정책은 앱에서 결정합니다.

## 실행 환경과 한계

현대 브라우저의 dialog, MutationObserver, Intl, AbortController를 사용합니다. 네트워크 라이브러리 의존성은 없습니다.
Popover 지원 브라우저에서는 최상단 레이어를 사용하며 미지원 시 fixed 위치로 대체합니다. 대체 경로는 조상의 transform/overflow 영향을 받을 수 있습니다.
가독성 때문에 달력은 별도 폭을 갖습니다. 키보드·스크린리더·모바일 실기기 동작은 실제 사내 브라우저에서 확인해야 합니다.
Pretendard는 기존 공통 지정만 유지하며 폰트 파일은 배포에 포함하지 않습니다. 사내 승인 폰트 경로를 연결하세요.

## v26 추가 · 파일 첨부 A

```html
<div class="ui-attachments" id="evidence">
  <input type="file" name="attachments" multiple aria-label="증빙 파일 선택">
</div>
```

```js
const files = CompanyBusiness.attachments(document.getElementById('evidence'), {
  icons: {add: plusSvg, file: paperclipSvg, remove: xSvg},
  onChange({files, count, totalBytes}) { /* 앱 상태 연결 */ }
});
```

icons에는 기존 공통 SVG DOM 요소를 전달합니다. 내부에서 복제하며 원본을 이동하지 않습니다. 미전달 시 텍스트 버튼으로 동작합니다.
회색 도구 영역 왼쪽 파일 추가 / 오른쪽 개수·총용량, 아래 파일명·크기·개별 해제. 기본 D 버튼을 그대로 사용합니다.
기본값은 다중 선택·누적입니다. 추가 선택 시 기존 파일에 누적하며 이름·크기·수정시각이 같은 파일은 중복 추가하지 않습니다. 기존 `{icons,onChange}` 호출의 동작은 유지합니다.

| 옵션 | 계약 |
|---|---|
| `multiple=true` | false는 단일 선택. 여러 파일을 전달하면 자르지 않고 오류로 거부합니다. 원래 input.multiple은 destroy에서 복원합니다. |
| `accumulate=true` | 다중 파일 선택기의 추가 선택을 누적합니다. false면 선택기 결과로 목록을 교체합니다. |
| `validate(files)` | 동기 검증 함수이며 오류 문구 배열을 반환합니다. `[]`이면 허용합니다. 업무의 용량·형식·개수 정책을 연결하며 일반 오류 문구는 공통 메시지에서 읽습니다. |
| `drop=false` | true이면 root의 끌어 놓기를 허용합니다. 다중은 기존 파일에 중복 없이 누적, 단일은 하나로 교체합니다. |
| `onChange(detail)` | 사용자 변경·set/clear의 성공 시 `{files,count,totalBytes}`를 반환합니다. 유효성 실패는 성공 콜백을 부르지 않습니다. |
| `onReset()` | 폼 초기화 뒤 선택적으로 호출합니다. 기존 기본 reset은 onChange와 변경 이벤트를 발생시키지 않습니다. |

`files.files`는 현재 File 배열의 복사본입니다. `set(next)`는 검증 후 교체하고 성공 여부를 반환합니다(disabled이면 false). `clear()`는 전체 해제, `refresh()`는 외부에서 변경한 input.files를 검증·반영하되 onChange는 부르지 않으며, `destroy()`는 생성 UI·이벤트·관찰자를 해제하고 원래 input/설명 속성을 복원합니다.

검증 실패 시 이전 FileList를 복원하고 같은 회사 오류 영역에 안내합니다. root에 `[data-file-error]`가 있으면 재사용하고 없으면 필요한 오류 영역을 생성합니다. 파일 선택을 취소하면 기존 목록을 유지합니다. 개별 해제와 form reset은 실제 input.files에도 반영되며 reset은 오류도 제거합니다. disabled input은 추가·삭제·끌어 놓기를 사용할 수 없습니다. 숨긴 input의 invalid 초점은 보이는 파일 추가 버튼으로 이동합니다.

변경 성공 시 input/change와 company:attachments 이벤트를 제공합니다. 파일 목록·개별 삭제 UI는 이 함수 한 곳에서 생성하므로 별도 목록이나 기본 파일 선택 버튼을 중복 제작하지 않습니다. 확장 예제의 `CompanyExtensions.filePicker`도 검증 정책과 배열 콜백만 변환하여 이 API를 사용합니다.

DataTransfer 및 input.files 할당을 지원하는 브라우저가 필요합니다. 실제 FileList·FormData·파일 선택기는 소비 앱에서 브라우저 검증해야 합니다. 용량·형식 등의 서버 검증과 실제 업로드는 앱에서 구현하며 클라이언트 검증을 보안 검증으로 대체하지 않습니다.
기존 서버 첨부파일은 File 객체가 아니므로 이 선택 목록에 임의로 섞지 않고 서버 첨부 목록 및 삭제 API를 별도로 연결합니다.
# 반응형 페이지 탐색

`CompanyBusiness.responsiveNavigation(root)`는 PAGE-PATTERNS의 ui-app-shell/ui-sidebar/ui-responsive-navigation 골격을 초기화한다. root별 한 번 호출하며 반환 객체의 destroy()로 이벤트를 정리한다. 데스크톱 사이드바와 모바일 헤더 우측 햄버거가 동일 메뉴 DOM을 공유한다. 모바일은 기본 접힘, 트리거 재클릭/Escape/바깥 클릭으로 닫는다. Escape는 트리거로 초점을 돌린다. 현재 페이지 aria-current와 실제 링크는 소비 앱이 제공한다. 외형은 design/components.css, 계약은 V27-N01이 소유한다.
