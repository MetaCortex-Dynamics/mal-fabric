// Observation-only comparison of a supplied reference index and frozen GPU readbacks.
// Does not execute Python, construct runtime inputs, choose a carrier map, or alter expectations.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openReadback,sha} from './readback.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const review='C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002';
const indexPath=root+'/reference_ref012/ref012_index.json';
const expectedIndex='1FA1397F50DF1869CA3F31A595E0A9DB0B33C4E0257912F18F9CEB228E03FD79';
const fileBinding=p=>({path:p,bytes:fs.statSync(p).size,sha256:sha(fs.readFileSync(p))});
const indexBinding=fileBinding(indexPath);if(indexBinding.sha256!==expectedIndex)throw Error('reference index binding NOT_SAME');
const reference=JSON.parse(fs.readFileSync(indexPath,'utf8'));
const key=x=>JSON.stringify(x), sorted=xs=>[...xs].sort((a,b)=>key(a)<key(b)?-1:key(a)>key(b)?1:0);
const setDigest=s=>sha(Buffer.from(JSON.stringify([...s].sort())));
const comparisons=[];
function compare(name,expected,actual){
 const e=new Set(expected),a=new Set(actual),missing=[...e].filter(x=>!a.has(x)).sort(),extra=[...a].filter(x=>!e.has(x)).sort();
 const result={name,expected_count:e.size,actual_count:a.size,expected_sha256:setDigest(e),actual_sha256:setDigest(a),missing,extra,status:missing.length||extra.length?'NOT_SAME':'SAME'};
 comparisons.push(result);return result;
}
// Parse only the finite tuple notation present in the JSON data. No eval/import.
function tuple(s){
 let p=0;const tokens=[];while(p<s.length){if(/\s/.test(s[p])){p++;continue;}const rest=s.slice(p),m=/^'([^']*)'/.exec(rest),n=/^[0-9]+/.exec(rest);if(m){tokens.push({atom:m[1]});p+=m[0].length;}else if(n){tokens.push({atom:n[0]});p+=n[0].length;}else if('(),'.includes(s[p]))tokens.push(s[p++]);else throw Error('tuple token');}
 let i=0;function parse(){const t=tokens[i++];if(typeof t==='object')return t.atom;if(t!=='(')throw Error('tuple opening');const a=[];while(tokens[i]!==')'){a.push(parse());if(tokens[i]===',')i++;else if(tokens[i]!==')')throw Error('tuple separator');}i++;return a;}const out=parse();if(i!==tokens.length)throw Error('tuple suffix');return out;
}
function vertex(v){if(!Array.isArray(v)||v.length!==2||!['J','D'].includes(v[0])||!/^(0|[1-9][0-9]*)$/.test(v[1]))throw Error('reference identity');return v;}
function refTriad(t){if(t.length!==4)throw Error('triad arity');if(t[0]==='CCC')return sorted(t.slice(1).map(j=>vertex(['J',j])));if(t[0]==='CCD')return sorted([vertex(['D',t[1]]),vertex(['J',t[2]]),vertex(['J',t[3]])]);throw Error('triad tag');}
function refFlag(row){const [v,e,t]=row.map(tuple);return [vertex(v),sorted(e.map(vertex)),refTriad(t)];}
const refFlags=reference.flags.map(refFlag),refFlagKeys=refFlags.map(key),refTriads=reference.triads.map(t=>key(refTriad(t)));
function flagAt(i){if(!Number.isInteger(i)||i<0||i>=refFlagKeys.length)throw Error('reference transport index');return refFlagKeys[i];}
const pairKey=(a,b)=>JSON.stringify([a,b].sort());
const refPairs=reference.overlaps.map(([a,b])=>pairKey(flagAt(a),flagAt(b)));
const refInc=new Map(Object.entries(reference.incidence).map(([j,rows])=>[j,rows.map(flagAt)]));
const refSite=new Map(Object.entries(reference.site).map(([j,rows])=>[j,rows.map(flagAt)]));
for(const [name,values] of [['reference_flags',refFlagKeys],['reference_triads',refTriads],['reference_overlaps',refPairs]])if(new Set(values).size!==values.length)throw Error(name+' duplicate');
const observedBindings=[];
function runObservation(relative){
 const dir=review+'/'+relative,r=openReadback(dir),siteMap=new Map();
 const rows=tag=>r.predicate(tag).map(f=>({fact:f,args:r.node(f.term).c.slice(1)}));
 function suffix(id,prefix){const n=r.node(id);if(n.c.length||!n.s.startsWith(prefix)||!/^\d+$/.test(n.s.slice(prefix.length)))throw Error('GPU identity spelling');return n.s.slice(prefix.length).replace(/^0+(?=\d)/,'');}
 for(const {args:[site,j]} of rows('WORLD_JUNCTION_SITE'))siteMap.set(site,['J',suffix(j,'J_')]);
 for(const {args:[site,d]} of rows('WORLD_DOMAIN_SITE'))siteMap.set(site,['D',suffix(d,'HW_')]);
 if(siteMap.size!==42)throw Error('GPU source site identity count');
 function site(id){if(!siteMap.has(id))throw Error('unbound GPU site '+r.term(id));return siteMap.get(id);}
 function part(id,size){const n=r.node(id);if(n.s!=='TOGETHER_ALONE'||n.c.length!==size)throw Error('GPU incidence constructor');return sorted(n.c.map(site));}
 function flag(id){const n=r.node(id);if(n.s!=='TOGETHER_ALONE'||n.c.length!==3)throw Error('GPU flag constructor');return [site(n.c[0]),part(n.c[1],2),part(n.c[2],3)];}
 const flags=new Map(rows('FLAG').map(({args:[f]})=>[f,flag(f)]));
 const fkey=id=>{if(!flags.has(id))throw Error('GPU flag not materialized');return key(flags.get(id));};
 const triangles=rows('TRIAD').map(({args:[t]})=>key(part(t,3))),pairs=rows('PAIR').map(({args:[a,b]})=>pairKey(fkey(a),fkey(b)));
 const prefix=relative.replaceAll('/','_');
 compare(prefix+'/flags',refFlagKeys,[...flags.values()].map(key));compare(prefix+'/triads',refTriads,triangles);compare(prefix+'/overlaps',refPairs,pairs);
 compare(prefix+'/sites',[...new Set(refFlags.map(f=>key(f[0])))],[...siteMap.values()].map(key));
 compare(prefix+'/edges',[...new Set(refFlags.map(f=>key(f[1])))],[...new Set([...flags.values()].map(f=>key(f[1])))]);
 const perJunction=[];
 for(const j of refInc.keys()){
  const sid=key(['J',j]),inc=[...flags.values()].filter(f=>f[2].some(v=>key(v)===sid)).map(key),sites=[...flags.values()].filter(f=>key(f[0])===sid).map(key);
  const a=compare(prefix+'/incidence/J('+j+')',refInc.get(j),inc),b=compare(prefix+'/site/J('+j+')',refSite.get(j),sites);perJunction.push({junction:j,incidence:a.status,site:b.status});
 }
 const support=rows('DG_SUPPORT_TRIAD');
 if(support.length){
  const supported=new Map();for(const {args:[s,t]} of support){const v=site(s);if(v[0]!=='J')throw Error('support non-junction');if(!supported.has(v[1]))supported.set(v[1],new Set());supported.get(v[1]).add(key(part(t,3)));}
  for(const j of refInc.keys()){const ts=supported.get(j)??new Set(),got=[...flags.values()].filter(f=>ts.has(key(f[2]))).map(key);compare(prefix+'/DG_SUPPORT_TRIAD/J('+j+')',refInc.get(j),got);}
 }
 const comparators=rows('SF_COMPARATOR');if(comparators.length)compare(prefix+'/SF_COMPARATOR',refPairs,comparators.map(({args:[c,a,b]})=>pairKey(fkey(a),fkey(b))));
 const jsonFlags=new Map();for(const {args:[f,json]} of rows('FLAG_JSON')){const jk=key(r.value(json));if(jsonFlags.has(jk)&&jsonFlags.get(jk)!==fkey(f))throw Error('ambiguous JSON observation identity');jsonFlags.set(jk,fkey(f));}
 const current=rows('CURRENT_FIELD').map(({args:[f,reading]})=>[fkey(f),r.node(reading).s]);
 const dg=rows('DG_CONTRIBUTION').length;
 const b={dir,readback:fileBinding(dir+'/readback.bin'),source_map:fileBinding(dir+'/source-map.json'),source:fileBinding(dir+'/source.mal'),facts:r.count,terms:r.terms,epochs:r.epochs,source_site_identity_rows:siteMap.size,flags:flags.size,triads:triangles.length,overlaps:pairs.length,DG_SUPPORT_TRIAD_rows:support.length,DG_CONTRIBUTION_rows:dg,SF_COMPARATOR_rows:comparators.length,per_junction:perJunction};observedBindings.push(b);
 return {jsonFlags,current,flagKeys:[...flags.values()].map(key),junctions:[...siteMap.values()].filter(v=>v[0]==='J').map(v=>v[1])};
}
runObservation('hardware_carrier_012/gpu');
const gen=runObservation('gpu_self_witness_018/readout_gpu');
const sf=runObservation('s_f_binding_019/execution_gpu');
const genRoot=review+'/gpu_self_witness_018';
const fieldPath=genRoot+'/current.field.json',witnessPath=genRoot+'/current.witness.json',distancePath=genRoot+'/d_G.junctions.json';
const field=JSON.parse(fs.readFileSync(fieldPath,'utf8')),witness=JSON.parse(fs.readFileSync(witnessPath,'utf8'));
const fromJSON=f=>{const k=key(f);if(!gen.jsonFlags.has(k))throw Error('unbound field JSON flag');return gen.jsonFlags.get(k);};
const fieldRows=field.map(([f,m])=>[fromJSON(f),m]);
compare('018/current_field_raw_vs_JSON',gen.current.map(key),fieldRows.map(key));
compare('019/current_field_vs_018',fieldRows.map(key),sf.current.map(key));
const thisKeys=fieldRows.filter(([f,m])=>m==='THIS').map(([f])=>f),noKeys=fieldRows.filter(([f,m])=>m==='NO').map(([f])=>f);
compare('018/current_THIS_support_vs_reference_J17_site',refSite.get('17'),thisKeys);
const thisSet=new Set(refSite.get('17'));compare('018/current_NO_complement',refFlagKeys.filter(f=>!thisSet.has(f)),noKeys);
const readings=new Map(fieldRows);
const refAgreement=reference.overlaps.map(([a,b])=>[pairKey(flagAt(a),flagAt(b)),readings.get(flagAt(a))===readings.get(flagAt(b))?'SAME':'NOT_SAME']);
const gotAgreement=witness.map(([a,b,reading])=>[pairKey(fromJSON(a),fromJSON(b)),reading]);
compare('018/full_overlap_readings',refAgreement.map(key),gotAgreement.map(key));
// This is an independent observation count, not the runtime metric producer.
const dG=new Map([...refInc].map(([j,flags])=>[j,flags.filter(f=>thisSet.has(f)).length]));
const distances=JSON.parse(fs.readFileSync(distancePath,'utf8'));
// Resolve site text only through existing FLAG_JSON observations and their flag's site.
const siteJSON=new Map();for(const [f] of field){const identity=JSON.parse(fromJSON(f))[0];const label=f[0];if(siteJSON.has(label)&&key(siteJSON.get(label))!==key(identity))throw Error('site JSON ambiguity');siteJSON.set(label,identity);}
const gotDistances=distances.map(([label,units])=>{const id=siteJSON.get(label);if(!id||id[0]!=='J'||units.some(x=>x!=='THIS'))throw Error('distance observation');return [id[1],units.length];});
compare('018/full_junction_edit_counts',[...dG].map(key),gotDistances.map(key));
const report={
 scope:'Independent reference evidence only; full set equality after source-bound identity decoding; not V1/V2 CONFORM and not a runtime import',
 reference:{index:indexBinding,definition:fileBinding(root+'/reference_ref012/ref012.py'),readme:fileBinding(root+'/reference_ref012/README_REF012.md'),python_execution:'NOT_RUN'},
 encoding:'Reference digits remain identifier strings. J suffix and HW suffix strip transport zero padding only. GPU C:HW_a|HW_b sites are read through WORLD_JUNCTION_SITE and FLAG_JSON, not mapped by position. Edge/triad/pair order is canonicalized only for set comparison.',
 observer:fileBinding(fileURLToPath(import.meta.url)),readback_decoder:fileBinding(root+'/readback.mjs'),observed_runs:observedBindings,
 extracted_files:[fileBinding(fieldPath),fileBinding(witnessPath),fileBinding(distancePath)],
 counts:{reference_flags:refFlags.length,reference_triads:refTriads.length,reference_overlaps:refPairs.length,THIS:thisKeys.length,NO:noKeys.length,SAME:gotAgreement.filter(x=>x[1]==='SAME').length,NOT_SAME:gotAgreement.filter(x=>x[1]==='NOT_SAME').length},
 junction17_faces:[{junctions:['15','17','18'],edit_counts:['15','17','18'].map(j=>[j,dG.get(j)])},{junctions:['16','17','25'],edit_counts:['16','17','25'].map(j=>[j,dG.get(j)])}],
 comparisons,status:comparisons.every(c=>c.status==='SAME')?'SAME':'NOT_SAME',application_conformance:'NOT_RUN'
};
const output=root+'/ReferenceComparison.json';fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({path:output,sha256:sha(fs.readFileSync(output)),status:report.status,counts:report.counts,comparisons:comparisons.length,mismatches:comparisons.filter(x=>x.status!=='SAME')},null,2));
if(report.status!=='SAME')process.exitCode=2;
