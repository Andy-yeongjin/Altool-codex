# 출처와 재사용 범위

## 현재 회사 UI와 참고 기록의 구분

현재 실행 UI는 사용자 제공 company-design-v27 및 같은 회사 규격으로 작성한 Altool 보완 요소다. 이전 정부 키트 실행 파일과 KRDS 원문 PDF·추출 MD·원문 대조 JSON은 제거했다. 회사 적용 지침과 아래 KRDS·Pretendard·Swiper 출처 고지만 보존하며 해당 원문이나 실행 파일을 함께 제공하지 않는다.

현재 회사 아이콘은 Lucide 120개([출처](company/icons/source.json), [라이선스](company/icons/LICENSE-LUCIDE.txt))와 Altool 자체 제작 13개([원본](company/icons/additions.json), [라이선스](company/icons/LICENSE-ALTOOL.txt))다. 회사 CI·상태 이미지는 상위 brand/와 images/에 별도로 둔다. 회사 Pretendard 폰트는 소비 환경의 승인 경로로 연결하며 제거된 GOV 폰트 파일을 의존하지 않는다.

## 정부 지침·이전 키트 출처 기록

이 자산 모음의 지침·초기 구현은 행정안전부의 **KRDS(Korea Design System)**와 사용자가 제공한 **디지털 정부서비스 UI/UX 가이드라인(2024.02)**을 이용했습니다.

- 공식 사이트: https://www.krds.go.kr/
- 재사용 조건: https://www.krds.go.kr/html/site/utility/utility_06.html
- 확인일: 2026-09-08. 공식 페이지에서 공공누리 제1유형(출처표시), 상업/비상업 이용 및 변경·2차 저작물 배포 허용을 확인했습니다. 이 출처 고지를 재배포 시 유지하세요.
- 제작 참고 문서: 디지털 정부서비스 UI/UX 가이드라인(2024.02), 988페이지. 원본 PDF·추출본·원문 대조 장부는 제품에 포함하지 않습니다. 필요하면 위 공식 사이트에서 확인하세요.
- 공식 코드: https://github.com/KRDS-uiux/krds-uiux
- 당시 고정 commit: d6bb184c823e4757f05807ea4646a23e3133b6e6, package version 1.1.0. 초기 검증의 공식 배포본은 245파일이었으며 지금은 실행 파일을 제거했습니다. 이 버전이 2024 PDF와 완전히 동일했다는 뜻은 아닙니다.
- 이전 package.json의 ISC 표기와 별도로 위 공식 KRDS 이용 조건 및 아래 부속물 고지를 유지합니다.
- 당시 Pretendard GOV: [OFL 고지](licenses/Pretendard-OFL.txt). 당시 Swiper 11.0.6: [MIT 고지](licenses/Swiper-MIT.txt). 라이선스 문서는 남지만 해당 폰트·라이브러리 실행 파일은 현재 배포에 포함하지 않습니다.

정부 로고·국기·공식 배너·기관명은 참고 문서의 출처 예시일 뿐 회사 자산이 아닙니다. 일반 프로젝트가 공식 정부 서비스임을 주장하는 표식으로 적용하지 마세요. PDF의 피해야 할 사례는 학습·검증용 반례이지 추천 UI가 아닙니다.

## 검증 해석

Altool이 독립 작성한 CI·상태 이미지·문구·프로그램은 상위 `ALTOOL-LICENSE.txt`(MIT)를 적용합니다. KRDS 원문·이전 키트·폰트 등의 기존 출처/라이선스를 MIT로 변경한다는 뜻은 아닙니다. 원문에 근거한 체크리스트·파생 자료는 KRDS 출처표시도 유지합니다. 위 재사용 조건의 확인일은 과거 조사 기록이며 이번 UI 교체에서 새로운 법률 판단을 했다는 뜻은 아닙니다.

목차·페이지 커버리지, 자산 파일 존재, 실제 상호작용, 접근성/원문 준수는 서로 다른 상태입니다. 공식 키트라는 사실만으로 개별 프로젝트의 접근성이나 품질 인증을 주장하지 않습니다. 로그인·신청·파일 제출 예제는 UI 자산이며 실제 서버·권한·영속 처리는 프로젝트에서 구현해야 합니다.
