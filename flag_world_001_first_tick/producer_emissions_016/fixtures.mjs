// Existing-input custody and representation transport; expectations stay external.
// Descriptor encoding below is observation encoding, not LocalSection CANONICAL_BYTES.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
export const need=(condition,message)=>{if(!condition)throw Error(message);};
export const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
export function identity(file){
 const fd=fs.openSync(file,'r'),hash=crypto.createHash('sha256'),buffer=Buffer.alloc(1024*1024);let bytes=0;
 try{for(;;){const n=fs.readSync(fd,buffer,0,buffer.length,null);if(!n)break;bytes+=n;hash.update(buffer.subarray(0,n));}}
 finally{fs.closeSync(fd);}
 return {path:path.resolve(file),bytes,sha256:hash.digest('hex').toUpperCase()};
}
export const paths={
 lower:path.join(root,'j17_step_021/tools/lower.mjs'),
 runtime:path.join(root,'runtime_021/block_iterative_runtime.exe'),
 runtimeQualification:path.join(root,'runtime_021/qualification_002/QUALIFICATION.json'),
 decoder:path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs'),
 world:path.join(root,'j17_step_023/outputs/committed.world.json'),
 checker:path.join(root,'j17_tick_promote_binding_013/verify_binding.mjs'),
 evidence:path.join(root,'j17_tick_promote_binding_013/BINDING_EVIDENCE.json'),
 promote:path.join(root,'j17_tick_promote_binding_013/RECORD_J17_TICK_PROMOTE_BINDING_013.mal'),
 oneRun:'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/RUN_RECORD_010.json',
 oneExport:'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/FIBRE_ASSIGNMENTS_AND_RECEIPTS.json',
 twoRun:'D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/RUN_RECORD_011.json',
 twoExport:'D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/PAIR_ASSIGNMENTS_AND_RECEIPTS.json',
 originalMap:'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/stage/source-map.json',
 originalReadback:'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/stage/readback.bin',
};
export const sources=[path.join(here,'source/member_producers.mal'),path.join(root,'producer_projection_015/source/producer_projection.mal'),path.join(root,'producer_projection_015/source/r4_verdicts.mal'),path.join(root,'governing_junction_content_014/source/governing_junction_content.mal')];
export const pins=new Map([
 [paths.lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [paths.runtime,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [path.join(root,'runtime_021/block_iterative_runtime.cu'),'F055FFCE4AA8F536CE9BC7AEA7B1235887371D2855C9312F420FB5FEFB1D5ECE'],
 [paths.runtimeQualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [paths.decoder,'4612D0189AD00B89522C8CD9F472E39EB1574991F5FB4241FF3CD85F415E32D3'],
 [path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs'),'187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 ['C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs','187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 [paths.world,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [paths.checker,'09D620DC73331BB6E7D2EC56A6A9C8DA81DBBB008D6D5853A2DB4113E5829E32'],
 [paths.evidence,'171CD86278BD859418D42A198D13466CEC5BB0204E4FB00F3F2FD99D87F8B6F4'],
 [paths.promote,'2E762748A07C77A808B6CD8A612DE926839D6066D99D0E5949CE2E990BD735E4'],
 [paths.oneRun,'2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053'],
 [paths.oneExport,'3CF8EBD03172E056852399AC472605EFEA3704EB6EB71A6EFFB259A2566B4147'],
 [paths.twoRun,'35334015AC81697383480FAE210DE3CC1AF06FEBD75079761E280BCF948EE518'],
 [paths.twoExport,'BF21091472DA1C4E61B4D75F3F27E8E9C48BE67742C8A6DC9DECE2D783BF981F'],
 [paths.originalMap,'A2D2E9A99EDCC25B1C63974BB60915B6746D87E0A189AAB43A2B14D62E5AD1CA'],
 [paths.originalReadback,'C381CCCD2A580CA90BB88216CF63F7CEA4ACD444DBA95B75379D12507FECC9D3'],
 [sources[0],'EC739D9889735A00A88C0F4D3E1A188D4CC2A0A46AF19666E16EDD2677A77DBD'],
 [sources[1],'6D5154712636E80354154D2465A847DCEB6C7B7CA87036F3BFFC9C6C34577739'],
 [sources[2],'4ACC52308528FDBCF38A73CAA36E020EB370F6B1ADFA361659AACEB5AF55A1F6'],
 [sources[3],'056AD86E4D09BD21AD99385F981E7480854F21BE723F0350A7B282A7734F70E6'],
 [path.join(here,'CONTACTS.json'),'58DBC1BD04DA146112CDC22808E9C9A097AAF0DBAAD13A20A61F0E4670256AEF'],
 [path.join(here,'README.md'),'D41405452648686B8F10BA656FAA260846A099B54698540B329F25E21D14323D'],
]);
export function verifyPins(){for(const [file,digest]of pins)need(identity(file).sha256===digest,'INPUT_NOT_SAME '+file);}
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const observationBytes=value=>Buffer.from(JSON.stringify(stable(value)),'utf8');
const q=JSON.stringify,H=digest=>'H_'+digest;
export const fact=(tag,...args)=>`GOES_WITH(${[tag,...args].join(',')})`;
export const pos=(operator,witness)=>`POSITION(${operator},${witness})`;
export function reference(digest){
 need(/^[0-9A-F]{64}$/.test(digest),'DIGEST_TRANSPORT_WIDTH');
 const bits=[...Buffer.from(digest,'hex')].flatMap(byte=>Array.from({length:8},(_,i)=>(byte>>(7-i))&1?'THIS':'NO'));
 return `PRESENT(${bits.reduceRight((tail,bit)=>`CONS(${q(bit)},${tail})`,'NIL')})`;
}
// Bounded observation of two existing facts and their term trees, not proof replay.
function nativeProofs(){
 const map=JSON.parse(fs.readFileSync(paths.originalMap)),run=JSON.parse(fs.readFileSync(paths.oneRun));
 need(map.source_sha256===run.source.sha256&&map.image_sha256===run.image.sha256,'ORIGINAL_MAP_CUSTODY');
 const fd=fs.openSync(paths.originalReadback,'r'),cache=new Map();
 const read=(count,offset)=>{const b=Buffer.alloc(count);need(fs.readSync(fd,b,0,count,offset)===count,'ORIGINAL_SHORT_READ');return b;};
 try{
  const head=read(32,0),h=i=>head.readInt32LE(i*4);
  need(h(0)===0x31524c47&&h(1)===1&&h(4)===0&&h(5)<=h(2)&&h(6)<=h(3),'ORIGINAL_READBACK_HEADER');
  need(fs.fstatSync(fd).size===4*(8+h(2)*10+h(3)*12),'ORIGINAL_READBACK_SIZE');
  function node(id){if(cache.has(id))return cache.get(id);need(id>=0&&id<h(5),'ORIGINAL_TERM_BOUNDS');const b=read(40,4*(8+id*10)),arity=b.readInt32LE(4);need(arity>=0&&arity<=8,'ORIGINAL_ARITY');const n={s:map.symbols[b.readInt32LE(0)],c:Array.from({length:arity},(_,j)=>b.readInt32LE(8+j*4))};need(typeof n.s==='string'&&n.c.every(c=>c>=0&&c<id),'ORIGINAL_TERM_CUSTODY');cache.set(id,n);return n;}
  function list(id){const a=[];for(let k=0;k<h(5);k++){const n=node(id);if(n.s==='NIL'&&!n.c.length)return a;need(n.s==='CONS'&&n.c.length===2,'ORIGINAL_LIST');a.push(n.c[0]);id=n.c[1];}throw Error('ORIGINAL_LIST_BOUND');}
  function render(id){const n=node(id);if(n.s==='TEXT'){need(n.c.length===1,'ORIGINAL_TEXT');const bytes=Uint8Array.from(list(n.c[0]).map(i=>{const b=node(i);need(!b.c.length&&/^B(?:0|[1-9][0-9]*)$/.test(b.s)&&Number(b.s.slice(1))<256,'ORIGINAL_OCTET');return Number(b.s.slice(1));}));return q(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}return n.s+(n.c.length?'('+n.c.map(render).join(',')+')':'');}
  return [8296,3535068].map(id=>{need(id<h(6),'ORIGINAL_FACT_BOUNDS');const b=read(48,4*(8+h(2)*10+id*12)),rule=b.readInt32LE(4),count=b.readInt32LE(12);need(rule>=0&&rule<map.rules.length&&count>=0&&count<=8,'ORIGINAL_RULE_BOUNDS');const support=Array.from({length:count},(_,j)=>b.readInt32LE(16+j*4));need(support.every(p=>p>=0&&p<id)&&support.length===map.rules[rule].ants.length,'ORIGINAL_SUPPORT_CUSTODY');const n=node(b.readInt32LE(0));need(n.s==='THIS'&&n.c.length===2,'ORIGINAL_NATIVE_FACT_SHAPE');return {fact:id,term:render(b.readInt32LE(0)),member:render(n.c[1]),origin:map.rules[rule].name,rule,rank:b.readInt32LE(8),support};});
 }finally{fs.closeSync(fd);}
}
export function buildBundle(){
 const evidence=JSON.parse(fs.readFileSync(paths.evidence)),binding=evidence.binding,member=binding.enactment.member_reference,proofs=nativeProofs();
 need(member.json_pointer==='/cases/275'&&member.case_fact===8296&&member.canonical_record_sha256==='19EBB89436905DB26E25BDB0039043C870C9282FA0E3CDEFECFBB749340DBDE9','BOUND_MEMBER_IDENTITY');
 need(binding.source.file_sha256===pins.get(paths.world),'BOUND_SOURCE_IDENTITY');
 const m=`SITE(${q(binding.enactment.site)},${q(binding.enactment.reading)})`;
 need(proofs[0].member===m&&proofs[1].member===m&&proofs[0].term===`THIS(SC_CASE,${m})`&&proofs[1].term===`THIS(SC_STRICT,${m})`,'NATIVE_MEMBER_TERM');
 need(proofs[0].origin==='SC_SITE_NO'&&proofs[1].origin==='SC_STRICT','NATIVE_PROOF_ORIGINS');
 need(member.strict_support.length===1&&member.strict_support[0].fact===proofs[1].fact&&JSON.stringify(member.strict_support[0].support)===JSON.stringify(proofs[1].support),'STRICT_EXPORT_CUSTODY');
 const descriptors=proofs.map(p=>{const value={exportsha:pins.get(paths.oneExport),casepointer:member.json_pointer,fact:p.fact,origin:p.origin,support:p.support},bytes=observationBytes(value);return {kind:'OBSERVATION_DESCRIPTOR_HASH',encoding:'UTF8_SORTED_OBJECT_KEY_COMPACT_JSON; NOT_LOCAL_SECTION_CANONICAL_BYTES',value,bytes_hex:bytes.toString('hex'),sha256:sha(bytes)};});
 const source=H(pins.get(paths.world)),memberRef=H(member.canonical_record_sha256),record=`RECORD_REF(${H(pins.get(paths.oneExport))},${q(member.json_pointer)})`,promote=`RECORD_REF(${H(pins.get(paths.promote))},${q('/')})`;
 const roles=['PROPOSE','DECIDE','PROMOTE'],records=[record,record,promote],proofHashes=[descriptors[0].sha256,descriptors[1].sha256,pins.get(paths.promote)];
 need(new Set(proofHashes).size===3,'DISTINCT_PROOF_SUBJECTS');
 const producers=roles.map((role,i)=>({role,record:records[i],id:`P16_PRODUCER_ID(${source},${m},${role},${records[i]})`,domain:`P16_DOMAIN_ID(${source},${m},${role},${records[i]})`,proofHash:proofHashes[i],proofRef:reference(proofHashes[i])}));
 const rows=[],add=(name,tag,...args)=>rows.push({name,tag,args});
 add('restriction','P16_SOURCE_RESTRICTION',source,m,memberRef,promote);
 for(const p of producers)add('record_'+p.role,'P16_PRODUCER_RECORD',source,m,p.role,p.record,p.domain);
 add('raw_case','RAW',proofs[0].term);add('raw_strict','RAW',proofs[1].term);
 add('case_support','P16_CASE_SUPPORT',source,record,proofs[0].term,memberRef,H(proofHashes[0]));
 add('strict_support','P16_STRICT_SUPPORT',source,record,proofs[1].term,memberRef,H(proofHashes[1]));
 add('promote_support','P16_PROMOTE_MEMBER',source,promote,m,memberRef,H(proofHashes[2]));
 add('case_content','P16_PROOF_CONTENT',source,record,`P16_PROOF_SUBJECT(${proofs[0].term},${memberRef})`,H(proofHashes[0]),producers[0].proofRef);
 add('strict_content','P16_PROOF_CONTENT',source,record,`P16_PROOF_SUBJECT(${proofs[1].term},${memberRef})`,H(proofHashes[1]),producers[1].proofRef);
 add('promote_content','P16_PROOF_CONTENT',source,promote,`P16_PROMOTED_MEMBER(${m},${memberRef})`,H(proofHashes[2]),producers[2].proofRef);
 add('member_content','P16_MEMBER_CONTENT',source,m,memberRef,reference(member.canonical_record_sha256));
 const pairs=[[0,1],[0,2],[1,2]].map(([a,b])=>({case:'P16_MEMBER_PAIR',left:producers[a].id,right:producers[b].id}));
 pairs.forEach((p,i)=>add('pair_'+i,'P15_PAIR',p.case,p.left,p.right));
 const variants=[{id:'normal',rows,withheldRoles:[],missingMemberContent:false}];
 function negative(id,role,mutate,missingMemberContent=false){const changed=structuredClone(rows.filter(r=>r.tag!=='P15_PAIR'));mutate(changed);variants.push({id,rows:changed,withheldRoles:role?[role]:[],missingMemberContent});}
 const change=(rows,name,index,value)=>{rows.find(r=>r.name===name).args[index]=value;};
 const remove=(rows,name)=>rows.splice(rows.findIndex(r=>r.name===name),1);
 const otherMember=`SITE(${q(binding.enactment.site)},"THIS")`;
 negative('negative_wrong_source','PROPOSE',r=>change(r,'case_support',0,memberRef));
 negative('negative_wrong_member','PROPOSE',r=>change(r,'case_support',2,`THIS(SC_CASE,${otherMember})`));
 negative('negative_wrong_member_ref','PROPOSE',r=>change(r,'case_support',3,source));
 negative('negative_wrong_record','PROPOSE',r=>change(r,'case_support',1,promote));
 negative('negative_wrong_proof','PROPOSE',r=>change(r,'case_support',4,H(proofHashes[1])));
 negative('negative_missing_case_native','PROPOSE',r=>remove(r,'raw_case'));
 negative('negative_missing_strict_native','DECIDE',r=>remove(r,'raw_strict'));
 negative('negative_promote_wrong_record','PROMOTE',r=>change(r,'promote_support',1,record));
 negative('negative_promote_wrong_member','PROMOTE',r=>change(r,'promote_support',2,otherMember));
 negative('negative_missing_member_content',null,r=>remove(r,'member_content'),true);
 return {source,m,memberRef,promote,memberHash:member.canonical_record_sha256,memberContent:reference(member.canonical_record_sha256),producers,pairs,variants,transport:{scope:'EXISTING_MEMBER_RESTRICTION_AND_EXISTING_NATIVE_FACT_TRANSPORT; NO_SEMANTIC_VERDICT_INPUT',native_proofs:proofs,proof_descriptors:descriptors,promote_proof:{kind:'ORIGINAL_RECORD_HASH',path:paths.promote,sha256:pins.get(paths.promote)},source_readback:identity(paths.originalReadback),source_map:identity(paths.originalMap),bit_order:'DIGEST_OCTETS_IN_FILE_ORDER; EACH_OCTET_MSB_FIRST; 0=NO,1=THIS',role_records:producers.map(({role,record})=>({role,record})),keep_two_role:'EXHAUSTION_CUSTODY_ONLY; NOT_SC_STRICT_PRODUCER',uncontacted_basis_coordinates_per_producer:43}};
}
export const rowTerm=row=>row.tag==='RAW'?row.args[0]:fact(row.tag,...row.args);
export const fixtureSource=rows=>'// Bound existing operands; negative variants are isolated transport mutations.\n@propose seed P16_INPUTS := {\n  '+rows.map(rowTerm).join(',\n  ')+'\n};\n';
export function expectations(bundle,variant){
 const tags=['P16_OWNER','P16_CONTACT_PROOF','P15_PRODUCER','P15_DECLARE','P15_OWNER','P15_DOMAIN','P15_CONTACT','P15_SEED','P15_PENDING','P15_DOMAIN_CONFLICT','P15_SHARED','P15_PRIVATE','P15_OUTSIDE_BOTH','P15_DERIVED','GJC_REQUEST','GJC_RESULT','GJC_AGREEMENT','GJC_WALL','GJC_MISSING'];
 const expected=Object.fromEntries(tags.map(t=>[t,[]])),emit=(tag,...args)=>expected[tag].push(fact(tag,...args));
 const coordinates=[pos('THIS','WHAT'),pos('BECAUSE','HOW')],available=new Map();
 for(const p of bundle.producers){
  emit('P16_OWNER',p.id,p.domain,bundle.memberRef,bundle.promote);emit('P15_PRODUCER',p.id,p.role,p.record,p.domain);emit('P15_OWNER',p.id,p.record,p.domain);
  for(const c of coordinates){emit('P15_DECLARE',p.id,p.domain,c,'SUPPORTED');emit('P15_DOMAIN',p.id,p.domain,c,'SUPPORTED');}
  const contacts=new Map();available.set(p.id,contacts);
  if(variant.withheldRoles.includes(p.role))continue;
  emit('P16_CONTACT_PROOF',p.id,p.domain,bundle.memberRef,p.proofRef);
  contacts.set(coordinates[1],p.proofRef);if(!variant.missingMemberContent)contacts.set(coordinates[0],bundle.memberContent);
  for(const [c,ref]of contacts){emit('P15_CONTACT',p.id,p.record,c,'"IF_THEN"',ref);emit('P15_SEED',p.id,c,'"IF_THEN"',ref);}
  emit('P15_DERIVED',p.id,pos('BECAUSE','WHEN'),'"IF_THEN"');
  if(!variant.missingMemberContent){emit('P15_DERIVED',p.id,pos('THIS','WHERE'),'"IF_THEN"');emit('P15_DERIVED',p.id,pos('THIS','WHICH'),'"IF_THEN"');}
 }
 for(const pair of variant.rows.some(r=>r.tag==='P15_PAIR')?bundle.pairs:[])for(const c of coordinates){emit('P15_SHARED',pair.case,pair.left,pair.right,c);const l=available.get(pair.left).get(c),r=available.get(pair.right).get(c);if(!l||!r)continue;const context=`PAIR_CONTEXT(${pair.case},${pair.left},${pair.right})`,reading=c===coordinates[0]?'IF_THEN':'NOT_SAME';emit('GJC_REQUEST',context,c,l,r);emit('GJC_RESULT',context,c,l,r,q(reading));emit(reading==='IF_THEN'?'GJC_AGREEMENT':'GJC_WALL',context,c,l,r);}
 for(const tag of tags)expected[tag]=[...new Set(expected[tag])].sort();return expected;
}
