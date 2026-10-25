// Read-only observer comparisons of native outputs, plus a new binding record.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here),repo=path.dirname(root);
const out='D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001';
const j=JSON.stringify,read=p=>JSON.parse(fs.readFileSync(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const need=(x,m)=>{if(!x)throw Error(m);};
const save=(p,o)=>fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n',{flag:'wx'});
const record=read(path.join(out,'RUN_RECORD_011.json'));
need(record.error===0&&record.replay_comparison==='SAME','RUN_NOT_QUALIFIED');
for(const b of record.inputs)need(id(b.path).sha256===b.sha256,'INPUT_CUSTODY_NOT_SAME '+b.path);
const actual=id(record.readback.path);need(actual.sha256===record.readback.sha256,'READBACK_NOT_SAME');
const repeated=id(record.replay.path);need(repeated.sha256===record.replay.sha256&&repeated.sha256===actual.sha256,'REPLAY_NOT_SAME');
const sourceMap=id(path.join(out,'stage/source-map.json')),replayMap=id(path.join(out,'replay/source-map.json'));
need(sourceMap.sha256===replayMap.sha256,'SOURCE_MAP_NOT_SAME');
const data=read(path.join(out,'PAIR_ASSIGNMENTS_AND_RECEIPTS.json'));
need(id(path.join(out,'PAIR_ASSIGNMENTS_AND_RECEIPTS.json')).sha256===record.result.sha256,'OBSERVATION_NOT_SAME');
const r=openReadback(path.join(out,'stage'));
const rows=tag=>r.predicate(tag).map(f=>({fact:f.id,origin:f.origin,support:f.support,args:r.node(f.term).c.slice(1)}));
const pair=id=>{const n=r.node(id);return {kind:r.node(n.c[0]).s,a:r.value(n.c[1]),b:r.value(n.c[2]),reading:r.value(n.c[3])};};
const pairs=new Map(),affected=new Map();
for(const c of data.cases){const key=j([c.a,c.b]);const p=pairs.get(key)??{kind:c.kind,readings:[]};need(p.kind===c.kind,'PAIR_KIND_NOT_SAME');p.readings.push(c.reading);pairs.set(key,p);}
need(pairs.size===720&&[...pairs.values()].every(x=>j([...x.readings].sort())==='["NO","THIS"]'),'PAIR_READING_COVERAGE');
const kindCounts={};for(const p of pairs.values())kindCounts[p.kind]=(kindCounts[p.kind]??0)+1;
need(Object.keys(kindCounts).length===3&&Object.values(kindCounts).every(n=>n===240),'PAIR_KIND_COVERAGE');
for(const f of rows('PA_AFFECTED')){const key=j(pair(f.args[0]));const s=affected.get(key)??new Set();s.add(j(f.args.slice(1,3).map(x=>r.value(x))));affected.set(key,s);}
need(affected.size===1440&&[...affected.values()].every(s=>s.size===5),'AFFECTED_COVERAGE');
need(rows('PA_SIDE_EXAMINED').length===8640&&rows('PA_ENDPOINT_EXAMINED').length===2880,'SIDE_COVERAGE');
const priorPath='D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/RUN_RECORD_010.json';
need(id(priorPath).sha256==='2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053','PRIOR_RECORD_NOT_SAME');
const prior=read(priorPath),singleId=prior.artifacts.find(a=>path.basename(a.path)==='SINGLE_FLAG_EXCLUSIONS.json');
need(singleId&&id(singleId.path).sha256===singleId.sha256,'PRIOR_SINGLE_READBACK_NOT_SAME');
const singles=new Map(read(singleId.path).singles.map(s=>[j(s.flag),s]));
const projection=a=>a.map(j).sort();
const comparisons=[];
for(const c of data.cases.filter(c=>c.changed.length===1)){
 const changed=c.changed[0],old=singles.get(j(changed.flag));need(old,'SINGLE_NOT_LOCATED');
 need(old.before===changed.before&&old.after===changed.after,'SINGLE_EFFECT_NOT_SAME');
 for(const field of ['opened','discharged'])need(j(projection(old[field].map(x=>x.args.slice(1,3))))===j(projection(c[field].map(x=>x.overlap))),'SINGLE_RECEIPT_NOT_SAME');
 comparisons.push({kind:c.kind,a:c.a,b:c.b,reading:c.reading,changed:changed.flag,opened:c.opened.length,discharged:c.discharged.length,comparison:'SAME'});
}
need(comparisons.length===24,'SINGLE_COMPARISON_COVERAGE');
const frozenPath=path.join(root,'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json');
need(id(frozenPath).sha256==='F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560','FROZEN_MANIFEST_NOT_SAME');
const frozen=read(frozenPath),differences=[];
for(const f of frozen.files){const a=id(path.join(repo,f.destination_path));if(a.bytes!==f.size||a.sha256!==f.sha256)differences.push({path:f.destination_path,actual:a});}
need(frozen.files.length===901&&differences.length===0,'FROZEN_NOT_SAME');
const g2=path.join(root,'j17_step_023/outputs/committed.world.json');
need(id(g2).sha256==='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059','G2_NOT_SAME');
save(path.join(here,'QUALIFICATION.json'),{schema:'J17PairDiagnosticQualification011',run_record:id(path.join(out,'RUN_RECORD_011.json')),readback:actual,replay:repeated,source_map:sourceMap,replay_source_map:replayMap,pairs:720,kind_counts:kindCounts,case_count:1440,side_certificates:8640,endpoint_certificates:2880,affected_per_case:5,prior_singles:singleId,comparisons,comparison:'SAME',frozen:{manifest:id(frozenPath),count:901,comparison:'SAME',differences},g2:id(g2)});
save(path.join(here,'FINAL_BINDING.json'),{schema:'J17ReactionPDPEBinding011',attachment:record.record_correction.original_record_preserved,run_record:id(path.join(out,'RUN_RECORD_011.json')),qualification:id(path.join(here,'QUALIFICATION.json')),contract_read:id(path.join(here,'CONTRACT_READ.json')),sources:[id(path.join(here,'source/pairs.mal')),id(path.join(here,'run.mjs')),id(fileURLToPath(import.meta.url))],result:record.summary,combined:record.combined,correction:record.record_correction,readback:record.readback,replay:record.replay,PDPE:{PROPOSE:'Requested1924-assignment diagnostic family exhausted; promoted offer correspondence MAYBE',DECIDE:'Strict predicate IF_THEN on that family; unique J17-to-NO; no choice made',PROMOTE:'NOT_PERFORMED: no law-bound offer membership supplied for the twelve-flag overwrite',EXECUTE:'GPU diagnostic and replay complete; worldline link3 NOT_COMMITTED'},worldline:{head:j(read(g2).chain.at(-1)),input:id(g2),status:'UNCHANGED'},repository:'No commit, push or deletion'});
console.log(j({run_record:id(path.join(out,'RUN_RECORD_011.json')),qualification:id(path.join(here,'QUALIFICATION.json')),binding:id(path.join(here,'FINAL_BINDING.json')),comparisons:comparisons.length,frozen:'901 SAME'}));
