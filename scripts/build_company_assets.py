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
                target = stage / relative.removeprefix('designs/assets/')
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
    import subprocess
    subprocess.run([sys.executable, str(BASE / 'ui-kit/internal/foundations/build_adapter.py'), '--check'], check=True)
    upstream = BASE / 'ui-kit/internal/upstream'
    manifest = read_json(BASE / 'ui-kit/internal/upstream-manifest.json')
    actual = {str(p.relative_to(upstream)): digest(p) for p in upstream.rglob('*') if p.is_file()}
    if actual != manifest['sha256']:
        raise ValueError('Official source drift; restore it before authoring a release')
    items = []

    def add(identifier, kind, meaning, variants, **extra):
        if any(i['id'] == identifier for i in items):
            raise ValueError(f'Duplicate semantic ID: {identifier}')
        items.append(dict(id=identifier, kind=kind, meaning=meaning,
                          defaultVariant=next(iter(variants)), variants=variants, **extra))

    def record(path, **extra):
        return dict(path=str(path.relative_to(BASE)), dependencies=[], states=['default'], **extra)

    aliases = {'setting': ('settings', '설정 환경설정 톱니바퀴'), 'sch': ('search', '검색 찾기 돋보기'),
               'bread_home': ('home', '홈 첫 화면'), 'pw_visible_on': ('password-visible', '비밀번호 표시'),
               'pw_visible_off': ('password-hidden', '비밀번호 숨기기'), 'my': ('account', '내 계정 사용자'),
               'reset': ('reset', '초기화 다시 설정'), 'close': ('close', '닫기'), 'delete': ('delete', '삭제'),
               'download': ('download', '다운로드 내려받기'), 'upload': ('upload', '업로드 파일 올리기'),
               'help': ('help', '도움말'), 'filter': ('filter', '필터 조건'), 'calendar': ('calendar', '날짜 달력')}
    groups = {}
    for file in sorted((upstream / 'resources/img/component/icon').glob('*.svg')):
        stem = file.stem.removeprefix('ico_')
        if re.search(r'logo|flag|youtube|instagram|facebook|sns_x|blog|file_(figma|sketch|xd)|login_certify', stem):
            continue  # Identity and provider-specific assets remain reference-only.
        name = stem
        suffixes = []
        for suffix in ('high_contrast', 'inverse', 'disabled', 'blue', 'checked', 'fill'):
            if name.endswith('_' + suffix):
                name = name[:-(len(suffix)+1)]
                suffixes.insert(0, suffix.replace('_', '-'))
        slug, meaning = aliases.get(name, (name.replace('_', '-'), name.replace('_', ' ')))
        variant = '-'.join(suffixes) or 'default'
        group = groups.setdefault(slug, {'meaning': meaning, 'variants': {}})
        group['variants'][variant] = record(file)
    for slug, group in groups.items():
        variants = group['variants']
        variants = dict(sorted(variants.items(), key=lambda pair: (pair[0] != 'default', pair[0])))
        add('icon.' + slug, 'icon', group['meaning'], variants,
            constraints=['같은 의미의 그림을 다시 그리지 않는다.', '허용 크기16/20/24/32/48px; 의미 있는 이름 또는 장식 alt를 지정한다.'])
    for direction, meaning in {'left': '왼쪽 이전', 'right': '오른쪽 다음',
                               'up': '위쪽 접기', 'down': '아래쪽 펼치기'}.items():
        add('icon.chevron-' + direction, 'icon', meaning + ' 방향 고정 꺾쇠',
            {variant: record(BASE / f'icons/directions/chevron-{direction}-{variant}.svg')
             for variant in ('default', 'inverse', 'disabled', 'disabled-inverse')},
            constraints=['방향에 맞는 의미 ID를 선택하고 앱에서 추가 회전하지 않는다.',
                         '허용 크기16/20/24/32/48px; 텍스트 이름 또는 장식 alt를 지정한다.'])
    messages = read_json(BASE / 'messages/ko.json')
    for name, value in messages['messages'].items():
        semantic_name = re.sub(r'[A-Z]', lambda match: '-' + match[0].lower(), name)
        add('message.' + semantic_name, 'message', value['title'],
            {'default': record(BASE / 'messages/ko.json', key=name)},
            constraints=['문구를 직접 복사·재작성하지 않고 key로 읽는다.', '실제 성공/오류 상태를 확인한 후 표시하며 액션은 앱이 연결한다.'])
    for file in sorted((BASE / 'images').glob('*.svg')):
        add('image.state.' + file.stem, 'image', file.stem,
            {'default': record(file)}, constraints=['텍스트 안내를 병행하며 색상만으로 상태를 구분하지 않는다.'])
    add('brand.symbol', 'brand', 'Altool 샘플 심볼; 회사 CI 지정 전 교체 대상',
        {'sample': record(BASE / 'brand/altool-symbol.svg')}, constraints=['회사 로고 확정으로 오인하지 않는다. 회사 공통 릴리스에서 한 번 교체한다.'])
    add('brand.wordmark', 'brand', 'Altool 샘플 워드마크; 회사 CI 지정 전 교체 대상',
        {'sample': record(BASE / 'brand/altool-wordmark.svg'), 'inverse': record(BASE / 'brand/altool-wordmark-inverse.svg')})
    add('foundation.tokens', 'foundation', 'Altool 기본 색상·타이포·간격 CSS 토큰 (KRDS 2024 참고)',
        {'default': record(BASE / 'ui-kit/internal/foundations/tokens-2024.css')},
        constraints=['회사 테마 변경은 공통 팩 릴리스로 배포한다. 앱마다 다른 토큰을 만들지 않는다.'])
    add('foundation.layout', 'foundation', '반응형 그리드·본문 간격·사이드 내비게이션 배치',
        {name: dict(path='ui-kit/internal/foundations/layout.html',
                    dependencies=['ui-kit/internal/foundations/layout.css', 'ui-kit/internal/foundations/tokens-2024.css'],
                    states=['desktop', 'tablet', 'mobile'], sourceSection=name)
         for name in ('contained', 'fluid', 'contained-sidebar', 'fluid-sidebar')},
        constraints=['선택한 배치의 마크업과 공통 CSS를 함께 사용한다. 예제 메뉴·내용은 실제 과업으로 교체한다.',
                     '좁은 화면에서는 DOM의 읽기 순서를 유지하고 가로 넘침 없이 재배치한다.'])
    for folder in ('components', 'patterns/basic', 'patterns/services'):
        path = BASE / 'ui-kit/internal' / folder / 'variants-manifest.json'
        if not path.is_file():
            raise ValueError(f'Missing full variant inventory: {path}')
        for item in read_json(path)['items']:
            if any(existing['id'] == item['id'] for existing in items):
                raise ValueError(f'Duplicate manifest semantic ID: {item["id"]}')
            items.append(item)
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
    registry = {'version': 1, 'pack': 'altool-company-ui', 'release': release,
                'items': sorted(items, key=lambda item: item['id'])}
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
