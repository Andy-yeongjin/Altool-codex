(function (root, factory) {
  const value = factory();
  if (typeof module === 'object' && module.exports) module.exports = value;
  else root.KrdsServiceVariants = value;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const serviceTypes = ['제출', '조회', '발급', '예약'];
  const serviceStates = ['접수 중', '예정', '마감', '외부 신청'];
  const services = Array.from({ length: 24 }, (_, i) => ({ id: `S${i + 1}`, title: `${['디지털 교육', '생활 안전', '공간 이용', '활동 지원', '자료 제공', '상담 참여'][i % 6]} ${serviceTypes[i % 4]} ${i + 1}`, type: serviceTypes[i % 4], state: serviceStates[Math.floor(i / 6)], date: `2024-03-${String(28 - i).padStart(2, '0')}`, description: '실제 기관과 무관한 공통 화면용 가상 서비스입니다.' }));
  const history = Array.from({ length: 37 }, (_, i) => ({ id: `DEMO-V-${String(i + 1).padStart(3, '0')}`, title: services[i % services.length].title, status: ['접수', '검토 중', '보완 요청', '처리 완료', '취소'][i % 5], date: `2024-02-${String(28 - i % 28).padStart(2, '0')}`, type: serviceTypes[i % 4] }));
  const publications = Array.from({ length: 18 }, (_, i) => ({ id: `P${i + 1}`, title: `${['디지털 정책 동향', '생활 안전 소식', '서비스 이용 안내'][i % 3]} ${i + 1}호`, type: ['보고서', '매뉴얼', '간행물'][i % 3], state: ['신규', '변경', '정상 발행', '일시 중단', '발행 종료', '주기 변경'][Math.floor(i / 3)], cycle: ['매월 마지막 주', '매주 월요일', '분기별 첫 주'][i % 3], date: `2024-02-${String(28 - i).padStart(2, '0')}` }));
  const media = Array.from({ length: 18 }, (_, i) => ({ id: `M${i + 1}`, title: `${['디지털 배움', '생활 안전', '참여 절차'][i % 3]} ${i + 1}`, description: '정보 탐색과 참여 절차를 설명하는 가상 미디어 자료', type: ['문서', '이미지', '영상'][Math.floor(i / 6)], date: `2024-02-${String(28 - i).padStart(2, '0')}`, duration: 12, popularity: (i * 7) % 23 }));
  function paginate(rows, page = 1, size = 10) {
    const pages = Math.max(1, Math.ceil(rows.length / size));
    const current = Math.min(Math.max(Number(page) || 1, 1), pages);
    return { items: rows.slice((current - 1) * size, current * size), page: current, pages, total: rows.length };
  }
  function filter(rows, options = {}) {
    const q = (options.query || '').trim().toLowerCase();
    const any = (options.any || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const exclude = (options.exclude || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const all = q.split(/\s+/).filter(Boolean);
    const results = rows.filter(row => {
      const text = `${row.title} ${row.description || ''}`.toLowerCase();
      return all.every(word => text.includes(word)) && (!any.length || any.some(word => text.includes(word))) && exclude.every(word => !text.includes(word)) && (!options.type || options.type === '전체' || row.type === options.type) && (!options.state || options.state === '전체' || (row.state || row.status) === options.state) && (!options.from || row.date >= options.from) && (!options.to || row.date <= options.to);
    });
    if (options.sort === 'relevance') {
      const score = row => all.reduce((sum, word) => sum + (row.title.toLowerCase().includes(word) ? 3 : 0) + ((row.description || '').toLowerCase().includes(word) ? 1 : 0), 0);
      results.sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date));
    } else if (options.sort === 'popular') results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    else if (options.sort === 'name') results.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    else if (options.sort === 'oldest') results.sort((a, b) => a.date.localeCompare(b.date));
    else if (options.sort === 'available') results.sort((a, b) => serviceStates.indexOf(a.state) - serviceStates.indexOf(b.state) || a.date.localeCompare(b.date));
    else results.sort((a, b) => b.date.localeCompare(a.date));
    return results;
  }
  function checkRange(from, to) { return from && to && from > to ? '시작 날짜가 종료 날짜보다 늦습니다.' : ''; }
  function checkTransaction(type, fields) {
    if (!serviceTypes.includes(type)) return '서비스 유형을 선택해 주세요.';
    if (type === '제출' && !['본인', '대리인'].includes(fields.subject)) return '모의 신청 주체를 선택해 주세요.';
    if (type === '조회' && fields.reference !== 'DEMO-2024') return '실습 조회번호 DEMO-2024를 입력해 주세요. 실제 번호는 사용하지 마세요.';
    if (type === '발급' && !['일반', '상세'].includes(fields.format)) return '모의 발급 유형을 선택해 주세요.';
    if (type === '예약' && (!['2024-03-01', '2024-03-02'].includes(fields.day) || !['오전', '오후'].includes(fields.slot))) return '예제 예약 날짜와 시간대를 선택해 주세요.';
    return '';
  }
  function transactionSnapshot(fields) {
    const relevant = { '제출':['subject'], '조회':['reference'], '발급':['format'], '예약':['day','slot'] }[fields.type] || [];
    const snapshot = { type: fields.type, shared: !!fields.shared, agreed: !!fields.shared && !!fields.agreed };
    for (const key of relevant) snapshot[key] = fields[key] || '';
    snapshot.files = fields.shared ? [] : (fields.files || []).map(file => ({ name: file.name, size: file.size }));
    return snapshot;
  }
  function transactionErrorField(fields) {
    if (fields.type === '제출' && !['본인','대리인'].includes(fields.subject)) return 'transaction-subject';
    if (fields.type === '조회' && fields.reference !== 'DEMO-2024') return 'transaction-reference';
    if (fields.type === '발급' && !['일반','상세'].includes(fields.format)) return 'transaction-format';
    if (fields.type === '예약' && !['2024-03-01','2024-03-02'].includes(fields.day)) return 'transaction-day';
    if (fields.type === '예약' && !['오전','오후'].includes(fields.slot)) return 'transaction-slot';
    return fields.shared && !fields.agreed ? 'shared-agree' : '';
  }
  function publicationNotice(item) {
    if (item.state === '일시 중단') return `정기 발행이 일시 중단되었습니다. 재개 일정은 미정입니다. 기존 주기: ${item.cycle}.`;
    if (item.state === '발행 종료') return `발행이 종료되었습니다. 이전 자료는 계속 확인할 수 있습니다. 기존 주기: ${item.cycle}.`;
    if (item.state === '주기 변경') return `다음 호부터 분기별 발행으로 변경됩니다. 기존 주기: ${item.cycle}.`;
    return `발행 주기: ${item.cycle}. ${item.state === '변경' ? '본문과 부록이 개정되었습니다.' : '표시한 일정은 실습용 예제입니다.'}`;
  }
  function fileError(file) {
    if (!/\.(pdf|txt|png|jpg|jpeg)$/i.test(file.name)) return 'PDF, TXT, PNG, JPG 예제 파일만 선택해 주세요.';
    if (file.size > 5 * 1024 * 1024) return '각 파일은 5MB 이하여야 합니다.';
    return '';
  }
  function videoFileError(file) {
    if (!/\.(mp4|webm)$/i.test(file.name)) return 'MP4 또는 WebM 예제 영상만 선택해 주세요.';
    if (file.size > 50 * 1024 * 1024) return '영상 예제는 50MB 이하여야 합니다.';
    return '';
  }
  function transitionRecord(record, action) {
    if (action === 'cancel' && ['접수', '보완 요청'].includes(record.status)) return { ...record, status: '취소' };
    if (action === 'supplement' && record.status === '보완 요청') return { ...record, status: '검토 중' };
    return record;
  }
  return { serviceTypes, serviceStates, services, history, publications, media, paginate, filter, checkRange, checkTransaction, publicationNotice, transactionSnapshot, transactionErrorField, fileError, videoFileError, transitionRecord };
});
