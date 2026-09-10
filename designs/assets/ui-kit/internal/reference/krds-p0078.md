# 02. 서체(Typography)

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.78-83.
공공누리 제1유형 출처표시. 이 파일은 원문 텍스트 추출이며 그림·표 배치와 구현 준수는 원본 PDF로 별도 대조한다.
https://www.krds.go.kr/

## PDF p.78

디지털 정부서비스 UI/UX 가이드라인 |  
스타일 가이드  /  서체
78
서체는 정보를 전달하고 일관된 경험을 제공하는 중요한 요소다. 글꼴, 
크기, 두께, 계층 등을 정의하여 텍스트의 내용과 중요도를 시각적으로 
표현하고 다양한 화면에서 동일하게 경험할 수 있도록 한다.
02.  
서체 
(Typography)
Typeface
중앙행정기관 사이트에서는 기본 글꼴로 국문과 영문 모두 Pretendard GOV를 사용한다.
독자적인 로고를 사용하며 자체 개발 폰트가 있는 기관의 경우
개발된 폰트가 고딕 계열의 글꼴이 아니라면 자체 개발 폰트는 디스플레이(혹은 헤딩)에만 
적용을 권장하며, 본문 텍스트로는 작은 크기에도 읽기 쉬운 산스 계열(고딕 계열) 글꼴을 
사용하도록 한다. (고딕 계열 글꼴 예: 노토 산스, 나눔 고딕, 스포카 한 산스 등)
Pretendard GOV : https://github.com/orioncactus/pretendard/tree/main/packages/pretendard-gov
Typeface

## PDF p.79

디지털 정부서비스 UI/UX 가이드라인 |  
스타일 가이드  /  서체
79
Type scale
 ㏂ 다양한 크기의 텍스트를 일관되게 사용할 수 있도록 스타일에 따라 구분하여 정의한다.
 ㏂ 반응형에 대응하기 위하여 폰트 규격은 개발 시 코드상에서는 rem 값을 사용한다.
 ㏂ rem 기본값은 개발의 용이함을 위해 HTML 루트 요소의 폰트 크기를 기준으로 10px 또는 62.5%를 
기준점으로 px로 환산하여 사용한다.
1rem
100% 16px
62.5% 10px
50% 8px
시스템 기본 폰트 크기 
16px 기준
독자적인 로고를 사용하는 기관의 Display 스타일 적용에 대해
키 비주얼 영역 혹은 마케팅 배너 영역에 사용되는 Display 스타일의 경우 Size와 Font 
weight를 변경하여 사용할 수 있다. 단, Small/Medium/Large처럼 일정한 규칙을 가질 수 
있도록 한다.
Type scale

## PDF p.80

디지털 정부서비스 UI/UX 가이드라인 |  
스타일 가이드  /  서체
80
Font weight  : Regular=400, Bold=700
Style Size Mobile 
size
Font 
weight
Line 
height
Letter 
spacing Usage
Display
Large 66 40 700 150% 1px
Display는 화면에서 가장 
큰 텍스트로 주로 마케팅 
용도로 사용한다.
Medium 50 32 700 150% 1px
Small 40 25 700 150% 1px
Heading
Large 50 40 700 150% 1px
Heading은 페이지 단위 
타이틀에 사용한다.
Medium 40 32 700 150% 1px
Small 32 25 700 150% 1px
Title
XXlarge 32 25 700 150% 1px
Title은 템플릿 단위, 모듈 
단위의 역할 및 기능을 
강조할 때 사용한다.
Xlarge 25 25 700 150% 0
Large 21 21 700 150% 0
Medium 19 19 700 150% 0
Small 17 17 700 150% 0
Xsmall 15 15 700 150% 0
Body
Large 19 19 400, 700 150% 0
Body는 본문 텍스트로 
사용한다.
Medium 17(*기본) 17 400, 700 150% 0
Small 15 15 400, 700 150% 0
Detail
Large 17 17 400, 700 150% 0
Detail은 추가 정보 
또는 작은 항목 텍스트에 
사용한다.
Medium 15 15 400, 700 150% 0
Small 13 13 400, 700 150% 0
Label
Large 19 19 400, 700 150% 0
구성 요소 내부의 텍스트로 
사용한다.  
예) Button, Label, Chips 
등
Medium 17 17 400, 700 150% 0
Small 17 17 400, 700 150% 0
Xsmall 15 15 400, 700 150% 0
Link
Large 19 19 400, 700 150% 0 문장 내의 몇 단어로 
이루어진 텍스트 혹은 
브레드크럼의 메뉴와 같이 
독립적인 링크에 사용한다.
Medium 17 17 400, 700 150% 0
Small 15 15 400, 700 150% 0
Type scale

## PDF p.81

디지털 정부서비스 UI/UX 가이드라인 |  
스타일 가이드  /  서체
81
Font weight
텍스트의 두께는 Regular, Bold 2가지로 사용한다. Body, Detail, Label에서는 강조가 필요할 때 
Bold를 사용한다.
Type scale

## PDF p.82

디지털 정부서비스 UI/UX 가이드라인 |  
스타일 가이드  /  서체
82
Line height
가독성을 위해 폰트 사이즈의 1.5배를 권장한다.
[모범 사례]
[피해야 할 사례]
Type scale

## PDF p.83

디지털 정부서비스 UI/UX 가이드라인 |  
스타일 가이드  /  서체
83
Hierarchy
Heading, Body, Detail 등 기본이 되는 텍스트 계층을 정의한다.
ㅣ 기본 계층 ㅣ
ㅣ 목록이 있는 계층 ㅣ
ㅣ 마케팅용 콘텐츠(예 ㏂ 배너, 키비주얼 영역 내 텍스트) ㅣ
Hierarchy
