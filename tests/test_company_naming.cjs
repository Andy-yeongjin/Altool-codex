const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');

// Optional peer directory keeps the Altool product free of app Node dependencies.
const peerRoot = process.env.ALTOOL_LINT_PEERS;
test('company naming config is importable without installed app peers', async () => {
  const { companyNamingConfig } = await import('../standards/tooling/eslint-company.mjs');
  const config = companyNamingConfig({ parser: {}, plugin: {} }, {});
  assert.equal(config.rules['unicorn/filename-case'][1].checkDirectories, false);
  assert.equal(config.rules['@typescript-eslint/naming-convention'][0], 'error');
});

test('real ESLint company naming regressions', { skip: !peerRoot && 'Set ALTOOL_LINT_PEERS to run actual ESLint fixtures' }, async t => {
  const peers = createRequire(path.join(path.resolve(peerRoot), 'package.json'));
  const { ESLint } = peers('eslint');
  const tseslint = peers('typescript-eslint');
  const unicorn = (await import(pathToFileURL(peers.resolve('eslint-plugin-unicorn')))).default;
  const { companyNamingConfig } = await import('../standards/tooling/eslint-company.mjs');
  const config = companyNamingConfig(tseslint, unicorn);
  const lint = new ESLint({ overrideConfigFile: true, overrideConfig: [config] });
  const valid = [
    ['user-form.tsx', 'export const UserForm = () => null; type UserFormProps = { userName: string };'],
    ['app/(auth)/[empNo]/page.tsx', 'export default function UserPage() { const userName = "kim"; return <p>{userName}</p>; }'],
    ['user.const.ts', 'export const USER_STATUS = ["ACTIVE"] as const; export const maxRows = 5;'],
    ['user.types.ts', 'interface SessionUser { empNo: string; useYn: boolean }'],
    ['headers.ts', 'const headers = { "Content-Type": "text/plain" };'],
    ['adapter.ts', '// eslint-disable-next-line @typescript-eslint/naming-convention -- external wire key at this boundary\nconst wire = { emp_no: "00123" };'],
  ];
  for (const [filePath, code] of valid) await t.test(`accepts ${filePath}`, async () => {
    const [result] = await lint.lintText(code, { filePath });
    assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  });
  const invalid = [
    ['user.ts', 'interface IUser { empNo: string }', '@typescript-eslint/naming-convention'],
    ['user.ts', 'const user_name = "kim";', '@typescript-eslint/naming-convention'],
    ['user.ts', 'function countRows() { const TOTAL_COUNT = 3; return TOTAL_COUNT; }', '@typescript-eslint/naming-convention'],
    ['UserForm.tsx', 'export const UserForm = () => null;', 'unicorn/filename-case'],
    ['app/[empNo]/BadFile.tsx', 'export default function UserPage() { return null; }', 'unicorn/filename-case'],
    ['user.ts', 'const user = { emp_no: "00123" };', '@typescript-eslint/naming-convention'],
  ];
  for (const [filePath, code, ruleId] of invalid) await t.test(`rejects ${filePath}: ${code}`, async () => {
    const [result] = await lint.lintText(code, { filePath });
    assert.ok(result.messages.some(m => m.ruleId === ruleId), JSON.stringify(result.messages));
  });
});
