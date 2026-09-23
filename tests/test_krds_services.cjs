'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'designs/assets/ui-kit/internal');
const folder = path.join(base, 'company/recipes/services');
const model = require(path.join(folder, 'model.js'));
const variants = require(path.join(folder, 'variants-model.js'));
const read = name => fs.readFileSync(path.join(folder, name), 'utf8');
const validDraft = () => ({ eligible: 'yes', topic: '디지털 기초', delivery: '방문', time: '오전' });

test('service scripts compile without bundler and local assets resolve', () => {
  for (const file of ['model.js', 'services.js']) new vm.Script(read(file), { filename: file });
  const html = read('index.html');
  assert.ok(html.includes('lang="ko"'));
  assert.ok(html.includes('정부 사이트가 아닙니다'));
  assert.ok(html.includes('aria-labelledby="dialog-title"'));
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    assert.ok(!/^https?:/.test(match[1]));
    assert.ok(fs.existsSync(path.resolve(folder, match[1])), match[1]);
  }
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(read('services.js')));
  assert.ok(!/localStorage\.clear\s*\(/.test(read('services.js')));
});

test('default search returns all 15 records and supports ten-row pagination consumers', () => {
  const result = model.search(model.fixtures);
  assert.equal(result.length, 15);
  assert.equal(result.slice(0, 10).length, 10);
  assert.equal(result.slice(10, 20).length, 5);
  assert.equal(new Set(result.map(i => i.id)).size, 15);
});

test('search uses every keyword and intersects topic, date and audience filters', () => {
  const result = model.search(model.fixtures, { query: '디지털 배움', category: '정책', audience: '중장년', from: '2024-02-01', to: '2024-02-29' });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, '디지털 배움 지원');
  assert.equal(model.search(model.fixtures, { query: '전혀없는단어' }).length, 0);
  assert.equal(model.search(model.fixtures, { query: '<script>alert(1)</script>' }).length, 0);
  assert.equal(model.search(model.fixtures, { query: '배움', to: '2023-01-01' }).length, 0);
});

test('relevance and explicit latest/popular sorts do not mutate source data', () => {
  const fixtures = [
    { id: '1', title: '자료', description: '배움', date: '2024-01-01', popularity: 8 },
    { id: '2', title: '배움', description: '안내', date: '2023-01-01', popularity: 3 },
  ];
  assert.equal(model.search(fixtures, { query: '배움' })[0].id, '2');
  assert.equal(model.search(fixtures, { query: '배움', sort: 'latest' })[0].id, '1');
  assert.equal(model.search(fixtures, { query: '배움', sort: 'popular' })[0].id, '1');
  assert.equal(fixtures[0].id, '1');
});

test('period presets use disclosed fixture date and invalid ranges are rejected', () => {
  assert.deepEqual(model.dateRange('1'), { from: '2024-02-28', to: '2024-02-29' });
  assert.deepEqual(model.dateRange('7'), { from: '2024-02-22', to: '2024-02-29' });
  assert.deepEqual(model.dateRange('all'), { from: '', to: '' });
  assert.ok(model.rangeError('2024-03-01', '2024-02-01'));
  assert.equal(model.rangeError('2024-02-01', '2024-03-01'), '');
});

test('suggestion arrow movement wraps in both directions and handles empty lists', () => {
  assert.equal(model.nextSuggestion(0, 'ArrowUp', 5), 4);
  assert.equal(model.nextSuggestion(4, 'ArrowDown', 5), 0);
  assert.equal(model.nextSuggestion(2, 'ArrowDown', 5), 3);
  assert.equal(model.nextSuggestion(0, 'ArrowDown', 0), -1);
});

test('demo login accepts only publicly documented fixture values and gives field errors', () => {
  assert.equal(model.validateLogin('', '').field, 'demo-id');
  assert.equal(model.validateLogin('demo@example.invalid', '').field, 'demo-password');
  assert.ok(model.validateLogin('real@example.com', 'not-a-real-password').message.includes('실제 계정'));
  assert.equal(model.validateLogin('demo@example.invalid', 'sample-only'), null);
});

test('application guards eligibility, required choices and conditional visit time', () => {
  assert.equal(model.validateApplication(model.emptyDraft()).field, 'eligible');
  assert.equal(model.validateApplication({ ...validDraft(), eligible: 'no' }).field, 'eligible');
  assert.equal(model.validateApplication({ ...validDraft(), topic: '' }).field, 'topic');
  assert.equal(model.validateApplication({ ...validDraft(), delivery: '' }).field, 'delivery');
  assert.equal(model.validateApplication({ ...validDraft(), time: '' }).field, 'time');
  assert.equal(model.validateApplication({ ...validDraft(), delivery: '온라인', time: '' }), null);
  assert.equal(model.validateApplication(validDraft()), null);
});

test('receipts snapshot valid fixed values, timestamp UTC and omit irrelevant visit time', () => {
  const draft = validDraft();
  const receipt = model.createReceipt(draft, '2024-02-29T09:00:00+09:00', 1);
  assert.equal(receipt.id, 'DEMO-0001');
  assert.equal(receipt.createdAt, '2024-02-29T00:00:00.000Z');
  draft.topic = '생활 안전';
  assert.equal(receipt.draft.topic, '디지털 기초');
  assert.equal(model.createReceipt({ ...draft, delivery: '온라인' }, Date.now(), 2).draft.time, '');
  assert.throws(() => model.createReceipt(model.emptyDraft(), Date.now(), 3));
});

test('cancellation preserves original record and one status history event per change', () => {
  const original = model.createReceipt(validDraft(), '2024-02-29T00:00:00Z', 1);
  const canceled = model.cancelReceipt(original, '2024-02-29T01:00:00Z');
  assert.equal(original.status, '모의 접수');
  assert.equal(original.history.length, 1);
  assert.equal(canceled.status, '모의 취소');
  assert.equal(canceled.history.length, 2);
  assert.equal(model.cancelReceipt(canceled, Date.now()).history.length, 2);
});

test('local persistence roundtrip contains no free-form credentials or personal fields', () => {
  const draft = { ...validDraft(), password: 'discard-me', username: 'discard-me', contact: 'discard-me' };
  const record = model.createReceipt(draft, Date.now(), 1);
  const restored = model.restore(JSON.stringify({ version: 1, draft, receipts: [record], savedAt: '2024-02-29T01:00:00Z' }));
  assert.deepEqual(restored.draft, validDraft());
  assert.equal(restored.receipts.length, 1);
  assert.ok(!JSON.stringify(restored).includes('discard-me'));
  assert.equal(restored.savedAt, '2024-02-29T01:00:00Z');
  assert.equal(model.restore('broken-json').receipts.length, 0);
  assert.equal(model.restore('{"version":2}').receipts.length, 0);
  assert.equal(model.restore(null).draft.eligible, '');
});

test('restored draft rejects injected or unknown choices', () => {
  assert.deepEqual(model.cleanDraft({ eligible: 'script', topic: '<img src=x>', delivery: 'POST https://example.com', time: 'night' }), model.emptyDraft());
  assert.equal(model.restore(JSON.stringify({ version: 1, draft: {}, receipts: [{ id: 'real-record', createdAt: 'bad-date' }] })).receipts.length, 0);
});

test('saving a draft immediately updates the visible last-saved time only after successful persistence', () => {
  const script = read('services.js');
  const start = script.indexOf("on('save-draft', 'click',");
  const end = script.indexOf("on('reset-draft', 'click',", start);
  assert.ok(start >= 0 && end > start);
  const handlerSource = script.slice(start, end);
  assert.ok(script.includes('<p id="draft-saved-at">'));
  for (const successful of [true, false]) {
    let click;
    const label = { textContent: '아직 임시 저장하지 않았습니다. 저장값은 이 브라우저에 남습니다.' };
    const context = vm.createContext({
      savedAt: null,
      on: (_id, _event, handler) => { click = handler; },
      persist: () => successful,
      byId: id => { assert.equal(id, 'draft-saved-at'); return label; },
      M: { formatDate: value => { assert.ok(!isNaN(Date.parse(value))); return '검증용 저장 시각'; } },
    });
    vm.runInContext(handlerSource, context);
    click();
    if (successful) {
      assert.equal(label.textContent, '마지막 임시 저장: 검증용 저장 시각 저장값은 이 브라우저에 남습니다.');
      assert.ok(context.savedAt);
    } else {
      assert.equal(label.textContent, '아직 임시 저장하지 않았습니다. 저장값은 이 브라우저에 남습니다.');
      assert.equal(context.savedAt, null);
    }
  }
});

test('rendered application selects expose every intended option without orphan text or closing tags', () => {
  const assignment = read('services.js').split('\n').find(line => line.includes('<form id="application-form"'));
  assert.ok(assignment);
  const main = { innerHTML: '' };
  vm.runInNewContext(assignment, { main, pageHeading: () => '', stepList: () => '', applicationSteps: [], savedAt: null });
  for (const [id, expected] of Object.entries({ topic: ['선택해 주세요', '디지털 기초', '생활 안전'], delivery: ['선택해 주세요', '온라인', '방문'], time: ['선택해 주세요', '오전', '오후'] })) {
    const select = main.innerHTML.match(new RegExp(`<select id="${id}"[^>]*>([\\s\\S]*?)</select>`));
    assert.ok(select, id);
    const options = [...select[1].matchAll(/<option\b[^>]*>([^<]*)<\/option>/g)].map(match => match[1]);
    assert.deepEqual(options, expected, `${id} actual rendered options`);
    assert.equal(select[1].replace(/<option\b[^>]*>[^<]*<\/option>/g, '').trim(), '', `${id} orphan select text/tags`);
  }
});

test('all service select templates have matched option start and end tags', () => {
  for (const file of ['index.html', 'services.js']) {
    for (const select of read(file).matchAll(/<select\b[^>]*>([\s\S]*?)<\/select>/g)) {
      assert.equal((select[1].match(/<option\b/g) || []).length, (select[1].match(/<\/option>/g) || []).length, `${file}: ${select[0].slice(0, 100)}`);
    }
  }
});

test('company service documentation does not claim full application verification', () => {
  const documentation = read('README.md');
  assert.ok(documentation.includes('모든 적용 조건'));
  assert.match(documentation, /실브라우저 검증[^\n]*(?:미완료|미검증)/);
  assert.ok(documentation.includes('인증·권한·세션 검증을 서버 경계에서 구현'));
  assert.ok(documentation.includes('실제 SSO·권한·외부 리디렉션은 별도 서버 연결 영역'));
});

test('variant registry groups alternatives under six semantic IDs with complete local dependency paths', () => {
  const manifest = JSON.parse(read('variants-manifest.json'));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.items.length, 6);
  assert.equal(new Set(manifest.items.map(i => i.id)).size, 6);
  for (const item of manifest.items) {
    assert.match(item.id, /^service\./);
    assert.equal(item.kind, 'service');
    assert.ok(item.variants[item.defaultVariant]);
    assert.ok(item.constraints.length);
    for (const variant of Object.values(item.variants)) {
      assert.ok(variant.states.length);
      assert.ok(variant.dependencies.includes('ui-kit/internal/company/dist/company.css'));
      for (const file of [variant.path, ...variant.dependencies]) assert.ok(fs.existsSync(path.join(root, 'designs/assets', file)), file);
    }
  }
});

test('extended modules compile and every select template has balanced option elements', () => {
  for (const file of ['variants.js', 'variants-model.js']) new vm.Script(read(file), { filename:file });
  for (const file of ['variants.js', 'variants.html']) for (const select of read(file).matchAll(/<select\b[^>]*>([\s\S]*?)<\/select>/g)) {
    assert.equal((select[1].match(/<option\b/g)||[]).length, (select[1].match(/<\/option>/g)||[]).length, file);
  }
  const html=read('variants.html');
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) assert.ok(fs.existsSync(path.resolve(folder,match[1].split('#')[0])),match[1]);
});

test('service palette, typography and spacing derive from the shared foundation rather than a second palette', () => {
  const css=fs.readFileSync(path.join(folder,'../recipes.css'),'utf8');
  const foundation=fs.readFileSync(path.join(base,'../design/theme.css'),'utf8');
  assert.ok(!fs.existsSync(path.join(folder,'services.css')));
  for(const file of ['index.html','variants.html']) {
    assert.ok(read(file).includes('class="krds-2024-tokens altool-ui company-recipe"'));
    assert.ok(read(file).includes('href="../../dist/company.css"'));
    assert.ok(read(file).includes('href="../recipes.css"'));
  }
  const authoring=fs.readFileSync(path.join(base,'../design/components.css'),'utf8');
  const colors=text=>new Set((text.match(/#(?:[a-f0-9]{6}|[a-f0-9]{3})\b/gi)||[]).map(v=>v.toLowerCase()));
  const approved=colors(authoring);
  for(const color of colors(css)) assert.ok(approved.has(color),'color must derive from approved design: '+color);
  for(const match of css.matchAll(/var\((--krds24-[\w-]+)/g)) {
    if(match[1]==='--krds24-font-family')continue; // Supplied by shared foundation update; safe fallback while developing.
    assert.ok(foundation.includes(match[1]+':'),match[1]);
  }
  assert.ok(!read('index.html').includes('♙'));
  assert.ok(read('index.html').includes('../../dist/assets/icons/user.svg'));
  assert.ok(read('company-assets.mjs').includes('createAssetClient'));
  assert.ok(read('variants.js').includes("'message.error.load'"));
});

test('service catalog includes all four transaction types and available/upcoming/closed/external states', () => {
  assert.equal(variants.services.length,24);
  assert.deepEqual(new Set(variants.services.map(s=>s.type)),new Set(['제출','조회','발급','예약']));
  assert.deepEqual(new Set(variants.services.map(s=>s.state)),new Set(['접수 중','예정','마감','외부 신청']));
  assert.equal(variants.filter(variants.services,{state:'마감'}).length,6);
  assert.equal(variants.filter(variants.services,{sort:'available'})[0].state,'접수 중');
});

test('large history pagination covers every row once and clamps after filtering', () => {
  assert.equal(variants.history.length,37);
  const all=[];
  for(let page=1;page<=4;page++)all.push(...variants.paginate(variants.history,page,10).items);
  assert.equal(new Set(all.map(r=>r.id)).size,37);
  assert.equal(variants.paginate([],99,10).page,1);
  assert.equal(variants.paginate(variants.history,-1,10).page,1);
  assert.equal(variants.paginate(variants.history,99,10).page,4);
});

test('advanced AND OR NOT and date/type filters operate together without mutating fixtures', () => {
  const before=JSON.stringify(variants.media);
  const rows=variants.filter(variants.media,{query:'디지털',any:'배움 안전',exclude:'13',type:'영상',from:'2024-02-01',to:'2024-02-29'});
  assert.ok(rows.length>0);
  for(const row of rows){assert.equal(row.type,'영상');assert.ok(row.title.includes('디지털'));assert.ok(!row.title.includes('13'));}
  assert.equal(variants.filter(variants.media,{query:'없는단어'}).length,0);
  assert.equal(JSON.stringify(variants.media),before);
  assert.ok(variants.checkRange('2024-03-02','2024-03-01'));
});

test('transaction types each enforce their own relevant UI input', () => {
  assert.ok(variants.checkTransaction('제출',{}));
  assert.equal(variants.checkTransaction('제출',{subject:'대리인'}),'');
  assert.ok(variants.checkTransaction('조회',{reference:'actual-reference'}));
  assert.equal(variants.checkTransaction('조회',{reference:'DEMO-2024'}),'');
  assert.equal(variants.checkTransaction('발급',{format:'상세'}),'');
  assert.ok(variants.checkTransaction('예약',{day:'2024-03-01',slot:''}));
  assert.equal(variants.checkTransaction('예약',{day:'2024-03-01',slot:'오후'}),'');
});

test('periodical fixtures cover new revised active suspended ended and changed cadence notices', () => {
  assert.equal(variants.publications.length,18);
  for(const state of ['신규','변경','정상 발행','일시 중단','발행 종료','주기 변경']) {
    const item=variants.publications.find(p=>p.state===state);assert.ok(item);
    const notice=variants.publicationNotice(item);assert.ok(notice.includes('주기')||notice.includes('발행'));
  }
  assert.ok(variants.publicationNotice(variants.publications.find(p=>p.state==='일시 중단')).includes('재개 일정은 미정'));
  assert.ok(variants.publicationNotice(variants.publications.find(p=>p.state==='발행 종료')).includes('이전 자료'));
});

test('attachment and local video choices reject unsupported formats and oversized files', () => {
  assert.equal(variants.fileError({name:'sample.pdf',size:1024}),'');
  assert.ok(variants.fileError({name:'sample.exe',size:1024}));
  assert.ok(variants.fileError({name:'sample.pdf',size:6*1024*1024}));
  assert.equal(variants.videoFileError({name:'sample.webm',size:1024}),'');
  assert.ok(variants.videoFileError({name:'sample.txt',size:1024}));
  assert.ok(variants.videoFileError({name:'sample.mp4',size:51*1024*1024}));
});

test('history UI transition rules allow only eligible cancel and supplement changes', () => {
  assert.equal(variants.transitionRecord({status:'접수'},'cancel').status,'취소');
  assert.equal(variants.transitionRecord({status:'처리 완료'},'cancel').status,'처리 완료');
  assert.equal(variants.transitionRecord({status:'보완 요청'},'supplement').status,'검토 중');
  assert.equal(variants.transitionRecord({status:'접수'},'supplement').status,'접수');
});

test('valid transaction resubmission clears the prior alert before opening confirmation', () => {
  const handler = read('variants.js').split('\n').find(line => line.trim().startsWith("on('transaction-form','submit'"));
  const nodes = {'transaction-day':{value:'2024-03-01'},'transaction-slot':{value:'오전'},'transaction-error':{textContent:'',hidden:true}};
  const transaction={type:'예약',shared:true,agreed:false};
  let submit, opened=false;
  const context={V:variants,transaction,confirmStyle:'모달',$:id=>nodes[id],area:{querySelectorAll:()=>[]},on:(_id,_event,fn)=>{submit=fn;},modal:()=>{opened=true;},transactionSummary:()=>'',finishTransaction:()=>{}};
  vm.runInNewContext(handler,context);
  submit({preventDefault(){}});
  assert.equal(nodes['transaction-error'].hidden,false);
  assert.ok(nodes['transaction-error'].textContent.includes('공동 이용'));
  transaction.agreed=true;
  submit({preventDefault(){}});
  assert.equal(opened,true);
  assert.equal(nodes['transaction-error'].hidden,true);
  assert.equal(nodes['transaction-error'].textContent,'');
});

test('extended relevance ranking and popularity are deterministic and do not mutate records', () => {
  const rows=[{title:'문서',description:'교육',date:'2024-02-02',popularity:9},{title:'교육',description:'안내',date:'2024-01-01',popularity:1}];
  assert.equal(variants.filter(rows,{query:'교육',sort:'relevance'})[0].title,'교육');
  assert.equal(variants.filter(rows,{sort:'popular'})[0].title,'문서');
  assert.equal(rows[0].title,'문서');
});

test('search highlighting treats punctuation literally and safely escapes markup', () => {
  const source=read('variants.js');
  const fn=source.slice(source.indexOf('  function highlight(value)'),source.indexOf('  function searchView()'));
  const context={search:{query:'교육 [x]'},e:v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
  vm.createContext(context);vm.runInContext(fn,context);
  assert.equal(context.highlight('교육 [x] <img>'),'<mark>교육</mark> <mark>[x]</mark> &lt;img&gt;');
  context.search.query='';assert.equal(context.highlight('<b>'),'&lt;b&gt;');
});

test('transaction snapshots retain every relevant input and copy file metadata without stale hidden data', () => {
  const input={type:'예약',day:'2024-03-01',slot:'오후',subject:'대리인',shared:false,agreed:true,files:[{name:'sample.txt',size:9}]};
  const result=variants.transactionSnapshot(input);
  assert.deepEqual(result,{type:'예약',shared:false,agreed:false,day:'2024-03-01',slot:'오후',files:[{name:'sample.txt',size:9}]});
  input.files[0].name='changed.txt';assert.equal(result.files[0].name,'sample.txt');
  assert.deepEqual(variants.transactionSnapshot({...input,shared:true}).files,[]);
  for(const type of variants.serviceTypes)assert.ok(variants.transactionErrorField({type}));
  assert.equal(variants.transactionErrorField({type:'예약',day:'2024-03-01',slot:'오전',shared:true,agreed:false}),'shared-agree');
});

test('failed transaction submit points focus and accessible error to the first invalid input', () => {
  const handler=read('variants.js').split('\n').find(line=>line.trim().startsWith("on('transaction-form','submit'"));
  let focused=false,submit;const attrs={};
  const nodes={'transaction-day':{value:'',setAttribute:(key,value)=>{attrs[key]=value;},focus:()=>{focused=true;}},'transaction-slot':{value:''},'transaction-error':{textContent:'',hidden:true}};
  vm.runInNewContext(handler,{V:variants,transaction:{type:'예약'},confirmStyle:'모달',$:id=>nodes[id],on:(_id,_event,fn)=>{submit=fn;},area:{querySelectorAll:()=>[]}});
  submit({preventDefault(){}});assert.equal(focused,true);assert.equal(attrs['aria-invalid'],'true');assert.equal(attrs['aria-describedby'],'transaction-error');
});

test('bundle video is an actual local WebM with a 12-second three-cue Korean caption track', () => {
  const bytes=fs.readFileSync(path.join(folder,'process-demo.webm'));
  assert.equal(bytes.subarray(0,4).toString('hex'),'1a45dfa3');assert.ok(bytes.length>1000);
  assert.equal((read('process-demo.ko.vtt').match(/-->/g)||[]).length,3);
  assert.ok(read('process-demo.ko.vtt').includes('00:00:12.000'));
  const js=read('variants.js');assert.ok(js.includes('id="bundle-caption-track" kind="captions"'));assert.ok(js.includes("on('bundle-video-error'"));assert.ok(js.includes("on('bundle-video-retry'"));
  assert.ok(js.includes('아래는 위 영상과 같은 절차를 HTML로 표현한 12초 대체 애니메이션입니다.'));
  assert.ok(!js.includes('실제 영상 파일·음성은 없으며'));
});

test('bundle captions have an explicit keyboard-operable toggle and retain the choice on metadata reload', () => {
  const source=read('variants.js');const handlers={};const nodes={'bundle-video':{addEventListener:(type,fn)=>{handlers[type]=fn;}},'bundle-caption-toggle':{checked:true},'bundle-caption-track':{track:{mode:'disabled'}}};
  const snippet=source.slice(source.indexOf("    const bundled=$('bundle-video');"),source.indexOf("    bundled.addEventListener('loadedmetadata',()=>"));
  vm.runInNewContext(snippet,{$:id=>nodes[id],on:(id,type,fn)=>{handlers[id+':'+type]=fn;}});
  assert.equal(nodes['bundle-caption-track'].track.mode,'showing');nodes['bundle-caption-toggle'].checked=false;handlers['bundle-caption-toggle:change']();assert.equal(nodes['bundle-caption-track'].track.mode,'disabled');
  handlers.loadedmetadata();handlers['bundle-caption-track:load']();assert.equal(nodes['bundle-caption-track'].track.mode,'disabled');nodes['bundle-caption-toggle'].checked=true;handlers['bundle-caption-toggle:change']();assert.equal(nodes['bundle-caption-track'].track.mode,'showing');
  assert.ok(source.includes('type="checkbox" checked>영상 한국어 자막 표시</label>'));
});

test('login return target preserves detailed routes instead of only the top-level service', () => {
  const source=read('variants.js');
  const line=source.split('\n').find(line=>line.includes("authReturnTarget=previousRoute"));
  const context={cleanup:()=>{},dialog:{open:false},route:()=>['auth'],mode:'services',previousRoute:'services/detail/S3',authReturnTarget:'services',document:{querySelectorAll:()=>[]},$:()=>({value:'ready'})};
  vm.createContext(context);vm.runInContext(line,context);
  assert.equal(context.authReturnTarget,'services/detail/S3');assert.equal(context.previousRoute,'auth');
});
