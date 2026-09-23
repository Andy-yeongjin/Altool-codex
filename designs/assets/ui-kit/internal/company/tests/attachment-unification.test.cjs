const test = require('node:test');
const assert = require('node:assert/strict');
const {Node, document} = require('./dom-harness.cjs');
global.CompanyMessages = require('../../../../messages/ko.json');
require('../js/business.js');
require('../extensions/runtime.js');
global.DataTransfer = class { constructor() { this.files = []; this.items = {add: file => this.files.push(file)}; } };
const observers = [];
global.MutationObserver = class {
  constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
  observe(node) { this.node = node; }
  disconnect() { this.disconnected = true; }
};
const f = new File(['1234'], '첫째.pdf', {type: 'application/pdf', lastModified: 1});
const g = new File(['abcdef'], '둘째.pdf', {type: 'application/pdf', lastModified: 2});

function imageFixture(t, delayed = false) {
  const selected = fixture(), outer = new Node('section');
  selected.form.append(outer); outer.append(selected.root);
  selected.root.setAttribute('data-image-attachment', ''); selected.input.accept = 'image/jpeg,image/png,image/webp';
  const button = new Node('button'), result = new Node('div'), status = new Node('p'), image = new Node('img'), download = new Node('a');
  button.setAttribute('data-optimize', ''); result.setAttribute('data-optimize-result', ''); status.setAttribute('data-status', ''); download.setAttribute('download', '');
  result.append(image, download); outer.append(button, status, result);
  const originalCreate = document.createElement, originalBitmap = global.createImageBitmap, originalUrl = URL.createObjectURL, originalRevoke = URL.revokeObjectURL;
  let resolveBitmap, closed = 0, created = 0; const revoked = [];
  const bitmap = {width: 20, height: 10, close() { closed++; }};
  global.createImageBitmap = () => delayed ? new Promise(resolve => { resolveBitmap = resolve; }) : Promise.resolve(bitmap);
  document.createElement = tag => tag === 'canvas' ? {getContext: () => ({fillRect() {}, drawImage() {}}), toBlob(callback) { callback(new Blob(['a'])); }} : originalCreate(tag);
  URL.createObjectURL = () => 'blob:optimized-' + (++created); URL.revokeObjectURL = url => revoked.push(url);
  const api = CompanyExtensions.imageOptimize(outer);
  t.after(() => { api.destroy(); outer.remove(); selected.form.remove(); document.createElement = originalCreate; global.createImageBitmap = originalBitmap; URL.createObjectURL = originalUrl; URL.revokeObjectURL = originalRevoke; });
  return {...selected, outer, button, result, status, image, download, api, revoked, finish: () => resolveBitmap(bitmap), get closed() {return closed;}, get created() {return created;}};
}
const png = new File(['original image data'], '테스트.png', {type: 'image/png'});
const settle = () => new Promise(resolve => setImmediate(resolve));

test('image selection uses canonical attachment UI and keeps originals through conversion and removal', async t => {
  const view = imageFixture(t);
  assert.equal(view.input.hidden, true);
  assert.ok(view.root.querySelector('.ui-attachment-toolbar'));
  choose(view.input, [f]); assert.equal(view.button.disabled, true); assert.equal(view.input.files.length, 0); assert.ok(view.error.textContent);
  choose(view.input, [png]); assert.equal(view.button.disabled, false); assert.equal(view.error.hidden, true);
  assert.equal(view.root.querySelector('.ui-attachment-name').textContent, png.name);
  view.button.click(); await settle();
  assert.equal(view.result.hidden, false); assert.deepEqual(view.input.files, [png]); assert.equal(view.download.download, '테스트-optimized.jpg');
  view.root.querySelector('.ui-attachment-remove').click();
  assert.deepEqual(view.input.files, []); assert.equal(view.result.hidden, true); assert.equal(view.button.disabled, true); assert.equal(view.status.textContent, '');
  assert.deepEqual(view.revoked, ['blob:optimized-1']); assert.equal(view.image.getAttribute('src'), null); assert.equal(view.download.getAttribute('href'), null);
});

test('image reset during conversion ignores stale output and clears canonical selection', async t => {
  const view = imageFixture(t, true); choose(view.input, [png]); view.button.click();
  view.form.dispatchEvent(new Event('reset')); view.finish(); await settle();
  assert.equal(view.result.hidden, true); assert.equal(view.button.disabled, true); assert.equal(view.created, 0); assert.equal(view.closed, 1);
  assert.deepEqual(view.input.files, []); assert.equal(view.status.textContent, '');
});

test('image disabled and destroy block work while cleaning pending conversion', async t => {
  const view = imageFixture(t, true); choose(view.input, [png]);
  view.input.disabled = true; refreshDisabled(view.input); assert.equal(view.button.disabled, true);
  view.button.dispatchEvent(new Event('click')); assert.equal(view.status.textContent, '');
  view.input.disabled = false; refreshDisabled(view.input); view.button.click(); view.api.destroy(); view.finish(); await settle();
  assert.equal(view.created, 0); assert.equal(view.closed, 1); assert.equal(view.input.hidden, false);
  assert.equal(view.root.querySelector('.ui-attachment-toolbar'), null); assert.equal(view.button.disabled, true);
});

test('image invalid replacement preserves the accepted file and successful reset revokes result', async t => {
  const view = imageFixture(t); choose(view.input, [png]); view.button.click(); await settle();
  choose(view.input, [f]); assert.deepEqual(view.input.files, [png]); assert.equal(view.result.hidden, false); assert.ok(view.error.textContent);
  choose(view.input, [png, png]); assert.deepEqual(view.input.files, [png]);
  view.form.dispatchEvent(new Event('reset'));
  assert.equal(view.result.hidden, true); assert.deepEqual(view.revoked, ['blob:optimized-1']); assert.equal(view.error.hidden, true); assert.equal(view.button.disabled, true);
});
function fixture(multiple = false) {
  const form = new Node('form'), root = new Node('section'), input = new Node('input'), error = new Node('p');
  input.setAttribute('type', 'file'); input.type = 'file'; input.multiple = multiple; input.accept = '.pdf'; input.files = []; input.form = form;
  error.setAttribute('data-file-error', ''); root.append(input, error); form.append(root); document.append(form);
  return {form, root, input, error};
}
function choose(input, files) { input.files = files; input.dispatchEvent(new Event('change', {bubbles: true})); }
function drop(root, files) { const event = new Event('drop', {cancelable: true}); event.dataTransfer = {files}; root.dispatchEvent(event); return event; }
function refreshDisabled(input) { observers.filter(observer => observer.node === input && !observer.disconnected).forEach(observer => observer.callback()); }

test('canonical defaults preserve accumulating multiple selection and detail events', () => {
  const {root, input} = fixture(), changes = [], events = [];
  root.addEventListener('company:attachments', event => events.push(event.detail));
  const api = CompanyBusiness.attachments(root, {onChange: detail => changes.push(detail)});
  assert.equal(input.multiple, true); choose(input, [f]); choose(input, [f, g]);
  assert.deepEqual(api.files, [f, g]); assert.deepEqual(input.files, [f, g]);
  assert.deepEqual(changes.map(detail => [detail.count, detail.totalBytes]), [[1, 4], [2, 10]]);
  assert.deepEqual(events, changes); assert.equal(root.querySelectorAll('.ui-attachment-toolbar').length, 1);
  api.destroy(); assert.equal(input.multiple, false); assert.equal(input.hidden, false);
});

test('single selection replaces the prior file and rejecting multiple restores native FileList', () => {
  const {root, input} = fixture(), api = CompanyBusiness.attachments(root, {multiple: false});
  choose(input, [f]); choose(input, [g]); assert.deepEqual(api.files, [g]);
  choose(input, [f, g]); assert.deepEqual(api.files, [g]); assert.deepEqual(input.files, [g]); assert.equal(input.getAttribute('aria-invalid'), 'true');
  choose(input, [f]); assert.deepEqual(api.files, [f]); assert.equal(input.validationMessage, ''); api.destroy();
});

test('empty file-picker cancellation preserves selected files without publishing a change', () => {
  const {root, input} = fixture(), changes = [], api = CompanyBusiness.attachments(root, {multiple: false, onChange: value => changes.push(value)});
  choose(input, [f]); choose(input, []); assert.deepEqual(api.files, [f]); assert.deepEqual(input.files, [f]); assert.equal(changes.length, 1); api.destroy();
});

test('extension delegates to canonical toolbar/list and preserves array callback/set/get/events', () => {
  const {root, input} = fixture(), arrays = [], events = [];
  root.addEventListener('company:files', event => events.push(event.detail));
  const api = CompanyExtensions.filePicker(root, {onChange: files => arrays.push(files)});
  assert.equal(root.querySelectorAll('.ui-attachment-toolbar').length, 1); assert.equal(root.querySelectorAll('.ui-attachment-list').length, 1);
  assert.equal(api.set([f]), true); assert.deepEqual(api.files, [f]); assert.deepEqual(arrays, [[f]]); assert.deepEqual(events, [{files: [f]}]);
  const detached = api.files; detached.push(g); assert.deepEqual(api.files, [f]); assert.equal(api.set([f, g]), false); assert.deepEqual(input.files, [f]); api.destroy();
});

test('extension rejects zero bytes, size, type and count with prior FileList retained', () => {
  const {root, input, error} = fixture(true), api = CompanyExtensions.filePicker(root, {maxFiles: 1, maxBytes: 8});
  choose(input, [f]);
  for (const files of [[new File([], 'empty.pdf', {type: 'application/pdf'})], [new File(['123456789'], 'large.pdf', {type: 'application/pdf'})], [new File(['abc'], 'script.txt', {type: 'text/plain'})], [f, g]]) {
    choose(input, files); assert.deepEqual(api.files, [f]); assert.deepEqual(input.files, [f]); assert.notEqual(error.textContent, ''); assert.equal(error.hidden, false); assert.equal(error.classList.contains('ui-field-error'), true); assert.equal(error.getAttribute('role'), 'alert'); assert.equal(input.getAttribute('aria-invalid'), 'true');
  }
  choose(input, [g]); assert.deepEqual(api.files, [g]); assert.equal(error.textContent, ''); assert.equal(error.hidden, true); assert.equal(input.getAttribute('aria-invalid'), 'false'); api.destroy();
});

test('extension supports MIME wildcard/extension validation through the shared validator callback', () => {
  const {root, input} = fixture(), api = CompanyExtensions.filePicker(root, {accept: 'image/*,.pdf'});
  const image = new File(['png'], 'PHOTO.PNG', {type: 'image/png'}); assert.equal(api.set([image]), true); assert.deepEqual(input.files, [image]);
  assert.equal(api.set([new File(['x'], 'UPPER.PDF', {type: ''})]), true); api.destroy();
});

test('multi extension selection replaces while drop accumulates and deduplicates', () => {
  const {root, input} = fixture(true), api = CompanyExtensions.filePicker(root);
  choose(input, [f]); choose(input, [g]); assert.deepEqual(api.files, [g]);
  assert.equal(drop(root, [f, g]).defaultPrevented, true); assert.deepEqual(api.files, [g, f]); assert.deepEqual(input.files, [g, f]);
  const before = new Event('dragover', {cancelable: true}); root.dispatchEvent(before); assert.equal(root.classList.contains('is-dragging'), true);
  root.dispatchEvent(new Event('dragleave')); assert.equal(root.classList.contains('is-dragging'), false); api.destroy();
});

test('single drop rejects multi-file drop instead of silently truncating', () => {
  const {root, input} = fixture(), api = CompanyExtensions.filePicker(root); api.set([g]); drop(root, [f, g]); assert.deepEqual(api.files, [g]); assert.deepEqual(input.files, [g]); api.destroy();
});

test('canonical removal synchronizes input.files and focuses next remove then add', () => {
  const {root, input} = fixture(true), api = CompanyExtensions.filePicker(root); api.set([f, g]);
  root.querySelector('.ui-attachment-list').querySelector('button').click(); assert.deepEqual(api.files, [g]); assert.deepEqual(input.files, [g]); assert.equal(document.activeElement, root.querySelector('.ui-attachment-list').querySelector('button'));
  root.querySelector('.ui-attachment-list').querySelector('button').click(); assert.deepEqual(api.files, []); assert.deepEqual(input.files, []); assert.equal(document.activeElement, root.querySelector('.ui-attachment-toolbar').querySelector('button')); assert.equal(root.querySelector('.ui-attachment-empty').hidden, false); api.destroy();
});

test('disabled state blocks UI add/remove/drop/change and adapter set', () => {
  const {root, input} = fixture(true), api = CompanyExtensions.filePicker(root); api.set([f]); const remove = root.querySelector('.ui-attachment-list').querySelector('button'); let opened = 0; input.click = () => opened++;
  input.disabled = true; refreshDisabled(input); const add = root.querySelector('.ui-attachment-toolbar').querySelector('button'); assert.equal(add.disabled, true); assert.equal(root.querySelector('.ui-attachment-list').querySelector('button').disabled, true);
  add.click(); remove.click(); drop(root, [g]); choose(input, [g]); assert.equal(api.set([g]), false); assert.equal(opened, 0); assert.deepEqual(api.files, [f]); assert.deepEqual(input.files, [f]);
  input.disabled = false; refreshDisabled(input); assert.equal(root.querySelector('.ui-attachment-toolbar').querySelector('button').disabled, false); api.destroy();
});

test('extension form reset clears canonical UI/error/FileList and reports empty array once', () => {
  const {root, input, form, error} = fixture(true), changes = [], api = CompanyExtensions.filePicker(root, {onChange: value => changes.push(value)}); api.set([f]); choose(input, [new File([], 'empty.pdf')]);
  form.dispatchEvent(new Event('reset', {cancelable: true})); assert.deepEqual(api.files, []); assert.deepEqual(input.files, []); assert.equal(error.textContent, ''); assert.equal(input.validationMessage, ''); assert.deepEqual(changes, [[f], []]); assert.equal(root.querySelector('.ui-attachment-list').children.length, 0); api.destroy();
});

test('canonical default reset remains silent and clear/refresh retain existing contracts', () => {
  const {root, input, form} = fixture(), changes = [], api = CompanyBusiness.attachments(root, {onChange: value => changes.push(value)});
  choose(input, [f]); form.dispatchEvent(new Event('reset')); assert.equal(changes.length, 1); assert.deepEqual(api.files, []);
  input.files = [g]; api.refresh(); assert.deepEqual(api.files, [g]); assert.equal(changes.length, 1); api.clear(); assert.deepEqual(input.files, []); assert.equal(changes.length, 2); api.destroy();
});

test('invalid hidden file input redirects focus to the visible shared add control', () => {
  const {root, input} = fixture(), api = CompanyExtensions.filePicker(root); const invalid = new Event('invalid', {cancelable: true}); input.dispatchEvent(invalid); assert.equal(invalid.defaultPrevented, true); assert.equal(document.activeElement, root.querySelector('.ui-attachment-toolbar').querySelector('button')); api.destroy();
});

test('destroy restores original attributes and disconnects every interactive path', () => {
  const {root, input, error, form} = fixture(), changes = [];
  input.setAttribute('aria-describedby', 'original-help'); input.setAttribute('aria-invalid', 'true'); input.setCustomValidity('original error'); error.id = 'host-error'; error.textContent = 'original note'; error.className = 'host-error'; error.setAttribute('role', 'status'); error.hidden = false;
  const api = CompanyExtensions.filePicker(root, {onChange: value => changes.push(value)}); api.set([f]); const add = root.querySelector('.ui-attachment-toolbar').querySelector('button'); const remove = root.querySelector('.ui-attachment-list').querySelector('button'); let opened = 0; input.click = () => opened++;
  api.destroy(); api.destroy(); assert.equal(root.querySelector('.ui-attachment-toolbar'), null); assert.equal(root.querySelector('.ui-attachment-list'), null); assert.equal(root.querySelector('.ui-attachment-empty'), null); assert.equal(input.hidden, false); assert.equal(input.multiple, false); assert.equal(input.getAttribute('aria-describedby'), 'original-help'); assert.equal(input.getAttribute('aria-invalid'), 'true'); assert.equal(input.validationMessage, 'original error'); assert.equal(error.textContent, 'original note'); assert.equal(error.id, 'host-error'); assert.equal(error.className, 'host-error'); assert.equal(error.getAttribute('role'), 'status'); assert.equal(error.hidden, false); assert.ok(observers.findLast(observer => observer.node === input).disconnected);
  add.click(); remove.click(); drop(root, [g]); form.dispatchEvent(new Event('reset')); choose(input, [g]); assert.equal(opened, 0); assert.deepEqual(api.files, [f]); assert.deepEqual(changes, [[f]]);
});
