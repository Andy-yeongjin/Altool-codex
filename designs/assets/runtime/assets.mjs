// Framework-neutral consumer. Each app loads the same pinned company registry.
const textDecoder = new TextDecoder();
const hex = buffer => [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');

export async function createAssetClient(base, expected = {}) {
  const baseURL = new URL(base, globalThis.location?.href);
  if (!baseURL.pathname.endsWith('/')) throw new Error('Asset base must end with /');
  const safeURL = path => {
    if (typeof path !== 'string' || !path.startsWith('designs/assets/') || path.includes('..') || path.includes('\\')) throw new Error('Unsafe asset path');
    const url = new URL(path.slice('designs/assets/'.length), baseURL);
    if (url.origin !== baseURL.origin || !url.pathname.startsWith(baseURL.pathname)) throw new Error('Asset path escapes pack');
    return url;
  };
  const fetchBytes = async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Asset load failed: ${response.status}`);
    return response.arrayBuffer();
  };
  const lock = JSON.parse(textDecoder.decode(await fetchBytes(new URL('pack.lock.json', baseURL))));
  if (lock.version !== 1) throw new Error('Unsupported asset lock');
  for (const key of ['pack', 'release']) if (expected[key] && expected[key] !== lock[key]) throw new Error(`Company ${key} mismatch`);
  const cache = new Map();
  const verifiedBytes = async path => {
    if (!lock.files[path]) throw new Error(`Unpinned asset: ${path}`);
    if (!cache.has(path)) cache.set(path, (async () => {
      const bytes = await fetchBytes(safeURL(path));
      if (hex(await crypto.subtle.digest('SHA-256', bytes)) !== lock.files[path]) throw new Error(`Company asset changed: ${path}`);
      return bytes;
    })());
    try { return await cache.get(path); }
    catch (error) { cache.delete(path); throw error; }
  };
  const registry = JSON.parse(textDecoder.decode(await verifiedBytes('designs/assets/registry.json')));
  if (registry.pack !== lock.pack || registry.release !== lock.release) throw new Error('Registry release mismatch');
  const items = new Map(registry.items.map(i => [i.id, i]));
  const resolve = (id, variant) => {
    const item = items.get(id);
    if (!item || (item.restrictedTo && !item.restrictedTo.includes(expected.audience || 'company'))) throw new Error(`Unavailable semantic asset: ${id}`);
    const name = variant || item.defaultVariant;
    if (!Object.hasOwn(item.variants, name)) throw new Error(`Unapproved variant: ${id}/${name}`);
    return {id, variant: name, kind: item.kind, ...item.variants[name]};
  };
  const message = async id => {
    const asset = resolve(id);
    if (asset.kind !== 'message') throw new Error('Expected a message asset');
    const data = JSON.parse(textDecoder.decode(await verifiedBytes(asset.path)));
    const value = data.messages[asset.key];
    if (!value) throw new Error(`Missing message key: ${asset.key}`);
    return Object.freeze({...value});
  };
  return Object.freeze({
    pack: registry.pack, release: registry.release, resolve, message,
    async icon(id, {variant, size = 24, label = ''} = {}) {
      const asset = resolve(id, variant);
      if (asset.kind !== 'icon' || ![16, 20, 24, 32, 48].includes(size)) throw new Error('Invalid icon or size');
      const bytes = await verifiedBytes(asset.path);
      const image = document.createElement('img');
      const url = URL.createObjectURL(new Blob([bytes], {type:'image/svg+xml'}));
      image.addEventListener('load', () => URL.revokeObjectURL(url), {once:true});
      image.addEventListener('error', () => URL.revokeObjectURL(url), {once:true});
      image.src = url; image.alt = label; image.width = size; image.height = size;
      image.dataset.assetId = id; image.dataset.assetVariant = asset.variant;
      return image;
    },
    async renderMessage(container, id, {onAction} = {}) {
      const value = await message(id);
      const section = document.createElement('section');
      section.dataset.assetId = id;
      section.setAttribute('role', value.severity === 'error' ? 'alert' : 'status');
      const title = document.createElement('strong'); title.textContent = value.title;
      const body = document.createElement('p'); body.textContent = value.body;
      section.append(title, body);
      if (value.action && typeof onAction === 'function') {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = value.action;
        button.addEventListener('click', onAction); section.append(button);
      }
      container.replaceChildren(section);
      return section;
    }
  });
}
