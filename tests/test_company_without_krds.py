"""The company pack installs and resolves without the retired source corpus.

These are packaging and contract checks, not browser or visual certification.
"""
import contextlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unicodedata
import unittest

ROOT = Path(__file__).resolve().parents[1]
INTERNAL = 'designs/assets/ui-kit/internal'
sys.path.insert(0, str(ROOT / 'altool/scripts'))
import assets
import standards


class CompanyWithoutSourceTests(unittest.TestCase):
    def assert_source_absent(self, root):
        for name in ['reference', 'coverage.json', 'source-review.json',
                     'QA8-OBSERVATIONS.json', 'QA8-VERIFICATION.md', 'VERIFICATION.md']:
            self.assertFalse((root / INTERNAL / name).exists(), name)
        source_name = '디지털 정부서비스 UIUX 가이드라인(2024.02).pdf'
        self.assertFalse(any(unicodedata.normalize('NFC', path.name) == source_name
                             for path in (root / 'guides').glob('*.pdf')))

    def test_product_has_no_source_corpus_or_source_only_catalog_entries(self):
        self.assert_source_absent(ROOT)
        records = json.loads((ROOT / 'designs/assets/catalog.json').read_text())['assets']
        self.assertTrue(records)
        self.assertTrue(any('/company/' in item['path'] for item in records))
        for item in records:
            self.assertNotEqual(item.get('category'), 'guideline', item['id'])
            self.assertNotIn('/reference/', item['path'], item['id'])
            self.assertTrue((ROOT / 'designs/assets' / item['path']).is_file(), item['id'])

    def test_fresh_install_loads_and_resolves_company_contracts_without_raw_references(self):
        with tempfile.TemporaryDirectory() as directory, contextlib.redirect_stdout(io.StringIO()):
            target = Path(directory)
            standards.install(ROOT, target)
            self.assert_source_absent(target)
            registry, lock = assets.load(target)
            self.assertTrue(registry['items'])
            for item in registry['items']:
                with self.subTest(id=item['id']):
                    guidance = item['guidance']
                    self.assertEqual(guidance['references'], [])
                    self.assertIn(guidance['source'], lock['files'])
                    record = assets.guidance_record(target, guidance)
                    self.assertEqual(record['authority'], 'company-contract')
                    self.assertTrue(record['rules'])
                    self.assertEqual((target / guidance['source']).read_bytes(),
                                     (ROOT / guidance['source']).read_bytes())
            for identifier in ['icon.settings', 'component.in-page-navigation', 'service.authentication']:
                selected = assets.resolve(target, identifier)
                self.assertEqual(selected['id'], identifier)
                self.assertTrue((target / selected['path']).is_file())
                self.assertTrue(selected['guidance']['rules'])
            for name in ['ATTRIBUTION.md', 'licenses/Pretendard-OFL.txt', 'licenses/Swiper-MIT.txt']:
                self.assertEqual((target / INTERNAL / name).read_bytes(),
                                 (ROOT / INTERNAL / name).read_bytes())
            found = subprocess.run([sys.executable, str(ROOT / 'altool/scripts/assets.py'),
                                    '--root', str(target), 'find', '--kind', 'component'],
                                   capture_output=True, text=True)
            self.assertEqual(found.returncode, 0, found.stdout + found.stderr)
            self.assertIn('component.in-page-navigation', found.stdout)
            self.assertNotIn('/reference/', found.stdout)


if __name__ == '__main__':
    unittest.main()
