# /al design_source — 디자인 소스 기반 디자인 시스템 생성

**사용법**: `/al design_source`

**목적**: 프로젝트의 디자인 소스(`.pen` 또는 Stitch)를 분석하여 `designs/design.md`(디자인 명세)와 `designs/design-tokens.css`(CSS 변수)를 생성합니다.
`designs/design-constitution.md`(정부 UI/UX 가이드라인)를 기준으로 생성된 토큰의 준수 여부를 자동 검증합니다.

> ⚠️ 이 커맨드는 **프로젝트 리드가 디자인 시스템을 확정할 때** 사용합니다.
> 생성된 두 파일은 이후 모든 팀원의 oneshot 파이프라인에서 시각적 기준으로 사용됩니다.

---

## 실행 전 체크

### Step 0: 디자인 소스 감지 (자동 분기)

아래 순서대로 확인하여 **소스 타입**을 결정합니다:

| 우선순위 | 조건 | 소스 타입 | 분기 |
|---------|------|----------|------|
| 1 | `designs/stitch/` 폴더 존재 | **Stitch** | → Stitch 모드 |
| 2 | `designs/*.pen` 파일 존재 | **Pencil** | → Pencil 모드 |
| 3 | 둘 다 없음 | — | → 즉시 중단 |

둘 다 없으면 안내:
```
⚠️  디자인 소스가 없습니다.

  Pencil.dev 사용 시:
    designs/ 폴더에 .pen 파일을 넣어주세요.

  Stitch 사용 시:
    Stitch에서 ZIP으로 내보낸 후 압축을 풀어
    designs/stitch/ 폴더에 파일을 넣어주세요.
    (code.html + DESIGN.md 파일이 있어야 합니다)
```

감지 완료 후 출력:
```
[0/6] 디자인 소스 감지 완료
  소스: [Stitch | Pencil]
  경로: [designs/stitch/ | designs/*.pen]
```

### Step 1: 기존 designs/design.md 확인

이미 존재하면 → 안내:
```
ℹ️  기존 designs/design.md가 있습니다. 덮어쓰시겠습니까?
A) 덮어쓰기 — 새로 생성
B) 취소
```

---

## 실행 순서 (6단계)

### [1/6] 디자인 소스 스캔

#### 🔵 Pencil 모드

`designs/` 폴더의 모든 `.pen` 파일을 Pencil MCP 도구로 읽습니다.

1. 각 `.pen` 파일을 `open_document`로 열고
2. `batch_get`으로 전체 노드 구조를 파악하고
3. `search_all_unique_properties`로 아래 속성을 전수 추출합니다:

| 추출 속성 | designs/design.md 매핑 |
|-----------|----------------------|
| `fillColor` | 색상 팔레트 (Primary, Neutral, Semantic) |
| `textColor` | 텍스트 색상 |
| `strokeColor` | 보더 색상 |
| `strokeThickness` | 보더 두께 |
| `fontSize` | 타이포그래피 스케일 |
| `fontFamily` | 폰트 패밀리 |
| `fontWeight` | 폰트 굵기 |
| `cornerRadius` | 둥글기 (Border Radius) |
| `padding` | 간격 시스템 (Spacing) |
| `gap` | 간격 시스템 (Spacing) |

추출 완료 후 보고:
```
[1/6] .pen 스캔 완료
  파일: [N]개 스캔
  색상: [N]개 고유값 발견
  폰트 크기: [N]개 고유값 발견
  간격: [N]개 고유값 발견
  둥글기: [N]개 고유값 발견
```

#### 🟠 Stitch 모드

`designs/stitch/` 폴더에서 아래 파일을 읽습니다:

1. **`code.html`** — `tailwind.config` 스크립트 블록에서 아래를 추출합니다:
   - `theme.extend.colors` → 전체 색상 토큰 (이름 + hex 값)
   - `theme.extend.borderRadius` → 둥글기 토큰
   - `theme.extend.fontFamily` → 폰트 패밀리

2. **`DESIGN.md`** — 아래를 추출합니다:
   - 디자인 원칙 (Creative North Star, 컴포넌트 규칙)
   - 타이포그래피 스케일 (역할, 토큰명, 폰트, 크기)
   - 간격·그림자 규칙
   - Do/Don't 규칙

3. **`screen.png`** (선택) — 시각적 레이아웃 참고용으로 분석합니다.

추출 완료 후 보고:
```
[1/6] Stitch 스캔 완료
  색상 토큰: [N]개 (tailwind.config)
  타이포그래피: [N]개 역할 (DESIGN.md)
  둥글기: [N]개
  폰트 패밀리: [N]개
  디자인 원칙: [N]개 규칙
```

---

### [2/6] 토큰 정규화 (Normalization)

#### 🔵 Pencil 모드

추출된 원시값을 Tailwind CSS 디자인 스케일 기반으로 정규화합니다.

**색상**: 유사한 색상을 그룹핑하여 팔레트로 구성 (50~900 스케일). Primary/Neutral/Semantic으로 분류. 가장 많이 쓰인 브랜드 색상 → Primary 기준.

**타이포그래피**: 추출된 폰트 크기를 가까운 4px 배수 또는 Tailwind 스케일(12/14/16/18/20/24/30/36px)에 매핑.

**간격**: 추출된 padding/gap 값을 4px 기반 스케일(0/2/4/6/8/12/16/20/24/32/40/48/64/80px)에 매핑.

**둥글기**: 추출된 cornerRadius를 표준 스케일(0/4/8/12/16/24/9999px)에 매핑.

**레이아웃**: navbar, sidebar 등 반복 레이아웃 요소의 크기를 감지하여 레이아웃 토큰으로 등록.

#### 🟠 Stitch 모드

Stitch의 tailwind.config 값은 이미 구조화되어 있어 직접 CSS 변수명으로 매핑합니다.

**색상**: `theme.extend.colors`의 키-값을 `--color-{키명}` 형태로 변환합니다.
- 예: `"primary": "#81ecff"` → `--color-primary: #81ecff`
- 예: `"surface-container": "#171924"` → `--color-surface-container: #171924`

**둥글기**: `theme.extend.borderRadius`의 rem 값을 px로 변환합니다.
- 예: `"xl": "0.5rem"` → `--radius-xl: 8px`

**폰트**: `theme.extend.fontFamily`에서 역할별 폰트 패밀리를 추출합니다.

**타이포그래피 스케일**: `DESIGN.md`의 타이포그래피 테이블을 기준으로 역할별 크기·굵기 토큰을 정의합니다.

**간격**: Stitch는 간격 토큰을 직접 제공하지 않으므로 `DESIGN.md`의 컴포넌트 명세(padding, gap 언급)에서 추론하여 4px 기반 스케일로 생성합니다.

정규화 완료 후 보고:
```
[2/6] 토큰 정규화 완료

  색상 매핑: [N]개
    primary: #81ecff → --color-primary
    surface: #0c0e17 → --color-surface
    ...

  둥글기 매핑: [N]개
    xl (0.5rem) → --radius-xl: 8px
    ...

  타이포 매핑: [N]개
  간격 스케일: [N]개 (추론 생성)
```

---

### [3/6] design-constitution.md 준수 검증·자동 교정 (Compliance Auto-Fix)

`designs/design-constitution.md`를 읽고, [2/6]에서 정규화된 토큰이 정부 가이드라인을 준수하는지 검증합니다.

#### 검증 항목:

**색상 대비 (명도 대비)**:
- 텍스트 색상과 배경 색상 간 명도 대비가 **4.5:1 이상**인지 확인
- 위반 시 → `designs/design-constitution.md`의 기준 색상으로 **즉시 자동 교정**

**Primary 팔레트**:
- 주조색이 `designs/design-constitution.md`의 Blue 계열 범위(`#3563ff` ~ `#0a2176`)에 속하는지 확인
- 벗어날 경우 → 가장 가까운 기준 토큰으로 **즉시 자동 교정**

**폰트 크기**:
- 본문 기준 최소 **16px(Body Medium 17px)** 이상인지 확인
- 미달 시 → 기준값으로 **즉시 자동 교정**

**터치 타겟**:
- 버튼/폼 요소 최소 높이가 **44px** 이상인지 확인
- 미달 시 → **44px로 즉시 자동 교정**

**Border Radius**:
- 버튼·입력창 기본 둥글기가 **8px**인지 확인
- 미달 시 → **8px로 즉시 자동 교정**

검증 및 교정 완료 후 보고:
```
[3/6] design-constitution.md 준수 검증·교정 완료

  ✅ 통과 항목:
    - 명도 대비: 모든 텍스트/배경 조합 4.5:1 이상
    - 터치 타겟: 버튼 min-height 44px 확인
    - Border Radius: 8px 일치

  🔧 자동 교정된 항목:
    - Primary 색상: #e63946 → #1a42e5 (정부 표준 Blue 계열 교정)
    - 본문 폰트: 14px → 17px (기준 최소값 적용)
```

모든 교정은 사용자 확인 없이 자동 적용됩니다. 교정 항목이 없으면 바로 다음 단계로 진행합니다.

---

### [4/6] design.md 생성

정규화된 토큰을 바탕으로 `designs/design.md`를 작성합니다.

**필수 포함 섹션** (기존 designs/design.md 구조를 따름):

1. 테마 (색상 팔레트 — Primary, Neutral, Semantic, Background & Surface)
2. 다크모드 (MVP는 라이트만)
3. 타이포그래피 (폰트 패밀리, 크기, 굵기, 줄 높이, 자간)
4. 간격 시스템 (4px 기반)
5. 레이아웃 (컨테이너 너비, 브레이크포인트, 사이드바, 네비게이션)
6. 버튼 (종류, 사이즈, 공통 속성, 아이콘 버튼)
7. 폼 요소 (입력, 텍스트에어리어, 셀렉트, 체크박스, 토글, 라벨, 헬퍼)
8. 카드
9. 모달/다이얼로그
10. 테이블
11. 네비게이션 (Navbar, Sidebar)
12. 뱃지/태그
13. 알림/토스트
14. 그림자
15. 둥글기
16. 트랜지션/애니메이션
17. 아바타
18. 로딩 상태
19. z-index 체계
20. 인증 페이지
21. 규칙 (Rules)

**작성 규칙**:
- 각 토큰은 `--토큰명` | `값` | `용도` 형식의 테이블로 정리
- 디자인 소스에서 실제로 사용된 컴포넌트만 상세 명세를 작성하고, 사용되지 않은 컴포넌트는 기본값으로 채움
- 문서 상단에 소스 타입 명시: "이 문서는 [Stitch | .pen 파일] 기반으로 자동 생성되었습니다"
- Stitch 모드: `DESIGN.md`의 디자인 원칙(Creative North Star, Do/Don't)을 design.md의 Rules 섹션에 그대로 포함

---

### [5/6] design-tokens.css 생성

`designs/design.md`의 모든 토큰을 CSS 변수로 구현하여 `designs/design-tokens.css`에 저장합니다.

```css
/* designs/design-tokens.css — designs/design.md 기반 자동 생성 */
/* 이 파일은 designs/design.md와 항상 세트로 관리합니다. */

:root {
  /* === 1. Colors === */
  --color-primary-50: #EFF6FF;
  --color-primary-100: ...;
  /* ... designs/design.md의 모든 색상 토큰 ... */

  /* === 2. Typography === */
  --font-sans: 'Pretendard', 'Inter', ...;
  --text-xs: 12px;
  /* ... designs/design.md의 모든 타이포 토큰 ... */

  /* === 3. Spacing === */
  --space-0: 0px;
  --space-1: 4px;
  /* ... designs/design.md의 모든 간격 토큰 ... */

  /* ... 나머지 모든 토큰 ... */
}
```

**생성 규칙**:
- `designs/design.md`에 정의된 **모든** 토큰이 CSS 변수로 존재해야 함 (1:1 매핑)
- 변수명은 `designs/design.md`의 토큰명과 정확히 일치 (`--color-primary-600`, `--text-sm` 등)
- 카테고리별 주석으로 구분
- `designs/design.md`에 없는 임의의 변수를 추가하지 않음

---

### [6/6] 디자인 프리뷰 HTML 생성

`guides/design-preview.html`을 생성합니다. 브라우저에서 열면 디자인 시스템 전체를 시각적으로 확인할 수 있는 단일 HTML 파일입니다.

> `guides/` 디렉토리가 없으면 생성합니다.

**필수 조건**:
- `designs/design-tokens.css`를 `<link>`로 불러와서 실제 토큰 변수를 사용하여 렌더링
- 외부 라이브러리 없이 순수 HTML + CSS + 인라인 JS로 구성 (단일 파일)
- `designs/design-tokens.css` 경로는 상대 경로 `../designs/design-tokens.css` 사용

**포함 섹션** (designs/design.md 구조 순서대로):

#### 1. Color Palette
- Primary 50~900: 각 색상을 정사각 칩으로 나열, 토큰명 + HEX값 표시
- Neutral(Gray) 50~900: 동일
- Semantic: Success, Warning, Danger, Info — 각각 기본색 + light 배경색
- Background & Surface: bg, bg-secondary, bg-tertiary, surface, overlay

#### 2. Typography
- 폰트 패밀리: sans, mono 각각 샘플 텍스트 렌더링
- 폰트 크기: text-xs ~ text-4xl 을 실제 크기로 "The quick brown fox" 렌더링
- 폰트 굵기: normal, medium, semibold, bold 비교
- 줄 높이: tight, normal, relaxed 비교

#### 3. Spacing
- space-0 ~ space-20: 각 간격을 시각적 바(bar)로 표현, 토큰명 + px값 표시

#### 4. Layout
- 컨테이너 너비: sm, md, lg, xl을 비율 바로 표현
- 브레이크포인트: sm, md, lg, xl 표시
- Navbar 높이, Sidebar 너비 시각화

#### 5. Buttons
- 종류별(Primary, Secondary, Ghost, Danger, Danger-outline) × 사이즈별(xs, sm, md, lg, xl) 매트릭스
- 각 버튼에 hover, disabled 상태도 표시

#### 6. Form Elements
- Text Input: default, focus, error, disabled 상태
- Textarea, Select, Checkbox, Radio, Toggle
- Label + Helper text + Error message 조합

#### 7. Cards
- 기본 카드, 클릭 가능 카드 (호버 그림자)

#### 8. Badges & Tags
- Default, Primary, Success, Warning, Danger 뱃지

#### 9. Alerts
- Info, Success, Warning, Danger 인라인 알림

#### 10. Shadows
- shadow-xs ~ shadow-xl: 동일 크기 박스에 각 그림자 적용

#### 11. Border Radius
- radius-none ~ radius-full: 동일 박스에 각 둥글기 적용

#### 12. Z-Index & Transitions
- z-index 체계를 계층 다이어그램으로 표현
- 트랜지션: fast, base, slow, spring 버튼으로 체감 비교

**스타일 규칙**:
- 페이지 자체의 레이아웃도 `designs/design-tokens.css` 변수를 사용
- 각 섹션은 앵커 링크가 있는 목차(TOC)로 이동 가능
- 상단에 "이 페이지는 designs/design-tokens.css를 실시간 참조합니다. 토큰을 수정하면 새로고침만으로 변경사항을 확인할 수 있습니다." 안내 표시
- 반응형: 모바일에서도 확인 가능

생성 완료 후 보고:
```
[6/6] 디자인 프리뷰 생성 완료
  → guides/design-preview.html
  브라우저에서 열어 디자인 시스템을 확인하세요.
  💡 designs/design-tokens.css를 수정하면 새로고침만으로 변경사항이 반영됩니다.
```

---

## 완료 보고

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 디자인 시스템 생성 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 디자인 소스: [Stitch (designs/stitch/) | Pencil (.pen [N]개)]
📊 생성된 토큰 수:
  색상: [N]개
  타이포: [N]개
  간격: [N]개
  레이아웃: [N]개
  기타: [N]개

📄 생성된 파일:
  ✅ designs/design.md (디자인 명세)
  ✅ designs/design-tokens.css (CSS 변수)
  ✅ guides/design-preview.html (시각 프리뷰)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 다음 단계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. guides/design-preview.html을 브라우저에서 열어 디자인 시스템을 확인하세요
2. designs/design.md를 검토하고 필요한 부분을 수정하세요
3. 수정 후 designs/design-tokens.css도 함께 업데이트하세요 (항상 세트!)
   💡 designs/design-tokens.css 수정 후 프리뷰를 새로고침하면 바로 반영됩니다
4. 확정 후 /al oneshot 으로 기능 개발을 시작하세요

⚠️ designs/design.md와 designs/design-tokens.css는 파이프라인 실행 전에 확정해야 합니다.
   파이프라인 실행 중에는 수정하지 마세요 (헌법 제16조).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
