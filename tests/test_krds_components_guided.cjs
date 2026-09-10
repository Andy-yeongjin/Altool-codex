'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'../designs/assets/ui-kit/internal/components');
const ui=require(path.join(base,'guided-runtime.js'));
const examples=[];
require(path.join(base,'build-guided-variants.cjs'))((name,title,pages,html,states,component,variant)=>examples.push({name,title,pages,html,states,component,variant}));

test('three semantic alternatives have unique IDs and source pages',()=>{
  assert.equal(examples.length,3);assert.equal(new Set(examples.map(x=>x.name)).size,3);
  for(const x of examples){assert.ok(x.pages.length);assert.ok(x.states.length>=8);assert.ok(x.html.includes('data-guided='));assert.match(x.component,/^(step-indicator|tutorial-panel|coach-mark)$/);}
});
test('each fragment has unique ids and resolvable label/ARIA references',()=>{
  for(const x of examples){const ids=[...x.html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,x.name);
    for(const m of x.html.matchAll(/(?:for|aria-controls|aria-labelledby|aria-describedby)="([^"]+)"/g))for(const id of m[1].split(' '))assert.ok(ids.includes(id),`${x.name}: ${id}`);
  }
});
test('fragments prohibit real server completion claims',()=>{
  for(const x of examples){assert.match(x.html,/서버/);assert.doesNotMatch(x.html,/<script|https?:\/\//);}
});
test('adaptive steps initially disallow forward jumps',()=>{
  const s=ui.initialSteps();assert.deepEqual(ui.stepTransition(s,{type:'jump',index:2}),s);assert.deepEqual(ui.stepTransition(s,{type:'next',valid:false}),s);
});
test('valid required step permits adaptive navigation without discarding progress',()=>{
  const s=ui.stepTransition(ui.initialSteps(),{type:'next',valid:true});assert.equal(s.current,1);assert.equal(s.completed[0],true);
  const review=ui.stepTransition(s,{type:'jump',index:2});assert.equal(review.current,2);
  const back=ui.stepTransition(review,{type:'jump',index:0});assert.equal(back.current,0);assert.equal(back.completed[0],true);
});
test('skip is restricted to optional step and is retained through review',()=>{
  const initial=ui.initialSteps();assert.deepEqual(ui.stepTransition(initial,{type:'skip'}),initial);
  const optional=ui.stepTransition(initial,{type:'next',valid:true});const review=ui.stepTransition(optional,{type:'skip'});
  assert.equal(review.current,2);assert.equal(review.skipped,true);assert.equal(review.completed[1],false);
  const complete=ui.stepTransition(review,{type:'next',valid:true});assert.equal(complete.finished,true);assert.equal(complete.skipped,true);
});
test('return to skipped optional step can complete it',()=>{
  let s=ui.stepTransition(ui.initialSteps(),{type:'next',valid:true});s=ui.stepTransition(s,{type:'skip'});s=ui.stepTransition(s,{type:'previous'});s=ui.stepTransition(s,{type:'next',valid:true});
  assert.equal(s.skipped,false);assert.equal(s.completed[1],true);
});
test('re-entering a skipped step prioritizes current label while preserving skip history',()=>{
  let s=ui.stepTransition(ui.initialSteps(),{type:'next',valid:true});
  s=ui.stepTransition(s,{type:'skip'});
  assert.equal(ui.stepStateLabel(s,1),'건너뜀');
  s=ui.stepTransition(s,{type:'jump',index:0});
  s=ui.stepTransition(s,{type:'next',valid:true});
  assert.equal(s.current,1);assert.equal(s.skipped,true);
  assert.equal(ui.stepStateLabel(s,1),'현재 단계');
  s=ui.stepTransition(s,{type:'jump',index:2});
  assert.equal(ui.stepStateLabel(s,1),'건너뜀');assert.equal(ui.stepStateLabel(s,2),'현재 단계');
});
test('finished current step shows completion and preserves optional skip label',()=>{
  const s={current:2,completed:[true,false,true],skipped:true,finished:true};
  assert.deepEqual([0,1,2].map(index=>ui.stepStateLabel(s,index)),['완료','건너뜀','완료']);
});
test('invalid step indexes do not change state',()=>{
  const s=ui.stepTransition(ui.initialSteps(),{type:'next',valid:true});
  for(const index of [-1,3,NaN,1.2,'2'])assert.deepEqual(ui.stepTransition(s,{type:'jump',index}),s);
});
test('step reset clears completion and skip state without mutating prior state',()=>{
  const s={current:2,completed:[true,false,true],skipped:true,finished:true};assert.deepEqual(ui.stepTransition(s,{type:'reset'}),ui.initialSteps());assert.equal(s.skipped,true);
});
test('tour does not start on input or unrequested completion',()=>{
  const s=ui.initialTour();assert.equal(ui.tourTransition(s,{type:'action',index:0,valid:true}),s);assert.equal(ui.tourTransition(s,{type:'finish'}),s);
});
test('tour invalid and out-of-order target actions cannot advance',()=>{
  const s=ui.tourTransition(ui.initialTour(),{type:'start'});
  assert.deepEqual(ui.tourTransition(s,{type:'action',index:0,valid:false}),s);assert.deepEqual(ui.tourTransition(s,{type:'action',index:2,valid:true}),s);assert.deepEqual(ui.tourTransition(s,{type:'next'}),s);
});
test('actual current target action completes and advances exactly one stage',()=>{
  const s=ui.tourTransition(ui.initialTour(),{type:'start'});const next=ui.tourTransition(s,{type:'action',index:0,valid:true});assert.equal(next.current,1);assert.deepEqual(next.done,[true,false,false]);assert.deepEqual(s.done,[false,false,false]);
});
test('previous and next allow review of completed guidance, not a fake task completion',()=>{
  let s=ui.tourTransition(ui.initialTour(),{type:'start'});s=ui.tourTransition(s,{type:'action',index:0,valid:true});s=ui.tourTransition(s,{type:'previous'});assert.equal(s.current,0);s=ui.tourTransition(s,{type:'next'});assert.equal(s.current,1);assert.deepEqual(s.done,[true,false,false]);
});
test('panel close/reopen and tab switches are not process-reset actions',()=>{
  let s=ui.tourTransition(ui.initialTour(),{type:'start'});s=ui.tourTransition(s,{type:'action',index:0,valid:true});
  for(const type of ['panel-close','panel-open','tab-help','tab-tour'])assert.deepEqual(ui.tourTransition(s,{type}),s);
});
test('finish is gated on all three real local task actions',()=>{
  let s=ui.tourTransition(ui.initialTour(),{type:'start'});assert.equal(ui.tourTransition(s,{type:'finish'}).phase,'running');
  for(let index=0;index<3;index++)s=ui.tourTransition(s,{type:'action',index,valid:true});assert.equal(s.current,2);assert.equal(s.phase,'running');assert.equal(ui.tourTransition(s,{type:'finish'}).phase,'finished');
});
test('stop freezes progression and explicit restart starts a new process',()=>{
  let s=ui.tourTransition(ui.initialTour(),{type:'start'});s=ui.tourTransition(s,{type:'action',index:0,valid:true});s=ui.tourTransition(s,{type:'stop'});assert.equal(s.phase,'stopped');assert.equal(ui.tourTransition(s,{type:'action',index:1,valid:true}),s);assert.deepEqual(ui.tourTransition(s,{type:'start'}),{phase:'running',current:0,done:[false,false,false]});
});
test('runtime registers actual form/select/preview actions with no persistence or network',()=>{
  const code=fs.readFileSync(path.join(base,'guided-runtime.js'),'utf8');
  assert.match(code,/data-tour-title-form/);assert.match(code,/category\.addEventListener\('change'/);assert.match(code,/data-tour-output-title/);assert.match(code,/panel\.showModal\(\)/);assert.match(code,/panel\.close\(\)/);assert.match(code,/targets\[state.current\]\.after\(balloon\)/);
  assert.doesNotMatch(code,/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|\.innerHTML\s*=/);
});
test('guided CSS derives colors from company tokens and retains responsive non-overlapping flow',()=>{
  const css=fs.readFileSync(path.join(base,'guided-runtime.css'),'utf8');assert.doesNotMatch(css,/#[a-f\d]{3,8}\b|rgba?\(/i);assert.match(css,/var\(--krds24-primary-60\)/);assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/position:relative/);assert.match(css,/max-height:calc\(100dvh - 2rem\)/);
});
