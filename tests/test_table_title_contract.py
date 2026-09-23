"""Common table routing and example contract regression (not browser proof)."""
import json
from pathlib import Path
import unittest

BASE = Path(__file__).resolve().parents[1] / 'designs/assets'


class TableTitleContractTests(unittest.TestCase):
    def test_active_table_guidance_contains_title_contract(self):
        item = next(x for x in json.loads((BASE / 'registry.json').read_text())['items']
                    if x['id'] == 'component.table')
        source = BASE.parents[1] / item['guidance']['source']
        self.assertEqual(item['guidance']['section'], 'search')
        self.assertIn('V27-S04:', source.read_text())
        self.assertIn('caption은 sr-only', source.read_text())

    def test_registered_example_has_external_title_and_hidden_caption(self):
        html = (BASE / 'ui-kit/internal/company/tables-preview.html').read_text()
        self.assertIn('<h2 id="example-title" class="ui-section-title">부서별 예산 현황</h2>', html)
        self.assertIn('<caption class="sr-only">부서별 예산 현황</caption>', html)
        self.assertIn('aria-labelledby="example-title" aria-describedby="example-description"', html)
        self.assertLess(html.index('<h2 id="example-title"'), html.index('<table id="example"'))


if __name__ == '__main__':
    unittest.main()
