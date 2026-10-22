// Exact historical-byte recovery. Does not replace any original file.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
const parent='D:/Dev/flag-world-first-tick-020/vector_tool_checks/vector_build.before_extra_inputs.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const bytes=fs.readFileSync(parent);
if(bytes.length!==7843||sha(bytes)!=='10C036B4739998BE848AB4C769A0DF4FEF223D21E73EE5548854560B4EA5F972')throw Error('retained predecessor NOT_SAME');
const removals=[
 ",'--append-source'",
 "// Additive source bytes remain separately hash-bound in this stage's custody.\n",
 "// Nothing in the retained source or its imports is replaced or reinterpreted.\n",
 "if(options['append-source'])members.push(path.resolve(options['append-source']));\n"
];
let text=bytes.toString('utf8');
for(const needle of removals){if(text.split(needle).length!==2)throw Error('exact reversal requires one matching span');text=text.replace(needle,'');}
const recovered=Buffer.from(text,'utf8');
const expected='70EA9F0FBBACC4B8161BEB91D288EA4EB608B9665FC5D55C1156BA8A94B4FF63';
if(recovered.length!==7585||sha(recovered)!==expected)throw Error('historical identity NOT_SAME');
const target=path.join(directory,'vector_build.70EA9F0F.mjs');
const recordPath=path.join(directory,'VECTOR_BUILD_70EA9F0F_RECOVERY.json');
if(fs.existsSync(target)||fs.existsSync(recordPath))throw Error('preserve prior recovery');
fs.writeFileSync(target,recovered,{flag:'wx'});
const record={scope:'EXACT_HISTORICAL_BYTES_RECOVERED_BY_REVERSAL_AND_BOUND_SHA256; NO_SOURCE_OR_EVIDENCE_REPLACEMENT',parent:{path:parent,bytes:bytes.length,sha256:sha(bytes)},removals,output:{path:target,bytes:recovered.length,sha256:sha(recovered)},historical_binding:'D:/Dev/flag-world-first-tick-020/vectors/V1/stage00/BUILD.json $.orchestrator',current_original:'D:/Dev/flag-world-first-tick-020/vector_build.mjs',originals:'UNCHANGED',execution:'HISTORICAL_TOOL_NOT_EXECUTED'};
fs.writeFileSync(recordPath,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({target,bytes:recovered.length,sha256:sha(recovered),record:recordPath}));
