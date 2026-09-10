"""Instruction wiring regressions; these do not simulate model compliance."""
from pathlib import Path
import unittest

ROOT = Path(__file__).parents[1]


class WorkflowContractsTests(unittest.TestCase):
    def test_design_measurement_gate_and_server_discovery_are_wired(self):
        for step in ('spec', 'analyze', 'fix', 'browser', 'oneshot', 'freedom'):
            text = (ROOT / f'altool/steps/{step}.md').read_text()
            self.assertIn('디자인 실측 완료 계약', text, step)
        for step in ('analyze', 'browser'):
            text = (ROOT / f'altool/steps/{step}.md').read_text()
            self.assertIn('altool/steps/_server.md', text)
            self.assertNotIn('http://localhost:3000', text)
            self.assertNotIn('http://127.0.0.1:3001', text)
        server = (ROOT / 'altool/steps/_server.md').read_text()
        self.assertIn('baseURL', server)
        self.assertIn('소유권', server)
        self.assertIn('기존 서버는 종료하지 않는다', server)

    def test_command_design_procedures_link_to_shared_owner(self):
        for step in ("oneshot", "freedom", "guide", "design_source", "research"):
            text = (ROOT / f"altool/steps/{step}.md").read_text()
            self.assertIn("altool/standards.md", text, step)
            self.assertIn("탐색·갱신", text, step)
        skill = (ROOT / ".agents/skills/altool/SKILL.md").read_text()
        self.assertNotIn("stale, or lacks", skill)
        self.assertEqual(skill, (ROOT / "templates/codex/skills/altool/SKILL.md").read_text())

    def test_procedures_do_not_restore_top_level_only_design_discovery(self):
        for path in (ROOT / "altool/steps").glob("*.md"):
            text = path.read_text()
            self.assertNotIn("claude-design/*.html", text, path.name)
            self.assertNotIn("designs/*.pen", text, path.name)

    def test_setup_checks_before_mode_choice_and_preserves_legacy_prd_inputs(self):
        text = (ROOT / "altool/steps/setup.md").read_text()
        self.assertLess(text.index("standards.py validate"), text.index("## 모드 판단"))
        self.assertLess(text.index("기존 AGENTS 연결 확인"), text.index("## 모드 판단"))
        self.assertNotIn('또는 `docs/` 폴더가 존재하면', text)
        for step in ("plan", "spec", "run"):
            self.assertIn("docs/00-pm/", (ROOT / f"altool/steps/{step}.md").read_text())
