from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DataTopBorderTest(unittest.TestCase):
    def test_single_owner_contract(self):
        css = (ROOT / 'designs/assets/ui-kit/design/components.css').read_text()
        self.assertIn('.ui-detail-grid { margin:0;gap:0;border-top:var(--company-data-top-width) solid var(--company-data-top-color)', css)
        self.assertIn('.ui-table-scroll { overflow:auto;border:1px solid #CBD1D8;border-top:0;', css)
        self.assertIn('+ :not(.ui-section) .ui-table-scroll, + .ui-summary, + .ui-data-state, + .ui-metric-group) { border-bottom-color:transparent;', css)
        self.assertIn('.altool-ui table { border-top:var(--company-data-top-width) solid var(--company-data-top-color); }', css)
