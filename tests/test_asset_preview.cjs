const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('designs/assets/preview.js', 'utf8');
const context = vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function localPath('), source.indexOf('async function copy(')), context);
test('all adopted preview links accept local fragment routes without allowing external paths', () => {
  const registry = JSON.parse(fs.readFileSync('designs/assets/registry.json', 'utf8'));
  for (const item of registry.items) for (const value of Object.values(item.variants)) {
    if (value.preview) assert.equal(context.previewPath(value.preview), value.preview);
  }
  for (const path of ['../outside.html', 'https://example.com/x', '//example.com', 'a.html#x#y', 'a.html#<script>']) {
    assert.throws(() => context.previewPath(path));
  }
});
test('registry and message verification use the same response bytes that were parsed', () => {
  assert.ok(source.includes('JSON.parse(new TextDecoder().decode(bytes))'));
  assert.ok(source.includes('results[index].bytes'));
  assert.ok(!source.includes("fetch('registry.json')"));
});
test('catalog separates actual source visual review from rendering and UI conformance', () => {
  const block = source.slice(source.indexOf('  const mapped='), source.indexOf('  render();', source.indexOf('  const mapped=')));
  const output = {};
  const coverage = {source: {pageCount: 3, tocCount: 1}, items: [{assets: ['x'], verification: 'verified'}],
    pages: [{visualReview: 'source-visually-reviewed'}, {visualReview: 'pending'}, {rendered: true}]};
  vm.runInNewContext(block, {coverage, document: {querySelector: () => output}});
  assert.ok(output.textContent.includes('원문 시각 대조 1/3'));
  assert.ok(output.textContent.includes('회사 적용·전체 규칙 준수 검증은 별도'));
  assert.ok(!output.textContent.includes('검증 완료'));
});
test('adopted HTML assets without a separate wrapper still offer an executable preview', () => {
  const record = JSON.parse(fs.readFileSync('designs/assets/registry.json', 'utf8')).items.find(item => item.id === 'foundation.layout');
  assert.ok(record.variants[record.defaultVariant].path.endsWith('.html'));
  assert.ok(source.includes('value.preview || (/\\.html$/.test(value.path)?value.path:undefined)'));
});
