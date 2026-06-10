# /al run — Run 단계 (구현)

**산출물**: 소스 코드 (구현 가이드는 `altool/templates/run.template.md` 구조로 대화에 출력)

---

## 절차

### 1~3. 상류 문서 전체 로딩 (Full Upstream Context Loading)

- `docs/02-design/features/{기능명}.design.md` 존재 확인 (필수). 없으면 design 먼저 실행 제안.
- **Design 문서를 요약이 아니라 전체를 읽는다** — 세션마다 완전한 아키텍처 컨텍스트로 시작해야 함.
- PRD(`docs/00-pm/` 또는 `prd/`) → WHY 추출, Plan → Context Anchor·Success Criteria·Requirements 추출.
- **교훈 회고**: `~/.altool/lesson.md`가 있으면 읽고 관련 교훈을 `📚 회고:` 1줄로 출력 후 구현에 반영.
- **Altool 자산 감지**: `constitution.md` + `designs/design.md` + `designs/design-tokens.css`가 있으면 읽고 강제 적용, 없으면 표준 모드 (CLAUDE.md 규칙).

### 4~5. Decision Record Chain + Success Criteria 표시

> **자동 파이프라인 모드에서는 아래 표 출력을 생략**하고 `📋 결정: {핵심 1줄} | 🎯 SC {N}개 추적` 한 줄 요약만 출력한다 (장황 방지). 표 전체 출력은 수동 실행 시에만.

구현 시작 전 대화에 출력:

```
📋 Decision Record Chain
[PRD] 타겟: {시장/사용자} — {근거}
[Plan] 아키텍처: {선택안} — {근거}
[Design] 상태 관리: {선택 방식} — {근거}

📌 Context Anchor
WHY / WHO / RISK / SUCCESS / SCOPE 표 (Design 문서에서)
```

Plan의 Success Criteria를 구현 체크리스트로 표시 — 각 기준이 구현 중 반드시 다뤄져야 한다.

### 6~8. --scope 파라미터 + Session Guide

- 인자에 `--scope module-N`이 있으면 Design §10.3 세션 가이드의 Module Map과 대조해 해당 모듈만 구현 범위로 필터.
- 없으면 전체 Module Map 표시 + 세션 분할 권장 + 전체 구현 진행.

### 9~10. 범위 요약 + Checkpoint 4 — 구현 승인

```
생성 파일: N개 / 수정 파일: M개 / 예상 변경: ~X줄
```

AskUserQuestion: **"이 범위로 구현을 시작해도 되겠습니까?"** — **승인 없이 구현 시작 금지.**
(자동 파이프라인 호출 시 승인 생략하고 진행)

### 11~13. 구현 — Depth-First 전략 (CRITICAL RULE)

> **깊게 구현하라, 넓게 펼치지 마라.**
> 안티패턴: 20개 파일 스켈레톤 → 각 30% 완성 (구조 매치 90%인데 기능적으로 빈껍데기)
> 올바른 패턴: **배치당 3~5개 파일을 완전히 구현** → Page UI Checklist 대조 검증 → 다음 배치

배치별 구현 사이클 (bottom-up):
```
① API route 구현 → ② L1 테스트(curl) → ③ Hook + Component 구현
→ ④ L2 테스트(Playwright) → ⑤ Page 통합 → ⑥ 전부 green이면 다음 배치
테스트 파일: tests/e2e/{기능명}.spec.ts (시나리오는 Design §8 테스트 플랜)
```

파일별 완성 기준 (다음 파일 생성 전 확인):
- `// TODO`·플레이스홀더 주석 없음, `console.log` 스텁 핸들러 없음
- `[1,2,3].map` 하드코딩 목 배열 없음 (실데이터 또는 empty state)
- Page UI Checklist의 폼 필드·인터랙티브 요소 전부 존재 + 실제 핸들러
- 로딩 상태·에러 상태 구현, 데이터 페칭 연결

**코드 주석 규약** (설계 추적성): 파일 상단 `// Design Ref: §{절} — {결정 근거}`, 핵심 로직 앞 `// Plan SC: {대응하는 성공 기준}`

**Altool 확장 준수 사항**:
| 항목 | 규칙 |
|------|------|
| 디자인 토큰 | 모든 CSS 수치 `var(--토큰명)`. `#hex`·고정 px 금지 (헌법 제16조) |
| 보안 | API 키 하드코딩 금지, `.env` 격리, 세션 검증 (제6조·제11조) |
| 메인 화면 | 메인 화면 우선, 비인증 탐색 보장 (제15조) |
| 반응형 | 모바일 375px 이상 정상 표시 (제7조) |
| 로컬 DB | SQLite (제18조) |

### 빌드 검증 (Altool 확장 — 완료 보고 전 필수)

`npm run build` 성공까지 확인. 실패 시 수정 후 재빌드. 서버는 직접 실행하지 않는다 (`start.bat`이 있으면 그것을, 없으면 `npm run dev`를 안내).

### 14~15. 상태 갱신 + 보고

`.altool/state/status.json`: `phase: "run"`, **`buildVerified: true`** (빌드 성공 확인 후에만).
**문서 동기화** (CLAUDE.md 규칙): plan §2.1 포함(In Scope)의 구현된 항목 체크, plan §3.1 FR Status를 `Pending` → `✅ 완료`로, design §11.2 Implementation Order의 완료 항목 체크.

```
🐣 [al:run] {기능명} 완료
   구현 파일: {목록} | 빌드: ✅ npm run build 성공
   브라우저 확인: start.bat(없으면 npm run dev) 실행 후 http://localhost:3000
   다음 단계: /al analyze {기능명}
```
