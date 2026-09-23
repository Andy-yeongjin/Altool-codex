"""Approved common table contract, including layered/standalone outputs."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'designs/assets/ui-kit'


class TableAlignmentTests(unittest.TestCase):
    def test_table_blocks_use_center_and_header_only_background(self):
        css = (BASE / 'design/components.css').read_text()
        blocks = css.split('/* A table:')[1:]
        self.assertEqual(len(blocks), 2)
        for block in blocks:
            rule = block.split('.altool-ui table th, .altool-ui table td {')[1].split('}')[0]
            self.assertIn('text-align:center', rule)
            rule = block.split('.altool-ui table th {')[1].split('}')[0]
            self.assertIn('background:transparent', rule)
            self.assertIn('.altool-ui table thead th { background:var(--company-table-header-bg); }', block)
            self.assertIn('tbody tr:nth-child(even)>:is(th,td)', block)

    def test_business_number_rule_has_table_override(self):
        css = (BASE / 'design/components.css').read_text()
        block = css.split('.altool-ui .ui-number { text-align:right;')[1]
        self.assertIn('.altool-ui table :is(th,td).ui-number { text-align:center; }', block)
        guidance = (ROOT / 'designs/assets/guidance/company-ui.md').read_text()
        self.assertIn('V27-S05:', guidance.split('<a id="search"></a>')[1].split('<a id="navigation"></a>')[0])


if __name__ == '__main__':
    unittest.main()
