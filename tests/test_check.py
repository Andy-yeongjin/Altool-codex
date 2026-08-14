from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from argparse import Namespace
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "altool" / "scripts" / "check.py"
SPEC = importlib.util.spec_from_file_location("altool_check", SCRIPT)
assert SPEC and SPEC.loader
check = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(check)


class CheckGateTests(unittest.TestCase):
    def run_gate(self, function, **kwargs):
        output = StringIO()
        with redirect_stdout(output):
            code = function(Namespace(format="json", **kwargs))
        return code, json.loads(output.getvalue())

    def test_contrast_resolves_custom_property_candidates(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            css = root / "app.css"
            css.write_text(
                ":root { --surface: #fffdf8; --accent: #c94f3d; }\n"
                ".button { color: var(--surface); background: var(--accent); }\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.contrast_cmd, root=str(root), minimum=4.5
            )
            self.assertEqual(code, 1)
            self.assertEqual(result["checkedPairs"], 1)
            self.assertIn("4.4241:1", result["failures"][0])

            css.write_text(
                ":root { --surface: #ffffff; --accent: #000000; }\n"
                ".button { color: var(--surface); background: var(--accent); }\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.contrast_cmd, root=str(root), minimum=4.5
            )
            self.assertEqual(code, 0)
            self.assertTrue(result["valid"])

    def test_live_region_contract_requires_implementation_and_assertion(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/02-spec/features").mkdir(parents=True)
            (root / "src").mkdir()
            (root / "tests/e2e").mkdir(parents=True)
            (root / ".altool/state/status.json").write_text(
                json.dumps({"currentFeature": "demo"}), encoding="utf-8"
            )
            (root / "docs/02-spec/features/demo.spec.md").write_text(
                "완료 메시지는 `role=status`와 `aria-live=polite`로 전달한다.",
                encoding="utf-8",
            )
            (root / "src/app.tsx").write_text(
                '<p role="status" aria-live="polite">{message}</p>', encoding="utf-8"
            )

            code, result = self.run_gate(
                check.a11y_contracts_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 1)
            self.assertIn("no automated role=status", result["failures"][0])

            (root / "tests/e2e/demo.spec.ts").write_text(
                'await expect(page.getByRole("status")).toContainText("완료");',
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.a11y_contracts_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 0)
            self.assertEqual(result["testFiles"], ["tests/e2e/demo.spec.ts"])

    def test_analyze_summary_must_match_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/03-analyze").mkdir(parents=True)
            (root / ".altool/state/status.json").write_text(
                json.dumps(
                    {
                        "currentFeature": "demo",
                        "features": {"demo": {"matchRate": 95}},
                    }
                ),
                encoding="utf-8",
            )
            analyze = root / "docs/03-analyze/demo.analyze.md"
            analyze.write_text(
                "> **상태**: Verified\n"
                "> **최종 Match Rate**: 100%\n"
                "> **미해소 갭**: 0건\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.analyze_sync_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 1)
            self.assertIn("match rate mismatch", result["failures"][0])

            analyze.write_text(
                "> **상태**: GapsFound\n"
                "> **최종 Match Rate**: 95%\n"
                "> **미해소 갭**: 2건\n"
                "## Match Rate Summary\n"
                "Overall Match Rate: 90%\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.analyze_sync_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 1)
            self.assertIn("stale Overall Match Rate", result["failures"][0])

            analyze.write_text(
                "> **상태**: GapsFound\n"
                "> **최종 Match Rate**: 95%\n"
                "> **미해소 갭**: 2건\n"
                "## 최초 Match Rate Summary\n"
                "Overall Match Rate: 90%\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.analyze_sync_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 0)
            self.assertTrue(result["valid"])

    def test_step_checks_require_new_gate_evidence(self):
        data = {
            "schemaVersion": 1,
            "feature": "demo",
            "step": "browser",
            "checks": {
                key: {"status": "done", "evidence": ["verified"]}
                for key in check.BROWSER_REQUIRED
            },
        }
        self.assertEqual(check.validate_check(data), [])
        del data["checks"]["visual.contrast"]
        self.assertIn(
            "browser.visual.contrast: missing required check",
            check.validate_check(data),
        )

    def test_browser_cannot_bypass_gate_with_failed_or_arbitrary_skip(self):
        data = {
            "schemaVersion": 1,
            "feature": "demo",
            "step": "browser",
            "checks": {
                key: {"status": "done", "evidence": ["verified"]}
                for key in check.BROWSER_REQUIRED
            },
        }
        data["checks"]["visual.contrast"] = {
            "status": "failed",
            "reason": "contrast below threshold",
        }
        self.assertIn(
            "browser.visual.contrast: browser completion cannot contain failed checks",
            check.validate_check(data),
        )

        data["checks"]["visual.contrast"] = {
            "status": "skipped",
            "reason": "tool unavailable",
        }
        self.assertIn(
            "browser.visual.contrast: browser completion requires a passing gate",
            check.validate_check(data),
        )

        data["checks"]["visual.contrast"] = {
            "status": "skipped",
            "reason": "no css files",
        }
        self.assertEqual(check.validate_check(data), [])

        data["checks"]["visual.contrast"] = {
            "status": "done",
            "evidence": ["verified"],
        }
        data["checks"]["inputs.loaded"] = {
            "status": "failed",
            "reason": "missing inputs",
        }
        failures = check.validate_check(data)
        self.assertIn(
            "browser.inputs.loaded: browser completion cannot contain failed checks",
            failures,
        )

    def test_analyze_and_fix_require_semantic_sync_to_pass(self):
        for step, required in (
            ("analyze", check.ANALYZE_REQUIRED),
            ("fix", check.FIX_REQUIRED),
        ):
            data = {
                "schemaVersion": 1,
                "feature": "demo",
                "step": step,
                "checks": {
                    key: {"status": "done", "evidence": ["verified"]}
                    for key in required
                },
            }
            data["checks"]["analysis.semantic_consistency"] = {
                "status": "failed",
                "reason": "mismatch",
            }
            self.assertIn(
                f"{step}.analysis.semantic_consistency: completion requires status=done",
                check.validate_check(data),
            )


if __name__ == "__main__":
    unittest.main()
