# 회사 디자인 v27 통합 검증

> 문서 분류: [검증 상태 색인](../../verification-status.md).

현재 상태: 사용자 후속 승인에 따라 **v27 단일 실행 디자인으로 전환**했고, `2.0.0-qa.8`에서 KRDS 원문·추출 참고자료와 원문 전용 의존성을 제거했다. 실제 브라우저 검증은 미완료이며 커밋·푸시·사내 배포는 하지 않았다. 아래 최초 통합 기록의 구형 원형 진행률 실패와 호환 자산 보존 방침은 현재 구현 상태가 아니다.

## 최신 QA8: KRDS 원문 참고자료 제거

- 사용자 승인에 따라 원본 PDF, reference/ 전체(MD·JSON195개와 부속파일2개), coverage/source-review/QA8 등 원문 대조5파일, 전용 생성기2개와 테스트1개를 제품 트리에서 제거했다. 실행 회사 UI·규칙·출처/라이선스는 유지했다.
- 삭제 자료는 `/tmp/altool-removed-krds.89LcIZ`에 임시 보관했다. Git 과거 이력을 재작성하지 않았고 커밋·푸시는 하지 않았다.
- guidance와 recipe 의존성·원문 링크를 정리하고, 탐색기는 coverage를 요청하지 않으며 catalog는 회사 자산407항목만 제공한다. 의미 ID300개·핀379파일·아이콘133개는 유지했다.
- 새 설치 → load → 회사 지침/핀 → 대표 자산 resolve와 라이선스 보존 회귀를 추가했다. 원문 전용 검사는 제거하고 실제 UI·업무·잠금·경로 검사는 보존했다. 신규 설치/표준 라우터/팩 무결성 PASS. Node139개 중138 PASS, 실제 ESLint peer 미설치1 SKIP. 확장·첨부41/41 PASS. 최종 qa8 전체 Python190/190 PASS(38.842초).
- qa.7 발행 뒤 잔존한 원문 보존 안내2곳을 수정해 qa.8로 새 발행했다. 이전 릴리스의 hash 이력을 덮어쓰지 않았다. CSS30파일 변수/명시적 대비, 회사 API·DOM·아이콘·배포 일치 검사를 통과했다. 실제 브라우저 검증과 기존 owner-check20건 부재는 해결됐다고 주장하지 않는다.

## 이전 QA6: 체크 목록·이미지 첨부 통합

- 38번 전체 선택은 상단 독립 행과 구분선, 개별 항목은 한 열로 구성한다. label에 실제 flex/gap8px와 줄바꿈·터치 조작 높이를 적용했다. 체크 상태 계산/비활성 제외 동작은 유지한다.
- 42번은 data-image-attachment 호스트의 CompanyBusiness.attachments를 사용한다. JPEG/PNG/WebP 단일 선택·파일 목록/크기·삭제·오류·드롭을 공통 구현으로 연결했고 이미지 최적화는 별도 File/미리보기/다운로드만 담당한다. 변환 중 중복 실행을 막고 파일 삭제/reset/교체/해제 후 오래된 결과가 다시 나타나지 않도록 generation과 URL/bitmap 정리를 연결했다.
- 기존 파일 검증 실패 시 유효 FileList 보존, 원본과 변환 결과 분리, disabled, reset·destroy 중 비동기 완료를 실제 JS/DOM 대역으로 검사했다. 기존 확장23개+첨부18개=41/41 PASS, 조합 정적 검사10/10 PASS. 제공 API60×서울/LA·DOM24·아이콘133·소스/배포/문서 링크 검사 PASS.
- QA6는 의미 ID300개·잠금379파일. CSS30파일 사전검사는 변수566정의/1011참조·명시적 대비146쌍 PASS이며 자동 판정 불가70규칙은 실측 대상으로 남아 있다. 원본 company-design-v27·기존 설치 앱은 수정하지 않았다.
- 관련 Python49/49 PASS (`unittest discover -s tests -p 'test_company_*.py' -q`). 디자인/번호형 페이지 재생성 일치, 자산 잠금·표준 라우터 및 `git diff --check` PASS.
- 실제 브라우저 조작·모바일·표시 실측은 기존 URL 정책 차단으로 미완료다. 이전 owner-check20건 부재도 이 변경으로 해소하지 않았으며 코드 검사를 시각 승인으로 보고하지 않는다.

## 이전 QA5: 표 제목·자료 탐색 안내 분리

- 32번 ‘업무 목록’은 ui-section-header/ui-section-title을 재사용해 표 바깥 위에 표시하고 표와12px 간격을 둔다. table과 스크롤 region의 aria-labelledby를 제목과 연결했고 caption은 sr-only로 보존했다. 열 제목(업무/상태), 데이터와 목적지는 유지했다.
- 정책 목록 하단의 ‘정책 자료 탐색’은 기존 actions/ui-form-actions 행에, ‘원문과 적용 조건 · PDF p.951부터’는 다음 p.source-note 행에 배치했다. 링크 목적지와 정책 검색·관심 저장 동작은 변경하지 않았다.
- 로컬 QA5는 의미 ID300개·잠금379파일이다. 공통 원본·생성 fragment/미리보기·번호형 페이지·등록/잠금과 표 제목 사용 지침을 동기화했다. 새 구조 계약2개를 포함한 조합 검사8/8, 서비스 Node회귀38/38 PASS. 구조 테스트를 실제 렌더링 증거로 해석하지 않는다.
- 관련 Python 전체47/47 PASS (`unittest discover -s tests -p 'test_company_*.py' -q`), 디자인25출력/번호형 페이지 재현성·자산 무결성·표준 라우터·diff 공백 검사 PASS.
- 실제 브라우저 조작·반응형 실측은 기존 URL 정책 차단으로 미완료이며 기존 문서 owner-check20건 누락도 이 수정으로 해소했다고 주장하지 않는다.

## 이전 QA4: 번호형 검토33·39·40/41·45·60·65 수정

- 33번 직접 이동 라벨/숫자 입력은 가로 정렬로 변경했다. 45번과60번 툴바는 공통 ui-field-actions로 입력 하단 기준에 맞추고60번 aside는 명시적인 세로 필터 변형으로 분리했다. 기존 필터·정렬·페이지 상태 로직은 유지한다.
- 39번은 ui-site-brand/ui-site-nav/ui-nav-item을 연결하고 어두운 헤더의 브랜드 링크에도 흰 글자·포커스를 명시했다.
- 40/41번의 별도 파일 목록·삭제 UI를 제거하고 CompanyBusiness.attachments로 통합했다. 검증 실패 시 기존 FileList 보존, 단일/다중·드롭·삭제·disabled·reset·destroy 및 두 API의 기존 콜백/event 계약을 검사했다. 검토 화면 제목도 실제 변형명으로 표시한다.
- 사용자 승인에 따라 a.button은 채움 없는 파란 글자, hover/active 밑줄, focus 외곽선으로 통일했다. 일반 recipe 링크 규칙에서 공통 버튼형/헤더 링크를 제외했고 button.primary의 주요 실행 채움은 유지했다.
- 로컬 QA4는 의미 ID300개·잠금379파일. 원본 company-design-v27과 기존 설치 앱은 변경하지 않았다. Plan/Spec·회사 GUIDE/API·guidance·배포/미리보기·번호형 모아보기를 동기화했다.
- 새 조합 정적 검사6개, 첨부 통합14개, 기존 extensions23개, Node145개 중144 PASS·1 SKIP(실 ESLint peers 없음), 제공60 API×2TZ/24 DOM/133아이콘 검사 PASS. 조합 검사는 코드 계약이며 실제 배치 실측이 아니다.
- 전체 Python 재검사194/194 PASS (`.venv/bin/python -B -m unittest discover -s tests -p 'test_*.py' -q`). 최초 실행은 이전 CSS 자동판정 불가 규칙 수64를 고정한 이력 테스트1개가 실패했다. 릴리스 보고서를 현재 핀의 실제 CSS 검사 출력과 대조하도록 수정한 뒤 전체 재실행했다. 대비 임계값4.5와 오류 거부 검사는 유지했다.
- 회사 빌드25출력·미리보기·번호형 생성 재현성, 자산 무결성·표준 라우터 PASS. CSS30파일 사전검사는 변수566정의/999참조·명시적 대비146쌍 PASS이며 자동 판정 불가70규칙은 미검증으로 유지한다.
- 실제 클릭·키보드·레이아웃·모바일·computed style·콘솔/네트워크 검증은 이전 로컬 파일 접근 정책 차단으로 미완료다. 실패 화면에서 기대값을 역추출하거나 hash만 갱신한 UI 통과 기록을 만들지 않았다. `check.py audit-docs --root . --format json` 재검사에서도 기존 Plan/Spec20건 owner-check 부재는 FAIL이며 이번 범위에서 완료로 승격하지 않는다. 최종 `git diff --check` PASS.

## 이전 QA3: 라벨·공통 드롭다운·아이콘 표시 수정

- 정책명/정책 대상의 inline 라벨·입력을 공통 ui-field의 분리된 label(for/id)+control로 수정하고 검색 조건·버튼을 ui-filter-bar/ui-filter-actions에 배치했다. 같은 이식 예제의 감싼 필드35개와 보완 컴포넌트의 필드12개도 정리했다.
- 기본·서비스 예제22개 진입 HTML의 스크립트 연결, 단일 select48개 마커, extensions37변형의 의존 등록을 확인했다. CompanySelect를 재사용하는 recipes/controls.js가 동적 삽입·교체·제거·숨김·표시·프로그램 값·폼 초기화를 관리한다. 실제 삭제된 select를 destroy가 되살리거나 이전 부모로 되돌리는 버그도 수정했다.
- 번호형 company-additions.html의 추가 아이콘13개는 v27 기본 ui-icon/16px로 표시하고40px 확대·사각 외곽 프레임을 제거했다. 원본120개 및 추가13개 SVG의 도형은 바꾸지 않았다. 번호01~68·모아보기 변형 선택 드롭다운은 유지했다.
- 문서와 런타임 의존을 함께 동기화했다. 새 QA3는300개 의미 ID·378개 잠금 파일이며 이전 QA2 이력을 덮어쓰지 않았다.
- 전체 Python **188/188 PASS**. 전체 Node **145개 중144 PASS·1 SKIP**(실 ESLint peers 미설정). 이 안에 실제 CompanySelect+DOM 대역의 lifecycle·정리·값 동기화와 아이콘 원본/표시 계약14개가 포함된다. 별도 extensions23개 및 제공60 API×2TZ/24 DOM/133아이콘 검사도 PASS.
- 회사 빌드/번호형 화면 재생성, 자산·라우터, CSS30파일(변수566정의/989참조·대비146쌍·자동 판단 불가64규칙), diff 공백 검사 PASS. 실제 화면의 배치·포커스·반응형·콘솔 검증과 owner-check20건 부재는 미해결 경계로 유지한다. 코드 검사 통과를 완전한 시각 통일로 표현하지 않는다.

## 후속 전환 결과 — 2026-09-10

- 원래 v27에 없던 탐색·도움말·캐러셀·페이지 이동·파일 전송·선택/단계/날짜 변형을 회사 디자인으로 보완했다. extensions는 24개 ID·37변형, recipes는 기본 패턴11종·서비스6종과 날짜2변형을 포함한 18개 ID·90변형이다. 중복 ID의 기본값은 회사 기본 변형을 유지한다.
- [기능 이식 대조표](../../architecture/company-ui-functional-migration.json)에서 기존 UI/기초/서비스72개 의미의 실제 구현 경로를 대조했다. [직전 팩 ID 기준선](../../architecture/company-ui-migration-baseline.json)의291개 ID는 모두 존속하며, 총300개 의미 ID와133개 아이콘(Lucide120+Altool13)으로 등록했다. 의미 ID와 물리적 그림 개수는 다르다.
- 이전 정부 실행 자산·호환 CSS·방향 SVG 678파일을 제품 경로에서 제거했다. 기존 MD/JSON98개는 `internal/reference/legacy/`에 옮겨 참고 전용으로 보존했다. 추적 파일은 Git, 미추적 생성물 포함 회수본은 `/tmp/altool-retired-ui.8TEllg`에서 복구할 수 있다. 임시 백업은 영구 보존 저장소가 아니다.
- 공통 디자인 원천은 `design/theme.css`·`components.css` 두 파일이다. 배포 CSS는 `internal/company/dist/`만 생성하며 확장·레시피 CSS와 모든 내장 미리보기도 같은 원천에서 갱신한다. `--krds24-*`는 제공 v27이 사용한 식별자이며 정부 실행 CSS 의존성이 아니다.
- 모든 등록 UI·아이콘은 회사 구현을 선택한다. 구형 실행 파일 재유입, `legacyOnly`, 이전 디렉터리 의존성과 경로 우회는 검사에서 거부한다. 설치·카탈로그·표준 라우터·공통 API/문서도 같은 기준으로 정리했다.
- 기존 실패 원인은 제거된 호환 SVG 원형 트랙이었다. 이를 회사 진행률 구현으로 대체했으며 대비 기준(텍스트4.5:1·비텍스트3:1)을 낮추지 않았다. 활성 v27 테마는 유지하고 승인된 비활성 텍스트 #5F6873 및 관련 별칭만 보정했다.

단일 디자인 전환 당시 로컬 QA 후보는 `altool-company-ui@2.0.0-qa.2`(의미 ID300개·잠금377파일)였다. 최신 QA3 결과는 위 후속 절에 기록했다. 실제 렌더링·키보드·파일 업로드·좁은 화면·CSS 충돌 검증은 브라우저 정책 차단 때문에 수행하지 못했다. 원문988쪽의 기존 대조 기록은 새 회사 UI의 시각 승인 증거가 아니다.

### 최종 전환 검사

| 검사 | 현재 실행 결과 |
| --- | --- |
| `.venv/bin/python -B -m unittest discover -s tests -p 'test_*.py' -q` | **183/183 PASS**, 새 설치·해시·이력·기능·구형 경로 거부 포함 |
| `node --test --test-reporter=tap tests/*.cjs tests/test_company_runtime.mjs tests/test_ui_contracts.mjs` | **131개:130 PASS·1 SKIP**(실 ESLint용 ALTOOL_LINT_PEERS 미설정), 실패0 |
| `node designs/assets/ui-kit/internal/company/extensions/runtime.test.cjs` | **23/23 PASS**, MM/YY·전송·탐색·승인·단계·페이지·이미지 대역 회귀 |
| `.venv/bin/python -B designs/assets/ui-kit/internal/company/scripts/check_release.py` | **PASS**: 60 logic/API×서울/LA, DOM계약24개, 첨부 대역, 13 API계약, 아이콘133개, 내장 CSS/JS·문서 링크. 실제 브라우저 아님 |
| `.venv/bin/python -B scripts/build_company_design.py --check` 및 extensions/recipes 빌더 `--check` | **PASS**: 디자인 출력25개·회사 번들·미리보기·등록 재현성 |
| `.venv/bin/python -B scripts/build_company_assets.py --release 2.0.0-qa.2` | 로컬 QA 후보 생성. CSS30파일·변수566정의/989참조·텍스트 대비146쌍 **PASS**. 자동 판정 불가64규칙은 실제 검증 필요 |
| `.venv/bin/python -B scripts/build_asset_catalog.py` | 회사 자산·참고 문서503항목, 구형 실행 예제 없음 |
| `altool/scripts/assets.py --root . validate` / `standards.py --root . validate` (`.venv/bin/python -B`) | **PASS**: 현재 팩 무결성·회사 단일 경로·표준 라우터 |
| `altool/scripts/check.py audit-docs --root . --format json` (`.venv/bin/python -B`) | **FAIL 유지**: Plan/Spec20건 owner check 부재. 완료 증거 소급 생성·게이트 우회 없음 |
| `git diff --check` | **PASS** |

실브라우저와 Windows 실실행은 미검증이다. 위 자동검사 통과를 전체 원샷 완료·접근성 인증·사내 배포 승인으로 확대하지 않는다.

### 번호형 검토 화면 후속

번호형 검토 화면 후속: `company-additions.html`에 추가 아이콘13개·보완 컴포넌트37변형·레시피18그룹(선택 변형90개)을 01~68로 배치했다. `node scripts/build-company-additions-showcase.mjs --check`와 `python -B -m unittest tests.test_company_showcase -q`(`.venv/bin/python`) 2/2 통과. 회사 CSS·아이콘 원문·컴포넌트 초기화 코드 재사용, 연속 번호·고유 ID·모든 preview 경로·JS 구문·생성 재현성을 확인했다. 팩2.0.0-qa.2 무결성 및 diff 공백 검사 통과. 실제 브라우저 조작·반응형 실측은 접근 정책 제한으로 미완료이며 새 팩 발행 없이 저장소 검토용 페이지만 추가했다.

## 최초 통합의 역사 기록 — 1.1.0-qa.4

다음 내용은 후속 제거 승인 이전의 실행 결과이며, 당시 실패를 보존한 기록이다. 현재 작업 지시나 현재 미구현 목록으로 사용하지 않는다.

## 승인 변경

회사 v27 외형·공통 동작·아이콘·지침을 기존 Altool 팩에 통합한다. 비활성 글자색만 사용자 추가 승인으로 #5F6873으로 보정한다. 기존 원문·사용자 전달 폴더·헌법·테스트 앱은 보존한다. 새 릴리스는 QA 팩이며 전체 원샷/브라우저 완료 선언이 아니다.

## 변경 영역

- `ui-kit/design/theme.css`·`components.css`를 제공 디자인으로 교체. 원안 대비 토큰 차이는 비활성 글자색과 이를 참조하는 입력용 별칭뿐이다. 색상·배치·치수의 활성 스타일은 원안 유지.
- `ui-kit/internal/company/`에 중립 JS API·120개 Lucide 아이콘·계약·지침·예제를 통합. `dist/`와 내장 미리보기는 제품 빌더에서 함께 생성한다. 기존 upstream·호환 변형은 보존하며 신규 기본 CSS에 legacy basic/services/upstream CSS를 중복 로드하지 않는다.
- 44개 의미 항목의 회사 기본 변형과 아이콘을 registry에 연결. 기존 171개 ID 누락 0개, 전체 291개, 잠금 497파일. 추가 120개 ID는 새 UI·아이콘·문구를 합한 순증이며 신규 아이콘 개수와 같은 개념이 아니다.
- `messages/ko.json`의 46개 메시지에서 신규 business 배포본과 기존 메시지 모듈을 함께 생성. 아이콘 기본 16px·소형14px, 기존 명시적24/32/48px 호출 호환.
- 표준·지침 라우터에 공통/입력/조회/탐색/처리/대시보드 경로를 연결. README·편집 가이드·검사 문서를 코드와 동기화했다. 원본 `company-design-v27/`은 이력으로 보존하며 설치 앱의 런타임 의존 경로가 아니다.

## 2026-09-10 실행 결과

| 검사 | 결과 |
| --- | --- |
| `.venv/bin/python -B scripts/build_company_design.py --check` | PASS: CSS 30개 출력, 회사 번들·내장 미리보기·메시지·기존 variants·16px adapter 재현성 |
| `.venv/bin/python -B scripts/build_company_assets.py --release 1.1.0-qa.4` | 정적 사전검사 PASS 후 로컬 QA 후보 생성. 전체 검증 승인과 다름 |
| CSS 사전검사 | 배포44파일, 변수2404개 정의/8649참조. 명시적 텍스트 대비298쌍 통과, 자동 판정 불가 규칙300개는 실제 검증 필요 |
| `assets.py --root . validate` / `standards.py --root . validate` | PASS: 팩 해시·파일·자산 및 표준 라우터 |
| `python -B -m unittest discover -s tests -p 'test_*.py' -q` (`.venv/bin/python`) | 179개 실행, 178 통과·1 실패. 실패는 아래 Node 진행률 대비 검사를 호출하는 동일 원인 |
| `node --test --test-reporter=tap tests/*.cjs tests/test_company_runtime.mjs tests/test_ui_contracts.mjs` | 138개: 136 통과·1 실패·1 skip(실 ESLint, ALTOOL_LINT_PEERS 미설정) |
| `python -B designs/assets/ui-kit/internal/company/scripts/check_release.py` | 60 logic/API × 서울/LA, 24 DOM 대역, 첨부 대역, 13 API 그룹, 120 SVG, 내장 코드·문서 링크 통과. 실브라우저 검사 아님 |
| 기존 의미 ID 대조 | HEAD `5162ff3`의171개 ID 모두 존속 |
| `check.py audit-docs --root . --format json` | FAIL: Plan/Spec20건 owner check 부재. 기존18건 + 이번 제품 참고2건. 완료 증거를 소급 생성하지 않음 |
| `git diff --check` | PASS |

## 미해결 대비 1건 — 추가 시각 변경 승인 필요

`tests/test_krds_components_variants.cjs:91`의 원형 진행률 트랙/흰 배경 3:1 검사는 v27의 `--krds24-gray-50: #8F97A5`에서 **2.942:1**로 실패한다. `components/runtime.css`의 `.ui-progress-track`이 이 값을 사용한다. 새 `ui-progress-bar`와 별개인 호환 SVG 트랙이지만 제공 CSS의 활성 스타일이므로 “비활성 글자색만 보정” 승인을 넘어 수정하지 않았다. 검사 자체도 완화하지 않았다. 해당 부품의 별도 대비 보정 승인 후 재검증이 필요하다.

승인한 비활성 글자색 #5F6873 / 기본 비활성 배경 #ECEFF1은 **4.896:1**이다. 텍스트 사전검사의 통과를 SVG·전체 UI 대비 통과로 확대 해석하지 않는다.

## 현재 제한

이전 턴의 로컬 file URL 열기는 브라우저 보안 정책에 차단되었으며 다른 주소/도구로 우회하지 않는다. 실제 화면 조작·렌더·폰트·320px/확대·키보드·첨부 FileList·CSS 충돌은 미검증이다. 제품 테스트는 이 제한을 대체하지 않는다. Windows 실실행·실 ESLint도 별도 환경 검증이 필요하다.
