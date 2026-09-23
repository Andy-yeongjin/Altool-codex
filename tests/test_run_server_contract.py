"""Run verification must be reachable without weakening UI evidence gates."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class RunServerContractTest(unittest.TestCase):
    def test_run_allows_verification_and_keeps_final_browser(self):
        run = (ROOT / 'altool/steps/run.md').read_text()
        template = (ROOT / 'altool/templates/run.template.md').read_text()
        for text in (run, template):
            self.assertNotIn('서버는 직접 실행하지 않고', text)
            self.assertIn('altool/steps/_server.md', text)
            self.assertIn('server.cleanup', text)
        self.assertIn('후속 독립 Analyze와 최종 Browser를 대체하지 않는다', run)

    def test_shared_lifecycle_preserves_ownership(self):
        server = (ROOT / 'altool/steps/_server.md').read_text()
        self.assertIn('Run과 Browser', server)
        self.assertIn('managedServer=true', server)
        self.assertIn('기존 프로젝트 서버를 재사용하면 `managedServer=false`이며 종료하지 않는다', server)
        self.assertIn('성공·실패·중단 여부와 관계없이', server)
        self.assertIn('Analyze는 직접 시작하지 않고', server)
        self.assertIn('`_server.md`의 공통 규칙', (ROOT / 'altool/steps/browser.md').read_text())


if __name__ == '__main__':
    unittest.main()
