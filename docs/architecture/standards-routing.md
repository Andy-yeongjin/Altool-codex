# 표준 라우팅 설계

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../verification-status.md). 아래 구현 완료·테스트 수는 당시 실행 기록이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: 구현 완료 — 로컬 검증 완료, Windows 실실행·모델 완주 평가는 미수행

## Plan

설치 프로젝트의 에이전트 행동(AGENTS), 제품 관리 원칙(constitution), AI가 유지하는 프로젝트 공통 계약(standards), 기능 범위(PRD), 구현 결정(Spec), 실행 절차(steps)를 분리한다. 비개발자는 원하는 동작만 말하며 AI가 공통/기능 한정 범위를 판단한다. 일반 대화와 Altool 명령 모두 표준 라우터를 진입점으로 사용한다.

성공 기준:
- YAML 하나로 활성 프로필, 의미 기반 작업 태그, 원문 항목, 의존 표준을 찾는다.
- 관련 표준을 의존 관계까지 읽고, 누락 파일·중복 항목·순환 의존·알 수 없는 태그는 실패로 드러난다.
- Spec에 적용 규칙과 검증을 연결하고 Analyze는 원본 라우터에서 누락을 재검사한다.
- 새 설치는 standards/design.md를 사용한다. 재설치는 AGENTS·기존 표준을 보존하고 헌법은 다른 기존 내용을 백업 후 제품판으로 교체한다. 기존 designs/design.md만 있으면 내용을 새 경로로 복사해 보존한다.
- 사내 공통 개발 계약(engineering/glossary/schema/api)은 base에서 과업별로 선택한다. AI가 프로젝트 목적과 원문을 보고 internal-common의 조직/역할/감사/일괄 입력 기반과 기술 기본값을 선택한다. Altool 자체에 인증·DB·관리 화면을 구현하지 않는다.
- 공통 계약은 기존 항목 재사용·갱신을 우선하고, 기능 한정 요구는 Spec에 둔다. 불필요한 표준 수정은 하지 않는다. 요청 밖의 기존 동작·권한·데이터 변경은 영향 설명 후 확인한다.

## Spec

`standards/standard.yaml`: version 1, active_profiles, standards 사전. 표준마다 profile, when(작업 의미 태그), source(standards/ 기준 상대 경로), sections(고정 anchor ID 또는 *), requires(표준 ID)를 가진다. 선택적인 asset_kinds/asset_ids는 자산 탐색 후보를 연결한다. YAML에는 규칙 본문이나 실행 명령을 넣지 않는다.

`altool/scripts/standards.py`:
- validate: 제품 헌법 무결성·YAML 스키마·활성 표준 원문·앵커·의존 관계 검사.
- resolve --tag TAG: 활성 표준의 직접 매칭과 requires 전이 폐쇄를 JSON으로 출력. 비활성 매칭은 inactive_candidates로 알리되 자동 활성화하지 않는다. 태그 누락·오타는 오류. --all은 모호한 작업의 활성 표준 전체 읽기용.
- read: resolve와 동일한 선택으로 원문 항목과 출처·행·SHA256 출력. *는 파일 전체이며 선택된 항목은 요약하지 않는다.
- install --source ROOT --root TARGET: 누락된 표준만 설치, 기존 라우터·표준 보존, legacy 디자인을 새 경로로 복사. 다른 기존 헌법을 .altool/backups/constitution.<원본 bytes SHA256>.md에 보존하고 제품 헌법·digest 설치. 두 디자인 파일이 다르면 경고하고 기존 canonical 파일 유지.

파일은 프로젝트 내부로 제한하고 YAML 중복 키·잘못된 버전·비활성 의존성을 거부한다. 새 제품 엔진이 없는 프로젝트만 legacy 모드를 허용한다. 현재 설치의 헌법·digest·라우터 누락은 복구가 필요하며 선택 규칙 비활성화로 우회하지 않는다.

무결성 기준은 altool/constitution.sha256이다. 헌법 UTF-8 텍스트의 줄바꿈을 LF로 정규화한 SHA256을 비교해 Windows 체크아웃도 허용한다. Step Check는 모든 단계에서 제품 정책을 검사하고 작업 단계에서는 표준 증거도 비교한다. 제품 원칙 변경 작업에서만 헌법과 digest를 함께 배포한다. 로컬 파일 소유자가 엔진·digest까지 바꾸는 것을 막는 보안 장치는 아니다.

필수 계약/기본값/예시를 원문에서 구분한다. Spec은 표준 원본을 대체하지 않는다. Step Check는 선택 태그, 출처 hash, 적용 항목, 실제 검증 증거를 기록한다. 구조 검사가 에이전트의 이해나 의미적 준수를 증명한다고 주장하지 않는다.

## 검증 계획

의존 라우팅·비관련 제외·잘못된 태그·누락 앵커·중복 키·경로 탈출·순환·비활성 의존·TBD·legacy·재설치 보존을 테스트한다. 기존 게이트/설치/동시성 회귀, skill-sync, 설치 셸 구문 검사를 수행한다. Windows 실실행 여부는 별도로 보고한다.

## 초기 라우팅 검증 결과 (2026-09-07)

- `.venv/bin/python -m unittest discover -s tests -q`: 48/48 PASS. 기존 31개와 새 17개. 신규 테스트는 의존 표준 전이 선택·비관련 제외·앵커 원문 추출·오타·누락·중복·순환·비활성 의존·경로/심볼릭 링크 탈출·TBD·stale hash·oneshot 자식 증거·legacy·macOS 실제 설치/재설치를 포함한다.
- skill-sync와 양쪽 Altool skill quick_validate PASS. `bash -n setup.command`, `git diff --check`, 변경 HTML 4개의 inline JavaScript 구문 검사 PASS.
- in-app Browser: 설치 가이드의 설치/디자인 링크 실제 이동, oneshot 설치 아코디언 펼침·새 안내 확인. 두 가이드 1280/390px 가로 넘침 없음. PRD Builder 대표 입력→화면 선택→PRD 미리보기 생성→닫기 확인, 기본 736/390px에서 가로 넘침 없음. 관찰한 콘솔 오류 없음.
- 디자인 프리뷰 새 경로와 Colors 링크 이동 확인. 1280px 정상, 390px에서 기존 예시 테이블/내비게이션이 가로 넘침. 변경은 안내 경로 한 줄이며 해당 예시 CSS/마크업은 이번에 변경하지 않았다.
- 설치 가이드의 기존 복사 버튼은 클릭했으나 clipboard 내용과 성공 표시를 확인하지 못했다. 복사 기능 수정·성공 주장을 하지 않는다. PRD 다운로드/첨부 업로드는 이번 검증에서 실행하지 않았다.
- Windows BAT는 소스 계약 검사만 통과했으며 Windows 호스트에서의 실실행은 미수행. 모델이 실제 제품을 oneshot으로 완주하는 비교 평가는 아직 수행하지 않았으며 테스트 통과를 모델 준수율 향상 수치로 해석하지 않는다.

## 설치와 유지보수

YAML 파서는 altool/vendor/의 고정 PyYAML 순수 Python 복사본으로 배포한다. 사용자 pip나 .venv에 의존하지 않으며 제품 업데이트 때 버전·라이선스·소스 hash와 회귀를 검증한다. 기본 설치는 base의 사내 개발·API·스키마·UI 계약을 과업별로 선택하며 AI가 필요한 기능 프로필을 관리한다. 원문에서 기능 한정 요구와 고정 수치 후보를 무조건 전역 정책으로 활성화하지 않는다. 기존 표준과 원본 공통영역 v3 문서는 보존한다. 헌법 업데이트 백업은 이전 내용을 검토해 필요한 프로젝트 요구를 표준/Spec으로 옮기는 참고용이며 기존 헌법을 그대로 활성 파일로 되돌려 게이트를 우회하지 않는다.

2026-09-08 사내 개발 계약 정리: [Spec](../02-spec/features/company-development-standards.spec.md), [원문 대조표](../../standards/reference/common-v3-alignment.md). standards/tooling의 공통 린트 설정도 재귀 설치되며 고객 lint 구성은 자동 교체하지 않는다. UI 팩 QA8은 변경하지 않았고 새 표준 선택/hash에 대한 소비 앱 증거는 재검증해야 한다.

## UI 지침·자산 연결 확장 (2026-09-08)

과업별 표준→자산 종류/ID 후보→선택 자산의 회사 지침/참고 원문→규칙별 검증으로 이어진다. 구체 계약은 [확장 Spec](../02-spec/features/ui-guidance-routing.spec.md), 실행 절차는 `altool/standards.md`가 소유한다. 새 팩 QA7부터 회사 지침도 lock에 포함한다. requirements 명령은 적용 규칙/상태 목록만 반환하고 evidence는 현재 구현·지침·관찰 hash 및 누락/미검증 상태를 검사한다. 기존 원문을 읽고 이해했는지의 자동 증명이나 임의 UI 의미 분석기는 아니다.

## 소유권·AI 유지관리 개정 검증 (2026-09-07)

- 전체 테스트 56/56 PASS: 기존 라우팅 48개에 신규 공통 계약 등록·선택, 헌법 백업/재설치 멱등성, 변경/누락 차단, digest/라우터 삭제 시 legacy 우회 거부, CRLF 호환, 손상 제품 원본 사전 거부, 외부 심볼릭 링크 보호, 실제 check.py CLI의 헌법 변경 거부 8개를 추가했다. macOS 신규 설치·기존 프로젝트 설치를 실제 실행했다.
- 양쪽 Altool skill quick_validate 및 skill-sync PASS. 설치 셸 구문·변경 가이드 JavaScript 구문·git diff --check PASS. 헌법 직접 수정·누락 시 비활성화·기존 헌법 보존이라는 오래된 안내를 관련 문서에서 제거했다.
- in-app Browser에서 FAQ 링크 이동, 헌법/부분 복사 FAQ 펼침, 모바일 헌법 FAQ 접기/재펼침, oneshot 상세 가이드 이동, setup 설치/초기화 안내 펼침과 새 본문 표시를 확인했다. 두 가이드 1280/390px에서 가로 넘침 없음, 관찰한 콘솔 오류 없음. 이번 변경은 안내 문구이며 폼 저장·외부 설치 링크 실행은 대상이 아니다.
- Windows 호스트 실실행과 AI의 실제 제품 oneshot 완주·공통화 판단 행동 평가는 미수행이다. 자동 검사는 파일 무결성·라우팅·증거 정합성을 확인하며 AI의 올바른 공통화나 규칙 준수 자체를 보증하지 않는다. 기존 AGENTS를 보존하는 업그레이드는 일반 대화의 새 표준 진입 규칙 연결을 별도로 검토해야 한다.
