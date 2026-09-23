# 회사 개발 검증 도구

## 공통 명명 린트 연결

JS/TS 소비 프로젝트의 AI가 기존 lint 구성을 읽고 `eslint-company.mjs`를 합친다. 설치기는 이 파일을 배치할 뿐 패키지를 자동 설치하거나 고객의 eslint.config를 덮어쓰지 않는다. 비JS 프로젝트는 해당 언어의 동등 검사와 비적용 근거를 Spec에 기록한다.

검증 대상 조합: Node26.5.0 · ESLint10.10.0 · typescript-eslint8.70.0 · unicorn74.0.0 · TypeScript5.9.3. 이 숫자는 상품 스택 강제가 아니라 테스트 도구 버전이다. 프로젝트의 Node/ESLint peer 호환성을 확인하고 lockfile에 채택 버전을 고정한다. 설치 시 스크립트 실행 여부도 프로젝트 정책을 따른다.

기존 구성 뒤에 합치는 예:

```js
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import { companyNamingConfig } from './standards/tooling/eslint-company.mjs';

export default [
  // ...기존 프레임워크/보안/타입 규칙,
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/vendor/**', 'standards/tooling/**'] },
  companyNamingConfig(tseslint, unicorn),
];
```

기존 플러그인을 동일 이름으로 등록했다면 같은 객체를 전달해 중복 버전 충돌을 피한다. 이 함수는 명명 설정만 반환하며 recommended/보안 규칙을 대신하지 않는다. `types` 기반 선택자를 쓰지 않아 이 구성만으로 타입 프로젝트 로딩을 요구하지 않는다.

## 검사 범위와 예외

- 자동: JS/TS 식별자 case, I 접두어 interface, 지역 UPPER_CASE 상수, 파일명 kebab-case. 정상 camelCase/React PascalCase/모듈 상수/예약 파일/page.tsx를 허용한다.
- 폴더는 별도 검토한다. Next의 `(auth)`/`[empNo]`/병렬 경로 때문에 directory 검사는 끈다. 동적 폴더 아래의 잘못된 파일명까지 제외하지 않는다. 파일명 역할 접미어의 의미와 React 값 여부는 별도 검토다.
- 유효 식별자인 외부 snake_case 키는 전역 예외로 허용하지 않는다. 단일 어댑터에 사유를 붙인 해당 행 예외 또는 제한된 외부 DTO 파일 override를 둔다. objectLiteralProperty 전체 면제로 내부 오탈자를 숨기지 않는다.
- vendor/생성물/예약 특수 파일은 실제 경로로 범위를 제한한다. 앱 전체 naming-convention off는 동등 검증 없는 계약 면제다.
- 단어사전 의미, DB 매핑·FK·타입, 폴더·파일 역할, API 응답/권한/감사 트랜잭션은 도입 앱에서 별도 검사한다.

앱의 lint 명령에 연결한 뒤 정상 파일과 `IUser`/`user_name`/`UserForm.tsx` 등 의도적 위반을 각각 실행한다. 위반 검출, 정상 파일 통과, 정당한 예외의 범위를 Spec 증거로 남긴다. 설치 성공만으로 강제 적용 완료라고 하지 않는다.

공식 구성 근거: [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files), [typescript-eslint naming-convention](https://typescript-eslint.io/rules/naming-convention/), [unicorn filename-case](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md).

<a id="ui"></a>
## 실제 UI 계약 측정

`ui-contracts.mjs`의 `collectUiMeasurements(contracts)`는 read-only DOM 측정 함수다. 순수 비교 함수 `checkUiMeasurements(contracts, measurements)`의 정본은 제품 엔진 `altool/scripts/ui-contracts.mjs`이고 이 파일은 앱 테스트용으로 재수출만 한다. 제품 게이트는 회사 tooling을 거치지 않고 정본을 직접 실행한다. 전자는 프로젝트 Playwright의 `page.evaluate`에 전달할 수 있고, 인앱은 현재 도구 문서에 허용된 read-only DOM 관찰로 동등 값을 수집한다. 이 도구를 이유로 인앱 우선 원칙을 우회하지 않는다.

Spec에 화면별 viewport·selector·기대값을 먼저 확정하고 테스트에서 읽는다. 다음 숫자는 사용법 예시이며 모든 앱의 기본 밀도가 아니다.

```js
const contracts = [
  {id:'section-title',kind:'style',selector:'#overview h2',viewport:{width:1440,height:1000},expected:{fontSize:21,marginTop:0}},
  {id:'first-list',kind:'entry',selector:'#company-list',viewport:{width:1440,height:1000}},
  {id:'chart-labels',kind:'text',selector:'#trend text',viewport:{width:375,height:1000},minimum:13},
  {id:'previous',kind:'icon',selector:'#previous img',viewport:{width:375,height:1000},src:'/company-assets/ui-kit/internal/company/dist/assets/icons/chevron-left.svg'},
];
// 같은 viewport의 계약만 선택해 실제 해당 폭으로 측정한다.
const measured = await page.evaluate(collectUiMeasurements, selectedContracts);
const result = checkUiMeasurements(selectedContracts, measured);
expect(result.failures).toEqual([]);
```

- style은 CSS 소스 문자열이 아니라 computed px를 대조한다. entry는 문서 시작 기준 첫 viewport 안의 노출 여부다. text는 SVG 변환을 반영한 실제 글자 크기이며 라벨 간격·잘림까지 보장하지 않는다. 필요한 간격은 화면 Spec과 별도 DOM rect 검사·캡처로 대조한다. icon은 승인된 방향 파일과 추가 회전 없음을 확인한다. blob 아이콘은 별도 원본 hash·방향 관찰을 기록한다.
- 대상 부재/중복, 다른 viewport, NaN, 누락 관찰은 실패한다. 가로 넘침 없음과 글자 가독성은 다른 검사다. 공통 CSS 앞/뒤로 앱 CSS를 배치하는 회귀도 제품 테스트에서 실행한다.
- 앱별 selector·기대값은 기능 Spec/테스트가 소유한다. 결과와 캡처를 `.altool/evidence/` 등에 남겨 UI-03 및 자산 요구별 checks에 연결한다. 1개 관찰 파일을 여러 요구에 재사용해도 개별 passed/failed/pending/N/A 근거는 유지한다. 실패 기대값을 현재 화면에 맞춰 바꾸지 않는다.
- company.css 중 계층을 선언한 부분은 `altool-base → altool-components → 앱의 비계층 CSS` 우선순위를 사용한다. 번들 안에는 비계층 선언도 있어 모든 회사 CSS의 순서 독립을 보장하지 않는다. 동일 계층 내부의 구체성·소스 순서와 important 선언 등 일반 캐스케이드 규칙도 남는다. 앱 CSS의 우선권은 회사 의미·토큰의 필수 계약을 임의로 바꿀 권한이 아니다. 아래 파일 범위를 확인하고 소비 화면에서 실제 충돌을 검증한다.

### 완료 검사기에 연결

회사 v27-only 팩 2.0.0-qa.6 기준 CSS 핀은 32개이며 작성 원본 2개를 제외한 30개가 사전검사 대상이다(2.0.0-qa.1/2/3과 동일한 경로 목록). 배포 dist CSS도 일반 디렉터리 제외에 묻히지 않도록 명시적으로 검사한다. 구형 adapter·guided-runtime·patterns·Swiper CSS는 선택·배포 대상에서 제거했다. 화면은 company.css 한 벌을 사용하며 표의 개별 CSS를 함께 중복 로드하지 않는다. 작성 원본·생성 청크·번들·검사용 예제의 개수를 서로 다른 화면 수로 해석하지 않는다. 실제 브라우저 검증은 미완료이며 캐스케이드·비활성·키보드·반응형은 소비 화면에서 별도로 검증해야 한다.

| 핀 파일(프로젝트 상대 경로) | 역할 | @layer 선언 |
| --- | --- | --- |
| `designs/assets/runtime/demo.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/design/components.css` | 작성 원본·사전검사 제외 | 있음 |
| `designs/assets/ui-kit/design/theme.css` | 작성 원본·사전검사 제외 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/company.css` | 사전검사 대상 | 있음 |
| `designs/assets/ui-kit/internal/company/dist/components/accordions.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/attachments.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/business.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/data-states.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/dialogs.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/enterprise.css` | 사전검사 대상 | 있음 |
| `designs/assets/ui-kit/internal/company/dist/components/extensions.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/feedback.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/filter-bar.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/forms.css` | 사전검사 대상 | 있음 |
| `designs/assets/ui-kit/internal/company/dist/components/icons.css` | 사전검사 대상 | 있음 |
| `designs/assets/ui-kit/internal/company/dist/components/menus.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/navigation.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/page-frame.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/progress.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/recipes.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/runtime.css` | 사전검사 대상 | 있음 |
| `designs/assets/ui-kit/internal/company/dist/components/search-assist.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/sections.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/select.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/site-navigation.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/summaries.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/components/tooltips.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/foundations/layout.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/dist/foundations/tokens-2024.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/examples/business-demo.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/extensions/styles.css` | 사전검사 대상 | 없음 |
| `designs/assets/ui-kit/internal/company/recipes/recipes.css` | 사전검사 대상 | 없음 |

릴리스 제작기는 명시 색상 조합 수(checkedPairs)와 정적 미판정 규칙 수(ambiguousRules)를 서로 다른 단위로 출력·release-reports에 기록한다. 두 수치를 합쳐 전체 UI 대비 커버리지 비율로 해석하지 않는다. 정적 미판정은 실제 소비 화면에서 확인하며 사전검사는 실브라우저 검증을 대신하지 않는다.

AI가 Spec 작성 시 `.altool/ui/{기능명}.contracts.json`을 만든다. 아래는 형식 예시이며 기대값은 실제 디자인 원천에서 결정한다. `sources`에 디자인/필요한 Spec 파일의 path/sha256을 기록하고 각 계약의 source를 연결한다. Spec 본문에 JSON hash까지 적어 상호 hash 순환을 만들지 않는다. JSON hash는 Spec 소유 Step Check에 둔다.

```json
{
  "schemaVersion": 1, "feature": "demo",
  "sources": [{"path": "standards/design.md", "sha256": "실제 파일 SHA256"}],
  "implementation": ["src", "public/company-assets"],
  "contracts": [{
    "id": "overview-title", "source": "standards/design.md",
    "page": "/", "state": "default", "kind": "style", "selector": "#overview h2",
    "viewport": {"width": 1440, "height": 1000},
    "expected": {"fontSize": 21, "marginTop": 0, "color": "rgb(0, 0, 0)"}
  }]
}
```

실제 계약에는 변경 페이지·주요 상태·desktop/mobile을 포함한다. text 모음은 `expectedCount`를 필수로 지정한다. implementation에는 소비 CSS·공통 배포 파일·앱 구현·영향 있는 설정을 모두 포함하고 경로를 앱 루트 전체로 지정하지 않는다. 추가/삭제/수정이 fingerprint에 반영된다. 의존 파일 누락은 독립 Analyze에서 검사한다.

브라우저 조작으로 계약의 상태에 도달한 후 해당 viewport 계약만 측정한다. observation마다 실제 `url`과 `state`를 붙여 전체 observations로 모은다. route는 page의 query/hash까지 일치해야 한다. 입력 변경으로 URL이 바뀌면 그 상태의 page도 Spec에서 정의한다. 원시값을 꾸미지 않는다.

```sh
python3 altool/scripts/ui_gate.py --root . --contracts .altool/ui/demo.contracts.json
```

이 명령은 현재 `contractsSha256`/`implementationSha256`을 출력할 뿐 화면 검증을 수행하지 않는다. 실제 측정 직전에 기록하고, 측정 중 구현이 바뀌면 다시 실행·측정한다. 원시 관찰 JSON 형식은 `{schemaVersion:1, feature, contractsSha256, implementationSha256, observations:[...]}`다. 관찰 파일을 저장한 후 파일 sha256을 구한다.

Step Check에는 `ui: {contracts:{path,sha256}, measurements:{path,sha256}}`와 `checks["visual.ui_contracts"]={status:"done",evidence:[관찰 경로]}`를 넣는다. Spec에는 measurements가 필요 없다. Analyze/Fix의 미검증은 failed+reason 및 문서 갭으로 남긴다. 최종 Browser는 생략을 허용하지 않는다.

실측을 완료한 Step Check에는 `runtime:{url,source,identity}`도 기록한다. url은 실제 선택한 서버 주소, source는 실행 로그/프로젝트 설정 등 주소 근거, identity는 cwd·대표 화면 등 이 앱임을 확인한 근거다. 관찰 URL의 origin은 이 주소와 같아야 한다. 서버 선택은 `altool/steps/_server.md`를 따르며 기본 포트로 대체하지 않는다.

`python3 altool/scripts/check.py validate --json .altool/checks/demo.browser.json`이 파일/hash·Spec 소유 계약·구현 최신성을 검사하고 Node로 동일 비교 함수를 재실행한다. 단순 `valid:true`나 결과 문자열은 증거를 대신하지 않는다. Node가 없으면 설치된 프로젝트 런타임을 준비한 뒤 재실행하며 통과로 우회하지 않는다. 이 증거는 자동 접근성 인증이나 모든 계약 선택의 완전성 증명은 아니다.
