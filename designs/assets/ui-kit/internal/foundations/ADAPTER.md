# 회사 공통 2024 테마 어댑터

`company-adapter.css`는 KRDS 공식 1.1.0 **마크업·동작**을 재사용하되 이 상품의 2024 색상·타이포그래피 토큰과 함께 쓰는 Altool 파생 CSS다. 공식 2024 배포본이나 정부 인증물이 아니다. 원본 `upstream/`은 수정하지 않는다.

## 소비 계약

- 회사 앱은 `company-adapter.css`를 먼저 로드한다. 별도 `upstream/.../common.css`, `output.css`, `krds_tokens.css`를 함께 로드하지 않는다.
- adapter는 `altool-base`, 작성 runtime은 `altool-components` 계층이다. 두 파일이 동일 순서를 선언하며 승인된 화면 CSS는 일반 계층에서 적용한다. 파일 위치를 바꿔 우선순위를 맞추거나 `!important`를 늘리지 않는다.
- HTML root는 `font-size: 100%`다. 브라우저 기본 16px에서는 body-medium 17px이며, 사용자가 기본 글꼴을 키우면 함께 확대된다. 절대 16px로 사용자 설정을 무력화하지 않는다.
- 원본 `.krds-btn` 기본 크기는 large이므로 label-large 19px를 사용한다. `.krds-btn.medium`은 label-medium 17px다. 크기별 역할 차이는 단위 혼용 오류가 아니며 모든 버튼을 본문과 동일한 크기로 강제하지 않는다.
- 기본 글꼴은 `--krds24-font-family: system-ui, -apple-system, sans-serif`다. PDF의 Pretendard GOV 소개와 구분되는 회사 기본 선택이다. 다른 글꼴 선택은 회사 토큰과 배포 의존성을 함께 변경한다.
- 기본은 light이며 `data-krds-mode=high-contrast` 또는 `theme`를 자동으로 넣지 않는다. 명시적으로 선택한 후대 키트의 고대비 모드는 남아 있지만 2024 명세/회사 기본 테마의 인증된 변형으로 간주하지 않는다.
- 공식 조각의 로컬 ID를 여러 번 삽입할 때에는 접근성 참조까지 함께 고유화한다. 이미지·JS·Swiper 의존성은 variant manifest를 따른다.

## 변환 근거와 한계

1. 고정 commit `d6bb184c823e4757f05807ea4646a23e3133b6e6`의 token, output, common CSS를 코드에 고정된 SHA-256과 원본 manifest 양쪽에 대조한다. 변화하면 생성은 실패한다.
2. 원래 62.5% root의 선언값 rem을 100% root 기준으로 ×0.625 변환한다. px, em, media/container/supports 조건, 문자열, 주석, data URL은 보존한다. 상대 URL은 기존 원본 파일로 재연결하며 경로 이탈/누락은 실패한다. 원본과 같은 output→common 순서를 보존한다.
3. 2024에 동일 이름으로 존재하는 색상/글자 역할은 실제 2024 토큰에 연결한다. 후대의 95 단계는 2024의 90 단계, graphic 색상은 secondary에 연결한다. 이것은 **회사 호환 별칭**이며 원문에 없는 색상을 2024 값으로 꾸미지 않는다.
4. 후대에만 있는 body-xsmall은 detail-small, heading-xlarge는 heading-medium, heading-xsmall/xxsmall은 title-medium/small, navigation-title-medium/small은 title-xlarge/large, navigation-depth-medium/small은 body-medium/small로 연결한다. 같은 이름의 heading-large 등은 2024 원래 역할에 맞아 크기가 달라진다.
5. 반지름·컴포넌트 레이아웃·동작은 후대 키트의 구조를 단위 정규화해 재사용한다. 모든 2024 페이지의 픽셀 복제, 웹 접근성 인증, 서버 기능 구현을 뜻하지 않는다. 의미별 선택과 실제 화면 QA는 별도로 필요하다.

## 재생성

제품 호환 보정: 잘못된 4depth padding·badge·투명색 참조는 존재하는 같은 역할로 연결한다. breadcrumb h2의 누락 간격은 h1 간격, language 제목/보조 제목은 heading-medium/body-large 역할로 연결한다. 후대 고대비/theme의 필터 숫자·페이지 수 조합은 회사의 흰색/짙은 배경으로 보정한다. 모두 파생 CSS에만 적용되며 공식 원문 무결성과 구분한다.

```sh
node designs/assets/ui-kit/internal/components/build.cjs
.venv/bin/python -m pip install -r designs/assets/ui-kit/internal/foundations/requirements.txt
.venv/bin/python designs/assets/ui-kit/internal/foundations/build_adapter.py
.venv/bin/python designs/assets/ui-kit/internal/foundations/build_adapter.py --check
```

Python과 [tinycss2](https://doc.courtbouillon.org/tinycss2/stable/api_reference.html)는 제작 시에만 필요하다. 설치된 사용자 앱은 생성 CSS와 지정된 브라우저 자산만 소비한다.
