#!/usr/bin/env node
/* Mechanical derivatives of preserved references and authored review recipes.
 * node designs/assets/ui-kit/internal/components/build.cjs [--check]
 * --check verifies bytes without writing files.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(base, p), 'utf8');
const json = p => JSON.parse(read(p));
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const output = new Map();
const encode = value => JSON.stringify(value, null, 2) + '\n';
const coverage = json('coverage.json').items.filter(i => i.startPage >= 45 && i.endPage <= 552);
const componentRecipes = json('components/review-recipes.json');
const foundationRecipes = json('foundations/review-recipes.json');

function numberedRules(text) {
  const found = new Map();
  for (const pageMatch of text.matchAll(/## PDF p\.(\d+)\n([\s\S]*?)(?=\n## PDF p\.|$)/g)) {
    const page = Number(pageMatch[1]);
    const lines = pageMatch[2].split('\n').map(l => l.trim());
    for (let n = 0; n < lines.length; n++) {
      const match = lines[n].match(/^(\d{2})\s+(.+)$/);
      if (!match || !/[가-힣]/.test(match[2])) continue;
      let sentence = match[2];
      // Numbered category lists are not rules. Join wrapped rule headings only.
      for (let j = n + 1; !/다\.$/.test(sentence) && j < Math.min(n + 5, lines.length); j++) {
        if (!lines[j] || /^\d{2}\s/.test(lines[j]) || /^(개요|사용성|접근성|상호작용|플랫폼)/.test(lines[j])) break;
        sentence += ' ' + lines[j];
      }
      if (!/다\.$/.test(sentence)) continue;
      const key = sentence.replace(/\s/g, '');
      if (!found.has(key)) found.set(key, {text: sentence, sourcePages: [], status: 'not-tested'});
      found.get(key).sourcePages.push(page);
    }
  }
  return [...found.values()].map((r, n) => ({id: `R${String(n + 1).padStart(3, '0')}`, ...r,
    sourcePages: [...new Set(r.sourcePages)]}));
}

const mapping = {version: 1, pathBase: 'designs/assets', items: {}};
const inventory = {version: 1, source: 'KRDS PDF 2024.02',
  meaning: 'Numbered-heading extraction is a navigation aid, not every detailed condition or a compliance verdict. Read the complete source pages, especially unnumbered interaction guidance.', items: []};
const snippets = fs.readdirSync(path.join(base, 'upstream/html/code')).filter(n => n.endsWith('.html'));
for (const item of coverage) {
  const component = item.category === 'components';
  const source = read(item.reference);
  const recipe = component ? componentRecipes[item.id] : {checks: foundationRecipes[item.id]};
  if (!recipe || !recipe.checks) throw new Error(`Missing authored recipe: ${item.id}`);
  const pages = [...source.matchAll(/## PDF p\.(\d+)\n([\s\S]*?)(?=\n## PDF p\.|$)/g)]
    .map(m => ({page: Number(m[1]), sha256: sha(m[2].trim())}));
  const rules = component ? numberedRules(source) : [];
  const directory = component ? 'components' : 'foundations';
  const document = `${directory}/${item.id}.md`;
  let stem = (item.title.match(/\(([^)]+)\)/) || [,''])[1].toLowerCase().replace(/[ -]/g, '_');
  const variants = component ? snippets.filter(n => n === `${stem}.html` || n.startsWith(`${stem}_`)) : [];
  const assets = [`ui-kit/internal/${document}`];
  const notes = ['체크리스트와 원문 연결은 구현 준수나 모든 상호작용 검증을 뜻하지 않는다.'];
  if (component) {
    assets.push(...variants.map(n => `ui-kit/internal/upstream/html/code/${n}`));
    notes.push('공식 키트 1.1.0 조각은 PDF 2024.02와 버전이 다르며 대상 화면·데이터·서버 동작 통합이 필요하다.');
  }
  if (item.id === 'krds-p0299') {
    assets.push('ui-kit/internal/components/image.html', 'ui-kit/internal/components/image-diagram.svg', 'ui-kit/internal/components/image-divider.svg', 'ui-kit/internal/components/image-info.svg');
    notes.push('이미지 신규 예제는 Altool 작성 정보도식이다. 원문 사례 사진 복제나 실제 제품 사진 자산을 대신하지 않는다.');
  }
  if (item.id === 'krds-p0204') notes.push('in-page navigation 영문 명칭의 하이픈을 파일명 in_page_navigation으로 연결한다.');
  if (!component && item.startPage >= 64) assets.push('ui-kit/internal/foundations/values-2024.json', 'ui-kit/internal/foundations/tokens-2024.css');
  if (item.id === 'krds-p0064') assets.push('ui-kit/internal/foundations/palette-2024.json');
  if (recipe.scope) notes.push('공식정부서비스 전용: 일반 제품의 기본 CI/배너로 사용하지 않는다.');
  mapping.items[item.id] = {assets, implementation: item.id === 'krds-p0299' ? 'derived-example' : 'reference-plus-checklist',
    verification: 'source-linked-not-behavior-verified', notes, ...(recipe.scope ? {scope: recipe.scope} : {})};
  inventory.items.push({id: item.id, title: item.title, reference: item.reference, referenceSha256: sha(source), pages, rules});
  const rulesMd = rules.map(r => `- [ ] **${r.id}** ${r.text} (${r.sourcePages.map(p => `[p.${p}](../${item.reference}#pdf-p${p})`).join(', ')})`).join('\n');
  output.set(document, `# ${item.title} 적용·검증 카드\n\n` +
    `출처: 행정안전부 KRDS, 디지털 정부서비스 UI/UX 가이드라인(2024.02), PDF p.${item.startPage}-${item.endPage}. 공공누리 제1유형 출처표시.\n\n` +
    `이 카드는 Altool이 작성한 적용 절차와 원문의 번호 규칙 색인이다. 원문 전체, 예외·사용 부적합 용례·그림·키보드 표를 대체하지 않는다. 현재 상태: **대상 앱 미검증**.\n\n` +
    (recipe.scope ? '> **공식정부서비스 전용. 일반 제품에서는 사용하지 않는다.**\n\n' : '') +
    `## 적용 전 판단과 실제 검증\n\n${recipe.checks.map(c => `- [ ] ${c}`).join('\n')}\n` +
    `- [ ] 아래 원문 모든 페이지에서 개요·유형·구조·사용성·플랫폼·접근성·상호작용을 읽고, 이 앱에 적용/비적용/예외를 근거와 함께 기록한다.\n` +
    `- [ ] 채택한 실제 화면에서 기본·선택·초점·비활성·로딩·빈·오류·성공 중 적용되는 상태와 키보드·터치·반응형·보조기술을 검증한다. 없는 상태를 자산 수를 늘리기 위해 만들지 않는다.\n\n` +
    `## 연결 자산\n\n${assets.slice(1).map(a => `- [${a.split('/').pop()}](../${a.replace('ui-kit/internal/', '')})`).join('\n') || '- 이 항목은 판단 원칙·절차 자산이며 시각 컴포넌트가 아니다.'}\n\n` +
    `${component ? `## 원문 번호 규칙 빠른 점검\n\n번호 제목의 줄바꿈을 합치고 동일 문구만 중복 제거했다. 본문에만 있는 조건과 번호 없는 키보드 상호작용은 아래 전체 원문에서 추가 확인한다.\n\n${rulesMd}\n\n` : ''}` +
    `## 전체 원문 페이지\n\n${pages.map(p => `[${p.page}](../${item.reference}#pdf-p${p.page})`).join(' · ')}\n\n` +
    `## 검증 기록 양식\n\n| 대상 화면/상태 | 원문 페이지·규칙 | 실제 관찰/명령 | 결과·미검증 사유 |\n| --- | --- | --- | --- |\n| 작성 전 | 관련 페이지 선택 | 아직 실행하지 않음 | 미검증 |\n\n` +
    `원문 SHA-256: ${sha(source)}. 이 hash는 출처 변경 감지용이며 의미적 준수를 증명하지 않는다.\n`);
}
output.set('components/mapping.json', encode(mapping));
output.set('components/rule-inventory.json', encode(inventory));

const values = json('foundations/values-2024.json');
const palette = json('foundations/palette-2024.json');
const css = ['/* KRDS 2024.02 PDF-derived values, visual transcription. See foundations/README.md.',
  ' * Opt-in variables only: no :root, reset, imported font or automatic product theme.',
  ' * rem values assume the browser default 16px root; do not combine with a 62.5% root unchanged. */',
  '.krds-2024-tokens {'];
for (const [name, set] of Object.entries(values.keyColors)) set.values.forEach((v,n) => css.push(`  --krds24-${name}-${values.keyLevels[n]}: ${v};`));
for (const [name, set] of Object.entries(values.systemColors)) set.values.forEach((v,n) => css.push(`  --krds24-${name}-${values.systemLevels[n]}: ${v};`));
for (const [name, shades] of Object.entries(palette.colors)) shades.forEach((v,n) => css.push(`  --krds24-palette-${name}-${palette.levels[n]}: ${v};`));
values.alpha.blackOpacityPercent.forEach(n => css.push(`  --krds24-alpha-black-${n}: rgb(0 0 0 / ${n}%);`));
values.typography.rows.forEach(([name,desktop,mobile,weights,tracking]) => {
  css.push(`  --krds24-${name}-size: ${desktop / 16}rem;`, `  --krds24-${name}-mobile-size: ${mobile / 16}rem;`,
    `  --krds24-${name}-weight: ${weights[0]};`, `  --krds24-${name}-tracking: ${tracking / 16}rem;`);
});
css.push('  /* Company default font stack, not a PDF-mandated font. */', '  --krds24-font-family: system-ui, -apple-system, sans-serif;', '  --krds24-line-height: 1.5;', '  --krds24-font-regular: 400;', '  --krds24-font-bold: 700;');
for (const radius of values.radius.tokenSizesPx) css.push(`  --krds24-radius-${radius}: ${radius / 16}rem;`);
for (const spacing of values.layout.spacingScalePx) css.push(`  --krds24-space-${spacing}: ${spacing / 16}rem;`);
css.push('  --krds24-content-max: 80rem;', '}', '');
output.set('foundations/reference-tokens.css', css.join('\n'));
output.set('foundations/tokens-2024.css', fs.readFileSync(path.join(base, '../design/theme.css'), 'utf8'));

const checking = process.argv.includes('--check');
for (const [relative, data] of output) {
  const destination = path.join(base, relative);
  if (checking) {
    if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== data) throw new Error(`Stale derivative: ${relative}`);
  } else fs.writeFileSync(destination, data);
}
console.log(`${checking ? 'Verified' : 'Generated'} ${output.size} derivatives; ${coverage.length} sections; ${inventory.items.reduce((n,i) => n+i.rules.length,0)} numbered rule headings. This is not a compliance verdict.`);
