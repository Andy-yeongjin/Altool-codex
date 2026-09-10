const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const starter = require('../altool/scripts/project-starter.js');

// Disk-backed test adapter for the browser handle contract, not an OS-picker test.
function directory(root, failOn = '') {
  return {
    async getDirectoryHandle(name, { create }) {
      const target = path.join(root, name);
      try {
        if (create) await fs.mkdir(target, { recursive: true });
        const stat = await fs.stat(target);
        if (!stat.isDirectory()) throw Object.assign(new Error('Not a directory'), { name: 'TypeMismatchError' });
        return directory(target, failOn);
      } catch (error) {
        if (error.code === 'ENOENT') error.name = 'NotFoundError';
        throw error;
      }
    },
    async getFileHandle(name, { create }) {
      const target = path.join(root, name);
      try {
        if (create) { const file = await fs.open(target, 'a'); await file.close(); }
        if (!(await fs.stat(target)).isFile()) throw Object.assign(new Error('Not a file'), { name: 'TypeMismatchError' });
      } catch (error) {
        if (error.code === 'ENOENT') error.name = 'NotFoundError';
        throw error;
      }
      return { async createWritable() {
        let bytes;
        return {
          async write(data) {
            if (name === failOn) throw new Error('Simulated disk failure');
            bytes = typeof data === 'string' ? Buffer.from(data) : Buffer.from(await data.arrayBuffer());
          },
          async close() { await fs.writeFile(target, bytes); },
          async abort() { bytes = null; },
        };
      } };
    },
  };
}
async function sandbox(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'altool-starter-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

test('routes PRD, references and design categories; preserves folder-relative assets', () => {
  assert.equal(starter.destination('prd', { name: '요구사항.txt' }), 'prd/요구사항.md');
  assert.equal(starter.destination('refs', { name: 'notes.pdf' }), 'prd/refs/notes.pdf');
  assert.equal(starter.destination('claude', { name: 'index.html' }), 'designs/claude-design/index.html');
  assert.equal(starter.destination('general', { name: 'page.pen' }), 'designs/page.pen');
  assert.equal(starter.destination('stitch', { name: 'code.html', webkitRelativePath: 'export/home/code.html' }, true), 'designs/stitch/home/code.html');
  assert.equal(starter.destination('claude', { name: 'logo.png', webkitRelativePath: 'export/assets/logo.png' }, true), 'designs/claude-design/assets/logo.png');
});
test('rejects path traversal, reserved file names and unknown categories', () => {
  for (const name of ['../x.md', 'C:\\x.md', 'x/y.md', 'NUL.md', 'COM1.txt', 'x?.md', 'x.md ', '\u0000.md']) {
    assert.throws(() => starter.destination('prd', { name }));
  }
  assert.throws(() => starter.destination('constitution', { name: 'constitution.md' }));
  assert.throws(() => starter.validateEntries([{ path: 'constitution.md', data: 'unsafe' }]));
});
test('nested Claude screens keep duplicate basenames and relative CSS/image links', async t => {
  const root = await sandbox(t);
  const inputs = [
    ['export/home/code.html', '<link href="../shared/app.css"><img src="assets/icon.svg">'],
    ['export/settings/code.html', '<h1>Settings</h1>'],
    ['export/shared/app.css', 'body { color: black; }'],
    ['export/home/assets/icon.svg', '<svg></svg>'],
  ];
  const entries = inputs.map(([relative, data]) => ({
    path: starter.destination('claude', {name: relative.split('/').at(-1), webkitRelativePath: relative}, true), data,
  }));
  await starter.save(directory(root), entries, () => false);
  const home = path.join(root, 'designs/claude-design/home');
  assert.equal(await fs.readFile(path.join(home, 'code.html'), 'utf8'), inputs[0][1]);
  assert.equal(await fs.readFile(path.resolve(home, '../shared/app.css'), 'utf8'), inputs[2][1]);
  assert.equal(await fs.readFile(path.resolve(home, 'assets/icon.svg'), 'utf8'), inputs[3][1]);
  assert.equal(await fs.readFile(path.join(root, 'designs/claude-design/settings/code.html'), 'utf8'), inputs[1][1]);
});
test('rejects unsupported PRD and compressed or misclassified design input', () => {
  assert.throws(() => starter.destination('prd', { name: 'scan.pdf' }), /PRD/);
  assert.throws(() => starter.destination('claude', { name: 'design.zip' }), /압축/);
  assert.throws(() => starter.destination('general', { name: 'index.html' }), /Claude/);
});
test('rejects output collisions including TXT conversion, case, Unicode and directory prefixes', () => {
  for (const pair of [['prd/A.md','prd/a.md'], ['prd/가.md','prd/가.md'], ['prd/refs','prd/refs/x.md']]) {
    assert.throws(() => starter.validateEntries(pair.map(p => ({path:p,data:'x'}))), /겹칩니다/);
  }
  const paths = ['a.txt','a.md'].map(name => ({path:starter.destination('prd',{name}),data:'x'}));
  assert.throws(() => starter.validateEntries(paths));
  assert.throws(() => starter.validateEntries([]));
});
test('saving writes exact bytes to actual files and preserves unrelated content', async t => {
  const root = await sandbox(t);
  await fs.writeFile(path.join(root, 'constitution.md'), 'untouched');
  const binary = new Uint8Array([0,1,255,13,10]);
  const entries = [
    {path:'prd/requirements.md',data: new Blob(['# Original\r\n보존\r\n'])},
    {path:'designs/claude-design/index.html',data:new Blob(['<h1>Design</h1>'])},
    {path:'designs/claude-design/assets/logo.png',data:new Blob([binary])},
  ];
  assert.equal((await starter.save(directory(root), entries, () => false)).saved.length, 3);
  assert.equal(await fs.readFile(path.join(root, entries[0].path), 'utf8'), '# Original\r\n보존\r\n');
  assert.deepEqual(await fs.readFile(path.join(root, entries[2].path)), Buffer.from(binary));
  assert.equal(await fs.readFile(path.join(root, 'constitution.md'), 'utf8'), 'untouched');
});
test('conflict check and cancellation perform no writes, including unrelated new entries', async t => {
  const root = await sandbox(t);
  await fs.mkdir(path.join(root, 'prd'));
  await fs.writeFile(path.join(root, 'prd/old.md'), 'original');
  const entries = [{path:'designs/new.pen',data:'new'},{path:'prd/old.md',data:'changed'}];
  const result = await starter.save(directory(root), entries, paths => { assert.deepEqual(paths,['prd/old.md']); return false; });
  assert.deepEqual(result,{cancelled:true,saved:[]});
  assert.equal(await fs.readFile(path.join(root, 'prd/old.md'),'utf8'),'original');
  await assert.rejects(fs.stat(path.join(root, 'designs')), {code:'ENOENT'});
});
test('explicit overwrite updates only selected files', async t => {
  const root = await sandbox(t);
  const entries = [{path:'prd/a.md',data:'old'}];
  await starter.save(directory(root), entries, () => false);
  await starter.save(directory(root), [{path:'prd/a.md',data:'new'}], () => true);
  assert.equal(await fs.readFile(path.join(root,'prd/a.md'),'utf8'),'new');
});
test('directory/file mismatch fails before writing anything', async t => {
  const root = await sandbox(t);
  await fs.mkdir(path.join(root,'prd/a.md'), {recursive:true});
  await assert.rejects(starter.save(directory(root), [{path:'designs/new.pen',data:'new'},{path:'prd/a.md',data:'x'}], () => true));
  await assert.rejects(fs.stat(path.join(root,'designs')), {code:'ENOENT'});
});
test('partial failure reports only completed writes and preserves failed existing file', async t => {
  const root = await sandbox(t);
  await fs.mkdir(path.join(root,'prd'));
  await fs.writeFile(path.join(root,'prd/fail.md'),'old');
  await assert.rejects(starter.save(directory(root,'fail.md'), [
    {path:'prd/first.md',data:'first'}, {path:'prd/fail.md',data:'new'}, {path:'prd/last.md',data:'last'},
  ], () => true), error => {
    assert.deepEqual(error.saved,['prd/first.md']);
    assert.equal(error.failedPath,'prd/fail.md');
    return true;
  });
  assert.equal(await fs.readFile(path.join(root,'prd/fail.md'),'utf8'),'old');
  await assert.rejects(fs.stat(path.join(root,'prd/last.md')), {code:'ENOENT'});
});
test('starter HTML scripts parse, use local assets, and have no download/upload transport', async () => {
  const html = await fs.readFile(path.join(__dirname,'../project-starter.html'),'utf8');
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1]);
  assert.doesNotMatch(html, /JSZip|downloadPRD|createObjectURL|fetch\(|XMLHttpRequest|https:\/\/.*(?:\.js|\.css)/);
  const script = html.match(/<script src="([^"]+)"/)[1];
  await fs.access(path.join(__dirname,'..',script));
});
