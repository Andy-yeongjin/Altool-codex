# 회사 디자인 수정은 여기서 시작

| 위치 | 무엇을 하는 곳인가 |
| --- | --- |
| **[design/](design/README.md)** | 회사별 외형을 수정하는 유일한 원천. theme.css와 components.css |
| internal/company/ | v27 회사 컴포넌트·업무 조합·동작·아이콘 및 자동 생성 배포본 |
| internal/ATTRIBUTION.md | 제작 참고 출처·라이선스 고지. KRDS 원문·추출 자료는 제공하지 않음 |

현재 실행 UI는 **v27 한 벌**이다. [통합 카탈로그](internal/company/catalog.html)에서 외형을, [업무 예제](internal/company/business-preview.html), [보완 컴포넌트](internal/company/extensions/preview.html), [업무 조합](internal/company/recipes/README.md)에서 동작·조합을 확인한다. v27에 없던 기능도 회사 규격으로 보완했으며 이전 정부 HTML·CSS·JS·SVG로 자동 대체하지 않는다.

버튼은 theme.css의 `--company-button-*`와 components.css의 runtime/enterprise 구역에서 바꾼다. `foundation.company-ui`를 선택하고 `internal/company/dist/company.css`와 registry가 지정한 회사 JS·자산을 사용한다. 과거 upstream/components/foundations/patterns 실행 디렉터리와 별도 방향 SVG는 제거했다. 남은 `--krds24-*` 토큰 이름은 식별자일 뿐 정부 UI를 불러오는 경로가 아니다.

색상·폰트·공통 간격은 [theme.css](design/theme.css)를 수정한다. `internal` CSS를 고치면 다음 빌드에서 덮어써지므로 회사 수정 원천으로 쓰지 않는다.

```sh
.venv/bin/python scripts/build_company_design.py
.venv/bin/python scripts/build_company_design.py --check
```

자산 미리보기는 상위 [자산 탐색기](../index.html)에서 연다. 수정 후 대표 상태/desktop/mobile 실측 및 배포 검사를 수행하고 새 회사 팩 버전으로 발행한다. 로고·아이콘·공통 문구의 위치는 [회사 디자인 안내](design/README.md)를 따른다.

현재는 `2.0.0-qa.8` 기준의 QA 작업 기록이며 실제 브라우저 검증은 미완료다. 공통 필드·드롭다운 연결에 이어 페이지/필터 정렬, 헤더 링크, 파일첨부 통합과 채움 없는 버튼형 링크를 보완했다. 최신 발행 값은 registry/lock, 검증 범위는 [회사 팩 검증 기록](internal/COMPANY-VERIFICATION.md)을 확인한다.
