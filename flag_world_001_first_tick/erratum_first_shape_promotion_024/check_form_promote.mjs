// Transport, hash custody and report serialization only; both checks execute in .mal.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const root=path.dirname(fileURLToPath(import.meta.url));
const old=path.resolve(root,'../erratum_first_shape_w9_021');
export const hash=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const erratumHash='E93318BCB508733174FB5D4D7622BF8F1ABFD80A8D6F6CC79FF4DA0C6E337BCC';
const receiptHash='19AD057BD1C3F3EF27480F8D292A54EC6E5FAE518BBFF0AAB17BE0E4C8D17B65';
const dependencies=[
 ['runtime',path.join(old,'dependencies/malcog_g1.exe'),'F47EF6DE1734F27984BBC6B75D9574CFA171171099A662F7CD5C53DDAE42F604'],
 ['bytes',path.join(old,'dependencies/v3/software_fpga/threejs_projection_001_committed_4d_world_sections/bytes.mal'),'0A41D5EF3E1BADD0A2B702183D33927F41F2ED3AF0B68713EDCA795F27C5BB63'],
 ['sha256',path.join(root,'dependencies/sha256.mal'),'CC4E659254B9A093DF0A0EF025DB92D827528FF76844047DF7D4BEDEA44BE94D'],
 ['w1_w8',path.join(old,'dependencies/v3/spec_system/002_vectors/v0.3.0/REALIZATION_CHECK_FORM_W1_W8_010.mal'),'B4865E92E5734CAC2F36D4D422E14CB28140C717B7D43F5DF3A46E21E8B7B48F'],
 ['w9',path.join(old,'source/w9.mal'),'45B3FCC3E310D92ACB130AD37BC4A64E0CE0ED4D9225C9D5E6D64BD2791F9ECF'],
 ['composition',path.join(root,'source/check_form_promote.mal'),null]
];
const tokens=['atom','element','entropy','hydrogen','particle','singularity','tie'];
const bind=p=>{const b=fs.readFileSync(p);return {path:p.replaceAll('\\','/'),size:b.length,sha256:hash(b)};};
export function runCheck({input,kind,out,baseline=false}){
 input=path.resolve(input);out=path.resolve(out);
 if(!['specification','erratum'].includes(kind))throw new Error('UNSUPPLIED_RECORD_KIND');
 const bytes=fs.readFileSync(input),inputHash=hash(bytes);
 // An arbitrary spec cannot bypass W1-W8 by asking to be the promoted erratum.
 if(kind==='erratum'&&inputHash!==erratumHash)throw new Error('NOT_SAME promoted erratum identity');
 if(fs.existsSync(out))throw new Error('Output already present; use a fresh directory.');
 const deps=dependencies.map(([name,p,h])=>{
   const row={name,...bind(p)};
   if(h&&row.sha256!==h)throw new Error(`NOT_SAME dependency ${name}`);
   return row;
 });
 const receipt=bind(path.join(root,'inputs/RECEIPT_PROMOTE_ERRATUM_E_FIRST_SHAPE_NO_PIECES_001_v0.1.3.md'));
 const erratum=bind(path.join(root,'inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal'));
 if(receipt.sha256!==receiptHash||erratum.sha256!==erratumHash)throw new Error('NOT_SAME promotion authority bytes');
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'input.mal'),bytes,{flag:'wx'});
 const body=baseline ? `
    THIS original = conform_realize.call(byte_seq_leaf.call(MANY [${[...bytes]}]))
    println.call("CHECK_FORM_024_BEGIN")
    println.call(cfp_read_observation.call(original))
    println.call(original.kind)
    SAME original.kind { "EXECUTED" -> IN raw_baseline { THIS raw = byte_seq_index.call(original.actual,byte_index_zero.call()) println.call(raw.value) } _ -> println.call(original.reason) }
    println.call("CHECK_FORM_024_END")` : `
    THIS checked = check_form_promote.call(byte_seq_leaf.call(MANY [${[...bytes]}]),"${kind.toUpperCase()}")
    println.call("CHECK_FORM_024_BEGIN")
    println.call(checked.reading)
    println.call(checked.w1_w8_reading)
    println.call(checked.w1_w8.kind)
    SAME checked.w1_w8.kind {
      "EXECUTED" -> IN raw_composite { THIS raw = byte_seq_index.call(checked.w1_w8.actual,byte_index_zero.call()) println.call(raw.value) }
      "UNEXECUTED" -> println.call(checked.w1_w8.reason)
      _ -> println.call("NOT_A_SPECIFICATION")
    }
    println.call(checked.w9.verdict)
    println.call(checked.w9.reason)
    ${tokens.map(t=>`println.call(checked.w9.${t})`).join('\n    ')}
    println.call("CHECK_FORM_024_END")`;
 const harness=path.join(out,'harness.mal');
 fs.writeFileSync(harness,`IN check_form_transport_024 { CAN readonly IN main() -> Atom {${body}\n NO IN true\n} }\n`,{flag:'wx'});
 const r=spawnSync(deps[0].path,['--eval',...deps.slice(1).map(d=>d.path),harness],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:16*1024*1024});
 fs.writeFileSync(path.join(out,'stdout.txt'),r.stdout||'',{flag:'wx'});
 fs.writeFileSync(path.join(out,'stderr.txt'),r.stderr||'',{flag:'wx'});
 const lines=(r.stdout||'').split(/\r?\n/).map(s=>s.trim());
 const start=lines.lastIndexOf('CHECK_FORM_024_BEGIN'),end=lines.lastIndexOf('CHECK_FORM_024_END');
 const a=lines.slice(start+1,end);
 let result={reading:'MAYBE',reason:'NATIVE_READBACK_ABSENT'};
 if(r.status===0&&start>=0&&end>start&&a.length===(baseline?3:13)){
   result=baseline ? {reading:a[0],w1_w8:{reading:a[0],kind:a[1],payload:a[2]}} : {
     reading:a[0],w1_w8:{reading:a[1],kind:a[2],payload:a[3]},
     w9:{verdict:a[4],reason:a[5],law_positions:tokens.filter((_,i)=>a[6+i]==='1')}
   };
 }
 const custodyAfter=deps.map(d=>({...bind(d.path),name:d.name}));
 const changed=custodyAfter.filter((d,i)=>d.sha256!==deps[i].sha256).map(d=>d.name);
 if(hash(fs.readFileSync(input))!==inputHash)changed.push('input');
 if(bind(receipt.path).sha256!==receiptHash||bind(erratum.path).sha256!==erratumHash)changed.push('authority');
 if(changed.length)result={reading:'NOT_SAME',reason:'INPUT_OR_SOURCE_CHANGED',changed};
 const record={kind:'CHECK_FORM_PROMOTE_024',subject_kind:kind,input:{path:input.replaceAll('\\','/'),size:bytes.length,sha256:inputHash},
   authority:{receipt,erratum},dependencies:deps,transport:bind(fileURLToPath(import.meta.url)),
   execution:{exit_code:r.status,signal:r.signal,error:r.error?.message||null,harness:bind(harness),stdout:bind(path.join(out,'stdout.txt')),stderr:bind(path.join(out,'stderr.txt'))},
   result,source_custody:changed.length?'NOT_SAME':'SAME',baseline_only:baseline,
   promotion:'NOT_PERFORMED',repository_seal:'NOT_PERFORMED',commit:'NOT_PERFORMED',push:'NOT_PERFORMED'};
 fs.writeFileSync(path.join(out,'CHECK_FORM_PROMOTE.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
 return record;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
   const args=process.argv.slice(2),opts={};
   for(let i=0;i<args.length;i+=2){if(!['--input','--kind','--out'].includes(args[i])||!args[i+1])throw new Error('Use --input FILE --kind specification|erratum --out FRESH_DIRECTORY');opts[args[i].slice(2)]=args[i+1];}
   if(!opts.input||!opts.kind||!opts.out)throw new Error('Input, explicit record kind and fresh output directory are required.');
   const r=runCheck(opts);console.log(JSON.stringify({input_sha256:r.input.sha256,...r.result,record:path.resolve(opts.out,'CHECK_FORM_PROMOTE.json')}));
   process.exitCode=r.result.reading==='IF_THEN'?0:r.result.reading==='NO'?1:r.result.reading==='NOT_SAME'?3:2;
 }catch(e){console.error(e.message);process.exitCode=3;}
}
