# 표준 선택·적용 절차

일반 개발 요청과 Altool 명령에 공통으로 적용한다. 규칙 본문은 standards의 Markdown, 선택 조건은 `standards/standard.yaml` 한 곳에서 관리한다.

## 작업 시작

1. `python3 altool/scripts/standards.py validate --root .`로 제품 헌법과 라우터를 검사한다. 헌법 누락·변경 시 제품 설치기로 복구하며 AI가 헌법이나 기준 hash를 고쳐 통과시키지 않는다. 라우터를 읽고 사용자 요청·현재 기능·변경 예정 경계에서 작업 의미 태그를 정한다. 기본 태그는 라우터의 `when`에서 찾으며 화면 이름이나 파일명 키워드만으로 분류하지 않는다.
2. `python3 altool/scripts/standards.py read --root . --tag TAG [--tag TAG]`로 직접 매칭과 requires의 원문을 구현 전에 읽는다. 코드/스키마/API에는 code-change/schema-change/api-change, API 오류 계약에는 error-contract를 함께 선택한다. UI는 ui-create/change/review뿐 아니라 login-ui/form-ui/search-ui/content-ui 등 과업 태그를 함께 선택한다. `asset_routes`의 종류는 `assets.py find --kind 종류`, 후보 ID는 `assets.py read 의미ID [--variant 변형]`으로 이어 간다. 후보 전체를 강제 사용하지 않는다. 모호한 범위는 `--all`로 활성 표준을 넓게 읽은 뒤 좁힌다. 문서 정리만은 `document-only`, 현황 조회만은 `status-only`이며 기능 구현의 면제 태그로 쓰지 않는다.
3. 태그·원문·앵커·의존 오류는 보완한다. 활성 표준 누락을 legacy로 우회하지 않는다. 원문이 TBD이면 Research/design_source에서 확정하고 구현으로 넘어간다. 준비 단계에서는 TBD를 읽고 보완할 수 있다.
4. 새 제품 엔진이 없는 legacy 프로젝트만 라우터 없이 기존 헌법·PRD·Spec을 따른다. 디자인은 `standards/design.md`가 있으면 우선, 없으면 `designs/design.md`를 사용한다. 이 경우 step/template의 canonical 디자인 경로 표기는 선택한 legacy 경로로 해석한다. 새 설치 이후 canonical은 `standards/design.md`; legacy 파일을 두 번째 원천으로 병행 수정하지 않는다.

## AI의 표준 유지관리

- 개발 요청마다 기존 공통 계약의 재사용 → 필요한 항목 갱신 → 새 공통 계약 추가 순으로 판단한다. 여러 기능이 같은 의미로 공유하거나 프로젝트 전체에 명시적으로 적용되는 규칙은 표준, 한 기능의 동작·예외·임시 선택은 PRD/Spec에 둔다. 단일 사례나 미래 재사용 추측만으로 공통화하지 않는다. 변경이 불필요하면 표준을 그대로 둔다.
- 프로필 선택과 YAML 편집은 AI가 담당한다. 비활성 후보도 프로젝트 목적에 맞는지 원문을 확인하고 필요한 프로필과 의존 관계만 활성화한다. `resolve`의 `inactive_candidates`는 검토 후보이지 의무가 아니다. 후보가 없더라도 실제 공통 계약이 필요하면 기존 항목에 통합하거나 새 표준·태그를 등록한다. 사용자에게 프로필명이나 파일 편집을 요구하지 않는다.
- 구현/검증 단계는 `standardsDecisions`를 Step Check 최상위와 UI usage의 형제 필드로 동일하게 기록한다. 현재 비활성 후보마다 `{decision:"not-applicable",scope:"기능 범위",reason:"원문과 대조한 비적용 근거"}`를 남긴다. 적용 대상이면 `applicable` 사유만 쓰고 진행하지 말고 필요한 프로필/항목을 활성화·재resolve한다. 사라진 후보 판단은 정리한다. 후보가 없으면 필드는 생략하거나 `{}`로 둔다. resolve JSON 자체에 판단 필드를 추가하지 않는다.
- 변경 전에 관련 표준·Spec·코드·테스트의 소비 지점을 찾는다. 요청 범위의 국소 변경은 기능 Spec에 남기고, 공통 변경이면 원문·라우터·영향받는 구현/테스트를 함께 갱신한다. 계약을 삭제·비활성화하거나 요구를 약화해 실패를 숨기지 않는다. 헌법에 반하는 표준은 만들지 않는다.
- 사용자의 의도가 명확한 요청은 그 범위 안에서 진행한다. 공통 변경이 요청 밖의 기존 동작·권한·데이터 호환성을 바꾸거나 제품 의도가 모호하면, 기술 선택 대신 사용자에게 보이는 영향만 설명하고 확인한다. 새 외부 작업이나 위험한 데이터 변경의 권한까지 추정하지 않는다.
- 판단 근거·적용 범위·영향·검증은 기존 Plan/Spec 결정 기록에 짧게 남긴다. 표준과 라우터를 함께 검증한 뒤 관련 기능을 회귀 확인하고 변경된 증거를 재생성한다. 완료 보고에는 사용자가 이해할 수 있는 공통 변경과 기능 한정 변경만 요약한다.

## 적용과 추적

- Plan은 활성 표준과 기능 범위를 대조한다. Spec에 `표준 적용` 표를 두고 규칙 ID/원문 항목 → 해당 기능의 적용 방식 → 코드·테스트/검증을 연결한다. 원문 전체를 Spec으로 복제하지 않는다.
- 필수 계약은 생략할 수 없다. 기본값은 명시적 프로젝트 요구로 구체화하고, 예시는 의무로 취급하지 않는다. 비적용과 예외를 구분하여 기존 Plan/Spec 결정 기록에 범위·근거·대체 검증을 남긴다. 상충하는 필수 계약은 조용히 선택하지 않는다.
- Run/Fix는 관련 표준 원문과 기능 Spec을 함께 적용한다. 변경 경계가 넓어지면 태그·의존 표준을 재선택한다. 새 세션·서브에이전트에는 원문 경로와 적용 항목을 전달하고 필요한 원문을 읽게 한다.
- Analyze는 Spec의 선택 목록만 믿지 않고 원본 라우터, PRD, 구현 경계에서 누락 표준을 독립적으로 재확인한다. UI 작업은 디자인 표준과 실제 화면까지 비교한다.
- 표준의 source는 등록된 원문이며 PRD는 범위 계약이다. PRD 참고자료는 관련 항목을 선별하여 경로·선택/제외 이유를 기록한다. 활성 필수 표준을 참고자료로 강등하지 않는다.

## 디자인 실측 완료 계약

UI 태그/선택 UI 표준 또는 기존 기능 계약이 있는 spec/analyze/fix/browser는 아래 증거를 사용한다. UI 없음은 기능 범위로 판단하며 태그를 빼서 면제하지 않는다. JSON 작성·측정은 `standards/tooling/README.md#ui`가 소유한다.

- Spec: `.altool/ui/{기능명}.contracts.json`에 원천 파일 hash, 구현 범위, 페이지·상태·viewport·selector·기대값을 고정하고 Spec에서 연결한다. Step Check에 `ui.contracts={path,sha256}`, `visual.ui_contracts=done`을 기록한다. 구현 전이므로 이 단계는 계약만 검사한다.
- Analyze: 독립 검증자가 변경 화면과 계약의 분모·출처·구현 범위를 대조한다. 누락된 컴포넌트·상태·desktop/mobile, 원천과 다른 기대값은 갭이다. 실제 관찰 없이 디자인 일치를 선언하지 않는다.
- Analyze/Fix: done을 주장하면 `ui.measurements={path,sha256}`의 원시 관찰을 재비교한다. 실측이 없거나 실패하면 `visual.ui_contracts=failed`와 이유 및 미해소 갭을 남긴다. 분석 자체의 완료와 UI 검증 통과는 다르다.
- Browser 및 Browser를 수행한 Freedom: 계약·원천·구현 fingerprint·Spec 소유 check 일치와 모든 관찰 재비교 PASS가 필수다. `no reference`는 회사 디자인 실측을 면제하지 않는다. oneshot은 자식 검사에 같은 게이트를 적용한다.
- computed style·실제 글자 크기·방향·위치는 자동 비교한다. 간격·잘림·시각적 적절성과 계약 분모 완전성은 독립 검토/추가 검사로 보완한다. hash만 갱신하거나 실패 화면에서 기대값을 역추출하지 않는다.

## 디자인 입력 탐색·갱신

이 절이 명령 간 공통 조건을 소유한다. 디자인 작업의 입력 로딩 시 적용하고, oneshot/freedom은 필요한 정규화를 별도 명령 요청 없이 실행한다.

- Claude 원본은 `designs/claude-design/` 아래 모든 HTML(`.html`/`.htm`, 하위 폴더 포함), Stitch는 `designs/stitch/` 아래 화면별 HTML·DESIGN.md·이미지, Pencil은 `designs/` 아래 `.pen`을 탐색한다. 빈 폴더는 소스가 아니다. 여러 화면과 연결된 로컬 CSS·JS·이미지·폰트도 원본 상대 경로 그대로 읽고 평탄화하지 않는다. 일반 스크린샷·디자인 문서도 관련 입력으로 선택한다.
- 원본과 `standards/design.md`의 Reference Source Map을 대조한다. 계약 누락·빈 내용·첫 줄 TBD, 원본/보조 자산의 추가·변경·삭제, 출처 매핑 누락, 사용자 변경 요청과 계약의 충돌이면 재정규화한다. mtime만으로 최신을 확정하지 않는다. Map에 사용한 원본·보조 자산 경로와 내용 hash를 남기고 다음 입력 로딩 때 비교한다. 기존 Map에 hash가 없으면 원문과 계약을 대조해 갱신 필요 여부를 판단하고 출처 기록을 보완한다.
- Claude HTML/Pencil/Stitch가 관련되면 `design_source`, 일반 이미지·문서만 있으면 Research에서 계약을 동기화한다. 사용한 원본이 삭제돼도 이전 Map과 비교하고 대체 원천·권위가 모호하면 확인한다. 같은 화면의 원본이 충돌하면 자동 병합하지 않는다. 원본 불변·계약 일치이면 정규화를 생략한다.
- 갱신 시 영향받는 공통 계약과 화면별 Spec을 구분하고 기존 anchor를 보존한다. 계약·라우터 검사 후 관련 구현/검증 증거를 갱신한다. 새 Map/hash 기록만으로 실제 디자인 반영을 검증했다고 보고하지 않는다.

## 검증 증거

공통 UI 자산은 `standards/design.md#assets`의 필수 재사용 계약에 따라 `assets.py find/resolve/read`로 선택한다. registry는 채택된 의미 ID·허용 변형, catalog는 비채택 참고까지 포함한 색인이다. `guidance`의 company-contract는 선택 자산의 회사 적용 지침이고 `references`는 별도 참고 MD다. 사용한 자산·의존 파일·회사 지침만 필수로 읽고, KRDS 원문은 근거/예외가 필요할 때 읽는다. 사용자 디자인 입력 탐색에서는 번들 자산을 사용자 업로드로 오인하지 않는다.

### UI 적용 증거 (일반 개발·Altool 공통)

회사 팩 배포 전 CSS 검사는 제품 제작기가 담당하고 소비 앱의 실제 표시 검증을 대신하지 않는다. UI-03의 측정 방법은 `standards/tooling/README.md#ui`가 소유한다. 동일 관찰 파일로 여러 요구를 증명할 수 있으나 요구 ID별 결과와 적용 조건은 유지한다. 공통 CSS 우선순위·아이콘 의미는 제품에서 해결하고, 화면 밀도·SVG 글자 크기는 실제 소비 화면에서 확인한다.

1. 구현 전에 표준 read 결과·과업 분류·선택 ID/variant·회사 지침 항목을 Spec의 표준 적용 표에 연결한다. 회사 적용 Markdown은 `designs/assets/guidance/`가 소유하며 자산과 함께 릴리스한다. 원문 KRDS 카드와 회사 계약을 병행 수정하는 두 원천으로 만들지 않는다.
2. `.altool/asset-usage/{feature}.json`에 기존 uiFiles/uses/featureOnly와 함께 `routing`으로 현재 standards resolve JSON을 넣는다. `assets.py requirements --usage ...`는 필요한 표준 규칙·자산 지침·constraints·선택 states와 `requirementsSha256`을 반환한다. 이 명령은 성공 기록을 만들지 않는다.
3. 실제 테스트/브라우저 관찰 후 requirementsSha256과 각 요구 ID의 `checks`를 기록한다. 체크 구조는 `{"id":"반환된 요구 ID", "status":"passed", "observation":"실행 명령 또는 화면·상태·실제 결과", "evidence":[{"path":"프로젝트 내 검증 보고/로그/캡처 경로", "sha256":"해당 파일의 SHA256"}]}`다. 조건이 실제로 없을 때만 `not-applicable`과 범위가 분명한 `reason` 및 근거 파일을 기록한다. 필수 계약 위반/승인 필요 예외는 N/A로 통과시키지 않는다. failed/pending/누락은 완료 실패다.
   - 요구의 `kind`는 required/default다. `- 필수 ID:`, `- 기본값 ID:`, 미표기 `- ID:` 형식을 읽으며 미표기 회사/UI 계약은 required를 유지한다. `- 예시 ID:`는 읽기 참고이고 완료 요구로 만들지 않는다. 표·하위 문장은 소유 규칙의 원문 근거로 함께 검증하며 행마다 요구 ID를 늘리지 않는다.
   - 기본값을 명시적 프로젝트 계약으로 대체했다면 default 요구에만 `default-overridden`과 범위·대체 계약을 설명하는 reason 및 실제 검증 evidence를 남긴다. 적용되는 required는 대체할 수 없고 진정한 비적용만 근거로 설명한다. 새 추출 형식으로 지문이 달라진 기존 기록은 원문을 다시 읽고 실제 재검증한 뒤 갱신한다. 소비 파일 hash 제거·자동 PASS/증거 재발행은 하지 않는다.
4. `assets.py evidence --usage ...`를 실행하여 Step Check의 `assets`에 넣는다. Step Check의 `standards`와 usage.routing은 동일해야 한다. 일반 개발도 같은 명령을 완료 전에 실행한다. 구현/지침/라우터/검증 파일이 변경되면 영향 항목을 실제 재검증한 후 기록한다. hash만 갱신하지 않는다.
5. Analyze는 PRD·Spec·git diff·실제 화면에서 과업 태그, 변경 UI 목록, 자산·상태 누락과 N/A 타당성을 독립 대조한다. 구조/hash/파일 존재가 원문을 읽고 이해했거나 배치가 올바르다는 자동 증명은 아니다. 의미 준수는 테스트와 브라우저에서 확인한다.

기존 팩/사용 기록에는 새 지침 증거가 없을 수 있다. 새 라우팅 업그레이드는 회사 팩과 관련 표준을 함께 검토·배포하고 소비 앱 검증을 수행한다. 기존 설치본에 지침을 자동 덮어쓰거나 이전 브라우저 통과를 새 지침 통과로 환산하지 않는다.

`python3 altool/scripts/standards.py resolve --root . --tag TAG [--tag TAG]` 결과 JSON을 작업 Step Check 최상위 `standards`에 그대로 넣는다. `--all`로 읽었으면 resolve도 `--all`로 기록한다. 기존 `inputs.loaded`에는 선택 이유, `verification`에는 규칙별 실제 테스트/관찰 결과를 연결한다.

`check.py validate`는 라우터가 있는 프로젝트의 research/plan/spec/run/analyze/fix/browser/oneshot/freedom/design_source에서 선택 결과와 현재 원문 hash를 재검증한다. oneshot은 자식 증거도 확인한다. 표준/라우터 변경 시 관련 계약과 테스트를 다시 검토한 뒤 증거를 재생성하며, hash만 갱신해서 검증한 것으로 보고하지 않는다.

표준 라우터와 Step Check의 구조 검사는 올바른 태그 선택이나 의미적 준수 자체를 증명하지 않는다. 주요 계약은 린트·스키마·권한/트랜잭션 통합 테스트·브라우저 관찰로 증명한다. 자동 검사 없는 항목은 수동 증거나 미검증 상태를 명시한다.

## 라우터 편집

- YAML 스키마: `version: 1`, `active_profiles`, `standards`. 각 표준은 `profile`, `when`, `source`, `sections`, `requires`를 지정하며 선택적으로 `asset_kinds`, `asset_ids`를 추가한다. `source`는 standards/ 내부 상대 Markdown 경로다. 자산 필드는 등록된 종류/의미 ID 후보를 연결하며 지침 본문을 복제하지 않는다.
- 기본 프로필 base는 사내 공통 명명·용어·코드 경계, 스키마, API/오류 계약과 디자인·공통 UI 지침을 작업별로 선택한다. engineering은 코드/변경 UI, schema는 스키마, api는 API/오류 계약에 적용하므로 매번 모든 항목을 읽지 않는다. JS/TS 명명 검사 자원은 standards/tooling/에 있으며 AI가 소비 앱의 기존 lint에 연결하고 확인한다.
- internal-common은 사내 배포 여부가 아니라 조직/역할/감사/일괄 입력 기반 기능의 선택형 묶음이다. 이 기반이 실제 요청에 맞으면 AI가 `active_profiles: [base, internal-common]`을 선택한다. 프로필 묶음 전체가 맞지 않으면 필요한 계약만 분리·등록한다. 기술 기본값 internal-stack도 선택형이며 단순 앱/업로드에 DB·관리 시스템 전체를 강제하지 않는다. 헌법의 기본 보안 요구는 프로필 선택과 무관하다.
- 항목은 Markdown의 독립 줄 `<a id="audit"></a>`부터 다음 anchor 직전까지다. `sections: ['*']`는 전체 파일. 머리말에만 필수 규칙을 두지 말고 적용 항목 안에 포함한다. 누락/중복 anchor는 오류다.
- 디자인 재생성 시 기존 anchor를 보존한다. 라우터가 세부 항목을 가리키면 출력 항목과 동기화한 뒤 `python3 altool/scripts/standards.py validate --root .`를 실행한다.
- YAML 파서는 제품의 `altool/vendor/`에 포함된다. 사용자 pip 설치는 필요 없다. 디렉터리에 파일을 추가하는 것만으로 정책이 활성화되지는 않는다.
