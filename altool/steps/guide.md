# $altool guide — 현재 단계 감지 + 다음 명령 안내

처음 사용자도 이 명령 하나로 어디서부터 시작해야 할지 알 수 있습니다.

---

## Step 1: 상태 수집

1. `.altool/state/status.json`이 있으면 **그것을 우선 사용** (`features.{currentFeature}`의 phase·matchRate와 최근 이력).
2. 없으면 파일 존재로 역산:

```
[ ] constitution.md / standards/design.md — Altool 자산
[ ] prd/ (내용 있음)                — PRD
[ ] designs/claude-design/**/*.html    — 최우선 Claude 디자인 헌법
[ ] designs/**/*.pen, designs/stitch/  — 디자인 시스템 생성용 소스
[ ] designs/*.{png,jpg,jpeg,webp,md,pdf} — 사용자 디자인 입력
[ ] docs/00-research/               — 웹 조사
[ ] docs/01-plan/  docs/02-spec/  — 계획·명세
[ ] src/ 또는 app/                  — 구현
[ ] docs/03-analyze/  docs/04-report/ — 분석·보고서
[ ] .altool/freedom/                — Freedom 무전기/자율 루프
```

## Step 2: 단계 판단 → 다음 명령

> 헌법·디자인 참조는 엔진에 내장되어 있어 **명령어만 입력하면 됩니다** (긴 지시문 복사 불필요).

| 조건 | 현재 상태 | 다음 실행 |
|------|----------|----------|
| `altool/` 없음 | 설치 전 | Windows는 Altool `setup.bat`, macOS는 `setup.command` 실행 안내 |
| 공통 디자인 입력 탐색·갱신 절차에서 design_source 필요 | 디자인 계약 동기화 필요 | `$altool design_source` 또는 `$altool oneshot`/`freedom` 자동 정규화 |
| 스크린샷/디자인 문서 있음 | 사용자 디자인 입력 있음 | `$altool research {조사 주제}` 또는 `$altool plan {기능 설명}` |
| 00-research 없음 + 01-plan 없음 | 조사 필요 | `$altool research {조사 주제}` 또는 자동 진행 `$altool oneshot [기능설명]` |
| 긴 목표를 지정 횟수만큼 맡기고 싶음 | 자율 루프 필요 | `$altool freedom {목표} --loops N` |
| .altool/freedom ✅ | Freedom 진행 중 | `$altool outbox` 또는 `$altool say/ask/pause/resume/stop` |
| 00-research ✅, 01-plan 없음 | 계획 필요 | `$altool plan {기능 설명}` |
| 01-plan ✅, 02-spec 없음 | 계획 완료 | `$altool spec` |
| 02-spec ✅, 소스코드 미완 | 명세 완료 | `$altool run` |
| 소스코드 ✅, analyze 문서 없음 | 구현 완료 | `$altool analyze` |
| analyze ✅, 미해소 갭 존재 | 개선 필요 | `$altool fix` (Match Rate ≥90%여도) |
| analyze ✅, 미해소 갭 0건 + browser 문서 없음 | 정적/런타임 분석 통과 | `$altool browser` |
| browser ✅, 미해소 갭 0건 | 실제 화면 검증 통과 | `/simplify` (코드 정리, 선택) → `$altool report` |
| report ✅ | 🐥 사이클 완료 | 다음 기능 `$altool oneshot …` 또는 배포 가이드 |

## Step 3: 출력 형식

`상태 아이콘`은 `_common.md`의 진행 아이콘 규칙으로 선택한다. 단계 번호와 무관하며, 차단·미완료가 있으면 완료된 산출물이 있어도 ⚠️를 우선한다.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{상태 아이콘} 현재 단계: [N단계. 단계명]   (기능: {기능명})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 완료된 산출물:
  ✅ [파일/단계명]

다음 단계: [설명 1~2줄]

실행 명령어:
┌─────────────────────────────────────
│ $altool {명령}
└─────────────────────────────────────

참고: [주의사항 또는 선택 단계]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 특수 상황

- `constitution.md` 누락·무결성 오류 → 제품 설치기(setup.bat/setup.command)로 복구하도록 안내한다. 가이드는 제공할 수 있지만 작업 완료 게이트를 통과한 것으로 보고하지 않는다.
- 디자인 입력과 갱신 필요 여부는 `altool/standards.md`의 「디자인 입력 탐색·갱신」을 따른다. 동기화가 필요하면 해당 단계 또는 oneshot/freedom 자동 진행을 안내하고, 불필요하면 현재 기능의 다음 단계로 진행한다.
- research는 여러 번 반복할 수 있으며 `currentFeature`를 바꾸지 않는다.
- Freedom은 긴 목표를 사용자가 지정한 루프 횟수만큼 자율 진행하는 모드이며, 사용자는 `$altool say/ask/pause/resume/stop/outbox`로 무전기처럼 개입한다.
- 기능이 여러 개면 → 기능별 표로 정리하고 `currentFeature` 기준으로 안내. 기능 전환은 새 `$altool plan {기능 설명}`으로 시작한다.

## Step Check

`_common.md`의 Step Check 계약을 적용한다. 경로는 `.altool/checks/guide.guide.json`이다. `inputs.loaded`에는 status/docs/assets 탐색을, `state.updated`에는 상태 파일 생성·수정 여부를 기록한다. `lesson.search=skipped(not applicable)`, `event.capture=skipped(no code error)`로 두고 나머지 비적용 키는 `skipped(guide only)`로 기록한다.
