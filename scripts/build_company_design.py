"""Build distribution styles from the two company-editable CSS sources."""
import argparse
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / 'designs/assets/ui-kit'
OUTPUTS = {'foundations/layout.css', 'components/runtime.css'}
OUTPUTS |= {'components/extensions.css', 'components/recipes.css'}
OUTPUTS |= {'components/' + name + '.css' for name in (
    'enterprise', 'icons', 'forms', 'navigation', 'feedback', 'dialogs', 'sections',
    'menus', 'data-states', 'tooltips', 'attachments', 'accordions', 'site-navigation',
    'progress', 'summaries', 'search-assist', 'page-frame', 'select', 'business', 'filter-bar')}


def outputs(kit=KIT):
    text = (kit/'design/components.css').read_text(encoding='utf-8')
    chunks = re.split(r'^/\* @output ([\w/.-]+) \*/\n', text, flags=re.M)
    if chunks[0].strip():
        raise ValueError('components.css must start with an @output section')
    result = {}
    for name, body in zip(chunks[1::2], chunks[2::2]):
        if name not in OUTPUTS or name in result:
            raise ValueError(f'Unknown/duplicate design section: {name}')
        result[name] = body.rstrip() + '\n'
    if set(result) != OUTPUTS:
        raise ValueError(f'Missing design sections: {sorted(OUTPUTS-set(result))}')
    result['foundations/tokens-2024.css'] = (kit/'design/theme.css').read_text(encoding='utf-8')
    return result


def build(kit=KIT, check=False):
    result = outputs(kit)
    for name, css in result.items():
        path = kit/'internal/company/dist'/name
        if check:
            if not path.is_file() or path.read_text(encoding='utf-8') != css:
                raise ValueError(f'Stale generated style: {name}; edit design/, then build')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(css, encoding='utf-8')
    return len(result)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        count = build(check=args.check)
        from build_company_bundle import build_bundle
        build_bundle(KIT, check=args.check)
        print(f'{"Verified" if args.check else "Built"} {count} company-only design outputs and bundle')
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, f'FAIL company design: {error}\n')
