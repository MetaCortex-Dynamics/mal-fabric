import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source = 'Genesis_on_the_GPU_Whitepaper_v1.1.0.docx';
const target = 'Genesis_on_the_GPU_v1.1.0.tex';
const parse = p => JSON.parse(execFileSync('pandoc',[p,'-t','json'],{encoding:'utf8',maxBuffer:20e6}));
function text(n) {
  if (!n || typeof n !== 'object') return '';
  if (Array.isArray(n)) return n.map(text).join('');
  if (n.t === 'Str') return n.c;
  if (n.t === 'Code') return n.c[1];
  if (n.t === 'Quoted') { const q=n.c[0].t==='DoubleQuote'?'"':"'"; return q+text(n.c[1])+q; }
  if (n.t === 'Math') return n.c[1].replace(/\\subset/g,'⊂').replace(/\\in\b/g,'∈');
  return text(n.c);
}
const normalize = s => s.normalize('NFC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s/g,'');
const a=parse(source);
const latex=fs.readFileSync(target,'utf8');
// Pandoc's LaTeX reader drops textbar; expand this typography command for comparison.
const readerInput=latex.replace(/\\textbar(?:\{\})?/g,'|').replace(/& (\d+)/g,'& {$1}');
// Braces prevent the reader consuming a leading table number as a column modifier.
const b=JSON.parse(execFileSync('pandoc',['-f','latex','-t','json'],{input:readerInput,encoding:'utf8',maxBuffer:20e6}));
b.meta.subtitle={t:'Str',c:latex.match(/\\subtitle\{([^}]*)\}/s)[1]};
const aa=normalize(text(a.blocks)), bb=normalize(text(b.blocks));
let first=0; while(first<aa.length && aa[first]===bb[first]) first++;
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const report={source_sha256:sha(source),latex_sha256:sha(target),comparison:'Ordered body text, table cells and captions; whitespace and typographic quote normalization only',body:aa===bb?'SAME':'NOT_SAME',source_characters:aa.length,target_characters:bb.length,first_difference:aa===bb?null:{offset:first,source:aa.slice(first-60,first+120),target:bb.slice(first-60,first+120)},title:normalize(text(a.meta.title))===normalize(text(b.meta.title))?'SAME':'NOT_SAME',subtitle:normalize(text(a.meta.subtitle))===normalize(text(b.meta.subtitle))?'SAME':'NOT_SAME'};
fs.writeFileSync('TRANSCRIPTION_CHECK.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.body!=='SAME'||report.title!=='SAME'||report.subtitle!=='SAME') process.exitCode=1;
