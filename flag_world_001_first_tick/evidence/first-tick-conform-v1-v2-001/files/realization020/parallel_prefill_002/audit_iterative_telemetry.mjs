// Read-only telemetry audit against each completed device readback's fact prefixes.
// Counts are observations, not source facts or verdicts about world conformance.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const mode=process.argv[2];if(!['small','full'].includes(mode))throw Error('small|full');
const out=path.join(here,'qualification_iterative_'+mode),target=path.join(out,'TELEMETRY_AUDIT.json');if(fs.existsSync(target))throw Error('PRESERVE_AUDIT');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const qualification=JSON.parse(fs.readFileSync(path.join(out,'QUALIFICATION.json')));if(qualification.qualification!=='SAME')throw Error('QUALIFICATION_REQUIRED');
const lines=p=>fs.readFileSync(p,'utf8').split(/\r?\n/).filter(x=>x.trim()).map(JSON.parse);
const comparisons=[];let totalProgress=0,progressWithRule=0;
for(const name of fs.readdirSync(out).filter(x=>x.endsWith('.execution.json'))){
 const execution=JSON.parse(fs.readFileSync(path.join(out,name)));if(execution.label.endsWith('_serial'))continue;
 const direct=!execution.command.endsWith('node.exe')&&!execution.args.includes('--run');
 const arg=k=>execution.args[execution.args.indexOf(k)+1];
 const file=direct?execution.args[1]:arg('--output'),image=direct?execution.args[0]:arg('--next-image');
 const map=JSON.parse(fs.readFileSync(path.join(path.dirname(image),'source-map.json'))),b=fs.readFileSync(file),w=i=>b.readInt32LE(i*4),nt=w(2),tc=w(5),fc=w(6);
 const epochsPath=file+'.epochs.jsonl',progressPath=file+'.progress.jsonl';
 const epochs=lines(epochsPath),progress=lines(progressPath);if(!epochs.length||!progress.length)throw Error('MISSING_TELEMETRY '+file);
 let cursor=0,lastIndex=-1,lastEpoch=-1;const counts=new Map();
 const key=(root,arity,tag)=>root+':'+arity+':'+tag;
 for(const e of epochs){
  if(e.boundary_index!==lastIndex+1||e.epoch<lastEpoch||e.facts<cursor||e.facts>fc||e.terms>tc||e.overflow_facts!==0)throw Error('EPOCH_BOUNDARY_NOT_SAME '+file);
  while(cursor<e.facts){const t=w(8+nt*10+cursor*12),at=8+t*10,root=w(at),arity=w(at+1),child=arity?w(at+2):-1,tag=child>=0&&w(8+child*10+1)===0?w(8+child*10):-1,k=key(root,arity,tag);counts.set(k,(counts.get(k)??0)+1);cursor++;}
  const got=new Map();for(const c of e.counts){const k=key(c.root_symbol,c.arity,c.tag_symbol);if(got.has(k)||!Number.isInteger(c.count)||c.count<0)throw Error('HISTOGRAM_KEY');if(c.count)got.set(k,c.count);}
  if(e.key_count!==e.counts.length||got.size!==counts.size||[...counts].some(([k,v])=>got.get(k)!==v))throw Error('HISTOGRAM_NOT_SAME '+file+' epoch='+e.epoch);
  lastIndex=e.boundary_index;lastEpoch=e.epoch;
 }
 const final=epochs.at(-1);if(final.facts!==fc||final.terms!==tc||final.error!==w(4)||final.epoch!==w(7))throw Error('FINAL_TELEMETRY_NOT_SAME '+file);
 let sequence=-1,firstSeen=0;
 for(const p of progress){const historical=p.sample==='first_active';if(!['latest','first_active'].includes(p.sample)||(!historical&&p.sequence<sequence)||(p.sequence&1)||p.facts>fc||p.terms>tc||p.rule>=map.rules.length||p.rule< -1)throw Error('PROGRESS_BOUNDS '+file);if(historical&&(++firstSeen>1||p.sequence!==2||p.rule<0))throw Error('HISTORICAL_PROGRESS_BOUNDS');if(p.rule>=0){if(p.pivot<0||p.pivot>=map.rules[p.rule].ants.length)throw Error('PIVOT_BOUNDS');progressWithRule++;}if(!historical)sequence=p.sequence;totalProgress++;}
 comparisons.push({readback:id(file),epochs:id(epochsPath),progress:id(progressPath),boundaries:epochs.length,every_boundary_fact_prefix:'SAME',final:'SAME',progress_samples:progress.length});
}
if(!progressWithRule)throw Error('RULE_PIVOT_PROGRESS_NOT_OBSERVED');
const report={scope:'TELEMETRY_VS_RETAINED_READBACK_AUDIT; NOT_CONFORM',qualification:'SAME',mode,qualification_record:id(path.join(out,'QUALIFICATION.json')),auditor:id(fileURLToPath(import.meta.url)),comparisons,totalProgress,progressWithRule};
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({qualification:'SAME',record:id(target),runs:comparisons.length,totalProgress,progressWithRule}));
