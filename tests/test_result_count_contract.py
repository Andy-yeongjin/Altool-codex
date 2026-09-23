from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ResultCountContractTest(unittest.TestCase):
    def test_count_in_heading_and_scope_contract(self):
        guidance = (ROOT / 'designs/assets/guidance/company-ui.md').read_text()
        examples = (ROOT / 'designs/assets/ui-kit/internal/company/docs/PAGE-PATTERNS.md').read_text()
        self.assertIn('현재 페이지 행 수·선택 건수와 구분', guidance)
        self.assertIn('로딩·실패를 0건으로 표시하지 않는다', guidance)
        self.assertIn('조회 결과 <span role="status" aria-atomic="true">· 총 4건</span></h2>', examples)
        self.assertNotIn('<p role="status" id="result-summary">', examples)
