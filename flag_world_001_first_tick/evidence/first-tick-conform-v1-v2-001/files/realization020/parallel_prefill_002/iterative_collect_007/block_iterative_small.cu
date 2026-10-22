// Bounded block-parallel matching with single ordered commit; compile-only candidate.
// 32 pivot candidates per chunk; two read-only passes; 256 records per candidate.
// Overflow/deep patterns fall back to unchanged serial traversal. No world law.
// Disjoint semi-naive pivot successor; first enabled pivot owns each application.
// Earlier full applications and their term/fact/support order are unchanged.
// NOT_QUALIFIED until independent GPU byte-identity qualification.
// Paired-argument scratch-index successor; no join reordering or source changes.
// NOT_QUALIFIED until root records GPU byte identity.
// Progress-only successor: status is separate from State and readback.
// NOT_QUALIFIED until root records GPU byte identity; no application logic.
// Successor of delta_indexed: fully bound antecedent lookup only; same match/support.
// Scratch metadata derives only variable membership and syntactic pattern depth.
// Successor of law_application_resume_vector_indexed.cu: current-delta predicate index only.
// Scratch-index optimization; rule/pivot/support ordering and snapshot boundary unchanged.
// Additive checkpoint continuation of the generic source-law application substrate.
// Mandatory entry point: resume_guard.mjs verifies source/rule/seed monotonicity.
// Prior fact/support and term identities are retained; only new positive closure is added.
// Generic source-law application substrate. No application names, outcomes,
// incidence, world transitions, or expected vector constants occur here.
// Reads immutable antecedent snapshots. Each consequent records rule and support.
#include <cuda_runtime.h>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <cstdint>
#include <memory>
#include <string>
#include <chrono>
#include <thread>
#include <atomic>
#include <sstream>
#include <cstdio>
#include <cstring>
#include <fcntl.h>
#include <io.h>
#include <share.h>
#include <sys/stat.h>
constexpr int NP=65536, NS=2048, NR=1024, NT=32768, NF=16384;
constexpr int PAIR_BUCKETS=1048576, PAIR_SLOTS=28;
// Extra scratch: 232 MiB; no term/fact/pattern capacity or serialized layout change.
static_assert((2ull*PAIR_BUCKETS+1ull*NF*PAIR_SLOTS)*sizeof(int)==10223616ull);
struct Term {int symbol,arity,child[8];};
struct Rule {int count,result,antecedent[8];};
struct Image {int magic,pattern_count,seed_count,rule_count;Term patterns[NP];int seed[NS];Rule rules[NR];};
struct Fact {int term,rule,rank,count,support[8];};
struct State {int error,term_count,fact_count,epochs;Term terms[NT];Fact facts[NF];};
#include "telemetry.inc"
struct Index {int head[4096],next[NF],delta_head[4096],delta_next[NF],term_head[32768],term_next[NT],fact_for_term[NT];int argument_head[65536],argument_count[65536],argument_next[NF*8];int ground_pattern[NP];unsigned pattern_vars[NP];int pattern_depth[NP];int pair_head[PAIR_BUCKETS],pair_count[PAIR_BUCKETS],pair_next[NF*PAIR_SLOTS];int partition_rule[NR];};
// One serial invocation owns this scratch index; no application-specific keys.
__device__ Index* active_index;
__device__ int bucket(int root,int arity,int first){return static_cast<unsigned>((root*73856093u)^(arity*19349663u)^(first*83492791u))&4095u;}
__device__ int argument_bucket(int root,int arity,int position,int term){return static_cast<unsigned>(root*73856093u^arity*19349663u^position*83492791u^term*2654435761u)&65535u;}
// Positions are source pattern positions, not application identities.
__device__ int pair_slot(int a,int b){return a*(15-a)/2+b-a-1;}
__device__ int pair_bucket(int root,int arity,int a,int b,int x,int y){
 unsigned h=static_cast<unsigned>(root)*73856093u^static_cast<unsigned>(arity)*19349663u;
 h=(h^static_cast<unsigned>(a))*16777619u;h=(h^static_cast<unsigned>(b))*16777619u;
 h=(h^static_cast<unsigned>(x))*16777619u;h=(h^static_cast<unsigned>(y))*16777619u;
 return h&(PAIR_BUCKETS-1u);
}
static_assert(sizeof(Term)==40 && sizeof(Rule)==40 && sizeof(Fact)==48);
__device__ int intern(State*s,Term t){
 unsigned h=static_cast<unsigned>(t.symbol)*16777619u+static_cast<unsigned>(t.arity);for(int j=0;j<t.arity;j++)h=(h^static_cast<unsigned>(t.child[j]))*16777619u;h&=32767u;
 for(int i=active_index->term_head[h];i>=0;i=active_index->term_next[i]){const Term&u=s->terms[i];if(u.symbol!=t.symbol||u.arity!=t.arity)continue;
  int j=0;for(;j<t.arity&&u.child[j]==t.child[j];j++);if(j==t.arity)return i;}
 if(s->term_count>=NT){s->error=1;return -1;}int id=s->term_count++;s->terms[id]=t;active_index->term_next[id]=active_index->term_head[h];active_index->term_head[h]=id;return id;
}
__device__ int instantiate(const Image*p,State*s,int id,const int*b,int depth){
 if(depth>32||id<0||id>=p->pattern_count){s->error=2;return -1;}
 if(active_index->ground_pattern[id]>=0)return active_index->ground_pattern[id];
 const Term&t=p->patterns[id];if(t.symbol<0){int v=-t.symbol-1;if(v>=16||b[v]<0){s->error=3;return -1;}return b[v];}
 Term out{};out.symbol=t.symbol;out.arity=t.arity;
 for(int j=0;j<t.arity;j++){out.child[j]=instantiate(p,s,t.child[j],b,depth+1);if(s->error)return -1;}
 return intern(s,out);
}
// Resolve a fully bound query without constructing a term or changing its identity.
__device__ int ground(const Image*p,const State*s,int id,const int*b,int depth){
 if(depth>32)return -1;if(active_index->ground_pattern[id]>=0)return active_index->ground_pattern[id];const Term&t=p->patterns[id];if(t.symbol<0)return b[-t.symbol-1];Term q{};q.symbol=t.symbol;q.arity=t.arity;
 for(int j=0;j<t.arity;j++){q.child[j]=ground(p,s,t.child[j],b,depth+1);if(q.child[j]<0)return -1;}
 unsigned h=static_cast<unsigned>(q.symbol)*16777619u+static_cast<unsigned>(q.arity);for(int j=0;j<q.arity;j++)h=(h^static_cast<unsigned>(q.child[j]))*16777619u;h&=32767u;
 for(int i=active_index->term_head[h];i>=0;i=active_index->term_next[i]){const Term&u=s->terms[i];if(u.symbol!=q.symbol||u.arity!=q.arity)continue;int j=0;for(;j<q.arity&&u.child[j]==q.child[j];j++);if(j==q.arity)return i;}return -1;
}
__device__ int match(const Image*p,State*s,int pattern,int term,int*b,int depth){
 if(depth>32){s->error=2;return 0;}const Term&a=p->patterns[pattern];
 if(a.symbol<0){int v=-a.symbol-1;if(v>=16){s->error=3;return 0;}if(b[v]<0){b[v]=term;return 1;}return b[v]==term;}
 const Term&t=s->terms[term];if(a.symbol!=t.symbol||a.arity!=t.arity)return 0;
 for(int j=0;j<a.arity;j++)if(!match(p,s,a.child[j],t.child[j],b,depth+1))return 0;return 1;
}
__device__ void add_fact(State*s,int term,int rule,int rank,int count,const int*support){
 if(s->error)return;if(active_index->fact_for_term[term]>=0)return;
 if(s->fact_count>=NF){s->error=4;return;}Fact f{};f.term=term;f.rule=rule;f.rank=rank;f.count=count;
 for(int i=0;i<count;i++)f.support[i]=support[i];active_index->fact_for_term[term]=s->fact_count;s->facts[s->fact_count++]=f;
}
__device__ void join(const Image*p,State*s,const Index*ix,int ri,int ai,int limit,int delta,int pivot,const int*bindings,int*support){
 if(s->error)return;const Rule&r=p->rules[ri];
 // On a full-snapshot first pass, every antecedent is in delta, so pivot 0
 // already enumerates every application. Deeper antecedents retain all paths.
 const bool partition=ix->partition_rule[ri]!=0;
 if(ai==0&&partition&&delta==0&&pivot>0)return;
 if(ai==r.count){int rank=0;for(int i=0;i<r.count;i++){int x=s->facts[support[i]].rank+1;if(x>rank)rank=x;}
  int t=instantiate(p,s,r.result,bindings,0);add_fact(s,t,ri,rank,r.count,support);return;}
 // Every newly enabled positive application has at least one antecedent in the
 // last snapshot's delta. Select it first; retain original support positions.
 const int slot=ai==0?pivot:(ai<=pivot?ai-1:ai);
 // An earlier antecedent in delta means this same complete substitution was
 // already visited under an earlier pivot. Snapshot/rule order is unchanged.
 const bool require_old=partition&&slot<pivot;
 if(ai==0){
  // Full-snapshot queries (new rules on the first resumed pass) retain the
  // original bucket order. Other pivots visit a separate current-delta index.
  // Both expose exactly the same eligible fact IDs, in the original order;
  // the delta index omits historical bucket traversal, not any application.
  const Term&query=p->patterns[r.antecedent[slot]];int first=0,indexed=query.symbol>=0;
  if(query.arity){int sym=p->patterns[query.child[0]].symbol;if(sym>=0)first=sym;else if(bindings[-sym-1]>=0)first=s->terms[bindings[-sym-1]].symbol;else indexed=0;}
  const bool whole_snapshot=delta==0;
  const int h=indexed?bucket(query.symbol,query.arity,first):0;
  for(int i=indexed?(whole_snapshot?ix->head[h]:ix->delta_head[h]):delta;i>=0&&i<limit&&!s->error;i=indexed?(whole_snapshot?ix->next[i]:ix->delta_next[i]):i+1){
   int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];
   if(match(p,s,r.antecedent[slot],s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}
  }return;
 }
 // A fully bound antecedent has at most one matching interned fact. Resolve
 // it without constructing terms. A term/fact appended in this epoch is not
 // in the immutable snapshot and must not satisfy the antecedent yet.
 // Keep deeper patterns on the original path to retain depth-refusal behavior.
 const int pattern_id=r.antecedent[slot];
 unsigned bound_vars=0;for(int j=0;j<16;j++)if(bindings[j]>=0)bound_vars|=1u<<j;
 if((ix->pattern_vars[pattern_id]&~bound_vars)==0&&ix->pattern_depth[pattern_id]<=32){
  const int t=ground(p,s,pattern_id,bindings,0);
  if(t<0)return;
  const int i=ix->fact_for_term[t];if(i<0||i>=limit||(require_old&&i>=delta))return;
  int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];
  if(match(p,s,pattern_id,s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}
  return;
 }
 const Term&pattern=p->patterns[pattern_id];int first=0,indexed=pattern.symbol>=0;
 if(pattern.arity){int sym=p->patterns[pattern.child[0]].symbol;if(sym>=0)first=sym;else if(bindings[-sym-1]>=0)first=s->terms[bindings[-sym-1]].symbol;else indexed=0;}
 int position=-1,selected_bucket=0,best=limit+1;
 int resolved[8];for(int j=0;j<8;j++)resolved[j]=-1;
 if(pattern.symbol>=0)for(int j=0;j<pattern.arity;j++){int value=ground(p,s,pattern.child[j],bindings,0);resolved[j]=value;if(value<0)continue;int h=argument_bucket(pattern.symbol,pattern.arity,j,value);if(ix->argument_count[h]<best){best=ix->argument_count[h];position=j;selected_bucket=h;}}
 // An indexed pair removes only candidates that cannot match. Matching members
 // retain the same newest-snapshot-block/ascending-ID order as the original
 // argument index. Deeper patterns retain the original refusal path.
 int pair_position=-1,selected_pair_bucket=0;
 if(pattern.symbol>=0&&ix->pattern_depth[pattern_id]<=32)for(int a=0;a<pattern.arity;a++)if(resolved[a]>=0)for(int b=a+1;b<pattern.arity;b++)if(resolved[b]>=0){
  int h=pair_bucket(pattern.symbol,pattern.arity,a,b,resolved[a],resolved[b]);
  if(ix->pair_count[h]<best){best=ix->pair_count[h];pair_position=pair_slot(a,b);selected_pair_bucket=h;}
 }
 if(pair_position>=0){
  for(int entry=ix->pair_head[selected_pair_bucket];entry>=0&&!s->error;entry=ix->pair_next[entry]){
   int i=entry/PAIR_SLOTS;if(entry%PAIR_SLOTS!=pair_position||i>=limit||(require_old&&i>=delta))continue;
   int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];
   if(match(p,s,pattern_id,s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}
  }
  return;
 }
 if(position>=0){for(int entry=ix->argument_head[selected_bucket];entry>=0&&!s->error;entry=ix->argument_next[entry]){int i=entry/8;if(entry%8!=position||(require_old&&i>=delta))continue;int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];if(match(p,s,r.antecedent[slot],s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}}return;}
 for(int i=indexed?ix->head[bucket(pattern.symbol,pattern.arity,first)]:0;i>=0&&i<limit&&!s->error;i=indexed?ix->next[i]:i+1){if(require_old&&i>=delta)continue;int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];
  if(match(p,s,r.antecedent[slot],s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}}
}

constexpr int REPLAY_LANES=32, REPLAY_PER_CANDIDATE=256;
struct ProofRecord {int bindings[16],support[8];};
struct ReplayScratch {ProofRecord records[REPLAY_LANES*REPLAY_PER_CANDIDATE];int candidate[REPLAY_LANES],count[REPLAY_LANES];};
static_assert(sizeof(ReplayScratch)==786688);
// This matcher is read-only. It is used only after every antecedent pattern is
// certified depth <=32 by the same source-independent metadata as partitioning.
// Unsupported/deeper patterns use the original serial join, including refusals.
__device__ int match_readonly(const Image*p,const State*s,int pattern,int term,int*b,int depth){
 if(depth>32)return 0;const Term&a=p->patterns[pattern];
 if(a.symbol<0){int v=-a.symbol-1;if(v>=16)return 0;if(b[v]<0){b[v]=term;return 1;}return b[v]==term;}
 const Term&t=s->terms[term];if(a.symbol!=t.symbol||a.arity!=t.arity)return 0;
 for(int j=0;j<a.arity;j++)if(!match_readonly(p,s,a.child[j],t.child[j],b,depth+1))return 0;return 1;
}
// Enumerate applications only: no intern, add_fact, index write, or State write.
// Each lane owns its counter and (in pass two) its fixed disjoint record slice.
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
__device__ void commit_proof(const Image*p,State*s,int ri,const ProofRecord&proof){
 const Rule&r=p->rules[ri];int rank=0;for(int i=0;i<r.count;i++){int x=s->facts[proof.support[i]].rank+1;if(x>rank)rank=x;}
 int t=instantiate(p,s,r.result,proof.bindings,0);add_fact(s,t,ri,rank,r.count,proof.support);
}
// All lanes call in lockstep. Thread zero alone mutates State and indexes.
// Barriers separate immutable read passes from every ordered commit phase.
__device__ void replay_join(const Image*p,State*s,const Index*ix,int ri,int limit,int delta,int pivot,ReplayScratch*scratch,volatile Progress*progress,int epoch){
 const int lane=threadIdx.x;const Rule&r=p->rules[ri];
 if(!ix->partition_rule[ri]){
  if(lane==0){publish_detail(progress,s,epoch,SERIAL_DEEP,ri,pivot,-1,0,-1);int b[16],support[8];for(int j=0;j<16;j++)b[j]=-1;join(p,s,ix,ri,0,limit,delta,pivot,b,support);}
  __syncthreads();return;
 }
 if(delta==0&&pivot>0)return;
 __shared__ int cursor,indexed_pivot,whole_snapshot,chunk_size;
 if(lane==0){
  publish_detail(progress,s,epoch,PIVOT_BEGIN,ri,pivot,-1,0,-1);
  const Term&query=p->patterns[r.antecedent[pivot]];int first=0;indexed_pivot=query.symbol>=0;
  if(query.arity){int sym=p->patterns[query.child[0]].symbol;if(sym>=0)first=sym;else indexed_pivot=0;}
  whole_snapshot=delta==0;const int h=indexed_pivot?bucket(query.symbol,query.arity,first):0;
  cursor=indexed_pivot?(whole_snapshot?ix->head[h]:ix->delta_head[h]):delta;
 }
 __syncthreads();
 for(int chunk_index=0;;chunk_index++){
  if(lane==0){chunk_size=0;while(chunk_size<REPLAY_LANES&&cursor>=0&&cursor<limit){
   scratch->candidate[chunk_size++]=cursor;
   cursor=indexed_pivot?(whole_snapshot?ix->next[cursor]:ix->delta_next[cursor]):cursor+1;
  }publish_detail(progress,s,epoch,COUNT_PASS,ri,pivot,chunk_index,chunk_size,-1);}
  __syncthreads();const int count_in_chunk=chunk_size;__syncthreads();if(count_in_chunk==0)return;
  if(lane<count_in_chunk){
   int b[16],support[8],count=0;for(int j=0;j<16;j++)b[j]=-1;
   const int i=scratch->candidate[lane];
   if(match_readonly(p,s,r.antecedent[pivot],s->facts[i].term,b,0)){
    support[pivot]=i;collect_join(p,s,ix,ri,1,limit,delta,pivot,b,support,nullptr,&count);
   }
   scratch->count[lane]=count;
  }
  __syncthreads();
  if(lane==0)publish_detail(progress,s,epoch,EMIT_PASS,ri,pivot,chunk_index,count_in_chunk,-1);
  __syncthreads();
  if(lane<count_in_chunk&&scratch->count[lane]>0&&scratch->count[lane]<=REPLAY_PER_CANDIDATE){
   int b[16],support[8],count=0;for(int j=0;j<16;j++)b[j]=-1;
   const int i=scratch->candidate[lane];
   if(match_readonly(p,s,r.antecedent[pivot],s->facts[i].term,b,0)){
    support[pivot]=i;collect_join(p,s,ix,ri,1,limit,delta,pivot,b,support,&scratch->records[lane*REPLAY_PER_CANDIDATE],&count);
   }
   // Defensive fallback, before any commit, if the two read-only passes differ.
   if(count!=scratch->count[lane])scratch->count[lane]=-1;
  }
  __syncthreads();
  if(lane==0){
   publish_detail(progress,s,epoch,ORDERED_COMMIT,ri,pivot,chunk_index,count_in_chunk,-1);
   for(int k=0;k<count_in_chunk&&!s->error;k++){
    if(scratch->count[k]<0||scratch->count[k]>REPLAY_PER_CANDIDATE){
     publish_detail(progress,s,epoch,SERIAL_OVERFLOW,ri,pivot,chunk_index,count_in_chunk,k);
     int b[16],support[8];for(int j=0;j<16;j++)b[j]=-1;const int i=scratch->candidate[k];
     if(match(p,s,r.antecedent[pivot],s->facts[i].term,b,0)){support[pivot]=i;join(p,s,ix,ri,1,limit,delta,pivot,b,support);}
     publish_detail(progress,s,epoch,ORDERED_COMMIT,ri,pivot,chunk_index,count_in_chunk,-1);
    }else for(int j=0;j<scratch->count[k]&&!s->error;j++)commit_proof(p,s,ri,scratch->records[k*REPLAY_PER_CANDIDATE+j]);
   }
  }
  __syncthreads();const int failed=s->error;__syncthreads();if(failed)return;
 }
}
__device__ void initialize_serial(const Image*p,State*s,Index*ix,volatile Progress*progress){
 publish_progress(progress,s,s->epochs);
 active_index=ix;for(int i=0;i<32768;i++)ix->term_head[i]=-1;for(int i=0;i<NT;i++)ix->fact_for_term[i]=-1;
 const int retained_facts=s->fact_count;
 // Rebuild the intern table without reseating or renumbering retained terms.
 for(int i=0;i<s->term_count;i++){const Term&t=s->terms[i];unsigned h=static_cast<unsigned>(t.symbol)*16777619u+static_cast<unsigned>(t.arity);for(int j=0;j<t.arity;j++)h=(h^static_cast<unsigned>(t.child[j]))*16777619u;h&=32767u;ix->term_next[i]=ix->term_head[h];ix->term_head[h]=i;}
 for(int i=0;i<retained_facts;i++)ix->fact_for_term[s->facts[i].term]=i;
 // Image validation establishes preceding child indices. Seat closed terms in
 // that order, without recursive descent through potentially long input lists.
 // This constructs terms only: no extra fact or application is admitted.
 for(int i=0;i<p->pattern_count;i++){
  ix->ground_pattern[i]=-1;const Term&t=p->patterns[i];
  if(t.symbol<0){ix->pattern_vars[i]=1u<<(-t.symbol-1);ix->pattern_depth[i]=0;continue;}
  unsigned variables=0;int depth=0;
  for(int j=0;j<t.arity;j++){variables|=ix->pattern_vars[t.child[j]];int child_depth=ix->pattern_depth[t.child[j]]+1;if(child_depth>depth)depth=child_depth;}
  ix->pattern_vars[i]=variables;ix->pattern_depth[i]=depth;
  Term q{};q.symbol=t.symbol;q.arity=t.arity;int j=0;for(;j<t.arity;j++){q.child[j]=ix->ground_pattern[t.child[j]];if(q.child[j]<0)break;}if(j==t.arity)ix->ground_pattern[i]=intern(s,q);if(s->error){publish_progress(progress,s,s->epochs);return;}
 }
 for(int ri=0;ri<p->rule_count;ri++){ix->partition_rule[ri]=1;const Rule&r=p->rules[ri];for(int j=0;j<r.count;j++)if(ix->pattern_depth[r.antecedent[j]]>32)ix->partition_rule[ri]=0;}
 int b[16],support[8];for(int j=0;j<16;j++)b[j]=-1;
 for(int i=0;i<p->seed_count&&!s->error;i++)add_fact(s,instantiate(p,s,p->seed[i],b,0),-1,0,0,support);
 for(int i=0;i<4096;i++)ix->head[i]=-1;
 for(int i=0;i<65536;i++){ix->argument_head[i]=-1;ix->argument_count[i]=0;}
 for(int i=0;i<PAIR_BUCKETS;i++){ix->pair_head[i]=-1;ix->pair_count[i]=0;}

}
__device__ void index_serial(const State*s,Index*ix,int delta,int indexed,int limit){
  // Index only the new immutable snapshot members. Consequences appended below
  // do not enter the index until the next epoch.
  for(int i=limit-1;i>=indexed;i--){const Term&t=s->terms[s->facts[i].term];int h=bucket(t.symbol,t.arity,t.arity?s->terms[t.child[0]].symbol:0);ix->next[i]=ix->head[h];ix->head[h]=i;}
  // Rebuild only this immutable snapshot's delta. Descending insertion gives
  // ascending fact IDs, including when retained facts precede new seed facts.
  // A new rule still uses the full index through its existing delta=0 call.
  for(int h=0;h<4096;h++)ix->delta_head[h]=-1;
  for(int i=limit-1;i>=delta;i--){const Term&t=s->terms[s->facts[i].term];int h=bucket(t.symbol,t.arity,t.arity?s->terms[t.child[0]].symbol:0);ix->delta_next[i]=ix->delta_head[h];ix->delta_head[h]=i;}
  for(int i=limit-1;i>=indexed;i--){const Term&t=s->terms[s->facts[i].term];for(int j=0;j<t.arity;j++){int h=argument_bucket(t.symbol,t.arity,j,t.child[j]);ix->argument_next[i*8+j]=ix->argument_head[h];ix->argument_head[h]=i*8+j;ix->argument_count[h]++;}}
  // Pair entries are appended to the same immutable snapshot as the existing
  // indexes. Descending insertion preserves their matching fact visitation order.
  for(int i=limit-1;i>=indexed;i--){const Term&t=s->terms[s->facts[i].term];for(int a=0;a<t.arity;a++)for(int b=a+1;b<t.arity;b++){
   int h=pair_bucket(t.symbol,t.arity,a,b,t.child[a],t.child[b]),entry=i*PAIR_SLOTS+pair_slot(a,b);
   ix->pair_next[entry]=ix->pair_head[h];ix->pair_head[h]=entry;ix->pair_count[h]++;
  }}

}
__global__ void apply(const Image*p,State*s,Index*ix,int retained_rules,volatile Progress*progress,ReplayScratch*scratch,Telemetry*telemetry,HistogramScratch*histogram){
 if(blockIdx.x||blockDim.x!=REPLAY_LANES)return;
 __shared__ int prior_epochs,delta,indexed,limit,stop;
 if(threadIdx.x==0){prior_epochs=s->epochs;delta=s->fact_count;indexed=0;initialize_histogram(telemetry,histogram);initialize_serial(p,s,ix,progress);publish_epoch(s,s->epochs);}
 __syncthreads();const int initialization_failed=s->error;__syncthreads();if(initialization_failed)return;
 for(int epoch=0;epoch<8192;epoch++){
  if(threadIdx.x==0){limit=s->fact_count;publish_detail(progress,s,prior_epochs+epoch+1,INDEX_SNAPSHOT,-1,-1,-1,0,-1);index_serial(s,ix,delta,indexed,limit);}
  __syncthreads();
  // Copy a refusal into private uniform control between barriers. No lane may
  // read a future serial phase's error while deciding to enter a barrier call.
  int failed=0;
  for(int r=0;r<p->rule_count&&!failed;r++)for(int pivot=0;pivot<p->rules[r].count&&!failed;pivot++){
   replay_join(p,s,ix,r,limit,(epoch==0&&r>=retained_rules)?0:delta,pivot,scratch,progress,prior_epochs+epoch+1);
   __syncthreads();failed=s->error;__syncthreads();
  }
  if(threadIdx.x==0){s->epochs=prior_epochs+epoch+1;publish_epoch(s,s->epochs);publish_detail(progress,s,s->epochs,EPOCH_END,-1,-1,-1,0,-1);stop=s->error||limit==s->fact_count;delta=limit;indexed=limit;}
  __syncthreads();const int finished=stop;__syncthreads();if(finished){if(threadIdx.x==0)publish_detail(progress,s,s->epochs,FINISHED,-1,-1,-1,0,-1);return;}
 }
 if(threadIdx.x==0){if(!s->error)s->error=5;publish_epoch(s,s->epochs);publish_detail(progress,s,s->epochs,FINISHED,-1,-1,-1,0,-1);}
}

void ck(cudaError_t x){if(x!=cudaSuccess)throw std::runtime_error(cudaGetErrorString(x));}
int main(int argc,char**argv){try{
 if(argc==2&&std::string(argv[1])=="--telemetry-layout"){
  std::cout<<"{\"image\":"<<sizeof(Image)<<",\"state\":"<<sizeof(State)<<",\"index\":"<<sizeof(Index)<<",\"replay\":"<<sizeof(ReplayScratch)<<",\"histogram_scratch\":"<<sizeof(HistogramScratch)<<",\"mapped_telemetry\":"<<sizeof(Telemetry)<<",\"stack_requested_per_thread\":8192}\n";return 0;
 }
 if(argc!=3&&argc!=5)throw std::runtime_error("image.bin output.bin [prior-readback.bin retained-rule-count] required; additive mode requires resume_guard.mjs");
 auto image_storage=std::make_unique<Image>();Image&p=*image_storage;std::ifstream in(argv[1],std::ios::binary);in.read(reinterpret_cast<char*>(&p),sizeof(p));
 if(!in||in.peek()!=EOF||p.magic!=0x33414c47||p.pattern_count<1||p.pattern_count>NP||p.seed_count<1||p.seed_count>NS||p.rule_count<1||p.rule_count>NR)throw std::runtime_error("image bounds");
 for(int i=0;i<p.pattern_count;i++){auto&t=p.patterns[i];if(t.arity<0||t.arity>8||t.symbol< -16)throw std::runtime_error("pattern bounds");for(int j=0;j<t.arity;j++)if(t.child[j]<0||t.child[j]>=i)throw std::runtime_error("pattern construction order");}
 for(int i=0;i<p.seed_count;i++)if(p.seed[i]<0||p.seed[i]>=p.pattern_count)throw std::runtime_error("seed bounds");
 for(int i=0;i<p.rule_count;i++){auto&r=p.rules[i];if(r.count<1||r.count>8||r.result<0||r.result>=p.pattern_count)throw std::runtime_error("rule bounds");for(int j=0;j<r.count;j++)if(r.antecedent[j]<0||r.antecedent[j]>=p.pattern_count)throw std::runtime_error("antecedent bounds");}
 Image*dp;State*ds;Index*ix;ReplayScratch*scratch;HistogramScratch*histogram;auto storage=std::make_unique<State>();State&s=*storage;int retained_rules=0;
 if(argc==5){
  retained_rules=std::stoi(argv[4]);if(retained_rules<1||retained_rules>p.rule_count)throw std::runtime_error("retained rule count");
  std::ifstream prior(argv[3],std::ios::binary);int header[4]{};prior.read(reinterpret_cast<char*>(header),sizeof(header));prior.read(reinterpret_cast<char*>(&s),sizeof(s));
  if(!prior||prior.peek()!=EOF||header[0]!=0x31524c47||header[1]!=1||header[2]!=NT||header[3]!=NF||s.error||s.term_count<1||s.term_count>NT||s.fact_count<1||s.fact_count>NF||s.epochs<1)throw std::runtime_error("checkpoint bounds");
  for(int i=0;i<s.term_count;i++){const Term&t=s.terms[i];if(t.symbol<0||t.arity<0||t.arity>8)throw std::runtime_error("checkpoint term");for(int j=0;j<t.arity;j++)if(t.child[j]<0||t.child[j]>=i)throw std::runtime_error("checkpoint term order");}
  for(int i=0;i<s.fact_count;i++){const Fact&f=s.facts[i];if(f.term<0||f.term>=s.term_count||f.rule< -1||f.rule>=retained_rules||f.rank<0||f.count<0||f.count>8||(f.rule==-1&&(f.rank!=0||f.count!=0)))throw std::runtime_error("checkpoint fact");for(int j=0;j<f.count;j++)if(f.support[j]<0||f.support[j]>=i)throw std::runtime_error("checkpoint support");}
 }
 ck(cudaSetDeviceFlags(cudaDeviceMapHost));
 cudaDeviceProp prop{};ck(cudaGetDeviceProperties(&prop,0));if(!prop.canMapHostMemory)throw std::runtime_error("mapped progress memory unavailable");
 Telemetry*host_telemetry=nullptr;Telemetry*device_telemetry=nullptr;
 WriteOnceLog progress_log(std::string(argv[2])+".progress.jsonl"),epoch_log(std::string(argv[2])+".epochs.jsonl");
 ck(cudaHostAlloc(reinterpret_cast<void**>(&host_telemetry),sizeof(Telemetry),cudaHostAllocMapped));
 std::memset(host_telemetry,0,sizeof(Telemetry));ck(cudaHostGetDevicePointer(reinterpret_cast<void**>(&device_telemetry),host_telemetry,0));
 volatile Progress*host_progress=&host_telemetry->latest;Progress*device_progress=&device_telemetry->latest;
 int drained_epochs=0;bool first_progress_dumped=false;size_t memory_before=0,memory_total=0,memory_after=0;ck(cudaMemGetInfo(&memory_before,&memory_total));
 cudaEvent_t complete;ck(cudaEventCreateWithFlags(&complete,cudaEventDisableTiming));
 ck(cudaDeviceSetLimit(cudaLimitStackSize,8192));ck(cudaMalloc(&dp,sizeof(p)));ck(cudaMalloc(&ds,sizeof(s)));ck(cudaMalloc(&ix,sizeof(Index)));ck(cudaMalloc(&scratch,sizeof(ReplayScratch)));ck(cudaMalloc(&histogram,sizeof(HistogramScratch)));ck(cudaMemcpy(dp,&p,sizeof(p),cudaMemcpyHostToDevice));ck(cudaMemcpy(ds,&s,sizeof(s),cudaMemcpyHostToDevice));
 ck(cudaMemGetInfo(&memory_after,&memory_total));size_t actual_stack=0;ck(cudaDeviceGetLimit(&actual_stack,cudaLimitStackSize));
 std::cerr<<"memory static_device_bytes="<<(sizeof(p)+sizeof(s)+sizeof(Index)+sizeof(ReplayScratch)+sizeof(HistogramScratch))<<" mapped_telemetry_bytes="<<sizeof(Telemetry)<<" stack_requested_per_thread=8192 stack_actual_per_thread="<<actual_stack<<" free_before_bytes="<<memory_before<<" free_after_bytes="<<memory_after<<" resident_stack_upper_estimate="<<(static_cast<unsigned long long>(prop.multiProcessorCount)*prop.maxThreadsPerMultiProcessor*actual_stack)<<"\n"<<std::flush;
 const auto started=std::chrono::steady_clock::now();auto reported=started;
 apply<<<1,REPLAY_LANES>>>(dp,ds,ix,retained_rules,device_progress,scratch,device_telemetry,histogram);ck(cudaGetLastError());ck(cudaEventRecord(complete));
 for(;;){
  const cudaError_t event=cudaEventQuery(complete);if(event==cudaSuccess)break;if(event!=cudaErrorNotReady)ck(event);
  drain_epochs(host_telemetry,drained_epochs,epoch_log);
  const auto now=std::chrono::steady_clock::now();
  drain_first_progress(host_telemetry,first_progress_dumped,progress_log,std::chrono::duration_cast<std::chrono::milliseconds>(now-started).count());
  if(now-reported>=std::chrono::seconds(1)){
   ProgressSample status{};const auto elapsed=std::chrono::duration_cast<std::chrono::seconds>(now-started).count();
   if(read_progress(host_progress,status)){progress_log.append(progress_json(status,std::chrono::duration_cast<std::chrono::milliseconds>(now-started).count()));std::cerr<<"progress elapsed_s="<<elapsed<<" sequence="<<status.sequence<<" epoch="<<status.epoch<<" facts="<<status.facts<<" terms="<<status.terms<<" error="<<status.error<<" phase="<<status.phase<<" rule="<<status.rule<<" pivot="<<status.pivot<<" chunk="<<status.chunk<<" candidates="<<status.candidates<<" serial_candidate="<<status.serial_candidate<<"\n"<<std::flush;}
   else std::cerr<<"progress elapsed_s="<<elapsed<<" publication=IN_PROGRESS\n"<<std::flush;
   reported=now;
  }
  std::this_thread::sleep_for(std::chrono::milliseconds(100));
 }
 ck(cudaDeviceSynchronize());drain_epochs(host_telemetry,drained_epochs,epoch_log);drain_first_progress(host_telemetry,first_progress_dumped,progress_log,std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-started).count());ProgressSample final_status{};if(read_progress(host_progress,final_status))progress_log.append(progress_json(final_status,std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-started).count()));ck(cudaMemcpy(&s,ds,sizeof(s),cudaMemcpyDeviceToHost));
 ck(cudaEventDestroy(complete));
 std::ofstream out(argv[2],std::ios::binary);int header[4]={0x31524c47,1,NT,NF};out.write(reinterpret_cast<const char*>(header),sizeof(header));out.write(reinterpret_cast<const char*>(&s),sizeof(s));if(!out)throw std::runtime_error("output custody");
 std::cout<<"gpu="<<prop.name<<" error="<<s.error<<" facts="<<s.fact_count<<" terms="<<s.term_count<<" epochs="<<s.epochs<<"\n";
 ck(cudaFree(ix));ck(cudaFree(scratch));ck(cudaFree(histogram));ck(cudaFree(ds));ck(cudaFree(dp));ck(cudaFreeHost(host_telemetry));return s.error?2:0;
 }catch(const std::exception&e){std::cerr<<e.what()<<"\n";return 1;}}






