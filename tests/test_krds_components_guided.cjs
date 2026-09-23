'use strict';
// Guided-company DOM contracts, not a browser/layout emulation.
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const base=path.join(__dirname,'../designs/assets/ui-kit/internal/company');
const {Node,document}=require(path.join(base,'tests/dom-harness.cjs'));
require(path.join(base,'extensions/runtime.js'));
const ui=global.CompanyExtensions;
function fixture(){
 const root=new Node('section'),nodes={};
 for(const name of ['panel','title','count','previous','next','start','collapse','stop']){const n=new Node(['title','count','panel'].includes(name)?'div':'button');n.setAttribute('data-tour-'+name,'');root.append(n);nodes[name]=n;}
 const targets=Array.from({length:3},()=>new Node('button'));root.append(...targets);document.append(root);
 let valid=true,finished=0;const control=ui.tutorial(root,{steps:targets.map((target,index)=>({target,title:'업무 '+index,valid:()=>valid})),onComplete:()=>finished++});
 return {root,nodes,targets,control,setValid:v=>valid=v,get finished(){return finished;}};
}
test('tour does not start or complete from unrequested target action',()=>{
 const f=fixture();f.targets[0].click();f.nodes.next.click();assert.equal(f.control.state.started,false);assert.deepEqual(f.control.state.completed,[]);assert.equal(f.finished,0);f.control.destroy();
});
test('invalid and out-of-order target actions cannot advance',()=>{
 const f=fixture();f.control.open();f.setValid(false);f.targets[0].click();f.setValid(true);f.targets[2].click();f.nodes.next.click();assert.equal(f.control.state.index,0);assert.deepEqual(f.control.state.completed,[]);f.control.destroy();
});
test('actual current target action enables exactly one next stage',()=>{
 const f=fixture();f.control.open();f.targets[0].click();assert.deepEqual(f.control.state.completed,[0]);f.nodes.next.click();assert.equal(f.control.state.index,1);f.nodes.next.click();assert.equal(f.control.state.index,1);assert.equal(f.finished,0);f.control.destroy();
});
test('previous and next allow review without fabricating task completion',()=>{
 const f=fixture();f.control.open();f.targets[0].click();f.nodes.next.click();f.nodes.previous.click();assert.equal(f.control.state.index,0);f.nodes.next.click();assert.equal(f.control.state.index,1);assert.deepEqual(f.control.state.completed,[0]);f.control.destroy();
});
test('panel close/reopen retains progress and returns focus',()=>{
 const f=fixture();const opener=new Node('button');opener.focus();f.control.open();f.targets[0].click();f.nodes.next.click();f.nodes.collapse.click();assert.equal(document.activeElement,opener);assert.equal(f.control.state.collapsed,true);assert.deepEqual(f.control.state.completed,[0]);f.control.open();assert.equal(f.control.state.index,1);assert.equal(document.activeElement,f.targets[1]);f.control.destroy();
});
test('hidden panel target interactions do not complete guidance',()=>{
 const f=fixture();f.control.open();f.control.close();f.targets[0].click();assert.deepEqual(f.control.state.completed,[]);f.control.destroy();
});
test('finish requires all real action stages and emits completion once',()=>{
 const f=fixture();f.control.open();for(let n=0;n<3;n++){assert.equal(f.control.state.index,n);f.targets[n].click();f.nodes.next.click();}assert.equal(f.finished,1);assert.equal(f.control.state.started,false);assert.deepEqual(f.control.state.completed,[]);f.nodes.next.click();assert.equal(f.finished,1);f.control.destroy();
});
test('explicit stop resets progression, restart starts a new process',()=>{
 const f=fixture();f.control.open();f.targets[0].click();f.nodes.next.click();f.control.stop();assert.deepEqual(f.control.state,{index:0,started:false,completed:[],collapsed:true});f.control.open();assert.equal(f.control.state.index,0);f.control.destroy();
});
test('destroy detaches every registered task and control listener',()=>{
 const f=fixture();f.control.open();f.control.destroy();f.targets[0].click();f.nodes.next.click();assert.deepEqual(f.control.state.completed,[]);assert.equal(f.control.state.index,0);
});
test('responsive guided surface inherits only company colors without viewport-positioned overlap',()=>{
 const css=fs.readFileSync(path.join(base,'extensions/styles.css'),'utf8');assert.doesNotMatch(css,/#[a-f\d]{3,8}\b|rgba?\(/i);assert.match(css,/var\(--company-section-accent\)/);assert.match(css,/@media\s*\(max-width:599px\)/);assert.doesNotMatch(css,/position:\s*(fixed|absolute).*ui-tutorial-panel/);
});
const steps=()=>[{valid:v=>!!v.title},{optional:true,valid:v=>!!v.detail},{valid:v=>v.confirmed===true}];
test('required adaptive step cannot be skipped or completed with invalid values',()=>{
 const flow=ui.stepFlow(steps());const before=flow.state;assert.equal(flow.next({},true),false);assert.equal(flow.next({}),false);assert.deepEqual(flow.state,before);
});
test('optional skip remains distinguished from completion through review',()=>{
 const flow=ui.stepFlow(steps());assert.equal(flow.next({title:'업무'}),true);assert.equal(flow.next({},true),true);
 assert.deepEqual(flow.state.completed,[0]);assert.deepEqual(flow.state.skipped,[1]);assert.equal(flow.state.index,2);
 flow.back();assert.equal(flow.state.index,1);assert.deepEqual(flow.state.skipped,[1]);
 assert.equal(flow.next({detail:'추가 입력'}),true);assert.deepEqual(flow.state.skipped,[]);assert.deepEqual(flow.state.completed,[0,1]);
});
test('adaptive completion retains skip history and reset clears every state without mutating snapshots',()=>{
 const flow=ui.stepFlow(steps());flow.next({title:'업무'});flow.next({},true);assert.equal(flow.next({confirmed:false}),false);assert.equal(flow.state.finished,false);
 assert.equal(flow.next({confirmed:true}),true);const complete=flow.state;assert.equal(complete.finished,true);assert.deepEqual(complete.skipped,[1]);
 flow.reset();assert.deepEqual(flow.state,{index:0,finished:false,history:[],completed:[],skipped:[]});assert.equal(complete.finished,true);
});
test('adaptive branches cannot loop or jump to an invalid backward target',()=>{
 for(const target of [-1,0,1.5,NaN]){const flow=ui.stepFlow([{next:()=>target},{},{}]);assert.throws(()=>flow.next({}));}
 const flow=ui.stepFlow([{next:()=>2},{},{}]);flow.next({});assert.equal(flow.state.index,2);flow.back();assert.equal(flow.state.index,0);
});
