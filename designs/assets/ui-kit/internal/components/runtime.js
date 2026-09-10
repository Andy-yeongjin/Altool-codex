/* Altool authored UI adapters, KRDS PDF 2024.02. No network, storage or backend.
 * Use mount(container) after inserting a fragment; duplicate mounts are ignored.
 * UI state changes emit `altool:change` from the component with typed detail.
 * Hosts own data loading, submission, authorization and server validation.
 */
(function (global) {
  'use strict';
  const sharedMessages = typeof module !== 'undefined' && module.exports ? require('./messages.js') : global.AltoolComponentMessages;
  if (!sharedMessages) throw new Error('Load components/messages.js before runtime.js');
  const message = key => sharedMessages.messages[key];
  const bound = new WeakSet();
  const list = (root, selector) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function pageWindow(page, total, compact = false) {
    if (!Number.isInteger(total) || total < 1) return [];
    page = clamp(Number(page) || 1, 1, total);
    const numbers = new Set([1, total]);
    const radius = compact ? 1 : 2;
    for (let n = Math.max(1, page - radius); n <= Math.min(total, page + radius); n++) numbers.add(n);
    const result = [];
    for (const n of [...numbers].sort((a, b) => a - b)) {
      if (result.length && n - result[result.length - 1] > 1) result.push('gap');
      result.push(n);
    }
    return result;
  }
  function dateParts(year, month, day) {
    if (!/^\d{4}$/.test(String(year))) return null;
    if (![year, month, day].every(v => /^\d+$/.test(String(v)))) return null;
    const y = Number(year), m = Number(month), d = Number(day);
    if (y < 1 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const date = new Date(0);
    date.setUTCFullYear(y, m - 1, d);
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function fileErrors(files, options = {}) {
    const errors = [];
    if (files.length > options.maxFiles) errors.push(`${message('file.count').title} ${message('file.count').body} 최대 ${options.maxFiles}개.`);
    for (const file of files) {
      if (file.size === 0) errors.push(`${file.name}: ${message('file.empty').title} ${message('file.empty').body}`);
      if (file.size > options.maxBytes) errors.push(`${file.name}: ${message('file.size').title} ${message('file.size').body} 최대 ${options.maxBytes}바이트.`);
      const accept = (options.accept || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
      if (accept.length && !accept.some(pattern => pattern.startsWith('.') ? file.name.toLowerCase().endsWith(pattern) :
        pattern.endsWith('/*') ? file.type.toLowerCase().startsWith(pattern.slice(0, -1)) : file.type.toLowerCase() === pattern)) {
        errors.push(`${file.name}: ${message('file.type').title} ${message('file.type').body} 허용 형식: ${options.accept}.`);
      }
    }
    return errors;
  }
  function selectionState(items) {
    const enabled = items.filter(item => !item.disabled);
    const selected = enabled.filter(item => item.checked).length;
    return {checked: enabled.length > 0 && selected === enabled.length,
      indeterminate: selected > 0 && selected < enabled.length, count: selected, total: enabled.length};
  }
  function transferState(detail = {}) {
    const state = ['ready','uploading','complete','error','cancelled'].includes(detail.state) ? detail.state : 'ready';
    return {state, name:String(detail.name || '선택한 파일'), progress:state === 'complete' ? 100 : clamp(Number(detail.progress) || 0, 0, 100), error:state === 'error' ? message('error.upload').body : '', reason:state === 'error' && typeof detail.reason === 'string' ? detail.reason : ''};
  }
  function emit(root, detail) {
    const Event = root.ownerDocument.defaultView.CustomEvent;
    root.dispatchEvent(new Event('altool:change', {bubbles: true, detail}));
  }
  function text(root, selector, value) { const node = root.querySelector(selector); if (node) node.textContent = value; }
  function button(root, label, callback) {
    const node = root.ownerDocument.createElement('button'); node.type = 'button'; node.textContent = label;
    node.addEventListener('click', callback); return node;
  }
  const handlers = {
    'image-optimize'(root) {
      const view = root.ownerDocument.defaultView;
      const input = root.querySelector('input');
      const control = root.querySelector('[data-optimize]');
      const result = root.querySelector('[data-optimize-result]');
      let file = null, url = null, revision = 0;
      function clear() {
        if (url) view.URL.revokeObjectURL(url);
        url = null; result.hidden = true;
        text(root, '[data-optimize-error]', '');
        text(root, '[data-optimize-status]', '');
      }
      input.addEventListener('change', () => {
        if (!input.files.length) return;
        revision++; clear(); file = input.files[0];
        const errors = fileErrors([file], {accept:'image/jpeg,image/png,image/webp'});
        const valid = !errors.length;
        control.disabled = !valid;
        text(root, valid ? '[data-optimize-status]' : '[data-optimize-error]', valid ? `${file.name}, ${file.size.toLocaleString('ko-KR')} 바이트 선택됨` : errors.join(' '));
      });
      control.addEventListener('click', async () => {
        const version = revision;
        const original = file;
        let bitmap = null;
        clear(); control.disabled = true;
        text(root, '[data-optimize-status]', '이미지 용량을 줄이고 있습니다.');
        try {
          bitmap = await view.createImageBitmap(original);
          const ratio = Math.min(1, (Number(root.dataset.maxEdge) || 1600) / Math.max(bitmap.width,bitmap.height));
          const canvas = root.ownerDocument.createElement('canvas');
          canvas.width = Math.max(1, Math.round(bitmap.width * ratio)); canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
          const context = canvas.getContext('2d');
          context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(bitmap,0,0,canvas.width,canvas.height);
          const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',Number(root.dataset.quality) || .8));
          if (version !== revision) return;
          if (!blob) throw new Error('Image encoding failed');
          if (blob.size >= original.size) {
            text(root, '[data-optimize-status]', '변환한 이미지가 더 작지 않습니다. 원본 파일을 유지해 주세요.');
            emit(root, {component:'file-image-optimize',state:'not-smaller',file:original}); return;
          }
          const optimized = new view.File([blob], original.name.replace(/\.[^.]+$/, '') + '-optimized.jpg', {type:'image/jpeg'});
          url = view.URL.createObjectURL(blob);
          root.querySelector('img').src = url;
          const download = root.querySelector('[data-optimize-download]'); download.href = url; download.download = optimized.name;
          text(root, '[data-optimize-size]', `${original.size.toLocaleString('ko-KR')} → ${blob.size.toLocaleString('ko-KR')} 바이트, ${canvas.width}×${canvas.height}픽셀`);
          text(root, '[data-optimize-status]', '로컬 이미지 변환이 끝났습니다. 화질을 확인해 주세요.'); result.hidden = false;
          emit(root, {component:'file-image-optimize',state:'optimized',file:optimized,original});
        } catch (_) {
          if (version === revision) { text(root, '[data-optimize-status]', ''); text(root, '[data-optimize-error]', `${message('error.generic').title} ${message('error.generic').body} 원본은 변경되지 않았습니다.`); }
        } finally { if (bitmap) bitmap.close(); if (version === revision) control.disabled = false; }
      });
      view.addEventListener('pagehide', () => { if (url) view.URL.revokeObjectURL(url); });
    },
    'month-year'(root) {
      const month = root.querySelector('[data-expiry-month]');
      const year = root.querySelector('[data-expiry-year]');
      const update = () => {
        const empty = !month.value && !year.value;
        const valid = /^\d{2}$/.test(month.value) && Number(month.value) >= 1 && Number(month.value) <= 12 && /^\d{2}$/.test(year.value);
        const error = !empty && !valid;
        [month,year].forEach(input => input.setAttribute('aria-invalid', String(error)));
        text(root, '[data-month-year-error]', error ? `${message('field.date').title} 월은 01~12, 연도는 두 자리로 입력해 주세요.` : '');
        text(root, '[data-month-year-status]', valid ? `입력값: ${month.value}/${year.value}` : '');
        emit(root, {component:'date-input',precision:'month-year-two-digit',value:valid ? {month:month.value,year:year.value} : null});
      };
      [month,year].forEach(input => input.addEventListener('input', update)); update();
    },
    'tag-add'(root) {
      const choice = root.querySelector('select');
      const group = root.querySelector('[data-ui="tag-group"]');
      const container = root.querySelector('[data-tag-container]');
      root.querySelector('[data-tag-add]').addEventListener('click', () => {
        if (!list(container,'[data-tag-item]').some(item => item.dataset.value === choice.value)) {
          const item = root.ownerDocument.createElement('span'); item.dataset.tagItem = ''; item.dataset.value = choice.value;
          const label = choice.selectedOptions[0].textContent;
          item.append(label + ' ');
          const remove = root.ownerDocument.createElement('button'); remove.type = 'button'; remove.dataset.tagRemove = ''; remove.textContent = '삭제'; remove.setAttribute('aria-label', label + ' 조건 삭제');
          item.append(remove); container.append(item);
        }
        text(group, '[data-tag-status]', `${list(container,'[data-tag-item]').length}개 태그 남음`);
        container.focus();
        emit(root, {component:'tag-group',selected:list(container,'[data-tag-item]').map(item => item.dataset.value)});
      });
    },
    'scroll-header'(root) {
      const header = root.querySelector('[data-scroll-header]');
      const view = root.ownerDocument.defaultView;
      let previous = view.scrollY;
      view.addEventListener('scroll', () => {
        const current = view.scrollY;
        const down = current > previous && current > header.offsetHeight;
        header.classList.toggle('ui-scroll-away', down && !header.contains(root.ownerDocument.activeElement));
        previous = current;
      }, {passive:true});
      header.addEventListener('focusin', () => header.classList.remove('ui-scroll-away'));
    },
    'file-transfer'(root) {
      function update(detail) {
        const value = transferState(detail);
        text(root, '[data-transfer-name]', value.name);
        const progress = root.querySelector('progress');
        progress.value = value.progress; progress.hidden = value.state !== 'uploading';
        text(root, '[data-transfer-state]', {ready:'전송 준비',uploading:`${value.progress}% 전송 중`,complete:'전송 완료',error:message('error.upload').title,cancelled:'전송 취소'}[value.state]);
        text(root, '[data-transfer-error]', value.error);
        text(root, '[data-transfer-reason]', value.reason);
        text(root, '[data-transfer-retry]', message('error.upload').action);
        root.querySelector('[data-transfer-retry]').hidden = !['error','cancelled'].includes(value.state);
        root.querySelector('[data-transfer-cancel]').hidden = value.state !== 'uploading';
      }
      root.addEventListener('altool:transfer', event => update(event.detail));
      for (const action of ['retry','cancel']) root.querySelector(`[data-transfer-${action}]`).addEventListener('click', () => {
        text(root, '[data-transfer-state]', `${action === 'retry' ? '재시도' : '취소'}를 요청했습니다. 앱의 응답을 기다립니다.`);
        emit(root, {component:'file-transfer', request:action});
      });
      list(root, '[data-transfer-demo]').forEach(control => control.addEventListener('click', () => update({name:'예제 안내.pdf',state:control.dataset.transferDemo,progress:40})));
      update({state:'ready'});
    },
    'modal'(root) {
      const dialog = root.querySelector('dialog');
      const open = root.querySelector('[data-modal-open]');
      const approval = root.hasAttribute('data-require-choice');
      open.addEventListener('click', () => { dialog.returnValue = ''; dialog.showModal(); });
      list(dialog, '[data-modal-close]').forEach(control => control.addEventListener('click', () => dialog.close(control.dataset.modalClose)));
      dialog.addEventListener('cancel', event => { if (approval) event.preventDefault(); });
      dialog.addEventListener('close', () => {
        const value = dialog.returnValue || 'cancel';
        text(root, '[data-modal-status]', value === 'confirm' ? '확인을 선택했습니다. 실제 업무 처리는 실행하지 않았습니다.' : value === 'decline' ? '진행하지 않기를 선택했습니다.' : '안내를 닫았습니다.');
        emit(root, {component:'modal', value}); open.focus();
      });
    },
    'context-help'(root) {
      const trigger = root.querySelector('[data-help-open]');
      const panel = root.querySelector('[data-help-panel]');
      function show(open) {
        panel.hidden = !open; trigger.setAttribute('aria-expanded', String(open));
        if (open) panel.focus(); else trigger.focus();
        emit(root, {component:'contextual-help', open});
      }
      trigger.addEventListener('click', () => show(panel.hidden));
      root.querySelector('[data-help-close]').addEventListener('click', () => show(false));
      root.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); show(false); } });
    },
    'image-fallback'(root) {
      const image = root.querySelector('img');
      const fallback = root.querySelector('[data-image-fallback]');
      function show(error) { image.hidden = error; fallback.hidden = !error; }
      image.addEventListener('error', () => show(true));
      image.addEventListener('load', () => show(false));
      if (image.complete) show(image.naturalWidth === 0);
    },
    'numbered-pagination'(root) {
      const items = list(root, '[data-page-item]');
      const size = Math.max(1, Number(root.dataset.pageSize) || 5);
      const total = Math.max(1, Math.ceil(items.length / size));
      const nav = root.querySelector('[data-page-links]');
      const input = root.querySelector('[data-page-input]');
      const compact = root.ownerDocument.defaultView.matchMedia?.('(max-width: 600px)');
      let page = 1;
      function show(next, focus = false) {
        page = clamp(Number(next) || 1, 1, total);
        items.forEach((item, index) => { item.hidden = Math.floor(index / size) + 1 !== page; });
        nav.replaceChildren();
        for (const value of pageWindow(page, total, compact?.matches)) {
          const entry = root.ownerDocument.createElement('li'); nav.append(entry);
          if (value === 'gap') { entry.textContent = '…'; entry.setAttribute('aria-hidden', 'true'); continue; }
          const control = button(root, String(value), () => { if (value !== page) show(value, true); });
          control.setAttribute('aria-label', `${value === total ? '마지막 페이지, ' : ''}${value}페이지`);
          if (value === page) { control.setAttribute('aria-current', 'page'); control.setAttribute('aria-disabled', 'true'); }
          entry.append(control);
        }
        root.querySelector('[data-page-prev]').disabled = page === 1;
        root.querySelector('[data-page-next]').disabled = page === total;
        if (input) { input.max = String(total); input.value = String(page); }
        text(root, '[data-page-total]', `/ ${total}페이지`);
        text(root, '[data-page-status]', `전체 ${total}페이지 중 ${page}페이지 · ${items.length}개 항목`);
        if (focus) nav.querySelector('[aria-current]').focus();
        emit(root, {component: 'pagination', page, total});
      }
      root.querySelector('[data-page-prev]').addEventListener('click', () => show(page - 1, true));
      root.querySelector('[data-page-next]').addEventListener('click', () => show(page + 1, true));
      const jump = root.querySelector('[data-page-jump]');
      if (jump) jump.addEventListener('submit', event => {
        event.preventDefault();
        if (input.checkValidity()) show(input.value, true); else input.reportValidity();
      });
      compact?.addEventListener('change', () => show(page, nav.contains(root.ownerDocument.activeElement)));
      show(1);
    },
    'load-more'(root) {
      const items = list(root, '[data-page-item]');
      const size = Math.max(1, Number(root.dataset.pageSize) || 5);
      const control = root.querySelector('[data-more]');
      let count = Math.min(size, items.length);
      const render = () => {
        items.forEach((item, index) => { item.hidden = index >= count; });
        control.disabled = count >= items.length;
        control.textContent = `자료 더보기 (${count}/${items.length})`;
        text(root, '[data-page-status]', `${items.length}개 중 ${count}개 표시`);
      };
      control.addEventListener('click', () => {
        const first = count; count = Math.min(items.length, count + size); render();
        if (items[first]) { items[first].tabIndex = -1; items[first].focus(); }
        emit(root, {component: 'load-more', visible: count, total: items.length});
      });
      render();
    },
    'checkbox-group'(root) {
      const all = root.querySelector('[data-select-all]');
      const children = list(root, '[data-select-item]');
      const sync = () => {
        const state = selectionState(children);
        all.checked = state.checked; all.indeterminate = state.indeterminate; all.disabled = !state.total;
        text(root, '[data-selection-status]', `${state.total}개 중 ${state.count}개 선택`);
        emit(root, {component: 'checkbox-group', values: children.filter(i => i.checked).map(i => i.value)});
      };
      all.addEventListener('change', () => { children.filter(i => !i.disabled).forEach(i => { i.checked = all.checked; }); sync(); });
      children.forEach(item => item.addEventListener('change', sync)); sync();
    },
    tabs(root) {
      const tabs = list(root, '[role="tab"]');
      const tablist = root.querySelector('[role="tablist"]');
      function choose(index, focus) {
        tabs.forEach((tab, n) => {
          tab.setAttribute('aria-selected', String(n === index)); tab.tabIndex = n === index ? 0 : -1;
          const panel = root.querySelector(`[id="${tab.getAttribute('aria-controls')}"]`);
          if (panel) panel.hidden = n !== index;
        });
        if (focus) tabs[index].focus();
        emit(root, {component: 'tabs', tab: tabs[index].id});
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => choose(index, false));
        tab.addEventListener('keydown', event => {
          const vertical = tablist.getAttribute('aria-orientation') === 'vertical';
          const keyNext = vertical ? 'ArrowDown' : 'ArrowRight', keyPrev = vertical ? 'ArrowUp' : 'ArrowLeft';
          let next = index;
          if (event.key === keyNext) next = (index + 1) % tabs.length;
          else if (event.key === keyPrev) next = (index + tabs.length - 1) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          else return;
          event.preventDefault(); choose(next, true);
        });
      });
      choose(Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')), false);
    },
    progress(root) {
      const progress = root.querySelector('[role="progressbar"]');
      const update = value => {
        value = clamp(Number(value) || 0, 0, 100);
        progress.setAttribute('aria-valuenow', String(value));
        const ring = progress.querySelector('[data-progress-ring]');
        if (ring) ring.setAttribute('stroke-dasharray', `${value} ${100-value}`);
        text(root, '[data-progress-text]', `${value}%`);
        text(root, '[data-progress-status]', value === 100 ? '작업 완료' : `${value}% 진행 중`);
        emit(root, {component: 'progress', value});
      };
      root.addEventListener('altool:progress', event => update(event.detail.value));
      const range = root.querySelector('[data-progress-demo]');
      if (range) range.addEventListener('input', () => update(range.value));
      update(progress.getAttribute('aria-valuenow'));
    },
    'date-parts'(root) {
      const fields = ['year', 'month', 'day'].map(name => root.querySelector(`[data-date-part="${name}"]`));
      const check = () => {
        const iso = dateParts(...fields.map(field => field.value));
        fields.forEach(field => field.setAttribute('aria-invalid', String(!iso)));
        text(root, '[data-date-error]', iso ? '' : `${message('field.date').title} ${message('field.date').body}`);
        text(root, '[data-date-output]', iso ? `선택한 날짜: ${iso}` : '');
        emit(root, {component: 'date-parts', value: iso}); return !!iso;
      };
      root.addEventListener('submit', event => { event.preventDefault(); if (!check()) fields[0].focus(); });
      fields.forEach(field => field.addEventListener('input', () => {
        if (fields.every(i => i.value)) check();
        else {
          text(root, '[data-date-output]', '');
          text(root, '[data-date-error]', '');
          fields.forEach(item => item.removeAttribute('aria-invalid'));
          emit(root, {component:'date-parts', value:null});
        }
      }));
    },
    'date-native'(root) {
      const input = root.querySelector('input');
      const update = () => {
        const valid = input.checkValidity();
        input.setAttribute('aria-invalid', String(!valid));
        text(root, '[data-date-error]', valid ? '' : `${message('field.date').title} ${message('field.date').body}`);
        text(root, '[data-date-output]', valid && input.value ? `선택한 날짜: ${input.value}` : '');
        emit(root, {component: 'date-input', value: valid ? input.value : null});
      };
      input.addEventListener('change', update);
      root.addEventListener('submit', event => { event.preventDefault(); update(); });
    },
    'tag-group'(root) {
      root.addEventListener('click', event => {
        const toggle = event.target.closest('[data-tag-toggle]');
        const remove = event.target.closest('[data-tag-remove]');
        if (toggle && root.contains(toggle)) toggle.setAttribute('aria-pressed', String(toggle.getAttribute('aria-pressed') !== 'true'));
        if (remove && root.contains(remove)) {
          const controls = list(root, '[data-tag-remove]'); const index = controls.indexOf(remove);
          remove.closest('[data-tag-item]').remove();
          const previous = list(root, '[data-tag-remove]')[Math.max(0, index - 1)];
          if (previous) previous.focus(); else { const container = root.querySelector('[data-tag-container]') || root; container.tabIndex = -1; container.focus(); }
        }
        if (!toggle && !remove) return;
        const selected = toggle ? list(root, '[data-tag-toggle][aria-pressed="true"]').map(n => n.dataset.value) : list(root, '[data-tag-item][data-value]').map(n => n.dataset.value);
        text(root, '[data-tag-status]', toggle ? `${selected.length}개 필터 선택` : `${list(root, '[data-tag-remove]').length}개 태그 남음`);
        emit(root, {component: 'tag-group', selected});
      });
    },
    textarea(root) {
      const input = root.querySelector('textarea');
      const update = () => {
        const count = Array.from(input.value).length;
        const max = Number(input.dataset.maxCharacters);
        const error = count > max ? `내용은 ${max}자 이내로 입력해 주세요.` : '';
        text(root, '[data-count]', `${count} / ${max}`);
        text(root, '[data-textarea-error]', error);
        input.setCustomValidity(error); input.setAttribute('aria-invalid', String(!!error));
        emit(root, {component: 'textarea', value: input.value, valid: !error});
      };
      input.addEventListener('input', update); update();
    },
    'sortable-table'(root) {
      const body = root.querySelector('tbody');
      const viewport = root.querySelector('.ui-table-scroll');
      const scrollControls = root.querySelector('[data-table-scroll-controls]');
      if (scrollControls) {
        const update = () => {
          scrollControls.hidden = viewport.scrollWidth <= viewport.clientWidth + 1;
          root.querySelector('[data-table-scroll="previous"]').disabled = viewport.scrollLeft <= 1;
          root.querySelector('[data-table-scroll="next"]').disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1;
        };
        list(root, '[data-table-scroll]').forEach(control => control.addEventListener('click', () => viewport.scrollBy({left:viewport.clientWidth * (control.dataset.tableScroll === 'previous' ? -1 : 1),behavior:'auto'})));
        viewport.addEventListener('scroll', update, {passive:true});
        root.ownerDocument.defaultView.addEventListener('resize', update); update();
      }
      list(root, '[data-sort-column]').forEach(control => {
        control.addEventListener('click', () => {
          const heading = control.closest('th');
          const ascending = heading.getAttribute('aria-sort') !== 'ascending';
          list(root, 'th[aria-sort]').forEach(th => th.removeAttribute('aria-sort'));
          heading.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
          const index = Number(control.dataset.sortColumn);
          const numeric = control.dataset.sortType === 'number';
          const rows = list(body, 'tr').sort((a,b) => {
            const av = a.cells[index].dataset.sortValue || a.cells[index].textContent;
            const bv = b.cells[index].dataset.sortValue || b.cells[index].textContent;
            return (numeric ? Number(av) - Number(bv) : av.localeCompare(bv, 'ko')) * (ascending ? 1 : -1);
          });
          body.append(...rows);
          text(root, '[data-sort-status]', `${control.textContent.trim()} ${ascending ? '오름차순' : '내림차순'}`);
          emit(root, {component: 'table', column: index, direction: ascending ? 'ascending' : 'descending'});
        });
      });
    },
    'anchor-nav'(root) {
      const links = list(root, 'a[href^="#"]');
      const inPage = root.hasAttribute('data-in-page');
      const view = root.ownerDocument.defaultView;
      const targetFor = link => root.ownerDocument.getElementById(link.hash.slice(1));
      const select = selected => links.forEach(link => { if (link === selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      function activate(link, event, keyboard) {
        const target = targetFor(link);
        if (!target) return;
        if (inPage) {
          event.preventDefault();
          if (view.location.hash !== link.hash) view.history.pushState(null, '', link.hash);
          target.scrollIntoView({block:'start'}); select(link);
        }
        if (!inPage || keyboard) { if (!target.hasAttribute('tabindex')) target.tabIndex = -1; target.focus({preventScroll:true}); }
        else link.focus({preventScroll:true});
      }
      links.forEach(link => {
        link.addEventListener('click', event => activate(link, event, event.detail === 0));
        if (inPage) link.addEventListener('keydown', event => { if (event.key === ' ') activate(link, event, true); });
      });
      if (inPage) {
        const update = () => {
          const candidates = links.filter(link => targetFor(link));
          const active = candidates.filter(link => targetFor(link).getBoundingClientRect().top <= 120).at(-1) || candidates[0];
          select(active);
        };
        let scheduled = false;
        view.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; view.requestAnimationFrame(() => { scheduled = false; update(); }); } }, {passive:true});
        update();
      }
    },
    'file-picker'(root) {
      const input = root.querySelector('input[type="file"]');
      const output = root.querySelector('[data-files]');
      const zone = root.querySelector('[data-drop-zone]');
      let files = [];
      const options = {maxFiles: input.multiple ? Number(root.dataset.maxFiles) || Infinity : 1,
        maxBytes: Number(root.dataset.maxBytes) || Infinity, accept: input.accept};
      const render = () => {
        text(root, '[data-file-error]', ''); input.setAttribute('aria-invalid', 'false');
        output.replaceChildren();
        files.forEach((file,index) => {
          const item = root.ownerDocument.createElement('li');
          const name = root.ownerDocument.createElement('span'); name.className = 'ui-file-name'; name.textContent = file.name; name.title = file.name;
          const extension = file.name.includes('.') ? file.name.split('.').pop() : '확장자 없음';
          const size = root.ownerDocument.createElement('span'); size.className = 'ui-file-size'; size.textContent = `${extension} · ${file.size.toLocaleString('ko-KR')} 바이트`;
          const remove = button(root, '삭제', () => { files.splice(index, 1); render(); input.focus(); });
          remove.setAttribute('aria-label', `${file.name} 삭제`); item.append(name, size, remove); output.append(item);
        });
        text(root, '[data-file-status]', files.length ? `${files.length}개 파일 선택됨 · 아직 전송하지 않았습니다.` : '선택한 파일이 없습니다.');
        emit(root, {component: 'file-picker', files: files.slice()});
      };
      const select = selected => {
        if (!selected.length) return; // A cancelled picker must not erase an existing selection.
        const next = input.multiple ? files.concat(Array.from(selected)) : Array.from(selected);
        const errors = fileErrors(next, options);
        text(root, '[data-file-error]', errors.join(' '));
        input.setAttribute('aria-invalid', String(errors.length > 0));
        if (!errors.length) { files = next; render(); }
        input.value = '';
      };
      input.addEventListener('change', () => select(input.files));
      if (zone) {
        zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragging'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
        zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('dragging'); select(event.dataTransfer.files); });
      }
      const clear = root.querySelector('[data-clear-files]');
      if (clear) clear.addEventListener('click', () => { files = []; render(); input.focus(); });
      render();
    }
  };
  function mount(container) {
    const roots = list(container, '[data-ui]');
    if (container.matches && container.matches('[data-ui]')) roots.unshift(container);
    roots.forEach(root => {
      if (bound.has(root) || !handlers[root.dataset.ui]) return;
      handlers[root.dataset.ui](root); bound.add(root);
    });
  }
  const api = {mount, pageWindow, dateParts, fileErrors, selectionState, transferState};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global.document) {
    global.AltoolComponents = api;
    if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', () => mount(global.document));
    else mount(global.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
