# /al design — Design 단계

**산출물**: `docs/02-design/features/{기능명}.design.md`

---

## 절차

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/design.template.md`를 Read 도구로 읽고 그 절 구조를 아웃라인으로 사용한다. 기억으로 생성 금지.

### 1~2. Plan 문서 확인

- `docs/01-plan/features/{기능명}.plan.md` 존재 확인. **없으면 `/al plan {기능명}` 먼저 실행을 제안**하고 사용자에게 진행 여부 확인.
- 있으면 전체를 읽고 요구사항·범위를 파악한다.
- **Altool 자산 감지**: `constitution.md` + `designs/design.md` + `designs/design-tokens.css`가 있으면 읽고 강제 적용, 없으면 표준 모드 (CLAUDE.md 규칙).

### 3. PRD 컨텍스트 로딩

`docs/00-pm/{기능명}.prd.md` 또는 `prd/*.md`가 있으면 읽고 아키텍처 결정에 시장·사용자 맥락을 반영한다.

### 4. Context Anchor 복사

Plan의 `## Context Anchor` 표를 Design 문서 상단(헤더 메타데이터와 ## 1. Overview 사이)에 복사한다. Plan에 없으면 생략.

### 5~7. 아키텍처 3안 생성 + Checkpoint 3

세 가지 설계안을 생성하고 트레이드오프 비교표(복잡도·유지보수성·공수·리스크)를 제시한다:

- **Option A — 최소 변경**: 기존 코드 최대 재사용. 빠르지만 결합도 위험
- **Option B — Clean Architecture**: 최고의 관심사 분리. 파일·리팩토링 많음
- **Option C — 실용 균형**: 과잉 설계 없는 적절한 경계. **권장 기본값**

AskUserQuestion: **"3가지 설계안 중 어떤 걸 선택하시겠습니까?"** (권장안 포함)
(자동 파이프라인 호출 시 Option C로 자동 진행)

### 8~9. Design 문서 작성

선택된 아키텍처로 템플릿 전체 절을 채워 작성한다. 핵심:
- **§2.1 아키텍처 3안 비교**: 비교표 + 선택 결과·근거 기록
- **§3 데이터 모델**: TypeScript 인터페이스 (Strict Mode, `any` 금지 — 헌법 제6조)
- **§4 API 명세**: 엔드포인트 목록 + 상세 스키마 + 에러 응답 (**analyze의 Contract 검증 기준**)
- **§5.4 Page UI Checklist (CRITICAL)**: 페이지별 필수 UI 요소를 빠짐없이 항목화 — 폼 필드·버튼·필터·배지·데이터 표시 요소를 구체적 옵션 값까지. **이 체크리스트가 없으면 analyze가 파일 존재만 검사하게 됨 (Functional 검증의 분모)**
- **§8 테스트 플랜**: L1(API)/L2(UI 액션)/L3(E2E) 테스트 시나리오 정의 — run에서 코드 작성, analyze에서 실행
- **Altool 자산 감지** (design-tokens.css 있을 때): 모든 UI 컴포넌트의 시각적 수치(높이·색상·폰트·간격·그림자·둥글기)를 `var(--토큰명)`으로 명시. 없는 토큰은 design-tokens.css에 추가 후 사용

### 10. Session Guide 생성

§10 구현 가이드 구조를 분석해 Module Map과 권장 세션 계획을 `§10.3 세션 가이드`로 작성한다. (`/al run {기능명} --scope module-N` 분할 구현용)

### 11. Design Anchor (Pencil MCP 사용 시)

UI 기능이고 `designs/*.pen`이 있으면 → 디자인 토큰을 `## Design Anchor` 절에 잠근다. **Altool에서는 `designs/design-tokens.css`가 이미 Design Anchor 역할**을 하므로 그 토큰 값으로 채운다.

### 12~13. 상태 갱신 + 보고

`.altool/state/status.json`: `phase: "design"`.
**문서 동기화**: plan §9 다음 단계의 "설계 문서 작성" 항목을 `- [x]`로 갱신 (CLAUDE.md 문서 상태 동기화 규칙).

```
🐣 [al:design] {기능명} 완료 — 산출물: docs/02-design/features/{기능명}.design.md
   선택 아키텍처: Option {A/B/C}
   Page UI Checklist: {N}개 항목 (analyze의 Functional 검증 분모)
   다음 단계: /al run {기능명}
```
