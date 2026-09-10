/* Independent layout alternatives. Uses the same testable local rules; no external requests. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const text=(id,value)=>{$(id).textContent=value;};
  if(document.body.dataset.variant==='detail-tabs'){
    const tabs=Array.from(document.querySelectorAll('[role=tab]'));
    function select(tab,focus=false){tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;$(item.getAttribute('aria-controls')).hidden=!selected;});if(focus)tab.focus();}
    tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(tabs[next],true);});});
  }
  if(document.body.dataset.variant==='filter-layouts'){
    const core=window.KrdsBasic;
    const keys=['keyword','category','from','to'];
    const labels={keyword:'검색어',category:'분야',from:'시작일',to:'종료일'};
    const navigation=window.KrdsBasicNavigation.attach(window,document,'filter-layouts.html',()=>({page,applied,layout:$('variant-layout').value}));
    let applied={keyword:'',category:'',from:'',to:'',sort:'newest',...navigation.state.applied};
    let page=navigation.state.page;
    function fillApplied(){keys.forEach(key=>$(`variant-${key}`).value=applied[key]);text('variant-range-error','');}
    function render(){const result=core.paginate(core.filterRecords(core.records,applied),page);page=result.page;text('variant-count',`검색 결과 ${result.total}개`);text('variant-page',`${page} / ${result.pages}페이지`);$('variant-prev').disabled=page===1;$('variant-next').disabled=page===result.pages;const chosen=keys.filter(key=>applied[key]);text('variant-applied',chosen.length?`적용 조건 ${chosen.length}개 · 정렬: ${applied.sort==='newest'?'최신순':'오래된순'}`:`적용된 필터 없음 · 정렬: ${applied.sort==='newest'?'최신순':'오래된순'}`);const chips=$('variant-chips');chips.replaceChildren();chosen.forEach(key=>{const button=document.createElement('button');button.type='button';button.textContent=`${labels[key]}: ${applied[key]} 해제`;button.addEventListener('click',()=>{applied[key]='';fillApplied();page=1;render();$('variant-reset').focus();});chips.append(button);});const list=$('variant-results');list.replaceChildren();result.items.forEach(item=>{const row=document.createElement('li');const heading=document.createElement('h2');const link=document.createElement('a');link.href=`detail.html?example=${item.id}`;navigation.link(link,item.id);link.textContent=item.title;heading.append(link);const info=document.createElement('p');info.textContent=`${item.category} · ${item.date}`;row.append(heading,info);list.append(row);});if(!result.total){const empty=document.createElement('li');empty.textContent='검색 결과가 없어요. 조건을 줄이거나 초기화해 주세요.';list.append(empty);}}
    $('variant-layout').addEventListener('change',()=>{fillApplied();const modal=$('variant-layout').value==='modal';$(modal?'variant-modal-host':'variant-bar-host').append($('variant-filter-form'));$('variant-open').hidden=!modal;$('variant-cancel').hidden=!modal;});
    $('variant-open').addEventListener('click',()=>{fillApplied();$('variant-dialog').showModal();});
    $('variant-cancel').addEventListener('click',()=>$('variant-dialog').close());
    $('variant-dialog').addEventListener('close',()=>{fillApplied();$('variant-open').focus();});
    $('variant-filter-form').addEventListener('submit',event=>{event.preventDefault();const next=Object.fromEntries(keys.map(key=>[key,$(`variant-${key}`).value]));if(!core.validRange(next.from,next.to)){text('variant-range-error','종료일은 시작일과 같거나 늦어야 합니다.');$('variant-to').focus();return;}applied={...next,sort:$('variant-sort').value};page=1;render();text('variant-range-error','');if($('variant-dialog').open)$('variant-dialog').close();});
    $('variant-sort').addEventListener('change',()=>{applied.sort=$('variant-sort').value;page=1;render();});
    $('variant-reset').addEventListener('click',()=>{applied={keyword:'',category:'',from:'',to:'',sort:'newest'};page=1;$('variant-sort').value='newest';fillApplied();render();});
    $('variant-prev').addEventListener('click',()=>{page--;render();});
    $('variant-next').addEventListener('click',()=>{page++;render();});
    $('variant-sort').value=applied.sort;$('variant-layout').value=navigation.state.layout;
    if(navigation.state.layout==='modal'){$('variant-modal-host').append($('variant-filter-form'));$('variant-open').hidden=false;$('variant-cancel').hidden=false;}
    fillApplied();render();navigation.restore();
  }
})();
