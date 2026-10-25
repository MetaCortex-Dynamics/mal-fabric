// Generic source-custody performance qualification only. No GPU, world rule,
// field update, candidate enumeration, source reordering, or source edit.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..');
const [name='qualification_001']=process.argv.slice(2),out=path.join(here,name);
const need=(x,m)=>{if(!x)throw Error(m);},j=JSON.stringify;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return{path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const put=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'}),save=(p,o)=>put(p,j(o,null,2)+'\n');
const oldHelper=path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs');
const oldLower=path.join(root,'j17_step_021/tools/lower.mjs');
const newHelper=path.join(here,'source_occurrence_custody.mjs'),newLower=path.join(here,'lower.mjs');
const input=path.resolve(here,'../run_001/qualification/input.mal'),original=path.resolve(here,'../run_001/qualification/stage');
const g2=path.join(root,'j17_step_023/outputs/committed.world.json');
need(id(oldHelper).sha256==='187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B','OLD_HELPER_NOT_SAME');
need(id(oldLower).sha256==='05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B','OLD_LOWERER_NOT_SAME');
need(id(input).sha256==='A291E71D651ABAF920605F31A485E1FC6350E0167B2C0FE72D094F6AC4538339','R1_SOURCE_NOT_SAME');
need(id(path.join(original,'image.bin')).sha256==='BDA2C0F9BDBBD2BFDD2E7D556E614F35AE043980350F47220D5751038CE8C82D','ORIGINAL_IMAGE_NOT_SAME');
const oldText=fs.readFileSync(oldHelper,'utf8'),newText=fs.readFileSync(newHelper,'utf8');
const oldByte="  const byte=i=>Buffer.byteLength(source.slice(0,i),'utf8');";
const begin=newText.indexOf('  // Exact UTF-8 byte length'),end=newText.indexOf('  const entries=');
need(begin>=0&&end>begin,'PREFIX_BLOCK_BOUNDS');
const newBlock=newText.slice(begin,end).trimEnd();
need(oldText.replace(oldByte,newBlock)===newText,'HELPER_CHANGE_NOT_EXCLUSIVE');
const oldLocation="new URL('file:///C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs')";
const newLocation="new URL('./source_occurrence_custody.mjs',import.meta.url)";
need(fs.readFileSync(oldLower,'utf8').replace(oldLocation,newLocation)===fs.readFileSync(newLower,'utf8'),'LOWERER_CHANGE_NOT_PATH_ONLY');
need(!fs.existsSync(out)&&path.dirname(out)===here,'FRESH_OUTPUT_REQUIRED');fs.mkdirSync(out);
const bound=[oldHelper,oldLower,newHelper,newLower,input,g2,path.join(original,'image.bin'),path.join(original,'source-map.json'),path.join(original,'source-occurrence-custody.json'),fileURLToPath(import.meta.url)].map(id);
save(path.join(out,'SOURCE_DIFF.json'),{helper:{old:oldByte,new:newBlock},lowerer:{old:oldLocation,new:newLocation},all_other_source_bytes:'SAME'});
const oldModule=await import(pathToFileURL(oldHelper)),newModule=await import(pathToFileURL(newHelper));
// Execute the exact prefix block extracted from the qualified new helper.
// This is a serialization-unit test, not a realization of any MaL operator.
const prefix=new Function('source',newBlock+'\nreturn byteOffsets;');
let prefixStrings=0,prefixBoundaries=0;
function checkPrefixes(s){const actual=prefix(s);need(actual.length===s.length+1,'PREFIX_LENGTH');for(let i=0;i<=s.length;i++){need(actual[i]===Buffer.byteLength(s.slice(0,i),'utf8'),'UTF8_PREFIX_NOT_SAME '+j([s,i]));prefixBoundaries++;}prefixStrings++;}
for(let c=0;c<=0xFFFF;c++)checkPrefixes(String.fromCharCode(c));
for(let h=0xD800;h<=0xDBFF;h++)for(let l=0xDC00;l<=0xDFFF;l++)checkPrefixes(String.fromCharCode(h,l));
const fixtureValues=['','ASCII','\u00e9\u03a9','\u6f22\u5b57','\u{1f600}','\ud800','\udfff','\ud800\ud800\udc00','\udc00\ud800\udc00','a\u{1f600}z','\u{1f469}\u200d\u{1f4bb}','\r\n','\u0000','\\"'];
const fixtures=[];
for(const text of fixtureValues){
 checkPrefixes(text);
 const escaped=text.replaceAll('\\','\\\\').replaceAll('"','\\"');
 const source='// custody '+text.replace(/[\r\n]/g,' ')+'\r\n@propose seed S := { THIS(X,"'+escaped+'") };\n@readonly input I := "alias:/x";\nlaw L := IF THIS(X,a), GOES_WITH(Y,a,b) THEN THIS(Z,b);\n';
 const a=oldModule.sourceOccurrenceCustody(source),b=newModule.sourceOccurrenceCustody(source);
 need(j(a)===j(b),'UNICODE_CUSTODY_NOT_SAME');
 fixtures.push({source_utf16_units:source.length,source_sha256:sha(Buffer.from(source)),entries:a.entries.length,output_sha256:sha(Buffer.from(j(a))),verdict:'SAME'});
}
save(path.join(out,'UNICODE_QUALIFICATION.json'),{verdict:'SAME',prefixStrings,prefixBoundaries,coverage:'every single UTF16 code unit; all 1024x1024 high-low surrogate pairs at every prefix boundary; mixed malformed/valid sequences and complete source-custody fixtures',fixtures});
console.log(j({unicode:'SAME',prefixStrings,prefixBoundaries,fixtures:fixtures.length}));
const args=[newLower,input,path.join(out,'stage'),'-','g2='+g2],started=new Date().toISOString();
console.log('fast_lower_start',started);
const p=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout:600000});
save(path.join(out,'LOWER_EXECUTION.json'),{command:process.execPath,args,started,ended:new Date().toISOString(),status:p.status,error:p.error?.message,stdout:p.stdout,stderr:p.stderr,gpu:'NOT_RUN'});
need(p.status===0&&!p.error,'FAST_LOWER_STOP '+p.stderr);
const stage=path.join(out,'stage');
need(id(path.join(stage,'image.bin')).sha256===id(path.join(original,'image.bin')).sha256,'IMAGE_NOT_SAME');
const oldCustody=JSON.parse(fs.readFileSync(path.join(original,'source-occurrence-custody.json'))),newCustody=JSON.parse(fs.readFileSync(path.join(stage,'source-occurrence-custody.json')));
need(oldCustody.producer_sha256===id(oldHelper).sha256&&newCustody.producer_sha256===id(newHelper).sha256,'CUSTODY_PRODUCER_BINDING');
delete oldCustody.producer_sha256;delete newCustody.producer_sha256;
need(j(oldCustody)===j(newCustody),'OCCURRENCE_POSITIONS_NOT_SAME');
const oldMap=JSON.parse(fs.readFileSync(path.join(original,'source-map.json'))),newMap=JSON.parse(fs.readFileSync(path.join(stage,'source-map.json')));
need(oldMap.lowerer_sha256===id(oldLower).sha256&&newMap.lowerer_sha256===id(newLower).sha256,'LOWERER_BINDING');
delete oldMap.lowerer_sha256;delete newMap.lowerer_sha256;
need(j(oldMap)===j(newMap),'SOURCE_MAP_SEMANTICS_NOT_SAME');
for(const b of bound)need(id(b.path).sha256===b.sha256,'POST_QUALIFICATION_NOT_SAME '+b.path);
const record={schema:'GenericUtf8PrefixCustodyQualification001',verdict:'SAME',scope:'Execution cost only; native source, seeds, order, cases, semantic source offsets, image and occurrence entries unchanged',bound,prefixStrings,prefixBoundaries,unicode_fixtures:fixtures.length,image:'BYTE_SAME',source_map:'SAME_EXCEPT_BOUND_LOWERER_HASH',occurrence_custody:'SAME_EXCEPT_BOUND_HELPER_HASH',occurrence_entries:newCustody.entries.length,original_image:id(path.join(original,'image.bin')),qualified_image:id(path.join(stage,'image.bin')),source_map_output:id(path.join(stage,'source-map.json')),occurrence_output:id(path.join(stage,'source-occurrence-custody.json')),diff:id(path.join(out,'SOURCE_DIFF.json')),unicode:id(path.join(out,'UNICODE_QUALIFICATION.json')),execution:id(path.join(out,'LOWER_EXECUTION.json')),gpu:'NOT_RUN'};
save(path.join(out,'QUALIFICATION.json'),record);console.log(j({qualification:id(path.join(out,'QUALIFICATION.json')),image:record.qualified_image.sha256,occurrence_entries:record.occurrence_entries}));
