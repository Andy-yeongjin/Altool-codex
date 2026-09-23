# $altool browser — 실제 브라우저 기능·디자인 검증

**산출물**: `docs/03-analyze/{기능명}.browser.md`

---

## 목적

구현이 정적 분석과 빌드를 통과해도 실제 화면에서 클릭, 입력, 이동, 반응형, 레이아웃 깨짐이 남을 수 있다. `browser`는 현재 feature를 실제 브라우저 또는 Playwright로 검증하고, 발견한 코드 오류와 구현 갭을 수정한 뒤 재검증하는 정식 단계다.

`oneshot`의 마지막 브라우저 검증과 Freedom 사이클의 완료 전 시각·상호작용 검증은 이 step을 사용한다.

## 절차

`$altool browser` 뒤 입력은 현재 feature의 브라우저 검증을 위한 추가 지시다. 기능명으로 해석하거나 `currentFeature`를 전환하지 않는다.

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/browser.template.md`를 파일 읽기 도구로 읽고 그 절 구조를 아웃라인으로 사용한다.

### 1. 입력 로딩

- 기능명은 `.altool/state/status.json`의 `currentFeature`에서 읽는다. `currentFeature`가 없으면 `$altool plan {기능 설명}` 먼저 실행을 안내하고 중단한다.
- 다음 파일을 가능한 범위에서 읽는다:
  - `constitution.md`
  - `designs/claude-design/**/*.html`
  - `standards/design.md`
  - `designs/**/*.pen`, `designs/stitch/`, `designs/*.{png,jpg,jpeg,webp}`, `designs/*.{md,pdf}`
  - `docs/01-plan/features/{기능명}.plan.md`
  - `docs/02-spec/features/{기능명}.spec.md`
  - `docs/03-analyze/{기능명}.analyze.md`
  - `docs/03-analyze/{기능명}.fix.md` 또는 최근 fix 결과
  - `.altool/state/status.json`
  - 구현 파일과 테스트 파일
- 관련 과거 오류는 `lesson.md` 전체를 읽지 말고 `python3 altool/scripts/lesson.py search --query "{기능명} browser runtime ui click layout" --limit 7`로 조회한다.

### 2. 서버 준비

1. `altool/steps/_server.md`를 읽고 현재 프로젝트의 실제 URL과 소유권을 확인한다. 고정 포트 후보 목록은 사용하지 않는다.
2. 서버가 없고 프로젝트에 실행 스크립트가 있으면 현재 환경 규칙에 따라 개발 서버를 시작한다.
   - 이 browser step이 새로 시작한 서버는 `managedServer=true`로 취급하고 PID, 실행 명령, 포트, 시작 시각을 기록한다. 기존에 이미 떠 있던 서버를 사용한 경우는 `managedServer=false`로 기록한다.
   - Windows에서 npm을 직접 백그라운드 실행할 때는 `npm` 대신 `npm.cmd`를 명시한다.
   - Windows에서 `npx`, `next`, `npm` 같은 bare command가 PowerShell shim(`*.ps1`)으로 해석되면 메모장이 열릴 수 있다. 서버 시작, Playwright `webServer.command`, fallback 검증 스크립트에는 bare `npm`/`npx`/`next`를 남기지 않는다.
   - `playwright.config.ts`를 생성·수정하는 경우 `webServer.command`에 `npx next ...`, `npm run ...`, `next dev ...`를 쓰지 않는다. Windows에서는 프로젝트 로컬 실행 파일을 명시한다: `node_modules\\.bin\\next.cmd dev -p {port}`. POSIX 환경에서는 `./node_modules/.bin/next dev -p {port}`를 사용한다.
   - 서버 시작 후 HTTP 응답을 루프로 확인한다.
3. 서버를 실행할 수 없으면 browser 검증을 `failed(server unavailable)`로 남기고 중지한다. 실제 화면 검증 없이 완료 처리하지 않는다.

서버 생명주기와 `server.cleanup` 증거는 `_server.md`의 공통 규칙을 따른다.

### 3. 브라우저 검증

`AGENTS.md`의 UI 검증 조작법에 따라 Codex in-app Browser를 먼저 사용한다. 연결할 수 없거나 해당 환경에서 지원되지 않을 때만 사용자가 볼 수 있는 standalone Playwright(`headless: false`) 또는 사용 가능한 브라우저 자동화 도구를 fallback으로 사용한다. 단순 curl만으로 browser step을 완료하지 않는다.

in-app Browser에서 `Browser Use virtual clipboard is not installed` 등 clipboard 기반 입력 실패가 발생하면 같은 `fill`/`type`을 반복하지 말고, 현재 Browser 문서가 허용하는 focused keyboard 입력 또는 비-clipboard DOM/event 경로로 전환한 뒤 렌더링된 값을 확인한다.

Playwright fallback 규칙:

- 프로젝트별 `node_modules`가 있으면 Playwright는 해당 프로젝트 작업 디렉터리에서 실행한다. 전역/번들/REPL 쪽 Playwright가 오래된 browser revision을 잡을 수 있으므로, 프로젝트 검증을 persistent Node REPL이나 외부 런타임의 패키지 해석에 의존하지 않는다.
- fallback 스크립트가 필요하면 프로젝트 루트에서 `node`를 직접 실행해 로컬 `node_modules`의 `playwright` 또는 `@playwright/test`를 사용한다. 예: `.altool/tmp/browser-check.cjs`를 만든 뒤 `node .altool/tmp/browser-check.cjs`로 실행한다.
- 로컬 Playwright 위치는 `require.resolve("playwright", { paths: [process.cwd()] })` 또는 `require.resolve("@playwright/test", { paths: [process.cwd()] })`로 확인한다. 실패하면 프로젝트에 Playwright가 없는 것으로 보고 설치 안내 또는 `failed(playwright unavailable)`를 남긴다.
- Windows에서 CLI를 써야 하면 `npx` 대신 `npx.cmd`를 사용한다. 가능하면 `node_modules\\.bin\\playwright.cmd` 또는 `node_modules\\.bin\\next.cmd`처럼 로컬 `.cmd` 경로를 직접 사용한다.

필수 확인:

1. 주요 화면 전부 방문
2. 핵심 버튼 클릭
3. 폼 입력과 제출
4. 페이지 이동, 모달, 탭, 필터, 정렬, 장바구니 같은 상태 변화
5. 오류/빈 상태/로딩 상태
6. desktop과 mobile 375px 이상 반응형
7. 텍스트 겹침, 잘림, 오버플로, 클릭 불가 영역, 레이아웃 깨짐
8. 사용자 디자인 입력, 디자인 시스템, constitution.md 디자인 품질 원칙 위반
   - `designs/claude-design/**/*.html`이 있으면 최종 화면과 원본 HTML의 구조·밀도·위계·컴포넌트 외형·색상·간격·타이포·상태 표현을 먼저 대조한다.
   - `standards/design.md`의 Screen Recipes와 Capture-to-Implementation Map을 최종 화면과 대조한다.
   - 참조 브랜드·문구·이미지는 복제하지 않되, research가 추출한 구조·비례·밀도·섹션 순서·컴포넌트 외형 계약이 구현됐는지 확인한다.
   - 캡처 기반 recipe가 있는데도 일반 split SaaS hero, floating trust card 묶음, 과한 gradient overlay, glass panel, 추상 장식, 카드 그림자 남발, reference보다 느슨한 빈 화면으로 회귀하면 디자인 갭으로 기록하고 수정한다.
9. 콘솔 오류와 네트워크 실패
10. 접근성 상태 전달 계약과 텍스트 대비
    - `python3 altool/scripts/check.py contrast --root .`
    - `python3 altool/scripts/check.py a11y-contracts --root .`
11. 시간 기반 UI면 fake clock으로 pause/resume을 빠르게 여러 번 반복하고 실제 경과 대비 누적 오차가 표시 정밀도 이내인지 확인한다.

검증 결과에는 방문 URL, 수행한 사용자 행동, 기대 결과, 실제 결과, 증거(스크린샷 경로 또는 테스트 로그)를 남긴다.

UI-03 실측은 `altool/standards.md`의 **디자인 실측 완료 계약**을 따른다. Spec의 페이지·상태·viewport에서 측정해 원시 관찰 JSON을 `ui.measurements`로 연결하고 `visual.ui_contracts`를 통과시킨다. 검사기가 기대값을 재비교하므로 done 설명·캡처만으로 대체하지 않는다. 충돌은 원인을 수정하고 같은 계약으로 재검증한다. 계약의 진짜 변경이면 원천과 Spec을 먼저 갱신하며 실패 화면에 맞춰 기대값을 낮추지 않는다.

CSS custom property 검증 규칙:

- CSS 파일이 있는 UI 프로젝트는 browser 완료 전 `python3 altool/scripts/check.py css-vars --root .`를 실행한다.
- `var(--token)`으로 참조한 custom property가 어떤 CSS 파일에도 정의되어 있지 않으면 브라우저 렌더링에서 해당 선언이 무효화될 수 있으므로 `Drift` 또는 구현 갭으로 기록하고 수정한다.
- CSS-in-JS만 사용해 검사 대상 CSS 파일이 없으면 `visual.css_custom_properties=skipped(no css files)`로 남긴다.
- 통과 결과 또는 생략 사유를 browser Step Check의 `visual.css_custom_properties`에 기록한다.

자동 접근성 게이트:

- CSS 파일이 있으면 `python3 altool/scripts/check.py contrast --root .`를 통과해야 한다. 명시적 조합이 4.5:1 미만이면 색 토큰과 `standards/design.md`를 함께 수정한다.
- Spec에 `role=status` 또는 `aria-live` 계약이 있으면 `python3 altool/scripts/check.py a11y-contracts --root .`를 통과해야 한다. 보이는 완료 문구만 검사하지 말고 live-region의 실제 텍스트 또는 표시 상태를 자동 테스트에서 assertion한다.
- 해당 계약이 없을 때만 `accessibility.live_region=skipped(no live-region contract)`로 남긴다.

참조 캡처 대조 규칙:

- `designs/claude-design/**/*.html`이 있으면 원본 HTML 경로를 최우선 참조로 수집한다. 이어서 `standards/design.md`의 Reference Source Map, Screen Recipes, Capture-to-Implementation Map에서 참조 캡처 경로(`docs/00-research/assets/{Research ID}/C-__.png`)를 수집한다.
- 최종 구현 화면도 desktop과 mobile 주요 상태별로 스크린샷을 저장한다. 권장 경로는 `docs/03-analyze/assets/{기능명}/browser-final-*.png`다.
- browser 검증은 참조 캡처와 최종 화면 스크린샷을 나란히 대조한다. 픽셀 복제나 브랜드 동일성을 목표로 하지 않고, 구조·비례·밀도·섹션 순서·컴포넌트 외형·미디어 사용·타이포 위계가 Screen Recipe와 Capture Map을 따르는지 평가한다.
- 참조 캡처가 있는데 최종 스크린샷이 없거나, 최종 스크린샷이 있는데 참조 캡처와의 대조표가 없으면 browser step을 완료하지 않는다.
- 각 대조 항목은 `Pass / Drift / N/A`로 판정하고, `Drift`는 코드 또는 디자인 시스템 보강 대상으로 처리한다.

### 4. 발견 즉시 수정

브라우저 검증에서 코드 오류나 구현 갭이 발견되면 즉시 수정한다.

- 코드/타입/상태/라우팅/이벤트 핸들러 문제는 코드 수정
- Claude 디자인 HTML 미반영, 사용자 디자인 입력 미반영, 디자인 시스템 미사용, Screen Recipe/Capture Map 미반영, generic AI/SaaS 회귀, 반응형 깨짐, 텍스트 겹침은 스타일 수정
- spec 또는 plan 자체가 틀렸으면 헌법의 명세 주도 개발·추적성 원칙에 따라 문서를 먼저 보정하고 수정

수정 후 같은 브라우저 시나리오를 다시 실행한다. 같은 browser step 안에서 보완·검증 루프는 최대 5회까지 수행한다. 5회 후에도 실패하면 중지하고 남은 실패를 보고한다.

### 5. Lesson 기록

브라우저 검증에서 드러난 코드 오류와 구현 갭은 `lesson.py append`로 기록한다.

기록 대상:

- 클릭/입력/상태 전환 버그
- 브라우저 런타임 오류
- 라우팅/네트워크/렌더링 오류
- 반응형·레이아웃 깨짐
- plan/spec 기준과 구현 불일치

기록 제외:

- 사용자 취향 수준의 문구/색상 변경
- 외부 도구·환경 문제
- 서버 미실행 자체

각 이벤트에는 `recurrenceRisk`, `recurrenceScope`, `recurrenceReason`을 포함한다.

### 6. 상태·문서 갱신

- `.altool/state/status.json`: `features.{currentFeature}.phase`를 `browser`로 갱신한다.
- 브라우저 검증 통과 시 `buildVerified`는 빌드/테스트 증거가 있을 때만 `true`로 둔다.
- 검증을 통과한 항목만 plan/spec/analyze 문서 체크박스를 갱신한다.
- 관련 plan/spec/analyze 문서 상단 `상태`/`Status`도 함께 갱신한다. browser 통과 시 plan과 spec, browser 문서는 `Verified`로 표기한다. 미해소 갭이 0건이면 analyze도 `Verified`로 올리고, 사용자가 잔여 갭을 수용해 진행한 경우 analyze는 `GapsFound` 유지한다.
- analyze 문서 상단 `최종 Match Rate`와 `미해소 갭`을 현재 값으로 유지하고 `python3 altool/scripts/check.py analyze-sync --root .`를 통과시킨다.
- `docs/03-analyze/{기능명}.browser.md`에 결과를 기록한다.
- plan/spec/analyze 문서를 수정했으면 browser Step Check만으로 끝내지 않는다. 수정된 문서의 소유 Step Check(`{기능명}.plan.json`, `{기능명}.spec.json`, `{기능명}.analyze.json`)도 최신 내용으로 갱신하고 각각 `check.py validate`를 통과시킨 뒤, browser check의 `docs.synced` 증거에 갱신한 check 경로를 남긴다.

### 7. Step Check

`_common.md`의 Step Check 계약을 적용한다. 경로는 `.altool/checks/{기능명}.browser.json`이다. 공통 키 증거에는 전체 입력, lesson query, event ID 또는 `skipped(no browser issue)`, 실제 URL·화면·조작·반응형·콘솔·네트워크 결과, status의 `phase=browser`, plan/spec/analyze/browser 상태와 소유 check 동기화, browser 문서·스크린샷·로그를 포함한다.

| 항목 | 보고 기준 |
| --- | --- |
| `visual.reference_comparison` | 참조/최종 캡처, Screen Recipe/Capture Map 대조와 UI-03 실제 측정 결과(`standards/tooling/README.md#ui`). 기능 클릭 통과와 표시 준수를 구분 |
| `visual.css_custom_properties` | `python3 altool/scripts/check.py css-vars --root .` 통과 결과 또는 `skipped(no css files)` |
| `visual.contrast` | `python3 altool/scripts/check.py contrast --root .` 통과 결과 또는 `skipped(no css files)`. `ambiguousRules`는 테마/gradient를 실제 화면에서 대조한 증거와 함께 기록 |
| `accessibility.live_region` | `python3 altool/scripts/check.py a11y-contracts --root .` 통과 결과 또는 `skipped(no live-region contract)` |
| `functional.time_precision` | 반복 pause/resume clock 결과와 허용 오차 또는 `skipped(not time-based UI)` |
| `analysis.semantic_consistency` | `python3 altool/scripts/check.py analyze-sync --root .` 통과 결과 |
| `server.cleanup` | 이 step이 시작한 서버 PID/포트 종료 결과 또는 `skipped(existing server)` |

```
🐣 [al:browser] {기능명} 완료 — 산출물: docs/03-analyze/{기능명}.browser.md
   화면 {N}개 | 기능 검증 {N}건 | 디자인 검증 {N}건 | 수정 {N}건
```

- 브라우저 검증 통과 → `다음 단계: $altool report`
- 미해소 갭 존재 → `다음 단계: $altool fix` 또는 현재 browser step 안에서 남은 보완 루프 계속

Freedom 내부에서 실행 중이면 browser 통과 후 곧바로 다음 루프로 넘어가지 않는다. 반드시 `$altool report` 절차를 수행한 뒤에만 해당 Freedom 사이클을 완료 처리한다.
