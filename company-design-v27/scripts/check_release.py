"""Read-only release verification. Run from any directory; Python stdlib + Node."""
from pathlib import Path
import subprocess,re,hashlib,os
R=Path(__file__).resolve().parents[1]
def run(args,env=None):subprocess.run(args,cwd=R,env=env,check=True)
for tz in ['Asia/Seoul','America/Los_Angeles']:
 run(['node','tests/business.test.cjs'],dict(os.environ,TZ=tz))
for script in ['tests/components.test.cjs','tests/attachments.test.cjs']:run(['node',script])
run(['python3','tests/validate_preview.py']);run(['python3','scripts/validate_icons.py'])
for p in (R/'js').glob('*.js'):run(['node','--check',str(p)])
for name in ['select.js','business.js']:assert (R/'js'/name).read_bytes()==(R/'dist'/name).read_bytes(),name
css=(R/'dist/company.css').read_text()
for p in [*R.glob('*preview.html'),R/'catalog.html']:
 m=re.search(r'<style>(.*?)</style>',p.read_text(),re.S);assert m and m[1]==css,('Stale embedded CSS',p.name)
for name in ['README.md','GUIDE.md','QA.md','docs/BUSINESS-USAGE.md','docs/CONSISTENCY.md','docs/PAGE-PATTERNS.md']:
 for target in re.findall(r'\]\(([^)]+)\)',(R/name).read_text()):
  if '://' not in target and not target.startswith('#'):assert ((R/name).parent/target.split('#')[0]).exists(),(name,target)
print('PASS: source/dist JS, all embedded preview CSS, current document links; no browser QA performed')
