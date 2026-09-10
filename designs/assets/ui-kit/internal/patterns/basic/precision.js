/* Inclusive local date/time precision filters; no requests or persistent storage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.KrdsBasicPrecision=api;api.mount(root,document);}})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function valid(value,kind){return !value||(kind==='month'?/^\d{4}-(0[1-9]|1[0-2])$/:/^([01]\d|2[0-3]):[0-5]\d$/).test(value);}
  function filter(items,kind,from,to){if(!valid(from,kind)||!valid(to,kind)||(from&&to&&from>to))return null;return items.filter(item=>{const value=kind==='month'?item.date.slice(0,7):item.time;return (!from||value>=from)&&(!to||value<=to);});}
  function mount(win,doc){
    const $=id=>doc.getElementById(id);const on=(id,event,fn)=>$(id).addEventListener(event,fn);
    const media=win.matchMedia('(max-width:700px)');const adapt=()=>{$('long-toc').open=!media.matches;};adapt();media.addEventListener('change',adapt);
    doc.querySelectorAll('#long-toc a').forEach(link=>link.addEventListener('click',()=>{const target=$(link.getAttribute('href').slice(1));target.focus();if(media.matches)$('long-toc').open=false;}));
    for(const kind of ['month','time']){
      const items=win.KrdsBasic.records.map((item,i)=>({...item,time:`${String(i).padStart(2,'0')}:00`}));let page=1;let applied={from:'',to:''};
      function render(){const rows=filter(items,kind,applied.from,applied.to);const paged=win.KrdsBasic.paginate(rows,page);page=paged.page;$(`${kind}-count`).textContent=`검색 결과 ${rows.length}개`;$(`${kind}-applied`).textContent=`적용 범위: ${applied.from||'시작 제한 없음'} ~ ${applied.to||'종료 제한 없음'}`;$(`${kind}-page`).textContent=`${page} / ${paged.pages}페이지`;$(`${kind}-prev`).disabled=page===1;$(`${kind}-next`).disabled=page===paged.pages;const list=$(`${kind}-results`);list.replaceChildren();for(const item of paged.items){const li=doc.createElement('li');li.textContent=`${item.title} · ${kind==='month'?item.date:item.time}`;list.append(li);}if(!rows.length){const li=doc.createElement('li');li.textContent='검색 결과가 없어요. 범위를 넓히거나 초기화해 주세요.';list.append(li);}}
      on(`${kind}-form`,'submit',event=>{event.preventDefault();const from=$(`${kind}-from`).value,to=$(`${kind}-to`).value;const invalid=filter(items,kind,from,to)===null;$(`${kind}-error`).textContent=invalid?'시작·종료 형식을 확인하고 시작이 종료보다 늦지 않게 입력해 주세요.':'';for(const side of ['from','to'])$(`${kind}-${side}`).setAttribute('aria-invalid',String(invalid));if(invalid){$(`${kind}-from`).focus();return;}applied={from,to};page=1;render();});
      on(`${kind}-reset`,'click',()=>{$(`${kind}-form`).reset();applied={from:'',to:''};page=1;$(`${kind}-error`).textContent='';for(const side of ['from','to'])$(`${kind}-${side}`).removeAttribute('aria-invalid');render();});
      on(`${kind}-prev`,'click',()=>{page--;render();});on(`${kind}-next`,'click',()=>{page++;render();});render();
    }
  }
  return {valid,filter,mount};
});
