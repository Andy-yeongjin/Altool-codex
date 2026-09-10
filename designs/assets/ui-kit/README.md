# 회사 디자인 수정은 여기서 시작

| 위치 | 무엇을 하는 곳인가 |
| --- | --- |
| **[design/](design/README.md)** | 회사별 외형을 수정하는 유일한 원천. theme.css와 components.css |
| internal/ | 컴포넌트 구조·동작, 자동 생성 CSS, 정부 원본·지침·검증 자료. 일반 디자인 수정 시 편집하지 않음 |

버튼이 박스형이라 바꾸고 싶다면 [components.css](design/components.css)의 **components/runtime.css** 구역을 수정한다. 공식 마크업 기반 버튼은 같은 파일 끝의 **foundations/company-custom.css** 구역에서 `.krds-btn` 스타일을 조정한다. 두 구현 계열의 차이는 숨기지 않되 수정 파일은 하나다.

색상·폰트·공통 간격은 [theme.css](design/theme.css)를 수정한다. `internal` CSS를 고치면 다음 빌드에서 덮어써지므로 회사 수정 원천으로 쓰지 않는다.

```sh
.venv/bin/python scripts/build_company_design.py
.venv/bin/python scripts/build_company_design.py --check
```

자산 미리보기는 상위 [자산 탐색기](../index.html)에서 연다. 수정 후 대표 상태/desktop/mobile 실측 및 배포 검사를 수행하고 새 회사 팩 버전으로 발행한다. 로고·아이콘·공통 문구의 위치는 [회사 디자인 안내](design/README.md)를 따른다.
