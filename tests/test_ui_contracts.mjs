import test from 'node:test';
import assert from 'node:assert/strict';
import {checkUiMeasurements,collectUiMeasurements} from '../standards/tooling/ui-contracts.mjs';
const viewport = {width: 1440, height: 1000};
const contracts = [
  {id:'heading',kind:'style',selector:'h2',viewport,expected:{fontSize:21,marginTop:0}},
  {id:'entry',kind:'entry',selector:'#list',viewport},
  {id:'chart',kind:'text',selector:'svg text',viewport,minimum:13},
  {id:'left',kind:'icon',selector:'#left img',viewport,src:'/chevron-left.svg'},
];
const passing = () => [
  {id:'heading',count:1,visibleCount:1,viewport,styles:{fontSize:21,marginTop:0}},
  {id:'entry',count:1,visibleCount:1,viewport,top:900},
  {id:'chart',count:2,visibleCount:2,viewport,fontSizes:[13,13]},
  {id:'left',count:1,visibleCount:1,viewport,src:'/chevron-left.svg',transform:'none'},
];
test('approved values pass, not merely a success assertion',()=>assert.equal(checkUiMeasurements(contracts,passing()).valid,true));
test('computed strings and exact collection count are checked',()=>{
  const styles=[{...contracts[0],expected:{color:'rgb(0, 0, 0)',borderRadius:'4px'}}];
  const rows=[{...passing()[0],styles:{color:'rgb(0, 0, 0)',borderRadius:'4px'}}];
  assert.equal(checkUiMeasurements(styles,rows).valid,true);
  rows[0].styles.borderRadius='12px';
  assert.equal(checkUiMeasurements(styles,rows).valid,false);
  assert.equal(checkUiMeasurements([{...contracts[2],expectedCount:15}],[passing()[2]]).valid,false);
});
for (const [name, index, change] of [
  ['overridden heading',0,{styles:{fontSize:25,marginTop:24}}],
  ['below-fold list',1,{top:1230}],
  ['shrunk SVG labels',2,{fontSizes:[6,6]}],
  ['wrong direction',3,{src:'/ico_angle.svg'}],
  ['app rotates fixed icon',3,{transform:'matrix(0,1,-1,0,0,0)'}],
  ['wrong viewport',0,{viewport:{width:375,height:1000}}],
  ['missing target',0,{count:0}],
  ['hidden target',0,{visibleCount:0}],
  ['invalid numeric measurement',0,{styles:{fontSize:NaN,marginTop:0}}],
]) test(name,()=>{const rows=passing();Object.assign(rows[index],change);assert.equal(checkUiMeasurements(contracts,rows).valid,false);});
test('missing/duplicate observations and empty contracts fail',()=>{
  assert.equal(checkUiMeasurements(contracts,passing().slice(1)).valid,false);
  assert.equal(checkUiMeasurements(contracts,[...passing(),passing()[0]]).valid,false);
  assert.equal(checkUiMeasurements([],[]).valid,false);
});
test('collector measures transformed SVG font instead of its unscaled CSS size',()=>{
  const names=['document','innerWidth','innerHeight','scrollY','getComputedStyle'];
  const saved=names.map(name=>Object.getOwnPropertyDescriptor(globalThis,name));
  try {
    Object.assign(globalThis,{innerWidth:1440,innerHeight:1000,scrollY:0,
      getComputedStyle:()=>({fontSize:'13px',visibility:'visible'}),
      document:{querySelectorAll:()=>[{getBoundingClientRect:()=>({width:40,height:6}),getScreenCTM:()=>({c:0,d:.42})}]}});
    const rows=collectUiMeasurements([contracts[2]]);
    assert.ok(Math.abs(rows[0].fontSizes[0]-5.46)<.001);
    assert.equal(checkUiMeasurements([contracts[2]],rows).valid,false);
  } finally {
    names.forEach((name,index)=>{if(saved[index])Object.defineProperty(globalThis,name,saved[index]);else delete globalThis[name];});
  }
});
