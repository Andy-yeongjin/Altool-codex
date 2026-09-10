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
        self.assertIn('33 explicit pairs', output)
        self.assertIn('161 ambiguous rules', output)

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

    def test_fixed_direction_icons_reproduce_and_preserve_source_path(self):
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/build_direction_icons.py'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        import assets
        for direction, rotation in [('left', 90), ('right', -90), ('up', 180), ('down', 0)]:
            resolved = assets.resolve(ROOT, 'icon.chevron-' + direction)
            svg = (ROOT / resolved['path']).read_text()
            self.assertIn(f'rotate({rotation} 12 12)', svg)
            self.assertIn('M4.47243 8.39766', svg)


if __name__ == '__main__':
    unittest.main()
