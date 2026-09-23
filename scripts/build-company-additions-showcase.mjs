import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPANY = 'designs/assets/ui-kit/internal/company/';
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const number = value => String(value).padStart(2, '0');
const icons = JSON.parse(read(COMPANY + 'icons/additions.json')).icons;
const extensions = JSON.parse(read(COMPANY + 'extensions/registry.json')).items;
const recipes = JSON.parse(read(COMPANY + 'recipes/registry.json')).items;
const preview = read(COMPANY + 'extensions/preview.html');
const release = JSON.parse(read('designs/assets/registry.json')).release;
const names = new Map(extensions.flatMap(item => Object.entries(item.variants).map(([variant, value]) => [item.id + '/' + variant, value.meaning || item.meaning])));
const toc = [];
let seq = 0;
const title = (name, id) => {
  seq++;
  toc.push({seq, name});
  return `<header class="review-label"><span class="review-number">${number(seq)}</span><div><h3>${escape(name)}</h3><code>${escape(id)}</code></div></header>`;
};
const iconCards = icons.map(icon => {
  const label = title(icon.label_ko, 'icon.' + icon.id);
  const svg = read(COMPANY + 'dist/assets/icons/' + icon.id + '.svg').replace('<svg ', '<svg class="ui-icon" aria-hidden="true" ');
  return `<article id="item-${seq}" class="review-icon" data-review-number="${seq}">${label}<div class="review-glyph">${svg}<span>${escape(icon.label_ko)}</span></div><p>기본16px · 공통 ui-icon · stroke 1.5</p></article>`;
}).join('\n');
let componentBody = preview.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
componentBody = componentBody.slice(componentBody.indexOf('<section id="extension-content"'));
componentBody = componentBody.replace(/<section class="ui-section"><h2>([^<]+)<\/h2><div id="example-(\d+)">/g, (_, heading, index) => {
  const [id, variant] = heading.split(' · ');
  const label = title(names.get(id + '/' + variant) + ' · ' + variant, id + '/' + variant);
  return `<section class="ui-section review-component" id="item-${seq}" data-review-number="${seq}">${label}<div class="review-demo" id="example-${index}">`;
});
componentBody = componentBody.replaceAll('../dist/', COMPANY + 'dist/').replaceAll('href="README.md"', 'href="' + COMPANY + 'extensions/README.md"');
const componentScripts = [...preview.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const recipeCards = recipes.map(item => {
  const label = title(item.meaning, item.id);
  const recipeNumber = seq;
  const options = Object.entries(item.variants).map(([name, value]) => {
    const target = COMPANY + (value.preview || value.path) + (value.route || '');
    if (!fs.existsSync(path.join(ROOT, target.split('#')[0]))) throw new Error('Missing preview: ' + target);
    return `<option value="${escape(target)}"${name === item.defaultVariant ? ' selected' : ''}>${escape(name)}</option>`;
  }).join('');
  const value = item.variants[item.defaultVariant];
  const initial = COMPANY + (value.preview || value.path) + (value.route || '');
  return `<section id="item-${recipeNumber}" class="ui-section review-recipe" data-review-number="${recipeNumber}">${label}<div class="ui-field review-variant"><label for="variant-${recipeNumber}">변형</label><select id="variant-${recipeNumber}" data-ui-select data-frame="recipe-${recipeNumber}">${options}</select></div><iframe id="recipe-${recipeNumber}" title="${escape(number(recipeNumber) + ' ' + item.meaning)}" src="${escape(initial)}" loading="lazy"></iframe><p class="review-note">이식한 실제 예제를 같은 화면에 표시합니다. 업무 데이터는 예시이며, 실제 인증·저장·전송 서비스가 아닙니다.</p></section>`;
}).join('\n');
const navigation = toc.map(item => `<a href="#item-${item.seq}"><span>${number(item.seq)}</span> ${escape(item.name)}</a>`).join('\n');
const css = read(COMPANY + 'dist/company.css');
const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>추가 자산 번호별 모아보기</title>
<style>${css}</style>
<style>
.review-page{margin:0;background:var(--krds24-white,#fff);color:var(--company-text-primary,#17212b)}
.review-shell{max-width:1280px;margin:auto;padding:28px 24px 60px}
.review-heading{padding-bottom:20px;border-bottom:1px solid var(--company-line-default,#d9dee5)}
.review-heading h1{font-size:28px;line-height:1.4;margin:8px 0;font-weight:600}
.review-heading p,.review-note{line-height:1.7;color:var(--company-text-secondary,#59616b)}
.review-links{display:flex;flex-wrap:wrap;gap:20px;padding:16px 0}
.review-links a,.review-toc a{color:var(--company-primary,#1554a0);text-decoration:none}
.review-toc{border-block:1px solid var(--company-line-default,#d9dee5);padding:12px 0;margin-bottom:24px}
.review-toc summary{cursor:pointer;min-height:34px;padding:6px 0}
.review-toc nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 20px;padding:12px 0}
.review-toc a{padding:6px;overflow-wrap:anywhere}.review-toc span{font-variant-numeric:tabular-nums;font-weight:600}
.review-section-title{font-size:22px;font-weight:600;margin:36px 0 20px}.review-section-title small{font-size:14px;font-weight:400;margin-left:12px}
.review-icon-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.review-icon{border-bottom:1px solid var(--company-line-default,#d9dee5);padding:16px 0;scroll-margin-top:20px}
.review-label{display:flex;gap:12px;align-items:flex-start;margin-bottom:18px}.review-label h3{font-size:16px;line-height:1.5;font-weight:600;margin:0 0 4px}
.review-label code{font-size:12px;overflow-wrap:anywhere;color:var(--company-text-secondary,#59616b)}
.review-number{color:#fff;background:#1554a0;display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:34px;height:30px;border-radius:4px;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}
.review-glyph{display:flex;align-items:center;gap:8px;min-height:34px;color:var(--krds24-gray-90)}
.review-icon p{font-size:12px;color:var(--company-text-secondary,#59616b);text-align:center;margin:8px 0 0}
.review-component,.review-recipe{padding:20px;border:1px solid var(--company-line-default,#d9dee5);border-radius:4px;margin:20px 0;scroll-margin-top:16px}
.review-demo{padding:16px 0;min-width:0}.review-demo>section{max-width:100%}
#extension-content,#extension-detail{padding:12px 0;color:var(--company-text-secondary,#59616b)}
#extension-content h2,#extension-detail h2{font-size:16px}
.review-variant{max-width:360px;margin-bottom:16px}.review-variant>.ui-select{width:100%!important;min-width:0}
.review-recipe iframe{display:block;width:100%;height:640px;border:1px solid var(--company-line-default,#d9dee5);background:#fff}
.review-note{font-size:13px}.review-footer{border-top:1px solid var(--company-line-default,#d9dee5);padding-top:20px;margin-top:40px}
@media(max-width:700px){.review-shell{padding:20px 14px 40px}.review-heading h1{font-size:23px}.review-icon-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.review-toc nav{grid-template-columns:1fr}.review-component,.review-recipe{padding:14px}.review-recipe iframe{height:580px}.review-section-title small{display:block;margin:6px 0}.review-variant{align-items:flex-start;flex-direction:column}.review-label{gap:8px}}
</style></head>
<body class="krds-2024-tokens altool-ui review-page"><main class="review-shell">
<header class="review-heading"><p>ALTOOL · COMPANY V27 · ${escape(release)}</p><h1>이번에 추가한 자산, 번호로 한눈에</h1><p>“18번을 바꿔줘”처럼 번호로 알려주세요. 원래 v27의120개 아이콘은 제외하고 추가·보완·이식한 항목만 모았습니다.</p><nav class="review-links" aria-label="묶음 이동"><a href="#icons">01–13 추가 아이콘</a><a href="#components">14–50 보완 컴포넌트</a><a href="#recipes">51–68 이식 업무 조합</a></nav><p class="review-note">현재 저장소 자산을 참조하는 검토용 페이지입니다. 실제 브라우저 검증은 접근 정책 제한으로 미완료입니다. 페이지를 다른 곳으로 옮기면 하위 예제 경로가 끊깁니다.</p></header>
<details class="review-toc"><summary>전체68개 번호 목차</summary><nav aria-label="번호별 목차">${navigation}</nav></details>
<h2 id="icons" class="review-section-title">추가 아이콘 <small>13개 · v27 기본16px / 확대 없음</small></h2><div class="review-icon-grid">${iconCards}</div>
<h2 id="components" class="review-section-title">새로 보완한 컴포넌트 <small>24개 의미 · 37개 변형 / 기존 동작 연결</small></h2>${componentBody}
<h2 id="recipes" class="review-section-title">v27로 이식한 업무 조합 <small>18개 그룹 · 선택 가능한90변형</small></h2>${recipeCards}
<footer class="review-footer"><a href="#icons">처음으로 돌아가기</a><p class="review-note">공통 디자인과 기능의 원본은 회사 UI Kit입니다. 이 화면은 번호형 검토용 생성물이며 별도 디자인 원천이 아닙니다.</p></footer></main>
<script src="${COMPANY}dist/business.js"></script><script src="${COMPANY}dist/select.js"></script><script src="${COMPANY}recipes/controls.js"></script><script src="${COMPANY}extensions/runtime.js"></script><script>${componentScripts}
document.querySelectorAll('[data-frame]').forEach(select=>select.addEventListener('change',()=>{document.getElementById(select.dataset.frame).src=select.value;}));
</script></body></html>\n`;
if (icons.length !== 13 || seq !== 68 || (componentBody.match(/data-review-number=/g) || []).length !== 37) throw new Error('Unexpected showcase inventory');
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
const output = path.join(ROOT, 'company-additions.html');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || read('company-additions.html') !== html) throw new Error('Stale company-additions.html');
} else fs.writeFileSync(output, html);
console.log(`PASS numbered showcase: ${icons.length} icons, 37 component variants, ${recipes.length} recipe groups, ${seq} consecutive numbers`);
