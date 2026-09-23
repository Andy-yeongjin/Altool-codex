import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / 'designs/assets/ui-kit/design'


class CompanyPaletteTest(unittest.TestCase):
    def test_bright_palette_separates_foreground_and_focus(self):
        css = (DESIGN / 'components.css').read_text()
        self.assertNotRegex(css, r'(?<![\w-])color:var\(--company-brand-primary\)')
        self.assertNotIn('outline:2px solid var(--company-brand-primary)', css)
        self.assertIn('--d-bg:var(--company-brand-primary)', css)
        theme = (DESIGN / 'theme.css').read_text()
        self.assertIn('--company-brand-foreground:var(--company-brand-primary)', theme)
        self.assertIn('--company-brand-focus:var(--company-brand-foreground)', theme)
        yellow = (ROOT / 'office-mockups/yellow-palette.css').read_text()
        values = dict(re.findall(r'(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6});', yellow))
        def luminance(hex_color):
            channels = [int(hex_color[i:i+2], 16)/255 for i in (1, 3, 5)]
            linear = [c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4 for c in channels]
            return sum(c*w for c, w in zip(linear, (.2126, .7152, .0722)))
        def contrast(a, b):
            light, dark = sorted((luminance(a), luminance(b)), reverse=True)
            return (light+.05)/(dark+.05)
        for background in ('#FFFFFF', '#F1F3F5', '#F7F7F8'):
            self.assertGreaterEqual(contrast(values['--company-brand-foreground'], background), 4.5)
            self.assertGreaterEqual(contrast(values['--company-brand-focus'], background), 3)
        self.assertGreaterEqual(contrast(values['--company-brand-primary'], values['--company-brand-on-primary']), 4.5)

    def test_no_brand_literals_in_components(self):
        css = (DESIGN / 'components.css').read_text()
        for color in ['#1554a0', '#104583', '#103866', '#18334f', '#244763', '#edf3fa']:
            self.assertNotIn(color, css.lower())
        self.assertIn('var(--company-brand-primary)', css)
        self.assertIn('var(--company-brand-menu-shadow)', css)

    def test_default_and_status_separation(self):
        css = (DESIGN / 'theme.css').read_text()
        values = dict(re.findall(r'(--[\w-]+)\s*:\s*([^;{}]+);', css))
        self.assertEqual(values['--company-brand-primary'], '#1554A0')
        self.assertEqual(values['--krds24-primary-50'], 'var(--company-brand-primary-50)')
        self.assertEqual(values['--company-brand-primary-50'], 'var(--company-brand-primary)')
        for key in ['error', 'warning', 'success', 'progress']:
            self.assertNotIn('brand', values['--company-status-' + key])
        self.assertEqual(values['--company-table-selected'], 'var(--company-brand-row-selected)')
