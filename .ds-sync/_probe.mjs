import { chromium } from 'playwright';
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
const OUT = './ds-bundle';
const types = {'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((req,res)=>{
  let p = join(OUT, decodeURIComponent(req.url.split('?')[0]));
  if(!existsSync(p)||req.url==='/'){res.end('');return;}
  res.setHeader('content-type', types[extname(p)]||'text/plain');
  res.end(readFileSync(p));
});
await new Promise(r=>srv.listen(0,r));
const port = srv.address().port;
const b = await chromium.launch();
const pg = await b.newPage();
const errs=[];
pg.on('pageerror',e=>errs.push(String(e).split('\n')[0]));
await pg.goto(`http://127.0.0.1:${port}/`);
await pg.setContent('<!doctype html><script src="/_vendor/react.js"></script><script src="/_vendor/react-dom.js"></script><script src="/_ds_bundle.js"></script>');
const info = await pg.evaluate(()=>{
  const NS = window.PxsolWebDS;
  return { type: typeof NS, keys: NS?Object.keys(NS).slice(0,12):null, count: NS?Object.keys(NS).length:0,
    sample: NS?Object.fromEntries(Object.keys(NS).slice(0,6).map(k=>[k, typeof NS[k]])):null,
    hasReact: typeof window.React, hasRD: typeof window.ReactDOM };
});
console.log('pageerrors:', errs.slice(0,5));
console.log(JSON.stringify(info,null,2));
await b.close(); srv.close();
