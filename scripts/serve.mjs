import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const port=Number(process.env.PORT||8765);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/__qa'){
      const width=Math.max(320,Math.min(1440,Number(url.searchParams.get('width'))||390));
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
      res.end('<!doctype html><html><head><title>Madhukunj responsive QA</title></head><body style="margin:0;background:#ddd"><p style="font:14px Arial;padding:8px">Responsive test: '+width+'px · <a href="/">Main site</a></p><iframe title="Responsive website preview" src="/" style="display:block;width:'+width+'px;height:1000px;border:0;margin:0 auto"></iframe></body></html>');return;
    }
    const pathname=decodeURIComponent(url.pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)||pathname.split('/').some(segment=>segment.startsWith('.'))||!['/index.html','/styles.css'].includes(pathname)&&pathname!=='/'&&!/^\/(src|assets)\//.test(pathname)){
      res.writeHead(404);res.end('Not found');return;
    }
    if(!(await stat(file)).isFile())throw new Error('Not a file');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(await readFile(file));
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'0.0.0.0',()=>console.log('Madhukunj preview: http://localhost:'+port));
