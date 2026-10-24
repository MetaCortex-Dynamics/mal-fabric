// Generic observation of a source-law readback. No application predicates or laws.
import fs from 'node:fs';
import crypto from 'node:crypto';
export const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
export function openReadback(dir) {
  const raw=fs.readFileSync(dir+'/readback.bin'), map=JSON.parse(fs.readFileSync(dir+'/source-map.json'));
  const w=i=>raw.readInt32LE(i*4), capacity=w(2), factCapacity=w(3), error=w(4), terms=w(5), count=w(6), epochs=w(7);
  if(w(0)!==0x31524c47||w(1)!==1||terms>capacity||count>factCapacity||raw.length!==4*(8+capacity*10+factCapacity*12))throw Error('readback bounds');
  if(error)throw Error('GPU error '+error);
  function node(id){if(id<0||id>=terms)throw Error('term bounds');const p=8+id*10,n=w(p+1);if(n<0||n>8)throw Error('arity');return {s:map.symbols[w(p)],c:Array.from({length:n},(_,j)=>w(p+2+j))};}
  function list(id){const a=[];for(let k=0;k<=terms;k++){const n=node(id);if(n.s==='NIL'&&!n.c.length)return a;if(n.s!=='CONS'||n.c.length!==2||n.c[1]>=id)throw Error('sequence');a.push(n.c[0]);id=n.c[1];}throw Error('sequence bound');}
  function text(id){const n=node(id);if(n.s!=='TEXT'||n.c.length!==1)throw Error('text');return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(list(n.c[0]).map(i=>{const b=node(i);if(b.c.length||!/^B(?:0|[1-9][0-9]*)$/.test(b.s)||+b.s.slice(1)>255)throw Error('octet');return +b.s.slice(1);})));}
  function value(id,depth=0){if(depth>128)throw Error('value depth');const n=node(id);
    if(n.s==='TEXT')return text(id);
    if(n.s==='ARRAY'&&n.c.length===1)return list(n.c[0]).map(i=>value(i,depth+1));
    if(n.s==='OBJECT'&&n.c.length===1){const o=Object.create(null);for(const i of list(n.c[0])){const m=node(i);if(m.s!=='MEMBER'||m.c.length!==2)throw Error('member');const k=text(m.c[0]);if(Object.hasOwn(o,k))throw Error('duplicate member');o[k]=value(m.c[1],depth+1);}return o;}
    if(n.s==='JSON_INTEGER'&&n.c.length===1){const s=text(n.c[0]),v=Number(s);if(!/^(0|-?[1-9][0-9]*)$/.test(s)||!Number.isSafeInteger(v)||String(v)!==s)throw Error('integer encoding');return v;}
    if(n.s==='JSON_NULL'&&!n.c.length)return null;
    throw Error('unbound observation constructor '+n.s);
  }
  function term(id){const n=node(id);return n.s+(n.c.length?'('+n.c.map(term).join(',')+')':'');}
  const facts=Array.from({length:count},(_,i)=>{const p=8+capacity*10+i*12,rule=w(p+1);return {id:i,term:w(p),rule,origin:rule<0?'SOURCE_SEED':map.rules[rule].name,rank:w(p+2),support:Array.from({length:w(p+3)},(_,j)=>w(p+4+j))};});
  function predicate(tag){return facts.filter(f=>{const n=node(f.term);return n.c.length&&node(n.c[0]).s===tag&&!node(n.c[0]).c.length;});}
  return {raw,map,error,terms,count,epochs,node,list,text,value,term,facts,predicate};
}
