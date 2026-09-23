#!/usr/bin/env python3
"""Index company assets only; source-document corpora are not product assets."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'designs/assets'


def main():
    registry = json.loads((BASE / 'registry.json').read_text(encoding='utf-8'))
    from sys import path
    path.insert(0, str(ROOT / 'altool/scripts'))
    from assets import validate_company_design
    validate_company_design(ROOT, registry)
    categories = {'icon': 'icons', 'image': 'images', 'component': 'components', 'pattern': 'patterns',
                  'service': 'patterns', 'foundation': 'foundations', 'message': 'messages', 'brand': 'brand'}
    records = []
    for item in registry['items']:
        for name, variant in item['variants'].items():
            relative = variant['path'].removeprefix('designs/assets/')
            record = {'id': item['id'] + '/' + name, 'category': categories[item['kind']],
                      'name': item['meaning'] + ' · ' + name, 'path': relative,
                      'source': '회사 v27', 'verified': False}
            preview = variant.get('preview') or (variant['path'] if relative.endswith('.html') else None)
            if preview:
                record['preview'] = preview.removeprefix('designs/assets/') + variant.get('route', '')
            records.append(record)
    indexed = {record['path'] for record in records}
    for folder in ('ui-kit/internal/company', 'brand', 'images'):
        for file in sorted((BASE / folder).rglob('*.svg')):
            relative = str(file.relative_to(BASE))
            if relative not in indexed:
                records.append({'id': 'company-file-' + relative.replace('/', '-'),
                                'category': 'icons' if '/assets/icons' in relative else 'images',
                                'name': file.stem, 'path': relative, 'source': '회사 v27', 'verified': False})
    (BASE / 'catalog.json').write_text(json.dumps({'version': 1, 'assets': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Catalog: {len(records)} company asset entries; no source-document corpus')


if __name__ == '__main__':
    main()
