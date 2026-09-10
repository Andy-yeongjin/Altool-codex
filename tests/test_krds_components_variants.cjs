const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const base = path.resolve(__dirname, '../designs/assets');
const components = path.join(base, 'ui-kit/internal/components');
const api = require(path.join(components, 'runtime.js'));

test('pagination windows keep first, last, current and at most nine controls', () => {
  for(const total of [1,2,5,10,99,500]) for(let page=1;page<=total;page++) {
    const result=api.pageWindow(page,total);
    assert.equal(result[0],1);assert.equal(result.at(-1),total);assert.ok(result.includes(page));assert.ok(result.length<=9);
    assert.equal(new Set(result.filter(n=>n!=='gap')).size,result.filter(n=>n!=='gap').length);
  }
  assert.deepEqual(api.pageWindow(1,0),[]);
});
test('date parts reject invalid calendar values and preserve leap dates', () => {
  assert.equal(api.dateParts('2024','2','29'),'2024-02-29');
  assert.equal(api.dateParts('2023','2','29'),null);
  assert.equal(api.dateParts('1900','2','29'),null);
  assert.equal(api.dateParts('2000','2','29'),'2000-02-29');
  for(const args of [['2024','13','1'],['2024','0','1'],['2024','4','31'],['1','1','1'],['2024','1','1.2'],['','','']]) assert.equal(api.dateParts(...args),null);
});
test('checkbox tri-state excludes disabled items from bulk choice', () => {
  assert.deepEqual(api.selectionState([{checked:true},{checked:false},{checked:false,disabled:true}]),{checked:false,indeterminate:true,count:1,total:2});
  assert.equal(api.selectionState([{checked:true},{checked:true}]).checked,true);
  assert.equal(api.selectionState([]).checked,false);
  assert.equal(api.selectionState([{checked:true,disabled:true}]).total,0);
});
test('file checks use host limits and do not mutate file input data', () => {
  const files=[{name:'안내.PDF',type:'application/pdf',size:128},{name:'notes.txt',type:'text/plain',size:256}];
  const before=JSON.stringify(files);
  assert.deepEqual(api.fileErrors(files,{accept:'.pdf,.txt',maxFiles:2,maxBytes:256}),[]);
  assert.equal(api.fileErrors(files,{maxFiles:1}).length,1);
  assert.equal(api.fileErrors(files,{maxBytes:200}).length,1);
  assert.equal(api.fileErrors(files,{accept:'image/*'}).length,2);
  assert.equal(api.fileErrors(files,{accept:'application/pdf,text/plain'}).length,0);
  assert.equal(JSON.stringify(files),before);
});
test('all 37 component families have resolvable defaults and unique semantic IDs', () => {
  const manifest=JSON.parse(fs.readFileSync(path.join(components,'variants-manifest.json')));
  assert.equal(manifest.items.length,37);
  assert.equal(new Set(manifest.items.map(i=>i.id)).size,37);
  for(const item of manifest.items){
    assert.ok(item.id.startsWith('component.'));assert.ok(item.variants[item.defaultVariant]);assert.ok(item.constraints.length);
    for(const variant of Object.values(item.variants)){
      for(const file of [variant.path,variant.preview,...variant.dependencies]){
        assert.ok(file.startsWith('ui-kit/internal/')||file==='messages/ko.json');assert.ok(fs.statSync(path.join(base,file)).isFile(),file);
      }
      assert.ok(variant.sourcePages.length);assert.ok(variant.states.length);
      assert.notEqual(variant.verification,'complete');
    }
  }
  for(const id of ['component.masthead','component.identifier']) assert.deepEqual(manifest.items.find(i=>i.id===id).restrictedTo,['government']);
  assert.equal(manifest.items.find(i=>i.id==='component.file-upload').defaultVariant,'single');
  for(const id of ['component.header','component.footer']) {
    const item=manifest.items.find(i=>i.id===id);
    for(const variant of Object.values(item.variants)) {
      assert.equal(variant.kind,'authored-reusable-ui');
      assert.doesNotMatch(variant.path,/upstream/);
      const fragment=fs.readFileSync(path.join(base,variant.path),'utf8');
      assert.doesNotMatch(fragment,/대한민국정부|logo_\w+\.svg|ico_flag/);
    }
  }
  assert.equal(manifest.items.find(i=>i.id==='component.image').defaultVariant,'informational');
});
test('generated reusable fragments are not replaced with documentation paths', () => {
  const manifest=JSON.parse(fs.readFileSync(path.join(components,'variants-manifest.json')));
  const authored=manifest.items.flatMap(i=>Object.values(i.variants)).filter(v=>v.kind==='authored-reusable-ui');
  assert.equal(authored.length,46);
  for(const variant of authored){assert.match(variant.path,/\/fragments\/.*\.html$/);assert.match(variant.preview,/\/examples\/.*\.html$/);}
  cp.execFileSync(process.execPath,[path.join(components,'build-variants.cjs'),'--check'],{stdio:'pipe'});
});
test('mobile pagination remains bounded independently of desktop with fixed source page sizes', () => {
  for(let total=1;total<110;total++) for(let page=1;page<=total;page++) {
    const result=api.pageWindow(page,total,true);
    assert.ok(result.length<=7); assert.ok(result.includes(page));
    assert.equal(result[0],1); assert.equal(result.at(-1),total);
  }
});
test('empty files use the exact canonical error and never mutate the original', () => {
  const messages=JSON.parse(fs.readFileSync(path.join(base,'messages/ko.json'))).messages;
  const file={name:'empty.txt',type:'text/plain',size:0};
  const result=api.fileErrors([file],{accept:'.txt',maxBytes:100});
  assert.equal(result.length,1);
  assert.ok(result[0].includes(messages['file.empty'].title));
  assert.ok(result[0].includes(messages['file.empty'].body));
  assert.equal(file.size,0);
});
test('progress track meets both independent 3:1 adjacent color contrasts', () => {
  const css=fs.readFileSync(path.join(base,'ui-kit/internal/foundations/tokens-2024.css'),'utf8');
  const color=name=>css.match(new RegExp('--krds24-'+name+': (#[a-fA-F0-9]{6})'))[1];
  const lum=value=>{const c=value.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  assert.ok(contrast('#FFFFFF',color('gray-50'))>=3);
  assert.ok(contrast(color('gray-50'),color('primary-80'))>=3);
  const runtime=fs.readFileSync(path.join(components,'runtime.css'),'utf8');
  assert.match(runtime,/ui-progress-track[^}]+gray-50/); assert.match(runtime,/ui-progress-fill[^}]+primary-80/);
});
test('long modal body and overflow table have explicit persistent/action structures', () => {
  const modal=fs.readFileSync(path.join(components,'fragments/modal-scrollable.html'),'utf8');
  assert.match(modal,/class="ui-modal-body" tabindex="0" role="region"/);
  assert.match(modal,/<\/div><div class="ui-controls"><button/);
  const css=fs.readFileSync(path.join(components,'runtime.css'),'utf8');
  assert.match(css,/ui-modal-body[^}]+overflow:auto/);
  assert.match(css,/dialog > \.ui-controls[^}]+flex:none/);
  const table=fs.readFileSync(path.join(components,'fragments/table-sort.html'),'utf8');
  assert.match(table,/<th scope="col" aria-sort="ascending">/);
  assert.ok(table.indexOf('기획팀')<table.indexOf('운영팀'));
  for(const direction of ['previous','next']) assert.ok(table.includes(`data-table-scroll="${direction}"`));
});
test('all reviewed pages preserve real source observations and reviewer attribution', () => {
  const ledger=JSON.parse(fs.readFileSync(path.join(components,'visual-review-ledger.json')));
  assert.equal(ledger.pages.length,439); assert.equal(new Set(ledger.pages.map(p=>p.page)).size,439);
  assert.equal(ledger.summary.visuallyReviewed,439); assert.equal(ledger.summary.pending,0);
  for(const page of ledger.pages) {
    assert.equal(page.visualReviewed,true); assert.ok(page.observation.trim().length>0);
    assert.match(page.render.sha256,/^[a-f0-9]{64}$/); assert.equal(page.render.dpi,200);
    assert.equal(page.render.width,1654); assert.equal(page.render.height,2339);
    assert.equal(page.reviewer,page.page<=365?'krds_component_audit':'krds_patterns');
    assert.equal(page.status,'visual-review-recorded');
  }
  assert.match(ledger.meaning,/not browser\/compliance passed/);
});
test('optional image optimization is local, preserves original, and declares blob preview policy', () => {
  const runtime=fs.readFileSync(path.join(components,'runtime.js'),'utf8');
  assert.match(runtime,/createImageBitmap\(original\)/); assert.match(runtime,/blob\.size >= original\.size/);
  assert.match(runtime,/revokeObjectURL/); assert.match(runtime,/version !== revision/);
  const html=fs.readFileSync(path.join(components,'examples/file-image-optimize.html'),'utf8');
  assert.ok(html.includes("img-src 'self' blob:")); assert.ok(html.includes("connect-src 'none'"));
  assert.ok(html.includes('원본은 변경하거나 전송하지 않습니다'));
});
test('upstream motion and navigation fixes remain separate declared dependencies', () => {
  const manifest=JSON.parse(fs.readFileSync(path.join(components,'variants-manifest.json')));
  for(const id of ['component.carousel','component.main-menu']) {
    for(const variant of Object.values(manifest.items.find(i=>i.id===id).variants).filter(v=>v.kind==='upstream-markup')) {
      assert.ok(variant.dependencies.includes('ui-kit/internal/components/upstream-compat.js'));
      const html=fs.readFileSync(path.join(base,variant.preview),'utf8');
      assert.ok(html.indexOf('ui-script.js')<html.indexOf('../upstream-compat.js'));
    }
  }
});
test('runtime has no network persistence or automatic submission', () => {
  const source=fs.readFileSync(path.join(components,'runtime.js'),'utf8');
  assert.doesNotMatch(source,/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon)\b/);
  assert.match(source,/event\.preventDefault\(\)/);
  assert.match(source,/altool:change/);
  assert.match(source,/\.textContent =/);
  assert.doesNotMatch(source,/\.innerHTML\s*=/);
});
test('controlled transfer states clamp progress and never fabricate upload completion', () => {
  assert.equal(api.transferState({state:'uploading',progress:150}).progress,100);
  assert.equal(api.transferState({state:'uploading',progress:-1}).progress,0);
  assert.equal(api.transferState({state:'complete',progress:20}).progress,100);
  assert.equal(api.transferState({state:'unknown'}).state,'ready');
  assert.equal(api.transferState({state:'error',reason:'파일 연결이 종료되었습니다.'}).reason,'파일 연결이 종료되었습니다.');
  assert.equal(api.transferState({state:'error',error:'임의 기본 문구'}).error,JSON.parse(fs.readFileSync(path.join(base,'messages/ko.json'))).messages['error.upload'].body);
  assert.equal(api.transferState({state:'ready',error:'접속 실패'}).error,'');
});
test('component generic messages derive from canonical source with hash and dependency tracking', () => {
  const crypto=require('node:crypto');
  const raw=fs.readFileSync(path.join(base,'messages/ko.json'));
  const canonical=JSON.parse(raw);
  const selected=require(path.join(components,'messages.js'));
  const manifest=JSON.parse(fs.readFileSync(path.join(components,'variants-manifest.json')));
  assert.equal(selected.source.sha256,crypto.createHash('sha256').update(raw).digest('hex'));
  assert.deepEqual(selected.source,manifest.messageSource);
  for(const [key,value] of Object.entries(selected.messages)) assert.deepEqual(value,canonical.messages[key]);
  assert.equal(api.transferState({state:'error'}).error,canonical.messages['error.upload'].body);
  assert.equal(api.transferState({state:'error'}).reason,'');
  for(const variant of manifest.items.flatMap(i=>Object.values(i.variants)).filter(v=>v.kind==='authored-reusable-ui')) {
    assert.ok(variant.dependencies.includes('messages/ko.json'));
    assert.ok(variant.dependencies.includes('ui-kit/internal/components/messages.js'));
    const preview=fs.readFileSync(path.join(base,variant.preview),'utf8');
    assert.ok(preview.indexOf('../messages.js')<preview.indexOf('../runtime.js'));
  }
  const errors=api.fileErrors([{name:'file.exe',size:200,type:'application/octet-stream'}],{maxFiles:0,maxBytes:100,accept:'.pdf'}).join(' ');
  for(const key of ['file.count','file.size','file.type']) assert.ok(errors.includes(canonical.messages[key].body));
});
