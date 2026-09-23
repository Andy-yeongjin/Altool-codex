# 공통 섹션 그룹 보정 검증 · 2026-09-11

검증 상태와 문서 분류는 [문서 색인](../../verification-status.md)을 따른다.

## 범위

공통 CSS 정본, 회사 지침 V27-05와 PAGE-PATTERNS, 생성 팩 qa.11 및 현재 실행 중인 altool-test3.backup-20260911-assisted 차트 묶음. 새 altool-test3와 사용자 서버 생명주기는 변경하지 않았다. 일반 세로 흐름 규칙은 유지했다.

## 결과

- 원인: ui-section 인접 형제 규칙의 margin 20px가 grid의 두 번째 열에도 적용됨.
- 수정: ui-section-group이 gap을 소유하고 직계 섹션 margin을 0으로 초기화. 화면 CSS의 중복 gap 제거.
- 인앱 1440×1000: 두 섹션 top 각각 341.4921875px, 차이 0px. 모두 margin 0px, 부모 gap 20px.
- 인앱 375×812: 첫 섹션 bottom 682.296875px, 다음 top 702.296875px. 실제 간격 20px, margin 모두 0px.
- IT 막대 클릭 → 검색 결과 5개, 초기화 → 24개. 월별 데이터 표 펼침 true/닫힘 false 확인. 관측된 콘솔 error/warn 없음.
- 타입·린트·프로덕션 빌드 통과, 앱 단위 테스트 7/7, 공통 섹션/표제목/skip-link 회귀 6/6.
- 공통 CSS 변수·대비 검사, 자산 팩 validate, 생성물 --check 및 git diff --check 통과.

## 한계

이번 변경 영역의 부분 검증이다. 모든 기존 UI 상태, flex 전환 및 일반 세로 흐름의 실브라우저 회귀를 완료했다는 뜻은 아니다(기존 세로 CSS 보존은 정적 회귀로 확인). 전체 oneshot 완료나 이전 Step Check 증거의 유효성을 주장하지 않는다. 서버는 그대로 실행 중이다.
