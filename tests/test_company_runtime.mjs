import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {createAssetClient} from '../designs/assets/runtime/assets.mjs';
const base = new URL('../designs/assets/', import.meta.url);
globalThis.crypto ||= webcrypto;
const originalFetch = globalThis.fetch;
const originalDocument = globalThis.document;
let corrupt = '';
let requestCount = new Map();
globalThis.fetch = async input => {
  const url = new URL(input);
  const relative = url.pathname.replace(/^\/company-assets\//, '');
  requestCount.set(relative, (requestCount.get(relative) || 0) + 1);
  try {
    const bytes = relative === corrupt ? Buffer.from('corrupt') : await readFile(new URL(relative, base));
    return {ok:true, arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset+bytes.byteLength)};
  } catch { return {ok:false,status:404}; }
};
class Element {
  constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.events={};this.attributes={};this.textContent='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  setAttribute(key,value){this.attributes[key]=value;}
  addEventListener(key,value){this.events[key]=value;}
}
globalThis.document = {createElement:tag=>new Element(tag)};
test.after(()=>{globalThis.fetch=originalFetch;globalThis.document=originalDocument;});

test('independent clients resolve the same icon and exact canonical message', async()=>{
  const a=await createAssetClient('http://fixture.invalid/company-assets/');
  const b=await createAssetClient('http://fixture.invalid/company-assets/');
  assert.deepEqual(a.resolve('icon.settings'),b.resolve('icon.settings'));
  const source=JSON.parse(await readFile(new URL('messages/ko.json',base),'utf8'));
  assert.deepEqual(await a.message('message.error.network'),source.messages['error.network']);
  assert.deepEqual(await a.message('message.error.network'),await b.message('message.error.network'));
});
test('missing semantics, unapproved variants and invalid icon size fail',async()=>{
  const a=await createAssetClient('http://fixture.invalid/company-assets/');
  assert.throws(()=>a.resolve('icon.settings','triangle'),/Unapproved/);
  for(const name of ['toString','constructor','__proto__']) assert.throws(()=>a.resolve('icon.settings',name),/Unapproved/);
  assert.throws(()=>a.resolve('icon.custom'),/Unavailable/);
  await assert.rejects(a.icon('icon.settings',{size:25}),/Invalid/);
  await assert.rejects(a.message('icon.settings'),/Expected/);
});
test('expected release mismatch fails and tampered source is not silently accepted',async()=>{
  await assert.rejects(createAssetClient('http://fixture.invalid/company-assets/',{release:'nonexistent'}),/mismatch/);
  const a=await createAssetClient('http://fixture.invalid/company-assets/');
  corrupt='messages/ko.json';
  try{await assert.rejects(a.message('message.error.network'),/changed/);}finally{corrupt='';}
  assert.ok((await a.message('message.error.network')).title);
});
test('registry tampering fails before any semantic lookup',async()=>{
  corrupt='registry.json';
  try{await assert.rejects(createAssetClient('http://fixture.invalid/company-assets/'),/changed/);}finally{corrupt='';}
});
test('message DOM uses exact text and only creates an action for a real callback',async()=>{
  const a=await createAssetClient('http://fixture.invalid/company-assets/');
  const box=new Element('div');
  const result=await a.renderMessage(box,'message.error.network');
  assert.equal(result.attributes.role,'alert');
  assert.equal(result.children.length,2);
  assert.equal(result.dataset.assetId,'message.error.network');
  let calls=0;
  const action=await a.renderMessage(box,'message.error.network',{onAction:()=>calls++});
  action.children[2].events.click();
  assert.equal(calls,1);
  assert.equal(box.children.length,1);
});
test('icons use pinned image bytes, semantic identity and only approved sizes',async()=>{
  const a=await createAssetClient('http://fixture.invalid/company-assets/');
  const icon=await a.icon('icon.settings',{size:24,label:'설정'});
  assert.equal(icon.dataset.assetId,'icon.settings');
  assert.equal(icon.width,24);assert.equal(icon.alt,'설정');
  assert.match(icon.src,/^blob:/);icon.events.load();
  for (const size of [16,20,32,48]) {
    const variant=await a.icon('icon.settings',{size,label:'설정'});
    assert.equal(variant.width,size);assert.equal(variant.height,size);variant.events.load();
  }
});
