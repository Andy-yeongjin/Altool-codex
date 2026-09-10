# $altool plan — Plan 단계

**사용법**: `$altool plan [기능 설명]`

**산출물**: `docs/01-plan/features/{기능명}.plan.md`

---

## 절차

`$altool plan` 뒤 입력은 새 feature 설명이다. 이 명령은 항상 새 개발 사이클을 시작하며 `currentFeature`를 새 feature로 갱신한다. 같은 이름의 산출물이 이미 있으면 기존 문서를 수정하지 말고 파일명과 feature key에 `-2`, `-3` suffix를 붙여 새로 생성한다.

`docs/00-research/*.research.md`가 있으면 선행 조사 입력으로 읽는다. Research는 후보와 근거일 뿐이며, 사용자가 plan에 입력한 기능 설명과 PRD를 최종 범위 결정의 기준으로 삼는다.

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/plan.template.md`를 파일 읽기 도구로 읽고 그 절 구조를 문서 아웃라인으로 사용한다. **기억이나 추측으로 Plan 문서를 생성하는 것은 금지.**

### 1. Research/PRD 자동 참조

- `docs/00-research/*.research.md`가 있으면 최근/관련 조사 문서를 읽고 Plan의 배경·요구사항 후보·리스크에 반영한다. Research의 출처 품질 매트릭스, 근거 매핑, Plan 준비도, 다음 조사 후보도 확인한다.
- `.altool/state/research.json`이 있으면 research ID, 파일 경로, sourceCount를 확인해 관련 조사 목록을 추린다.
- `docs/00-pm/{기능명}.prd.md`가 있으면 읽고 Plan의 컨텍스트로 사용.
- **Altool 자산 감지**: PRD·refs·헌법·직접 디자인 입력·`standards/design.md`를 읽고 헌법의 권위 순서를 적용한다. UI 작업에서 디자인 계약이 없거나 유효하지 않으면 research 또는 `design_source`로 되돌린다.
- PRD가 있으면 PRD를 기준 계약으로 삼고, Research는 PRD 구현을 더 잘하기 위한 보강재로만 사용한다. Research가 PRD에 없는 기능을 제안하면 자동으로 In Scope에 넣지 말고 후보/다음 사이클/Out of Scope에 기록한다.
- PRD와 Research가 충돌하면 PRD를 우선한다. 충돌 항목, 선택한 기준, 제외/보류 사유를 Plan §1.6 또는 §2.2에 기록한다.
- Plan은 문서 작성 단계이므로 `lesson.py search`와 `lesson.py append`를 실행하지 않는다.
- 직접 디자인 입력의 경로와 적용 범위를 성공 기준에 연결한다. 도구가 필요한 형식은 사용 가능한 전용 도구로 읽고 원천을 변경하지 않는다.
- `standards/design.md`는 정규화된 계약이다. 없거나 비어 있거나 첫 non-empty line이 `TBD`이면 생성 단계와 근거를 Plan에 기록한다.

### 2~4. 산출물 경로 확정

- `docs/01-plan/features/{기능명}.plan.md`가 없으면 → 해당 경로에 새로 작성한다.
- 이미 있으면 → `{기능명}-2.plan.md`, `{기능명}-3.plan.md`처럼 사용 가능한 다음 suffix를 골라 새 feature로 작성한다.
- suffix가 붙은 경우 `.altool/state/status.json`의 `currentFeature`와 check JSON의 `feature`도 같은 최종 feature key를 사용한다.

### 5. Checkpoint 1 — 요구사항 확인

기능에 대한 이해(문제·범위·제약)를 정리해 제시하고 Codex 대화 확인으로 확인: **"요구사항 이해가 맞나요? 빠진 건 없나요?"** 확인 후 진행.
(자동 파이프라인 호출 시 생략하고 진행 — 자동 파이프라인 Checkpoint 규칙)

### 6. Checkpoint 2 — 명확화 질문

미확정 요소(엣지 케이스, 에러 처리, 연동 지점, 호환성)를 정리해 질문 목록으로 제시하고 답변을 받은 후 문서를 생성한다.
(자동 파이프라인 호출 시 합리적 기본값으로 진행)

### 7. Plan 문서 생성

확정된 요구사항으로 템플릿 전체 절을 채워 작성한다. 핵심:
- **Research 반영**: 관련 research 문서의 출처 품질, 근거 매핑, 페이지/기능 인벤토리, 공통 패턴, 리스크, Plan 입력 후보를 선별해 §1.3 관련 문서와 §3 요구사항에 연결한다. 조사 결과와 다른 결정을 하면 사유를 남긴다.
- **디자인 입력 반영**: §1.3과 §4에 적용 원천·범위, `standards/design.md`, 생성 근거가 된 research ID를 연결한다.
- **PRD 우선**: PRD가 있으면 §2 In Scope와 §3 FR은 PRD 요구사항을 빠짐없이 반영한다. Research는 요구사항의 구현 세부, UX 보강, 리스크, 성공 기준을 강화하는 데 사용한다.
- **충돌 기록**: Research 제안이 PRD 범위를 넘거나 PRD와 충돌하면 §1.6 PRD/Research 대조 또는 §2.2 Out of Scope에 근거와 사유를 남긴다.
- **§2.1 포함(In Scope)**: 공개 사용자용 웹서비스이고 PRD가 다른 흐름을 요구하지 않을 때만 홈 또는 핵심 진입 경험을 우선한다 (헌법의 조건부 제품 기본정책).
- **§3.1 기능 요구사항**: FR-01부터 ID 부여, 우선순위 명시, Status는 `Pending`으로 시작. PRD가 있으면 모든 요구사항 빠짐없이 반영
- **§4 성공 기준**: analyze가 증거(file:line·테스트·측정값)로 판정 가능한 형태로 작성 (Match Rate 검증의 기준)
- **§6 영향 분석**: 변경 대상 리소스의 기존 사용처 전수 목록화 (신규 프로젝트면 명기 후 종료)
- **§7 아키텍처 방향**: 기존 스택과 사용자·PRD 요구를 우선하고, 근거가 없을 때 헌법의 기술 기본값을 적용한다. 선택과 예외 사유를 기록한다.

### 8~9. 상태 갱신

`.altool/state/status.json`: `currentFeature`를 새 feature로 설정하고 `features.{currentFeature}`에 `phase: "plan"`, `startedAt`을 기록한다. 기존 feature 항목과 `history`는 보존한다. 상태 형식은 `altool/steps/status.md`를 따른다.
Plan 문서 작성과 Step Check가 통과하면 문서 상단 `상태`/`Status`를 `Planned`로 갱신한다. 작성 중 임시값인 `Draft`를 완료 산출물에 남기지 않는다.

### 10~11. Executive Summary + Context Anchor

- 문서 최상단에 `## Executive Summary` 4관점 표(Problem/Solution/Function·UX Effect/Core Value) 작성, 각 1~2문장
- Executive Summary·Requirements·Risks에서 추출해 `## Context Anchor` 표(WHY/WHO/RISK/SUCCESS/SCOPE)를 Executive Summary와 1장 사이에 작성 — **spec/run 단계로 전파됨**

### 12. 완료 보고 (MANDATORY)

문서 완성 후, 사용자가 파일을 열지 않아도 보도록 **Executive Summary 표를 응답에 직접 출력**한다.

`_common.md`의 Step Check 계약을 적용한다. 경로는 `.altool/checks/{기능명}.plan.json`이다. 이 문서 전용 증거는 PRD/refs/constitution/design 입력, Research·PRD와 범위 대조, status의 `phase=plan`, 생성한 plan과 `Status=Planned` 동기화다. `lesson.search`와 `event.capture`는 `skipped(document-only step)`으로 기록한다.

```
🐣 [al:plan] {기능명} 완료 — 산출물: docs/01-plan/features/{기능명}.plan.md
   다음 단계: $altool spec
```
