import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';

const source=readFileSync(new URL('../designs/assets/ui-kit/internal/company/js/business.js',import.meta.url),'utf8');
const messages=JSON.parse(readFileSync(new URL('../designs/assets/messages/ko.json',import.meta.url),'utf8')).messages;
function fixture(){
  let tick=0,accepted=false,options;
  const form={entries:[['reason','']]};
  const context=vm.createContext({
    FormData:class {constructor(current){this.current=current;}entries(){return [...this.current.entries,['file',this.current.file??{name:'',size:0,lastModified:++tick}]][Symbol.iterator]();}},
    global:{addEventListener(){},removeEventListener(){}},
    messageText:(id,key)=>messages[id][key],
    confirm:async(root,config)=>{options=config;return accepted;}
  });
  vm.runInContext(source.match(/^function snapshot\(.*$/m)[0]+'\n'+source.match(/^function dirtyGuard\(.*$/m)[0],context);
  return {form,guard:context.dirtyGuard(form),accept(value){accepted=value;},options:()=>options};
}
test('empty file timestamps never dirty the form; named zero-byte files do',()=>{
  const {form,guard}=fixture();
  assert.equal(guard.dirty,false);assert.equal(guard.capture(),guard.capture());
  form.file={name:'empty.txt',size:0,lastModified:1};assert.equal(guard.dirty,true);
  guard.markClean();assert.equal(guard.dirty,false);
  form.file.lastModified=2;assert.equal(guard.dirty,true);
});
test('only discard confirmation allows dirty navigation; saved snapshot preserves later edits',async()=>{
  const f=fixture();assert.equal(await f.guard.mayLeave({}),true);
  f.form.entries=[['reason','changed']];
  assert.equal(await f.guard.mayLeave({}),false);assert.equal(f.guard.dirty,true);
  assert.equal(f.options().action,'변경 내용 버리고 이동');
  f.accept(true);assert.equal(await f.guard.mayLeave({}),true);
  const saved=f.guard.capture();f.form.entries=[['reason','later']];f.guard.markClean(saved);
  assert.equal(f.guard.dirty,true);
});
