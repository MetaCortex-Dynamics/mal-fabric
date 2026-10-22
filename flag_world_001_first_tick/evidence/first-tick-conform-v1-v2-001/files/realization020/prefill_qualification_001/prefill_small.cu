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
constexpr int NP=65536, NS=2048, NR=1024, NT=32768, NF=16384;
constexpr int PAIR_BUCKETS=1048576, PAIR_SLOTS=28;
// Extra scratch: 232 MiB; no term/fact/pattern capacity or serialized layout change.
static_assert((2ull*PAIR_BUCKETS+1ull*NF*PAIR_SLOTS)*sizeof(int)==10223616ull);
struct Term {int symbol,arity,child[8];};
struct Rule {int count,result,antecedent[8];};
struct Image {int magic,pattern_count,seed_count,rule_count;Term patterns[NP];int seed[NS];Rule rules[NR];};
struct Fact {int term,rule,rank,count,support[8];};
struct State {int error,term_count,fact_count,epochs;Term terms[NT];Fact facts[NF];};
// One GPU writer; host only reads stable even sequence publications. Scalar
// status is observational scratch, never an input to closure or serialized.
struct alignas(16) Progress {unsigned sequence;int epoch,facts,terms,error;};
static_assert(sizeof(unsigned)==4 && sizeof(int)==4 && alignof(Progress)>=16);
__device__ void publish_progress(volatile Progress*status,const State*s,int epoch){
 const unsigned prior=status->sequence;status->sequence=prior+1u;
 __threadfence_system();
 status->epoch=epoch;status->facts=s->fact_count;status->terms=s->term_count;status->error=s->error;
 __threadfence_system();status->sequence=prior+2u;__threadfence_system();
}
struct ProgressSample {unsigned sequence;int epoch,facts,terms,error;};
static bool read_progress(const volatile Progress*status,ProgressSample&out){
 for(int attempt=0;attempt<64;attempt++){
  const unsigned before=status->sequence;if(before&1u)continue;
  std::atomic_thread_fence(std::memory_order_seq_cst);
  const ProgressSample sample{before,status->epoch,status->facts,status->terms,status->error};
  std::atomic_thread_fence(std::memory_order_seq_cst);
  const unsigned after=status->sequence;
  if(before==after&&!(after&1u)){out=sample;return true;}
 }
 return false;
}
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
__global__ void apply(const Image*p,State*s,Index*ix,int retained_rules,volatile Progress*progress){
 if(blockIdx.x||threadIdx.x)return;
 publish_progress(progress,s,s->epochs);
 active_index=ix;for(int i=0;i<32768;i++)ix->term_head[i]=-1;for(int i=0;i<NT;i++)ix->fact_for_term[i]=-1;
 const int retained_facts=s->fact_count,prior_epochs=s->epochs;
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
 int delta=retained_facts,indexed=0;
 for(int i=0;i<4096;i++)ix->head[i]=-1;
 for(int i=0;i<65536;i++){ix->argument_head[i]=-1;ix->argument_count[i]=0;}
 for(int i=0;i<PAIR_BUCKETS;i++){ix->pair_head[i]=-1;ix->pair_count[i]=0;}
 for(int epoch=0;epoch<8192&&!s->error;epoch++){int limit=s->fact_count;
  publish_progress(progress,s,prior_epochs+epoch+1);
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
  // New rules must see the entire retained snapshot once; old rules need only
  // the new seed delta, because the guarded checkpoint is their closed result.
  for(int r=0;r<p->rule_count&&!s->error;r++)for(int pivot=0;pivot<p->rules[r].count&&!s->error;pivot++)join(p,s,ix,r,0,limit,(epoch==0&&r>=retained_rules)?0:delta,pivot,b,support);
  s->epochs=prior_epochs+epoch+1;publish_progress(progress,s,s->epochs);if(limit==s->fact_count)return;delta=limit;indexed=limit;}
 if(!s->error)s->error=5;
 publish_progress(progress,s,s->epochs);
}
void ck(cudaError_t x){if(x!=cudaSuccess)throw std::runtime_error(cudaGetErrorString(x));}
int main(int argc,char**argv){try{
 if(argc!=3&&argc!=5)throw std::runtime_error("image.bin output.bin [prior-readback.bin retained-rule-count] required; additive mode requires resume_guard.mjs");
 auto image_storage=std::make_unique<Image>();Image&p=*image_storage;std::ifstream in(argv[1],std::ios::binary);in.read(reinterpret_cast<char*>(&p),sizeof(p));
 if(!in||in.peek()!=EOF||p.magic!=0x33414c47||p.pattern_count<1||p.pattern_count>NP||p.seed_count<1||p.seed_count>NS||p.rule_count<1||p.rule_count>NR)throw std::runtime_error("image bounds");
 for(int i=0;i<p.pattern_count;i++){auto&t=p.patterns[i];if(t.arity<0||t.arity>8||t.symbol< -16)throw std::runtime_error("pattern bounds");for(int j=0;j<t.arity;j++)if(t.child[j]<0||t.child[j]>=i)throw std::runtime_error("pattern construction order");}
 for(int i=0;i<p.seed_count;i++)if(p.seed[i]<0||p.seed[i]>=p.pattern_count)throw std::runtime_error("seed bounds");
 for(int i=0;i<p.rule_count;i++){auto&r=p.rules[i];if(r.count<1||r.count>8||r.result<0||r.result>=p.pattern_count)throw std::runtime_error("rule bounds");for(int j=0;j<r.count;j++)if(r.antecedent[j]<0||r.antecedent[j]>=p.pattern_count)throw std::runtime_error("antecedent bounds");}
 Image*dp;State*ds;Index*ix;auto storage=std::make_unique<State>();State&s=*storage;int retained_rules=0;
 if(argc==5){
  retained_rules=std::stoi(argv[4]);if(retained_rules<1||retained_rules>p.rule_count)throw std::runtime_error("retained rule count");
  std::ifstream prior(argv[3],std::ios::binary);int header[4]{};prior.read(reinterpret_cast<char*>(header),sizeof(header));prior.read(reinterpret_cast<char*>(&s),sizeof(s));
  if(!prior||prior.peek()!=EOF||header[0]!=0x31524c47||header[1]!=1||header[2]!=NT||header[3]!=NF||s.error||s.term_count<1||s.term_count>NT||s.fact_count<1||s.fact_count>NF||s.epochs<1)throw std::runtime_error("checkpoint bounds");
  for(int i=0;i<s.term_count;i++){const Term&t=s.terms[i];if(t.symbol<0||t.arity<0||t.arity>8)throw std::runtime_error("checkpoint term");for(int j=0;j<t.arity;j++)if(t.child[j]<0||t.child[j]>=i)throw std::runtime_error("checkpoint term order");}
  for(int i=0;i<s.fact_count;i++){const Fact&f=s.facts[i];if(f.term<0||f.term>=s.term_count||f.rule< -1||f.rule>=retained_rules||f.rank<0||f.count<0||f.count>8||(f.rule==-1&&(f.rank!=0||f.count!=0)))throw std::runtime_error("checkpoint fact");for(int j=0;j<f.count;j++)if(f.support[j]<0||f.support[j]>=i)throw std::runtime_error("checkpoint support");}
 }
 ck(cudaSetDeviceFlags(cudaDeviceMapHost));
 cudaDeviceProp prop{};ck(cudaGetDeviceProperties(&prop,0));if(!prop.canMapHostMemory)throw std::runtime_error("mapped progress memory unavailable");
 Progress*host_progress=nullptr;Progress*device_progress=nullptr;
 ck(cudaHostAlloc(reinterpret_cast<void**>(&host_progress),sizeof(Progress),cudaHostAllocMapped));
 *host_progress=Progress{};ck(cudaHostGetDevicePointer(reinterpret_cast<void**>(&device_progress),host_progress,0));
 cudaEvent_t complete;ck(cudaEventCreateWithFlags(&complete,cudaEventDisableTiming));
 ck(cudaDeviceSetLimit(cudaLimitStackSize,8192));ck(cudaMalloc(&dp,sizeof(p)));ck(cudaMalloc(&ds,sizeof(s)));ck(cudaMalloc(&ix,sizeof(Index)));ck(cudaMemcpy(dp,&p,sizeof(p),cudaMemcpyHostToDevice));ck(cudaMemcpy(ds,&s,sizeof(s),cudaMemcpyHostToDevice));
 const auto started=std::chrono::steady_clock::now();auto reported=started;
 apply<<<1,1>>>(dp,ds,ix,retained_rules,device_progress);ck(cudaGetLastError());ck(cudaEventRecord(complete));
 for(;;){
  const cudaError_t event=cudaEventQuery(complete);if(event==cudaSuccess)break;if(event!=cudaErrorNotReady)ck(event);
  const auto now=std::chrono::steady_clock::now();
  if(now-reported>=std::chrono::seconds(10)){
   ProgressSample status{};const auto elapsed=std::chrono::duration_cast<std::chrono::seconds>(now-started).count();
   if(read_progress(host_progress,status))std::cerr<<"progress elapsed_s="<<elapsed<<" sequence="<<status.sequence<<" epoch="<<status.epoch<<" facts="<<status.facts<<" terms="<<status.terms<<" error="<<status.error<<"\n"<<std::flush;
   else std::cerr<<"progress elapsed_s="<<elapsed<<" publication=IN_PROGRESS\n"<<std::flush;
   reported=now;
  }
  std::this_thread::sleep_for(std::chrono::milliseconds(100));
 }
 ck(cudaDeviceSynchronize());ck(cudaMemcpy(&s,ds,sizeof(s),cudaMemcpyDeviceToHost));
 ck(cudaEventDestroy(complete));
 std::ofstream out(argv[2],std::ios::binary);int header[4]={0x31524c47,1,NT,NF};out.write(reinterpret_cast<const char*>(header),sizeof(header));out.write(reinterpret_cast<const char*>(&s),sizeof(s));if(!out)throw std::runtime_error("output custody");
 std::cout<<"gpu="<<prop.name<<" error="<<s.error<<" facts="<<s.fact_count<<" terms="<<s.term_count<<" epochs="<<s.epochs<<"\n";
 ck(cudaFree(ix));ck(cudaFree(ds));ck(cudaFree(dp));ck(cudaFreeHost(host_progress));return s.error?2:0;
 }catch(const std::exception&e){std::cerr<<e.what()<<"\n";return 1;}}




