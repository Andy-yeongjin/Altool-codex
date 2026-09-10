# 04. 파일 업로드(File upload) 적용·검증 카드

출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.533-552. 공공누리 제1유형 출처표시.

이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.

## 적용 전 판단과 실제 검증

- [ ] 파일형식·크기·개수 조건과 구체적 오류를 선택 전 안내한다. 불필요한 제한/자동 제출을 피한다.
- [ ] 파일선택·드롭 대체수단·삭제·재선택·파일별 그룹·초점·오류를 확인한다. 실제 업로드/압축은 앱 통합 구현이며 로컬 예제로 완료됐다고 하지 않는다.
- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.
- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.

## 연결 자산

- [file_upload.html](../upstream/html/code/file_upload.html)

## 원문 번호 규칙 빠른 점검

번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.

- [ ] **R001** 파일 업로드는 필요한 경우에만 사용한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.538](../reference/krds-p0533.md#pdf-p538))
- [ ] **R002** 레이블을 제공한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.538](../reference/krds-p0533.md#pdf-p538))
- [ ] **R003** 파일 유형, 파일 크기, 파일 개수 제한에 대해 안내한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.539](../reference/krds-p0533.md#pdf-p539))
- [ ] **R004** 가능한 한 파일 형식을 제한하지 않는다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.540](../reference/krds-p0533.md#pdf-p540))
- [ ] **R005** 가능한 한 파일 크기를 제한하지 않는다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.540](../reference/krds-p0533.md#pdf-p540))
- [ ] **R006** 이미지 유형의 파일에 대해 파일 크기 자동 압축 기능을 제공한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.540](../reference/krds-p0533.md#pdf-p540))
- [ ] **R007** 파일이 업로드된 후에도 파일 선택 버튼을 기본 상태로 유지한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.541](../reference/krds-p0533.md#pdf-p541))
- [ ] **R008** 파일 선택 버튼을 적절한 강조 수준으로 표현한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.542](../reference/krds-p0533.md#pdf-p542))
- [ ] **R009** 파일을 자동으로 제출하지 않는다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.544](../reference/krds-p0533.md#pdf-p544))
- [ ] **R010** 오류 상태에 대한 구체적인 오류 메시지를 제공한다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.544](../reference/krds-p0533.md#pdf-p544))
- [ ] **R011** 업로드된 파일 이름 텍스트를 두 줄로 제공하지 않는다. ([p.537](../reference/krds-p0533.md#pdf-p537), [p.545](../reference/krds-p0533.md#pdf-p545))
- [ ] **R012** 파일 업로드에 적절한 레이블을 제공한다. ([p.546](../reference/krds-p0533.md#pdf-p546))
- [ ] **R013** 파일 항목과 항목 삭제 버튼을 하나의 그룹으로 제공한다. ([p.546](../reference/krds-p0533.md#pdf-p546))
- [ ] **R014** 키보드 초점을 명확하게 표시한다. ([p.546](../reference/krds-p0533.md#pdf-p546))
- [ ] **R015** 드래그 앤 드롭 유형은 반드시 파일 업로더와 함께 사용한다. ([p.547](../reference/krds-p0533.md#pdf-p547))
- [ ] **R016** 스크린 리더로 접근할 수 있도록 한다. ([p.548](../reference/krds-p0533.md#pdf-p548))

## 전체 원문 페이지

[533](../reference/krds-p0533.md#pdf-p533) · [534](../reference/krds-p0533.md#pdf-p534) · [535](../reference/krds-p0533.md#pdf-p535) · [536](../reference/krds-p0533.md#pdf-p536) · [537](../reference/krds-p0533.md#pdf-p537) · [538](../reference/krds-p0533.md#pdf-p538) · [539](../reference/krds-p0533.md#pdf-p539) · [540](../reference/krds-p0533.md#pdf-p540) · [541](../reference/krds-p0533.md#pdf-p541) · [542](../reference/krds-p0533.md#pdf-p542) · [543](../reference/krds-p0533.md#pdf-p543) · [544](../reference/krds-p0533.md#pdf-p544) · [545](../reference/krds-p0533.md#pdf-p545) · [546](../reference/krds-p0533.md#pdf-p546) · [547](../reference/krds-p0533.md#pdf-p547) · [548](../reference/krds-p0533.md#pdf-p548) · [549](../reference/krds-p0533.md#pdf-p549) · [550](../reference/krds-p0533.md#pdf-p550) · [551](../reference/krds-p0533.md#pdf-p551) · [552](../reference/krds-p0533.md#pdf-p552)

## 검증 기록 양식

| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |
| --- | --- | --- | --- |
| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |

원문 SHA-256: 41d96481f442ef16c1f4e5ee421ebd83a8ba2f6389c9a5fcc10596de0b2e1c7b. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.
