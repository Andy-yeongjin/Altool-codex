# 2024 기초 자산

행정안전부 「디지털 정부서비스 UI/UX 가이드라인(2024.02)」 p.45-113의 원칙·스타일을 재사용할 수 있도록 정리했다. 원문은 `../reference/`에 보존하며 공공누리 제1유형 출처표시를 따른다. 일반 제품에서 정부가 보증한 서비스로 오인시키는 CI나 공식 배너를 사용하지 않는다.

## 소유권과 적용

- `values-2024.json`: 원문 역할 색상, 서체 25종, 형태 크기 14행, 배치·간격·아이콘 규격.
- `palette-2024.json`: p.76의 24계열 × 10단계 = 240색. PDF 렌더의 인쇄된 hex를 전사했다. 해당 팔레트는 p.65의 Primary 계열과 다르며 이름을 합치지 않는다.
- `reference-tokens.css`: 두 JSON에서 생성한 정부 참고값. 회사 테마를 바꾸기 위해 원문 전사 JSON을 고치지 않는다.
- `tokens-2024.css`: [회사 theme.css](../../design/theme.css)에서 생성한 선택형 CSS 변수. 초기값은 정부 참고값과 같지만 회사 외형 변경은 design/에서 수행한다. `.krds-2024-tokens` 범위에만 적용되며 전역 테마·폰트·리셋을 주입하지 않는다. CSS 수치는 기본 16px 루트를 기준으로 rem 변환했으므로 62.5% 루트와 그대로 혼용하면 안 된다.
- `layout.html`·`layout.css`: `foundation.layout`의 컨테이너/유동형 × 사이드 내비게이션 유무 4개 재사용 골격. 회사 기본 분기점·간격·읽기 순서를 제공하며 예제 내용은 실제 업무로 교체한다.
- `krds-pNNNN.md`: 원칙·스타일별 적용 카드. 추상 원칙은 억지 아이콘이나 UI로 치환하지 않고 판단·검증 절차로 자산화한다.
- `../upstream/`: 후대 공식 키트 1.1.0. **2024.02 값과 동일한 버전이 아니다.** 예를 들어 Primary-50은 PDF `#246BEB`, 키트 `#256EF4`다. 원본과 파생을 구분해 채택하고 프로젝트 디자인 계약에 기록한다.

폰트명은 참조일 뿐 폰트 파일 사용권을 포함하지 않는다. 정부용 브랜드 표시 규칙과 일반 제품의 시각 기본값은 분리한다. 이 라이브러리를 설치했다고 모든 규칙이 프로젝트 표준으로 활성화되지는 않는다.

## 출처 대조 기록

2026-09-08, 제공 PDF를 Poppler로 PNG 렌더하고 다음을 직접 확인했다.

| 확인 페이지 | 시각 대조 범위 |
| --- | --- |
| 65, 66 | Primary/Secondary/Grayscale의 인쇄된 hex, Alpha 단계·합성색 |
| 68, 70, 71 | Normal/Hover/Pressed/Disabled의 역할, 배경·경계·본문 매핑 |
| 72-75 | Point 및 Danger/Warning/Success/Information 단계별 hex |
| 76 | 24계열·240색 인쇄값 전사 후 300dpi 4분할로 작성자 재대조, Red-40 전사 오자 정정, Lime-64 표기 이상 기록 |
| 80 | 25개 타이포 행의 desktop/mobile·굵기·행간·자간 |
| 85, 86 | 컨테이너 크기 14행과 반경 1-12px |
| 92, 94 | 디바이스별 최소·권장 거터, 분기점·기본 칼럼 |

위 표는 초기 전사 당시 기록이다. 후속 검토에서는 **p.1–113 및 p.981–988, 총121쪽을 개별 PNG로 모두 실제 열람**했다. `final-source-review.json`에 페이지별 관찰과 원문·렌더 SHA256을, `visual-review-notes.json`에 수기 관찰을 남겼다. p.76/100은 고해상도로 재확인했다. p.84의 큰 반경 토큰, p.96의 추가 간격 토큰, p.93/95 배치 골격, 아이콘48px 런타임 허용 누락을 보완했다. 기존 Alpha 변수는 중복 이름을 추가하지 않고 유지한다.

개별 원문 시각 열람은 소비 화면의 픽셀 일치·모든 컴포넌트 동작·보조기술·240색의 독립 이중 교정 완료를 뜻하지 않는다. 배치 골격은 인앱 브라우저 320–1440px의9개 너비에서 재배치·넘침을, 데스크톱/모바일에서 메뉴 클릭·키보드 대상 초점을 확인했다. 실제 관찰 범위는 `../COMPANY-VERIFICATION.md`에 구분한다.

## 발견한 원문·버전 차이

- p.90 모바일 칼럼은 4 기본/6까지, p.94 표는 4 또는 8이다. 기본 4를 채택 가능한 공통값으로 제공하고 다른 선택은 앱별로 명시한다.
- p.76 Lime 팔레트의 다섯 번째 행은 `Lime-64`로 인쇄돼 있다. 일관된 단계 인덱스 40에 연결하고 원래 표기를 JSON `sourceAnomalies`에 남겼다.
- p.70 Gray-60 경계 예시의 보이는 견본과 p.66 수치 팔레트가 다르다. 색상 데이터에는 p.66 인쇄 hex를 사용한다.
- p.77의 큰 텍스트 px 표기만으로 실제 접근성 기준을 확정하지 않는다. 실제 텍스트 크기·굵기와 사용한 색상 쌍을 적용 기준에 따라 검사한다. 어떤 팔레트도 임의의 조합 전부가 대비를 만족하지는 않는다.
- p.99 표의 h3–본문 간격32px와 p.100 예시의40px가 다르다. 회사 기본 골격은 표의32px를 채택하고 앱마다 임의 변경하지 않는다.

## 재생성과 검증

```sh
node designs/assets/ui-kit/internal/components/build.cjs
node designs/assets/ui-kit/internal/components/build.cjs --check
.venv/bin/python scripts/build_company_design.py --check
.venv/bin/python designs/assets/ui-kit/internal/foundations/build_adapter.py --check
python3 -m unittest discover -s tests -p 'test_company_foundations.py'
python3 -m unittest discover -s tests -p 'test_krds_components*.py'
```

JSON 원문 전사는 먼저 PDF와 대조해서 수정한다. 회사 외형 코드는 [design/](../../design/README.md)의 theme.css·components.css에서 편집하고 생성기를 실행한다. 이 폴더의 배포 CSS만 수정하면 재생성 검사에서 드리프트로 검출된다. 이름·숫자 개수·source hash 검사는 의미적 준수나 독립 색상 교정을 대신하지 않는다.
