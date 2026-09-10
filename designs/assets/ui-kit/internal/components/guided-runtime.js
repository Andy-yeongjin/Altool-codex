/* Local UI state only. No storage, transmission or implied production completion. */
(function(global) {
  'use strict';
  const bound = new WeakSet();
  const initialSteps = () => ({current:0, completed:[false,false,false], skipped:false, finished:false});
  const stepStateLabel = (state,index) => index===state.current&&!state.finished?'현재 단계':index===1&&state.skipped?'건너뜀':state.completed[index]?'완료':'대기';
  function stepTransition(state, action) {
    if (action.type === 'reset') return initialSteps();
    const next = {...state, completed:state.completed.slice()};
    if (action.type === 'jump' && Number.isInteger(action.index) && action.index >= 0 && action.index < 3 && (action.index === 0 || state.completed[0])) { next.current = action.index; next.finished = false; }
    if (action.type === 'previous') { next.current = Math.max(0,state.current - 1); next.finished = false; }
    if (action.type === 'next' && action.valid && !state.finished) {
      next.completed[state.current] = true;
      if (state.current === 1) next.skipped = false;
      if (state.current === 2) next.finished = true; else next.current++;
    }
    if (action.type === 'skip' && state.current === 1) { next.skipped = true; next.completed[1] = false; next.current = 2; }
    return next;
  }
  const initialTour = () => ({phase:'idle', current:0, done:[false,false,false]});
  function tourTransition(state, action) {
    if (action.type === 'start') return {...initialTour(),phase:'running'};
    if (action.type === 'stop') return {...state,phase:'stopped'};
    if (state.phase !== 'running') return state;
    const next = {...state,done:state.done.slice()};
    if (action.type === 'action' && action.valid && action.index === state.current) { next.done[state.current] = true; if (state.current < 2) next.current++; }
    if (action.type === 'previous') next.current = Math.max(0,state.current - 1);
    if (action.type === 'next' && state.done[state.current]) next.current = Math.min(2,state.current + 1);
    if (action.type === 'finish' && state.done.every(Boolean)) next.phase = 'finished';
    return next;
  }
  const all = (root,selector) => Array.from(root.querySelectorAll(selector));
  const get = (root,selector) => root.querySelector(selector);
  const text = (root,selector,value) => { const node=get(root,selector); if(node) node.textContent=value; };
  const emit = (root,component,state) => root.dispatchEvent(new root.ownerDocument.defaultView.CustomEvent('altool:change',{bubbles:true,detail:{component,state:JSON.parse(JSON.stringify(state)),scope:'local-ui-only'}}));

  function steps(root) {
    let state=initialSteps();
    const category=get(root,'[data-step-category]'), memo=get(root,'[data-step-memo]'), form=get(root,'[data-step-form]');
    const render = (focus=false) => {
      all(root,'[data-step-link]').forEach(button=>{
        const index=Number(button.dataset.stepLink); button.disabled=index>0&&!state.completed[0];
        if(index===state.current&&!state.finished) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
        text(root,`[data-step-state="${index}"]`,stepStateLabel(state,index));
      });
      all(root,'[data-step-panel]').forEach(panel=>panel.hidden=Number(panel.dataset.stepPanel)!==state.current);
      get(root,'[data-step-previous]').hidden=state.current===0;
      get(root,'[data-step-skip]').hidden=state.current!==1;
      get(root,'[data-step-next]').textContent=state.current===2?'로컬 확인 완료':'다음';
      get(root,'[data-step-next]').disabled=state.finished;
      text(root,'[data-step-summary]',`분류: ${category.value || '미선택'} / 메모: ${memo.value || '없음'}${state.skipped?' (선택 단계 건너뜀)':''}`);
      text(root,'[data-step-status]',state.finished?'로컬 확인을 마쳤습니다. 서버에 제출하지 않았습니다.':`현재 ${state.current+1} / 3 단계`);
      text(root,'[data-step-result]',state.finished?'예제 화면 안의 자료 정리 완료. 실제 저장 결과가 아닙니다.':'');
      if(focus) get(root,`[data-step-panel="${state.current}"] h3`).focus();
      emit(root,'step-indicator',state);
    };
    const transition=action=>{state=stepTransition(state,action);text(root,'[data-step-error]','');render(true);};
    all(root,'[data-step-link]').forEach(button=>button.addEventListener('click',()=>transition({type:'jump',index:Number(button.dataset.stepLink)})));
    get(root,'[data-step-previous]').addEventListener('click',()=>transition({type:'previous'}));
    get(root,'[data-step-skip]').addEventListener('click',()=>transition({type:'skip'}));
    get(root,'[data-step-reset]').addEventListener('click',()=>{form.reset(); category.removeAttribute('aria-invalid');transition({type:'reset'});});
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!category.value) { text(root,'[data-step-error]','자료 분류를 선택해 주세요.'); category.setAttribute('aria-invalid','true'); if(state.current!==0){state.current=0;render();} category.focus();return; }
      category.removeAttribute('aria-invalid'); transition({type:'next',valid:true});
    });
    category.addEventListener('change',()=>{state.completed=[false,false,false];state.finished=false;category.removeAttribute('aria-invalid');text(root,'[data-step-error]','');render();});
    render();
  }

  function tour(root) {
    let state=initialTour(), appliedTitle='';
    const title=get(root,'[data-tour-title]'), category=get(root,'[data-tour-category]'), balloon=get(root,'[data-tour-balloon]');
    const targets=all(root,'[data-tour-target]'), panel=get(root,'[data-guide-panel]'), view=root.ownerDocument.defaultView;
    const mobile=view.matchMedia('(max-width:700px)');
    const descriptions=['제목을 입력한 뒤 제목 적용을 누르면 다음 단계로 이동합니다.','분류를 선택하면 다음 단계로 이동합니다.','미리보기 생성으로 실제 화면 결과를 확인한 다음 따라하기를 마칩니다.'];
    const focusTarget=()=>get(targets[state.current],'input,select,button').focus();
    function closePanel(focus=true) { if(!panel)return; panel.close();get(root,'[data-guide-open]').setAttribute('aria-expanded','false');if(focus)get(root,'[data-guide-open]').focus(); }
    function openPanel(focus=true) { if(!panel||panel.open)return;if(mobile.matches)panel.showModal();else if(focus)panel.show();else panel.setAttribute('open','');get(root,'[data-guide-open]').setAttribute('aria-expanded','true');if(focus)get(panel,'h2').focus(); }
    const render=()=>{
      const running=state.phase==='running'; balloon.hidden=!running;
      targets.forEach((target,index)=>target.classList.toggle('guided-current',running&&index===state.current));
      if(running) {
        targets[state.current].after(balloon);
        text(root,'[data-tour-heading]',`${state.current+1}단계: ${['제목 적용','분류 선택','미리보기 생성'][state.current]}`);
        text(root,'[data-tour-description]',descriptions[state.current]);text(root,'[data-tour-count]',`${state.current+1} / 3`);
      }
      get(root,'[data-tour-previous]').hidden=state.current===0;
      get(root,'[data-tour-next]').hidden=state.current===2||!state.done[state.current];
      get(root,'[data-tour-finish]').hidden=!state.done.every(Boolean);
      all(root,'[data-tour-start]').forEach(button=>{button.hidden=running;button.textContent=state.phase==='idle'?'따라하기 시작':'따라하기 다시 시작';});
      if(panel) {
        get(root,'[data-guide-continue]').hidden=!running;
        get(panel,'[data-tour-stop]').hidden=!running;
      }
      const status=running?`따라하기 ${state.current+1} / 3 단계`:{idle:'따라하기를 시작하지 않았습니다.',stopped:'따라하기를 중단했습니다. 입력 내용은 유지됩니다.',finished:'로컬 미리보기를 확인하고 따라하기를 마쳤습니다.'}[state.phase];
      text(root,'[data-tour-status]',status);text(root,'[data-guide-progress]',status);emit(root,panel?'tutorial-panel':'coach-mark',state);
    };
    function stop() {state=tourTransition(state,{type:'stop'});render(); if(panel){if(!panel.open)openPanel();chooseTab('tour');}get(root,'[data-tour-start]').focus();}
    function complete(index,valid) {const was=state.current;state=tourTransition(state,{type:'action',index,valid});render();if(state.phase==='running'&&state.current!==was)focusTarget();else if(state.phase==='running'&&state.done.every(Boolean))get(root,'[data-tour-finish]').focus();}
    all(root,'[data-tour-start]').forEach(button=>button.addEventListener('click',()=>{state=tourTransition(state,{type:'start'});text(root,'[data-tour-error]','');if(panel)closePanel(false);render();focusTarget();}));
    all(root,'[data-tour-stop]').forEach(button=>button.addEventListener('click',stop));
    get(root,'[data-tour-previous]').addEventListener('click',()=>{state=tourTransition(state,{type:'previous'});render();focusTarget();});
    get(root,'[data-tour-next]').addEventListener('click',()=>{state=tourTransition(state,{type:'next'});render();focusTarget();});
    get(root,'[data-tour-finish]').addEventListener('click',()=>{state=tourTransition(state,{type:'finish'});render();if(panel){openPanel();chooseTab('tour');}get(root,'[data-tour-start]').focus();});
    get(root,'[data-tour-title-form]').addEventListener('submit',event=>{
      event.preventDefault(); const valid=title.value.trim().length>0&&title.value.trim().length<=40;
      title.setAttribute('aria-invalid',String(!valid));text(root,'[data-tour-error]',valid?'':'자료 제목을 1~40자로 입력해 주세요.');
      if(!valid){title.focus();return;}appliedTitle=title.value.trim();get(root,'[data-tour-output]').hidden=true;complete(0,true);
    });
    title.addEventListener('input',()=>{appliedTitle='';get(root,'[data-tour-output]').hidden=true;if(state.phase==='running'){state.done=[false,false,false];state.current=0;render();}});
    category.addEventListener('change',()=>{get(root,'[data-tour-output]').hidden=true;if(state.phase==='running'){state.done[1]=false;state.done[2]=false;if(state.current>1)state.current=1;}complete(1,Boolean(category.value));});
    get(root,'[data-tour-preview]').addEventListener('click',()=>{
      if(!appliedTitle||!category.value){text(root,'[data-tour-error]','제목을 적용하고 분류를 선택한 뒤 미리보기를 만들어 주세요.');(!appliedTitle?title:category).focus();return;}
      text(root,'[data-tour-error]','');text(root,'[data-tour-output-title]',appliedTitle);text(root,'[data-tour-output-category]',`분류: ${category.value} · 로컬 미리보기`);get(root,'[data-tour-output]').hidden=false;complete(2,true);
    });
    function chooseTab(name) {
      if(!panel)return;
      all(panel,'[data-guide-tab]').forEach(button=>{const active=button.dataset.guideTab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
      all(panel,'[data-guide-tabpanel]').forEach(section=>section.hidden=section.dataset.guideTabpanel!==name);
    }
    if(panel) {
      get(root,'[data-guide-open]').addEventListener('click',openPanel);get(root,'[data-guide-close]').addEventListener('click',()=>closePanel());
      panel.addEventListener('cancel',event=>{event.preventDefault();closePanel();});
      get(root,'[data-guide-continue]').addEventListener('click',()=>{closePanel(false);focusTarget();});
      const tabs=all(panel,'[data-guide-tab]');
      tabs.forEach((button,index)=>{button.addEventListener('click',()=>chooseTab(button.dataset.guideTab));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowLeft')next=1-index;if(event.key==='Home')next=0;if(event.key==='End')next=1;if(next!==undefined){event.preventDefault();chooseTab(tabs[next].dataset.guideTab);tabs[next].focus();}});});
      mobile.addEventListener('change',()=>{if(panel.open){closePanel(false);openPanel();}});
      if(!mobile.matches)openPanel(false);
    }
    render();
  }
  function mount(container) {
    const roots=all(container,'[data-guided]');if(container.matches&&container.matches('[data-guided]'))roots.unshift(container);
    roots.forEach(root=>{if(bound.has(root))return;if(root.dataset.guided==='steps')steps(root);else if(root.dataset.guided==='tour')tour(root);else return;bound.add(root);});
  }
  const api={initialSteps,stepStateLabel,stepTransition,initialTour,tourTransition,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(global.document){global.AltoolGuided=api;if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',()=>mount(global.document));else mount(global.document);}
})(typeof window!=='undefined'?window:globalThis);
