# Altool

**헌법 기반 통합 AI 개발 시스템** — 조사부터 검증·보고까지의 개발 사이클을 Codex 명령어 `$altool` 하나로 완주합니다.
외부 플러그인 설치가 필요 없습니다. 마크다운 엔진(`altool/`)과 bundled Codex local skills가 프로젝트 안에서 동작합니다.

> 📖 **Codex 변환본 기준 문서**는 이 README, 설치용 `AGENTS.md`, `constitution.md`입니다. `guides/`의 HTML 문서도 `$altool` 기준의 보조 안내로 맞춥니다.

---

## 이게 뭔가요?

Altool은 네 가지 자산을 기준으로 개발 사이클을 돌립니다:

| 자산 | 파일 | 역할 |
|------|------|------|
| **프로젝트 헌법** | `constitution.md` | 설치 프로젝트의 방법론, 기술 기본값, 디자인 권위, 품질 게이트, 언어·시간대 정책 |
| **Claude 디자인 헌법** | `designs/claude-design/**/*.html` | Claude에서 만든 HTML 화면 — 있으면 모든 디자인 기준 중 1순위 |
| **사용자 디자인 입력** | `designs/**/*.pen`, `designs/stitch/`, 스크린샷, 디자인 문서 | Claude 디자인 HTML이 없을 때 화면 구조와 시각 의도의 최우선 원천 |
| **디자인 시스템** | `standards/design.md` | 디자인 입력을 정규화한 값·컴포넌트·화면 규칙의 구현 계약. Claude HTML이 있으면 HTML의 미정 영역을 보완 |

핵심 특징:

- **외부 플러그인 불필요** — 개발 사이클 엔진과 보조 Codex local skills를 repo에 내장 (사용자별 `npx skills add` 불필요)
- **Research-first** — plan 전에 웹 조사 결과를 `docs/00-research/`에 누적하고, 만들 기능은 plan에서 확정
- **헌법·디자인 시스템 정책 내장** — `designs/claude-design/**/*.html`이 있으면 1순위 디자인 헌법으로 사용, `design.md`를 구현 기준으로 정규화
- **독립 검증 에이전트** — 갭 분석을 별도 에이전트가 수행해 자기 채점 편향 차단
- **Match Rate 4축** — Structural/Functional/Contract/Runtime 가중 공식으로 일치율 측정
- **Step Check 강제** — 각 단계가 `.altool/checks/`에 검증 증거를 남기고, `oneshot` 부모 게이트가 하위 체크와 문서 동기화를 다시 검증
- **문서 상태 동기화** — 단계 완료 시 상류 문서의 체크박스·Status 자동 갱신 (문서만 열어도 진행 상황이 보임)
- **상태 + 이력** — `.altool/state/status.json`에 feature별 phase·matchRate와 append-only history 기록

---

## 설치 및 사용

### 1. setup 실행

Windows는 `setup.bat`, macOS는 `setup.command`를 실행한 뒤 대상 프로젝트 폴더를 선택합니다. Python 3가 필요하며 YAML 파서는 제품에 포함되어 별도 pip 설치·가상환경 활성화가 필요 없습니다. macOS는 `bash setup.command "/path/to/project"`로도 실행할 수 있습니다. Windows 더블클릭 실행은 오류 안내를 확인한 뒤 창을 닫으며, 경로 인자 실행은 대기 없이 종료 코드를 반환합니다.

설치기는 엔진·bundled skill·제품 헌법을 갱신하고 `AGENTS.md`와 `standards/` 기존 파일은 보존합니다. 기존 헌법이 다르면 `.altool/backups/constitution.<hash>.md`에 백업한 뒤 제품판으로 교체합니다. 기존 `designs/design.md`만 있으면 `standards/design.md`로 복사하고 원본을 남깁니다. 두 디자인 파일이 다르면 새 경로를 기준으로 사용합니다. 보존된 AGENTS에 표준 진입 안내가 없으면 `$altool setup`에서 AI가 기존 지침을 보존하며 보완합니다. 초기 설치·재개 모두 필수 환경과 정책을 검증하며 일반 `docs/` 폴더만으로 재개를 판단하지 않습니다.

### 2. Codex에서 프로젝트 열기

폴더를 연 뒤 대화창에 입력:

```
$altool setup
```

### 3. (선택) 디자인 파일이 있다면 먼저

루트의 [Altool 프로젝트 스타터](project-starter.html)를 데스크톱 Chrome/Edge에서 열면 PRD와 디자인을 한 화면에서 준비할 수 있습니다. 대상 프로젝트 폴더 선택 → 기존 PRD(.md/.txt) 가져오기 또는 새 PRD 작성 → 디자인·참고자료 선택 → 저장 내용 확인 → **프로젝트에 저장** 순서입니다. 쓰기 권한을 허용하면 `prd/`, `prd/refs/`, `designs/claude-design/`, `designs/`, `designs/stitch/`에 종류별로 직접 저장합니다. ZIP 다운로드·서버 업로드는 하지 않으며 기존 파일은 덮어쓰기 확인 후 저장합니다. 디자인만 준비하는 모드도 있습니다.

스타터와 `altool/`은 함께 두어야 하며 설치기가 대상 프로젝트에도 복사합니다. 파일 선택·폼 입력은 새로고침하면 초기화됩니다. 폴더 쓰기를 지원하지 않는 브라우저에서는 안내만 표시하고 저장하지 않습니다. 아래처럼 직접 파일을 배치해도 됩니다.

- **Claude 디자인 HTML**: Claude에서 만든 `.html` 파일을 `designs/claude-design/`에 넣기
- **Pencil.dev**: `.pen` 파일을 `designs/`에 넣기
- **Stitch**: ZIP 압축 해제 후 `designs/stitch/`에 넣기

```
$altool design_source
```

색상·폰트·간격·컴포넌트 외형·미디어 규칙을 추출하고 `constitution.md`의 범용 디자인 품질 원칙을 기준으로 검토해 `standards/design.md`를 생성합니다.

`$altool oneshot ...` 또는 `$altool freedom ...`을 바로 실행해도 됩니다. Claude HTML·Pencil·Stitch 원본(하위 폴더·보조 자산 포함)과 기존 계약을 비교해 동기화가 필요할 때 `design_source`를 자동 실행합니다. 일반 이미지·디자인 문서만 있으면 Research가 담당합니다. 변경이 없으면 기존 계약을 재사용하며 공통 판단 절차는 `altool/standards.md`에 있습니다.

### 4. 조사 후 기능 개발

조사를 먼저 여러 번 할 수 있습니다. 이 단계는 feature를 만들지 않습니다.

```
$altool research 쇼핑몰 상품 상세 페이지와 장바구니 UX 조사
```

조사 결과가 마음에 들면 plan에서 실제로 만들 기능을 말합니다.

```
$altool oneshot 사용자가 이메일과 비밀번호로 가입하고 로그인할 수 있는 인증 기능
```

`oneshot`은 웹 조사 → 계획 → 명세 → 구현 → 갭 분석(독립 에이전트) → 자동 개선 → 브라우저 검증까지 자동 완주합니다. PRD가 있으면 PRD가 기준 계약이고, research는 PRD를 더 잘 구현하기 위한 보강재로 사용됩니다.

긴 프로젝트를 지정한 횟수만큼 자율 진행하려면 Freedom으로 시작합니다.

```
$altool freedom 쇼핑몰 만들어줘 --loops 10
$altool freedom 쇼핑몰 만들어줘 10회
$altool say 결제는 제외하고 장바구니까지만 해
$altool ask 지금 뭐하고 있어?
```

`$altool freedom`에서 각 루프는 action 하나가 아니라 자율 개발 사이클입니다. `loopBudget`은 같은 제품의 완성도 반복 횟수입니다. 모든 사이클은 먼저 research를 수행하고, 그 조사 결과로 전체 제품의 완성형 목표를 정합니다. 모든 구현 루프는 사용자의 전체 요청을 만족하는 end-to-end 제품 경험을 기준으로 하고, 후속 루프는 같은 제품을 다시 조사·관찰해 기능·UX·디자인·품질을 성숙시킵니다. 이후 필요한 `plan/spec/run/analyze/fix/browser/report` step을 실제 수행하며, 구현/UI 사이클은 browser 검증 뒤 report까지 완료해야 루프 완료로 기록합니다. 다음 루프의 구체 작업은 시작 시점에 미리 정하지 않고 다음 research에서 다시 결정합니다. 로컬 control-plane만 검증할 때는 `python3 altool/scripts/freedom_loop.py "쇼핑몰 만들어줘" --loops 5 --interval 1`을 사용할 수 있습니다.

Freedom 진행 상태는 `.altool/freedom/state.json`, `outbox.jsonl`, `journal.md`에 같이 기록됩니다. 각 action 시작/완료 때 `currentAction`이 갱신되고, 사이클 완료 때만 `loopsCompleted`가 증가합니다.
각 단계는 산출 문서의 체크박스와 상단 `상태`/`Status`를 함께 갱신합니다.

> `prd/` 폴더의 PRD(.md)는 범위 계약입니다. `prd/refs/`는 관련 항목을 선택해 읽고, 활성 개발 표준은 라우터가 지정한 의존 항목까지 읽습니다.
> 개발 완료 후에는 browser 단계의 스크린샷·검증 문서를 먼저 확인하고, 필요하면 Windows의 `start.bat` 또는 macOS의 `start.command`로 직접 실행해 볼 수 있습니다.

---

## 명령어

| Codex 명령어 | 설명 |
|--------|------|
| `$altool setup` | 초기 설치 + 세션 재개 |
| `$altool research [조사 주제]` | 웹 조사 → `docs/00-research/`, feature 생성 없음 |
| `$altool oneshot [기능 설명]` | 웹 조사 포함 7단계 자동 완주. 공통 디자인 입력 절차에 따라 필요한 정규화 자동 실행 |
| `$altool freedom [목표] --loops N` | 무전기 inbox/outbox를 감시하며 지정 횟수만큼 자율 개발 사이클 진행. 필요 시 `design_source` 자동 실행 |
| `$altool say [내용]` | Freedom 루프에 방향 변경 전달 |
| `$altool ask [내용]` | Freedom 루프 상태 질문 |
| `$altool pause` / `$altool resume` / `$altool stop` | Freedom 일시정지·재개·중단 |
| `$altool outbox` | Freedom 응답과 진행 로그 확인 |
| `$altool guide` | 현재 단계 감지 + 다음 명령 안내 |
| `$altool design_source` | Claude HTML/.pen/Stitch → design.md 생성 |
| `$altool lesson [내용]` | 바이브코딩 교훈 이벤트 기록·조회 — 전역 `~/.altool/events.jsonl`에 누적, index 검색으로 자동 회고 |
| `$altool plan {기능 설명}` | PRD를 기준으로 삼고 research로 보강해 개발 계획 생성 → `docs/01-plan/features/` |
| `$altool spec [추가 지시]` | 현재 plan 기준 구현 명세 (아키텍처 3안 비교) → `docs/02-spec/features/` |
| `$altool run [추가 지시]` | 현재 plan/spec 기준 코드 구현 (Depth-First + 빌드 검증) |
| `$altool analyze [추가 지시]` | 현재 기능 갭 분석 (독립 에이전트, 4축 Match Rate) → `docs/03-analyze/` |
| `$altool fix [추가 지시]` | 현재 기능 갭 발견 시 자동 개선 → 재검증 (최대 5회) |
| `$altool browser [추가 지시]` | 실제 브라우저 클릭·입력·반응형·레이아웃 검증 |
| `$altool report [추가 지시]` | 현재 기능 완료 보고서 → `docs/04-report/` |
| `$altool status` | 기능별 진행 현황 + 최근 이력 |

---

## 프로젝트에 설치되는 파일

설치기를 사용해 `altool/`, `.agents/skills/altool/`, `AGENTS.md`, `constitution.md`, `standards/`를 함께 설치합니다. 현재 엔진은 제품 헌법·무결성 기준·라우터가 누락되거나 헌법이 변경되면 검증을 통과시키지 않습니다. 기존 엔진의 선택 자산 정책과 혼동하지 마세요.

| 파일/폴더 | 용도 |
|----------|------|
| `altool/` | **엔진** — 단계별 절차(steps/) + 스크립트(scripts/) + 산출물 템플릿(templates/) |
| `AGENTS.md` | Codex가 읽는 코딩 태도 + UI 검증 도구 조작법 + Altool 연결 규칙 |
| `.agents/skills/altool/` | `setup.bat` / `setup.command`가 등록하는 Codex 로컬 스킬 `$altool` |
| `.agents/skills/vercel-react-best-practices/` | React/Next.js 구현·리뷰·리팩터링 시 적용되는 Vercel 성능 최적화 로컬 스킬 |
| `constitution.md` | Altool 제품 관리 헌법 (방법론 + 기술 기본값 + 디자인 권위 + 품질 + 언어·시간대) |
| `designs/claude-design/` | Claude가 만든 HTML을 넣는 폴더. 있으면 최우선 디자인 헌법 |
| `designs/` | 사용자 디자인 원본 (HTML, .pen, Stitch, 이미지 등) |
| `designs/assets/` | 회사 디자인 편집은 `ui-kit/design/`의 theme.css·components.css, 구현·생성물·참고는 `ui-kit/internal/`. CI·문구와 함께 의미 ID·버전 lock으로 사내 공통 배포 |
| `standards/standard.yaml` | 활성 프로필·과업별 지침·원문 항목·의존 관계·자산 종류/의미 ID 후보 라우터 |
| `standards/*.md` | 디자인·기술/명명·데이터·권한·일괄 입력 계약. 기존 파일 보존 |
| `prd/` | PRD 보관 폴더 (자동 감지) |
| `start.bat` / `end.bat` | Windows `setup.bat`이 설치하는 개발 서버 실행/종료 파일 |
| `start.command` / `end.command` | macOS `setup.command`가 설치하는 개발 서버 실행/종료 파일 |
| `.gitignore` | `.altool/` 등 제외 (없을 때만 생성) |

`start.*`는 `package.json`의 `scripts.dev`가 있을 때만 실행하고 PID를 기록한다. `end.*`는 그 PID의 프로젝트 프로세스만 종료하며, PID가 없으면 포트 점유 정보를 보여줄 뿐 임의 프로세스를 종료하지 않는다.

---

## 작업별 표준 읽기

`constitution.md`는 제품이 관리하는 판단 원칙, `standards/*.md`는 AI가 유지하는 프로젝트 공통 계약, PRD·Spec은 기능 범위와 구현 결정을 소유합니다. 사용자는 원하는 동작만 대화로 요청하면 됩니다. AI가 기존 계약 재사용·갱신·추가 여부를 판단하고 라우터를 함께 관리합니다. 기능 한정 요구는 Spec에 남기며, 불필요한 표준 수정은 하지 않습니다. 일반 대화와 Altool 명령은 `altool/standards.md`의 동일한 절차를 사용합니다.

```sh
python3 altool/scripts/standards.py validate
python3 altool/scripts/standards.py read --tag ui-change
python3 altool/scripts/standards.py read --tag ui-create --tag login-ui
python3 altool/scripts/assets.py read service.authentication
python3 altool/scripts/standards.py read --tag bulk-import --tag ui-create
```

기본 `active_profiles: [base]`는 사내 공통 명명·용어·코드 경계, 스키마, API/오류 계약과 디자인·공통 UI 지침을 작업별로 선택합니다. 코드 작업에 DB·인증 규칙 전체를 읽히지는 않습니다. YAML이 지침과 자산 후보를 안내하고 선택 자산의 `guidance`가 회사 배치·사용·동작 규칙과 참고 MD를 구분합니다. AI가 필요한 프로필·표준을 관리하며 사용자가 YAML을 편집할 필요는 없습니다. `internal-common`은 조직/역할/감사/일괄 입력 기반의 선택형 묶음이며 사내 배포라는 이유만으로 모든 앱에 추가하지 않습니다. `templates/prd/common-platform.md`는 선택형 PRD 출발점으로 자동 설치하지 않습니다. 스택은 기본값이며 기존 프로젝트를 자동 전환하지 않습니다.

누락됐던 단어사전·DB 제약/인덱스·파일/함수 명명·API 오류 코드를 분리된 원문에 보완했습니다. [원문 v3 대조표](standards/reference/common-v3-alignment.md)에서 항목별 채택·보정·기능 PRD 이동을 확인할 수 있습니다. [공통 린트 연결 안내](standards/tooling/README.md)와 설정 파일은 새 설치에 포함되며, AI가 앱의 기존 린트 구성에 연결해 실제 위반 검출을 확인합니다. 파일 배치 자체는 lint 실행·업무 기능 구현 완료가 아닙니다.

구현 전 탐색·Spec 연결, 완료 전 지침별 검증은 일반 개발/Altool 모두 필수입니다. `assets.py requirements --usage ...`로 검증 항목을 확인한 뒤 실제 관찰을 기록하고 `evidence`를 실행합니다. 누락·미검증·오래된 지침/구현/관찰 증거는 게이트에서 실패합니다. 회사 지침은 `designs/assets/guidance/`에서 자산과 함께 버전 배포하며 KRDS 원문은 참고로 보존합니다. 기존 설치는 표준/팩을 유지하므로 새 라우팅 적용에는 명시적인 업그레이드 검토와 소비 앱 재검증이 필요합니다.

라우터는 태그와 requires로 관련 원문만 선택합니다. 세부 항목은 `<a id="audit"></a>` 같은 고정 anchor로 찾으며 `sections: ['*']`는 전체 계약입니다. 분류가 모호하면 `read --all`로 활성 원문을 넓게 읽고, `inactive_candidates`는 AI가 필요성을 검토할 후보로만 사용합니다. 구현/검증 단계에는 `standardsDecisions`로 후보별 비적용 근거를 기록하며 적용 대상은 활성화·재선택합니다. `resolve`의 출처 hash와 선택 목록은 작업 Step Check에 기록되며, 오래되거나 누락된 증거는 완료 게이트가 거부합니다. 실제 준수 여부는 연결된 테스트·독립 검증·브라우저 확인으로 판정합니다.

제품 저장소 검사: `python3 altool/scripts/check.py css-vars --root . --exclude tests/fixtures`는 의도적 반례 fixture만 제외하는 공식 호출입니다. 제외 인자 없는 기본 명령은 계속 전체를 검사하며 현재 반례에서 실패합니다. 소비 앱은 자기 검사 범위를 명시하고 tests 전체를 자동 면제하지 않습니다. 제품 Plan/Spec/분석의 현재 증거·감사 실패와 일반 개발 기록의 구분은 [문서 상태 색인](docs/verification-status.md)을 확인하세요. 과거 실행 기록을 최신 oneshot 통과로 해석하지 않습니다.

새 제품 엔진이 없는 프로젝트만 legacy 방식으로 동작합니다. 현재 설치에서 헌법·라우터를 지워 규칙을 우회할 수는 없습니다. 무결성 검사는 실수·변경 감지용이며 로컬 파일 소유자의 변조를 방지하는 보안 경계는 아닙니다. 자세한 적용·갱신·예외·증거 규칙은 [표준 절차](altool/standards.md)를 참고하세요.

회사 팩 제작 시 배포 CSS의 변수·명시적 대비를 사전 검사합니다. 앱에서는 별도로 [실제 UI 계약 측정](standards/tooling/README.md#ui)을 통해 글자·간격·화면 밀도·SVG 글자·방향 아이콘을 확인합니다. 공통 CSS 기본값과 화면 CSS의 계층을 분리하며, 좌우 이동은 등록된 방향 고정 아이콘을 선택합니다. 파일 재사용·클릭 성공만으로 표시 준수를 선언하지 않습니다.

UI 작업은 Spec에서 출처가 있는 실측 계약을 고정하고 Analyze에서 누락·불일치를 갭으로 확인합니다. Browser 완료 검사기는 원시 관찰을 재비교하며 계약·원천·구현 변경이나 미검증을 차단합니다. 서버는 고정 포트가 아니라 현재 프로젝트 실행 기록·설정의 실제 URL로 확인합니다. 비개발자가 별도로 CSS 충돌 검수를 요청할 필요 없이 이 절차를 수행하되, 자동 실측이 모든 시각적 적절성을 증명하는 것은 아닙니다.

## 기술 스택 (권장 기준)

Altool은 특정 스택을 강제하지 않습니다. plan/spec에서 요청 범위와 프로젝트 상태를 보고 정합니다. 일반적인 앱은 아래 기준을 우선하지만, 단일 정적 페이지처럼 단순한 요청이면 HTML/CSS/JS로도 구현할 수 있습니다.

| 영역 | 기술 |
|------|------|
| 일반 웹앱 | Next.js (App Router) + TypeScript |
| 단일 정적 페이지 | HTML/CSS/JS 허용 |
| Database | 필요할 때 SQLite(로컬) → NeonDB/Supabase 등은 ADR로 결정 |
| ORM | DB가 있을 때 Prisma 또는 Drizzle |
| Styling | `designs/claude-design/**/*.html` 우선 + `standards/design.md` 기반 스타일 |
| Auth | 필요할 때 Auth.js 등으로 결정 |

---

## 자주 묻는 질문

**Q. 별도 플러그인이나 도구를 설치해야 하나요?**
아니요. Altool 엔진과 bundled Codex local skills가 함께 복사됩니다. 사용자별 플러그인 설치나 `npx skills add` 실행은 필요 없습니다.

**Q. 다른 AI 개발 워크플로우 도구와 뭐가 다른가요?**
대부분 외부 플러그인에 의존하거나 검증을 같은 AI가 스스로 합니다. Altool은 플러그인 없이 동작하고, 갭 분석을 독립 검증 에이전트에 분리하며, 문서 동기화·교훈(lesson) 누적으로 쓸수록 정확해집니다.

**Q. 프로젝트 규칙을 바꾸고 싶어요**
원하는 동작을 대화로 요청하세요. AI가 공통 규칙은 `standards/`, 기능 한정 요구는 PRD/Spec에 반영합니다. 헌법은 제품 업데이트로만 변경합니다. 공통 변경이 요청 밖의 화면·권한·데이터에 영향을 주면 AI가 사용자에게 보이는 영향을 설명하고 확인합니다.

**Q. altool/ 폴더만 다른 프로젝트에 복사해도 되나요?**
일부 폴더만 복사하지 말고 설치기를 사용하세요. 현재 엔진은 로컬 스킬뿐 아니라 제품 헌법·무결성 기준·표준 라우터도 필요합니다. 상세 명령 규칙은 Altool skill과 `altool/steps/`에 둡니다.

---

## License

Original Altool-codex source code, scripts, templates, and documentation are
licensed under the [MIT License](LICENSE).

Bundled third-party materials, including the Vercel React Best Practices skill,
the Digital Government Service UI/UX guideline PDF, and guide screenshots, keep
their original ownership and terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
