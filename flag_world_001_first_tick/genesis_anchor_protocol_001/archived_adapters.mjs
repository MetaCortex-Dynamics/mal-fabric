// Archived execution adapters. World facts are read from bound GPU readbacks;
// no marking, agreement or chain construction is implemented in this host code.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createBoundary, PROFILE, Refusal } from './api_boundary.mjs';

const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const ID = { contract: '05737EE72CE36790AC01C96DF7F316A54282317E345E446315F8AA8EA5BBAB67',
  receipt: 'BDC284C1F43621EA69A6098AB4A0B7F9FA6095770A3439E9A19CBE2E5CF95212',
  decision: '2CBBA4AD971D11AC2B2B4867ECCC4D58917A16602C096FE64308D0B8F487BCE7',
  promotion: 'C1BA60101C95E76C3D2F090B00E3B679A6B58851B8A235829214D2B6249BD072' };
const fail = (reading, code) => { throw new Refusal(reading, code); };
const exactKeys = (x, ks) => x && typeof x === 'object' && !Array.isArray(x) && Object.keys(x).length === ks.length && ks.every(k => Object.hasOwn(x,k));
function shape(x, ks) { if (!exactKeys(x, ks)) fail('NO', 'CONTACT_REQUEST_SCHEMA'); }
function same(a,b,code) { if (JSON.stringify(a) !== JSON.stringify(b)) fail('NOT-SAME', code); }

// Generic typed-fact reader. Predicates and arguments are selectors over an
// already executed closure, not host implementations of those predicates.
function facts(raw, map) {
  const w = i => raw.readInt32LE(i*4), cap=w(2), fc=w(3), nt=w(5), nf=w(6);
  if(w(0)!==0x31524c47||w(1)!==1||w(4)!==0||nt<0||nt>cap||nf<0||nf>fc||raw.length!==4*(8+cap*10+fc*12)) fail('NOT-SAME','READBACK_BOUNDS');
  const term = id => { if(id<0||id>=nt)fail('NOT-SAME','TERM_BOUNDS'); const p=8+id*10,n=w(p+1),s=map.symbols[w(p)]; if(!s||n<0||n>8)fail('NOT-SAME','TERM_SCHEMA'); const c=Array.from({length:n},(_,i)=>w(p+2+i)); if(c.some(x=>x<0||x>=id))fail('NOT-SAME','TERM_ORDER'); return {s,c}; };
  const symbol = id => { const t=term(id); if(t.c.length)fail('NOT-SAME','SYMBOL_REQUIRED'); return t.s; };
  const text = id => { let t=term(id); if(t.s!=='TEXT'||t.c.length!==1)fail('NOT-SAME','TEXT_REQUIRED'); let cur=t.c[0]; const bs=[]; for(let i=0;i<=nt;i++){t=term(cur);if(t.s==='NIL'&&!t.c.length)return new TextDecoder('utf8',{fatal:true}).decode(Uint8Array.from(bs));if(t.s!=='CONS'||t.c.length!==2)break;const x=symbol(t.c[0]);if(!/^B(?:0|[1-9][0-9]*)$/.test(x)||Number(x.slice(1))>255)break;bs.push(Number(x.slice(1)));cur=t.c[1];}fail('NOT-SAME','TEXT_SCHEMA'); };
  const select = (root,prefix) => { const rows=[];for(let i=0;i<nf;i++){const t=term(w(8+cap*10+i*12));if(t.s!==root||!t.c.length)continue;const p=term(t.c[0]);if(!p.c.length&&p.s===prefix)rows.push({fact:i,args:t.c.slice(1)});}return rows; };
  const one=(root,prefix)=>{const r=select(root,prefix);if(r.length!==1)fail('MAYBE','SOURCE_WITNESS_CARDINALITY');return r[0];};
  return {term,symbol,text,select,one};
}

export function createArchivedAPI({ evidenceDirectory }) {
  const sessions = new Map();
  function setup(ctx) {
    const root=ctx.artifactDirectory;
    // The first reads bind these immutable identities before any source tool runs.
    const pinned=(p,h,bytes)=>ctx.readBlob({path:p,bytes,sha256:h});
    // All paths here are fixed adapter contacts, never caller-provided paths.
    const contract=JSON.parse(pinned('kit/GENESIS_CONTRACT.json',ID.contract,22456));
    const receipt=JSON.parse(pinned('kit/verification/PRIMARY_GENESIS_RECEIPT.json',ID.receipt,26820));
    if(receipt.execution!=='EXECUTED'||receipt.verdict!=='IF_THEN'||receipt.contract_sha256!==ID.contract)fail('NOT-SAME','RECEIPT_BINDING');
    const ref=(p)=>{const x=contract.files.find(x=>x.path===p);if(!x)fail('MAYBE','UNBOUND_DEPENDENCY');return {path:'kit/'+p,bytes:x.bytes,sha256:x.sha256};};
    for(const x of contract.files)ctx.readBlob(ref(x.path));
    const decisionPath='contracts/governance/DECISION_RECORD_GPU_SELF_WITNESS_001.mal';
    const promotionPath='contracts/governance/RECEIPT_PROMOTE_DECISION_RECORD_GPU_SELF_WITNESS_001.md';
    pinned('kit/'+decisionPath,ID.decision,3273); pinned('kit/'+promotionPath,ID.promotion,3207);
    const archive=(p,label)=>{const x=receipt.comparisons.find(x=>x.label===label);if(!x||x.comparison!=='SAME')fail('NOT-SAME','OUTPUT_RECEIPT_BINDING');const b=x.actual??x; const r={path:'archive/'+p,bytes:b.bytes,sha256:b.sha256};ctx.readBlob(r);return r;};
    const outputs={frame:archive('frame.json','captured-frame-to-header'),field:archive('current.field.json','CURRENT_FIELD'),witness:archive('current.witness.json','CURRENT_WITNESS'),changes:archive('current.receipt.json','CURRENT_RECEIPT'),ground:archive('Ground0.field.json','GROUND_0_012'),committed:archive('committed.genesis.json','complete committed genesis'),hashes0:archive('hashes0/responses.json','first hash responses'),hashes1:archive('hashes1/responses.json','chain hash responses')};
    for(const s of contract.stages){archive(s.id+'/image.bin',s.id+' image');archive(s.id+'/readback.bin',s.id+' complete readback');}
    const execution={path:'kit/verification/PRIMARY_GENESIS_RECEIPT.json',bytes:ctx.readBlob({path:'kit/verification/PRIMARY_GENESIS_RECEIPT.json',bytes:26820,sha256:ID.receipt}).length,sha256:ID.receipt};
    return {root,contract,receipt,ref,archive,outputs,execution,decisionPath,promotionPath};
  }
  function prepare(s,ctx) {
    if(sessions.has(s.root)) { const session=sessions.get(s.root);for(const e of session.evidence)ctx.retainEvidence(e);return session; }
    const dir=fs.mkdtempSync(path.join(evidenceDirectory,'adapter-'));
    const evidence=[];
    const keep=(p)=>{const b=fs.readFileSync(p),r={path:path.relative(evidenceDirectory,p).split(path.sep).join('/'),bytes:b.length,sha256:sha(b)};ctx.retainEvidence(r);evidence.push(r);};
    const run=(tool,args,label)=>{
      const source=ctx.readBlob(s.ref(tool));
      const result=spawnSync(process.execPath,[path.join(s.root,'kit',tool),...args],{encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
      const log=path.join(dir,label+'.command.json');fs.writeFileSync(log,JSON.stringify({tool,source_sha256:sha(source),args,exit:result.status,error:result.error?.message??null,stdout:result.stdout,stderr:result.stderr},null,2));keep(log);
      if(result.status!==0)fail('MAYBE','SOURCE_TOOL_REFUSED');
    };
    const frame=path.join(dir,'frame.json');
    run('tools/transport_slices.mjs',[path.join(s.root,'kit/inputs/captured-frame.bin'),s.contract.event_sha256,path.join(s.root,'kit/tools/persistence_frame_layout.json'),frame],'decode');
    if(!fs.readFileSync(frame).equals(ctx.readBlob(s.outputs.frame)))fail('NOT-SAME','DECODED_FRAME');keep(frame);keep(frame+'.custody.json');
    const alias={frame,capture:path.join(s.root,'kit/inputs/capture.json'),field:path.join(s.root,'archive/current.field.json'),witness:path.join(s.root,'archive/current.witness.json'),ground:path.join(s.root,'archive/Ground0.field.json'),hashes:path.join(s.root,'archive/hashes0/responses.json'),links:path.join(s.root,'archive/hashes1/responses.json')};
    let reader;
    for(const [id,source,wide,names] of [['genesis_gpu','sources/genesis_run.mal',false,['frame','capture']],['commit2_gpu','sources/commit_run_v3.mal',true,['frame','capture','field','witness','hashes','links']]]) {
      const stage=path.join(dir,id),tool=wide?'vendor/gpu_self_witness_018/lower_capacity_16384.mjs':'vendor/original/lower.mjs';
      run(tool,[path.join(s.root,'kit',source),stage,'-',...names.map(n=>n+'='+alias[n])],'lower-'+id);
      const spec=s.contract.stages.find(x=>x.id===id);
      if(sha(fs.readFileSync(path.join(stage,'image.bin')))!==spec.image_sha256)fail('NOT-SAME','SOURCE_IMAGE');
      const raw=ctx.readBlob(s.archive(id+'/readback.bin',id+' complete readback'));
      fs.writeFileSync(path.join(stage,'readback.bin'),raw,{flag:'wx'});
      const map=JSON.parse(fs.readFileSync(path.join(stage,'source-map.json')));
      if(map.source_sha256!==s.ref(source).sha256||map.image_sha256!==spec.image_sha256)fail('NOT-SAME','SOURCE_MAP');
      keep(path.join(stage,'image.bin'));keep(path.join(stage,'source-map.json'));
      if(id==='genesis_gpu') {
        reader=facts(raw,map);
        for(const [tag,key] of [['GROUND_0_012','ground'],['CURRENT_FIELD','field'],['CURRENT_WITNESS','witness'],['CURRENT_RECEIPT','changes']]) {
          const dest=path.join(dir,key+'.json');run('vendor/original/extract_json_rows.mjs',[stage,'THIS','OBSERVATION_ROW',tag,dest],'extract-'+key);
          if(!fs.readFileSync(dest).equals(ctx.readBlob(s.outputs[key])))fail('NOT-SAME','OBSERVED_'+tag);keep(dest);keep(dest+'.custody.json');
        }
      } else {
        const dest=path.join(dir,'committed.json');run('vendor/original/extract_json_value.mjs',[stage,'THIS','COMMITTED_GENESIS',dest],'extract-commit');
        if(!fs.readFileSync(dest).equals(ctx.readBlob(s.outputs.committed)))fail('NOT-SAME','OBSERVED_COMMIT');keep(dest);keep(dest+'.custody.json');
      }
    }
    const session={reader,evidence};sessions.set(s.root,session);return session;
  }
  function capture(x,s,ctx) {
    shape(x,['profile','event','evidence']);if(x.profile!==PROFILE)fail('NO','UNSUPPORTED_PROFILE');
    for(const [key,p,missing] of [['event','inputs/captured-frame.bin','MISSING_CAPTURE'],['evidence','inputs/capture.json','MISSING_SOURCE_EVIDENCE']]) {
      if(x[key]===null)fail('MAYBE',missing);
      try{ctx.readBlob(x[key]);}catch(e){if(e.code==='MISSING_ARTIFACT')fail('MAYBE',missing);throw e;}
      if(x[key].sha256!==s.ref(p).sha256||x[key].bytes!==s.ref(p).bytes)fail('NOT-SAME','ARCHIVED_'+key.toUpperCase()+'_BINDING');
    }
    return x;
  }
  function validation(x,s,ctx) {
    shape(x,['capture','descriptor','frame','contract','authority','authority_receipt']);capture(x.capture,s,ctx);
    const expected={descriptor:s.ref('tools/persistence_frame_layout.json'),frame:s.outputs.frame,contract:{path:'kit/GENESIS_CONTRACT.json',bytes:22456,sha256:ID.contract},authority:s.ref(s.decisionPath),authority_receipt:s.ref(s.promotionPath)};
    for(const key of Object.keys(expected)){ctx.readBlob(x[key]);same(x[key],expected[key],'VALIDATION_'+key);}
    return x;
  }
  function located(x,s,ctx,session) {
    shape(x,['validation','carrier_source','signature_hex','junction','site']);validation(x.validation,s,ctx);same(x.carrier_source,s.ref('sources/genesis_run.mal'),'CARRIER_SOURCE');
    const r=session.reader, row=r.one('GOES_WITH','ARCHIVED_PHYSICAL_CLOSED_LOCUS');
    const [h,m,t,j,site]=row.args;
    const names=r.select('GOES_WITH','SITE_TEXT').filter(y=>y.args[0]===site);if(names.length!==1)fail('MAYBE','SITE_OBSERVATION');
    const frame=JSON.parse(ctx.readBlob(s.outputs.frame));
    same([r.text(h),r.text(m),r.text(t)],[frame.sha256,frame.fields.machine_id,frame.fields.transition_id],'SOURCE_LOCUS_EVENT');
    same([x.signature_hex,x.junction,x.site],[frame.fields.junction_signature,r.symbol(j),r.text(names[0].args[1])],'SOURCE_LOCUS');return x;
  }
  function seeded(x,s,ctx,session) {
    shape(x,['locus','predecessor','field','witness','agreement_changes']);located(x.locus,s,ctx,session);
    ctx.readBlob(x.predecessor);if(x.predecessor.sha256!==s.outputs.ground.sha256)fail('NO','NON_GROUND_PREDECESSOR');
    for(const [key,name] of [['predecessor','ground'],['field','field'],['witness','witness'],['agreement_changes','changes']]){ctx.readBlob(x[key]);same(x[key],s.outputs[name],'SEED_'+key);}return x;
  }
  const handlers={
    captureArchived(x,ctx){const s=setup(ctx);return capture(x,s,ctx);},
    validateArchived(x,ctx){const s=setup(ctx);capture(x,s,ctx);const session=prepare(s,ctx);session.reader.one('THIS','PERSISTENCE_REPLY_GRAMMAR');session.reader.one('GOES_WITH','ARCHIVED_PHYSICAL_CLOSED_LOCUS');return {capture:x,descriptor:s.ref('tools/persistence_frame_layout.json'),frame:s.outputs.frame,contract:{path:'kit/GENESIS_CONTRACT.json',bytes:22456,sha256:ID.contract},authority:s.ref(s.decisionPath),authority_receipt:s.ref(s.promotionPath)};},
    locate(x,ctx){const s=setup(ctx);validation(x,s,ctx);const q=prepare(s,ctx),r=q.reader,row=r.one('GOES_WITH','ARCHIVED_PHYSICAL_CLOSED_LOCUS'),site=row.args[4];const names=r.select('GOES_WITH','SITE_TEXT').filter(y=>y.args[0]===site);if(names.length!==1)fail('MAYBE','SITE_OBSERVATION');const v={validation:x,carrier_source:s.ref('sources/genesis_run.mal'),signature_hex:JSON.parse(ctx.readBlob(s.outputs.frame)).fields.junction_signature,junction:r.symbol(row.args[3]),site:r.text(names[0].args[1])};return located(v,s,ctx,q);},
    seedInitial(x,ctx){shape(x,['locus','predecessor']);const s=setup(ctx);ctx.readBlob(x.predecessor);if(x.predecessor.sha256!==s.outputs.ground.sha256)fail('NO','NON_GROUND_PREDECESSOR');const q=prepare(s,ctx);located(x.locus,s,ctx,q);return seeded({locus:x.locus,predecessor:x.predecessor,field:s.outputs.field,witness:s.outputs.witness,agreement_changes:s.outputs.changes},s,ctx,q);},
    commitInitial(x,ctx){const s=setup(ctx),q=prepare(s,ctx);seeded(x,s,ctx,q);return {seed:x,committed:s.outputs.committed,execution_receipt:s.execution};},
    verifyInitial(x,ctx){shape(x,['seed','committed','execution_receipt']);const s=setup(ctx),q=prepare(s,ctx);seeded(x.seed,s,ctx,q);same(x.committed,s.outputs.committed,'COMMIT_REFERENCE');same(x.execution_receipt,s.execution,'EXECUTION_RECEIPT');ctx.readBlob(x.committed);ctx.readBlob(x.execution_receipt);for(const p of s.contract.outputs){const n=p.path==='inputs/frame.json'?'frame.json':p.path.replace('expected/genesis/','');const mapping={'hashes0.json':'hashes0/responses.json','hashes1.json':'hashes1/responses.json'};const a=fs.readFileSync(path.join(s.root,'archive',mapping[n]??n));if(!a.equals(ctx.readBlob(s.ref(p.path))))fail('NOT-SAME','CANONICAL_OUTPUT');}return x;}
  };
  return createBoundary({evidenceDirectory,handlers});
}
