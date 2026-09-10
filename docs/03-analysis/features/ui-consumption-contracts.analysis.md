# 공통 UI 소비 계약 검증

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: 제품 보완 및 지정 소비 대시보드 회귀 검증 완료 — 전체 자산 전수 검증은 별도

## 제품 변경

- 헌법/AGENTS 지시를 추가하지 않았다. 기존 UI-03·Browser 대조 항목에 실제 측정을 연결하고 관련 README/표준 절차/회사 팩 가이드를 동기화했다.
- 공통 adapter/base, authored runtime/components 계층으로 파일 순서 충돌을 해소했다. 기본 h2는 회사 title-large 역할을 사용한다.
- 공식 원본은 그대로 두고 파생 어댑터의 미정의 참조17종·38회, 고대비/theme 대표 대비4규칙, runtime disabled 및 service 선택 버튼 대비를 보정했다.
- Swiper CSS의 fallback이 있는 옵션 변수를 누락으로 오탐하던 검사기를 수정했다. fallback 안의 실제 미정의 참조는 계속 실패한다. JS가 배치하는 offset/virtual-size는 파생 CSS에서 중립 초기값을 제공한다.
- 방향 고정 의미 ID4개/변형16개를 원본 꺾쇠의 회전 파생물로 제공한다. 원본 contour를 다시 그리지 않았다.
- `ui-contracts.mjs`는 실제 viewport·computed style·문서 위치·SVG 변환 후 글자·방향 파일·가시성을 검사한다. 업무별 기대값은 Spec 소유다.

## 자동 검증

- `.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`: **137/137 PASS**.
- `ALTOOL_LINT_PEERS=/Users/andy/Desktop/project/altool-test node --test tests/test_*.cjs tests/test_*.mjs`: **149/149 PASS**, skip0. 실제 ESLint peer를 사용했다.
- adapter 재현 및 방향 SVG `--check`, 공식 원본245파일 무결성, 회사 registry/lock, standards router: PASS.
- 배포 CSS12파일 preflight: 정의2304/참조6105, 명시적 대비33쌍 PASS. 변수 없는 예시 주석과 유효 fallback을 위반으로 세지 않는다.
- 합성 실패 테스트: 25px/여백24 제목,1230px 목록,6px SVG,잘못된 방향·추가 회전,잘못된 viewport,없는/숨긴 대상,NaN·중복/누락 관찰을 거부한다. 합성 테스트는 소비 앱 실측 증거가 아니다.
- 첫 전체 테스트에서 새 방향 SVG의 catalog 누락을 발견해 생성기에 연결하고 전체137개를 재실행했다.

## 실제 인앱 브라우저

기존 localhost:48765 서버의 `tests/fixtures/ui-consumption-before.html`과 `ui-consumption-after.html`을 사용했다. 제품 fixture는 합성 업무 콘텐츠지만 아래 값은 실제 렌더링 관찰이다.

| 시나리오 | 실제 관찰 |
|---|---|
| 앱 CSS가 공통 CSS보다 앞 | 제목21px, margin-top0px; 선택 버튼 클릭 → 선택됨 |
| 앱 CSS가 공통 CSS보다 뒤 | 제목21px, margin-top0px; 선택 버튼 클릭 → 선택됨 |
| 375×1000 | 제목21px/여백0 유지; 문서 가로 넘침 없음 |
| 고정 방향 SVG | 왼쪽·오른쪽 윤곽 시각 확인 |
| 비활성 버튼 | #555555 on #E4E4E4 |
| 고대비 필터 숫자 | #FFFFFF on #256EF4 |
| 고대비 페이지 수 | #F4F5F6 on #1D1D1D |
| 콘솔 | error/warn 없음 |

증거: [앞 순서](../assets/ui-consumption/css-before.png), [뒤 순서·모바일](../assets/ui-consumption/css-after-mobile.png). 임시 탭은 닫고 viewport를 reset했다. 페이지 전환 후 selector helper 시간초과는 native 클릭/최신 탭 read-only DOM 측정으로 복구했으며 브라우저 외 제어로 대체하지 않았다.

## 소비 대시보드 회귀

제품 회사 팩은 `altool-company-ui@1.0.0-qa.9`(의미 ID171개, pinned 파일349개)로 갱신했다. 소비 앱 수정과 자동 검사는 기존 Run 서브에이전트가 `/Users/andy/Desktop/project/altool-test`에서 수행했고, 부모는 제품 원본 수정 및 실제 인앱 재검증을 맡았다. 소비 앱 소스는 부모가 대신 작성하지 않았다.

- QA8에 같은 기대값을 적용해 제목·밀도·차트 글자·방향에서10개 실패를 재현했다. 첫 QA9에서도 목록 top1062px로 실패했고, 결과를 보존한 뒤 중복 안내 문구와 기존 설계 간격을 조정했다.
- 소비 앱 lint/typecheck/build, 도메인 테스트5개 및 E2E10개 모두 PASS. 최종 E2E는 skipped0이다.
- 제목/밀도/모바일 축/방향의6개 측정 계약과 별도 월 라벨 간격 검사를 통과했다. 기대값을 실패 화면에 맞춰 낮추지 않았다.

| 부모 인앱 시나리오 | 실제 관찰 |
|---|---|
| 1440×1000 섹션 제목 | h2 21px, 위/아래 margin0px |
| 첫 화면 목록 진입부 | 제목 문서 top946.5px < 1000px; 표 데이터 행까지 첫 화면에 들어온다는 뜻은 아님 |
| 375×1000 차트 | 축15개 모두13px, 월12개 유지, 문서 가로 넘침 없음 |
| 월 라벨 간격 | 최소8.28125px, 11–12월8.453125px |
| 지표/기간 클릭 | 영업이익·6개월 선택 → 상태/대체 설명 및7–12월 갱신 |
| 수치 대안 | 월별 수치 보기 실제 펼침/닫힘, 12개월 수치 표시 |
| 좌우 표 이동 | 오른쪽 클릭 scrollLeft285.5 → 왼쪽 클릭0; 각각 고정 방향 SVG, transform:none |
| 검색 | C001 제출 → URL q=C001, 기업1개·매출561억원 |
| 상세 | 가람정밀 열기/닫기 → dialog0, 원래 버튼 포커스 복원 |
| 콘솔 | error/warn 없음 |

자동 글자 크기 검사 통과 후 시각 확인에서 마지막 월 라벨 간격1.59px의 밀착을 추가 발견했다. 실제 겹침은 아니었다. 별도 rect 최소 간격2px 회귀를 추가하고 마지막 라벨 정렬만 수정한 뒤 동일13px·12개월로 재검증했다. `text` 측정만으로 간격·잘림을 보장하지 않는 도구 경계도 README에 명시했다.

증거: [최종 데스크톱](../assets/ui-consumption/dashboard-qa9-desktop.png), [최종 모바일](../assets/ui-consumption/dashboard-qa9-mobile.png), [간격 보정 전](../assets/ui-consumption/dashboard-qa9-mobile-before-spacing.png). 소비 앱 `.altool/evidence/ui-qa8-baseline.json`, `ui-qa9-first-1440.json`, `ui-qa9-chart-spacing.json`에 실패/회귀 실측을 보존했다. 인앱 viewport는 reset했고 기본2025년/전체 기업 화면과3100 서버는 사용자 확인용으로 유지했다.

## 잔여·적용 경계

- 정적 대비 검사에서 ambiguous161규칙은 실제 적용 테마·배경별 추가 관찰이 필요하다. 이번 대표 고대비 조합 검증을 모든 상태/테마의 접근성 인증으로 확대하지 않는다.
- 과거 QA8 원문 열람/자산별 기록은 역사적 증거다. QA9 전체 변형 전수 브라우저 검증을 했다고 표시하지 않는다.
- altool-test는 QA8의269요구(22 passed/247 pending)에서 새 방향 자산·지침 선택 후276요구(25 passed/251 pending)가 됐다. 이번에 실제 재검증한 항목만 갱신했고, 명시적 assertion이 부족한 기존 pagination disabled-boundary는 pending으로 환원했다. 전체 Run 완료 게이트는 여전히 미통과이며 이번 UI 보완 완료와 구분한다. 소비 앱 최신 기록은 `.altool/evidence/run-qa9.md`다.
- 실제 조직 여러 앱의 배포/동기화는 이번 로컬 테스트와 별개다. 이번 작업은 1개 회사 팩 원본과 지정 소비 앱만 다룬다.
- 커밋·푸시는 하지 않았다.
