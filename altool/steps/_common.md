# Altool Step 공통 계약

작업 입력을 선택할 때 `altool/standards.md`를 읽고 적용한다. 이 문서가 표준 라우팅·적용·검증 증거의 공통 절차를 소유한다.

모든 step은 완료 전에 지정된 `.altool/checks/*.json`을 작성하고 `python3 altool/scripts/check.py validate --json {check-path}`를 통과시킨다. 실패 원인을 보완해 최대 5회 재검증하고, 통과한 Step Check 요약을 최종 보고에 포함한다.

회사 팩 UI는 구현 전에 `altool/standards.md`의 과업별 표준→선택 자산→회사 적용 지침을 읽고 Spec에 연결한다. 구현/검증 step은 같은 문서의 UI 적용 증거(routing·requirements·규칙별 관찰)도 연결한다. 누락·임의 대체·비적용 근거는 실제 코드·화면과 독립 대조한다.

공통 `checks` 키의 의미는 다음과 같다.

| 키 | 증거 |
| --- | --- |
| `inputs.loaded` | 이 step이 요구하는 정책·상태·문서·자산을 읽은 결과 |
| `lesson.search` | 요구된 lesson 검색 결과 또는 이 step에 맞는 skip 사유 |
| `event.capture` | 기록한 lesson event ID 또는 기록 대상이 아닌 사유 |
| `verification` | 이 step의 성공 기준을 확인한 명령·도구·결과 |
| `state.updated` | 상태 파일 갱신 결과 또는 갱신 대상이 아닌 사유 |
| `docs.synced` | 변경 문서와 소유 Step Check 동기화 결과 또는 대상 없음 |
| `document.status` | 관련 문서의 최상단 상태 동기화 결과 또는 대상 없음 |
| `artifacts.created` | 생성·수정한 산출물 경로 또는 산출물 없음 |

`done`에는 비어 있지 않은 `evidence` 목록을, `skipped`와 `failed`에는 구체적인 `reason`을 쓴다. step 문서에 추가 키나 허용 skip 사유가 있으면 그 규칙이 우선한다.

## 진행 아이콘

출력 아이콘은 성장 단계 번호가 아니라 실행 상태를 나타낸다. 🥚는 시작·진행 중, 🐣는 개별 단계 검증 완료, 🐥는 전체 실행(oneshot·freedom·개발 사이클) 검증 완료, ⏭️는 허용된 단계 생략, ⚠️는 차단·실패·미완료다. 생략·미해소 갭·검증 누락을 완료 아이콘으로 표시하지 않는다. 전체 완료 아이콘은 해당 최종 게이트를 통과한 뒤에만 출력하며 반복 횟수 소진만으로 완료하지 않는다. 상태 안내도 실제 상태에 맞는 아이콘을 선택한다.
