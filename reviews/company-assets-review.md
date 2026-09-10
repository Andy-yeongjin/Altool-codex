# 회사 공통 자산 게이트 독립 검수

## 메타데이터

- 범위: assets.py, build_company_assets.py, runtime/assets.mjs, standards.py 설치, check.py 통합
- 검수자: krds_patterns 서브에이전트 (Claude 검수가 아님)
- 사용자 승인 범위: 회사 공통 자산 선제작·필수 재사용 구조의 추가 구현. 아래는 그 구현의 결함 수정이며 외부 작업은 없음.
- 상태: 재검수 대기
- 최신 상태 (2026-09-08 독립 재검수): H-1~H-4 승인, 이 문서의 4건 검수 종료. 초기 상태와 개발자 응답은 아래에 보존한다.

## 항목 기록

### H-1 — 단계명 공백으로 자산 게이트 우회 (P1)

검수: check.py는 strip/casefold하지만 assets.py는 lower만 사용. `run`은 증거 누락 오류, ` run `은 빈 오류 목록으로 재현.

> Codex: 정확함. 단계 정규화를 strip().casefold()로 통일했다. 공백/대문자 단계에서도 사용 증거 누락이 실패하는 회귀를 추가했다. 현재 구현 검증 및 검수자 재확인 대기.

> ✅ krds_patterns 재검수 승인 — 2026-09-08: 현재 `validate_evidence`의 `strip().casefold()`와 check.py의 정규화가 일치한다. 격리된 최소 팩에서 `step=' RUN '` + `ui-create` + 증거 누락이 오류를 반환함을 독립 재현했다. `python3 -m unittest tests.test_company_assets -v`의 공백/대문자 UI 게이트 회귀도 통과했다. H-1 종료.

### H-2 — 주석 참조 승인·소비 파일 변경 후 증거 재사용 (P1)

검수: 소비 파일 전체의 ID 부분문자열만 확인하며 소비 파일 hash가 증거에 없었다. 주석만 남기거나 구현을 바꿔도 기존 evidence 통과를 재현.

> Codex: 정확함. HTML/C 스타일 주석을 제외한 인용 문자열/속성 참조를 검사하고 evidence에 실제 소비 파일 SHA256을 포함했다. 주석만 있는 코드와 ID를 유지한 구현 변경 모두 실패하도록 회귀를 추가했다. 문자열 참조가 실제 실행·전체 의미 준수를 완전히 증명한다는 주장은 하지 않으며 브라우저/Analyze 대조를 병행한다.

> ✅ krds_patterns 재검수 승인 — 2026-09-08: 격리 팩에서 `// 'icon.settings'`, `/* 'icon.settings' */`, `<!-- "icon.settings" -->` 세 주석 형태만 있는 소비 파일을 각각 거부했다. 실제 인용 참조 `assets.icon('icon.settings');`는 승인되고, 증거 생성 후 동일 ID를 유지하면서 `changed();`를 추가하면 기존 evidence가 거부됨을 독립 재현했다. 증거의 `consumers` 해시가 현재 파일에 결합되어 원래의 오래된 증거 재사용 문제를 해결했다. 회사 자산 테스트의 해당 회귀도 통과했다. 승인 범위는 주석 제외 참조 검사와 바이트 변경 탐지이며, 인용 문자열의 실제 실행·모든 UI 의미 준수 증명은 아니다. 브라우저/Analyze 대조가 필요하다는 개발자 경계 설명을 확인했다. H-2 종료.

### H-3 — 중간 버전을 거친 동일 버전 재발행 (P2)

검수: 현재 release만 비교하여 1.0.0→1.1.0→1.0.0에 서로 다른 바이트를 배포할 수 있었음.

> Codex: 정확함. 제작용 releases.json에 release별 lock SHA256 이력을 보존하고 과거 버전의 다른 내용 재발행을 거부한다. 검증 명령은 이력을 쓰지 않는다. 중간 버전을 거친 되돌림 회귀를 추가했다.

> ✅ krds_patterns 재검수 승인 — 2026-09-08: 별도의 임시 제작 루트에서 `1.0.0 → 동일 바이트 1.0.0`은 허용되고, 내용 변경 후 `1.1.0 → 다시 내용 변경 → 1.0.0`은 `historical version was already published` 오류로 거부됐다. 거부 전후 registry.json·pack.lock.json·releases.json 바이트가 모두 그대로임도 확인했다. 실제 저장소를 대상으로 릴리스하지 않았다. `test_same_release_cannot_be_reissued_with_changed_content`와 `test_historical_release_cannot_be_reissued_after_another_version` 모두 통과했다. H-3 종료.

### H-4 — prototype 변형 이름 승인 (P2)

검수: `item.variants[name]`이 상속 프로퍼티도 참으로 보아 toString/constructor/__proto__에 resolve 객체를 반환. icon의 후속 검증 통과를 주장한 것은 아님.

> Codex: 정확함. Object.hasOwn으로 등록된 키만 허용하고 세 이름 모두 즉시 거부하는 런타임 회귀를 추가했다.

> ✅ krds_patterns 재검수 승인 — 2026-09-08: 현재 `Object.hasOwn(item.variants, name)`를 확인했다. 독립 메모리 fetch fixture에서 `not-registered`, `toString`, `constructor`, `__proto__` 네 이름이 모두 `Unapproved variant`로 resolve 단계에서 즉시 거부되고, 등록된 default는 정상 반환됐다. `node --test tests/test_company_runtime.mjs`의 해당 회귀를 포함한 6개 테스트도 통과했다. H-4 종료.

## 논의

2026-09-08: 제작 중 QA 팩의 hash가 바뀌는 상태는 최종 릴리스 전에 재발행해야 하는 개발 상태이며 이를 검증 면제로 사용하지 않는다. 디스크 소유자를 막는 보안 장치나 모든 UI 의미를 자동 판별하는 시스템은 범위가 아니다. 같은 회사가 같은 릴리스를 소비할 때의 결정론적 선택·변경 탐지가 범위다.

## 검증 기록

수정된 회귀의 실제 명령/결과 및 검수자 최종 의견을 아래에 추가한다.

### 2026-09-08 — krds_patterns 독립 재검수

- `python3 -m unittest tests.test_company_assets -v`: **10/10 PASS**, 약 2.05초. 원본 변경 거부, 설치 충돌 시 쓰기 전 실패, UI 증거, 소비 파일 변경, 동일·과거 릴리스 거부 포함.
- `node --test tests/test_company_runtime.mjs`: **6/6 PASS**. 두 소비자의 동일 선택, 미등록/prototype 변형 거부, 변조된 registry/문구 거부, 정확한 문구 DOM·아이콘 바이트 확인 포함. DOM은 테스트 대역이며 실제 브라우저 결과로 표시하지 않는다.
- `python3 altool/scripts/assets.py validate`: **PASS**, `altool-company-ui@1.0.0-qa.3`, semantic item **165개**.
- Python 임시 fixture 독립 재현: H-1 단계 정규화, H-2 세 주석 형태 및 소비 파일 변경, H-3 같은 바이트 재발행 허용·과거 버전 다른 바이트 거부·실패 전후 3개 제작 파일 불변 — 모두 **PASS**. tempfile 컨텍스트 종료로 임시 진단 자료만 자동 정리됐고 저장소 팩은 변경하지 않았다.
- Node 메모리 fixture 독립 재현: H-4 네 미등록 이름 즉시 거부·등록 default 허용 — **PASS**.
- Python `compile(...)`로 assets.py·build_company_assets.py·standards.py·check.py 구문 **4개 PASS**(pyc 생성 없음). `node --check designs/assets/runtime/assets.mjs` **PASS**.
- 이번 재검수는 이 문서만 수정했다. UI 파일·프로덕션 코드·테스트·registry·lock·제작 이력은 수정하지 않았다. 기본 패턴 브라우저 QA는 루트 담당 작업이며 이번 게이트 검수 승인과 별개다.

## 최종 판정

- 판정: pending
- 항목4건, 개발자 응답4건, 검수자 수정 후 승인0건

### 최신 최종 판정 — 2026-09-08

- 판정: **승인 / H-1~H-4 검수 종료**. 위 pending·승인0건은 최초 재검수 요청 당시의 기록이다.
- 전체 항목 **4건**, 개발자 응답 **4건**, 수정 후 검수자 승인 **4건**, 독립 재현 확인 **4건**.
- 체크박스는 이 문서에서 사용하지 않는다. 미응답·재개·미해결 거절·분쟁·보류 항목 **0건**. 후속 `🔁` 항목은 **0건**, 수정 후 재검수는 이번 **1회**.
- 이번 재검수에서 추가로 확인된 심각한 결함은 없다. 설치 공통 팩 보존은 기존 사전 검증·보존 파일 집합 처리를 확인했고, 설치 충돌 회귀도 통과했다.
- 적용 경계: 회사 팩의 결정론적 선택, 승인된 변형 여부, 파일·증거의 변경 탐지에 대한 승인이다. 디스크 소유자의 의도적 이력 삭제를 막는 보안 통제, 모든 인용 문자열의 실제 실행 판별, 모든 UI 의미 자동 판별, 전체 PDF 자산의 실제 브라우저 QA 완료를 뜻하지 않는다.
