# /al setup — 초기 설치 + 세션 재개

처음 실행 시 필요한 도구를 설치하고, 기존 프로젝트면 현재 상태를 복원합니다.
**별도 플러그인 설치가 필요 없습니다** — Altool 엔진(`altool/`)이 개발 사이클 전체를 자체 수행합니다.

---

## 모드 판단

`.altool/state/status.json` 또는 `docs/` 폴더가 존재하면 → **세션 재개 모드**, 없으면 → **초기 설치 모드**.

---

## 초기 설치 모드

아래 단계를 순서대로 직접 실행한다. 설명만 하지 말고 반드시 실행할 것.

**1단계 — Node.js 확인:**
```bash
node --version
```
없으면 winget으로 설치 후 재확인:
```bash
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

**2단계 — Vercel React Best Practices 스킬 설치:**
```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices -y
```
실패해도 중단하지 않는다 — 스킬은 품질 향상용이며 필수가 아님을 안내하고 계속.

**3단계 — Altool 자산 확인:**

| 자산 | 확인 | 없을 때 |
|------|------|---------|
| `altool/` 엔진 폴더 | 필수 | Altool setup.bat 재실행 안내 후 중단 |
| `constitution.md` | 권장 | "헌법 검증이 비활성화됩니다" 안내 후 계속 |
| `designs/design.md` + `design-tokens.css` | 권장 | "디자인 토큰 강제가 비활성화됩니다. 디자인 소스가 있다면 /al design_source 실행" 안내 후 계속 |
| `prd/` 폴더 | 선택 | 생성 |

**4단계 — 완료 안내:**
```
🐣 Altool 초기 설치 완료!

다음 중 하나로 시작하세요:
  • /al oneshot [만들고 싶은 기능 설명]  ← 한 번에 자동 개발
  • /al design_source                          ← 디자인 파일(.pen/Stitch)이 있다면 먼저
  • /al guide                           ← 뭘 해야 할지 모르겠다면
```

---

## 세션 재개 모드

1. `altool/steps/status.md`의 절차를 수행해 현황과 최근 이력을 출력한다.
2. 마지막 phase 기준 다음 단계 명령을 안내한다.
3. `CLAUDE.md`(프로젝트 루트)의 "현재 개발 상태" 표가 있으면 최신 상태로 갱신한다.
