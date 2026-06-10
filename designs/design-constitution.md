# 대한민국 디지털 정부서비스 UI/UX 디자인 가이드라인 (AI 개발 헌법)

본 가이드는 AI 개발 어시스턴트(Gemini, Claude 등)가 디지털 정부서비스(웹/모바일 앱)의 UI/UX를 설계하고 개발할 때 반드시 준수하여야 하는 기준 및 원칙을 정의한 명세서입니다. 모든 코드 생성 시 이 가이드라인의 세부 항목과 제공된 마크업 예시를 픽셀 단위로 엄격히 반영해야 합니다.

---

## Ⅰ. 가이드라인의 구성 (웹 접근성 및 주요 원칙)

**01. 사용자 중심의 서비스**
- 행정 편의가 아닌 국민(사용자)의 관점에서, 사용자가 목적을 빠르고 쉽게 달성할 수 있도록 화면과 프로세스를 설계합니다.

**02. 모든 사용자를 포용하는 서비스**
- 웹 콘텐츠 접근성 지침(WCAG 2.1 AA)을 준수합니다. (키보드 탭(Tab) 인덱싱 완비, 시맨틱 태그 사용 등)

**03. 공통된 경험 안에서 개별 특성을 고려한 서비스**
- 정부 공통 디자인 시스템의 일관성을 유지하면서, 대상 사용자와 서비스의 성격에 맞게 UI를 유연하게 적용합니다.

**04. 빠르고 간단한 서비스**
- 불필요한 입력 단계를 최소화하고 성능에 악영향을 미치는 무거운 렌더링 요소를 배제합니다.

**05. 쉽게 이해하고 사용할 수 있는 서비스**
- 전문 용어나 행정 용어 대신, 누구나 직관적으로 이해할 수 있는 일상 용어로 레이블(Label)과 설명 텍스트를 작성합니다.

**06. 사용자의 다양한 상황을 고려하는 서비스**
- 모바일 우선(Mobile-first) 반응형 웹을 적용하여 화면 크기 및 디바이스(보조기기 포함) 제약 없이 동일한 경험을 보장합니다.

**07. 신뢰할 수 있는 서비스**
- 시스템 상태(성공, 진행 중, 에러)에 대한 시각적/청각적 피드백을 즉각적이고 명확하게 제공합니다.

---

## Ⅱ. 스타일 (Style)

**00. 기관 적용 범위 및 항목**
- 기관별(중앙부처, 지자체 등) 로고 및 아이덴티티 영역 외에는 본 공통 스타일 가이드를 준수합니다.

**01. 색상 (Color)**
- 체계적인 컬러 사용을 위해 주조색(Primary), 보조색(Secondary), 무채색(Gray Scale), 투명도(Alpha), 피드백 색상 시스템을 구축합니다. 명도 대비는 텍스트와 배경 간 최소 4.5:1 이상을 유지합니다.
```css
/* 정부 공통 디자인 시스템(KRDS) 풀스케일 팔레트 예시 */
:root {
  /* 1. 주조색 (Primary Color - Blue 계열) */
  --color-primary-50:  #ebf4ff;
  --color-primary-100: #d0e3ff;
  --color-primary-200: #a9c7ff;
  --color-primary-300: #7aa5ff;
  --color-primary-400: #5583ff;
  --color-primary-500: #3563ff; /* Base: 브랜드 포인트 */
  --color-primary-600: #1a42e5; /* Hover */
  --color-primary-700: #102eb8; /* Active */
  --color-primary-800: #0d2794;
  --color-primary-900: #0a2176;

  /* 2. 보조색 (Secondary Color - Slate/Grayish 계열) */
  --color-secondary-50:  #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-200: #e2e8f0;
  --color-secondary-300: #cbd5e1;
  --color-secondary-400: #94a3b8;
  --color-secondary-500: #64748b; /* Base: 부가 정보, 비활성 버튼 등 */
  --color-secondary-600: #475569; /* Hover */
  --color-secondary-700: #334155; /* Active */
  --color-secondary-800: #1e293b;
  --color-secondary-900: #0f172a;

  /* 3. 무채색 (Gray Scale - 레이아웃 및 텍스트) */
  --color-gray-50:  #f9fafb; /* Background 1 (Box) */
  --color-gray-100: #f3f4f6; /* Background 2 (Read-only) */
  --color-gray-200: #e5e7eb; /* Line Light */
  --color-gray-300: #d1d5db; /* Line Default (Border) */
  --color-gray-400: #9ca3af; /* Line Dark */
  --color-gray-500: #6b7280; /* Text Disabled (Disabled input) */
  --color-gray-600: #4b5563; /* Text Description (부가 설명 텍스트) */
  --color-gray-700: #374151; /* Text Base (일반 본문 텍스트) */
  --color-gray-800: #1f2937; /* Text Title (서브 타이틀) */
  --color-gray-900: #111827; /* Text Title Strong (강조 타이틀, H1) */

  /* 4. 투명도 (Alpha - 그림자, 모달 배경) */
  --color-alpha-black-10: rgba(0, 0, 0, 0.1);
  --color-alpha-black-20: rgba(0, 0, 0, 0.2);
  --color-alpha-black-40: rgba(0, 0, 0, 0.4); /* Dimmed Modal Background */
  --color-alpha-black-60: rgba(0, 0, 0, 0.6);
  --color-alpha-black-80: rgba(0, 0, 0, 0.8);
  --color-alpha-white-10: rgba(255, 255, 255, 0.1);
  --color-alpha-white-80: rgba(255, 255, 255, 0.8);

  /* 5. 의미색 및 시맨틱 토큰 (Semantic / Utility Colors) */
  /* 상태 및 피드백 (Status / Feedback) */
  --color-success:     #16a34a; /* 성공, 입력 완료 (Success) */
  --color-information: #0ea5e9; /* 정보, 안내 (Information) */
  --color-warning:     #d97706; /* 경고, 주의 사항 (Warning) */
  --color-danger:      #dc2626; /* 위험, 에러, 실패 (Danger) */

  /* 요소 배경 (Background) */
  --color-bg-default:  #ffffff; /* 기본 페이지 배경 */
  --color-bg-surface:  #f9fafb; /* 폼, 박스, 모달 바탕 (--color-gray-50) */
  --color-bg-subtle:   #f3f4f6; /* 구분용 보조 배경 (--color-gray-100) */

  /* 테두리 (Border) */
  --color-border-light:   #e5e7eb; /* 연한 테두리, 구분선 */
  --color-border-default: #d1d5db; /* 입력창 기본 테두리 (--color-gray-300) */
  --color-border-dark:    #9ca3af; /* 포커스 아웃라인 등 강한 테두리 */

  /* 본문 및 타이포그래피 텍스트 (Text) */
  --color-text-primary:   #111827; /* 강한 강조, H1 등 (--color-gray-900) */
  --color-text-default:   #374151; /* 기본 본문 텍스트 (--color-gray-700) */
  --color-text-secondary: #6b7280; /* 부가 설명 텍스트 (--color-gray-500) */
  --color-text-disabled:  #9ca3af; /* 비활성 텍스트 (--color-gray-400) */
  --color-text-inverse:   #ffffff; /* 어두운 배경 위 텍스트 */

  /* 시선 집중 포인트 컬러 (Point Color) */
  --color-point:          #3563ff; /* 브랜드 및 메인 액션 포인트 (--color-primary-500) */
}
```
```html
<!-- 주조색 (Primary) -->
<div class="mb-4">
  <p class="text-xs font-bold text-gray-500 mb-2">주조색 (Primary)</p>
  <div class="flex gap-1">
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#ebf4ff;border:1px solid #e2e8f0"></div><span class="text-[10px] font-mono text-gray-500">50</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#d0e3ff"></div><span class="text-[10px] font-mono text-gray-500">100</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#a9c7ff"></div><span class="text-[10px] font-mono text-gray-500">200</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#7aa5ff"></div><span class="text-[10px] font-mono text-gray-500">300</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#5583ff"></div><span class="text-[10px] font-mono text-gray-500">400</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#3563ff"></div><span class="text-[10px] font-mono text-gray-500">500</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#1a42e5"></div><span class="text-[10px] font-mono text-gray-500">600</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#102eb8"></div><span class="text-[10px] font-mono text-gray-500">700</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#0d2794"></div><span class="text-[10px] font-mono text-gray-500">800</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#0a2176"></div><span class="text-[10px] font-mono text-gray-500">900</span></div>
  </div>
</div>
<!-- 무채색 (Gray) -->
<div class="mb-4">
  <p class="text-xs font-bold text-gray-500 mb-2">무채색 (Gray)</p>
  <div class="flex gap-1">
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#f9fafb;border:1px solid #e2e8f0"></div><span class="text-[10px] font-mono text-gray-500">50</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#f3f4f6;border:1px solid #e2e8f0"></div><span class="text-[10px] font-mono text-gray-500">100</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#e5e7eb"></div><span class="text-[10px] font-mono text-gray-500">200</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#d1d5db"></div><span class="text-[10px] font-mono text-gray-500">300</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#9ca3af"></div><span class="text-[10px] font-mono text-gray-500">400</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#6b7280"></div><span class="text-[10px] font-mono text-gray-500">500</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#4b5563"></div><span class="text-[10px] font-mono text-gray-500">600</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#374151"></div><span class="text-[10px] font-mono text-gray-500">700</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#1f2937"></div><span class="text-[10px] font-mono text-gray-500">800</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#111827"></div><span class="text-[10px] font-mono text-gray-500">900</span></div>
  </div>
</div>
<!-- 의미색 (Semantic) -->
<div>
  <p class="text-xs font-bold text-gray-500 mb-2">의미색 (Semantic)</p>
  <div class="flex gap-3">
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#16a34a"></div><span class="text-[10px] font-mono text-gray-500">성공</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#0ea5e9"></div><span class="text-[10px] font-mono text-gray-500">정보</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#d97706"></div><span class="text-[10px] font-mono text-gray-500">경고</span></div>
    <div class="flex flex-col items-center gap-1"><div class="w-10 h-10 rounded" style="background:#dc2626"></div><span class="text-[10px] font-mono text-gray-500">위험</span></div>
  </div>
</div>
```

**02. 서체 (Typography)**
- 본고딕(Noto Sans KR) 등 가독성이 높은 기본 산세리프 서체를 사용합니다. 폰트 크기는 모바일 환경을 고려하여 본문 기준 16px 이상을 권장합니다.
```css
body {
  font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
  font-size: 16px; /* 모바일 대응 기준 해상도 */
  line-height: 1.6; /* 가독성 확보를 위한 최소 150% 이상 줄간격 */
  color: #111827; /* 완전한 검은색(#000000) 대비 피로도 저하 */
}
```

```html
<div class="flex flex-col gap-6 p-4">
  <div>
    <h1 class="text-4xl font-bold text-gray-900 mb-2">대한민국 정부포털 (Heading 1)</h1>
    <p class="text-sm text-gray-500 font-mono">font-size: 36px / font-weight: 700 / color: #111827</p>
  </div>
  
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-2">대국민 서비스 혁신 가이드 (Heading 2)</h2>
    <p class="text-sm text-gray-500 font-mono">font-size: 24px / font-weight: 700 / color: #1f2937</p>
  </div>
  
  <div>
    <h3 class="text-lg font-bold text-gray-800 mb-2">디지털 서비스 이용 방법 (Heading 3)</h3>
    <p class="text-sm text-gray-500 font-mono">font-size: 18px / font-weight: 700 / color: #1f2937</p>
  </div>
  
  <hr class="border-gray-200">
  
  <div>
    <p class="text-base text-gray-700 leading-relaxed mb-2">
      이 텍스트는 대한민국 디지털 정부서비스의 기본 본문 텍스트입니다. "본고딕(Noto Sans KR)"이나 "Pretendard"와 같은 가독성이 높은 산세리프 서체를 사용하며, 줄간격은 가독성을 위해 최소 1.5(150%) 이상을 확보합니다. 텍스트 색상은 완전한 검은색(#000000)이 아닌 짙은 회색(#111827 또는 #374151)을 사용하여 눈의 피로도를 줄입니다.
    </p>
    <p class="text-sm text-gray-500 font-mono">Base Body Text - font-size: 16px / line-height: 1.6 / color: #374151</p>
  </div>
  
  <div>
    <p class="text-sm text-gray-500 mb-2">
      보조 설명이나 부가적인 정보, 날짜 및 캡션 등에 사용되는 작은 텍스트입니다. 중요도가 상대적으로 낮은 정보에 적용됩니다.
    </p>
    <p class="text-sm text-gray-500 font-mono">Secondary Text - font-size: 14px / color: #6b7280</p>
  </div>
</div>
```
**03. 형태 (Shape)**
- 버튼, 입력창 등 요소를 둥근 모서리(border-radius)로 일관되게 처리하여 부드러운 인상을 부여하며, 터치 디바이스 기준 터치 영역은 최소 44x44px을 확보합니다.
```css
/* 버튼 및 입력창 형태 공통 예시 */
.btn-base, .input-base {
  border-radius: 8px; /* 통일된 둥근 인상 */
  min-height: 44px; /* WCAG 2.1 모바일 최소 터치 영역 확보 */
  min-width: 44px;
}
.input-base {
  display: block;
  width: 100%;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border-default);
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  background-color: #fff;
}
.input-base:focus {
  outline: 2px solid #000;
  outline-offset: 2px;
  border-color: #000;
}
```
```html
<div class="flex flex-wrap items-center gap-6">
  <button type="button" class="btn-base btn-primary">버튼 예시</button>
  <input type="text" class="input-base max-w-xs" placeholder="입력창 예시">
</div>
```

**04. 배치 (Layout)**
- 12-컬럼 그리드(Grid) 시스템을 기준 삼아 여백(Margin/Padding)을 넉넉히 제공하여 정보 덩어리(Chunk) 간의 독립성을 보장합니다.
```css
/* 반응형 컨테이너 및 12그리드 구조 예시 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px; /* 모바일 사이즈 좌우 안전 여백 */
}
.grid-layout {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px; /* 덩어리(Chunk) 간 넉넉한 시각적 여백 */
}
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: repeat(4, minmax(0, 1fr)); /* 모바일 4컬럼 변환 */
  }
}
```
```html
<!-- 데스크톱: 12컬럼 -->
<div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:8px;" class="mb-4">
  <div style="grid-column:span 8" class="bg-blue-100 border border-blue-300 rounded px-2 py-3 text-xs text-center text-blue-700 font-mono">col-8 (본문)</div>
  <div style="grid-column:span 4" class="bg-gray-100 border border-gray-300 rounded px-2 py-3 text-xs text-center text-gray-600 font-mono">col-4 (사이드)</div>
</div>
<div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:8px;" class="mb-4">
  <div style="grid-column:span 4" class="bg-blue-50 border border-blue-200 rounded px-2 py-3 text-xs text-center text-blue-600 font-mono">col-4</div>
  <div style="grid-column:span 4" class="bg-blue-50 border border-blue-200 rounded px-2 py-3 text-xs text-center text-blue-600 font-mono">col-4</div>
  <div style="grid-column:span 4" class="bg-blue-50 border border-blue-200 rounded px-2 py-3 text-xs text-center text-blue-600 font-mono">col-4</div>
</div>
<!-- 모바일: 4컬럼 -->
<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;max-width:320px;">
  <div style="grid-column:span 4" class="bg-orange-50 border border-orange-200 rounded px-2 py-3 text-xs text-center text-orange-600 font-mono">col-4 (전체)</div>
  <div style="grid-column:span 2" class="bg-orange-50 border border-orange-200 rounded px-2 py-2 text-xs text-center text-orange-600 font-mono">col-2</div>
  <div style="grid-column:span 2" class="bg-orange-50 border border-orange-200 rounded px-2 py-2 text-xs text-center text-orange-600 font-mono">col-2</div>
</div>
```

**05. 아이콘 (System icon)**
- 미니멀하고 직관적인 선형(Line) 또는 면형(Solid) 아이콘을 일관되게 적용하며, 반드시 대체 텍스트(`aria-label` 등)와 함께 배치합니다.
```html
<!-- 의미 있는 아이콘: aria-label 또는 내부 sr-only 텍스트 부여 -->
<button type="button" aria-label="현재 정보 새로고침">
  <svg aria-hidden="true" class="icon-refresh">...</svg>
</button>

<!-- 의미 없는 꾸밈 아이콘: 스크린리더 무결성을 위해 aria-hidden="true" -->
<a href="/mypage" class="flex items-center gap-2">
  <svg aria-hidden="true" class="icon-user">...</svg>
  내 정보
</a>
```

---

## Ⅲ. 컴포넌트 (Components)

### 1. 입력 (Input)
**01. 날짜 입력 필드 (Date input)**
- 숫자 직접 입력(YYYY-MM-DD) 기능과 웹 표준 Date Picker를 함께 제공합니다.
```html
<label for="dateInput">예약 일자</label>
<input type="date" id="dateInput" name="dateInput" class="border-gray-300 rounded focus:border-blue-500 max-w-xs">
```

**02. 텍스트 영역 (Textarea)**
- 여러 줄의 줄바꿈 입력을 허용하며, 작성 가능한 최대 글자수 및 현재 입력 현황을 제공합니다.
```html
<label for="detailReason">상세 사유</label>
<textarea id="detailReason" aria-describedby="textCount" class="w-full resize-y border-gray-300 rounded"></textarea>
<div id="textCount" class="text-right text-sm text-gray-500" aria-live="polite">0 / 1000자</div>
```

**03. 텍스트 입력 필드 (Text input)**
- `<label>` 요소와 1:1로 매칭(`id`와 `for` 속성 활용)하고, Focus 시 시각적 테두리 포커스 라인을 분명히 제공합니다.
```html
<label for="userEmail">이메일 <span class="text-red-500" aria-hidden="true">*</span></label>
<input type="email" id="userEmail" aria-required="true" aria-invalid="true" aria-describedby="emailErrorMsg" class="w-full border-red-500 rounded">
<p id="emailErrorMsg" class="mt-1 text-sm text-red-500">올바른 이메일 형식을 입력하세요.</p>
```

**03-1. 텍스트 입력 상태별 예시 (Input States)**
- 입력 상태에 따른 테두리 색과 보조 텍스트를 일관되게 처리합니다.
```html
<!-- Default -->
<div class="mb-4">
  <label for="i-default" class="block font-bold mb-1">이름</label>
  <input type="text" id="i-default" placeholder="이름을 입력하세요"
    class="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black">
</div>

<!-- Success (유효성 통과) -->
<div class="mb-4">
  <label for="i-ok" class="block font-bold mb-1">이메일</label>
  <input type="email" id="i-ok" value="user@gov.kr"
    class="w-full h-10 px-3 border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-black">
  <p class="mt-1 text-sm text-green-600" role="status">✓ 사용 가능한 이메일입니다.</p>
</div>

<!-- Disabled (자동 입력 or 잠금) -->
<div class="mb-4">
  <label for="i-disabled" class="block font-bold mb-1 text-gray-400">민원 번호 <span class="text-xs font-normal">(자동 입력)</span></label>
  <input type="text" id="i-disabled" value="REQ-2024-00123" disabled
    class="w-full h-10 px-3 border border-gray-200 rounded bg-gray-100 text-gray-400 cursor-not-allowed">
</div>

<!-- Read-only (표시용, 수정 불가) -->
<div class="mb-4">
  <label for="i-readonly" class="block font-bold mb-1">접수 일시</label>
  <input type="text" id="i-readonly" value="2024.11.01 14:32" readonly
    class="w-full h-10 px-3 border border-gray-300 rounded bg-gray-50 text-gray-600">
</div>
```

**04. 파일 업로드 (File upload)**
- 파일 선택 버튼의 가시성을 높이고 업로드된 파일의 명칭, 용량, 삭제 액션을 제공합니다.
```html
<div class="border-2 border-dashed border-gray-300 p-6 text-center">
  <label for="docUpload" class="cursor-pointer text-blue-600 underline">파일 선택</label> 또는 드래그 앤 드롭
  <input type="file" id="docUpload" class="sr-only" multiple>
</div>
<ul class="mt-4" aria-label="첨부된 파일 리스트">
  <li class="flex justify-between items-center bg-gray-50 p-2">
    <span>신분증사본.jpg (1.2MB)</span>
    <button type="button" aria-label="신분증사본.jpg 삭제" class="text-red-500 font-bold">✕</button>
  </li>
</ul>
```

### 2. 피드백 (Feedback)
**01. 단계 표시기 (Step indicator)**
- 3단계 이상의 과정 진행 시, 상단에 현재 단계 번호/이름과 전체 진행 흐름을 시각적으로 나타냅니다.
```html
<ol class="flex justify-between w-full text-center" aria-label="신청 진행 단계">
  <li class="text-gray-400">1. 약관동의</li>
  <li class="font-bold text-blue-600" aria-current="step">2. 정보입력</li>
  <li class="text-gray-400">3. 신청완료</li>
</ol>
```

**02. 스피너 (Spinner)**
- 대기 시간이 1초 이상 소요될 경우 진행 버튼 위에 스피너 아이콘을 표시하고, `aria-live="polite"`를 선언합니다.
```html
<div role="status" aria-live="polite" class="flex items-center space-x-2">
  <svg class="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24"><!-- SVG Paths --></svg>
  <span class="sr-only">요청을 처리하고 있습니다. 잠시만 기다려주세요.</span>
</div>
```

**03. 토스트 (Toast)**
- 사용자 행동에 대한 결과를 '일시적'으로 알려주는 피드백 요소입니다. 화면 하단 중앙에 기본 3초(3000ms)간 노출 후 자동 소멸됩니다.
- 치명적 에러(결제 실패 등) 발생 시에는 자동 소멸하지 않고 사용자가 직접 닫기 전까지 유지해야 합니다.
- `role="status"` 및 `aria-live="polite"`를 적용하여 스크린리더가 내용을 읽도록 합니다.
```html
<!-- 성공(Success) 토스트 -->
<div role="status" aria-live="polite" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
  <svg aria-hidden="true" class="w-5 h-5 text-green-400"><!-- 체크 아이콘 --></svg>
  <span>인증이 성공적으로 완료되었습니다.</span>
</div>

<!-- 에러(Error) 토스트 - 닫기 버튼 포함, 자동 소멸 안 됨 -->
<div role="alert" aria-live="assertive" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
  <svg aria-hidden="true" class="w-5 h-5"><!-- 경고 아이콘 --></svg>
  <span>결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.</span>
  <button type="button" aria-label="알림 닫기" class="ml-2 text-white/80 hover:text-white">✕</button>
</div>
```

**04. 툴팁 (Tooltip)**
- 아이콘이나 축약된 텍스트에 대한 보조 설명을 마우스 호버(Hover) 또는 키보드 포커스(Focus) 시 노출합니다.
- 타겟 요소와의 간격(Gap)은 `8px`을 유지하며, `z-30` 레이어에 렌더링합니다.
- Hover/Focus 이탈 시 즉시 해제되며, 애니메이션은 최소화합니다.
```html
<div class="relative inline-block group py-4">
  <button aria-describedby="tooltip-pw" class="underline text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">비밀번호 규칙 (Hover me)</button>
  <div id="tooltip-pw" role="tooltip" class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-gray-900 text-white text-xs p-3 rounded z-30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
    비밀번호는 영문, 숫자, 특수문자를 포함하여 8~16자리여야 합니다.
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
  </div>
</div>
```

**05. 프로그레스 바 (Progress bar)**
- 파일 업로드, 설문 진행률 등 수치 진행도를 시각적으로 표현합니다.
- `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` 속성을 반드시 제공하여 보조기기가 진행률을 인식할 수 있게 합니다.
```html
<div class="w-full">
  <div class="flex justify-between mb-1">
    <span class="text-sm font-bold">서류 업로드 진행률</span>
    <span class="text-sm text-blue-600 font-bold">65%</span>
  </div>
  <div class="w-full bg-gray-200 rounded-full h-2.5">
    <div role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" aria-label="서류 업로드 65% 완료" class="bg-blue-600 h-2.5 rounded-full" style="width: 65%"></div>
  </div>
</div>
```

**06. 인라인 알림 박스 (Inline Alert)**
- 페이지 본문 내 특정 영역에 인라인으로 고정 표시하는 피드백 요소입니다. 토스트와 달리 자동 소멸하지 않으며 화면 흐름 안에 렌더링됩니다.
- `role="alert"` (즉시 읽힘) 또는 `role="status"` (비긴급)를 상황에 맞게 선택합니다.
```html
<!-- 정보 (Info) -->
<div role="status" class="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <svg aria-hidden="true" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"><!-- 정보 아이콘 --></svg>
  <p class="text-sm text-blue-800">신청 기간은 <strong>2024.11.30</strong>까지입니다.</p>
</div>

<!-- 성공 (Success) -->
<div role="status" class="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
  <svg aria-hidden="true" class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"><!-- 체크 아이콘 --></svg>
  <p class="text-sm text-green-800">이메일 인증이 완료되었습니다.</p>
</div>

<!-- 경고 (Warning) -->
<div role="status" class="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
  <svg aria-hidden="true" class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"><!-- 경고 아이콘 --></svg>
  <p class="text-sm text-yellow-800">서류 미첨부 항목이 있습니다. 제출 전 확인해주세요.</p>
</div>

<!-- 오류 (Danger) -->
<div role="alert" class="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg">
  <svg aria-hidden="true" class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"><!-- 경고 아이콘 --></svg>
  <p class="text-sm text-red-800"><strong>필수 항목 누락:</strong> 성명, 연락처를 입력해주세요.</p>
</div>
```

### 3. 선택 (Selection)
**01. 라디오 버튼 (Radio button)**
- 둘 중 하나만 선택할 때 사용하며, 텍스트 라벨 전체에 클릭 이벤트를 바인딩합니다.
```html
<fieldset class="space-y-2">
  <legend class="font-bold">결제 수단</legend>
  <label class="flex items-center space-x-2"><input type="radio" name="payment" value="card"> <span>신용카드</span></label>
  <label class="flex items-center space-x-2"><input type="radio" name="payment" value="bank"> <span>계좌이체</span></label>
</fieldset>
```

**02. 셀렉트 (Select)**
- 5개 이상의 보기 항목 중 하나를 콤보박스 형태로 선택할 때 사용합니다. 스크롤 지원 및 키보드 조작성을 갖춥니다.
```html
<label for="agencySelect">관할 기관</label>
<select id="agencySelect" class="border-gray-300 rounded w-full">
  <option value="">관할 기관을 선택하세요</option>
  <option value="seoul">서울특별시청</option>
</select>
```

**03. 체크박스 (Checkbox)**
- 다중 선택 시 사용합니다. 전체 선택/해제 기능 제공 시 시각적 위계를 구별합니다.
```html
<label class="font-bold border-b pb-2 flex items-center gap-2">
  <input type="checkbox" aria-checked="mixed"> 전체 동의
</label>
<div class="mt-2 space-y-1 pl-4">
  <label class="flex items-center gap-2"><input type="checkbox" aria-required="true"> 필수 활용 동의</label>
  <label class="flex items-center gap-2"><input type="checkbox"> 알림 수신 동의 (선택)</label>
</div>
```

**04. 태그 (Tag)**
- 검색 조건 병합 및 분류 필터에 사용되며, 태그 해제 버튼이 있는 경우 `aria-label`을 할당합니다.
```html
<div class="flex gap-2">
  <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
    2024년 지원사업
    <button type="button" aria-label="해당 조건 태그 삭제" class="ml-2 hover:text-blue-900">×</button>
  </span>
</div>
```

**05. 토글 스위치 (Toggle switch)**
- ON/OFF 두 가지 상태만을 전환하는 단일 컨트롤이며, 설정 화면의 알림 수신, 다크모드 전환 등에 사용합니다.
- `role="switch"` 및 `aria-checked`를 반드시 제공하여 현재 상태를 보조기기가 인식하게 합니다.
```html
<label class="flex items-center gap-3 cursor-pointer">
  <span class="font-bold">알림 수신</span>
  <button type="button" role="switch" aria-checked="true" class="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
    <span class="sr-only">알림 수신 설정</span>
    <span aria-hidden="true" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
  </button>
</label>
```

**06. 슬라이더 (Slider / Range)**
- 예산 범위, 날짜 범위 등 연속적인 값 사이에서 원하는 범위를 선택할 때 사용합니다.
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` 속성을 반드시 제공합니다.
```html
<div class="w-full">
  <label for="budgetRange" class="block font-bold mb-2">지원 한도 (만원)</label>
  <input type="range" id="budgetRange" min="0" max="500" value="200" step="10"
    aria-valuemin="0" aria-valuemax="500" aria-valuenow="200" aria-valuetext="200만원"
    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600">
  <div class="flex justify-between text-xs text-gray-500 mt-1">
    <span>0</span><span>250</span><span>500</span>
  </div>
</div>
```

### 4. 액션 (Action)
**01. 링크 (Link)**
- 페이지 전환 시 텍스트 및 활성 색상(파란계열 등) 구분을 주며, 새 창 진입일 경우 추가 아이콘과 `title="새 창"` 속성을 제공합니다.
```html
<a href="https://example.go.kr" target="_blank" title="새 창 열림" class="text-blue-600 underline underline-offset-2">
  관련 법령 조회 <svg aria-hidden="true" class="inline w-4 h-4"><!-- icon --></svg>
</a>
```

**02. 버튼 (Button)**
- Primary(배경 색상 채움), Secondary(테두리 위주), Text(글자만 렌더링) 버튼의 우선순위를 명확히 시각화하고 행동을 구체적으로 지시하는 단어를 씁니다(예: '제출').
```css
/* 버튼 시스템 CSS 예시 */
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
  border: 1px solid transparent;
}
.btn-primary:hover { background-color: var(--color-primary-700); }
.btn-primary:focus { outline: 2px solid #000; outline-offset: 2px; }

.btn-secondary {
  background-color: transparent;
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
}
.btn-secondary:hover { background-color: var(--color-secondary-100); }

.btn-text {
  background-color: transparent;
  color: var(--color-primary);
  text-decoration: underline;
  border: 1px solid transparent;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
.btn-text:hover { color: var(--color-primary-700); }
```
```html
<div class="flex justify-end gap-3 mt-6">
  <button type="button" class="btn-base btn-text">취소</button>
  <button type="button" class="btn-base btn-secondary">이전 단계로</button>
  <button type="submit" class="btn-base btn-primary flex items-center gap-2">
    <span>신청서 최종 제출하기</span>
    <svg aria-hidden="true" class="w-4 h-4"><!-- 제출 아이콘 --></svg>
  </button>
</div>
```

**03. 버튼 상태 (Button States)**
- 버튼의 비활성(Disabled), 로딩(Loading), 위험(Danger) 상태를 명확히 구분합니다.
```html
<!-- Disabled: opacity 낮추고 cursor-not-allowed, disabled 속성 필수 -->
<button type="button" disabled class="btn-primary opacity-40 cursor-not-allowed">제출 불가</button>

<!-- Loading: aria-busy="true", 스피너 + 텍스트, 클릭 차단 -->
<button type="button" disabled aria-busy="true" class="btn-primary flex items-center gap-2 opacity-80 cursor-not-allowed">
  <svg class="animate-spin h-4 w-4" aria-hidden="true" viewBox="0 0 24 24"><!-- SVG Paths --></svg>
  <span>처리 중...</span>
</button>

<!-- Danger: 삭제·취소 등 비가역적 액션에만 사용 -->
<button type="button" class="bg-red-600 text-white px-4 py-2 rounded-lg font-bold min-h-[44px] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">신청 취소하기</button>
```

### 5. 아이덴티티 (Identity)
**01. 공식 배너 (Official Banner)**
- 대한민국 공식 디지털 정부서비스임을 알리는 컴포넌트입니다. 본 가이드라인(114p)에 따라 아래 원칙을 엄격하게 적용합니다.
  1. **배너는 모든 화면의 최상단(GNB보다 상단)에 제공한다.**
  2. 배너가 지나치게 주의를 끌지 않도록 차분한 톤으로 표현한다.
  3. 배너 텍스트와 스타일을 임의로 변형하지 않는다.
  4. 공식 디지털 정부서비스가 아닌 사이트에서는 배너를 사용하지 않아야 한다.
```html
<!-- 문서 최상단에 무조건 렌더링되는 공식 배너 영역 -->
<div aria-label="공식 디지털 정부서비스 안내 배너" class="w-full bg-gray-100 py-2 border-b border-gray-200">
  <div class="max-w-[1280px] w-full mx-auto px-4 flex items-center gap-2 text-sm text-gray-700">
    <img src="/assets/icons/taegukgi.svg" alt="태극기 마크" class="w-4 h-3">
    <p>이 누리집은 대한민국 공식 전자정부 누리집입니다.</p>
  </div>
</div>
```

**02. 운영기관 식별자 (Identifier)**
- 서비스에 대한 신뢰성을 위해 서비스 운영 주체의 상위 기관을 안내하는 요소입니다. 본 가이드라인(121~127p)에 따라 아래 원칙을 엄격히 적용합니다.
  1. 접근성 원칙(WCAG 2.1)에 따라 **반드시 푸터(Footer) 내부의 가장 마지막 구획**(`<section>` 또는 `<article>`)으로 포함되어야 합니다.
  2. 서비스 운영을 최종적으로 책임지는 **상위 기관의 로고**를 배치하며, 2개 이상일 경우 계층 수준에 따라 좌측부터 순서대로 배치합니다.
  3. 로고 이미지에는 스크린리더를 위한 대체 텍스트(`alt`)를 반드시 제공하여 KWCAG 2.2 기준을 충족해야 합니다.
  4. 식별자가 푸터 정보보다 지나치게 주의를 끌지 않도록 차분한 컨테이너 배경색을 사용합니다.
```html
<footer class="w-full bg-gray-50 border-t border-gray-200 pt-8 pb-4">
  <!-- 푸터 상단 요소 (이용약관, 메뉴 등 생략) -->
  
  <!-- 운영기관 식별자 (Footer 내부 최하단 구획 요소로 선언) -->
  <section aria-label="운영기관 식별자" class="max-w-[1280px] w-full mx-auto px-4 border-t border-gray-300 pt-4 flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
    <div class="flex items-center gap-3">
      <!-- 상위 기관 로고 (대체 텍스트 필수) -->
      <img src="/assets/logos/gov_logo.svg" alt="행정안전부 로고" class="h-8 w-auto">
      <img src="/assets/logos/nha_logo.svg" alt="국민건강보험공단 로고" class="h-8 w-auto">
    </div>
    <p>본 서비스는 행정안전부 및 국민건강보험공단의 관리를 받고 있습니다.</p>
  </section>
</footer>
```

**03. 푸터 (Footer)**
- 페이지 하단에 제공되는 사이트 제공자 관련 정보 및 정책 요소 컴포넌트입니다.
- **필수 제공 정보:** 개인정보처리방침(글꼴 굵게 처리하여 강조), 이용약관, 저작권, 주소, 연락처
- **운영기관 식별자:** 푸터 내부 최하단 공간에 반드시 포함하여 서비스 신뢰도를 보장합니다.
```html
<footer class="w-full bg-gray-50 border-t border-gray-200 pt-8 pb-4">
  <div class="max-w-[1280px] mx-auto px-4">
    <!-- 정책 링크 -->
    <ul class="flex flex-wrap gap-4 mb-6 text-sm">
      <li><a href="/privacy" class="text-gray-900 font-bold hover:underline">개인정보처리방침</a></li>
      <li><a href="/terms" class="text-gray-600 hover:underline">이용약관</a></li>
      <li><a href="/copyright" class="text-gray-600 hover:underline">저작권정책</a></li>
      <li><a href="/sitemap" class="text-gray-600 hover:underline">사이트맵</a></li>
    </ul>
    <!-- 기관 정보 -->
    <address class="not-italic text-sm text-gray-600 space-y-1">
      <p>세종특별자치시 도욀6로 42 (어진동) 정부세종청사</p>
      <p>전화: 국번없이 110 | 팩스: 044-200-1234</p>
    </address>
    <p class="text-xs text-gray-400 mt-4">© Ministry of the Interior and Safety. All rights reserved.</p>
    <!-- 운영기관 식별자 -->
    <section aria-label="운영기관 식별자" class="border-t border-gray-300 pt-4 mt-4 flex items-center gap-3">
      <img src="/assets/logos/gov_logo.svg" alt="행정안전부 로고" class="h-8 w-auto">
    </section>
  </div>
</footer>
```

**04. 헤더 (Header)**
- 사용자가 사이트 내 어디서든 글로벌 내비게이션(GNB), 검색, 유틸리티 메뉴(로그인/회원가입)에 접근할 수 있도록 돕습니다.
- **최상단 고정 (Sticky):** 탐색의 편의성을 극대화하기 위해, **화면을 스크롤 했을 때 헤더를 뷰포트 상단에 고정(`sticky top-0 z-[50]`)**시킵니다.
- **계층 위계:** 시각적인 위계에서 항상 본문 레이어 위에 있어야 하며, 스크롤 다운 시 배경이 불투명해야 합니다.
```html
<header class="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
  <!-- 내부 여백 및 1280px 크기 제한 -->
  <div class="max-w-[1280px] w-full mx-auto px-4 h-16 flex items-center justify-between">
    <!-- 서비스 로고 영역 -->
    <a href="/" title="메인 화면으로 이동" class="flex items-center gap-2">
      <img src="/assets/logos/service_logo.svg" alt="서비스명 로고" class="h-8 w-auto">
    </a>
    
    <!-- 글로벌 내비게이션 영역 -->
    <nav aria-label="전체 메뉴(GNB)" class="hidden md:flex gap-6 font-bold text-gray-800">
      <a href="/menu1" class="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-black">메뉴 1</a>
      <a href="/menu2" class="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-black">메뉴 2</a>
    </nav>
  </div>
</header>
```

### 6. 탐색 (Navigation)
**01. 건너뛰기 링크 (Skip Link)**
- 스크린 리더 및 키보드 사용자가 반복되는 헤더 영역을 건너뛰고 본문으로 직행할 수 있도록 제공합니다.
- `<body>` 태그 바로 직후에 가장 먼저 렌더링되어야 하며, 키보드 Tab 포커스 시에만 화면상에 노출되도록 구성합니다.
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] focus:bg-white focus:text-blue-600 focus:p-4 font-bold border-2 border-black">본문 바로가기</a>
```

**02. 메인 메뉴 (Main Menu)**
- 웹사이트 내 정보 구조(IA) 1~2Depth를 탐색하는 핵심 도구입니다. 접근성 보장을 위해 탭 이동과 화살표 키 이동이 원활해야 합니다.
- **현재 위치 표시:** 현재 활성화된 메뉴에는 반드시 `aria-current="page"` 속성을 적용하여 시각장애인도 현재 진입한 메뉴를 알 수 있게 합니다.
- 모바일(뷰포트 협소 시)에서는 본문 집중도를 위해 햄버거 메뉴 토글 버튼(`<button aria-expanded="false">`) 형태로 숨깁니다.
```html
<nav aria-label="메인 메뉴">
  <ul class="flex gap-6 font-medium text-gray-800">
    <li><a href="/about" class="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-black">기관 소개</a></li>
    <!-- 현재 활성화된 메뉴 -->
    <li><a href="/service" aria-current="page" class="text-blue-600 font-bold border-b-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-black">민원 서비스</a></li>
  </ul>
</nav>
```

**02-1. 모바일 햄버거 메뉴 (Mobile GNB)**
- 모바일(뷰포트 협소 시) GNB는 햄버거 버튼으로 토글합니다. `aria-expanded`로 열림/닫힘 상태를 반드시 표시합니다.
```html
<header class="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
  <div class="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" title="메인 화면으로 이동">
      <img src="/assets/logos/service_logo.svg" alt="서비스명 로고" class="h-8 w-auto">
    </a>

    <!-- 데스크탑 GNB (md 이상에서 표시) -->
    <nav aria-label="전체 메뉴(GNB)" class="hidden md:flex gap-6 font-bold text-gray-800">
      <a href="/menu1" class="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-black">메뉴 1</a>
      <a href="/menu2" class="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-black">메뉴 2</a>
    </nav>

    <!-- 모바일 햄버거 버튼 (md 미만에서만 표시) -->
    <button type="button" id="menuToggle" aria-expanded="false" aria-controls="mobileMenu"
      aria-label="전체 메뉴 열기" class="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-black">
      <svg aria-hidden="true" class="w-6 h-6"><!-- 햄버거 아이콘 --></svg>
    </button>
  </div>

  <!-- 모바일 드롭다운 메뉴 -->
  <nav id="mobileMenu" aria-label="전체 메뉴(모바일)" class="hidden md:hidden border-t border-gray-200 bg-white">
    <ul class="px-4 py-3 space-y-1 text-gray-800 font-bold">
      <li><a href="/menu1" class="block py-3 border-b border-gray-100 hover:text-blue-600">메뉴 1</a></li>
      <li><a href="/menu2" class="block py-3 hover:text-blue-600">메뉴 2</a></li>
    </ul>
  </nav>
</header>

<script>
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('hidden', open);
  });
</script>
```

**03. 브레드크럼 (Breadcrumb)**
- 현재 페이지가 전체 사이트 트리에서 어디에 위치하는지 경로를 보여줍니다.
- 상위 경로는 링크를, 제일 우측의 **현재 페이지는 일반 텍스트(강조)**로 처리하고 링크를 걸지 않습니다. `<nav aria-label="브레드크럼(경로)">` 태그로 묶습니다.
```html
<nav aria-label="브레드크럼(경로)">
  <ol class="flex space-x-2 text-sm text-gray-600">
    <li><a href="/" class="hover:underline">홈</a> <span aria-hidden="true">&gt;</span></li>
    <li><a href="/welfare" class="hover:underline">복지정책</a> <span aria-hidden="true">&gt;</span></li>
    <li><span class="font-bold text-gray-900" aria-current="page">청년 주거 지원</span></li>
  </ol>
</nav>
```

**04. 사이드 메뉴 (Side Menu / LNB)**
- 복잡한 정보구조 공간에서 메인 메뉴의 하위(Depth) 구조를 좌측에 탐색 트리로 제공합니다.
- 하위 메뉴가 접히거나 펴지는 아코디언 형태일 경우 `<button aria-expanded="true/false" aria-controls="menu-ID">`를 명시합니다.
```html
<nav aria-label="서브 메뉴" class="w-60 border-r border-gray-200 bg-white">
  <ul class="text-sm">
    <li>
      <button aria-expanded="true" aria-controls="side-sub-1" class="w-full flex justify-between items-center px-4 py-3 font-bold text-blue-600 bg-blue-50 border-l-4 border-blue-600">
        복지 정책 <svg class="w-4 h-4"><!-- chevron --></svg>
      </button>
      <ul id="side-sub-1" class="bg-gray-50">
        <li><a href="/welfare/youth" aria-current="page" class="block px-8 py-2 text-blue-600 font-bold">청년 지원</a></li>
        <li><a href="/welfare/senior" class="block px-8 py-2 text-gray-700 hover:text-blue-600">노인 복지</a></li>
      </ul>
    </li>
    <li>
      <button aria-expanded="false" aria-controls="side-sub-2" class="w-full flex justify-between items-center px-4 py-3 font-bold text-gray-800 hover:bg-gray-50">
        교육 정책 <svg class="w-4 h-4"><!-- chevron --></svg>
      </button>
      <ul id="side-sub-2" class="hidden"></ul>
    </li>
  </ul>
</nav>
```

**05. 탭 및 페이지네이션 (Tabs & Pagination)**
- 복수의 콘텐츠 패널 중 하나를 선택해 화면을 전환할 때는 `<div role="tablist">` 및 `<button role="tab" aria-selected="true" aria-controls="panel-ID">`로 완전한 탭 접근성 구조를 짭니다.
- 게시판에서 화면을 넘기는 페이징 요소는 `<nav aria-label="페이지 이동">` 안에 현재 페이지를 `aria-current="page"`로 나타냅니다.
```html
<!-- 탭 컴포넌트 -->
<div role="tablist" class="flex border-b border-gray-200">
  <button role="tab" aria-selected="true" aria-controls="tab-panel-all" id="tab-all" class="px-6 py-3 border-b-2 border-blue-600 font-bold text-blue-600">전체 민원</button>
  <button role="tab" aria-selected="false" aria-controls="tab-panel-progress" id="tab-progress" tabindex="-1" class="px-6 py-3 text-gray-500 hover:text-gray-900">진행 중</button>
  <button role="tab" aria-selected="false" aria-controls="tab-panel-done" id="tab-done" tabindex="-1" class="px-6 py-3 text-gray-500 hover:text-gray-900">완료</button>
</div>
<div role="tabpanel" id="tab-panel-all" aria-labelledby="tab-all" tabindex="0" class="py-6">
  <!-- 탭 패널 콘텐츠 -->
</div>

<!-- 페이지네이션 -->
<nav aria-label="페이지 이동" class="flex justify-center mt-8">
  <ul class="flex items-center gap-1">
    <li><a href="?page=1" aria-label="첫 페이지" class="px-3 py-1 border rounded hover:bg-gray-50">«</a></li>
    <li><a href="?page=1" aria-label="이전 페이지" class="px-3 py-1 border rounded hover:bg-gray-50">&lt;</a></li>
    <li><a href="?page=1" aria-label="1페이지" class="px-3 py-1 border rounded hover:bg-gray-50">1</a></li>
    <li><span aria-current="page" class="px-3 py-1 bg-blue-600 text-white font-bold rounded">2</span></li>
    <li><a href="?page=3" aria-label="3페이지" class="px-3 py-1 border rounded hover:bg-gray-50">3</a></li>
    <li><a href="?page=3" aria-label="다음 페이지" class="px-3 py-1 border rounded hover:bg-gray-50">&gt;</a></li>
    <li><a href="?page=10" aria-label="마지막 페이지" class="px-3 py-1 border rounded hover:bg-gray-50">»</a></li>
  </ul>
</nav>
```

### 7. 레이아웃·표현 (Layout & Presentation)
**01. 구조화 목록 (Structured list)**
- 반복되는 정보는 목록 요소(`<ul>`, `<ol>`, `<dl>`)를 사용하여 논리성을 부여합니다.
```html
<ul class="list-disc pl-5 space-y-2">
  <li>제출 기한: 변경 전까지 수시 신청</li>
  <li>유의 사항: 허위 작성 시 관련 법령에 의해 처벌될 수 있습니다.</li>
</ul>
```

**02. 긴급 공지 (Critical alerts)**
- 최상단 배너 공간에 사용하며, 바탕색 면 대비를 통해 시선을 끌도록 합니다.
```html
<div role="alert" class="w-full bg-red-50 border-t-4 border-red-500 p-4 mb-6">
  <div class="flex items-center gap-3">
    <svg aria-hidden="true" class="w-6 h-6 text-red-500"><!-- Alert Icon --></svg>
    <p class="font-bold text-red-700">시스템 점검으로 인하여 밤 11시부터 자정까지 서비스가 중단됩니다.</p>
  </div>
</div>
```

**03. 달력 (Calendar)**
- 예약 등의 날짜 다중 선택에 적용되며, 휴일 및 선택 불가 일자를 명확히 회색조로 표현합니다.
```html
<div class="calendar" aria-label="날짜 선택 달력">
  <div class="header flex justify-between">
    <button aria-label="이전 달">◀</button>
    <span aria-live="polite" class="font-bold">2024년 10월</span>
    <button aria-label="다음 달">▶</button>
  </div>
  <table class="w-full text-center mt-2">
    <thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead>
    <tbody>
      <tr>
        <td class="text-red-500"><button aria-label="10월 1일 일요일">1</button></td>
        <td><button aria-label="10월 2일 임시공휴일" class="text-red-500">2</button></td>
        <td><button aria-label="10월 3일 개천절" class="text-red-500">3</button></td>
        <td><button aria-label="10월 4일" aria-pressed="true" class="bg-blue-600 text-white rounded-full w-8 h-8">4</button></td>
        <td><button aria-label="10월 5일" disabled class="text-gray-300">5</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

**04. 디스클로저 (Disclosure)**
- 제목 헤더를 클릭 시 콘텐츠가 펼쳐지는 요소를 통해 공간 활용도를 높이고 화살표(Chevron)로 상태를 보여줍니다.
```html
<button type="button" aria-expanded="false" aria-controls="detail-info" class="w-full flex justify-between items-center py-4 font-bold border-b">
  신청 상세 조건 보기 <svg class="w-5 h-5 transition-transform"><!-- chevron --></svg>
</button>
<div id="detail-info" class="hidden py-4 text-gray-600">
  신청 조건에 대한 상세한 텍스트 내용이 여기에 펼쳐집니다.
</div>
```

**05. 모달 (Modal)**
- 팝업과 달리 하단 요소를 Dim 처리한 오버레이로 중앙에 띄우며, 키보드 Focus Trap을 강제 적용합니다.
```html
<!-- Background Overlay -->
<div class="fixed inset-0 bg-black/50 z-40" aria-hidden="true"></div>
<!-- Modal Content -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl" tabindex="-1">
    <h2 id="modal-title" class="text-xl font-bold mb-4">서비스 이용 규칙 안내</h2>
    <div tabindex="0" class="max-h-[60vh] overflow-y-auto mb-6">...상세 약관...</div>
    <div class="flex justify-end"><button type="button" class="px-4 py-2 bg-blue-600 text-white rounded">확인 및 닫기</button></div>
  </div>
</div>
```

**06. 배지 (Badge)**
- 상태나 알림 카운트(숫자)를 작은 크기로 강조하는 컴포넌트입니다.
```html
<span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
  N <span class="sr-only">새로운 공지</span>
</span>
```

**07. 아코디언 (Accordion)**
- FAQ 형태와 같이 단일 또는 다중으로 접기/열기가 가능한 목록 구조입니다.
```html
<div class="accordion-group">
  <h3>
    <button aria-expanded="true" aria-controls="faq-answer-1" class="w-full flex justify-between font-bold py-3 border-b border-blue-600">
      Q. 증명서 발급에 수수료가 드나요? <svg class="transform rotate-180"><!-- chevron --></svg>
    </button>
  </h3>
  <div id="faq-answer-1" class="bg-gray-50 p-4 mb-2">
    A. 온라인 발급 시 무료이며, 방문 발급 시 1,000원의 수수료가 발생합니다.
  </div>
</div>
```

**08. 이미지 (Image)**
- 모든 콘텐츠의 핵심(`img`-의미 있는 이미지)에는 대체 텍스트 `alt` 속성을 빈틈없이 제공합니다. 장식 요소의 경우 `alt=""`로 선언합니다.
```html
<img src="/assets/business-step.png" alt="사업 신청 1. 접수 2. 서류심사 3. 선정 4. 지원 구조도" />
```

**09. 캐러셀 (Carousel)**
- 롤링 요소 제공 시 정지 및 슬라이드 이전/다음 버튼 등 사용자가 통제할 수 있는 컨트롤을 100% 보장해야 합니다.
```html
<div class="carousel" aria-roledescription="carousel" aria-label="메인 프로모션 배너">
  <div class="slides" aria-live="polite">...슬라이드들...</div>
  <div class="controls flex gap-2">
    <button aria-label="이전 배너">◀</button>
    <button aria-label="자동 재생 정지">⏸</button>
    <button aria-label="다음 배너">▶</button>
  </div>
</div>
```

**10. 탭 (Tab)**
- 역할 그룹 지정을 위해 `role="tablist"`, `role="tab"`, `role="tabpanel"` 등을 엄격하게 작성합니다.
```html
<div role="tablist" class="flex border-b">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" class="px-4 py-2 border-b-2 border-blue-600 font-bold text-blue-600">진행 중인 민원</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1" class="px-4 py-2 text-gray-500">완료된 민원</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0" class="py-4">...진행 중 민원 리스트...</div>
```

**11. 표 (Table)**
- `<th>`와 범위(`scope`), 캡션(`caption`)을 정의하고, 모바일 뷰어에서는 CSS로 리스트/카드형으로 전환되게 뷰를 조정합니다.
```html
<table class="w-full text-left border-collapse">
  <caption class="sr-only">공지사항 리스트(번호, 제목, 작성일)</caption>
  <thead class="bg-gray-100 border-y">
    <tr><th scope="col" class="p-3">번호</th><th scope="col" class="p-3">제목</th><th scope="col" class="p-3">작성일</th></tr>
  </thead>
  <tbody>
    <tr class="border-b"><td class="p-3">1</td><td class="p-3"><a href="#">결과 발표 지연 안내</a></td><td class="p-3">2024.11.02</td></tr>
  </tbody>
</table>
```

**12. 카드 (Card)**
- 독립적인 정보 단위(=덱어리)를 시각적으로 묶는 컨테이너 컴포넌트입니다. 목록 탐색, 정책 정보 나열, 대시보드 타일 등에 활용합니다.
- 카드 전체가 클릭 가능한 경우, `<a>` 또는 `<button>`으로 래핑하여 포커스/탭 접근성을 보장합니다.
```html
<article class="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  <img src="/assets/policy-thumb.jpg" alt="" class="w-full h-40 object-cover">
  <div class="p-4">
    <span class="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded mb-2">청년</span>
    <h3 class="font-bold text-lg mb-1"><a href="/policy/123" class="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600">청년 월세 지원 사업</a></h3>
    <p class="text-sm text-gray-600">월 최대 20만원의 월세 지원금을 최대 12개월간 지원합니다.</p>
    <p class="text-xs text-gray-400 mt-2">신청기간: 2024.01.01 ~ 2024.12.31</p>
  </div>
</article>
```

**13. 분할선 (Divider)**
- 독립적인 콘텐츠 덩어리 사이를 시각적으로 구분하는 선형 요소입니다.
- 시맨틱 HTML `<hr>` 태그를 사용하며, 장식 목적일 경우 `role="separator"` 및 `aria-hidden="true"`를 적용합니다.
```html
<!-- 의미 있는 구분선: 콘텐츠 섹션 구분 -->
<hr class="my-8 border-t border-gray-300">

<!-- 장식용 구분선: 스크린리더 무시 -->
<div role="separator" aria-hidden="true" class="my-4 border-t border-gray-200"></div>
```

**14. 노티피케이션 바 (Notification bar)**
- 페이지 상단에 시스템 점검, 새 기능 안내 등 일시적 정보를 띤 형태의 알림 바입니다.
- 사용자가 닫을 수 있는 닫기 버튼을 반드시 제공합니다.
```html
<div role="status" class="w-full bg-blue-600 text-white py-3 px-4">
  <div class="max-w-[1280px] mx-auto flex items-center justify-between">
    <p class="text-sm font-bold flex items-center gap-2">
      <svg aria-hidden="true" class="w-5 h-5"><!-- 안내 아이콘 --></svg>
      [2024.11.01] 시스템 업그레이드로 인해 오후 6시부터 1시간 서비스가 중단됩니다.
    </p>
    <button type="button" aria-label="안내 닫기" class="text-white/80 hover:text-white">✕</button>
  </div>
</div>
```

### 6. 탐색 (Navigation)
**01. 건너뛰기 링크 (Skip link)**
- 메뉴 탐색 반복을 피하기 위해 시각 장애인용 최상단 스킵 네비게이션을 기본 구축해야 합니다.
```html
<a href="#main-content" class="absolute -top-[999px] focus:top-0 left-0 bg-blue-600 text-white p-3 z-50">본문 바로가기</a>
```

**02. 메인 메뉴 (Main menu)**
- 주 탐색 트리 최상단 메뉴로 `nav` 시맨틱을 적용하며 하위 트리 확장 및 축소(`aria-expanded`)를 표시합니다.
```html
<nav aria-label="주 메뉴">
  <ul class="flex gap-6">
    <li class="relative">
      <button aria-expanded="false" aria-controls="sub-menu-1" class="font-bold hover:text-blue-600">민원안내</button>
      <ul id="sub-menu-1" class="absolute hidden bg-white shadow-lg p-4">
        <li><a href="/guide" class="block py-1 hover:text-blue-600">민원안내 및 신청</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

**03. 브레드크럼 (Breadcrumb)**
- 현재 계층(Depth)의 경로 구조를 가시적으로 출력하여 최상위 도달 경로 이탈 방지를 돕습니다.
```html
<nav aria-label="Breadcrumb">
  <ol class="flex space-x-2 text-sm text-gray-600">
    <li><a href="/" class="hover:underline">홈</a> <span aria-hidden="true">&gt;</span></li>
    <li><a href="/service" class="hover:underline">민원서비스</a> <span aria-hidden="true">&gt;</span></li>
    <li><span class="font-bold text-gray-900 pointer-events-none" aria-current="page">온라인 신청</span></li>
  </ol>
</nav>
```

**04. 사이드 메뉴 (Side navigation)**
- LNB(좌측/우측 메뉴)로 사용되며 현재 위치한 페이지 트리를 활성화(`aria-current="page"`) 강조합니다.
```html
<nav aria-label="좌측 서브 메뉴" class="w-56 bg-white border-r border-gray-200">
  <ul class="text-sm">
    <li>
      <a href="/welfare" class="block px-4 py-3 font-bold text-gray-800 hover:bg-gray-50">복지 정책</a>
      <ul class="bg-gray-50">
        <li><a href="/welfare/youth" aria-current="page" class="block px-8 py-2 text-blue-600 font-bold border-l-4 border-blue-600">청년 지원</a></li>
        <li><a href="/welfare/senior" class="block px-8 py-2 text-gray-700 hover:text-blue-600">노인 복지</a></li>
        <li><a href="/welfare/child" class="block px-8 py-2 text-gray-700 hover:text-blue-600">아동·보육</a></li>
      </ul>
    </li>
    <li>
      <a href="/education" class="block px-4 py-3 font-bold text-gray-800 hover:bg-gray-50">교육 정책</a>
    </li>
  </ul>
</nav>
```

**05. 콘텐츠 내 탐색 (In-page navigation)**
- 동일 페이지에서 앵커 이동이 잦은 콘텐츠에 대해 스티키 네비게이션을 지원합니다.
```html
<nav aria-label="페이지 내 탐색" class="sticky top-0 bg-white border-b z-30">
  <ul class="flex">
    <li class="flex-1 text-center"><a href="#section-1" class="block py-3 font-bold text-blue-600 border-b-2 border-blue-600">지원대상</a></li>
    <li class="flex-1 text-center"><a href="#section-2" class="block py-3 text-gray-500 hover:text-gray-900">선정기준</a></li>
  </ul>
</nav>
```

**06. 페이지네이션 (Pagination)**
- 데이터 테이블 또는 목록 간 페이지 이동 번호를 제공하고 활성 페이지 번호를 굵은 글씨와 바탕색으로 강조합니다.
```html
<nav aria-label="페이지 내비게이션" class="flex justify-center mt-6">
  <ul class="flex items-center gap-1">
    <li><a href="?page=1" aria-label="이전 페이지" class="px-3 py-1 border rounded hover:bg-gray-50">&lt;</a></li>
    <li><a href="?page=1" aria-label="1페이지" class="px-3 py-1 border rounded">1</a></li>
    <li><span aria-current="page" aria-label="2페이지" class="px-3 py-1 bg-blue-600 text-white font-bold rounded">2</span></li>
    <li><a href="?page=3" aria-label="3페이지" class="px-3 py-1 border rounded">3</a></li>
    <li><a href="?page=3" aria-label="다음 페이지" class="px-3 py-1 border rounded hover:bg-gray-50">&gt;</a></li>
  </ul>
</nav>
```

### 7. 아이덴티티 및 식별 (Identity)
**01. 공식 배너 (Masthead)**
- 상단 영역에 '이 누리집은 대한민국 공식 전자정부 누리집입니다.'라는 바를 노출하여 공신력을 주지해야 합니다.
```html
<div class="bg-[#F8F9FA] text-xs py-2 text-center text-gray-600 border-b">
  이 누리집은 대한민국 공식 전자정부 누리집입니다.
</div>
```

**02. 운영기관 식별자 (Identifier)**
- 메인 로고 및 해당 부처 명시 표기.
```html
<div class="logo">
  <a href="/" aria-label="대한민국 정부 메인 홈으로 이동">
    <img src="/assets/gov_logo.svg" alt="대한민국 정부" class="h-8">
  </a>
</div>
```

**03. 푸터 (Footer)**
- 위치 주소, 기관번호, 개인정보처리방침(`bold` 강조 권장)의 하단 구조를 일관되게 유지합니다.
```html
<footer class="bg-gray-800 text-gray-400 py-8 text-sm mt-12">
  <div class="max-w-[1280px] mx-auto px-4">
    <ul class="flex gap-4 mb-4">
      <li><a href="#" class="text-white font-bold">개인정보처리방침</a></li>
      <li><a href="#">이용약관</a></li>
      <li><a href="#">저작권정책</a></li>
    </ul>
    <address class="not-italic">세종특별자치시 도욀60로 42 (어진동) / 민원 콜센터 국번없이 110</address>
    <p class="mt-2">© Ministry of the Interior and Safety. All rights reserved.</p>
  </div>
</footer>
```
**04. 헤더 (Header)**
- GNB 영역으로 로고, 검색, 로그인 버튼 등 누리집 핵심 유도 장치를 포함합니다.
```html
<header class="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
  <div class="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" title="메인 화면으로 이동">
      <img src="/assets/logos/service_logo.svg" alt="서비스명 로고" class="h-8 w-auto">
    </a>
    <nav aria-label="전체 메뉴" class="hidden md:flex gap-6 font-bold text-gray-800">
      <a href="/about" class="hover:text-blue-600">기관 소개</a>
      <a href="/service" class="hover:text-blue-600">민원 서비스</a>
    </nav>
    <div class="flex items-center gap-4">
      <button type="button" aria-label="통합 검색" class="p-2 rounded hover:bg-gray-100">
        <svg aria-hidden="true" class="w-5 h-5"><!-- 돋보기 --></svg>
      </button>
      <a href="/login" class="text-sm text-gray-700 hover:text-blue-600">로그인</a>
    </div>
  </div>
</header>
```

### 8. 도움 (Help)
**01. 도움 패널 (Help panel)**
- 복잡한 행정 서식일수록 화면 측면 패널에 작성 예시나 도움글을 고정 배치합니다.
```html
<aside aria-labelledby="help-title" class="bg-blue-50 p-6 rounded-lg border border-blue-100">
  <h3 id="help-title" class="font-bold text-blue-800 mb-2">💡 양식 작성 팁</h3>
  <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
    <li>주소는 주민등록등본 상의 거주지를 기입해주세요.</li>
  </ul>
</aside>
```

**02. 따라하기 패널 (Tutorial panel)**
- 복잡한 행정 절차를 단계별로 따라해볼 수 있는 튜토리얼 뷰를 화면에 출력합니다.
```html
<section aria-labelledby="tutorial-title" class="bg-white border border-gray-200 rounded-lg p-6">
  <h3 id="tutorial-title" class="font-bold text-lg mb-4">📋 민원 신청 따라하기</h3>
  <ol class="space-y-4">
    <li class="flex items-start gap-3">
      <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</span>
      <div>
        <p class="font-bold text-gray-900">본인 인증</p>
        <p class="text-sm text-gray-600 mt-1">간편인증 또는 공동인증서를 통해 본인을 확인합니다.</p>
      </div>
    </li>
    <li class="flex items-start gap-3">
      <span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</span>
      <div>
        <p class="font-bold text-gray-900">신청서 작성</p>
        <p class="text-sm text-gray-600 mt-1">필수 항목(*)을 빠짐없이 입력합니다.</p>
      </div>
    </li>
    <li class="flex items-start gap-3">
      <span class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-sm">3</span>
      <div>
        <p class="font-bold text-gray-400">서류 첨부</p>
        <p class="text-sm text-gray-400 mt-1">필요 서류를 첨부합니다. (PDF, JPG 지원)</p>
      </div>
    </li>
  </ol>
  <div class="flex justify-between mt-6 pt-4 border-t border-gray-200">
    <span class="text-sm text-gray-500">현재 2 / 3 단계</span>
    <button type="button" class="text-sm bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">다음 단계로</button>
  </div>
</section>
```

**03. 맥락적 도움말 (Contextual help)**
- 입력창 옆 물음표(?) 아이콘을 hover 하거나 클릭 시 간단한 팝오버를 출력합니다.
```html
<div class="relative inline-block">
  <button aria-describedby="tooltip-msg" aria-label="관할 구역 관련 도움말" class="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">?</button>
  <div id="tooltip-msg" role="tooltip" class="absolute hidden top-8 left-0 w-48 p-2 bg-gray-900 text-white text-xs rounded z-10">
    주민등록상 주소지를 기준으로 관할 구역을 선택해주세요.
  </div>
</div>
```

**04. 코치마크 (Coach mark)**
- 최초 방문 시 단계별 가이드 모달/블랙 아웃 형태의 지시 선을 제공합니다.
```html
<!-- 화면 전체 Dim -->
<div class="fixed inset-0 bg-black/60 z-40"></div>
<!-- 하이라이트 될 영역 근처의 코치마크 툴팁 -->
<div class="absolute top-20 right-10 z-50 bg-white p-4 rounded shadow-lg max-w-xs" role="dialog" aria-label="새로운 기능 안내">
  <p class="font-bold text-blue-600 mb-1">새로운 알림 센터!</p>
  <p class="text-sm text-gray-600 mb-3">이제 나의 민원 처리 현황을 배지로 바로 확인할 수 있습니다.</p>
  <div class="flex justify-between">
    <span class="text-xs text-gray-400">1 / 3</span>
    <button class="text-xs bg-blue-600 text-white px-2 py-1 rounded">다음</button>
  </div>
</div>
```

---

## Ⅳ. 기본 서비스 패턴 (Basic Patterns)

**01. 개인 식별 정보 입력**
- 주민번호, 영문 이름 등 필수 식별 정보를 입력받을 때 쓰며, 입력 보조 텍스트를 제공합니다.
```html
<label for="ssn">주민등록번호 <span class="sr-only">13자리</span></label>
<div class="flex gap-2 items-center">
  <input type="text" id="ssn" inputmode="numeric" maxlength="6" aria-label="생년월일 6자리" class="border p-2">
  <span>-</span>
  <input type="password" inputmode="numeric" maxlength="7" aria-label="주민번호 뒷자리" class="border p-2">
</div>
```

**02. 도움**
- 입력 서식 작성 시 헷갈릴 수 있는 항목 옆에 도움말 툴팁 또는 패널을 바로 노출합니다.
```html
<div class="flex items-start gap-2">
  <label for="regAddr" class="block font-bold mb-1">등록기준지 <span class="text-red-500" aria-hidden="true">*</span></label>
  <div class="relative inline-block">
    <button type="button" aria-describedby="help-regAddr" aria-label="등록기준지 입력 도움말" class="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">?</button>
    <div id="help-regAddr" role="tooltip" class="absolute hidden left-6 top-0 w-60 p-3 bg-gray-900 text-white text-xs rounded z-30">
      등록기준지는 주민등록등본의 '등록기준지'란에 기재된 주소입니다. 현 거주지와 다를 수 있습니다.
    </div>
  </div>
</div>
<input type="text" id="regAddr" aria-required="true" placeholder="예: 서울특별시 종로구 세종대로 110" class="w-full border border-gray-300 rounded h-10 px-3">
```

**03. 동의**
- 약관이나 정보 수집에 동의하는 폼으로, 필수와 선택 항목을 분명히 가릅니다.
```html
<fieldset class="border p-4 my-4">
  <legend class="font-bold px-2 text-blue-800">서비스 이용 약관 동의</legend>
  <label><input type="checkbox" required> [필수] 개인정보 수집 이용에 동의합니다.</label>
</fieldset>
```

**04. 목록 탐색**
- 게시판 등에서 여러 항목을 나열할 때 사용하며 클릭 가능한 영역(카드 또는 행 단위)을 넓게 확보합니다.
```html
<ul class="divide-y divide-gray-200" aria-label="게시글 목록">
  <li class="py-4"><a href="/detail/1" class="block hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600">
    <h3 class="font-bold text-lg text-gray-900">2024년 가족돌봄청년 지원사업 안내</h3>
    <p class="text-sm text-gray-500 mt-1">등록일: 2024.10.25 | 부서: 복지정책과</p>
  </a></li>
</ul>
```

**05. 사용자 피드백**
- 서비스 이용이 끝난 직후 만족도 조사나 별점을 입력받습니다.
```html
<section aria-labelledby="feedback-title" class="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
  <h2 id="feedback-title" class="text-xl font-bold mb-4">서비스 이용은 만족스러우셨나요?</h2>
  <fieldset class="mb-4">
    <legend class="sr-only">만족도 선택</legend>
    <div class="flex justify-center gap-4">
      <label class="flex flex-col items-center gap-1 cursor-pointer">
        <input type="radio" name="satisfaction" value="5" class="sr-only peer">
        <span class="text-3xl peer-checked:scale-125 transition-transform">😄</span>
        <span class="text-xs">매우 만족</span>
      </label>
      <label class="flex flex-col items-center gap-1 cursor-pointer">
        <input type="radio" name="satisfaction" value="3" class="sr-only peer">
        <span class="text-3xl peer-checked:scale-125 transition-transform">😐</span>
        <span class="text-xs">보통</span>
      </label>
      <label class="flex flex-col items-center gap-1 cursor-pointer">
        <input type="radio" name="satisfaction" value="1" class="sr-only peer">
        <span class="text-3xl peer-checked:scale-125 transition-transform">😞</span>
        <span class="text-xs">불만족</span>
      </label>
    </div>
  </fieldset>
  <textarea aria-label="개선 의견" placeholder="개선이 필요한 점이 있다면 알려주세요." class="w-full max-w-md border border-gray-300 rounded p-3 text-sm resize-y mx-auto block"></textarea>
  <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">의견 제출</button>
</section>
```

**06. 상세 정보 확인**
- 목록에서 특정 항목을 눌렀을 때 진입하며, 제목(H1) 및 본문 정보와 이전 목록 가기 버튼을 제공합니다.
```html
<article class="bg-white p-6 shadow-sm">
  <h1 class="text-2xl font-bold border-b-2 border-gray-900 pb-4 mb-4">가족돌봄청년 지원사업 안내</h1>
  <div class="prose max-w-none text-gray-700">지원 대상 및 신청 절차에 대한 상세 설명입니다...</div>
  <a href="/list" class="inline-block mt-8 bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300">목록으로 돌아가기</a>
</article>
```

**07. 오류**
- 404/500 에러 발생 시 시스템 탓이 아닌 친절한 안내 문구와 메인 홈 복귀 액션을 구성합니다.
```html
<!-- 404 에러 페이지 예시 -->
<main class="text-center py-24 px-4">
  <p class="text-6xl font-bold text-gray-300 mb-4">404</p>
  <h1 class="text-2xl font-bold text-gray-900 mb-2">요청하신 페이지를 찾을 수 없습니다</h1>
  <p class="text-gray-600 mb-8">주소가 올바른지 다시 확인해주세요.<br>이전 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.</p>
  <div class="flex justify-center gap-4">
    <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">메인으로 이동</a>
    <button type="button" onclick="history.back()" class="border border-gray-400 px-6 py-3 rounded font-bold hover:bg-gray-50">이전 페이지로</button>
  </div>
</main>

<!-- 500 에러 페이지 예시 -->
<main class="text-center py-24 px-4">
  <p class="text-6xl font-bold text-red-300 mb-4">500</p>
  <h1 class="text-2xl font-bold text-gray-900 mb-2">죄송합니다. 일시적인 오류가 발생했습니다</h1>
  <p class="text-gray-600 mb-8">잠시 후 다시 시도해주세요. 문제가 계속되면 민원 콜센터(110)로 문의해주세요.</p>
  <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">메인으로 이동</a>
</main>
```

**08. 입력폼**
- 복잡한 폼은 `fieldset`으로 구역(개인정보부/신청정보부 등)을 명확히 나눕니다.
```html
<form action="/apply" method="post" novalidate>
  <fieldset class="border border-gray-200 rounded p-6 mb-6">
    <legend class="font-bold text-lg px-2">신청인 정보</legend>
    <div class="space-y-4">
      <div>
        <label for="apName" class="block font-bold mb-1">성명 <span class="text-red-500" aria-hidden="true">*</span></label>
        <input type="text" id="apName" aria-required="true" class="w-full border border-gray-300 rounded h-10 px-3">
      </div>
      <div>
        <label for="apPhone" class="block font-bold mb-1">연락처 <span class="text-red-500" aria-hidden="true">*</span></label>
        <input type="tel" id="apPhone" aria-required="true" placeholder="010-0000-0000" class="w-full border border-gray-300 rounded h-10 px-3">
      </div>
    </div>
  </fieldset>
  <fieldset class="border border-gray-200 rounded p-6 mb-6">
    <legend class="font-bold text-lg px-2">신청 내역</legend>
    <div>
      <label for="apType" class="block font-bold mb-1">신청 유형</label>
      <select id="apType" class="w-full border border-gray-300 rounded h-10 px-3">
        <option value="">선택해주세요</option>
        <option>신규 신청</option><option>갱신 신청</option>
      </select>
    </div>
  </fieldset>
  <div class="flex justify-end gap-3">
    <button type="reset" class="border border-gray-400 px-6 py-2 rounded font-bold">초기화</button>
    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded font-bold">신청서 제출</button>
  </div>
</form>
```

**09. 첨부파일**
- 신청 등에 필요한 문서(PDF, JPG 등)를 업로드 받아 시각화합니다.
```html
<div class="border border-gray-200 rounded p-4">
  <p class="font-bold mb-2">첨부파일 <span class="text-sm text-gray-500 font-normal">(PDF, JPG, PNG / 최대 10MB)</span></p>
  <div class="border-2 border-dashed border-gray-300 rounded p-8 text-center bg-gray-50">
    <label for="attachFile" class="cursor-pointer text-blue-600 underline font-bold">파일 선택</label> 또는 드래그 앤 드롭
    <input type="file" id="attachFile" class="sr-only" multiple accept=".pdf,.jpg,.jpeg,.png">
  </div>
  <ul class="mt-3 space-y-2" aria-label="첨부된 파일 목록">
    <li class="flex justify-between items-center bg-gray-50 p-3 rounded">
      <div class="flex items-center gap-2">
        <svg aria-hidden="true" class="w-5 h-5 text-gray-400"><!-- 파일 아이콘 --></svg>
        <span>신분증사본.jpg <span class="text-gray-400 text-xs">(1.2MB)</span></span>
      </div>
      <button type="button" aria-label="신분증사본.jpg 삭제" class="text-red-500 hover:text-red-700 font-bold">✕</button>
    </li>
  </ul>
</div>
```

**10. 필터링·정렬**
- 리스트 위에 조회 조건(기간, 분야 등)과 순서(최신/조회수) 필터 툴바를 제공합니다.
```html
<div class="filter-toolbar flex justify-between bg-gray-100 p-3 rounded mb-4">
  <select aria-label="게시글 정렬 기준" class="border-gray-300 rounded"><option>최신 등록순</option></select>
  <button type="button" aria-expanded="false" class="text-blue-600 font-bold flex items-center">
    상세 필터 <svg class="w-4 h-4 ml-1"><!-- 내려가는 화살표 --></svg>
  </button>
</div>
```

**11. 확인**
- 중요한 제출 전 사용자가 입력한 데이터를 다시 표(Read-only) 형태로 보여주고 1차 검증을 마칩니다.
```html
<section aria-labelledby="confirm-title" class="bg-blue-50 p-6 rounded mb-6">
  <h2 id="confirm-title" class="font-bold text-lg mb-4">입력하신 정보가 맞는지 최종 확인해주세요.</h2>
  <dl class="grid grid-cols-2 gap-y-2 text-sm text-gray-700 border-t border-blue-200 pt-4">
    <dt>이메일 수신 여부</dt><dd class="font-bold text-gray-900">동의</dd>
    <dt>환급 계좌 번호</dt><dd class="font-bold text-gray-900">신한은행 110-***-***</dd>
  </dl>
</section>
```

---

## Ⅴ. 주요 서비스 패턴 (Service Patterns) 

### 1. 정책 정보 확인
**00. 개요**
- 국민을 위한 정부 정책의 세부 사항을 제공하는 템플릿입니다.

**01. 정책 탐색**
- 정책 트리 카테고리(교육, 주거, 복지 등)를 제공합니다.
```html
<section aria-labelledby="policy-category-title">
  <h2 id="policy-category-title" class="text-xl font-bold mb-4">분야별 정책 탐색</h2>
  <ul class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <li>
      <a href="/policy/welfare" class="block p-6 border border-gray-200 rounded-lg text-center hover:border-blue-600 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-600">
        <svg aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-blue-600"><!-- 복지 아이콘 --></svg>
        <span class="font-bold text-gray-900">복지</span>
      </a>
    </li>
    <li>
      <a href="/policy/housing" class="block p-6 border border-gray-200 rounded-lg text-center hover:border-blue-600 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-600">
        <svg aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-blue-600"><!-- 주거 아이콘 --></svg>
        <span class="font-bold text-gray-900">주거</span>
      </a>
    </li>
    <li>
      <a href="/policy/education" class="block p-6 border border-gray-200 rounded-lg text-center hover:border-blue-600 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-600">
        <svg aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-blue-600"><!-- 교육 아이콘 --></svg>
        <span class="font-bold text-gray-900">교육</span>
      </a>
    </li>
    <li>
      <a href="/policy/employment" class="block p-6 border border-gray-200 rounded-lg text-center hover:border-blue-600 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-600">
        <svg aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-blue-600"><!-- 고용 아이콘 --></svg>
        <span class="font-bold text-gray-900">고용·창업</span>
      </a>
    </li>
  </ul>
</section>
```

**02. 정보 확인**
- 정책의 대상, 지원 내용, 절차를 표와 인포그래픽으로 명확하게 쪼개서 보여줍니다.
```html
<table class="w-full text-left border-collapse border-t-2 border-gray-900 mb-6">
  <caption class="text-lg font-bold mb-3 text-left">지원 자격 및 내용 요약</caption>
  <tbody class="border-b">
    <tr class="border-b"><th scope="row" class="bg-gray-100 p-3 w-1/3">지원 연령</th><td class="p-3">만 19세 ~ 34세 이하 청년</td></tr>
    <tr class="border-b"><th scope="row" class="bg-gray-100 p-3">지원 한도</th><td class="p-3 text-blue-600 font-bold">월 최대 20만원</td></tr>
  </tbody>
</table>
```

**03. 정책 자료 탐색**
- 본문 중간 또는 끝에 보도자료, 안내서 파일 등의 링크 앵커를 배치합니다.
```html
<section aria-labelledby="policy-docs-title" class="bg-gray-50 p-6 rounded-lg mt-6">
  <h3 id="policy-docs-title" class="font-bold text-lg mb-3">📎 관련 자료 다운로드</h3>
  <ul class="space-y-2">
    <li class="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-blue-500">
      <div class="flex items-center gap-2">
        <svg aria-hidden="true" class="w-5 h-5 text-red-500"><!-- PDF 아이콘 --></svg>
        <a href="/docs/policy-guide.pdf" class="text-blue-600 underline hover:text-blue-800">2024년 청년 주거 지원 안내서</a>
        <span class="text-xs text-gray-400">(PDF, 2.4MB)</span>
      </div>
      <a href="/docs/policy-guide.pdf" download aria-label="2024년 청년 주거 지원 안내서 다운로드" class="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50">다운로드</a>
    </li>
    <li class="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-blue-500">
      <div class="flex items-center gap-2">
        <svg aria-hidden="true" class="w-5 h-5 text-red-500"><!-- PDF 아이콘 --></svg>
        <a href="/docs/press-release.pdf" class="text-blue-600 underline hover:text-blue-800">관련 보도자료</a>
        <span class="text-xs text-gray-400">(PDF, 856KB)</span>
      </div>
      <a href="/docs/press-release.pdf" download aria-label="관련 보도자료 다운로드" class="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50">다운로드</a>
    </li>
  </ul>
</section>
```


### 2. 신청 (Application)
**00. 개요**
- 민원 또는 맞춤형 혜택을 청구/신청하는 종합 플로우입니다.

**01. 신청 대상 탐색**
- 검색 필터를 통해 자기가 신청할 수 있는 항목을 조회합니다.
```html
<div class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
  <h2 class="text-xl font-bold mb-4">어떤 지원을 찾고 계신가요?</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <div>
      <label for="filterAge" class="block text-sm font-bold mb-1">연령대</label>
      <select id="filterAge" class="w-full border border-gray-300 rounded h-10 px-3">
        <option value="">전체</option><option>청년 (19~34세)</option><option>중장년 (35~64세)</option><option>노년 (65세 이상)</option>
      </select>
    </div>
    <div>
      <label for="filterArea" class="block text-sm font-bold mb-1">지역</label>
      <select id="filterArea" class="w-full border border-gray-300 rounded h-10 px-3">
        <option value="">전체</option><option>서울</option><option>경기</option><option>부산</option>
      </select>
    </div>
    <div>
      <label for="filterField" class="block text-sm font-bold mb-1">분야</label>
      <select id="filterField" class="w-full border border-gray-300 rounded h-10 px-3">
        <option value="">전체</option><option>주거</option><option>교육</option><option>취업·창업</option>
      </select>
    </div>
  </div>
  <button type="button" class="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">조건 검색</button>
</div>
```

**02. 서비스 정보 확인**
- 신청 소요 시간, 필요 서류 요약(Summary Box)을 최상단에 놓습니다.
```html
<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
  <h2 class="text-lg font-bold text-blue-800 mb-3">📋 신청 전 확인 사항</h2>
  <dl class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
    <div class="bg-white p-4 rounded border border-blue-100">
      <dt class="text-gray-500 mb-1">예상 소요 시간</dt>
      <dd class="font-bold text-lg text-gray-900">약 10분</dd>
    </div>
    <div class="bg-white p-4 rounded border border-blue-100">
      <dt class="text-gray-500 mb-1">필요 서류</dt>
      <dd class="font-bold text-gray-900">신분증, 소득증명원</dd>
    </div>
    <div class="bg-white p-4 rounded border border-blue-100">
      <dt class="text-gray-500 mb-1">처리 기간</dt>
      <dd class="font-bold text-gray-900">접수 후 14일 이내</dd>
    </div>
  </dl>
</div>
```

**03. 유의 사항·자격 확인**
- 모의 계산기나 예/아니오 체크박스 흐름으로 자격 여부를 묻는 Self-check 구간.
```html
<section aria-labelledby="selfcheck-title" class="border border-gray-200 rounded-lg p-6 mb-6">
  <h2 id="selfcheck-title" class="text-lg font-bold mb-4">✅ 신청 자격 자가진단</h2>
  <fieldset class="space-y-3">
    <legend class="sr-only">자격 확인 체크리스트</legend>
    <label class="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-blue-50">
      <input type="checkbox" class="w-5 h-5 accent-blue-600">
      <span>만 19세 이상 ~ 34세 이하의 청년입니다.</span>
    </label>
    <label class="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-blue-50">
      <input type="checkbox" class="w-5 h-5 accent-blue-600">
      <span>기준 중위소득 150% 이하 가구입니다.</span>
    </label>
    <label class="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-blue-50">
      <input type="checkbox" class="w-5 h-5 accent-blue-600">
      <span>현재 무주택자이며 월세 거주 중입니다.</span>
    </label>
  </fieldset>
  <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 font-bold" role="status">
    ✅ 모든 조건을 충족합니다. 신청을 진행해주세요.
  </div>
</section>
```

**04. 신청서 작성**
- Ⅳ장의 `08. 입력폼` 요소의 총합 화면입니다.
```html
<!-- Ⅳ-08 입력폼의 실제 적용 구조 (단계 표시기 + 폼) -->
<ol class="flex justify-between w-full text-center mb-8" aria-label="신청 단계">
  <li class="text-gray-400">1. 자격확인</li>
  <li class="font-bold text-blue-600" aria-current="step">2. 정보입력</li>
  <li class="text-gray-400">3. 서류첨부</li>
  <li class="text-gray-400">4. 최종확인</li>
</ol>
<form action="/apply" method="post" novalidate>
  <!-- 개인정보/신청정보 fieldset은 Ⅳ-08 입력폼 패턴 참조 -->
  <div class="flex justify-between mt-8">
    <button type="button" class="border border-gray-400 px-6 py-3 rounded font-bold hover:bg-gray-50">이전 단계</button>
    <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">다음 단계로</button>
  </div>
</form>
```

**05. 확인·확정**
- 최종 신청 정보를 요약한 리뷰 화면을 거칩니다.
```html
<section aria-labelledby="review-title" class="bg-gray-50 p-6 rounded-lg mb-6">
  <h2 id="review-title" class="text-lg font-bold mb-4">📝 입력하신 정보를 최종 확인해주세요</h2>
  <dl class="divide-y divide-gray-200">
    <div class="grid grid-cols-3 py-3"><dt class="text-gray-500">성명</dt><dd class="col-span-2 font-bold">홍길동</dd></div>
    <div class="grid grid-cols-3 py-3"><dt class="text-gray-500">연락처</dt><dd class="col-span-2 font-bold">010-1234-5678</dd></div>
    <div class="grid grid-cols-3 py-3"><dt class="text-gray-500">신청 유형</dt><dd class="col-span-2 font-bold">신규 신청</dd></div>
    <div class="grid grid-cols-3 py-3"><dt class="text-gray-500">첨부 서류</dt><dd class="col-span-2 font-bold">신분증사본.jpg, 소득증명원.pdf</dd></div>
  </dl>
  <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
    <button type="button" class="border border-gray-400 px-6 py-3 rounded font-bold hover:bg-gray-50">수정하기</button>
    <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">최종 제출하기</button>
  </div>
</section>
```

**06. 완료**
- 시스템 접수가 처리되었음을 알리는 명확한 성공 문구와 접수 번호를 출력합니다.
```html
<main class="text-center py-16 px-4">
  <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
    <svg aria-hidden="true" class="w-10 h-10 text-green-600"><!-- 체크 아이콘 --></svg>
  </div>
  <h1 class="text-3xl font-bold text-gray-900 mb-2">신청이 정상적으로 접수되었습니다</h1>
  <p class="text-lg text-gray-600 mb-2">접수번호: <strong class="text-blue-600">REQ-2024-00345</strong></p>
  <p class="text-sm text-gray-500 mb-8">처리 결과는 등록하신 연락처로 안내드립니다.</p>
  <div class="flex justify-center gap-4">
    <a href="/" class="border border-gray-400 px-6 py-3 rounded font-bold hover:bg-gray-50">메인으로</a>
    <a href="/mypage" class="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">신청 현황 조회</a>
  </div>
</main>
```

**07. 신청 결과 확인**
- 마이페이지 등에서 접수 상태 표기 및 사후 관리를 유도합니다.
```html
<!-- 결과 페이지 예시 -->
<div class="text-center py-16">
  <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
    <svg aria-hidden="true" class="w-10 h-10 text-green-600"><!-- 확인 아이콘 --></svg>
  </div>
  <h2 class="text-3xl font-bold text-gray-900 mb-2">신청서 제출이 완료되었습니다</h2>
  <p class="text-lg text-gray-600 mb-8">접수번호: <strong class="text-blue-600">REQ-2024-0012</strong></p>
  <div class="flex justify-center gap-4">
    <a href="/" class="btn-secondary px-6 py-3 border rounded border-gray-400 font-bold hover:bg-gray-50">메인으로 가기</a>
    <a href="/mypage" class="btn-primary px-6 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">신청 현황 조회</a>
  </div>
</div>
```


### 3. 로그인 (Login)
**00. 개요**
- 디지털 정부 서비스 통합 로그인 가이드 체계입니다.

**01. 로그인 기능 찾기**
- 누리집 우상단의 자물쇠 모양 또는 "로그인" 텍스트 버튼으로 접근을 유도합니다.
```html
<!-- GNB 우측 유틸리티 영역 -->
<div class="flex items-center gap-4">
  <a href="/login" class="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2 py-1">
    <svg aria-hidden="true" class="w-5 h-5"><!-- 자물쇠 아이콘 --></svg>
    <span>로그인</span>
  </a>
  <a href="/register" class="text-sm text-gray-700 hover:text-blue-600">회원가입</a>
</div>
```

**02. 로그인 안내**
- 회원가입 없이도 인증서만으로 로그인할 수 있음을 사전 고지합니다.
```html
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
  <p class="text-sm text-blue-800">
    <svg aria-hidden="true" class="inline w-5 h-5 mr-1 text-blue-600"><!-- 정보 아이콘 --></svg>
    별도 회원가입 없이 <strong>간편인증</strong> 또는 <strong>공동인증서</strong>만으로 로그인할 수 있습니다.
  </p>
</div>
```

**03. 로그인 방식 확인·선택**
- 정부24 간편인증, 금융인증서 등 복수 로그인 타일 배열 제공 방식.
```html
<h2 class="text-xl font-bold text-center mb-6">로그인 방식을 선택하세요</h2>
<ul class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  <li><button type="button" class="w-full border rounded-lg p-6 hover:shadow-lg focus:border-blue-600 focus:bg-blue-50 transition-all flex flex-col items-center">
    <img src="/icons/pass.svg" alt="" class="mb-3 h-12"> <span class="font-bold">간편인증</span>
  </button></li>
  <li><button type="button" class="w-full border rounded-lg p-6 hover:shadow-lg focus:border-blue-600 flex flex-col items-center">
    <img src="/icons/cert.svg" alt="" class="mb-3 h-12"> <span class="font-bold">금융인증서</span>
  </button></li>
</ul>
```

**04. 로그인 정보 입력**
- 인증수단 팝업 또는 폼에 아이디와 패스워드를 입력받습니다.
```html
<form action="/auth/login" method="post" class="max-w-md mx-auto">
  <div class="space-y-4">
    <div>
      <label for="loginId" class="block font-bold mb-1">아이디</label>
      <input type="text" id="loginId" autocomplete="username" class="w-full border border-gray-300 rounded h-12 px-3" placeholder="아이디 입력">
    </div>
    <div>
      <label for="loginPw" class="block font-bold mb-1">비밀번호</label>
      <input type="password" id="loginPw" autocomplete="current-password" class="w-full border border-gray-300 rounded h-12 px-3" placeholder="비밀번호 입력">
    </div>
  </div>
  <button type="submit" class="w-full bg-blue-600 text-white h-12 rounded font-bold mt-6 hover:bg-blue-700">로그인</button>
  <div class="flex justify-center gap-4 mt-4 text-sm text-gray-500">
    <a href="/find-id" class="hover:text-blue-600">아이디 찾기</a>
    <span aria-hidden="true">|</span>
    <a href="/find-pw" class="hover:text-blue-600">비밀번호 찾기</a>
    <span aria-hidden="true">|</span>
    <a href="/register" class="hover:text-blue-600">회원가입</a>
  </div>
</form>
```

**05. 로그인 완료**
- 로그인 직후 원래 보던 페이지(Referrer)로 부드럽게 복귀합니다.
```html
<!-- 로그인 성공 토스트 -->
<div role="status" aria-live="polite" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
  <svg aria-hidden="true" class="w-5 h-5 text-green-400"><!-- 체크 아이콘 --></svg>
  <span>홍길동님, 환영합니다. 로그인되었습니다.</span>
</div>
```

**06. 서비스 이용**
- 토큰/세션이 유지되는 동안 개인화된 정보를 제공합니다.
```html
<!-- 로그인 상태의 GNB 유틸리티 영역 -->
<div class="flex items-center gap-4">
  <span class="text-sm text-gray-700 font-bold">홍길동님</span>
  <a href="/mypage" class="text-sm text-blue-600 hover:underline">마이페이지</a>
  <button type="button" class="text-sm text-gray-500 hover:text-gray-900">로그아웃</button>
</div>
```

**07. 로그아웃**
- 우상단 활성 계정 버튼 클릭 시 로그아웃을 수행하며 완료 알림을 띄웁니다.
```html
<!-- 로그아웃 확인 모달 -->
<div class="fixed inset-0 bg-black/50 z-40" aria-hidden="true"></div>
<div role="dialog" aria-modal="true" aria-labelledby="logout-title" class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl text-center" tabindex="-1">
    <h2 id="logout-title" class="text-lg font-bold mb-3">로그아웃 하시겠습니까?</h2>
    <p class="text-sm text-gray-600 mb-6">로그아웃 하면 진행 중인 작업이 저장되지 않을 수 있습니다.</p>
    <div class="flex justify-center gap-3">
      <button type="button" class="border border-gray-400 px-6 py-2 rounded font-bold hover:bg-gray-50">취소</button>
      <button type="button" class="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">로그아웃</button>
    </div>
  </div>
</div>
```


### 4. 검색 (Search)
**00. 개요**
- 사이트 통합 검색 경험 가이드입니다.

**01. 검색 기능 찾기**
- 글로벌 내비게이션 바(GNB) 중앙 우측 등 일관된 위치에 돋보기 아이콘을 배치합니다.
```html
<!-- GNB 내 검색 아이콘 버튼 -->
<button type="button" aria-label="통합 검색 열기" class="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600">
  <svg aria-hidden="true" class="w-6 h-6 text-gray-700"><!-- 돋보기 아이콘 --></svg>
</button>
```

**02. 검색어 입력**
- 통합 검색 탭. 키보드 타이핑 시 추천 검색어 자동완성 레이어를 띄움.
```html
<form role="search" class="relative max-w-2xl mx-auto mt-4">
  <label for="globalSearch" class="sr-only">통합 검색</label>
  <div class="flex border-4 border-blue-600 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-offset-2">
    <input type="search" id="globalSearch" placeholder="무엇을 찾으시나요?" class="w-full p-4 text-lg border-0 focus:ring-0">
    <button type="submit" aria-label="검색하기" class="bg-white px-6 border-l flex items-center justify-center">
      <svg aria-hidden="true" class="w-6 h-6 text-blue-600"><!-- 돋보기 --></svg>
    </button>
  </div>
</form>
```

**03. 검색 결과 확인**
- `"[키워드]"에 대한 총 OOO건의 검색결과` 헤더 밑에 하이라이트 문구 처리된 리스트 제공.
```html
<div class="border-b border-gray-200 pb-4 mb-6">
  <h2 class="text-2xl font-bold">
    <strong class="text-blue-600">"<span id="searchKeyword">청년 주거</span>"</strong>에 대한 총 <strong class="text-blue-600">24</strong>건의 검색결과
  </h2>
  <div role="tablist" class="flex gap-4 mt-4 text-sm">
    <button role="tab" aria-selected="true" class="font-bold text-blue-600 border-b-2 border-blue-600 pb-2">전체 (24)</button>
    <button role="tab" aria-selected="false" tabindex="-1" class="text-gray-500 pb-2">정책 (12)</button>
    <button role="tab" aria-selected="false" tabindex="-1" class="text-gray-500 pb-2">서식·서류 (8)</button>
    <button role="tab" aria-selected="false" tabindex="-1" class="text-gray-500 pb-2">공지사항 (4)</button>
  </div>
</div>
```

**04. 상세 검색**
- 검색 결과 상단에 기간, 문서 타입 등의 상세 필터링 조건을 제공힙니다.
```html
<details class="border border-gray-200 rounded p-4 mb-4">
  <summary class="font-bold text-blue-600 cursor-pointer flex items-center gap-1">
    <svg aria-hidden="true" class="w-4 h-4"><!-- 필터 아이콘 --></svg> 상세 검색 조건
  </summary>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <div>
      <label for="searchPeriod" class="block text-sm font-bold mb-1">기간</label>
      <select id="searchPeriod" class="w-full border border-gray-300 rounded h-10 px-3">
        <option>전체</option><option>최근 1개월</option><option>최근 3개월</option><option>최근 1년</option>
      </select>
    </div>
    <div>
      <label for="searchDocType" class="block text-sm font-bold mb-1">문서 유형</label>
      <select id="searchDocType" class="w-full border border-gray-300 rounded h-10 px-3">
        <option>전체</option><option>정책·제도</option><option>공지사항</option><option>보도자료</option>
      </select>
    </div>
    <div class="flex items-end">
      <button type="button" class="bg-blue-600 text-white px-6 h-10 rounded font-bold hover:bg-blue-700">적용</button>
    </div>
  </div>
</details>
```

**05. 검색 결과 이용**
- 본문 키워드가 포함된 결과를 클릭하여 해당 서비스/문서로 이동합니다.
```html
<h2 class="text-2xl font-bold mb-6">
  <strong class="text-blue-600">"청년 지원"</strong> 검색결과 총 <strong class="text-blue-600">12</strong>건
</h2>
<ul class="space-y-4">
  <li class="p-4 border border-gray-200 rounded hover:border-blue-500">
    <h3 class="font-bold text-xl"><a href="/doc/1" class="text-blue-800 hover:underline">정부 24 <mark class="bg-yellow-200">청년 지원</mark> 센터 안내</a></h3>
    <p class="text-gray-600 mt-2">... 정부24 공식 누리집에서 제공하는 <mark class="bg-yellow-200 text-black">청년 지원</mark> 정책 신청 방법입니다 ...</p>
  </li>
</ul>
```

**06. 재검색**
- 오타 시 `결과가 없습니다. [올바른 추천 단어]로 검색하시겠습니까?` 플로우 보장.
```html
<div class="text-center py-16 px-4">
  <svg aria-hidden="true" class="w-16 h-16 mx-auto text-gray-300 mb-4"><!-- 검색 없음 아이콘 --></svg>
  <h2 class="text-xl font-bold text-gray-900 mb-2">
    <strong class="text-blue-600">"<span>청년 주걜</span>"</strong>에 대한 검색 결과가 없습니다.
  </h2>
  <p class="text-gray-600 mb-6">혹시 <a href="/search?q=청년+주거" class="text-blue-600 font-bold underline">"청년 주거"</a>를(를) 찾으셨나요?</p>
  <div class="text-sm text-gray-500">
    <p class="font-bold mb-2">검색 팁:</p>
    <ul class="list-disc list-inside space-y-1">
      <li>단어의 철자가 정확한지 확인해주세요.</li>
      <li>두 단어 이상의 검색어는 띄어쓰기로 구분해주세요.</li>
      <li>더 일반적인 단어로 다시 검색해보세요.</li>
    </ul>
  </div>
</div>
```

**07. 검색 종료**
- 다른 메뉴 클릭 등으로 탐색 흐름을 종료하고 빠져나갑니다.
```html
<!-- 검색 오버레이 닫기 버튼 -->
<div class="flex justify-end p-4 border-b border-gray-200">
  <button type="button" aria-label="검색창 닫기" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded p-1">
    <svg aria-hidden="true" class="w-6 h-6"><!-- X 닫기 아이콘 --></svg>
  </button>
</div>
```


### 5. 방문 (Visit)
**00. 개요**
- 오프라인 기관 청사를 찾아오는 경험 영역입니다.

**01. 방문**
- 기관 주소 안내 시 연동된 반응형 지도, 길찾기 아이콘, 대중교통 이용에 대한 시각 테이블 및 링크 연결 등 접근을 위한 세부 요소를 포함합니다.
```html
<section aria-labelledby="visit-title" class="bg-white p-6 rounded-lg border border-gray-200">
  <h2 id="visit-title" class="text-xl font-bold mb-4">찾아오시는 길</h2>
  <!-- 지도 영역 -->
  <div class="w-full h-64 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-500">
    <p>[지도 API 렌더링 영역 – 카카오맵 / 네이버 지도 iframe]</p>
  </div>
  <!-- 주소 및 교통 정보 -->
  <address class="not-italic text-gray-700 mb-4">
    <p class="font-bold">세종특별자치시 도욀6로 42 (어진동) 정부세종청사</p>
    <p class="text-sm text-gray-500 mt-1">☎ 민원 콜센터: 국번없이 110</p>
  </address>
  <table class="w-full text-sm border-t border-gray-300">
    <caption class="sr-only">대중교통 안내</caption>
    <tbody>
      <tr class="border-b"><th scope="row" class="py-2 pr-4 text-left font-bold">버스</th><td class="py-2">601번, 602번 (정부청사 앞 하차)</td></tr>
      <tr class="border-b"><th scope="row" class="py-2 pr-4 text-left font-bold">지하철</th><td class="py-2">3호선 정부청사역 1번 출구</td></tr>
    </tbody>
  </table>
  <div class="mt-4 flex gap-3">
    <a href="https://map.kakao.com" target="_blank" title="카카오맵으로 길찾기 (새 창)" class="text-blue-600 underline text-sm">길찾기</a>
    <a href="https://map.naver.com" target="_blank" title="네이버지도로 길찾기 (새 창)" class="text-blue-600 underline text-sm">네이버지도</a>
  </div>
</section>
```


### 6. 용어집 (Glossary)
- 행정 용어 및 지침에서 사용된 용어의 뜻 표기.
```html
<section aria-labelledby="glossary-title">
  <h2 id="glossary-title" class="text-xl font-bold mb-4">용어 해설</h2>
  <dl class="divide-y divide-gray-200">
    <div class="py-3">
      <dt class="font-bold text-gray-900">누리집</dt>
      <dd class="text-gray-600 mt-1">웹사이트를 뜻하는 순한국어입니다. 본 가이드라인에서는 '홈페이지' 대신 '누리집'으로 통일합니다.</dd>
    </div>
    <div class="py-3">
      <dt class="font-bold text-gray-900">GNB (Global Navigation Bar)</dt>
      <dd class="text-gray-600 mt-1">본 누리집의 모든 페이지에서 공통으로 노출되는 최상위 탐색 메뉴 영역입니다.</dd>
    </div>
    <div class="py-3">
      <dt class="font-bold text-gray-900">LNB (Local Navigation Bar)</dt>
      <dd class="text-gray-600 mt-1">특정 섹션의 하위 메뉴를 대으로 좌측 등에 배치되는 로컬 탐색 메뉴입니다.</dd>
    </div>
    <div class="py-3">
      <dt class="font-bold text-gray-900">WCAG (Web Content Accessibility Guidelines)</dt>
      <dd class="text-gray-600 mt-1">웹 콘텐츠 접근성 지침. 본 가이드에서는 2.1 AA 등급을 준수합니다.</dd>
    </div>
    <div class="py-3">
      <dt class="font-bold text-gray-900">ARIA (Accessible Rich Internet Applications)</dt>
      <dd class="text-gray-600 mt-1">동적 콘텐츠의 접근성을 보강하기 위한 HTML 요소에 추가할 수 있는 역할(role), 상태(state), 속성(property) 세트입니다.</dd>
    </div>
  </dl>
</section>
```

---

> **AI 최종 렌더링 선서 사항:**
> 위 문서는 웹/앱 컴포넌트 프론트엔드를 짜게 되든 상기 세분화된 모든 항목에 매핑되는 디자인 가이드라인 헌법입니다. 목차의 누락 없이, 접근성 마크업에 **절대 복종하여 렌더링**하십시오.

---

## Ⅵ. [부록] 상세 설계 수치 및 CSS/Tailwind 토큰 (Design Tokens)

위의 스타일 및 패턴을 실제 코드로 렌더링하기 위해, 가이드라인(1000페이지 분량)에서 발췌한 절대적인 물리 값(px/rem) 기준표입니다. 디자인 시 아래의 수치를 최우선 CSS 매핑 기준으로 삼아야 합니다.

### 1. 타이포그래피 (Typography Scale)
모든 폰트는 `Pretendard GOV` 또는 돋움/고딕 계열 기준이며, `1rem = 16px`(시스템 기본 크기)을 기준으로 합니다.
아래는 가이드라인 원문(80-81p)에 명시된 Type scale, Font weight, Line height, Letter spacing의 무결성 표입니다. 단 하나도 빠짐없이 코딩 시 이 기준을 준용해야 합니다.

| 그룹 (Style) | 스케일 (Scale) | PC 크기 (px) | Mobile 크기 (px) | 굵기 (Weight) | 줄간격 (Line Height) | 자간 (Letter spacing) | 용도 (Usage) |
|---|---|---|---|---|---|---|---|
| **Display** | Large | 66 | 40 | 700 | 150% | 1px | 화면에서 가장 큰 마케팅 용도 텍스트 |
| | Medium | 50 | 32 | 700 | 150% | 1px | |
| | Small | 40 | 25 | 700 | 150% | 1px | |
| **Heading** | Large | 50 | 40 | 700 | 150% | 1px | 페이지 단위 메인 타이틀 |
| | Medium | 40 | 32 | 700 | 150% | 1px | |
| | Small | 32 | 25 | 700 | 150% | 1px | |
| **Title** | XXlarge | 32 | 25 | 700 | 150% | 1px | 템플릿, 모듈 단위의 역할 강조 타이틀 |
| | Xlarge | 25 | 25 | 700 | 150% | 0 | |
| | Large | 21 | 21 | 700 | 150% | 0 | |
| | Medium | 19 | 19 | 700 | 150% | 0 | |
| | Small | 17 | 17 | 700 | 150% | 0 | |
| | Xsmall | 15 | 15 | 700 | 150% | 0 | |
| **Body** | Large | 19 | 19 | 400, 700 | 150% | 0 | 본문 텍스트 (강조 시 700 혼용) |
| | Medium (*기본) | 17 | 17 | 400, 700 | 150% | 0 | 시스템 기본 본문 텍스트 |
| | Small | 15 | 15 | 400, 700 | 150% | 0 | |
| **Detail** | Large | 17 | 17 | 400, 700 | 150% | 0 | 부가 정보 및 작은 항목 텍스트 |
| | Medium | 15 | 15 | 400, 700 | 150% | 0 | |
| | Small | 13 | 13 | 400, 700 | 150% | 0 | |
| **Label** | Large | 19 | 19 | 400, 700 | 150% | 0 | Button, Label, Chips 등 컴포넌트 내부 폰트 |
| | Medium | 17 | 17 | 400, 700 | 150% | 0 | |
| | Small | 17 | 17 | 400, 700 | 150% | 0 | |
| | Xsmall | 15 | 15 | 400, 700 | 150% | 0 | |
| **Link** | Large | 19 | 19 | 400, 700 | 150% | 0 | 브레드크럼 등 독립적인 링크 텍스트 |
| | Medium | 17 | 17 | 400, 700 | 150% | 0 | |
| | Small | 15 | 15 | 400, 700 | 150% | 0 |

#### 1.1 계층 조합 가이드 (Hierarchy)
단일 텍스트를 넘어, Heading, Body, Detail 등을 묶어 화면을 구성할 때 아래의 기본 텍스트 계층 비율을 지켜야 정보 위계가 뚜렷해집니다.

1. **기본 계층 (Basic Hierarchy)**: 일반적인 본문과 제목의 조합
   - 페이지 타이틀(H1): `Heading Large` (PC 50px) / `Heading Medium`
   - 기본 본문(p): `Body Medium` (PC 17px)
   - 캡션/부가설명(span): `Detail Medium` (PC 15px)
2. **목록이 있는 계층 (List Hierarchy)**: 블로그, 자료실 등 아이템 나열 시
   - 게시글 제목: `Title Medium` (PC 19px) / `Title Small`
   - 게시글 본문 요약: `Body Medium` (PC 17px)
   - 등록일/작성자: `Detail Small` (PC 13px)
3. **마케팅용 콘텐츠 (Display Hierarchy)**: 배너나 키 비주얼 영역
   - 배너 큰 제목: `Display Large` (PC 66px) / `Display Medium`
   - 서브 카피: `Heading Small` (PC 32px) / `Body Large` (PC 19px)

### 2. 반응형 레이아웃 및 여백 (Responsive layout grid)
화면 요소들의 시각적 배열을 다양한 디바이스에서도 일관성을 잃지 않도록 유지하는 그리드 시스템입니다.

**1) Breakpoint 및 Column**
가이드라인 원문(94p)에 지정된 기준에 따라 디바이스별 화면 분기점과 다단(Column)을 나눕니다.

| 디바이스 (Device) | 브레이크포인트 (Breakpoint) | 대표화면 사이즈 | 가용 Column 수 | **최적화 기본 Column** |
|---|---|---|---|---|
| **PC/Desktop** | `1025px ~ 1920px` | 1920 (1440) | 12 또는 16 | **12** |
| **Tablet** | `601px ~ 1024px` | 768 | 8 또는 12 | **8** |
| **Mobile** | `360px ~ 600px` | 390 | 4 또는 6 | **4** |

**2) Screen Margin 및 Gutter**
- 화면별 최소 좌우 여백(Screen margin)은 **모바일 최소 16px**, **PC(Desktop/Tablet) 최소 24px**을 보장해야 합니다.
- 다단 내부의 간격(Gutter)도 마진 기준에 비례하여 통일감 있게 최소 16px~24px 이상 유지합니다.

**3) Contents area (최대 너비 제한)**
- 디바이스 해상도가 계속 커지더라도 중앙 집중도를 유지하기 위해, 데스크탑 기준 최대 콘텐츠 영역(Max-width)은 **1280px**로 고정합니다. (`max-w-[1280px] mx-auto`)

**4) Spacing (여백 시스템)**
기본적으로 **8-Point Grid(8px 배수)** 시스템을 원칙으로 하며, 세밀한 컴포넌트 내부 간섭 등에 한해 4px 배수를 허용합니다.

*가) 레이아웃 메인 간격 (Layout Spacing)*
| 구조 (Area) | Desktop (1440 기준) | Mobile (390 기준) |
|---|---|---|
| GNB - Body (상단 헤더와 본문 사이) | 80px | 64px |
| LNB - Body (사이드바와 본문 사이) | 80px | - |
| Body Heading - Contents | 80px | 64px |
| Contents - Contents (정보 덩어리 사이)| 64px | 40px |
| Body - Footer (본문 끝과 푸터 사이) | 80px | 64px |

*나) 콘텐츠 영역 간격 (Content Area Spacing)*
| 구조 (Area) | Desktop | Mobile |
|---|---|---|
| Heading (H1) - Contents | 80px | 64px |
| Title (H2) - Contents | 40px | 32px |
| Title (H3) - Contents | 32px | 32px |
| Text - Text (단락과 단락 사이) | 24px | 24px |

### 3. 컴포넌트 형태 및 접근성 높이 (Component Specs)
WCAG 2.1 AA 및 모바일 터치 친화성을 위해 폼 컨트롤/액션 영역은 다음 물리적 크기를 보장해야 합니다.

- **터치 타겟 (Touch Target):** 최소 `44px` × `44px` 규격 렌더링 (`min-h-[44px] min-w-[44px]`)
- **버튼 및 폼 요소 둥글기 (Border Radius):** 기본 `8px` (`rounded-lg`)로 날카롭지 않게 처리
- **포커스 링 (Focus Ring):** 키보드 Tab 이동 시 `2px solid #000` 아웃라인 필수 제공 (`focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`)

### 4. 고도 및 겹침 제어 (Z-index scale)
모바일/웹 화면에서 컴포넌트가 화면에 떠 있는 계층(Depth)을 일관성 있게 통제합니다.

- `z-10`: 스티키 내비게이션, 플로팅 버튼 (`sticky`, `FAB`)
- `z-30`: 드롭다운 메뉴, 툴팁, 커스텀 콤보박스 (`absolute dropdowns`)
- `z-40`: 모달 및 사이드바가 열렸을 때의 배경 딤(Dim) 레이어 (`fixed inset-0 bg-black/60`)
- `z-50`: 모달 다이얼로그 본체, 전면으로 활성화된 오프캔버스 사이드바 (`fixed dialog`)
- `z-999`: 토스트 알림, 글로벌 긴급 공지 배너 (`Toast`, `Alert`)

### 5. 아이콘 규격 (System Icon Specs)
아이콘은 명확한 스케일과 선 두께(Stroke weight)를 가집니다. SVG 포맷 사용을 권장하며, 홀수나 소수점 사이즈는 절대 금지(`4px` 또는 `8px` 배수 원칙)합니다.

| 분류 | 픽셀(px) 규격 | 선 두께 (Stroke Weight) | 용도 및 권장 상황 |
|---|---|---|---|
| **Small** | `16px`, `20px` | `1px` (16px 기준), `1.4px` (20px 기준) | 텍스트 리스트 내부 삽입, 부가 정보 표기 시 같이 사용 |
| **Medium** | `24px` (*표준 사이즈*) | `1.6px` | 시스템 아이콘의 표준 베이스. 일반적인 버튼 및 메뉴 |
| **Large** | `32px`, `48px` | `1.6px` (32px 기준), `2px` (48px 기준) | 개념 강조, 키 비주얼 요소 등 공간이 충분히 넓을 때 |

- **코너 라운딩 (Corner Radius):** 내부 곡률은 톤앤매너 일관성을 위해 가급적 `0px, 1px, 2px` 세 가지만 허용합니다. (아이콘이 커질수록 템플릿 Radius도 커짐)
- **Use one type of stroke width:** 같은 크기의 아이콘을 화면에 병렬 배치할 때는 반드시 **단일한 선 굵기(한 가지 두께)**만 엄격히 사용하여 시각적 무게감을 통일해야 합니다.
- **Icon type 일관성 제한:** Line(선형) 타입과 Fill(면형) 타입 아이콘을 명확히 구분하여, 하나의 화면(또는 아이콘 그룹) 내에서 두 타입을 혼용하지 않습니다.
- **렌더링 포맷:** 확대/축소 시 화질 저하 방지 및 CSS 제어(Color/Stroke 변형)를 위해 단일 색상의 경우 반드시 **Inline SVG** 방식을 사용합니다.

### 6. 범용 컴포넌트 상세 수치 규격 표 (Component Sizing & Padding)
가이드라인 원문(컴포넌트 패턴 영역)에 흩어져 있는 핵심 폼/액션 요소의 상세 픽셀 규격표를 모아 통합합니다. 프론트엔드 코드 렌더링 시 임의로 패딩이나 요소를 조작하지 말고 아래 표를 최우선 상수로 매핑하십시오.

#### 6.1 버튼(Button) 크기 클래스 및 여백
| 스케일 (Scale) | 높이 (min-height) | 폰트 크기 | 패딩 (px, Y/X) | 적용 기준 (Usage) | 최적 Tailwind |
|---|---|---|---|---|---|
| **X-Large** | `56px` | 19px (Body Large) | `16px`, `24px` | 모바일 화면 하단 고정 플로팅 버튼, 주요 결제/랜딩 액션 | `h-14 px-6 text-lg` |
| **Large** | `48px` | 17px (Body Medium) | `12px`, `20px` | 입력 폼 템플릿 하단의 최종 제출 및 인증, 서브 액션 | `h-12 px-5 text-base` |
| **Medium** (*기본*) | `40px` | 15px (Body Small) | `8px`, `16px` | 다이얼로그(모달) 내부 버튼, 일반적인 화면 중간 버튼 | `h-10 px-4 text-sm` |
| **Small** | `32px` | 13px (Detail) | `6px`, `12px` | 데이터 테이블 내부 행렬 컨트롤 버튼, 아주 좁은 공간 제어 | `h-8 px-3 text-xs` |

#### 6.2 텍스트 입력창(Input Field) 크기 클래스
버튼의 높이 규격과 동일한 시각적 인상(Height)을 갖도록 강제 조율해야 합니다.
| 스케일 (Scale) | 높이 (min-height) | 텍스트 크기 | 힌트(Placeholder) 크기 | 포커스(Focus) 링 |
|---|---|---|---|---|
| **Large** | `48px` | 17px | 17px | `2px solid #000` |
| **Medium** (*기본*) | `40px` | 15px | 15px | `2px solid #000` |
| **Small** | `32px` | 13px | 13px | `2px solid #000` |

#### 6.3 팝업 및 다이얼로그(Modal) 최대 너비 표
화면 너비가 무한히 늘어나더라도 사용자 시선 분산을 막기 위해 컨테이너 고정 값을 제한합니다. (모바일 기기에서는 좌우 16px의 스크린 마진을 뺀 100% 비율을 사용)
| 스케일 (Scale) | 데스크톱 최대 너비 (Max Width) | 용도 및 목적 (Usage) | 내부 상하좌우 기본 패딩(Padding) |
|---|---|---|---|
| **Small** | `400px` | 간단한 확인/취소 얼럿(Alert), 본인 인증, 암호 입력창 | `24px` (`p-6`) |
| **Medium** (*기본*) | `600px` | 회원 가입 폼, 세부 정보 보기, 데이터 항목 수정 다이얼로그 | `32px` (`p-8`) |
| **Large** | `800px` | 약관 동의 등 긴 텍스트 제공 시, 모달 내부 그리드/테이블 삽입 시 | `40px` (`p-10`) |

#### 6.4 피드백 요소 유지 및 고도 제한 수치
| 컴포넌트명 | 렌더링 물리적 위치 기준 | 최대 화면 유지 시간 (Duration) | 레이어 고도 (Z-index) |
|---|---|---|---|
| **긴급 공지 (Alert)** | 공식 배너 아래 ~ GNB 콘텐츠 최상단 고정 | 사용자가 강제로 '닫기(X)'를 누르기 전까지 영구 노출 | 문서 레이아웃 흐름대로 배치 |
| **토스트 (Toast 메시지)** | 모바일 화면 정중앙 하단 (Bottom-center) | **기본 3초(3000ms)** (치명적 에러 시 무한 대기) | `z-999` 이상 (가장 앞단) |
| **툴팁 (Tooltip)** | 타겟 커서/포커스 기준 간격 `8px` 띄움 | Hover/Focus 이탈 시 즉시 해제 (애니메이션 최소화) | `z-30` (일반 드롭다운과 동률) |
