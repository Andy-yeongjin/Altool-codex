/* Original Altool demonstration code. KRDS 2024.02 source references: README.md. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KrdsServiceModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const fixtures = [
    ['청년 배움 지원', '정책', '청년', '배움 기회를 안내하는 가상 정책입니다.'],
    ['지역 배움 공간 예약', '서비스', '전체', '지역 학습 공간을 예약하는 가상 서비스입니다.'],
    ['배움 지원 신청 안내', '자료', '청년', '신청서 작성 순서를 정리한 예제 안내입니다.'],
    ['생활 안전 교육', '정책', '전체', '일상에서 안전을 배우는 가상 정책입니다.'],
    ['생활 안전 교육 신청', '서비스', '전체', '안전 교육 참여 과정을 연습합니다.'],
    ['생활 안전 안내서', '자료', '전체', '이해하기 쉬운 안전 정보 예제입니다.'],
    ['디지털 배움 지원', '정책', '중장년', '디지털 기기 활용을 돕는 가상 정책입니다.'],
    ['디지털 배움 상담', '서비스', '중장년', '상담 예약 화면을 연습합니다.'],
    ['디지털 배움 매뉴얼', '자료', '중장년', '디지털 배움 서비스의 예제 매뉴얼입니다.'],
    ['청년 배움 소식', '자료', '청년', '배움 프로그램의 가상 소식입니다.'],
    ['함께 배움 정책', '정책', '전체', '모두를 위한 배움 정책 예제입니다.'],
    ['함께 배움 신청', '서비스', '전체', '공동 학습 참여 신청을 연습합니다.'],
    ['함께 배움 보고서', '자료', '전체', '가상 운영 결과를 정리한 예제 보고서입니다.'],
    ['청년 진로 안내', '정책', '청년', '진로 탐색을 돕는 가상 정보입니다.'],
    ['지역 생활 안내', '자료', '전체', '지역 서비스 탐색을 위한 예제입니다.'],
  ].map((v, i) => ({ id: String(i + 1), title: v[0], category: v[1], audience: v[2], description: v[3], date: `2024-02-${String(28 - i).padStart(2, '0')}`, popularity: 100 - i, isNew: i < 2 }));
  const terms = ['배움', '청년', '생활 안전', '디지털', '지역'];
  function search(data, options = {}) {
    const q = (options.query || '').trim().toLocaleLowerCase('ko');
    const words = q.split(/\s+/).filter(Boolean);
    let results = data.filter(item => words.every(word => `${item.title} ${item.description}`.toLocaleLowerCase('ko').includes(word)));
    if (options.category && options.category !== '전체') results = results.filter(i => i.category === options.category);
    if (options.audience && options.audience !== '전체') results = results.filter(i => i.audience === options.audience);
    if (options.from) results = results.filter(i => i.date >= options.from);
    if (options.to) results = results.filter(i => i.date <= options.to);
    const score = i => words.reduce((sum, word) => sum + (i.title.includes(word) ? 3 : 1), 0);
    results.sort(options.sort === 'latest' ? (a, b) => b.date.localeCompare(a.date) : options.sort === 'popular' ? (a, b) => b.popularity - a.popularity : (a, b) => score(b) - score(a) || Number(a.id) - Number(b.id));
    return results;
  }
  function dateRange(days) {
    if (!days || days === 'all' || days === 'custom') return { from: '', to: '' };
    const until = new Date('2024-02-29T00:00:00Z');
    const start = new Date(until.getTime() - Number(days) * 86400000);
    return { from: start.toISOString().slice(0, 10), to: '2024-02-29' };
  }
  function rangeError(from, to) {
    if (from && to && from > to) return '시작 날짜가 종료 날짜보다 늦습니다. 날짜 범위를 확인해 주세요.';
    return '';
  }
  function validateLogin(id, password) {
    if (!id) return { field: 'demo-id', message: '예제 아이디를 입력해 주세요. demo@example.invalid를 사용합니다.' };
    if (!password) return { field: 'demo-password', message: '예제 비밀번호를 입력해 주세요. sample-only를 사용합니다.' };
    if (id !== 'demo@example.invalid' || password !== 'sample-only') return { field: 'demo-id', message: '예제 정보가 일치하지 않습니다. demo@example.invalid / sample-only를 사용해 주세요. 실제 계정 정보는 입력하지 마세요.' };
    return null;
  }
  function validateApplication(draft) {
    if (!draft.eligible) return { field: 'eligible', message: '예제 신청 대상에 해당하는지 선택해 주세요.' };
    if (draft.eligible === 'no') return { field: 'eligible', message: '예제 자격 조건에 해당하지 않습니다. 실제 자격 판단이 아니며 다른 서비스를 탐색할 수 있습니다.' };
    if (!draft.topic || !['디지털 기초', '생활 안전'].includes(draft.topic)) return { field: 'topic', message: '참여할 예제 교육을 선택해 주세요.' };
    if (!draft.delivery || !['온라인', '방문'].includes(draft.delivery)) return { field: 'delivery', message: '예제 참여 방법을 선택해 주세요.' };
    if (draft.delivery === '방문' && !['오전', '오후'].includes(draft.time)) return { field: 'time', message: '방문할 예제 시간대를 선택해 주세요.' };
    return null;
  }
  function emptyDraft() { return { eligible: '', topic: '', delivery: '', time: '' }; }
  // Only fixed-choice demonstration values are persisted, never free-form personal data.
  function cleanDraft(input = {}) {
    return { eligible: ['yes', 'no'].includes(input.eligible) ? input.eligible : '', topic: ['디지털 기초', '생활 안전'].includes(input.topic) ? input.topic : '', delivery: ['온라인', '방문'].includes(input.delivery) ? input.delivery : '', time: ['오전', '오후'].includes(input.time) ? input.time : '' };
  }
  function createReceipt(draft, now, sequence) {
    const error = validateApplication(draft);
    if (error) throw new Error(error.message);
    const submitted = cleanDraft(draft);
    if (submitted.delivery !== '방문') submitted.time = '';
    return { id: `DEMO-${String(sequence).padStart(4, '0')}`, createdAt: new Date(now).toISOString(), draft: submitted, status: '모의 접수', history: [{ status: '모의 접수', at: new Date(now).toISOString() }] };
  }
  function cancelReceipt(receipt, now) {
    if (receipt.status !== '모의 접수') return receipt;
    return { ...receipt, status: '모의 취소', history: [...receipt.history, { status: '모의 취소', at: new Date(now).toISOString() }] };
  }
  function formatDate(value) { return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value)); }
  function nextSuggestion(index, key, length) {
    if (!length) return -1;
    return key === 'ArrowUp' ? (index - 1 + length) % length : (index + 1) % length;
  }
  function restore(raw) {
    const clean = { draft: emptyDraft(), receipts: [], savedAt: null };
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return clean;
      clean.draft = cleanDraft(parsed.draft);
      clean.savedAt = typeof parsed.savedAt === 'string' && !isNaN(Date.parse(parsed.savedAt)) ? parsed.savedAt : null;
      clean.receipts = (Array.isArray(parsed.receipts) ? parsed.receipts : []).filter(r => /^DEMO-\d+$/.test(r.id) && !isNaN(Date.parse(r.createdAt)) && ['모의 접수', '모의 취소'].includes(r.status)).slice(-100).map(r => ({ id: r.id, createdAt: new Date(r.createdAt).toISOString(), draft: cleanDraft(r.draft), status: r.status, history: (Array.isArray(r.history) ? r.history : []).filter(h => ['모의 접수', '모의 취소'].includes(h.status) && !isNaN(Date.parse(h.at))).map(h => ({ status: h.status, at: new Date(h.at).toISOString() })) }));
    } catch (_) { /* Corrupt or unavailable local demo state starts empty. */ }
    return clean;
  }
  return { fixtures, terms, search, dateRange, rangeError, validateLogin, validateApplication, emptyDraft, cleanDraft, createReceipt, cancelReceipt, formatDate, nextSuggestion, restore };
});
