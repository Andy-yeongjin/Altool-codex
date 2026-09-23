/* Company v27 complementary controls. No network, storage, or automatic success. */
(function (global) {
  'use strict';
  const create = (tag, className = '', text = '') => {
    const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
  };
  const listen = (node, type, handler, cleanup) => {
    node.addEventListener(type, handler); cleanup.push(() => node.removeEventListener(type, handler));
  };
  const focus = node => { if (!node) return; if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1'); node.focus(); };
  const emit = (node, name, detail) => node.dispatchEvent(new CustomEvent(`company:${name}`, { bubbles: true, detail }));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
  const message = key => global.CompanyMessages.messages[key].title;
  let sequence = 0;

  function carousel(root, { interval = 5000 } = {}) {
    const slides = [...root.querySelectorAll('[data-slide]')], cleanup = [];
    const previous = root.querySelector('[data-previous]'), next = root.querySelector('[data-next]');
    const toggle = root.querySelector('[data-autoplay]'), status = root.querySelector('[data-status]');
    let index = 0, timer, playing = false;
    const stop = () => { clearInterval(timer); timer = undefined; playing = false; if (toggle) { toggle.textContent = '자동 넘김 시작'; toggle.setAttribute('aria-pressed', 'false'); } };
    function show(value) {
      if (!slides.length) return;
      index = (value + slides.length) % slides.length;
      slides.forEach((slide, number) => { slide.hidden = number !== index; slide.setAttribute('aria-hidden', String(number !== index)); });
      status.textContent = `${index + 1} / ${slides.length}`;
      emit(root, 'slide', { index });
    }
    function play() {
      stop(); if (slides.length < 2 || global.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      playing = true; toggle.textContent = '자동 넘김 정지'; toggle.setAttribute('aria-pressed', 'true');
      timer = setInterval(() => show(index + 1), Math.max(3000, interval));
    }
    listen(previous, 'click', () => { stop(); show(index - 1); }, cleanup);
    listen(next, 'click', () => { stop(); show(index + 1); }, cleanup);
    if (toggle) listen(toggle, 'click', () => playing ? stop() : play(), cleanup);
    listen(root, 'focusin', stop, cleanup); listen(root, 'pointerenter', stop, cleanup);
    slides.forEach(slide => listen(slide, 'keydown', event => {
      if (event.target !== slide || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); stop(); show(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1)); focus(slides[index]);
    }, cleanup));
    previous.disabled = next.disabled = slides.length < 2; if (toggle) toggle.disabled = slides.length < 2;
    status.setAttribute('role', 'status'); if (!slides.length) status.textContent = message('empty.list'); show(0); stop();
    return { show, play, stop, get index() { return index; }, destroy() { stop(); cleanup.forEach(fn => fn()); } };
  }

  function anchorLinks(root) {
    const cleanup = [];
    root.querySelectorAll('a[href]').forEach(link => listen(link, 'click', event => {
      const href = link.getAttribute('href'); if (!href?.startsWith('#') || href === '#') return;
      const target = document.getElementById(decodeURIComponent(href.slice(1))); if (!target) return;
      event.preventDefault(); focus(target); target.scrollIntoView({ block: 'start' });
      global.history?.replaceState(null, '', href);
      root.querySelectorAll('[aria-current]').forEach(node => node.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'location');
    }, cleanup));
    return { destroy() { cleanup.forEach(fn => fn()); } };
  }

  function imageFallback(root) {
    const image = root.querySelector('img'), fallback = root.querySelector('[data-image-fallback]'), cleanup = [];
    const render = failed => { image.hidden = failed; fallback.hidden = !failed; };
    listen(image, 'error', () => render(true), cleanup); listen(image, 'load', () => render(false), cleanup);
    render(image.complete && image.naturalWidth === 0);
    return { destroy() { cleanup.forEach(fn => fn()); } };
  }

  function helpPanel(root) {
    const trigger = root.querySelector('[data-help-open]'), panel = root.querySelector('[data-help-content]'), close = root.querySelector('[data-help-close]'), cleanup = [];
    panel.id ||= `company-help-${++sequence}`; trigger.setAttribute('aria-controls', panel.id);
    function set(open, restore = true) { panel.hidden = !open; trigger.setAttribute('aria-expanded', String(open)); if (open) focus(panel); else if (restore) trigger.focus(); }
    listen(trigger, 'click', () => set(panel.hidden), cleanup); listen(close, 'click', () => set(false), cleanup);
    listen(panel, 'keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); set(false); } }, cleanup);
    set(false, false); return { open() { set(true); }, close() { set(false); }, destroy() { cleanup.forEach(fn => fn()); } };
  }

  // Steps advance only from the real target action plus its validity predicate.
  // Collapsing leaves the current step/completion set intact; stop resets it.
  function tutorial(root, { steps, onComplete } = {}) {
    if (!steps?.length) throw new Error('tutorial requires target/action steps');
    const cleanup = [], completed = new Set(); let index = 0, started = false, opener;
    const panel = root.querySelector('[data-tour-panel]'), title = root.querySelector('[data-tour-title]');
    const count = root.querySelector('[data-tour-count]'), previous = root.querySelector('[data-tour-previous]'), next = root.querySelector('[data-tour-next]');
    const start = root.querySelector('[data-tour-start]'), collapse = root.querySelector('[data-tour-collapse]'), stop = root.querySelector('[data-tour-stop]');
    function clearHighlight() { steps.forEach(step => step.target.classList.remove('ui-coach-target')); }
    function render() {
      clearHighlight(); title.textContent = steps[index].title; count.textContent = `${index + 1} / ${steps.length}`;
      previous.disabled = index === 0; next.disabled = !completed.has(index); next.textContent = index === steps.length - 1 ? '안내 완료' : '다음';
      if (started && !panel.hidden) steps[index].target.classList.add('ui-coach-target');
      start.textContent = started ? '안내 이어보기' : '안내 시작';
    }
    function open() { opener = document.activeElement; started = true; panel.hidden = false; render(); focus(steps[index].target); }
    function close() { panel.hidden = true; clearHighlight(); opener?.focus(); }
    function reset() { started = false; index = 0; completed.clear(); close(); render(); }
    steps.forEach((step, stepIndex) => listen(step.target, step.event || 'click', () => {
      if (!started || panel.hidden || index !== stepIndex || step.valid && !step.valid()) return;
      completed.add(index); render(); emit(root, 'tutorial-action', { index });
    }, cleanup));
    listen(start, 'click', open, cleanup); listen(collapse, 'click', close, cleanup); listen(stop, 'click', reset, cleanup);
    listen(previous, 'click', () => { if (index > 0) { index--; render(); focus(steps[index].target); } }, cleanup);
    listen(next, 'click', () => {
      if (!completed.has(index)) return;
      if (index === steps.length - 1) { onComplete?.(); emit(root, 'tutorial-complete', {}); reset(); }
      else { index++; render(); focus(steps[index].target); }
    }, cleanup);
    listen(panel, 'keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }, cleanup);
    panel.hidden = true; render();
    return { open, close, stop: reset, get state() { return { index, started, completed: [...completed], collapsed: panel.hidden }; }, destroy() { clearHighlight(); cleanup.forEach(fn => fn()); } };
  }

  function pageWindow(total, current, mobile = false) {
    total = Math.max(1, Math.floor(Number(total) || 1)); current = Math.floor(clamp(current, 1, total));
    const maximum = mobile ? 7 : 9; if (total <= maximum) return Array.from({ length: total }, (_, n) => n + 1);
    const radius = mobile ? 1 : 2, middle = [];
    const start = Math.max(2, Math.min(current - radius, total - (maximum - 4)));
    const end = Math.min(total - 1, start + maximum - 5);
    for (let page = start; page <= end; page++) middle.push(page);
    return [1, ...(start > 2 ? ['…'] : []), ...middle, ...(end < total - 1 ? ['…'] : []), total];
  }
  function pagination(root, { total = 1, current = 1, onChange } = {}) {
    const pages = root.querySelector('[data-pages]'), form = root.querySelector('form'), input = root.querySelector('input'), status = root.querySelector('[data-status]'), cleanup = [];
    function set(value) {
      current = Math.floor(clamp(value, 1, total)); pages.replaceChildren();
      for (const page of pageWindow(total, current, global.innerWidth < 600)) {
        if (page === '…') { pages.append(create('span', '', page)); continue; }
        const button = create('button', page === current ? 'primary' : 'quiet', String(page)); button.type = 'button';
        button.setAttribute('aria-label', `${page}페이지`); if (page === current) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => { set(page); onChange?.(page); pages.querySelector('[aria-current]').focus(); }); pages.append(button);
      }
      input.min = '1'; input.max = String(total); input.value = String(current); status.textContent = `${current} / ${total}페이지`;
    }
    listen(form, 'submit', event => {
      event.preventDefault(); const value = Number(input.value); const valid = /^\d+$/.test(input.value) && value >= 1 && value <= total;
      input.setCustomValidity(valid ? '' : message('field.pattern')); input.setAttribute('aria-invalid', String(!valid));
      if (!valid) { input.reportValidity?.(); return; } set(value); onChange?.(value);
    }, cleanup);
    set(current); return { set, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function loadMore(root, { load, renderItem } = {}) {
    const list = root.querySelector('[data-items]'), button = root.querySelector('[data-load-more]'), status = root.querySelector('[data-status]'), cleanup = [];
    let busy = false, exhausted = false, controller, generation = 0;
    async function next() {
      if (busy || exhausted) return; busy = true; button.disabled = true; root.setAttribute('aria-busy', 'true'); status.textContent = message('state.loading');
      const token = ++generation; controller = new AbortController();
      try {
        const result = await load({ signal: controller.signal }); if (token !== generation) return;
        const nodes = result.items.map(renderItem); list.append(...nodes); exhausted = !result.hasMore;
        status.textContent = `${list.children.length}개 표시`; focus(nodes[0]);
        button.hidden = exhausted; emit(root, 'loaded', { count: nodes.length, hasMore: !exhausted });
      } catch (error) { if (token === generation && error.name !== 'AbortError') status.textContent = message('error.load'); }
      finally { if (token === generation) { busy = false; button.disabled = exhausted; root.setAttribute('aria-busy', 'false'); } }
    }
    listen(button, 'click', next, cleanup);
    return { next, destroy() { generation++; controller?.abort(); cleanup.forEach(fn => fn()); } };
  }

  function selectionState(items) { const eligible = items.filter(item => !item.disabled), count = eligible.filter(item => item.checked).length; return { count, checked: eligible.length > 0 && count === eligible.length, indeterminate: count > 0 && count < eligible.length, disabled: !eligible.length }; }
  function selectAll(root) {
    const all = root.querySelector('[data-select-all]'), boxes = [...root.querySelectorAll('[data-select-item]')], cleanup = [];
    function refresh() { const state = selectionState(boxes); all.checked = state.checked; all.indeterminate = state.indeterminate; all.disabled = state.disabled; }
    listen(all, 'change', () => { boxes.filter(box => !box.disabled).forEach(box => { box.checked = all.checked; box.dispatchEvent(new Event('change', { bubbles: true })); }); refresh(); }, cleanup);
    boxes.forEach(box => listen(box, 'change', refresh, cleanup)); refresh(); return { refresh, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function countedInput(root, { max = 200 } = {}) {
    const input = root.querySelector('textarea, input'), output = root.querySelector('[data-count]'), cleanup = [];
    function refresh() { const length = [...input.value].length; output.textContent = `${length} / ${max}자`; input.setCustomValidity(length > max ? message('field.max') : ''); input.setAttribute('aria-invalid', String(length > max)); }
    listen(input, 'input', refresh, cleanup); refresh(); return { refresh, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function progress(root, initial = 0) {
    const bar = root.querySelector('[role="progressbar"]'), fill = root.querySelector('[data-progress-fill]'), text = root.querySelector('[data-progress-text]');
    function set(value) { const percent = clamp(value, 0, 100); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100'); bar.setAttribute('aria-valuenow', String(percent)); fill.style.width = `${percent}%`; text.textContent = `${percent}%`; }
    set(initial); return { set };
  }
  function transferState(state = 'ready', value = 0) {
    if (!['ready', 'uploading', 'complete', 'error', 'cancelled'].includes(state)) throw new Error('Unknown transfer state');
    return { state, progress: state === 'complete' ? 100 : clamp(value, 0, 100), canRetry: state === 'error' || state === 'cancelled', canCancel: state === 'uploading' };
  }
  function transfer(root, { onRetry, onCancel } = {}) {
    const meter = progress(root), status = root.querySelector('[data-status]'), retry = root.querySelector('[data-retry]'), cancel = root.querySelector('[data-cancel]'), cleanup = [];
    function set(state, percent) { const value = transferState(state, percent); meter.set(value.progress); status.textContent = { ready: '전송 준비', uploading: '전송 중', complete: '전송 완료', error: message('error.upload'), cancelled: '전송 취소됨' }[state]; retry.hidden = !value.canRetry; cancel.hidden = !value.canCancel; root.setAttribute('aria-busy', String(state === 'uploading')); }
    listen(retry, 'click', () => onRetry?.(), cleanup); listen(cancel, 'click', () => onCancel?.(), cleanup); set('ready', 0);
    return { set, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function scrollHeader(root) {
    const cleanup = []; let previous = global.scrollY || 0;
    const reveal = () => root.classList.remove('is-scroll-hidden');
    listen(global, 'scroll', () => { const current = global.scrollY || 0; root.classList.toggle('is-scroll-hidden', global.innerWidth < 600 && current > 80 && current > previous && !root.contains(document.activeElement)); previous = current; }, cleanup);
    listen(root, 'focusin', reveal, cleanup); listen(global, 'resize', reveal, cleanup);
    return { destroy() { reveal(); cleanup.forEach(fn => fn()); } };
  }
  function dateParts(year, month, day) {
    if (!/^\d{4}$/.test(String(year)) || ![month, day].every(value => /^\d{1,2}$/.test(String(value)))) return null;
    const y = Number(year), m = Number(month), d = Number(day); if (y < 1 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const date = new Date(0); date.setUTCFullYear(y, m - 1, d);
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
  }
  function fileErrors(files, { maxFiles = Infinity, maxBytes = Infinity, accept = '' } = {}) {
    const errors = [], types = accept.toLowerCase().split(',').map(value => value.trim()).filter(Boolean);
    if (files.length > maxFiles) errors.push(`${message('file.count')} 최대 ${maxFiles}개.`);
    for (const file of files) {
      if (file.size === 0) errors.push(`${file.name}: ${message('file.empty')}`);
      if (file.size > maxBytes) errors.push(`${file.name}: ${message('file.size')} 최대 ${maxBytes}바이트.`);
      if (types.length && !types.some(type => type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : type.endsWith('/*') ? file.type.toLowerCase().startsWith(type.slice(0, -1)) : file.type.toLowerCase() === type)) errors.push(`${file.name}: ${message('file.type')}`);
    }
    return errors;
  }
  function filePicker(root, { maxFiles = 5, maxBytes = 10 * 1024 * 1024, accept = '', onChange } = {}) {
    const input = root.querySelector('input[type="file"]'), multiple = !!input.multiple;
    const api = global.CompanyBusiness.attachments(root, {
      multiple, accumulate: false, drop: true,
      validate: files => fileErrors(files, { maxFiles: multiple ? maxFiles : 1, maxBytes, accept: accept || input.accept }),
      onChange: detail => { onChange?.([...detail.files]); emit(root, 'files', { files: [...detail.files] }); },
      onReset: () => onChange?.([])
    });
    return { set: next => api.set(next), get files() { return api.files; }, destroy: () => api.destroy() };
  }
  async function optimizeImage(original, { maxEdge = 1600, quality = 0.8 } = {}) {
    if (fileErrors([original], { accept: 'image/jpeg,image/png,image/webp' }).length) throw new Error('Unsupported image');
    const bitmap = await global.createImageBitmap(original);
    try {
      const ratio = Math.min(1, Math.max(1, maxEdge) / Math.max(bitmap.width, bitmap.height)), canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio)); canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', clamp(quality, 0.1, 1)));
      if (!blob) throw new Error('Image encoding failed');
      if (blob.size >= original.size) return { state: 'not-smaller', file: original, original };
      return { state: 'optimized', original, file: new File([blob], original.name.replace(/\.[^.]+$/, '') + '-optimized.jpg', { type: 'image/jpeg' }), width: canvas.width, height: canvas.height };
    } finally { bitmap.close(); }
  }
  function imageOptimize(root, options = {}) {
    const input = root.querySelector('input'), button = root.querySelector('[data-optimize]'), result = root.querySelector('[data-optimize-result]'), status = root.querySelector('[data-status]'), download = root.querySelector('a[download]'), image = root.querySelector('img'), cleanup = [];
    let generation = 0, url, file, processing = false;
    function clear() { if (url) global.URL.revokeObjectURL(url); url = undefined; result.hidden = true; download.removeAttribute('href'); image.removeAttribute('src'); }
    function refreshButton() { button.disabled = processing || !file || input.disabled; }
    function selectionChanged() { generation++; processing = false; clear(); file = input.files[0]; status.textContent = ''; refreshButton(); }
    const attachment = global.CompanyBusiness.attachments(root.querySelector('[data-image-attachment]'), {
      multiple: false, accumulate: false, drop: true,
      validate: files => fileErrors(files, { maxFiles: 1, accept: 'image/jpeg,image/png,image/webp' }),
      onChange: selectionChanged, onReset: selectionChanged
    });
    const disabledObserver = new MutationObserver(refreshButton);
    disabledObserver.observe(input, { attributes: true, attributeFilter: ['disabled'] });
    selectionChanged();
    listen(button, 'click', async () => {
      if (!file || processing || input.disabled) return; const token = ++generation; clear(); processing = true; refreshButton(); status.textContent = message('state.loading');
      try {
        const value = await optimizeImage(file, options); if (token !== generation) return;
        if (value.state === 'not-smaller') status.textContent = '변환 결과가 더 작지 않아 원본을 유지합니다.';
        else { url = global.URL.createObjectURL(value.file); image.src = url; download.href = url; download.download = value.file.name; result.hidden = false; status.textContent = '로컬 변환이 끝났습니다. 화질을 확인한 뒤 파일을 사용하세요.'; }
        emit(root, 'image-optimized', value);
      } catch (_) { if (token === generation) status.textContent = message('error.generic'); }
      finally { if (token === generation) { processing = false; refreshButton(); } }
    }, cleanup);
    listen(global, 'pagehide', selectionChanged, cleanup);
    return { destroy() { generation++; clear(); disabledObserver.disconnect(); attachment.destroy(); cleanup.forEach(fn => fn()); button.disabled = true; } };
  }
  function stepFlow(steps) {
    let index = 0, history = [], finished = false;
    const completed = new Set(), skipped = new Set();
    function next(values, skip = false) {
      const step = steps[index]; if (finished || skip && !step.optional || !skip && step.valid && !step.valid(values)) return false;
      let target = typeof step.next === 'function' ? step.next(values) : index + 1;
      if (skip) { skipped.add(index); completed.delete(index); } else { completed.add(index); skipped.delete(index); }
      if (target === null || target >= steps.length) { finished = true; return true; }
      if (!Number.isInteger(target) || target < 0 || target <= index) throw new Error('A forward step target is required');
      history.push(index); index = target; return true;
    }
    return { next, back() { if (!history.length) return false; finished = false; index = history.pop(); return true; }, reset() { index = 0; history = []; finished = false; completed.clear(); skipped.clear(); }, get state() { return { index, finished, history: [...history], completed: [...completed], skipped: [...skipped] }; } };
  }
  function stepIndicator(root, { steps, values = () => ({}), onComplete } = {}) {
    const flow = stepFlow(steps), panels = [...root.querySelectorAll('[data-step-panel]')], titles = [...root.querySelectorAll('[data-step-title]')], cleanup = [];
    const previous = root.querySelector('[data-step-previous]'), next = root.querySelector('[data-step-next]'), skip = root.querySelector('[data-step-skip]'), reset = root.querySelector('[data-step-reset]'), status = root.querySelector('[data-status]');
    const labels = titles.map(title => title.textContent);
    function render() { const state = flow.state; panels.forEach((panel, index) => { panel.hidden = state.finished || state.index !== index; }); titles.forEach((title, index) => { if (!state.finished && state.index === index) title.setAttribute('aria-current', 'step'); else title.removeAttribute('aria-current'); const value = state.skipped.includes(index) ? 'skipped' : state.completed.includes(index) ? 'completed' : 'pending'; title.dataset.stepState = value; title.textContent = labels[index] + (value === 'skipped' ? ' (건너뜀)' : value === 'completed' ? ' (완료)' : ''); }); previous.disabled = !state.history.length; next.disabled = state.finished; skip.hidden = state.finished || !steps[state.index].optional; status.textContent = state.finished ? '입력 단계가 끝났습니다. 실제 처리는 별도로 확인하세요.' : `${state.index + 1} / ${steps.length}단계`; }
    function advance(optional) { if (!flow.next(values(), optional)) { panels[flow.state.index].querySelector('input:invalid')?.reportValidity?.(); return; } render(); if (flow.state.finished) onComplete?.(values()); else focus(panels[flow.state.index]); }
    listen(previous, 'click', () => { flow.back(); render(); focus(panels[flow.state.index]); }, cleanup); listen(next, 'click', () => advance(false), cleanup); listen(skip, 'click', () => advance(true), cleanup);
    listen(reset, 'click', () => { flow.reset(); render(); focus(panels[0]); }, cleanup); render();
    return { get state() { return flow.state; }, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function tabs(root, { vertical = false } = {}) {
    const list = root.querySelector('[role="tablist"]'), buttons = [...root.querySelectorAll('[role="tab"]')], panels = [...root.querySelectorAll('[role="tabpanel"]')], cleanup = [];
    list.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    buttons.forEach((button, index) => { button.id ||= `company-tab-${++sequence}`; panels[index].id ||= `company-panel-${++sequence}`; button.setAttribute('aria-controls', panels[index].id); panels[index].setAttribute('aria-labelledby', button.id); });
    function select(index) { if (buttons[index]?.disabled) return; buttons.forEach((button, number) => { button.setAttribute('aria-selected', String(number === index)); button.tabIndex = number === index ? 0 : -1; panels[number].hidden = number !== index; }); }
    buttons.forEach((button, index) => {
      listen(button, 'click', () => select(index), cleanup);
      listen(button, 'keydown', event => {
        const next = vertical ? 'ArrowDown' : 'ArrowRight', previous = vertical ? 'ArrowUp' : 'ArrowLeft'; if (![next, previous, 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); const enabled = buttons.filter(node => !node.disabled), current = enabled.indexOf(button), target = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1) : enabled[(current + (event.key === next ? 1 : -1) + enabled.length) % enabled.length]; select(buttons.indexOf(target)); target.focus();
      }, cleanup);
    });
    select(Math.max(0, buttons.findIndex(button => !button.disabled))); return { select, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function tagGroup(root) {
    const select = root.querySelector('select'), add = root.querySelector('[data-tag-add]'), container = root.querySelector('[data-tags]'), status = root.querySelector('[data-status]'), cleanup = [];
    function remove(item) { const next = item.nextElementSibling?.querySelector('button') || item.previousElementSibling?.querySelector('button'); item.remove(); status.textContent = `${container.children.length}개 선택`; (next || add).focus(); emit(root, 'tags', { values: [...container.children].map(node => node.dataset.value) }); }
    function append(value, label) {
      if (!value || [...container.children].some(item => item.dataset.value === value)) return false;
      const item = create('span', 'ui-filter-tag', label), button = create('button', 'quiet', '삭제'); item.dataset.value = value; button.type = 'button'; button.setAttribute('aria-label', `${label} 삭제`); button.addEventListener('click', () => remove(item)); item.append(button); container.append(item); status.textContent = `${container.children.length}개 선택`; focus(container); emit(root, 'tags', { values: [...container.children].map(node => node.dataset.value) }); return true;
    }
    listen(add, 'click', () => { const option = select.selectedOptions[0]; if (option) append(option.value, option.label); }, cleanup);
    return { add: append, destroy() { cleanup.forEach(fn => fn()); } };
  }
  function navigation(root) {
    const cleanup = [];
    listen(root, 'keydown', event => { if (event.key !== 'Escape') return; const details = event.target.closest('details'); if (details && root.contains(details) && details.open) { event.preventDefault(); event.stopPropagation(); details.open = false; details.querySelector('summary').focus(); } }, cleanup);
    return { destroy() { cleanup.forEach(fn => fn()); } };
  }
  function approval(root, { title, message: description, acceptLabel = '계속 진행', declineLabel = '진행하지 않기', onDecision } = {}) {
    const modal = global.CompanyBusiness.dialog(root, title), cleanup = [];
    modal.element.querySelector('.ui-dialog-close').remove();
    const body = create('p', '', description); body.id = `company-approval-${++sequence}`; modal.body.append(body); modal.element.setAttribute('aria-describedby', body.id);
    const decline = create('button', '', declineLabel), accept = create('button', 'primary', acceptLabel); decline.type = accept.type = 'button'; modal.actions.append(decline, accept);
    listen(modal.element, 'cancel', event => event.preventDefault(), cleanup);
    for (const [button, accepted] of [[decline, false], [accept, true]]) listen(button, 'click', () => { modal.close(); onDecision?.(accepted); emit(root, 'approval-choice', { accepted }); }, cleanup);
    return { element: modal.element, open() { modal.open(); decline.focus(); }, destroy() { if (modal.element.open) modal.close(); cleanup.forEach(fn => fn()); modal.destroy(); } };
  }
  function parseMonthYear(month, year) {
    return /^\d{2}$/.test(month) && Number(month) >= 1 && Number(month) <= 12 && /^\d{2}$/.test(year) ? { month, year } : null;
  }
  function monthYear(root) {
    const month = root.querySelector('[data-month]'), year = root.querySelector('[data-year]'), status = root.querySelector('[data-status]'), error = root.querySelector('[data-month-year-error]'), cleanup = [];
    error.id ||= `company-month-year-${++sequence}`;
    const descriptions = [month, year].map(input => input.getAttribute('aria-describedby'));
    [month, year].forEach(input => input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' ')));
    function validate() {
      const value = parseMonthYear(month.value, year.value), empty = !month.value && !year.value;
      const invalid = !value && (!empty || month.required || year.required);
      const text = invalid ? message('field.date') : '';
      [month, year].forEach(input => { input.setCustomValidity(text); input.setAttribute('aria-invalid', String(!!invalid)); });
      error.textContent = text; status.textContent = value ? `${value.month}/${value.year}` : '';
      emit(root, 'month-year', { value, precision: 'month-year-two-digit' }); return !invalid;
    }
    [month, year].forEach(input => listen(input, 'input', validate, cleanup)); validate();
    return { validate, get value() { return parseMonthYear(month.value, year.value); }, destroy() { cleanup.forEach(fn => fn()); [month, year].forEach((input, index) => { if (descriptions[index]) input.setAttribute('aria-describedby', descriptions[index]); else input.removeAttribute('aria-describedby'); }); } };
  }
  global.CompanyExtensions = { carousel, anchorLinks, imageFallback, helpPanel, tutorial, pageWindow, pagination, loadMore, selectionState, selectAll, countedInput, progress, transferState, transfer, scrollHeader, dateParts, fileErrors, filePicker, optimizeImage, imageOptimize, stepFlow, stepIndicator, tabs, tagGroup, navigation, approval, parseMonthYear, monthYear };
})(typeof window === 'undefined' ? globalThis : window);
