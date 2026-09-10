#!/usr/bin/env python3
"""Resolve project standards; Markdown is the sole rule source."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import sys
from pathlib import Path


ANCHOR = re.compile(r'^<a id="([a-z][a-z0-9-]*)"></a>\s*$', re.MULTILINE)
ID = re.compile(r"^[a-z][a-z0-9-]*$")
ROUTER = "standards/standard.yaml"
POLICY_DIGEST = "altool/constitution.sha256"
WORK_STEPS = {"research", "plan", "spec", "run", "analyze", "fix", "browser", "oneshot", "freedom", "design_source"}
IMPLEMENTATION_STEPS = {"run", "analyze", "fix", "browser", "oneshot", "freedom"}


def yaml_module():
    """Use the product's pure-Python parser, never the user's site-packages."""
    name = "_altool_pyyaml"
    if name not in sys.modules:
        path = Path(__file__).resolve().parents[1] / "vendor/pyyaml/__init__.py"
        spec = importlib.util.spec_from_file_location(name, path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[name] = module
        try:
            spec.loader.exec_module(module)
        except (ImportError, OSError) as exc:
            sys.modules.pop(name, None)
            raise ValueError("Altool YAML parser missing/damaged; restore the complete Altool package") from exc
    return sys.modules[name]


def inside(base: Path, relative: str) -> Path:
    path = (base / relative).resolve()
    if Path(relative).is_absolute() or not path.is_relative_to(base.resolve()):
        raise ValueError(f"path escapes project directory: {relative}")
    return path


def strings(value, label: str, *, nonempty=False) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(x, str) or not x for x in value):
        raise ValueError(f"{label}: expected a list of nonempty strings")
    if len(value) != len(set(value)) or (nonempty and not value):
        raise ValueError(f"{label}: duplicate or missing items")
    return value


def managed(root: Path) -> bool:
    return (root / POLICY_DIGEST).exists() or (root / "altool/scripts/standards.py").exists()


def validate_constitution(root: Path):
    """Detect accidental edits, not a security boundary against local file owners."""
    if not managed(root):
        return
    digest = inside(root, POLICY_DIGEST).read_text(encoding="utf-8").strip()
    content = inside(root, "constitution.md").read_text(encoding="utf-8")
    # Git/Windows newline conversion must not invalidate an unchanged policy.
    actual = hashlib.sha256(content.encode("utf-8")).hexdigest()
    if not re.fullmatch(r"[0-9a-f]{64}", digest) or actual != digest:
        raise ValueError("constitution: product policy changed; restore with the Altool installer, do not rewrite its digest")


def install_constitution(source: Path, target: Path):
    validate_constitution(source)
    original = inside(source, "constitution.md").read_bytes()
    destination = inside(target, "constitution.md")
    if destination.exists() and destination.read_bytes() != original:
        previous = destination.read_bytes()
        backup = inside(target, f".altool/backups/constitution.{hashlib.sha256(previous).hexdigest()}.md")
        backup.parent.mkdir(parents=True, exist_ok=True)
        if backup.exists() and backup.read_bytes() != previous:
            raise ValueError(f"constitution backup conflicts: {backup}")
        if not backup.exists():
            backup.write_bytes(previous)
        print(f"BACKUP {backup}")
    destination.write_bytes(original)
    manifest = inside(target, POLICY_DIGEST)
    manifest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(inside(source, POLICY_DIGEST), manifest)
    print("INSTALL constitution.md (product-managed)")


def load_router(root: Path) -> dict | None:
    validate_constitution(root)
    path = inside(root, ROUTER)
    if not path.exists():
        if managed(root):
            raise ValueError("standards router missing from managed installation; restore with the Altool installer")
        return None
    yaml = yaml_module()

    class UniqueLoader(yaml.SafeLoader):
        pass

    def mapping(loader, node):
        result = {}
        for key_node, value_node in node.value:
            key = loader.construct_object(key_node, deep=True)
            if not isinstance(key, str) or key in result:
                raise ValueError(f"YAML key must be a unique string: {key!r}")
            result[key] = loader.construct_object(value_node, deep=True)
        return result

    UniqueLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, mapping)
    try:
        data = yaml.load(path.read_text(encoding="utf-8"), Loader=UniqueLoader)
    except yaml.YAMLError as exc:
        raise ValueError(f"invalid YAML: {exc}") from exc
    if not isinstance(data, dict) or type(data.get("version")) is not int or data["version"] != 1:
        raise ValueError("standard.yaml: version must be 1")
    if set(data) != {"version", "active_profiles", "standards"}:
        raise ValueError("standard.yaml: expected version, active_profiles, standards only")
    profiles = strings(data["active_profiles"], "active_profiles", nonempty=True)
    entries = data["standards"]
    if not isinstance(entries, dict) or not entries:
        raise ValueError("standards: nonempty mapping required")
    for name, entry in entries.items():
        if not ID.fullmatch(name) or not isinstance(entry, dict):
            raise ValueError(f"invalid standard: {name}")
        required = {"profile", "when", "source", "sections", "requires"}
        if not required <= set(entry) or set(entry) - required - {"asset_kinds", "asset_ids"}:
            raise ValueError(f"{name}: expected routing fields and optional asset_kinds/asset_ids only")
        from assets import ID as ASSET_ID, KINDS
        for field in ("asset_kinds", "asset_ids"):
            values = strings(entry.get(field, []), f"{name}.{field}")
            if any(value not in KINDS if field == "asset_kinds" else not ASSET_ID.fullmatch(value) for value in values):
                raise ValueError(f"{name}: invalid {field}")
        if not isinstance(entry["profile"], str) or not ID.fullmatch(entry["profile"]):
            raise ValueError(f"{name}: invalid profile")
        for key in ("when", "sections", "requires"):
            strings(entry[key], f"{name}.{key}", nonempty=key != "requires")
        if any(not ID.fullmatch(tag) for tag in entry["when"]):
            raise ValueError(f"{name}: invalid task tag")
        if "*" in entry["sections"] and entry["sections"] != ["*"]:
            raise ValueError(f"{name}: * must be the only section")
        if not isinstance(entry["source"], str) or not entry["source"].endswith(".md"):
            raise ValueError(f"{name}: Markdown source required")
        inside(root / "standards", entry["source"])
        for dependency in entry["requires"]:
            if dependency not in entries:
                raise ValueError(f"{name}: unknown dependency {dependency}")
    if set(profiles) - {e["profile"] for e in entries.values()}:
        raise ValueError("active_profiles: unknown profile")
    active = {name for name, e in entries.items() if e["profile"] in profiles}
    visited, visiting = set(), set()

    def visit(name):
        if name in visiting:
            raise ValueError(f"dependency cycle at {name}")
        if name in visited:
            return
        visiting.add(name)
        for dependency in entries[name]["requires"]:
            if name in active and dependency not in active:
                raise ValueError(f"{name}: dependency {dependency} is inactive")
            visit(dependency)
        visiting.remove(name)
        visited.add(name)

    for name in entries:
        visit(name)
        if name in active:
            source_record(root, name, entries[name])
    asset_ids = {identifier for name in active for identifier in entries[name].get('asset_ids', [])}
    if asset_ids:
        from assets import REGISTRY, read_json
        registry_path = inside(root, REGISTRY)
        if registry_path.exists():
            registered = {item['id'] for item in read_json(registry_path)['items']}
            if asset_ids - registered:
                raise ValueError(f'Unknown routed asset IDs: {sorted(asset_ids - registered)}')
        elif managed(root):
            raise ValueError('Routed company asset registry missing; restore the company pack')
    return data


def source_record(root: Path, name: str, entry: dict) -> dict:
    path = inside(root / "standards", entry["source"])
    content = path.read_text(encoding="utf-8")
    anchors = [match.group(1) for match in ANCHOR.finditer(content)]
    if len(set(anchors)) != len(anchors):
        raise ValueError(f"{name}: duplicate Markdown anchors")
    for section in entry["sections"]:
        if section != "*" and section not in anchors:
            raise ValueError(f"{name}: missing section {section} in {entry['source']}")
    first = next((line.strip() for line in content.splitlines() if line.strip()), "")
    return {"id": name, "source": path.relative_to(root.resolve()).as_posix(),
            "sections": entry["sections"], "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "ready": bool(first) and "TBD" not in first.upper()}


def resolve(root: Path, tags: list[str], all_standards=False) -> dict:
    root = root.resolve()
    data = load_router(root)
    if data is None:
        canonical = root / "standards/design.md"
        legacy = root / "designs/design.md"
        return {"mode": "legacy", "design": (canonical if canonical.exists() else legacy).relative_to(root).as_posix(),
                "tags": sorted(set(tags)), "all": all_standards, "sources": []}
    if not tags and not all_standards:
        raise ValueError("provide --tag (task meaning), or --all for uncertain scope")
    entries = data["standards"]
    known = {tag for e in entries.values() for tag in e["when"]} | {"document-only", "status-only"}
    if set(tags) - known:
        raise ValueError(f"unknown task tags: {sorted(set(tags) - known)}; inspect standard.yaml")
    active = {name for name, e in entries.items() if e["profile"] in data["active_profiles"]}
    chosen = set()

    def include(name):
        if name not in chosen:
            chosen.add(name)
            for dependency in entries[name]["requires"]:
                include(dependency)

    for name in sorted(active):
        if all_standards or set(tags).intersection(entries[name]["when"]):
            include(name)
    result = {"mode": "routed", "tags": sorted(set(tags)), "all": all_standards,
            "router_sha256": hashlib.sha256((root / ROUTER).read_bytes()).hexdigest(),
            "active_profiles": data["active_profiles"],
            "inactive_candidates": sorted(name for name in entries if name not in active
                                          and (all_standards or set(tags).intersection(entries[name]["when"]))),
            "sources": [source_record(root, name, entries[name]) for name in sorted(chosen)]}
    routes = [{"standard": name, "kinds": entries[name].get('asset_kinds', []),
               "ids": entries[name].get('asset_ids', [])} for name in sorted(chosen)
              if entries[name].get('asset_kinds') or entries[name].get('asset_ids')]
    if routes:
        result['asset_routes'] = routes
    return result


def excerpts(root: Path, record: dict):
    path = inside(root, record["source"])
    content = path.read_text(encoding="utf-8")
    if record["sections"] == ["*"]:
        return [(1, len(content.splitlines()), content)]
    anchors = list(ANCHOR.finditer(content))
    result = []
    for i, match in enumerate(anchors):
        if match.group(1) in record["sections"]:
            start = match.start()
            end = anchors[i + 1].start() if i + 1 < len(anchors) else len(content)
            result.append((content.count("\n", 0, start) + 1,
                           content.count("\n", 0, end), content[start:end]))
    return result


def validate_evidence(data: dict, root: Path) -> list[str]:
    try:
        validate_constitution(root)
        if managed(root) and not (root / ROUTER).exists():
            raise ValueError("standards router missing from managed installation; restore with the Altool installer")
    except (ValueError, OSError) as exc:
        return [f"product policy: {exc}"]
    if str(data.get("step", "")).strip().lower() not in WORK_STEPS or not (root / ROUTER).exists():
        return []
    evidence = data.get("standards")
    if not isinstance(evidence, dict):
        return ["standards: resolve output required for this step"]
    try:
        tags = strings(evidence.get("tags"), "standards.tags")
        if type(evidence.get("all")) is not bool:
            raise ValueError("standards.all: boolean required")
        expected = resolve(root, tags, evidence["all"])
        if evidence != expected:
            return ["standards: stale or incomplete routing evidence; resolve again and review changed contracts"]
        if str(data["step"]).strip().lower() in IMPLEMENTATION_STEPS:
            if set(tags) & {"document-only", "status-only"}:
                return ["standards: non-work tags cannot exempt implementation/verification steps"]
            if any(not source["ready"] for source in expected["sources"]):
                return ["standards: selected source is empty or TBD; complete its contract before implementation/verification"]
            decisions = data.get('standardsDecisions', {})
            candidates = set(expected['inactive_candidates'])
            if not isinstance(decisions, dict) or set(decisions) != candidates:
                return ['standards: standardsDecisions must cover exactly the current inactive_candidates']
            for name, decision in decisions.items():
                if not isinstance(decision, dict) or decision.get('decision') not in {'applicable', 'not-applicable'}:
                    return [f'standards: {name} requires an applicability decision']
                if any(not isinstance(decision.get(key), str) or not decision[key].strip() for key in ('scope', 'reason')):
                    return [f'standards: {name} requires bounded scope and reason']
                if decision['decision'] == 'applicable':
                    return [f'standards: activate applicable {name} and resolve again before implementation']
    except (ValueError, OSError) as exc:
        return [f"standards: {exc}"]
    return []


def install(source: Path, target: Path):
    from distribution import is_os_metadata
    source, target = source.resolve(), target.resolve()
    if source == target:
        raise ValueError("installation target must differ from source")
    if load_router(source) is None:
        raise ValueError("installer source has no standards router")
    if not (source / POLICY_DIGEST).is_file():
        raise ValueError("installer source has no product constitution digest")
    starter = inside(source, "project-starter.html")
    if not starter.is_file():
        raise ValueError("installer source has no project-starter.html")
    # Preflight before writing; preserve any project-adopted asset on upgrade.
    preserved_pack_files = set()
    if (source / 'designs/assets/registry.json').exists():
        from assets import load as load_asset_pack, REGISTRY, LOCK
        _, source_lock = load_asset_pack(source)
        if (target / REGISTRY).exists() or (target / LOCK).exists():
            _, target_lock = load_asset_pack(target)
            preserved_pack_files = set(source_lock['files']) | set(target_lock['files']) | {LOCK}
            if source_lock != target_lock:
                print('KEEP company asset release; explicit company-pack upgrade and consumer verification required')
        else:
            for relative, expected in source_lock['files'].items():
                destination = inside(target, relative)
                if destination.exists() and (not destination.is_file() or hashlib.sha256(destination.read_bytes()).hexdigest() != expected):
                    raise ValueError(f'company asset conflicts with existing user file: {relative}; choose a company-pack migration before installing')
    asset_copies = []
    for original in sorted((source / "designs/assets").rglob("*")):
        if original.is_file() and not any(is_os_metadata(part) for part in original.relative_to(source).parts):
            relative = original.relative_to(source)
            inside(source, str(relative))
            if str(relative) in preserved_pack_files:
                continue
            asset_copies.append((original, inside(target, str(relative))))
    canonical = inside(target, "standards/design.md")
    legacy = inside(target, "designs/design.md")
    canonical.parent.mkdir(parents=True, exist_ok=True)
    if not canonical.exists() and legacy.is_file():
        shutil.copy2(legacy, canonical)
        print("MIGRATED designs/design.md -> standards/design.md (legacy retained)")
    if canonical.is_file() and legacy.is_file() and canonical.read_bytes() != legacy.read_bytes():
        print("WARN design files differ; standards/design.md is canonical; review legacy references")
    for original in sorted((source / "standards").rglob("*")):
        if original.is_file() and not any(is_os_metadata(part) for part in original.relative_to(source).parts):
            relative = original.relative_to(source)
            destination = inside(target, str(relative))
            if destination.exists():
                print(f"KEEP {relative}")
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(original, destination)
                print(f"INSTALL {relative}")
    install_constitution(source, target)
    installed_assets = 0
    for original, destination in asset_copies:
        if not destination.exists():
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(original, destination)
            installed_assets += 1
    print(f"INSTALL assets: {installed_assets} added; existing files preserved")
    shutil.copy2(starter, inside(target, "project-starter.html"))
    print("INSTALL project-starter.html (PRD and design preparation)")
    target_router = load_router(target)
    source_router = load_router(source)
    routed = lambda router: any(e.get('asset_ids') or e.get('asset_kinds') for e in router['standards'].values()
                                if e['profile'] in router['active_profiles'])
    if routed(source_router) and not routed(target_router):
        print('[안내] 기존 표준 라우터를 보존했습니다. $altool setup에서 UI 지침·자산 라우팅과 회사 팩 업그레이드를 함께 검토해야 합니다.')
    agents = inside(target, "AGENTS.md")
    if not agents.is_file() or "altool/standards.md" not in agents.read_text(encoding="utf-8"):
        print("[안내] 기존 AGENTS의 표준 진입 안내를 확인해야 합니다. $altool setup에서 AI가 기존 지침을 보존하며 보완합니다.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["validate", "resolve", "read", "install"])
    parser.add_argument("--root", default=".")
    parser.add_argument("--source", help="installer source root (install only)")
    parser.add_argument("--tag", action="append", default=[])
    parser.add_argument("--all", action="store_true", dest="all_standards")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    try:
        if args.command == "install":
            if not args.source:
                raise ValueError("install requires --source")
            install(Path(args.source), root)
        elif args.command == "validate":
            data = load_router(root)
            print("PASS standards router" if data else "LEGACY no standards router; use existing project policies")
        else:
            result = resolve(root, args.tag, args.all_standards)
            print(json.dumps(result, ensure_ascii=False, indent=2))
            if args.command == "read":
                for record in result["sources"]:
                    for start, end, content in excerpts(root, record):
                        print(f"\n--- {record['source']}:{start}-{end} sha256={record['sha256']} ---\n{content}")
        return 0
    except (ValueError, OSError) as exc:
        print(f"FAIL standards: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
