// T transport, native-run orchestration and read-only observation.
// Geometry is produced only by the retained .mal clauses on the pinned GPU runtime.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {openReadback} from '../../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),pkg=path.resolve(here,'../..');
const parent='D:/Dev/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const need=(v,m)=>{if(!v)throw Error(m);};
function identity(file){const fd=fs.openSync(file,'r'),h=crypto.createHash('sha256'),b=Buffer.alloc(1024*1024);let size=0;try{for(;;){const n=fs.readSync(fd,b,0,b.length,null);if(!n)break;h.update(b.subarray(0,n));size+=n;}}finally{fs.closeSync(fd);}return {path:path.resolve(file),bytes:size,sha256:h.digest('hex').toUpperCase()};}
const pins=new Map([
 [parent+'/source/incidence.mal','8F53851F3ACB76B2672EECEA5595B313040C8FAC961469E029D8C5DE5BF19F3C'],
 [parent+'/source/moves.mal','F91894FF1B28F12CCB64468482794FAE540814E0EA6703797543CE8AF3F7E888'],
 [parent+'/source/junction_identity.mal','E4CF9C4D9F3CE2B231DE67C7FFD45B82DE79FFD9DD403F7BAFD097D8939B3ACD'],
 [parent+'/gpu/source.mal','A5729729A8636C16DA1AC84476C6B32E5CD443BE506BE7068CCB53FB57792A8F'],
 [parent+'/gpu/source-map.json','49F3C4B48F355703BD6959A82995F41ADA517FFBBF7283C217044E5151ABE14A'],
 [parent+'/gpu/readback.bin','8FF8E9B0EBBDD18445F0E294A3B8B501A2385D5A137C8B00CB6AA090A14205E7'],
 [parent+'/gpu/image.bin','FE38B7D093D10BB403EB99BF50E713FC6BB6859AA21BA86CAD2DF8A5CBBC13F7'],
 [parent+'/parents/qg003-carrier.mcbf','82E388FD7F12E77D97E248DBF243E5B7D55F8EE56AFAED137BB37DD315F15BDB'],
 [parent+'/parents/motif_junction_table_v1.h','25AF837405F450986FBD24A425D2197BD5E5D9D4BF952F74BE43CFB992B10F64'],
 [pkg+'/j17_step_021/tools/lower.mjs','05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [pkg+'/j17_step_021/tools/source_occurrence_custody.mjs','187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 ['C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs','187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 [pkg+'/runtime_021/block_iterative_runtime.exe','9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [pkg+'/runtime_021/qualification_002/QUALIFICATION.json','D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [pkg+'/evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs','4612D0189AD00B89522C8CD9F472E39EB1574991F5FB4241FF3CD85F415E32D3'],
 [pkg+'/j17_step_023/outputs/committed.world.json','E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [pkg+'/j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json','F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560']
]);
const nativeFiles=['incidence_reused.mal','moves_reused.mal','custody.mal'].map(n=>path.join(here,'source',n));
const normalize=s=>s.replace(/\r\n/g,'\n');
const incidence=normalize(fs.readFileSync(parent+'/source/incidence.mal','utf8'));
const reused=normalize(fs.readFileSync(nativeFiles[0],'utf8'));
need(reused.slice(reused.indexOf('law REFINE_A :='))===incidence.slice(incidence.indexOf('law REFINE_A :=')),'LITERAL_REFINEMENT_SUFFIX');
need(normalize(fs.readFileSync(nativeFiles[1],'utf8'))===normalize(fs.readFileSync(parent+'/source/moves.mal','utf8')),'LITERAL_MOVE_CLAUSES');
for(const [p,h]of pins)need(identity(p).sha256===h,'PIN_NOT_SAME '+p);
need(JSON.parse(fs.readFileSync(pkg+'/runtime_021/qualification_002/QUALIFICATION.json')).qualification==='SAME','RUNTIME_QUALIFICATION');
const watched=[...new Set([...pins.keys(),...nativeFiles,fileURLToPath(import.meta.url),path.join(here,'../REQUEST.json')])].map(identity);
function unchanged(){for(const item of watched){const now=identity(item.path);need(now.bytes===item.bytes&&now.sha256===item.sha256,'WATCHED_NOT_SAME '+item.path);}}
function view(r){const cache=new Map();function render(id){if(cache.has(id))return cache.get(id);const n=r.node(id);const text=n.s==='TEXT'?JSON.stringify(r.text(id)):n.s+(n.c.length?'('+n.c.map(render).join(',')+')':'');cache.set(id,text);return text;}const rows=tag=>r.predicate(tag).map(f=>({f,term:render(f.term),a:r.node(f.term).c.map(render),ids:r.node(f.term).c}));return {render,rows};}
const old=openReadback(parent+'/gpu'),ov=view(old);
need(old.map.source_sha256===pins.get(parent+'/gpu/source.mal')&&old.map.image_sha256===pins.get(parent+'/gpu/image.bin'),'PARENT_SOURCE_IMAGE');
const parentCounts=Object.fromEntries(['SITE','EDGE','TRIAD','FLAG','PAIR'].map(t=>[t,ov.rows(t).length]));
need(JSON.stringify(Object.values(parentCounts))===JSON.stringify([42,120,80,480,720]),'PARENT_012_COUNTS');
for(const f of old.facts)need(f.support.every(i=>i>=0&&i<f.id)&&f.support.length===(f.rule<0?0:old.map.rules[f.rule].ants.length),'PARENT_PROOF_'+f.id);
const ctx=`T_SOURCE(H_${pins.get(parent+'/gpu/source.mal')},H_${pins.get(parent+'/gpu/source-map.json')},H_${pins.get(parent+'/gpu/readback.bin')})`;
const fact=(tag,...a)=>`GOES_WITH(${[tag,...a].join(',')})`;
const parentRows=ov.rows('TRIAD'),orderRows=ov.rows('SITE_ORDER'),faceRows=ov.rows('WORLD_TRIAD_FACE'),domainRows=ov.rows('WORLD_DOMAIN_SITE');
need(orderRows.length===861&&faceRows.length===80&&domainRows.length===12,'PARENT_RELATION_COUNTS');
const siteSet=new Set(ov.rows('SITE').map(x=>x.a[1])),orderSet=new Set(orderRows.map(x=>JSON.stringify(x.a.slice(1))));
for(const a of siteSet)for(const b of siteSet)if(a!==b)need(orderSet.has(JSON.stringify([a,b]))!==orderSet.has(JSON.stringify([b,a])),'PARENT_ORDER_TOTAL');
const custody=[...parentRows.map(x=>({kind:'TRIAD',row:fact('T_PARENT_TRIAD',ctx,x.a[1]),original:x.f,original_term:x.term})),...orderRows.map(x=>({kind:'ORDER',row:fact('T_PARENT_ORDER',ctx,...x.a.slice(1)),original:x.f,original_term:x.term})),...faceRows.map(x=>({kind:'FACE',row:fact('T_PARENT_FACE',ctx,...x.a.slice(1)),original:x.f,original_term:x.term})),...domainRows.map(x=>({kind:'DOMAIN',row:fact('T_PARENT_DOMAIN',ctx,...x.a.slice(1)),original:x.f,original_term:x.term}))];
need(custody.length===1033&&new Set(custody.map(x=>x.row)).size===1033,'EXACT_PARENT_TRANSPORT');
const omitted=parentRows[0],rows=custody.map(x=>x.row);
const expectedNormal={BASE_TRIAD:80,REFINED_TRIAD:320,SITE:162,EDGE:480,TRIAD:320,FLAG:1920,PAIR:2880,DELTA:1920,GAMMA:1920,TAU:1920,T_CHILD_PARENT:320,T_CHILD_FACE:320,T_FLAG_PARENT:1920,T_FLAG_FACE:1920,T_DOMAIN:12};
const expectedMissing={...expectedNormal,BASE_TRIAD:79,REFINED_TRIAD:316,EDGE:477,TRIAD:316,FLAG:1896,PAIR:2838,DELTA:1896,GAMMA:1896,TAU:1884,T_CHILD_PARENT:316,T_CHILD_FACE:316,T_FLAG_PARENT:1896,T_FLAG_FACE:1896};
const [mode,name='run_001']=process.argv.slice(2);need(['preflight','run'].includes(mode),'MODE');
if(mode==='preflight'){console.log(JSON.stringify({verdict:'IF_THEN',scope:'READ_ONLY_PREFLIGHT_GPU_NOT_RUN',watched,parent_counts:parentCounts,transport:rows.length,expectedNormal,expectedMissing,omitted_parent:{id:omitted.f.id,term:omitted.a[1]},literal_clauses:'SAME'},null,2));process.exit(0);}
need(/^[A-Za-z0-9_]+$/.test(name),'RUN_NAME');const out=path.join(here,name);need(!fs.existsSync(out),'PRESERVE_PRIOR_RUN');fs.mkdirSync(out);
const artifacts=[],write=(p,b)=>{fs.writeFileSync(p,b,{flag:'wx'});artifacts.push(identity(p));},save=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
function bind(p){const i=identity(p);artifacts.push(i);return i;}
function command(label,exe,args){const start=new Date().toISOString(),r=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,timeout:600000,maxBuffer:4*1024*1024});save(path.join(out,label+'.execution.json'),{exe,args,start,end:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''});need(!r.error&&r.status===0,'COMMAND_STOP '+label+' '+(r.error?.message??r.stderr));return r.stdout;}
function stage(label,inputRows){const dir=path.join(out,label);fs.mkdirSync(dir);const p=path.join(dir,'input.mal');write(p,nativeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\n@propose seed T_BOUND_PARENT_INPUTS := {\n'+inputRows.map(s=>'  '+s).join(',\n')+'\n};\n');const dest=path.join(dir,'stage');command(label+'_lower',process.execPath,[pkg+'/j17_step_021/tools/lower.mjs',p,dest]);for(const f of ['source.mal','source-map.json','source-occurrence-custody.json','image.bin'])bind(path.join(dest,f));const map=JSON.parse(fs.readFileSync(path.join(dest,'source-map.json')));need(map.source_sha256===identity(p).sha256&&map.image_sha256===identity(path.join(dest,'image.bin')).sha256&&map.lowerer_sha256===pins.get(pkg+'/j17_step_021/tools/lower.mjs'),'LOWER_CUSTODY');need(map.seeds.length===inputRows.length&&map.imports.length===0,'SOURCE_SEED_SCOPE');return dest;}
function gpu(label,dir,image=path.join(dir,'image.bin')){const output=command(label+'_device','nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits']);const [device,free]=output.trim().split(',').map(x=>x.trim());need(device.includes('RTX 3070')&&Number(free)>1536,'GPU_CAPACITY');console.log(JSON.stringify({launch:label,device,fact_capacity:65536}));command(label+'_gpu',pkg+'/runtime_021/block_iterative_runtime.exe',[image,path.join(dir,'readback.bin'),'--fact-capacity','65536']);for(const f of ['readback.bin','readback.bin.progress.jsonl','readback.bin.epochs.jsonl'])bind(path.join(dir,f));}
function observe(label,dir,inputRows,missing=false){
 const r=openReadback(dir),v=view(r),checks=[];const check=(p,n)=>{need(p,'OBSERVATION '+label+' '+n);checks.push(n);};
 for(let id=0;id<r.terms;id++){const n=r.node(id);check(typeof n.s==='string'&&n.c.every(c=>c>=0&&c<id),'TERM_'+id);}
 for(const f of r.facts){check(f.support.every(p=>p>=0&&p<f.id),'PARENT_'+f.id);check(f.support.length===(f.rule<0?0:r.map.rules[f.rule].ants.length),'RULE_'+f.id);}
 const seeds=r.facts.filter(f=>f.rule<0).map(f=>v.render(f.term)).sort();check(JSON.stringify(seeds)===JSON.stringify([...new Set(inputRows)].sort()),'EXACT_SEEDS_ONLY');
 const expected=missing?expectedMissing:expectedNormal,counts=Object.fromEntries(Object.keys(expected).map(t=>[t,v.rows(t).length]));for(const [tag,n]of Object.entries(expected))check(counts[tag]===n,'COUNT_'+tag);
 const sites=new Set(v.rows('SITE').map(x=>x.a[1])),triads=new Set(v.rows('TRIAD').map(x=>x.a[1]));
 const edges=v.rows('EDGE'),flags=v.rows('FLAG'),parentLinks=v.rows('T_CHILD_PARENT'),ancestorLinks=v.rows('T_CHILD_FACE');
 const degree=new Map([...sites].map(s=>[s,0])),incidenceCount=new Map(edges.map(x=>[x.a[1],0]));
 for(const e of edges){const endpoints=r.node(e.ids[1]).c.map(v.render);check(endpoints.length===2&&endpoints[0]!==endpoints[1]&&endpoints.every(x=>sites.has(x)),'EDGE_ENDPOINTS_'+e.f.id);for(const s of endpoints)degree.set(s,degree.get(s)+1);}
 for(const x of v.rows('EDGE_IN_TRIAD')){check(incidenceCount.has(x.a[1])&&triads.has(x.a[2]),'EDGE_TRIAD_CONTACT_'+x.f.id);incidenceCount.set(x.a[1],incidenceCount.get(x.a[1])+1);}
 const histogram=values=>Object.fromEntries([...values].reduce((m,n)=>m.set(n,(m.get(n)||0)+1),new Map()));
 const degreeHistogram=histogram(degree.values()),edgeTriadHistogram=histogram(incidenceCount.values());
 check(JSON.stringify(degreeHistogram)===JSON.stringify(missing?{4:3,5:12,6:147}:{5:12,6:150}),'DEGREE_HISTOGRAM');
 check(JSON.stringify(edgeTriadHistogram)===JSON.stringify(missing?{1:6,2:471}:{2:480}),'EDGE_TRIAD_CLOSURE');
 const inherited=ov.rows('SITE').map(x=>'THIS('+x.a[1]+')'),midpoints=ov.rows('EDGE').map(x=>x.a[1]);
 check(inherited.every(x=>sites.has(x))&&midpoints.every(x=>sites.has(x))&&new Set([...inherited,...midpoints]).size===162,'EXACT_INHERITED_AND_MIDPOINT_SITES');
 const domainSites=new Set(v.rows('T_DOMAIN').map(x=>x.a[2]));check(domainSites.size===12&&[...domainSites].every(s=>degree.get(s)===5),'TWELVE_INHERITED_DEGREE_FIVE_DOMAINS');
 const byParent=new Map(parentRows.map(x=>[x.a[1],[]])),byChild=new Map();
 for(const x of parentLinks){check(x.a[1]===ctx&&triads.has(x.a[2])&&byParent.has(x.a[3]),'CHILD_PARENT_IDENTITY_'+x.f.id);byParent.get(x.a[3]).push(x);if(!byChild.has(x.a[2]))byChild.set(x.a[2],[]);byChild.get(x.a[2]).push(x);}
 check(byChild.size===counts.TRIAD&&[...byChild.values()].every(x=>x.length===1),'UNIQUE_IMMEDIATE_PARENT');
 for(const [p,children]of byParent){const absent=missing&&p===omitted.a[1];check(children.length===(absent?0:4),'FOUR_CHILDREN_'+sha(Buffer.from(p)).slice(0,12));if(!absent)check(JSON.stringify(children.map(x=>x.a[4]).sort())===JSON.stringify(['CENTRE','CORNER_A','CORNER_B','CORNER_C']),'FOUR_CHILD_KINDS_'+sha(Buffer.from(p)).slice(0,12));}
 const parentFace=new Map(faceRows.map(x=>[x.a[1],x.a[2]])),byFace=new Map(),flagFace=new Map();
 for(const x of ancestorLinks){const ps=byChild.get(x.a[2]);check(x.a[1]===ctx&&ps?.length===1&&parentFace.get(ps[0].a[3])===x.a[3],'COMPOSED_FACE_CUSTODY_'+x.f.id);byFace.set(x.a[3],(byFace.get(x.a[3])||0)+1);}
 for(const x of v.rows('T_FLAG_FACE'))flagFace.set(x.a[3],(flagFace.get(x.a[3])||0)+1);
 const affected=parentFace.get(omitted.a[1]);check(byFace.size===20&&flagFace.size===20,'TWENTY_HARDWARE_ANCESTORS');for(const [w,n]of byFace){check(n===(missing&&w===affected?12:16),'ANCESTOR_TRIADS_'+w);check(flagFace.get(w)===(missing&&w===affected?72:96),'ANCESTOR_FLAGS_'+w);}
 const flagSet=new Set(flags.map(x=>x.a[1])),neighbors=new Map([...flagSet].map(f=>[f,new Set()]));
 for(const pair of v.rows('PAIR')){const [a,b]=pair.a.slice(1);check(a!==b&&flagSet.has(a)&&flagSet.has(b),'OVERLAP_ENDPOINTS_'+pair.f.id);neighbors.get(a).add(b);neighbors.get(b).add(a);}
 const overlapDegree=histogram([...neighbors.values()].map(s=>s.size));check(JSON.stringify(overlapDegree)===JSON.stringify(missing?{2:12,3:1884}:{3:1920}),'OVERLAP_DEGREE');
 for(const tag of ['SITE','TRIAD','EDGE','FLAG','PAIR','T_CHILD_PARENT','T_CHILD_FACE'])for(const x of v.rows(tag))check(x.f.rule>=0&&x.f.support.length>0,'NATIVE_DERIVED_'+x.f.id);
 check(!r.map.rules.some(x=>/GENESIS|PROMOTE|EXECUTE|ADMIT|COMMIT|FIELD/.test(x.name)),'NO_WORLD_EFFECT_RULES');
 const closure=Buffer.from(r.facts.map(f=>v.render(f.term)).sort().join('\n')+'\n'),closureHash=sha(closure);write(path.join(out,label+'.CLOSURE.txt'),closure);
 const roots=[...v.rows('TRIAD'),...v.rows('T_CHILD_PARENT'),...v.rows('T_CHILD_FACE'),...v.rows('T_DOMAIN')].map(x=>x.f.id),support=new Set();function visit(id){if(support.has(id))return;support.add(id);r.facts[id].support.forEach(visit);}roots.forEach(visit);
 save(path.join(out,label+'.PROOFS.json'),{source_map:identity(path.join(dir,'source-map.json')),readback:identity(path.join(dir,'readback.bin')),roots,facts:[...support].sort((a,b)=>a-b).map(id=>({...r.facts[id],term:v.render(r.facts[id].term)}))});
 const summary={verdict:'IF_THEN',scope:missing?'MISSING_PARENT_CONTROL_NOT_COMPLETE_REFINEMENT':'ONE_REFINEMENT_OF_BOUND_012_2_0_TO_4_0_NOT_CHIRAL_GENERALIZATION',label,counts,degree_histogram:degreeHistogram,edge_triad_histogram:edgeTriadHistogram,overlap_degree:overlapDegree,immediate_parent_count:byChild.size,hardware_face_triads:Object.fromEntries(byFace),hardware_face_flags:Object.fromEntries(flagFace),facts:r.count,terms:r.terms,epochs:r.epochs,error:r.error,assertions:checks.length,closure_sha256:closureHash,readback:identity(path.join(dir,'readback.bin')),world_effect:'NONE',admission:'NOT_RUN',kappa_selection:'NONE'};
 save(path.join(out,label+'.OBSERVATION.json'),summary);console.log(JSON.stringify({observed:label,counts,facts:r.count,epochs:r.epochs,assertions:checks.length,closure:closureHash}));return summary;
}
try{
 save(path.join(out,'INPUTS.json'),{watched,scope:'T_REFINE_ONCE_NATIVE_012_CLAUSES',parent_context:ctx,parent_counts:parentCounts,selected_hand:'NONE',world_inputs:'NONE_HASH_WATCH_ONLY'});
 save(path.join(out,'INPUT_CUSTODY.json'),{source:identity(parent+'/gpu/source.mal'),source_map:identity(parent+'/gpu/source-map.json'),readback:identity(parent+'/gpu/readback.bin'),rows:custody});
 const parentSupport=new Set();function parentVisit(id){if(parentSupport.has(id))return;parentSupport.add(id);old.facts[id].support.forEach(parentVisit);}custody.forEach(x=>parentVisit(x.original.id));
 save(path.join(out,'PARENT_PROOFS.json'),{roots:custody.map(x=>x.original.id),facts:[...parentSupport].sort((a,b)=>a-b).map(id=>({...old.facts[id],term:ov.render(old.facts[id].term)}))});
 save(path.join(out,'EXPECTATIONS.json'),{scope:'OBSERVER_ONLY_NOT_NATIVE_INPUT',expectedNormal,expectedMissing,omitted_parent:{fact:omitted.f.id,term:omitted.a[1]},duplicate_parent:{fact:omitted.f.id,term:omitted.a[1]}});
 const normal=stage('normal',rows);gpu('normal',normal);const first=observe('normal',normal,rows);
 const replay=path.join(out,'replay');fs.mkdirSync(replay);fs.copyFileSync(path.join(normal,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);bind(path.join(replay,'source-map.json'));gpu('replay',replay,path.join(normal,'image.bin'));const second=observe('replay',replay,rows);need(first.readback.sha256===second.readback.sha256,'REPLAY_RAW_NOT_SAME');
 const reversedRows=[...rows].reverse(),reversed=stage('reversed',reversedRows);gpu('reversed',reversed);const third=observe('reversed',reversed,reversedRows);need(first.closure_sha256===third.closure_sha256,'REVERSED_CLOSURE_NOT_SAME');
 const duplicateRows=[...rows,custody[0].row],duplicate=stage('duplicate',duplicateRows);gpu('duplicate',duplicate);const fourth=observe('duplicate',duplicate,duplicateRows);need(first.closure_sha256===fourth.closure_sha256,'DUPLICATE_CLOSURE_NOT_SAME');
 const missingRows=rows.filter(x=>x!==custody[0].row),missing=stage('missing',missingRows);gpu('missing',missing);const fifth=observe('missing',missing,missingRows,true);
 unchanged();for(const a of artifacts){const now=identity(a.path);need(now.bytes===a.bytes&&now.sha256===a.sha256,'ARTIFACT_NOT_SAME '+a.path);}
 const record={schema:'TRefinementDiagnostic019',verdict:'IF_THEN',scope:'ONE_ADDITIONAL_NATIVE_REFINEMENT_OF_BOUND_CARRIER_012_2_0; NO_CHIRAL_OR_AUTHORITY_GENERALIZATION',inputs:watched,artifacts,native_sources:nativeFiles.map(identity),runs:[first,second,third,fourth,fifth],replay:'SAME_RAW_READBACK',reversed:'SAME_FULL_DECODED_CLOSURE',duplicate:'SAME_FULL_DECODED_CLOSURE',parent_custody:'EXACT_012_NATIVE_TERMS_AND_RETAINED_PROOF_CLOSURE',world_before:watched.find(x=>x.path.endsWith('committed.world.json')),world_after:identity(pkg+'/j17_step_023/outputs/committed.world.json'),frozen_manifest:identity(pkg+'/j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json'),frozen_901_audit:'ROOT_OWNS_AUDIT_NOT_REPEATED_HERE',admission:'NOT_RUN',kappa_selection:'NONE',world_link_3:'NOT_WRITTEN',repository_commit:'NOT_PERFORMED'};
 save(path.join(out,'RUN_RECORD_T.json'),record);console.log(JSON.stringify({record:identity(path.join(out,'RUN_RECORD_T.json'))}));
}catch(e){save(path.join(out,'STOP.json'),{verdict:'MAYBE',reason:e.message,outputs:'RETAINED',world_effect:'NONE'});throw e;}
