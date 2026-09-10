# 회사 디자인 편집

회사 외형의 코드 수정 원본은 아래 두 파일이다. 시각 권위는 사용자 디자인 원천과 `standards/design.md`를 유지한다. 현재 기본값은 기존 UI 외형을 보존한 것이며 새로운 Altool 시안을 적용한 것은 아니다.

| 변경 요청 | 편집 위치 |
| --- | --- |
| 주조색·상태색·폰트·글자 크기·간격 척도 | theme.css의 해당 변수 |
| 버튼 모서리·테두리·배경·hover/선택/비활성 | components.css → `@output components/runtime.css`의 `.altool-ui button` 계열 |
| 공식 마크업 버튼·입력창 외형 보정 | components.css → 마지막 `@output foundations/company-custom.css`에서 `.krds-btn`/공식 선택자 스타일 |
| 입력창·표·모달·탭 | components.css의 runtime 구역에서 해당 선택자 |
| 서비스 예제의 버튼/표/폼 | components.css → patterns/services/services.css 구역 |
| 화면 배치 | components.css → foundations/layout.css 및 해당 패턴 구역 |

`@output`은 배포 단위를 구분하는 빌드 표식이다. 이름을 바꾸거나 지우지 않는다. 이 파일 전체를 앱에 직접 로드하지 않는다. 서비스별 전역 CSS가 섞이면 충돌할 수 있으므로 생성기가 필요한 배포 CSS로 나누고 registry가 선택한 의존 파일만 앱에서 사용한다. CSS의 상대 URL은 해당 @output 배포 위치 기준이다.

theme.css의 `--krds24-*` 이름은 기존 앱 호환 식별자다. 회사는 값을 바꾸되 이름을 임의로 제거하지 않는다. 정부 참고값·그림 출처는 internal에 보존한다. 시각 수정과 동작/접근성 계약 수정은 구분하며 focus·disabled·error 상태를 없애지 않는다.

## 적용·검증·발행

1. 디자인 원천과 `standards/design.md`를 먼저 맞춘다. 테마/컴포넌트 코드 값만 바꿔 두 원천을 불일치하게 만들지 않는다.
2. 두 CSS를 수정한 뒤 **회사 공통 팩 제작 원본** 루트에서 `.venv/bin/python scripts/build_company_design.py` 실행. Python/tinycss2는 제작 의존성이다. 사내 개별 소비 앱의 설치 폴더에서 팩을 임의 수정·발행하지 않는다.
3. 같은 명령의 `--check`와 대표 화면 브라우저 검증을 실행한다. 색상만 바꿔도 대비/초점/상태와 desktop/mobile을 확인한다.
4. `python3 scripts/build_company_assets.py --release {새버전}`으로 변수·명시적 대비 사전 검사를 통과한 팩을 발행한다. hash만 고쳐 통과시키지 않는다.

## CSS 외 자산

회사 로고는 [brand/](../../brand/), 상태 이미지는 [images/](../../images/), 방향 아이콘은 [icons/](../../icons/), 공통 문구는 [messages/ko.json](../../messages/ko.json)에 있다. 같은 자산을 이 폴더로 복제해 두 번째 원천을 만들지 않는다. 일반 공식 아이콘은 registry의 의미 ID로 찾는다. 교체할 때는 registry의 선택 경로를 새 회사 원본으로 연결하고 공식 upstream 바이트는 보존한다.
