# 공통 컨트롤 기본 아이콘

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

## 요청·구현 계약
아이콘 자산이 있어도 앱이 주입하지 않으면 누락되던 기본 경로를 보완한다. 회사 SVG 원본을 제작기에서 구조화해 dist/business.js에 내장한다. 원본 SVG 변경은 재빌드로 반영하며 임의 SVG 재작성·외부 fetch·앱의 별도 로딩 순서 의존을 추가하지 않는다.

- 날짜/월 선택 calendar, 달력 이전·다음 chevron-left/right, 코드 검색 search, 대화상자 닫기 x, 첨부 추가/파일/삭제 plus/file/trash.
- 기존 첨부 icons 옵션은 키별 우선 적용. 기존 검색 트리거에 svg/img가 있으면 중복 추가하지 않음.
- 장식 SVG aria-hidden/focusable=false, 텍스트 및 아이콘 전용 버튼 aria-label 유지.
- 일반 앱이 직접 작성한 조회 버튼이나 메뉴 전체에 자동으로 아이콘을 삽입하지 않음. 공통 컨트롤 생성 경로만 대상.

## 검증
- business/attachments/attachment-unification: 20 테스트 통과(별도 60 logic/API assertions 포함).
- default-icons: 기본 첨부 add/file/remove, 접근성 이름, 사용자 override 단일 표시 통과.
- 제작기 CSS 변수·대비 검사와 자산 팩 검증 통과. release qa.18.
- 인앱 실제 공통 예제: 달력 열기→다음→이전→9월2일 선택, 코드 검색 열기→FIN 결과1건→닫기 확인. 검색 모달 SVG2개, 달력/이동 SVG16px 및 aria-hidden=true 확인. 375px에서도 달력 아이콘16px 유지.
- 테스트용 모의 DOM에 SVG 생성/clone 지원을 추가했다. 실제 브라우저와 달리 모의 DOM은 렌더링 검증이 아님.
- 첨부 기본값은 DOM 회귀 테스트로 확인했으며 이번 회차 새 브라우저 파일 업로드는 미실행. 전체 UI 상태 증거/oneshot 완료를 주장하지 않음. 기존 test4는 자동 업그레이드하지 않음.
