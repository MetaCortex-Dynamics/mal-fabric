// Read-only post-diagnostic check; neither a world transition nor a promotion.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
const self=fileURLToPath(import.meta.url), base=path.dirname(self);
const repo=path.resolve(base,'../..');
const need=(x,m)=>{if(!x)throw Error(m);};
function identity(p){const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex').toUpperCase()};}
function command(executable,args){const x=spawnSync(executable,args,{cwd:repo,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});return {executable,args,status:x.status,error:x.error?.message??null,stdout:x.stdout,stderr:x.stderr};}
const requestPath=path.join(base,'REQUEST.json'),beforePath=path.join(base,'CUSTODY_BEFORE.json');
const request=JSON.parse(fs.readFileSync(requestPath,'utf8')),before=JSON.parse(fs.readFileSync(beforePath,'utf8'));
const checkerPath=path.resolve(base,'../j17_tick_promote_binding_013/verify_binding.mjs');
const check=command(process.execPath,[checkerPath,'--verify']);
need(check.status===0&&!check.error,'CUSTODY_CHECKER_STOP');
const checked=JSON.parse(check.stdout);
need(isDeepStrictEqual(before,checked),'CUSTODY_BEFORE_AFTER_NOT_SAME');
const worldPath=path.resolve(base,'../j17_step_023/outputs/committed.world.json'),world=identity(worldPath);
need(world.bytes===568805&&world.sha256==='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059','LIVE_G2_NOT_SAME');
const gitArgs=[['rev-parse','HEAD'],['diff','--no-ext-diff','--exit-code','--'],['diff','--cached','--no-ext-diff','--exit-code','--'],['status','--porcelain=v1','--untracked-files=no']];
const git=gitArgs.map(args=>command('git',['--no-optional-locks','-C',repo,...args]));
need(git.every(x=>x.status===0&&!x.error),'GIT_READ_ONLY_CHECK_STOP');
need(git[0].stdout.trim()===request.base_commit&&git[3].stdout.trim()==='','REPOSITORY_TRACKED_STATE_NOT_SAME');
need(checked.frozen.files===901&&checked.frozen.verdict==='SAME'&&checked.link_count===2&&checked.world_commit==='NOT_RUN','FROZEN_OR_CHAIN_NOT_SAME');
const result={
  schema:'J17DiagnosticsCustodyAfter019',
  scope:'READ_ONLY_CUSTODY; NATIVE_DIAGNOSTIC_VERDICTS_REMAIN_IN_THEIR_OWN_RECORDS; NO_LIVE_COMMIT',
  verdict:'SAME',request:identity(requestPath),custody_before:identity(beforePath),observer:identity(self),checker:identity(checkerPath),
  checker_result:checked,
  live_g2:{file:world,pair_hash:checked.pair_before,chain_head:'173e0fa1d318de52472e31e3acf064bf92d9b313bdb4e52d2f4593ddd3631386',links:2,comparison:'SAME'},
  pre_execute_candidate:{pair_hash:checked.pair_after,world_commit:'NOT_RUN',scope:'Retained prior SITE(J17,NO) candidate; pair_after in checker_result is NOT a live after-state.'},
  frozen:checked.frozen,
  repository:{path:repo,requested_base:request.base_commit,observed_head:git[0].stdout.trim(),tracked_status:git[3].stdout,read_only_checks:git},
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
