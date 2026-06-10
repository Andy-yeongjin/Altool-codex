# /al status — 현황 확인

**산출물**: 없음 (현황 출력만)

---

## 절차

### 1. 상태 수집

- `.altool/state/status.json`을 읽는다.
  - 없으면 → `docs/01-plan/features/`, `docs/02-design/features/`, `docs/03-analyze/`, `docs/04-report/`를 Glob으로 스캔해 기능별 진행 상태를 역산하고 상태 파일을 새로 생성한다.
  - 둘 다 비어있으면 → `아직 시작된 기능이 없습니다. /al plan {기능명}으로 시작하세요.` 출력 후 종료.

### 2. 현황 출력 

```
🪺 Altool Status
─────────────────────────────
Feature: {currentFeature}
Phase: {phase 한글 설명 — 예: Check (갭 분석)}
Match Rate: {N}%
Iteration: {iterationCount}/5
─────────────────────────────
[Plan] ✅ → [Design] ✅ → [Run] ✅ → [Check] 🔄 → [Fix] ⏳
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
| (없음) | plan | `/al plan {기능명}` |
| plan | design | `/al design {기능명}` |
| design | run | `/al run {기능명}` |
| run | check | `/al analyze {기능명}` |
| check (갭 존재) | fix | `/al fix {기능명}` |
| check (갭 0건) | report | `/al report {기능명}` |
| fix (갭 0건) | report | `/al report {기능명}` |
| fix (갭 잔존, 5회 도달) | — | 남은 갭 직접 확인 또는 `/al report {기능명}` |
| completed | — | 새 기능 `/al plan {새기능명}` 또는 배포 가이드 |
