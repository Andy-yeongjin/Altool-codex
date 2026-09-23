# 회사 공통 요소 보완

v27에 없던 요소를 동일한 회사 규격으로 새로 작성했다. 정부 UI의 HTML·CSS·아이콘·동작 라이브러리를 사용하지 않는다. 정부 원문의 과업·접근성 지침은 별도 참고 근거다.

## 사용

1. `registry.json`에서 의미 ID와 필요한 변형을 고른다(경로는 company 폴더 기준). `fragments/`는 재사용 마크업이며 `preview.html` 전체를 앱으로 복제하지 않는다.
2. 회사 `dist/company.css`와 registry 의존 파일을 로드한다. 미리보기 JS 순서는 `dist/business.js`(공통 문구) → `dist/select.js` → `recipes/controls.js`(공통 컨트롤 생명주기) → `extensions/runtime.js` → 각 요소 초기화다. 모든 마크업을 `.krds-2024-tokens.altool-ui` 범위에 둔다.
3. 해당 루트에 `CompanyExtensions` API를 한 번 초기화하고 제거 시 `destroy()`를 호출한다. fragment의 목차·링크 목적지와 회사명·이미지·본문은 실제 회사 승인 콘텐츠로 연결한다. 임시 example.com 목적지를 실제 앱에 배포하지 않는다.

텍스트·숫자·파일·select·textarea는 `.ui-field` 안에 `label[for]`와 같은 id의 컨트롤을 나란한 자식으로 둔다. 체크박스·라디오의 감싸는 label은 유지한다. 단일 select는 `data-ui-select`를 사용하고 회사 공통 controls 경로로 초기화하며 화면마다 별도 드롭다운을 만들지 않는다. 제작기는 `extension-{exampleIndex}-field-{sourceIndex}` 형식으로 id/for를 함께 생성한다. 같은 fragment를 여러 번 삽입하는 앱은 id/for 및 해당 ARIA 참조를 인스턴스별로 고유화해야 한다.

| 요소 | 초기화 및 연결 책임 |
|---|---|
| 캐러셀 | `carousel(root,{interval:5000})`; 자동 재생은 사용자 시작에만 반응하고 focus/hover 시 정지. `show(index)`는 0부터 시작. 이미지의 설명은 앱이 제공한다. |
| 도움말 | `helpPanel(root)`; 비모달 보조 영역, Escape·닫기로 초점 복귀. 중요한 안내를 닫힌 곳에만 넣지 않는다. |
| 코치·튜토리얼 | `tutorial(root,{steps:[{target,event,title,valid}],onComplete})`; 사용자의 실제 target 이벤트와 valid 통과 후 다음 활성화. 접기·다시 열기는 진행 보존, 종료는 초기화. onComplete는 안내 완료일 뿐 업무 저장 성공이 아니다. |
| 목차·건너뛰기·링크 | `anchorLinks(root)`; 유효한 같은 페이지 ID로 초점 이동. 건너뛰기는 헤더 앞 첫 포커스 대상이며 기본 focus-only: 평소 숨김, Tab 초점 시 상단 겹쳐 표시, Enter로 실제 main에 초점 이동. visible은 상시 노출 요구가 있을 때만 선택한다. 목차는 모바일에서 본문보다 앞에 배치. |
| 이미지 | 장식은 alt 빈 문자열, 기능은 행동의 접근 가능 이름, 정보는 실내용 대체 설명. `imageFallback(root)`은 실제 error/load를 따라 텍스트 대체. 샘플 Lucide 이미지는 사진 대용이 아니다. |
| 회사 식별 | 회사 로고를 넣을 때 승인 CI 파일과 대체 텍스트를 제공한다. 정부 깃발·인증·공식기관 문구를 표시하지 않는다. |
| 페이지 | `pagination(root,{total,current,onChange})`; 정수 페이지 검증·최초/최종 포함. 데이터 조회는 onChange에서 앱이 연결. |
| 더 보기 | `loadMore(root,{load,renderItem})`; load는 `{items,hasMore}`를 반환하고 AbortSignal을 받는다. 실패는 기존 목록 보존·재시도, 성공은 첫 신규 항목 초점. |
| 진행률 | `progress(root,value).set(value)`; 막대와 숫자·ARIA 값 0~100 동기화. 시간 경과로 완료시키지 않는다. 불확정 진행은 기존 v27 spinner를 사용한다. |
| 전송 상태 | `transfer(root,{onRetry,onCancel}).set(state,percent)`; ready/uploading/complete/error/cancelled는 호스트 응답으로만 갱신. 취소·재시도 콜백은 요청이며 UI가 업로드 성공을 만들지 않는다. |
| 전체 선택·글자수 | `selectAll(root)`, `countedInput(root,{max})`; disabled 항목 제외, 부분선택, 코드포인트 기준 글자수·초과 유효성. 동적 항목이나 폼 초기화 후 refresh. |
| 스크롤 헤더 | `scrollHeader(root)`; 600px 미만에서만 아래 스크롤 숨김, 위/초점/resize 시 표시. 앱의 sticky 상단 컨테이너에서 사용한다. |
| 첨부 검증 | `filePicker(root,{maxFiles,maxBytes,accept,onChange})`; 회사 `CompanyBusiness.attachments`에 검증 정책·콜백만 연결하는 adapter다. 단일/다중은 원본 input.multiple을 따르고 선택기 결과는 교체, 다중 끌어 놓기는 중복 없이 누적한다. 허용 확장자/MIME·개수·0바이트·용량 실패 시 이전 FileList 보존. onChange는 기존 File 배열 계약, `company:files` 이벤트·`set/files/destroy` API는 유지한다. |
| 이미지 최적화 | `imageOptimize(root,{maxEdge:1600,quality:.8})`; data-image-attachment의 파일 선택/목록/삭제/검증은 CompanyBusiness.attachments 단일 선택으로 연결한다. JPEG/PNG/WebP를 로컬 JPEG로 변환한 뒤 더 작은 경우에만 별도 File과 다운로드를 제공한다. 투명 배경은 흰색으로 합쳐진다. 변환이 원본 input.files를 덮어쓰지 않는다. 삭제/reset·선택 교체·destroy 시 미리보기/URL을 정리하고 오래된 비동기 결과와 중복 실행을 막는다. |
| 조건부 단계 | `stepIndicator(root,{steps,values,onComplete})`; step의 valid, next(values), optional로 전진/분기/선택 생략 결정. 뒤로 가기는 실제 이동 이력 사용, 입력 DOM은 보존. 단계 처음으로는 단계 진행만 초기화하며 입력 초기화는 별도 사용자 확인·폼 reset 책임. |
| 세로 탭 | `tabs(root,{vertical:true})`; 위·아래/Home/End 선택, disabled 제외, panel 연결 ID 고유화. 탭을 페이지 탐색 링크 대신 사용하지 않는다. |
| 조건 태그 | `tagGroup(root)`; select 항목을 공통 태그로 추가, 동일값 중복 방지, 삭제 후 인접항목 또는 추가 버튼 초점. 실제 조회 적용은 `company:tags` 이벤트를 앱이 연결한다. |
| 하위 탐색 | `navigation(root)`; native details/summary의 Enter/Space·Tab 동작, Escape로 현재 열린 하위 영역을 닫고 summary 초점 복귀. 메뉴 역할을 가진 ARIA 위젯이 아니라 링크 탐색이다. 앱이 현재 목적지에 aria-current=page를 지정하고 현재 경로의 상위 details를 연다. |
| 명시 선택 팝업 | `approval(root,{title,message,onDecision})`; `.open()` 후 진행하지 않기/계속 진행 중 한 버튼을 선택해야 닫힌다. Escape와 X로 결정을 생략하지 않으며 닫힌 뒤 원래 초점을 복원한다. onDecision의 불리언은 선택 결과이지 서버 승인·저장 성공이 아니다. |
| MM/YY 입력 | `monthYear(root)`; 월 01~12·연도 두 자리의 문자열 계약. `value`는 `{month:'01',year:'03'}` 또는 null이며 선행 0을 보존한다. 네 자리 연도·세기·만료 의미를 추정하지 않는다. `validate()`와 `company:month-year`로 앱 검증/제출에 연결하며 폼 초기화 뒤 validate를 호출한다. |

첨부 루트에는 이름이 연결된 file input과 조건 안내, 선택적인 `[data-file-error]`만 둔다. 별도 `data-file-list` 목록·삭제 버튼·브라우저 기본 파일 선택 버튼을 만들지 않는다. 회색 도구 영역·회사 파일 추가 버튼·파일명/크기·개별 삭제·빈 상태는 canonical attachments가 생성한다. form reset은 기존 배열 콜백에 `[]`를 전달하고, destroy는 canonical UI·관찰자·이벤트를 함께 해제한다. 클라이언트 검사와 FileList 테스트 대역은 실제 업로드·서버 보안 검증·브라우저 FormData 검증을 대신하지 않는다.

## 제작·검증

마크업 제작 원본은 `build.mjs`, 동작 원본은 `runtime.js`다. CSS 보완은 회사 디자인 원본으로 통합하며 배포 CSS를 직접 수정하지 않는다.

```sh
node designs/assets/ui-kit/internal/company/extensions/build.mjs
node designs/assets/ui-kit/internal/company/extensions/build.mjs --check
node --test designs/assets/ui-kit/internal/company/extensions/runtime.test.cjs
```

자동 검사는 생성 재현성과 상태 계약만 증명한다. 브라우저 URL 보안 차단으로 실화면·320px·키보드·확대·색 대비의 화면 실측은 아직 미검증이다. 제한을 우회해 캡처했다고 주장하지 않는다.
