import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'altool/scripts'))
SPEC = importlib.util.spec_from_file_location('release_css_test', ROOT / 'scripts/build_company_assets.py')
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


class CompanyCssReleaseTests(unittest.TestCase):
    def test_all_pinned_distribution_css_passes_preflight(self):
        from assets import read_json
        files = read_json(ROOT / 'designs/assets/pack.lock.json')['files']
        output = builder.verify_distribution_css(files)
        self.assertIn('PASS CSS custom property', output)
        self.assertIn('PASS CSS text contrast', output)
        self.assertRegex(output, r'[1-9][0-9]* explicit pairs')
        self.assertRegex(output, r'[0-9]+ ambiguous rules')
        self.assertIn('4.5', output)

    def test_ambiguous_pairs_are_reported_not_promoted_to_passed_coverage(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as directory, patch.object(builder, 'ROOT', Path(directory)):
            css = builder.ROOT / 'designs/assets/runtime/ambiguous.css'
            css.parent.mkdir(parents=True)
            css.write_text('.x {color:currentColor;background:transparent}', encoding='utf-8')
            output = builder.verify_distribution_css(['designs/assets/runtime/ambiguous.css'])
            self.assertIn('0 explicit pairs', output)
            self.assertIn('1 ambiguous rules', output)

    def test_preflight_rejects_real_missing_variable_and_contrast(self):
        with tempfile.TemporaryDirectory() as directory:
            original = builder.ROOT
            try:
                builder.ROOT = Path(directory)
                css = builder.ROOT / 'designs/assets/runtime/bad.css'
                css.parent.mkdir(parents=True)
                css.write_text('.x {color:#fff;background:#fff;border-color:var(--missing)}')
                with self.assertRaisesRegex(ValueError, 'Distribution CSS preflight failed'):
                    builder.verify_distribution_css(['designs/assets/runtime/bad.css'])
            finally:
                builder.ROOT = original

    def test_fixed_direction_icons_preserve_company_geometry(self):
        import json
        import assets
        source = ROOT / 'designs/assets/ui-kit/internal/company'
        catalog = json.loads((source / 'dist/assets/icons.json').read_text())
        for direction in ['left', 'right', 'up', 'down']:
            resolved = assets.resolve(ROOT, 'icon.chevron-' + direction)
            svg = (ROOT / resolved['path']).read_text()
            self.assertNotIn('rotate(', svg)
            self.assertIn('stroke-width="1.5"', svg)
            self.assertEqual(svg, (source / f'dist/assets/icons/chevron-{direction}.svg').read_text())
        self.assertEqual(len(catalog['icons']), len(list((source / 'dist/assets/icons').glob('*.svg'))))
        self.assertGreaterEqual(len(catalog['icons']), 120)


if __name__ == '__main__':
    unittest.main()
