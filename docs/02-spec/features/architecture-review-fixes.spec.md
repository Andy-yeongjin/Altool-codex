# 구조 검수 후속 수정 Spec

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: Implemented — Claude 코드 정합성 승인, 네이티브 저장·Windows·모델 완주 검증 대기

| 계약 | 구현 및 검증 |
| --- | --- |
| AR-1 | altool/vendor의 고정 순수 Python PyYAML을 별도 namespace로 로드. 시스템 yaml과 독립. Python -S로 source와 설치본 validate, license/version/hash 확인. 손상 번들은 설치 전 차단. |
| AR-2 | run/analyze/fix/browser/oneshot/freedom에서 document-only/status-only 태그 거부. 준비/조회 단계 및 비UI code-change의 빈 sources는 유지. |
| AR-7 | canonical .altool/checks 아래는 root 유추. 파일이 그 밖이면 --root 필수. stdin은 기존 cwd(oneshot은 명시 root) 계약 유지. legacy는 명시 root로 유지. |
| AR-3/4 | setup은 모드와 무관하게 Python·제품정책·필수 자산을 검증. 실제 상태 또는 Altool 산출물로 재개. AGENTS 진입 누락만 한국어 경고하고 setup에서 AI가 관련 문맥을 확인해 기존 규칙 보존·최소 보완. 상충 시 사용자 확인. |
| AR-5/6 | altool/standards.md가 디자인 입력 탐색/갱신 조건 소유. Claude HTML 및 Stitch는 하위 폴더 포함. 신규/변경/삭제 원본 및 로컬 보조 자산과 Source Map을 비교하고 불확실하면 원문 비교. 명령은 공통 조건을 참조하며 자동 모드만 design_source 자동 실행. 원본 폴더는 평탄화하지 않는다. |
| AR-8/9 | 스타터 하단/성공 안내에 미설치 프로젝트의 설치기→setup 절차. BAT는 입력 인자로 비대화형 여부를 조기에 정하고 사용자 오류 경로를 공유 종료로 연결. probe 서브루틴 반환과 취소는 보존. |

## 경계와 검증

헌법의 Claude HTML 위치 표현을 재귀 입력과 맞추는 제품 원본 정정은 PATCH 및 digest를 동기화한다. 설치 프로젝트가 임의로 헌법을 수정하도록 하지 않는다. 표준의 필수/기본값 구분, 파일 무결성, 사용자 승인 경계는 유지한다.

자동 테스트는 구조와 관찰된 동작만 증명하며 AI의 의미 선택을 보증하지 않는다. 디자인 시나리오는 중첩 화면·동명 code.html·CSS 변경·비HTML 교체를 포함한다. 문서 지시의 회귀는 연결·모순 검사를 포함하되 실제 모델 완주와 구별한다. 브라우저는 변경된 안내·PRD 미리보기·파일 선택·모바일 상태를 확인한다. 네이티브 폴더 저장과 Windows 실실행을 못 하면 완료로 보고하지 않는다.

## 실행 결과 — 2026-09-07

- `/usr/bin/python3 -S -m unittest discover -s tests -q`: 66/66 PASS. 설치 및 손상 번들 차단은 테스트가 관리하는 임시 폴더에서 실행했다.
- `node --test tests/test_project_starter.cjs`: 11/11 PASS. 중첩 동명 HTML과 상대 CSS/이미지의 원본 구조 보존 포함. 디스크 어댑터 저장이며 브라우저 권한 검증은 아니다.
- `standards.py validate`, `check.py skill-sync`, `bash -n setup.command`, 스타터·두 가이드 inline JS 구문, `git diff --check`: PASS.
- 실제 브라우저: 중첩 디자인 폴더 선택→3개 저장 상대 경로→미리보기, 미선택 대상 폴더에서 저장 비활성화, 설치 후속 안내, 가이드 링크·아코디언, 390/1280px 가로 넘침 없음·콘솔 오류 없음 확인. 저장 성공 안내의 실제 관찰은 대기.
- Claude AR-1~9 코드 정합성 승인 후 Codex가 현재 소스와 회귀를 독립 확인했다. 공통 디자인 조건·setup AI 절차·BAT는 문서/소스 계약 검증과 실제 행동 검증을 구분한다. AR-10은 유지한다.
- 직접 제품 개발로 작성한 Plan/Spec에는 실행하지 않은 Altool step의 체크를 만들지 않았다. `audit-docs`는 소유 체크 4개 부재, `a11y-contracts`는 currentFeature 부재로 미통과했다. 전체 Altool 완료 게이트 PASS를 주장하지 않는다.
