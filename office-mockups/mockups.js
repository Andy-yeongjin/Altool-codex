'use strict';
const B=CompanyBusiness, app=document.querySelector('#company-app'), page=app.dataset.page;
const byId=id=>document.getElementById(id);
B.responsiveNavigation(app);
const showFooterHelp=kind=>{
  const content=document.createElement('p');
  content.textContent=kind==='guide'?'공통 UI 검토용 목업입니다. 페이지 메뉴로 업무 화면을 이동할 수 있으며 입력 내용은 실제 업무 시스템으로 전송되지 않습니다.':'목업에는 실제 문의처가 연결되어 있지 않습니다. 회사 도입 시 담당 부서와 연락처를 설정합니다.';
  const dialog=B.dialog(app,kind==='guide'?'이용 안내':'문의');
  dialog.body.append(content);
  dialog.element.addEventListener('close',()=>dialog.destroy(),{once:true});
  dialog.open();
};
B.companyFrame(app,{assetsBaseUrl:'../designs/assets/',onGuide:()=>showFooterHelp('guide'),onContact:()=>showFooterHelp('contact')});
CompanySelect.enhanceAll();
document.querySelectorAll('[data-date-input]').forEach(input=>B.datePicker(input));
const make=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node;};
const records=[['01','팀 회의 식비','재무팀',68000,'대기'],['02','고객 방문 교통비','영업팀',42000,'대기'],['03','개발 도서 구매','개발팀',96000,'완료'],['04','사무용품 구매','재무팀',34000,'대기']];
if(page==='monitor'){records.forEach((r,i)=>{r[1]=['ERP → 회계 전표','인사 → 조직 정보','구매 → 예산 집행','그룹웨어 → 결재'][i];r[3]=[128,42,96,34][i];r[4]=i===1?'실패':'정상';});document.querySelectorAll('thead th')[4].textContent='처리 건수';}
let table;
function render(){const query=byId('query').value.trim(),dept=byId('department').value,from=byId('from').value;const shown=records.filter(r=>(dept==='전체'||r[2]===dept)&&(!from||from<='2026-09-11')&&(r[1].includes(query)||r[0].includes(query)));
byId('rows').replaceChildren();for(const row of shown){const tr=document.createElement('tr'),cell=document.createElement('td'),box=document.createElement('input');box.type='checkbox';box.disabled=page==='monitor'?row[4]!=='실패':row[4]!=='대기';box.value=row[0];box.dataset.rowSelect='';box.setAttribute('aria-label',row[1]+' 선택');cell.append(box);tr.append(cell);
 for(const value of [row[0],row[1],row[2],row[3].toLocaleString('ko-KR'),row[4]])tr.append(make('td',value));
 const last=document.createElement('td'),button=make('button',page==='monitor'?'로그 조회':'보기');button.type='button';button.onclick=()=>{const dialog=B.dialog(app,page==='monitor'?'연계 로그':'내역 상세');dialog.body.append(make('p',row[1]),make('p',page==='monitor'?(row[4]==='실패'?'오류 코드: DEMO_TIMEOUT · 응답 시간 초과':'시연 처리 완료'):row[3].toLocaleString('ko-KR')+' 원'));if(page==='monitor'&&row[4]==='실패'){const retry=make('button','재처리');retry.onclick=()=>{row[4]='정상';dialog.body.append(make('p','모의 재처리 완료'));render();};dialog.actions.append(retry);}dialog.element.addEventListener('close',()=>dialog.destroy(),{once:true});dialog.open();};last.append(button);tr.append(last);byId('rows').append(tr);}
 byId('result-count').textContent=`· 총 ${shown.length}건`;table?.refresh();}
if(byId('filters')){const batch=document.querySelector('[data-batch-action]'),verb=page==='monitor'?'재처리':'승인';batch.textContent='선택 '+verb;batch.dataset.uiAction=page==='monitor'?'retry':'approve';document.querySelector('.ui-table-selection-help').textContent=page==='monitor'?'실패한 연계 항목만 재처리할 수 있습니다.':'승인 대기 내역만 선택할 수 있습니다.';byId('filters').onsubmit=e=>{e.preventDefault();render();};byId('filters').onreset=()=>setTimeout(render,0);render();table=B.tableTools(byId('table-root'),{async onAction(action,ids){const targets=records.filter(r=>ids.includes(r[0])&&(page==='monitor'?r[4]==='실패':r[4]==='대기'));if(!targets.length)return;if(!await B.confirm(app,{title:'선택 '+verb,message:`선택한 ${targets.length}건을 모의 ${verb}할까요?`,action:verb}))return;targets.forEach(r=>r[4]=page==='monitor'?'정상':'승인');render();B.toast(app,`모의 ${verb} 완료 · ${targets.length}건`);}});byId('clear-selection').onclick=()=>{byId('table-root').querySelectorAll('input[type="checkbox"]').forEach(e=>e.checked=false);table.refresh();};}
if(byId('preview-state'))byId('preview-state').onchange=e=>{const type={'빈 결과':'empty','오류':'error','로딩':'loading'}[e.target.value];byId('state').hidden=!type;if(byId('result-content'))byId('result-content').hidden=Boolean(type);if(type)B.systemState(byId('state'),{type,onAction:()=>{byId('preview-state').value='정상';CompanySelect.refresh?.(byId('preview-state'));byId('state').hidden=true;if(byId('result-content'))byId('result-content').hidden=false;}});};
if(page==='request'){B.attachments(byId('attachments'));byId('request-form').onsubmit=async e=>{e.preventDefault();if(!B.validateForm(e.target))return;if(await B.confirm(app,{title:'신청 확인',message:'입력한 내용으로 모의 신청할까요?',action:'신청'}))byId('saved').textContent=`모의 접수 완료 · ${byId('title').value} · 외부 전송 없음`;};byId('request-form').addEventListener('reset',()=>byId('saved').textContent='');}
if(page==='detail'){const history=[{status:'pending',statusLabel:'신청',actor:'김가상',time:'2026-09-11T09:00:00+09:00',timeLabel:'2026-09-11 09:00',comment:'모니터 구매 신청'}];const draw=()=>B.timeline(byId('history'),history);draw();for(const [id,label]of [['approve','승인'],['reject','반려']])byId(id).onclick=async()=>{if(!await B.confirm(app,{title:label+' 확인',message:'실제 결재가 아닌 목업 상태 변경입니다.',action:label}))return;byId('approval-status').textContent=label;history.push({status:'done',statusLabel:label,actor:'시연 담당자',time:'2026-09-11T10:00:00+09:00',timeLabel:'2026-09-11 10:00',comment:'모의 처리'});draw();};}
if(page==='dashboard'){B.barChart(byId('chart-spent'),{title:'집행 금액',unit:'만원',items:[{label:'재무팀',value:800},{label:'영업팀',value:1600},{label:'개발팀',value:1200}]});B.barChart(byId('chart-left'),{title:'잔여 예산',unit:'만원',items:[{label:'재무팀',value:700},{label:'영업팀',value:900},{label:'개발팀',value:800}]});}
