# Altool 기본 디자인 자산

Altool은 한 회사 안에 설치하는 바이브코딩 도구입니다. **Altool 기본 디자인 → 도입 회사의 디자인에 맞춘 공통 자산 조정·검증 → 사내 배포 → 모든 프로젝트에서 재사용** 순서로 운영합니다. 회사 외형 편집은 [ui-kit/design/](ui-kit/design/README.md)에서 시작하고 구현·생성물·참고 자료는 `ui-kit/internal/`에 둡니다. KRDS는 참고 출처이지 제품 이름이나 회사별로 선택하는 별도 테마가 아닙니다.

원본 자산은 이 폴더, 필수 재사용 기준은 `standards/design.md#assets`가 소유합니다. 같은 회사의 앱은 같은 의미 ID와 같은 팩 버전을 사용합니다. `index.html`은 로컬 HTTP 서버에서 여는 탐색기입니다. 예: 프로젝트 루트에서 `python3 -m http.server 48765 --bind 127.0.0.1`, `/designs/assets/`로 접속합니다. 이미 서버가 있으면 재사용하세요.

| 위치 | 용도 |
| --- | --- |
| registry.json / pack.lock.json | 채택된 의미 ID·기본/허용 변형과 배포 버전·무결성 고정 |
| guidance/ | 자산별 회사 배치·사용·동작 지침과 참고 MD 연결. 자산과 함께 버전 고정 |
| runtime/assets.mjs | 아이콘·문구를 의미 ID로 읽는 공통 프런트 런타임 |
| icons/directions/ | 원본 꺾쇠에서 파생한 좌·우·위·아래 고정 방향 SVG. icon.chevron-*로 선택 |
| brand/ | 직접 제작한 Altool 샘플 CI. 프로젝트 CI로 강제하지 않음 |
| images/ | 직접 제작한 빈 화면·검색·오류 등 상태 SVG |
| messages/ko.json | 재사용할 한국어 오류·완료·확인·도움 문구 |
| ui-kit/design/ | 회사 외형 코드 편집: theme.css(색상·폰트·간격), components.css(요소별 외형·상태·배치) |
| ui-kit/internal/upstream/ | 고정 버전 공식 HTML/CSS/JS, SVG 92개(아이콘91·파비콘1), 폰트·토큰 |
| ui-kit/internal/foundations/ | Altool 기본 스타일·토큰·어댑터, 컨테이너/유동형 × 사이드 메뉴 유무 배치 골격 및 출처 대조 자료 |
| ui-kit/internal/components/ | 공통 컴포넌트·상태·변형, 재사용 코드와 검증 기록 |
| ui-kit/internal/patterns/ | 기본 패턴 11종·서비스 흐름 5개군의 실행 예제·계약·잔여 검증 |
| ui-kit/internal/reference/ | 제공 PDF 전 범위의 페이지별 원문 텍스트. 그림은 원본 PDF 참조 |
| ui-kit/internal/coverage.json | 목차/페이지와 구현·검증 상태 연결 |
| ui-kit/internal/source-review.json | 원문988쪽 실제 시각 열람의 페이지별 담당 장부 연결·해시. 소비 앱 전체 준수 인증과 구분 |
| ui-kit/internal/COMPANY-VERIFICATION.md | 최신 자동·실제 브라우저 검증 결과와 잔여 범위 |
| catalog.json | 사용 가능한 파일 위치와 유형. 정책 라우터가 아님 |

공식 키트의 2024 PDF 대비 추가 컴포넌트도 별도 보충 자산으로 보존합니다. 출처와 부속 라이선스는 `ui-kit/internal/ATTRIBUTION.md`를 따르세요. 기본 번들 존재만으로 사용자 디자인 입력이나 디자인 계약 완료로 판단하지 않습니다.

AI는 registry에서 해당 의미를 먼저 찾아 지정된 자산을 사용하고 사용 ID·원본/배포 경로·허용 변형·사용 조건을 디자인 표준에 연결합니다. 참고 예제를 임의 채택해 기본 자산을 바꾸지 않습니다. 아이콘 버튼에는 의미 있는 이름을 주고, 장식 이미지에는 빈 alt를 사용합니다. 문구는 공통 런타임으로 읽고 textContent로 삽입하며 동적 값·민감정보를 그대로 노출하지 않습니다. 작업 결과를 확인하기 전 성공 문구를 표시하거나 재시도가 안전하지 않은 쓰기를 자동 반복하지 않습니다.

회사 팩 운영·사용 증거 예시는 [COMMON-ASSETS.md](COMMON-ASSETS.md)를 따릅니다. 회사 CI는 샘플 로고와 구분하여 공통 릴리스에서 지정합니다. 팩의 존재만으로 프로젝트별 화면·브랜드 계약이 완성되지는 않습니다.

회사 팩 제작 원본의 루트에서 `scripts/build_company_design.py`로 편집 CSS를 배포 CSS와 어댑터로 생성하고, `scripts/build_direction_icons.py` 실행 후 `scripts/build_company_assets.py --release 새버전`을 실행합니다. 제작 명령은 Python 환경에서 실행하며 세부 절차는 [편집 안내](ui-kit/design/README.md)를 따릅니다. 릴리스 작성 전 원본/생성물 일치와 실제 고정 배포 CSS 전부의 변수·명시적 대비를 검사하며 실패하면 registry/lock을 발행하지 않습니다. 소비 앱은 별도로 UI-03과 `standards/tooling/README.md#ui`의 실제 측정 검증을 수행합니다. 정적 배포 통과는 모든 화면·테마의 접근성 인증이 아닙니다.
