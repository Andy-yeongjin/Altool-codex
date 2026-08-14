from __future__ import annotations

import shutil
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
    def test_windows_setup_checks_sources_and_copy_failures(self):
        script = (ROOT / "setup.bat").read_text(encoding="utf-8")
        self.assertIn("templates\\codex\\skills\\altool\\SKILL.md", script)
        self.assertGreaterEqual(script.count("if errorlevel 1 goto :copy_failed"), 7)
        self.assertIn(":try_python", script)
        self.assertIn("check.py\" --help", script)
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
    def test_macos_setup_replaces_managed_directories_but_preserves_policy_files(self):
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
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertFalse((target / "altool/stale.txt").exists())
            self.assertFalse((target / ".agents/skills/altool/stale.txt").exists())
            self.assertTrue((target / "altool/scripts/check.py").is_file())
            self.assertTrue((target / ".agents/skills/altool/SKILL.md").is_file())
            self.assertEqual(
                (target / "AGENTS.md").read_text(encoding="utf-8"),
                "custom policy\n",
            )
            self.assertEqual(
                (target / "constitution.md").read_text(encoding="utf-8"),
                "custom constitution\n",
            )
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
