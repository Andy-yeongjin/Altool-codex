# 컴포넌트 브라우저 QA 시나리오

QA8 통합 실행 결과: [QA8-VERIFICATION.md](../QA8-VERIFICATION.md). 아래는 제작자 인계 시점의 상태·시나리오를 보존한다. 이번 실제 수행 범위와 결과는 통합 보고서에서 구분한다.

## 현재 증거 상태

이 문서는 실행 시나리오와 **제한된 부모 세션 관측 결과**를 구분한다. 컴포넌트 담당자의 이번 CUA 세션은 `createBrowserTab("iab", …)`에 `Browser is not available: iab`를 반환했으며, 이어서 `getState()`도 `browsers: []`를 반환했다. 따라서 전용 탭 생성, 실제 클릭, computed style, 스크린샷은 이 담당 세션에서 **미검증**이다. 기존 부모 탭이나 viewport를 조작하지 않았고 다른 브라우저/권한 경로로 우회하지 않았다. 아래 부모 관측은 부모의 실제 브라우저 피드백이며 담당자가 직접 관측한 것으로 표시하지 않는다.

부모가 확인한 범위: `company-mixed.html`의 root 16px, 기본 공식 버튼 19px, 버튼 배경 rgb(36,107,235), 레이블 17px. `modal-approval.html`은 Escape 시 열림 유지, 진행하지 않기/계속 진행 각각 닫기 및 초점 복귀 통과. 혼합 체크박스는 role.check 도구 호출이 실패했지만 실제 Space 입력으로 전체 3/3, 실제 레이블 클릭으로 0/3 선택 전이 통과했다. 도구 호출 실패를 앱 기능 실패나 성공으로 혼동하지 않는다. 파일 전송은 진행 40%/실패·재시도 요청/완료/취소 상태 전이가 부모 브라우저에서 통과했다.

이전 canonical 연결 뒤 부모의 최종 reload에서 수직 탭 클릭/ArrowDown/Home/End, 전송 실패 제목 ‘파일을 올리지 못했어요’·본문 ‘연결과 파일을 확인한 뒤 다시 시도해 주세요.’·행동 ‘다시 시도’, 재시도 요청 대기 문구가 확인됐다. 헤더 검색/이용 안내와 푸터 개인정보/약관/문의 URL 및 대상 초점도 통과했다. 편집 중 메시지 의존성 누락 오류는 당시 기록이며 재검증에서 새 오류는 없었다. 아래 이전 표의 대기 상태는 그 이전 시점 기록이다. 이번 PDF 전수대조 후 구조 변경의 재검증은 다음 표로 별도 관리한다.

초안의 “기본 공식 버튼 17px” 기대값은 잘못됐으므로 **19px로 정정**했다. 공식 `.krds-btn`은 크기 클래스를 생략하면 large이며 `--krds-button--pc-font-size-large` → `--krds-pc-font-size-label-large` → 2024 `--krds24-label-large-size`(19/16rem)로 연결된다. medium 버튼과 일반 본문은 17px다. 크기별 역할을 유지하며 구현을 17px로 강제하지 않는다.

35개 authored UI/94개 전체 variant를 브라우저 검증 완료로 표시하지 않는다. 다음 자동 검사 결과는 UI 실측과 구분한다.

- `python3 -m unittest discover -s tests -p 'test_krds_components*.py' -q`: 17개 Python 테스트 통과(내부 Node 9개 포함).
- foundations/card 생성기, variants 생성기, company adapter 생성기 `--check`: 통과.
- 공식 소비 variant의 CSS 의존성: 모두 company-adapter 사용, raw common/output 링크 없음.
- generated company adapter: 고정 원본 hash, 선언 rem ×0.625, media/supports 조건·문자열·주석·data URL 보존, 로컬 이미지 경로·2024 변수 참조 검증 통과.
- 회사 헤더/푸터: raw 정부 조각 제외 및 실제 조각의 정부 표식 회귀 검사 통과.

## 실제 실행할 시나리오

공통 URL 접두사: `http://127.0.0.1:48765/designs/assets/ui-kit/internal/components/examples/`

| 페이지 | 실제 조작과 확인할 결과 | 상태 |
|---|---|---|
| `modal-information.html` | 열기 → dialog와 제목/설명 표시 → 닫기 → status 변경·열기 버튼 초점 복귀. 재열기 → Escape 닫기. | 미검증 |
| `modal-important.html` | 열기 → alertdialog 표시 → 확인하고 닫기. 재열기 → Escape. 닫힌 뒤 배경 다시 조작 가능. | 미검증 |
| `modal-confirmation.html` | 열기 → 진행하지 않기 → 거절 status. 재열기 → 계속 진행 → 확인 status. 실제 삭제·이동 없음. | 미검증 |
| `modal-approval.html` | 열기 → Escape를 눌러도 열린 상태 유지 → 명시적 거절로 닫기. 재열기 → 계속 진행 → 닫기/초점 복귀. | 부모 세션 관측 통과 |
| `file-transfer-states.html` | 예제 상태 조절 펼침 → 진행 중 40% → 취소 요청 대기 문구 → 실패 상태/오류 → 재시도 요청 대기 → 완료 → 취소. 서버 전송을 수행했다는 주장 없음. | 부모 상태 전이 통과. 후속 canonical 문구 연결 뒤 reload 재확인 대기 |
| `header-horizontal.html` | 정부 표식 없음, 검색/이용 안내 클릭 후 실제 fragment URL·대상 초점. 아이콘과 레이블 가로 정렬. | 미검증 |
| `header-vertical.html` | 아이콘 위/레이블 아래 정렬, 본문 건너뛰기 키보드 진입·이동, 정부 표식 없음. | 미검증 |
| `footer-company.html` | 개인정보/약관/문의 링크 → 각 실제 예제 대상 URL·초점 확인. 가짜 연락처·법률 본문 없음. | 미검증 |
| `tab-vertical.html` | 두 번째 탭 클릭 → 내용/aria-selected 갱신. Up/Down·Home/End → 활성 탭 변경, 비활성 패널 숨김. | 미검증 |
| `contextual-help-information.html`, `contextual-help-help.html` | 열기 → 해당 정보 표시·aria-expanded → 닫기 또는 Escape → 초점 복귀. 필수 안내는 밖에 유지. | 미검증 |
| `side-navigation-dropdown.html` | summary 키보드 펼침/닫힘, 링크 이동 후 URL/대상 초점. | 미검증 |
| `image-functional.html`, `image-fallback.html` | 상세 설명 링크의 대상 초점. 이미지 실제 오류를 발생시킬 수 있는 QA 환경에서 오류 시 대체 안내/복구 시 원그림 확인. 단순 DOM 선언만으로 오류 전이 통과 판정 금지. | 미검증 |
| `upstream-button.html` | 기본 버튼 클릭/키보드 focus. 기본 브라우저 설정에서 computed html 16px, body 17px, 기본 large 버튼 19px(medium은 17px), primary rgb(36,107,235) 예상값 확인. | 독립 페이지 미검증 |
| `company-mixed.html` | 공식 버튼 + authored 전체/부분 체크박스 실조작. root 16px, 기본 공식 large 버튼 19px, 본문/작성 컨트롤 17px. adapter/runtime만 로드하며 raw common/output 추가 요청 없음. | 부모 root/버튼/배경/레이블 실측, Space 3/3·실제 레이블 클릭 0/3 통과. 후속 메시지 의존성 추가 후 reload는 별도 |

각 페이지에서 새 DOM/스크린샷으로 결과를 확인하고 콘솔·요청 실패를 함께 기록한다. 모바일 반응형은 별도 검증자가 독립 viewport를 사용할 수 있을 때 확인하며, 다른 담당자와 공유하는 browser-wide viewport를 변경하지 않는다. 기대 computed 값은 브라우저 기본 글꼴 16px일 때의 값이지 이 문서에서 직접 측정한 결과가 아니다.

## PDF 전수 시각 대조 후 변경분 — 재검증 요청

`visual-review-ledger.json`의 439쪽 실제 원문 열람과 아래 브라우저 결과는 다른 증거다. 모든 경로의 기준은 `designs/assets/ui-kit/internal/components/examples/`이며 아래 행은 부모의 실측 피드백 전까지 미검증이다.

| 페이지 | 실제 조작·기대 결과 | 현재 상태 |
|---|---|---|
| `masthead-verification.html` | native summary 클릭/Enter로 확인방법 펼침·닫힘, 고정 안내문과 실제 go.kr 안내, 최초 건너뛰기 | 미검증·정부기관 한정 |
| `identifier-light.html`, `identifier-dark.html` | 푸터 마지막 strip·라이트/다크 대비·모바일 로고 슬롯 줄바꿈, 일반회사에서 선택 제한 | 미검증·정부기관 한정 |
| `footer-company.html` | 짧은 본문 하단 푸터, 연락처 슬롯·강조 개인정보, 세 링크 URL/초점 | 구조 변경 재검증 |
| `header-scroll-reveal.html` | 아래 스크롤 숨김→위 스크롤 재노출→헤더 내 focus 유지 시 숨기지 않음 | 미검증 |
| `pagination-numbered.html` | 1→5 직접 이동→끝→이전; 현재 버튼 재클릭 무변경, desktop 최대9/mobile 최대7, 전체 페이지 안내 및 페이지당3항목 유지 | 미검증 |
| `pagination-load-more.html` | 5/15→10/15→15/15; 첫 새 항목 초점과 완료 경계 | 미검증 |
| `in-page-navigation.html` | 준비사항 포인터 클릭은 링크 focus, 키보드 Enter/Space는 대상 focus; scrollspy, desktop 오른쪽/mobile 본문앞 비고정 | 미검증 |
| `modal-scrollable.html` 및 기존 4종 모달 | 긴 본문 스크롤 중 footer 버튼 계속 보임; 열기/닫기/Escape/초점 복원; approval Escape 예외 유지 | 구조 변경 재검증 |
| `table-sort.html` | 초기 기획→운영→지원; 숫자 오름3/12/24→내림24/12/3; mobile 좌우 클릭으로 실제 scrollLeft 변화·경계 비활성 | 미검증 |
| `tag-add-filter.html`, `tag-removable.html` | 조건 추가 후 적용 영역 focus, 중복 추가 없음; 3개 중 마지막/중간 삭제는 이전 태그; 전체 삭제는 빈 컨테이너 | 미검증 |
| `spinner-determinate.html` | 호스트 progress 상태40→100, 시작/종료 status, track/arc 대비는 자동계산 별도 | 미검증 |
| `file-picker-single.html`, `file-picker-multiple.html` | 실제 파일 선택→이름·확장자·바이트→삭제; 취소는 기존 선택 유지; 0바이트는 canonical file.empty, 형식/용량/개수 오류도 기존 선택 보존 | 재검증 |
| `file-image-optimize.html` | 큰 JPG/PNG 선택→로컬 변환→더 작으면 preview·다운로드, 작은 원본은 not-smaller; 잘못된 형식·빈 파일·decode 실패; 네트워크 전송 없음 | 미검증 |
| `date-input-month-year.html` | 13/27 오류→12/27 유효→한쪽 삭제 partial 오류→둘 다 비우면 초기, MM/YY 순서 유지 | 미검증 |
| `upstream-carousel_banner.html` | 자동진행→키보드/포인터 진입 정지→이탈·3초 후에도 정지→명시적 재생, 정지/재생 focus 이동, 비활성 slide inert | companion 재검증 |
| `upstream-carousel.html` | 이전/다음·점 식별자, 비활성 slide inert; 자동재생 없는 변형에 재생 버튼을 강제하지 않음 | companion 재검증 |
| `upstream-main_menu_pc.html` | 같은 깊이 화살표 첫↔끝 wrap, Home/End, 열린 메뉴 Escape 후 주트리거 focus와 backdrop 닫힘 | companion 재검증 |
| `step-adaptive.html` | 빈 다음은 분류 오류; 분류 선택→다음→메모→선택단계 건너뛰기→확인; 앞 단계 직접 이동 후 입력 유지; 로컬 완료/리셋 | 미검증 |
| `coach-action.html` | 시작→빈 제목 오류→제목 적용으로 2단계 자동 전환→이전/완료한 안내 다음→분류 선택으로 3단계→실제 미리보기 생성→마치기/재시작/그만보기 초점 | 미검증 |
| `tutorial-retained.html` | 데스크톱 도움말 기본 열림은 초점을 빼앗지 않음; 도움말 탭 키보드; 따라하기 2단계에서 접기/재열기/탭전환 진행 유지; 계속하기 본문 초점; 390px에서는 초기접힘/모달/Escape복귀/시작 시 모달 닫기 | 미검증 |

단일 슬라이드 컨트롤 숨김과 호스트 데이터 로딩·실제 파일 전송은 별도 앱 연결 시나리오다. 샘플 데이터만 있는 상태를 실제 서버 동작 통과로 계산하지 않는다.
