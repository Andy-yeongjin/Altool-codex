"""Toolbar source contract; interaction and geometry require browser verification."""
from pathlib import Path
import unittest

BASE = Path(__file__).resolve().parents[1] / 'designs/assets/ui-kit'


class TableToolbarTests(unittest.TestCase):
    def test_neutral_wrapping_toolbar(self):
        css = (BASE / 'design/components.css').read_text()
        rule = css.split('.altool-ui .ui-table-toolbar {')[1].split('}')[0]
        self.assertIn('background:transparent;border:0;', rule)
        self.assertIn('flex-wrap:wrap;', rule)
        self.assertIn('.ui-table-selection', css)

    def test_optional_count_and_documented_owner(self):
        js = (BASE / 'internal/company/js/business.js').read_text()
        self.assertIn('if(count)count.textContent=', js)
        docs = (BASE / 'internal/company/docs/BUSINESS-USAGE.md').read_text()
        self.assertIn('여러 페이지의 선택을 앱이 소유하면', docs)

    def test_grouped_summary_and_actions(self):
        css = (BASE / 'design/components.css').read_text()
        html = (BASE / 'internal/company/examples/business-body.html').read_text()
        self.assertIn('.ui-table-selection-summary { display:flex;flex-direction:column;', css)
        self.assertIn('.ui-table-selection-help { margin:0;', css)
        self.assertIn('@media(max-width:600px)', css)
        self.assertIn('class="ui-table-selection-actions"', html)
        self.assertIn('role="status"></span><p class="ui-table-selection-help">', html)


if __name__ == '__main__':
    unittest.main()
