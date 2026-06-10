# Altool

**헌법 기반 통합 AI 개발 시스템** — 계획부터 검증·보고까지의 개발 사이클을 `/al` 명령어 하나로 완주합니다.
플러그인 설치가 필요 없습니다. 마크다운 엔진(`altool/`)이 전부 자체 수행합니다.

> 📖 **처음이세요?** [**Altool 전체 가이드**](guides/altool-guide.html)를 브라우저로 여세요 — 설치(setup.bat)부터 개발·검증·배포까지 복사 버튼과 함께 한 페이지로 안내합니다.

---

## 이게 뭔가요?

Altool은 세 가지를 모든 구현의 기준으로 삼아 개발 사이클을 돌립니다:

| 자산 | 파일 | 역할 |
|------|------|------|
| **개발 헌법** | `constitution.md` | 개발 원칙 19개 조항 — TypeScript Strict, 보안, 반응형, 명세 우선 등 |
| **디자인 헌법** | `designs/design-constitution.md` | 정부 UIUX 가이드라인 — 대비 4.5:1, 터치 44px, 키보드 접근성 |
| **디자인 시스템** | `designs/design.md` + `design-tokens.css` | 프로젝트 고유 색상·폰트·간격 토큰 |

핵심 특징:

- **플러그인 불필요** — 개발 사이클 엔진을 마크다운 지침으로 내장 (네트워크·마켓플레이스 접근 불필요)
- **헌법·토큰 강제가 엔진 내장** — 명령어에 긴 지시문을 붙일 필요 없음
- **독립 검증 에이전트** — 갭 분석을 별도 에이전트가 수행해 자기 채점 편향 차단
- **Match Rate 4축** — Structural/Functional/Contract/Runtime 가중 공식으로 일치율 측정
- **문서 상태 동기화** — 단계 완료 시 상류 문서의 체크박스·Status 자동 갱신 (문서만 열어도 진행 상황이 보임)
- **상태 + 이력** — `.altool/state/status.json`에 phase·matchRate·append-only history 기록

---

## 설치 및 사용

### 1. setup 실행

`setup.bat` 더블클릭 → 프로젝트를 만들 폴더 선택 → 필요한 파일이 자동 복사됩니다.

### 2. Claude Code에서 프로젝트 열기

폴더를 연 뒤 대화창에 입력:

```
/al setup
```

### 3. (선택) 디자인 파일이 있다면 먼저

- **Pencil.dev**: `.pen` 파일을 `designs/`에 넣기
- **Stitch**: ZIP 압축 해제 후 `designs/stitch/`에 넣기

```
/al design_source
```

디자인 토큰을 자동 추출하고 정부 가이드라인 기준으로 교정해 `designs/design.md` + `design-tokens.css`를 생성합니다.

### 4. 기능 개발

```
/al oneshot 사용자가 이메일과 비밀번호로 가입하고 로그인할 수 있는 인증 기능
```

계획 → 설계 → 구현 → 갭 분석(독립 에이전트) → 자동 개선 → 브라우저 검증까지 자동 완주.

> `prd/` 폴더에 PRD(.md)를 넣으면 자동 감지, `prd/refs/`의 참고 문서(PDF·이미지 등)도 함께 읽습니다.
> 개발 완료 후 `start.bat`으로 서버를 실행해 확인하세요.

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/al setup` | 초기 설치 + 세션 재개 |
| `/al oneshot [기능 설명]` | 6단계 자동 완주 (PRD·.pen 자동 감지) |
| `/al guide` | 현재 단계 감지 + 다음 명령 안내 |
| `/al design_source` | .pen/Stitch → design.md + design-tokens.css 생성 |
| `/al lesson [내용]` | 바이브코딩 교훈 기록·조회 — 글로벌 `~/.altool/lesson.md`에 누적, plan·run 시작 시 자동 회고 |
| `/al plan {기능명}` | 개발 계획 → `docs/01-plan/features/` |
| `/al design {기능명}` | 상세 설계 (아키텍처 3안 비교) → `docs/02-design/features/` |
| `/al run {기능명}` | 코드 구현 (Depth-First + 빌드 검증) |
| `/al analyze {기능명}` | 갭 분석 (독립 에이전트, 4축 Match Rate) → `docs/03-analyze/` |
| `/al fix {기능명}` | 갭 발견 시 자동 개선 → 재검증 (최대 5회) |
| `/al report {기능명}` | 완료 보고서 → `docs/04-report/` |
| `/al status` | 기능별 진행 현황 + 최근 이력 |

---

## 프로젝트에 설치되는 파일

| 파일/폴더 | 용도 |
|----------|------|
| `altool/` | **엔진** — 공통 규칙(CLAUDE.md) + 단계별 절차(steps/ 12종) + 산출물 템플릿(templates/ 6종) |
| `.claude/commands/al.md` | `/al` 명령어 라우터 |
| `CLAUDE.md` | 세션 시작 시 자동으로 읽히는 프로젝트 컨텍스트 |
| `constitution.md` | 개발 헌법 (19개 조항) |
| `designs/` | 디자인 헌법 + 디자인 시스템 (design.md + design-tokens.css) |
| `prd/` | PRD 보관 폴더 (자동 감지) |
| `start.bat` / `end.bat` | 개발 서버 실행/종료 |
| `.gitignore` | `.altool/` 등 제외 (없을 때만 생성) |

---

## 기술 스택 (기본)

| 영역 | 기술 |
|------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript (Strict Mode) |
| Database | SQLite (로컬) → NeonDB/Supabase (배포 전 ADR로 결정) |
| ORM | Prisma 또는 Drizzle |
| Styling | CSS Modules + design-tokens.css |
| Auth | Auth.js (NextAuth) |

---

## 자주 묻는 질문

**Q. 별도 플러그인이나 도구를 설치해야 하나요?**
아니요. Altool 엔진(마크다운 지침)이 개발 사이클을 자체 수행합니다. 플러그인·네트워크 불필요.

**Q. 다른 AI 개발 워크플로우 도구와 뭐가 다른가요?**
대부분 외부 플러그인에 의존하거나 검증을 같은 AI가 스스로 합니다. Altool은 플러그인 없이 동작하고, 갭 분석을 독립 검증 에이전트에 분리하며, 문서 동기화·교훈(lesson) 누적으로 쓸수록 정확해집니다.

**Q. 헌법을 커스터마이징하고 싶어요**
프로젝트의 `constitution.md`를 직접 수정하면 됩니다.

**Q. altool/ 폴더만 다른 프로젝트에 복사해도 되나요?**
됩니다. `altool/` + `.claude/commands/al.md` 두 가지만 있으면 동작합니다 (자산 감지형 — constitution.md 등이 없으면 해당 규칙만 비활성).

---

## License

MIT
