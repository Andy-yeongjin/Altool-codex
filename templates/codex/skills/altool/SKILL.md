---
name: altool
description: Run Altool local project workflow commands in Codex. Use when the user invokes $altool with setup, research, oneshot, freedom, say, ask, pause, resume, stop, outbox, guide, design_source, lesson, plan, spec, run, analyze, fix, browser, report, or status; also use when the user asks to run an Altool command in the current project.
---

# Altool Local Workflow

Use this skill as the repo-local `$altool` entrypoint.

## Command Routing

| User command | Step file or action |
| --- | --- |
| `$altool setup` | `altool/steps/setup.md` |
| `$altool research <topic>` | `altool/steps/research.md` |
| `$altool oneshot <feature>` | `altool/steps/oneshot.md` |
| `$altool freedom <goal> --loops N` | `altool/steps/freedom.md` |
| `python3 altool/scripts/freedom_loop.py ...` | Freedom control-plane smoke runner |
| `$altool say/ask <text>` | `python3 altool/scripts/radio.py say/ask <text>` |
| `$altool pause/resume/stop/outbox` | matching `radio.py` action |
| `$altool guide` | `altool/steps/guide.md` |
| `$altool design_source` | `altool/steps/design_source.md` |
| `$altool lesson [text]` | `altool/steps/lesson.md` |
| `$altool plan <feature>` | `altool/steps/plan.md` |
| `$altool spec [instructions]` | `altool/steps/spec.md` |
| `$altool run [instructions]` | `altool/steps/run.md` |
| `$altool analyze [instructions]` | `altool/steps/analyze.md` |
| `$altool fix [instructions]` | `altool/steps/fix.md` |
| `$altool browser [instructions]` | `altool/steps/browser.md` |
| `$altool report [instructions]` | `altool/steps/report.md` |
| `$altool status` | `altool/steps/status.md` |

## Rules

1. Before executing a command, read root `AGENTS.md` and `constitution.md` when they exist, then `altool/steps/_common.md` and the matching step. This skill routes commands; those two step files are the complete command procedure. Run documented Python commands with `python3`; on Windows only, fall back to `py -3`, then to `python` after confirming it is Python 3.
2. Keep Altool state, artifacts, reports, skills, and prompts project-local. The `~/.altool` lesson event store is the sole global exception. Missing optional assets disable only their rules; never create other global prompt, skill, command, or state files.
3. `research` is investigation only; `plan` and `oneshot` create a feature. `spec/run/analyze/fix/browser/report` use `.altool/state/status.json.currentFeature`; trailing text is step guidance, not a feature selector. If no feature exists, direct the user to `$altool plan <description>`.
4. Follow `_common.md` for every Step Check. Refresh the owner check for every changed Altool document, list those checks in `docs.synced`, and run `check.py audit-docs --root .` after document-producing commands.
5. Search lessons before `run/analyze/fix/browser`. Append lessons only for code-caused build, type, test, runtime, browser failures or implementation gaps and their fixes; include recurrence risk/scope. Do not record normal changes, architecture choices, style edits, refactors-only, or external tool failures.
6. Follow the constitution's design authority. Before `oneshot` or `freedom`, run `design_source` when Claude HTML, Stitch, or `.pen` inputs exist and `design.md` is missing, `TBD`, stale, or lacks the Claude HTML mapping. Ask which file is authoritative when same-screen Claude HTML conflicts.
7. Execute `freedom` as the bounded cycle in `altool/steps/freedom.md`; each loop is one research-led product maturity cycle, and implementation/UI cycles complete report after browser before the next loop. `freedom_loop.py` remains a control-plane smoke runner unless explicitly requested.
8. Keep document checkboxes and top-level status synchronized. Verified UI work must not leave upstream documents in `Draft`.
9. For unknown commands, show the supported command list.
