// Explicit bounded DFS storage replaces only collect_join recursion.
// Same index choices, candidate order, supports, count limit and proof records.
__device__ void collect_join(const Image*p,const State*s,const Index*ix,int ri,int ai,int limit,int delta,int pivot,const int*bindings,int*support,ProofRecord*records,int*count){
 const Rule&r=p->rules[ri];
 enum {EMPTY=0,SINGLE=1,PAIR=2,ARGUMENT=3,PREDICATE=4,LINEAR=5};
 struct Frame {int b[16],entered,slot,pattern_id,require_old,mode,cursor,position;};
 // The image contract bounds antecedents by eight. Nine includes a terminal
 // frame even if the collector is entered at antecedent position zero.
 Frame frames[9];int depth=0;
 for(int j=0;j<16;j++)frames[0].b[j]=bindings[j];frames[0].entered=0;
 while(depth>=0&&*count<=REPLAY_PER_CANDIDATE){
  Frame&f=frames[depth];const int current_ai=ai+depth;
  if(current_ai==r.count){
   if(records&&*count<REPLAY_PER_CANDIDATE){
    ProofRecord&out=records[*count];for(int j=0;j<16;j++)out.bindings[j]=f.b[j];
    for(int j=0;j<r.count;j++)out.support[j]=support[j];
   }
   ++*count;--depth;continue;
  }
  if(!f.entered){
   f.entered=1;f.slot=current_ai<=pivot?current_ai-1:current_ai;
   f.require_old=ix->partition_rule[ri]!=0&&f.slot<pivot;
   f.pattern_id=r.antecedent[f.slot];f.mode=EMPTY;f.cursor=-1;f.position=-1;
   unsigned bound_vars=0;for(int j=0;j<16;j++)if(f.b[j]>=0)bound_vars|=1u<<j;
   if((ix->pattern_vars[f.pattern_id]&~bound_vars)==0&&ix->pattern_depth[f.pattern_id]<=32){
    const int t=ground(p,s,f.pattern_id,f.b,0);
    if(t>=0){const int i=ix->fact_for_term[t];
     if(i>=0&&i<limit&&!(f.require_old&&i>=delta)){f.mode=SINGLE;f.cursor=i;}
    }
   }else{
    const Term&pattern=p->patterns[f.pattern_id];int first=0,indexed=pattern.symbol>=0;
    if(pattern.arity){int sym=p->patterns[pattern.child[0]].symbol;
     if(sym>=0)first=sym;else if(f.b[-sym-1]>=0)first=s->terms[f.b[-sym-1]].symbol;else indexed=0;
    }
    int position=-1,selected_bucket=0,best=limit+1,resolved[8];
    for(int j=0;j<8;j++)resolved[j]=-1;
    if(pattern.symbol>=0)for(int j=0;j<pattern.arity;j++){
     int value=ground(p,s,pattern.child[j],f.b,0);resolved[j]=value;if(value<0)continue;
     int h=argument_bucket(pattern.symbol,pattern.arity,j,value);
     if(ix->argument_count[h]<best){best=ix->argument_count[h];position=j;selected_bucket=h;}
    }
    int pair_position=-1,selected_pair_bucket=0;
    if(pattern.symbol>=0&&ix->pattern_depth[f.pattern_id]<=32)
     for(int a=0;a<pattern.arity;a++)if(resolved[a]>=0)
      for(int b=a+1;b<pattern.arity;b++)if(resolved[b]>=0){
       int h=pair_bucket(pattern.symbol,pattern.arity,a,b,resolved[a],resolved[b]);
       if(ix->pair_count[h]<best){best=ix->pair_count[h];pair_position=pair_slot(a,b);selected_pair_bucket=h;}
      }
    if(pair_position>=0){f.mode=PAIR;f.position=pair_position;f.cursor=ix->pair_head[selected_pair_bucket];}
    else if(position>=0){f.mode=ARGUMENT;f.position=position;f.cursor=ix->argument_head[selected_bucket];}
    else if(indexed){f.mode=PREDICATE;f.cursor=ix->head[bucket(pattern.symbol,pattern.arity,first)];}
    else{f.mode=LINEAR;f.cursor=0;}
   }
  }
  int candidate=-1;
  if(f.mode==SINGLE){candidate=f.cursor;f.cursor=-1;}
  else if(f.mode==PAIR){
   while(f.cursor>=0){const int entry=f.cursor;f.cursor=ix->pair_next[entry];const int i=entry/PAIR_SLOTS;
    if(entry%PAIR_SLOTS!=f.position||i>=limit||(f.require_old&&i>=delta))continue;
    candidate=i;break;
   }
  }else if(f.mode==ARGUMENT){
   while(f.cursor>=0){const int entry=f.cursor;f.cursor=ix->argument_next[entry];const int i=entry/8;
    if(entry%8!=f.position||(f.require_old&&i>=delta))continue;
    candidate=i;break;
   }
  }else if(f.mode==PREDICATE||f.mode==LINEAR){
   while(f.cursor>=0&&f.cursor<limit){const int i=f.cursor;f.cursor=f.mode==PREDICATE?ix->next[i]:i+1;
    if(f.require_old&&i>=delta)continue;candidate=i;break;
   }
  }
  if(candidate<0){--depth;continue;}
  Frame&child=frames[depth+1];for(int j=0;j<16;j++)child.b[j]=f.b[j];
  if(match_readonly(p,s,f.pattern_id,s->facts[candidate].term,child.b,0)){
   support[f.slot]=candidate;child.entered=0;++depth;
  }
 }
}
