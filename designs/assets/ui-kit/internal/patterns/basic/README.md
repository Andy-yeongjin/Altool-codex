# KRDS 2024.02 기본 패턴 자산

기본 패턴 목차 11종을 독립적인 HTML 예제, 공통 CSS/JavaScript, 적용 체크리스트로 제공한다. [목록 열기](index.html). 97개 체크리스트는 원문 지시를 재사용 관점에서 묶은 목록이며 PDF의 모든 번호와 1:1 대응하거나 준수 인증을 의미하지 않는다.

## 사용

- 서버에 `patterns/basic/`와 manifest 의존 자산의 상대 경로를 유지해 올리거나 로컬 HTTP로 연다. 외부 CDN·서버 API는 필요하지 않다. 색상·서체·크기·간격은 공통 `foundations/tokens-2024.css`, 파일 아이콘은 공식 고정 SVG, 네트워크 오류 문구는 `messages/ko.json`을 사용한다.
- 선택한 HTML의 패턴 구획과 `basic.css`, `basic-core.js`, `basic.js`를 함께 복사해 시작한다. `body[data-pattern]`은 패턴 초기화를 선택한다. 여러 패턴을 실제 앱에서 결합할 때 DOM ID 중복과 초기화 범위를 조정한다.
- 이 코드는 프레임워크에 종속되지 않는 조합 예제다. 모든 프로젝트에서 모든 필드를 표시하는 공통 컴포넌트가 아니다. 업무상 필요하지 않은 개인정보·동의·고급 필터는 추가하지 않는다.
- 입력은 전송하지 않는다. 폼 임시 저장은 현재 탭의 메모리만 사용하며 새로고침하면 사라진다. 실제 제출·저장·인증·권한·서버 검증은 해당 서비스가 구현해야 한다.
- JS가 로드되지 않으면 동작 예제로 사용하지 않는다. 실제 개인정보를 입력하지 말라는 안내와 `noscript` 안내를 유지한다.
- 모든 authored CSS는 `krds-2024-tokens`를 명시적으로 적용한다. 동일 회사 팩 안에서 같은 의미의 색·서체·간격을 임의로 다시 정하지 않는다. 사이트 구조상 필요한 레이아웃 변형은 유지한다. 이 번들이 고객 디자인이나 CI를 암묵적으로 덮어쓰지는 않는다.

## 자산과 검증 범위

| PDF 본문 | 패턴 | 예제 |
| --- | --- | --- |
| 553–572 | 개인 식별 정보 입력 | [identity.html](identity.html) |
| 573–589 | 도움 | [help.html](help.html) |
| 590–596 | 동의 | [consent.html](consent.html) |
| 597–601 | 목록 탐색 | [list.html](list.html) |
| 602–611 | 사용자 피드백 | [feedback.html](feedback.html) |
| 612–625 | 상세 정보 확인 | [detail.html](detail.html) |
| 626–630 | 오류 | [error.html](error.html) |
| 631–650 | 입력폼 | [form.html](form.html) |
| 651–655 | 첨부파일 | [attachments.html](attachments.html) |
| 656–676 | 필터링·정렬 | [filter.html](filter.html) |
| 677–681 | 확인 | [confirm.html](confirm.html) |

`mapping.json`의 `assets` 경로는 `designs/assets/ui-kit/internal/` 기준 상대 경로다. `sourceBodyPages`는 실제 본문 범위이며 기존 coverage의 확인 항목 p677–685 중 p682–685는 서비스 패턴 장 전환이다.

추가 UI 대안: [상세 정보 탭](detail-tabs.html), [필터 수평바·모달](filter-layouts.html). 이 두 페이지는 기존 패턴에 `variants.css`와 `variants.js`를 더해 독립적으로 실행한다. 필요한 대안을 선택하여 쓰며 실제 업무에 모든 변형을 동시에 강제하지 않는다.

추가 회사 공통 상태·대안: [입력·동의](field-variants.html), [도움·피드백·미디어](content-variants.html), [요청 상태·숫자 범위](state-variants.html). [72개 의미별 변형 manifest](variants-manifest.json)에서 경로·구획·상태·원문 범위·의존 파일을 선택한다. 세부 구현과 실제 브라우저 시나리오는 [확장 설명](extended.md)을 따른다.

목록·필터는 `basic-navigation.js`로 상세 복귀 시 검색·적용 조건·페이지·스크롤·초점을 복원한다. URL fragment에는 탐색 정보만 기록하며 개인 식별·동의·평가·입력폼 값은 넘기지 않는다. 미디어 파일은 사용자가 선택한 로컬 Blob URL로만 연결한다. 서버로 업로드하지 않는다.

원문 11개 추출 문서의 전체 텍스트를 읽고 p591 동의 구조를 원본 렌더링과 대조했다. PDF 모든 그림의 정밀 복제나 2024 이후 공식 구현 버전과의 일치를 주장하지 않는다. 자체 제작 예제에는 정부의 공식 누리집 표시, 기관 로고, 제3자 브랜드, 원문 반례의 개인정보를 복제하지 않았다.

## 자동 확인

저장소 루트에서 실행한다.

```sh
node --check designs/assets/ui-kit/internal/patterns/basic/basic-core.js
node --check designs/assets/ui-kit/internal/patterns/basic/basic.js
node --check designs/assets/ui-kit/internal/patterns/basic/variants.js
node --test tests/test_krds_basic.cjs
python3 -m unittest tests.test_krds_basic -v
```

Node 테스트 22개는 생년월일/전화/이름, 동의, 페이지, 필터, 범위, 파일 크기, 탭·모달 이벤트, 탐색 상태 직렬화/보안/복원, 요청 전이, 복수 선택, 72개 manifest 경로, 공통 메시지 원문 연결을 검사한다. Python 테스트 6개는 원문 누락, 자산 경로, ID/ARIA, 레이블, 로컬 링크, 버튼 유형, 기본 미선택, 비수집·안전한 텍스트 삽입, 전체 페이지의 공통 토큰 연결을 검사한다.

자동 검사 통과는 실제 키보드·포커스·터치·스크린리더·반응형 동작의 증명이 아니다. 각 패턴 Markdown과 `mapping.json`에 UI 상태별 브라우저 시나리오와 실제 데이터/서버 어댑터 경계를 기록했다. 부모 작업이 실제 브라우저 검증을 수행하고 통합 보고에 결과를 남긴다. 미검증 범위는 완료 처리하지 않는다.

## 출처·권리

행정안전부, **디지털 정부서비스 UI/UX 가이드라인(2024.02)**, 기본 패턴 p553–681, 공공누리 제1유형(출처표시). 원문 출처와 전체 범위는 [상위 출처 기록](../../ATTRIBUTION.md)을 따른다. 이 디렉터리의 코드는 Altool 독립 제작 예제이며 정부 인증·법적 적합성·접근성 인증을 뜻하지 않는다. 공식 upstream 코드를 이 디렉터리에 복사하지 않았다.
