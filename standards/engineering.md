# 사내 공통 개발 표준

적용 항목은 standard.yaml로 선택한다. 기본 명명·경계와 선택형 기술 기본값을 구분한다.

<a id="stack"></a>
## 기술 선택

- 기본값 ENG-01: Next.js App Router·TypeScript·PostgreSQL·Prisma·Tailwind/shadcn을 사내 웹앱의 출발점으로 사용한다. 설치만으로 기존 스택을 변경하지 않는다. 실제 버전과 대안은 Plan/Spec에서 확정한다.
- SheetJS·Zod·TanStack Table 등은 해당 기능이 필요할 때 선택한다. 자체 인증 구현은 필수가 아니며 인증 계약을 충족하는 세션 관리 방식을 설계한다.

<a id="naming"></a>
## 명명

- APP-02의 의미 없는 이름 판단은 식별자 문맥에 한정한다. data/info/temp/obj만으로 업무 의미를 알 수 없으면 구체화하되 api.md API-03의 응답 키 data 등 승인된 외부/공개 계약은 보존한다. 단어 자체를 전 계층에서 금지하지 않는다.
- 필수 ENG-02: 신규 JS/TS 앱의 변수·함수·필드·API JSON은 camelCase, 일반 파일·폴더는 kebab-case, 타입·컴포넌트는 PascalCase를 사용한다. 환경변수·모듈 고정 상수는 UPPER_SNAKE_CASE, 지역 const는 camelCase다. React 컴포넌트 값은 PascalCase를 허용한다.
- 필수 APP-01: 프레임워크 예약 파일·동적 경로(`[empNo]`, `(auth)` 등), 외부 프로토콜 키와 생성/vendor 파일은 해당 계약을 보존한다. Python 등 다른 언어는 생태계 규약을 따른다. 기존 공개 계약의 개명은 호환성과 영향 범위를 확인한 후 별도 결정하며 이번 규칙으로 자동 일괄 개명하지 않는다.
- 필수 APP-02: DB에서 온 불리언은 `useYn`처럼 Yn을 유지하고, 계산한 불리언은 is/has/can을 쓴다. 로직의 부정형 이름·타입 중복 이름·I 접두어 인터페이스·의미 없는 숫자 접미어를 피한다. HTML/UI의 disabled 같은 외부 관례는 허용한다. 단어 선택은 glossary.md, DB 매핑은 schema.md, API 공개 계약은 api.md를 따른다.
- 기본값 APP-03: 파일 역할은 `.types.ts`, `.actions.ts`, `.service.ts`, `.schema.ts`, `.const.ts`, `.def.ts`, `.test.ts`; 훅 파일은 `use-*.ts`다. type을 기본으로 하며 확장 가능한 공개 계약에는 interface를 사용한다. 상태 상수는 as const 유니온으로 DB/API 값과 일치시킨다.
- 기본값 APP-04: get(동기/캐시 조회), fetch(비동기 조회), find(없으면 null), create/update/remove(생성/수정/논리삭제), validate(검증), parse(파싱), build/make(조립), to(변환)를 사용한다. React 콜백 props는 on, 내부 핸들러는 handle, Hook은 use, 상태 setter는 set 접두어다. 물리삭제 delete는 data.md의 별도 수명 대상에만 사용한다.
- 기본값 APP-05: Props는 `{Component}Props`, 컴포넌트는 Form/List/Table/Modal/Dialog/Panel/Card/Picker/Provider 등 역할명으로 구분한다. Git 작업명은 kebab-case, 커밋 유형은 feat/fix/refactor/chore/docs/test/style을 사용하되 저장소·도구의 지정 접두어를 따른다.

<a id="boundaries"></a>
## 코드와 검증 경계

- 필수 ENG-06: 기능별 코드를 모으고 필요한 인증·권한·감사·업로드의 공유 경로를 사용한다. UI에서 DB에 직접 접근하거나 화면마다 표준 처리를 복제하지 않는다. 필요 없는 DB·인증·관리 기능을 추가하라는 뜻은 아니다.
- 필수 APP-06: 도메인을 알 수 없는 만능 utils/helpers 파일과 불필요한 index 재수출을 늘리지 않는다. 비밀값을 브라우저 공개 환경변수에 넣지 않는다. 예외는 소비 범위·이유·대체 검증을 Spec에 남긴다.
- 필수 APP-07: JS/TS 변경 시 `tooling/README.md`의 공통 린트 설정을 기존 설정에 통합하거나 동등 검사를 연결하고 실제 정상/위반 예시를 검사한다. 폴더 명명·도메인 용어·DB 매핑·공개 API 동작까지 린트가 증명한다고 하지 않는다. 해당 스키마/API 작업에는 별도 테스트를 연결한다.
