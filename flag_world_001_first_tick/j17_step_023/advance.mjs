// Generic bounded hash/sort service continuation; no application decision.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
let [previous,first,limit]=process.argv.slice(2);previous=path.resolve(previous);
const call=(file,args)=>execFileSync(process.execPath,[path.join(root,file),...args],{stdio:'inherit',windowsHide:true});
for(let i=Number(first);i<Number(first)+Number(limit);i++){
 const suffix=String(i).padStart(2,'0'),alias='svc'+suffix,services=path.join(root,'services'+suffix),next=path.join(root,'stage'+suffix);
 call('services.mjs',[previous,services,alias]);
 const custody=JSON.parse(fs.readFileSync(path.join(services,'CUSTODY.json')));
 if(!custody.requests.length){console.log(JSON.stringify({service_closure:'NO_PENDING_PRIMITIVE_REQUEST',final_directory:previous}));break;}
 call('build.mjs',[previous,next,'--append',path.join(services,'transport.mal'),'--input',alias+'='+path.join(services,'responses.json')]);
 call('run.mjs',[previous,next]);
 const r=openReadback(next);
 console.log(JSON.stringify({stage:next,error:r.error,facts:r.count,epochs:r.epochs,observed:{evaluations:r.predicate('S23_EVALUATION').length,route_dispositions:r.predicate('S23_ROUTE_DISPOSITION').length,returns:r.predicate('STEP_FABRIC_RETURN').length,committed_objects:r.predicate('C23_COMMITTED_OBJECT').length,face_readouts:r.predicate('D23_FACE_DISTANCE').length}}));
 previous=next;
}
