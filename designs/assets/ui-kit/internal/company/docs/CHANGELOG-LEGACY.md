# 과거 기록 — 현재 적용 지침 아님

현재 기준은 루트 README.md, GUIDE.md, QA.md를 확인하세요. 아래 기록은 당시 내용을 보존하며 최신 승인으로 대체된 규칙이 포함됩니다.

# 전사 공통 디자인 자산 — v23 · 공통 선택 드롭다운 추가

## 목적
여러 업무 페이지에서 버튼, 입력창, 표, 상태와 밀도를 일관되게 사용하기 위한 공통 CSS입니다. 기본 인상은 중립색 배경, 명확한 경계, 절제된 파랑 강조, 촘촘한 조작 영역입니다. 개별 페이지의 버튼 순서나 핵심 행동, 카드 사용, 전체 배치는 공통 CSS가 정하지 않습니다.

## 빠르게 확인하기
먼저 `catalog.html`에서 컴포넌트 통합 화면과 아이콘 120개를 확인하세요. 현재 적용 기준은 `GUIDE.md`, 검증 범위는 `QA.md`에 정리되어 있습니다. 아래 버전별 기록은 변경 이력이므로 이후 선택으로 대체된 설명이 있을 수 있습니다.

`preview.html`을 브라우저에서 엽니다. 외부 연결 없이 조회/목록, 입력/상세, 버튼/입력 상태를 확인할 수 있습니다. 상단 밀도 선택은 같은 예시의 기본·촘촘·여유 규격을 바꿉니다. 입력 예시에서는 제목을 지우고 저장하여 오류 상태도 확인할 수 있습니다. 그 외 업무 버튼은 실제 기능이 없는 시각적 예시입니다.

## 신규 페이지 적용
```html
<link rel="stylesheet" href="/assets/company.css">
<div class="krds-2024-tokens altool-ui" data-density="standard">
  <!-- 페이지 내용 -->
</div>
```
`dist/company.css`를 원하는 정적 자산 경로로 복사합니다. 래퍼 클래스 두 개를 모두 사용합니다. 페이지 전역 초기화, 바깥쪽 여백, 최대 너비는 앱에서 결정합니다. 예시의 제목·페이지 여백은 미리보기 전용입니다.

`dist/company.css`는 토큰·옵션형 레이아웃·기존 altool 런타임·가이드·전사 패턴을 합친 파일입니다. 전역 스타일이 있는 basic/services 예제 CSS와 official 어댑터는 포함하지 않습니다. 선택자 스코프는 주로 `.altool-ui`, `.altool-layout`, `.krds-2024-tokens`이고 기존 런타임의 `.ui-preview` 예시 선택자는 유지됩니다.

## 기본 규격
| 항목 | 촘촘 compact | 기본 standard | 여유 comfortable |
|---|---:|---:|---:|
| 본문 | 14px | 15px | 16px |
| 기본 컨트롤 최소 높이 | 30px | 34px | 42px |
| 표 셀 위·아래 패딩 | 5px | 10px | 12px |
| 패널 안쪽 여백 | 10px | 14px | 20px |

16px 루트 글꼴 기준입니다. 고정 높이가 아닌 최소 높이이며, 확대·내용에 따라 늘어납니다. 터치 포인터 환경에서는 모든 밀도의 컨트롤 최소 높이를 44px 이상으로 조정합니다. 62.5% 루트 글꼴과 그대로 결합하지 마세요.

- 버튼 모서리: 4px. 입력창 모서리: 4px. 일반 표면 모서리: 2px. 원형 선택 컨트롤과 명시적인 pill 아이콘 버튼은 별도입니다.
- 버튼/입력창/일반 카드: 그림자와 누를 때 이동 효과 제거. 모달의 깊이 표현은 유지합니다.
- 키보드 포커스: 2px 파란 외곽선. 오류: 테두리와 설명 문구. 읽기 전용: 옅은 중립 배경과 읽을 수 있는 텍스트. 비활성: 중립색 배경과 텍스트, 실제 disabled 속성 사용.
- `primary`는 업무 페이지가 중요한 행동에 지정합니다. 삭제라는 이름만으로 빨갛게 만들지 않습니다. 영구 삭제 등 확인이 필요한 행동에는 `danger`를 명시적으로 선택할 수 있습니다.
- 표는 기본 가로선, 격자/줄무늬/고정 머리글은 선택합니다. 일반 상태는 텍스트로 표시합니다.
- 일반 안내는 `.ui-note`, 중요한 알림은 `.ui-alert`. 오류나 상태는 색 외에 설명 텍스트를 반드시 제공합니다.

## 공통 패턴
| 클래스 | 용도 |
|---|---|
| `.ui-toolbar`, `.ui-toolbar__end` | 명령 버튼 묶음, 선택적인 끝 정렬 그룹 |
| `.ui-filter-bar`, `.ui-filter-row` | 조회 조건 영역과 행 |
| `.ui-field-inline` | 라벨과 컨트롤을 가깝게 배치 |
| `.ui-date-range`, `.ui-lookup` | 기간 입력, 코드 검색 버튼 결합 |
| `.ui-choice-group` | 상태 등 여러 선택 항목 |
| `.ui-form-grid`, `.ui-field`, `.ui-field--full` | 2열 입력 폼, 필드, 전체 너비 필드 |
| `.ui-form-actions` | 입력 영역 하단 작업 버튼 |
| `.ui-panel`, `.ui-section` | 필요한 경우에만 쓰는 경계와 섹션 간격 |
| `.ui-table-scroll` | 표 가로 스크롤 영역 |
| `.ui-table--grid`, `.ui-table--striped`, `.ui-table--sticky` | 표의 선택적 표현 |
| `.ui-number` | 숫자 우측 정렬 |
| `.ui-status[data-status]` | success/progress/error 상태 텍스트 |

`data-density`는 래퍼나 내부 섹션에 둘 수 있습니다. 하위 섹션에 `standard`를 지정하면 상위의 compact/comfortable 값에서 기본값으로 돌아갑니다.

`ui-table--sticky`는 소비 페이지가 스크롤 영역 높이를 지정해야 합니다. 표 기본 최소 너비는 기존 런타임의 36rem이며, 좁은 화면에서는 영역 안에서 스크롤됩니다. 검색창/날짜 입력의 기능, 표 정렬·선택·필터링·키보드 탐색은 앱이 구현합니다. CSS만으로 제공하지 않습니다.

## 기존 프로젝트 이행
기존 토큰 이름과 원래 `@output` 구획을 유지했습니다. `components/enterprise.css` 구획을 추가했으며, 이것을 기존 `components/runtime.css` 뒤에 로드해야 신규 전사 패턴이 적용됩니다.

- `design/theme.css`, `design/components.css`: 편집용 원본.
- `dist/`: 함께 제공한 스크립트로 생성한 출력물.
- `scripts/build_design.py`: Python 표준 라이브러리만 사용하는 구획 분리/번들 생성 도구.

```sh
python3 scripts/build_design.py
```

이 스크립트는 이번 두 소스를 위한 독립 빌더입니다. 원래 프로젝트의 `scripts/build_company_design.py`는 제공되지 않아 이를 대체하거나 호환성을 확인한 것은 아닙니다. 기존 빌더를 계속 쓸 경우 새 구획을 출력하고 enterprise.css를 마지막에 로드하도록 구성해야 합니다.

`design/components.css` 전체를 직접 링크하면 여러 예제의 전역 스타일이 섞입니다. 프로덕션에서는 `dist/company.css` 또는 필요한 분리 파일을 사용하세요. 기존 `.krds-*` 마크업은 `foundations/company-custom.css`의 수정 규격을 사용하며 신규 `.ui-*` 패턴을 자동으로 얻지는 않습니다.

컴포넌트 스타일은 `altool-components` 레이어에 있습니다. 앱의 레이어 밖 CSS는 우선하므로 전사 적용 전에 기존 스타일 충돌을 확인하세요. 선택자 유지가 모든 기존 화면의 시각적 무변경을 뜻하지는 않습니다.

## 검증 범위
토큰 유지, 변수 참조, 기존 출력 구획 유지, 문자열/주석을 제외한 구문 구분자 균형, 빌드 재현성, 미리보기 스크립트 문법 및 ZIP 무결성을 검사했습니다. 브라우저 실행 환경이 없어 실제 렌더링·모바일·키보드 조작 검증은 미완료입니다. 실제 전사 HTML/JS도 제공되지 않아 통합 호환성은 확인하지 못했습니다.

전사 반영 전에는 조회 화면(많은 조건과 열), 입력 화면(오류/읽기 전용), 팝업(포커스), 작은 화면/터치 및 기존 앱 CSS 충돌을 확인해야 합니다.


## D 버튼 반영 (수정안 03)
- `buttons-preview.html`: 5종 색상, 3종 크기, 아이콘 전용/원형, 그룹 선택, 비활성, 알림 및 링크 버튼 검토.
- 공통 글꼴: Pretendard 계열, 500. 앱에서 웹폰트를 로드해야 하며 CSS가 자동으로 다운로드하지는 않습니다. 버튼 전용 미리보기만 CDN 웹폰트를 로드하고 성공 여부를 표시합니다.
- 기본 글자 크기는 화면 밀도를 따르며 standard 15px입니다. 작은 크기 13px, 큰 크기 17px. 아이콘은 작은/기본/큰 순서로 14/16/20px, 모든 선 두께는 1.5입니다.
- 색상은 버튼 역할로 지정합니다: 기본 흰색, primary #1554A0, tonal #EFEFEF, quiet 투명, danger #A2242C. 버튼 문구로 역할을 추측하지 않습니다.
- hover/active, 키보드 포커스, 선택 유지, 비활성 상태까지 규격을 적용합니다. 비활성은 종류와 관계없이 동일한 중립색으로 표시합니다.
- 그룹의 내부 모서리는 붙이고 양 끝만 4px로 처리합니다. 원형 아이콘 버튼은 명시적인 pill 옵션을 유지합니다.
- 입력창이나 본문 굵기에 영향을 주지 않도록 버튼 전용 토큰을 추가했습니다. 전역 semibold 토큰은 변경하지 않았습니다.
- 기존 altool 런타임, enterprise, basic/services 예제, krds 어댑터에 모두 적용했습니다. 프로덕션용 company.css도 재생성했습니다.
- `aria-disabled="true"`는 비활성 모양만 제공합니다. 링크/사용자 정의 컨트롤의 실행 차단은 앱에서 처리해야 합니다. 네이티브 버튼은 disabled를 사용하세요.
- 실제 사이트나 이미 내려받은 대시보드에는 자동 반영되지 않습니다. 해당 프로젝트가 새 공통 CSS를 가져와야 적용됩니다.


## 공통 아이콘 자산 (수정안 04)
- `icons-preview.html`: 120종 미리보기. 한글/영문 검색, 분류, 선택, 사용 코드 복사를 지원합니다. SVG를 내장해 오프라인에서 열 수 있습니다.
- `dist/assets/icons.svg`: 한 번 배포해서 ID로 참조하는 sprite.
- `dist/assets/icons/*.svg`: 개별 SVG 120개.
- `dist/assets/icons.json`: AI가 읽는 ID·한글 이름·검색어·분류·파일 경로·사용 예시 목록.
- `icons/AI-USAGE.md`: AI의 선택, 접근성, 배치, 역할 매핑 규칙.
- `icons/source.json`, `icons/selection.tsv`: 버전 고정 원본 노드와 선정 목록.
- `icons/LICENSE-LUCIDE.txt`: Lucide 및 포함된 Feather 파생 아이콘 라이선스 전문.
- `components/icons.css` 출력 구획을 추가했고 `dist/company.css`에 포함했습니다. 기존 버튼의 직접 자식 SVG 크기 규칙과 호환됩니다.
- 아이콘 크기 기본 16px, 선 두께 1.5, 색상 currentColor. 본문용 .ui-icon 크기 옵션 sm/lg/xl은 14/20/24px입니다.
- CSS와 아이콘 생성 결과, XML 구조, ID와 파일/목록 대응을 검사했습니다. 실제 브라우저 렌더링 검증은 미완료입니다.


## 입력 요소 B안 확정 (수정안 05)
- 입력창·선택창·여러 줄 입력: D 버튼과 같은 모서리 4px, 테두리 #B7BEC7, 글꼴 Pretendard 계열 400.
- 기본 밀도 글자 15px, 컨트롤 최소 높이 34px. 밀도별 크기와 터치 44px 규칙을 유지합니다.
- hover 테두리 #7E8B9B, placeholder #66717E. readonly 배경 #F1F3F5, disabled 배경 #E9EDF0, 오류 테두리 #A2242C.
- 체크박스·라디오: 16px, 강조색 #1554A0. 네이티브 모양을 유지하므로 운영체제별 세부 모습은 다를 수 있습니다. 터치 조작은 체크 그림 크기가 아닌 라벨 영역 44px 이상으로 확보합니다.
- 버튼 500 / 입력값 400을 구분합니다. 공통 표·패널 테두리색은 바꾸지 않았습니다.
- `forms-preview.html`에서 기본·읽기 전용·비활성·오류·선택창·여러 줄 입력·체크박스·라디오를 확인할 수 있습니다.
- CSS는 오류 모양만 정의합니다. aria-invalid와 오류 문구 연결, 검증 및 오류 해제는 앱에서 처리합니다.
- CSS 빌드와 파일 검사는 완료했습니다. 실제 브라우저 렌더링 검증은 미완료입니다.


## 표 A안 및 선택 행 확정 (수정안 06)
- 기본 표는 가로선형입니다. 본문 400, 머리글·합계 500. standard에서 15px, 셀 패딩 세로 10px·가로 12px입니다.
- 머리글 #F1F3F5, 합계 #F7F8F9, 기본 구분선 #D9DDE2. 숫자 칸은 ui-number로 우측 정렬합니다.
- hover #EDF3F9 / 선택 행 #E5EEF8. 선택 행은 hover와 줄무늬보다 우선합니다.
- ui-table--grid / ui-table--striped 옵션은 유지합니다. 기본 표에 자동 적용하지 않습니다.
- 선택 표는 table에 data-row-selection, 선택 체크박스에 data-row-select를 명시합니다. 체크 시 CSS가 해당 행을 강조합니다. 일반 데이터 체크박스만으로는 행이 선택되지 않습니다.
- 앱에서 직접 선택 상태를 관리한다면 tr.is-selected를 사용합니다. aria-selected는 접근성 패턴에 적합한 grid/treegrid 등에서 사용하며 단순 표에 역할을 임의로 추가하지 않습니다. 키보드 탐색·전체 선택·정렬·페이징 기능은 앱이 구현합니다.
- 음수 금액의 강조는 ui-cell-negative로 명시하며 CSS가 문자열 부호를 판단하지 않습니다. 상태는 텍스트와 함께 표시합니다.
- tables-preview.html에서 기본 표, 선택 행, 격자·줄무늬 옵션을 확인합니다.
- CSS 빌드·규칙 및 파일 검사는 완료했습니다. 실제 브라우저 렌더링 검증은 미완료입니다.


## v7 · 탭 / 페이지 이동 B안

선택 탭과 현재 페이지는 `#1554A0` 배경, 흰 글자. 모서리 4px,
탭 글자 15px/500(표준 밀도), 페이지 번호 14px/500, 표준 최소 높이 34px.
터치 환경에서는 최소 44px. 미선택 탭은 투명 배경, 페이지 버튼은 흰 배경과 회색 테두리.
선택 항목 hover는 진한 파랑이며 비활성 상태가 선택 상태보다 우선합니다.
`navigation-preview.html`에서 공통 CSS로 실제 선택 동작을 확인할 수 있습니다.

`dist/company.css`에 포함. 개별 구성 시 토큰 및 기존 컴포넌트 뒤에
`dist/components/navigation.css`를 로드하고 `krds-2024-tokens altool-ui` 범위에서 사용합니다.

```html
<div class="krds-2024-tokens altool-ui">
  <div class="ui-tabs" role="group" aria-label="조회 범위">
    <button type="button" aria-pressed="true">전체 <span class="ui-tab-count">48</span></button>
    <button type="button" aria-pressed="false">처리 중</button>
    <button type="button" disabled>보관함</button>
  </div>
  <nav class="ui-pagination" aria-label="페이지 이동">
    <button type="button" disabled>이전</button>
    <button type="button" aria-label="1 페이지" aria-current="page">1</button>
    <button type="button" aria-label="2 페이지">2</button>
    <button type="button">다음</button>
  </nav>
</div>
```

- 조회 필터는 예시처럼 `aria-pressed`를 사용합니다. 링크형 현재 항목은 `aria-current="page"`로 표시합니다.
- 실제 탭 패널 UI는 `role="tablist"`, `role="tab"`, `aria-selected` 및 연결된 `tabpanel`을 사용합니다.
  앱이 방향키/Home/End 이동, tabindex, aria-controls/aria-labelledby, 패널 표시를 구현해야 합니다.
- 페이지 변경, 필터 처리, 데이터 조회는 앱 책임입니다. CSS 자체에 동작은 없습니다.
- `aria-disabled="true"`만으로 클릭이 막히지 않습니다. 버튼은 native `disabled`를 우선 사용하고,
  링크 등은 앱에서 활성화를 차단해야 합니다.
- 아이콘은 선택 사항이며 사용 시 기존 아이콘 자산을 조합합니다.


## v8 · 상태 / 안내문 C안

`ui-status`는 6px 색상 점 + 13px/500 중립색 글자입니다. 버튼이 아닌 표시용 요소입니다.
`ui-alert`는 회색 배경 `#F7F8F9`, 3px 왼쪽 색상 선, 14px/400 글자이며 C 시안처럼 직각입니다.
색상은 대기 회색, 진행/안내 파랑, 완료 초록, 확인 필요 황갈색, 오류 빨강입니다.
색상만으로 의미를 전달하지 않고 항상 상태명을 함께 표시합니다.

```html
<span class="ui-status" data-status="progress">처리 중</span>
<div class="ui-alert" data-status="warning">
  <span>확인 필요 · 미승인 자료 2건이 포함되어 있습니다.</span>
</div>
```

- 지원 값: `neutral`, `progress`, `info`, `success`, `warning`, `error`. 미지정/미지원 값은 중립색.
- 아이콘은 선택 사항입니다. 사용할 때는 기존 `.ui-icon` 자산을 안내문 첫 자식에 넣고
  장식용 아이콘에 `aria-hidden="true"`를 지정합니다. 직접 SVG 경로를 만들지 않습니다.
- 동적 완료 안내는 앱이 `role="status"` 또는 `aria-live="polite"`로 알립니다.
  즉시 알려야 하는 동적 오류에만 `role="alert"`를 사용하며 정적인 모든 안내문에 붙이지 않습니다.
- `dist/company.css`에 포함됩니다. 개별 로딩 시 기존 컴포넌트 다음에
  `dist/components/feedback.css`를 로드하며 `krds-2024-tokens altool-ui` 범위에서 사용합니다.
- `feedback-preview.html`은 공통 CSS를 사용하는 상태별 예시입니다.


## v9 · 팝업 C안 (파란 제목 영역)

공통 팝업은 `dialog.ui-dialog`와 `.ui-dialog-header`, `.ui-dialog-title`,
`.ui-modal-body`, `.ui-dialog-actions` 구조를 사용합니다. 제목은 파랑 `#1554A0` / 흰 글자,
기본 폭 480px, 모서리 4px, 제목 16px/500이며 하단 버튼은 기존 D안입니다.
작은 화면에서는 좌우 여백을 유지하고, 긴 내용은 본문 안에서 스크롤합니다.
기본 폭은 `--company-dialog-width`로 조절합니다.

```html
<dialog class="ui-dialog" id="confirm-dialog" aria-labelledby="confirm-title">
  <div class="ui-dialog-header">
    <h2 class="ui-dialog-title" id="confirm-title">변경 사항 저장</h2>
    <!-- 닫기 버튼: ui-dialog-close 클래스 + 기존 close 아이콘 + aria-label="닫기" -->
  </div>
  <div class="ui-modal-body">변경 사항을 저장하시겠습니까?</div>
  <div class="ui-dialog-actions">
    <button type="button" autofocus>취소</button>
    <button type="button" class="primary">저장</button>
  </div>
</dialog>
```

- `krds-2024-tokens altool-ui` 범위에서 사용하며 `dist/company.css`에 포함됩니다.
  개별 로딩 시 기존 컴포넌트 뒤에 `dist/components/dialogs.css`를 추가합니다.
- 기존 팝업은 위 클래스와 구조로 이관해야 파란 제목 영역이 적용됩니다.
  가이드 패널 등 다른 용도의 기존 dialog에 새 구조를 강제로 적용하지 않습니다.
- CSS는 열기/닫기를 실행하지 않습니다. 앱에서 `showModal()` / `close()`를 연결합니다.
  native dialog는 모달 포커스 범위와 Escape 닫기를 제공합니다. 닫힌 뒤 호출 버튼으로 포커스를 돌려줍니다.
- 제목을 `aria-labelledby`로 연결하고 짧은 확인 문구는 필요시 `aria-describedby`로 연결합니다.
- 삭제 확인도 제목은 동일한 파랑이고 실행 버튼만 기존 `danger` 역할을 사용합니다.
  실제 저장·삭제 API, 처리 중 상태, 오류 안내는 앱에서 구현합니다.
- `dialogs-preview.html`에서 열기·취소·Escape·저장 예시를 확인할 수 있습니다.
  예시 저장 버튼은 실제 데이터를 저장하지 않습니다.


## v10 · 영역 구분 C안

제목 앞 3×16px 파란 표식, 1px 파란 구분선, 연한 회색 본문 `#F7F8F9`를 사용합니다.
제목 15px/500, 보조 정보 12px/400, 제목 영역 최소 42px, 본문 여백 16px 12px입니다.

```html
<section class="ui-section" aria-labelledby="search-title">
  <div class="ui-section-header">
    <h2 class="ui-section-title" id="search-title">조회 조건</h2>
    <span class="ui-section-meta">회계 자료</span>
  </div>
  <div class="ui-section-body">
    <!-- 페이지 목적에 맞는 입력 항목, 설명, 표 등을 구성 -->
  </div>
</section>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. 제목 ID는 페이지에서 고유해야 합니다.
- 제목 레벨은 문서 계층에 맞춰 h2/h3 등을 선택합니다. 보조 정보는 선택 사항입니다.
- 공통 CSS는 영역 외형만 정의합니다. 시안의 2열 입력 배치나 법인/연도 같은 필드는
  공통 구조로 강제하지 않습니다. `sections-preview.html`의 `.demo-fields`는 예시 전용입니다.
- 제목과 보조 정보는 좁은 화면에서 줄바꿈합니다. 내부 표의 가로 스크롤은 기존 `ui-table-scroll`을 사용합니다.
- `dist/company.css`에 포함됩니다. 개별 로딩은 토큰 및 기존 컴포넌트 뒤에
  `dist/components/sections.css`를 추가합니다.


## v11 · 작업 메뉴 C안

더보기·컨텍스트 작업 목록은 `.ui-menu`와 `.ui-menu-item`을 사용합니다.
흰 배경, 회색 테두리, 외곽 4px / 항목 2px 모서리, 14px/400 글자, 최소 높이 34px입니다.
hover·키보드 focus-visible은 파란 배경 `#1554A0`과 흰 글자로 표시합니다.
삭제 역할은 빨간 글자와 연한 빨강 hover를 유지하며, 비활성은 회색 글자입니다.

```html
<div class="ui-menu" role="group" aria-label="자료 작업">
  <button type="button" class="ui-menu-item">상세 조회</button>
  <button type="button" class="ui-menu-item">복사</button>
  <button type="button" class="ui-menu-item" disabled>수정</button>
  <hr class="ui-menu-separator">
  <button type="button" class="ui-menu-item danger">삭제</button>
</div>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함되며,
  개별 로딩은 기존 컴포넌트 뒤에 `dist/components/menus.css`를 추가합니다.
- 아이콘은 선택 사항입니다. 기존 `.ui-icon` 자산을 조합하며 장식 아이콘에 `aria-hidden="true"`를 사용합니다.
- 선택된 항목을 계속 파랗게 유지하는 탭과 달리, 작업 메뉴 강조는 hover/키보드 포커스 상태입니다.
- 메뉴 폭·화면 내 위치·열기/닫기·실제 작업 실행은 앱 책임입니다. 기본 select 입력에는 적용하지 않습니다.
- `menus-preview.html`은 native 버튼 + group을 사용하는 disclosure 예시입니다.
  더보기 버튼의 `aria-expanded`/`aria-controls`, Tab 이동, Escape/바깥 클릭 닫기 및 포커스 복귀를 포함합니다.
  예시 항목은 결과 문구만 표시하며 복사·다운로드·삭제를 실제 실행하지 않습니다.
- `role="menu"`/`menuitem` 패턴을 선택하는 앱은 별도로 방향키·Home/End·포커스 관리를 구현해야 합니다.
  group 예시에 역할만 바꿔 붙이지 않습니다. 우클릭 메뉴도 키보드로 열 수 있는 버튼을 제공합니다.
- 링크에 `aria-disabled="true"`를 지정하는 경우 앱이 활성화를 차단해야 합니다. 버튼은 `disabled`를 우선 사용합니다.


## v12 · 조회 결과 없음 / 로딩 B안

`.ui-data-state`는 흰 배경에 20px 아이콘과 문구를 가운데 정렬합니다.
기본 최소 높이 126px, 본문 15px/400, 보조 문구 13px/400입니다.
조회 결과 없음은 기존 `folder-open`, 로딩은 기존 `loader` 아이콘을 사용합니다.
로딩 아이콘에 `.ui-icon--spin`을 조합하며, 기존 reduced-motion 설정에서는 회전이 멈춥니다.

```html
<div class="ui-data-state" data-state="empty">
  <svg class="ui-icon" aria-hidden="true"><use href="/assets/icons.svg#folder-open"></use></svg>
  <p class="ui-data-state-title">조회된 자료가 없습니다.</p>
  <p class="ui-data-state-hint">조회 조건을 확인하거나 변경해 주세요.</p>
</div>
<div class="ui-data-state" data-state="loading" role="status">
  <svg class="ui-icon ui-icon--spin" aria-hidden="true"><use href="/assets/icons.svg#loader"></use></svg>
  <p class="ui-data-state-title">자료를 조회하고 있습니다.</p>
  <p class="ui-data-state-hint">잠시만 기다려 주세요.</p>
</div>
```

- 아이콘 경로는 앱 배포 경로에 맞춥니다. 아이콘은 선택 사항이며 문구만 넣어도 중앙 정렬됩니다.
- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함됩니다.
  개별 로딩은 토큰·아이콘·기존 컴포넌트 뒤에 `dist/components/data-states.css`를 추가합니다.
- CSS는 데이터 유무를 판단하지 않습니다. 앱에서 조회 전/로딩/성공/0건/오류를 구분합니다.
  조회 전에는 “조회 조건을 입력해 주세요”, 실패 시에는 오류 안내를 사용하고 0건 문구로 대체하지 않습니다.
- 비동기 조회 영역은 앱이 `aria-busy`를 갱신합니다. 로딩 알림은 busy 영역 밖의
  `role="status"`로 전달할 수 있습니다. 완료/0건 결과도 적절한 live 영역에 안내합니다.
- 표 안에 넣을 때는 `td colspan="실제 열 수"` 안에 배치하고
  `ui-data-state--in-table`을 추가해 테두리 중복을 없앱니다.
- `data-states-preview.html`에서 두 상태를 비교할 수 있습니다. 로딩은 시각 예시이며 실제 조회를 실행하지 않습니다.

### v13 보완
조회 결과 없음 아이콘을 검색 실행 의미의 돋보기에서 기존 `folder-open`으로 변경했습니다. 로딩 표시는 유지합니다.


## v14 · 짧은 도움말 C안

`.ui-tooltip`은 파랑 `#1554A0` 배경, 흰 글자, 4px 모서리,
13px/400 글자와 8px 12px 여백을 사용합니다. 기본 최대 폭은 320px이며 부모 폭 안에서 줄바꿈합니다.
`.ui-help-trigger`는 기존 `help` 아이콘과 조합하는 28px 도움말 버튼이며 터치에서는 44px입니다.

```html
<button type="button" class="ui-help-trigger" aria-label="집계 기준 도움말"
        aria-expanded="false" aria-controls="posting-help">
  <svg class="ui-icon" aria-hidden="true"><use href="/assets/icons.svg#help"></use></svg>
</button>
<div class="ui-tooltip" id="posting-help" hidden>
  전표의 전기일을 기준으로 집계합니다.
</div>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함됩니다.
  개별 구성 시 토큰·아이콘·기존 컴포넌트 뒤에 `dist/components/tooltips.css`를 로드합니다.
- 위 예시는 클릭으로 펼치는 짧은 도움말입니다. 앱에서 hidden / aria-expanded를 함께 갱신합니다.
  `tooltips-preview.html`은 클릭·Escape·바깥 클릭 닫기를 보여줍니다.
- hover/focus로 자동 표시하는 실제 tooltip은 `role="tooltip"`, 트리거의 `aria-describedby`를 연결하고
  Escape 닫기, 툴팁 위로 포인터를 이동해도 유지되는 동작을 앱에서 구현합니다.
  클릭형 예시에 역할만 붙여 자동 tooltip처럼 취급하지 않습니다.
- CSS는 표시 시점과 위치를 결정하지 않습니다. 떠 있는 도움말의 화면 경계 처리도 앱 책임입니다.
- 필수 입력 규칙·오류·핵심 업무 설명은 항상 보이는 문구로 제공합니다.
  툴팁 안에 버튼이나 링크를 넣지 않으며, 긴 내용과 상호작용은 별도 도움말 패널을 사용합니다.
- 아이콘 경로는 실제 앱 배포 경로에 맞춥니다.


## v15 · 파일 첨부 B안

`.ui-attachments`는 4px 외곽 테두리, 회색 도구 영역, 흰색 파일 목록을 사용합니다.
파일명 14px, 용량 12px, 목록 최소 높이 44px이며 첨부 버튼은 기존 D 버튼입니다.
좁은 화면에서는 용량을 다음 줄에 표시해 파일명과 제거 버튼이 겹치지 않게 합니다.

```html
<div class="ui-attachments">
  <div class="ui-attachment-toolbar">
    <button type="button">파일 첨부</button>
    <span class="ui-attachment-count">첨부 1개</span>
  </div>
  <ul class="ui-attachment-list">
    <li class="ui-attachment-item">
      <span class="ui-attachment-name">예산계획.xlsx</span>
      <span class="ui-attachment-size">240 KB</span>
      <button type="button" class="ui-attachment-remove" aria-label="예산계획.xlsx 목록에서 제거">제거</button>
    </li>
  </ul>
</div>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함됩니다.
  개별 구성은 토큰·기존 컴포넌트 뒤에 `dist/components/attachments.css`를 추가합니다.
- 아이콘은 선택 사항이며 첨부는 기존 `paperclip`, 제거는 기존 `x` 자산을 조합합니다.
- 파일 선택은 native file input을 앱에서 연결합니다. 파일명은 textContent 등 텍스트로 출력합니다.
- 선택 목록과 서버 업로드 완료는 다른 상태입니다. 전송·취소·진행률·오류·허용 확장자·크기 제한은
  앱에서 구현하고, 필요한 제한은 도구 영역 아래에 항상 보이는 문구로 표시합니다.
- 기존 서버 파일을 삭제하는 경우 앱의 삭제 정책을 적용합니다. 선택 목록 제거를 서버 삭제로 취급하지 않습니다.
- 빈 목록에는 `.ui-attachment-empty`를 사용하고 첨부 개수를 동기화합니다.
- `attachments-preview.html`에서 파일 추가·제거·빈 목록을 확인할 수 있습니다.
  예시는 파일명·크기만 목록에 표시하며 파일 내용을 읽거나 서버로 전송하지 않습니다.


## v16 · 접기 / 펼치기 C안

`details.ui-accordion`은 열린 제목만 파란 배경과 흰 글자로 강조합니다.
닫힌 제목은 흰색, 본문은 연한 회색이며 외곽 모서리 4px, 제목 15px/500,
제목 최소 높이 40px(터치 44px), 본문 여백 12px입니다.

```html
<details class="ui-accordion" open>
  <summary>
    상세 조회 조건
    <svg class="ui-icon ui-accordion-chevron" aria-hidden="true">
      <use href="/assets/icons.svg#chevron-down"></use>
    </svg>
  </summary>
  <div class="ui-accordion-body">페이지별 상세 조건</div>
</details>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함됩니다.
  개별 구성은 토큰·아이콘·기존 컴포넌트 뒤에 `dist/components/accordions.css`를 추가합니다.
- native details/summary가 클릭·Enter·Space 및 열린 상태를 처리합니다. 별도 클릭 스크립트나
  수동 aria-expanded를 중복으로 붙이지 않습니다. 초기 펼침은 `open`으로 지정합니다.
- 상태를 나타내는 화살표는 기존 `chevron-down` 자산과 `ui-accordion-chevron`을 사용합니다.
  아이콘을 생략할 경우에도 제목 문구에서 접기·펼치기 기능을 이해할 수 있게 합니다.
- 여러 영역을 동시에 열 수 있습니다. 내부 필드 배치와 선택 값 유지는 페이지 책임입니다.
  닫힌 영역 안에 검증 오류가 있으면 앱에서 해당 details를 열고 오류 필드로 안내합니다.
- summary에는 별도의 버튼·링크·입력창을 넣지 않습니다.
- `accordions-preview.html`에서 열림·닫힘과 입력 예시를 확인할 수 있습니다.


## v17 · 상단 / 좌측 메뉴 B안

상단과 좌측 메뉴 배경은 `#F1F3F5`, 현재 메뉴는 `#1554A0` + 흰 글자입니다.
선택 메뉴 모서리 4px, 글자 14px이며 선택 항목은 500 굵기입니다.
상단 컨테이너는 `.ui-site-header`, 메뉴는 `.ui-site-nav`, 좌측은 `.ui-sidebar`,
항목은 `.ui-nav-item`, 브랜드는 `.ui-site-brand`, 사용자 정보는 `.ui-site-user`를 사용합니다.

```html
<header class="ui-site-header">
  <span class="ui-site-brand">업무 포털</span>
  <nav class="ui-site-nav" aria-label="주요 업무">
    <a class="ui-nav-item" href="/finance" aria-current="page">재무</a>
    <a class="ui-nav-item" href="/purchasing">구매</a>
  </nav>
</header>
<nav class="ui-sidebar" aria-label="재무 메뉴">
  <p class="ui-sidebar-heading">재무 관리</p>
  <a class="ui-nav-item" href="/finance/budget" aria-current="page">예산 현황</a>
  <a class="ui-nav-item" href="/finance/documents">전표 조회</a>
</nav>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함됩니다.
  개별 구성은 기존 컴포넌트 뒤에 `dist/components/site-navigation.css`를 추가합니다.
- 페이지 이동은 링크를 우선 사용하고, 한 nav에서 현재 페이지 항목에만 `aria-current="page"`를 지정합니다.
  업무 범위를 전환하는 버튼에는 `aria-pressed`를 사용할 수 있습니다.
- 아이콘은 선택 사항이며 기존 `.ui-icon` 자산을 조합합니다.
- 메뉴 목록·좌측 폭·페이지 그리드·모바일 접기·라우팅·권한은 앱 책임입니다.
  `site-navigation-preview.html`의 `.demo-layout`은 예시 전용이며 공통 CSS에 고정하지 않습니다.
- 기존 `.ui-header` / `.ui-side-links` 화면은 새 클래스 구조로 이관해야 이 스타일이 적용됩니다.
- 비활성 링크는 앱에서 활성화를 차단해야 하며 버튼은 `disabled`를 사용합니다.

### 1차 마무리까지 남은 묶음
상단·좌측 메뉴 완료. 진행 단계·진행률, 카드·요약 정보, 검색 보조, 페이지 기본 틀의 4묶음이 남았습니다.
그 후 전체 컴포넌트 통합 화면과 스타일 충돌 점검을 진행합니다.


## v18 · 상단 색상 보완
상단 `.ui-site-header`는 `budget-dashboard.html`의 `.app-header`와 동일한 짙은 남색 `#18334F`로 변경했습니다. 상단 기본 글자는 흰색, 보조 사용자 정보는 `#D4DEE9`입니다. 좌측 회색 배경과 파란 선택 메뉴는 B안을 유지합니다. v17의 상단 회색 설명은 이 설정으로 대체됩니다.


## v19 · 진행 단계 / 진행률 C안

단계는 `.ui-steps` 안의 `.ui-step`에 `aria-current="step"`을 지정해 파란 밑줄로 표시합니다.
번호는 `.ui-step-number`이며 텍스트 14px/500, 단계 최소 높이 36px(터치 44px)입니다.
이동 가능한 단계는 button/a, 표시 전용은 span을 사용하고 실제 이동 가능 여부는 앱이 결정합니다.

```html
<ol class="ui-steps" aria-label="업무 단계">
  <li><span class="ui-step"><span class="ui-step-number">1</span>자료 입력</span></li>
  <li><span class="ui-step" aria-current="step"><span class="ui-step-number">2</span>검토</span></li>
  <li><span class="ui-step"><span class="ui-step-number">3</span>완료</span></li>
</ol>
<div class="ui-progress-bar" role="progressbar" aria-label="자료 처리"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="60"
     style="--company-progress-value:60%">
  <div class="ui-progress-bar-fill"></div>
  <span class="ui-progress-bar-value">60%</span>
</div>
```

- 진행 막대 높이 18px, 파란 채움에 흰색 12px 숫자입니다. 실제 진행률로 채움 폭·문구·aria-valuenow를 함께 갱신합니다.
- 채움이 숫자 폭보다 좁으면 내부 숫자를 숨기고 `.ui-progress-value-outside`에 표시합니다.
  `progress-preview.html`은 글자 폭·리사이즈를 고려한 예시입니다. 숫자를 넣기 위해 진행 막대 폭을 부풀리지 않습니다.
- 총량/진행률을 알 수 없으면 퍼센트를 만들지 않고 기존 로딩 컴포넌트를 사용합니다.
- 단계와 처리 진행률은 서로 독립입니다. 검토 단계라는 이유로 60%라고 계산하지 않습니다.
- `krds-2024-tokens altool-ui` 범위에서 사용하며 `dist/company.css`에 포함됩니다.
  개별 로딩은 기존 컴포넌트 뒤에 `dist/components/progress.css`를 추가합니다.
- 진행률 조절과 단계 전환은 미리보기용이며 실제 업무 처리는 앱 책임입니다.

### 남은 작업 갱신
진행 단계·진행률 완료. 카드·요약 정보, 검색 보조, 페이지 기본 틀의 3묶음과 통합 점검이 남았습니다.


## v20 · 카드 / 요약 정보 C안

수치 요약은 파란 윗선 2px, 연한 회색 배경 `#F7F8F9`, 파란 수치 24px/500을 사용합니다.
항목명 13px, 단위 12px이며 항목 정보는 같은 배경과 1px 파란 윗선을 사용합니다.

```html
<div class="ui-metric-group">
  <div class="ui-metric">
    <span class="ui-metric-label">연간 예산</span>
    <p class="ui-metric-value">120<span class="ui-metric-unit">백만원</span></p>
  </div>
</div>
<dl class="ui-summary">
  <div class="ui-summary-pair"><dt>담당 부서</dt><dd>재무팀</dd></div>
  <div class="ui-summary-pair"><dt>기준일</dt><dd>2026-09-10</dd></div>
</dl>
```

- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함되며,
  개별 로딩은 기존 컴포넌트 뒤에 `dist/components/summaries.css`를 추가합니다.
- 카드 수·배열·지표·단위는 앱에서 결정합니다. 기본 그룹은 가용 폭에 따라 줄바꿈하며 3개를 강제하지 않습니다.
- `.ui-summary-pair`로 항목명과 값을 묶어 좁은 화면에서도 한 쌍이 분리되지 않게 합니다.
- 시안의 수치와 항목은 예시입니다. 결측값을 0으로 바꾸지 말고 별도 문구로 구분합니다.
- 표시 전용 자산입니다. 클릭 동작이 필요한 요약은 실제 링크/버튼 구조와 접근 가능한 이름을 별도로 설계합니다.
- `summaries-preview.html`에서 수치 요약과 항목 정보를 확인할 수 있습니다.

### 남은 작업 갱신
카드·요약 정보 완료. 검색 보조, 페이지 기본 틀의 2묶음과 통합 점검이 남았습니다.


## v21 · 검색 보조 C안

추천 목록 `.ui-suggestions` 안에 `.ui-suggestion`을 사용합니다.
hover/키보드 포커스 또는 앱 지정 `.is-active` 항목은 파랑 `#1554A0` + 흰 글자로 강조합니다.
선택 조건은 `.ui-filter-tags` 안에 `.ui-filter-tag`로 표시하고 `.ui-filter-tag-remove`로 제거합니다.

```html
<div class="ui-suggestions" role="group" aria-label="추천 부서">
  <button type="button" class="ui-suggestion">재무팀</button>
</div>
<div class="ui-filter-tags">
  <span class="ui-filter-tag"><span>재무팀</span>
    <button type="button" class="ui-filter-tag-remove" aria-label="재무팀 조건 제거">×</button>
  </span>
</div>
```

- 추천 글자 14px/400, 태그 13px/400, 목록 외곽 및 태그 모서리 4px입니다.
- `krds-2024-tokens altool-ui` 범위에서 사용합니다. `dist/company.css`에 포함되며,
  개별 로딩은 기존 컴포넌트 뒤에 `dist/components/search-assist.css`를 추가합니다.
- 제거 아이콘은 기존 `x` 자산을 사용하고 제거 버튼에 조건명을 포함한 접근 가능한 이름을 붙입니다.
- 검색·선택 값 관리·태그 제거·중복 처리·서버 요청은 앱 책임입니다. 추천과 선택 완료는 별도 상태입니다.
- `search-assist-preview.html`은 입력 + native 버튼 목록을 쓰는 간단한 예시입니다.
  Tab으로 추천 버튼에 이동할 수 있으며 한국어 조합 중에는 필터링을 보류합니다.
- combobox/listbox 구현 시 aria-expanded/aria-controls/aria-activedescendant, option 상태,
  방향키·Enter·Escape 및 포커스 관리를 앱에서 구현해야 합니다. 역할만 바꾸지 않습니다.
- 결과 없음에는 `.ui-suggestions-empty`를 사용합니다. 서버 검색의 로딩/오류와 구분합니다.
- 예시 태그와 부서 목록은 비교용 데이터이며 공통 CSS에 고정된 업무 조건이 아닙니다.

### 남은 작업 갱신
검색 보조 완료. 페이지 기본 틀 1묶음과 전체 통합 점검이 남았습니다.


## v22 · 페이지 기본 틀 C안 및 통합 화면

`.ui-page-content`는 기본 여백 20px(450px 이하 12px), `.ui-page-heading`은 제목 아래 구분선,
`.ui-page-title`은 22px/500, `.ui-page-footer`는 하단 회색 띠입니다.
하단 띠는 page-content의 직계 자식으로 배치합니다. 화면 고정은 하지 않습니다.
본문 내용·좌측 메뉴 폭·최대 폭·페이지 그리드는 앱이 결정합니다.
`dist/components/page-frame.css`가 공통 번들 마지막에 포함됩니다.

`catalog.html`은 공통 번들 한 벌을 사용하는 통합 화면입니다. `page-frame-preview.html`은 기본 틀 예시입니다.
디자인 선택은 1차 완료이며, 코드 구조 및 연결 점검 결과와 실제 브라우저 검증 한계는 `QA.md`를 참고하세요.


## v23
C안 펼침 목록을 쓰는 단일 선택 컴포넌트를 추가했습니다. `GUIDE.md`의 v23 사용법과 `select-preview.html`을 참고하세요. 이 컴포넌트는 CSS와 `dist/select.js`를 함께 사용합니다.

## v24 드롭다운 너비
펼친 목록의 외곽 너비는 입력창의 실제 외곽 너비와 동일하게 적용합니다. 별도 최소 너비를 강제하지 않습니다.

## v25 · 업무 공통 요소 확장
날짜·기간, 코드 검색, 다중 선택, 상세 폼, 표 일괄 작업, 저장·오류 안내, 상세 패널, 조직 탐색, 처리 이력, 조건 저장, 막대 차트, 시스템 상태를 추가했습니다.
시작: `business-preview.html`. AI는 `components.json`과 `docs/BUSINESS-USAGE.md`를 먼저 확인합니다.

## v26 · 첨부 A
공통 파일 추가 버튼·누적 선택·개별 해제·폼 초기화를 추가했습니다. 예제: attachments-preview.html.

## v27 · 조회조건 배치 공통화
단일 라벨 기준의 ui-filter-bar 및 동작 예제 추가. 상세 기준은 docs/CONSISTENCY.md.
