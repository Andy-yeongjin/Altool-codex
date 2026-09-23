/* Read-only company message source. No user input is sent with this fixed same-origin request. */
(function(){
  'use strict';
  let messages={};
  const ready=fetch('../../../../../messages/ko.json',{credentials:'same-origin'}).then(response=>{if(!response.ok)throw Error('Shared message asset unavailable');return response.json();}).then(data=>{if(!data.messages||data.locale!=='ko-KR')throw Error('Invalid company message source');messages=data.messages;document.querySelectorAll('[data-company-message]').forEach(element=>{const message=messages[element.dataset.companyMessage];if(message)element.textContent=message[element.dataset.messagePart||'body'];});return true;}).catch(()=>{document.querySelectorAll('[data-company-message]').forEach(element=>element.textContent='공통 메시지 자산을 불러오지 못했습니다. 설치 파일을 확인해 주세요.');return false;});
  window.KrdsBasicMessages={ready,get:key=>messages[key]||null};
})();
