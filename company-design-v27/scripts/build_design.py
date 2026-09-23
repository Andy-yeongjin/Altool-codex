"""Split the supplied @output authoring format; build an opt-in company bundle.
Run: python3 scripts/build_design.py (no third-party dependencies).
"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist'
OUT.mkdir(exist_ok=True)
source=(ROOT/'design/components.css').read_text(encoding='utf-8')
parts=re.split(r'/\* @output ([^*]+) \*/',source)
for i in range(1,len(parts),2):
    name=Path(parts[i].strip())
    if name.is_absolute() or '..' in name.parts:
        raise ValueError('Unsafe output path')
    target=OUT/name
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(parts[i+1],encoding='utf-8')
theme=(ROOT/'design/theme.css').read_text(encoding='utf-8')
(OUT/'foundations/tokens-2024.css').write_text(theme,encoding='utf-8')
bundle=theme+'\n'+ '\n'.join((OUT/name).read_text(encoding='utf-8') for name in [
    'foundations/layout.css','components/runtime.css','components/guided-runtime.css','components/enterprise.css','components/icons.css','components/forms.css','components/navigation.css','components/feedback.css','components/dialogs.css','components/sections.css','components/menus.css','components/data-states.css','components/tooltips.css','components/attachments.css','components/accordions.css','components/site-navigation.css','components/progress.css','components/summaries.css','components/search-assist.css','components/page-frame.css','components/select.css','components/business.css','components/filter-bar.css'])
(OUT/'company.css').write_text(bundle,encoding='utf-8')
print('Built dist/company.css and individual @output files')

from build_icons import build
build()

(OUT/"select.js").write_text((ROOT/"js/select.js").read_text(),encoding="utf-8")

(OUT/"business.js").write_text((ROOT/"js/business.js").read_text(),encoding="utf-8")
