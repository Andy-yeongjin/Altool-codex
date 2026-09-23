# 회사 디자인 편집 구조

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: Implemented / Verified — docs/03-analysis/features/ui-kit-design-entry.analysis.md

ui-kit 루트는 README.md, design/, internal/로 구분한다. design/theme.css가 회사 토큰 코드 원본, design/components.css가 작성 CSS 원본이다. 시각 권위는 기존 사용자 원천과 standards/design.md를 유지한다. components.css는 배포 단위별 명시된 섹션으로 나누어 생성기가 기존 CSS 파일로 분리한다. 서로 전역 선택자가 다른 서비스 예제를 하나의 전역 스타일시트로 합쳐 로드하지 않는다. 공식 어댑터 추가 외형은 components.css의 마지막 company-custom 구역에서 관리하고 파생 어댑터에 포함한다.

internal 아래 상대 폴더 구조는 보존한다. 프로젝트 기준 ui-kit 경로와 bundle 밖을 가리키는 상대 참조를 갱신한다. 기존 위치의 CSS는 자동 생성물로 취급하며 회사 수정 원본으로 안내하지 않는다. 원본 upstream의 바이트·자산 의미 ID는 유지하고 배포 경로 변경은 새 회사 팩 릴리스로 발행한다.

이번 변경은 편집 구조 리팩터링이다. 새로운 시각 스타일이나 회사 CI는 제작하지 않는다. 대표 버튼/입력/표/모달의 기본 외형과 기능을 전후 확인하고 테마 변경이 실제 생성 CSS로 전파되는 실패 주입 회귀를 추가한다. 현재 altool-test 앱은 별도 업데이트하지 않는다.
