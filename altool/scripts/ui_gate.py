"""Validate source-backed screen contracts and replay their measured values."""
from __future__ import annotations

import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

STEPS = {'spec', 'analyze', 'fix', 'browser', 'freedom'}
IGNORED = {'.git', '.altool', 'node_modules', '.next', '__pycache__', 'dist', 'build', 'coverage', 'test-results', 'playwright-report'}


def inside(root, relative):
    if not isinstance(relative, str) or not relative.strip() or Path(relative).is_absolute():
        raise ValueError('UI path must be a non-empty project-relative path')
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError('UI path escapes project root')
    return path


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_record(root, record):
    if not isinstance(record, dict):
        raise ValueError('UI evidence requires path/sha256')
    path = inside(root, record.get('path'))
    if not path.is_file() or digest(path) != record.get('sha256'):
        raise ValueError(f'UI file missing/changed: {record.get("path")}')
    return path


def implementation_digest(root, paths):
    if not isinstance(paths, list) or not paths:
        raise ValueError('UI implementation paths are required')
    files = set()
    for relative in paths:
        path = inside(root, relative)
        if path == root.resolve() or not path.exists():
            raise ValueError('UI implementation must name existing app files/directories, not root')
        candidates = path.rglob('*') if path.is_dir() else [path]
        for candidate in candidates:
            rel = candidate.relative_to(root.resolve())
            if not set(rel.parts).intersection(IGNORED) and candidate.is_file():
                inside(root, rel.as_posix())  # Reject symlinks escaping the project.
                files.add(rel.as_posix())
    if not files:
        raise ValueError('UI implementation scope has no files')
    pairs = [[name, digest(root / name)] for name in sorted(files)]
    return hashlib.sha256(json.dumps(pairs, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def canonical_contract_path(feature):
    if not isinstance(feature, str) or not feature or '/' in feature or '\\' in feature or feature in {'.', '..'}:
        raise ValueError('Invalid UI feature')
    return f'.altool/ui/{feature}.contracts.json'


def required(data, root):
    tags = (data.get('standards') or {}).get('tags', [])
    sources = (data.get('standards') or {}).get('sources', [])
    return bool(data.get('ui') or any(t == 'ui-change' or t.endswith('-ui') for t in tags)
                or any(str(s.get('id', '')).startswith('ui-') for s in sources)
                or inside(root, canonical_contract_path(data.get('feature'))).exists())


def load_contracts(root, data):
    ui = data.get('ui')
    if not isinstance(ui, dict):
        raise ValueError('UI work requires ui.contracts; a done string is not measured evidence')
    record = ui.get('contracts')
    path = read_record(root, record)
    if record['path'] != canonical_contract_path(data.get('feature')):
        raise ValueError('UI contract must use the feature canonical path')
    manifest = json.loads(path.read_text(encoding='utf-8'))
    if manifest.get('schemaVersion') != 1 or manifest.get('feature') != data['feature']:
        raise ValueError('UI contract schema/feature mismatch')
    sources = manifest.get('sources')
    if not isinstance(sources, list) or not sources:
        raise ValueError('UI contracts require design source hashes')
    source_paths = {read_record(root, source).relative_to(root.resolve()).as_posix() for source in sources}
    contracts = manifest.get('contracts')
    if not isinstance(contracts, list) or not contracts:
        raise ValueError('UI contracts cannot be empty')
    ids = set()
    for contract in contracts:
        if not isinstance(contract, dict):
            raise ValueError('UI contract must be an object')
        ident = contract.get('id')
        if not isinstance(ident, str) or not ident.strip() or ident in ids:
            raise ValueError('UI contract missing/duplicate ID')
        ids.add(ident)
        count = contract.get('expectedCount', 1 if contract.get('kind') != 'text' else None)
        if not isinstance(count, int) or isinstance(count, bool) or count <= 0:
            raise ValueError(f'{ident}: expectedCount required for text collections')
        for key in ('selector', 'state', 'source', 'page'):
            if not isinstance(contract.get(key), str) or not contract[key].strip():
                raise ValueError(f'{ident}: {key} required')
        if contract['source'] not in source_paths:
            raise ValueError(f'{ident}: unknown design source')
        if not contract['page'].startswith('/') or contract['page'].startswith('//'):
            raise ValueError(f'{ident}: page must be a relative route')
        viewport = contract.get('viewport', {})
        if not isinstance(viewport, dict) or any(not numeric(viewport.get(key)) or viewport[key] <= 0 for key in ('width', 'height')):
            raise ValueError(f'{ident}: invalid viewport')
        kind = contract.get('kind')
        if kind == 'style':
            expected = contract.get('expected')
            if not isinstance(expected, dict) or not expected or any(not numeric(v) and not (isinstance(v, str) and v.strip()) for v in expected.values()):
                raise ValueError(f'{ident}: invalid expected styles')
        elif kind == 'text':
            if not numeric(contract.get('minimum')) or contract['minimum'] <= 0:
                raise ValueError(f'{ident}: invalid minimum text size')
        elif kind == 'icon':
            if not isinstance(contract.get('src'), str) or not contract['src'].strip():
                raise ValueError(f'{ident}: icon src required')
        elif kind != 'entry':
            raise ValueError(f'{ident}: unsupported contract kind')
    if not isinstance(manifest.get('implementation'), list) or not manifest['implementation']:
        raise ValueError('UI implementation scope required')
    # Spec may precede creation of implementation files; Browser verifies content.
    for name in manifest['implementation']:
        if inside(root, name) == root.resolve():
            raise ValueError('UI implementation cannot be the project root')
    return manifest


def numeric(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_ui_evidence(data, root):
    step = str(data.get('step', '')).strip().casefold()
    if step not in STEPS:
        return []
    try:
        if not required(data, root):
            return []
        # A Freedom cycle without browser work has no new display completion claim.
        reference = data.get('checks', {}).get('visual.reference_comparison', {})
        if step == 'freedom' and reference.get('status') == 'skipped' and reference.get('reason') == 'no browser action':
            return []
        manifest = load_contracts(root, data)
        gate = data.get('checks', {}).get('visual.ui_contracts', {})
        status = gate.get('status')
        if step in {'analyze', 'fix'} and status == 'failed' and str(gate.get('reason', '')).strip():
            return []  # An explicit gap is allowed here, never in Browser completion.
        if status != 'done':
            raise ValueError('visual.ui_contracts must be done (Analyze/Fix may record a failed gap)')
        if step == 'spec':
            return []
        ui = data['ui']
        owner = inside(root, f'.altool/checks/{data["feature"]}.spec.json')
        owner_data = json.loads(owner.read_text(encoding='utf-8'))
        if owner_data.get('step') != 'spec' or owner_data.get('feature') != data['feature'] or owner_data.get('ui', {}).get('contracts') != ui['contracts']:
            raise ValueError('UI contract differs from its Spec owner check')
        report = json.loads(read_record(root, ui.get('measurements')).read_text(encoding='utf-8'))
        if report.get('schemaVersion') != 1 or report.get('feature') != data['feature']:
            raise ValueError('UI measurement schema/feature mismatch')
        if report.get('contractsSha256') != ui['contracts']['sha256']:
            raise ValueError('UI measurement uses stale contracts')
        if report.get('implementationSha256') != implementation_digest(root, manifest['implementation']):
            raise ValueError('UI measurement uses stale implementation; rerun the browser')
        rows = report.get('observations')
        if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
            raise ValueError('UI observations array required')
        expected = {c['id']: c for c in manifest['contracts']}
        runtime = data.get('runtime', {})
        target = urlsplit(runtime.get('url', ''))
        if target.scheme not in {'http', 'https'} or not target.hostname or not all(isinstance(runtime.get(key), str) and runtime[key].strip() for key in ('source', 'identity')):
            raise ValueError('UI runtime requires actual url, address source and app identity evidence')
        for row in rows:
            contract = expected.get(row.get('id'))
            url = urlsplit(row.get('url', ''))
            if url.scheme not in {'http', 'https'} or not url.hostname:
                raise ValueError('UI observation needs actual HTTP(S) URL')
            if (url.scheme, url.netloc) != (target.scheme, target.netloc):
                raise ValueError('UI observation origin differs from selected runtime URL')
            route = url.path or '/'
            if url.query:
                route += '?' + url.query
            if url.fragment:
                route += '#' + url.fragment
            if not contract or route != contract['page'] or row.get('state') != contract['state']:
                raise ValueError('UI observation route/state/ID mismatch')
        node = shutil.which('node')
        if not node:
            raise ValueError('Node is required to replay UI measurements')
        result = subprocess.run([node, str(Path(__file__).with_name('ui-measurements.mjs'))],
                                input=json.dumps({'contracts': manifest['contracts'], 'observations': rows}),
                                text=True, encoding='utf-8', capture_output=True, timeout=30)
        replay = json.loads(result.stdout)
        if result.returncode or replay.get('valid') is not True:
            raise ValueError('; '.join(replay.get('failures', ['UI comparison failed'])))
        return []
    except (ValueError, OSError, TypeError, AttributeError, KeyError, subprocess.SubprocessError) as error:
        return [f'ui: {error}']


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Compute current implementation fingerprint for actual UI measurements')
    parser.add_argument('--root', default='.')
    parser.add_argument('--contracts', required=True, help='project-relative contracts JSON')
    args = parser.parse_args()
    try:
        project = Path(args.root).resolve()
        contract_path = inside(project, args.contracts)
        manifest = json.loads(contract_path.read_text(encoding='utf-8'))
        print(json.dumps({'contractsSha256': digest(contract_path),
                          'implementationSha256': implementation_digest(project, manifest['implementation'])}))
    except (ValueError, OSError, KeyError, TypeError) as error:
        parser.exit(1, f'FAIL UI fingerprint: {error}\n')
