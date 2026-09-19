import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');
const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
test('local HTML assets and source imports resolve',async()=>{
  for(const match of html.matchAll(/(?:src|href)="((?:assets|src)\/[^"#]+|styles\.css)"/g)){
    assert.ok((await stat(new URL('../'+match[1],import.meta.url))).size>0);
  }
  for(const match of app.matchAll(/from ['"](.+?)['"]/g)){
    assert.ok((await stat(new URL('../src/'+match[1],import.meta.url))).isFile());
  }
});
test('HTML IDs are unique and internal links resolve',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),match[1]);
});
test('every static image has an alt description and every dialog a label',()=>{
  for(const match of html.matchAll(/<img\b[^>]*>/g))assert.match(match[0],/alt="[^"]+"/);
  for(const match of html.matchAll(/<dialog\b[^>]*>/g))assert.match(match[0],/aria-labelledby="[^"]+"/);
  assert.match(html,/<html lang="en">/);assert.match(html,/<h1 /);
});
test('no external scripts, fonts, photos or unverified reviews',()=>{
  assert.doesNotMatch(html,/<(?:script|img|link)[^>]+(?:src|href)="https?:\/\//);
  assert.doesNotMatch(css,/@import|https?:\/\//);
  assert.doesNotMatch(html,/Shop 4|water tank|Mondays closed|First in town|aggregateRating/);
});
test('fallbacks, reduced-motion styles and narrow-screen layout exist',()=>{
  assert.match(html,/<noscript>/);assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/max-width:360px/);assert.match(css,/max-width:580px/);
  assert.match(css,/no-webgl/);assert.match(app,/try\{localStorage/);
});
