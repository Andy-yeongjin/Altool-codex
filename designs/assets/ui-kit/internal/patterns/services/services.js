/* Framework-free, local-only service-pattern examples; not authentication or a government service. */
(function () {
  'use strict';
  const M = window.KrdsServiceModel;
  const main = document.getElementById('main');
  const status = document.getElementById('global-status');
  const dialog = document.getElementById('prompt-dialog');
  const STORE = 'altool.krds2024.service-demo.v1';
  let saved;
  try { saved = M.restore(localStorage.getItem(STORE)); } catch (_) { saved = M.restore(null); }
  let draft = saved.draft;
  let receipts = saved.receipts;
  let savedAt = saved.savedAt;
  let signedIn = false;
  let method = 'sample';
  let preferredMethod = '';
  let returnTarget = 'visit';
  let sessionDeadline = 0;
  let sessionWarned = false;
  let modalOpener = null;
  let renderedRoute = '';
  let requestVersion = 0;
  let searchResultFocus = '';
  let currentReceipt = receipts.at(-1)?.id || '';
  let selectedReceipts = new Set();
  let receiptSort = 'latest';
  let receiptFilter = '전체';
  let policyCategory = '전체';
  let policyQuery = '';
  let policyPage = 1;
  const bookmarked = new Set();
  const searchState = { query: '', category: '전체', period: 'all', from: '', to: '', sort: 'relevance', page: 1, performed: false, fail: false, history: [] };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const route = () => location.hash.slice(1) || 'visit';
  const byId = id => document.getElementById(id);
  const on = (id, event, fn) => { const node = byId(id); if (node) node.addEventListener(event, fn); };
  const source = page => `<a class="source" href="../../reference/krds-p${String(page).padStart(4, '0')}.md">원문과 적용 조건 · PDF p.${page}부터</a>`;
  function announce(message) { status.textContent = message; }
  function go(target) {
    if (route() === target) render();
    else location.hash = target;
  }
  function persist(message) {
    try {
      localStorage.setItem(STORE, JSON.stringify({ version: 1, draft: M.cleanDraft(draft), savedAt, receipts }));
      if (message) announce(message);
      return true;
    } catch (_) {
      announce('브라우저 저장소를 사용할 수 없어 새로고침 후에는 모의 기록이 남지 않습니다. 현재 화면에서는 계속 진행할 수 있습니다.');
      return false;
    }
  }
  function openDialog(title, body, actions) {
    modalOpener = document.activeElement;
    byId('dialog-title').textContent = title;
    byId('dialog-content').innerHTML = body;
    const box = byId('dialog-actions');
    box.replaceChildren();
    for (const action of actions) {
      const button = document.createElement('button');
      button.textContent = action.label;
      if (action.primary) button.className = 'primary';
      button.addEventListener('click', () => { dialog.close(); action.run(); });
      box.append(button);
    }
    dialog.showModal();
    box.querySelector('button')?.focus();
  }
  dialog.addEventListener('close', () => { if (modalOpener?.isConnected) modalOpener.focus(); });
  function noticeLogin(target) {
    if (signedIn) { go(target); return; }
    returnTarget = target;
    openDialog('모의 로그인이 필요한 화면입니다', '<p>이 예제의 개인화 메뉴를 살펴보려면 모의 로그인이 필요합니다. 실제 신원 확인은 하지 않습니다. 공개 정책 정보는 로그인 없이 볼 수 있습니다.</p>', [
      { label: '로그인 안 함', run: () => {} }, { label: '모의 로그인하러 가기', primary: true, run: () => go('login') },
    ]);
  }
  function stepList(labels, index) { return `<ol class="steps" aria-label="진행 단계">${labels.map((label, i) => `<li${i === index ? ' aria-current="step"' : ''}>${i + 1}. ${e(label)}${i === index ? ' · 현재' : ''}</li>`).join('')}</ol>`; }
  function pageHeading(title, subtitle, page) { return `<div class="eyebrow">KRDS 2024.02 · 모의 서비스 자산</div><h1>${e(title)}</h1><p class="lead">${e(subtitle)}</p>${source(page)}`; }
  function visit() {
    main.innerHTML = pageHeading('필요한 서비스를 찾아보세요', '방문 → 정보 확인 → 이동을 연결하는 첫 화면입니다. 모든 내용과 날짜는 예제이며 실제 정책 안내가 아닙니다.', 686) + `
      <aside class="notice" aria-label="중요 안내"><strong>실습 안내</strong><p>실제 개인정보를 입력하지 마세요. 신청 기록은 이 브라우저의 고정 선택값만 저장합니다.</p></aside>
      <h2>자주 찾는 서비스</h2><p>샘플 우선순위입니다. 실서비스에서는 이용자 조사와 이용 데이터로 순서를 결정하세요.</p>
      <div class="cards"><article class="card"><h3><a href="#application">교육 참여 모의 신청</a></h3><p>대상 확인부터 신청 내역까지 연습합니다.</p><a class="button" href="#application/eligibility">모의 신청 시작</a></article><article class="card"><h3><a href="#policy">정책 정보</a></h3><p>분야별 가상 정책과 관련 자료를 살펴봅니다.</p></article><article class="card"><h3><a href="#search">통합 검색</a></h3><p>정책·서비스·자료를 한 번에 검색합니다.</p></article></div>
      <h2>방문 목적별 바로가기</h2><nav aria-label="방문 목적"><a href="#policy">정보 알아보기</a><a href="#application">신청 연습하기</a><a href="#application/history">신청 내역 확인하기</a></nav>
      <h2>나의 모의 서비스</h2><p>${signedIn ? '모의 로그인 상태입니다. 이 기기의 연습 기록만 제공합니다.' : '모의 로그인 후 개인화 메뉴를 살펴볼 수 있습니다.'}</p><button id="my-service">나의 모의 서비스 열기</button>
      <h2>새 소식</h2><p><span class="badge">샘플</span>예제 데이터 기준일: <time datetime="2024-02-29">2024-02-29</time>. 최신 정책을 뜻하지 않습니다.</p>
      <details><summary>도움과 문의 안내</summary><p>키보드 Tab으로 링크와 버튼을 이동하고 Enter로 실행하세요. 실제 운영 전 문의처·관리 책임자·갱신 기준을 프로젝트에 맞게 지정해야 합니다.</p></details>${source(689)}`;
    on('my-service', 'click', () => noticeLogin('login/service'));
  }
  function highlighted(text, query) {
    if (!query.trim()) return e(text);
    const q = query.trim();
    const index = text.toLocaleLowerCase('ko').indexOf(q.toLocaleLowerCase('ko'));
    return index < 0 ? e(text) : `${e(text.slice(0, index))}<mark>${e(text.slice(index, index + q.length))}</mark>${e(text.slice(index + q.length))}`;
  }
  function renderSearch() {
    main.innerHTML = pageHeading('통합 검색', '가상 데이터 15건에서 검색합니다. 검색어·필터는 상세 화면을 다녀와도 현재 탭에서 유지됩니다.', 702) + `
      <form id="search-form" role="search" class="search-box"><label for="search-query">검색어</label><p id="search-help" class="muted">예: 배움, 청년, 생활 안전. 실습 기준일은 2024-02-29입니다.</p><input id="search-query" type="search" value="${e(searchState.query)}" aria-describedby="search-help" autocomplete="off" aria-controls="suggestions" aria-expanded="false"><div id="suggestion-region" hidden><h2 id="suggestion-title">추천 검색어</h2><p id="suggestion-status" role="status" aria-live="polite"></p><ul id="suggestions" class="suggestions" aria-labelledby="suggestion-title"></ul></div><div class="actions"><button type="submit" class="primary">검색</button><button type="button" id="clear-query">검색어 전체 삭제</button></div></form>
      <div class="filters" aria-label="상세 검색"><label>검색 기간<select id="search-period"><option value="all">전체</option><option value="1">1일</option><option value="7">일주일</option><option value="30">1개월</option><option value="custom">직접 지정</option></select></label><label>자료 유형<select id="search-category">${['전체', '정책', '서비스', '자료'].map(v => `<option>${v}</option>`).join('')}</select></label><label>정렬 기준<select id="search-sort"><option value="relevance">관련도순</option><option value="latest">최신순</option><option value="popular">인기순</option></select></label><button id="reset-filters">검색 조건 전체 초기화</button></div>
      <div id="custom-range"${searchState.period === 'custom' ? '' : ' hidden'} class="filters"><label>시작 날짜<input type="date" id="search-from" value="${e(searchState.from)}"></label><label>종료 날짜<input type="date" id="search-to" value="${e(searchState.to)}"></label><button id="apply-range">날짜 적용</button></div>
      <p id="search-error" class="error" role="alert" hidden></p><p id="search-count" role="status" aria-live="polite"></p><div id="search-results"></div>
      <details class="secondary-zone"><summary>검색 상태 테스트</summary><p>다음 검색 1회에만 모의 오류를 발생시킵니다. 외부 서버에 연결하지 않습니다.</p><button id="search-failure">다음 검색 오류 재현</button></details><nav aria-label="다른 탐색 방법"><a href="#visit">검색 종료하고 홈으로</a><a href="#policy">정책 목록으로 탐색하기</a></nav>${source(707)}${source(716)}${source(732)}${source(747)}${source(759)}${source(771)}${source(777)}`;
    byId('search-period').value = searchState.period;
    byId('search-category').value = searchState.category;
    byId('search-sort').value = searchState.sort;
    on('search-form', 'submit', ev => { ev.preventDefault(); searchState.query = byId('search-query').value; searchState.page = 1; executeSearch(); });
    on('search-query', 'input', showSuggestions);
    on('search-query', 'focus', showSuggestions);
    on('search-query', 'keydown', ev => { if (ev.key === 'ArrowDown') { const first = byId('suggestions').querySelector('button'); if (first) { ev.preventDefault(); first.focus(); } } if (ev.key === 'Escape') closeSuggestions(); });
    on('clear-query', 'click', () => { byId('search-query').value = ''; searchState.query = ''; byId('search-query').focus(); showSuggestions(); });
    for (const [id, key] of [['search-category', 'category'], ['search-sort', 'sort']]) on(id, 'change', () => { searchState[key] = byId(id).value; searchState.page = 1; executeSearch(); });
    on('search-period', 'change', () => { searchState.period = byId('search-period').value; byId('custom-range').hidden = searchState.period !== 'custom'; if (searchState.period !== 'custom') { Object.assign(searchState, M.dateRange(searchState.period)); searchState.page = 1; executeSearch(); } });
    on('apply-range', 'click', () => { const from = byId('search-from').value; const to = byId('search-to').value; const error = M.rangeError(from, to); if (error) { showError('search-error', error, 'search-from'); return; } Object.assign(searchState, { from, to, page: 1 }); executeSearch(); });
    on('reset-filters', 'click', () => { Object.assign(searchState, { category: '전체', sort: 'relevance', period: 'all', from: '', to: '', page: 1 }); searchResultFocus = ''; renderSearch(); byId('reset-filters').focus(); executeSearch(); });
    on('search-failure', 'click', () => { searchState.fail = true; announce('다음 검색에 모의 오류가 표시됩니다. 검색 버튼을 눌러 확인하세요.'); });
    if (searchState.performed) displayResults();
  }
  function closeSuggestions() { byId('suggestion-region').hidden = true; byId('search-query').setAttribute('aria-expanded', 'false'); }
  function showSuggestions() {
    const q = byId('search-query').value.trim();
    const suggestions = q ? M.terms.filter(t => t.includes(q)) : [...new Set([...searchState.history, ...M.terms])].slice(0, 5);
    byId('suggestion-title').textContent = q ? '추천 검색어' : '최근·예제 검색어';
    byId('suggestion-region').hidden = !suggestions.length;
    byId('search-query').setAttribute('aria-expanded', String(Boolean(suggestions.length)));
    byId('suggestion-status').textContent = `검색어 제안 ${suggestions.length}개`;
    byId('suggestions').innerHTML = suggestions.map(t => `<li><button type="button">${e(t)}</button></li>`).join('');
    const buttons = [...byId('suggestions').querySelectorAll('button')];
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => { searchState.query = suggestions[i]; byId('search-query').value = suggestions[i]; searchState.page = 1; executeSearch(); });
      button.addEventListener('keydown', ev => { if (['ArrowDown', 'ArrowUp'].includes(ev.key)) { ev.preventDefault(); buttons[M.nextSuggestion(i, ev.key, buttons.length)].focus(); } else if (ev.key === 'Escape') { ev.preventDefault(); byId('search-query').focus(); closeSuggestions(); } });
    });
  }
  function showError(id, message, field) { const node = byId(id); node.textContent = message; node.hidden = false; if (field) { byId(field)?.setAttribute('aria-invalid', 'true'); byId(field)?.focus(); } }
  function executeSearch() {
    const version = ++requestVersion;
    searchState.performed = true;
    if (byId('suggestions').contains(document.activeElement)) byId('search-query').focus();
    closeSuggestions();
    byId('search-error').hidden = true;
    byId('search-from').removeAttribute('aria-invalid');
    byId('search-results').setAttribute('aria-busy', 'true');
    byId('search-count').innerHTML = '<span class="spinner" aria-hidden="true"></span>검색 중입니다.';
    byId('search-results').replaceChildren();
    window.setTimeout(() => {
      if (version !== requestVersion || route().split('/')[0] !== 'search' || !byId('search-results')) return;
      byId('search-results').setAttribute('aria-busy', 'false');
      if (searchState.fail) { searchState.fail = false; byId('search-count').textContent = ''; showError('search-error', '모의 검색 오류입니다. 입력한 검색어와 조건은 유지됩니다. 검색 버튼을 다시 눌러 주세요.'); return; }
      if (searchState.query.trim()) searchState.history = [searchState.query.trim(), ...searchState.history.filter(q => q !== searchState.query.trim())].slice(0, 5);
      displayResults();
    }, 250);
  }
  function displayResults() {
    const data = M.search(M.fixtures, searchState);
    const pages = Math.max(1, Math.ceil(data.length / 10));
    searchState.page = Math.min(searchState.page, pages);
    byId('search-count').textContent = `검색어 “${searchState.query || '전체'}” · ${searchState.category} · ${searchState.period === 'all' ? '전체 기간' : `${searchState.from || '처음'} ~ ${searchState.to || '마지막'}`} · 총 ${data.length}건`;
    const counts = ['전체', '정책', '서비스', '자료'].map(category => ({ category, count: M.search(M.fixtures, { ...searchState, category }).length }));
    byId('search-results').innerHTML = `<div class="filter-buttons" role="group" aria-label="검색 주제">${counts.map(c => `<button data-category="${c.category}" aria-pressed="${searchState.category === c.category}">${c.category} (${c.count})</button>`).join('')}</div>` + (data.length ? `<ul class="results">${data.slice((searchState.page - 1) * 10, searchState.page * 10).map(item => `<li class="result"><span class="badge">${item.category}</span><time>${item.date}</time><h3><a href="#search/detail/${item.id}">${highlighted(item.title, searchState.query)}</a></h3><p class="summary">${highlighted(item.description, searchState.query)}</p><div class="result-meta">실습실 &gt; ${item.category} &gt; ${e(item.title)}</div></li>`).join('')}</ul><nav class="pagination" aria-label="검색 결과 페이지">${Array.from({ length: pages }, (_, i) => `<button data-page="${i + 1}"${searchState.page === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>` : '<div class="notice"><h2>검색 결과가 없습니다</h2><p>철자를 확인하거나 다른 단어·더 일반적인 단어로 검색해 보세요. 검색 조건을 초기화할 수도 있습니다.</p><button id="empty-reset">모든 검색 조건 해제</button></div>');
    byId('search-results').querySelectorAll('[data-category]').forEach(b => b.addEventListener('click', () => { searchState.category = b.dataset.category; searchResultFocus = `[data-category="${b.dataset.category}"]`; byId('search-category').value = searchState.category; searchState.page = 1; executeSearch(); }));
    byId('search-results').querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => { searchState.page = Number(b.dataset.page); searchResultFocus = `[data-page="${searchState.page}"]`; displayResults(); byId('search-count').scrollIntoView({ block: 'center' }); }));
    on('empty-reset', 'click', () => byId('reset-filters').click());
    if (searchResultFocus) { byId('search-results').querySelector(searchResultFocus)?.focus(); searchResultFocus = ''; }
  }
  function searchDetail(id) {
    const item = M.fixtures.find(i => i.id === id);
    if (!item) { missing(); return; }
    main.innerHTML = pageHeading(item.title, item.description, 759) + `<p><span class="badge">${item.category}</span>예제 기준일 ${item.date}</p><p>이 상세 화면은 결과 목록의 제목이 올바른 상세 내용으로 연결되는지 확인하기 위한 샘플입니다.</p><div class="actions"><a class="button" href="#search">검색 결과로 돌아가기</a><a class="button" href="#${item.category === '서비스' ? 'application' : 'policy'}">${item.category === '서비스' ? '신청 서비스' : '정책 정보'} 살펴보기</a><a class="button" href="sample-policy.txt" download>예제 자료 다운로드 (TXT)</a></div>`;
  }
  const loginSteps = ['방식 선택', '정보 입력', '완료', '서비스 이용'];
  function login(stage) {
    if (stage === 'logout') {
      main.innerHTML = pageHeading('모의 로그인 시간이 만료되었습니다', '실제 인증 세션이 아닙니다. 모의 상태가 해제되었습니다. 임시 저장한 고정 선택값은 이 기기에 남아 있습니다.', 848) + '<div class="actions"><a class="button" href="#visit">홈으로</a><a class="button primary" href="#login">다시 모의 로그인하기</a></div>'; return;
    }
    if (stage === 'service' && !signedIn) { main.innerHTML = pageHeading('나의 모의 서비스', '공개 콘텐츠는 로그인 없이 이용할 수 있습니다.', 839) + '<button id="need-login" class="primary">모의 로그인하고 이용하기</button>'; on('need-login', 'click', () => noticeLogin('login/service')); return; }
    if (stage === 'service') {
      main.innerHTML = pageHeading('나의 모의 서비스', '로그인 유지·만료 안내·연장·로그아웃을 실습합니다. 인증 정보는 저장하거나 전송하지 않습니다.', 839) + stepList(loginSteps, 3) + '<p>모의 세션은 5분 후 종료되며, 30초 전에 안내합니다. 연장 횟수는 제한하지 않습니다.</p><div class="actions"><a class="button" href="#application/history">신청 내역</a><button id="simulate-warning">만료 30초 전 상태 재현</button><button id="logout-now">모의 로그아웃</button></div><details><summary>도움말</summary><p>연장 버튼은 키보드 Tab과 Enter로도 조작할 수 있습니다. 서버 세션·SSO·실제 개인정보 접근 권한은 이 예제에 없습니다.</p></details>';
      on('simulate-warning', 'click', () => { sessionDeadline = Date.now() + 30000; sessionWarned = false; tickSession(); });
      on('logout-now', 'click', () => logout(false)); return;
    }
    if (stage === 'complete' && signedIn) {
      main.innerHTML = pageHeading('모의 로그인이 완료되었습니다', '현재 상태는 이 탭의 실습용 표시입니다. 실제 계정에 로그인한 것이 아닙니다.', 832) + stepList(loginSteps, 2) + `<p>이전 과업: ${e(returnTarget === 'visit' ? '홈 탐색' : '나의 모의 서비스')}</p><a class="button primary" href="#${e(returnTarget)}">이전 과업 계속하기</a><a class="button" href="#login/service">모의 서비스 이용</a>`;
      // Full-page completion has document-start focus, not an unexpected input field.
      document.body.focus(); return;
    }
    if (stage === 'entry') {
      main.innerHTML = pageHeading('모의 로그인 정보 입력', '아래 공개된 예제 값만 입력하세요. 실제 비밀번호·이메일·개인정보를 입력하지 마세요.', 819) + stepList(loginSteps, 1) + (method === 'sample' ? `<form id="login-form" novalidate><p class="notice">예제 아이디: <strong>demo@example.invalid</strong><br>예제 비밀번호: <strong>sample-only</strong></p><div class="field"><label for="demo-id">예제 아이디 (이메일 형식)</label><small id="id-help">실제 이메일 주소를 사용하지 마세요.</small><input id="demo-id" type="email" autocomplete="username" aria-describedby="id-help login-error"></div><div class="field"><label for="demo-password">예제 비밀번호</label><input id="demo-password" type="password" autocomplete="current-password" aria-describedby="login-error"><button type="button" id="show-password" aria-pressed="false">비밀번호 표시</button></div><label class="choice"><input id="remember-method" type="checkbox">이 탭에서 로그인 방식만 기억 (계정 정보는 저장하지 않음)</label><p id="login-error" class="error" role="alert" hidden></p><div class="actions"><a class="button" href="#login">다른 방식 선택</a><button class="primary" type="submit">모의 로그인</button></div></form><details><summary>아이디·비밀번호 찾기 도움</summary><p>이 예제에는 계정이 없습니다. 화면에 제공된 예제 값만 사용하세요. 실제 서비스에서는 계정 복구 화면·접근 가능한 대체 인증을 연결해야 합니다.</p></details>` : '<p class="notice">기억·계산·문자열 입력이 없는 대체 흐름의 화면 예제입니다. 생체 정보나 인증서를 수집하지 않습니다.</p><div class="actions"><a class="button" href="#login">다른 방식 선택</a><button class="primary" id="login-alternative">대체 방식 모의 완료</button></div>');
      on('show-password', 'click', () => { const visible = byId('demo-password').type === 'password'; byId('demo-password').type = visible ? 'text' : 'password'; byId('show-password').textContent = visible ? '비밀번호 숨기기' : '비밀번호 표시'; byId('show-password').setAttribute('aria-pressed', String(visible)); });
      for (const id of ['demo-id', 'demo-password']) on(id, 'blur', () => { if (!byId(id).value) { byId(id).setAttribute('aria-invalid', 'true'); showError('login-error', id === 'demo-id' ? '예제 아이디를 입력해 주세요.' : '예제 비밀번호를 입력해 주세요.'); } else byId(id).removeAttribute('aria-invalid'); });
      on('login-form', 'submit', ev => { ev.preventDefault(); const error = M.validateLogin(byId('demo-id').value.trim(), byId('demo-password').value); if (error) { byId('demo-password').value = ''; showError('login-error', error.message, error.field); return; } preferredMethod = byId('remember-method').checked ? method : ''; byId('demo-password').value = ''; completeLogin(); });
      on('login-alternative', 'click', completeLogin); return;
    }
    main.innerHTML = pageHeading('모의 로그인 방식 선택', '방식을 비교한 후 선택합니다. 두 방식 모두 같은 실습 메뉴를 제공하며 법적 효력·인증 권한이 없습니다.', 803) + stepList(loginSteps, 0) + `${preferredMethod ? '<p class="notice">이 탭에서 사용한 방식: 예제 아이디 입력</p>' : ''}<div class="cards"><section class="card"><h2>예제 아이디 입력</h2><p>공개된 샘플 아이디와 비밀번호로 양식·오류 상태를 연습합니다.</p><button id="method-sample" class="primary">예제 아이디 방식 선택</button></section><section class="card"><h2>정보 입력 없는 대체 방식</h2><p>개인정보 입력 없이 대체 인증의 완료 화면을 살펴봅니다. 실제 인증은 실행하지 않습니다.</p><button id="method-alternative">대체 방식 선택</button></section></div><details><summary>모바일·키보드 이용 도움말</summary><p>화면 크기와 관계없이 두 방식을 목록으로 비교할 수 있습니다. Tab으로 선택 버튼에 이동하고 Enter로 다음 화면을 여세요. 붙여넣기는 제한하지 않습니다.</p></details>${source(785)}${source(793)}`;
    on('method-sample', 'click', () => { method = 'sample'; go('login/entry'); });
    on('method-alternative', 'click', () => { method = 'alternative'; go('login/entry'); });
  }
  function completeLogin() { signedIn = true; sessionDeadline = Date.now() + 300000; sessionWarned = false; updateHeader(); go('login/complete'); }
  function updateHeader() {
    const link = byId('login-link');
    link.innerHTML = '<img src="../../upstream/resources/img/component/icon/ico_login.svg" alt="" width="24" height="24"> ' + (signedIn ? '모의 계정' : '로그인');
    link.href = signedIn ? '#login/service' : '#login';
    byId('session-bar').hidden = !signedIn;
    if (signedIn) { byId('session-bar').innerHTML = '<span>모의 로그인 · 남은 시간 <span id="session-time"></span></span><button id="extend-session">모의 시간 연장</button><button id="header-logout">모의 로그아웃</button>'; on('extend-session', 'click', extendSession); on('header-logout', 'click', () => logout(false)); }
  }
  function extendSession() { sessionDeadline = Date.now() + 300000; sessionWarned = false; announce('모의 이용 시간을 5분으로 연장했습니다.'); tickSession(); }
  function tickSession() {
    if (!signedIn) return;
    const remaining = Math.max(0, Math.ceil((sessionDeadline - Date.now()) / 1000));
    if (byId('session-time')) byId('session-time').textContent = `${Math.floor(remaining / 60)}분 ${remaining % 60}초`;
    if (byId('dialog-seconds') && dialog.open) byId('dialog-seconds').textContent = String(remaining);
    if (remaining === 0) { if (dialog.open) dialog.close(); logout(true); return; }
    if (remaining <= 30 && !sessionWarned && !dialog.open) {
      sessionWarned = true;
      openDialog('모의 로그인 시간이 곧 끝납니다', `<p><span id="dialog-seconds">${remaining}</span>초 후 모의 로그아웃됩니다. 고정 선택값을 임시 저장했다면 기록은 남습니다. 계속 이용하려면 연장해 주세요.</p>`, [{ label: '모의 로그아웃', run: () => logout(false) }, { label: '시간 연장', primary: true, run: extendSession }]);
    }
  }
  function logout(expired) {
    if (!signedIn) return;
    returnTarget = route() === 'login/complete' ? returnTarget : route();
    signedIn = false;
    updateHeader();
    if (expired) go('login/logout');
    else { const version = ++requestVersion; main.innerHTML = '<h1>모의 로그아웃 중</h1><p role="status"><span class="spinner" aria-hidden="true"></span>모의 로그인 표시를 해제하고 있습니다.</p>'; window.setTimeout(() => { if (version !== requestVersion) return; go('visit'); announce('모의 로그아웃되었습니다. 공개 정보는 계속 볼 수 있습니다.'); }, 250); }
  }
  const applicationSteps = ['유의 사항·자격', '신청서 작성', '확인·확정', '완료'];
  function application(stage, id) {
    if (stage === 'history') { history(); return; }
    if (stage === 'receipt') { receipt(id); return; }
    if (stage === 'eligibility') {
      main.innerHTML = pageHeading('시작하기 전에', '모의 교육 참여 신청입니다. 실제 신청 자격이나 법적 동의를 판단하지 않습니다.', 894) + stepList(applicationSteps, 0) + '<div class="notice"><h2>미리 확인하세요</h2><ul><li>이 예제는 누구나 연습할 수 있습니다.</li><li>실제 본인 인증·수수료·증빙서류는 없습니다.</li><li>모의 접수 뒤 수정은 하지 않으며 신청 내역에서 모의 취소할 수 있습니다.</li></ul></div><form id="eligibility-form"><fieldset><legend>예제 자격에 해당하나요?</legend><label class="choice"><input type="radio" name="eligible" id="eligible" value="yes">예, 연습용 조건에 해당합니다</label><label class="choice"><input type="radio" name="eligible" value="no">아니요, 자격 미달 안내를 시험합니다</label></fieldset><p id="application-error" class="error" role="alert" hidden></p><div class="actions"><a class="button" href="#application">목록으로 돌아가기</a><button class="primary">다음: 신청서 작성</button></div></form>';
      if (draft.eligible) main.querySelector(`[name=eligible][value="${draft.eligible}"]`).checked = true;
      on('eligibility-form', 'submit', ev => { ev.preventDefault(); draft.eligible = main.querySelector('[name=eligible]:checked')?.value || ''; if (draft.eligible !== 'yes') { const error = M.validateApplication(draft); showError('application-error', error.message, 'eligible'); return; } go('application/form'); }); return;
    }
    if (stage === 'form') {
      if (draft.eligible !== 'yes') { go('application/eligibility'); return; }
      main.innerHTML = pageHeading('모의 교육 참여 신청서', '개인정보 대신 고정된 예제 선택값만 사용합니다. 필수 항목을 모두 선택해 주세요.', 903) + stepList(applicationSteps, 1) + `<form id="application-form" novalidate><h2>참여 정보</h2><div class="field"><label for="topic">교육 주제 (필수)</label><select id="topic" aria-describedby="application-error"><option value="">선택해 주세요</option><option>디지털 기초</option><option>생활 안전</option></select></div><div class="field"><label for="delivery">참여 방법 (필수)</label><small id="delivery-help">방문을 선택하면 시간대를 추가로 선택합니다. 온라인으로 변경해도 이전 시간 선택은 저장되지만 제출에는 사용되지 않습니다.</small><select id="delivery" aria-describedby="delivery-help application-error"><option value="">선택해 주세요</option><option>온라인</option><option>방문</option></select></div><div class="field" id="time-field" hidden><label for="time">방문 시간대 (필수)</label><select id="time" aria-describedby="application-error"><option value="">선택해 주세요</option><option>오전</option><option>오후</option></select></div><p id="dependency-notice" role="status"></p><details><summary>작성 도움말</summary><p>주제는 원하는 교육 예제를 뜻합니다. 방문을 선택하면 시간대가 필요합니다. 이 샘플에는 업로드할 증빙 서류가 없습니다. 실제 서비스에서는 기관 담당자 문의처와 정확한 작성 매뉴얼을 연결하세요.</p></details><p id="application-error" class="error" role="alert" hidden></p><div class="actions"><a class="button" href="#application/eligibility">이전: 유의 사항·자격</a><button type="button" id="save-draft">모의 임시 저장</button><button class="primary" type="submit">다음: 확인·확정</button></div></form><div class="secondary-zone"><button class="danger" id="reset-draft">이 모의 신청서 초기화</button><p id="draft-saved-at">${savedAt ? `마지막 임시 저장: ${e(M.formatDate(savedAt))}` : '아직 임시 저장하지 않았습니다.'} 저장값은 이 브라우저에 남습니다.</p></div>`;
      for (const key of ['topic', 'delivery', 'time']) { byId(key).value = draft[key]; on(key, 'change', () => { draft[key] = byId(key).value; byId(key).removeAttribute('aria-invalid'); if (key === 'delivery') { byId('time-field').hidden = draft.delivery !== '방문'; byId('dependency-notice').textContent = draft.delivery === '방문' ? '방문 시간대 선택 항목이 추가되었습니다.' : '방문 시간대는 제출에 사용하지 않습니다.'; } }); }
      byId('time-field').hidden = draft.delivery !== '방문';
      on('save-draft', 'click', () => {
        const previousSavedAt = savedAt;
        savedAt = new Date().toISOString();
        if (persist('고정 선택값을 이 브라우저에 임시 저장했습니다. 새로고침 후 이어서 작성할 수 있습니다.')) {
          byId('draft-saved-at').textContent = `마지막 임시 저장: ${M.formatDate(savedAt)} 저장값은 이 브라우저에 남습니다.`;
        } else savedAt = previousSavedAt;
      });
      on('reset-draft', 'click', () => openDialog('이 모의 신청서를 초기화할까요?', '<p>현재 작성 중인 고정 선택값과 임시 저장값을 비웁니다. 이전 모의 접수 내역은 지우지 않습니다.</p>', [{ label: '계속 작성', run: () => {} }, { label: '모의 신청서 초기화', run: () => { draft = M.emptyDraft(); savedAt = null; persist(); go('application/eligibility'); } }]));
      on('application-form', 'submit', ev => { ev.preventDefault(); const error = M.validateApplication(draft); if (error) { showError('application-error', error.message, error.field); return; } go('application/review'); }); return;
    }
    if (stage === 'review') {
      if (M.validateApplication(draft)) { go('application/form'); return; }
      main.innerHTML = pageHeading('신청 내용을 확인해 주세요', '모의 접수 후 이 기록의 내용은 수정할 수 없습니다. 신청 내역에서 모의 취소 후 다시 연습할 수 있습니다.', 918) + stepList(applicationSteps, 2) + summary(draft) + '<div class="actions"><a class="button" href="#application/form">돌아가서 수정</a><button class="primary" id="submit-application">모의 신청 확정</button></div><p id="submit-status" role="status"></p>';
      on('submit-application', 'click', () => {
        byId('submit-application').disabled = true;
        byId('submit-status').innerHTML = '<span class="spinner" aria-hidden="true"></span>이 브라우저에 모의 기록을 만드는 중입니다.';
        const sequence = receipts.reduce((max, r) => Math.max(max, Number(r.id.slice(5))), 0) + 1;
        const result = M.createReceipt(draft, Date.now(), sequence);
        receipts.push(result); currentReceipt = result.id; draft = M.emptyDraft(); savedAt = null; persist();
        go('application/complete');
      }); return;
    }
    if (stage === 'complete') {
      if (!receipts.some(r => r.id === currentReceipt)) { missing('아직 모의 접수 내역이 없습니다. 신청 과정을 먼저 진행해 주세요.'); return; }
      main.innerHTML = pageHeading('모의 신청이 완료되었습니다', '실제 기관으로 접수되지 않았습니다. 이 브라우저의 연습 기록입니다.', 926) + stepList(applicationSteps, 3) + `<p class="success">모의 접수 번호: <strong>${e(currentReceipt)}</strong></p><p>직전 확인 단계에서 선택 내용을 검토했으므로 이 화면에서는 접수 번호와 다음 행동만 안내합니다.</p><div class="actions"><a class="button primary" href="#application/history">신청 내역·결과 보기</a><a class="button" href="#application/eligibility">다시 모의 신청하기</a><a class="button" href="#policy">관련 정책 정보 보기</a></div>`; return;
    }
    if (stage === 'info') {
      main.innerHTML = pageHeading('교육 참여 모의 신청', '개인정보 없이 교육 참여 신청 화면을 연습하는 가상 서비스입니다.', 875) + '<dl class="summary-list"><dt>대상</dt><dd>예제를 살펴보는 누구나</dd><dt>신청 기간</dt><dd>실습 예제는 상시 이용 가능</dd><dt>비용</dt><dd>무료 실습 · 실제 결제 없음</dd><dt>채널</dt><dd>이 로컬 예제에서만 가능. 방문·우편·전화 신청은 연결되지 않습니다.</dd><dt>준비 서류</dt><dd>없음. 실제 증빙자료를 업로드하지 마세요.</dd><dt>처리 절차</dt><dd>자격 선택 → 양식 → 확인 → 모의 접수</dd><dt>소요 시간</dt><dd>실습 예상 약 2분. 실제 처리 기한 아님.</dd></dl><details><summary>부가 도움말</summary><p>뒤로 가기나 목록 링크로 돌아가도 현재 모의 입력은 이 탭에서 유지됩니다. 임시 저장을 눌러야 새로고침 후에도 이어서 작성할 수 있습니다.</p></details><p>예제 변경 기준일: 2024-02-29. 운영 기관의 최신 정보로 오인하지 마세요.</p><div class="actions"><a class="button" href="#application">신청 목록으로 돌아가기</a><a class="button primary" href="#application/eligibility">모의 신청하기</a></div>'; return;
    }
    main.innerHTML = pageHeading('신청 서비스', '실제 서류 제출·조회·발급·예약 기능이 아닌 신청 패턴의 공통 화면과 상태 전이 예제입니다.', 858) + `<article class="card"><span class="badge">접수 중 · 모의</span><h2><a href="#application/info">교육 참여 모의 신청</a></h2><p>교육 주제와 참여 방법을 선택해 신청 과정을 연습합니다. 실습 기간은 상시이며 실제 접수 기간이 아닙니다.</p><p>분야: 교육 · 대상: 모든 실습 사용자</p><div class="actions"><a class="button primary" href="#application/eligibility">교육 참여 모의 신청하기</a><a class="button" href="#application/info">교육 참여 모의 신청 상세 정보</a></div></article><div class="actions"><a class="button" href="#application/history">신청 내역</a>${savedAt ? '<a class="button" href="#application/form">임시 저장한 모의 신청 이어쓰기</a>' : ''}</div>${source(861)}`;
  }
  function summary(d) { return `<dl class="summary-list"><dt>교육 주제</dt><dd>${e(d.topic)}</dd><dt>참여 방법</dt><dd>${e(d.delivery)}</dd>${d.delivery === '방문' ? `<dt>방문 시간</dt><dd>${e(d.time)}</dd>` : ''}</dl>`; }
  function history() {
    const ordered = receipts.filter(r => receiptFilter === '전체' || r.status === receiptFilter).slice().sort((a, b) => receiptSort === 'latest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));
    main.innerHTML = pageHeading('신청 내역', '이 브라우저에 저장한 모의 내역입니다. 실제 신청 이력·심사 결과가 아닙니다.', 934) + `<div class="filters"><label>진행 상태<select id="receipt-filter"><option>전체</option><option>모의 접수</option><option>모의 취소</option></select></label><label>정렬 기준<select id="receipt-sort"><option value="latest">최근 신청순</option><option value="oldest">오래된 신청순</option></select></label></div><p role="status">총 ${ordered.length}건</p>${ordered.length ? `<label class="choice"><input type="checkbox" id="select-all-receipts">현재 목록 전체 선택</label><div class="actions"><button id="cancel-selected" class="danger">선택한 모의 신청 취소</button><button id="download-receipts">선택한 모의 내역 저장 (JSON)</button></div>${ordered.map(r => `<article class="receipt"><div class="receipt-select"><input id="select-${e(r.id)}" type="checkbox" data-receipt="${e(r.id)}"${selectedReceipts.has(r.id) ? ' checked' : ''}><label for="select-${e(r.id)}">${e(r.id)} 교육 참여 모의 신청 선택</label></div><h2><a href="#application/receipt/${e(r.id)}">교육 참여 모의 신청 · ${e(r.id)}</a></h2><p>${e(M.formatDate(r.createdAt))} · <strong>${e(r.status)}</strong></p><ol class="timeline" aria-label="처리 절차"><li aria-current="step">${e(r.status)}</li><li>실제 심사 없음</li><li>실제 처리 없음</li></ol><a href="#application/receipt/${e(r.id)}">${e(r.id)} 상세 내역 보기</a></article>`).join('')}` : '<div class="notice"><h2>모의 신청 내역이 없습니다</h2><p>아직 신청하지 않았거나 현재 필터에 맞는 기록이 없습니다.</p></div>'}<div class="actions"><a class="button primary" href="#application/eligibility">새 모의 신청</a><a class="button" href="#application">서비스 목록</a></div><div class="secondary-zone"><button id="clear-history" class="danger">이 예제의 저장 기록 모두 지우기</button><p>다른 사이트·다른 Altool 자산의 저장값은 지우지 않습니다.</p></div>`;
    byId('receipt-filter').value = receiptFilter; byId('receipt-sort').value = receiptSort;
    on('receipt-filter', 'change', () => { receiptFilter = byId('receipt-filter').value; selectedReceipts.clear(); history(); byId('receipt-filter').focus(); });
    on('receipt-sort', 'change', () => { receiptSort = byId('receipt-sort').value; history(); byId('receipt-sort').focus(); });
    main.querySelectorAll('[data-receipt]').forEach(input => input.addEventListener('change', () => { input.checked ? selectedReceipts.add(input.dataset.receipt) : selectedReceipts.delete(input.dataset.receipt); syncAll(ordered); }));
    on('select-all-receipts', 'change', () => { const checked = byId('select-all-receipts').checked; ordered.forEach(r => checked ? selectedReceipts.add(r.id) : selectedReceipts.delete(r.id)); history(); byId('select-all-receipts').focus(); });
    syncAll(ordered);
    on('cancel-selected', 'click', () => { const ids = [...selectedReceipts]; if (!ids.length) { announce('취소할 모의 신청을 먼저 선택해 주세요.'); return; } openDialog('선택한 모의 신청을 취소할까요?', `<p>${ids.length}건 중 모의 접수 상태인 기록만 취소합니다. 실제 신청에는 영향을 주지 않습니다.</p>`, [{ label: '돌아가기', run: () => {} }, { label: '모의 신청 취소 확정', run: () => { receipts = receipts.map(r => ids.includes(r.id) ? M.cancelReceipt(r, Date.now()) : r); selectedReceipts.clear(); persist('선택한 모의 신청을 취소했습니다.'); history(); } }]); });
    on('download-receipts', 'click', () => { const rows = receipts.filter(r => selectedReceipts.has(r.id)); if (!rows.length) { announce('저장할 모의 내역을 먼저 선택해 주세요.'); return; } download('altool-demo-receipts.json', JSON.stringify({ demo: true, receipts: rows }, null, 2), 'application/json'); });
    on('clear-history', 'click', () => openDialog('이 예제의 저장 기록을 모두 지울까요?', '<p>모의 신청 내역과 임시 저장한 고정 선택값을 지웁니다. 이 동작은 되돌릴 수 없습니다.</p>', [{ label: '기록 유지', run: () => {} }, { label: '이 예제 기록 지우기', run: () => { try { localStorage.removeItem(STORE); draft = M.emptyDraft(); receipts = []; savedAt = null; currentReceipt = ''; selectedReceipts.clear(); history(); announce('이 예제의 저장 기록을 지웠습니다.'); } catch (_) { announce('저장소 권한 때문에 삭제하지 못했습니다. 브라우저의 사이트 데이터 설정을 확인하세요.'); } } }]));
  }
  function syncAll(rows) { const box = byId('select-all-receipts'); if (!box) return; const selected = rows.filter(r => selectedReceipts.has(r.id)).length; box.checked = selected === rows.length && rows.length > 0; box.indeterminate = selected > 0 && selected < rows.length; }
  function receipt(id) { const r = receipts.find(item => item.id === id); if (!r) { missing('이 브라우저에 해당 모의 접수 기록이 없습니다.'); return; } main.innerHTML = pageHeading(`교육 참여 모의 신청 · ${r.id}`, '입력한 고정 선택값과 상태 변경 이력을 모두 확인할 수 있습니다.', 934) + `<p>예제 자격 선택: ${r.draft.eligible === 'yes' ? '해당' : '미해당'}</p>${summary(r.draft)}<h2>모의 처리 이력</h2><ol>${r.history.map(h => `<li>${e(M.formatDate(h.at))} · ${e(h.status)}</li>`).join('')}</ol><p>실제 기관의 심사·처리 단계는 연결되지 않았습니다.</p><a class="button" href="#application/history">신청 내역으로 돌아가기</a>`; }
  function download(name, text, type) { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); announce('선택한 모의 데이터를 다운로드했습니다.'); }
  function policy(stage, id) {
    if (stage === 'detail') {
      const item = M.fixtures.find(i => i.id === id && i.category === '정책'); if (!item) { missing(); return; }
      main.innerHTML = pageHeading(item.title, item.description, 960) + `<p><span class="badge">대상 ${item.audience}</span>예제 기준일 ${item.date}</p><nav aria-label="본문 목차"><a href="#policy/detail/${id}/overview">정책 개요</a><a href="#policy/detail/${id}/process">참여 절차</a></nav><h2 id="overview">정책 개요</h2><p>디지털 기기와 생활 안전을 쉽게 배우도록 돕는 가상의 교육 지원 정책입니다. 실제 지원 대상·지원 금액·운영 기관에 관한 안내가 아닙니다.</p><h2 id="process">참여 절차</h2><div class="infographic" role="img" aria-label="정책 정보 확인, 교육 선택, 모의 신청의 세 단계"><span>1. 정책 정보 확인</span><span>2. 교육 선택</span><span>3. 모의 신청</span></div><details><summary>추가 도움말과 문의</summary><p>이 예제에는 실제 연락처가 연결되지 않습니다. 배포 시 정확한 운영 담당자·문의처·최종 갱신일을 지정하세요.</p></details><div class="actions"><a class="button" href="#policy">정책 목록으로 돌아가기</a><a class="button" href="#policy/resources">관련 정책 자료</a><a class="button primary" href="#application/eligibility">교육 참여 모의 신청</a></div>`; const anchor = route().split('/')[3]; if (anchor && ['overview', 'process'].includes(anchor)) byId(anchor).scrollIntoView(); return;
    }
    if (stage === 'resources') {
      main.innerHTML = pageHeading('정책 자료', '신규·변경·발행 주기 정보를 함께 탐색하는 자료 목록입니다. 일회성 예제 자료만 제공합니다.', 970) + '<form id="resource-search" role="search"><div class="field"><label for="resource-query">정책 자료명</label><input id="resource-query" type="search"></div><button class="primary">자료 검색</button></form><p id="resource-count" role="status" aria-live="polite"></p><div id="resource-result"></div><a class="button" href="#policy">정책 목록으로 돌아가기</a>';
      const show = () => { const q = byId('resource-query').value.trim(); const match = '디지털 배움 지원 안내 예제'.includes(q); byId('resource-count').textContent = `총 ${match ? 1 : 0}건`; byId('resource-result').innerHTML = match ? '<article class="result"><span class="badge">신규 예제</span><h2>디지털 배움 지원 안내 예제</h2><p>발행 주기: 일회성 실습 자료. 정기 간행물이 아닙니다.</p><p>파일 유형: TXT · 실제 법령·정책 문서가 아닙니다.</p><a href="sample-policy.txt" download>디지털 배움 지원 안내 예제 다운로드 (TXT)</a></article>' : '<p class="notice">일치하는 자료가 없습니다. 검색어를 줄여 다시 검색해 보세요.</p>'; };
      on('resource-search', 'submit', ev => { ev.preventDefault(); show(); }); show(); return;
    }
    const data = M.search(M.fixtures.filter(i => i.category === '정책'), { query: policyQuery, audience: policyCategory });
    const pages = Math.max(1, Math.ceil(data.length / 3)); policyPage = Math.min(policyPage, pages);
    main.innerHTML = pageHeading('정책 정보', '모든 가상 정책을 하나의 목록에서 대상·검색어로 좁혀볼 수 있습니다.', 948) + `<form id="policy-search" role="search"><div class="filters"><label>정책명<input id="policy-query" type="search" value="${e(policyQuery)}"></label><label>정책 대상<select id="policy-audience">${['전체', '청년', '중장년'].map(v => `<option>${v}</option>`).join('')}</select></label><button class="primary">정책 검색</button><button type="button" id="policy-reset">조건 초기화</button></div></form><p role="status" aria-live="polite">총 ${data.length}건</p>${data.length ? `<div class="cards">${data.slice((policyPage - 1) * 3, policyPage * 3).map(item => `<article class="card">${item.isNew ? '<span class="badge">신규 예제</span>' : ''}<span class="badge">대상 ${item.audience}</span><h2><a href="#policy/detail/${item.id}">${e(item.title)}</a></h2><p>${e(item.description)}</p><button data-bookmark="${item.id}" aria-label="${e(item.title)} 관심 정책 ${bookmarked.has(item.id) ? '해제' : '저장'}" aria-pressed="${bookmarked.has(item.id)}">${bookmarked.has(item.id) ? '관심 정책 해제' : '관심 정책 저장'}</button></article>`).join('')}</div><nav class="pagination" aria-label="정책 목록 페이지">${Array.from({ length: pages }, (_, i) => `<button data-policy-page="${i + 1}"${policyPage === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('')}</nav>` : '<div class="notice"><h2>조건에 맞는 정책이 없습니다</h2><p>다른 단어로 검색하거나 조건을 초기화해 주세요.</p></div>'}<a class="button" href="#policy/resources">정책 자료 탐색</a>${source(951)}`;
    byId('policy-audience').value = policyCategory;
    on('policy-search', 'submit', ev => { ev.preventDefault(); policyQuery = byId('policy-query').value; policyCategory = byId('policy-audience').value; policyPage = 1; policy(); byId('policy-query').focus(); });
    on('policy-reset', 'click', () => { policyQuery = ''; policyCategory = '전체'; policyPage = 1; policy(); byId('policy-reset').focus(); });
    main.querySelectorAll('[data-policy-page]').forEach(b => b.addEventListener('click', () => { policyPage = Number(b.dataset.policyPage); policy(); main.querySelector(`[data-policy-page="${policyPage}"]`)?.focus(); }));
    main.querySelectorAll('[data-bookmark]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.bookmark; bookmarked.has(id) ? bookmarked.delete(id) : bookmarked.add(id); policy(); main.querySelector(`[data-bookmark="${id}"]`)?.focus(); announce('관심 정책 상태를 이 탭에 반영했습니다. 새로고침하면 초기화됩니다.'); }));
  }
  function missing(message = '예제 항목을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.') { main.innerHTML = `<h1>항목을 찾을 수 없습니다</h1><p class="notice">${e(message)}</p><a class="button" href="#visit">홈으로</a>`; }
  function render() {
    ++requestVersion;
    if (dialog.open) dialog.close();
    const parts = route().split('/');
    const changed = renderedRoute !== route();
    renderedRoute = route();
    document.querySelectorAll('header nav a').forEach(a => { if (a.hash.slice(1).split('/')[0] === parts[0]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (parts[0] === 'visit') visit();
    else if (parts[0] === 'search') parts[1] === 'detail' ? searchDetail(parts[2]) : renderSearch();
    else if (parts[0] === 'login') login(parts[1]);
    else if (parts[0] === 'application') application(parts[1], parts[2]);
    else if (parts[0] === 'policy') policy(parts[1], parts[2]);
    else missing();
    document.title = `${main.querySelector('h1')?.textContent || '서비스 패턴'} · Altool 모의 자산`;
    if (changed && !(parts[0] === 'login' && parts[1] === 'complete') && !parts[3]) { main.focus(); window.scrollTo({ top: 0 }); }
  }
  byId('login-link').addEventListener('click', () => { if (!signedIn && !route().startsWith('login')) returnTarget = route(); });
  window.addEventListener('hashchange', render);
  window.setInterval(tickSession, 1000);
  updateHeader(); render(); tickSession();
})();
