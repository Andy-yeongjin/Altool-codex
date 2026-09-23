# 표 정렬·행 제목 공통화 검증 · 2026-09-11

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

## 변경과 계약

사용자가 대시보드 시안을 승인하여 회사 공통 기본값으로 반영했다. V27-S05를 실제 company-ui/search 자산 지침에 추가하고 CONSISTENCY, BUSINESS-USAGE, PAGE-PATTERNS와 제품 Plan/Spec을 동기화했다. 금액 오른쪽 정렬은 표에는 더 이상 적용하지 않으며 입력/차트 계약은 유지한다. 과거 CHANGELOG-LEGACY는 역사 기록이다.

공통 CSS의 runtime/enterprise 표 규칙 및 business 숫자 선택자를 수정했다. qa.13 소비 확인에서 비계층 business ui-number의 오른쪽 정렬 충돌이 드러나 표 셀에만 가운데 정렬을 적용한 qa.14를 최종 생성했다. tbody th 기본 배경은 투명, thead 배경은 유지하며 줄무늬도 th/td에 함께 적용한다. tfoot 합계·행 hover/선택 스타일은 유지한다.

백업 test3의 임시 정렬·배경 CSS를 제거하고 공통 qa.14만으로 검증했다. 소비 디자인 계약의 원천 hash와 Spec도 승인 내용으로 동기화했다. 원본 설치 템플릿 design.md의 앱별 TBD는 그대로 유지한다.

## 실제 검증

- 인앱 localhost:3000: 제목 8개와 본문 8개 모두 computed text-align center. 일반 본문 셀 배경 모두 transparent, 컬럼 제목 #F1F3F5.
- 매출 클릭: ascending → descending, 기업명 클릭: ascending. 화살표 하나 표시.
- 체크박스 선택 시 행 8개 셀 모두 rgb(229,238,248), 선택 해제 후 실제 hover 시 8개 모두 rgb(237,243,249).
- 375×812: 모든 본문 셀 가운데, document scrollWidth=viewport=375. 임시 viewport 해제. 관측 콘솔 error/warn 없음.
- 앱 타입·린트·빌드 및 단위 테스트 7개 통과(임시 CSS 제거 후 실행).
- 관련 Python 회귀 11개, 공통 CSS 변수/대비 검사, 팩/표준 validate, 생성물 check, git diff --check 통과.

## 범위 한계

전체 oneshot/과거 증거를 완료 처리하지 않았다. 줄무늬·합계 보존은 소스 회귀 범위이며 모든 소비 예제의 시각 검증을 완료한 것은 아니다. file URL로 차단된 company-additions.html에 브라우저 접근을 재시도하지 않았다. 사용자 서버와 다른 설치 프로젝트는 유지했다.
