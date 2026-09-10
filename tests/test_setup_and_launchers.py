from __future__ import annotations

import shutil
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
SETUP = ROOT / "setup.command"
START = ROOT / "start.command"
END = ROOT / "end.command"


class SetupAndLauncherTests(unittest.TestCase):
    def test_setup_uses_python_distribution_without_obsolete_ditto_dependency(self):
        script = SETUP.read_text(encoding='utf-8')
        self.assertNotIn('ditto', script)
        self.assertIn('altool/scripts/distribution.py', script)

    @unittest.skipUnless(sys.platform == "darwin", "macOS installer test")
    def test_missing_bundled_parser_stops_before_target_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source"
            target = Path(directory) / "target"
            source.mkdir()
            target.mkdir()
            (target / "keep.txt").write_text("keep")
            for folder in ("altool", "standards", "templates/codex/skills"):
                shutil.copytree(ROOT / folder, source / folder)
            for name in ("setup.command", "constitution.md", "project-starter.html"):
                shutil.copy2(ROOT / name, source / name)
            (source / "altool/vendor/pyyaml/__init__.py").unlink()
            result = subprocess.run(["bash", str(source / "setup.command"), str(target)],
                                    env=dict(os.environ, PATH="/usr/bin:/bin:/usr/sbin:/sbin", PYTHONNOUSERSITE="1"),
                                    capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Altool YAML parser missing/damaged", result.stdout + result.stderr)
            self.assertEqual([p.name for p in target.iterdir()], ["keep.txt"])
            self.assertEqual((target / "keep.txt").read_text(), "keep")

    @unittest.skipUnless(sys.platform == "darwin", "macOS installer test")
    def test_fresh_install_and_gate_without_third_party_python_packages(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "new project"
            result = subprocess.run(["bash", str(SETUP), str(target)],
                                    env=dict(os.environ, PATH="/usr/bin:/bin:/usr/sbin:/sbin", PYTHONNOUSERSITE="1"),
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertNotIn("[안내]", result.stdout)
            self.assertFalse(any(p.name in {'.DS_Store', 'Thumbs.db'} or p.name.startswith('._')
                                 for p in target.rglob('*')))
            result = subprocess.run(["/usr/bin/python3", "-S", "altool/scripts/standards.py", "validate"],
                                    cwd=target, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            result = subprocess.run(["/usr/bin/python3", "-S", "altool/scripts/check.py", "--help"],
                                    cwd=target, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_windows_setup_checks_sources_and_copy_failures(self):
        script = (ROOT / "setup.bat").read_text(encoding="utf-8")
        self.assertIn("templates\\codex\\skills\\altool\\SKILL.md", script)
        self.assertGreaterEqual(script.count("if errorlevel 1 goto :copy_failed"), 6)
        self.assertIn('standards.py" install --source', script)
        self.assertIn(":try_python", script)
        self.assertIn("check.py\" --help", script)
        self.assertLess(script.index('if not "%~1"=="" set "NONINTERACTIVE=1"'), script.index('if not exist'))
        self.assertEqual(script.count("exit /b 1"), 1)
        self.assertIn(':failed\nif not defined NONINTERACTIVE pause\nexit /b 1', script)
        self.assertIn(':starter_missing\necho', script)
        start_script = (ROOT / "start.bat").read_text(encoding="utf-8")
        self.assertIn("p.scripts && p.scripts.dev", start_script)
        self.assertNotIn("^&", start_script)

    @unittest.skipUnless(sys.platform == "darwin", "macOS launcher test")
    def test_start_command_reports_unsupported_projects_without_starting(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            launcher = target / "start.command"
            shutil.copy2(START, launcher)
            result = subprocess.run(
                ["bash", str(launcher)],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 1)
            self.assertIn("No package.json found", result.stdout)
            self.assertFalse((target / ".altool/dev-server.pid").exists())

    @unittest.skipUnless(sys.platform == "darwin", "macOS launcher test")
    def test_macos_setup_updates_product_policy_and_preserves_project_contracts(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "project"
            (target / "altool").mkdir(parents=True)
            (target / "altool/stale.txt").write_text("stale", encoding="utf-8")
            (target / ".agents/skills/altool").mkdir(parents=True)
            (target / ".agents/skills/altool/stale.txt").write_text(
                "stale", encoding="utf-8"
            )
            (target / "AGENTS.md").write_text("custom policy\n", encoding="utf-8")
            (target / "constitution.md").write_text(
                "custom constitution\n", encoding="utf-8"
            )
            (target / "designs").mkdir()
            (target / "designs/design.md").write_text(
                "custom design\n", encoding="utf-8"
            )

            result = subprocess.run(
                ["bash", str(SETUP), str(target)],
                env=dict(os.environ, PATH=str(Path(sys.executable).parent) + os.pathsep + os.environ.get("PATH", "")),
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertFalse((target / "altool/stale.txt").exists())
            self.assertFalse((target / ".agents/skills/altool/stale.txt").exists())
            self.assertTrue((target / "altool/scripts/check.py").is_file())
            self.assertTrue((target / "altool/scripts/ui_gate.py").is_file())
            replay = subprocess.run(
                ["node", str(target / "altool/scripts/ui-measurements.mjs")],
                input='{"contracts":[],"observations":[]}', text=True, capture_output=True,
            )
            self.assertEqual(replay.returncode, 1)
            self.assertIn('No UI contracts supplied', replay.stdout)
            self.assertEqual((target / "project-starter.html").read_bytes(), (ROOT / "project-starter.html").read_bytes())
            self.assertTrue((target / "altool/scripts/project-starter.js").is_file())
            self.assertTrue((target / ".agents/skills/altool/SKILL.md").is_file())
            self.assertEqual(
                (target / "AGENTS.md").read_text(encoding="utf-8"),
                "custom policy\n",
            )
            self.assertEqual(
                (target / "constitution.md").read_text(encoding="utf-8"),
                (ROOT / "constitution.md").read_text(encoding="utf-8"),
            )
            backups = list((target / ".altool/backups").glob("constitution.*.md"))
            self.assertEqual(len(backups), 1)
            self.assertEqual(backups[0].read_text(), "custom constitution\n")
            self.assertEqual(
                (target / "designs/design.md").read_text(encoding="utf-8"),
                "custom design\n",
            )

    @unittest.skipUnless(sys.platform == "darwin", "macOS launcher test")
    def test_end_command_does_not_kill_an_unmanaged_port_listener(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            with socket.socket() as reservation:
                reservation.bind(("127.0.0.1", 0))
                port = str(reservation.getsockname()[1])
            launcher = target / "end.command"
            shutil.copy2(END, launcher)
            server = subprocess.Popen(
                ["python3", "-m", "http.server", port],
                cwd=target,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            try:
                time.sleep(0.2)
                result = subprocess.run(
                    ["bash", str(launcher), port],
                    cwd=target,
                    check=False,
                    capture_output=True,
                    text=True,
                )
                self.assertEqual(result.returncode, 1)
                self.assertIsNone(server.poll())
                self.assertIn("Nothing was stopped", result.stdout)
            finally:
                server.terminate()
                server.wait(timeout=5)

    @unittest.skipUnless(sys.platform == "darwin", "macOS launcher test")
    def test_end_command_stops_only_the_recorded_project_process(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            launcher = target / "end.command"
            shutil.copy2(END, launcher)
            (target / ".altool").mkdir()
            server = subprocess.Popen(["sleep", "30"], cwd=target)
            try:
                (target / ".altool/dev-server.pid").write_text(
                    f"{server.pid}\n", encoding="utf-8"
                )
                result = subprocess.run(
                    ["bash", str(launcher)],
                    check=False,
                    capture_output=True,
                    text=True,
                )
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                server.wait(timeout=5)
                self.assertFalse((target / ".altool/dev-server.pid").exists())
            finally:
                if server.poll() is None:
                    server.terminate()
                    server.wait(timeout=5)


if __name__ == "__main__":
    unittest.main()
