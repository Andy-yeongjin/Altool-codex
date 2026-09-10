import {createAssetClient} from './assets.mjs';
const failure=document.querySelector('#failure');
const fail=error=>{failure.hidden=false;failure.textContent=`공통 자산 확인 실패: ${error.message}`;};
const modal=document.querySelector('#settings');
document.querySelector('#close').addEventListener('click',()=>modal.close());
try {
  // Separate clients demonstrate that independent applications resolve the same pack.
  const clients=await Promise.all([createAssetClient(new URL('../',import.meta.url)),createAssetClient(new URL('../',import.meta.url))]);
  document.querySelector('#release').textContent=`${clients[0].pack}@${clients[0].release} · 동일 ID·동일 원본`;
  for(const [index,app] of [...document.querySelectorAll('[data-app]')].entries()){
    const client=clients[index];
    const settings=app.querySelector('[data-settings]');
    settings.prepend(await client.icon('icon.settings',{label:'',size:24}));settings.disabled=false;
    settings.addEventListener('click',()=>modal.showModal());
    const show=app.querySelector('[data-error]');show.disabled=false;
    const message=app.querySelector('[data-message]');
    show.addEventListener('click',()=>client.renderMessage(message,'message.error.network',{onAction:()=>{
      // This is deliberately a state demonstration, not a successful server request.
      message.replaceChildren(); document.querySelector('#release').textContent='재시도 액션이 연결됐습니다. 이 화면은 실제 요청을 보내지 않습니다.';
    }}).catch(fail));
    app.querySelector('[data-clear]').addEventListener('click',()=>message.replaceChildren());
  }
  const invalid=document.querySelector('#invalid');invalid.disabled=false;
  invalid.addEventListener('click',()=>{
    try{clients[0].resolve('icon.settings','triangle');document.querySelector('#guard-result').textContent='실패: 미등록 변형이 허용됐습니다.';}
    catch(error){document.querySelector('#guard-result').textContent=`차단 확인: ${error.message}`;}
  });
}catch(error){fail(error);}
