# 전사 공통 디자인 자산 · v27

> Altool 통합본: 외형 원본은 `../../design/`, 공통 JS·아이콘 원본은 이 폴더의 js/icons다. 사용자 전달 폴더는 이력으로 보존한다. 비활성 글자색만 사용자 승인으로 #5F6873으로 보정했고 시스템 오류/빈/로딩 문구는 회사 messages/ko.json으로 통합했다. 아래 전달 당시 QA는 실브라우저 완료가 아니다. 현재 결과는 제품 docs/03-analysis/features/company-design-v27.analysis.md에 기록한다.

사내 업무 화면을 같은 버튼·입력·표·상태·조회조건 규칙으로 만드는 공통 자산입니다.
화면 배치는 업무에 맞게 조합하되, 공통 컴포넌트를 우선 사용합니다.
실행 UI는 v27 한 벌로 통일했습니다. 빠졌던 기능은 회사 extensions와 recipes로 보완했으며 정부 디자인 실행 자산으로 돌아가는 호환 경로는 없습니다.

## 시작하기

| 목적 | 확인할 문서 / 화면 |
|---|---|
| 현재 승인 디자인과 적용 방법 | [GUIDE.md](GUIDE.md) |
| 기본 요소·아이콘 133개 | [catalog.html](catalog.html) |
| 보완 컴포넌트 24개 ID·37변형 | [extensions/preview.html](extensions/preview.html) · [선택 목록](extensions/registry.json) · [사용 API](extensions/README.md) |
| 기본·서비스 레시피 및 날짜 연결 18개 ID·90변형 | [recipes/README.md](recipes/README.md) · [선택 목록](recipes/registry.json) |
| 회사 페이지 배치 | [layout-preview.html](layout-preview.html) |
| 업무 요소 12종 조작 예제 | [business-preview.html](business-preview.html) |
| 파일 첨부 A | [attachments-preview.html](attachments-preview.html) |
| 가로 조회조건 정렬 | [filter-bar-preview.html](filter-bar-preview.html) |
| API와 데이터 연결 | [docs/BUSINESS-USAGE.md](docs/BUSINESS-USAGE.md) |
| 배치·값·상태·행동 규칙 | [docs/CONSISTENCY.md](docs/CONSISTENCY.md) |
| 조회·등록·목록상세·대시보드 조합 | [docs/PAGE-PATTERNS.md](docs/PAGE-PATTERNS.md) |
| AI가 선택할 요소 목록 | [components.json](components.json) |
| 완료한 검증과 남은 확인 | [QA.md](QA.md) |

## 앱에 적용

```html
<link rel="stylesheet" href="/assets/company.css">
<div class="krds-2024-tokens altool-ui" data-density="standard">
  <!-- 공통 컴포넌트로 업무 화면 구성 -->
</div>
<script src="/assets/select.js"></script>
<script src="/assets/business.js"></script>
<script>
  CompanySelect.enhanceAll();
  // 필요한 업무 요소만 CompanyBusiness API로 초기화
</script>
```

`dist/company.css`, 필요한 JS, 아이콘을 앱의 정적 경로에 복사하세요. Altool에서는 먼저 registry의 의미 ID를 선택하고 lock/의존 파일과 사용 증거를 함께 배포합니다.
단일 드롭다운은 `select[data-ui-select]`, 업무 동작은 `CompanyBusiness`의 해당 함수를 명시적으로 연결합니다.
CSS만 로드하면 조회·저장·업로드가 자동 구현되지 않습니다. DB·권한·인증·실제 저장은 앱이 담당합니다.

## 현재 디자인 기준

- Pretendard 계열 공통 폰트 지정. 폰트 파일은 포함하지 않으며 앱에서 사내 승인 경로로 로드합니다. 미로딩 시 대체 폰트를 사용합니다.
- 주요 파랑 `#1554A0`, 상단 `#18334F`, 중립 회색 배경·테두리.
- 버튼 D, 버튼·입력 외곽 4px. 아이콘은 선택 사항이며 Lucide 120개와 Altool 자체 제작 13개로 구성된 133개에서 선택합니다.
- 기본 컨트롤 최소 높이는 34px, compact 30px, comfortable 42px(16px 루트 기준). 컴포넌트별 터치·콘텐츠 예외는 실제 CSS를 따릅니다.
- 표 A: 가로선·회색 제목행·연한 파랑 선택행. 상태는 색상 점과 문구를 함께 표시합니다.
- 첨부 A: 회색 도구 영역, 공통 파일 추가, 개수·총용량, 파일명·크기·개별 해제.
- 가로 조회조건: `ui-filter-bar`의 조건별 단일 라벨+입력. 기간은 승인 시작일/승인 종료일로 나누고 오류는 별도 행에 표시합니다.

모서리를 전부 4px로 바꾸지 않습니다. 영역선·표·진행선은 직각, 상태 점은 원형 등 승인된 예외를 유지합니다.

## 구성과 책임

| 위치 | 역할 |
|---|---|
| `../../design/theme.css`, `../../design/components.css` | CSS 편집 원본 |
| `js/select.js`, `js/business.js` | 공통 동작 편집 원본 |
| `dist/` | 빌드 결과. 직접 수정하지 않음 |
| `examples/` | 업무 통합 예제의 마크업·배치·샘플 동작 |
| `extensions/` | v27 보완 컴포넌트의 생성 원본·재사용 fragment·런타임·변형 registry |
| `recipes/` | 기본·서비스 조합의 HTML·중립 JS와 재현 생성 registry |
| `components.json` | 업무 API 13개 그룹(첨부 포함), 조회조건과 추가 자산 모음 진입점 |
| `dist/assets/icons.json`, `icons/AI-USAGE.md` | 아이콘 선택 목록·사용 지침 |
| `tests/`, `scripts/` | 재현 가능한 검증·빌드 |

업무 통합 예제는 12종을 보여주며, 첨부와 가로 조회조건은 별도 예제로 제공합니다.
기본·서비스 레시피도 동일한 company.css를 사용합니다. 과거 정부 UI는 실행·선택·설치 대상이 아니며 지침·출처 기록만 별도로 보존합니다.
샘플 업무 처리와 메모리 저장을 실제 시스템 처리로 사용하거나 설명하지 않습니다.

## 빌드와 점검

프로젝트 루트에서 실행합니다. Python 표준 라이브러리와 Node.js가 필요하며 외부 패키지를 설치하지 않습니다.

```sh
.venv/bin/python scripts/build_company_design.py
.venv/bin/python scripts/build_company_design.py --check
node designs/assets/ui-kit/internal/company/extensions/build.mjs --check
node designs/assets/ui-kit/internal/company/recipes/build-registry.cjs --check
python3 designs/assets/ui-kit/internal/company/scripts/check_release.py
```

`check_release.py`는 현재 배포 내용의 CSS/JS·문서 링크·검증 계약을 확인합니다. 브라우저를 실행하거나 파일을 업로드하지 않습니다.
다른 미리보기는 내장 CSS를 사용하므로 CSS 원본 변경 시 제품 생성기가 첫 style 블록도 갱신합니다. 검사에서 불일치를 알려줍니다.
아이콘은 `icons/source.json`·`selection.tsv`의 Lucide 120개와 `icons/additions.json`의 Altool 13개에서 생성합니다. 배포에는 `dist/assets/LICENSE-LUCIDE.txt`와 `LICENSE-ALTOOL.txt`를 함께 포함합니다.

현재 실브라우저 검증은 URL 접근 정책 차단으로 미완료입니다. 생성·정적·DOM 대역 테스트 통과를 폰트·320px·확대·실제 파일/미디어·키보드 조작 검증으로 해석하지 마세요.

## AI 사용 원칙

1. Altool 표준 라우터와 회사 registry에서 의미 ID를 선택하고, GUIDE·components.json이 연결한 해당 자산 모음의 클래스·API로 조합합니다.
2. 조회조건·저장·오류·파일 첨부를 비슷한 새 스타일로 다시 만들지 않습니다.
3. 예제의 부서·금액·날짜·처리 순서를 실제 업무 규칙으로 추정하지 않습니다.
4. 공통 외형은 유지하고 데이터 연결·권한·업무 검증은 앱에 구현합니다.
5. 실제 사용 브라우저에서 폰트·좁은 폭·긴 값·키보드·파일 선택을 확인한 뒤 전사 배포합니다.

과거 변경 설명은 [docs/CHANGELOG-LEGACY.md](docs/CHANGELOG-LEGACY.md), 과거 QA는 [docs/QA-HISTORY.md](docs/QA-HISTORY.md)에 보존했습니다.
현재 기준은 README → GUIDE/사용 가이드 → QA를 참고하고, 과거 기록의 규칙을 적용하지 않습니다.
