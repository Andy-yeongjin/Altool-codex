# 현재 적용 기준 · v27

전사 공통 페이지는 `dist/company.css`와 `krds-2024-tokens altool-ui` 범위를 사용합니다.
`catalog.html`은 같은 CSS를 한 번만 불러오는 통합 확인 화면입니다.
README의 버전별 설명과 충돌하면 이 문서와 최신 CSS를 기준으로 합니다.

## 적용

```html
<link rel="stylesheet" href="/assets/company.css">
<div class="krds-2024-tokens altool-ui" data-density="standard">
  <main class="ui-page-content">
    <div class="ui-page-heading">
      <nav class="ui-breadcrumb" aria-label="현재 위치">재무 / 예산 관리</nav>
      <h1 class="ui-page-title">예산 현황</h1>
    </div>
    <!-- 공통 컴포넌트로 페이지 내용 구성 -->
    <footer class="ui-page-footer"><span>재무 관리 시스템</span></footer>
  </main>
</div>
```

CSS와 아이콘은 앱 경로로 복사합니다. 예시의 경로·항목·메뉴 목록·개수는 업무 규칙이 아닙니다.
Pretendard는 공통 CSS에 지정되어 있지만 폰트 파일은 포함되어 있지 않습니다.
앱에서 사내 정적 자산의 폰트를 `@font-face`로 로드하거나 승인된 웹폰트 로딩 방법을 사용해야 합니다.
폰트 로딩 실패 시 맑은 고딕·시스템 글꼴 등 지정된 대체 글꼴이 사용됩니다.
미리보기 역시 환경에 따라 대체 글꼴로 표시될 수 있습니다.

## 승인한 스타일

| 자산 | 기준 | 주요 클래스 / 예시 |
|---|---|---|
| 버튼 D | 4px, 500 굵기, 역할별 배경 | primary / tonal / quiet / danger, buttons-preview.html |
| 아이콘 | 기존 Lucide 자산 120개, 사용 선택 사항 | ui-icon, icons-preview.html |
| 입력 B | 4px, 회색 테두리 | input / select / textarea, forms-preview.html |
| 표 A | 가로선, 회색 헤더, 연한 파랑 선택행 | data-row-selection, tables-preview.html |
| 탭·페이지 B | 선택 항목 파란 채움 | ui-tabs / ui-pagination, navigation-preview.html |
| 상태·안내 C | 색상 점, 안내문 왼쪽 선 | ui-status / ui-alert, feedback-preview.html |
| 팝업 C | 파란 제목, 4px 외곽 | ui-dialog, dialogs-preview.html |
| 영역 구분 C | 파란 제목 표식·선, 회색 본문 | ui-section, sections-preview.html |
| 작업 메뉴 C | 파란 hover/focus, 삭제는 빨강 | ui-menu, menus-preview.html |
| 조회 상태 B | 가운데 20px 아이콘, 결과 없음은 열린 폴더 | ui-data-state, data-states-preview.html |
| 짧은 도움말 C | 파란 배경·흰 글자 | ui-tooltip, tooltips-preview.html |
| 첨부 A (v26) | 회색 도구 영역, 공통 파일 추가 버튼, 개별 삭제 | ui-attachments, attachments-preview.html |
| 접기·펼치기 C | 열린 제목만 파란색 | ui-accordion, accordions-preview.html |
| 상단·좌측 B 보완 | 상단 #18334F, 좌측 회색, 선택 파랑 | ui-site-header / ui-sidebar, site-navigation-preview.html |
| 진행 C | 밑줄 단계, 숫자 포함 막대 | ui-steps / ui-progress-bar, progress-preview.html |
| 카드·요약 C | 파란 윗선·회색 배경 | ui-metric / ui-summary, summaries-preview.html |
| 검색 보조 C | 파란 추천 강조·선택 태그 | ui-suggestions / ui-filter-tag, search-assist-preview.html |
| 페이지 C | 제목 22px/500, 여백 20px, 회색 하단 | ui-page-content, page-frame-preview.html |

모든 모서리를 기계적으로 4px로 바꾸지는 않습니다. 안내문·요약선·표·진행선은 직각,
원형 상태 점은 원형, 메뉴 내부 항목은 승인 시안의 2px를 유지합니다.

## AI가 조합할 때

- 공통 클래스를 우선 사용하고 비슷한 새 버튼·색상·SVG 경로를 임의로 만들지 않습니다.
- 아이콘은 선택 사항입니다. 쓰는 경우 `dist/assets/icons.json`과 `icons/AI-USAGE.md`에서 고릅니다.
- 전체 페이지를 특정 레이아웃으로 강제하지 않습니다. 기본 틀은 제목·여백·하단 외형이며, 내부 배열은 앱이 정합니다.
- CSS는 데이터 조회·저장·업로드·메뉴 라우팅을 구현하지 않습니다. native details 동작을 제외한 동작 예시는 앱에 맞게 연결합니다.
- 새 전용 클래스를 요구하는 컴포넌트는 기존 마크업을 이관해야 합니다. 일반 dialog/menu에 최신 디자인이 자동으로 생기지는 않습니다.
- `dist/company.css`와 전역 초기화가 있는 `patterns/basic` / `patterns/services` CSS를 중복으로 섞지 않습니다.
  이들은 원본 호환 자료로 보존되어 있으며 최신 전사 조합의 기본 진입점은 `dist/company.css`입니다.
- 새 화면에 넣기 전 실제 앱에서 기본·hover·focus·disabled·선택 상태와 모바일 폭을 확인합니다.

## 코드 수정

`design/theme.css` / `design/components.css`를 수정하고 `python3 scripts/build_design.py`를 실행합니다.
`dist`만 직접 수정하면 다음 빌드에서 사라집니다. 독립 미리보기 HTML에는 CSS가 내장되어 있으므로
소스를 변경한 경우 미리보기 스타일도 재생성해야 합니다.


## v23 · 선택 드롭다운 추가
펼친 목록까지 통일하려면 native select에 `data-ui-select`를 붙이고 `dist/select.js`를 로드한 뒤 `CompanySelect.enhanceAll()`을 호출합니다. CSS만 로드하면 기본 select를 유지합니다. 작업 메뉴와 값 선택 컴포넌트는 다른 용도입니다.

```html
<label for="company">법인</label>
<select id="company" name="company" data-ui-select>
  <option value="all">전체 법인</option>
  <option value="1000">본사</option>
</select>
<script src="/assets/select.js"></script>
<script>CompanySelect.enhanceAll();</script>
```

원본 select는 값과 폼 제출의 기준으로 보존합니다. UI 선택 시 input/change 이벤트가 발생합니다.
앱 코드에서 `.value` 또는 `.selectedIndex`만 변경한 뒤에는 `CompanySelect.refresh(select)`를 호출하세요. options/disabled 변경은 감지하고 form reset도 반영합니다.
단일 선택용이며 multiple/size>1은 native를 유지합니다. 방향키/Home/End로 이동, Enter/Space로 선택, Escape로 취소, Tab으로 닫고 다음 항목으로 이동합니다. 영문 등 직접 문자 키는 항목 앞부분 탐색을 지원하며 검색 입력 기능은 아닙니다.
목록은 지원 브라우저에서 Popover top layer에 표시해 팝업·스크롤 영역에 잘리는 현상을 줄입니다. 미지원 환경의 fixed 대체 경로는 조상 transform/overflow에 영향을 받을 수 있습니다.
외부 label/aria-label을 연결하고 필수값 오류는 트리거로 포커스를 이동합니다. 앱별 오류 안내문은 aria-describedby와 함께 제공합니다.
`select-preview.html`에서 선택·비활성·필수·초기화를 확인할 수 있습니다.

## v24 드롭다운 너비
펼친 목록의 외곽 너비는 입력창의 실제 외곽 너비와 동일하게 적용합니다. 별도 최소 너비를 강제하지 않습니다.

## v25 · 공통 업무 요소 12종

`dist/business.js`와 `components/business.css`(company.css에 포함)를 추가했습니다.
- [사용 API](docs/BUSINESS-USAGE.md)
- [전사 일관성 규칙](docs/CONSISTENCY.md)
- [화면 유형별 조합](docs/PAGE-PATTERNS.md)
- [AI용 컴포넌트 목록](components.json)
- [12개 요소 통합 예제](business-preview.html)

기존 CSS만으로 데이터 조회·저장은 구현되지 않습니다. v25 JS는 선택·표시·폼 피드백 등의 공통 동작을 제공하며, DB·권한·저장은 앱 adapter에 연결합니다.

## v26 · 파일 첨부 A 확정
`CompanyBusiness.attachments(root, {icons, onChange})`를 사용합니다. `attachments-preview.html`에서 확인합니다. 선택한 File 목록은 원본 input.files와 동기화되어 FormData와 초기화에 반영됩니다. 실제 업로드는 앱이 구현합니다.

## v27 · 조회조건 정렬
`ui-filter-bar` + `ui-field` + `ui-filter-actions`를 사용합니다. 날짜 범위는 제목을 중첩하지 않고 `ui-filter-range` 내부의 승인 시작일/승인 종료일로 나눕니다. 예제: filter-bar-preview.html.
