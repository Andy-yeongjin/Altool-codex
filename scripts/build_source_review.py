#!/usr/bin/env python3
"""Join authored page observations, never infer review from render existence."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / 'designs/assets/ui-kit/internal'
SOURCES = (
    ('foundations/final-source-review.json', set(range(1, 114)) | set(range(981, 989))),
    ('components/visual-review-ledger.json', set(range(114, 553))),
    ('patterns/basic/final-source-review.json', set(range(553, 686))),
    ('patterns/services/pdf-visual-review.json', set(range(686, 981))),
)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def build(verify_renders=False):
    coverage = read(KIT / 'coverage.json')
    source_hash = coverage['source']['sha256']
    pages, ledgers = {}, []
    for relative, expected in SOURCES:
        path = KIT / relative
        data = read(path)
        actual_source = (data.get('sourceSha256') or data.get('sourcePdfSha256')
                         or data.get('source', {}).get('sha256'))
        if actual_source != source_hash:
            raise ValueError(f'Source hash mismatch: {relative}')
        records = data.get('pages', data.get('observedPages', []))
        numbers = [row['page'] for row in records]
        if len(numbers) != len(set(numbers)) or set(numbers) != expected:
            raise ValueError(f'Missing/duplicate/out-of-scope authored pages: {relative}')
        ledgers.append({'path': 'designs/assets/ui-kit/internal/' + relative,
                        'sha256': digest(path), 'reviewedPages': len(records)})
        for row in records:
            number = row['page']
            reviewed = (row.get('visualReviewed') is True or row.get('observed') is True
                        or row.get('status') in ('visual-reviewed', 'visually-reviewed'))
            if not reviewed or not row.get('observation', '').strip() or number in pages:
                raise ValueError(f'Unreviewed or overlapping page: {number}')
            renders = (row.get('renders') or row.get('evidence')
                       or ([row['render']] if row.get('render') else [])
                       or ([{'path': row['raster'], 'sha256': row['sha256']}] if row.get('raster') else []))
            if not renders:
                raise ValueError(f'No render evidence: {number}')
            for render in renders:
                image = (ROOT / render['path']).resolve()
                if not image.is_relative_to(ROOT) or len(render.get('sha256', '')) != 64:
                    raise ValueError(f'Unsafe/invalid render reference: {number}')
                if verify_renders and (not image.is_file() or digest(image) != render['sha256']):
                    raise ValueError(f'Render changed/missing: {number}')
            pages[number] = {'page': number, 'status': 'source-visually-reviewed',
                             'ledger': 'designs/assets/ui-kit/internal/' + relative}
    if set(pages) != set(range(1, coverage['source']['pageCount'] + 1)):
        raise ValueError('Source page coverage is not complete')
    return {'version': 1, 'sourceSha256': source_hash, 'reviewedPages': len(pages),
            'meaning': 'Actual individual source-page visual reading. Not browser, all-rule, accessibility or government certification.',
            'ledgers': ledgers, 'pages': [pages[p] for p in sorted(pages)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Explicitly publish the joined source-review record and page coverage')
    parser.add_argument('--verify-renders', action='store_true', help='Also hash local temporary render files; not required in an installed pack')
    args = parser.parse_args()
    result = build(args.verify_renders)
    target = KIT / 'source-review.json'
    coverage_path = KIT / 'coverage.json'
    coverage = read(coverage_path)
    references = {row['page']: row for row in result['pages']}
    for row in coverage['pages']:
        row['visualReview'] = references[row['page']]['status']
        row['visualReviewLedger'] = references[row['page']]['ledger']
    coverage['sourceVisualReview'] = {'path': 'source-review.json', 'reviewedPages': result['reviewedPages'],
                                    'meaning': result['meaning']}
    if args.write:
        for path, value in ((target, result), (coverage_path, coverage)):
            path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    elif read(target) != result or read(coverage_path) != coverage:
        raise ValueError('Stale joined source-review record; investigate before explicit --write')
    print(f'988/988 authored visual observations verified; renders={args.verify_renders}. Not a UI compliance verdict.')


if __name__ == '__main__':
    main()
