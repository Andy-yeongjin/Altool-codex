// Company recipe controller integration with the real select enhancer.
// The lightweight DOM and manually delivered mutations do not emulate layout/browser behavior.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const company = path.resolve(__dirname, '../designs/assets/ui-kit/internal/company');
const {Node, document} = require(path.join(company, 'tests/dom-harness.cjs'));
Object.defineProperty(Node.prototype, 'nodeType', {get() {return this === document ? 9 : 1;}});
Object.defineProperty(Node.prototype, 'selectedIndex', {
  get() {return this.options?.findIndex(option => option.selected) ?? -1;},
  set(index) {this.options.forEach((option, position) => {option.selected = position === index;});},
});
const observers = [];
global.MutationObserver = class {
  constructor(callback) {this.callback = callback; observers.push(this);}
  observe(target, options) {this.target = target; this.options = options; this.active = true;}
  disconnect() {this.active = false;}
};
document.readyState = 'loading';
require(path.join(company, 'dist/select.js'));
require(path.join(company, 'recipes/controls.js'));
const controls = global.CompanyRecipeControls;
const tick = () => new Promise(resolve => setTimeout(resolve, 5));

function fixture() {
  controls.destroy();
  document.replaceChildren();
  const root = new Node('main'); document.append(root); document.body = root;
  return root;
}
function selectIn(parent, {hidden = false, multiple = false, size = 0, optedIn = true} = {}) {
  const select = new Node('select');
  select.hidden = hidden; select.multiple = multiple; select.size = size;
  select.name = 'department';
  if (optedIn) select.setAttribute('data-ui-select', '');
  for (const [value, label] of [['FIN', '재무'], ['HR', '인사']]) {
    const option = new Node('option'); option.value = value; option.textContent = label; select.append(option);
  }
  select.value = 'FIN'; parent.append(select); return select;
}
function deliver(root, records) {
  const observer = observers.findLast(candidate => candidate.active && candidate.target === root);
  assert.ok(observer, 'A live observer must watch the selected recipe root');
  observer.callback(records);
}
function changed(root, node, type = 'childList') {
  deliver(root, type === 'attributes' ? [{type, target: node, attributeName: 'hidden'}] :
    [{type, target: root, addedNodes: [node], removedNodes: []}]);
}
function renderedValue(select) {return select.parentElement.querySelector('.ui-select-value').textContent;}
function trackListeners(target) {
  const originalAdd = target.addEventListener, originalRemove = target.removeEventListener, active = new Map();
  target.addEventListener = function(type, callback, options) {
    if (!active.has(type)) active.set(type, new Set()); active.get(type).add(callback);
    return originalAdd.call(this, type, callback, options);
  };
  target.removeEventListener = function(type, callback, options) {
    active.get(type)?.delete(callback); return originalRemove.call(this, type, callback, options);
  };
  return {count(type) {return active.get(type)?.size || 0;}, restore() {target.addEventListener = originalAdd; target.removeEventListener = originalRemove;}};
}

test('additions showcase reuses the common icon class without changing SVG geometry', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../company-additions.html'), 'utf8');
  const additions = JSON.parse(fs.readFileSync(path.join(company, 'icons/additions.json'))).icons;
  const cards = [...html.matchAll(/<article\b[^>]*class="review-icon"[\s\S]*?<\/article>/g)].map(match => match[0]);
  assert.equal(cards.length, additions.length);
  for (const icon of additions) {
    const card = cards.find(markup => markup.includes(`<code>icon.${icon.id}</code>`)); assert.ok(card, icon.id);
    const svg = card.match(/<svg\b[\s\S]*?<\/svg>/)[0];
    assert.match(svg, /class="ui-icon"/); assert.match(svg, /aria-hidden="true"/);
    const unmodified = svg.replace(' class="ui-icon" aria-hidden="true"', '');
    assert.equal(unmodified.trim(), fs.readFileSync(path.join(company, `dist/assets/icons/${icon.id}.svg`), 'utf8').trim());
  }
  assert.match(html, /\.ui-icon\s*\{\s*display:inline-block;\s*width:1rem;\s*height:1rem/);
  assert.doesNotMatch(html, /\.review-glyph\s+svg\s*\{/);
});

test('start is idempotent and shares the actual company select wrapper', () => {
  const root = fixture(), select = selectIn(root), first = controls.start(root);
  assert.equal(controls.start(root), first);
  first.refresh(); controls.refresh(root);
  assert.equal(root.querySelectorAll('.ui-select').length, 1);
  assert.equal(select.hidden, true); assert.equal(renderedValue(select), '재무');
  first.destroy(); assert.equal(select.hidden, false); assert.equal(select.parentElement, root);
  assert.equal(root.querySelectorAll('.ui-select').length, 0);
});

test('dynamic insertion is enhanced without duplicate wrappers on its own mutation', async () => {
  const root = fixture(); controls.start(root); const select = selectIn(root);
  changed(root, select); await tick();
  assert.equal(renderedValue(select), '재무');
  changed(root, select.parentElement); await tick();
  assert.equal(root.querySelectorAll('.ui-select').length, 1);
  controls.destroy();
});

test('native hidden unmarked multiple and listbox selects are not silently wrapped', () => {
  const root = fixture();
  const excluded = [selectIn(root, {hidden: true}), selectIn(root, {multiple: true}),
    selectIn(root, {size: 4}), selectIn(root, {optedIn: false})];
  controls.start(root);
  assert.equal(root.querySelectorAll('.ui-select').length, 0);
  for (const select of excluded) assert.equal(select.parentElement, root);
  assert.equal(excluded[0].hidden, true); controls.destroy();
});

test('hidden panel and closed dialog wait until the surface is revealed', async () => {
  const root = fixture(), panel = new Node('section'), dialog = new Node('dialog');
  panel.hidden = true; dialog.open = false; root.append(panel, dialog);
  const a = selectIn(panel), b = selectIn(dialog); controls.start(root);
  assert.equal(root.querySelectorAll('.ui-select').length, 0);
  panel.hidden = false; dialog.open = true; changed(root, panel, 'attributes'); changed(root, dialog, 'attributes'); await tick();
  assert.equal(renderedValue(a), '재무'); assert.equal(renderedValue(b), '재무');
  a.parentElement.querySelector('button').click(); assert.equal(a.parentElement.querySelector('button').getAttribute('aria-expanded'), 'true');
  panel.hidden = true; changed(root, panel, 'attributes'); await tick();
  assert.equal(a.parentElement.querySelector('button').getAttribute('aria-expanded'), 'false'); controls.destroy();
});

test('explicit refresh and captured input reflect post-handler programmatic values', async () => {
  const root = fixture(), select = selectIn(root); controls.start(root);
  select.value = 'HR'; controls.refresh(select); assert.equal(renderedValue(select), '인사');
  root.dispatchEvent(new Event('change')); select.value = 'FIN'; await tick();
  assert.equal(renderedValue(select), '재무'); controls.destroy();
});

test('form reset refresh runs after native default reset values are applied', async () => {
  const root = fixture(), form = new Node('form'); root.append(form);
  const select = selectIn(form); select.form = form; controls.start(root);
  select.value = 'HR'; controls.refresh(); assert.equal(renderedValue(select), '인사');
  form.dispatchEvent(new Event('reset')); root.dispatchEvent(new Event('reset'));
  select.value = 'FIN'; await tick(); assert.equal(renderedValue(select), '재무'); controls.destroy();
});

test('detached container is cleaned and reinserted controls can be enhanced anew', async () => {
  const root = fixture(), section = new Node('section'); root.append(section);
  const select = selectIn(section); controls.start(root); section.remove();
  deliver(root, [{type: 'childList', target: root, addedNodes: [], removedNodes: [section]}]); await tick();
  assert.equal(section.querySelectorAll('.ui-select').length, 0); assert.equal(select.hidden, false);
  root.append(section); changed(root, section); await tick();
  assert.equal(section.querySelectorAll('.ui-select').length, 1); assert.equal(renderedValue(select), '재무'); controls.destroy();
});

test('removing the native select alone never resurrects it during wrapper cleanup', async () => {
  const root = fixture(), select = selectIn(root); controls.start(root); const wrapper = select.parentElement;
  select.remove(); deliver(root, [{type: 'childList', target: wrapper, addedNodes: [], removedNodes: [select]}]); await tick();
  assert.equal(root.contains(select), false, 'An app-removed select must stay removed');
  assert.equal(root.querySelectorAll('.ui-select').length, 0); controls.destroy();
});

test('moving a native select to another app container does not move it back on teardown', async () => {
  const root = fixture(), select = selectIn(root); controls.start(root);
  const destination = new Node('aside'); document.append(destination); const wrapper = select.parentElement;
  destination.append(select);
  deliver(root, [{type: 'childList', target: wrapper, addedNodes: [], removedNodes: [select]}]); await tick();
  assert.equal(select.parentElement, destination, 'Cleanup must preserve the app-selected parent');
  assert.equal(select.hidden, false); assert.equal(root.querySelectorAll('.ui-select').length, 0); controls.destroy();
});

test('moving the native select inside the watched root rebinds it at its new location', async () => {
  const root = fixture(), first = new Node('section'), second = new Node('section'); root.append(first, second);
  const select = selectIn(first); controls.start(root); const oldWrapper = select.parentElement;
  second.append(select);
  deliver(root, [{type: 'childList', target: oldWrapper, addedNodes: [], removedNodes: [select]},
    {type: 'childList', target: second, addedNodes: [select], removedNodes: []}]); await tick();
  assert.equal(first.querySelectorAll('.ui-select').length, 0);
  assert.equal(second.querySelectorAll('.ui-select').length, 1);
  assert.equal(renderedValue(select), '재무'); controls.destroy();
});

test('removing opt-in or changing to multiple destroys the enhancement', async () => {
  const root = fixture(), a = selectIn(root), b = selectIn(root); controls.start(root);
  a.removeAttribute('data-ui-select'); b.multiple = true;
  changed(root, a, 'attributes'); changed(root, b, 'attributes'); await tick();
  assert.equal(root.querySelectorAll('.ui-select').length, 0);
  assert.equal(a.hidden, false); assert.equal(b.hidden, false); controls.destroy();
});

test('switching root destroys prior instances and teardown stops pending schedules', async () => {
  const firstRoot = fixture(), a = selectIn(firstRoot); controls.start(firstRoot);
  const secondRoot = new Node('main'); document.append(secondRoot); const b = selectIn(secondRoot);
  const second = controls.start(secondRoot); assert.equal(a.hidden, false); assert.equal(renderedValue(b), '재무');
  secondRoot.dispatchEvent(new Event('input')); second.destroy(); await tick();
  assert.equal(b.hidden, false); assert.equal(secondRoot.querySelectorAll('.ui-select').length, 0);
  assert.equal(observers.some(observer => observer.active && observer.target === secondRoot), false);
});

test('detachment releases original form label document window and root listeners', () => {
  const root = fixture(), form = new Node('form'), label = new Node('label'); root.append(form); form.append(label);
  const select = selectIn(form); select.form = form; select.labels = [label];
  const tracked = new Map([root, form, label, select, document, global].map(target => [target, trackListeners(target)]));
  try {
    controls.start(root);
    assert.equal(tracked.get(form).count('reset'), 1);
    assert.equal(tracked.get(label).count('click'), 1);
    assert.equal(tracked.get(document).count('pointerdown'), 1);
    assert.equal(tracked.get(global).count('resize'), 1);
    assert.equal(tracked.get(global).count('scroll'), 1);
    select.remove(); select.form = null; // Real DOM drops form ownership on detachment.
    controls.refresh();
    for (const [target, type] of [[form, 'reset'], [label, 'click'], [select, 'change'], [select, 'invalid'],
      [document, 'pointerdown'], [global, 'resize'], [global, 'scroll']]) assert.equal(tracked.get(target).count(type), 0, type);
    assert.equal(observers.some(observer => observer.active && observer.target === select), false);
    controls.destroy();
    for (const type of ['input', 'change', 'reset']) assert.equal(tracked.get(root).count(type), 0, type);
    assert.equal(observers.some(observer => observer.active && observer.target === root), false);
  } finally {controls.destroy(); for (const tracker of tracked.values()) tracker.restore();}
});
