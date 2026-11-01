// Publication/viewer extraction only. No native invocation, engine or world writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const home=path.dirname(fileURLToPath(import.meta.url));
const root='D:/Dev/Codex/2026-10-04/new-chat/mal_fabric_flag_world_001/flag_world_001_first_tick';
const live=root+'/sand_refinement_diagnostics_026/sweep/broad_execution_020/targeted_receipt_execution_036';
const published='D:/Dev/Codex/2026-10-04/new-chat/paper_two_release_main_20261101/flag_world_001_first_tick/persistence_paper_doi_deposit_v0_1_1_001/companion/evidence';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex').toUpperCase();
const sources=[];
function read(name,pin){const bytes=fs.readFileSync(name),sha256=hash(bytes);if(sha256!==pin)throw Error('NOT_SAME '+name);sources.push({path:name,bytes:bytes.length,sha256});return JSON.parse(bytes);}
const fixture=read(live+'/native_inputs/FIXTURE_036.json','6C30B9EF167CF485454F0F2C7476ACD2DBAA66310F2D495B2D699CF97459FE99');
const receipts=read(published+'/TARGETED_RECEIPTS_CLOSED_036.json','2AACCC0C2DC73D45B92029E49C25ADDF43CA2BE342C1081AC53FEFCB8986F0A9');
const run=read(published+'/RUN_RECORD_036.json','FE41196D8008620488CF9A6CC4A89379F4D273A431D9EB4EA83091F4EC6B3F34');
const catalog=read(root+'/sand_refinement_diagnostics_026/sweep/level4_001/CATALOG.json','6D5DACE855B1344CCDE2A7C63D7F586DF330F3FD16957E166258771FA2977085');
const need=(x,m)=>{if(!x)throw Error(m);};
const ids=kind=>[...new Set(fixture.catalogue.flags.map(f=>f[kind]))].sort();
const siteIds=ids('site'),edgeIds=ids('edge'),triadIds=ids('triad');
const siteMap=new Map(siteIds.map((s,i)=>[s,i])),edgeMap=new Map(edgeIds.map((s,i)=>[s,i])),triadMap=new Map(triadIds.map((s,i)=>[s,i]));
const nativeFlags=[...fixture.catalogue.flags].sort((a,b)=>a.term.localeCompare(b.term));
const flagMap=new Map(nativeFlags.map((f,i)=>[f.term,i]));
const flags=nativeFlags.map(f=>({id:f.term,site:siteMap.get(f.site),edge:edgeMap.get(f.edge),triad:triadMap.get(f.triad)}));
const overlaps=[...fixture.catalogue.overlaps].sort((a,b)=>a.term.localeCompare(b.term)).map(o=>({id:o.term,a:flagMap.get(o.a),b:flagMap.get(o.b),kind:o.kind}));
const overlapMap=new Map(overlaps.map((o,i)=>[o.id,i]));
const catMap=new Map(catalog.map(c=>[c.term,c]));
function args(term){const body=term.slice(term.indexOf('(')+1,-1);let depth=0,start=0,out=[];for(let i=0;i<body.length;i++){if(body[i]==='(')depth++;else if(body[i]===')')depth--;else if(body[i]===','&&depth===0){out.push(body.slice(start,i));start=i+1;}}out.push(body.slice(start));return out;}
const normalize=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
// Display-only unit-sphere chart of the already-recorded incidence. These values
// are NOT carrier operands, physical coordinates, or an orientation binding.
function chart(term){
 if(/^HW_\d\d$/.test(term)){const i=Number(term.slice(3));if(i===0)return[0,0,1];if(i===11)return[0,0,-1];const z=(i<=5?1:-1)/Math.sqrt(5),a=(i<=5?i-1:i-6+0.5)*2*Math.PI/5,r=Math.sqrt(1-z*z);return[r*Math.cos(a),r*Math.sin(a),z];}
 if(term.startsWith('THIS('))return chart(args(term)[0]);
 if(term.startsWith('TOGETHER_ALONE(')){const a=args(term).map(chart);need(a.length===2,'SITE_CHART_BINARY');return normalize([0,1,2].map(k=>a[0][k]+a[1][k]));}
 throw Error('CHART_TERM_UNSUPPLIED '+term);
}
const sites=siteIds.map((id,i)=>({id,identity:catMap.get(id).identity,position:chart(catMap.get(id).identity),flags:flags.flatMap((f,j)=>f.site===i?[j]:[])}));
const edges=edgeIds.map((id,i)=>({id,sites:[...new Set(flags.filter(f=>f.edge===i).map(f=>f.site))].sort((a,b)=>a-b)}));
const triads=triadIds.map((id,i)=>({id,sites:[...new Set(flags.filter(f=>f.triad===i).map(f=>f.site))].sort((a,b)=>a-b)}));
need(sites.length===162&&edges.length===480&&triads.length===320&&flags.length===1920&&overlaps.length===2880,'COUNTS');
need(edges.every(e=>e.sites.length===2)&&triads.every(t=>t.sites.length===3),'INCIDENCE');
const supportId='A_TRIAD(L1,ID(N0,N0,N1,N5,N6,NC))';
const support=fixture.supports.find(s=>s.term===supportId);need(support&&support.members.length===96,'FACE_SUPPORT');
const faceSupport=support.members.map(x=>flagMap.get(x)).sort((a,b)=>a-b);
const fields={},checks=[];
for(const [key,fieldId,caseId] of [['nested','RULE_D','TARGET035_080'],['contrast','FINDING_0_1_5_RULE_D_SAME_HOLE_EVERYTHING_ELSE_THIS','TARGET035_CONTRAST']]){
 const f=fixture.fields.find(x=>x.field===fieldId),r=receipts.receipts.find(x=>x.case===caseId),record=run.receipts.find(x=>x.case===caseId);
 need(f&&r&&record,'FIELD_AND_RECEIPT');
 const before=nativeFlags.map(fg=>f.readings[fg.term]==='READING_THIS'?1:0),after=[...before];for(const i of faceSupport)after[i]=1;
 const oldWalls=overlaps.flatMap((o,i)=>before[o.a]!==before[o.b]?[i]:[]),newWalls=overlaps.flatMap((o,i)=>after[o.a]!==after[o.b]?[i]:[]);
 const oldSet=new Set(oldWalls),newSet=new Set(newWalls),computed={changed:before.flatMap((x,i)=>x!==after[i]?[i]:[]),discharged:oldWalls.filter(i=>!newSet.has(i)),opened:newWalls.filter(i=>!oldSet.has(i)),retained:oldWalls.filter(i=>newSet.has(i))};
 const mapped={};for(const k of ['changed','discharged','opened','retained']){mapped[k]=r[k].map(x=>(k==='changed'?flagMap:overlapMap).get(x)).sort((a,b)=>a-b);need(JSON.stringify(mapped[k])===JSON.stringify(computed[k]),'RECEIPT_SET_'+key+'_'+k);need(hash(JSON.stringify(r[k]))===record.receipt_hashes[k],'RECEIPT_HASH_'+key+'_'+k);}
 need(r.strict===record.strict,'STRICT_RECORDED');
 fields[key]={id:fieldId,case:caseId,rawIdentity:r.raw_identity,readings:before,thisFlags:before.flatMap((x,i)=>x?[i]:[]),candidateReadings:after,receipt:{...mapped,strict:r.strict,counts:{changed:mapped.changed.length,discharged:mapped.discharged.length,opened:mapped.opened.length,retained:mapped.retained.length,wallsBefore:oldWalls.length,wallsCandidate:newWalls.length},hashes:record.receipt_hashes},walls:oldWalls,candidateWalls:newWalls,scope:'RECORDED_SINGLE_OFFER_RECEIPT; NO_WORLD_TRANSITION'};
 checks.push({field:key,receiptSets:'SAME',receiptHashes:'SAME',counts:fields[key].receipt.counts,strict:r.strict});
}
const contrastDefinition=fixture.fields.find(x=>x.field==='FINDING_0_1_5_RULE_D_SAME_HOLE_EVERYTHING_ELSE_THIS').definition;
const holeSites=contrastDefinition.hole_sites.map(x=>siteMap.get(x));
const holeFlags=flags.flatMap((f,i)=>holeSites.includes(f.site)?[i]:[]);
const ringSites=sites.flatMap((s,i)=>s.flags.every(f=>fields.nested.readings[f]===1)?[i]:[]);
need(holeFlags.length===24&&ringSites.length===8&&fields.nested.thisFlags.length===96,'CONTEXT_COUNTS');
const data={schema:'RULE_D_PLAYABLE_EVIDENCE_001',scope:'VIEWER_OF_TWO_RECORDED_DIAGNOSTIC_FIELDS_AND_ONE_RECORDED_OFFER_EACH',publication:{doi:'10.5281/zenodo.23855122',url:'https://zenodo.org/records/23855122',mainCommit:'315a920e165c17a232896addf179e0ac0e4a240d'},geometry:{sites,edges,triads,flags,overlaps},chart:{purpose:'DISPLAY_ONLY',description:'Unit-sphere display chart assigned to the recorded HW incidence; inherited sites drawn at normalized midpoint positions. No position is used to decide a receipt.',metric:'NO_PHYSICAL_SCALE_OR_HANDEDNESS_CLAIM'},fields,faceSupport,faceSupportId:supportId,faceLabel:'W_00',holeSites,holeFlags,ringSites,sources,checks,obligation038:'PAUSED',worldTransition:'NONE',gpuInvocation:'NONE',completeKScope:'Published finding and read-only classification; these two GPU receipts alone do not establish exhaustive K.'};
fs.writeFileSync(path.join(home,'rule-d-data.json'),JSON.stringify(data));
fs.writeFileSync(path.join(home,'rule-d-data.js'),'window.RULE_D_DATA = '+JSON.stringify(data)+';\n');
const record={schema:'RULE_D_PLAYABLE_EXTRACTION_001',verdict:'IF_THEN',checks,sources,data:{bytes:fs.statSync(path.join(home,'rule-d-data.json')).size,sha256:hash(fs.readFileSync(path.join(home,'rule-d-data.json')))},scope:data.scope,chart:data.chart,worldTransition:'NONE',gpuInvocation:'NONE',obligation038:'PAUSED'};
fs.writeFileSync(path.join(home,'DATA_BINDING.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record,null,2));
