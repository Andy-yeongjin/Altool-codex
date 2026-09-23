# 공통 기본 자산 Spec

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: 원문 전수 열람·식별 자산 제작 완료 / 대표 QA 통과 — QA8의 의미 ID167개·허용 변형320개를 제공한다. PDF988쪽 실제 열람과 전체 Python128개/Node123개·대표 실제 브라우저 검증을 마쳤다. 정식 배포 승격이나 모든 변형·적용 환경의 전수 인증은 아니다. 구현 목록은 각 `variants-manifest.json`, 원문 연결은 coverage 및 mapping/contracts, 최신 실제 관측·회사별 적용 경계는 `designs/assets/ui-kit/internal/QA8-VERIFICATION.md`, 파일 해시는 `QA8-OBSERVATIONS.json`에 기록한다. 이전 검증 문서는 당시 관측을 보존한다.

## 추가 구현 계약: 의미 자산 재사용

- `designs/assets/registry.json`: version/pack/release/items. 각 item은 id(kind prefix 포함), kind, meaning, defaultVariant, variants(variant→path/dependencies/states), constraints. 기본 ID는 별도 스펙과 무관하게 안정적으로 유지한다. 같은 뜻의 별칭은 동일 ID로 찾으며 별도 그림으로 만들지 않는다.
- `designs/assets/pack.lock.json`: 배포 registry 및 채택 파일의 SHA256. 검증 명령은 이 파일을 쓰지 않는다. 새로운 정식 배포를 만드는 제작 명령만 명시적으로 갱신한다. 로컬 파일 소유자를 막는 보안 장치가 아니라 의도치 않은 변경 탐지다.
- `designs/assets/releases.json`: 제작 원본의 release별 lock SHA256 이력. 제작 명령은 현재 lock과 이력을 대조하고, 중간에 다른 버전을 만들었더라도 과거 버전의 다른 내용 재발행을 거부한다. 검증 명령은 이력을 쓰지 않으며, 제작 원본에서 이력을 보존한다.
- `altool/scripts/assets.py`: validate/find/resolve/evidence 명령. resolve는 ID와 허용 variant만 받으며 기본 variant를 결정론적으로 반환한다. registry 및 lock 불일치는 실패한다. 일반 참고 catalog 항목은 자동 채택되지 않는다. CLI·Step Check의 단계명은 앞뒤 공백·대소문자를 정규화한다.
- `.altool/asset-usage/{feature}.json`: pack/release/lock hash, 변경 UI 파일, 각 사용의 semantic ID/variant/소비 파일/연결 문자열, 기능 전용 항목의 범위와 이유. 선언된 복사 배포는 선택 자산·의존 파일과 hash 대조한다. `assets.py evidence` 결과에는 사용 선언 파일 hash와 각 소비 파일의 SHA256(`consumers`)이 포함된다. UI 구현/검증 Step Check는 그 결과를 연결하며 주석을 제외한 인용 참조와 현재 소비 파일 hash를 다시 검사한다. 구현 변경 후에는 기존 증거를 재사용하지 않고 실제 검증 후 재생성한다. 문자열 참조 검사만으로 실행 여부·모든 의미 준수를 보증하지 않는다.
- 프런트 런타임은 JSON의 문구를 ID로 읽고 아이콘을 지정된 파일에서 가져온다. 크기·접근성 이름 등 허용 매개변수만 바꾸며 실제 서버 액션은 소비자가 연결한다. DOM은 textContent와 안전한 속성을 사용한다.
- 통일성 검증 시 두 앱이 icon.settings와 message.error.network를 요청하면 같은 자산/문구를 받는 테스트, 미등록 변형/원본 교체/누락 사용 증거의 실패 테스트를 포함한다.
- 설치는 소스 팩과 기존 대상 팩의 무결성을 자산 복사 전에 확인한다. 기존 정상 팩이면 양쪽 lock의 핀 고정 파일 및 대상 lock을 자동 교체·혼합하지 않고 대상 릴리스를 보존한다. 대상 팩이 없는데 소스의 핀 고정 경로에 다른 내용의 파일이 있으면 자산 배치 전에 실패한다. 새 버전 도입은 별도 명시적 공통 배포·소비 프로젝트 재검증으로 수행한다. 기존 사용자 CI/디자인 원본은 보존한다.

## 파일 계약

- Altool 기본 UI의 제품 경로는 `designs/assets/ui-kit/internal/`이다. `foundations/`, `components/`, `patterns/`는 제공 디자인의 구현이며 `reference/`, `upstream/`, `ATTRIBUTION.md`는 원문·외부 원본·출처 추적이다. 회사 도입 시 제공된 디자인에 맞춰 공통 팩 제작 원본을 조정한 뒤 배포한다. 회사별 폴더나 프로젝트별 독립 디자인 팩을 선택하는 흐름으로 만들지 않는다. 기존 설치본은 자동 이동하지 않으며 경로 변경 릴리스로 명시적으로 업그레이드한다.

- `designs/assets/brand/`: Altool 샘플 심볼·워드마크·반전 워드마크. 로고는 확정된 고객 CI가 아니며 교체 가능하다.
- `ui-kit/internal/upstream/resources/img/component/`: 공식 키트 SVG 92개(아이콘91 + 파비콘1), 원본 크기·색상·변형을 보존. 2024 PDF p.102의 24px/1.6px 규격은 별도 foundation 계약이며 후대 원본을 강제 변환하지 않는다. `images/`: 240×160 상태 일러스트, 텍스트는 별도 제공.
- `messages/ko.json`: version, locale, labels 및 ID별 title/body/action/severity. 개발자가 아닌 사용자가 이해할 수 있는 상황·후속 행동. 재시도/삭제/로그인 등의 라벨이 실제 동작을 구현하는 것은 아니다.
- `catalog.json`: version, assets의 id/category/name/path/source 및 선택적 preview/restrictedIdentity/pages/group/implementation/verification. 파일 위치·출처·검증 수준을 색인하며 사용 원칙을 복제하지 않는다.
- `index.html` + `preview.js` + `preview.css`: registry/lock 기반 회사 표준을 기본 표시하고 catalog/원문 기반 비채택 참고 자료로 전환할 수 있는 로컬 HTTP 미리보기. 회사 표준은 ID·기본/허용 변형을 표시하고 ID를 복사한다. 참고 자료의 경로·문구 복사는 채택 승인이 아니다. 임의 업로드 SVG를 inline 실행하지 않고 img로 표시하며 JSON 문구는 textContent로 렌더링한다. 외부 폰트·CDN·서버 업로드 없음.
- 설치 시 standards와 비고정 자산은 누락 파일만 추가하되, 회사 팩에는 위 사전 검증·릴리스 보존 계약을 우선한다. 기존 자산/카탈로그/디자인 계약은 보존하고 사용자 JSON을 자동 병합하지 않는다. 참고 카탈로그 변경과 회사 registry/lock 재발행은 별도 작업이며 카탈로그를 편집해 자산을 자동 채택하지 않는다.

## 표준 적용

| 원문 | 적용 | 검증 |
| --- | --- | --- |
| design.md sources/components | 공통 자산 절을 추가하고 ID·출처·배포 경로를 연결 | 카탈로그·SVG·설치 회귀 |
| design.md responsive/media | 단순 SVG 상태 표현, 고정 비율, 명확한 텍스트 병행 | 390/1280px 실제 조작 |
| altool/standards.md | 번들 기본 자산을 사용자 디자인 지시로 오인하지 않음 | 연결·TBD 유지 테스트 |

## 카탈로그 시각 계약

흰 배경 #ffffff, 본문 #17212f, 보조 #526174, 면 #f4f6f8, 경계 #d7dfe7, 주요색 #1859b7. 단정한 자산 작업대: 좌상단 브랜드, 큰 제목, 카테고리 버튼, 검색, 균등 그리드. 시스템 폰트, 최소 44px 조작 영역, visible focus. 600px 이하 단일 상태 카드·2열 아이콘. 알림은 role=status, 오류는 role=alert. 기본 CI는 조립 가능한 세 획의 A 모티프, 파랑과 잉크색. 상태 이미지는 같은 선·면·여백 계열이며 색만으로 의미를 구분하지 않는다.

## 검증 계획

마무리 대조의 완료 근거는 PDF 페이지별 실제 렌더 검토 기록, 발견→구현/회사 지침/조건부 제외 연결, 의미 ID/variant별 실행 시나리오와 결과다. 회사 적용 지침은 `guidance/`와 registry 라우팅으로 제공하고 참고 원문에만 남아 에이전트가 놓치는 필수 배치/동작을 점검한다. 정적 규칙/상태 테스트와 실제 브라우저 관찰을 구분한다. 원본 PDF는 보존하고 고객 데이터·실제 인증/API·법적 문구는 만들어내지 않는다. 최종 팩 릴리스는 담당자 수정·통합 테스트 후 루트가 한 번 발행한다.

XML 파싱·중복 ID·외부 자원/스크립트 부재·카탈로그 전체 경로·메시지 스키마·새 설치/재설치 보존·중첩 경로와 JS 구문을 검사한다. 카테고리 전환·검색 및 결과 없음·검색 초기화·클립보드 복사·메시지 예시를 실제 조작한다. 데이터 로딩 실패는 잘못된 테스트 URL 또는 로컬 테스트 환경에서 확인하고 제품 파일을 손상시키지 않는다.

회사 팩 확장 검증에는 회사 표준/참고 전환, ID 복사, 두 소비자의 동일 의미 자산 선택, 단계 정규화, 주석만의 참조 거부, 소비 파일 변경 시 증거 거부, 과거 릴리스 재발행 거부, prototype 이름을 포함한 미등록 변형 거부를 포함한다. 게이트 결함 H-1~H-4의 독립 재검수 승인은 `reviews/company-assets-review.md`에 보존한다. 그 승인은 게이트 4건의 범위이며 전체 UI 상태·접근성·모바일 검증 완료를 의미하지 않는다.

## 2024.02 PDF 전체 매핑

- PDF 원본 SHA256/988페이지를 기준으로 모든 페이지를 목차 항목 또는 앞뒤 부속 페이지에 배정한다. PDF의 목차 텍스트와 outline을 교차 대조한다.
- `designs/assets/ui-kit/internal/coverage.json`은 항목별 페이지·참고 원문·구현 파일·검증 수준·누락/차이를 관리한다. 정책 원문은 기존 디자인 표준에서 필요한 항목만 찾아 읽도록 연결하며 988쪽을 상시 지시로 로드하지 않는다.
- `reference/`는 원문 추출 참고자료이지 그 자체가 구현 완료의 증거가 아니다. 반례 이미지와 예시 서비스의 브랜드/개인정보는 UI 기본 자산으로 승격하지 않는다.
- 공식 HTML/CSS/JS/SVG/폰트는 별도 upstream 디렉터리에 버전 고정·출처·hash 목록과 함께 보존한다. 실서비스 로그인·신청 API/권한/법적 동의 계약은 프런트 자산으로 대체하지 않는다.
- 기본 원칙·활용 안내·용어집은 규칙/참고 자산, 스타일은 토큰/스케일, 컴포넌트는 재사용 코드, 기본 패턴은 조합 예제, 서비스 패턴은 단계별 화면/전이 계약으로 분류한다.
- 확장 구현으로 목록→상세→복귀 상태 복원, 로컬 미디어·고급 검색·다건 선택/내역·정기 간행물 등의 재사용 UI 대안을 추가했다. 초기 VERIFICATION의 미구현 대안 목록을 현재 상태로 재사용하지 않는다. 제공 변형·상태·의존 파일은 manifest, 남은 실데이터·백엔드·권한·법적 내용 및 검증 범위는 현재 mapping/contracts와 최신 검증 기록으로 구분한다.
