# 출처와 재사용 범위

이 자산 모음은 행정안전부의 **KRDS(Korea Design System)**와 사용자가 제공한 **디지털 정부서비스 UI/UX 가이드라인(2024.02)**을 이용했습니다.

- 공식 사이트: https://www.krds.go.kr/
- 재사용 조건: https://www.krds.go.kr/html/site/utility/utility_06.html
- 확인일: 2026-09-08. 공식 페이지에서 공공누리 제1유형(출처표시), 상업/비상업 이용 및 변경·2차 저작물 배포 허용을 확인했습니다. 이 출처 고지를 재배포 시 유지하세요.
- 원본 PDF: 제품 저장소의 guides/디지털 정부서비스 UIUX 가이드라인(2024.02).pdf. 원문 988페이지와 SHA256은 coverage.json에 기록됩니다. 텍스트 추출에는 이미지·표 배치 정보가 빠지므로 PDF 그림 대조가 필요합니다.
- 공식 코드: https://github.com/KRDS-uiux/krds-uiux
- 고정 commit: d6bb184c823e4757f05807ea4646a23e3133b6e6, package version 1.1.0. upstream/의 245파일은 수정하지 않은 공식 배포본입니다. 이 버전이 2024 PDF와 완전히 동일하다는 뜻은 아닙니다.
- package.json의 ISC 표기와 별도로 upstream README가 지정하는 공식 KRDS 이용 조건 및 부속물 라이선스를 함께 보존합니다.
- Pretendard GOV 폰트: licenses/Pretendard-OFL.txt. Swiper 11.0.6: licenses/Swiper-MIT.txt. 폰트/라이브러리는 원문 그대로 포함했습니다.

정부 로고, 국기, 공식 배너, 기관명은 출처 예시입니다. 일반 프로젝트가 공식 정부 서비스임을 주장하는 표식으로 자동 적용하지 마세요. 자체 제작 Altool CI와 상태 이미지는 상위 brand/와 images/에 구분됩니다. PDF의 피해야 할 사례는 학습·검증용 반례이지 추천 UI가 아닙니다.

## 검증 해석

Altool이 독립 작성한 CI·상태 이미지·문구·프로그램은 상위 `ALTOOL-LICENSE.txt`(MIT)를 적용합니다. KRDS 원문·공식 키트·폰트 등의 기존 출처/라이선스를 MIT로 변경한다는 뜻은 아닙니다. 원문에 근거한 체크리스트·파생 자료는 KRDS 출처표시도 유지합니다.

목차·페이지 커버리지, 자산 파일 존재, 실제 상호작용, 접근성/원문 준수는 서로 다른 상태입니다. 공식 키트라는 사실만으로 개별 프로젝트의 접근성이나 품질 인증을 주장하지 않습니다. 로그인·신청·파일 제출 예제는 UI 자산이며 실제 서버·권한·영속 처리는 프로젝트에서 구현해야 합니다.
