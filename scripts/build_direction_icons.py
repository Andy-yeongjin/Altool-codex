#!/usr/bin/env python3
"""Derive fixed-direction company icons from the immutable angle SVG."""
import argparse
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / 'designs/assets'
DIRECTIONS = {'left': 90, 'right': -90, 'up': 180, 'down': 0}


def build(check=False):
    target = BASE / 'icons/directions'
    if not check:
        target.mkdir(parents=True, exist_ok=True)
    for direction, angle in DIRECTIONS.items():
        for variant in ('default', 'inverse', 'disabled', 'disabled-inverse'):
            suffix = '' if variant == 'default' else '_' + variant.replace('-', '_')
            source = BASE / f'ui-kit/internal/upstream/resources/img/component/icon/ico_angle{suffix}.svg'
            svg = source.read_text()
            svg = svg.replace('<path ', f'<g transform="rotate({angle} 12 12)"><path ', 1).replace('</svg>', '</g></svg>')
            path = target / f'chevron-{direction}-{variant}.svg'
            if check:
                if not path.is_file() or path.read_text() != svg:
                    raise ValueError(f'Stale direction icon: {path}')
            else:
                path.write_text(svg)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
