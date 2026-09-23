#!/usr/bin/env python3
"""Resolve pinned semantic assets and check actual consumer references, never rebaseline."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

BASE = 'designs/assets'
REGISTRY = BASE + '/registry.json'
LOCK = BASE + '/pack.lock.json'
ID = re.compile(r'^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$')
STEPS = {'run', 'fix', 'analyze', 'browser', 'oneshot', 'freedom'}
KINDS = {'foundation', 'brand', 'icon', 'image', 'message', 'component', 'pattern', 'service'}
RULE = re.compile(r'^- (?:(필수|기본값|예시) )?([A-Z][A-Z0-9-]*): (.+)$', re.MULTILINE)


def rule_records(content):
    # Tables/subclauses remain evidence under their owner, not one check per row.
    kinds = {None: 'required', '필수': 'required', '기본값': 'default', '예시': 'example'}
    return [{'id': match[2], 'kind': kinds[match[1]], 'text': match[3]}
            for match in RULE.finditer(content)]


def inside(root, relative):
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute() or '\\' in relative:
        raise ValueError(f'Invalid relative path: {relative!r}')
    result = (root / relative).resolve()
    if not result.is_relative_to(root.resolve()):
        raise ValueError(f'Asset path escapes project: {relative}')
    return result


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate JSON key: {key}')
            result[key] = value
        return result
    return json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=unique)


def uncommented(text):
    """Drop HTML and C-style comments while preserving quoted strings/URLs."""
    text = re.sub(r'<!--[\s\S]*?-->', '', text)
    pattern = r'''("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|//[^\n]*|/\*[\s\S]*?\*/'''
    return re.sub(pattern, lambda match: match[1] or '', text)


def load(root):
    registry = read_json(inside(root, REGISTRY))
    lock = read_json(inside(root, LOCK))
    if registry.get('version') != 1 or lock.get('version') != 1:
        raise ValueError('Unsupported asset registry/lock version')
    for field in ('pack', 'release'):
        if not registry.get(field) or registry[field] != lock.get(field):
            raise ValueError(f'Asset pack {field} mismatch')
    files = lock.get('files')
    if not isinstance(files, dict) or REGISTRY not in files:
        raise ValueError('Asset lock must pin the registry')
    for relative, expected in files.items():
        path = inside(root, relative)
        if not relative.startswith(BASE + '/') or not path.is_file() or digest(path) != expected:
            raise ValueError(f'Pinned asset changed/missing: {relative}; restore the company pack, do not rewrite its lock')
    items = registry.get('items')
    if not isinstance(items, list) or not items:
        raise ValueError('Asset registry requires items')
    seen = set()
    for item in items:
        identifier = item.get('id', '')
        if not ID.fullmatch(identifier) or identifier in seen:
            raise ValueError(f'Invalid/duplicate semantic ID: {identifier}')
        seen.add(identifier)
        if 'guidance' in item:
            if item['guidance'].get('source') not in files:
                raise ValueError(f'Unpinned company guidance: {identifier}')
            guidance_record(root, item['guidance'])
            for reference in item['guidance'].get('references', []):
                if not inside(root, reference).is_file():
                    raise ValueError(f'Missing guidance reference: {reference}')
        variants = item.get('variants', {})
        if not item.get('meaning') or not variants or item.get('defaultVariant') not in variants:
            raise ValueError(f'Missing meaning/default variant: {identifier}')
        for name, variant in variants.items():
            if not isinstance(name, str) or not name or not isinstance(variant, dict):
                raise ValueError(f'Invalid variant: {identifier}')
            paths = [variant.get('path')] + variant.get('dependencies', [])
            for path in paths:
                if not isinstance(path, str) or path not in files:
                    raise ValueError(f'Unpinned variant dependency: {identifier}/{name}/{path}')
    if registry.get('designSystem') == 'company-v27-only':
        validate_company_design(root, registry)
    return registry, lock


def validate_company_design(root, registry):
    """The v2 product has no selectable or installed legacy executable UI."""
    retired = [
        'ui-kit/internal/reference',
        'ui-kit/internal/upstream', 'ui-kit/internal/examples', 'ui-kit/internal/components',
        'ui-kit/internal/foundations', 'ui-kit/internal/patterns', 'icons/directions',
        'ui-kit/internal/company/dist/patterns',
        'ui-kit/internal/company/dist/foundations/company-custom.css',
        'ui-kit/internal/company/dist/components/guided-runtime.css',
    ]
    for relative in retired:
        path = inside(root, BASE + '/' + relative)
        if path.is_file() or (path.is_dir() and any(file.is_file() for file in path.rglob('*'))):
            raise ValueError(f'Retired government UI remains: {relative}')
    company = BASE + '/ui-kit/internal/company/'
    for item in registry['items']:
        for name, variant in item['variants'].items():
            if variant.get('legacyOnly'):
                raise ValueError(f'Retired UI variant: {item["id"]}/{name}')
            if item['kind'] in {'component', 'pattern', 'service', 'foundation', 'icon'} and not variant['path'].startswith(company):
                raise ValueError(f'Non-company UI implementation: {item["id"]}/{name}')
            for path in [variant['path'], *variant.get('dependencies', [])]:
                # Normalize before testing so ../ cannot hide a retired dependency.
                normalized = str(inside(root, path).relative_to(root.resolve()))
                if any(normalized == BASE + '/' + old or normalized.startswith(BASE + '/' + old + '/') for old in retired):
                    raise ValueError(f'Retired UI dependency: {path}')


def resolve(root, identifier, variant=None, *, audience='company'):
    registry, _ = load(root)
    result = resolve_item(registry, identifier, variant, audience=audience)
    if result.get('guidance'):
        record = guidance_record(root, result['guidance'])
        record.pop('content')
        result['guidance'] = {**result['guidance'], **record}
    return result


def resolve_item(registry, identifier, variant=None, *, audience='company'):
    item = next((item for item in registry['items'] if item['id'] == identifier), None)
    if item is None:
        raise ValueError(f'Unknown semantic asset: {identifier}; search or register a shared asset first')
    if item.get('restrictedTo') and audience not in item['restrictedTo']:
        raise ValueError(f'{identifier} is restricted to {item["restrictedTo"]}, not {audience}')
    selected = variant or item['defaultVariant']
    if selected not in item['variants']:
        raise ValueError(f'Unapproved variant {selected!r} for {identifier}')
    result = {'pack': registry['pack'], 'release': registry['release'], 'id': identifier,
            'variant': selected, 'meaning': item['meaning'], **item['variants'][selected],
            'constraints': item.get('constraints', [])}
    if item.get('guidance'):
        result['guidance'] = item['guidance']
    if item.get('sourceSection'):
        result['sourceSection'] = item['sourceSection']
    return result


def guidance_record(root, guidance):
    """Read exactly the adopted company section, not the KRDS reference corpus."""
    from standards import ANCHOR
    source, section = guidance['source'], guidance['section']
    if not source.endswith('.md'):
        raise ValueError('Company guidance must be Markdown')
    path = inside(root, source)
    content = path.read_text(encoding='utf-8')
    anchors = list(ANCHOR.finditer(content))
    names = [m[1] for m in anchors]
    if len(names) != len(set(names)) or section not in names:
        raise ValueError(f'Missing/duplicate company guidance anchor: {source}#{section}')
    index = names.index(section)
    excerpt = content[anchors[index].end():anchors[index + 1].start() if index + 1 < len(anchors) else len(content)]
    rules = rule_records(excerpt)
    if not rules or len({r['id'] for r in rules}) != len(rules):
        raise ValueError(f'Missing/duplicate company guidance rules: {source}#{section}')
    return {'source': source, 'section': section, 'authority': 'company-contract',
            'sha256': digest(path), 'rules': rules, 'content': excerpt.strip()}


def usage_requirements(root, usage, registry=None):
    """Produce pending obligations only; never manufacture passing observations."""
    from standards import resolve as resolve_standards, excerpts, strings, ROUTER
    registry = registry or load(root)[0]
    routing = usage.get('routing')
    requirements, routes = [], []
    if (root / ROUTER).exists():
        if not isinstance(routing, dict) or type(routing.get('all')) is not bool:
            raise ValueError('Usage requires routing from standards.py resolve before UI implementation')
        tags = strings(routing.get('tags'), 'routing.tags')
        expected = resolve_standards(root, tags, routing['all'])
        if routing != expected or not any(s['id'] == 'design' for s in expected['sources']):
            raise ValueError('Usage routing is stale or omits UI standards')
        if set(tags) & {'document-only', 'status-only'}:
            raise ValueError('Non-work routing cannot exempt UI usage')
        routes = expected.get('asset_routes', [])
        for record in expected['sources']:
            for _, _, content in excerpts(root, record):
                for rule in rule_records(content):
                    if rule['kind'] != 'example':
                        requirements.append({**rule, 'id': f"standard:{record['id']}:{rule['id']}",
                                             'source': record['source'], 'sha256': record['sha256']})
    for use in usage.get('uses', []):
        selected = resolve_item(registry, use['id'], use.get('variant'), audience=usage.get('audience', 'company'))
        prefix = f"asset:{selected['id']}@{selected['variant']}:{use['consumer']}"
        if selected.get('guidance'):
            record = guidance_record(root, selected['guidance'])
            for rule in record['rules']:
                if rule['kind'] != 'example':
                    requirements.append({**rule, 'id': prefix + ':' + rule['id'], 'source': record['source'],
                                         'sha256': record['sha256']})
        elif routes:
            raise ValueError('Selected pack lacks company guidance; explicit company-pack upgrade required')
        for index, text in enumerate(selected['constraints'], 1):
            requirements.append({'id': prefix + f':constraint-{index}', 'kind': 'required', 'text': text})
        for state in selected.get('states', []):
            requirements.append({'id': prefix + ':state-' + state, 'kind': 'required', 'text': '선택 변형의 상태/배치/동작 확인: ' + state})
    ids = [record['id'] for record in requirements]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate usage or guideline rule IDs')
    consumers = {file: digest(inside(root, file)) for file in sorted(usage.get('uiFiles', []))}
    payload = {'routing': routing, 'requirements': requirements, 'consumers': consumers,
               'lockSha256': digest(inside(root, LOCK))}
    fingerprint = hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    return {'requirementsSha256': fingerprint, 'requirements': requirements}


def validate_guideline_checks(root, usage, registry):
    from standards import ROUTER, validate_evidence as validate_standards
    if (root / ROUTER).exists():
        errors = validate_standards({'step': 'run', 'standards': usage.get('routing'),
                                     'standardsDecisions': usage.get('standardsDecisions', {})}, root)
        if errors:
            raise ValueError('; '.join(errors))
    result = usage_requirements(root, usage, registry)
    if usage.get('requirementsSha256') != result['requirementsSha256']:
        raise ValueError('Guideline requirements are stale/missing; read guidance and rerun actual checks')
    checks = usage.get('checks')
    if not isinstance(checks, list) or any(not isinstance(c, dict) for c in checks):
        raise ValueError('Guideline checks list required')
    ids = [check.get('id') for check in checks]
    expected = {r['id'] for r in result['requirements']}
    if any(not isinstance(i, str) for i in ids) or len(ids) != len(set(ids)) or set(ids) != expected:
        raise ValueError('Missing, extra or duplicate guideline checks')
    by_id = {r['id']: r for r in result['requirements']}
    for check in checks:
        if check.get('status') not in {'passed', 'not-applicable', 'default-overridden'}:
            raise ValueError(f"Unverified/failed guideline: {check['id']}")
        if check['status'] == 'default-overridden' and by_id[check['id']]['kind'] != 'default':
            raise ValueError('Only a default rule can be overridden; applicable required contracts cannot be waived')
        if not isinstance(check.get('observation'), str) or not check['observation'].strip():
            raise ValueError('Guideline requires actual command/observation')
        if check['status'] in {'not-applicable', 'default-overridden'} and (not isinstance(check.get('reason'), str) or not check['reason'].strip()):
            raise ValueError('Not-applicable guideline requires bounded reason, not an exception waiver')
        evidence = check.get('evidence')
        if not isinstance(evidence, list) or not evidence:
            raise ValueError('Guideline requires test/observation evidence files')
        for record in evidence:
            if not isinstance(record, dict) or digest(inside(root, record.get('path'))) != record.get('sha256'):
                raise ValueError('Guideline observation evidence changed/missing')
    return result['requirementsSha256']


def validate_usage(root, relative):
    registry, lock = load(root)
    usage = read_json(inside(root, relative))
    for field in ('pack', 'release'):
        if usage.get(field) != registry[field]:
            raise ValueError(f'Usage {field} differs from installed company pack')
    if usage.get('lockSha256') != digest(inside(root, LOCK)):
        raise ValueError('Asset usage is stale; review changed assets and rerun actual verification')
    changed = usage.get('uiFiles')
    if not isinstance(changed, list) or not changed or len(set(changed)) != len(changed):
        raise ValueError('Usage must list changed UI files once each')
    for file in changed:
        if not inside(root, file).is_file():
            raise ValueError(f'Missing UI consumer: {file}')
    uses = usage.get('uses')
    if not isinstance(uses, list):
        raise ValueError('Usage uses must be a list')
    covered = set()
    for use in uses:
        resolved = resolve_item(registry, use['id'], use.get('variant'), audience=usage.get('audience', 'company'))
        consumer = use.get('consumer')
        if consumer not in changed:
            raise ValueError(f'Unlisted UI consumer: {consumer}')
        reference = use.get('reference')
        # Require the semantic ID or the selected canonical path, not an arbitrary comment.
        if reference not in (use['id'], resolved['path'], resolved['path'][len(BASE) + 1:]):
            raise ValueError(f'Invalid consumer reference for {use["id"]}')
        content = uncommented(inside(root, consumer).read_text(encoding='utf-8'))
        if not re.search(r'''["'`]''' + re.escape(reference) + r'''["'`]''', content):
            raise ValueError(f'Consumer does not reference {use["id"]}: {consumer}')
        for copy in use.get('copies', []):
            source, target = copy['source'], copy['target']
            if source not in [resolved['path']] + resolved.get('dependencies', []):
                raise ValueError(f'Copy source is not selected asset dependency: {source}')
            if digest(inside(root, target)) != lock['files'][source]:
                raise ValueError(f'Deployed asset differs from company source: {target}')
        covered.add(consumer)
    for local in usage.get('featureOnly', []):
        if local.get('consumer') not in changed or not str(local.get('reason', '')).strip() or not str(local.get('scope', '')).strip():
            raise ValueError('Feature-only UI requires consumer, bounded scope and reason')
        covered.add(local['consumer'])
    if covered != set(changed):
        raise ValueError(f'UI files missing shared asset/feature-only accounting: {sorted(set(changed) - covered)}')
    # Old pinned packs remain readable/installable, but routed UI work requires the new contract.
    from standards import ROUTER
    required = any(item.get('guidance') for item in registry['items']) or (root / ROUTER).exists() or 'routing' in usage
    guidance_hash = validate_guideline_checks(root, usage, registry) if required else None
    return {'usage': relative, 'sha256': digest(inside(root, relative)),
            'consumers': {file: digest(inside(root, file)) for file in sorted(changed)},
            'pack': registry['pack'], 'release': registry['release'], 'lockSha256': digest(inside(root, LOCK)),
            **({'requirementsSha256': guidance_hash} if guidance_hash else {})}


def validate_evidence(data, root):
    if str(data.get('step', '')).strip().casefold() not in STEPS:
        return []
    standards = data.get('standards', {})
    ui = any(tag in standards.get('tags', []) for tag in ('ui-create', 'ui-change', 'ui-review', 'design-source'))
    ui = ui or any(source.get('id') == 'design' for source in standards.get('sources', []))
    ui = ui or 'assets' in data  # Declared UI evidence cannot be hidden by a non-UI tag.
    if not ui:
        return []
    design = root / 'standards/design.md'
    required = (root / REGISTRY).exists() or (design.is_file() and '<!-- altool-assets: required -->' in design.read_text(encoding='utf-8'))
    if not required:
        return []
    try:
        evidence = data.get('assets')
        if not isinstance(evidence, dict) or not evidence.get('usage'):
            raise ValueError('UI Step Check requires assets evidence from assets.py evidence --usage ...')
        expected = validate_usage(root, evidence['usage'])
        usage = read_json(inside(root, evidence['usage']))
        from standards import ROUTER
        if (root / ROUTER).exists() and usage.get('routing') != standards:
            raise ValueError('UI usage routing must match Step Check standards')
        if usage.get('standardsDecisions', {}) != data.get('standardsDecisions', {}):
            raise ValueError('UI usage decisions must match Step Check standardsDecisions')
        if evidence != expected:
            raise ValueError('Asset evidence is stale or incomplete')
    except (ValueError, OSError, KeyError, TypeError) as exc:
        return [f'assets: {exc}']
    return []


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', default='.')
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('validate')
    find = sub.add_parser('find'); find.add_argument('query', nargs='?', default=''); find.add_argument('--kind', choices=sorted(KINDS))
    get = sub.add_parser('resolve'); get.add_argument('id'); get.add_argument('--variant'); get.add_argument('--audience', default='company')
    evidence = sub.add_parser('evidence'); evidence.add_argument('--usage', required=True)
    requirements = sub.add_parser('requirements'); requirements.add_argument('--usage', required=True)
    read = sub.add_parser('read'); read.add_argument('id'); read.add_argument('--variant'); read.add_argument('--audience', default='company')
    args = parser.parse_args()
    root = Path(args.root).resolve()
    try:
        if args.command in ('resolve', 'read'):
            result = resolve(root, args.id, args.variant, audience=args.audience)
        elif args.command == 'requirements':
            result = usage_requirements(root, read_json(inside(root, args.usage)))
        elif args.command == 'evidence':
            result = validate_usage(root, args.usage)
        else:
            registry, _ = load(root)
            if args.command == 'find':
                query = args.query.casefold()
                result = [{'id': i['id'], 'meaning': i['meaning'], 'defaultVariant': i['defaultVariant'],
                           'variants': list(i['variants']), 'restrictedTo': i.get('restrictedTo', [])}
                          for i in registry['items'] if (not args.kind or i['kind'] == args.kind)
                          and query in json.dumps(i, ensure_ascii=False).casefold()]
            else:
                result = {'valid': True, 'pack': registry['pack'], 'release': registry['release'], 'items': len(registry['items'])}
        if args.command == 'read' and result.get('guidance'):
            # Metadata once, selected prose once: do not duplicate all rules in JSON and Markdown.
            result['guidance'].pop('rules', None)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if args.command == 'read' and result.get('guidance'):
            print('\n--- 회사 적용 지침 (참고 원문은 자동 로드하지 않음) ---\n' + guidance_record(root, result['guidance'])['content'])
        return 0
    except (ValueError, OSError, KeyError, TypeError) as exc:
        print(f'FAIL assets: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
