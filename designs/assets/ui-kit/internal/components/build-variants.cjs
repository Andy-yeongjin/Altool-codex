#!/usr/bin/env node
/* Authoring source for reusable missing variants and the machine-readable router. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = path.resolve(__dirname, '..');
const outputs = new Map();
const messageSource = fs.readFileSync(path.join(base,'../../messages/ko.json'),'utf8');
const canonicalMessages = JSON.parse(messageSource);
const messageKeys = ['error.upload','error.generic','error.load','field.date','file.count','file.size','file.type','file.empty'];
const messageContract = {source:{path:'messages/ko.json',sha256:crypto.createHash('sha256').update(messageSource).digest('hex')},messages:{}};
for(const key of messageKeys) {
  const value=canonicalMessages.messages[key];
  if(!value || !value.title || !value.body) throw new Error('Missing canonical message '+key);
  messageContract.messages[key]=value;
}
const escapeText = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
outputs.set('messages.js', `/* Generated from messages/ko.json; SHA-256 ${messageContract.source.sha256}. Do not edit copy here. */\n(function(global){'use strict';const contract=${JSON.stringify(messageContract,null,2)};if(typeof module!=='undefined'&&module.exports)module.exports=contract;else global.AltoolComponentMessages=contract;})(typeof window!=='undefined'?window:globalThis);\n`);
const items = JSON.parse(fs.readFileSync(path.join(base, 'coverage.json'))).items.filter(i => i.category === 'components');
const samples = Array.from({length: 30}, (_,i) => `<li data-page-item>공통 자료 ${String(i+1).padStart(2,'0')}</li>`).join('\n');
const authored = {};
const add = (name, title, page, html, states, component, variant) => {
  authored[name] = {title, page, html, states, component, variant};
};
add('pagination-numbered', '숫자·직접 이동 페이지네이션', [215,216,218,221,233,234], `
<section data-ui="numbered-pagination" data-page-size="3" aria-label="자료 목록">
  <ul class="ui-list">${samples}</ul>
  <nav class="ui-pagination" aria-label="자료 목록 페이지">
    <button type="button" data-page-prev>이전</button><ul data-page-links></ul><button type="button" data-page-next>다음</button>
  </nav>
  <form data-page-jump class="ui-controls ui-pagination-jump"><label for="page-number">이동할 페이지</label><input id="page-number" data-page-input type="number" min="1" step="1" required><span data-page-total></span><button type="submit">이동</button></form>
  <p data-page-status role="status"></p>
</section>`, ['first','middle','last','current','disabled-boundary','direct-jump','invalid-jump'], 'pagination','numbered');
add('pagination-load-more','목록 더보기',[217,229,234],`
<section data-ui="load-more" data-page-size="5" aria-label="추가 자료 목록">
  <ul class="ui-list">${samples.slice(0, samples.indexOf('<li data-page-item>공통 자료 16'))}</ul>
  <p data-page-status role="status"></p><button type="button" data-more>자료 더보기</button>
</section>`,['initial','expanded','exhausted','focus-new-item'],'pagination','load-more');
add('checkbox-select-all','전체·부분 선택 체크박스',[406,411,413,415,417],`
<fieldset data-ui="checkbox-group"><legend>안내받을 항목</legend>
  <label><input type="checkbox" data-select-all>전체 선택</label>
  <label><input type="checkbox" data-select-item value="notices" checked>공지사항</label>
  <label><input type="checkbox" data-select-item value="updates">업데이트 소식</label>
  <label><input type="checkbox" data-select-item value="events">행사 소식</label>
  <label><input type="checkbox" data-select-item value="unavailable" disabled>현재 선택할 수 없는 항목</label>
  <p role="status" data-selection-status></p>
</fieldset>`,['unchecked','checked','indeterminate','disabled-child','keyboard'],'checkbox','select-all');
add('tab-vertical','수직 탭',[329,330,336,338,339,340,341],`
<section data-ui="tabs" class="ui-tab-layout">
  <div role="tablist" aria-label="자료 분류" aria-orientation="vertical">
    <button id="tab-guide" role="tab" type="button" aria-selected="true" aria-controls="panel-guide">이용 안내</button>
    <button id="tab-requirements" role="tab" type="button" aria-selected="false" aria-controls="panel-requirements" tabindex="-1">준비 사항</button>
    <button id="tab-history" role="tab" type="button" aria-selected="false" aria-controls="panel-history" tabindex="-1">변경 이력</button>
  </div>
  <section id="panel-guide" role="tabpanel" aria-labelledby="tab-guide" tabindex="0"><h2>이용 안내</h2><p>이 자료에서 원하는 안내 내용을 찾아볼 수 있습니다.</p></section>
  <section id="panel-requirements" role="tabpanel" aria-labelledby="tab-requirements" tabindex="0" hidden><h2>준비 사항</h2><p>작업을 시작하기 전에 필요한 문서를 준비해 주세요.</p></section>
  <section id="panel-history" role="tabpanel" aria-labelledby="tab-history" tabindex="0" hidden><h2>변경 이력</h2><p>아직 변경 이력이 없습니다.</p></section>
</section>`,['selected','unselected','focused','empty-panel','arrow-keys','home-end'],'tab','vertical');
add('spinner-determinate','확정 진행률 스피너',[438,439,443,444,445],`
<section data-ui="progress">
  <div role="progressbar" aria-label="작업 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40" class="ui-progress">
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100"><circle class="ui-progress-track" cx="50" cy="50" r="40"/><circle class="ui-progress-fill" data-progress-ring cx="50" cy="50" r="40" pathLength="100" stroke-dasharray="40 60"/></svg>
    <strong data-progress-text>40%</strong>
  </div><p data-progress-status role="status">40% 진행 중</p>
  <label for="progress-demo">예제 진행률 조절 (실제 파일 전송이 아닙니다)</label><input id="progress-demo" data-progress-demo type="range" min="0" max="100" step="10" value="40">
</section>`,['zero','progressing','complete','controlled-update'],'spinner','determinate');
add('date-input-parts','연·월·일 다중 입력',[501,503,506,508,510,511,512],`
<form data-ui="date-parts" novalidate><fieldset><legend>작성일</legend>
  <p id="date-hint" class="ui-hint">연도 4자리와 월, 일을 입력해 주세요. 예: 2024년 2월 29일</p>
  <div class="ui-date-fields">
    <label>연도<input data-date-part="year" type="text" inputmode="numeric" maxlength="4" aria-describedby="date-hint date-error" required></label>
    <label>월<input data-date-part="month" type="text" inputmode="numeric" maxlength="2" aria-describedby="date-hint date-error" required></label>
    <label>일<input data-date-part="day" type="text" inputmode="numeric" maxlength="2" aria-describedby="date-hint date-error" required></label>
  </div><p id="date-error" data-date-error class="ui-error" role="alert"></p><button type="submit">날짜 확인</button><p data-date-output role="status"></p>
</fieldset></form>`,['empty','valid','invalid','leap-day','keyboard'],'date-input','parts');
add('date-input-native','단일 날짜 입력',[501,502,506,510,511,512],`
<form data-ui="date-native"><label for="native-date">작성일</label><p id="native-date-hint" class="ui-hint">연도, 월, 일을 입력하거나 브라우저가 제공하는 달력을 사용해 주세요.</p>
<input id="native-date" type="date" required aria-describedby="native-date-hint native-date-error"><p id="native-date-error" data-date-error role="alert" class="ui-error"></p><button type="submit">날짜 확인</button><p data-date-output role="status"></p></form>`,['empty','valid','invalid','native-picker','keyboard'],'date-input','single');
add('date-input-month','월 단위의 대략적 날짜',[501,508,510,511,512],`
<form data-ui="date-native"><label for="approximate-month">대략적인 이용 시기</label><p id="month-hint" class="ui-hint">이 예제는 정확한 날짜가 필요 없는 경우입니다. 연도와 월만 선택해 주세요.</p><input id="approximate-month" type="month" required aria-describedby="month-hint month-error"><p id="month-error" data-date-error role="alert" class="ui-error"></p><button type="submit">시기 확인</button><p data-date-output role="status"></p></form>`,['empty','month-only','valid','invalid'],'date-input','approximate-month');
const fileMarkup = (multiple, drop) => `<section data-ui="file-picker" data-max-files="${multiple ? 5 : 1}" data-max-bytes="1048576">
  <h2>${multiple ? '여러' : '한 개의'} 참고 파일 선택</h2>
  <p id="file-help" class="ui-hint">이 예제는 텍스트(.txt)·PDF(.pdf), 파일당 1MB 이하, 최대 ${multiple ? 5 : 1}개입니다. 실제 앱에서는 승인된 파일 조건으로 바꿔 사용합니다. 파일은 서버로 전송하지 않습니다.</p>
  <div ${drop ? 'data-drop-zone' : ''}><label for="selected-files">파일 선택</label><input id="selected-files" type="file" accept=".txt,.pdf" ${multiple ? 'multiple' : ''} aria-describedby="file-help file-error">${drop ? '<p>이 영역에 파일을 끌어다 놓아도 선택할 수 있습니다.</p>' : ''}</div>
  <p id="file-error" data-file-error class="ui-error" role="alert"></p><p data-file-status role="status"></p><ul data-files></ul><button type="button" data-clear-files>전체 선택 해제</button>
</section>`;
add('file-picker-single','단일 파일 선택',[534,537,538,540,545,548,549,550,551,552],fileMarkup(false,false),['empty','selected','invalid-size','invalid-type','removed'],'file-upload','single');
add('file-picker-multiple','다중 파일 선택·드롭',[534,537,538,540,545,548,549,550,551,552],fileMarkup(true,true),['empty','selected','invalid-count','invalid-size','invalid-type','removed','dragging'],'file-upload','multiple-drop');
add('tag-filter','선택형 필터 태그',[419,421,425,427,428,429],`
<section data-ui="tag-group"><h2>자료 분류 선택</h2><div class="ui-controls" role="group" aria-label="자료 분류">
  <button type="button" data-tag-toggle data-value="guide" aria-pressed="true">이용 안내</button><button type="button" data-tag-toggle data-value="forms" aria-pressed="false">서식</button><button type="button" data-tag-toggle data-value="notices" aria-pressed="false">공지사항</button>
</div><p data-tag-status role="status">1개 필터 선택</p><p class="ui-hint">선택값은 altool:change 이벤트로 전달됩니다. 실제 자료 필터링은 앱의 데이터와 연결합니다.</p></section>`,['selected','unselected','focus'],'tag','filter');
add('tag-removable','삭제 가능한 태그',[419,423,427,428,429],`
<section data-ui="tag-group"><h2>선택한 조건</h2><div class="ui-controls">
  <span data-tag-item>이용 안내 <button type="button" data-tag-remove aria-label="이용 안내 조건 삭제">삭제</button></span>
  <span data-tag-item>서식 <button type="button" data-tag-remove aria-label="서식 조건 삭제">삭제</button></span>
</div><p data-tag-status role="status">2개 태그 남음</p></section>`,['present','removed','empty','focus-restored'],'tag','removable');
add('tag-label','비대화형 분류 태그',[419,422,425,428],`<section><h2>자료의 분류</h2><p><span class="ui-static-tag">이용 안내</span></p><p>비대화형 태그는 버튼이나 링크가 아니며 초점을 받지 않습니다.</p></section>`,['static'],'tag','label');
add('textarea-count','글자 수·오류 안내 텍스트 영역',[516,517,518,519,520,521],`
<section data-ui="textarea"><label for="message-body">문의 내용</label><p id="message-hint" class="ui-hint">100자 이내로 작성해 주세요. 복사·붙여넣기가 가능합니다. 이 예제는 전송하지 않습니다.</p>
  <textarea id="message-body" data-max-characters="100" aria-describedby="message-hint message-count message-error"></textarea>
  <p id="message-count" data-count>0 / 100</p><p id="message-error" data-textarea-error class="ui-error" role="alert"></p>
</section>`,['empty','entered','over-limit','invalid','focused'],'textarea','counted');
add('table-sort','정렬 가능한 데이터 표',[345,348,349,350,351,352],`
<section data-ui="sortable-table"><div class="ui-table-scroll" role="region" aria-label="부서별 자료 표" tabindex="0"><table>
  <caption>부서별 공개 자료 수</caption><thead><tr><th scope="col" aria-sort="ascending"><button type="button" data-sort-column="0">부서명 정렬</button></th><th scope="col"><button type="button" data-sort-column="1" data-sort-type="number">자료 수 정렬</button></th><th scope="col">비고</th></tr></thead>
  <tbody><tr><td>기획팀</td><td class="ui-number" data-sort-value="3">3</td><td>신규</td></tr><tr><td>운영팀</td><td class="ui-number" data-sort-value="12">12</td><td>-</td></tr><tr><td>지원팀</td><td class="ui-number" data-sort-value="24">24</td><td>-</td></tr></tbody>
</table></div><div class="ui-controls" data-table-scroll-controls hidden><button type="button" data-table-scroll="previous" aria-label="표 왼쪽으로 이동">왼쪽</button><button type="button" data-table-scroll="next" aria-label="표 오른쪽으로 이동">오른쪽</button></div><p data-sort-status role="status">부서명 정렬 오름차순</p></section>`,['initial-ascending','ascending','descending','missing-value','keyboard-scroll','button-scroll'],'table','sortable');
for (const visible of [true,false]) add(`skip-link-${visible ? 'visible' : 'focus'}`, visible ? '항상 보이는 건너뛰기' : '초점 시 보이는 건너뛰기',[151,153,156,157,158],`
<div data-ui="anchor-nav"><a class="ui-skip ${visible ? '' : 'ui-skip-hidden'}" href="#skip-main">본문 바로가기</a></div>
<nav aria-label="주요 메뉴"><ul class="ui-nav-list"><li><a href="#skip-main">자료</a></li><li><a href="#skip-help">이용 안내</a></li></ul></nav>
<article id="skip-main" tabindex="-1" class="ui-target"><h2>본문 자료</h2><p>건너뛰기 링크를 실행하면 이 영역으로 초점과 화면이 이동합니다.</p></article>
<section id="skip-help"><h2>이용 안내</h2><p>키보드 Tab으로 링크를 탐색하고 Enter로 실행할 수 있습니다.</p></section>`,['unfocused','focused','target-focus'],'skip-link',visible ? 'visible' : 'focus-only');
add('in-page-navigation','대상과 연결된 콘텐츠 내 탐색',[205,206,207,208,209,210,211,212],`
<section><h2>자료 이용 안내</h2><div class="ui-navigation-layout">
  <nav data-ui="anchor-nav" data-in-page aria-label="이 페이지의 구성"><h3>이 페이지의 구성</h3><ol><li><a href="#overview">서비스 개요</a></li><li><a href="#preparation">준비 사항</a></li><li><a href="#procedure">이용 절차</a></li></ol></nav>
  <article><section id="overview" tabindex="-1" class="ui-target"><h3>서비스 개요</h3><p>필요한 자료를 찾아 확인하는 방법을 안내합니다.</p></section><section id="preparation" tabindex="-1" class="ui-target"><h3>준비 사항</h3><p>찾으려는 자료의 이름이나 분류를 확인해 주세요.</p></section><section id="procedure" tabindex="-1" class="ui-target"><h3>이용 절차</h3><p>목록에서 자료를 선택하고 상세 정보를 확인합니다.</p></section></article>
</div></section>`,['desktop-right','mobile-before-body','target-focus'],'in-page-navigation','linked');
add('menu-simple','단순 링크 메인 메뉴',[159,165,170,172,173,174,175],`
<nav data-ui="anchor-nav" aria-label="주요 메뉴"><ul class="ui-nav-list"><li><a href="#menu-notices">공지사항</a></li><li><a href="#menu-documents">자료실</a></li><li><a href="#menu-support">이용 안내</a></li></ul></nav>
<section id="menu-notices" tabindex="-1"><h2>공지사항</h2><p>새로운 안내를 확인합니다.</p></section><section id="menu-documents" tabindex="-1"><h2>자료실</h2><p>자료를 찾아봅니다.</p></section><section id="menu-support" tabindex="-1"><h2>이용 안내</h2><p>도움이 필요한 내용을 확인합니다.</p></section>`,['link','focused','target-focus'],'main-menu','simple');

const sideLinks = `<ul><li><a href="#side-overview" aria-current="page">서비스 개요</a></li><li><a href="#side-process">이용 절차</a><ul><li><a href="#side-preparation">준비 사항</a></li></ul></li></ul>`;
const sideTargets = `<section id="side-overview" tabindex="-1"><h2>서비스 개요</h2><p>이용할 수 있는 자료를 소개합니다.</p></section><section id="side-process" tabindex="-1"><h2>이용 절차</h2><p>목록에서 자료를 선택합니다.</p></section><section id="side-preparation" tabindex="-1"><h2>준비 사항</h2><p>자료 이름을 확인해 주세요.</p></section>`;
add('side-navigation-simple','단순 목록 사이드 메뉴',[191,194,195,200,202,203],`<nav data-ui="anchor-nav" class="ui-side-links" aria-label="서비스 안내">${sideLinks}</nav>${sideTargets}`,['current','nested-level-two','target-focus'],'side-navigation','simple');
add('side-navigation-dropdown','모바일 드롭다운 사이드 메뉴',[192,194,200,202,203],`<nav data-ui="anchor-nav" class="ui-side-links" aria-label="서비스 안내"><details><summary>서비스 안내 메뉴</summary>${sideLinks}</details></nav>${sideTargets}`,['collapsed','expanded','current','keyboard'],'side-navigation','dropdown');
for(const [variant,title,description] of [
  ['information','자료 이용 안내','이 자료는 참고용입니다. 자세한 내용은 담당 부서에서 확인해 주세요.'],
  ['scrollable','긴 자료 이용 안내','아래 내용은 긴 본문에서 하단 버튼을 유지하는 예제입니다. 실제 서비스의 승인된 안내문으로 교체해 주세요.'],
  ['important',escapeText(messageContract.messages['error.generic'].title),escapeText(messageContract.messages['error.generic'].body)],
  ['confirmation','작성 중인 내용을 벗어날까요?','계속하면 저장하지 않은 내용이 사라질 수 있습니다. 이 예제는 실제로 내용을 삭제하거나 이동하지 않습니다.'],
  ['approval','다음 단계 진행 여부를 선택해 주세요','내용을 확인한 뒤 진행하거나 이전 단계에 머무를 수 있습니다. 이 예제는 실제 동의나 신청을 저장하지 않습니다.']
]) {
  const choice=['confirmation','approval'].includes(variant);
  add(`modal-${variant}`,title,[271,272,273,275,277,279,280,281],`<section data-ui="modal" ${variant==='approval'?'data-require-choice':''}><button type="button" data-modal-open>${title}</button><dialog aria-labelledby="modal-title" aria-describedby="modal-description" ${variant==='important'?'role="alertdialog"':''}><h2 id="modal-title">${title}</h2><div class="ui-modal-body" ${variant==='scrollable'?'tabindex="0" role="region" aria-label="안내 본문"':''}><p id="modal-description">${description}</p>${variant==='scrollable'?Array.from({length:16},(_,i)=>`<p>예제 문단 ${i+1}. 이용 전에 자료의 적용 범위와 필요한 준비 사항을 확인해 주세요. 본문만 스크롤되고 아래 확인 버튼은 계속 표시됩니다.</p>`).join(''):''}</div><div class="ui-controls">${choice?'<button type="button" data-modal-close="decline" autofocus>진행하지 않기</button><button type="button" data-modal-close="confirm">계속 진행</button>':'<button type="button" data-modal-close="close" autofocus>확인하고 닫기</button>'}</div></dialog><p data-modal-status role="status"></p></section>`,['closed','open','focus-contained','focus-restored',choice?'confirmed-or-declined':'dismissed',variant==='approval'?'explicit-choice-required':'escape-dismiss',...(variant==='scrollable'?['body-scroll','persistent-footer']:[])],'modal',variant);
}
for(const information of [true,false]) add(`contextual-help-${information?'information':'help'}`,information?'정보 제공 도움말':'과업 도움말',[470,471,472,475,477,480,481,482,483,484],`<section data-ui="context-help"><label for="reference-number">참고 번호</label><p class="ui-hint">필수 입력이 아닙니다. 번호를 모르면 비워 두어도 됩니다.</p><input id="reference-number" type="text"><button type="button" data-help-open aria-expanded="false" aria-controls="context-panel" aria-label="${information?'참고 번호 정보':'참고 번호 찾는 방법'}"><span aria-hidden="true">${information?'ⓘ':'?'}</span> ${information?'번호 정보':'찾는 방법'}</button><section id="context-panel" data-help-panel class="ui-help-panel" aria-labelledby="context-title" tabindex="-1" hidden><h2 id="context-title">${information?'참고 번호란?':'참고 번호 찾는 방법'}</h2><p>${information?'자료를 구분하는 번호입니다. 이 번호는 개인 식별 번호가 아닙니다.':'안내 문서의 오른쪽 위에서 참고 번호를 확인할 수 있습니다. 문서가 없으면 이 항목을 비워 두고 진행해 주세요.'}</p><button type="button" data-help-close>도움말 닫기</button></section></section>`,['closed','open','escape-dismiss','focus-restored'],'contextual-help',information?'information':'help');
for(const vertical of [true,false]) add(`header-${vertical?'vertical':'horizontal'}`,vertical?'회사 헤더 · 아이콘 세로 배열':'회사 헤더 · 아이콘 가로 배열',[135,136,137,139,140,143,146,147,148,149],`<div data-ui="anchor-nav"><a class="ui-skip ui-skip-hidden" href="#header-content">본문 바로가기</a><header class="ui-header"><div class="ui-header-brand"><a href="#header-content">서비스 이름</a><nav class="ui-header-actions ${vertical?'vertical':''}" aria-label="서비스 도구"><a class="ui-header-action" href="#header-search"><img src="../../upstream/resources/img/component/icon/ico_sch.svg" alt="">검색</a><a class="ui-header-action" href="#header-help"><img src="../image-info.svg" alt="">이용 안내</a></nav></div><nav aria-label="주요 메뉴"><ul class="ui-nav-list"><li><a href="#header-content">자료</a></li><li><a href="#header-help">이용 안내</a></li></ul></nav></header><article id="header-content" tabindex="-1"><h2>자료</h2><p>회사 이름과 실제 경로는 앱의 승인된 자산 계약으로 연결합니다. 정부 로고는 포함하지 않습니다.</p></article><section id="header-search" tabindex="-1"><h2>검색 영역</h2><p>호스트 앱의 검색 화면을 연결하는 위치입니다.</p></section><section id="header-help" tabindex="-1"><h2>이용 안내</h2><p>서비스 이용 방법을 확인합니다.</p></section></div>`,['desktop','mobile-wrap','target-focus','static'],'header',vertical?'company-vertical':'company-horizontal');
add('image-informational','정보 이미지',[299,300,302,304,305,306],`<figure><img src="../image-diagram.svg" width="720" height="220" alt="문서 작성, 내용 확인, 결과 알림으로 이어지는 세 단계"><figcaption>필요한 내용을 작성하고 확인한 뒤 결과를 안내받습니다.</figcaption></figure>`,['informational','responsive','text-alternative'],'image','informational');
add('image-decorative','장식 이미지',[299,300,304,305,306],`<img src="../image-divider.svg" width="720" height="16" alt=""><p>내용과 무관한 장식은 읽기 순서에 정보를 더하지 않습니다.</p>`,['decorative','empty-alt'],'image','decorative');
add('image-functional','기능 이미지',[299,300,304,305,306],`<div data-ui="anchor-nav"><a href="#image-details"><img src="../image-info.svg" width="24" height="24" alt="">이미지 상세 설명</a></div><section id="image-details" tabindex="-1"><h2>상세 설명</h2><p>필요한 내용을 작성하고 확인한 뒤 결과를 안내받습니다.</p></section>`,['functional','link','focus-target'],'image','functional');
add('image-fallback','이미지 오류 대체 안내',[300,303,304,305,306],`<figure data-ui="image-fallback"><img src="../image-diagram.svg" width="720" height="220" alt="문서 작성, 내용 확인, 결과 알림으로 이어지는 세 단계"><figcaption data-image-fallback class="ui-image-fallback" role="status" hidden>${escapeText(messageContract.messages['error.load'].title)} ${escapeText(messageContract.messages['error.load'].body)} 필요한 내용을 작성하고 확인한 뒤 결과를 안내받는 순서입니다.</figcaption></figure>`,['loaded','native-image-error','text-fallback'],'image','fallback');

add('file-transfer-states','호스트 제어 파일 전송 상태',[536,540,541,542,543,544,545,548,549,550,551,552],`<section data-ui="file-transfer"><h2 data-transfer-name>선택한 파일</h2><p data-transfer-state role="status">전송 준비</p><progress max="100" value="0" aria-label="파일 전송 진행률" hidden></progress><p data-transfer-error class="ui-error" role="alert"></p><p data-transfer-reason class="ui-hint"></p><button type="button" data-transfer-retry hidden>파일 전송 다시 시도</button><button type="button" data-transfer-cancel hidden>파일 전송 취소</button><details><summary>예제 상태 조절 · 실제 전송 아님</summary><p>호스트가 보내는 상태를 확인하기 위한 시연입니다. 서버 연결 없이 완료를 실제 전송 결과로 기록하지 않습니다.</p><div class="ui-controls"><button type="button" data-transfer-demo="uploading">진행 중 예제</button><button type="button" data-transfer-demo="error">실패 예제</button><button type="button" data-transfer-demo="complete">완료 예제</button><button type="button" data-transfer-demo="cancelled">취소 예제</button></div></details></section>`,['ready','uploading','complete','error','cancelled','retry-request','cancel-request'],'file-upload','transfer-states');
require('./build-identity-variants.cjs')(add);
require('./build-input-variants.cjs')(add);
require('./build-guided-variants.cjs')(add);
const shared = ['ui-kit/internal/foundations/tokens-2024.css','ui-kit/internal/components/runtime.css','ui-kit/internal/components/messages.js','ui-kit/internal/components/runtime.js','messages/ko.json'];
for (const [name, item] of Object.entries(authored)) {
  outputs.set(`fragments/${name}.html`, `<!-- Altool authored reusable variant; KRDS 2024.02 PDF p.${item.page.join(', ')}. Include declared dependencies. IDs must be unique when repeating instances. -->\n<div class="altool-ui krds-2024-tokens">${item.html}\n</div>\n`);
  outputs.set(`examples/${name}.html`, `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'${item.component==='file-upload'&&item.variant==='image-optimize'?' blob:':''}; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>${item.title} · 공통 UI 자산</title><link rel="stylesheet" href="../../foundations/tokens-2024.css"><link rel="stylesheet" href="../runtime.css"><style>body{margin:0}main{max-width:60rem;margin:auto;padding:2rem 1rem}.notice{padding:1rem;background:var(--krds24-gray-5);border-left:4px solid var(--krds24-primary-60);margin-bottom:2rem;font-size:.9375rem}input[type=number]{width:6rem}</style><script src="../messages.js" defer></script><script src="../runtime.js" defer></script></head><body class="altool-ui krds-2024-tokens ui-preview"><main><h1>${item.title}</h1><p class="notice">Altool 작성 재사용 UI · KRDS 2024.02 참고. 샘플 데이터이며 전송·로그인·실제 업무 처리는 연결하지 않았습니다.</p>${item.html}<footer><p class="ui-hint">출처: 행정안전부 디지털 정부서비스 UI/UX 가이드라인(2024.02) p.${item.page.join(', ')}. 공공누리 제1유형. 브라우저 검증과 앱 연결은 구분합니다.</p></footer></main></body></html>\n`);
}
for (const [name,item] of Object.entries(authored)) if (item.html.includes('data-guided=')) {
  const preview = `examples/${name}.html`;
  outputs.set(preview,outputs.get(preview).replace('</head>','<link rel="stylesheet" href="../guided-runtime.css"><script src="../guided-runtime.js" defer></script></head>'));
}
const upstreamDependencies = ['ui-kit/internal/foundations/company-adapter.css','ui-kit/internal/upstream/resources/css/plugin/swiper-bundle.min.css','ui-kit/internal/upstream/resources/js/plugin/swiper-bundle.min.js','ui-kit/internal/upstream/resources/js/component/ui-script.js'];
const aliases = {'radio-button':['radio_button','radio_chip','radio_size'],header:['header','language_switcher','language_switcher_page','resize'], 'main-menu':['main_menu_pc','main_menu_mobile']};
const snippets = fs.readdirSync(path.join(base,'upstream/html/code')).filter(f=>f.endsWith('.html'));
const defaults = {'coach-mark':'action-driven','tutorial-panel':'retained-session','header':'company-horizontal','footer':'company','image':'informational','pagination':'numbered','checkbox':'default','tab':'default','spinner':'indeterminate','date-input':'single','file-upload':'single','tag':'label','textarea':'counted','table':'sortable','skip-link':'focus-only','in-page-navigation':'linked','main-menu':'simple'};
const manifest = {version:1,pathBase:'designs/assets',source:'KRDS PDF 2024.02 + separately versioned official kit 1.1.0',messageSource:messageContract.source,items:[]};
for (const item of items) {
  const semantic = item.title.match(/\(([^)]+)\)/)[1].toLowerCase().replace(/[ _]/g,'-');
  const stem = semantic.replaceAll('-','_');
  // Government-branded header/footer remain in the reference catalog, not the company allowlist.
  const files = ['header','footer'].includes(semantic) ? [] : aliases[semantic] ? snippets.filter(f=>aliases[semantic].includes(f.slice(0,-5))) : snippets.filter(f=>f===stem+'.html'||f.startsWith(stem+'_'));
  const variants = {};
  for (const file of files) {
    let name = file.slice(0,-5) === stem ? 'default' : file.slice(0,-5).replace(stem+'_','').replaceAll('_','-');
    if (semantic==='spinner') name='indeterminate';
    const content=fs.readFileSync(path.join(base,'upstream/html/code',file),'utf8');
    const states=['default'];
    if (/<(?:button|a|input|textarea|select)\b/.test(content)) states.push('focus','focus-visible');
    if (/<(?:button|a)\b/.test(content)) states.push('hover','pressed');
    if (/\bdisabled\b/.test(content)) states.push('disabled');
    if (/\bchecked\b/.test(content)) states.push('checked');
    if (/aria-expanded|expand|accordion|disclosure/.test(content)) states.push('expanded','collapsed');
    if (/is-error|invalid/.test(content)) states.push('error');
    if (/aria-selected|class="[^\"]*active/.test(content)) states.push('selected');
    const rebased=content.replace(/(["'])\.\.\/\.\.\/resources\//g,'$1../../upstream/resources/');
    const assets=[...new Set([...content.matchAll(/(?:src|href)=["']\.\.\/\.\.\/(resources\/[^"']+)["']/g)].map(m=>'ui-kit/internal/upstream/'+m[1]))];
    outputs.set(`examples/upstream-${file}`, `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>${item.title} · 회사 2024 테마</title><link rel="stylesheet" href="../../foundations/company-adapter.css"><link rel="stylesheet" href="../../upstream/resources/css/plugin/swiper-bundle.min.css"><script src="../../upstream/resources/js/plugin/swiper-bundle.min.js"></script><style>body{padding:1.5rem}.company-notice{padding:1rem;margin-bottom:1.5rem;background:var(--krds24-gray-5);border-left:4px solid var(--krds24-primary-60);font-size:.9375rem}</style></head><body><aside class="company-notice">샘플 데이터 · 공식 1.1.0 마크업 + Altool 회사 2024 테마. 실제 업무 처리는 연결하지 않았습니다. 정부 전용 표식은 정부기관에서만 사용합니다.</aside>${rebased}<script src="../../upstream/resources/js/component/ui-script.js"></script></body></html>\n`);
    const compatibility = ['carousel','main-menu'].includes(semantic) ? ['ui-kit/internal/components/upstream-compat.js'] : [];
    if (compatibility.length) {
      const preview = `examples/upstream-${file}`;
      outputs.set(preview, outputs.get(preview).replace('</body>', '<script src="../upstream-compat.js"></script></body>'));
    }
    variants[name] = {path:`ui-kit/internal/upstream/html/code/${file}`,preview:`ui-kit/internal/components/examples/upstream-${file}`,dependencies:[...upstreamDependencies,...assets,...compatibility],states:[...new Set(states)],sourcePages:[item.startPage,item.endPage],kind:'upstream-markup',verification:'per-variant-browser-and-app-integration-required',theme:'company-2024-adapter'};
  }
  for(const [name, value] of Object.entries(authored)) if(value.component===semantic) {
    const resources = [...new Set([...value.html.matchAll(/src=["']([^"']+)["']/g)].map(m=>'ui-kit/internal/'+path.relative(base,path.resolve(__dirname,'fragments',m[1])).split(path.sep).join('/')))];
    const guided=value.html.includes('data-guided=')?['ui-kit/internal/components/guided-runtime.css','ui-kit/internal/components/guided-runtime.js']:[];
    variants[value.variant]={path:`ui-kit/internal/components/fragments/${name}.html`,preview:`ui-kit/internal/components/examples/${name}.html`,dependencies:[...shared,...resources,...guided],states:value.states,sourcePages:value.page,kind:'authored-reusable-ui',verification:'automated-contract-tests; browser-pending'};
  }
  if(semantic==='image') variants.default={path:'ui-kit/internal/components/image.html',preview:'ui-kit/internal/components/image.html',dependencies:['ui-kit/internal/foundations/tokens-2024.css','ui-kit/internal/components/image-diagram.svg','ui-kit/internal/components/image-divider.svg','ui-kit/internal/components/image-info.svg'],states:['informational','decorative','functional-link','static-fallback'],sourcePages:[299,300,301,302,303,304,305,306],kind:'standalone-example',verification:'previous-browser-observation; app-integration-required'};
  const defaultVariant=defaults[semantic] || (variants.default?'default':Object.keys(variants)[0]);
  if(!defaultVariant || !variants[defaultVariant]) throw new Error(`No default variant for ${semantic}`);
  manifest.items.push({id:`component.${semantic}`,kind:'component',meaning:item.title.replace(/^\d+\s*\.\s*/,'').replace(/\(.*\)/,'').trim(),defaultVariant,variants,
    ...(['masthead','identifier'].includes(semantic)?{restrictedTo:['government']}:{}),
    constraints:['회사 공통 선택은 루트 registry가 소유한다. 이 manifest는 선택 가능한 변형의 출처와 실행 경로다.','공식 1.1.0 마크업은 company-adapter.css로 2024 토큰/100% root를 사용한다. raw common/output CSS를 혼용하지 않는다.','고대비/theme 모드는 후대 키트의 별도 확장이며 회사 기본 2024 light와 구분한다.','반복 인스턴스를 삽입하면 id/for/aria-controls/aria-describedby를 함께 고유화한다.','서버 데이터·전송·인증·권한·파일 보안 검증은 호스트 앱이 담당한다.'],sourceSection:item.id});
}
outputs.set('variants-manifest.json', JSON.stringify(manifest,null,2)+'\n');
outputs.set('examples/company-mixed.html', `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>회사 공통 CSS 혼합 검증</title><link rel="stylesheet" href="../../foundations/company-adapter.css"><link rel="stylesheet" href="../runtime.css"><script src="../messages.js" defer></script><script src="../runtime.js" defer></script><style>main{max-width:64rem;margin:auto;padding:1.5rem}.mixed-panel{padding:1rem;border:1px solid var(--krds24-gray-40);margin:1rem 0}</style></head><body><main><h1>공식 조각 + authored UI 혼합 검증</h1><p>샘플 데이터 · adapter와 authored runtime을 함께 사용합니다. 원본 common/output CSS는 로드하지 않습니다.</p><section class="mixed-panel"><h2>공식 버튼</h2><button id="mixed-upstream-button" type="button" class="krds-btn">공식 버튼</button><p id="mixed-official-body">기본 본문 글자 크기 검증</p></section><section class="mixed-panel altool-ui krds-2024-tokens"><h2>작성된 체크박스</h2>${authored['checkbox-select-all'].html}<p id="mixed-authored-body">작성된 UI 글자 크기 검증</p></section></main></body></html>\n`);
const gaps = {
  'masthead':'정부기관 한정. 일반 회사 선택 금지.', 'identifier':'정부기관 한정. 원본 high-contrast는 후대 키트 모드로 분리.',
  'header':'원본 정부 헤더는 회사 allowlist 제외. 아이콘 세로/가로 정렬은 PDF135/136 렌더 대조. 실제 브랜드·검색 경로는 호스트 계약.',
  'footer':'원본 정부 푸터는 회사 allowlist 제외. 법률 문구·연락처는 호스트의 승인된 원문을 연결.',
  'main-menu':'단순 링크는 실제 대상 연결. 공식 PC/모바일 메뉴의 샘플 경로는 앱 정보 구조로 연결 필요.',
  'side-navigation':'단순/헤더 목록/모바일 드롭다운 경로. 원본 다단계 메뉴는 호스트의 탐색 구조에 맞추고 키보드 동작 확인.',
  'pagination':'숫자/이전다음/직접 이동/더보기 구현. 정적 데이터 집합 기준; 서버 페이지 요청은 호스트.',
  'modal':'정보/중요 안내/확정/승인 필수 4유형 구현. 승인 유형만 Escape 차단, 명시적 거절 경로 제공.',
  'image':'정보/장식/기능/네이티브 오류 대체 조각. 원문 사진의 대량 복제가 아니라 목적별 구조/대체텍스트 자산.',
  'tab':'공식 수평 스타일 + authored 수직 키보드 탭. 각 호스트 탭 내용 연결 필요.',
  'tag':'비대화형 레이블/필터 선택/삭제 태그. 실제 검색 필터링은 이벤트 소비자가 연결.',
  'spinner':'공식 불확정 + authored 확정 진행률. 실제 작업 진행률은 altool:progress 이벤트로 전달.',
  'contextual-help':'정보(i)/도움(?) 팝오버 조각. 필수 정보는 밖에 유지하며 Escape/닫기 초점 복귀.',
  'date-input':'단일/연월일 분리/대략적 월. 날짜는 브라우저·순수 달력 검증, 서버 업무 가능일은 호스트.',
  'file-upload':'단일/다중 드롭·제한 오류·삭제 + 호스트 제어 준비/전송/완료/실패/취소·재시도 요청 UI. 실제 전송·진행률·재시도·악성파일 검사는 호스트 책임.',
  'calendar':'공식 단일/기간 달력 UI 경로. 예약 가능일/업무일 데이터 및 모든 연월 키보드 접근성은 앱 검증 필요.',
  'structured-list':'공식 목록/표/상세 구조 경로. 검색·정렬·상세 링크의 실제 데이터는 호스트.',
  'table':'정렬 작동 조각과 기본/규격 공식 조각. 대용량 서버 정렬·페이징은 호스트.',
  'critical-alerts':'공식 표현 경로. 실제 경보 발행·해제 조건과 최신성은 호스트 데이터.',
  'tutorial-panel':'공식 단계 UI 경로. 사용자 완료/다시 보지 않기 영속 기록은 호스트.',
  'coach-mark':'공식 단계 UI 경로. 호스트 실제 대상 위치와 키보드 흐름/영속 상태 검증 필요.'
};
outputs.set('variant-audit.md', '# 37개 컴포넌트 변형 대조\n\n출처: KRDS 2024.02 PDF p.114–552. 아래는 재사용 경로의 대조이며 전 페이지 시각·접근성 준수 인증이 아니다. 마크업/CSS에 표현된 states와 실제 브라우저 검증은 구분한다. 원본 키트의 샘플 데이터와 서버 미연결 버튼은 구현 완료로 계산하지 않는다.\n\n| 의미 ID | 원문 페이지 | 선택 가능 변형 | 경계·검증 사항 |\n|---|---|---|---|\n' + manifest.items.map(item => {
  const source = items.find(i=>i.id===item.sourceSection);
  return `| ${item.id} | ${source.startPage}–${source.endPage} | ${Object.keys(item.variants).join(', ')} | ${gaps[item.id.slice(10)] || '공식 마크업/CSS 재사용 경로. 호스트 콘텐츠와 실제 클릭·키보드·반응형 동작 검증은 별도.'} |`;
}).join('\n')+'\n');
const check=process.argv.includes('--check');
for(const [relative,text] of outputs){const file=path.join(__dirname,relative);if(check){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text)throw new Error('Stale variant: '+relative);}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}}
console.log(`${check?'Verified':'Generated'} ${Object.keys(authored).length} reusable authored variants; ${manifest.items.length} component families; ${manifest.items.reduce((n,i)=>n+Object.keys(i.variants).length,0)} routed variants. Browser and app integration are separate.`);
