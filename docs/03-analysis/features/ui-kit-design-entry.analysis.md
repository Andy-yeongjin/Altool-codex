# 회사 디자인 편집 진입점 통합 검증

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

## 결과

2026-09-09. ui-kit 루트를 README.md / design / internal로 정리했다. 회사 외형 코드 편집은 design/theme.css와 design/components.css에 모으고 기존 작성 CSS 8개 및 회사 어댑터 추가 스타일은 명시된 @output 섹션에서 생성한다. tokens와 함께 10개 배포 CSS 및 공식 마크업 어댑터를 재현한다. 시각 권위는 사용자 원천·standards/design.md를 유지한다.

기존 파일은 내부로 이동했으며 원본 upstream 245개 바이트, 의미 ID 171개, 기존 관찰 장부를 보존했다. 배포 경로 변경과 편집 코드 원본 고정은 팩 1.0.0-qa.11로 기록했다(352 pinned files). 이전 릴리스 해시는 변경하지 않았다. 이동 도중 생성한 qa.10은 이력에 남기고 덮어쓰지 않았다. 외부 Git 업로드나 소비 앱 altool-test 갱신은 수행하지 않았다.

## 자동 검증

- `.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`: 160개 PASS. 설치/라우터/팩 무결성/워크플로 회귀 포함.
- `ALTOOL_LINT_PEERS=/Users/andy/Desktop/project/altool-test node --test tests/*.cjs tests/*.mjs`: 150개 PASS, skip0. 기존 설치 의존성을 읽어 테스트했으며 소비 앱은 수정하지 않았다.
- `test_company_design.py`: 5개 PASS. 단순 루트 구조, 원본/생성물 일치, 임시 복사본의 색상·작성 버튼 반경·공식 버튼 override 전파, 잘못된 섹션 거부, stale 상태의 릴리스 차단, 이동 HTML의 로컬 로딩 의존 경로 검사. 색상과 override가 최종 어댑터에 실제 포함되는 것도 별도 실행 검증했다.
- `scripts/build_company_design.py --check`: 10개 CSS + adapter 일치.
- `components/build.cjs --check`: 54 derivatives 일치.
- `components/build-variants.cjs --check`: 46 authored / 37 families / 105 routed variants 일치.
- `altool/scripts/assets.py validate`: qa.11 / 171 의미 ID 유효. 릴리스 단계의 배포 CSS 변수·명시적 대비 검사 통과.
- `scripts/build_source_review.py`: 기존 원문 시각 관찰 988/988의 경로·장부 무결성 확인. 이번 작업에서 PDF를 다시 전부 열람한 것은 아니며 PNG 재해시 옵션은 실행하지 않았다.
- `scripts/build_asset_catalog.py`: 568개 검색 항목, 74 HTML examples, 245 upstream files; 목차 컴포넌트 연결37/37. 항목 연결이 UI 전체 준수 증거는 아니다.

중간에 이동 깊이·테스트 파일 URL의 끝 슬래시 오류를 발견해 수정했다. 원문 검증기는 --check 옵션을 지원하지 않아 기본 읽기 전용 명령으로 다시 실행했다.

## 인앱 브라우저 실제 확인

기존 로컬 서버 127.0.0.1:48765를 재사용했다. desktop 기본 viewport와 mobile 390×844를 사용하고 임시 viewport를 원복했다.

| 대상 | 실제 조작·관찰 |
| --- | --- |
| 자산 탐색기 | qa.11 표시, component.button 검색→1개, 예제 링크 클릭→새 버튼 예제 탭, 초기화→169개 회사 사용 가능 ID |
| upstream-button.html | 실제 클릭·초점 링 확인. 공식 버튼 반경8px, 높이56px, 흰 글자 유지. 새로운 디자인은 적용하지 않음 |
| textarea-count.html | 9자 입력→9/100, 101자→오류 알림. 모바일 스크린샷 확인, 문서 가로 너비390px로 넘침 없음 |
| table-sort.html | 자료 수 정렬 두 번→24/12/3 내림차순, 모바일 표 오른쪽 이동→왼쪽 이동 활성화. 문서 가로 넘침 없음 |
| upstream-modal.html | 실제 열기→대화상자, 모바일 스크롤 영역·하단 액션 표시 스크린샷 확인, 닫기→열기 버튼 초점 복귀 |
| patterns/basic/error.html | 빈 입력 검증→인라인 오류, 제목 입력 후 서버 오류 모달→회사 JSON의 정확한 제목/본문 표시, 복귀→입력 보존·정상 검증 메시지 |

확인한 예제 탭의 warn/error 로그는 비어 있었다. 이동한 HTML의 로컬 CSS/JS/미디어 경로도 자동 검사했다. 예제는 서버 저장이 없는 데모이므로 영속성 검증은 N/A다. 이 대표 검증을 모든 자산·변형·소비 앱의 접근성/업무 동작 인증으로 확대하지 않는다.

## 의도적으로 유지한 경계

refactor-doc-sync에 따라 동작·기본 외형을 보존하고 경로 및 관련 안내를 동기화했다. CSS는 편집 원본만 합쳤으며 하나의 전역 stylesheet로 앱에 통째로 주입하지 않는다. 서비스별 전역 선택자는 배포 파일 경계를 유지해 기존 충돌 방지를 보존한다.

공식 마크업(.krds-btn)과 작성 UI(.altool-ui)의 두 구현 계열은 남아 있다. 한 파일에서 편집할 수 있지만 버튼 한 선택자를 바꾸면 두 계열이 모두 바뀐다고 보장하지 않는다. 안내에 각각의 편집 구역을 적었다. 참고 원본·미리보기 골격·구조/동작 코드를 제거하거나 런타임 단일 컴포넌트 계열로 재작성하는 것은 이번 범위가 아니다. 현재 altool-test의 박스형 버튼도 이번 구조 정리만으로 외형이 바뀌지는 않는다.
