#!/usr/bin/env python3
"""Derive a 16px-root, 2024-token company stylesheet from immutable KRDS 1.1.0.

Only declaration dimension tokens are scaled. At-rule conditions, strings,
comments, URLs and CSS custom-property identifiers are not regex-replaced.
Authoring dependency: requirements.txt. Consumer dependency: generated CSS only.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
from urllib.parse import urlsplit

import tinycss2 as css

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
UPSTREAM = BASE / 'upstream'
SOURCES = {
    'resources/css/token/krds_tokens.css': '2e06b0d8393bca671edaab1ca0c7c42ded2ae03b3d03c6ede60f763a93d81569',
    'resources/css/component/output.css': 'b4e8a9b774c8a9d2bb6628c1708d6060d54592a3e95c121635e779cfc4d0a5e6',
    'resources/css/common/common.css': '92942dcc081821af80677645247ab4ebfedea219fac8729275368ee022e34aab',
}
COMMIT = 'd6bb184c823e4757f05807ea4646a23e3133b6e6'

# Product compatibility repairs, not edits to the pinned upstream distribution.
REFERENCE_REPAIRS = {
    '--krds-side-navigation--4depth-padidng': '--krds-side-navigation--4depth-padding',
    '--krds-pagination--color-action-disabled': '--krds-light-color-action-disabled',
    '--krds-pc-gap-layout-breadcrumb-h2': '--krds-pc-gap-layout-breadcrumb-h1',
    '--krds-mobile-gap-layout-breadcrumb-h2': '--krds-mobile-gap-layout-breadcrumb-h1',
    '--krds-light-alpha-black0': '--krds-color-light-alpha-black0',
    '--krds-language--top-title-pc-font-size': '--krds-pc-font-size-heading-medium',
    '--krds-language--top-title-mobile-font-size': '--krds-mobile-font-size-heading-medium',
    '--krds-language--top-title-sub-pc-font-size': '--krds-pc-font-size-body-large',
    '--krds-language--top-title-sub-mobile-font-size': '--krds-mobile-font-size-body-large',
    **{f'--krds-badge--light-color-{role}-element': f'--krds-badge--color-{role}-element'
       for role in ('secondary', 'gray', 'point', 'danger', 'warning', 'success', 'information', 'disabled')},
}


def rebase_url(value, source):
    if not value or value.startswith(('#', '/', 'data:')) or urlsplit(value).scheme:
        return value
    split = urlsplit(value)
    target = (source.parent / split.path).resolve()
    if not target.is_relative_to(UPSTREAM.resolve()) or not target.is_file():
        raise ValueError(f'Unresolved or escaped upstream URL: {source}: {value}')
    result = Path(os.path.relpath(target, HERE)).as_posix()
    return result + ('?' + split.query if split.query else '') + ('#' + split.fragment if split.fragment else '')


def values(tokens, source):
    result = []
    for token in tokens:
        if token.type == 'dimension' and token.lower_unit == 'rem':
            number = format(token.value * 0.625, '.12g')
            token = css.parse_component_value_list(number + 'rem')[0]
        elif token.type == 'url':
            token = css.parse_component_value_list('url(' + json.dumps(rebase_url(token.value, source)) + ')')[0]
        elif token.type == 'function':
            if token.lower_name == 'url':
                parts = [part for part in token.arguments if part.type not in ('whitespace', 'comment')]
                if len(parts) != 1 or parts[0].type != 'string':
                    raise ValueError('Unsupported URL function')
                token.arguments = css.parse_component_value_list(json.dumps(rebase_url(parts[0].value, source)))
            else:
                if token.lower_name == 'var' and token.arguments:
                    name = token.arguments[0]
                    if name.type == 'ident' and name.value in REFERENCE_REPAIRS:
                        token.arguments[0] = css.parse_component_value_list(REFERENCE_REPAIRS[name.value])[0]
                token.arguments = values(token.arguments, source)
        elif token.type in ('() block', '[] block', '{} block'):
            token.content = values(token.content, source)
        result.append(token)
    return result


def block(tokens, source):
    nodes = css.parse_blocks_contents(tokens, skip_comments=False, skip_whitespace=False)
    return transform(nodes, source)


def transform(nodes, source):
    result = []
    for node in nodes:
        if node.type == 'error':
            raise ValueError(f'{source}: CSS parse error: {node.message}')
        if node.type == 'declaration':
            node.value = values(node.value, source)
        elif node.type == 'qualified-rule':
            content = block(node.content, source)
            selector = css.serialize(node.prelude).strip()
            if selector in {f'[data-krds-mode={mode}] .krds-btn.text.ico-filter .num'
                            for mode in ('high-contrast', 'theme')}:
                content = content.replace('color: var(--krds-high-contrast-color-text-basic-inverse)',
                                          'color: var(--krds24-gray-0)')
            if selector in {f'[data-krds-mode={mode}] .swiper-pagination.swiper-pagination-fraction'
                            for mode in ('high-contrast', 'theme')}:
                content = content.replace('background-color: var(--krds-high-contrast-color-surface-white)',
                                          'background-color: var(--krds24-gray-90)')
            node.content = css.parse_component_value_list(content)
        elif node.type == 'at-rule':
            if node.lower_at_keyword in ('charset', 'import'):
                if node.lower_at_keyword == 'import' and 'krds_tokens.css' not in css.serialize(node.prelude):
                    raise ValueError('Unexpected import: ' + css.serialize(node.prelude))
                continue  # Token source is included once before both source stylesheets.
            if node.content is not None:
                node.content = css.parse_component_value_list(block(node.content, source))
        result.append(node)
    return css.serialize(result)


def normalize(text, source):
    return transform(css.parse_stylesheet(text, skip_comments=False, skip_whitespace=False), source)


def aliases(token_text):
    output = ['\n/* Company policy aliases; not an official 2024 implementation. */', ':root {',
              '  --krds-font-size-base: 100%;', '  --krds-typo-font-type: var(--krds24-font-family);',
              '  --krds-font-family-base: var(--krds24-font-family);']
    names = set(re.findall(r'(--krds-color-light-[\w-]+)\s*:', token_text))
    for name in sorted(names):
        match = re.fullmatch(r'--krds-color-light-(primary|secondary|gray|point|danger|warning|success|information|graphic)-(\d+)', name)
        if match:
            group, level = match.groups()
            group = 'secondary' if group == 'graphic' else group
            level = '90' if level == '95' else level
            output.append(f'  {name}: var(--krds24-{group}-{level});')
    types = json.loads((HERE / 'values-2024.json').read_text())['typography']['rows']
    valid = {row[0] for row in types}
    # 1.1.0 heading roles changed meaning; these are explicit product aliases.
    extra = {'body-xsmall':'detail-small', 'heading-xlarge':'heading-medium',
             'heading-xsmall':'title-medium', 'heading-xxsmall':'title-small',
             'navigation-title-medium':'title-xlarge', 'navigation-title-small':'title-large',
             'navigation-depth-medium-bold':'body-medium','navigation-depth-medium':'body-medium',
             'navigation-depth-small-bold':'body-small','navigation-depth-small':'body-small'}
    for mode, name in sorted(set(re.findall(r'--krds-(pc|mobile)-font-size-([\w-]+)\s*:', token_text))):
        target = name if name in valid else extra.get(name)
        if not target:
            raise ValueError('Unmapped typography role: ' + name)
        suffix = '-mobile-size' if mode == 'mobile' else '-size'
        output.append(f'  --krds-{mode}-font-size-{name}: var(--krds24-{target}{suffix});')
    output.extend(['}', 'html { font-size: 100%; }', ''])
    return '\n'.join(output)


def generate():
    manifest = json.loads((BASE / 'upstream-manifest.json').read_text())
    if manifest['commit'] != COMMIT:
        raise ValueError('Upstream commit changed; adapter needs explicit review')
    source_text = {}
    for relative, expected in SOURCES.items():
        data = (UPSTREAM / relative).read_bytes()
        if hashlib.sha256(data).hexdigest() != expected or manifest['sha256'][relative] != expected:
            raise ValueError('Pinned upstream CSS changed: ' + relative)
        source_text[relative] = data.decode('utf-8')
    foundation = (HERE / 'tokens-2024.css').read_text()
    # Install the same generated declarations at :root for official token aliases.
    foundation = foundation.replace('.krds-2024-tokens {', ':root, .krds-2024-tokens {', 1)
    parts = ['/* Altool company adapter. Derived from KRDS 1.1.0 at ' + COMMIT +
             '. See ADAPTER.md. Generated; do not edit. */\n', foundation]
    for relative, text in source_text.items():
        parts += ['\n/* Normalized immutable source: ' + relative + ' */\n', normalize(text, UPSTREAM / relative)]
    # Swiper writes these values inline when enabled; establish the same neutral
    # pre-initialization geometry without changing its immutable CSS/JS.
    parts += ['.swiper { --swiper-centered-offset-before: 0px; --swiper-centered-offset-after: 0px; --swiper-virtual-size: 100%; }']
    parts += [aliases(source_text['resources/css/token/krds_tokens.css'])]
    parts += [(HERE / 'company-custom.css').read_text(encoding='utf-8')]
    return '@layer altool-base, altool-components;\n@layer altool-base {\n' + '\n'.join(parts) + '\n}\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = generate()
    output = HERE / 'company-adapter.css'
    if args.check:
        if not output.is_file() or output.read_text() != result:
            raise SystemExit('Stale company-adapter.css')
    else:
        output.write_text(result)
    print(('Verified' if args.check else 'Generated') + ' 16px-root company adapter from 3 pinned sources')
