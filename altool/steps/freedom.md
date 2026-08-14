# $altool freedom - 프롬프트로부터의 해방 모드

**사용법**

```text
$altool freedom {목표} --loops {횟수}
$altool freedom {목표} {횟수}회
$altool freedom
```

**목적**: 사용자가 매 단계 프롬프트로 운전하지 않아도, AI가 사용자가 지정한 루프 횟수만큼 웹 조사 -> 계획 -> 명세 -> 구현 -> 검증 -> 개선 -> 보고 흐름으로 이루어진 자율 개발 사이클을 수행한다.

Freedom은 `oneshot`의 대체가 아니라 상위 자율주행 모드다. `oneshot`은 한 번의 정해진 파이프라인이고, Freedom은 상태를 보고 다음 action을 고른다. 다만 채팅을 영구 점유하지 않도록 **반드시 루프 횟수 한도**를 가진다.

여기서 **각 루프는 action 하나가 아니라 자율 개발 사이클**이다. `loopBudget`은 같은 제품을 조사·구현·검증·재조사로 성숙시키는 반복 횟수다. 각 루프는 필요한 경우 `design_source` preflight를 자동 수행한 뒤 반드시 research로 시작하고, 그 조사 결과와 현재 상태를 바탕으로 전체 제품의 완성형 목표를 정한다. 한 루프 안에서 여러 action(`plan`, `spec`, `run`, `analyze`, 필요한 `fix`, `browser`, `report`)을 수행할 수 있다. `currentAction`은 루프 내부에서 지금 수행 중인 세부 action일 뿐이며, `loopsCompleted`는 action 완료 때가 아니라 사이클 종료 때만 증가한다.

## 0. 시작 출력

```text
🥚 [al:freedom] {목표 또는 기존 목표} 시작... (loops: {N})
```

## 1. 무전기 초기화

`python3 altool/scripts/radio.py init "{목표}" --loops {N}`를 실행해 아래 파일을 보장한다.

```text
.altool/freedom/inbox.jsonl
.altool/freedom/outbox.jsonl
.altool/freedom/state.json
.altool/freedom/journal.md
```

목표가 비어 있으면 기존 `.altool/freedom/state.json`의 `goal`을 사용한다. 기존 목표도 없으면 사용법을 안내하고 중단한다.

루프 횟수 규칙:

- 사용자가 `--loops N`, `N회`, `N번`을 말하면 그 값을 사용한다.
- 루프 횟수가 없으면 기본값은 1회다.
- 루프 횟수는 1 이상이어야 한다.
- 각 루프는 하나의 의미 있는 개발 사이클이다. `designs/claude-design/*.html`, `.pen`, Stitch가 있고 `designs/design.md`가 없거나 오래됐거나 `TBD`이면 `design_source`를 자동 수행한 뒤, 반드시 `research`를 수행한다. 이후 조사 결과와 현재 상태에 따라 `plan -> spec -> run -> analyze -> fix -> browser -> report` 중 필요한 흐름으로 사용자가 맡긴 전체 제품의 완성형을 구현·검증한다.
- 루프 수는 같은 제품의 완성도를 반복적으로 끌어올리는 기준이다. 모든 루프는 동일한 제품 목표를 대상으로 한다.
- action 하나만 끝났다고 `loopsCompleted`를 올리지 않는다. `currentAction`만 갱신하고 outbox/journal에 진행 상황을 남긴다.
- `loopsCompleted`는 현재 사이클의 목표 산출물과 검증이 끝났을 때만 1 증가시킨다.
- `loopsCompleted >= loopBudget`이면 다음 루프를 시작하지 않고 완료 보고 후 채팅 제어권을 반환한다.
- 사용자가 큰 숫자를 주면 그대로 수행하되, 안전 경계·반복 실패·pause/stop은 루프 예산보다 우선한다.

로컬 루프 러너로 control-plane을 검증하거나 제한된 자동 루프를 실행할 때는 아래 명령을 사용한다.

```text
python3 altool/scripts/freedom_loop.py "{목표}" --loops {N} --interval 1
```

이 러너는 control-plane tick마다 radio inbox를 확인하고, state/outbox/journal/check 갱신 흐름만 검증한다. **주의: `$altool freedom`의 실제 실행은 이 러너만 돌리는 것이 아니다.** Codex는 아래 "Freedom 실제 루프 실행 규칙"에 따라 각 사이클 안에서 필요한 실제 Altool step들을 수행해야 한다. `freedom_loop.py`는 control-plane 테스트/디버그용이다.

## 1.5 Freedom 실제 루프 실행 규칙

`$altool freedom {목표} --loops N`을 받으면 Codex는 아래 루프를 직접 수행한다. 아래의 `cycle`이 사용자가 지정한 각 자율 개발 사이클이다.

```text
for cycle in 1..N:
  1. radio pending 확인 및 처리
     - `python3 altool/scripts/radio.py cycle start --loop {cycle}` 실행
  2. Observe
  3. 디자인 소스 preflight
     - `designs/claude-design/*.html`, `designs/stitch/`, `designs/*.pen`을 확인한다
     - Claude 디자인 HTML이 있으면 최우선 디자인 헌법으로 보고, `designs/design.md`가 없거나 비어 있거나 `TBD`이거나 HTML보다 오래됐거나 Reference Source Map에 HTML 경로가 없으면 `altool/steps/design_source.md`를 자동 수행한다
     - 시작 전 `python3 altool/scripts/radio.py action start design_source --loop {cycle}` 실행
     - 완료 후 `python3 altool/scripts/radio.py action done design_source --loop {cycle} --summary "{요약}"` 실행
     - 최신 디자인 시스템이면 `design_source` action은 생략하고 outbox에 `skipped(design system current)`를 남긴다
  4. research 수행
     - 시작 전 `python3 altool/scripts/radio.py action start research --loop {cycle}` 실행
     - `altool/steps/research.md`를 읽고 실제 조사 산출물을 만든다
     - 기존 조사와 중복/새 발견을 분리한다
     - 다음 루프 후보는 확정 계획이 아니라 nextResearchQuestions로 남긴다
     - 완료 후 `python3 altool/scripts/radio.py action done research --loop {cycle} --summary "{요약}"` 실행
  5. 이번 사이클의 완성형 목표와 완료 기준 결정
     - 이번 research에서 확인한 유사 서비스·사용자 기대·페이지·기능·디자인 시스템 근거를 기준으로 전체 제품의 완성형 목표를 정한다
     - 기능·UX·디자인·품질 기준이 서로 연결된 end-to-end 제품 경험이 되도록 범위를 세운다
     - 후속 루프의 구체 작업은 미리 확정하지 않는다
  6. 필요한 action들을 순서대로 수행
     - 각 action 시작 전 radio pending 확인
     - 각 action 시작 시 `python3 altool/scripts/radio.py action start {action} --loop {cycle}` 실행
     - 선택된 action의 step 문서 읽기
     - 해당 step 실제 수행
     - 해당 step의 Step Check 실행
     - 각 action 완료 시 `python3 altool/scripts/radio.py action done {action} --loop {cycle} --summary "{요약}"` 실행
  7. 구현 사이클은 report 수행
     - browser 통과 후 다음 루프로 넘어가기 전에 반드시 `altool/steps/report.md`를 읽고 report action을 수행한다
     - `docs/04-report/{feature}.report.md`와 `{feature}.report.json` Step Check가 통과해야 한다
  8. 사이클 완료 기준을 만족하면 `python3 altool/scripts/radio.py cycle done --loop {cycle} --summary "{요약}"` 실행해 loopsCompleted를 갱신
  9. 다음 사이클로 넘어가기 전 radio pending 확인
```

추가 완료 규칙:

- 모든 루프는 같은 제품의 end-to-end 핵심 여정을 성숙시킨다. 사용자가 다른 제품이나 독립 기능을 요청할 때만 새 `currentFeature`를 만든다.
- 시간·안전·기술 제약과 후속 후보는 `Out of Scope`, report, `nextResearchQuestions`에 기록한다.
- 구현/UI 사이클은 `browser`와 `report` 산출물·Step Check까지 통과해야 완료다. 브라우저 세부 검증과 서버 정리는 해당 step에 위임한다.
- 사용자가 범위를 제한하면 그 지점에서 outbox에 응답하고 report는 `skipped(user-limited cycle)`로 남긴다. "현재 루프까지만"은 현재 사이클 검증·정리 후 다음 루프에 진입하지 않는다는 뜻이다.

## 2. 모든 action 전 inbox 확인

웹 조사, 문서 작성, 파일 수정, 의존성 설치, 빌드·테스트, 브라우저 검증, 다음 후보 선택 등 모든 의미 있는 action 직전에 `python3 altool/scripts/radio.py pending`을 실행한다.

pending 이벤트 처리:

| inbox type | 처리 |
| --- | --- |
| `stop` | outbox에 `stop` 기록 후 즉시 중단 |
| `pause` | outbox에 `ack` 기록 후 남은 사이클을 보류하고 중단. resume이 들어오면 다음 `$altool freedom`에서 이어간다 |
| `ask` | outbox에 `answer` 기록 후 계속 |
| `say` | 목표/제약/범위에 반영하고 outbox에 `ack` 기록 후 계속. "현재 루프까지만" 같은 지시는 현재 사이클 완료 후 중지 예약으로 해석한다 |
| `resume` | outbox에 `ack` 기록 후 계속 |

AI는 사용자에게 질문하지 않는다. 필요한 확인이 있으면 현재 안전 기준과 완료 기준에 맞는 선택을 하고 outbox에 이유를 남긴다.

## 3. Observe

`AGENTS.md`, Altool skill, 헌법, PRD·디자인 원천, `.altool` 상태·checks, `docs/`, 관련 코드·테스트, git status를 읽고 현재 상태를 판단한다.

## 4. Decide

각 사이클은 먼저 research를 완료한 뒤, 현재 상태와 조사 결과를 보고 후속 action을 하나씩 고른다. action 선택 근거는 `.altool/freedom/journal.md`와 outbox `progress`에 남긴다.

| action | 선택 기준 |
| --- | --- |
| `design_source` | `designs/claude-design/*.html`, `.pen`, Stitch가 있고 `designs/design.md`가 없거나 오래됐거나 `TBD`이거나 원본 경로가 Reference Source Map에 없음. `oneshot`/`freedom`에서는 별도 사용자 명령 없이 자동 수행 |
| `research` | 모든 사이클의 필수 시작 action. 목표와 유사 사례, 기능 후보, UX 패턴, 사용자 기대, 리스크를 조사 |
| `plan` | 이번 research 기준의 완성형 목표가 정해졌고, plan이 없거나 현재 research·사용자 지시·구현 상태와 불일치함 |
| `spec` | plan이 있고, spec이 없거나 현재 plan·research·design.md·구현 상태와 불일치함 |
| `run` | spec이 있고, 구현이 없거나 현재 spec·research·design.md와 구현이 불일치함 |
| `analyze` | 구현 후 갭 검증이 필요함 |
| `fix` | analyze에서 갭이 발견됨 |
| `browser` | UI/런타임/디자인을 실제 브라우저에서 확인해야 함. UI가 있는 구현 사이클은 report 전 필수 |
| `report` | browser 통과 후 구현 사이클을 닫기 위한 필수 완료 보고 |
| `stop` | 안전 경계 또는 반복 실패 한도 도달 |

넓은 목표는 현재 루프의 research 기준으로 하나의 완성형 제품 경험으로 정리한다. 단, 루프별 작업을 시작 시점에 미리 확정하지 않는다. 다음 루프의 실제 목표는 다음 루프 시작 시 다시 inbox 확인, Observe, research를 수행한 뒤 같은 제품 전체를 기준으로 결정한다. 현재 루프 종료 시에는 `nextResearchQuestions`와 전체 제품을 더 완성하기 위한 품질·UX·엣지 케이스·확장 후보만 남긴다.

기존 plan/spec이 있어도 새 research, 사용자 지시, 구현 관찰, browser 결과가 문서와 달라졌으면 새 feature 문서를 만들지 말고 같은 `currentFeature`의 기존 문서를 갱신한다. 갱신 후 해당 owner Step Check를 다시 작성하고 검증한다. 새 `currentFeature`는 사용자가 명시적으로 다른 제품이나 독립 기능을 요청한 경우에만 만든다.

## 5. Act

선택한 action은 기존 step을 재사용한다.

| Freedom action | 사용할 절차 |
| --- | --- |
| `design_source` | `altool/steps/design_source.md` |
| `research` | `altool/steps/research.md` |
| `plan` | `altool/steps/plan.md` |
| `spec` | `altool/steps/spec.md` |
| `run` | `altool/steps/run.md` |
| `analyze` | `altool/steps/analyze.md` |
| `fix` | `altool/steps/fix.md` |
| `browser` | `altool/steps/browser.md` |
| `report` | `altool/steps/report.md` |

Research는 PRD나 사용자 디자인을 덮어쓰지 않는다. 헌법의 디자인 권위를 적용하고, 필요하면 `design_source`로 `designs/design.md`를 먼저 정규화한다. 후속 action은 정규화된 계약을 사용하며 보호된 브랜드 자산이나 근거 없는 generic 스타일을 만들지 않는다.

## 6. Verify

각 하위 action의 Step Check를 실행한다. Freedom 자체도 `.altool/checks/freedom.freedom.json`을 작성하고 검증한다.

필수 check:

| 항목 | 의미 |
| --- | --- |
| `inbox.watch` | action 전 inbox 확인 |
| `design_source.autorun` | Claude 디자인 HTML/.pen/Stitch가 있을 때 design_source 자동 실행 또는 최신 상태 생략 사유 |
| `research.required` | 실제 `$altool freedom` 사이클 시작 시 필요한 design_source preflight 후 research 산출물과 research Step Check를 완료 |
| `cycle.state` | 사이클 시작/완료 시 `loop`, `loopsCompleted`가 실제 진행과 일치 |
| `action.state` | 각 action 시작/완료 시 `currentAction`이 설정되고 완료 후 해제 |
| `report.required` | 구현/UI 사이클은 report 문서와 report Step Check 완료. 사용자 범위 제한 지시가 있으면 `skipped(user-limited cycle)` |
| `outbox.updated` | ack/answer/progress/warning/stop 기록 |
| `action.selected` | 다음 action 선택 근거 |
| `lesson.capture` | 코드 오류/구현 갭 lesson 처리 |
| `loop.progress` | 사이클 진행 로그 |
| `visual.reference_comparison` | browser action의 참조 캡처와 최종 화면 스크린샷 대조 결과 또는 `skipped(no browser action)` |
| `visual.css_custom_properties` | browser action의 CSS custom property 검증 결과 또는 `skipped(no browser action)` / `skipped(no css files)` 중 하나 |
| `visual.contrast` | browser action의 `check.py contrast` 결과와 `ambiguousRules` 실제 화면 대조 증거 또는 `skipped(no browser action)` / `skipped(no css files)` 중 하나 |
| `accessibility.live_region` | browser action의 `check.py a11y-contracts` 결과 또는 `skipped(no browser action)` / `skipped(no live-region contract)` 중 하나 |
| `functional.time_precision` | 시간 기반 UI의 반복 pause/resume clock 결과 또는 `skipped(no browser action)` / `skipped(not time-based UI)` 중 하나 |
| `analysis.semantic_consistency` | analyze action이 있으면 `check.py analyze-sync` 결과, 없으면 `skipped(no analyze action)` |
| `server.cleanup` | browser action이 시작한 서버 종료 증거 또는 `skipped(no browser action)` / `skipped(existing server)` 중 하나 |

공통 키는 `_common.md`를 적용하되, 전체 정책·상태·git 입력, 하위 action의 lesson/event/check, freedom·feature 상태, 관련 문서·소유 check·Status, 생성한 freedom/docs/check 산출물을 요약한다. 비적용 사유는 `skipped(no implementation action/no code event/no feature docs/no document status)` 중 해당 값을 쓴다.

Freedom 추가 검증은 아래처럼 실행한다.

```text
[al:check] freedom.freedom 검증 중... (attempt {N}/5)
python3 altool/scripts/check.py validate --json .altool/checks/freedom.freedom.json
python3 altool/scripts/check.py audit-docs --root .
```

`audit-docs`가 실패하면 stale로 보고된 문서의 소유 Step Check를 갱신·검증한 뒤 Freedom check와 `audit-docs`를 다시 실행한다.

## 7. Learn

run/analyze/fix/browser 또는 자연어 코드 수정 중 코드 오류, 빌드 실패, 테스트 실패, 런타임 오류, 브라우저 오류, 구현 갭이 있으면 `lesson.py append`로 기록한다.

research/plan/spec/report 문서 작성 판단은 lesson에 기록하지 않는다.

## 8. Record

각 사이클과 주요 action마다 `.altool/freedom/state.json`에 상태, `journal.md`에 진행 로그, `outbox.jsonl`에 사용자 메시지, `.altool/checks/freedom.freedom.json`에 상위 검증을 남긴다.

완료 출력:

```text
🐣 [al:freedom] 루프 {N} 완료 - 다음 사이클: {continue 또는 stop}
```

루프 예산을 모두 사용한 경우:

```text
🐣 [al:freedom] {loopsCompleted}/{loopBudget} 루프 완료 - 지정된 루프 횟수에 도달했습니다.
```

## 9. 안전 경계

Freedom은 실제 결제·송금·구매, 외부 배포, 계정 생성, 권한 변경, 데이터 삭제, 비밀키 취급, 유료 API 사용을 수행하지 않는다. 필요하면 outbox에 `warning`을 남긴다.
