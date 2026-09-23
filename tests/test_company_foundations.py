from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPANY = ROOT / 'designs/assets/ui-kit/internal/company'


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
        parsed.feed((COMPANY / 'layout-preview.html').read_text())
        self.assertEqual(len(parsed.ids), len(set(parsed.ids)))
        self.assertGreater(len(parsed.headings), 1)
        for layout in ['contained', 'fluid', 'contained-sidebar', 'fluid-sidebar']:
            self.assertIn(layout, parsed.ids)
        for target in parsed.links:
            if target.startswith('#'):
                self.assertIn(target[1:], parsed.ids)
            else:
                self.assertTrue((COMPANY / target).is_file(), target)
        self.assertEqual(parsed.headings.count(1), 1)
        for previous, current in zip(parsed.headings, parsed.headings[1:]):
            self.assertLessEqual(current, previous + 1)

    def test_layout_references_defined_company_tokens(self):
        css = (COMPANY / 'dist/foundations/layout.css').read_text()
        tokens = (COMPANY / 'dist/foundations/tokens-2024.css').read_text()
        references = set(re.findall(r'var\((--krds24-[a-z0-9-]+)\)', css))
        definitions = set(re.findall(r'(--krds24-[a-z0-9-]+):', tokens))
        self.assertFalse(references - definitions)
        for size in [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80]:
            self.assertIn(f'--krds24-space-{size}', definitions)
        for alpha in [10, 25, 50, 75, 100]:
            self.assertIn(f'--krds24-alpha-black-{alpha}', definitions)
        for radius in [0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 40]:
            self.assertIn(f'--krds24-radius-{radius}', definitions)
        self.assertIn('@media (max-width:700px)', css)
        self.assertIn('grid-template-columns:1fr', css)
        self.assertIn('min-width:0', css)
        self.assertIn('minmax(0,1fr)', css)
        self.assertIn('.altool-layout--fluid', css)
        self.assertIn('.altool-layout--sidebar', css)
        self.assertNotIn('min-width: 360px', css)


if __name__ == '__main__':
    unittest.main()
