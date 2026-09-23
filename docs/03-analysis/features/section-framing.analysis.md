# 공통 섹션 프레이밍 검증 · 2026-09-11

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

첫 콘텐츠 확대 후: office-mockups/expenses.html의 조회 폼·사용 내역 검토 상태 모두 제목과 16px 실측. 모바일 390px에서도 검토 상태 간격 16px, scrollWidth=390. 드롭다운 빈 결과 선택으로 공통 빈 상태 전환 확인. section-group 5건/data-top-border 1건 검사 통과. 다른 자체 여백 컴포넌트는 CSS 예외로 유지하며 이번 브라우저 전수 실측 대상은 아니다.

범위: section-framing.spec.md의 원본 CSS·계약 보정. 금액·detail 열 구성 및 test5 설치본은 변경하지 않음.

인앱 브라우저에서 tests/fixtures/section-framing.html을 실제 HTTP로 열어 확인했다.
- 814px: 좌우 header top=28px, height=42px 동일. 폼 시작 간격=16px, meta margin=0px. 왼쪽 제목 하단선 rgb(21,84,160), 데이터 위 오른쪽 제목 선은 투명. data-state 상단선=2px.
- 390px: 세로 전환, 모든 header height=42px, 폼 간격=16px, document scrollWidth=390px로 가로 넘침 없음.
- 보내는 부서에 재무팀 입력 후 초기화 버튼 클릭, input.value가 빈 문자열로 복원됨.
- 캡처로 단일 강조선과 제목 정렬 확인. 좁은 상세 열의 금액 줄바꿈은 사용자 제외 범위로 보존.

이 검증은 공통 프레이밍 회귀 확인이며 모든 소비 앱·Altool oneshot 완료 검증이 아니다. 긴 여러 줄 헤더의 소비 화면별 정렬 및 test5 재설치 검증은 포함하지 않는다.

## 라벨 배치 재검증

최초 fixture는 label/input을 ui-field로 묶지 않아 인라인으로 붙어 있었다. fixture를 공통 ui-field와 ui-form-actions로 수정했다. 652px·390px 인앱 실측에서 제목→폼 16px, 라벨→입력 12px이며 모바일 scrollWidth=390px다. 입력 후 초기화 클릭으로 빈 값 복원을 확인했다. 공통 CSS는 변경하지 않았다.

추가 관찰: 일반 ui-field는 flex gap 6px와 runtime label margin-bottom 6px가 합쳐져 12px다. 필터는 label margin=0으로 6px다. 간격 소유가 중복되어 있으므로 향후 공통 간격 통일 시 검토가 필요하며, 이번 검증에서 임의로 간격을 바꾸지 않았다.

## 라벨 간격 중복 수정 후 회귀

후속 사용자 승인으로 runtime ui-field를 flex gap 6px / label margin 0으로 수정했다. 위 12px 중복 관찰은 수정 전 기록이다. 고정 페이지를 텍스트 입력·native select·달력 래퍼·textarea로 확장했다.
- 인앱 652px 및 390px에서 네 라벨→컨트롤 간격 모두 6px.
- 652px 제목→폼 16px, 세 헤더 높이 42px 유지.
- 390px document scrollWidth=390px. 캡처에서 라벨/컨트롤 세로 배치와 넘침 없음 확인.
- 텍스트/사유 입력, 영업팀 선택, 달력 팝업에서 2026-09-11 선택 후 실제 입력값 확인. 초기화 후 값은 ['', '선택', '', '']로 복원.
- section-group 4건·data-top-border 1건 회귀 통과. 생성 검사와 팩 검증은 배포 시 별도 실행.

검증 범위는 이번 라벨·섹션 변경이다. 모든 공통 컴포넌트 및 새 oneshot 전수 검증을 의미하지 않는다. 금액 스타일은 변경하지 않았다.

## 그룹 인접 간격·일요일 색상

인앱 390px에서 그룹 다음 결과 상태 섹션의 간격 20px(--company-section-gap=1.25rem)를 실측했다. 2026-09-06/13은 rgb(162,36,44), 평일 09-07은 rgb(48,54,61). 09-06 실제 클릭 후 input=2026-09-06, 다시 열어 선택 색 rgb(255,255,255)와 배경 rgb(21,84,160)을 확인했다. 캡처에서 일요일 헤더·미선택 일요일 빨강과 단일 섹션 강조선을 확인했다. 비활성/선택 제외는 CSS selector 회귀로 확인했고 비활성 일요일의 실브라우저 검사는 이번 기록에 포함하지 않는다.
