# /al fix — Fix 단계 (자동 개선)

**산출물**: 개선된 소스 코드 + `docs/03-analysis/{기능명}.fix.md` (iteration report)

---

## 절차

### 1. 실행 조건 확인

- `docs/03-analysis/{기능명}.analysis.md`의 Gap 목록과 `.altool/state/status.json`의 `matchRate` 확인.
  - analysis 문서가 없으면 → `/al analyze {기능명}` 먼저 실행 안내 후 중단.
- **matchRate ≥ 90%면** → `✅ Match Rate {N}% — 개선 불필요. /al report {기능명}로 진행하세요.` 출력 후 종료.
- Checkpoint 5에서 "Critical만 수정"이 선택됐으면 Critical 갭만 대상으로 한다.

### 2~3. Gap 목록 기반 자동 수정

각 갭을 **하나씩** 수정한다:
- analysis 문서의 "수정 방향"을 따른다
- Functional 갭(SHALLOW 파일)은 run 단계의 Depth-First 기준으로 완성한다: TODO 제거, 실데이터 연결, Page UI Checklist 항목 충족
- Contract 갭은 Design §4 스키마에 맞춰 서버·클라이언트 양쪽 정렬
- **설계 자체가 잘못된 경우** → 코드를 끼워 맞추지 말고 Design 문서를 수정한 후 해당 갭을 갱신 (헌법 제9조: 명세-코드 동기화)
- **Altool 확장**: 수정 중에도 토큰만 사용, TypeScript Strict, 보안 규칙 준수

수정 완료 후 `npm run build` 성공 확인 (Altool 확장 — 실패 시 수정 후 재빌드).

### 4. 자동 재분석 (Auto re-Check)

`altool/steps/analyze.md`의 6~9번(정적 3축 + 런타임 + Match Rate 계산)을 다시 수행한다.

### 5. 반복 판정 

`.altool/state/status.json`: `iterationCount` +1, `matchRate` 갱신, `phase: "fix"`.

- **Match Rate ≥ 90%** → 종료, 보고로
- **< 90% 그리고 iterationCount < 5** → 2~5번 반복 (최대 5회)
- **< 90% 그리고 iterationCount ≥ 5** → 중단 후 안내:
  ```
  ⚠️ 최대 반복(5회) 후에도 Match Rate가 {N}%입니다.
  남은 갭: {요약}
  선택 A (권장): 남은 갭을 직접 확인 후 개별 지시로 수정
  선택 B: 이 상태로 /al report {기능명} 진행
  ```

> `/al oneshot` 파이프라인에서 호출된 경우 그 파이프라인의 반복 한도(2회 후 사용자 확인)를 우선한다.

### 6. 교훈 기록 (lesson 연동)

해소한 갭 중 **다른 프로젝트에서 재발 가능한 범용 원인**(도구·언어·프로세스 차원)이 있으면 `steps/lesson.md` 기록 모드로 글로벌 lesson.md에 기록한다 (수동 실행 시 사용자에게 제안, oneshot 자동 모드에서는 기록 후 보고).

### 7. Fix Report 작성

`altool/templates/fix.template.md` 구조로 `docs/03-analysis/{기능명}.fix.md`를 작성/갱신한다:
- §1 Match Rate 추이 (회차별·축별)
- §2 해소된 갭 (analysis 갭 번호와 일치시킴)
- §3 회차별 상세 (수정 내용·파일·재분석 결과)
- §4 잔여 갭 (자동 수정 불가 사유 + 제안)

### 8. 완료 보고

```
🐣 [al:fix] {기능명} 완료 — Match Rate {이전}% → {현재}% ({iterationCount}회차)
   산출물: docs/03-analysis/{기능명}.fix.md
   다음 단계: /al report {기능명}  (또는 남은 갭 안내)
```
