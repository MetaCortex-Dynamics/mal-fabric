// Generic source custody only: syntactic enclosure is NOT canonical placement.
// No application identifiers, fabric identities or admission facts are emitted.
export function sourceOccurrenceCustody(source) {
  const tokens=[];
  const re=/\s+|\/\/[^\r\n]*|"(?:\\.|[^"\\])*"|[A-Za-z_][A-Za-z_0-9]*|:=|[@{}(),;]/y;
  for(let at=0;at<source.length;){
    re.lastIndex=at; const m=re.exec(source);
    if(!m)throw Error(`Unrecognized source at ${at}`);
    if(!/^\s|^\/\//.test(m[0]))tokens.push({text:m[0],start:at,end:re.lastIndex});
    at=re.lastIndex;
  }
  // Exact UTF-8 byte length of every UTF-16 prefix, including prefixes that
  // split a surrogate pair. A high surrogate alone contributes three bytes;
  // its following low surrogate increases that prefix total by one to four.
  // No token, enclosure, offset unit, order, or emitted entry changes.
  const byteOffsets = new Float64Array(source.length+1);
  for(let i=0;i<source.length;i++){
    const unit=source.charCodeAt(i);
    const pairedLow=unit>=0xDC00&&unit<=0xDFFF&&i>0&&
      source.charCodeAt(i-1)>=0xD800&&source.charCodeAt(i-1)<=0xDBFF;
    const width=pairedLow?1:unit<0x80?1:unit<0x800?2:3;
    byteOffsets[i+1]=byteOffsets[i]+width;
  }
  const byte=i=>byteOffsets[i];
  const entries=[{kind:'source',start:0,end:Buffer.byteLength(source),parent:null}];
  let at=0;
  const peek=()=>tokens[at]?.text;
  function take(text){const t=tokens[at++];if(!t||(text!==undefined&&t.text!==text))throw Error(`Expected ${text}`);return t;}
  function add(kind,t,parent,extra={}){const id=entries.length;entries.push({kind,start:byte(t.start),end:null,parent,...extra});return id;}
  function finish(id,t){entries[id].end=byte(t.end);}
  function term(parent,position){
    const t=take();if(!/^(?:[A-Za-z_]|\")/.test(t.text))throw Error('Expected term');
    const id=add(t.text.startsWith('"')?'text':'term',t,parent,{spelling:t.text,position});
    let last=t;
    if(peek()==='('){take('(');let n=0;do{term(id,n++);if(peek()!==',')break;take(',');}while(true);last=take(')');}
    finish(id,last);return id;
  }
  while(at<tokens.length){
    const first=take();
    if(first.text==='domain') {const id=add('domain',first,0);while(peek()!==';')take();finish(id,take(';'));continue;}
    if(first.text==='@') {
      const authority=take().text,kind=take().text,name=take().text;
      const id=add(kind,first,0,{name,authority});take(':=');
      if(kind==='input'){term(id,0);}
      else if(kind==='seed'){take('{');let n=0;while(peek()!=='}'){term(id,n++);if(peek()!==',')break;take(',');}take('}');}
      else throw Error('Unsupported declaration');
      finish(id,take(';'));continue;
    }
    if(first.text==='law'){
      const id=add('law',first,0,{name:take().text});take(':=');take('IF');
      let n=0;do{const child=term(id,n++);entries[child].clause='antecedent';if(peek()!==',')break;take(',');}while(true);
      take('THEN');const child=term(id,n);entries[child].clause='consequent';finish(id,take(';'));continue;
    }
    throw Error(`Unsupported declaration ${first.text}`);
  }
  for(let i=1;i<entries.length;i++){
    const e=entries[i],p=entries[e.parent];
    if(!(e.parent<i&&p.start<=e.start&&e.end<=p.end))throw Error('Source enclosure');
  }
  return {scope:'SOURCE_CUSTODY_ONLY_NOT_FABRIC_CONTAINMENT',offset_unit:'UTF8_BYTES',entries};
}
