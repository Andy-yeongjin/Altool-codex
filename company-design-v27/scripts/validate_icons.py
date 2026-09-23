from pathlib import Path
import json,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1];A=R/'dist/assets';M=json.loads((A/'icons.json').read_text())
ids=[i['id'] for i in M['icons']];assert len(ids)==len(set(ids))==M['count']==120
sprite=ET.parse(A/'icons.svg').getroot();assert {s.get('id') for s in sprite}==set(ids)
allowed={'svg','symbol','path','circle','rect','line','polyline','polygon','ellipse'}
for p in [A/'icons.svg',*(A/'icons').glob('*.svg')]:
 for e in ET.parse(p).iter():
  assert e.tag.split('}')[-1] in allowed,(p,e.tag)
  assert not any(k.startswith('on') or k in ['href','style'] for k in e.attrib),(p,e.attrib)
for x in M['icons']:
 assert (R/'dist'/x['svg_path']).is_file()
 assert x['sprite_href']=='assets/icons.svg#'+x['id']
 e=ET.parse(R/'dist'/x['svg_path']).getroot();assert e.get('stroke-width')=='1.5';assert e.get('viewBox')=='0 0 24 24'
assert (A/'LICENSE-LUCIDE.txt').read_text()==(R/'icons/LICENSE-LUCIDE.txt').read_text()
print('PASS: 120 IDs, SVG geometry, manifest paths, 1.5 stroke, licenses')
