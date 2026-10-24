// Generic source-law application substrate. No application names, outcomes,
// incidence, world transitions, or expected vector constants occur here.
// Reads immutable antecedent snapshots. Each consequent records rule and support.
#include <cuda_runtime.h>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <cstdint>
#include <memory>
constexpr int NP=16384, NS=512, NR=512, NT=262144, NF=131072;
struct Term {int symbol,arity,child[8];};
struct Rule {int count,result,antecedent[8];};
struct Image {int magic,pattern_count,seed_count,rule_count;Term patterns[NP];int seed[NS];Rule rules[NR];};
struct Fact {int term,rule,rank,count,support[8];};
struct State {int error,term_count,fact_count,epochs;Term terms[NT];Fact facts[NF];};
struct Index {int head[4096],next[NF],term_head[32768],term_next[NT],fact_for_term[NT];int argument_head[65536],argument_count[65536],argument_next[NF*8];int ground_pattern[NP];};
// One serial invocation owns this scratch index; no application-specific keys.
__device__ Index* active_index;
__device__ int bucket(int root,int arity,int first){return static_cast<unsigned>((root*73856093u)^(arity*19349663u)^(first*83492791u))&4095u;}
__device__ int argument_bucket(int root,int arity,int position,int term){return static_cast<unsigned>(root*73856093u^arity*19349663u^position*83492791u^term*2654435761u)&65535u;}
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
 if(ai==r.count){int rank=0;for(int i=0;i<r.count;i++){int x=s->facts[support[i]].rank+1;if(x>rank)rank=x;}
  int t=instantiate(p,s,r.result,bindings,0);add_fact(s,t,ri,rank,r.count,support);return;}
 // Every newly enabled positive application has at least one antecedent in the
 // last snapshot's delta. Select it first; retain original support positions.
 const int slot=ai==0?pivot:(ai<=pivot?ai-1:ai);
 if(ai==0){for(int i=delta;i<limit&&!s->error;i++){int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];if(match(p,s,r.antecedent[slot],s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}}return;}
 const Term&pattern=p->patterns[r.antecedent[slot]];int first=0,indexed=pattern.symbol>=0;
 if(pattern.arity){int sym=p->patterns[pattern.child[0]].symbol;if(sym>=0)first=sym;else if(bindings[-sym-1]>=0)first=s->terms[bindings[-sym-1]].symbol;else indexed=0;}
 int position=-1,selected_bucket=0,best=limit+1;
 if(pattern.symbol>=0)for(int j=0;j<pattern.arity;j++){int value=ground(p,s,pattern.child[j],bindings,0);if(value<0)continue;int h=argument_bucket(pattern.symbol,pattern.arity,j,value);if(ix->argument_count[h]<best){best=ix->argument_count[h];position=j;selected_bucket=h;}}
 if(position>=0){for(int entry=ix->argument_head[selected_bucket];entry>=0&&!s->error;entry=ix->argument_next[entry]){int i=entry/8;if(entry%8!=position)continue;int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];if(match(p,s,r.antecedent[slot],s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}}return;}
 for(int i=indexed?ix->head[bucket(pattern.symbol,pattern.arity,first)]:0;i>=0&&i<limit&&!s->error;i=indexed?ix->next[i]:i+1){int b[16];for(int j=0;j<16;j++)b[j]=bindings[j];
  if(match(p,s,r.antecedent[slot],s->facts[i].term,b,0)){support[slot]=i;join(p,s,ix,ri,ai+1,limit,delta,pivot,b,support);}}
}
__global__ void apply(const Image*p,State*s,Index*ix){
 if(blockIdx.x||threadIdx.x)return;
 active_index=ix;for(int i=0;i<32768;i++)ix->term_head[i]=-1;for(int i=0;i<NT;i++)ix->fact_for_term[i]=-1;
 // Image validation establishes preceding child indices. Seat closed terms in
 // that order, without recursive descent through potentially long input lists.
 // This constructs terms only: no extra fact or application is admitted.
 for(int i=0;i<p->pattern_count;i++){ix->ground_pattern[i]=-1;const Term&t=p->patterns[i];if(t.symbol<0)continue;Term q{};q.symbol=t.symbol;q.arity=t.arity;int j=0;for(;j<t.arity;j++){q.child[j]=ix->ground_pattern[t.child[j]];if(q.child[j]<0)break;}if(j==t.arity)ix->ground_pattern[i]=intern(s,q);if(s->error)return;}
 int b[16],support[8];for(int j=0;j<16;j++)b[j]=-1;
 for(int i=0;i<p->seed_count&&!s->error;i++)add_fact(s,instantiate(p,s,p->seed[i],b,0),-1,0,0,support);
 int delta=0;
 for(int i=0;i<4096;i++)ix->head[i]=-1;
 for(int i=0;i<65536;i++){ix->argument_head[i]=-1;ix->argument_count[i]=0;}
 for(int epoch=0;epoch<2048&&!s->error;epoch++){int limit=s->fact_count;
  // Index only the new immutable snapshot members. Consequences appended below
  // do not enter the index until the next epoch.
  for(int i=limit-1;i>=delta;i--){const Term&t=s->terms[s->facts[i].term];int h=bucket(t.symbol,t.arity,t.arity?s->terms[t.child[0]].symbol:0);ix->next[i]=ix->head[h];ix->head[h]=i;}
  for(int i=limit-1;i>=delta;i--){const Term&t=s->terms[s->facts[i].term];for(int j=0;j<t.arity;j++){int h=argument_bucket(t.symbol,t.arity,j,t.child[j]);ix->argument_next[i*8+j]=ix->argument_head[h];ix->argument_head[h]=i*8+j;ix->argument_count[h]++;}}
  for(int r=0;r<p->rule_count&&!s->error;r++)for(int pivot=0;pivot<p->rules[r].count&&!s->error;pivot++)join(p,s,ix,r,0,limit,delta,pivot,b,support);
  s->epochs=epoch+1;if(limit==s->fact_count)return;delta=limit;}
 if(!s->error)s->error=5;
}
void ck(cudaError_t x){if(x!=cudaSuccess)throw std::runtime_error(cudaGetErrorString(x));}
int main(int argc,char**argv){try{
 if(argc!=3)throw std::runtime_error("image.bin output.bin required");
 Image p{};std::ifstream in(argv[1],std::ios::binary);in.read(reinterpret_cast<char*>(&p),sizeof(p));
 if(!in||in.peek()!=EOF||p.magic!=0x33414c47||p.pattern_count<1||p.pattern_count>NP||p.seed_count<1||p.seed_count>NS||p.rule_count<1||p.rule_count>NR)throw std::runtime_error("image bounds");
 for(int i=0;i<p.pattern_count;i++){auto&t=p.patterns[i];if(t.arity<0||t.arity>8||t.symbol< -16)throw std::runtime_error("pattern bounds");for(int j=0;j<t.arity;j++)if(t.child[j]<0||t.child[j]>=i)throw std::runtime_error("pattern construction order");}
 for(int i=0;i<p.seed_count;i++)if(p.seed[i]<0||p.seed[i]>=p.pattern_count)throw std::runtime_error("seed bounds");
 for(int i=0;i<p.rule_count;i++){auto&r=p.rules[i];if(r.count<1||r.count>8||r.result<0||r.result>=p.pattern_count)throw std::runtime_error("rule bounds");for(int j=0;j<r.count;j++)if(r.antecedent[j]<0||r.antecedent[j]>=p.pattern_count)throw std::runtime_error("antecedent bounds");}
 Image*dp;State*ds;Index*ix;auto storage=std::make_unique<State>();State&s=*storage;ck(cudaDeviceSetLimit(cudaLimitStackSize,65536));ck(cudaMalloc(&dp,sizeof(p)));ck(cudaMalloc(&ds,sizeof(s)));ck(cudaMalloc(&ix,sizeof(Index)));ck(cudaMemcpy(dp,&p,sizeof(p),cudaMemcpyHostToDevice));ck(cudaMemset(ds,0,sizeof(s)));
 cudaDeviceProp prop{};ck(cudaGetDeviceProperties(&prop,0));apply<<<1,1>>>(dp,ds,ix);ck(cudaGetLastError());ck(cudaDeviceSynchronize());ck(cudaMemcpy(&s,ds,sizeof(s),cudaMemcpyDeviceToHost));
 std::ofstream out(argv[2],std::ios::binary);int header[4]={0x31524c47,1,NT,NF};out.write(reinterpret_cast<const char*>(header),sizeof(header));out.write(reinterpret_cast<const char*>(&s),sizeof(s));if(!out)throw std::runtime_error("output custody");
 std::cout<<"gpu="<<prop.name<<" error="<<s.error<<" facts="<<s.fact_count<<" terms="<<s.term_count<<" epochs="<<s.epochs<<"\n";
 ck(cudaFree(ix));ck(cudaFree(ds));ck(cudaFree(dp));return s.error?2:0;
 }catch(const std::exception&e){std::cerr<<e.what()<<"\n";return 1;}}
