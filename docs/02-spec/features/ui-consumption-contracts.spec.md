# 공통 UI 소비 계약 명세

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: Implemented / Verified — 전체 자산 전수 인증과는 구분

## 1. CSS 계약

`@layer altool-base, altool-components` 순서를 두 배포 CSS에 선언한다. 생성 adapter는 base, 작성 runtime은 components에 둔다. 앱의 일반 CSS는 그 위에서 승인된 화면 계약을 적용한다. 원본 upstream은 불변이며 수정은 파생 생성기의 선언 변환에서 수행한다. 알려진 잘못된 var 참조는 기존 의미의 올바른 참조로 연결하고 대비 문제는 해당 선택자의 선언만 수정한다.

## 2. 방향 자산

공식 ico_angle SVG를 제품 생성기에서 회전한 고정 SVG를 `icon.chevron-left/right/up/down`으로 등록한다. 기본·inverse·disabled·disabled-inverse 변형을 보존한다. 소비 앱은 임의로 도형을 그리거나 회전 각도를 추측하지 않는다. 기존 icon.angle은 호환성을 위해 유지한다.

## 3. 검증

배포 전 검사는 실제 배포 adapter/runtime/token/layout CSS를 대상으로 정의 누락·명시적 대비를 검사한다. 검사 제외나 현재 실패의 자동 면제는 하지 않는다. 정적 검사 통과는 전체 테마 접근성 인증이 아니다.

소비 도구는 DOM의 computed style, 문서 좌표, SVG 변환 후 글자 크기, 이미지 경로/변환, 실제 viewport를 수집하고 명세의 기대값과 비교한다. 대상 부재·비수치·잘못된 viewport는 실패한다. 관찰 파일은 다른 자산 요구의 증거로 재사용할 수 있지만 요구별 결과를 생략하지 않는다.

## 4. 회귀와 앱 적용

CSS 로드 순서를 양방향으로 검사하고 이전25px 제목·6px SVG 글자·같은 방향 아이콘·목록 아래 밀도가 실패하는지 확인한다. 기존 테스트 앱에 제품 릴리스를 명시적으로 업데이트하고 검색·필터·비교·오류복구는 유지한다. 제품 팩 갱신으로 기존 증거 hash가 바뀌면 재검증한 범위만 새 증거로 연결한다.
