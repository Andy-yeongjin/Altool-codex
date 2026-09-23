# 회사 디자인 편집

## 회사 팔레트 변경 진입점

밝은 회사색은 `--company-brand-primary`(버튼 채움)와 `--company-brand-foreground`(밝은 바탕 위 글자·선택 표시), `--company-brand-focus`(포커스 선)를 구분한다. 기본값은 foreground→primary, focus→foreground 연결이므로 기존 색은 유지된다. 노란색처럼 밝은 primary를 쓸 때는 foreground/focus에 같은 계열의 어두운 색을 지정하고 실제 배경 대비를 검증한다. 헤더 반전 포커스·상태색은 별도 계약을 유지한다.

`theme.css` 상단 `COMPANY BRAND PALETTE`만 편집한다. 주요 항목은 primary/hover/active/on-primary(버튼·강조), soft/row-hover/row-selected(선택 계열), header/header-hover/on-header(헤더), menu-shadow(그림자)다. 뒤의 primary/secondary 단계 팔레트는 기존 foundation 소비 경로이며 같은 블록에서 함께 조정한다. 기존 krds24 및 company 컴포넌트 토큰은 이 블록을 참조하는 호환 별칭이다. components.css에 브랜드 HEX를 다시 넣지 않는다.

분홍 회사라면 주색뿐 아니라 hover/active·선택 배경·헤더 계열과 글자 대비를 함께 조정한다. 회사명/CI 경로는 company.json, CI 이미지 색은 원본 SVG, 상태색(오류/경고/성공/진행)과 중립색은 별도다. 팔레트 변경으로 CI나 오류색을 자동 착색하지 않는다. 변경 후 제작 빌드·배포 CSS 검사·실제 소비 화면 검증을 거쳐 공통 팩을 발행한다. fixtures/company-palette.html은 격리된 전파 테스트이며 기본 배포 디자인이 아니다.

회사 외형의 코드 수정 원본은 **theme.css와 components.css 두 파일**이다. 기본 회사 디자인은 사용자 제공 **company-design-v27**을 채택했다. 시각 권위는 사용자 디자인 원천과 `standards/design.md`를 유지한다. 제공 요소의 비활성 글자색은 사용자 승인으로 #5F6873으로 보정했고, 누락 기능은 같은 v27 규격의 회사 컴포넌트·업무 조합으로 보완했다. 이전 정부 실행 자산은 제거했으며 혼용·자동 대체 경로가 없다.

| 변경 요청 | 편집 위치 |
| --- | --- |
| 회사명·CI 경로·부서/내선/운영시간·안내/문의 URL | company.json (CI 경로는 designs/assets/ 기준, brand/ 내부 SVG) |
| 헤더 CI 크기·본문 사이드바 토글·푸터 | components.css의 site-navigation 구역, PAGE-PATTERNS 공통 골격 |
| 회사 브랜드 주색·hover·active·헤더·선택·강조·그림자 | theme.css 맨 위 `COMPANY BRAND PALETTE` 블록의 `--company-brand-*` |
| 오류·경고·성공·진행 상태색·폰트·글자 크기·간격 척도 | theme.css의 상태/타이포/간격 변수 (브랜드 색과 독립) |
| 버튼 모서리·테두리·배경·hover/선택/비활성 | theme.css의 `--company-button-*`, components.css의 runtime/enterprise 구역 |
| 입력창·표·모달·탭 | theme.css의 `--company-*`, components.css의 runtime/enterprise 및 forms/dialogs/navigation 해당 구역 |
| 보완 컴포넌트·세로 탭·하위 탐색 | components.css → `@output components/extensions.css` 구역 |
| 로그인·검색·신청 등 업무 조합 | components.css → `@output components/recipes.css` 구역 |
| 화면 배치 | components.css → foundations/layout.css 및 page-frame 구역 |

`@output`은 배포 단위를 구분하는 빌드 표식이다. 이름을 바꾸거나 지우지 않는다. 두 제작 CSS를 앱에 직접 로드하지 않는다. 출력은 모두 `internal/company/dist/` 안에 생성되며 `company.css`가 회사 UI의 CSS 진입점이다. registry가 지정한 의존 파일만 사용한다. CSS 상대 URL은 해당 @output의 dist 내 배포 위치 기준이다. 이전 company-custom·guided·patterns 출력은 더 이상 만들지 않는다.

theme.css의 `--krds24-*` 이름은 제공 v27도 사용한 토큰 식별자다. 값을 바꾸되 참조 관계를 확인하지 않고 이름을 제거하지 않는다. 이 이름이 정부 CSS 사용이나 호환 fallback을 뜻하지는 않는다. KRDS 원문·추출 자료는 제거했으며 제작 출처·라이선스는 `internal/ATTRIBUTION.md`에 남는다. 시각 수정과 동작/접근성 계약 수정은 구분하며 focus·disabled·error 상태를 없애지 않는다.

## 적용·검증·발행

1. 디자인 원천과 `standards/design.md`를 먼저 맞춘다. 테마/컴포넌트 코드 값만 바꿔 두 원천을 불일치하게 만들지 않는다.
2. 두 CSS를 수정한 뒤 **회사 공통 팩 제작 원본** 루트에서 `.venv/bin/python scripts/build_company_design.py` 실행. Python/tinycss2는 제작 의존성이다. 사내 개별 소비 앱의 설치 폴더에서 팩을 임의 수정·발행하지 않는다.
3. 같은 명령의 `--check`와 대표 화면 브라우저 검증을 실행한다. 색상만 바꿔도 대비/초점/상태와 desktop/mobile을 확인한다.
4. `.venv/bin/python scripts/build_company_assets.py --release {새버전}`으로 변수·명시적 대비 사전 검사를 통과한 팩을 발행한다. hash만 고쳐 통과시키지 않는다.

## v27 기본 선택과 새 공통 요소

신규 화면은 registry의 `foundation.company-ui`와 각 요소의 회사 기본 변형을 사용한다. 생성된 `internal/company/dist/company.css` 한 벌을 로드하고, 선택된 요소의 business/select·extensions·recipes JS와 아이콘을 연결한다. `internal/company/GUIDE.md`, `components.json`, `extensions/README.md`, `recipes/README.md`가 요소별 진입점이다. 구형 실행 변형은 남겨 두지 않으며 보존된 의미 ID도 회사 구현으로만 해석한다.

공통 동작의 원본은 `internal/company/js/`, `extensions/`, `recipes/`, 아이콘의 원본은 `internal/company/icons/`, 배치·API 안내는 `internal/company/docs/`다. 그 안의 CSS와 `dist/`·내장 미리보기 스타일도 두 디자인 원본에서 생성되므로 별도 디자인 원천으로 편집하지 않는다. 사용자 전달 폴더 company-design-v27을 다시 편집 원본으로 병행 사용하지 않는다.

## CSS 외 자산

회사 로고는 [brand/](../../brand/), 상태 이미지는 [images/](../../images/), 공통 문구는 [messages/ko.json](../../messages/ko.json)에 있다. 일반·방향 아이콘 모두 registry의 의미 ID를 통해 [회사 아이콘](../internal/company/icons/AI-USAGE.md)을 사용한다. 현재 133개는 Lucide 120개와 Altool 자체 제작 13개이며 서로의 출처·라이선스를 구분한다. 별도 정부·구형 방향 SVG를 선택하지 않는다. 같은 자산을 디자인 폴더에 복제해 두 번째 원천을 만들지 않는다.
