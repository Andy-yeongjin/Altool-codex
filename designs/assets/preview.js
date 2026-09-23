'use strict';
const grid = document.querySelector('#grid');
const status = document.querySelector('#status');
const query = document.querySelector('#query');
const dialog = document.querySelector('#detail');
let assets = [];
let adopted = [];
let catalogAssets = [];
let source = 'adopted';
let category = 'all';
let renderGeneration = 0;
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function localPath(path) {
  if (typeof path !== 'string' || path.startsWith('/') || path.includes('\\') || path.split('/').some(x => x === '..') || !/^[a-zA-Z0-9_./-]+$/.test(path)) throw new Error('안전하지 않은 자산 경로');
  return path;
}
function previewPath(value) {
  const [path, fragment, ...extra] = value.split('#');
  localPath(path);
  if (extra.length || (fragment !== undefined && !/^[a-zA-Z0-9_./-]+$/.test(fragment))) throw new Error('안전하지 않은 예제 위치');
  return value;
}
async function copy(value) {
  try { await navigator.clipboard.writeText(value); status.textContent = '복사했어요.'; }
  catch { status.textContent = '복사 권한이 없어요. 원문 보기에서 직접 복사해 주세요.'; }
}
async function showDetail(item) {
  document.querySelector('#detail-title').textContent = item.name;
  const body = document.querySelector('#detail-body');
  body.replaceChildren(el('p', '불러오는 중…'));
  dialog.showModal();
  const generation = ++renderGeneration;
  try {
    if (item.message) {
      body.replaceChildren(el('h3', item.message.title), el('p', item.message.body));
      if (item.message.action) body.append(el('span', item.message.action, 'sample-action'));
      body.append(el('p', '문구 예시입니다. 실제 액션·성공 여부·오류 필드 연결은 적용하는 프로젝트에서 구현합니다.', 'meta'));
      return;
    }
    const response = await fetch(localPath(item.path));
    if (!response.ok) throw new Error('원문을 불러오지 못했어요.');
    const text = await response.text();
    if (generation !== renderGeneration || !dialog.open) return;
    body.replaceChildren(el('pre', text));
  } catch (error) { if (generation === renderGeneration && dialog.open) body.replaceChildren(el('p', error.message)); }
}
function render() {
  const term = query.value.trim().toLocaleLowerCase();
  const filtered = assets.filter(a => (category === 'all' || a.category === category) &&
    [a.name, a.id, a.group, a.path, a.message?.body].filter(Boolean).join(' ').toLocaleLowerCase().includes(term));
  grid.replaceChildren();
  status.textContent = `${filtered.length}개 자산 · 전체 ${assets.length}개`;
  if (!filtered.length) { grid.append(el('p', '검색 결과가 없어요. 검색어나 분류를 바꿔 보세요.', 'empty')); return; }
  for (const item of filtered) {
    const card = el('article', undefined, 'card' + (item.category === 'messages' ? ' wide' : ''));
    if (['brand','icons','images'].includes(item.category)) {
      const art = el('div', undefined, 'art' + (item.category === 'icons' ? ' icon' : '') + (/inverse|high_contrast|_white/.test(item.path) ? ' dark' : ''));
      const image = el('img'); image.src = localPath(item.path); image.alt = ''; image.loading = 'lazy';
      art.append(image); card.append(art);
    } else if (item.message) {
      const preview = el('div', undefined, 'message-preview'); preview.append(el('strong', item.message.title),el('p',item.message.body)); card.append(preview);
    } else { const art = el('div', undefined, 'art'); art.append(el('span', '</>', 'placeholder')); card.append(art); }
    const info = el('div', undefined, 'card-info');
    info.append(el('span', item.category, 'badge'),el('h2', item.name));
    info.append(el('p', item.semantic ? item.id : item.message ? item.id : item.path, 'meta'));
    if (item.semantic) info.append(el('p', `기본: ${item.defaultVariant} · 허용 변형: ${item.variantNames.join(', ')}`, 'meta'));
    if (['components','patterns','foundations'].includes(item.category)) info.append(el('p', `${item.source} · 개별 적용·검증 범위 확인`, 'meta'));
    if (item.restrictedIdentity) info.append(el('p', '기관·브랜드 식별용: 자동 적용하지 않음', 'meta'));
    const actions = el('div', undefined, 'actions');
    const detail = el('button', item.message ? '문구 예시' : '원문 보기'); detail.type='button'; detail.addEventListener('click',()=>showDetail(item)); actions.append(detail);
    const copyButton = el('button', item.semantic ? 'ID 복사' : item.message ? '문구 복사' : '경로 복사'); copyButton.type='button'; copyButton.addEventListener('click',()=>copy(item.semantic ? item.id : item.message ? `${item.message.title}\n${item.message.body}` : `designs/assets/${item.path}`)); actions.append(copyButton);
    if (item.preview) { const link = el('a','예제 열기 ↗'); link.href=previewPath(item.preview); link.target='_blank'; link.rel='noopener'; actions.append(link); }
    info.append(actions); card.append(info); grid.append(card);
  }
}
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click',()=>{
  category=button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  render();
}));
query.addEventListener('input',render);
document.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click',()=>{
  source=button.dataset.source; assets=source==='adopted'?adopted:catalogAssets;
  document.querySelectorAll('[data-source]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  render();
}));
document.querySelector('#clear').addEventListener('click',()=>{query.value='';render();query.focus();});
document.querySelector('#close-detail').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{renderGeneration++;});
Promise.all(['catalog.json','messages/ko.json','registry.json','pack.lock.json'].map(async path=>{
  const response=await fetch(path); if(!response.ok) throw new Error(path);
  const bytes=await response.arrayBuffer();
  return {bytes,data:JSON.parse(new TextDecoder().decode(bytes))};
})).then(async results=>{
  const [catalog, messages, registry, lock]=results.map(result=>result.data);
  for (const [index,path] of [[2,'registry.json'],[1,'messages/ko.json']]) {
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',results[index].bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
    if(hash!==lock.files[`designs/assets/${path}`]) throw new Error('Company pack mismatch');
  }
  if(registry.pack!==lock.pack||registry.release!==lock.release) throw new Error('Company pack mismatch');
  const categories={icon:'icons',image:'images',message:'messages',component:'components',pattern:'patterns',service:'patterns',foundation:'foundations',brand:'brand'};
  adopted=registry.items.filter(item=>!item.restrictedTo||item.restrictedTo.includes('company')).map(item=>{
    const value=item.variants[item.defaultVariant];
    const preview=value.preview || (/\.html$/.test(value.path)?value.path:undefined);
    return {id:item.id,semantic:true,category:categories[item.kind],name:item.meaning,path:value.path.replace(/^designs\/assets\//,''),
      preview:preview?(preview+ (value.route || '')).replace(/^designs\/assets\//,''):undefined,message:item.kind==='message'?messages.messages[value.key]:undefined,
      source:`${registry.pack}@${registry.release}`,defaultVariant:item.defaultVariant,variantNames:Object.keys(item.variants)};
  });
  catalogAssets=[...catalog.assets,...Object.entries(messages.messages).map(([id,message])=>({id,category:'messages',name:message.title,path:'messages/ko.json',message}))];
  assets=adopted;
  const packStatus=document.querySelector('#pack-status');
  if(packStatus) packStatus.textContent=`${registry.pack}@${registry.release} · 회사 사용 가능 의미 ID ${adopted.length}개 · 원본 무결성은 assets.py validate로 확인`;
  render();
}).catch(()=>{
  const error=document.querySelector('#error');error.hidden=false;error.textContent='자산 목록 또는 회사 팩을 확인하지 못했어요. 로컬 HTTP 서버와 registry·lock·catalog·메시지 파일을 확인하고 assets.py validate를 실행해 주세요.';
  status.textContent='불러오기 실패';
});
