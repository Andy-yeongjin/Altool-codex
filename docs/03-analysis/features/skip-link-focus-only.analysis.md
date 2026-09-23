# 본문 바로 가기 표시 수정

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

2026-09-11 사용자 승인 범위: 공통 기본값과 백업 test3 적용. 표 제목과 oneshot 절차 충돌은 변경하지 않았다.

- 제품 팩 `2.0.0-qa.9`: semantic ID 300개, 잠금379파일. 기본 focus-only, 명시적 visible 유지. 공통 디자인 원본에서 fixed overlay와 비초점 시각 숨김 생성; registry/지침/README 동기화.
- 소비 앱: `/Users/andy/Desktop/project/altool-test3.backup-20260911-assisted`. 기존 qa.8 팩 무결성 확인 후 제품 qa.9를 복사하고 prepare-assets 실행. 앱 skip link는 focus-only로 변경. 새 순수 테스트 폴더 altool-test3는 건드리지 않았다.
- 자동 검사: 제품 기본값 회귀2/2, extensions runtime23/23, 앱 도메인7/7, typecheck/lint/build PASS. CSS30파일 변수·명시적 대비, 자산 잠금(제품/소비 앱), 생성기 및 diff 검사 PASS.
- 실제 인앱 Browser `http://127.0.0.1:3000/`: 일반 화면 및375×812에서 reload → 첫 Tab → Enter. 일반 상태 clip-path=inset(50%), width=1px; Tab 후 링크 active, clip-path=none, 좌상단8px/8px, 폭105.8203125px. 헤더 top은 표시 전후0px. Enter 후 activeElement=main-content, 링크 다시inset(50%). 포커스 표시 스크린샷도 눈으로 확인했다.
- 사용자가 실행한 서버는 유지했고 모바일 viewport override는 해제했다. 브라우저는 초기 비초점 화면으로 돌려두었다.
- 이 기록은 skip-link 변경의 실제 검증이며 다른 화면/전체 oneshot PASS가 아니다. 기존 asset-usage 전체 미완료 및 Step Check/문서 소유 게이트 누락은 해결했다고 주장하지 않는다.
