import {initialState,update,view} from './model.mjs';
const data=window.RULE_D_DATA, g=data.geometry;
let state=initialState();
const el=id=>document.getElementById(id);
const svg=el('field-view');
const NS='http://www.w3.org/2000/svg';
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const norm=a=>{const n=Math.hypot(...a);return a.map(x=>x/n);};
const sum=arr=>[0,1,2].map(i=>arr.reduce((s,a)=>s+a[i],0));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const positions=g.sites.map(s=>s.position);
const front=norm(sum(data.holeSites.map(i=>positions[i])));
const right=norm(positions[data.holeSites[1]].map((x,i)=>x-positions[data.holeSites[0]][i]));
const up=norm(cross(front,right));
const edgePoints=g.edges.map(e=>norm(sum(e.sites.map(i=>positions[i]))));
const triadPoints=g.triads.map(t=>norm(sum(t.sites.map(i=>positions[i]))));
const project=v=>[340+dot(v,right)*330,280-dot(v,up)*330];
const points=g.flags.map(f=>[positions[f.site],edgePoints[f.edge],triadPoints[f.triad]]);
const visible=g.flags.map((f,i)=>points[i].every(p=>dot(p,front)>0.04));
const support=new Set(data.faceSupport),hole=new Set(data.holeFlags);
const sharedLine=o=>{
  const a=g.flags[o.a],b=g.flags[o.b];
  if(a.site!==b.site)return [edgePoints[a.edge],triadPoints[a.triad]];
  if(a.edge!==b.edge)return [positions[a.site],triadPoints[a.triad]];
  return [positions[a.site],edgePoints[a.edge]];
};
const make=(tag,attrs={},parent=svg)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
const line=(o,cls,parent)=>{
  const ps=sharedLine(o);if(ps.some(p=>dot(p,front)<0.04))return;
  const[a,b]=ps.map(project);make('path',{d:`M${a[0]},${a[1]}L${b[0]},${b[1]}`,class:cls},parent);
};
const caption=(x,y,text,cls='map-label')=>{const t=make('text',{x,y,class:cls,'text-anchor':'middle'});t.textContent=text;};
function draw(v){
  svg.replaceChildren();
  make('title',{id:'field-title'},svg).textContent='The same 24-flag region and its surroundings';
  make('desc',{id:'field-description'},svg).textContent='A display projection of the recorded incidence. Gold reads THIS, teal reads NO. Solid pale boundaries are walls. The dashed outline is the same containing face offer in both fields. Coral lines in the withheld preview mark new walls.';
  const base=make('g',{'aria-hidden':'true'});
  for(let i=0;i<g.flags.length;i++){
    if(!visible[i])continue;
    const poly=make('polygon',{points:points[i].map(p=>project(p).join(',')).join(' '),class:v.readings[i]?'flag flag-this':'flag flag-no','data-flag':i},base);
    const text=`${hole.has(i)?'Enclosed region':data.ringSites.includes(g.flags[i].site)?'Surrounding ring':'Exterior'} · ${v.readings[i]?'THIS':'NO'}${support.has(i)?' · inside containing face':''}`;
    make('title',{},poly).textContent=text;
  }
  const old=make('g',{'aria-hidden':'true'});
  for(const i of v.walls)line(g.overlaps[i],'wall',old);
  if(state.support){
    const layer=make('g',{'aria-hidden':'true'});
    for(const o of g.overlaps)if(support.has(o.a)!==support.has(o.b))line(o,'support-boundary',layer);
  }
  if(state.inspect){
    const layer=make('g',{'aria-hidden':'true'});
    for(const i of v.field.receipt.opened)line(g.overlaps[i],'new-wall',layer);
  }
  // A filled region has no wall outline; its label preserves the inspected locus.
  if(!v.candidate){
    const holeLayer=make('g',{'aria-hidden':'true'});
    for(const o of g.overlaps)if(hole.has(o.a)!==hole.has(o.b))line(o,'hole-boundary',holeLayer);
  }
  const holeCenter=project(front);
  caption(holeCenter[0],holeCenter[1]-6,v.candidate?'FILLED REGION':'SAME REGION');
  caption(holeCenter[0],holeCenter[1]+15,'24 flags','map-label map-label-small');
  const faceCenter=norm(sum(data.faceSupport.map(i=>positions[g.flags[i].site])));
  const fp=project(faceCenter);
  if(state.support)caption(fp[0],fp[1]-100,'CONTAINING FACE','map-label map-label-small');
}
function text(id,value){const n=el(id);if(n)n.textContent=value;}
function render(){
  const v=view(data,state),r=v.field.receipt;
  document.body.dataset.scenario=state.scenario;
  document.body.dataset.phase=v.phase;
  document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===state.scenario)));
  el('show-support').checked=state.support;
  text('wall-count',v.walls.length);
  text('wall-subject',state.inspect?'walls in the candidate':'walls in the field');
  text('region-status',v.candidate?'THIS':'NO');
  const context=state.scenario==='nested';
  text('phase',state.inspect?'Withheld candidate · preview only':v.applied?'Recorded result · filled':state.attempted?'Recorded source · held':'Recorded source');
  text('status-title',state.inspect?'This candidate is withheld.':v.applied?'The region fills.':state.attempted?'The region holds.':'Same region. Change its surroundings.');
  text('status-explanation',state.inspect?'The candidate would leave 44 walls, including 10 new ones. It is excluded from strict discharge BECAUSE those walls open.':v.applied?'The recorded offer fills the region BECAUSE it discharges 20 walls and opens none. The result is uniform THIS.':state.attempted?'The offer is withheld BECAUSE it opens 10 walls elsewhere. The nested source stays at 64 walls.':context?'The 24-flag NO region sits inside a THIS ring. Outside the ring, the field reads NO. Try reading the containing face THIS.':'The same 24-flag region still reads NO. Everything outside it now reads THIS. Try the very same face offer.');
  for(const k of ['discharged','opened','retained','changed'])text(k,state.attempted?r.counts[k]:'—');
  text('receipt-verdict',state.attempted?(context?'NO · opens walls':'IF_THEN · strict discharge'):'Receipt not yet revealed');
  text('receipt-note',state.attempted?(context?'Candidate receipt. 42 changed flags: the 24-flag region plus 18 exterior flags.':'Candidate receipt. Only the 24-flag region changes.'):'One recorded offer: the containing face reads THIS.');
  const tryButton=el('try-offer');tryButton.disabled=state.attempted;
  tryButton.textContent=state.attempted?(context?'Offer withheld':'Recorded effect replayed'):'Try the same face offer';
  const inspect=el('inspect-candidate');
  if(inspect){inspect.hidden=!(state.attempted&&context);inspect.textContent=state.inspect?'Back to the held field':'Inspect withheld candidate';inspect.setAttribute('aria-pressed',String(state.inspect));}
  text('view-caption',state.inspect?'Candidate preview only · the recorded source is held at 64 walls.':v.applied?'Recorded strict result · the whole field reads THIS; no walls remain.':'Incidence display centred on the same region. Counts cover the entire field.');
  text('flag-detail','Display positions carry no physical scale; the receipt uses the recorded incidence.');
  text('case-id',v.field.case);
  draw(v);
}
document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{state=update(state,{type:'scenario',value:b.dataset.scenario});render();}));
el('try-offer').addEventListener('click',()=>{state=update(state,{type:'try'});render();});
el('reset').addEventListener('click',()=>{state=update(state,{type:'reset'});render();});
el('show-support').addEventListener('change',e=>{state=update(state,{type:'support',value:e.target.checked});render();});
el('inspect-candidate')?.addEventListener('click',()=>{state=update(state,{type:'inspect'});render();});
render();
