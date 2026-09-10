import json
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
FOUNDATIONS = ROOT / 'designs/assets/ui-kit/internal/foundations'


class LayoutParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.headings, self.variants = [], [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if re.fullmatch(r'h[1-6]', tag):
            self.headings.append(int(tag[1]))
        if tag == 'article':
            self.variants.append(attrs['id'])


class CompanyFoundationTests(unittest.TestCase):
    def test_layout_variants_have_real_unique_anchor_targets_and_heading_hierarchy(self):
        parsed = LayoutParser()
        parsed.feed((FOUNDATIONS / 'layout.html').read_text())
        self.assertEqual(len(parsed.ids), len(set(parsed.ids)))
        self.assertEqual(parsed.variants, ['contained', 'fluid', 'contained-sidebar', 'fluid-sidebar'])
        for target in parsed.links:
            self.assertTrue(target.startswith('#'))
            self.assertIn(target[1:], parsed.ids)
        self.assertEqual(parsed.headings.count(1), 1)
        for previous, current in zip(parsed.headings, parsed.headings[1:]):
            self.assertLessEqual(current, previous + 1)

    def test_layout_references_defined_company_tokens(self):
        css = (FOUNDATIONS / 'layout.css').read_text()
        tokens = (FOUNDATIONS / 'tokens-2024.css').read_text()
        references = set(re.findall(r'var\((--krds24-[a-z0-9-]+)\)', css))
        definitions = set(re.findall(r'(--krds24-[a-z0-9-]+):', tokens))
        self.assertFalse(references - definitions)
        for size in [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80]:
            self.assertIn(f'--krds24-space-{size}', definitions)
        for alpha in [10, 25, 50, 75, 100]:
            self.assertIn(f'--krds24-alpha-black-{alpha}', definitions)
        for radius in [0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 40]:
            self.assertIn(f'--krds24-radius-{radius}', definitions)
        self.assertIn('(min-width: 601px)', css)
        self.assertIn('(min-width: 1025px)', css)
        self.assertNotIn('min-width: 360px', css)

    def test_manual_visual_notes_cover_only_the_assigned_pages(self):
        notes = json.loads((FOUNDATIONS / 'visual-review-notes.json').read_text())
        expected = set(range(1, 114)) | set(range(981, 989))
        self.assertEqual({int(page) for page in notes['pages']}, expected)
        for observation in notes['pages'].values():
            self.assertGreaterEqual(len(observation), 8)
        self.assertIn('개별 PNG 실제 열람', notes['method'])


if __name__ == '__main__':
    unittest.main()
