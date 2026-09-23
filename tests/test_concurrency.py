from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
LESSON = ROOT / "altool/scripts/lesson.py"
RADIO = ROOT / "altool/scripts/radio.py"


class ConcurrentWriteTests(unittest.TestCase):
    def test_concurrent_lesson_appends_keep_unique_ids_and_valid_derived_files(self):
        with tempfile.TemporaryDirectory() as directory:
            lesson_home = Path(directory) / "lesson-home"
            env = {**os.environ, "ALTOOL_HOME": str(lesson_home)}
            processes = []
            for number in range(12):
                payload = json.dumps(
                    {"type": "code_error", "summary": f"failure-{number}"}
                )
                processes.append(
                    subprocess.Popen(
                        [sys.executable, str(LESSON), "append", "--json", payload],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        env=env,
                    )
                )

            failures = []
            for process in processes:
                stdout, stderr = process.communicate(timeout=20)
                if process.returncode:
                    failures.append(stderr or stdout)
            self.assertEqual(failures, [])

            events = [
                json.loads(line)
                for line in (lesson_home / "events.jsonl")
                .read_text(encoding="utf-8")
                .splitlines()
                if line
            ]
            self.assertEqual(len(events), 12)
            self.assertEqual(len({event["id"] for event in events}), 12)
            index = json.loads(
                (lesson_home / "lesson.index.json").read_text(encoding="utf-8")
            )
            self.assertEqual(len(index["entries"]), 12)
            self.assertEqual(
                (lesson_home / "lesson.md").read_text(encoding="utf-8").count("## L-"),
                12,
            )

    def test_concurrent_radio_updates_leave_valid_state_json(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(
                [sys.executable, str(RADIO), "init", "test", "--loops", "20"],
                cwd=root,
                check=True,
                capture_output=True,
                text=True,
            )
            processes = [
                subprocess.Popen(
                    [
                        sys.executable,
                        str(RADIO),
                        "action",
                        "start",
                        f"task-{number}",
                        "--loop",
                        str(number + 1),
                    ],
                    cwd=root,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                for number in range(12)
            ]
            for process in processes:
                process.communicate(timeout=20)
                self.assertEqual(process.returncode, 0)

            state = json.loads(
                (root / ".altool/freedom/state.json").read_text(encoding="utf-8")
            )
            self.assertEqual(state["schemaVersion"], 1)

    def test_radio_accepts_an_explicit_project_root(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            project = base / "project"
            project.mkdir()
            subprocess.run(
                [
                    sys.executable,
                    str(RADIO),
                    "--root",
                    str(project),
                    "init",
                    "test",
                ],
                cwd=base,
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertTrue((project / ".altool/freedom/state.json").is_file())
            self.assertFalse((base / ".altool").exists())


if __name__ == "__main__":
    unittest.main()
