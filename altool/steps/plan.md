# /al plan — Plan 단계

**산출물**: `docs/01-plan/features/{기능명}.plan.md`

---

## 절차

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/plan.template.md`를 Read 도구로 읽고 그 절 구조를 문서 아웃라인으로 사용한다. **기억이나 추측으로 Plan 문서를 생성하는 것은 금지.**

### 1. PRD 자동 참조

- `docs/00-pm/{기능명}.prd.md`가 있으면 읽고 Plan의 컨텍스트로 사용.
- **Altool 자산 감지** (CLAUDE.md 자산 감지형 규칙): `prd/*.md`·`prd/refs/*`가 있으면 PRD·보조 컨텍스트로 읽는다 (충돌 시 PRD 우선). `constitution.md`·`designs/design.md`·`designs/design-tokens.css`가 있으면 읽고 강제 적용, 없으면 세션당 1회 경고 후 표준 모드로 진행.
- **교훈 회고**: `~/.altool/lesson.md`가 있으면 읽고, 이번 작업 관련 교훈만 `📚 회고: L-NNN(태그)` 1줄로 출력 후 반영 (steps/lesson.md 연동 규칙).
- `designs/*.pen`이 있으면 Pencil MCP(batch_get)로 화면 구성을 읽고 UI 흐름에 반영 (레이아웃·배치만 따르고 시각적 수치는 design.md 토큰으로 교정).

### 2~4. 기존 문서 확인

- `docs/01-plan/features/{기능명}.plan.md`가 이미 있으면 → 내용을 보여주고 수정안을 제안한다.
- 없으면 → 템플릿 기반으로 새로 작성한다.

### 5. Checkpoint 1 — 요구사항 확인

기능에 대한 이해(문제·범위·제약)를 정리해 제시하고 AskUserQuestion으로 확인: **"요구사항 이해가 맞나요? 빠진 건 없나요?"** 확인 후 진행.
(자동 파이프라인 호출 시 생략하고 진행 — CLAUDE.md Checkpoint 규칙)

### 6. Checkpoint 2 — 명확화 질문

미확정 요소(엣지 케이스, 에러 처리, 연동 지점, 호환성)를 정리해 질문 목록으로 제시하고 답변을 받은 후 문서를 생성한다.
(자동 파이프라인 호출 시 합리적 기본값으로 진행)

### 7. Plan 문서 생성

확정된 요구사항으로 템플릿 전체 절을 채워 작성한다. 핵심:
- **§2.1 포함(In Scope)**: 메인 화면 관련 항목을 최우선으로 (헌법 제15조)
- **§3.1 기능 요구사항**: FR-01부터 ID 부여, 우선순위 명시, Status는 `Pending`으로 시작. PRD가 있으면 모든 요구사항 빠짐없이 반영
- **§4 성공 기준**: analyze가 증거(file:line·테스트·측정값)로 판정 가능한 형태로 작성 (Match Rate 검증의 기준)
- **§6 영향 분석**: 변경 대상 리소스의 기존 사용처 전수 목록화 (신규 프로젝트면 명기 후 종료)
- **§7 아키텍처 방향**: 프로젝트 레벨 선택. 기본 스택 = Next.js(App Router) + TypeScript Strict + SQLite(로컬, 헌법 제18조)

### 8~9. 상태 갱신

`.altool/state/status.json`: `phase: "plan"`, `startedAt` 기록.

### 10~11. Executive Summary + Context Anchor

- 문서 최상단에 `## Executive Summary` 4관점 표(Problem/Solution/Function·UX Effect/Core Value) 작성, 각 1~2문장
- Executive Summary·Requirements·Risks에서 추출해 `## Context Anchor` 표(WHY/WHO/RISK/SUCCESS/SCOPE)를 Executive Summary와 1장 사이에 작성 — **design/run 단계로 전파됨**

### 12. 완료 보고 (MANDATORY)

문서 완성 후, 사용자가 파일을 열지 않아도 보도록 **Executive Summary 표를 응답에 직접 출력**한다.

```
🐣 [al:plan] {기능명} 완료 — 산출물: docs/01-plan/features/{기능명}.plan.md
   다음 단계: /al design {기능명}
```
