import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const out=path.join(root,'dist');
await mkdir(out,{recursive:true});
for(const file of ['index.html','styles.css'])await copyFile(path.join(root,file),path.join(out,file));
for(const dir of ['assets','src'])await cp(path.join(root,dir),path.join(out,dir),{recursive:true});
await writeFile(path.join(out,'.nojekyll'),'');
let html=await readFile(path.join(out,'index.html'),'utf8');
if(process.env.SITE_URL){
  const site=new URL(process.env.SITE_URL);
  if(site.protocol!=='https:'||site.username||site.password||site.search||site.hash)throw new Error('SITE_URL must be a plain HTTPS site origin/path.');
  if(!site.pathname.endsWith('/'))site.pathname+='/';
  const attr=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  html=html.replace('content="assets/kitchen-table.png"','content="'+attr(new URL('assets/kitchen-table.png',site).href)+'"');
  html=html.replace('</head>','  <link rel="canonical" href="'+attr(site.href)+'">\n</head>');
  await writeFile(path.join(out,'index.html'),html);
}
for(const match of html.matchAll(/(?:src|href)="((?:assets|src)\/[^"#]+|styles\.css)"/g)){
  await readFile(path.join(out,match[1]));
}
console.log('Built dist/: self-contained static site. No install or runtime dependencies.');
