# 공통 업무 요소 사용 가이드 · v27

기존 승인 디자인을 유지한 업무 자산입니다. v25 업무 요소 12종, v26 첨부 A, v27 가로 조회조건 패턴을 포함합니다. CSS의 외형, JS의 상호작용, 앱의 업무 처리를 구분합니다.
`business-preview.html`은 12개 요소를 한 화면에서 조작할 수 있는 독립 예제입니다.
예제 데이터는 DB와 연결되지 않으며 조건 저장은 메모리에만 저장합니다.

## 불러오기

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

예제의 전체 마크업은 `examples/business-body.html`의 `requests-table`을 참고하세요.
`data-select-all`, `data-row-select` 체크박스와 `data-table-toolbar`, `data-selected-count`, `data-batch-action`을 조합합니다.
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
추가 선택 시 기존 파일에 누적하며 이름·크기·수정시각이 같은 파일은 중복 추가하지 않습니다.
`files.files`는 현재 File 배열의 복사본, `clear()`는 전체 해제, `refresh()`는 외부에서 변경한 input.files 반영, `destroy()`는 UI 해제입니다.
개별 해제·초기화는 실제 input.files에도 반영됩니다. form reset은 빈 상태로 되돌립니다. disabled input은 추가·삭제가 비활성화됩니다.
변경 시 input/change와 company:attachments 이벤트를 제공합니다. 취소한 파일 선택은 기존 파일을 유지합니다.
DataTransfer 및 input.files 할당을 지원하는 브라우저가 필요합니다. 파일 용량·형식 정책과 서버 업로드·검증은 앱에서 구현합니다.
기존 서버 첨부파일은 File 객체가 아니므로 이 선택 목록에 임의로 섞지 않고 서버 첨부 목록 및 삭제 API를 별도로 연결합니다.
