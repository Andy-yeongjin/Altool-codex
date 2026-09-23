// Company-only equivalents of the retired government variant contracts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../designs/assets');
const company = path.join(base, 'ui-kit/internal/company');
const {Node, document} = require(path.join(company, 'tests/dom-harness.cjs'));
require(path.join(company, 'dist/business.js'));
require(path.join(company, 'extensions/runtime.js'));
const api = global.CompanyExtensions;
const node = (tag, attr) => { const n=new Node(tag); if(attr)n.setAttribute(attr,''); return n; };
const registry = () => JSON.parse(fs.readFileSync(path.join(base, 'registry.json')));

test('desktop/mobile page windows retain first last current without duplicate page choices', () => {
  for(const mobile of [false,true]) for(const total of [1,2,5,10,99,500]) for(let page=1;page<=total;page++) {
    const result=api.pageWindow(total,page,mobile);
    assert.equal(result[0],1); assert.equal(result.at(-1),total); assert.ok(result.includes(page));
    assert.ok(result.length <= (mobile?7:9));
    const numbers=result.filter(Number.isInteger);assert.equal(new Set(numbers).size,numbers.length);
  }
});
test('date parsing rejects invalid calendar values and preserves leap dates', () => {
  const parse=global.CompanyBusiness.parseDate;
  for(const value of ['2024-02-29','2000-02-29']) assert.ok(parse(value));
  for(const value of ['2023-02-29','1900-02-29','2024-13-01','2024-00-01','2024-04-31','1-01-01','2024-01-1.2','']) assert.equal(parse(value),null);
});
test('split dates retain valid leap values and reject invalid partial or fractional input', () => {
  assert.equal(api.dateParts('2024','2','29'),'2024-02-29');
  assert.equal(api.dateParts('2000','2','29'),'2000-02-29');
  for(const args of [['2023','2','29'],['1900','2','29'],['2024','13','1'],['2024','0','1'],['2024','4','31'],['1','1','1'],['2024','1','1.2'],['','','']]) assert.equal(api.dateParts(...args),null);
});
test('file checks enforce count size MIME extension and empty files without mutating inputs', () => {
  const files=[{name:'안내.PDF',type:'application/pdf',size:128},{name:'notes.txt',type:'text/plain',size:256}];
  const before=JSON.stringify(files);
  assert.deepEqual(api.fileErrors(files,{accept:'.pdf,.txt',maxFiles:2,maxBytes:256}),[]);
  assert.equal(api.fileErrors(files,{maxFiles:1}).length,1);
  assert.equal(api.fileErrors(files,{maxBytes:200}).length,1);
  assert.equal(api.fileErrors(files,{accept:'image/*'}).length,2);
  assert.equal(api.fileErrors(files,{accept:'application/pdf,text/plain'}).length,0);
  assert.equal(JSON.stringify(files),before);
  const error=api.fileErrors([{name:'empty.txt',size:0,type:'text/plain'}],{}).join(' ');
  assert.ok(error.includes(global.CompanyMessages.messages['file.empty'].title));
});
test('checkbox bulk choice ignores disabled options without mutating inputs', () => {
  const input=[{checked:true},{checked:false},{checked:false,disabled:true}]; const before=JSON.stringify(input);
  assert.equal(api.selectionState(input).count,1);assert.equal(api.selectionState(input).indeterminate,true);
  assert.equal(api.selectionState([{checked:true},{checked:true}]).checked,true);
  assert.equal(api.selectionState([]).checked,false);assert.equal(api.selectionState([{checked:true,disabled:true}]).disabled,true);
  assert.equal(JSON.stringify(input),before);
});
test('every adopted component has company-only executable defaults and dependencies', () => {
  const items=registry().items.filter(x=>x.kind==='component');assert.ok(items.length>=37);
  assert.equal(new Set(items.map(x=>x.id)).size,items.length);
  for(const item of items){
    assert.ok(item.variants[item.defaultVariant]);assert.ok(item.constraints.length);
    for(const variant of Object.values(item.variants)){
      assert.match(variant.path,/ui-kit\/internal\/company\//);
      assert.doesNotMatch(variant.path,/\.md$/);
      for(const file of [variant.path,...variant.dependencies]) assert.ok(fs.statSync(path.join(base,'../..',file)).isFile(),file);
      assert.ok(variant.states.length);assert.notEqual(variant.verification,'complete');
    }
  }
  for(const id of ['component.masthead','component.identifier']) assert.ok(!items.find(x=>x.id===id).restrictedTo?.includes('government'));
});
test('retired implementation styles never appear in active registry', () => {
  assert.equal(/ui-kit\/internal\/(upstream|components|foundations|patterns)\//.test(JSON.stringify(registry())),false,'Retired path remains in registry');
  assert.equal(/upstream-markup|legacyOnly/.test(JSON.stringify(registry())),false,'Retired variants remain in registry');
});
test('complementary variants do not erase the ordinary company control',()=>{
  const items=new Map(registry().items.map(item=>[item.id,item]));
  for(const id of ['component.checkbox','component.header','component.textarea','component.file-upload','component.spinner']){
    const item=items.get(id);const variants=Object.values(item.variants);
    assert.ok(variants.some(v=>!v.path.includes('/extensions/')),`${id} lost its ordinary v27 control`);
    assert.ok(variants.some(v=>v.path.includes('/extensions/')),`${id} lost its complementary behavior`);
  }
});
test('company bar uses 3:1 fill/track and 4.5:1 readable numeric text', () => {
  const css=fs.readFileSync(path.join(company,'extensions/styles.css'),'utf8');
  const theme=fs.readFileSync(path.join(base,'ui-kit/design/theme.css'),'utf8');
  const value=name=>{const match=theme.match(new RegExp('--'+name+':\\s*(#[a-fA-F0-9]{6}|var\\(--([\\w-]+)\\))'));assert.ok(match,name);return match[2]?value(match[2]):match[1];};
  const lum=v=>{const c=v.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  assert.match(css,/role="progressbar"[^}]+company-field-readonly-bg/);
  assert.match(css,/data-progress-fill[^}]+company-section-accent/);
  assert.ok(contrast(value('company-section-accent'),value('company-field-readonly-bg'))>=3);
  assert.ok(contrast(value('company-status-text'),'#FFFFFF')>=4.5);
});
test('progress keeps numeric accessibility semantics and clamps only host values', () => {
  const root=node('div'),bar=node('div'),fill=node('span','data-progress-fill'),text=node('span','data-progress-text');bar.setAttribute('role','progressbar');root.append(bar,fill,text);
  const control=api.progress(root,42);assert.equal(bar.getAttribute('aria-valuenow'),'42');assert.equal(text.textContent,'42%');
  assert.equal(bar.getAttribute('aria-valuemin'),'0');assert.equal(bar.getAttribute('aria-valuemax'),'100');
  control.set(150);assert.equal(text.textContent,'100%');control.set(-3);assert.equal(text.textContent,'0%');
});
test('transfer never converts elapsed time or progress into host success', () => {
  assert.equal(api.transferState('uploading',150).progress,100);assert.equal(api.transferState('uploading',150).state,'uploading');
  assert.equal(api.transferState('uploading',-1).progress,0);assert.equal(api.transferState('complete',20).progress,100);
  assert.equal(api.transferState('error').canRetry,true);assert.equal(api.transferState('cancelled').canRetry,true);
  assert.throws(()=>api.transferState('unknown')); // Invalid host protocol is explicit, not fabricated ready.
});
test('component messages derive from the one canonical source', () => {
  const canonical=JSON.parse(fs.readFileSync(path.join(base,'messages/ko.json')));
  assert.deepEqual(global.CompanyMessages,canonical);
  const source=fs.readFileSync(path.join(company,'extensions/runtime.js'),'utf8');
  assert.match(source,/CompanyMessages\.messages\[key\]/);
  assert.match(source,/message\('error.upload'\)/);
});
test('extension UI owns no networking or persistence and inserts safe text', () => {
  const source=fs.readFileSync(path.join(company,'extensions/runtime.js'),'utf8');
  assert.doesNotMatch(source,/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon)\s*\(/);
  assert.doesNotMatch(source,/\.innerHTML\s*=/);assert.match(source,/textContent\s*=/);
  assert.match(source,/event\.preventDefault\(\)/);assert.match(source,/company:/);
});
