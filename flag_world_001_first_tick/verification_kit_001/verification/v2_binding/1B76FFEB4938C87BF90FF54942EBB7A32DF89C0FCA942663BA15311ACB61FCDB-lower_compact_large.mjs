// Generic structural seating of source-declared positive law applications.
// No application predicate names, geometry construction, or expected outputs.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {sourceOccurrenceCustody} from 'file:///C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs';
const [input,out,inputJSON,...namedInputArgs]=process.argv.slice(2);
const namedInputs=new Map();
for(const arg of namedInputArgs){const m=/^([A-Za-z][A-Za-z_0-9]*)=(.+)$/.exec(arg);if(!m||namedInputs.has(m[1]))throw Error('named input binding');namedInputs.set(m[1],m[2]);}
if(!input||!out) throw Error('source.mal output-directory required');
const raw=fs.readFileSync(input),source=raw.toString('utf8');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const clean=source.replace(/"(?:\\.|[^"\\])*"|\/\/[^\r\n]*/g,m=>m.startsWith('"')?m:' '.repeat(m.length));
const tokens=[];const lexer=/\s+|"(?:\\.|[^"\\])*"|[A-Za-z_][A-Za-z_0-9]*|:=|[@{}(),;]/y;
for(let at=0;at<clean.length;){lexer.lastIndex=at;const m=lexer.exec(clean);if(!m)throw Error(`Unsupported byte at ${at}`);if(!/^\s+$/.test(m[0]))tokens.push({s:m[0],at});at=lexer.lastIndex;}
let k=0;const symbols=[],patterns=[],seeds=[],rules=[],imports=[],occurrences=[],patternIds=new Map();
const occurrenceCounts=new Map(),occurrenceHash=crypto.createHash('sha256');let occurrenceCount=0;
function recordOccurrence(id,offset){const key=id+':'+offset;occurrenceCounts.set(key,(occurrenceCounts.get(key)||0)+1);occurrenceHash.update(JSON.stringify([id,offset])+'\n');occurrenceCount++;}
const symbol=s=>{let i=symbols.indexOf(s);if(i<0){i=symbols.length;symbols.push(s);}return i;};
const pattern=(s,children,offset)=>{const sym=typeof s==='number'?s:symbol(s),key=JSON.stringify([sym,children]);let id=patternIds.get(key);if(id===undefined){id=patterns.length;patterns.push({sym,children,offset});patternIds.set(key,id);}recordOccurrence(id,offset);return id;};
function list(items,offset){let p=pattern('NIL',[],offset);for(let i=items.length-1;i>=0;i--)p=pattern('CONS',[items[i],p],offset);return p;}
function text(s,offset){return pattern('TEXT',[list([...Buffer.from(s,'utf8')].map(b=>pattern('B'+b,[],offset)),offset)],offset);}
// Transport representation only. Keys, values and order are not interpreted here.
function value(v,offset){
 if(typeof v==='string')return text(v,offset);
 if(Array.isArray(v))return pattern('ARRAY',[list(v.map(x=>value(x,offset)),offset)],offset);
 if(v&&typeof v==='object')return pattern('OBJECT',[list(Object.entries(v).map(([a,b])=>pattern('MEMBER',[text(a,offset),value(b,offset)],offset)),offset)],offset);
 if(v===null)return pattern('JSON_NULL',[],offset);
 if(typeof v==='boolean')return pattern(v?'JSON_TRUE':'JSON_FALSE',[],offset);
 if(typeof v==='number'&&Number.isSafeInteger(v))return pattern('JSON_INTEGER',[text(String(v),offset)],offset);
 throw Error('unsupported transport value');
}
let inputBytes,inputObject,lastInputBinding;
const inputCustody=new Map();
function importValue(pointer,offset){
 const named=/^([A-Za-z][A-Za-z_0-9]*):(\/.*|)$/.exec(pointer);
 const alias=named?named[1]:'',location=named?namedInputs.get(alias):inputJSON;
 if(!location)throw Error('input JSON required by source '+alias);
 if(named)pointer=named[2];
 let custody=inputCustody.get(alias);
 if(!custody){const bytes=fs.readFileSync(location),object=JSON.parse(bytes.toString('utf8'));if(!Buffer.from(JSON.stringify(object)).equals(bytes))throw Error('transport requires compact round-trip JSON; duplicate keys/noncanonical bytes refused');custody={path:path.resolve(location),sha256:hash(bytes),size:bytes.length,object};inputCustody.set(alias,custody);if(!alias){inputBytes=bytes;inputObject=object;}}
 lastInputBinding={alias,path:custody.path,sha256:custody.sha256,size:custody.size};
 if(pointer!==''&&!pointer.startsWith('/'))throw Error('JSON pointer required');let v=custody.object;
 for(const segment of pointer===''?[]:pointer.slice(1).split('/')){if(/~(?![01])/u.test(segment))throw Error('pointer escape');const key=segment.replace(/~1/g,'/').replace(/~0/g,'~');if(v===null||typeof v!=='object'||!Object.hasOwn(v,key))throw Error('unfilled input '+pointer);v=v[key];}
 return value(v,offset);
}
const peek=()=>tokens[k]?.s;
function expect(s){if(peek()!==s)throw Error(`Expected ${s} at ${tokens[k]?.at}`);k++;}
function name(){const t=tokens[k++];if(!t||!/^\w+$/.test(t.s))throw Error('identifier required');return t;}
function term(vars){if(peek()?.startsWith('"')){const t=tokens[k++];return text(JSON.parse(t.s),t.at);}const t=name();const children=[];
 if(peek()==='('){k++;do{children.push(term(vars));if(peek()!==',')break;k++;}while(true);expect(')');}
 let sym;
 if(vars&&/^[a-z]/.test(t.s)&&children.length===0){if(!vars.includes(t.s))vars.push(t.s);sym=-1-vars.indexOf(t.s);}
 else sym=symbol(t.s);
 if(children.length>8)throw Error('term arity bound 8');
 return pattern(sym,children,t.at);
}
while(k<tokens.length){
 if(peek()==='domain'){k++;name();expect('on');name();expect(';');continue;}
 if(peek()==='@'){k++;
  if(peek()==='readonly'){k++;expect('input');const id=name();expect(':=');const p=tokens[k++];if(!p?.s.startsWith('"'))throw Error('input pointer literal required');expect(';');
   const pointer=JSON.parse(p.s),v=importValue(pointer,p.at),seed=pattern('THIS',[pattern(id.s,[],id.at),v],id.at);seeds.push(seed);imports.push({name:id.s,pointer,seed,start:id.at,end:tokens[k-1].at+1,input_binding:lastInputBinding});continue;}
  expect('propose');expect('seed');name();expect(':=');expect('{');
  while(peek()!=='}'){seeds.push(term(null));if(peek()!==',')break;k++;}expect('}');expect(';');continue;}
 if(peek()==='law'){const start=tokens[k++].at,id=name().s;expect(':=');expect('IF');const vars=[],ants=[];
  do{ants.push(term(vars));if(peek()!==',')break;k++;}while(true);
  expect('THEN');const bound=[...vars],result=term(vars);expect(';');
  if(vars.length!==bound.length)throw Error('Consequent introduces ungrounded variable');
  if(vars.length>16||ants.length>8)throw Error('law resource bound');
  rules.push({name:id,ants,result,vars,start,end:tokens[k-1].at+1});continue;}
 throw Error(`Unsupported source token ${peek()} at ${tokens[k]?.at}`);
}
if(!seeds.length||!rules.length||patterns.length>1048576||seeds.length>2048||rules.length>1024)throw Error('source bounds');
// Image uses 32-bit little-endian words; zero reserved slots; no ABI padding.
const words=[0x33414c47,patterns.length,seeds.length,rules.length];
for(let i=0;i<1048576;i++){const p=patterns[i];words.push(p?.sym??0,p?.children.length??0,...Array.from({length:8},(_,j)=>p?.children[j]??0));}
for(let i=0;i<2048;i++)words.push(seeds[i]??0);
for(let i=0;i<1024;i++){const r=rules[i];words.push(r?.ants.length??0,r?.result??0,...Array.from({length:8},(_,j)=>r?.ants[j]??0));}
const bytes=Buffer.alloc(words.length*4);words.forEach((v,i)=>bytes.writeInt32LE(v,i*4));
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'source.mal'),raw);
fs.writeFileSync(path.join(out,'image.bin'),bytes);
fs.writeFileSync(path.join(out,'source-occurrence-custody.json'),JSON.stringify({source_sha256:hash(raw),producer_sha256:hash(fs.readFileSync(new URL('file:///C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs'))),...sourceOccurrenceCustody(source)},null,2));
fs.writeFileSync(path.join(out,'source-map.json'),JSON.stringify({source:path.resolve(input),source_sha256:hash(raw),lowerer_sha256:hash(fs.readFileSync(new URL(import.meta.url))),image_sha256:hash(bytes),input:inputBytes?{path:path.resolve(inputJSON),sha256:hash(inputBytes),size:inputBytes.length,imports}:null,inputs:[...inputCustody].map(([alias,{object,...record}])=>({alias,...record})),imports,symbols,patterns,occurrence_encoding:{kind:'count-by-pattern-and-source-offset',total:occurrenceCount,sequence_sha256:occurrenceHash.digest('hex').toUpperCase(),rows:[...occurrenceCounts].map(([key,count])=>{const [pattern,offset]=key.split(':').map(Number);return {pattern,offset,count};})},seeds,rules},null,2));
console.log(JSON.stringify({source_sha256:hash(raw),image_sha256:hash(bytes),patterns:patterns.length,seeds:seeds.length,rules:rules.length}));
