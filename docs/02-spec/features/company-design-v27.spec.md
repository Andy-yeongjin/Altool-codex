# 회사 디자인 v27 통합 계약

## 2026-09-11 표 제목 계약
`component.table` resolve/read가 V27-S04를 반환해야 한다. 공통 tables-preview는 table 밖 제목/설명과 고유 ID 연결을 제공한다. 소비 앱에서는 기존 섹션/모달 제목과 summary를 재사용하고 caption을 sr-only로 남긴다. 연도 변경 시 보이는 설명도 변경한다. 일반/375px 화면에서 제목 비중복·설명 보존·caption 숨김을 확인하고 정렬/페이지/비교 동작을 회귀 확인한다.

## 2026-09-11 Skip Link 계약
`component.skip-link`의 기본 변형은 `focus-only`다. 일반 상태는 시각적으로 숨기되 Tab 탐색 대상이고, 첫 Tab에서 화면 상단에 표시된다. 표시 전후 헤더 y값은 같아야 한다. Enter 후 실제 main이 activeElement이며 링크는 다시 숨겨진다. 공개 visible 변형은 명시 선택에만 유지한다. 제품 CSS/registry/지침과 백업 test3 사용을 갱신하고 desktop/mobile에서 재현한다. internal-stack 후보는 데이터/서버 변경 없는 CSS·등록 기본값 수정이므로 비적용이다.

> 문서 분류: [검증 상태 색인](../../verification-status.md).

상태: v27 단일 실행 자산으로 전환. 구형 원형 진행률은 회사 진행률로 대체했고, 실브라우저 미검증으로 최종 승인 보류. [실행 결과](../../03-analysis/features/company-design-v27.analysis.md).

## 최초 계약 기록 (아래 후속 계약으로 대체)

| 대상 | 구현 계약 |
| --- | --- |
| 디자인 원본 | designs/assets/ui-kit/design/theme.css·components.css; 기존 변수 이름 유지 |
| 회사 공통 구현 | ui-kit/internal/company/js·icons·examples·docs; dist는 생성물 |
| 기존 배포 CSS | internal의 기존 경로를 유지하고 확장된 @output을 생성 |
| 신규 화면 진입 | foundation.company-ui와 v27 회사 기본 변형. company.css 한 벌 + 필요한 JS·아이콘만 로드 |
| 의미/문구 | 기존 registry ID를 우선 재사용. 메시지는 messages/ko.json; 생성 JS는 정본이 아님 |
| 라우팅 | 회사 common/form/search/navigation/transaction/dashboard별 원문·자산 연결 |
| 참고 원본 | internal/upstream 및 기존 원문은 불변. company-design-v27은 사용자 전달 이력으로 보존하며 런타임 의존하지 않음 |

## 표준 적용

ENG-06/APP-06: 환경·DB·인증 없는 프레임워크 중립 공통 동작, 업무 adapter는 소비 앱 담당. APP-01: 제공 API CompanyBusiness/CompanySelect와 외부 CSS 식별자 보존. UI-01~06: 과업별 선택, 상태/실측 계약 유지. 회사 형상은 4px 컨트롤, standard 34px·compact 30px·comfortable 42px 및 터치 예외, #1554A0 주조색, 원문 stroke 1.5 아이콘을 채택한다. 아이콘 사용 자체는 선택이지만 같은 의미는 같은 자산으로 연결한다.

## 회귀·완료 조건

- 기존 모든 의미 ID 존속, 새 기본 path/dependencies가 v27을 가리키며 구버전 variant는 호환 선택임을 명시.
- 29개 CSS 출력·토큰·company.css·JS·아이콘·내장 미리보기 재현성. 입력 변경 시 --check 실패.
- 모든 등록 자산의 파일·지침·잠금 검증 및 새 팩 버전 이력 보존. 설치 후 원본 v27 폴더 없이 동작 자산 탐색 가능.
- 기존 Python/Node 회귀 및 제공 60 logic(두 TZ)/24 DOM/첨부/120아이콘 검사. 새 통합 메시지·라우팅·기본 선택 회귀 추가.
- 브라우저: 버튼/드롭다운/달력/모달/표/저장피드백/첨부/좁은 화면·키보드·콘솔·회사 CSS 충돌을 실제 조작·관찰해야 완료. 이번 환경에서 실행 불가하면 미완료를 명시.

## 후속 계약: 회사 단일 디자인

위의 이전 호환 보존 계약은 사용자 후속 승인으로 다음과 같이 대체한다.

- 실제 UI와 UI 지침은 분리한다. 참고 MD·검토 JSON은 실행·미리보기로 선택하지 않으며 정부 HTML/CSS/JS/SVG/폰트와 원형 진행률 등 구형 시각 구현은 제거한다.
- v27 배포는 `internal/company/dist/company.css`, `extensions/`, `recipes/`를 사용한다. 기존 CSS @output 중 basic/services/company-custom 구역은 제거하고 새 레시피·확장 외형을 design/components.css로 합친다. 동일 CSS의 internal/components/foundations 미러와 adapter는 폐기한다.
- 기존 component/pattern/service 기능·상태 변형을 대응표와 테스트로 추적한다. 접근성·데이터 보존·미디어/첨부·이력 기능을 파일 삭제에 묻어 누락하지 않는다. 정부 식별자는 회사 정보 식별 요소로 교체하고 정부 서비스 표시를 생성하지 않는다.
- 구형 아이콘 의미 ID는 승인된 v27 Lucide120개 및 같은 스타일의 Altool 추가13개에 매핑한다. 중복 의미는 동일 원본을 사용한다. 회사 CI·상태 이미지·메시지는 정부 원본이 아니므로 기존 공통 자산 경로에 유지한다.
- 등록·카탈로그·잠금·설치 파일 전체에서 금지된 정부 실행 경로를 거부한다. 파일이 디스크에 남아 재선택되는 상태도 실패다. 이전 설치본 자동 변경·운영 앱 호환 작업은 범위 밖이다.
- QA 검사는 기능 이식·재현 빌드·의미 ID/허용 변형·단일 스타일·새 설치·구형 경로 부정 사례를 포함한다. 폐기된 시각 구현의 테스트는 새 구현의 동등 동작·대비 검사로 교체하며 품질 기준을 낮추지 않는다.

## 번호형 검토 화면 계약

후속 원문 제거 계약: designs/assets/ui-kit/internal/reference/, guides의2024.02정부UIUX PDF, 원문 전용 coverage/source-review 및 재생성 도구는 배포/저장소에서 제거한다. 회사 적용 guidance와 의미 ID·실행 파일·출처/라이선스는 유지한다. guidance.map/registry.references는 삭제 자료를 요구하지 않으며 카탈로그는 회사 자산만 색인한다. 설치 후 원문 없이 assets.load/resolve와 카탈로그 로딩이 가능해야 한다. 기존 원문 추출·원문 전수대조 테스트는 적용 대상 소멸로 제거하되 회사UI·업무행동 회귀는 유지한다.

후속38·42번 계약: 체크박스 전체 선택 행과 개별 항목 영역을 분리하고 label은 flex·gap8px, 개별 항목은 한 열로 배치한다. 42번은 data-image-attachment 영역에 CompanyBusiness.attachments({multiple:false,accumulate:false,drop:true,validate})를 초기화한다. JPEG/PNG/WebP 및 빈 파일/단일 선택 검증, 파일 제거/reset 시 미리보기·다운로드·상태/버튼 정리, 오래된 변환 무시·중복 클릭 차단·disabled·destroy 정리를 수행한다. 원본 FileList와 변환 결과는 분리하고 실제 업로드를 추가하지 않는다.

후속32번 계약: ui-section-header/ui-section-title의 ‘업무 목록’ 뒤12px 간격으로 ui-table-scroll을 배치한다. table과 스크롤 region은 제목ID를 aria-labelledby로 참조하며 caption은 sr-only로 남겨 표시 제목을 중복하지 않는다. 정책 목록 끝의 ‘정책 자료 탐색’은 actions/ui-form-actions에, source(951)는 뒤따르는 p.source-note에 넣어 별도 줄로 표시한다. 기존 hash route와 표 열/데이터는 변경하지 않는다.

### 조합·링크·첨부 보정 계약

- 33번: `.ui-page-jump` 안 label/input은 가로 정렬, 입력 폭은 숫자 페이지에 맞추고 이동/상태를 분리한다. 작은 폭에서는 전체 묶음과 상태가 줄바꿈 가능하다.
- 45·60번: `.ui-field-actions`는 라벨 포함 필드의 중앙이 아니라 입력 하단에 동작 버튼을 맞춘다. 세로 조회조건은 `.ui-filter-bar[data-layout="stack"]`으로 필드/기간/고급조건/액션을 한 열에 구성한다. 조회·초기화·정렬 모델은 유지한다.
- 39번: `.ui-site-brand`, `.ui-site-nav`, `.ui-nav-item`을 연결한다. 어두운 헤더 위 브랜드/메뉴 글자와 키보드 포커스는 흰색이다.
- 40/41번: CompanyBusiness.attachments가 툴바/파일행/삭제/카운터/빈 상태의 유일한 구현이다. CompanyExtensions.filePicker는 파일 검증과 기존 배열 콜백/event 호환을 연결한다. 단일1개/다중5개, 10MB, 확장자 검증·잘못된 선택 시 기존 FileList 복원·disabled·reset·destroy를 검사한다.
- 모든 `.altool-ui a.button`: 이동 링크는 배경·테두리 채움 없이 파란 글자, hover/active는 밑줄, focus는 공통 외곽선, disabled는 회색이다. 기존 primary 클래스가 있어도 파란 채움으로 돌아가지 않는다. 제출/저장 등 실제 `<button class="primary">`는 기존 채움을 유지한다.
- 코드·정적 DOM 테스트는 실제 배치/색상 실측을 대신하지 않는다. 브라우저 정책 차단 중에는 최종 UI 승인을 보류한다. 기존 internal-stack 비적용 판단과 앱별 design.md TBD는 유지한다.

후속 수정 계약: 아이콘은 `ui-icon` 기본16px를 적용하며40px 강제 확대를 제거한다. 감싼 텍스트 라벨/입력은 ui-field의 label(for/id)+control로 분리한다. recipes와 extensions의 표시형 단일 select는 data-ui-select 및 기존 CompanySelect를 연결한다. recipes/controls.js는 선택값/폼을 변경하지 않고 동적 생성·정리·표시 갱신만 맡는다. multiple/size>1·원래 hidden인 select는 native/숨김 계약을 유지한다. 단순히 ui-select 문자열이 있는지뿐 아니라 실제 초기화·중복 방지·제거 cleanup·값 변경·reset을 테스트한다. 구형 과거 검사 PASS는 이번 UI 일치 증거로 쓰지 않는다.

- 범위: 루트 `company-additions.html` 및 전용 생성기. 01~13은 icons/additions.json의 실제 SVG, 14~50은 extensions/preview.html의37변형과 기존 초기화 코드, 51~68은 recipes/registry.json의18그룹 및 선택 가능한90변형이다. 추가로 원본 v27의120개 아이콘을 섞지 않는다.
- UI-01/02·CONTENT-01/02·COMPANY-01: 세 묶음 목차·번호·한국어 이름·의미 ID를 함께 제공하고 회사 CSS·JS·SVG를 재사용한다. 레시피는 같은 화면의 iframe에서 원래 구현을 표시한다. 독립 배포팩이 아니라 현재 저장소 파일을 참조하는 검토 페이지다.
- 디자인 원천은 승인된 v27 두CSS와 회사 구현이며 설치용 design.md의 앱별 TBD를 임의 확정하지 않는다. 검토용 번호·그리드만 페이지 전용 외형이다. internal-stack은 DB·인증 서버를 만들지 않는 자산 검토 문서이므로 비적용이다.
- 코드·경로·번호·개수·생성 재현성 검증과 실제 조작·반응형 검증을 구분한다. 기존 브라우저 보안 차단 때문에 실측은 미완료로 유지한다. 새 공통 자산·팩 릴리스·헌법 변경은 하지 않는다.
# 섹션 그룹 간격 보정 · 2026-09-11

사용자 승인 범위: 공통 ui-section-group이 grid/flex 간격을 소유하고 직계 ui-section의 시작 margin을 0으로 한다. 일반 세로 흐름은 유지한다. V27-05 및 PAGE-PATTERNS.md에 연결하며, 소비 백업 대시보드는 2:1/760px 전환을 유지한다. desktop 상단 차이 0px, mobile 섹션 사이 gap 20px와 margin 0px를 검증한다. 원본 design.md는 설치용 템플릿이며 이 제품 변경은 승인된 회사 CSS 원본에 적용한다. internal-stack은 데이터/인증 변경 없는 CSS 구조 작업이므로 비적용이다.
# 선택 작업 막대 보정 · 2026-09-11

승인 범위: 공통 ui-table-toolbar의 배경·테두리를 제거하고 좌측 요약/우측 작업 구조를 유지한다. 현재 표시 건수(data-selected-count)는 선택적이며 앱 소유 ui-table-selection과 중복 표시하지 않는다. 여러 페이지 선택은 앱 책임이다. V27-S02와 BUSINESS-USAGE 계약에 연결한다. 백업 대시보드의 중복 선택 요약을 통합하고 선택/페이지 이동/비교/해제 및 모바일 줄바꿈을 검증한다. 데이터와 기본 현재 표 집계 API는 유지한다.
# 표 정렬·행 제목 공통화 · 2026-09-11

사용자가 대시보드 시안을 승인하여 공통 기본값으로 확정했다. V27-S05: 제목·본문 전체 가운데 정렬(ui-number 포함), 회색 배경은 thead에만 적용, tbody 행 제목 의미는 유지하고 기본 배경은 투명. 선택/hover/줄무늬는 th와 td에 동일 적용하며 tfoot 합계 강조는 보존한다. 폼과 차트 숫자 정렬은 범위 밖이다. CONSISTENCY의 금액 오른쪽 정렬 문구는 표/폼으로 구분하여 동기화한다. 대시보드 임시 CSS를 제거한 상태에서 표시·정렬·선택을 검증한다. 기존 CHANGELOG-LEGACY는 현재 지침이 아닌 과거 기록으로 유지한다. internal-stack은 데이터/인증 변경 없는 공통 표 시각 변경이므로 비적용이다.
