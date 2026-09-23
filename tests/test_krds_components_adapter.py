"""Company-only stylesheet checks. The retired official rem adapter is not shipped."""
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / 'designs/assets/ui-kit'
COMPANY = KIT / 'internal/company'

class CompanyPrimitiveTests(unittest.TestCase):
    def test_retirement_guard_rejects_restored_file_old_variant_and_traversal_dependency(self):
        sys.path.insert(0, str(ROOT / 'altool/scripts'))
        import assets
        for relative in ['ui-kit/internal/upstream/ui.css', 'ui-kit/internal/components/runtime.js',
                         'ui-kit/internal/foundations/company-adapter.css', 'ui-kit/internal/patterns/basic/basic.css',
                         'icons/directions/chevron-left.svg']:
            with tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                file = root / 'designs/assets' / relative
                file.parent.mkdir(parents=True)
                file.write_text('retired test fixture')
                with self.assertRaisesRegex(ValueError, 'Retired government UI remains'):
                    assets.validate_company_design(root, {'items': []})
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            variant = {'path': 'designs/assets/ui-kit/internal/company/preview.html', 'dependencies': [], 'legacyOnly': True}
            registry = {'items': [{'id': 'component.button', 'kind': 'component', 'variants': {'company': variant}}]}
            with self.assertRaisesRegex(ValueError, 'Retired UI variant'):
                assets.validate_company_design(root, registry)
            variant.pop('legacyOnly')
            variant['dependencies'] = ['designs/assets/ui-kit/internal/company/../upstream/ui.css']
            with self.assertRaisesRegex(ValueError, 'Retired UI dependency'):
                assets.validate_company_design(root, registry)

    def test_reproducible_company_output(self):
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/build_company_design.py'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_no_official_adapter_or_runtime_dependencies_are_shipped(self):
        registry = json.loads((ROOT / 'designs/assets/registry.json').read_text())
        serialized = json.dumps(registry)
        self.assertIsNone(re.search(r'ui-kit/internal/(upstream|components|foundations|patterns)/', serialized), 'Retired UI path remains in registry')
        self.assertFalse('upstream-markup' in serialized, 'Retired markup remains in registry')
        self.assertFalse('company-adapter.css' in serialized, 'Retired adapter remains in registry')
        for directory in ['upstream', 'components', 'foundations', 'patterns']:
            self.assertFalse((KIT / 'internal' / directory).exists(), directory)

    def test_company_font_scope_and_variable_integrity(self):
        text = (COMPANY / 'dist/company.css').read_text()
        self.assertIn('--krds24-font-family: "Pretendard Variable", Pretendard, system-ui', text)
        self.assertNotIn('@import', text)
        self.assertIsNone(re.search(r'font-size\s*:\s*62\.5%', text))
        self.assertNotIn('company-adapter', text)
        declared = set(re.findall(r'(--[\w-]+)\s*:', text))
        referred = set(re.findall(r'var\((--[\w-]+)', text))
        self.assertFalse(referred - declared, referred - declared)
        self.assertIn('.krds-2024-tokens', text)  # Preserved variable API, not an alternate design.

    def test_company_density_and_touch_contract_replaces_official_19px_button(self):
        text = (KIT / 'design/theme.css').read_text()
        self.assertIn('--krds24-control-height-md: 2.125rem;', text)
        self.assertIn('--krds24-control-height-sm: 1.875rem;', text)
        self.assertIn('--krds24-control-height-lg: 2.625rem;', text)
        self.assertIn('[data-density="compact"]', text)
        self.assertIn('[data-density="comfortable"]', text)
        self.assertRegex(text, r'pointer:\s*coarse')
        self.assertRegex(text, r'--krds24-control-height-md:\s*2.75rem')
        self.assertRegex(text, r'--krds24-radius-control:\s*\.25rem')

if __name__ == '__main__':
    unittest.main()
