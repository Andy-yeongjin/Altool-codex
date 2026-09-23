from pathlib import Path
from html.parser import HTMLParser
import json, subprocess, tempfile
ROOT=Path(__file__).resolve().parents[1]
class Check(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.labels=[];self.scripts=[];self.script=None;self.files=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='label' and 'for' in a:self.labels.append(a['for'])
  if tag=='script':self.script=[]
  if tag in ['script','link','img']:
   source=a.get('src') or a.get('href')
   if source:self.files.append(source)
 def handle_data(self,data):
  if self.script is not None:self.script.append(data)
 def handle_endtag(self,tag):
  if tag=='script' and self.script is not None:self.scripts.append(''.join(self.script));self.script=None
html=(ROOT/'business-preview.html').read_text();p=Check();p.feed(html)
assert len(p.ids)==len(set(p.ids)), 'Duplicate static IDs'
assert set(p.labels)<=set(p.ids), 'Label references'
assert not p.files, 'Preview must be standalone'
assert '{{icon:' not in html, 'Unresolved icon'
assert (ROOT/'dist/business.js').read_text() in html
assert (ROOT/'dist/company.css').read_text() in html
for script in p.scripts:
 with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
  f.write(script);f.flush();subprocess.run(['node','--check',f.name],check=True)
for entry in json.loads((ROOT/'components.json').read_text())['components']:
 for cls in entry['classes']:assert '.'+cls in (ROOT/'dist/company.css').read_text(),cls
print('PASS:', len(json.loads((ROOT/'components.json').read_text())['components']), 'component contracts, unique IDs, label targets, embedded CSS/JS, standalone assets, JS syntax')
