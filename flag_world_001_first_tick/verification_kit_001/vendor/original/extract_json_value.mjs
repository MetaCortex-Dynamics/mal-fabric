// Generic observation projection of a source-produced JSON value.
// Selects an exact fact prefix supplied by the caller; constructs no fields,
// supplies no values, and performs no sorting or application interpretation.
import fs from 'node:fs';
import crypto from 'node:crypto';
const [dir,root,...args]=process.argv.slice(2);
const out=args.pop(),map=JSON.parse(fs.readFileSync(dir+'/source-map.json')),raw=fs.readFileSync(dir+'/readback.bin');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const w=i=>raw.readInt32LE(i*4),cap=w(2),nt=w(5),nf=w(6);
if(w(0)!==0x31524c47||w(1)!==1||w(4)!==0)throw Error('readback');
function t(id){if(id<0||id>=nt)throw Error('term bounds');const p=8+id*10,n=w(p+1);if(n<0||n>8)throw Error('arity');return {s:map.symbols[w(p)],c:Array.from({length:n},(_,j)=>w(p+2+j))};}
function list(id){const a=[];for(let count=0;count<=nt;count++){const n=t(id);if(n.s==='NIL'&&!n.c.length)return a;if(n.s!=='CONS'||n.c.length!==2)throw Error('sequence');a.push(n.c[0]);if(n.c[1]>=id)throw Error('sequence order');id=n.c[1];}throw Error('sequence bound');}
function text(id){const n=t(id);if(n.s!=='TEXT'||n.c.length!==1)throw Error('text');const bs=list(n.c[0]).map(i=>{const n=t(i);if(n.c.length||!/^B(?:0|[1-9][0-9]*)$/.test(n.s))throw Error('octet');const b=Number(n.s.slice(1));if(b>255)throw Error('octet bound');return b;});return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bs));}
function value(id,depth=0){if(depth>64)throw Error('value depth');const n=t(id);
 if(n.s==='TEXT')return text(id);
 if(n.s==='ARRAY'&&n.c.length===1)return list(n.c[0]).map(i=>value(i,depth+1));
 if(n.s==='OBJECT'&&n.c.length===1){const o=Object.create(null);for(const i of list(n.c[0])){const m=t(i);if(m.s!=='MEMBER'||m.c.length!==2)throw Error('member');const k=text(m.c[0]);if(Object.hasOwn(o,k))throw Error('duplicate member');o[k]=value(m.c[1],depth+1);}return o;}
 if(n.s==='JSON_INTEGER'&&n.c.length===1){const s=text(n.c[0]);if(!/^(0|-?[1-9][0-9]*)$/.test(s))throw Error('integer spelling');const v=Number(s);if(!Number.isSafeInteger(v)||String(v)!==s)throw Error('integer transport bound');return v;}
 if(n.s==='JSON_NULL'&&!n.c.length)return null;
 throw Error('unbound observation constructor '+n.s);
}
const candidates=[];
for(let i=0;i<nf;i++){const p=8+cap*10+i*12,id=w(p),n=t(id);if(n.s!==root||n.c.length!==args.length+1)continue;if(args.every((s,j)=>{const x=t(n.c[j]);return x.s===s&&!x.c.length;}))candidates.push({fact:i,term:n.c.at(-1)});}
if(candidates.length!==1)throw Error('observation cardinality '+candidates.length);
const selected=candidates[0],bytes=Buffer.from(JSON.stringify(value(selected.term)));
fs.writeFileSync(out,bytes);
const record={scope:'Observation only, not admission or commit',source_sha256:map.source_sha256,image_sha256:map.image_sha256,readback_sha256:hash(raw),fact:selected.fact,term:selected.term,selector:{root,prefix:args},output_sha256:hash(bytes),size:bytes.length,projector_sha256:hash(fs.readFileSync(new URL(import.meta.url)))};
fs.writeFileSync(out+'.custody.json',JSON.stringify(record,null,2));console.log(JSON.stringify(record));
