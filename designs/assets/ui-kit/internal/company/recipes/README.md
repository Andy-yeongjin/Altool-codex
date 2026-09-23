# v27 회사 레시피

기본 패턴 11종·75개 변형, 서비스 조합 6종·13개 변형의 동작을 v27 외형으로 이식했다. 기존 분리 날짜·월 입력을 `component.date-input`의 2개 변형으로도 연결한다. 정부 CSS·아이콘·폰트·그림을 실행 의존성으로 사용하지 않는다.

- `basic/index.html`: 개인 정보 입력·도움·동의·목록·피드백·상세·오류·폼·첨부·필터·확인. 분리 날짜, 연월/시간 범위, 단계 입력과 미디어/자막 대안 포함.
- `services/index.html`, `services/variants.html`: 방문·검색·인증·신청·처리 내역·정책 자료. 모의 상태 전이·저장·조회·미디어 기능은 보존한다.
- `registry.json`: 두 `variants-manifest.json` 및 `registry-additions.json`에서 `node build-registry.cjs`로 생성한다. 제품 레지스트리에 회사 상대 경로·변형·상태를 전달하며 `messages/ko.json`·`runtime/assets.mjs`는 assets 기준 경로다. `--check`로 재현성을 검사한다.
- UI Kit의 `design/components.css`와 `design/theme.css`가 회사 외형 원천이다. `recipes.css`는 제품 빌드가 생성하는 조합 레이아웃이며 버튼·입력·표의 디자인을 재정의하지 않는다.

런타임은 페이지에서 `../../dist/company.css`와 `../recipes.css`를 사용한다. 필요한 JS만 선택해 연결한다. 예제 페이지 전체와 모의 사용자·업무 데이터를 실제 기능에 통째로 복사하지 않는다. 실제 인증·권한·서버 저장·전송은 앱 계약으로 연결한다.

입력은 공통 `ui-field`의 분리된 label(for/id)·control, 조회조건은 `ui-filter-bar`를 사용한다. 단일 드롭다운은 `data-ui-select`와 `../../dist/select.js`를 연결한다. `../controls.js`는 문서 준비 후 자동 시작하며 동적으로 생성한 select 초기화·제거된 인스턴스 정리·숨김 영역·input/change 이후 값 표시·form reset을 관리한다. 값만 프로그램으로 변경하고 DOM/이벤트 변화가 없을 때는 `CompanyRecipeControls.refresh()`를 호출한다. 페이지 부분을 내릴 때 `destroy()`로 정리한다. multiple/size>1 선택창은 native로 유지한다. 이는 모의 업무 모델이나 서버 동작을 구현하는 API가 아니다.

## 검증 경계

원본 PDF·추출 문서·과거 원문 대조 장부는 배포에서 제거했다. 참고출처는 [출처 기록](../../ATTRIBUTION.md)에 남기며 현재 구현·변형 선택은 회사 레지스트리를 따른다. JS 모델·DOM 모의 테스트와 정적 링크 검사는 실브라우저의 포커스·미디어 재생·모바일·폰트·CSS 측정을 대신하지 않는다. 현재 실브라우저는 접근 정책 차단으로 미검증이다.
