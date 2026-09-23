#!/usr/bin/env python3
"""Explicit product release authoring. Not a consumer verification/auto-repair command."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
import contextlib
import io
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'designs/assets'
sys.path.insert(0, str(ROOT / 'altool/scripts'))
sys.path.insert(0, str(ROOT / 'scripts'))
from assets import inside, digest, read_json
from build_company_design import build as build_design


def verify_distribution_css(paths):
    """Scan the CSS actually pinned for distribution, including dependencies."""
    import check
    with tempfile.TemporaryDirectory(prefix='altool-css-release-') as folder:
        stage = Path(folder)
        for relative in paths:
            if relative.startswith('designs/assets/ui-kit/design/'):
                continue  # Pinned authoring sources are not loaded as runtime styles.
            if relative.endswith('.css'):
                # The generic scanner excludes build folders named dist. These are
                # explicitly selected release assets, so scan them under a neutral path.
                target = stage / relative.removeprefix('designs/assets/').replace('/dist/', '/release-css/')
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(inside(ROOT, relative), target)
        args = argparse.Namespace(root=str(stage), format='text', minimum=4.5)
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            failed = check.css_vars_cmd(args) | check.contrast_cmd(args)
        if failed:
            raise ValueError('Distribution CSS preflight failed:\n' + output.getvalue())
        return output.getvalue()


def build(release):
    if not re.fullmatch(r'\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?', release):
        raise ValueError('Use a semantic release version')
    build_design(BASE / 'ui-kit', check=True)
    from build_company_bundle import build_bundle
    build_bundle(BASE / 'ui-kit', check=True)
    items = []

    def add(identifier, kind, meaning, variants, **extra):
        if any(i['id'] == identifier for i in items):
            raise ValueError(f'Duplicate semantic ID: {identifier}')
        items.append(dict(id=identifier, kind=kind, meaning=meaning,
                          defaultVariant=next(iter(variants)), variants=variants, **extra))

    def record(path, **extra):
        return dict(path=str(path.relative_to(BASE)), dependencies=[], states=['default'], **extra)

    messages = read_json(BASE / 'messages/ko.json')
    for name, value in messages['messages'].items():
        semantic_name = re.sub(r'[A-Z]', lambda match: '-' + match[0].lower(), name)
        add('message.' + semantic_name, 'message', value['title'],
            {'default': record(BASE / 'messages/ko.json', key=name)},
            constraints=['문구를 직접 복사·재작성하지 않고 key로 읽는다.', '실제 성공/오류 상태를 확인한 후 표시하며 액션은 앱이 연결한다.'])
    for file in sorted((BASE / 'images').glob('*.svg')):
        add('image.state.' + file.stem, 'image', file.stem,
            {'default': record(file)}, constraints=['텍스트 안내를 병행하며 색상만으로 상태를 구분하지 않는다.'])
    add('brand.wordmark', 'brand', 'Altool 승인 CI: 투명 배경·녹색 그라데이션·흰색 글자',
        {'inverse': record(BASE / 'brand/altool-wordmark-inverse.svg')},
        constraints=['흰색 글자가 식별되는 어두운 배경에 사용한다. 회사명과 경로는 design/company.json을 따른다.'])
    from company_registration import apply_company_registration
    apply_company_registration(BASE, items)
    guidance = read_json(BASE / 'guidance/map.json')
    if guidance.get('version') != 1 or set(guidance['items']) != {item['id'] for item in items}:
        raise ValueError('Every semantic asset requires exactly one company guidance mapping')
    for item in items:
        item['guidance'] = guidance['items'][item['id']]
        from assets import guidance_record
        guidance_record(ROOT, item['guidance'])
        for reference in item['guidance']['references']:
            if not inside(ROOT, reference).is_file():
                raise ValueError(f'Missing guidance reference: {reference}')
        for variant in item['variants'].values():
            paths = [variant['path']] + variant.get('dependencies', [])
            normalized = []
            for path in paths:
                relative = path if path.startswith('designs/assets/') else 'designs/assets/' + path
                if not inside(ROOT, relative).is_file():
                    raise ValueError(f'Missing selected asset: {relative}')
                normalized.append(relative)
            variant['path'], variant['dependencies'] = normalized[0], sorted(set(normalized[1:]))
    registry = {'version': 1, 'designSystem': 'company-v27-only', 'pack': 'altool-company-ui', 'release': release,
                'items': sorted(items, key=lambda item: item['id'])}
    from assets import validate_company_design
    validate_company_design(ROOT, registry)
    text = json.dumps(registry, ensure_ascii=False, indent=2) + '\n'
    files = {'designs/assets/registry.json': hashlib.sha256(text.encode()).hexdigest()}
    # Pin adopted company guidance with code; optional source references are not policy.
    files['designs/assets/guidance/map.json'] = digest(BASE / 'guidance/map.json')
    for item in items:
        path = item['guidance']['source']
        files[path] = digest(inside(ROOT, path))
        for variant in item['variants'].values():
            for path in [variant['path']] + variant.get('dependencies', []):
                files[path] = digest(inside(ROOT, path))
    for file in (BASE / 'runtime').glob('*'):
        if file.is_file():
            files[str(file.relative_to(ROOT))] = digest(file)
    for file in (BASE / 'ui-kit/design').glob('*'):
        if file.is_file():
            files[str(file.relative_to(ROOT))] = digest(file)
    # Pin company APIs, previews, source selection and their relative dependencies.
    for file in (BASE / 'ui-kit/internal/company').rglob('*'):
        if file.is_file() and '__pycache__' not in file.parts and file.name != '.DS_Store':
            files[str(file.relative_to(ROOT))] = digest(file)
    preflight = verify_distribution_css(files)
    print(preflight, end='')
    lock = {'version': 1, 'pack': registry['pack'], 'release': release, 'files': dict(sorted(files.items()))}
    previous = BASE / 'pack.lock.json'
    history_path = BASE / 'releases.json'
    history = read_json(history_path) if history_path.exists() else {'version': 1, 'pack': registry['pack'], 'releases': {}}
    if history.get('version') != 1 or history.get('pack') != registry['pack'] or not isinstance(history.get('releases'), dict):
        raise ValueError('Invalid company release history')
    lock_text = json.dumps(lock, ensure_ascii=False, indent=2) + '\n'
    lock_hash = hashlib.sha256(lock_text.encode()).hexdigest()
    if previous.exists():
        old = read_json(previous)
        old_hash = digest(previous)
        if old['release'] in history['releases'] and history['releases'][old['release']] != old_hash:
            raise ValueError('Current release lock differs from recorded release history')
        history['releases'][old['release']] = old_hash
        if old['release'] == release and old != lock:
            raise ValueError('Changed content requires a new release; never overwrite an existing release version')
    if release in history['releases'] and history['releases'][release] != lock_hash:
        raise ValueError('Changed content requires a new release; this historical version was already published')
    history['releases'][release] = lock_hash
    (BASE / 'registry.json').write_text(text, encoding='utf-8')
    previous.write_text(lock_text, encoding='utf-8')
    history_path.write_text(json.dumps(history, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    # Keep the actual static preflight report without changing the immutable lock.
    reports = BASE / 'release-reports'
    reports.mkdir(exist_ok=True)
    (reports / f'{release}.txt').write_text(preflight, encoding='utf-8')
    print(f'Released {registry["pack"]}@{release}: {len(items)} semantic assets, {len(files)} pinned files')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--release', required=True)
    args = parser.parse_args()
    build(args.release)
