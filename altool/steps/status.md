# $altool status — 현황 확인

**산출물**: 없음 (현황 출력만)

---

## 절차

### 1. 상태 수집

- `.altool/state/status.json`을 읽는다.
  - 없으면 → `docs/01-plan/features/`, `docs/02-spec/features/`, `docs/03-analyze/`, `docs/04-report/`를 Glob으로 스캔해 기능별 진행 상태를 역산하고 상태 파일을 새로 생성한다.
  - `.altool/state/research.json`과 `docs/00-research/*.research.md`도 함께 읽어 최근 조사 수와 마지막 research ID를 출력한다.
  - 둘 다 비어있고 research도 없으면 → `아직 시작된 기능이 없습니다. $altool research {조사 주제} 또는 $altool plan {기능 설명}으로 시작하세요.` 출력 후 종료.

`status.json`의 정식 형식은 feature별 상태를 `features` 객체에 기록한다:

```json
{
  "currentFeature": "기능명",
  "features": {
    "기능명": {
      "phase": "check",
      "matchRate": 95,
      "iterationCount": 1,
      "buildVerified": true
    }
  },
  "history": []
}
```

- `phase`, `matchRate`, `iterationCount`, `buildVerified`는 `features.{currentFeature}` 아래에서 읽고 쓴다.
- 이전 설치의 최상위 상태 필드는 읽기 호환용이며 해당 feature의 중첩 값이 없을 때만 사용한다.
- 기능별 상태 항목과 append-only `history`를 보존한다.

### 2. 현황 출력 

```
🪺 Altool Status
─────────────────────────────
Feature: {currentFeature}
Phase: {phase 한글 설명 — 예: Check (갭 분석)}
Research: {researchCount}건 / Last {R-0001 또는 —}
Match Rate: {N}%
Iteration: {iterationCount}/5
─────────────────────────────
[Plan] ✅ → [Spec] ✅ → [Run] ✅ → [Check] 🔄 → [Fix] ⏳ → [Browser] ⏳ → [Report] ⏳
```

기능이 여러 개면 기능별 표로 출력:

| 기능 | Phase | Match Rate | Iteration | 마지막 작업 |
|------|-------|-----------|-----------|------------|

이어서 `history` 배열의 **최근 5건**을 출력한다 (전체 출력 금지 — 길어짐):

```
🕐 최근 이력
2026-06-10 14:45 할일-목록 check completed (독립 에이전트 4축 100%)
2026-06-10 14:46 할일-목록 fix skipped (갭 0건)
...
```

### 3. 다음 단계 추천 

| 현재 phase | 다음 | 추천 명령 |
|-----------|------|----------|
| (없음, research 없음) | research | `$altool research {조사 주제}` |
| (없음, research 있음) | plan | `$altool plan {기능 설명}` |
| plan | spec | `$altool spec` |
| spec | run | `$altool run` |
| run | check | `$altool analyze` |
| check (갭 존재) | fix | `$altool fix` |
| check (갭 0건) | browser | `$altool browser` |
| fix (갭 0건) | browser | `$altool browser` |
| browser | report | `$altool report` |
| fix (갭 잔존, 5회 도달) | — | 남은 갭 직접 확인 또는 제한 범위로 `$altool browser` |
| completed | — | 새 조사 `$altool research {조사 주제}`, 새 기능 `$altool plan {기능 설명}` 또는 배포 가이드 |

### 4. Step Check

`_common.md`의 Step Check 계약을 적용한다. 경로는 `.altool/checks/status.status.json`이다. `inputs.loaded`에는 status.json 또는 docs 역산을, `state.updated`·`artifacts.created`에는 status.json 생성·갱신 여부를 기록한다. `lesson.search=skipped(not applicable)`, `event.capture=skipped(status step)`로 두고 나머지 비적용 키는 `skipped(status only)`로 기록한다.
