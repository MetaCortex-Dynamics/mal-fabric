// Generic guarded continuation of an additive source image on the qualified GPU runtime.
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const [previous,next]=process.argv.slice(2);
if(!previous||!next)throw Error('previous and next directories');
const rt=path.resolve(root,'../runtime_021');
execFileSync(process.execPath,[path.join(rt,'prefill_guard_runtime.mjs'),
 '--previous-map',path.resolve(previous,'source-map.json'),
 '--previous-image',path.resolve(previous,'image.bin'),
 '--previous-readback',path.resolve(previous,'readback.bin'),
 '--next-map',path.resolve(next,'source-map.json'),
 '--next-image',path.resolve(next,'image.bin'),
 '--exe',path.join(rt,'block_iterative_runtime.exe'),
 '--output',path.resolve(next,'readback.bin'),
 '--report',path.resolve(next,'CONTINUATION_CUSTODY.json'),
 '--fact-capacity','262144','--run'],{stdio:'inherit',windowsHide:true});
