# $altool run — Run 단계 (구현)

**산출물**: 소스 코드 (구현 가이드는 `altool/templates/run.template.md` 구조로 대화에 출력)

---

## 절차

`$altool run` 뒤 입력은 현재 feature 구현을 위한 추가 지시나 옵션이다. 기능명으로 해석하거나 `currentFeature`를 전환하지 않는다.

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/run.template.md`를 파일 읽기 도구로 읽고 구현 가이드와 구현 규칙의 기준으로 사용한다. 자동 파이프라인 모드에서는 출력만 축약하며 템플릿 로딩은 생략하지 않는다.

### 1~3. 상류 문서 전체 로딩 (Full Upstream Context Loading)

- 기능명은 `.altool/state/status.json`의 `currentFeature`에서 읽는다. `currentFeature`가 없으면 `$altool plan {기능 설명}` 먼저 실행을 안내하고 중단한다.
- `docs/02-spec/features/{기능명}.spec.md` 존재 확인 (필수). 없으면 spec 먼저 실행 제안.
- **Spec 문서를 요약이 아니라 전체를 읽는다** — 세션마다 완전한 아키텍처 컨텍스트로 시작해야 함.
- PRD(`docs/00-pm/` 또는 `prd/`) → WHY 추출, Plan → Context Anchor·Success Criteria·Requirements 추출.
- **코드 오류 검색**: `lesson.md` 전체를 읽지 않는다. 기능명·수정 예정 파일·프레임워크·패키지·오류코드로 `python3 altool/scripts/lesson.py search --query "{키워드}" --limit 5`를 실행하고, 관련 코드 오류 이벤트의 `preventionRule`만 `lesson: E-00000(...)` 1줄로 출력 후 구현에 반영한다.
- **React/Next.js 보조 스킬**: 현재 프로젝트가 React 또는 Next.js를 사용하고 `.agents/skills/vercel-react-best-practices/SKILL.md`가 있으면 구현 규칙으로 적용한다. 다른 스택이면 `skipped(not React/Next.js)`, 파일이 없으면 `skipped(skill unavailable)`로 보고하고 계속한다.
- **UI 계약 로딩**: 헌법, 직접 디자인 입력, Spec의 Design System Anchor, `standards/design.md`를 읽는다. `design.md`가 없거나 비어 있거나 첫 non-empty line에 `TBD`가 있으면 research 또는 `design_source`로 돌아간다.
- 헌법의 디자인 권위에 따라 Anchor와 recipe/capture map을 구현한다. 각 map 행을 section/component에 연결하고, 제외한 행은 범위 밖 사유를 run check에 남긴다.

### 4~5. Decision Record Chain + Success Criteria 표시

> **자동 파이프라인 모드에서는 아래 표 출력을 생략**하고 `📋 결정: {핵심 1줄} | 🎯 SC {N}개 추적` 한 줄 요약만 출력한다 (장황 방지). 표 전체 출력은 수동 실행 시에만.

구현 시작 전 대화에 출력:

```
📋 Decision Record Chain
[PRD] 타겟: {시장/사용자} — {근거}
[Plan] 아키텍처: {선택안} — {근거}
[Spec] 상태 관리: {선택 방식} — {근거}

📌 Context Anchor
WHY / WHO / RISK / SUCCESS / SCOPE 표 (Spec 문서에서)
```

Plan의 Success Criteria를 구현 체크리스트로 표시 — 각 기준이 구현 중 반드시 다뤄져야 한다.

### 6~8. --scope 파라미터 + Session Guide

- 추가 지시에 `--scope module-N`이 있으면 Spec §10.3 세션 가이드의 Module Map과 대조해 해당 모듈만 구현 범위로 필터.
- 그 밖의 추가 지시는 구현 방식 제약으로 반영하되, feature 선택자로 사용하지 않는다.
- `--scope`가 없으면 전체 Module Map 표시 + 세션 분할 권장 + 전체 구현 진행.

### 9~10. 범위 요약 + Checkpoint 4 — 구현 승인

```
생성 파일: N개 / 수정 파일: M개 / 예상 변경: ~X줄
```

Codex 대화 확인: **"이 범위로 구현을 시작해도 되겠습니까?"** — **승인 없이 구현 시작 금지.**
(자동 파이프라인 호출 시 승인 생략하고 진행)

### 11~13. 구현 — Depth-First 전략 (CRITICAL RULE)

> **깊게 구현하라, 넓게 펼치지 마라.**
> 안티패턴: 20개 파일 스켈레톤 → 각 30% 완성 (구조 매치 90%인데 기능적으로 빈껍데기)
> 올바른 패턴: **배치당 3~5개 파일을 완전히 구현** → Page UI Checklist 대조 검증 → 다음 배치

배치별 구현 사이클 (bottom-up):
```
① API route 구현 → ② L1 테스트(curl) → ③ Hook + Component 구현
→ ④ L2 테스트(Playwright) → ⑤ Page 통합 → ⑥ 전부 green이면 다음 배치
테스트 파일: tests/e2e/{기능명}.spec.ts (시나리오는 Spec §8 테스트 플랜)
```

파일별 완성 기준 (다음 파일 생성 전 확인):
- `// TODO`·플레이스홀더 주석 없음, `console.log` 스텁 핸들러 없음
- `[1,2,3].map` 하드코딩 목 배열 없음 (실데이터 또는 empty state)
- Page UI Checklist의 폼 필드·인터랙티브 요소 전부 존재 + 실제 핸들러
- 로딩 상태·에러 상태 구현, 데이터 페칭 연결

**코드 주석 규약** (명세 추적성): 파일 상단 `// Spec Ref: §{절} — {결정 근거}`, 핵심 로직 앞 `// Plan SC: {대응하는 성공 기준}`

**Altool 확장 준수 사항**:
| 항목 | 규칙 |
|------|------|
| 디자인 입력/디자인 시스템 | 헌법의 디자인 권위와 Spec Anchor를 적용하고 모든 값의 근거를 추적한다. 보호된 브랜드 자산은 복제하지 않는다. |
| 보안 | API 키 하드코딩 금지, `.env` 격리, 보호가 필요한 서버 작업의 인증·권한 검증 (헌법의 보안 품질 게이트) |
| 핵심 진입 경험 | 공개 사용자용 웹서비스이고 PRD가 다른 흐름을 요구하지 않을 때만 홈 또는 핵심 진입 경험 우선 (헌법의 조건부 제품 기본정책) |
| 반응형 | UI가 있으면 모바일 375px 이상과 데스크톱에서 정상 표시 (헌법의 범용 UI 품질) |
| 로컬 DB | 영속 데이터가 필요하고 다른 근거가 없을 때만 SQLite를 기본 후보로 사용 (헌법의 기술 스택 기본값) |

### 빌드 검증 (Altool 확장 — 완료 보고 전 필수)

프로젝트에 정의된 프로덕션 build 명령을 실행해 성공까지 확인한다. `package.json`에 `build` script가 있으면 `npm run build`를 사용하고, 다른 생태계면 해당 프로젝트의 build 명령을 사용한다. 빌드 단계가 없는 정적 결과물은 적용 가능한 구문·정적 검사를 실행하고 `skipped(no build step)` 근거를 남긴다. 실패 시 수정 후 재검증한다. 서버는 직접 실행하지 않고 프로젝트의 실행 방법을 안내한다.

코드·타입·빌드·테스트·런타임·브라우저 검증에서 코드 오류가 발생하면 `lesson.py append`로 이벤트를 남기고 재발 가능성을 평가한다:
- 코드 오류가 발생하면 `code_error`
- 실제 코드 수정으로 해결했으면 `fix`
- 수정 후 검증 결과는 `verification`

이벤트에는 `recurrenceRisk`, `recurrenceScope`, `recurrenceReason`을 포함한다. 외부 도구/환경 문제, 명령 사용법 문제, 단순 오타·실행 전에 바로 고친 import 누락은 기록하지 않는다.

### 14~15. 상태 갱신 + 보고

`.altool/state/status.json`: `features.{currentFeature}`에 `phase: "run"`, **`buildVerified: true`** (빌드 성공 확인 후에만).
**문서 동기화** (Altool 공통 규칙): plan §2.1 포함(In Scope)의 구현된 항목 체크, plan §3.1 FR Status를 `Pending` → `✅ 완료`로, spec §11.2 Implementation Order의 완료 항목 체크. 빌드까지 통과한 구현이면 plan/spec 문서 상단 `상태`/`Status`를 `Implemented`로 갱신한다.
plan/spec 문서를 수정했으면 run Step Check만으로 끝내지 않는다. `.altool/checks/{기능명}.plan.json`과 `.altool/checks/{기능명}.spec.json`도 최신 내용으로 갱신하고 각각 `check.py validate`를 통과시킨 뒤, run check의 `docs.synced` 증거에 갱신한 check 경로를 남긴다.

`_common.md`의 Step Check 계약을 적용한다. 경로는 `.altool/checks/{기능명}.run.json`이다. 전용 증거는 spec/plan/PRD/자산/React 보조 스킬 입력, lesson query와 결과, `code_error`/`fix`/`verification` ID 또는 `skipped(no code error)`, 빌드·테스트 결과, status의 `phase=run`·`buildVerified`, plan/spec 체크박스·`Status=Implemented`와 소유 check 재검증, 구현 파일 목록이다.

```
🐣 [al:run] {기능명} 완료
   구현 파일: {목록} | 빌드/정적 검사: {명령과 결과}
   브라우저 확인: {프로젝트 실행 명령과 URL}
   다음 단계: $altool analyze
```
