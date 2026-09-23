/* Company single-select enhancement. Native select remains the data/form source. */
(function(global){
'use strict';
const instances=new WeakMap();let serial=0;
function enhance(select){
 if(instances.has(select))return instances.get(select);
 if(select.multiple||select.size>1)return null;
 const wrapper=document.createElement('span'),trigger=document.createElement('button'),text=document.createElement('span'),arrow=document.createElement('span'),list=document.createElement('div');
 const id='company-select-'+(++serial);wrapper.className='ui-select';trigger.type='button';trigger.className='ui-select-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',id);text.className='ui-select-value';arrow.className='ui-select-arrow';arrow.setAttribute('aria-hidden','true');
 // CSS geometry is a direction indicator, not an added pictorial icon asset.
 list.id=id;list.className='ui-select-list';list.setAttribute('role','listbox');list.hidden=true;
 const usePopover=typeof list.showPopover==='function';if(usePopover)list.setAttribute('popover','manual');
 const width=select.getBoundingClientRect().width;if(width)wrapper.style.width=width+'px';
 select.before(wrapper);wrapper.append(select,trigger,list);trigger.append(text,arrow);
 const originalHidden=select.hidden;select.hidden=true;
 const labels=Array.from(select.labels||[]),labelHandlers=[];
 if(select.getAttribute('aria-labelledby'))trigger.setAttribute('aria-labelledby',select.getAttribute('aria-labelledby'));
 else if(select.getAttribute('aria-label'))trigger.setAttribute('aria-label',select.getAttribute('aria-label'));
 else if(labels.length){labels.forEach((label,i)=>{if(!label.id)label.id=id+'-label-'+i;const handler=e=>{if(e.target===label||(!wrapper.contains(e.target)&&label.contains(e.target))){e.preventDefault();trigger.focus();}};label.addEventListener('click',handler);labelHandlers.push([label,handler]);});trigger.setAttribute('aria-labelledby',labels.map(l=>l.id).join(' '));}
 else trigger.setAttribute('aria-label',select.name||'항목 선택');
 if(trigger.hasAttribute('aria-labelledby'))list.setAttribute('aria-labelledby',trigger.getAttribute('aria-labelledby'));else list.setAttribute('aria-label',trigger.getAttribute('aria-label'));
 let open=false,active=-1,options=[],nodes=[],buffer='',typedAt=0;
 const disabled=o=>o.disabled||(o.parentElement?.tagName==='OPTGROUP'&&o.parentElement.disabled);
 function available(){return options.map((o,i)=>!disabled(o)&&!o.hidden?i:-1).filter(i=>i>=0);}
 function mark(index){active=index;nodes.forEach((n,i)=>n.classList.toggle('is-active',i===index));if(index>=0&&nodes[index]){trigger.setAttribute('aria-activedescendant',nodes[index].id);if(open)nodes[index].scrollIntoView({block:'nearest'});}else trigger.removeAttribute('aria-activedescendant');}
 function position(){if(!open)return;const r=trigger.getBoundingClientRect(),gap=4,spaceBelow=innerHeight-r.bottom-gap-8,spaceAbove=r.top-gap-8,above=spaceBelow<160&&spaceAbove>spaceBelow;const maxHeight=Math.max(40,Math.min(260,above?spaceAbove:spaceBelow));list.style.maxHeight=maxHeight+'px';list.style.width=r.width+'px';list.style.left=Math.max(8,Math.min(r.left,innerWidth-list.offsetWidth-8))+'px';list.style.top=(above?Math.max(8,r.top-gap-Math.min(list.scrollHeight,maxHeight)):r.bottom+gap)+'px';}
 function close(){if(!open)return;open=false;if(usePopover&&list.matches(':popover-open'))list.hidePopover();list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');}
 function refresh(){options=Array.from(select.options);text.textContent=options[select.selectedIndex]?.label||'선택하세요';trigger.disabled=select.disabled;for(const attr of ['aria-invalid','aria-describedby','aria-required']){const v=select.getAttribute(attr);if(v!==null)trigger.setAttribute(attr,v);else trigger.removeAttribute(attr);}if(select.required)trigger.setAttribute('aria-required','true');list.replaceChildren();nodes=options.map((option,index)=>{const node=document.createElement('div');node.id=id+'-option-'+index;node.className='ui-select-option';node.setAttribute('role','option');node.setAttribute('aria-selected',String(index===select.selectedIndex));node.setAttribute('aria-disabled',String(disabled(option)));node.textContent=option.label;node.hidden=option.hidden;node.addEventListener('pointermove',()=>{if(!disabled(option))mark(index);});node.addEventListener('pointerdown',e=>e.preventDefault());node.addEventListener('click',()=>commit(index));list.append(node);return node;});if(select.disabled)close();if(open){mark(available().includes(active)?active:available()[0]??-1);position();}}
 function show(){if(trigger.disabled||open)return;refresh();open=true;list.hidden=false;if(usePopover)list.showPopover();trigger.setAttribute('aria-expanded','true');position();mark(available().includes(select.selectedIndex)?select.selectedIndex:available()[0]??-1);}
 function commit(index){if(index<0||!options[index]||disabled(options[index]))return;const changed=select.selectedIndex!==index;select.selectedIndex=index;close();refresh();trigger.focus();if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}}
 function move(delta){const all=available();if(!all.length)return;let at=all.indexOf(active);mark(all[Math.max(0,Math.min(all.length-1,at<0?(delta>0?0:all.length-1):at+delta))]);}
 function keydown(e){if(e.isComposing)return;const key=e.key;if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(key)){e.preventDefault();if(key==='Enter'||key===' '){if(open)commit(active);else show();return;}const wasOpen=open;if(!open)show();if(key==='Home')mark(available()[0]??-1);else if(key==='End')mark(available().at(-1)??-1);else if(wasOpen)move(key==='ArrowDown'?1:-1);return;}if(key==='Escape'){if(open){e.preventDefault();e.stopPropagation();close();}return;}if(key==='Tab'){close();return;}if(key.length===1&&!e.ctrlKey&&!e.altKey&&!e.metaKey){if(Date.now()-typedAt>700)buffer='';typedAt=Date.now();buffer+=key.toLocaleLowerCase();if(!open)show();const all=available(),start=all.indexOf(active),order=[...all.slice(start+1),...all.slice(0,start+1)];let match=order.find(i=>options[i].label.toLocaleLowerCase().startsWith(buffer));if(match===undefined&&buffer.length>1){buffer=key.toLocaleLowerCase();match=order.find(i=>options[i].label.toLocaleLowerCase().startsWith(buffer));}if(match!==undefined)mark(match);}}
 trigger.addEventListener('click',()=>open?close():show());trigger.addEventListener('keydown',keydown);
 const outside=e=>{if(!wrapper.contains(e.target))close();};const blur=()=>{setTimeout(()=>{if(!wrapper.contains(document.activeElement))close();},0);};trigger.addEventListener('blur',blur);
 document.addEventListener('pointerdown',outside);window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
 select.addEventListener('change',refresh);const invalid=e=>{e.preventDefault();trigger.setAttribute('aria-invalid','true');trigger.focus();};select.addEventListener('invalid',invalid);
 const reset=()=>setTimeout(refresh,0);select.form?.addEventListener('reset',reset);
 const observer=new MutationObserver(refresh);observer.observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','selected','label','hidden','required','aria-invalid','aria-describedby']});
 const api={refresh,close,destroy(){close();observer.disconnect();document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);select.removeEventListener('change',refresh);select.removeEventListener('invalid',invalid);select.form?.removeEventListener('reset',reset);labelHandlers.forEach(([l,h])=>l.removeEventListener('click',h));wrapper.before(select);select.hidden=originalHidden;wrapper.remove();instances.delete(select);}};instances.set(select,api);refresh();return api;
}
global.CompanySelect={enhance,enhanceAll(root=document){return Array.from(root.querySelectorAll('select[data-ui-select]')).map(enhance);},refresh(select){instances.get(select)?.refresh();}};
})(window);
