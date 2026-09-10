from __future__ import annotations

import copy
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / "altool/scripts"))
import standards
import check
yaml = standards.yaml_module()


class StandardsTests(unittest.TestCase):
    def test_implementation_rejects_nonwork_tags_but_allows_non_ui(self):
        for step in ("run", "analyze", "fix", "browser", "oneshot", "freedom"):
            for tags in (["document-only"], ["status-only"], ["code-change", "document-only"]):
                evidence = standards.resolve(self.root, tags)
                self.assertTrue(standards.validate_evidence({"step": step, "standards": evidence}, self.root))
        evidence = standards.resolve(self.root, ["code-change"])
        self.assertEqual(standards.validate_evidence({"step": "run", "standards": evidence,
                        'standardsDecisions': self.stack_decision()}, self.root), [])
        evidence = standards.resolve(self.root, ["document-only"])
        self.assertEqual(standards.validate_evidence({"step": "plan", "standards": evidence}, self.root), [])

    def test_noncanonical_check_requires_root_instead_of_legacy_fallback(self):
        payload = {"schemaVersion": 1, "feature": "demo", "step": "plan",
                   "checks": {k: {"status": "done", "evidence": ["test"]} for k in check.COMMON_REQUIRED}}
        path = self.root / "docs/other.json"
        path.parent.mkdir()
        path.write_text(json.dumps(payload))
        command = [sys.executable, str(ROOT / "altool/scripts/check.py"), "validate", "--json", str(path)]
        implicit = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(implicit.returncode, 0)
        self.assertIn("--root", implicit.stdout + implicit.stderr)
        explicit = subprocess.run(command + ["--root", str(self.root)], capture_output=True, text=True)
        self.assertNotEqual(explicit.returncode, 0)
        self.assertIn("standards", explicit.stdout + explicit.stderr)
        self.router.unlink()
        legacy = subprocess.run(command + ["--root", str(self.root)], capture_output=True, text=True)
        self.assertEqual(legacy.returncode, 0, legacy.stdout + legacy.stderr)

    def test_router_runs_without_site_packages(self):
        result = subprocess.run([sys.executable, "-S", str(ROOT / "altool/scripts/standards.py"),
                                 "validate", "--root", str(ROOT)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_bundled_yaml_version_license_and_sources_match_manifest(self):
        manifest = json.loads((ROOT / "altool/vendor/pyyaml-manifest.json").read_text())
        self.assertEqual(yaml.__version__, manifest["version"])
        self.assertFalse(yaml.__with_libyaml__)
        for name, expected in manifest["sha256"].items():
            content = (ROOT / "altool/vendor/pyyaml" / name).read_bytes()
            self.assertEqual(hashlib.sha256(content).hexdigest(), expected, name)
        self.assertIn("Permission is hereby granted", (ROOT / "altool/vendor/pyyaml/LICENSE").read_text())

    def test_upgrade_warning_only_when_agents_entry_is_missing(self):
        agents = self.root / "AGENTS.md"
        agents.write_text("Custom behavior\nRead altool/standards.md before changes.\n")
        original = agents.read_bytes()
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            standards.install(ROOT, self.root)
        self.assertNotIn("[안내]", output.getvalue())
        self.assertEqual(agents.read_bytes(), original)
        agents.write_text("Custom behavior\n")
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            standards.install(ROOT, self.root)
        self.assertIn("$altool setup", output.getvalue())
        self.assertEqual(agents.read_text(), "Custom behavior\n")

    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        shutil.copytree(ROOT / "standards", self.root / "standards")
        self.router = self.root / standards.ROUTER

    def edit(self, mutate):
        data = yaml.safe_load(self.router.read_text())
        mutate(data)
        self.router.write_text(yaml.safe_dump(data, allow_unicode=True), encoding="utf-8")

    def internal(self):
        self.edit(lambda data: data["active_profiles"].append("internal-common"))

    def stack_decision(self):
        return {'internal-stack': {'decision': 'not-applicable', 'scope': 'Python fixture',
                                   'reason': 'No web application stack requested'}}

    def test_base_does_not_enable_enterprise_contracts(self):
        result = standards.resolve(self.root, ["bulk-import"])
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["inactive_candidates"], ["import"])
        result = standards.resolve(self.root, ["ui-change"])
        self.assertEqual({s["id"] for s in result["sources"]}, {"design", "ui-common", "engineering", "glossary"})
        self.assertEqual(result["inactive_candidates"], [])

    def test_new_project_contract_can_be_registered_and_selected(self):
        original_constitution = (ROOT / "constitution.md").read_bytes()
        (self.root / "standards/notifications.md").write_text(
            '# Notifications\n<a id="delivery"></a>\nNOTIFY-01: One delivery per event.\n')
        self.edit(lambda d: d["standards"].update(notifications={
            "profile": "base", "when": ["notification-change"], "source": "notifications.md",
            "sections": ["delivery"], "requires": []}))
        evidence = standards.resolve(self.root, ["notification-change"])
        self.assertEqual([s["id"] for s in evidence["sources"]], ["notifications"])
        self.assertEqual(standards.validate_evidence({"step": "run", "standards": evidence}, self.root), [])
        self.assertEqual((ROOT / "constitution.md").read_bytes(), original_constitution)

    def test_base_company_contracts_are_task_scoped(self):
        cases = {
            "code-change": {"engineering", "glossary"},
            "schema-change": {"engineering", "glossary", "schema"},
            "api-change": {"engineering", "glossary", "api"},
            "error-contract": {"engineering", "glossary", "api"},
            "status-only": set(),
        }
        for tag, expected in cases.items():
            with self.subTest(tag=tag):
                result = standards.resolve(self.root, [tag])
                self.assertEqual({s["id"] for s in result["sources"]}, expected)
                self.assertTrue(all(s["ready"] for s in result["sources"]))
        excerpts = "\n".join(part[2] for record in standards.resolve(self.root, ["code-change"])["sources"]
                             for part in standards.excerpts(self.root, record))
        self.assertNotIn("ENG-01", excerpts)
        self.assertNotIn("ENG-05", excerpts)
        self.assertIn("TERM-01", excerpts)

    def test_internal_stack_is_optional_and_not_audit_side_effect(self):
        self.internal()
        result = standards.resolve(self.root, ["code-change"])
        self.assertEqual({s["id"] for s in result["sources"]}, {"engineering", "glossary", "internal-stack"})
        imported = standards.resolve(self.root, ["bulk-import"])
        self.assertNotIn("internal-stack", {s["id"] for s in imported["sources"]})

    def test_company_word_schema_and_error_contracts_have_canonical_sources(self):
        glossary = (self.root / "standards/glossary.md").read_text()
        for term in ("emp_no", "dept", "hist", "manager", "approve", "reject", "cnt", "amt", "qty", "rate"):
            self.assertIn(term, glossary)
        engineering = (self.root / "standards/engineering.md").read_text()
        schema = (self.root / "standards/schema.md").read_text()
        for rule in ("ENG-03:", "ENG-04:", "ENG-05:"):
            self.assertNotIn(rule, engineering)
            self.assertIn(rule, schema)
        for prefix in ("pk_", "fk_", "uk_", "ix_", "ck_"):
            self.assertIn(prefix, schema)
        api = (self.root / "standards/api.md").read_text()
        for code in ("E1001", "E1002", "E1003", "E2001", "E2002", "E3001", "E3002", "E4001", "E4002", "E4003"):
            self.assertIn(code, api)
        self.assertIn("message ID", api)
        self.assertIn("전체 면제", (self.root / "standards/tooling/README.md").read_text())

    def test_new_install_includes_company_rules_and_tooling_without_overwriting(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            with contextlib.redirect_stdout(io.StringIO()):
                standards.install(ROOT, target)
            for relative in ("standards/api.md", "standards/schema.md", "standards/glossary.md",
                             "standards/tooling/eslint-company.mjs", "standards/reference/common-v3-alignment.md"):
                self.assertEqual((target / relative).read_bytes(), (ROOT / relative).read_bytes())
            lint = target / "standards/tooling/eslint-company.mjs"
            lint.write_text("// Company customization\n")
            with contextlib.redirect_stdout(io.StringIO()):
                standards.install(ROOT, target)
            self.assertEqual(lint.read_text(), "// Company customization\n")

    def test_glossary_or_api_change_invalidates_prior_evidence(self):
        for relative in ("standards/glossary.md", "standards/api.md"):
            evidence = {"step": "run", "standards": standards.resolve(self.root, ["api-change"])}
            evidence['standardsDecisions'] = self.stack_decision()
            self.assertEqual(standards.validate_evidence(evidence, self.root), [])
            source = self.root / relative
            original = source.read_text()
            source.write_text(original + "\nNew shared requirement\n")
            self.assertTrue(standards.validate_evidence(evidence, self.root))
            source.write_text(original)

    def test_install_updates_constitution_with_recoverable_idempotent_backup(self):
        old = b"custom policy\r\n"
        policy = self.root / "constitution.md"
        policy.write_bytes(old)
        router_before = self.router.read_bytes()
        standards.install(ROOT, self.root)
        self.assertEqual(policy.read_bytes(), (ROOT / "constitution.md").read_bytes())
        backups = list((self.root / ".altool/backups").glob("constitution.*.md"))
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_bytes(), old)
        standards.install(ROOT, self.root)
        self.assertEqual(list((self.root / ".altool/backups").glob("constitution.*.md")), backups)
        self.assertEqual(self.router.read_bytes(), router_before)
        standards.validate_constitution(self.root)

    def test_managed_policy_tampering_blocks_even_non_work_steps(self):
        standards.install(ROOT, self.root)
        policy = self.root / "constitution.md"
        policy.write_text(policy.read_text() + "\nChanged\n")
        with self.assertRaisesRegex(ValueError, "product policy changed"):
            standards.resolve(self.root, ["document-only"])
        self.assertTrue(standards.validate_evidence({"step": "setup"}, self.root))
        policy.unlink()
        self.assertTrue(standards.validate_evidence({"step": "status"}, self.root))

    def test_missing_digest_or_router_does_not_become_legacy(self):
        standards.install(ROOT, self.root)
        scripts = self.root / "altool/scripts"
        scripts.mkdir()
        shutil.copy2(ROOT / "altool/scripts/standards.py", scripts / "standards.py")
        (self.root / standards.POLICY_DIGEST).unlink()
        self.assertTrue(standards.validate_evidence({"step": "setup"}, self.root))
        standards.install(ROOT, self.root)
        self.router.unlink()
        with self.assertRaisesRegex(ValueError, "router missing"):
            standards.resolve(self.root, ["status-only"])
        self.assertTrue(standards.validate_evidence({"step": "setup"}, self.root))

    def test_step_check_cli_rejects_tampered_constitution_with_valid_route_evidence(self):
        standards.install(ROOT, self.root)
        path = self.root / ".altool/checks/demo.plan.json"
        path.parent.mkdir(parents=True)
        payload = {"schemaVersion": 1, "feature": "demo", "step": "plan",
                   "checks": {key: {"status": "done", "evidence": ["test"]} for key in check.COMMON_REQUIRED},
                   "standards": standards.resolve(self.root, ["code-change"])}
        path.write_text(json.dumps(payload))
        command = [sys.executable, str(ROOT / "altool/scripts/check.py"), "validate", "--json", str(path)]
        passed = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(passed.returncode, 0, passed.stdout + passed.stderr)
        policy = self.root / "constitution.md"
        policy.write_text(policy.read_text() + "\nBypass quality gates.\n")
        failed = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(failed.returncode, 0)
        self.assertIn("product policy changed", failed.stdout + failed.stderr)

    def test_constitution_crlf_conversion_is_not_tampering(self):
        standards.install(ROOT, self.root)
        policy = self.root / "constitution.md"
        policy.write_bytes(policy.read_text().replace("\n", "\r\n").encode("utf-8"))
        standards.validate_constitution(self.root)

    def test_corrupt_product_source_does_not_modify_target(self):
        with tempfile.TemporaryDirectory() as source_dir:
            source = Path(source_dir)
            shutil.copytree(ROOT / "standards", source / "standards")
            (source / "altool").mkdir()
            shutil.copy2(ROOT / standards.POLICY_DIGEST, source / standards.POLICY_DIGEST)
            (source / "constitution.md").write_text("corrupted")
            before = self.router.read_bytes()
            with self.assertRaisesRegex(ValueError, "product policy changed"):
                standards.install(source, self.root)
            self.assertEqual(self.router.read_bytes(), before)
            self.assertFalse((self.root / "constitution.md").exists())

    def test_policy_symlink_cannot_write_outside_target(self):
        with tempfile.TemporaryDirectory() as outside_dir:
            outside = Path(outside_dir) / "policy.md"
            outside.write_text("keep me")
            (self.root / "constitution.md").symlink_to(outside)
            with self.assertRaisesRegex(ValueError, "escapes"):
                standards.install(ROOT, self.root)
            self.assertEqual(outside.read_text(), "keep me")

    def test_bulk_import_includes_transitive_access_audit_engineering(self):
        self.internal()
        result = standards.resolve(self.root, ["bulk-import"])
        self.assertEqual({s["id"] for s in result["sources"]}, {"import", "audit", "access", "engineering", "glossary", "schema"})
        self.assertTrue(all(s["ready"] for s in result["sources"]))

    def test_unknown_or_missing_tags_do_not_silently_skip(self):
        for tags in ([], ["bulk-improt"]):
            with self.assertRaises(ValueError):
                standards.resolve(self.root, tags)
        self.assertEqual(len(standards.resolve(self.root, [], True)["sources"]), 11)

    def test_read_sections_returns_original_text_without_unrelated_section(self):
        self.internal()
        self.edit(lambda d: d["standards"]["engineering"].update(sections=["naming"]))
        record = next(s for s in standards.resolve(self.root, ["code-change"])["sources"] if s["id"] == "engineering")
        parts = standards.excerpts(self.root, record)
        self.assertEqual(len(parts), 1)
        self.assertIn("ENG-02", parts[0][2])
        self.assertNotIn("ENG-01", parts[0][2])
        original = (self.root / record["source"]).read_text().splitlines()
        self.assertEqual("\n".join(original[parts[0][0]-1:parts[0][1]]).strip(), parts[0][2].strip())

    def test_missing_source_anchor_and_duplicate_anchor_fail(self):
        self.edit(lambda d: d["standards"]["design"].update(sections=["missing"]))
        with self.assertRaisesRegex(ValueError, "missing section"):
            standards.resolve(self.root, ["ui-change"])
        self.edit(lambda d: d["standards"]["design"].update(sections=["*"]))
        path = self.root / "standards/design.md"
        path.write_text('<a id="a"></a>\nfirst\n<a id="a"></a>\nsecond\n')
        with self.assertRaisesRegex(ValueError, "duplicate Markdown"):
            standards.load_router(self.root)
        path.unlink()
        with self.assertRaises(OSError):
            standards.load_router(self.root)

    def test_duplicate_yaml_key_and_unknown_profile_fail(self):
        original = self.router.read_text()
        self.router.write_text(original + "\nversion: 1\n")
        with self.assertRaisesRegex(ValueError, "unique"):
            standards.load_router(self.root)
        self.router.write_text(original)
        self.edit(lambda d: d.update(active_profiles=["typo"]))
        with self.assertRaisesRegex(ValueError, "unknown profile"):
            standards.load_router(self.root)

    def test_dependencies_cannot_be_missing_cyclic_or_inactive(self):
        self.edit(lambda d: d["standards"]["design"].update(requires=["missing"]))
        with self.assertRaisesRegex(ValueError, "unknown dependency"):
            standards.load_router(self.root)
        self.edit(lambda d: d["standards"]["design"].update(requires=["design"]))
        with self.assertRaisesRegex(ValueError, "cycle"):
            standards.load_router(self.root)
        self.edit(lambda d: d["standards"]["design"].update(requires=["access"]))
        with self.assertRaisesRegex(ValueError, "inactive"):
            standards.load_router(self.root)

    def test_source_cannot_escape_standards_directory(self):
        self.edit(lambda d: d["standards"]["design"].update(source="../private.md"))
        with self.assertRaisesRegex(ValueError, "escapes"):
            standards.load_router(self.root)

    def test_evidence_requires_exact_current_sources_and_router(self):
        self.internal()
        evidence = standards.resolve(self.root, ["bulk-import"])
        payload = {"step": "run", "standards": evidence}
        self.assertEqual(standards.validate_evidence(payload, self.root), [])
        tampered = copy.deepcopy(payload)
        tampered["standards"]["sources"].pop()
        self.assertTrue(standards.validate_evidence(tampered, self.root))
        path = self.root / "standards/access.md"
        path.write_text(path.read_text() + "\nnew requirement\n")
        self.assertTrue(standards.validate_evidence(payload, self.root))
        self.assertTrue(standards.validate_evidence({"step": "run"}, self.root))

    def test_tbd_readable_for_design_but_not_implementation(self):
        evidence = standards.resolve(self.root, ["ui-change"])
        self.assertEqual(standards.validate_evidence({"step": "research", "standards": evidence}, self.root), [])
        self.assertTrue(standards.validate_evidence({"step": " RUN ", "standards": evidence}, self.root))

    def test_step_check_cli_rejects_missing_routing_and_accepts_valid_evidence(self):
        path = self.root / ".altool/checks/demo.plan.json"
        path.parent.mkdir(parents=True)
        payload = {"schemaVersion": 1, "feature": "demo", "step": "plan",
                   "checks": {key: {"status": "done", "evidence": ["test"]} for key in check.COMMON_REQUIRED}}
        path.write_text(json.dumps(payload))
        command = [sys.executable, str(ROOT / "altool/scripts/check.py"), "validate", "--json", str(path)]
        failed = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(failed.returncode, 0)
        self.assertIn("standards", failed.stdout)
        payload["standards"] = standards.resolve(self.root, ["code-change"])
        path.write_text(json.dumps(payload))
        passed = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(passed.returncode, 0, passed.stdout + passed.stderr)

    def test_legacy_works_without_router(self):
        self.router.unlink()
        self.assertEqual(standards.resolve(self.root, [])["mode"], "legacy")
        self.assertEqual(standards.validate_evidence({"step": "run"}, self.root), [])

    def test_oneshot_rechecks_child_standard_evidence(self):
        import test_check
        parent = test_check.CheckGateTests().oneshot_check(self.root)
        evidence = standards.resolve(self.root, ["code-change"])
        for relative in parent["children"]:
            path = self.root / relative
            child = json.loads(path.read_text())
            child["standards"] = evidence
            child['standardsDecisions'] = self.stack_decision()
            path.write_text(json.dumps(child))
        self.assertEqual(check.validate_oneshot_children(parent, self.root), [])
        path = self.root / parent["children"][1]
        child = json.loads(path.read_text())
        del child["standards"]
        path.write_text(json.dumps(child))
        self.assertTrue(any("standards" in error for error in check.validate_oneshot_children(parent, self.root)))

    def test_router_change_invalidates_prior_evidence(self):
        evidence = standards.resolve(self.root, ["code-change"])
        self.internal()
        self.assertTrue(standards.validate_evidence({"step": "run", "standards": evidence}, self.root))

    def test_symlinked_source_outside_project_is_rejected(self):
        path = self.root / "standards/design.md"
        path.unlink()
        path.symlink_to(ROOT / "standards/design.md")
        with self.assertRaisesRegex(ValueError, "escapes"):
            standards.load_router(self.root)

    def test_install_preserves_policies_and_migrates_legacy_design(self):
        with tempfile.TemporaryDirectory() as target_dir:
            target = Path(target_dir)
            (target / "designs").mkdir()
            legacy = target / "designs/design.md"
            legacy.write_text("custom design\n")
            standards.install(ROOT, target)
            canonical = target / "standards/design.md"
            self.assertEqual(canonical.read_bytes(), legacy.read_bytes())
            router = target / standards.ROUTER
            original = router.read_bytes()
            canonical.write_text("new canonical\n")
            standards.install(ROOT, target)
            self.assertEqual(canonical.read_text(), "new canonical\n")
            self.assertEqual(legacy.read_text(), "custom design\n")
            self.assertEqual(router.read_bytes(), original)

    @unittest.skipUnless(sys.platform == "darwin", "macOS installer integration")
    def test_fresh_macos_install_has_router_and_only_macos_launchers(self):
        with tempfile.TemporaryDirectory() as target:
            env = dict(os.environ, PATH=str(Path(sys.executable).parent) + os.pathsep + os.environ.get("PATH", ""))
            result = subprocess.run(["bash", str(ROOT / "setup.command"), target], env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIsNotNone(standards.load_router(Path(target)))
            self.assertTrue((Path(target) / "standards/design.md").exists())
            self.assertFalse((Path(target) / "designs/design.md").exists())
            self.assertFalse((Path(target) / "start.bat").exists())
            import assets
            selected = assets.resolve(Path(target), 'component.in-page-navigation')
            self.assertEqual(selected['guidance']['authority'], 'company-contract')
            self.assertIn('krds-p0204.md', ' '.join(selected['guidance']['references']))
            routed = standards.resolve(Path(target), ['login-ui'])
            self.assertIn('ui-auth', [source['id'] for source in routed['sources']])


if __name__ == "__main__":
    unittest.main()
