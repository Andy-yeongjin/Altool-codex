---
description: Altool 통합 개발 시스템 (setup|oneshot|guide|design_source|lesson|plan|design|run|analyze|fix|report|status)
argument-hint: "{하위명령} [기능명 또는 기능 설명]"
---

# /al — Altool 통합 명령어

입력: `$ARGUMENTS`

## 실행 절차

1. `$ARGUMENTS`의 **첫 번째 단어**를 하위명령으로 분리한다.
   - `oneshot`은 나머지 전체가 **기능 설명**이다.
   - `plan`/`design`/`run`/`analyze`/`fix`/`report`는 두 번째 단어가 **기능명**, 그 뒤는 추가 지시다.
   - `setup`/`guide`/`design_source`/`status`는 인자가 없다. `lesson`은 인자가 없으면 조회, 있으면 기록이다.

2. `altool/CLAUDE.md`를 Read 도구로 읽는다 — 공통 규칙(자산 감지, Match Rate, 상태·이력 관리, Checkpoint, 문서 동기화)이 정의되어 있다.

3. 하위명령에 해당하는 step 파일을 Read 도구로 읽고 **그 지침을 그대로 수행**한다:

   | 하위명령 | step 파일 |
   |---------|----------|
   | `setup` | `altool/steps/setup.md` |
   | `oneshot` | `altool/steps/oneshot.md` |
   | `guide` | `altool/steps/guide.md` |
   | `design_source` | `altool/steps/design_source.md` |
   | `lesson` | `altool/steps/lesson.md` |
   | `plan` | `altool/steps/plan.md` |
   | `design` | `altool/steps/design.md` |
   | `run` | `altool/steps/run.md` |
   | `analyze` | `altool/steps/analyze.md` |
   | `fix` | `altool/steps/fix.md` |
   | `report` | `altool/steps/report.md` |
   | `status` | `altool/steps/status.md` |

4. 하위명령이 표에 없거나 비어있으면 → 아래를 출력하고 중단한다:
   ```
   사용법: /al {하위명령} [기능명]

   워크플로우:  setup · oneshot [기능설명] · guide · design_source · lesson
   개발 사이클:  plan · design · run · analyze · fix · report · status  (+기능명)

   예시:  /al oneshot 이메일 로그인 기능
          /al plan 로그인
   ```

> ⚠️ step 파일을 읽지 않고 기억에 의존해 수행하는 것은 금지. 반드시 2~3번을 실행할 것.
