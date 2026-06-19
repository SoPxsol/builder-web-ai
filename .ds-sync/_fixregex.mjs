import { readFileSync, writeFileSync } from 'fs';
const f = 'src/app/types/article.ts';
let s = readFileSync(f, 'utf8');
const bs = String.fromCharCode(92); // backslash
const literal = '[' + String.fromCodePoint(0x300) + '-' + String.fromCodePoint(0x36f) + ']';
const escaped = '[' + bs + 'u0300-' + bs + 'u036f]';
let status;
if (s.includes(literal)) { s = s.replace(literal, escaped); writeFileSync(f, s); status='replaced literal'; }
else if (s.includes(escaped)) status='already escaped';
else status='NEITHER FOUND';
const line = readFileSync(f,'utf8').split('\n')[105];
// show codepoints of the chars between the regex slashes
const m = line.match(/replace\(\/(.*?)\/g/);
console.log(status);
console.log('line106:', line.replace(/\r/,''));
console.log('regex body codepoints:', m ? [...m[1]].map(c=>c.codePointAt(0).toString(16)).join(' ') : 'NO MATCH');
