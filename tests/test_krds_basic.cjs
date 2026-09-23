'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const core=require('../designs/assets/ui-kit/internal/company/recipes/basic/basic-core.js');
const navigation=require('../designs/assets/ui-kit/internal/company/recipes/basic/basic-navigation.js');
const extended=require('../designs/assets/ui-kit/internal/company/recipes/basic/extended-core.js');
const precision=require('../designs/assets/ui-kit/internal/company/recipes/basic/precision.js');
const root=path.join(__dirname,'../designs/assets/ui-kit/internal/company/recipes/basic');

test('local video captions toggle without a native menu and reset on valid replacement or removal',async()=>{
  const source=fs.readFileSync(path.join(root,'extended.js'),'utf8');const start=source.indexOf("    let mediaURL='';let captionURL='';");const end=source.indexOf("window.addEventListener('pagehide',clearMedia);",start)+"window.addEventListener('pagehide',clearMedia);".length;
  const handlers={};const nodes={};const revoked=[];let sequence=0;
  const get=id=>nodes[id]||(nodes[id]={value:'',files:[],checked:true,disabled:true,hidden:true,track:{mode:'disabled'},pause(){},load(){},focus(){},removeAttribute(key){delete this[key];},setAttribute(key,value){this[key]=value;}});
  get('media-kind').value='video';get('media-alt').value='자체 제작 절차 영상';
  vm.runInNewContext(source.slice(start,end),{$:get,on:(id,type,fn)=>{handlers[id+':'+type]=fn;},text:(id,value)=>{get(id).textContent=value;},window:{addEventListener:(type,fn)=>{handlers[type]=fn;}},URL:{createObjectURL:()=>`blob:demo-${++sequence}`,revokeObjectURL:url=>revoked.push(url)},Blob});
  const selectVideo=()=>{get('media-file').files=[{name:'example.webm',type:'video/webm',size:1024}];handlers['media-file:change']();};
  const selectCaption=async()=>{get('media-captions').files=[{name:'example.vtt',size:100,text:async()=> 'WEBVTT\n\n00:00.000 --> 00:04.000\n절차 확인'}];await handlers['media-captions:change']();};
  selectVideo();assert.equal(get('media-caption-toggle').disabled,true);await selectCaption();assert.equal(get('media-caption-toggle').disabled,false);assert.equal(get('local-track').track.mode,'showing');
  get('media-caption-toggle').checked=false;handlers['media-caption-toggle:change']();assert.equal(get('local-track').track.mode,'disabled');handlers['local-track:load']();assert.equal(get('local-track').track.mode,'disabled');
  get('media-file').files=[{name:'wrong.txt',type:'text/plain',size:10}];handlers['media-file:change']();assert.equal(get('media-caption-toggle').checked,false);assert.equal(get('media-caption-toggle').disabled,false);
  get('media-caption-toggle').checked=true;handlers['media-caption-toggle:change']();assert.equal(get('local-track').track.mode,'showing');selectVideo();assert.equal(get('media-caption-toggle').disabled,true);assert.equal(get('local-track').src,undefined);assert.equal(get('local-track').track.mode,'disabled');
  await selectCaption();get('media-caption-toggle').checked=false;handlers['media-caption-toggle:change']();handlers['media-clear:click']();assert.equal(get('media-caption-toggle').checked,true);assert.equal(get('media-caption-toggle').disabled,true);assert.equal(get('local-track').track.mode,'disabled');assert.ok(revoked.length>=4);
  const html=fs.readFileSync(path.join(root,'content-variants.html'),'utf8');assert.ok(html.includes('type="checkbox" checked disabled>한국어 자막 표시</label>'));assert.ok(!source.includes('플레이어의 자막 메뉴에서 확인하세요'));
});

test('birth validation supports leap dates and preserves invalid input for caller correction',()=>{
  for(const date of ['20000101','2024-02-29','2000.02.29','2024 02 29'])assert.equal(core.validBirth(date),true,date);
  for(const date of ['20230229','20240230','20001301','2024','abcd','2024-2-1'])assert.equal(core.validBirth(date),false,date);
});
test('names are not restricted to Korean or arbitrary minimum lengths',()=>{
  for(const name of ['김','Li','A B-C 2','Élise','محمد','Long name with several components'])assert.deepEqual(core.validIdentity({name,birth:'',phone:''}),{});
  assert.ok(core.validIdentity({name:' ',birth:'',phone:''}).name);
});
test('telephone allows familiar separators but rejects non-number text',()=>{
  for(const number of ['010 1234 5678','02-123-4567','+1 (202) 555-0123','010–1234—5678'])assert.equal(core.validPhone(number),true,number);
  for(const number of ['abc','1','------','010 text 123'])assert.equal(core.validPhone(number),false,number);
});
test('identity fields return specific independent errors without mutating values',()=>{
  const values={name:'',birth:'20240230',phone:'abc'};
  assert.deepEqual(Object.keys(core.validIdentity(values)),['name','birth','phone']);
  assert.deepEqual(values,{name:'',birth:'20240230',phone:'abc'});
});
test('optional consent never prevents continuation',()=>{
  assert.deepEqual(core.consentState('yes','yes'),{all:true,canContinue:true});
  assert.deepEqual(core.consentState('yes','no'),{all:false,canContinue:true});
  assert.deepEqual(core.consentState('yes',''),{all:false,canContinue:true});
  assert.deepEqual(core.consentState('no','yes'),{all:false,canContinue:false});
});
test('long list uses ten records per page and bounded empty state',()=>{
  assert.equal(core.paginate(core.records).items.length,10);
  assert.equal(core.paginate(core.records,2).items.length,10);
  assert.equal(core.paginate(core.records,3).items.length,4);
  assert.equal(core.paginate(core.records,999).page,3);
  assert.deepEqual(core.paginate([],9),{items:[],page:1,pages:1,total:0});
});
test('text, scope, selection, range and relationship filters match actual metadata',()=>{
  assert.equal(core.filterRecords(core.records,{category:'생활'}).length,12);
  assert.equal(core.filterRecords(core.records,{keyword:'가상',scope:'title'}).length,0);
  assert.equal(core.filterRecords(core.records,{keyword:'가상'}).length,24);
  const regional=core.filterRecords(core.records,{region:'남부',district:'나래구'});
  assert.equal(regional.length,8);assert.ok(regional.every(row=>row.region==='남부'&&row.district==='나래구'));
  assert.equal(core.filterRecords(core.records,{region:'남부',district:'가람구'}).length,0);
  const range=core.filterRecords(core.records,{from:'2024-03-01',to:'2024-04-01'});
  assert.equal(range.length,4);assert.ok(range.every(row=>row.date>='2024-03-01'&&row.date<='2024-04-01'));
});
test('query AND, OR, NOT select different sets',()=>{
  assert.equal(core.filterRecords(core.records,{keyword:'생활',extra:'교육',operator:'AND'}).length,0);
  assert.equal(core.filterRecords(core.records,{keyword:'생활',extra:'교육',operator:'OR'}).length,24);
  assert.equal(core.filterRecords(core.records,{keyword:'안내',extra:'교육',operator:'NOT'}).length,12);
  assert.equal(core.filterRecords(core.records,{keyword:'',extra:'교육',operator:'OR'}).length,12);
  assert.equal(core.filterRecords(core.records,{keyword:'',extra:'교육',operator:'AND'}).length,12);
  assert.equal(core.filterRecords(core.records,{keyword:'',extra:'교육',operator:'NOT'}).length,12);
});
test('sorting works without modifying the source catalog',()=>{
  const before=JSON.stringify(core.records);
  const ascending=core.filterRecords(core.records,{sort:'title-asc'});
  const descending=core.filterRecords(core.records,{sort:'title-desc'});
  assert.equal(ascending[0].title,descending.at(-1).title);
  const newest=core.filterRecords(core.records,{sort:'newest'});
  assert.ok(newest[0].date>=newest.at(-1).date);
  assert.equal(JSON.stringify(core.records),before);
});
test('range validation and form units reject contradictory values',()=>{
  assert.equal(core.validRange('2024-02-01','2024-01-01'),false);
  assert.equal(core.validRange('2024-02-01','2024-02-01'),true);
  assert.equal(core.validRange('','2024-02-01'),true);
  for(const count of ['0','11','1.5','not-a-number',''])assert.ok(core.formErrors({title:'가상 제목',count}).count,count);
  for(const count of ['1','10'])assert.deepEqual(core.formErrors({title:'가상 제목',count}),{});
});
test('download example metadata matches exact shipped UTF-8 bytes',()=>{
  const bytes=fs.statSync(path.join(root,'sample-guide.txt')).size;
  const html=fs.readFileSync(path.join(root,'attachments.html'),'utf8');
  assert.ok(html.includes(`${(bytes/1024).toFixed(2)} KB`));
  assert.equal(bytes,264);
});
// Minimal event/DOM adapter: checks the shipped handlers, not browser rendering or native dialog behavior.
function variantEnvironment(variant){
  const nodes=new Map();
  let active=null;
  function node(id){if(!nodes.has(id)){const events={};nodes.set(id,{id,value:'',hidden:false,disabled:false,children:[],attrs:{},textContent:'',events,addEventListener(type,fn){(events[type]??=[]).push(fn);},dispatch(type,event={}){for(const fn of events[type]||[])fn({preventDefault(){},...event});},setAttribute(key,value){this.attrs[key]=value;},getAttribute(key){return this.attrs[key];},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},focus(){active=this;},showModal(){this.open=true;},close(){this.open=false;this.dispatch('close');}});}return nodes.get(id);}
  const tabs=['usage','support','history'].map(key=>{const item=node(`tab-${key}`);item.attrs['aria-controls']=`panel-${key}`;node(`panel-${key}`);return item;});
  const document={body:{dataset:{variant}},getElementById:node,querySelectorAll:()=>tabs,createElement:tag=>node(`${tag}-${nodes.size}`)};
  node('variant-sort').value='newest';node('variant-layout').value='bar';
  const navigation={attach:()=>({state:{page:1,applied:{},layout:'bar'},link(){},restore(){}})};
  vm.runInNewContext(fs.readFileSync(path.join(root,'variants.js'),'utf8'),{document,window:{KrdsBasic:core,KrdsBasicNavigation:navigation}});
  return {node,tabs,active:()=>active};
}

test('detail tab handlers maintain one selected panel and roving keyboard focus',()=>{
  const env=variantEnvironment('detail-tabs');
  env.tabs[1].dispatch('click');
  assert.equal(env.tabs[1].attrs['aria-selected'],'true');
  assert.equal(env.node('panel-support').hidden,false);
  assert.equal(env.node('panel-usage').hidden,true);
  assert.equal(env.tabs.filter(tab=>tab.tabIndex===0).length,1);
  env.tabs[1].dispatch('keydown',{key:'End'});assert.equal(env.active(),env.tabs[2]);
  env.tabs[2].dispatch('keydown',{key:'ArrowRight'});assert.equal(env.active(),env.tabs[0]);
  env.tabs[0].dispatch('keydown',{key:'ArrowLeft'});assert.equal(env.active(),env.tabs[2]);
  env.tabs[2].dispatch('keydown',{key:'Home'});assert.equal(env.active(),env.tabs[0]);
});

test('filter alternatives apply, cancel modal draft, reject range and preserve actual results',()=>{
  const env=variantEnvironment('filter-layouts');
  assert.equal(env.node('variant-count').textContent,'검색 결과 24개');
  env.node('variant-category').value='교육';env.node('variant-filter-form').dispatch('submit');
  assert.equal(env.node('variant-count').textContent,'검색 결과 12개');
  env.node('variant-layout').value='modal';env.node('variant-layout').dispatch('change');
  assert.equal(env.node('variant-open').hidden,false);
  env.node('variant-open').dispatch('click');assert.equal(env.node('variant-dialog').open,true);
  env.node('variant-category').value='생활';env.node('variant-cancel').dispatch('click');
  assert.equal(env.node('variant-category').value,'교육');
  assert.equal(env.node('variant-count').textContent,'검색 결과 12개');
  assert.equal(env.active(),env.node('variant-open'));
  env.node('variant-open').dispatch('click');env.node('variant-from').value='2024-12-01';env.node('variant-to').value='2024-01-01';env.node('variant-filter-form').dispatch('submit');
  assert.equal(env.node('variant-dialog').open,true);assert.ok(env.node('variant-range-error').textContent);assert.equal(env.active(),env.node('variant-to'));
  env.node('variant-from').value='';env.node('variant-to').value='';env.node('variant-keyword').value='없는 항목';env.node('variant-filter-form').dispatch('submit');
  assert.equal(env.node('variant-count').textContent,'검색 결과 0개');assert.equal(env.node('variant-dialog').open,false);
  env.node('variant-reset').dispatch('click');assert.equal(env.node('variant-count').textContent,'검색 결과 24개');
});

test('navigation state round trip preserves only permitted non-sensitive fields',()=>{
  const input={page:2,keyword:'교육',view:'accordion',mode:'instant',layout:'modal',scroll:870,focus:'record-12',expanded:[12],applied:{category:'교육',sort:'oldest',from:'2024-01-01'},name:'private',password:'secret',feedback:'private'};
  const restored=navigation.decode(navigation.encode(input));
  assert.equal(restored.page,2);assert.equal(restored.keyword,'교육');assert.equal(restored.scroll,870);assert.equal(restored.focus,'record-12');assert.deepEqual(restored.expanded,[12]);assert.deepEqual(restored.applied,input.applied);
  for(const key of ['name','password','feedback'])assert.equal(restored[key],undefined);
  assert.equal(navigation.decode('#state=invalid').page,1);
  assert.equal(navigation.normalize({scroll:-1,page:Infinity,keyword:'x'.repeat(999)}).keyword.length,200);
});
test('detail return destinations cannot navigate outside the allowed local lists',()=>{
  for(const value of ['https://evil.example/','//evil.example/','../identity.html','javascript:alert(1)','list.html?external=1',null])assert.equal(navigation.safeReturn(value),'list.html');
  const target='filter.html'+navigation.encode({page:2,applied:{category:'생활'},scroll:700});
  assert.equal(navigation.safeReturn(target),target);
});
test('navigation adapter saves before detail and restores scroll and focus',()=>{
  const events={};const linkEvents={};let replaced='';let focused=false;let scrolled=[];
  const anchor={id:'',addEventListener:(event,fn)=>linkEvents[event]=fn,focus:()=>focused=true};
  const state={page:2,keyword:'안내',view:'table',scroll:450,focus:'record-11'};
  const win={location:{hash:navigation.encode(state)},scrollY:450,history:{replaceState:(_state,_title,url)=>replaced=url},addEventListener:(event,fn)=>events[event]=fn,requestAnimationFrame:fn=>fn(),scrollTo:(...args)=>scrolled=args};
  const doc={activeElement:anchor,getElementById:()=>anchor};
  const adapter=navigation.attach(win,doc,'list.html',()=>state);adapter.link(anchor,11);linkEvents.click();
  assert.ok(replaced.startsWith('list.html#state='));assert.ok(anchor.href.startsWith('detail.html?example=11&return='));
  const returnTarget=new URL('https://local.example/'+anchor.href).searchParams.get('return');assert.equal(returnTarget,replaced);
  adapter.restore();assert.equal(focused,true);assert.deepEqual(scrolled,[0,450]);assert.ok(events.pagehide);
});
test('local request transitions handle loading, retry and cancellation without false completion',()=>{
  let state=extended.requestState('idle','start');assert.equal(state,'loading');
  assert.equal(extended.requestState(state,'start'),'loading');
  state=extended.requestState(state,'error');assert.equal(state,'error');
  state=extended.requestState(state,'start');assert.equal(state,'loading');
  state=extended.requestState(state,'cancel');assert.equal(state,'idle');
  assert.equal(extended.requestState(state,'success'),'idle');
  assert.equal(extended.requestState('loading','empty'),'empty');
  assert.equal(extended.requestState('loading','success'),'success');
});
test('checkbox consent state permits optional refusal and provides mixed state',()=>{
  assert.deepEqual(extended.checkboxConsent([true,false]),{all:false,mixed:true,canContinue:true});
  assert.deepEqual(extended.checkboxConsent([false,true]),{all:false,mixed:true,canContinue:false});
  assert.deepEqual(extended.checkboxConsent([true,true]),{all:true,mixed:false,canContinue:true});
  assert.deepEqual(extended.checkboxConsent([false,false]),{all:false,mixed:false,canContinue:false});
});
test('numeric range and multiple selection combine with predictable empty state',()=>{
  assert.equal(extended.filterNumeric(core.records,1,24,[]).length,24);
  assert.equal(extended.filterNumeric(core.records,1,10,['생활']).length,5);
  assert.equal(extended.filterNumeric(core.records,1,10,['생활','교육']).length,10);
  assert.equal(extended.filterNumeric(core.records,1,1,['교육']).length,0);
  assert.equal(extended.codeError('abc-01'),'');assert.ok(extended.codeError('A!'));
});
test('all semantic variants have concrete paths dependencies and states',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'variants-manifest.json'),'utf8'));
  assert.equal(manifest.version,1);assert.equal(manifest.items.length,11);
  assert.equal(new Set(manifest.items.map(item=>item.id)).size,11);
  let total=0;
  for(const item of manifest.items){assert.equal(item.kind,'pattern');assert.ok(item.variants[item.defaultVariant]);for(const variant of Object.values(item.variants)){total++;assert.ok(fs.existsSync(path.join(root,'../../../../../',variant.path)),variant.path);assert.ok(variant.states.length);for(const file of variant.dependencies)assert.ok(fs.existsSync(path.join(root,'../../../../../',file)),file);}}
  assert.equal(total,75);
});

test('common error UI reads the exact company message without sending user values',async()=>{
  const values=JSON.parse(fs.readFileSync(path.join(root,'../../../../../messages/ko.json'),'utf8'));
  const node={dataset:{companyMessage:'error.network',messagePart:'body'},textContent:''};
  const calls=[];const window={};const document={querySelectorAll:()=>[node]};
  const fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>values};};
  vm.runInNewContext(fs.readFileSync(path.join(root,'shared-messages.js'),'utf8'),{window,document,fetch});
  assert.equal(await window.KrdsBasicMessages.ready,true);
  assert.equal(node.textContent,values.messages['error.network'].body);
  assert.equal(window.KrdsBasicMessages.get('error.network').title,values.messages['error.network'].title);
  assert.equal(calls.length,1);assert.equal(calls[0].url,'../../../../../messages/ko.json');assert.equal(calls[0].options.body,undefined);
});

test('month precision includes every day of the selected month and validates ordering',()=>{
  const rows=[{date:'2024-02-01'},{date:'2024-02-29'},{date:'2024-03-01'}];
  assert.equal(precision.filter(rows,'month','2024-02','2024-02').length,2);
  assert.equal(precision.filter(rows,'month','','').length,3);
  assert.equal(precision.filter(rows,'month','2025-01','2025-12').length,0);
  for(const from of ['2024-13','2024-00','2024-2'])assert.equal(precision.filter(rows,'month',from,''),null);
  assert.equal(precision.filter(rows,'month','2024-03','2024-02'),null);
});
test('time precision has inclusive endpoints and rejects overnight ranges rather than silently wrapping',()=>{
  const rows=[{time:'00:00'},{time:'09:00'},{time:'10:00'},{time:'23:59'}];
  assert.equal(precision.filter(rows,'time','09:00','10:00').length,2);
  assert.equal(precision.filter(rows,'time','00:00','23:59').length,4);
  assert.equal(precision.filter(rows,'time','23:00','01:00'),null);
  assert.equal(precision.filter(rows,'time','24:00',''),null);
});

function precisionEnvironment(){
  const nodes=new Map();let active;const events={};
  const node=id=>{if(!nodes.has(id))nodes.set(id,{id,value:'',attrs:{},children:[],hidden:false,textContent:'',events:{},classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){(this.events[type]??=[]).push(fn);},dispatch(type,event={}){for(const fn of this.events[type]||[])fn({preventDefault(){},...event});},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},getAttribute(k){return this.attrs[k];},append(child){this.children.push(child);},replaceChildren(){this.children=[];},focus(){active=this;},reset(){for(const side of ['from','to'])node(id.replace('-form','-'+side)).value='';}});return nodes.get(id);};
  const links=['overview','history'].map(id=>{const link=node('link-'+id);link.attrs.href='#precision-'+id;return link;});
  const ratings=['good','bad'].map(id=>{const button=node('rating-'+id);button.dataset={lateRating:id};return button;});
  const doc={body:{dataset:{}},getElementById:node,querySelectorAll:selector=>selector==='#long-toc a'?links:selector==='[data-late-rating]'?ratings:[],createElement:tag=>node(`${tag}-${nodes.size}`)};
  const media={matches:true,addEventListener:(type,fn)=>events[type]=fn};
  const win={KrdsBasic:core,KrdsBasicExtended:extended,matchMedia:()=>media,addEventListener(){}};
  return {doc,win,node,media,links,ratings,events,active:()=>active};
}
test('precision filter handlers preserve invalid values/results and reset correctly',()=>{
  const env=precisionEnvironment();precision.mount(env.win,env.doc);
  env.node('month-from').value='2024-02';env.node('month-to').value='2024-02';env.node('month-form').dispatch('submit');
  assert.equal(env.node('month-count').textContent,'검색 결과 2개');
  env.node('month-from').value='2024-03';env.node('month-form').dispatch('submit');
  assert.equal(env.node('month-count').textContent,'검색 결과 2개');assert.equal(env.node('month-from').value,'2024-03');assert.equal(env.active(),env.node('month-from'));
  env.node('month-reset').dispatch('click');assert.equal(env.node('month-count').textContent,'검색 결과 24개');assert.equal(env.node('month-from').attrs['aria-invalid'],undefined);
  env.node('time-from').value='09:00';env.node('time-to').value='10:00';env.node('time-form').dispatch('submit');assert.equal(env.node('time-count').textContent,'검색 결과 2개');
  env.node('month-next').dispatch('click');assert.equal(env.node('month-page').textContent,'2 / 3페이지');
});
test('long mobile contents expands natively then moves focus to the requested section',()=>{
  const env=precisionEnvironment();precision.mount(env.win,env.doc);
  assert.equal(env.node('long-toc').open,false);env.node('long-toc').open=true;env.links[1].dispatch('click');
  assert.equal(env.active(),env.node('precision-history'));assert.equal(env.node('long-toc').open,false);
  env.media.matches=false;env.events.change();assert.equal(env.node('long-toc').open,true);
});
test('no-followup feedback keeps the chosen control visible and focused after completion',()=>{
  const env=precisionEnvironment();env.doc.body.dataset.extension='content-variants';
  vm.runInNewContext(fs.readFileSync(path.join(root,'extended.js'),'utf8'),{document:env.doc,window:env.win});
  env.ratings[1].dispatch('click');assert.equal(env.active(),env.ratings[1]);assert.equal(env.node('late-feedback-options').hidden,false);
  assert.equal(env.ratings[1].attrs['aria-pressed'],'true');assert.equal(env.ratings[0].attrs['aria-pressed'],'false');
  const completed=env.node('late-feedback-status').textContent;env.ratings[0].dispatch('click');assert.equal(env.node('late-feedback-status').textContent,completed);
  env.node('feedback-demo-reset').dispatch('click');assert.equal(env.ratings[1].attrs['aria-disabled'],undefined);assert.equal(env.ratings[1].attrs['aria-pressed'],'false');
});
