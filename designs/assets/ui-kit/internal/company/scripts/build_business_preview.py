from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
body=(root/'examples/business-body.html').read_text()
def icon(m):
 s=(root/'dist/assets/icons'/f'{m[1]}.svg').read_text()
 return s.replace('<svg ', '<svg class="ui-icon" aria-hidden="true" ')
body=re.sub(r'\{\{icon:([\w-]+)\}\}',icon,body)
css=(root/'dist/company.css').read_text();demo=(root/'examples/business-demo.css').read_text();js=(root/'dist/business.js').read_text();app=(root/'examples/business-demo.js').read_text()
html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>전사 공통 업무 요소 · v27</title><style>'+css+'</style><style>'+demo+'</style></head><body class="krds-2024-tokens altool-ui" data-density="standard">'+body+'<script>'+js+'</script><script>'+app+'</script></body></html>'
(root/'business-preview.html').write_text(html)
print('Built business-preview.html (12 components, offline demo)')
