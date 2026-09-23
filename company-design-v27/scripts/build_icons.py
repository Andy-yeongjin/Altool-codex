"""Build vendored Lucide icon assets offline using only Python stdlib."""
from pathlib import Path
from html import escape
import json, shutil
R=Path(__file__).resolve().parents[1]
def build():
 source=json.loads((R/'icons/source.json').read_text())
 out=R/'dist/assets';individual=out/'icons';individual.mkdir(parents=True,exist_ok=True)
 symbols=[];catalog=[]
 for item in source['icons']:
  nodes=''.join('<'+tag+' '+ ' '.join(k+'="'+escape(str(v),quote=True)+'"' for k,v in attrs.items())+' />' for tag,attrs in item['nodes'])
  svg='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+nodes+'</svg>'
  (individual/(item['id']+'.svg')).write_text(svg)
  symbols.append('<symbol id="'+item['id']+'" viewBox="0 0 24 24">'+nodes+'</symbol>')
  catalog.append({k:v for k,v in item.items() if k!='nodes'}|{'svg_path':'assets/icons/'+item['id']+'.svg','sprite_href':'assets/icons.svg#'+item['id'],'usage_html':'<svg class="ui-icon" aria-hidden="true"><use href="/assets/icons.svg#'+item['id']+'"></use></svg>'})
 sprite='<svg xmlns="http://www.w3.org/2000/svg">'+''.join(symbols)+'</svg>'
 (out/'icons.svg').write_text(sprite)
 manifest={'schema_version':1,'provider':source['provider'],'provider_version':source['version'],'source_url':source['source_url'],'license_file':'LICENSE-LUCIDE.txt','viewBox':'0 0 24 24','default_size_px':16,'default_stroke_width':1.5,'count':len(catalog),'icons':catalog}
 (out/'icons.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
 shutil.copyfile(R/'icons/LICENSE-LUCIDE.txt',out/'LICENSE-LUCIDE.txt')
 return manifest,sprite
if __name__=='__main__':
 m,_=build();print(f"Built {m['count']} SVG icons, sprite and catalog")
