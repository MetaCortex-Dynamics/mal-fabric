import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(here);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const parentPath=path.join(parent,'block_telemetry_full.cu'),original=fs.readFileSync(parentPath);
if(sha(original)!=='197EA1F071F05D24548AEF5FEB5C54AF2AE6F6C7DCE4723BAFA0B14DDE6BDF82')throw Error('parent identity');
const text=original.toString('utf8'),start=text.indexOf('__device__ void collect_join('),end=text.indexOf('__device__ void commit_proof(',start);
if(start<0||end<0||text.indexOf('__device__ void collect_join(',start+1)>=0)throw Error('collector bounds');
const before=text.slice(start,end),after=fs.readFileSync(path.join(here,'collector.inc'),'utf8');
const full=text.slice(0,start)+after+text.slice(end);
const smallChanges=[{before:'constexpr int NP=1048576, NS=2048, NR=1024, NT=4194304, NF=2097152;',after:'constexpr int NP=65536, NS=2048, NR=1024, NT=32768, NF=16384;'},
 {before:'static_assert((2ull*PAIR_BUCKETS+1ull*NF*PAIR_SLOTS)*sizeof(int)==232ull*1024*1024);',after:'static_assert((2ull*PAIR_BUCKETS+1ull*NF*PAIR_SLOTS)*sizeof(int)==10223616ull);'}];
let small=full;for(const c of smallChanges){if(small.split(c.before).length!==2)throw Error('small transform count');small=small.replace(c.before,c.after);}
const outputs=[];for(const [name,source]of[['block_iterative_full.cu',full],['block_iterative_small.cu',small]]){
 const output=path.join(here,name);fs.writeFileSync(output,source,{flag:'wx'});outputs.push({path:output,sha256:sha(Buffer.from(source))});
}
const telemetry=fs.readFileSync(path.join(parent,'telemetry.inc'));
if(sha(telemetry)!=='E7033E77BB0F27343AF16277536D7441D26775A2475745BF890B5C7F59ECE81D')throw Error('telemetry identity');
fs.writeFileSync(path.join(here,'telemetry.inc'),telemetry,{flag:'wx'});
const record={kind:'ISOLATED_ITERATIVE_COLLECTOR_NOT_QUALIFIED',parent:{path:parentPath,sha256:sha(original)},outputs,collector:{path:path.join(here,'collector.inc'),sha256:sha(Buffer.from(after))},telemetry:{path:path.join(here,'telemetry.inc'),sha256:sha(telemetry)},changes:[{before,after}],small_changes:smallChanges,stack_requested_per_thread:8192,state_layout:'UNCHANGED_WITHIN_CAPACITY',world_source:'UNCHANGED',execution:'NOT_RUN'};
fs.writeFileSync(path.join(here,'SOURCE_TRANSFORM.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...record,changes:[{before_sha256:sha(Buffer.from(before)),after_sha256:sha(Buffer.from(after))}]},null,2));
