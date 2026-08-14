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
    ROOT = Path(__file__).parents[1]

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

    def test_contrast_skips_ambiguous_theme_tokens_and_gradients(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "app.css").write_text(
                ":root { --bg: #ffffff; --fg: #111111; }\n"
                '[data-theme="dark"] { --bg: #111111; --fg: #ffffff; }\n'
                ".card { color: var(--fg); background: var(--bg); }\n"
                ".hero { color: #ffffff; background: linear-gradient(#000, #fff); }\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.contrast_cmd, root=str(root), minimum=4.5
            )
            self.assertEqual(code, 0)
            self.assertEqual(result["checkedPairs"], 0)
            self.assertEqual(result["ambiguousRules"], 2)

    def test_contrast_scans_runtime_html_but_excludes_design_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "designs").mkdir()
            (root / "designs/reference.css").write_text(
                ".reference { color: #fff; background: #fff; }", encoding="utf-8"
            )
            (root / "index.html").write_text(
                "<style>\n"
                ".runtime { color: #fff; background: #fff; }\n"
                ".token { color: var(--missing); }\n"
                "</style>",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.contrast_cmd, root=str(root), minimum=4.5
            )
            self.assertEqual(code, 1)
            self.assertEqual(result["files"], 1)
            self.assertEqual(len(result["failures"]), 1)
            self.assertIn("index.html:2", result["failures"][0])

            code, result = self.run_gate(check.css_vars_cmd, root=str(root))
            self.assertEqual(code, 1)
            self.assertEqual(result["files"], 1)
            self.assertEqual(
                result["failures"],
                ["index.html:3: --missing is referenced with var() but never defined"],
            )

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

    def test_live_region_ignores_negative_contract_and_non_runtime_designs(self):
        positive = (
            "완료 메시지는 role=status로 전달하되 시각적 토스트 애니메이션은 제외한다."
        )
        self.assertEqual(check.live_region_contract_lines(positive), [positive])

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/02-spec/features").mkdir(parents=True)
            (root / "designs/claude-design").mkdir(parents=True)
            (root / ".altool/state/status.json").write_text(
                json.dumps({"currentFeature": "demo"}), encoding="utf-8"
            )
            (root / "docs/02-spec/features/demo.spec.md").write_text(
                "이 화면에서는 aria-live를 사용하지 않는다.", encoding="utf-8"
            )
            (root / "designs/claude-design/mock.html").write_text(
                '<p role="status">mock</p>', encoding="utf-8"
            )
            code, result = self.run_gate(
                check.a11y_contracts_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 0)
            self.assertFalse(result["applicable"])
            self.assertEqual(result["implementationFiles"], [])

    def test_live_region_recognizes_e2e_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/02-spec/features").mkdir(parents=True)
            (root / "src").mkdir()
            (root / "e2e").mkdir()
            (root / ".altool/state/status.json").write_text(
                json.dumps({"currentFeature": "demo"}), encoding="utf-8"
            )
            (root / "docs/02-spec/features/demo.spec.md").write_text(
                "완료 메시지는 role=status로 전달한다.", encoding="utf-8"
            )
            (root / "src/app.tsx").write_text(
                '<p role="status">{message}</p>', encoding="utf-8"
            )
            (root / "e2e/demo.e2e.ts").write_text(
                'await expect(page.getByRole("status")).toBeVisible();', encoding="utf-8"
            )
            code, result = self.run_gate(
                check.a11y_contracts_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 0)
            self.assertEqual(result["testFiles"], ["e2e/demo.e2e.ts"])

    def test_analyze_summary_must_match_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/03-analyze").mkdir(parents=True)
            (root / ".altool/state/status.json").write_text(
                json.dumps(
                    {
                        "currentFeature": "demo",
                        "matchRate": 20,
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

    def test_analyze_sync_accepts_legacy_top_level_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/03-analyze").mkdir(parents=True)
            (root / ".altool/state/status.json").write_text(
                json.dumps(
                    {
                        "currentFeature": "demo",
                        "phase": "check",
                        "matchRate": 95,
                    }
                ),
                encoding="utf-8",
            )
            (root / "docs/03-analyze/demo.analyze.md").write_text(
                "> **상태**: GapsFound\n"
                "> **최종 Match Rate**: 95%\n"
                "> **미해소 갭**: 2건\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.analyze_sync_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 0)
            self.assertEqual(result["stateMatchRateSource"], "matchRate")

    def test_analyze_sync_reports_invalid_optional_features_shape(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / ".altool/state").mkdir(parents=True)
            (root / "docs/03-analyze").mkdir(parents=True)
            (root / ".altool/state/status.json").write_text(
                json.dumps(
                    {
                        "currentFeature": "demo",
                        "features": [],
                        "matchRate": 100,
                    }
                ),
                encoding="utf-8",
            )
            (root / "docs/03-analyze/demo.analyze.md").write_text(
                "> **상태**: Analyzed\n"
                "> **최종 Match Rate**: 100%\n"
                "> **미해소 갭**: 0건\n",
                encoding="utf-8",
            )
            code, result = self.run_gate(
                check.analyze_sync_cmd, root=str(root), feature=None
            )
            self.assertEqual(code, 1)
            self.assertIn("status.json.features must be an object", result["failures"])

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
            "status": "skipped",
            "reason": "gate crashed, pretend no css files",
        }
        self.assertIn(
            "browser.visual.contrast: browser completion requires a passing gate",
            check.validate_check(data),
        )

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

    def test_freedom_cannot_bypass_failed_or_arbitrary_skipped_gates(self):
        data = {
            "schemaVersion": 1,
            "feature": "demo",
            "step": "freedom",
            "checks": {
                key: {"status": "done", "evidence": ["verified"]}
                for key in check.FREEDOM_REQUIRED
            },
        }
        legitimate_skips = {
            "lesson.search": "no implementation action",
            "event.capture": "no code event",
            "docs.synced": "no feature docs",
            "document.status": "no document status",
            "report.required": "user-limited cycle",
            "lesson.capture": "no code event",
            "visual.reference_comparison": "no browser action",
            "visual.css_custom_properties": "no browser action",
            "visual.contrast": "no browser action",
            "accessibility.live_region": "no browser action",
            "functional.time_precision": "no browser action",
            "analysis.semantic_consistency": "no analyze action",
            "server.cleanup": "no browser action",
        }
        for item, reason in legitimate_skips.items():
            data["checks"][item] = {"status": "skipped", "reason": reason}
        self.assertEqual(check.validate_check(data), [])

        data["checks"]["visual.contrast"] = {
            "status": "failed",
            "reason": "contrast below threshold",
        }
        self.assertIn(
            "freedom.visual.contrast: freedom completion cannot contain failed checks",
            check.validate_check(data),
        )

        data["checks"]["visual.contrast"] = {
            "status": "skipped",
            "reason": "no browser action",
        }
        self.assertEqual(check.validate_check(data), [])

        data["checks"]["visual.contrast"] = {
            "status": "skipped",
            "reason": "ignored because no browser action was attempted",
        }
        self.assertIn(
            "freedom.visual.contrast: freedom completion requires a passing gate",
            check.validate_check(data),
        )

    def test_unknown_step_is_rejected_after_normalization(self):
        data = {
            "schemaVersion": 1,
            "feature": "demo",
            "step": "browser2",
            "checks": {
                key: {"status": "done", "evidence": ["verified"]}
                for key in check.COMMON_REQUIRED
            },
        }
        self.assertIn("root.step: unknown step 'browser2'", check.validate_check(data))

        data["step"] = " Browser "
        data["checks"] = {
            key: {"status": "done", "evidence": ["verified"]}
            for key in check.BROWSER_REQUIRED
        }
        self.assertEqual(check.validate_check(data), [])
        data["checks"]["visual.contrast"] = {
            "status": "failed",
            "reason": "contrast below threshold",
        }
        self.assertIn(
            "browser.visual.contrast: browser completion cannot contain failed checks",
            check.validate_check(data),
        )

    def test_workflow_docs_match_gate_contracts(self):
        oneshot = (self.ROOT / "altool/steps/oneshot.md").read_text(encoding="utf-8")
        browser = (self.ROOT / "altool/steps/browser.md").read_text(encoding="utf-8")
        report = (self.ROOT / "altool/steps/report.md").read_text(encoding="utf-8")
        analyze_template = (
            self.ROOT / "altool/templates/analyze.template.md"
        ).read_text(encoding="utf-8")
        fix_template = (self.ROOT / "altool/templates/fix.template.md").read_text(
            encoding="utf-8"
        )

        self.assertIn("skipped(no browser issue)", oneshot)
        self.assertNotIn("E-.../skipped(no issue)", oneshot)
        self.assertIn("analyze는 `GapsFound` 유지", browser)
        self.assertIn("analyze 문서는 `GapsFound`를 유지", report)
        for key in (
            "visual.contrast",
            "accessibility.live_region",
            "functional.time_precision",
            "analysis.semantic_consistency",
        ):
            self.assertIn(key, analyze_template)
            self.assertIn(key, fix_template)


if __name__ == "__main__":
    unittest.main()
