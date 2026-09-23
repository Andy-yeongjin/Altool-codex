"""Read-only release verification. Run from any directory; Python stdlib + Node."""
from pathlib import Path
import subprocess,re,hashlib,os,json
import xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1]
def run(args,env=None):subprocess.run(args,cwd=R,env=env,check=True)
for tz in ['Asia/Seoul','America/Los_Angeles']:
 run(['node','tests/business.test.cjs'],dict(os.environ,TZ=tz))
for script in ['tests/components.test.cjs','tests/attachments.test.cjs']:run(['node',script])
run(['python3','tests/validate_preview.py']);run(['python3','scripts/validate_icons.py'])
for p in (R/'js').glob('*.js'):run(['node','--check',str(p)])
assert (R/'js/select.js').read_bytes()==(R/'dist/select.js').read_bytes()
runtime=(R/'dist/business.js').read_text(encoding='utf-8')
source=(R/'js/business.js').read_text(encoding='utf-8')
identity=json.loads((R.parents[1]/'design/company.json').read_text())
actions=json.loads((R/'button-actions.json').read_text())
def svg_node(node):
 return {'tag':node.tag.split('}')[-1],'attrs':dict(node.attrib),'children':[svg_node(child) for child in node]}
icon_names={'menu','calendar','chevron-left','chevron-right','search','plus','file','trash','x'}|{item['icon'] for item in actions.values()}
expected={
 'builtinIcons':('BUILTIN_ICONS',{key:svg_node(ET.parse(R/'dist/assets/icons'/f'{key}.svg').getroot()) for key in icon_names}),
 'buttonActions':('BUTTON_ACTIONS',actions),
 'companyIdentity':('COMPANY_IDENTITY',identity),
 'companyCiVersions':('COMPANY_CI_VERSIONS',{path:hashlib.sha256((R.parents[2]/path).read_bytes()).hexdigest()[:16] for path in identity['ci'].values()}),
}
for name,(marker,value) in expected.items():
 match=re.search(r'^const '+name+r' = (.*);$',runtime,re.M)
 assert match and json.loads(match[1])==value,('Stale embedded source',name)
 source=source.replace('/* '+marker+' */ {}',match[1])
messages=json.loads((R.parents[2]/'messages/ko.json').read_text())
prefix='// Generated from messages/ko.json; do not edit.\n'+'globalThis.CompanyMessages = '+json.dumps(messages,ensure_ascii=False)+';\n'
assert runtime==prefix+source,'Stale business runtime'
css=(R/'dist/company.css').read_text()
for p in [*R.glob('*preview.html'),R/'catalog.html']:
 m=re.search(r'<style>(.*?)</style>',p.read_text(),re.S);assert m and m[1]==css,('Stale embedded CSS',p.name)
for name in ['README.md','GUIDE.md','QA.md','docs/BUSINESS-USAGE.md','docs/CONSISTENCY.md','docs/PAGE-PATTERNS.md']:
 for target in re.findall(r'\]\(([^)]+)\)',(R/name).read_text()):
  if '://' not in target and not target.startswith('#'):assert ((R/name).parent/target.split('#')[0]).exists(),(name,target)
print('PASS: source/dist JS, all embedded preview CSS, current document links; no browser QA performed')
