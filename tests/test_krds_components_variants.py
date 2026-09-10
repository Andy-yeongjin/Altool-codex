"""Structural HTML checks for authored variants; browser QA remains separate."""
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPONENTS = ROOT / 'designs/assets/ui-kit/internal/components'


class Parser(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class ComponentVariantsTests(unittest.TestCase):
    def test_every_local_aria_and_fragment_target_resolves(self):
        for file in (COMPONENTS / 'fragments').glob('*.html'):
            tags = Parser(file.read_text()).tags
            ids = [a['id'] for _, a in tags if 'id' in a]
            self.assertEqual(len(ids), len(set(ids)), file)
            for tag, attrs in tags:
                for key in ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby']:
                    for target in attrs.get(key, '').split():
                        self.assertIn(target, ids, (file, key, target))
                href = attrs.get('href', '')
                if href.startswith('#'):
                    self.assertIn(href[1:], ids, (file, href))
                if tag == 'button':
                    self.assertIn(attrs.get('type'), ['button', 'submit'])
                self.assertFalse(any(key.startswith('on') for key in attrs), file)

    def test_demo_resources_and_policy(self):
        for file in (COMPONENTS / 'examples').glob('*.html'):
            text = file.read_text()
            self.assertIn("connect-src 'none'", text)
            self.assertIn('샘플 데이터', text)
            scripts = [attrs.get('src') for tag, attrs in Parser(text).tags if tag == 'script' and attrs.get('src')]
            if '../runtime.js' in scripts:
                self.assertIn('../messages.js', scripts, file)
                self.assertLess(scripts.index('../messages.js'), scripts.index('../runtime.js'), file)
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
