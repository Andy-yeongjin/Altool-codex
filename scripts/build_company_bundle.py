"""Generate the company bundle from canonical CSS, JS, icons and message sources."""
import importlib.util
import hashlib
import json
from pathlib import Path
import re
import runpy
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

BUNDLE_PARTS = ['foundations/layout.css'] + ['components/' + name + '.css' for name in (
    'runtime', 'enterprise', 'icons', 'forms', 'navigation', 'feedback',
    'dialogs', 'sections', 'menus', 'data-states', 'tooltips', 'attachments', 'accordions',
    'site-navigation', 'progress', 'summaries', 'search-assist', 'page-frame', 'select',
    'business', 'filter-bar', 'extensions', 'recipes')]


def render(kit, company):
    from build_company_design import outputs
    styles = outputs(kit)
    for name, css in styles.items():
        path = company / 'dist' / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(css, encoding='utf-8')
    css = styles['foundations/tokens-2024.css'] + '\n' + '\n'.join(styles[name] for name in BUNDLE_PARTS)
    (company / 'dist/company.css').write_text(css, encoding='utf-8')
    for output, mirror in [('components/extensions.css', 'extensions/styles.css'), ('components/recipes.css', 'recipes/recipes.css')]:
        (company / mirror).write_text(styles[output], encoding='utf-8')
    spec = importlib.util.spec_from_file_location('company_icons_build', company / 'scripts/build_icons.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    manifest, _ = module.build()
    selection = json.loads((company / 'selection.json').read_text(encoding='utf-8'))
    for icon in manifest['icons']:
        icon['semanticId'] = 'icon.' + selection['iconAliases'].get(icon['id'], icon['id'])
    (company / 'dist/assets/icons.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    messages = json.loads((kit.parent / 'messages/ko.json').read_text(encoding='utf-8'))
    identity = json.loads((kit / 'design/company.json').read_text(encoding='utf-8'))
    if not isinstance(identity.get('name'), str) or not identity['name'].strip():
        raise ValueError('company.json requires a non-empty company name')
    ci_versions = {}
    for path in identity['ci'].values():
        resolved = (kit.parent / path).resolve()
        if not resolved.is_relative_to((kit.parent / 'brand').resolve()) or not resolved.is_file():
            raise ValueError(f'CI must reference an existing shared brand asset: {path}')
        ci_versions[path] = hashlib.sha256(resolved.read_bytes()).hexdigest()[:16]
    for url in identity['links'].values():
        if url is not None and not (isinstance(url, str) and url.startswith(('https://', 'mailto:', '/', './', '../')) and not url.startswith('//')):
            raise ValueError('Company links must be HTTPS, mailto, or local paths')
    prefix = '// Generated from messages/ko.json; do not edit.\n' + 'globalThis.CompanyMessages = ' + json.dumps(messages, ensure_ascii=False) + ';\n'
    for name in ('business.js', 'select.js'):
        source = (company / 'js' / name).read_text(encoding='utf-8')
        if name == 'business.js':
            actions = json.loads((company / 'button-actions.json').read_text(encoding='utf-8'))
            def svg_node(node):
                return {'tag': node.tag.split('}')[-1], 'attrs': dict(node.attrib),
                        'children': [svg_node(child) for child in node]}
            icons = {key: svg_node(ET.parse(company / 'dist/assets/icons' / f'{key}.svg').getroot())
                     for key in sorted({'menu', 'calendar', 'chevron-left', 'chevron-right', 'search', 'plus', 'file', 'trash', 'x'} | {item['icon'] for item in actions.values()})}
            source = source.replace('/* BUILTIN_ICONS */ {}', json.dumps(icons, ensure_ascii=False))
            source = source.replace('/* BUTTON_ACTIONS */ {}', json.dumps(actions, ensure_ascii=False))
            source = source.replace('/* COMPANY_IDENTITY */ {}', json.dumps(identity, ensure_ascii=False))
            source = source.replace('/* COMPANY_CI_VERSIONS */ {}', json.dumps(ci_versions))
        (company / 'dist' / name).write_text((prefix if name == 'business.js' else '') + source, encoding='utf-8')
    # Imported examples are maintained here, not in the user's delivery directory.
    for page in [*company.glob('*preview.html'), company / 'catalog.html']:
        text = page.read_text(encoding='utf-8')
        text, count = re.subn(r'<style>.*?</style>', lambda _: '<style>' + css + '</style>', text, count=1, flags=re.S)
        if count != 1:
            raise ValueError(f'Missing preview CSS: {page}')
        # Embedded runtime copies must follow the canonical JS too.
        text = re.sub(r'<script>(?:/\* Company business UI.*?|// Generated from messages/ko.json.*?)</script>',
                      lambda _: '<script>' + (company / 'dist/business.js').read_text(encoding='utf-8') + '</script>', text, flags=re.S)
        page.write_text(text, encoding='utf-8')
    runpy.run_path(str(company / 'scripts/build_business_preview.py'))
    subprocess.run(['node', str(company / 'extensions/build.mjs')], check=True, capture_output=True)
    subprocess.run(['node', str(company / 'recipes/build-registry.cjs')], check=True, capture_output=True)


def build_bundle(kit, check=False):
    company = kit / 'internal/company'
    if not company.is_dir():
        raise ValueError('Missing company UI sources')
    if not check:
        render(kit, company)
        return
    with tempfile.TemporaryDirectory(prefix='altool-company-bundle-') as directory:
        stage = Path(directory) / 'company'
        shutil.copytree(company, stage, ignore=shutil.ignore_patterns('__pycache__', '.DS_Store'))
        render(kit, stage)
        for file in stage.rglob('*'):
            if file.is_file() and '__pycache__' not in file.parts and file.name != '.DS_Store':
                relative = file.relative_to(stage)
                target = company / relative
                if not target.is_file() or file.read_bytes() != target.read_bytes():
                    raise ValueError(f'Stale company bundle: {relative}')
