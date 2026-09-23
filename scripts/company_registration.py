"""Register a single company UI implementation; never restore retired UI fallbacks."""
import json

COMPANY = 'ui-kit/internal/company/'
ICON_ALIASES = {
    'all': 'grid', 'angle': 'chevron-down', 'arrow-dropdown': 'chevron-down',
    'call': 'phone', 'checkbox': 'square', 'complete': 'success', 'ellipsis': 'more-horizontal',
    'email': 'mail', 'expand': 'maximize', 'faq': 'help', 'file-html': 'code',
    'file-hwp': 'file-text', 'file-pdf': 'file-text', 'flow-arrow': 'arrow-right',
    'foldable': 'chevron-down', 'global': 'globe', 'go': 'arrow-right', 'go-top': 'arrow-up',
    'head-ico-font-sample': 'type', 'head-ico-font-sample-white': 'type',
    'information': 'info', 'join': 'user-plus', 'like': 'thumbs-up', 'login': 'log-in',
    'more': 'more-horizontal', 'notice': 'warning', 'print': 'printer', 'sch-plus': 'zoom-in',
    'scrap': 'bookmark', 'step-done': 'check', 'swiper-play': 'play', 'swiper-stop': 'pause',
    'switch-off': 'toggle-left', 'switch-on': 'toggle-right', 'tooltip': 'help',
    'urgent-badge-danger': 'error', 'urgent-badge-info': 'info', 'urgent-badge-ok': 'success',
    'view-mode': 'grid',
}


def apply_company_registration(base, items):
    company = base / COMPANY
    config = json.loads((company / 'selection.json').read_text(encoding='utf-8'))
    by_id = {item['id']: item for item in items}

    def merge(entry):
        def asset_path(value):
            if value.startswith('designs/assets/'):
                return value.removeprefix('designs/assets/')
            if value.startswith(('ui-kit/', 'messages/', 'runtime/')):
                return value
            return COMPANY + value
        if entry['id'] not in by_id:
            item = {key: value for key, value in entry.items() if key != 'variants'}
            item['variants'] = {}
            items.append(item)
            by_id[item['id']] = item
        item = by_id[entry['id']]
        for name, raw in entry['variants'].items():
            variant = dict(raw)
            for key in ('path', 'preview'):
                if key in variant:
                    variant[key] = asset_path(variant[key])
            variant['dependencies'] = [asset_path(p) for p in variant.get('dependencies', [])]
            variant['kind'] = 'company-v27'
            variant['verification'] = 'browser-and-consumer-integration-required'
            item['variants'][name] = variant
        item.setdefault('constraints', config['items'][0]['constraints'])

    for entry in config['items']:
        variant = {key: entry[key] for key in ('path', 'states', 'api') if key in entry}
        variant['preview'] = entry.get('preview', 'catalog.html')
        variant['dependencies'] = entry.get('dependencies', ['dist/company.css'])
        merge({key: entry[key] for key in ('id', 'kind', 'meaning', 'constraints')} |
              {'defaultVariant': 'company', 'variants': {'company': variant}})
    for folder in ('extensions', 'recipes'):
        manifest = json.loads((company / folder / 'registry.json').read_text(encoding='utf-8'))
        for entry in manifest['items']:
            merge(entry)
    for identifier, meaning, path in (
        ('foundation.tokens', '회사 v27 색·크기·간격 토큰', 'dist/foundations/tokens-2024.css'),
        ('foundation.layout', '회사 v27 반응형 페이지·사이드 배치', 'layout-preview.html'),
    ):
        merge({'id': identifier, 'kind': 'foundation', 'meaning': meaning, 'defaultVariant': 'company',
               'variants': {'company': {'path': path, 'dependencies': ['dist/company.css'],
                                       'states': ['desktop', 'mobile']}}})
    layout = by_id['foundation.layout']
    layout['variants'] = {name: dict(layout['variants']['company'], preview=COMPANY + 'layout-preview.html#' + name,
                                    sourceSection=name) for name in ('contained', 'fluid', 'contained-sidebar', 'fluid-sidebar')}
    layout['defaultVariant'] = 'contained'
    catalog = json.loads((company / 'dist/assets/icons.json').read_text(encoding='utf-8'))
    icons = {icon['id']: icon for icon in catalog['icons']}
    semantic = {config['iconAliases'].get(name, name): name for name in icons}
    semantic.update(ICON_ALIASES)
    for name, glyph in semantic.items():
        icon = icons[glyph]
        identifier = 'icon.' + name
        if identifier in by_id:
            raise ValueError(f'Duplicate icon semantic ID: {identifier}')
        variant = {'path': COMPANY + 'dist/' + icon['svg_path'],
                   'dependencies': [COMPANY + 'dist/assets/LICENSE-LUCIDE.txt', COMPANY + 'dist/assets/LICENSE-ALTOOL.txt'],
                   'states': ['default'], 'defaultSize': 16, 'sizes': [14, 16, 20, 24, 32, 48]}
        item = {'id': identifier, 'kind': 'icon', 'meaning': icon['label_ko'] + ' ' + ' '.join(icon['keywords']),
                'defaultVariant': 'default', 'variants': {'default': variant},
                'constraints': ['같은 의미는 등록된 회사 그림을 사용한다. 방향을 임의 회전하지 않는다.',
                                '기본16px·소형14px·강조20px, 선 두께1.5. 색상·상태는 ui-icon SVG/use로 표시한다.',
                                '그림 크기와 클릭 영역을 구분하고 의미 있는 이름 또는 장식 alt를 제공한다.']}
        items.append(item)
        by_id[identifier] = item
