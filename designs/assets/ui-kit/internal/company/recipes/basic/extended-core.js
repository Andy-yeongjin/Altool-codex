(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KrdsBasicExtended=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function codeError(value){return /^[a-z][a-z0-9-]{2,19}$/.test(value)?'':'연습 코드는 영문 소문자로 시작하는 3~20자의 소문자·숫자·하이픈으로 입력해 주세요.';}
  function checkboxConsent(values){return {all:values.length>0&&values.every(Boolean),mixed:values.some(Boolean)&&!values.every(Boolean),canContinue:values[0]===true};}
  function requestState(state,event){if(event==='start'&&state!=='loading')return 'loading';if(state==='loading'&&['success','empty','error'].includes(event))return event;if(event==='cancel'&&state==='loading')return 'idle';return state;}
  function filterNumeric(items,min,max,categories){return items.filter(item=>item.id>=min&&item.id<=max&&(!categories.length||categories.includes(item.category)));}
  return {codeError,checkboxConsent,requestState,filterNumeric};
});
