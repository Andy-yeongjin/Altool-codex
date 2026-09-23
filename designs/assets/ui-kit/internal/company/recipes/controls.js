/* Bind recipe controls to the existing company select; never implement another skin. */
(function (global) {
  'use strict';
  let current = null;

  function start(root = document.body) {
    if (current?.root === root) return current;
    current?.destroy();
    const instances = new Map();
    let alive = true, scheduled = false, resetTimer;
    const selector = 'select[data-ui-select]';
    const selects = scope => [...(scope.matches?.(selector) ? [scope] : []), ...scope.querySelectorAll(selector)];
    const within = select => root === select || root.contains(select);
    const concealed = select => {
      if (!instances.has(select) && select.hidden) return true;
      for (let parent = select.parentElement; parent; parent = parent.parentElement) {
        if (parent.hidden || (parent.tagName === 'DIALOG' && !parent.open)) return true;
        if (parent === root) break;
      }
      return false;
    };
    const eligible = select => select.matches(selector) && !select.multiple && !(select.size > 1);
    const signature = select => JSON.stringify([
      select.value, select.selectedIndex, select.disabled, select.required,
      select.getAttribute('aria-invalid'), select.getAttribute('aria-describedby'),
      [...select.options].map(option => [option.value, option.label, option.disabled, option.hidden,
        option.parentElement?.disabled])
    ]);
    function observe() {
      observer.observe(root, {childList: true, subtree: true, attributes: true,
        attributeFilter: ['hidden', 'multiple', 'size', 'open', 'data-ui-select']});
    }
    function refresh(scope = root) {
      if (!alive) return;
      observer.disconnect();
      try {
        for (const [select, entry] of instances) {
          if (!within(select) || !eligible(select) || select.parentElement !== entry.wrapper) {
            entry.api.destroy();
            instances.delete(select);
          } else if (concealed(select)) entry.api.close();
        }
        for (const select of selects(scope)) {
          if (!within(select) || !eligible(select) || concealed(select)) continue;
          let entry = instances.get(select);
          if (!entry) {
            const api = global.CompanySelect.enhance(select);
            if (!api) continue;
            entry = {api, wrapper: select.parentElement, signature: signature(select)};
            instances.set(select, entry);
          } else {
            const next = signature(select);
            if (next !== entry.signature) {
              entry.api.refresh();
              entry.signature = next;
            }
          }
        }
      } finally { if (alive) observe(); }
    }
    function schedule() {
      if (scheduled || !alive) return;
      scheduled = true;
      queueMicrotask(() => { scheduled = false; if (alive) refresh(); });
    }
    const relevant = node => node.nodeType === 1 &&
      (node.matches('select') || node.querySelector('select'));
    const observer = new MutationObserver(records => {
      if (records.some(record => record.type === 'attributes' ? relevant(record.target) :
        [...record.addedNodes, ...record.removedNodes].some(relevant))) schedule();
    });
    const reset = () => {
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { if (alive) refresh(); }, 0);
    };
    root.addEventListener('input', schedule, true);
    root.addEventListener('change', schedule, true);
    root.addEventListener('reset', reset, true);
    const controller = {root, refresh, destroy() {
      if (!alive) return;
      alive = false;
      observer.disconnect();
      clearTimeout(resetTimer);
      root.removeEventListener('input', schedule, true);
      root.removeEventListener('change', schedule, true);
      root.removeEventListener('reset', reset, true);
      for (const {api} of instances.values()) api.destroy();
      instances.clear();
      if (current === controller) current = null;
    }};
    current = controller;
    refresh();
    return controller;
  }
  global.CompanyRecipeControls = {start, refresh(root) { current?.refresh(root); }, destroy() { current?.destroy(); }};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => start(), {once: true});
  else start();
})(window);
