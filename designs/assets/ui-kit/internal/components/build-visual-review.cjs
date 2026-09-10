#!/usr/bin/env node
/* Render existence is not visual review. Only explicit authored observations count. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../../../../..');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const source='guides/디지털 정부서비스 UIUX 가이드라인(2024.02).pdf';
const notes=JSON.parse(fs.readFileSync(path.join(__dirname,'visual-review-notes.json')));
const supplement=JSON.parse(fs.readFileSync(path.join(__dirname,'visual-review-supplement-366-552.json')));
const dispositions=JSON.parse(fs.readFileSync(path.join(__dirname,'visual-review-dispositions.json')));
const sourceSha256=sha(fs.readFileSync(path.join(root,source)));
if(supplement.sourceSha256!==sourceSha256)throw new Error('Supplement source hash differs');
const coverage=JSON.parse(fs.readFileSync(path.join(__dirname,'../coverage.json'))).items.filter(i=>i.category==='components');
const pages=[];
for(let page=114;page<=552;page++){
  const render=`tmp/pdfs/krds-components-full/page-${page}.png`;
  const file=path.join(root,render);
  const image=fs.existsSync(file)?fs.readFileSync(file):null;
  const section=coverage.find(i=>page>=i.startPage&&page<=i.endPage);
  const extra=supplement.pages.find(item=>item.page===page);
  if(extra&&(!image||extra.status!=='visual-reviewed'||extra.evidence[0].sha256!==sha(image)))throw new Error('Supplement evidence differs: '+page);
  const review=notes.pages[String(page)] || (extra?{observation:extra.observation,findings:extra.findings,actions:[],remaining:[]}:null);
  const disposition=dispositions.pages[String(page)];
  if(review&&(!image||!review.observation||!Array.isArray(review.findings)||!Array.isArray(review.actions)||!Array.isArray(review.remaining)))throw new Error('Incomplete authored review: '+page);
  pages.push({page,component:section.id,rendered:!!image,render:image?{path:render,sha256:sha(image),width:image.readUInt32BE(16),height:image.readUInt32BE(20),dpi:200}:null,
    visualReviewed:!!review,status:review?'visual-review-recorded':'not-visually-reviewed',reviewer:notes.pages[String(page)]?'krds_component_audit':extra?supplement.reviewer:null,...(review||{}),...(disposition||{})});
}
const result={version:1,source:{path:source,sha256:sourceSha256,pages:988},scope:{from:114,to:552,count:439},
  findings:dispositions.findings,
  meaning:'Rendered is not reviewed; reviewed is not browser/compliance passed. Only manual per-page observations set visualReviewed.',
  summary:{rendered:pages.filter(p=>p.rendered).length,visuallyReviewed:pages.filter(p=>p.visualReviewed).length,pending:pages.filter(p=>!p.visualReviewed).length},pages};
const output=path.join(__dirname,'visual-review-ledger.json');
const text=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check')){if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==text)throw new Error('Stale visual review ledger');}
else fs.writeFileSync(output,text);
console.log(JSON.stringify(result.summary));
