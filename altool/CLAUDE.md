# Altool 엔진 — 헌법 기반 통합 개발 시스템

> **Altool**은 개발 헌법·디자인 시스템·개발 사이클(계획→설계→구현→검증→개선→보고)을 하나로 통합한 개발 시스템입니다.
> 플러그인 설치 없이 마크다운 지침만으로 동작하며, 모든 기능을 `/al` 단일 명령어로 사용합니다.
> 이 파일은 모든 `/al` 명령 실행의 **공통 규칙**입니다. 각 하위 명령의 상세 절차는 `altool/steps/`에 있습니다.

---

## 명령어 라우팅

`/al {하위명령} [기능명] [추가 지시]` 입력 시 아래 표의 step 파일을 **Read 도구로 읽고 그 지침을 그대로 수행**한다.

### 워크플로우 명령

| 명령어 | step 파일 | 역할 |
|--------|----------|------|
| `/al setup` | `altool/steps/setup.md` | 초기 설치 + 세션 재개 (Node 확인, 스킬 설치, 자산 확인) |
| `/al oneshot {기능 설명}` | `altool/steps/oneshot.md` | plan→design→run→analyze→fix→브라우저 검증 6단계 자동 완주 |
| `/al guide` | `altool/steps/guide.md` | 현재 단계 감지 + 다음 명령 안내 |
| `/al design_source` | `altool/steps/design_source.md` | 디자인 소스(.pen/Stitch) → design.md + design-tokens.css 생성 |
| `/al lesson [내용]` | `altool/steps/lesson.md` | 바이브코딩 교훈 기록·조회 (글로벌 `~/.altool/lesson.md` 단일 저장소) |

### 개발 사이클 명령 (단계별 수동 실행)

| 명령어 | step 파일 | 산출물 |
|--------|----------|--------|
| `/al plan {기능명}` | `altool/steps/plan.md` | `docs/01-plan/features/{기능명}.plan.md` |
| `/al design {기능명}` | `altool/steps/design.md` | `docs/02-design/features/{기능명}.design.md` |
| `/al run {기능명}` | `altool/steps/run.md` | 소스 코드 |
| `/al analyze {기능명}` | `altool/steps/analyze.md` | `docs/03-analysis/{기능명}.analysis.md` |
| `/al fix {기능명}` | `altool/steps/fix.md` | 개선 코드 + `docs/03-analysis/{기능명}.fix.md` |
| `/al report {기능명}` | `altool/steps/report.md` | `docs/04-report/{기능명}.report.md` |
| `/al status` | `altool/steps/status.md` | 현황 + 최근 이력 출력 |

- 알 수 없는 하위명령 → 위 표를 요약한 사용법 안내 후 중단.
- 기능명이 필요한 명령에 기능명이 없으면 → `사용법: /al {하위명령} {기능명}` 안내 후 중단.
- 기능명의 공백은 하이픈(-)으로 치환하여 파일명에 사용.

## 산출물 템플릿

각 단계는 문서 생성 전 **반드시** 해당 템플릿을 Read 도구로 읽고 절(섹션) 구조를 그대로 따른다. 기억에 의존한 문서 생성 금지.

| 단계 | 템플릿 |
|------|--------|
| plan | `altool/templates/plan.template.md` |
| design | `altool/templates/design.template.md` |
| run | `altool/templates/run.template.md` (구현 가이드 구조) |
| analyze | `altool/templates/analysis.template.md` |
| fix | `altool/templates/fix.template.md` |
| report | `altool/templates/report.template.md` |

- 템플릿 구조는 그대로 따르되, **채워 넣는 내용은 한글로 작성**한다 (헌법 제0조).
- 해당 없는 절은 "N/A" 표기하거나 제거한다.

## Context Anchor 전파

전략적 맥락(WHY/WHO/RISK/SUCCESS/SCOPE)이 단계 간에 끊기지 않도록 전파한다:

```
plan에서 생성 → design 상단에 복사 → run 시작 시 표시 → analyze 문서에 복사해 검증 기준으로 사용
```

## Checkpoint 시스템

단계마다 AskUserQuestion으로 사용자 확인을 받는다:

| Checkpoint | 단계 | 내용 |
|-----------|------|------|
| 1 | plan | 요구사항 이해 확인 |
| 2 | plan | 미확정 요소(엣지 케이스·에러 처리·연동) 질문 |
| 3 | design | 아키텍처 3안(A: 최소 변경 / B: Clean / C: 실용 균형) 중 선택 |
| 4 | run | 구현 범위 승인 (승인 없이 구현 시작 금지) |
| 5 | analyze | 발견 이슈 처리 방침 (모두 수정 / Critical만 / 그대로 진행) |

> **자동 파이프라인 예외**: `/al oneshot` 내부에서 호출되었거나 "자동 진행"이 명시된 경우 Checkpoint를 건너뛰고 **권장 옵션으로 자동 진행**한다 (design은 Option C, analyze는 "모두 수정").

## Match Rate 공식 (4축 가중)

```
런타임 검증 실행 시:
  Overall = (Structural × 0.15) + (Functional × 0.25) + (Contract × 0.25) + (Runtime × 0.35)
정적 분석만 가능 시 (서버 미실행):
  Overall = (Structural × 0.2) + (Functional × 0.4) + (Contract × 0.4)
※ 해당 없는 축(예: API 없는 기능의 Contract)은 제외하고 나머지 가중치를 비율대로 재정규화하며, 그 사실을 문서에 명시한다.
```

| 축 | 측정 대상 |
|----|----------|
| **Structural** | 파일 존재, 라우트 커버리지, 컴포넌트 목록 일치 |
| **Functional** | 플레이스홀더 검출, Page UI Checklist(design §5.4) 구현 여부, 로직 완성도 |
| **Contract** | Design §4 ↔ 서버 route ↔ 클라이언트 fetch 3-way 대조 |
| **Runtime** | L1(API) × 0.4 + L2(UI) × 0.3 + L3(E2E) × 0.3 |

- **90% 이상 = 통과** (fix 진입/종료 기준).
- analyze의 갭 분석은 **독립 검증 에이전트**에 위임한다 (자기 채점 금지 — steps/analyze.md).

## 상태 관리 — `.altool/state/status.json`

모든 단계 완료 시 갱신한다. 폴더·파일이 없으면 생성한다. (`.altool/`은 .gitignore에 추가 권장)

```json
{
  "currentFeature": "기능명",
  "features": {
    "기능명": {
      "phase": "plan | design | run | check | fix | completed",
      "matchRate": null,
      "iterationCount": 0,
      "startedAt": "YYYY-MM-DD",
      "updatedAt": "YYYY-MM-DD"
    }
  },
  "history": [
    { "timestamp": "YYYY-MM-DDTHH:mm:ss+09:00", "feature": "기능명", "phase": "plan", "action": "completed" }
  ]
}
```

- phase 표기: analyze 완료 = `check`, fix 완료 = `fix`, report 완료 = `completed`.
- **history**: 각 단계 완료 시 1건 추가 — `{ timestamp, feature, phase, action }`. timestamp는 Asia/Seoul(+09:00) ISO 형식. `action`은 `completed` / `iterated` / `skipped`. **append-only** — 기존 이력 수정·삭제 금지.
- 단계를 건너뛰고 실행하면 (예: plan 없이 design) → 경고 후 사용자에게 진행 여부 확인.

## Fix 규칙

- 실행 조건: Match Rate < 90%
- 수정 → **자동 재분석(re-Check)** → 90% 도달 또는 **최대 5회** 반복 시 중단 (`/al oneshot` 내부에서는 2회 후 사용자 확인)

## Altool 자산 규칙 (감지형 — 있으면 강제, 없으면 표준 모드)

Altool 엔진은 **단독 이식이 가능**해야 한다. 아래 자산은 프로젝트 루트에서 **감지되면 강제 적용**하고, 없으면 해당 규칙만 비활성화한 채 진행한다. 비활성 시 **세션당 1회만** 경고한다:

```
ℹ️ Altool 자산 일부 없음: constitution.md → 헌법 검증 생략
   전체 기능을 쓰려면 Altool의 setup.bat으로 프로젝트를 구성하세요.
```

| # | 자산 | 있을 때 | 없을 때 |
|---|------|---------|---------|
| 1 | `constitution.md` | plan/design/run/fix 시 Read로 직접 읽고 전 조항 준수 | 헌법 검증 생략 |
| 2 | `designs/design.md` + `designs/design-tokens.css` | 모든 UI 수치 `var(--토큰명)` 강제, 하드코딩 금지, 없는 토큰은 추가 후 사용 | 토큰 강제 생략 (기존 스타일 컨벤션은 따름) |
| 3 | `designs/design-constitution.md` | `/al design_source` 실행 시 토큰 검증·자동 교정 기준 | design_source의 교정 단계 생략 |
| 4 | `prd/*.md`, `prd/refs/*`, `designs/*.pen`, `designs/stitch/` | 자동 감지해 컨텍스트로 사용 | 생략 |
| 5 | `~/.altool/lesson.md` (글로벌 단일) | **plan·run·analyze 시작 시 자동 회고** — 관련 교훈만 `📚 회고: L-NNN(태그)` 1줄 출력 후 반영. analyze에서는 검증 렌즈(예방 규칙 위반 = 갭) + 검증 도구 함정 회피로 사용 | 생략 |

자산 유무와 무관하게 **항상 적용**:

6. **문서 한글 작성**: 모든 산출물 내용은 한글. 날짜는 Asia/Seoul 기준 YYYY-MM-DD.
7. **서버 실행 금지**: 개발 서버를 직접 실행하지 않는다. `start.bat`이 있으면 그것을, 없으면 `npm run dev`를 안내하고 대기.
8. **빌드 검증 의무**: run/fix는 프로덕션 빌드 성공까지 확인해야 완료.
9. **오류 교훈 자동 기록**: 어떤 단계든(일상 대화 수정 포함) **시행착오를 해결한 직후** — 오류를 만나 원인을 규명하고 해결했다면 — `steps/lesson.md` 기록 모드로 `~/.altool/lesson.md`에 기록한다. 기준: 원인 규명에 탐색이 필요했거나 재발 가능한 것만 (자명한 오타·단순 실수는 제외). 중복이면 기존 항목 갱신. 기록 후 `🐣 [al:lesson] 기록 — L-NNN` 1줄 보고.

## 문서 상태 동기화 (체크박스·Status 갱신 의무)

각 단계가 완료되면 **상류 문서의 체크박스(`- [ ]` → `- [x]`)와 Status 칼럼을 반드시 갱신**한다. 문서는 진행 상태의 원천이다 (헌법 제9조).

| 완료된 단계 | 갱신할 문서·항목 |
|------------|----------------|
| design | plan §9 다음 단계의 "상세 설계" 체크 |
| run | plan §2.1 In Scope, §3.1 FR Status(`Pending` → `✅ 완료`), design §10.2 구현 순서 |
| analyze | design §5.4 Page UI Checklist(검증 통과 항목만), plan §4 Success Criteria(충족 항목만) |
| fix | analysis 갭 목록의 해소 항목 표기 |
| report | plan §9 잔여 항목, analysis §8, 문서 Status `Draft` → `Finalized` |

- **검증되지 않은 항목은 체크하지 않는다** — 미래 작업은 미체크가 정상. ❌/⚠️ 판정 항목은 그대로 둔다.

## 진행 상황 출력

각 단계 시작/완료 시:

```
🥚 [al:{하위명령}] {기능명} 시작...
🐣 [al:{하위명령}] {기능명} 완료 — 산출물: {파일 경로}
```
