# 회사 공통 자산 사용·배포

## 도입 전 회사 맞춤, 도입 후 사내 공통 사용

Altool은 한 회사에 설치하여 사용하는 도구다. 도입 준비에서 회사가 제공한 디자인을 확인하고 Altool 기본 `ui-kit/internal/`, `brand/`, `images/`, `messages/`와 디자인 표준을 그 회사 기준으로 조정·검증한다. 그 결과를 회사 공통 팩으로 배포한 뒤 비개발자가 여러 프로젝트를 개발한다. 사내 사용자가 프로젝트마다 다른 디자인 팩을 고르는 흐름이 아니다. KRDS 원문·외부 코드·라이선스는 참고 및 출처 추적 자료로 보존하며 회사 스타일을 KRDS 외형에 고정하지 않는다.

기존 `krds-2024/` 제품 폴더는 `ui-kit/internal/`으로 정리했다. 새 경로는 새 릴리스로 배포하며 기존 설치본의 폴더·자산·lock을 설치기가 임의로 이동하거나 덮어쓰지 않는다. 기존 앱의 업그레이드에서는 사용 경로와 복사본·사용 증거를 함께 갱신하고 검증한다.

## 같은 의미에는 같은 자산

`registry.json`은 채택된 자산의 의미 ID와 허용 변형을 지정한다. `pack.lock.json`은 해당 릴리스의 실제 바이트를 고정한다. 일반 `catalog.json`의 원문/공식 참고/반례는 자동 채택 대상이 아니다. 탐색기 기본 화면도 회사 표준이며 참고 자료는 별도 전환한다. 회사 표준에서는 ID를 복사하고, 참고 자료의 경로·문구 복사를 채택 승인으로 해석하지 않는다. 프로젝트별 업무 내용·페이지 구성은 자유롭게 설계하되 공통 설정 아이콘·오류 문구 등을 다시 발명하지 않는다.

현재는 QA 팩 개발·확장 검증 중이며 정식 버전과 전체 브라우저 통과를 확정하지 않았다. 최신 구현·검증 상태는 [회사 팩 검증 기록](ui-kit/internal/COMPANY-VERIFICATION.md)을 확인한다. [초기 검증 기록](ui-kit/internal/VERIFICATION.md)의 당시 자산 수·미구현 목록을 현재 상태로 사용하지 않는다.

```sh
python3 altool/scripts/assets.py validate
python3 altool/scripts/assets.py find 설정
python3 altool/scripts/assets.py resolve icon.settings
python3 altool/scripts/assets.py resolve message.error.network
```

resolve/read 결과의 파일·dependencies·guidance 회사 지침을 읽는다. `guidance.references`는 관련 KRDS 원문/예제 카드로 필요할 때만 읽는다. 기본 변형을 사용하고 필요한 경우 등록된 variant만 지정한다. `--audience government`는 실제 정부 전용 식별자를 적용할 권한·맥락이 확인된 프로젝트에서만 사용한다. 회사 앱이 제한을 우회하기 위해 지정하면 안 된다.

## 실제 코드에서 사용

공통 자산 폴더를 앱이 제공하는 정적 경로에 원래 구조 그대로 배포한다. 예를 들어 Next.js에서 `public/company-assets/`에 배포할 수 있다. 원본 폴더가 repo에 있다는 사실만으로 URL이 제공되는 것은 아니다. 사용하는 자산과 dependencies 및 registry/lock/runtime을 함께 배치하고, 사용 증거에 복사 배포 경로를 기록한다.

```js
import {createAssetClient} from '/company-assets/runtime/assets.mjs';
const assets = await createAssetClient('/company-assets/', {
  pack: 'altool-company-ui', release: '<설치된 registry.json의 release>'
});
settingsButton.append(await assets.icon('icon.settings', {label: '', size: 24}));
// 버튼의 이름은 별도 텍스트/aria-label로 제공한다.
await assets.renderMessage(errorContainer, 'message.error.network', {onAction: retry});
```

위 release 자리표시자는 실제 설치된 registry/lock의 동일 release 값으로 교체한다. 예시의 팩 ID가 아닌 회사 팩을 채택했다면 pack도 함께 맞춘다. 같은 팩·릴리스의 같은 ID/변형은 같은 파일/문구로 해석된다. 런타임은 registry와 icon/message 호출에서 읽는 바이트의 hash를 검사하고 미등록 ID·변형 및 허용 밖 아이콘 크기를 거부한다. 단순 resolve 결과만으로 HTML/CSS가 실행·검증된 것은 아니다. 아이콘은 확인된 바이트의 Blob URL을 img로 표시하므로 CSP에는 `img-src 'self' blob:`이 필요하다. 연결 실패를 고치려고 새 문구로 우회하지 말고 공통 로드 실패 처리와 원인을 확인한다.

컴포넌트·패턴의 `path`는 재사용 조각 또는 조합 예제다. dependencies와 states/constraints를 함께 가져와 프레임워크에 맞게 연결한다. 모의 데이터·서버 지연/실패 스위치는 예제 검증 도구이지 실제 앱의 비즈니스 로직이 아니다. 프레임워크 어댑터가 필요하면 한 공통 컴포넌트에서 구현하고 여러 화면이 그 어댑터를 사용한다. 어댑터의 상태/레이아웃·초점 준수는 별도 테스트한다.

## 사용 증거와 게이트

`.altool/asset-usage/{feature}.json`에 다음 자산 사용 부분을 작성한다. 이것만으로 완료 증거가 되지 않는다. `altool/standards.md`의 UI 적용 증거 절차에 따라 `routing`, `requirementsSha256`, 규칙별 `checks`도 추가한다. 아래 hash는 실제 파일에서 계산하며 예시 문자를 그대로 넣지 않는다.

```json
{
  "pack": "altool-company-ui",
  "release": "설치된 registry.json의 release",
  "lockSha256": "현재 pack.lock.json의 SHA256",
  "uiFiles": ["src/settings.js"],
  "uses": [
    {"id":"icon.settings", "variant":"default", "consumer":"src/settings.js", "reference":"icon.settings"},
    {"id":"message.error.network", "variant":"default", "consumer":"src/settings.js", "reference":"message.error.network"}
  ],
  "featureOnly": []
}
```

복사 배포가 있으면 각 use의 `copies`에 `{"source":"designs/assets/...", "target":"public/company-assets/..."}`를 추가한다. 공통화할 수 없는 업무 콘텐츠는 featureOnly의 consumer/scope/reason으로 좁게 기록한다. 같은 의미를 다르게 그리고 featureOnly라고 적는 것은 허용 근거가 아니다.

```sh
python3 altool/scripts/assets.py requirements --usage .altool/asset-usage/settings.json
# 반환된 요구 ID마다 실제 검증을 수행하고 checks를 작성한 다음:
python3 altool/scripts/assets.py evidence --usage .altool/asset-usage/settings.json
```

출력 JSON을 UI 구현/검증 Step Check의 최상위 `assets`에 넣는다. 이 결과는 사용 선언 JSON의 hash뿐 아니라 `consumers`에 실제 소비 파일별 SHA256도 포함한다. 일반 개발 요청에도 동일 검사를 실행한다. 게이트는 팩 hash, 허용 ID/변형, 소비 파일의 주석을 제외한 인용 문자열/속성 참조, 선언된 복사 파일의 바이트를 확인한다. 이후 소비 파일이 변경되면 ID가 그대로 있어도 이전 증거는 실패하므로 실제 검증 후 evidence를 다시 생성한다. hash만 갱신해 검증을 대신하지 않는다. 변경 UI 파일 목록과 의미 누락은 Analyze가 git diff/실제 화면과 독립 대조한다. 문자열 참조 존재가 실행 경로 전체나 임의 UI의 의미를 자동 증명하지는 않는다.

## 여러 프로젝트에 배포

회사 적용 지침은 `guidance/*.md`가 단일 원문이며 `guidance/map.json`이 자산 ID→회사 원문/항목→참고 MD를 연결한다. KRDS 추출/기존 카드는 출처로 유지하고 회사 지침 변경을 역으로 복제하지 않는다. 제작기는 모든 자산의 지침 연결·앵커를 검사하고 회사 원문을 lock에 포함한다. 지침 변경도 새 팩 릴리스와 소비 앱 재검증이 필요하다.

1. 회사가 지정한 **하나의 공통 팩 제작 원본**에서 자산과 manifest를 수정·검증한다. 외형 코드는 [ui-kit/design/](ui-kit/design/README.md)의 두 CSS에서 편집하고 `scripts/build_company_design.py`로 배포 CSS·어댑터를 생성한다. 제품 제작 스크립트 `python3 scripts/build_company_assets.py --release 새버전`으로 원본/생성물 일치·CSS 검사를 통과한 새 릴리스를 만든다. 제작 원본의 `releases.json`에 release별 lock SHA256 이력을 보존하며 중간 버전을 거쳐도 과거 버전의 다른 내용 재발행은 거부한다. 검증용 `assets.py`는 registry·lock·이력을 쓰지 않는다. 이력을 삭제하거나 hash만 새로 기록해 재발행 제한을 우회하지 않는다.
2. 같은 회사의 모든 프로젝트에 같은 release/lock을 배포한다. 일반 설치기는 소스와 기존 대상 팩을 사전 검증한다. 팩이 없는 대상에서 핀 고정 경로의 기존 파일과 충돌하면 자산 배치 전에 실패한다. 기존 정상 팩이 있으면 그 릴리스를 유지하고 소스 팩의 핀 고정 파일을 섞지 않는다. 그 외 누락 파일만 추가하며 회사 CI·카탈로그·디자인 계약 등의 기존 파일을 몰래 덮어쓰지 않는다. 설치기 전체의 엔진 복사까지 원자적으로 되돌리는 기능은 아니다.
3. 업그레이드는 공통 팩의 변경 내용과 영향받는 앱을 확인한 뒤 별도 변경 작업으로 수행한다. 원본과 앱 복사본·사용 증거를 동기화하고 회귀 검증한다. 여러 앱을 자동 갱신하는 서버·네트워크 배포는 포함하지 않는다.

이 구조는 같은 릴리스 소비의 결정론성과 변경 탐지를 제공한다. 로컬 파일 소유자를 통제하는 보안 장벽이나 서로 다른 저장소의 동시 편집 합의 시스템은 아니다. 중앙 CI가 있는 회사는 동일한 validate/evidence 명령을 필수 검사로 실행해야 한다.
