"""Company stylesheet regression checks; browser computed-style QA is separate."""
import json
from pathlib import Path
import re
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'designs/assets/ui-kit/internal'
FOUNDATION = BASE / 'foundations'
PYTHON = str(ROOT / '.venv/bin/python') if (ROOT / '.venv/bin/python').is_file() else sys.executable


class AdapterTests(unittest.TestCase):
    def test_reproducible_and_pinned(self):
        result = subprocess.run([PYTHON, str(FOUNDATION / 'build_adapter.py'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_ast_conversion_preserves_queries_strings_comments_and_urls(self):
        script = r'''
import sys, json
sys.path.insert(0, sys.argv[1])
import build_adapter as b
source = b.UPSTREAM / 'resources/css/component/output.css'
sample = '@media (min-width: 40rem){.x{width:calc(2rem + 10px);content:"2rem";--name:2rem;/* 2rem */background:url("data:image/svg+xml,2rem");mask:url(../../img/component/icon/ico_angle.svg)}} @supports(width:2rem){.y{margin:-.8rem}}'
print(json.dumps(b.normalize(sample, source)))
'''
        result = subprocess.run([PYTHON, '-c', script, str(FOUNDATION)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        text = json.loads(result.stdout)
        for expected in ['min-width: 40rem', 'calc(1.25rem + 10px)', 'content:"2rem"', '--name:1.25rem', '/* 2rem */', 'data:image/svg+xml,2rem', '@supports(width:2rem)', 'margin:-0.5rem', '../upstream/resources/img/component/icon/ico_angle.svg']:
            self.assertIn(expected, text)

    def test_company_font_root_and_2024_aliases(self):
        text = (FOUNDATION / 'company-adapter.css').read_text()
        self.assertIn('--krds24-font-family: system-ui, -apple-system, sans-serif;', text)
        self.assertIn('--krds-color-light-primary-50: var(--krds24-primary-50);', text)
        self.assertIn('--krds-color-light-primary-95: var(--krds24-primary-90);', text)
        self.assertIn('--krds-pc-font-size-body-medium: var(--krds24-body-medium-size);', text)
        self.assertTrue(text.startswith('@layer altool-base, altool-components;'))
        self.assertIn('html { font-size: 100%; }', text)
        self.assertNotIn('@import', text)
        declared = set(re.findall(r'(--krds24-[\w-]+)\s*:', text))
        referred = set(re.findall(r'var\((--krds24-[\w-]+)', text))
        self.assertFalse(referred - declared, referred - declared)
        all_definitions = set(re.findall(r'(--[\w-]+)\s*:', text))
        all_references = set(re.findall(r'var\((--[\w-]+)', text))
        self.assertFalse(all_references - all_definitions, all_references - all_definitions)
        for relative in re.findall(r'url\("(\.\./upstream/[^"?#]+)', text):
            self.assertTrue((FOUNDATION / relative).is_file(), relative)

    def test_generation_rejects_changed_pinned_sources(self):
        script = r'''
import sys
sys.path.insert(0, sys.argv[1])
import build_adapter as b
b.SOURCES['resources/css/token/krds_tokens.css'] = '0' * 64
try:
    b.generate()
except ValueError as error:
    assert 'Pinned upstream CSS changed' in str(error)
else:
    raise AssertionError('Unreviewed source was accepted')
'''
        result = subprocess.run([PYTHON, '-c', script, str(FOUNDATION)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_default_button_is_large_19px_not_medium_17px(self):
        text = (FOUNDATION / 'company-adapter.css').read_text()
        self.assertIn('font-size: var(--krds-button--pc-font-size-large)', text)
        self.assertIn('--krds-button--pc-font-size-large: var(--krds-pc-font-size-label-large)', text)
        self.assertIn('--krds-pc-font-size-label-large: var(--krds24-label-large-size)', text)
        self.assertIn('--krds24-label-large-size: 1.1875rem', text)
        self.assertIn('--krds-button--pc-font-size-medium: var(--krds-pc-font-size-label-medium)', text)
        self.assertIn('--krds-pc-font-size-label-medium: var(--krds24-label-medium-size)', text)
        self.assertIn('--krds24-label-medium-size: 1.0625rem', text)
        values = json.loads((FOUNDATION / 'values-2024.json').read_text())
        sizes = {row[0]: row[1] for row in values['typography']['rows']}
        self.assertEqual(sizes['label-large'], 19)
        self.assertEqual(sizes['label-medium'], 17)

    def test_all_official_consumers_use_adapter_not_raw_css(self):
        manifest = json.loads((BASE / 'components/variants-manifest.json').read_text())
        for item in manifest['items']:
            for variant in item['variants'].values():
                if variant['kind'] != 'upstream-markup':
                    continue
                self.assertIn('ui-kit/internal/foundations/company-adapter.css', variant['dependencies'])
                self.assertFalse(any(path.endswith(('/common.css', '/output.css')) for path in variant['dependencies']))
                preview = (BASE.parent.parent / variant['preview']).read_text()
                self.assertIn('company-adapter.css', preview)
                self.assertNotIn('common/common.css', preview)
                self.assertNotIn('component/output.css', preview)


if __name__ == '__main__':
    unittest.main()
