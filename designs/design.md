# 프로젝트 디자인 시스템 (sb-flow Design System)

> **이 문서는 sb-flow로 생성되는 모든 프로젝트의 UI 디자인 기준입니다.**
> 모든 UI 요소는 이 명세를 따르며, `design-tokens.css`의 CSS 변수를 사용하여 구현합니다.
> 색상·크기·간격 등의 값을 직접 하드코딩하지 않으며, 반드시 디자인 토큰 변수를 참조합니다.
>
> **기반 스케일**: Tailwind CSS (https://tailwindcss.com/docs)
> 색상, 간격, 그림자, 둥글기, 브레이크포인트 등 모든 토큰 값은 Tailwind CSS의 디자인 스케일을 기반으로 정의되었습니다. Tailwind를 직접 사용하는 것이 아니라, Tailwind의 검증된 수치 체계를 CSS 변수로 옮겨 사용합니다.

---

## 1. 테마 (Theme)

### 1.1 색상 팔레트 (Color Palette)

#### Primary (메인 — Blue 계열)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-primary-50` | `#EFF6FF` | 배경 하이라이트, 선택 상태 배경 |
| `--color-primary-100` | `#DBEAFE` | 호버 배경, 뱃지 배경 |
| `--color-primary-200` | `#BFDBFE` | 보더 하이라이트 |
| `--color-primary-300` | `#93C5FD` | 비활성 아이콘 |
| `--color-primary-400` | `#60A5FA` | 링크 호버 |
| `--color-primary-500` | `#3B82F6` | 링크 텍스트, 보조 아이콘 |
| `--color-primary-600` | `#2563EB` | **기본 버튼, CTA, 주요 강조** |
| `--color-primary-700` | `#1D4ED8` | 버튼 호버 |
| `--color-primary-800` | `#1E40AF` | 버튼 액티브(누름) |
| `--color-primary-900` | `#1E3A8A` | 진한 텍스트 강조 |

#### Neutral (중립 — Gray 계열)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-gray-50` | `#F9FAFB` | 페이지 배경, 카드 배경 (보조) |
| `--color-gray-100` | `#F3F4F6` | 입력 필드 배경, 구분선 영역 |
| `--color-gray-200` | `#E5E7EB` | 보더, 구분선 |
| `--color-gray-300` | `#D1D5DB` | 비활성 보더, placeholder 아이콘 |
| `--color-gray-400` | `#9CA3AF` | placeholder 텍스트, 비활성 텍스트 |
| `--color-gray-500` | `#6B7280` | 보조 텍스트, 캡션 |
| `--color-gray-600` | `#4B5563` | 본문 보조 텍스트 |
| `--color-gray-700` | `#374151` | 본문 텍스트 |
| `--color-gray-800` | `#1F2937` | 제목, 강조 텍스트 |
| `--color-gray-900` | `#111827` | 최상위 제목, 네비게이션 텍스트 |

#### 시맨틱 색상 (Semantic Colors)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-success` | `#16A34A` | 성공 메시지, 완료 상태 |
| `--color-success-light` | `#F0FDF4` | 성공 알림 배경 |
| `--color-warning` | `#D97706` | 경고, 주의 상태 |
| `--color-warning-light` | `#FFFBEB` | 경고 알림 배경 |
| `--color-danger` | `#DC2626` | 에러, 삭제, 위험 액션 |
| `--color-danger-light` | `#FEF2F2` | 에러 알림 배경 |
| `--color-info` | `#2563EB` | 안내 메시지 (Primary와 동일) |
| `--color-info-light` | `#EFF6FF` | 안내 알림 배경 |

#### 배경 및 표면 (Background & Surface)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-bg` | `#FFFFFF` | 메인 배경 |
| `--color-bg-secondary` | `#F9FAFB` | 보조 배경 (사이드바, 섹션 구분) |
| `--color-bg-tertiary` | `#F3F4F6` | 3차 배경 (코드 블록, 테이블 줄무늬) |
| `--color-surface` | `#FFFFFF` | 카드, 모달, 드롭다운 표면 |
| `--color-overlay` | `rgba(0, 0, 0, 0.5)` | 모달 오버레이 |

---

### 1.2 다크모드 (Dark Mode)

> **MVP 단계에서는 라이트 모드만 지원합니다.**
> 다크모드 도입 시 `design-tokens.css`의 `@media (prefers-color-scheme: dark)` 섹션을 활성화합니다.

---

## 2. 타이포그래피 (Typography)

### 2.1 폰트 패밀리

| 토큰 | 값 | 용도 |
|------|----|------|
| `--font-sans` | `'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 본문, UI 전체 |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', 'Consolas', monospace` | 코드, 숫자 강조 |

### 2.2 폰트 크기 (Font Size)

| 토큰 | 값 | rem | 용도 |
|------|----|-----|------|
| `--text-xs` | `12px` | 0.75rem | 캡션, 뱃지, 태그 |
| `--text-sm` | `14px` | 0.875rem | 보조 텍스트, 테이블 셀, 라벨 |
| `--text-base` | `16px` | 1rem | 본문 기본 |
| `--text-lg` | `18px` | 1.125rem | 본문 강조, 서브 제목 |
| `--text-xl` | `20px` | 1.25rem | 섹션 제목 |
| `--text-2xl` | `24px` | 1.5rem | 페이지 제목 |
| `--text-3xl` | `30px` | 1.875rem | 히어로 제목 |
| `--text-4xl` | `36px` | 2.25rem | 랜딩 메인 제목 |

### 2.3 폰트 굵기 (Font Weight)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--font-normal` | `400` | 본문 |
| `--font-medium` | `500` | 라벨, 네비게이션 |
| `--font-semibold` | `600` | 소제목, 버튼 텍스트 |
| `--font-bold` | `700` | 제목, 강조 |

### 2.4 줄 높이 (Line Height)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--leading-tight` | `1.25` | 제목 |
| `--leading-normal` | `1.5` | 본문 |
| `--leading-relaxed` | `1.75` | 긴 문단, 가독성 강조 |

### 2.5 자간 (Letter Spacing)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--tracking-tight` | `-0.025em` | 큰 제목 |
| `--tracking-normal` | `0em` | 본문 |
| `--tracking-wide` | `0.025em` | 대문자 라벨, 뱃지 |

---

## 3. 간격 시스템 (Spacing)

> 4px 기반 간격 체계. 모든 margin, padding은 이 토큰을 사용합니다.

| 토큰 | 값 | 용도 |
|------|----|------|
| `--space-0` | `0px` | 없음 |
| `--space-0.5` | `2px` | 미세 간격 |
| `--space-1` | `4px` | 아이콘-텍스트 사이 |
| `--space-1.5` | `6px` | 인라인 요소 사이 |
| `--space-2` | `8px` | 라벨-입력 사이, 뱃지 내부 |
| `--space-3` | `12px` | 폼 요소 사이, 리스트 아이템 사이 |
| `--space-4` | `16px` | 카드 내부 패딩, 섹션 내 요소 사이 |
| `--space-5` | `20px` | 카드 패딩 (기본) |
| `--space-6` | `24px` | 섹션 간 간격 |
| `--space-8` | `32px` | 페이지 섹션 간격 |
| `--space-10` | `40px` | 대형 섹션 간격 |
| `--space-12` | `48px` | 페이지 상단 여백 |
| `--space-16` | `64px` | 히어로 섹션 간격 |
| `--space-20` | `80px` | 페이지 구간 대여백 |

---

## 4. 레이아웃 (Layout)

### 4.1 컨테이너 너비

| 토큰 | 값 | 용도 |
|------|----|------|
| `--container-sm` | `640px` | 로그인/회원가입 폼 |
| `--container-md` | `768px` | 블로그 본문, 상세 페이지 |
| `--container-lg` | `1024px` | 일반 콘텐츠 |
| `--container-xl` | `1280px` | 대시보드, 와이드 레이아웃 |
| `--container-padding` | `16px` | 컨테이너 좌우 패딩 (모바일) |

### 4.2 브레이크포인트

| 토큰 | 값 | 용도 |
|------|----|------|
| `--breakpoint-sm` | `640px` | 모바일 → 태블릿 전환점 |
| `--breakpoint-md` | `768px` | 태블릿 기준 |
| `--breakpoint-lg` | `1024px` | 데스크탑 전환점 |
| `--breakpoint-xl` | `1280px` | 와이드 데스크탑 |

### 4.3 사이드바

| 토큰 | 값 | 용도 |
|------|----|------|
| `--sidebar-width` | `260px` | 사이드바 너비 |
| `--sidebar-collapsed` | `64px` | 접힌 사이드바 너비 |

### 4.4 네비게이션 바

| 토큰 | 값 | 용도 |
|------|----|------|
| `--navbar-height` | `64px` | 상단 네비게이션 높이 |

---

## 5. 버튼 (Button)

### 5.1 종류 (Variants)

| 종류 | 배경 | 텍스트 | 보더 | 용도 |
|------|------|--------|------|------|
| **Primary** | `--color-primary-600` | `#FFFFFF` | 없음 | CTA, 저장, 확인 |
| **Secondary** | `transparent` | `--color-primary-600` | `--color-primary-600` | 취소, 보조 액션 |
| **Ghost** | `transparent` | `--color-gray-700` | 없음 | 텍스트 버튼, 네비게이션 |
| **Danger** | `--color-danger` | `#FFFFFF` | 없음 | 삭제, 위험 액션 |
| **Danger-outline** | `transparent` | `--color-danger` | `--color-danger` | 삭제 확인 (보조) |

### 5.2 사이즈

| 사이즈 | 높이 | 패딩 (좌우) | 폰트 크기 | 용도 |
|--------|------|------------|----------|------|
| **xs** | `28px` | `8px` | `--text-xs` | 테이블 내 액션 |
| **sm** | `32px` | `12px` | `--text-sm` | 인라인 버튼 |
| **md** | `40px` | `16px` | `--text-sm` | **기본값**. 폼 내 버튼 |
| **lg** | `48px` | `24px` | `--text-base` | CTA, 로그인 버튼 |
| **xl** | `56px` | `32px` | `--text-lg` | 랜딩 히어로 CTA |

### 5.3 공통 속성

| 속성 | 값 |
|------|----|
| border-radius | `--radius-md` (8px) |
| font-weight | `--font-semibold` (600) |
| transition | `all 150ms ease` |
| cursor | `pointer` |
| disabled 투명도 | `0.5` |
| disabled cursor | `not-allowed` |
| focus outline | `2px solid --color-primary-400`, offset `2px` |

### 5.4 아이콘 버튼 (Icon Button)

| 사이즈 | 크기 (정사각) | 아이콘 크기 |
|--------|-------------|-----------|
| sm | `32px × 32px` | `16px` |
| md | `40px × 40px` | `20px` |
| lg | `48px × 48px` | `24px` |

---

## 6. 폼 요소 (Form Elements)

### 6.1 텍스트 입력 (Text Input)

| 속성 | 값 |
|------|----|
| 높이 | `40px` (md), `32px` (sm), `48px` (lg) |
| 패딩 (좌우) | `12px` |
| 배경 | `--color-bg` (#FFFFFF) |
| 보더 | `1px solid --color-gray-300` |
| border-radius | `--radius-md` (8px) |
| 폰트 크기 | `--text-sm` (14px) |
| placeholder 색상 | `--color-gray-400` |
| **focus 보더** | `--color-primary-500` |
| **focus ring** | `0 0 0 3px --color-primary-100` |
| error 보더 | `--color-danger` |
| error ring | `0 0 0 3px --color-danger-light` |
| disabled 배경 | `--color-gray-100` |

### 6.2 텍스트에어리어 (Textarea)

| 속성 | 값 |
|------|----|
| 최소 높이 | `120px` |
| 패딩 | `12px` |
| resize | `vertical` |
| 나머지 속성 | 텍스트 입력과 동일 |

### 6.3 셀렉트 (Select)

| 속성 | 값 |
|------|----|
| 높이 | 텍스트 입력과 동일 |
| 화살표 | 커스텀 SVG chevron |
| appearance | `none` |
| 나머지 속성 | 텍스트 입력과 동일 |

### 6.4 체크박스 / 라디오

| 속성 | 값 |
|------|----|
| 크기 | `18px × 18px` |
| 보더 | `2px solid --color-gray-300` |
| border-radius | 체크박스 `4px`, 라디오 `50%` |
| 체크 색상 | `--color-primary-600` |
| 라벨 간격 | `--space-2` (8px) |

### 6.5 토글 스위치 (Toggle)

| 속성 | 값 |
|------|----|
| 트랙 크기 | `44px × 24px` |
| 핸들 크기 | `20px × 20px` |
| OFF 배경 | `--color-gray-300` |
| ON 배경 | `--color-primary-600` |
| transition | `200ms ease` |

### 6.6 라벨 (Label)

| 속성 | 값 |
|------|----|
| 폰트 크기 | `--text-sm` (14px) |
| 폰트 굵기 | `--font-medium` (500) |
| 색상 | `--color-gray-700` |
| 라벨-입력 사이 간격 | `--space-1.5` (6px) |
| 필수 표시 (*) | `--color-danger` |

### 6.7 헬퍼 텍스트 / 에러 메시지

| 속성 | 값 |
|------|----|
| 폰트 크기 | `--text-xs` (12px) |
| 헬퍼 색상 | `--color-gray-500` |
| 에러 색상 | `--color-danger` |
| 입력-메시지 간격 | `--space-1.5` (6px) |

---

## 7. 카드 (Card)

| 속성 | 값 |
|------|----|
| 배경 | `--color-surface` (#FFFFFF) |
| 보더 | `1px solid --color-gray-200` |
| border-radius | `--radius-lg` (12px) |
| 패딩 | `--space-5` (20px), 모바일 `--space-4` (16px) |
| 그림자 | `--shadow-sm` |
| 호버 그림자 (클릭 가능 시) | `--shadow-md` |
| transition | `box-shadow 200ms ease` |

---

## 8. 모달 / 다이얼로그 (Modal)

| 속성 | 값 |
|------|----|
| 최대 너비 | sm `400px`, md `560px`, lg `720px` |
| border-radius | `--radius-xl` (16px) |
| 패딩 | `--space-6` (24px) |
| 오버레이 | `--color-overlay` |
| 그림자 | `--shadow-xl` |
| 애니메이션 | fade-in + scale (200ms) |
| 닫기 버튼 | 우상단, Ghost 아이콘 버튼 |

---

## 9. 테이블 (Table)

| 속성 | 값 |
|------|----|
| 헤더 배경 | `--color-gray-50` |
| 헤더 텍스트 | `--text-xs`, `--font-semibold`, `--color-gray-600`, 대문자 |
| 셀 패딩 | `12px 16px` |
| 행 보더 | `1px solid --color-gray-200` (하단) |
| 줄무늬 (선택) | 짝수 행 `--color-gray-50` |
| 호버 행 | `--color-primary-50` |

---

## 10. 네비게이션 (Navigation)

### 10.1 상단 네비게이션 바 (Navbar)

| 속성 | 값 |
|------|----|
| 높이 | `--navbar-height` (64px) |
| 배경 | `--color-bg` + `backdrop-filter: blur(8px)` |
| 하단 보더 | `1px solid --color-gray-200` |
| position | `sticky`, `top: 0`, `z-index: 50` |
| 로고 영역 | 좌측 |
| 메뉴 영역 | 중앙 또는 우측 |
| 모바일 | 햄버거 메뉴 |

### 10.2 사이드바 (Sidebar)

| 속성 | 값 |
|------|----|
| 너비 | `--sidebar-width` (260px) |
| 배경 | `--color-bg-secondary` |
| 보더 | 우측 `1px solid --color-gray-200` |
| 메뉴 아이템 높이 | `40px` |
| 활성 아이템 배경 | `--color-primary-50` |
| 활성 아이템 텍스트 | `--color-primary-700`, `--font-semibold` |

---

## 11. 뱃지 / 태그 (Badge & Tag)

| 속성 | 값 |
|------|----|
| 패딩 | `2px 8px` |
| border-radius | `--radius-full` (9999px) |
| 폰트 크기 | `--text-xs` |
| 폰트 굵기 | `--font-medium` |

| 종류 | 배경 | 텍스트 |
|------|------|--------|
| Default | `--color-gray-100` | `--color-gray-700` |
| Primary | `--color-primary-100` | `--color-primary-700` |
| Success | `--color-success-light` | `--color-success` |
| Warning | `--color-warning-light` | `--color-warning` |
| Danger | `--color-danger-light` | `--color-danger` |

---

## 12. 알림 / 토스트 (Alert & Toast)

### 12.1 인라인 알림 (Alert)

| 속성 | 값 |
|------|----|
| 패딩 | `12px 16px` |
| border-radius | `--radius-md` (8px) |
| 좌측 보더 | `4px solid` (시맨틱 색상) |
| 아이콘 | 좌측 20px |

### 12.2 토스트 (Toast)

| 속성 | 값 |
|------|----|
| 위치 | 우상단 (`top: 16px, right: 16px`) |
| 최대 너비 | `400px` |
| 그림자 | `--shadow-lg` |
| 자동 닫힘 | 5초 |
| 애니메이션 | slide-in-right (300ms) |

---

## 13. 그림자 (Shadow)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | 미세한 깊이감 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | 카드, 입력 필드 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | 드롭다운, 호버 카드 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | 토스트, 팝오버 |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | 모달 |

---

## 14. 둥글기 (Border Radius)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--radius-none` | `0px` | 없음 |
| `--radius-sm` | `4px` | 체크박스, 작은 요소 |
| `--radius-md` | `8px` | 버튼, 입력, 카드 (기본) |
| `--radius-lg` | `12px` | 카드, 컨테이너 |
| `--radius-xl` | `16px` | 모달, 대형 카드 |
| `--radius-2xl` | `24px` | 이미지 컨테이너 |
| `--radius-full` | `9999px` | 뱃지, 아바타, 원형 버튼 |

---

## 15. 트랜지션 & 애니메이션 (Transition & Animation)

### 15.1 트랜지션

| 토큰 | 값 | 용도 |
|------|----|------|
| `--transition-fast` | `100ms ease` | 색상 변화, 투명도 |
| `--transition-base` | `150ms ease` | 버튼 호버, 보더 |
| `--transition-slow` | `300ms ease` | 모달, 사이드바 열기/닫기 |
| `--transition-spring` | `300ms cubic-bezier(0.34, 1.56, 0.64, 1)` | 바운스 효과 |

### 15.2 애니메이션

| 이름 | 용도 |
|------|------|
| `fadeIn` | 모달, 오버레이 등장 |
| `slideUp` | 토스트, 드롭다운 등장 |
| `slideInRight` | 사이드 패널, 토스트 |
| `spin` | 로딩 스피너 |
| `pulse` | 스켈레톤 로딩 |

---

## 16. 아바타 (Avatar)

| 사이즈 | 크기 | 용도 |
|--------|------|------|
| xs | `24px` | 댓글, 인라인 표시 |
| sm | `32px` | 리스트 아이템 |
| md | `40px` | 네비게이션, 카드 헤더 |
| lg | `64px` | 프로필 페이지 |
| xl | `96px` | 프로필 편집, 설정 |

| 속성 | 값 |
|------|----|
| border-radius | `--radius-full` (원형) |
| 대체 배경 | `--color-primary-100` |
| 대체 텍스트 색상 | `--color-primary-700` |
| 보더 | `2px solid --color-bg` (겹침 시) |

---

## 17. 로딩 상태 (Loading)

### 17.1 스피너 (Spinner)

| 사이즈 | 크기 | 보더 두께 |
|--------|------|----------|
| sm | `16px` | `2px` |
| md | `24px` | `3px` |
| lg | `40px` | `4px` |

| 속성 | 값 |
|------|----|
| 색상 | `--color-primary-600` |
| 트랙 색상 | `--color-gray-200` |
| animation | `spin 600ms linear infinite` |

### 17.2 스켈레톤 (Skeleton)

| 속성 | 값 |
|------|----|
| 배경 | `--color-gray-200` |
| 하이라이트 | `--color-gray-100` |
| border-radius | `--radius-md` |
| animation | `pulse 1.5s ease infinite` |

---

## 18. z-index 체계 (Z-Index)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--z-dropdown` | `10` | 드롭다운 메뉴 |
| `--z-sticky` | `20` | sticky 요소 |
| `--z-fixed` | `30` | 고정 네비게이션 |
| `--z-sidebar` | `40` | 사이드바 (모바일 오버레이) |
| `--z-modal` | `50` | 모달 |
| `--z-toast` | `60` | 토스트 알림 |
| `--z-tooltip` | `70` | 툴팁 |

---

## 19. 로그인 / 인증 페이지 (Auth Pages)

| 속성 | 값 |
|------|----|
| 레이아웃 | 중앙 정렬, `--container-sm` (640px) |
| 카드 패딩 | `--space-8` (32px), 모바일 `--space-5` (20px) |
| 로고 | 상단 중앙, 하단 여백 `--space-6` |
| 소셜 로그인 버튼 | Secondary 스타일, 전체 너비, 아이콘 좌측 |
| 구분선 | "또는" 텍스트 + 양쪽 회색선 |
| 로그인/회원가입 버튼 | Primary, **lg 사이즈**, 전체 너비 |
| 폼 요소 간 간격 | `--space-4` (16px) |
| 보조 링크 (비밀번호 찾기 등) | `--text-sm`, `--color-primary-600` |

---

## 20. 규칙 (Rules)

1. **CSS 변수 필수**: 모든 색상·크기·간격 값은 `design-tokens.css`의 변수를 사용한다. 하드코딩 금지.
2. **토큰 외 값 사용 금지**: 디자인 토큰에 정의되지 않은 임의의 값(예: `padding: 13px`, `color: #abc123`)을 사용하지 않는다.
3. **일관성 우선**: 같은 목적의 요소는 항상 같은 토큰을 사용한다 (예: 모든 카드는 동일 radius, 동일 shadow).
4. **반응형 기준**: 모바일 퍼스트(Mobile First)로 작성하고, 브레이크포인트에서 확장한다.
5. **접근성**: 색상 대비 WCAG AA 이상, focus visible 필수, 최소 터치 타겟 `44px × 44px`.
