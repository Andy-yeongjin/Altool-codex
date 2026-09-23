/* Reproduce the company-relative registry from the two recipe manifests. */
const fs = require('node:fs');
const path = require('node:path');
const prefix = 'ui-kit/internal/company/';
const toCompanyPath = value => value.startsWith(prefix) ? value.slice(prefix.length) : value;

function renderRegistry(directory = __dirname) {
  const items = [];
  for (const group of ['basic', 'services']) {
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, group, 'variants-manifest.json'), 'utf8'));
    for (const source of manifest.items) {
      const item = {id:source.id, kind:source.kind, meaning:source.meaning, defaultVariant:source.defaultVariant, constraints:source.constraints, variants:{}};
      for (const [name, variant] of Object.entries(source.variants)) {
        const dependencies = variant.dependencies.filter(file => file.startsWith(prefix) || file.startsWith('messages/') || file.startsWith('runtime/')).map(toCompanyPath);
        if (dependencies.some(file => file.endsWith('/shared-messages.js') || file.endsWith('/company-assets.mjs'))) dependencies.push('messages/ko.json');
        if (dependencies.some(file => file.endsWith('/company-assets.mjs'))) dependencies.push('runtime/assets.mjs');
        item.variants[name] = {...variant, path:toCompanyPath(variant.path), dependencies:[...new Set(dependencies)]};
        if (variant.preview) item.variants[name].preview = toCompanyPath(variant.preview);
      }
      items.push(item);
    }
  }
  const additional = JSON.parse(fs.readFileSync(path.join(directory, 'registry-additions.json'), 'utf8'));
  items.push(...additional.items);
  for (const item of items) for (const variant of Object.values(item.variants)) {
    variant.dependencies = [...new Set([...variant.dependencies, 'dist/select.js', 'recipes/controls.js'])];
  }
  return JSON.stringify({version:1, scope:'company-v27-only', messagesDependency:'messages/ko.json', items}) + '\n';
}

function build({check = false, directory = __dirname} = {}) {
  const output = path.join(directory, 'registry.json');
  const expected = renderRegistry(directory);
  if (check) {
    if (fs.readFileSync(output, 'utf8') !== expected) throw new Error('Stale company recipes registry; run recipes/build-registry.cjs');
  } else fs.writeFileSync(output, expected);
}
if (require.main === module) build({check:process.argv.includes('--check')});
module.exports = {build, renderRegistry};
