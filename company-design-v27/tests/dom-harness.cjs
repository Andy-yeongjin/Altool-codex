// Minimal DOM contract harness for component logic; no layout/browser emulation.
class Node extends EventTarget {
 constructor(tag='div'){super();this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.hidden=false;this.disabled=false;this.selected=false;this.checked=false;this.labels=[];this._value='';this._text='';this.dataset=new Proxy({}, {get:(_,k)=>this.getAttribute('data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())),set:(_,k,v)=>{this.setAttribute('data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),v);return true;},deleteProperty:(_,k)=>{this.removeAttribute('data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()));return true;}});this.classList={contains:c=>this.className.split(' ').includes(c),add:(...names)=>{this.className=[...new Set([...this.className.split(' '),...names])].filter(Boolean).join(' ');},remove:c=>{this.className=this.className.split(' ').filter(x=>x!==c).join(' ');},toggle:(c,on)=>{on??=!this.classList.contains(c);on?this.classList.add(c):this.classList.remove(c);return on;}};}
 get className(){return this.attributes.class||'';}set className(v){this.attributes.class=v;}
 get id(){return this.attributes.id||'';}set id(v){this.attributes.id=v;}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}set textContent(v){this._text=String(v??'');this.children=[];}
 get label(){return this.attributes.label??this.textContent;}
 get value(){if(this.tagName==='SELECT')return this.selectedOptions[0]?.value||'';return this._value;}set value(v){this._value=String(v);if(this.tagName==='SELECT')this.options.forEach(o=>o.selected=o.value===String(v));}
 get options(){return this.querySelectorAll('option');}get selectedOptions(){return this.options.filter(x=>x.selected);}
 get firstChild(){return this.children[0];}get lastChild(){return this.children.at(-1);}
 get scrollHeight(){return 200;}get offsetWidth(){return 200;}
 setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}removeAttribute(k){delete this.attributes[k];}hasAttribute(k){return k in this.attributes;}
 append(...nodes){for(const node of nodes){node.remove();node.parentElement=this;this.children.push(node);}}
 prepend(...nodes){for(const node of nodes.reverse()){node.remove();node.parentElement=this;this.children.unshift(node);}}
 before(node){node.remove();const p=this.parentElement;node.parentElement=p;p.children.splice(p.children.indexOf(this),0,node);}
 replaceChildren(...nodes){this.children.forEach(n=>n.parentElement=null);this.children=[];this._text='';this.append(...nodes);}
 remove(){if(this.parentElement){const p=this.parentElement;p.children=p.children.filter(x=>x!==this);this.parentElement=null;}}
 contains(node){return this===node||this.children.some(c=>c.contains(node));}
 matches(selector){if(selector.includes(','))return selector.split(',').some(s=>this.matches(s.trim()));let s=selector;if(s.includes(':not(:disabled)')){if(this.disabled)return false;s=s.replace(':not(:disabled)','');}const tag=/^[\w-]+/.exec(s)?.[0];if(tag&&this.tagName!==tag.toUpperCase())return false;for(const c of s.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(c[1]))return false;for(const a of s.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g))if(!this.hasAttribute(a[1])||a[2]!==undefined&&this.getAttribute(a[1])!==a[2])return false;return true;}
 querySelectorAll(selector){const result=[];for(const n of this.children){if(n.matches(selector))result.push(n);result.push(...n.querySelectorAll(selector));}return result;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 closest(selector){return this.matches(selector)?this:this.parentElement?.closest(selector)||null;}
 focus(){global.document.activeElement=this;}
 click(){if(!this.disabled)this.dispatchEvent(new Event('click',{cancelable:true}));}
 getBoundingClientRect(){return {width:200,left:100,right:300,top:100,bottom:134};}
 scrollIntoView(){}
 showModal(){this.open=true;}close(){this.open=false;this.dispatchEvent(new Event('close'));}
 setCustomValidity(message){this.validationMessage=message;this.validity={valid:!message,customError:!!message};}
}
const document=new Node('document');document.createElement=tag=>new Node(tag);document.activeElement=null;global.document=document;global.innerHeight=800;global.innerWidth=1200;global.MutationObserver=class{observe(){}disconnect(){}};global.CustomEvent=class extends Event{constructor(type,options={}){super(type,options);this.detail=options.detail;}};global.addEventListener=()=>{};global.removeEventListener=()=>{};global.window=global;
module.exports={Node,document};
