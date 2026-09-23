# $altool setup — 초기 설치 + 세션 재개

처음 실행 시 필요한 도구를 설치하고, 기존 프로젝트면 현재 상태를 복원합니다.
**별도 플러그인 설치가 필요 없습니다** — Altool 엔진(`altool/`)과 bundled Codex local skills가 프로젝트 내부에서 동작합니다.

---

## 공통 사전검증 — 초기 설치·재개 모두 필수

아래 단계를 순서대로 직접 실행한다. 설명만 하지 말고 반드시 실행할 것.

**1단계 — Python 3 게이트 확인:**
```bash
python3 altool/scripts/check.py --help
```
실행되지 않으면 Python 3를 설치한 뒤 재확인하고, 통과 전에는 setup을 완료하지 않는다. Windows에서 `python3` 명령이 없으면 `py -3 altool/scripts/check.py --help`, 그다음 Python 3인 `python altool/scripts/check.py --help` 순서로 확인한다.

`package.json`이 있고 Node 기반 프로젝트일 때만 `node --version`도 확인한다. Node가 필요하지만 없으면 운영체제 패키지 관리자로 설치하도록 안내하고, 정적 HTML 등 Node가 필요 없는 프로젝트에는 설치를 강제하지 않는다.

**2단계 — 로컬 전용 원칙 확인:**

- 전역 Codex prompt/skill/command 설치를 수행하지 않는다.
- 프로젝트 내부 `AGENTS.md`, `altool/`, `.agents/skills/`, `.altool/`만 사용한다.
- 필요한 외부 도구는 프로젝트의 `package.json`에 이미 있거나, 해당 단계에서 사용자에게 명시한 뒤 로컬 devDependency로만 추가한다.

**3단계 — Altool 자산 확인:**

| 자산 | 확인 | 없을 때 |
|------|------|---------|
| `altool/` 엔진 폴더 | 필수 | Windows는 Altool `setup.bat`, macOS는 `setup.command` 재실행 안내 후 중단 |
| `.agents/skills/altool/` | 필수 | Windows는 Altool `setup.bat`, macOS는 `setup.command` 재실행 안내 후 중단 |
| `AGENTS.md` | 권장 | 코딩 태도와 UI 검증 절차가 비활성화된다고 안내 후 계속 |
| `.agents/skills/vercel-react-best-practices/` | 권장 | React/Next.js 성능 보조 스킬 비활성 안내 후 계속 |
| `constitution.md` + `altool/constitution.sha256` | 필수 | `standards.py validate --root .`로 제품판 일치 확인. 누락·변경이면 설치기 재실행 안내 후 중단; hash를 재작성하지 않음 |
| `designs/claude-design/` | 권장 | 폴더 생성. Claude가 만든 HTML을 여기에 넣으면 최우선 디자인 헌법으로 사용 |
| `standards/design.md` | 활성 디자인 원문 | 누락 시 복구, TBD는 Research/design_source에서 보완 후 UI 구현 |
| `standards/standard.yaml` | 필수 | 누락 시 설치기로 복구. 활성 원문 오류는 보완; AI의 표준 관리는 `altool/standards.md`를 따름 |
| `designs/` 사용자 디자인 입력 | 선택 | `altool/standards.md`의 탐색·갱신 절차로 다음 단계를 안내. oneshot/freedom에서는 필요한 정규화를 자동 실행 |
| `prd/` 폴더 | 선택 | 생성 |

**4단계 — 기존 AGENTS 연결 확인:**

`AGENTS.md`와 `altool/standards.md`를 대조한다. 표준 진입 안내가 이미 있으면 그대로 둔다. 없다면 기존 지침을 보존하며 관련 절에 `프로젝트 변경 전 altool/standards.md의 표준 선택·유지관리 절차를 따른다.` 한 줄만 보완한다. AGENTS가 없으면 이 진입 안내로 최소 파일을 만들고 나머지 행동 지침의 부재를 알린다. 기존 지침과 상충하면 임의로 덮어쓰지 말고 사용자에게 영향을 설명하고 확인한다. 사용자가 YAML이나 지침 파일을 직접 편집하도록 요구하지 않는다.

**5단계 — UI 지침 라우팅 업그레이드 확인:**

UI 프로젝트는 보존된 라우터의 과업별 회사 지침·asset_kinds/asset_ids와 팩의 guidance 지원을 확인한다. 없으면 기존 회사 계약을 읽고 `altool/standards.md`에 따라 필요한 연결을 통합한다. 새 지침은 자산과 함께 회사 팩 릴리스로 도입하며 기존 팩/지침/소비 앱 동작에 영향을 주면 사용자에게 영향과 승인 범위를 확인한다. 오래된 지침 증거를 hash만 바꿔 복구하지 않는다. 비 UI 프로젝트에 이 업그레이드를 강제하지 않는다.

## 모드 판단

공통 사전검증 후 `.altool/state/status.json` 또는 실제 Altool 산출물(`docs/00-research/*.research.md`, `docs/01-plan/features/*.plan.md`, `docs/02-spec/features/*.spec.md`, `docs/03-analyze/*.analyze.md`, `docs/04-report/*.report.md`)이 있으면 **세션 재개 모드**, 없으면 **초기 설치 모드**. 일반 `docs/`나 빈 산출물 폴더만으로 재개를 판단하지 않는다.

## 초기 설치 모드

**완료 안내:**

`_common.md`의 Step Check 계약을 적용한다. 경로는 `.altool/checks/setup.setup.json`이다. 전용 증거는 AGENTS.md/엔진 입력, Python 3 게이트·헌법 무결성·라우터 검사와 해당 시 Node.js 확인, 설치 폴더·자산이다. lesson/event/state/docs/status는 각각 `skipped(not applicable)`, `skipped(setup step)`, `skipped(no active feature)`, `skipped(no feature docs)`로 기록한다.

```
🐣 Altool 초기 설치 완료!

다음 중 하나로 시작하세요:
  • $altool research [조사 주제]             ← 먼저 조사
  • $altool oneshot [만들고 싶은 기능 설명]  ← 한 번에 자동 개발
  • $altool design_source                          ← Claude HTML/.pen/Stitch로 디자인 시스템을 만들 때
  • $altool guide                           ← 뭘 해야 할지 모르겠다면
```

---

## 세션 재개 모드

1. `altool/steps/status.md`의 절차를 수행해 현황과 최근 이력을 출력한다.
2. 마지막 phase 기준 다음 단계 명령을 안내한다.
3. 개발 상태는 `.altool/state/status.json`과 status 절차에만 기록한다. `constitution.md`는 제품 관리 원칙이며 AI가 유지하는 프로젝트 공통 계약은 `standards/`, 프로젝트별 agent 행동은 `AGENTS.md`에 둔다.
4. `_common.md` 계약으로 `.altool/checks/setup.resume.json`을 검증한다. 공통 사전검증·필수 자산·AGENTS 연결 확인 결과도 포함한다. status가 빈 상태를 보고해도 이 setup check를 생략하지 않는다. setup/resume 중 오류·차단은 안내에 남기며 lesson 이벤트로 기록하지 않는다.
