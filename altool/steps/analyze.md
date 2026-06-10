# /al analyze — Check 단계

**산출물**: `docs/03-analysis/{기능명}.analysis.md`

---

## 절차

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/analysis.template.md`를 Read 도구로 읽고 그 절 구조를 아웃라인으로 사용한다.

### 1~3. 상류 문서 전체 로딩 + Context Anchor 복사

3계층 검증을 위해 전부 읽는다 (단일 문서 비교가 놓치는 갭을 잡기 위함):
- PRD → 전략 정합성 (올바른 문제를 풀었는가?)
- Plan → Requirements 이행 + Success Criteria
- Design → 구조적 구현 일치
- Design의 Context Anchor를 Analysis 문서 헤더에 복사
- **교훈 회고**: `~/.altool/lesson.md`가 있으면 읽고 이번 기능과 관련된 교훈을 추린다 — 두 용도로 사용:
  ① **검증 렌즈**: 설계-구현이 일치해도 교훈의 예방 규칙을 위반한 패턴은 갭이다 (Match Rate가 못 잡는 영역)
  ② **검증 도구 함정 회피**: 테스트 수행 자체에 적용 (예: 인코딩 거짓 400, 서버 가동 중 빌드 금지)

### 4~5. Strategic Alignment Check

구조 갭 분석 전에 먼저 검증:
- 구현이 PRD의 핵심 문제(WHY)를 해결하는가?
- Plan의 Success Criteria 각각을 ✅ Met / ⚠️ Partial / ❌ Not Met으로 판정 + **증거(file:line 또는 테스트 결과) 필수**
- 핵심 설계 결정(아키텍처·데이터 모델·API)이 지켜졌는가?
- **전략적 불일치는 구조 매치율과 무관하게 Critical로 플래그. SC 위반은 자동 Critical.**

### 6~7. 독립 검증 에이전트 호출 (자기 채점 금지)

> **설계·구현을 작성한 세션이 스스로 채점하면 체크리스트가 구현 모양대로 해석되어 점수가 부풀려진다.**
> 갭 분석은 **독립 서브에이전트에 위임**한다.

1. **Agent 도구(general-purpose)로 검증 에이전트를 생성**하고 아래를 전달한다:
   - Design 문서 경로 + Plan 문서 경로 + 구현 경로(src/ 등)
   - 아래 3축 정의와 Match Rate 공식
   - **관련 교훈 목록** (1~3단계에서 추린 것): "아래는 과거에 실제 발생한 결함 패턴이다. 각 교훈의 예방 규칙 위반 여부를 추가로 검사하라 — 설계와 일치하더라도 위반이면 갭으로 보고하라."
   - 지침: "너는 이 설계와 코드를 처음 본다. **갭을 찾는 것이 임무**다. 각 판정에 file:line 증거를 의무화하고, 애매하면 ✅가 아니라 ⚠️로 판정하라. 칭찬은 불필요하다."
2. 에이전트는 축별 점수 + 갭 목록(항목·파일·차이·수정 방향)을 구조화해 반환한다.
3. **메인 세션은 에이전트가 보고한 갭과 점수를 그대로 기록한다.** 임의로 점수를 올리거나 갭을 기각하지 않는다 (기각하려면 반증 증거를 문서에 남긴다).
4. Agent 도구를 사용할 수 없는 환경에서만 메인 세션이 직접 수행하되, 모든 판정에 file:line 증거를 의무화한다.

검증 3축 정의 (에이전트에게 전달):

| 축 | 검사 내용 |
|----|----------|
| **Structural** | 파일 존재, 라우트 커버리지, 컴포넌트 목록 (Design §5.3, §10.1 대조) |
| **Functional** | Design §5.4 Page UI Checklist 항목별 구현 검증 + 플레이스홀더 검출(`TODO`, `console.log` 스텁, 목 배열) + 파일별 Depth Score(0~100, 60 미만 = SHALLOW) |
| **Contract** | Design §4 ↔ 서버 route.ts ↔ 클라이언트 fetch 3-way 대조 (런타임 장애를 정적 검사로 검출) |

### 8. 런타임 검증 (v2.3.0)

서버 감지: `http://localhost:3000` 응답 확인.

- **서버 미실행 시**: L1~L3 생략, 사용자에게 경고 후 **정적 공식 사용**. (서버를 직접 실행하지 말고 `start.bat` 또는 `npm run dev` 실행을 안내)
- **서버 실행 중**:
  - **L1 — API 테스트**: Design §8.1의 각 엔드포인트를 curl로 호출 — 상태코드·응답 형태·401 가드·400 검증 확인
  - **L2 — UI 액션 테스트**: `tests/e2e/{기능명}.spec.ts` 있으면 실행, 없으면 Design §8.2에서 생성 후 `npx playwright test` (Playwright 미설치 시 생략 후 안내). Playwright MCP 도구로 대체 가능
  - **L3 — E2E 시나리오**: Design §8.3의 멀티 페이지 사용자 여정 검증

### 9. Match Rate 계산 (4축 가중 공식)

```
런타임 실행 시: Overall = Structural×0.15 + Functional×0.25 + Contract×0.25 + Runtime×0.35
              (Runtime = L1×0.4 + L2×0.3 + L3×0.3)
정적 전용:     Overall = Structural×0.2 + Functional×0.4 + Contract×0.4
```

모든 축의 비율을 **개별 보고**하고 Gap 목록을 생성한다. 각 갭에는 파일 경로 + 설계와의 차이 + 수정 방향 기록 (iterate의 입력).

**Altool 자산 감지 — 디자인 토큰 검증** (`designs/design-tokens.css`가 있을 때만, analysis 문서에 절 추가):
| 항목 | 기준 |
|------|------|
| 색상 하드코딩 | 스타일 코드에 `#hex` 없음 → 모두 `var(--color-*)` |
| 크기 하드코딩 | 고정 px 없음 → `var(--space-*)`, `var(--text-*)` 등 |
| 반응형 | 375px 이상 정상 |

### 10. Decision Record 검증

PRD→Plan→Design 체인의 핵심 결정이 구현에서 지켜졌는지 확인, 이탈 플래그.

### 11. Checkpoint 5 — 처리 방침 결정

심각도별(Critical/Important, 확신도 ≥80%만) 이슈를 제시하고 AskUserQuestion:
- "지금 모두 수정" → fix 진행
- "Critical만 수정" → Critical만 fix
- "그대로 진행" → 현재 상태 수용

(자동 파이프라인 호출 시: Match Rate < 90%면 "모두 수정"으로 자동 진행)

### 12~13. 상태 갱신 + 보고

`.altool/state/status.json`: `phase: "check"`, `matchRate: {N}`.
**문서 동기화** (CLAUDE.md 규칙): 검증을 통과한 항목만 design §5.4 Page UI Checklist와 plan §4 Success Criteria에서 `- [x]`로 갱신. ❌/⚠️ 항목은 체크하지 않는다.

```
🐣 [al:analyze] {기능명} 완료 — 산출물: docs/03-analysis/{기능명}.analysis.md
   Structural {N}% | Functional {N}% | Contract {N}% | Runtime {N}% (또는 정적 전용)
   Overall Match Rate: {N}%
   디자인 토큰: {통과 / 위반 N건}
```

- ≥ 90% → `다음 단계: /al report {기능명}`
- < 90% → `다음 단계: /al fix {기능명}`
