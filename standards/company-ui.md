# 회사 UI 선택

<a id="common"></a>
## 공통 기준

- COMPANY-01: 회사 UI는 foundation.company-ui와 registry의 회사 기본 변형을 사용한다. 선택 자산의 guidance를 읽고 `designs/assets/ui-kit/internal/company/GUIDE.md`와 해당 등록 원본/API 계약을 확인한다. 추가 컴포넌트·서비스는 선택 항목이 연결한 extensions/recipes 원본을 읽는다. 같은 의미를 이전 원문 UI나 새 SVG/문구로 임의 대체하지 않는다. 정부 지침은 참고 문서이며 실행 자산 fallback이 아니다. 제공되지 않은 재사용 UI는 v27 디자인 계약에 맞춰 공통 자산에 한 번 추가하고 등록·검증한다.
- COMPANY-02: 회사 UI의 공통 외형·상태·행동 계약과 페이지별 업무 데이터/권한/저장 책임을 분리한다. 사용자 디자인의 화면 구조 권위와 실제 검증 게이트는 유지한다. 회사 v27 적용이 기능별 standards/design.md의 TBD를 자동 완료시키지는 않는다.
- COMPANY-03: 회사명·CI 경로·공통 문의 정보는 designs/assets/ui-kit/design/company.json을 단일 원천으로 사용한다. CompanyBusiness.companyFrame과 V27-N01/PAGE-PATTERNS의 헤더·탐색·푸터 골격을 재사용하며 파일명에서 회사명을 추론하거나 페이지별로 다른 회사 정보를 작성하지 않는다. 업무 시스템 이름과 실제 안내 기능은 앱 소유다.
- COMPANY-04: 브랜드 팔레트는 ui-kit/design/theme.css 상단 COMPANY BRAND PALETTE 블록이 소유한다. 컴포넌트는 --company-brand-* 및 연결된 역할 토큰을 사용하며 기본 파란색 HEX를 재작성하지 않는다. 상태색·중립색·CI는 별도이며 팔레트 교체 시 대비와 대표 상태를 재검증한다.

<a id="form"></a>
## 입력·첨부 선택

- COMPANY-F01: 입력·달력·코드 검색·다중 선택·첨부는 등록된 회사 컴포넌트와 docs/BUSINESS-USAGE.md의 API로 연결한다. 값/폼/초기화/오류/비활성·실제 파일 상태까지 확인한다.

<a id="search"></a>
## 조회·목록 선택

- COMPANY-S01: 가로 조회조건은 pattern.filter의 회사 변형과 filter-bar-preview.html을 사용한다. 조회 전용 표시 표는 component.table을 사용하고, 정렬·행 선택·일괄 작업 중 하나 이상을 제공하는 표는 component.table-tools를 사용한다. 초기값·적용 조건·선택 범위·응답 역전을 실제 적용 범위에 맞게 검증한다.

<a id="navigation"></a>
## 탐색 선택

- COMPANY-N01: 탐색·모달·드로어·조직 목록은 회사 마크업/API를 선택하고 키보드·포커스·숨김/선택 상태를 실제 확인한다.

<a id="transaction"></a>
## 저장·이력 선택

- COMPANY-T01: 저장 안내와 처리 이력은 공통 자산을 사용하되 상태 전이·승인 권한·실제 저장은 기능 계약에서 정의한다.

<a id="dashboard"></a>
## 요약·차트 선택

- COMPANY-D01: 요약·차트는 component.metric/bar-chart와 회사 화면 조합 지침을 사용한다. 모든 차트가 가로 막대여야 한다는 뜻은 아니며 제공 범위를 벗어난 차트는 공통 추가/기능 전용 판단을 기록한다.
