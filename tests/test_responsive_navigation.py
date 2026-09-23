import json
import hashlib
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ResponsiveNavigationTest(unittest.TestCase):
    def test_shared_navigation_distribution(self):
        company = ROOT / 'designs/assets/ui-kit/internal/company'
        runtime = (company / 'dist/business.js').read_text()
        icons = json.loads(re.search(r'const builtinIcons = (.*);', runtime).group(1))
        self.assertEqual(icons['menu']['tag'], 'svg')
        self.assertIn('responsiveNavigation,decorateButtons', runtime)
        css = (company / 'dist/company.css').read_text()
        self.assertIn('.ui-responsive-navigation nav', css)
        self.assertIn('rgba(24,51,79,.56)', css)
        mock = (ROOT / 'office-mockups/mockups.js').read_text()
        self.assertIn('B.responsiveNavigation(app)', mock)
        self.assertNotIn('matchMedia', mock)

    def test_company_identity_is_bundled_from_one_source(self):
        kit = ROOT / 'designs/assets/ui-kit'
        config = json.loads((kit / 'design/company.json').read_text())
        runtime = (kit / 'internal/company/dist/business.js').read_text()
        bundled = json.loads(re.search(r'const companyIdentity = (.*);', runtime).group(1))
        self.assertEqual(config, bundled)
        versions = json.loads(re.search(r'const companyCiVersions = (.*);', runtime).group(1))
        for path in config['ci'].values():
            expected = hashlib.sha256((ROOT / 'designs/assets' / path).read_bytes()).hexdigest()[:16]
            self.assertEqual(versions[path], expected)
        self.assertIn("url.searchParams.set('v',companyCiVersions[path])", runtime)
        self.assertEqual(config['name'], 'Altool')
        for path in config['ci'].values():
            self.assertTrue((ROOT / 'designs/assets' / path).is_file())
        generator = (ROOT / 'scripts/build-office-mockups.mjs').read_text()
        self.assertNotIn('내선 1234', generator)
        self.assertNotIn('© Altool', generator)
        self.assertIn('data-company-ci', generator)
        mock = (ROOT / 'office-mockups/mockups.js').read_text()
        self.assertIn('B.companyFrame(app', mock)
        self.assertNotIn('classList.toggle', mock)


if __name__ == '__main__':
    unittest.main()
