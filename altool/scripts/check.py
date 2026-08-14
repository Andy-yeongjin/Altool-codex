#!/usr/bin/env python3
"""Altool workflow quality gates.

Validates Step Check JSON and deterministic document, CSS, and UI contracts.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


VALID_STATUSES = {"done", "skipped", "failed"}
RESEARCH_READINESS = {"ready", "partial", "not-ready"}
COMMON_REQUIRED = [
    "inputs.loaded",
    "lesson.search",
    "event.capture",
    "verification",
    "state.updated",
    "docs.synced",
    "document.status",
    "artifacts.created",
]

RESEARCH_REQUIRED = COMMON_REQUIRED + [
    "research.source_mix",
    "research.source_quality",
    "research.freshness",
    "research.duplicate_review",
    "research.evidence_map",
    "research.visual_capture",
    "research.design_system",
    "research.design_tokens",
    "research.screen_recipe",
    "research.component_extraction",
    "research.capture_map",
    "research.plan_readiness",
    "research.next_queries",
]

BROWSER_REQUIRED = COMMON_REQUIRED + [
    "visual.reference_comparison",
    "visual.css_custom_properties",
    "visual.contrast",
    "accessibility.live_region",
    "functional.time_precision",
    "analysis.semantic_consistency",
    "server.cleanup",
]

ANALYZE_REQUIRED = COMMON_REQUIRED + [
    "visual.contrast",
    "accessibility.live_region",
    "functional.time_precision",
    "analysis.semantic_consistency",
]
FIX_REQUIRED = COMMON_REQUIRED + [
    "visual.contrast",
    "accessibility.live_region",
    "functional.time_precision",
    "analysis.semantic_consistency",
]

FREEDOM_REQUIRED = COMMON_REQUIRED + [
    "inbox.watch",
    "research.required",
    "cycle.state",
    "action.state",
    "report.required",
    "outbox.updated",
    "action.selected",
    "lesson.capture",
    "loop.progress",
    "visual.reference_comparison",
    "visual.css_custom_properties",
    "visual.contrast",
    "accessibility.live_region",
    "functional.time_precision",
    "analysis.semantic_consistency",
    "server.cleanup",
]

STEP_REQUIRED: dict[str, list[str]] = {
    "setup": COMMON_REQUIRED,
    "guide": COMMON_REQUIRED,
    "research": RESEARCH_REQUIRED,
    "freedom": FREEDOM_REQUIRED,
    "design_source": COMMON_REQUIRED,
    "lesson": COMMON_REQUIRED,
    "plan": COMMON_REQUIRED,
    "spec": COMMON_REQUIRED,
    "run": COMMON_REQUIRED,
    "analyze": ANALYZE_REQUIRED,
    "fix": FIX_REQUIRED,
    "report": COMMON_REQUIRED,
    "status": COMMON_REQUIRED,
    "browser": BROWSER_REQUIRED,
}

OPTIONAL_STEP = "oneshot"

BROWSER_PASS_POLICY: dict[str, tuple[str, ...] | None] = {
    "inputs.loaded": None,
    "lesson.search": None,
    "event.capture": ("no browser issue", "no event"),
    "verification": None,
    "visual.reference_comparison": ("no reference", "not ui"),
    "visual.css_custom_properties": ("no css files",),
    "visual.contrast": ("no css files",),
    "accessibility.live_region": ("no live-region contract",),
    "functional.time_precision": ("not time-based ui",),
    "analysis.semantic_consistency": None,
    "server.cleanup": ("existing server",),
    "state.updated": None,
    "docs.synced": None,
    "document.status": None,
    "artifacts.created": None,
}


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def has_nonempty_list(value: Any) -> bool:
    return isinstance(value, list) and any(str(item).strip() for item in value)


def check_label(step: str, item: str) -> str:
    return item if item.startswith(f"{step}.") else f"{step}.{item}"


def get_number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return None


def validate_research_quality(data: dict[str, Any], failures: list[str]) -> None:
    quality = data.get("quality")
    if not isinstance(quality, dict):
        fail("research.quality: root.quality object is required for research step", failures)
        return

    score = get_number(quality.get("score"))
    if score is None or not 0 <= score <= 100:
        fail("research.quality.score: must be a number between 0 and 100", failures)

    readiness = quality.get("planReadiness")
    if readiness not in RESEARCH_READINESS:
        fail("research.quality.planReadiness: must be ready, partial, or not-ready", failures)

    source_count = get_number(quality.get("sourceCount"))
    if source_count is None or source_count < 8:
        fail("research.quality.sourceCount: must be at least 8", failures)

    source_mix = quality.get("sourceMix")
    if not isinstance(source_mix, dict):
        fail("research.quality.sourceMix: must be an object", failures)
    else:
        minimums = {
            "actualService": 3,
            "researchOrOfficial": 3,
            "userVoice": 1,
        }
        for key, minimum in minimums.items():
            value = get_number(source_mix.get(key))
            if value is None or value < minimum:
                fail(f"research.quality.sourceMix.{key}: must be at least {minimum}", failures)

    next_query_count = get_number(quality.get("nextQueryCount"))
    if next_query_count is None or next_query_count < 3:
        fail("research.quality.nextQueryCount: must be at least 3", failures)

    if score is not None:
        if score < 70:
            fail("research.quality.score: below 70 requires research rework before completion", failures)
        if score < 80 and readiness == "ready":
            fail("research.quality.planReadiness: qualityScore below 80 cannot be ready", failures)


def validate_check(data: dict[str, Any]) -> list[str]:
    failures: list[str] = []

    if data.get("schemaVersion") != 1:
        fail("root.schemaVersion must be 1", failures)

    feature = data.get("feature")
    if not isinstance(feature, str) or not feature.strip():
        fail("root.feature is required", failures)

    step = data.get("step")
    if not isinstance(step, str) or not step.strip():
        fail("root.step is required", failures)
        step = ""

    checks = data.get("checks")
    if not isinstance(checks, dict):
        fail("root.checks must be an object", failures)
        return failures

    if step == "research":
        validate_research_quality(data, failures)

    if step == OPTIONAL_STEP:
        children = data.get("children")
        if not isinstance(children, list) or not children:
            fail("oneshot.children must be a non-empty list", failures)
    else:
        required = STEP_REQUIRED.get(str(step), COMMON_REQUIRED)
        for item in required:
            if item not in checks:
                fail(f"{check_label(str(step), item)}: missing required check", failures)

    for item, check in checks.items():
        label = check_label(str(step), str(item))
        if not isinstance(check, dict):
            fail(f"{label}: check must be an object", failures)
            continue
        status = check.get("status")
        if status not in VALID_STATUSES:
            fail(f"{label}: status must be one of done, skipped, failed", failures)
            continue
        if status == "done" and not has_nonempty_list(check.get("evidence")):
            fail(f"{label}: status=done requires non-empty evidence list", failures)
        if status in {"skipped", "failed"}:
            reason = check.get("reason")
            if not isinstance(reason, str) or not reason.strip():
                fail(f"{label}: status={status} requires reason", failures)

    if step == "browser":
        for item, check in checks.items():
            if isinstance(check, dict) and check.get("status") == "failed":
                fail(
                    f"{check_label(step, str(item))}: browser completion cannot contain failed checks",
                    failures,
                )
        for item, allowed_skip_reasons in BROWSER_PASS_POLICY.items():
            check = checks.get(item)
            if not isinstance(check, dict):
                continue
            status = check.get("status")
            label = check_label(step, item)
            if status == "done":
                continue
            if status == "failed":
                continue
            if status == "skipped" and allowed_skip_reasons:
                reason = str(check.get("reason", "")).casefold()
                if any(token in reason for token in allowed_skip_reasons):
                    continue
            fail(f"{label}: browser completion requires a passing gate", failures)

    if step in {"analyze", "fix"}:
        semantic = checks.get("analysis.semantic_consistency")
        if isinstance(semantic, dict) and semantic.get("status") != "done":
            fail(
                f"{step}.analysis.semantic_consistency: completion requires status=done",
                failures,
            )

    return failures


def load_json(path: str) -> dict[str, Any]:
    try:
        text = sys.stdin.read() if path == "-" else Path(path).read_text(encoding="utf-8")
        data = json.loads(text)
    except Exception as exc:  # noqa: BLE001 - CLI should return friendly failures
        raise SystemExit(f"FAIL: could not read JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise SystemExit("FAIL: check JSON must be an object")
    return data


def validate_cmd(args: argparse.Namespace) -> int:
    data = load_json(args.json)
    failures = validate_check(data)
    if args.format == "json":
        print(
            json.dumps(
                {
                    "valid": not failures,
                    "feature": data.get("feature"),
                    "step": data.get("step"),
                    "failures": failures,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    elif failures:
        print("FAIL Step Check validation")
        for failure in failures:
            print(f"- {failure}")
    else:
        print(f"PASS Step Check: {data.get('feature')}.{data.get('step')}")
    return 1 if failures else 0


def owner_check_for_doc(doc: Path, root: Path) -> Path | None:
    try:
        rel = doc.relative_to(root)
    except ValueError:
        rel = doc
    parts = rel.parts
    if len(parts) < 2 or parts[0] != "docs":
        return None

    checks_dir = root / ".altool" / "checks"
    name = doc.name

    if len(parts) >= 3 and parts[1] == "00-research" and name.endswith(".research.md"):
        match = re.match(r"^(R-\d+)", name)
        if match:
            return checks_dir / f"{match.group(1)}.research.json"
        return None

    suffix_map = {
        ".plan.md": "plan",
        ".spec.md": "spec",
        ".analyze.md": "analyze",
        ".fix.md": "fix",
        ".browser.md": "browser",
        ".report.md": "report",
    }
    for suffix, step in suffix_map.items():
        if name.endswith(suffix):
            feature = name[: -len(suffix)]
            return checks_dir / f"{feature}.{step}.json"
    return None


def iter_altool_docs(root: Path) -> list[Path]:
    docs_dir = root / "docs"
    if not docs_dir.exists():
        return []
    return sorted(
        path
        for path in docs_dir.rglob("*.md")
        if owner_check_for_doc(path, root) is not None
    )


def audit_docs_cmd(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    failures: list[str] = []
    audited = 0
    tolerance = float(args.tolerance)

    for doc in iter_altool_docs(root):
        check_path = owner_check_for_doc(doc, root)
        if check_path is None:
            continue
        audited += 1
        display_doc = doc.relative_to(root)
        display_check = check_path.relative_to(root)
        if not check_path.exists():
            failures.append(f"{display_doc}: missing owner check {display_check}")
            continue
        doc_mtime = doc.stat().st_mtime
        check_mtime = check_path.stat().st_mtime
        if doc_mtime > check_mtime + tolerance:
            failures.append(f"{display_doc}: owner check is stale ({display_check})")

    if args.format == "json":
        print(
            json.dumps(
                {
                    "valid": not failures,
                    "audited": audited,
                    "failures": failures,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    elif failures:
        print("FAIL Altool document/check audit")
        for failure in failures:
            print(f"- {failure}")
    else:
        print(f"PASS Altool document/check audit: {audited} docs")
    return 1 if failures else 0


CSS_EXTENSIONS = {".css", ".scss", ".sass", ".less"}
CSS_EXCLUDE_DIRS = {
    ".git",
    ".next",
    ".nuxt",
    ".output",
    ".turbo",
    ".vite",
    "coverage",
    "dist",
    "build",
    "node_modules",
    "playwright-report",
    "test-results",
}

SOURCE_EXCLUDE_DIRS = CSS_EXCLUDE_DIRS | {
    ".agents",
    ".altool",
    "altool",
    "docs",
    "templates",
}


def iter_css_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in CSS_EXTENSIONS:
            continue
        try:
            rel_parts = path.relative_to(root).parts
        except ValueError:
            rel_parts = path.parts
        if any(part in CSS_EXCLUDE_DIRS for part in rel_parts):
            continue
        files.append(path)
    return sorted(files)


def css_vars_cmd(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    files = iter_css_files(root)
    definitions: dict[str, list[str]] = {}
    references: list[tuple[str, str, int]] = []
    failures: list[str] = []

    define_pattern = re.compile(r"(^|[{\s;])(--[A-Za-z0-9_-]+)\s*:", re.MULTILINE)
    var_pattern = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)")

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = path.read_text(encoding="utf-8", errors="ignore")
        rel = str(path.relative_to(root))
        for match in define_pattern.finditer(text):
            definitions.setdefault(match.group(2), []).append(rel)
        for line_no, line in enumerate(text.splitlines(), start=1):
            for match in var_pattern.finditer(line):
                references.append((match.group(1), rel, line_no))

    for name, rel, line_no in references:
        if name not in definitions:
            failures.append(f"{rel}:{line_no}: {name} is referenced with var() but never defined")

    if args.format == "json":
        print(
            json.dumps(
                {
                    "valid": not failures,
                    "files": len(files),
                    "definitions": len(definitions),
                    "references": len(references),
                    "failures": failures,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    elif failures:
        print("FAIL CSS custom property validation")
        for failure in failures:
            print(f"- {failure}")
    else:
        print(
            "PASS CSS custom property validation: "
            f"{len(files)} files, {len(definitions)} definitions, {len(references)} references"
        )
    return 1 if failures else 0


def strip_css_comments(text: str) -> str:
    return re.sub(
        r"/\*.*?\*/",
        lambda match: "".join("\n" if char == "\n" else " " for char in match.group(0)),
        text,
        flags=re.DOTALL,
    )


def parse_css_color(value: str) -> tuple[int, int, int] | None:
    value = value.strip().lower()
    named = {"black": (0, 0, 0), "white": (255, 255, 255)}
    if value in named:
        return named[value]
    if value.startswith("#"):
        raw = value[1:]
        if len(raw) in {3, 4}:
            raw = "".join(char * 2 for char in raw)
        if len(raw) not in {6, 8} or not re.fullmatch(r"[0-9a-f]{6,8}", raw):
            return None
        if len(raw) == 8 and raw[6:] != "ff":
            return None
        return tuple(int(raw[index : index + 2], 16) for index in (0, 2, 4))
    rgb_match = re.fullmatch(
        r"rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*(?:\.\d+)?))?\s*\)",
        value,
    )
    if not rgb_match:
        return None
    if rgb_match.group(4) not in {None, "", "1", "1.0"}:
        return None
    channels = tuple(round(float(rgb_match.group(index))) for index in (1, 2, 3))
    return channels if all(0 <= channel <= 255 for channel in channels) else None


def css_color_literals(value: str) -> set[str]:
    literals = set(re.findall(r"#[0-9A-Fa-f]{3,8}(?![0-9A-Fa-f])", value))
    literals.update(
        match.group(0)
        for match in re.finditer(r"rgba?\([^)]*\)", value, flags=re.IGNORECASE)
    )
    literals.update(
        word
        for word in re.findall(r"\b(?:black|white)\b", value, flags=re.IGNORECASE)
    )
    return literals


def resolve_css_colors(
    value: str,
    definitions: dict[str, list[str]],
    stack: frozenset[str] = frozenset(),
) -> set[tuple[int, int, int]]:
    colors = {
        parsed
        for literal in css_color_literals(value)
        if (parsed := parse_css_color(literal)) is not None
    }
    for variable in re.findall(r"var\(\s*(--[A-Za-z0-9_-]+)", value):
        if variable in stack:
            continue
        for definition in definitions.get(variable, []):
            colors.update(
                resolve_css_colors(definition, definitions, stack | {variable})
            )
    return colors


def relative_luminance(color: tuple[int, int, int]) -> float:
    channels = []
    for value in color:
        normalized = value / 255
        channels.append(
            normalized / 12.92
            if normalized <= 0.04045
            else ((normalized + 0.055) / 1.055) ** 2.4
        )
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast_ratio(
    foreground: tuple[int, int, int], background: tuple[int, int, int]
) -> float:
    first = relative_luminance(foreground)
    second = relative_luminance(background)
    lighter, darker = max(first, second), min(first, second)
    return (lighter + 0.05) / (darker + 0.05)


def color_hex(color: tuple[int, int, int]) -> str:
    return "#" + "".join(f"{channel:02X}" for channel in color)


def contrast_cmd(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    files = iter_css_files(root)
    definitions: dict[str, list[str]] = {}
    parsed_files: list[tuple[Path, str]] = []
    declaration_pattern = re.compile(r"(--[A-Za-z0-9_-]+|[A-Za-z-]+)\s*:\s*([^;{}]+)")

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = path.read_text(encoding="utf-8", errors="ignore")
        text = strip_css_comments(text)
        parsed_files.append((path, text))
        for name, value in declaration_pattern.findall(text):
            if name.startswith("--"):
                definitions.setdefault(name, []).append(value.strip())

    failures: list[str] = []
    checked_pairs = 0
    seen_failures: set[tuple[str, int, str, tuple[int, int, int], tuple[int, int, int]]] = set()
    rule_pattern = re.compile(r"([^{}]+)\{([^{}]*)\}")

    for path, text in parsed_files:
        rel = str(path.relative_to(root))
        for rule in rule_pattern.finditer(text):
            selector = " ".join(rule.group(1).split())
            declarations = {
                name.lower(): value.strip()
                for name, value in declaration_pattern.findall(rule.group(2))
                if not name.startswith("--")
            }
            foreground_value = declarations.get("color")
            background_value = declarations.get("background-color") or declarations.get("background")
            if not foreground_value or not background_value:
                continue
            foregrounds = resolve_css_colors(foreground_value, definitions)
            backgrounds = resolve_css_colors(background_value, definitions)
            line_no = text.count("\n", 0, rule.start(1)) + 1
            for foreground in foregrounds:
                for background in backgrounds:
                    checked_pairs += 1
                    ratio = contrast_ratio(foreground, background)
                    if ratio + 1e-9 >= args.minimum:
                        continue
                    key = (rel, line_no, selector, foreground, background)
                    if key in seen_failures:
                        continue
                    seen_failures.add(key)
                    failures.append(
                        f"{rel}:{line_no}: {selector}: {color_hex(foreground)} on "
                        f"{color_hex(background)} = {ratio:.4f}:1, below {args.minimum:g}:1"
                    )

    result = {
        "valid": not failures,
        "applicable": bool(files),
        "files": len(files),
        "checkedPairs": checked_pairs,
        "minimum": args.minimum,
        "failures": failures,
    }
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif failures:
        print("FAIL CSS text contrast validation")
        for failure in failures:
            print(f"- {failure}")
    elif not files:
        print("SKIP CSS text contrast validation: no CSS files")
    else:
        print(
            f"PASS CSS text contrast validation: {len(files)} files, "
            f"{checked_pairs} explicit pairs, minimum {args.minimum:g}:1"
        )
    return 1 if failures else 0


def read_current_feature(root: Path, requested: str | None) -> tuple[str | None, dict[str, Any]]:
    state_path = root / ".altool" / "state" / "status.json"
    state: dict[str, Any] = {}
    if state_path.is_file():
        try:
            loaded = json.loads(state_path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                state = loaded
        except (OSError, json.JSONDecodeError):
            pass
    feature = requested.strip() if isinstance(requested, str) and requested.strip() else state.get("currentFeature")
    return (feature if isinstance(feature, str) and feature.strip() else None), state


def find_feature_doc(root: Path, feature: str, suffix: str) -> Path | None:
    docs_dir = root / "docs"
    if not docs_dir.exists():
        return None
    expected_name = f"{feature}.{suffix}.md"
    matches = sorted(path for path in docs_dir.rglob("*.md") if path.name == expected_name)
    return matches[0] if matches else None


def iter_source_files(root: Path, *, tests_only: bool) -> list[Path]:
    extensions = {".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".html", ".py"}
    files: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in extensions:
            continue
        rel = path.relative_to(root)
        if any(part in SOURCE_EXCLUDE_DIRS for part in rel.parts):
            continue
        is_test = "tests" in rel.parts or ".test." in path.name or ".spec." in path.name
        if is_test == tests_only:
            files.append(path)
    return sorted(files)


def a11y_contracts_cmd(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    feature, _ = read_current_feature(root, args.feature)
    failures: list[str] = []
    implementation_hits: list[str] = []
    test_hits: list[str] = []
    spec_path = find_feature_doc(root, feature, "spec") if feature else None

    if feature is None:
        failures.append("current feature is missing; pass --feature or set status.json.currentFeature")
    elif spec_path is None:
        failures.append(f"spec document not found for feature {feature}")

    spec_text = spec_path.read_text(encoding="utf-8") if spec_path else ""
    applicable = bool(re.search(r"role\s*=?\s*[`\"']?status|aria-live", spec_text, re.IGNORECASE))
    if applicable:
        implementation_pattern = re.compile(
            r"role\s*=\s*(?:\{\s*)?[\"']status[\"']|aria-live\s*=",
            re.IGNORECASE,
        )
        role_query_pattern = re.compile(
            r"(?:get|find|query)(?:ByRole|_by_role)\(\s*[\"']status[\"']|"
            r"locator\(\s*[\"'][^\"']*\[role=[\\\"']?status|"
            r"\[role=[\\\"']?status",
            re.IGNORECASE,
        )
        assertion_pattern = re.compile(
            r"toHaveText|toContainText|toBeVisible|to_have_text|to_contain_text|"
            r"is_visible|innerText|textContent|text_content|text\(\)",
            re.IGNORECASE,
        )

        for path in iter_source_files(root, tests_only=False):
            text = path.read_text(encoding="utf-8", errors="ignore")
            if implementation_pattern.search(text):
                implementation_hits.append(str(path.relative_to(root)))
        for path in iter_source_files(root, tests_only=True):
            text = path.read_text(encoding="utf-8", errors="ignore")
            if role_query_pattern.search(text) and assertion_pattern.search(text):
                test_hits.append(str(path.relative_to(root)))

        if not implementation_hits:
            failures.append("Spec declares a live-region contract but no role=status/aria-live implementation was found")
        if not test_hits:
            failures.append("Spec declares a live-region contract but no automated role=status text/visibility assertion was found")

    result = {
        "valid": not failures,
        "applicable": applicable,
        "feature": feature,
        "spec": str(spec_path.relative_to(root)) if spec_path else None,
        "implementationFiles": implementation_hits,
        "testFiles": test_hits,
        "failures": failures,
    }
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif failures:
        print("FAIL accessibility contract validation")
        for failure in failures:
            print(f"- {failure}")
    elif not applicable:
        print(f"SKIP accessibility contract validation: {feature} has no live-region contract")
    else:
        print(
            "PASS accessibility contract validation: "
            f"implementation {len(implementation_hits)}, tests {len(test_hits)}"
        )
    return 1 if failures else 0


def analyze_sync_cmd(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    feature, state = read_current_feature(root, args.feature)
    failures: list[str] = []
    analyze_path = find_feature_doc(root, feature, "analyze") if feature else None
    feature_state = state.get("features", {}).get(feature, {}) if feature else {}
    expected_rate = get_number(feature_state.get("matchRate")) if isinstance(feature_state, dict) else None

    if feature is None:
        failures.append("current feature is missing; pass --feature or set status.json.currentFeature")
    elif analyze_path is None:
        failures.append(f"analyze document not found for feature {feature}")
    if expected_rate is None:
        failures.append(f"status.json features.{feature}.matchRate must be a number")

    text = analyze_path.read_text(encoding="utf-8") if analyze_path else ""
    status_match = re.search(r"^>\s*\*\*(?:상태|Status)\*\*:\s*([^\r\n<]+)", text, re.MULTILINE)
    rate_match = re.search(r"^>\s*\*\*(?:최종 Match Rate|Final Match Rate)\*\*:\s*(\d+(?:\.\d+)?)%", text, re.MULTILINE | re.IGNORECASE)
    gap_match = re.search(r"^>\s*\*\*(?:미해소 갭|Unresolved Gaps)\*\*:\s*(\d+)\s*(?:건)?", text, re.MULTILINE | re.IGNORECASE)

    document_status = status_match.group(1).strip() if status_match else None
    document_rate = float(rate_match.group(1)) if rate_match else None
    unresolved_gaps = int(gap_match.group(1)) if gap_match else None

    if analyze_path:
        if document_rate is None:
            failures.append("analyze document is missing '> **최종 Match Rate**: N%'")
        if unresolved_gaps is None:
            failures.append("analyze document is missing '> **미해소 갭**: N건'")
        if document_status is None:
            failures.append("analyze document is missing top-level 상태/Status")
    if expected_rate is not None and document_rate is not None and abs(expected_rate - document_rate) > 0.01:
        failures.append(
            f"match rate mismatch: status.json={expected_rate:g}%, analyze={document_rate:g}%"
        )
    if document_rate is not None:
        for embedded in re.finditer(
            r"Overall Match Rate:\s*(\d+(?:\.\d+)?)%", text, re.IGNORECASE
        ):
            embedded_rate = float(embedded.group(1))
            if abs(embedded_rate - document_rate) <= 0.01:
                continue
            headings = list(
                re.finditer(r"^#{2,6}\s+(.+)$", text[: embedded.start()], re.MULTILINE)
            )
            heading = headings[-1].group(1).strip() if headings else ""
            if not re.search(r"최초|이전|initial|before|history|이력", heading, re.IGNORECASE):
                failures.append(
                    f"stale Overall Match Rate {embedded_rate:g}% under unlabeled section "
                    f"'{heading or '(no heading)'}'; label it as initial/history or update it"
                )
    if unresolved_gaps is not None and document_status is not None:
        normalized = document_status.casefold()
        if unresolved_gaps == 0 and normalized not in {"analyzed", "verified"}:
            failures.append("zero unresolved gaps requires analyze Status=Analyzed or Verified")
        if unresolved_gaps > 0 and normalized != "gapsfound":
            failures.append("unresolved gaps require analyze Status=GapsFound")

    result = {
        "valid": not failures,
        "feature": feature,
        "analyze": str(analyze_path.relative_to(root)) if analyze_path else None,
        "stateMatchRate": expected_rate,
        "documentMatchRate": document_rate,
        "unresolvedGaps": unresolved_gaps,
        "documentStatus": document_status,
        "failures": failures,
    }
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif failures:
        print("FAIL Analyze semantic consistency validation")
        for failure in failures:
            print(f"- {failure}")
    else:
        print(
            "PASS Analyze semantic consistency validation: "
            f"{feature}, {document_rate:g}%, gaps {unresolved_gaps}, {document_status}"
        )
    return 1 if failures else 0


def skill_sync_cmd(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    repo_skill = root / ".agents" / "skills" / "altool" / "SKILL.md"
    install_skill = root / "templates" / "codex" / "skills" / "altool" / "SKILL.md"
    failures: list[str] = []

    for path in (repo_skill, install_skill):
        if not path.is_file():
            failures.append(f"{path.relative_to(root)}: missing Altool skill copy")

    if not failures and repo_skill.read_bytes() != install_skill.read_bytes():
        failures.append(
            ".agents/skills/altool/SKILL.md and "
            "templates/codex/skills/altool/SKILL.md differ"
        )

    if args.format == "json":
        print(
            json.dumps(
                {
                    "valid": not failures,
                    "files": [
                        str(repo_skill.relative_to(root)),
                        str(install_skill.relative_to(root)),
                    ],
                    "failures": failures,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    elif failures:
        print("FAIL Altool skill copy validation")
        for failure in failures:
            print(f"- {failure}")
    else:
        print("PASS Altool skill copy validation: repo-local and install template match")
    return 1 if failures else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Altool workflow quality gates")
    sub = parser.add_subparsers(dest="command", required=True)

    validate = sub.add_parser("validate", help="validate a step check JSON file")
    validate.add_argument("--json", required=True, help="check JSON path, or '-' for stdin")
    validate.add_argument("--format", choices=("text", "json"), default="text")
    validate.set_defaults(func=validate_cmd)

    audit = sub.add_parser("audit-docs", help="verify Altool docs are not newer than their owner Step Check")
    audit.add_argument("--root", default=".", help="project root to audit")
    audit.add_argument("--tolerance", type=float, default=0.5, help="mtime tolerance in seconds")
    audit.add_argument("--format", choices=("text", "json"), default="text")
    audit.set_defaults(func=audit_docs_cmd)

    css_vars = sub.add_parser("css-vars", help="verify CSS var() references have matching custom property definitions")
    css_vars.add_argument("--root", default=".", help="project root to scan")
    css_vars.add_argument("--format", choices=("text", "json"), default="text")
    css_vars.set_defaults(func=css_vars_cmd)

    contrast = sub.add_parser("contrast", help="verify explicit CSS text/background contrast pairs")
    contrast.add_argument("--root", default=".", help="project root to scan")
    contrast.add_argument("--minimum", type=float, default=4.5, help="minimum contrast ratio")
    contrast.add_argument("--format", choices=("text", "json"), default="text")
    contrast.set_defaults(func=contrast_cmd)

    a11y_contracts = sub.add_parser(
        "a11y-contracts",
        help="verify Spec live-region contracts have implementation and automated assertions",
    )
    a11y_contracts.add_argument("--root", default=".", help="project root to scan")
    a11y_contracts.add_argument("--feature", help="feature name; defaults to status.json.currentFeature")
    a11y_contracts.add_argument("--format", choices=("text", "json"), default="text")
    a11y_contracts.set_defaults(func=a11y_contracts_cmd)

    analyze_sync = sub.add_parser(
        "analyze-sync",
        help="verify Analyze final summary matches status.json",
    )
    analyze_sync.add_argument("--root", default=".", help="project root to audit")
    analyze_sync.add_argument("--feature", help="feature name; defaults to status.json.currentFeature")
    analyze_sync.add_argument("--format", choices=("text", "json"), default="text")
    analyze_sync.set_defaults(func=analyze_sync_cmd)

    skill_sync = sub.add_parser("skill-sync", help="verify repo-local and install-template Altool skills match")
    skill_sync.add_argument("--root", default=".", help="Altool source repository root")
    skill_sync.add_argument("--format", choices=("text", "json"), default="text")
    skill_sync.set_defaults(func=skill_sync_cmd)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
