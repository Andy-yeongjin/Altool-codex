const assert=require('node:assert/strict');
const {Node,document}=require('./dom-harness.cjs');
require('../dist/business.js');
global.DataTransfer=class{constructor(){this.files=[];this.items={add:f=>this.files.push(f)};}};
function host(){const root=new Node(),input=new Node('input');input.type='file';input.setAttribute('type','file');input.files=[];root.append(input);document.append(root);return root;}
const root=host(),ui=CompanyBusiness.attachments(root);
assert.equal(root.querySelector('.ui-attachment-toolbar').querySelectorAll('svg').length,1);
assert.equal(root.querySelector('svg').getAttribute('aria-hidden'),'true');
ui.set([{name:'example.pdf',size:20,lastModified:1}]);
assert.equal(root.querySelector('.ui-attachment-list').querySelectorAll('svg').length,2);
assert.equal(root.querySelector('.ui-attachment-remove').getAttribute('aria-label'),'example.pdf 첨부 해제');
ui.destroy();
const custom=new Node('svg');custom.setAttribute('data-custom','yes');
const overridden=host(),other=CompanyBusiness.attachments(overridden,{icons:{add:custom}});
assert.equal(overridden.querySelector('.ui-attachment-toolbar').querySelectorAll('svg').length,1);
assert.equal(overridden.querySelector('svg').getAttribute('data-custom'),'yes');
other.destroy();
console.log('PASS default add/file/remove icons, accessible removal, custom override without duplicates');
