# 재사용 컴포넌트

회사 기본 선택은 루트 회사 registry가 정한다. 이 폴더의 `variants-manifest.json`은 37개 컴포넌트에서 선택 가능한 **실제 소비 파일·의존성·상태·원문 페이지**를 제공한다. 의미 ID 하나를 resolve한 뒤 해당 조각만 읽는다. 전체 원문 988쪽이나 모든 카드/예제를 매번 읽을 필요는 없다.

- `fragments/`: Altool이 작성한 재사용 HTML. `examples/`는 브라우저 검증용 포장 페이지이므로 앱에 포장 페이지 전체를 삽입하지 않는다.
- `runtime.css`, `runtime.js`: authored 변형 공통 스타일/상호작용. `AltoolComponents.mount(container)`로 동적 삽입 조각을 초기화한다. 같은 영역의 중복 초기화는 무시한다.
- `messages.js`를 `runtime.js`보다 먼저 로드한다. `messages/ko.json`의 필요한 7개 키만 생성 시 선택하며 원문 경로/SHA-256을 함께 기록한다. 기본 오류 문구를 JS에서 다시 쓰지 않는다. ko.json 변경 후 `build-variants.cjs`로 재생성하며 `--check`는 미반영을 검출한다. 브라우저의 별도 fetch나 임의 대체 오류 문구는 없다.
- 공식 조각은 `upstream/html/code/` 원본과 `foundations/company-adapter.css`를 함께 사용한다. raw common/output CSS는 혼용하지 않는다. 정부 전용 배너/아이덴티티는 정부기관만 사용하며, 정부 로고가 섞인 원본 헤더/푸터는 회사 allowlist에서 제외했다.
- 선언된 이미지/JS/CSS 경로를 함께 설치하고, 반복 삽입 시 모든 ID 및 `for`/ARIA/fragment 참조를 함께 고유화한다. 예제의 상대 이미지 경로는 실제 배포 경로에 맞춰 연결한다.
- `variant-audit.md`는 37개 분류의 변형·잔여 앱 연결 경계를 대조한다. source card는 원칙 확인용이며 실행 UI를 대체하지 않는다.

## 상태 연결

작성된 컴포넌트는 `altool:change` 버블링 이벤트를 보내며 `event.detail.component`로 종류를 구분한다. 파일 선택은 실제 `File[]`, 날짜는 ISO 값 또는 null, 페이지는 현재/전체 페이지, 표는 열/방향, 탭은 활성 ID, 필터는 선택값, 모달은 confirm/decline/close/cancel을 전달한다. 이벤트를 구독한 호스트가 실제 업무를 연결한다.

확정 스피너는 루트에 `new CustomEvent('altool:progress', {detail:{value:60}})`를 보내 갱신한다. 샘플 진행률 조절기는 전송 상태를 연출하는 실제 업로드가 아니다. 파일 선택·검증 조각도 서버로 전송하지 않는다. 승인 모달은 진행/거절 선택을 요구하지만 실제 법률 동의·세션 연장은 구현하지 않는다.

파일 전송 상태 조각은 `altool:transfer` 이벤트의 `{state, name, progress, reason}`을 표시한다. state는 ready/uploading/complete/error/cancelled다. 기본 실패 제목·본문·재시도 레이블은 `error.upload`에서 가져온다. 선택적 `reason`은 호스트가 확인한 구체 원인만 별도 텍스트로 추가하며 generic 문구를 대체하지 않는다. 임의 `error` 인수로 기본 문구를 덮어쓸 수 없다. 재시도·취소 버튼은 `altool:change`로 `{component:'file-transfer', request:'retry'|'cancel'}`만 보내며 실제 성공/취소 완료를 추측하지 않는다. 예제의 상태 조절 details는 QA용이므로 호스트 UI에 삽입할 때 제외한다.

동일 의미 fallback 대조: 업로드 실패(`error.upload`), 일반 오류 모달(`error.generic`), 이미지 불러오기 실패(`error.load`), 유효하지 않은 날짜(`field.date`), 파일 개수/용량/형식(`file.count/size/type`)은 canonical 원문을 선택한다. 파일명·정확한 제한값·허용 형식은 호스트 제약에 따른 추가 정보로 남긴다. 글자 수 제한, 준비/전송/취소 상태, 정보도식의 대체 설명처럼 동일 의미 canonical 키가 없는 구체 안내는 억지로 generic 오류에 합치지 않는다.

## 제작·검증

```sh
node designs/assets/ui-kit/internal/components/build.cjs --check
node designs/assets/ui-kit/internal/components/build-variants.cjs --check
python3 -m unittest discover -s tests -p 'test_krds_components*.py'
```

어댑터 재생성은 `foundations/ADAPTER.md`를 따른다. 정적 계약·순수 로직 테스트와 실제 브라우저 검증은 구분한다. 네이티브 dialog/date/month/file 동작은 대상 브라우저별로 확인한다. 원본 공식 키트도 모든 버튼의 서버 기능이 구현된 앱이 아니며, 정부 승인은 이 파생 자산팩 전체의 인증을 뜻하지 않는다.
