# Round 3 합의 수정 Spec

> 현재 문서 분류·검증 한계: [제품 문서 상태 색인](../../verification-status.md). 아래 과거 기록은 당시 실행 범위이며 최신 Altool 완료 판정을 대신하지 않는다.

상태: 합의12건 구현·Claude 재검수 완료, R3-03 보류 — 제품 개발 계약. 실행 결과는 리뷰 정본의 R3 후속 기록에 연결한다.

| 항목 | 최소 계약·회귀 |
| --- | --- |
| R3-05 | 공통 복사 필터가 .DS_Store/Thumbs.db/._*만 제외. 양쪽 설치 엔진·표준·자산에 적용. Kit 정확 집합 검사는 동일 필터만 사용하며 temp.css는 실패. upstream hash 규칙 유지. |
| R3-01 | 규칙 kind=required/default/example. 미표기 기존 UI/회사 규칙은 required. ID 있는 불릿이 단위이며 표는 소유 규칙의 원문 근거로 검증(행마다 ID 생성 안 함). ENG-05 불릿 정리. default 대체와 실제 비적용은 근거 기록, applicable required 대체는 금지. 기존 소비 hash 유지. |
| R3-02 | Step Check/usage의 standardsDecisions는 resolve와 별도 형제 필드. 구현 단계의 현재 inactive_candidates와 정확히 대응하는 {decision,scope,reason} 맵. not-applicable만 그대로 진행 가능; applicable은 프로필/항목 활성화·재resolve 필요. stale/누락/추가 판단 거부. assets 내부 검사 및 Step Check와 usage의 판단도 일치. |
| R3-04 | checkUiMeasurements 정본은 altool/scripts/ui-contracts.mjs. standards/tooling은 수집기+비교기 재수출. 게이트는 제품 정본 직접 import. 회사 재수출 변조/삭제가 제품 판정에 영향 없음. |
| R3-06 | 현재 preflight의 두 카운터를 단위와 함께 출력·보존. 실패 차단 유지, 세 번째 카운터·임계값 도입 없음. |
| R3-07/10 | 감사 로그만 불변 계약 추가. tmp_의 임시 수명, 문맥상 무의미 이름(API data 키 예외), 공통관리 업로드 작성요령 순서를 실제 채택 범위와 대조표에 연결. |
| R3-08 | CSS 작성 원본2/사전검사12/layer2(전체14/layer3)를 파일별 문서화. 일반 캐스케이드의 구체성/동일 계층 순서 한계 명시. CSS 변경·팩 발행 없음. |
| R3-09 | css-vars의 명시적 제외 경로 인자. 기본 전체 검사 유지. 공식 제품 검사 호출만 의도적 fixture 제외; 미제외 fixture 실패 회귀 유지. |
| R3-11 | 루트 제3자 색인은 하위 라이선스·버전 근거에 링크. 법적 적합성 판단/원문 복제 없음. |
| R3-12 | 제품 문서별 종류·검증 상태·근거를 명시. 과거 checks 생성/전역 감사 면제 없음. 현재 감사 실패와 경로 밖 analysis 문서도 보고. |
| R3-13 | required 분기의 UTF-8 읽기. registry 단락과 required marker 분기는 유지. 비UTF-8 모의 환경 테스트, Windows 실실행과 구분. |

## 표준 적용·완료

ENG-06/APP-01: 기존 언어·작업 경계 유지, 순수 비교기의 코드 복제 없이 소유권만 이동. TERM-01: 같은 판단 필드·종류를 코드/문서/회귀에서 통일. 필수 계약의 진정한 비적용은 근거로 허용하지만 위반 면제는 아니다. 테스트 fixture의 임의 PASS는 테스트 전용이며 실제 증거를 자동 생성하지 않는다. 최종 구현/검증 상태는 리뷰 문서와 문서 분류 색인에 기록한다.
