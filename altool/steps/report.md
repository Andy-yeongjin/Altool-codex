# /al report — 완료 보고서

**산출물**: `docs/04-report/{기능명}.report.md`

---

## 절차

### 0. 템플릿 로딩 (MANDATORY)

`altool/templates/report.template.md`를 Read 도구로 읽고 그 절 구조를 아웃라인으로 사용한다.

### 1. Match Rate 확인

`.altool/state/status.json`의 matchRate < 90%면 경고 후 사용자에게 진행 여부 확인.

### 2. 상류 문서 전체 로딩

PRD→코드까지 전체 여정이 보고서에 반영되도록 모두 읽는다 (없는 것은 N/A):
- PRD — 원래 가치 제안 vs 실제 전달된 가치 비교
- Plan — 계획된 Requirements/Success Criteria vs 실제 결과
- Design — 아키텍처 결정과 이탈 사항
- Analyze 문서 — 최종 Match Rate와 해소된 갭
- `docs/03-analyze/{기능명}.fix.md` — 개선 이력

**Altool 확장**: `npm run build` 1회 실행해 최종 빌드 성공 여부 기록 (헌법 제10조). git 저장소면 `git status`로 변경 파일 수집.

### 3~7. 보고서 작성

템플릿 절 구조대로 작성. 핵심:
- **§1.2 전달된 가치**: 계획(Plan Executive Summary) 대비 실제 달성을 측정값과 함께 대조
- **§1.3 Success Criteria 최종 판정**: Plan의 SC 각각 ✅ 충족(증거) / ❌ 미충족(사유) + 충족률
- **§2 핵심 결정 기록(ADR)**: Plan→Design 체인의 핵심 결정 — 지켜졌는가? 결과는? (**다음 개발 사이클을 위한 학습 기록** — 헌법 제12조 ADR과 동일한 목적)
- **§4.1 기능 요구사항 최종**: FR별 이행 상태
- **§4.2 이월 항목**: 다음 사이클로 이월된 항목 + 사유
- **§5 품질 지표**: 최종 Match Rate, 토큰 준수, 빌드 결과
- **§6 회고**: Keep / Problem / Try — Problem 중 재발 가능한 항목은 **lesson 승격 후보**로 제시 (steps/lesson.md 연동 규칙)

### 8. Executive Summary 출력 (MANDATORY)

보고서 완성 후 **Executive Summary 표를 응답에 직접 출력**한다.

### 9~10. 상태 갱신 + 완료 보고

`.altool/state/status.json`: `phase: "completed"`.
**문서 동기화** (CLAUDE.md 규칙): plan §9 Next Steps 잔여 항목과 analyze 문서 §8 다음 단계의 "보고서 작성" 항목을 `- [x]`로 갱신. 미래 작업(다음 사이클·배포)은 미체크 유지.

```
🐣 [al:report] {기능명} 완료 — 산출물: docs/04-report/{기능명}.report.md
   최종 Match Rate: {N}% | 빌드: {성공/실패} | 반복: {iterationCount}회
   🐥 {기능명} 개발 사이클 완주
   다음: 새 기능 /al plan {새기능명} 또는 배포 (guides/neondb-guide.html → guides/vercel-guide.html)
```
