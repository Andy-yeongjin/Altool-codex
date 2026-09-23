/* Local demonstration only. No network, storage, authentication, or production submissions. */
(function(){
  'use strict';
  const core=window.KrdsBasic;
  const $=id=>document.getElementById(id);
  const text=(id,value)=>{$(id).textContent=value;};
  const on=(id,event,fn)=>$(id)?.addEventListener(event,fn);
  const value=id=>$(id).value;
  function message(id,content,error=false){text(id,content);$(id).classList.toggle('error',error);$(id).classList.toggle('success',!error&&!!content);}
  function fieldError(inputId,messageId,error){const input=$(inputId);input.setAttribute('aria-invalid',error?'true':'false');text(messageId,error||'');}
  const dialogReturn=new Map();
  function openDialog(id,returnElement=document.activeElement){dialogReturn.set(id,returnElement);$(id).showModal();}
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{const target=dialogReturn.get(dialog.id);if(target?.isConnected&&!target.disabled)target.focus();}));
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  document.querySelectorAll('form').forEach(form=>form.addEventListener('submit',event=>event.preventDefault()));

  function identity(){
    on('identity-form','submit',()=>{
      const values={name:value('person-name'),birth:value('person-birth'),phone:value('person-phone')};
      const errors=core.validIdentity(values);
      const office=value('office-phone');
      if(office&&!core.validPhone(office))errors.office='사무실 전화번호를 확인해 주세요. 공백·하이픈을 사용할 수 있습니다.';
      for(const key of ['name','birth','phone'])fieldError(`person-${key}`,`${key}-error`,errors[key]);
      fieldError('office-phone','office-error',errors.office);
      if(value('preferred-phone')==='main'&&!values.phone.trim())errors.preferred='주 연락처로 선택한 연락 전화번호를 입력해 주세요.';
      if(value('preferred-phone')==='office'&&!office.trim())errors.preferred='주 연락처로 선택한 사무실 전화번호를 입력해 주세요.';
      if(Object.keys(errors).length){message('identity-status',errors.preferred||'입력 내용을 확인해 주세요. 표시된 항목을 수정할 수 있습니다.',true);const first=Object.keys(errors)[0];$(first==='office'?'office-phone':first==='preferred'?'preferred-phone':`person-${first}`).focus();}
      else message('identity-status','입력 형식을 확인했습니다. 입력값은 전송하거나 저장하지 않았습니다.');
    });
    on('person-birth','blur',()=>fieldError('person-birth','birth-error',value('person-birth')&&!core.validBirth(value('person-birth'))?'생년월일을 실제 날짜 8자리로 입력해 주세요.':''));
  }

  function help(){
    const tooltip=$('tooltip-toggle');
    function showTip(show){$('tooltip-text').hidden=!show;tooltip.setAttribute('aria-expanded',String(show));}
    tooltip.addEventListener('click',()=>showTip($('tooltip-text').hidden));
    tooltip.addEventListener('focus',()=>showTip(true));
    tooltip.addEventListener('blur',()=>showTip(false));
    tooltip.addEventListener('mouseenter',()=>showTip(true));
    tooltip.addEventListener('mouseleave',()=>{if(document.activeElement!==tooltip)showTip(false);});
    tooltip.addEventListener('keydown',event=>{if(event.key==='Escape')showTip(false);});
    on('preview-title','click',()=>text('help-preview',value('help-title').trim()?`미리보기: ${value('help-title').trim()}`:'제목을 먼저 입력해 주세요.'));
    on('help-panel-toggle','click',()=>{const show=$('help-panel').hidden;$('help-panel').hidden=!show;$('help-panel-toggle').setAttribute('aria-expanded',String(show));text('help-panel-toggle',show?'도움 패널 접기':'도움 패널 열기');if(!show)stopTour();});
    let step=0;
    const instructions=['1 / 2단계: 안내문 제목에 핵심 내용을 한 문장으로 입력하세요.','2 / 2단계: 제목 미리보기를 눌러 입력 내용을 확인하세요.'];
    function renderTour(){text('tour-step',instructions[step]);$('tour-prev').disabled=step===0;text('tour-next',step===1?'따라하기 마치기':'다음 단계');['tour-title','tour-preview'].forEach((id,i)=>$(id).classList.toggle('tour-target',i===step));}
    function stopTour(){$('tour').hidden=true;['tour-title','tour-preview'].forEach(id=>$(id).classList.remove('tour-target'));}
    on('tour-start','click',()=>{step=0;$('tour').hidden=false;renderTour();});
    on('tour-next','click',()=>{if(step===1){stopTour();$('tour-start').focus();}else{step++;renderTour();}});
    on('tour-prev','click',()=>{step=Math.max(0,step-1);renderTour();});
    on('tour-stop','click',()=>{stopTour();$('tour-start').focus();});
  }

  function consent(){
    const radios=Array.from(document.querySelectorAll('#consent-form input[type=radio]'));
    const selected=name=>document.querySelector(`input[name="${name}"]:checked`)?.value||'';
    function sync(){$('consent-all').checked=core.consentState(selected('requiredConsent'),selected('optionalConsent')).all;}
    on('consent-all','change',()=>{const yes=$('consent-all').checked;radios.forEach(radio=>radio.checked=radio.value===(yes?'yes':'no'));});
    radios.forEach(radio=>radio.addEventListener('change',sync));
    on('consent-form','submit',()=>{const allowed=core.consentState(selected('requiredConsent'),selected('optionalConsent')).canContinue;message('consent-status',allowed?'필수 항목 선택을 확인했습니다. 선택 항목의 동의 여부와 관계없이 진행할 수 있습니다. 실제 동의 기록은 생성하지 않았습니다.':'필수 예제 이용 조건의 동의 여부를 확인해 주세요. 동의하지 않으면 이 예제의 다음 단계로 진행하지 않습니다.',!allowed);if(!allowed)radios[0].focus();});
  }

  function list(){
    const navigation=window.KrdsBasicNavigation.attach(window,document,'list.html',()=>({page,keyword,view:value('list-view'),expanded:Array.from(document.querySelectorAll('#list-results details[open]')).map(item=>Number(item.dataset.record))}));
    let page=navigation.state.page;let keyword=navigation.state.keyword;
    $('list-keyword').value=keyword;$('list-view').value=navigation.state.view;
    function render(){const matching=core.records.filter(item=>`${item.title} ${item.summary}`.includes(keyword)).sort((a,b)=>Number(b.priority)-Number(a.priority)||a.id-b.id);const result=core.paginate(matching,page);page=result.page;text('list-count',`검색 결과 ${result.total}개`);text('list-page',`${page} / ${result.pages}페이지`);$('list-prev').disabled=page===1;$('list-next').disabled=page===result.pages;const container=$('list-results');container.replaceChildren();if(!result.total){const empty=document.createElement('p');empty.textContent='검색 결과가 없어요. 검색어를 바꾸거나 초기화해 주세요.';container.append(empty);return;}const view=value('list-view');let target;if(view==='table'){const wrap=document.createElement('div');wrap.className='table-wrap';const table=document.createElement('table');const caption=document.createElement('caption');caption.textContent='안내문 목록';table.append(caption);const head=document.createElement('thead');const tr=document.createElement('tr');['제목','분야','게시일'].forEach(label=>{const th=document.createElement('th');th.scope='col';th.textContent=label;tr.append(th);});head.append(tr);table.append(head);target=document.createElement('tbody');table.append(target);wrap.append(table);container.append(wrap);}else{target=document.createElement('ul');target.className='list';container.append(target);}
      result.items.forEach(item=>{const link=document.createElement('a');link.href=`detail.html?example=${item.id}`;navigation.link(link,item.id);link.textContent=`${item.priority?'[중요] ':''}${item.title}`;if(view==='table'){const row=document.createElement('tr');const first=document.createElement('td');first.append(link);row.append(first);for(const value of [item.category,item.date]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}target.append(row);}else{const li=document.createElement('li');if(view==='accordion'){const details=document.createElement('details');details.dataset.record=item.id;details.open=navigation.state.expanded.includes(item.id);const summary=document.createElement('summary');summary.textContent=link.textContent;const p=document.createElement('p');p.textContent=`${item.category} · ${item.date} · ${item.summary}`;details.append(summary,p,link);li.append(details);}else{const heading=document.createElement('h3');heading.append(link);const p=document.createElement('p');p.textContent=`${item.category} · ${item.date} · ${item.summary}`;li.append(heading,p);}target.append(li);}});
    }
    on('list-search','submit',()=>{keyword=value('list-keyword').trim();page=1;render();});on('list-reset','click',()=>{$('list-keyword').value='';keyword='';page=1;render();});on('list-view','change',render);on('list-prev','click',()=>{page--;render();});on('list-next','click',()=>{page++;render();});render();navigation.restore();
  }

  function feedback(){
    let rating='';
    document.querySelectorAll('[data-rating]').forEach(button=>button.addEventListener('click',()=>{rating=button.dataset.rating;document.querySelectorAll('[data-rating]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));$('feedback-form').hidden=false;text('feedback-status',`${rating}을 선택했습니다. 추가 의견은 선택 사항입니다.`);}));
    function complete(){if(!rating)return;$('feedback-form').hidden=true;document.querySelectorAll('[data-rating]').forEach(button=>button.disabled=true);text('feedback-title','평가 연습을 마쳤어요');text('feedback-status',`${rating} 평가를 확인했습니다. 의견은 전송하거나 저장하지 않았습니다.`);$('feedback-comment').value='';$('feedback-status').tabIndex=-1;$('feedback-status').focus();}
    on('feedback-form','submit',complete);on('feedback-skip','click',complete);
    document.querySelectorAll('[data-star]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-star]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));text('star-status',`${button.dataset.star}점 평가 연습을 마쳤어요. 전송하거나 저장하지 않았습니다.`);}));
  }

  function error(){
    on('error-form','submit',()=>{const invalid=!value('error-title').trim();fieldError('error-title','error-title-message',invalid?'연습 제목을 입력해 주세요. 입력한 내용은 그대로 유지됩니다.':'');message('error-status',invalid?'제목 항목을 확인해 주세요.':'제목을 확인했습니다. 실제 요청은 하지 않았습니다.',invalid);if(invalid)$('error-title').focus();});
    on('error-server','click',()=>openDialog('error-dialog',$('error-title')));
  }

  function form(){
    let draft=null;let submitting=false;
    on('draft-save','click',()=>{draft={title:value('request-title'),count:value('request-count'),note:value('request-note')};$('draft-restore').disabled=false;message('request-status','이 탭의 메모리에 임시 저장했습니다. 새로고침하면 사라집니다.');});
    on('draft-restore','click',()=>{if(!draft)return;for(const key of ['title','count','note'])$(`request-${key}`).value=draft[key];message('request-status','임시 저장한 내용을 불러왔습니다.');});
    on('request-form','submit',()=>{if(submitting)return;const errors=core.formErrors({title:value('request-title'),count:value('request-count')});for(const key of ['title','count'])fieldError(`request-${key}`,`request-${key}-error`,errors[key]);if(Object.keys(errors).length){message('request-status','표시된 항목을 확인해 주세요. 입력값은 유지됩니다.',true);$(`request-${Object.keys(errors)[0]}`).focus();return;}submitting=true;$('request-submit').disabled=true;$('request-form').setAttribute('aria-busy','true');message('request-status','입력을 확인하고 있습니다. (연습)');window.setTimeout(()=>{submitting=false;$('request-submit').disabled=false;$('request-form').removeAttribute('aria-busy');message('request-status','요청 연습을 완료했습니다. 서버로 전송하지 않았습니다.');},500);});
    on('request-count','blur',()=>{const errors=core.formErrors({title:'연습',count:value('request-count')});fieldError('request-count','request-count-error',errors.count);});
    on('open-note','click',()=>openDialog('note-dialog'));
    on('note-form','submit',()=>{if(!$('note-form').reportValidity())return;text('note-result',`연습 메모: ${value('modal-note')}`);$('note-dialog').close();});
    on('wizard-next','click',()=>{const title=value('wizard-title').trim();if(!title){fieldError('wizard-title','wizard-error','연습 제목을 입력해 주세요.');$('wizard-title').focus();return;}fieldError('wizard-title','wizard-error','');text('wizard-summary',`이전 단계 제목: ${title}`);$('wizard-first').hidden=true;$('wizard-second').hidden=false;text('wizard-progress','2 / 2단계: 이전 입력 확인');$('wizard-back').focus();});
    on('wizard-back','click',()=>{$('wizard-first').hidden=false;$('wizard-second').hidden=true;text('wizard-progress','1 / 2단계: 연습 제목');$('wizard-title').focus();});
    on('wizard-finish','click',()=>text('wizard-progress','단계 연습을 완료했습니다. 실제로 제출하지 않았습니다.'));
  }

  function filter(){
    const navigation=window.KrdsBasicNavigation.attach(window,document,'filter.html',()=>({page,applied,mode:value('filter-mode')}));
    let page=navigation.state.page;let applied={sort:'newest',...navigation.state.applied};
    const fieldKeys=['scope','keyword','category','from','to','region','district','operator','extra'];
    const labels={keyword:'검색어',category:'분야',from:'시작일',to:'종료일',region:'권역',district:'구',extra:'추가 검색어'};
    for(const key of [...fieldKeys,'sort'])if(applied[key]!==undefined)$(`filter-${key}`).value=applied[key];
    $('filter-mode').value=navigation.state.mode;
    function collect(){return Object.fromEntries([...fieldKeys,'sort'].map(key=>[key,value(`filter-${key}`)]));}
    function syncDistrict(){const region=value('filter-region');const district=$('filter-district');const previous=district.value;district.replaceChildren();const options=['',...(region==='중부'?['가람구']:region==='남부'?['나래구']:['가람구','나래구'])];for(const name of options){const option=document.createElement('option');option.value=name;option.textContent=name||'전체 구';district.append(option);}district.value=options.includes(previous)?previous:'';}
    function render(){const result=core.paginate(core.filterRecords(core.records,applied),page);page=result.page;text('filter-count',`검색 결과 ${result.total}개 · 적용된 조건 ${Object.keys(labels).filter(key=>applied[key]).length}개`);text('filter-page',`${page} / ${result.pages}페이지`);$('filter-prev').disabled=page===1;$('filter-next').disabled=page===result.pages;const body=$('filter-results');body.replaceChildren();for(const item of result.items){const row=document.createElement('tr');const cell=document.createElement('td');const link=document.createElement('a');link.href=`detail.html?example=${item.id}`;navigation.link(link,item.id);link.textContent=item.title;cell.append(link);row.append(cell);for(const value of [item.category,item.date]){const td=document.createElement('td');td.textContent=value;row.append(td);}body.append(row);}if(!result.total){const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=3;cell.textContent='검색 결과가 없어요. 조건을 줄이거나 초기화해 주세요.';row.append(cell);body.append(row);}const chips=$('filter-chips');chips.replaceChildren();for(const [key,label] of Object.entries(labels)){if(!applied[key])continue;const button=document.createElement('button');button.type='button';button.textContent=`${label}: ${applied[key]} 해제`;button.addEventListener('click',()=>{applied[key]='';$(`filter-${key}`).value='';if(key==='region'){applied.district='';$('filter-district').value='';syncDistrict();}page=1;render();$('filter-reset').focus();globalThis.CompanyRecipeControls?.refresh();});chips.append(button);}$('filter-title-head').setAttribute('aria-sort',applied.sort==='title-asc'?'ascending':applied.sort==='title-desc'?'descending':'none');}
    function apply(){const options=collect();if(!core.validRange(options.from,options.to)){message('filter-range-error','종료일은 시작일보다 같거나 늦어야 합니다.',true);return;}message('filter-range-error','');applied=options;page=1;render();text('filter-state','선택한 조건을 적용했습니다.');}
    on('filter-form','submit',apply);
    $('filter-form').addEventListener('change',event=>{if(event.target.id==='filter-region')syncDistrict();if(value('filter-mode')==='instant')apply();else text('filter-state','변경한 조건은 필터 적용을 눌러 반영하세요.');});
    on('filter-sort','change',()=>{if(value('filter-mode')==='instant')apply();else text('filter-state','변경한 정렬은 필터 적용을 눌러 반영하세요.');});
    on('filter-mode','change',()=>{if(value('filter-mode')==='instant')apply();});
    on('filter-reset','click',()=>{$('filter-form').reset();$('filter-sort').value='newest';syncDistrict();applied=collect();page=1;message('filter-range-error','');render();text('filter-state','모든 필터와 정렬을 초기화했습니다.');globalThis.CompanyRecipeControls?.refresh();});
    on('filter-inline-sort','click',()=>{applied.sort=applied.sort==='title-asc'?'title-desc':'title-asc';$('filter-sort').value=applied.sort;render();text('filter-state','제목 정렬을 적용했습니다.');globalThis.CompanyRecipeControls?.refresh();});
    on('filter-prev','click',()=>{page--;render();});on('filter-next','click',()=>{page++;render();});
    on('filter-toggle','click',()=>{const show=$('filter-panel').hidden;$('filter-panel').hidden=!show;$('filter-toggle').setAttribute('aria-expanded',String(show));text('filter-toggle',show?'필터 접기':'필터 펼치기');});syncDistrict();render();navigation.restore();
  }

  function confirm(){
    on('confirm-open','click',()=>openDialog('confirm-dialog'));
    on('confirm-leave','click',()=>openDialog('leave-dialog'));
    on('confirm-delete','click',()=>{$('confirm-dialog').close();text('confirm-record','이 탭의 가상 초안이 없습니다.');message('confirm-status','가상 초안을 삭제했습니다. 실제 파일은 변경하지 않았습니다.');$('confirm-open').disabled=true;$('confirm-reset').hidden=false;$('confirm-reset').focus();});
    on('confirm-reset','click',()=>{text('confirm-record','연습 초안 1건이 있습니다.');message('confirm-status','연습용 초안을 다시 만들었습니다.');$('confirm-open').disabled=false;$('confirm-reset').hidden=true;$('confirm-open').focus();});
  }
  function detail(){const id=Number(new URLSearchParams(window.location.search).get('example'));const item=core.records.find(record=>record.id===id);if(item){text('detail-name',item.title);document.title=`${item.title} · 상세 정보 확인 예제`;}const back=document.querySelector('a[href="list.html"]');const destination=window.KrdsBasicNavigation.safeReturn(new URLSearchParams(window.location.search).get('return'));if(back){back.href=destination;back.textContent='이전 목록으로 돌아가기';}}
  const initializers={identity,help,consent,list,feedback,detail,error,form,filter,confirm};
  initializers[document.body.dataset.pattern]?.();
})();
