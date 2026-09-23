# test6 미완료 후속 검증

## 범위와 결정

사용자 승인: 미통과 원인을 해결한다. 원본 공통 팩 결함과 소비 앱의 미관찰/미기록 검증을 구분하며 게이트를 약화하지 않는다.

공통 수정 계약: 미선택 파일의 FormData 생성 시각은 dirty 판정에서 제외한다. 이름 있는 0바이트 파일 및 선택 파일의 변경 시각은 유지한다. 미저장 이동의 긍정 버튼은 실제 버리기·이동을 명시하며 취소는 편집을 유지한다. 저장 완료 시점 snapshot 계약은 보존한다. 외형은 변경하지 않는다.

표준 선택: code-change/form-ui/error-contract. 제품 원본의 design.md는 설치용 TBD 템플릿이며 이번 동작 수정의 원천은 기존 BUSINESS-USAGE.md이다. API 서버/DB 및 internal-stack은 이번 수정에 비적용이다.

## 항목

- H-1 정확: confirm.leave.action이 계속 편집인데 mayLeave는 true를 반환하여 이동한다. 메시지 원본의 긍정 액션을 변경 내용 버리고 이동으로 수정. 단위 및 root의 실제 모달 취소/긍정 이동 검증 통과.
- H-2 정확: 빈 파일 lastModified가 매번 달라지는 환경에서 false dirty 발생. 빈 파일을 null로 정규화. 이름 있는 빈 파일·실제 파일 시각 변경·저장 이후 추가 편집 단위 검증 통과.
- V-1 실제 200% 확대 검증 대기.
- V-2 root 실제 저장 실패 UI 검증 통과. 입력·첨부 보존/접수0, 정상 재시도 접수1 확인. 복구 후 오류가 남는 앱 결함도 수정하고 재현 순서로 통과했다.
- V-3 요구별 증거 연결 및 oneshot 재검증 대기.

## 검증 기록

- `node --test tests/test_dirty_guard.mjs`: 2/2 통과. vm에서 원본 함수를 실행하며 UI 검증을 대체하지 않는다.
- `.venv/bin/python -B -m unittest discover -s tests`: 기존 215/215 통과.
- `node --check designs/assets/ui-kit/internal/company/dist/business.js`: 통과.
- `assets.py validate`, `standards.py validate`, `git diff --check`: 통과. 제품 팩 `2.0.0-qa.39`로 발행(299 의미 자산/380 고정 파일). 설치본 검증은 별도 진행한다.
- test6 기존 browser.md와 증거는 유지하며 후속 검증은 추가 기록한다.
- test6 `.altool/evidence/root-remediation-browser.json`에 실제 상호작용 기록. `법인카드-업무.remediation-measurements.json`에 변경 후 64개 실측을 수집했고 비교 통과를 확인했다. 이는 200% 확대를 증명하지 않는다.

## 판정

수정 및 부분 검증 완료. 전체 oneshot 완료나 전체 독립 재검수 승인을 아직 주장하지 않는다. native Codex 앱 자동 접근은 안전정책 거절이므로 우회하지 않는다. 사용자 직접 200% 확대 및 파일 선택창 취소 조작 등 잔여 관찰 조건을 다음 검증에 연결한다.
