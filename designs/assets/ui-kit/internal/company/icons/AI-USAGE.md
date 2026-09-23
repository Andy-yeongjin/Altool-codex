# AI용 공통 아이콘 선택 규칙

이 문서는 프로젝트 자산 사용 안내입니다. 공통 아이콘은 Lucide120개와 Altool 자체 제작13개, 총133개입니다. 선택할 때 [생성 목록](../dist/assets/icons.json)을 먼저 읽습니다. 외부 패키지 설치나 네트워크 요청은 필요하지 않습니다.

## 선택 순서
1. `id`, `label_ko`, `keywords`, `category`로 의미가 맞는 아이콘을 찾습니다. Altool 사용 증거에는 생성 목록의 `semanticId`를 사용합니다. 기존 ID 보존 매핑: user→icon.account, x→icon.close, trash→icon.delete, refresh→icon.reset, eye/eye-off→icon.password-visible/hidden. sprite ID와 registry 의미 ID를 혼동하지 않습니다.
2. `sprite_href` 또는 `svg_path`에 기록된 실제 파일만 사용합니다. 없는 ID나 외부 아이콘 URL을 만들어 쓰지 않습니다.
3. 같은 행동은 모든 페이지에서 같은 ID로 통일합니다. 크기·색상은 CSS로 조정하며 SVG path는 수정하지 않습니다.
4. 기본 크기 16px, 선 두께 1.5. 작은 버튼은 14px, 큰 버튼은 20px. 기본 `currentColor`로 버튼 글자색을 따릅니다.
5. 아이콘은 선택 사항입니다. 모든 버튼이나 제목에 자동으로 붙이지 않습니다. D 버튼의 모서리 4px·글꼴 굵기 500을 유지합니다.

## 주요 행동 매핑
| 행동 | ID |
|---|---|
| 조회·검색 | search |
| 신규·추가 | plus |
| 편집·수정 | pencil |
| 저장 | save |
| 삭제 | trash |
| 취소·닫기 | x |
| 새로고침 | refresh |
| 첨부 | paperclip |
| 다운로드 | download |
| Excel/CSV 파일 | spreadsheet |
| 법인 | building |
| 부서·조직도 | network |
| 예산 | wallet |
| 결재 | stamp |
| 도움말 | help |

`spreadsheet`는 일반 스프레드시트 문서 아이콘이며 Microsoft Excel 로고가 아닙니다. `stamp`는 결재 행위를 나타내며 결재 완료 상태를 뜻하지 않습니다. 완료/오류는 각각 success/error와 설명 텍스트로 표시합니다. 아이콘 선택으로 버튼 종류나 위험 여부를 자동 결정하지 않습니다.

## 버튼 사용
```html
<link rel="stylesheet" href="/assets/company.css">
<div class="krds-2024-tokens altool-ui">
  <button class="primary" type="button">
    <svg class="ui-icon" aria-hidden="true">
      <use href="/assets/icons.svg#search"></use>
    </svg>
    조회
  </button>
</div>
```

## 아이콘만 있는 버튼
```html
<button type="button" data-icon-only aria-label="첨부파일 내려받기">
  <svg class="ui-icon" aria-hidden="true">
    <use href="/assets/icons.svg#download"></use>
  </svg>
</button>
```

## 상태와 로딩
```html
<span role="status">
  <svg class="ui-icon ui-icon--spin" aria-hidden="true">
    <use href="/assets/icons.svg#loader"></use>
  </svg>
  조회 중입니다.
</span>
```
색이나 그림만으로 상태를 전달하지 말고 텍스트를 함께 표시합니다. 장식 SVG는 aria-hidden, 아이콘 전용 버튼은 구체적인 aria-label을 사용합니다. 회전은 loader 같은 진행 표시에서만 명시적으로 사용하며 자동으로 모든 refresh에 적용하지 않습니다. reduced-motion 설정에서는 회전을 멈춥니다.

## 파일 배치
- `/assets/company.css` ← `dist/company.css`
- `/assets/icons.svg` ← `dist/assets/icons.svg`
- 개별 파일을 사용할 경우 `/assets/icons/*` ← `dist/assets/icons/*`
- 배포 시 두 라이선스를 포함합니다: `dist/assets/LICENSE-LUCIDE.txt`, `dist/assets/LICENSE-ALTOOL.txt`.
- 실제 서비스 경로가 다르면 prefix만 변경하고 symbol ID는 유지합니다.

외부 SVG sprite는 같은 origin에서 HTTP(S)로 제공합니다. file://로 여는 로컬 HTML에서는 외부 use 참조가 제한될 수 있습니다. `icons-preview.html`은 inline sprite를 내장해 오프라인에서도 동작합니다.

개별 SVG를 img로 표시할 수 있지만 img 내부의 currentColor는 부모 글자색을 상속하지 않습니다. 버튼 색상 연동이 필요하면 SVG/use 방식을 사용합니다. 문자·이모지를 대체 아이콘으로 섞지 않습니다.

## 버전 및 재생성
Lucide 1.8.0에서 선별한120개의 원본 노드·선정 정보는 `source.json`, `selection.tsv`에 보관합니다. 나머지13개는 `additions.json`의 Altool 자체 도형이며 같은 24×24 viewBox·선 두께1.5 규격을 사용합니다. Lucide 라이선스는 [LICENSE-LUCIDE.txt](LICENSE-LUCIDE.txt), Altool 추가 도형의 MIT 라이선스는 [LICENSE-ALTOOL.txt](LICENSE-ALTOOL.txt)입니다. 정부 아이콘을 fallback으로 사용하지 않습니다.

제품 루트에서 `.venv/bin/python scripts/build_company_design.py`로 CSS·아이콘·의미 매핑을 함께 생성하고 `--check`로 재현성을 확인합니다. 저수준 `scripts/build_icons.py`만 실행하면 제품의 의미 매핑 후처리를 생략하므로 팩 발행에는 제품 생성기를 사용합니다. 원본 데이터가 포함되어 있어 Lucide 패키지를 다시 설치할 필요가 없습니다.

현재 실제 브라우저 검증은 접근 정책 차단으로 미완료입니다. 133개 파일·노드 검사가 실제 크기·색상 상속·키보드 조작·표시 의미의 검증을 대신하지 않습니다.
