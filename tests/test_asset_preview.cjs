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
test('company-only catalog loads without source archives and does not claim visual verification', () => {
  const start = source.indexOf('  const packStatus=');
  assert.ok(start >= 0);
  const block = source.slice(start, source.indexOf('  render();', start));
  const output = {};
  vm.runInNewContext(block, {registry: {pack: 'fixture-company', release: 'test'},
    adopted: [{id: 'component.button'}, {id: 'icon.settings'}],
    document: {querySelector: () => output}});
  assert.ok(output.textContent.includes('fixture-company@test'));
  assert.ok(output.textContent.includes('회사 사용 가능 의미 ID 2개'));
  assert.ok(output.textContent.includes('assets.py validate'));
  assert.ok(!output.textContent.includes('검증 완료'));
  assert.ok(source.includes("Promise.all(['catalog.json','messages/ko.json','registry.json','pack.lock.json']"));
  assert.doesNotMatch(source, /coverage\.json|source-review\.json|internal\/reference\//);
  const page = fs.readFileSync('designs/assets/index.html', 'utf8');
  assert.ok(page.includes('전체 회사 자산'));
  assert.ok(page.includes('KRDS 원문·추출 자료는 포함하지 않습니다'));
  assert.ok(page.includes('코드·정적 검사와 실제 브라우저 시각 검증은 별개'));
  assert.ok(page.includes('ui-kit/internal/ATTRIBUTION.md'));
});
test('adopted HTML assets without a separate wrapper still offer an executable preview', () => {
  const record = JSON.parse(fs.readFileSync('designs/assets/registry.json', 'utf8')).items.find(item => item.id === 'foundation.layout');
  assert.ok(record.variants[record.defaultVariant].path.endsWith('.html'));
  assert.ok(source.includes('value.preview || (/\\.html$/.test(value.path)?value.path:undefined)'));
});
