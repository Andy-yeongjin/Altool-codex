/* Local-only project asset routing and File System Access writes. */
(function (scope) {
  'use strict';
  const folders = { prd: 'prd', refs: 'prd/refs', claude: 'designs/claude-design', general: 'designs', stitch: 'designs/stitch' };
  function safePath(path) {
    if (typeof path !== 'string' || !path || path.includes('\\')) throw new Error('올바르지 않은 파일 경로입니다.');
    const parts = path.split('/');
    for (const part of parts) {
      if (!part || part === '.' || part === '..' || /[\x00-\x1f\x7f<>:"|?*]/.test(part) || /[. ]$/.test(part) ||
          /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)) {
        throw new Error(`사용할 수 없는 파일명: ${path}`);
      }
    }
    return path;
  }
  function destination(kind, file, folder = false) {
    if (!folders[kind]) throw new Error('알 수 없는 자산 종류입니다.');
    let name = folder && file.webkitRelativePath ? file.webkitRelativePath.split('/').slice(1).join('/') : file.name;
    if (!folder && name.includes('/')) throw new Error('단일 파일명에 경로를 넣을 수 없습니다.');
    safePath(name);
    if (kind === 'prd') {
      if (!/\.(md|txt)$/i.test(name)) throw new Error('PRD는 .md 또는 .txt를 선택하세요. 다른 문서는 참고자료에 넣어주세요.');
      name = name.replace(/\.(md|txt)$/i, '.md');
    }
    if (['claude', 'general', 'stitch'].includes(kind)) {
      if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) throw new Error('디자인 압축 파일은 먼저 풀고 파일 또는 폴더로 선택하세요.');
      if (kind === 'general' && /\.html?$/i.test(name)) throw new Error('HTML은 Claude 디자인 종류로 선택하세요.');
    }
    return safePath(`${folders[kind]}/${name}`);
  }
  function key(path) { return path.normalize('NFC').toLowerCase(); }
  function validateEntries(entries) {
    if (!entries.length) throw new Error('저장할 PRD나 디자인·참고자료를 먼저 준비하세요.');
    const paths = new Map();
    for (const entry of entries) {
      safePath(entry.path);
      if (!/^(prd|designs)\//.test(entry.path)) throw new Error('PRD와 디자인 폴더에만 저장할 수 있습니다.');
      const normalized = key(entry.path);
      if (paths.has(normalized)) throw new Error(`저장 경로가 겹칩니다: ${entry.path}. 파일을 제거하거나 원본 이름을 바꿔주세요.`);
      paths.set(normalized, entry.path);
    }
    for (const normalized of paths.keys()) {
      const parts = normalized.split('/');
      for (let i = 1; i < parts.length; i++) {
        if (paths.has(parts.slice(0, i).join('/'))) throw new Error(`파일과 폴더 경로가 겹칩니다: ${paths.get(normalized)}`);
      }
    }
    return entries;
  }
  async function fileHandle(root, path, create) {
    const parts = safePath(path).split('/');
    let directory = root;
    for (const name of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(name, { create });
    return directory.getFileHandle(parts.at(-1), { create });
  }
  async function conflicts(root, entries) {
    validateEntries(entries);
    const result = [];
    for (const entry of entries) {
      try { await fileHandle(root, entry.path, false); result.push(entry.path); }
      catch (error) { if (error.name !== 'NotFoundError') throw error; }
    }
    return result;
  }
  async function save(root, entries, confirmOverwrite) {
    const existing = await conflicts(root, entries);
    if (existing.length && !(await confirmOverwrite(existing))) return { cancelled: true, saved: [] };
    const saved = [];
    for (const entry of entries) {
      let writable;
      try {
        const handle = await fileHandle(root, entry.path, true);
        writable = await handle.createWritable();
        await writable.write(entry.data);
        await writable.close();
        saved.push(entry.path);
      } catch (cause) {
        if (writable) { try { await writable.abort(); } catch (_) { /* already closed */ } }
        const error = new Error(`${entry.path}: ${cause.message}`);
        error.saved = saved;
        error.failedPath = entry.path;
        throw error;
      }
    }
    return { cancelled: false, saved };
  }
  const api = { destination, safePath, validateEntries, conflicts, save };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else scope.AltoolStarter = api;
})(globalThis);
