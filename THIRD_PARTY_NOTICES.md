# Third-Party Notices

## 회사 디자인 v27

사용자 제공 회사 UI의 Lucide 아이콘 120개는 [원본 정보](designs/assets/ui-kit/internal/company/icons/source.json)와 [Lucide 라이선스](designs/assets/ui-kit/internal/company/icons/LICENSE-LUCIDE.txt)를 보존한다. 추가 13개는 [Altool 자체 제작 아이콘](designs/assets/ui-kit/internal/company/icons/additions.json)이며 [별도 MIT 고지](designs/assets/ui-kit/internal/company/icons/LICENSE-ALTOOL.txt)를 따른다. 합계 133개를 전부 Lucide라고 표시하지 않는다. UI의 출처 주장·브라우저 검증 범위는 [회사 적용 안내](designs/assets/ui-kit/internal/company/README.md)를 따른다. 기존 정부 실행 자산은 제거했으며 KRDS·Pretendard GOV·Swiper 고지는 참고 자료와 과거 사용의 귀속 기록으로만 유지한다.

This repository is licensed under the MIT License for original Altool-codex
materials. The following bundled or referenced third-party materials are not
relicensed by Altool-codex. They remain subject to their original owners'
licenses, terms, or public-use policies.

## Vercel React Best Practices skill

- Included path: `templates/codex/skills/vercel-react-best-practices/`
- Source project: https://github.com/vercel-labs/agent-skills
- Upstream skill: `react-best-practices`
- Upstream organization: Vercel Engineering
- Upstream license declaration: MIT, as declared in the upstream README and
  the skill metadata.
- Note: as of 2026-06-29, the upstream repository publicly declares MIT in its
  README, but may not expose a top-level `LICENSE` file in all versions. This
  repository vendors the skill based on that MIT declaration and preserves a
  local notice inside the vendored skill folder.

## Digital Government Service UI/UX Guideline PDF

- Included path: `guides/디지털 정부서비스 UIUX 가이드라인(2024.02).pdf`
- Source: Ministry of the Interior and Safety, Republic of Korea
- Source page: https://www.mois.go.kr/frt/bbs/type001/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000015&nttId=108578
- Document title: `디지털 정부서비스 UI/UX 가이드라인('24.02.)`
- Published by: 행정안전부 공공서비스혁신과
- Repository use: bundled as a reference document for design/accessibility
  guidance.
- Notice: the Ministry page publishes the guideline as a reference attachment.
  The Ministry copyright policy says materials with a KOGL public-use mark may
  be used freely with source attribution, and materials without such a mark
  should be used after consultation with the responsible office. Keep this
  attribution when redistributing the PDF.

## Guide screenshots and service UI images

- Included path: `guides/images/`
- Contents: documentation screenshots for GitHub, Vercel, Neon, Altool guide
  pages, and PRD-builder examples.
- Repository use: instructional screenshots only.
- Notice: trademarks, product names, logos, and captured service interfaces
  remain the property of their respective owners. These images are included to
  explain the setup/deployment workflow and are not relicensed as standalone
  brand assets.

## Bundled YAML runtime

- PyYAML 6.0.3 (MIT): [bundled runtime/version details](altool/vendor/README.md),
  [original license](altool/vendor/pyyaml/LICENSE),
  [pinned source manifest](altool/vendor/pyyaml-manifest.json).

## Historical company UI reference kit and retained notices

- Previously used KRDS kit 1.1.0, pinned commit `d6bb184c823e4757f05807ea4646a23e3133b6e6`:
  [canonical attribution and recorded KRDS reuse conditions](designs/assets/ui-kit/internal/ATTRIBUTION.md).
- Previously bundled Pretendard GOV: [retained OFL notice](designs/assets/ui-kit/internal/licenses/Pretendard-OFL.txt).
- Previously bundled Swiper 11.0.6: [retained MIT notice](designs/assets/ui-kit/internal/licenses/Swiper-MIT.txt).
- The government kit's HTML/CSS/JS/SVG, GOV font binaries and Swiper runtime
  have been removed. Retained Markdown/JSON in
  `designs/assets/ui-kit/internal/reference/legacy/` is reference evidence,
  not an executable fallback. Current company UI does not load those assets.
- These entries index retained notices; they are not a new legal assessment or
  a replacement for the canonical terms and attribution above.

## External product names

GitHub, Vercel, Neon, Codex, OpenAI, Next.js, React, and other product or
project names mentioned in this repository may be trademarks of their
respective owners. Their mention does not imply endorsement.
