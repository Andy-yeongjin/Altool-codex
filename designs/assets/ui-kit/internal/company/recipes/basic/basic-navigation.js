/* Navigation state only: never pass identity, consent, feedback, or form values here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KrdsBasicNavigation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const pages=['list.html','filter.html','filter-layouts.html'];
  const strings=['keyword','category','scope','from','to','region','district','operator','extra','sort'];
  function normalize(value={}){const applied={};for(const key of strings)if(typeof value.applied?.[key]==='string')applied[key]=value.applied[key].slice(0,200);return {version:1,expanded:Array.isArray(value.expanded)?value.expanded.filter(x=>Number.isInteger(x)&&x>0&&x<100000).slice(0,100):[],page:Math.max(1,Math.min(10000,Math.floor(Number(value.page)||1))),keyword:typeof value.keyword==='string'?value.keyword.slice(0,200):'',view:['structured','table','accordion'].includes(value.view)?value.view:'structured',mode:value.mode==='instant'?'instant':'batch',layout:value.layout==='modal'?'modal':'bar',applied,scroll:Math.max(0,Math.min(100000,Math.floor(Number(value.scroll)||0))),focus:/^[a-z0-9-]{1,80}$/.test(value.focus||'')?value.focus:''};}
  function encode(state){return '#state='+encodeURIComponent(JSON.stringify(normalize(state)));}
  function decode(hash){try{return hash.startsWith('#state=')&&hash.length<10000?normalize(JSON.parse(decodeURIComponent(hash.slice(7)))):normalize();}catch{return normalize();}}
  function safeReturn(value){if(typeof value!=='string'||value.length>10000)return 'list.html';const split=value.split('#');if(!pages.includes(split[0]))return 'list.html';return split[0]+encode(decode(split[1]?'#'+split.slice(1).join('#'):''));}
  function attach(win,doc,pageName,getState){
    if(!pages.includes(pageName))throw Error('Unsupported navigation state page');
    const restored=decode(win.location.hash);
    const snapshot=focus=>normalize({...getState(),scroll:win.scrollY,focus:focus||doc.activeElement?.id||''});
    function save(focus){const state=snapshot(focus);win.history.replaceState({krdsBasic:state},'',pageName+encode(state));return state;}
    function link(anchor,id){anchor.id=`record-${id}`;const update=()=>{const state=save(anchor.id);anchor.href=`detail.html?example=${id}&return=${encodeURIComponent(pageName+encode(state))}`;};anchor.href=`detail.html?example=${id}&return=${encodeURIComponent(pageName+encode({...getState(),scroll:win.scrollY,focus:anchor.id}))}`;anchor.addEventListener('pointerdown',update);anchor.addEventListener('click',update);}
    function restore(){win.requestAnimationFrame(()=>{if(restored.focus)doc.getElementById(restored.focus)?.focus({preventScroll:true});win.scrollTo(0,restored.scroll);});}
    win.addEventListener('pagehide',()=>save());
    return {state:restored,save,link,restore};
  }
  return {normalize,encode,decode,safeReturn,attach};
});
