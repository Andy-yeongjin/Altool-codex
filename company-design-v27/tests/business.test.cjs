// Pure logic and lifecycle checks. These do not replace browser accessibility/visual QA.
const assert=require('node:assert/strict');
require('../js/business.js');const B=global.CompanyBusiness;
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;};
for(const value of ['2024-02-29','2026-09-10','2000-02-29','9999-12-31'])ok(B.parseDate(value),value);
for(const value of ['2026-02-29','1900-02-29','2026-04-31','2026-13-01','2026-00-10','2026-01-00','2026-1-01','26-01-01','', '2026-09-10T00:00:00Z'])ok(B.parseDate(value)===null,value);
for(const value of ['2026-01','2026-12'])ok(B.parseDate(value,true),value);
for(const value of ['2026-13','2026-00','2026-1','2026-09-01'])ok(B.parseDate(value,true)===null,value);
ok(B.rangeError('2026-09-30','2026-09-01').length>0,'reversed range');
ok(B.rangeError('2026-09-01','2026-09-01')==='','same day');
ok(B.rangeError('2026-02-30','2026-03-01').length>0,'invalid range');
ok(B.rangeError('','')==='','optional blank range');
ok(B.rangeError('2026-10','2026-09',true).length>0,'month reversal');
ok(B.formatNumber(0)==='0','zero preserved');ok(B.formatNumber(null)==='—','missing');ok(B.formatNumber(-12345)==='-12,345','negative');ok(B.formatNumber(1.25,{digits:2})==='1.25','decimal');ok(B.formatNumber(Infinity)==='—','infinity');
const manifest=require('../components.json');ok(manifest.components.length===13,'catalog coverage');for(const c of manifest.components)for(const name of c.api.split('/'))ok(typeof B[name]==='function',name);
(async()=>{
 const button={disabled:false,dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}};
 let release,calls=0;const first=B.busy(button,()=>{calls++;return new Promise(resolve=>release=resolve);});ok(button.disabled,'disabled in flight');await B.busy(button,()=>calls++);ok(calls===1,'duplicate task suppressed');release(7);ok(await first===7,'task value preserved');ok(!button.disabled&&!button.dataset.busy,'restored after success');
 let caught=false;try{await B.busy(button,async()=>{throw new Error('server failed');});}catch{caught=true;}ok(caught&&!button.disabled,'rejection propagates and control restored');
 const previousFD=global.FormData;global.FormData=class{constructor(form){this.form=form;}entries(){return this.form.fields[Symbol.iterator]();}};const listeners=new Map();global.addEventListener=(type,fn)=>listeners.set(type,fn);global.removeEventListener=type=>listeners.delete(type);
 const form={fields:[['amount','100']]},guard=B.dirtyGuard(form);ok(!guard.dirty,'initial clean');form.fields=[['amount','200']];ok(guard.dirty,'edited');const submitted=guard.capture();form.fields=[['amount','300']];guard.markClean(submitted);ok(guard.dirty,'editing during save remains dirty');let prevented=false;listeners.get('beforeunload')({preventDefault(){prevented=true;}});ok(prevented,'unload guarded');guard.markClean();ok(!guard.dirty,'latest saved');guard.destroy();ok(!listeners.size,'guard listener removed');global.FormData=previousFD;
 console.log(`PASS ${checks} logic/API checks (TZ=${process.env.TZ||'default'})`);
})().catch(e=>{console.error(e);process.exitCode=1;});
