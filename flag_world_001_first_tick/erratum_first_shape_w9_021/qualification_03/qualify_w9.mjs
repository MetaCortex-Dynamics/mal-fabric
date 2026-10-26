// Transport only: inputs become ByteSeq, native .mal returns W9 verdict/token flags.
// Expected outputs are never passed to the checker. This runner serializes and compares.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const tokens=['atom','element','entropy','hydrogen','particle','singularity','tie'];
const exe=path.join(root,'dependencies/malcog_g1.exe');
const lib=path.join(root,'dependencies/v3/software_fpga/threejs_projection_001_committed_4d_world_sections/bytes.mal');
const source=path.join(root,'source/w9.mal');
const output=path.join(root,process.argv[2]||'outputs');
if(fs.existsSync(output)) throw new Error('Output already present; supply a fresh run directory.');
fs.mkdirSync(output,{recursive:true});
const bind=p=>{const b=fs.readFileSync(p);return {path:path.relative(root,p).replaceAll('\\','/'),size:b.length,sha256:hash(b)};};
const snapshots={};
for(const [key,origin] of Object.entries({native_runtime:exe,byte_library:lib,implementation:source,transport:fileURLToPath(import.meta.url)})){
 const dest=path.join(output,path.basename(origin));
 fs.copyFileSync(origin,dest,fs.constants.COPYFILE_EXCL);
 snapshots[key]={origin:bind(origin),executed_copy:bind(dest)};
 if(snapshots[key].origin.sha256!==snapshots[key].executed_copy.sha256)throw new Error(`NOT_SAME snapshot:${key}`);
}
const runExe=path.join(root,snapshots.native_runtime.executed_copy.path);
const runLib=path.join(root,snapshots.byte_library.executed_copy.path);
const runSource=path.join(root,snapshots.implementation.executed_copy.path);
const before=fs.readdirSync(path.join(root,'inputs')).sort().map(n=>bind(path.join(root,'inputs',n)));
const frozen={
 'ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal':'E93318BCB508733174FB5D4D7622BF8F1ABFD80A8D6F6CC79FF4DA0C6E337BCC',
 'ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.vectors':'F2CE7AE0544ED11A045F371847832386B582D8598DA15B540EC099EAF5E235CC',
 'V1.mal':'7D68093FC8BC25F61BD468E822A2A9FF03A6C70A218C6830C7B96B6058D285C4',
 'V2.mal':'E5627BE264BEEF7490CB9E375688807B10BC0DDCD95A080296FCEEE01DC8456C',
 'V3.mal':'56C649A195C14035056FD18D175542A532E39BC2E742EEF5CD7087BD1A0EF758',
 'V5.mal':'BEFDC60B2AD768C2E639D357C2C86C3A8B2786A0E0BFE3BFB42449352B67D833',
 'V1.expected.json':'001103E7C3F04033E031CCD2233D03D66BDD9A6BBA10E8A0C6FDA708A8DBAC4F',
 ...Object.fromEntries(['V2','V3','V4','V5'].map(id=>[id+'.expected.json','535326B5AEF633D2B7A89DC9A6BCAF71548FC7482970A7A3FEE32092E60DB712']))
};
if(before.length!==Object.keys(frozen).length || before.some(b=>frozen[path.basename(b.path)]!==b.sha256))throw new Error('NOT_SAME frozen input custody');
const cases=[];
for(const id of ['V1','V2','V3','V4','V5']) {
 const input=path.join(root,'inputs',id==='V4'?'ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal':`${id}.mal`);
 const expected=path.join(root,'inputs',`${id}.expected.json`);
 cases.push({id,kind:'FROZEN',bytes:fs.readFileSync(input),input:bind(input),expectedBytes:fs.readFileSync(expected),expected:bind(expected)});
}
const control=(id,text,verdict,names=[])=>cases.push({id,kind:verdict==='MAYBE'?'PARSER_BOUNDARY_CONTROL':'ADDITIVE_POSITION_CONTROL',bytes:Buffer.from(text),expectedBytes:Buffer.from(JSON.stringify({law_positions:names.sort(),verdict}))});
control('C01_LAW_NAME','law Atom := IF THIS(SHAPE,a) THEN NO(a);','NO',['atom']);
control('C02_DOMAIN','domain HYDROGEN','NO',['hydrogen']);
control('C03_SEED','@propose seed particle','NO',['particle']);
control('C04_READONLY','@readonly input Element','NO',['element']);
control('C05_TERMINAL','TERMINAL := { IF_THEN, singularity, MAYBE }','NO',['singularity']);
control('C06_CONTACT_TYPE','CONTACTS := { x : entropy }','NO',['entropy']);
control('C07_OPERAND_TYPE','OPERANDS := { x : tie }','NO',['tie']);
control('C08_NESTED_ARGUMENT','law TEST := IF THIS(WRAP(element),x) THEN GOES_WITH(SHAPE,x);','NO',['element']);
control('C09_CASE','law TEST := IF THIS(HyDrOgEn,a) THEN GOES_WITH(ATOM,a);','NO',['atom','hydrogen']);
control('C10_WHOLE_TOKEN','law H_ATOM := IF THIS(ATOMIZED,a) THEN GOES_WITH(HYDROGEN_NAME,a);','IF_THEN');
control('C11_COMMENT','// law atom := IF THIS(hydrogen,a) THEN NO(a);','IF_THEN');
control('C12_STRING','law SAFE := IF THIS("atom hydrogen particle",a) THEN GOES_WITH(SHAPE,a);','IF_THEN');
control('C13_COMMENT_NEWLINE','// law atom\nlaw SAFE := IF THIS(entropy,a) THEN NO(a);','NO',['entropy']);
control('C14_CONTACT_LABEL','CONTACTS := { atom : Shape }','IF_THEN');
control('C15_RETIRES','ERRATUM_TEST\nRETIRES\n atom hydrogen particle\nSTATES\n shape := FIRST_SHAPE','IF_THEN');
control('C16_SPECIMEN','ERRATUM_TEST\nVECTORS\n V1 input := `law atom := IF THIS(hydrogen,a) THEN NO(a);`\nGENEALOGY\nrecord','IF_THEN');
control('C17_CORRESPONDENCE','FIRST_SHAPE := (D,I) ["hydrogen", correspondence MAYBE]','IF_THEN');
control('C18_DUPLICATE','law TEST := IF THIS(atom,atom) THEN GOES_WITH(atom,atom);','NO',['atom']);
control('C19_MULTILINE','law TEST :=\n IF THIS(\n particle,a)\n THEN GOES_WITH(SHAPE,a);','NO',['particle']);
control('C20_ALL_RETIRED','law TEST := IF THIS(atom,hydrogen,particle,element,singularity,entropy,tie) THEN NO(a);','NO',tokens);
control('C21_MISSING_LAW_ID','law := IF THIS(SHAPE,a) THEN NO(a);','MAYBE');
control('C22_UNCLOSED_STRING','law SAFE := IF THIS("shape,a) THEN NO(a);','MAYBE');
control('C23_UNCLOSED_BODY','law SAFE := IF THIS(SHAPE,a) THEN NO(a)','MAYBE');
control('C24_AFTER_SPECIMEN','ERRATUM_TEST\nVECTORS\n V1 := `law atom := IF THIS(hydrogen,a) THEN NO(a);`\nGENEALOGY\nlaw SAFE := IF THIS(tie,a) THEN NO(a);','NO',['tie']);
control('C25_UNQUOTED_VECTOR','ERRATUM_TEST\nVECTORS\nlaw SAFE := IF THIS(atom,a) THEN NO(a);','NO',['atom']);
control('C26_AFTER_RETIRES','ERRATUM_TEST\nRETIRES\n atom hydrogen\nSTATES\nlaw SAFE := IF THIS(entropy,a) THEN NO(a);','NO',['entropy']);
control('C27_SLASH_STRING','law SAFE := IF THIS("//",atom) THEN NO(a);','NO',['atom']);
control('C28_RETIRES_ARGUMENT','law SAFE := IF THIS(RETIRES,atom) THEN NO(a);','NO',['atom']);
control('C29_VECTORS_ARGUMENT','law SAFE := IF THIS(VECTORS,atom) THEN NO(a);','NO',['atom']);
control('C30_ERRATUM_LAW_RETIRES','ERRATUM_TEST\nlaw SAFE := IF THIS(SHAPE,a) THEN NO(a);\nRETIRES\n atom\nSTATES\n shape := FIRST_SHAPE','IF_THEN');
control('C31_ERRATUM_DOMAIN_RETIRES','ERRATUM_TEST\ndomain Shape\nRETIRES\n atom\nSTATES\n shape := FIRST_SHAPE','IF_THEN');
control('C32_ERRATUM_AUTHORITY_RETIRES','ERRATUM_TEST\n@propose seed Shape\n@readonly input Carrier\nRETIRES\n atom\nSTATES\n shape := FIRST_SHAPE','IF_THEN');
const only=process.env.W9_ONLY;
const selected=only?cases.filter(c=>new RegExp(only).test(c.id)):cases;
if(selected.length===0)throw new Error('No fixture selected; no qualification result.');
const complete=selected.length===cases.length;
const observations=[];
for(const c of selected){
 const base=path.join(output,c.id); fs.mkdirSync(base);
 const inputPath=path.join(base,'input.mal'); fs.writeFileSync(inputPath,c.bytes,{flag:'wx'});
 const expectedPath=path.join(base,'expected.json');fs.writeFileSync(expectedPath,c.expectedBytes,{flag:'wx'});
 const fields=['verdict',...tokens,'reason'];
 const harness=`IN w9_fixture {\n CAN readonly IN main() -> Atom {\n THIS observed = w9_check.call(byte_seq_leaf.call(MANY [${[...c.bytes].join(',')}]))\n println.call("W9_BEGIN")\n${fields.map(f=>` println.call(observed.${f})`).join('\n')}\n println.call("W9_END")\n NO IN true\n }\n}\n`;
 const harnessPath=path.join(base,'harness.mal');fs.writeFileSync(harnessPath,harness,{flag:'wx'});
 const args=['--eval',runLib,runSource,harnessPath];
 const run=spawnSync(runExe,args,{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024,timeout:120000});
 fs.writeFileSync(path.join(base,'stdout.txt'),run.stdout||'',{flag:'wx'});
 fs.writeFileSync(path.join(base,'stderr.txt'),run.stderr||'',{flag:'wx'});
 const lines=(run.stdout||'').replaceAll('\r','').split('\n');
 const start=lines.indexOf('W9_BEGIN');const end=lines.indexOf('W9_END');
 let result=null,reason=null,comparison='NOT_SAME',error=null;
 if(run.status!==0 || start<0 || end-start!==fields.length+1) error=`NATIVE_OUTPUT:${run.status}:${run.error?.message||'shape'}`;
 else{
  const vals=lines.slice(start+1,end);reason=vals.at(-1);
  if(!['IF_THEN','NO','MAYBE'].includes(vals[0]) || vals.slice(1,-1).some(v=>!['0','1'].includes(v)))error='NATIVE_READING_ENCODING';
  else{
   result={law_positions:tokens.filter((t,i)=>vals[i+1]==='1'),verdict:vals[0]};
   const actual=Buffer.from(JSON.stringify(result));fs.writeFileSync(path.join(base,'actual.json'),actual,{flag:'wx'});
   comparison=actual.equals(c.expectedBytes)?'SAME':'NOT_SAME';
  }
 }
 const row={id:c.id,kind:c.kind,input:bind(inputPath),expected:bind(expectedPath),harness:bind(harnessPath),exit_code:run.status,comparison,result,reason,error};
 if(fs.existsSync(path.join(base,'actual.json')))row.actual=bind(path.join(base,'actual.json'));
 observations.push(row);console.log(JSON.stringify({id:c.id,comparison,result,reason,error}));
}
const after=fs.readdirSync(path.join(root,'inputs')).sort().map(n=>bind(path.join(root,'inputs',n)));
const unchanged=JSON.stringify(before)===JSON.stringify(after)?'SAME':'NOT_SAME';
const runtimeCustody=Object.values(snapshots).every(s=>bind(path.join(root,s.executed_copy.path)).sha256===s.executed_copy.sha256)?'SAME':'NOT_SAME';
const record={kind:complete?'W9_NATIVE_QUALIFICATION':'W9_SUBSET_DIAGNOSTIC',authority:'Devon requests bind v0.1.3 and run W9 before promotion; no promotion performed.',scope:'Additional W9 only. W1-W8 and existing promotion integration untouched. Parser-boundary MAYBE is an implementation deferral, not an additional erratum verdict.',qualification:complete?'FULL_FIXTURE_SET':'SUBSET_ONLY',declared_fixture_count:cases.length,executed_fixture_count:selected.length,inputs:before,inputs_after:unchanged,executed_snapshots:snapshots,snapshot_custody_after:runtimeCustody,observations,terminal:unchanged!=='SAME'||runtimeCustody!=='SAME'||observations.some(r=>r.comparison!=='SAME')?'NOT_SAME':complete?'IF_THEN':'MAYBE'};
fs.writeFileSync(path.join(output,'RUN_RECORD_W9_021.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({terminal:record.terminal,record:bind(path.join(output,'RUN_RECORD_W9_021.json'))}));
if(record.terminal==='NOT_SAME')process.exitCode=1;
