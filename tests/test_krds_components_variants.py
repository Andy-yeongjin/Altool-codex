"""Structural HTML checks for authored variants; browser QA remains separate."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPONENTS = ROOT / 'designs/assets/ui-kit/internal/company/extensions'


class Parser(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class ComponentVariantsTests(unittest.TestCase):
    def test_every_local_aria_and_fragment_target_resolves(self):
        files = list((COMPONENTS / 'fragments').glob('*.html'))
        self.assertGreaterEqual(len(files), 11)
        preview_ids = {a['id'] for _, a in Parser((COMPONENTS / 'preview.html').read_text()).tags if 'id' in a}
        for file in files:
            tags = Parser(file.read_text()).tags
            ids = [a['id'] for _, a in tags if 'id' in a]
            self.assertEqual(len(ids), len(set(ids)), file)
            for tag, attrs in tags:
                for key in ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby']:
                    for target in attrs.get(key, '').split():
                        self.assertIn(target, ids, (file, key, target))
                href = attrs.get('href', '')
                if href.startswith('#'):
                    self.assertIn(href[1:], set(ids) | preview_ids, (file, href))
                if tag == 'button':
                    self.assertIn(attrs.get('type'), ['button', 'submit'])
                self.assertFalse(any(key.startswith('on') for key in attrs), file)

    def test_demo_resources_and_policy(self):
        files = [COMPONENTS / 'preview.html']
        manifest = json.loads((COMPONENTS / 'registry.json').read_text())
        self.assertGreaterEqual(len(manifest['items']), 11)
        for file in files:
            text = file.read_text()
            parsed = Parser(text).tags
            ids = [attrs['id'] for _, attrs in parsed if 'id' in attrs]
            self.assertEqual(len(ids), len(set(ids)), file)
            for _, attrs in parsed:
                self.assertFalse(any(key.startswith('on') for key in attrs), file)
            self.assertIn('실제 브라우저 검증은 보류', text)
            self.assertIn('저장·업로드·업무 완료를 의미하지 않습니다', text)
            scripts = [attrs.get('src') for tag, attrs in Parser(text).tags if tag == 'script' and attrs.get('src')]
            self.assertIn('runtime.js', scripts)
            self.assertIn('../dist/business.js', scripts)
            self.assertLess(scripts.index('../dist/business.js'), scripts.index('runtime.js'))
            for tag, attrs in Parser(text).tags:
                if tag in ['script', 'link', 'img']:
                    resource = attrs.get('src', attrs.get('href'))
                    if resource:
                        self.assertTrue((file.parent / resource).is_file(), (file, resource))

    def test_runtime_unit_contracts(self):
        result = subprocess.run(['node', '--test', str(ROOT / 'tests/test_krds_components_variants.cjs')],
                                cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
