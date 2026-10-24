// Generic observational scratch only. No field here is an input to closure.
// Thread zero is the sole publisher. Immutable epoch records never wait on host.
constexpr int TELEMETRY_KEYS=1024, TELEMETRY_EPOCHS=8194, TELEMETRY_BUCKETS=2048;
enum TelemetryPhase { INITIALIZE=0, INDEX_SNAPSHOT=1, PIVOT_BEGIN=2, COUNT_PASS=3,
 EMIT_PASS=4, ORDERED_COMMIT=5, SERIAL_DEEP=6, SERIAL_OVERFLOW=7, EPOCH_END=8, FINISHED=9 };
struct alignas(16) Progress {unsigned sequence;int epoch,facts,terms,error,phase,rule,pivot,chunk,candidates,serial_candidate;};
struct PredicateKey {int root_symbol,arity,tag_symbol;};
struct EpochRecord {unsigned ready;int boundary_index,epoch,facts,terms,error,key_count,overflow_facts;int counts[TELEMETRY_KEYS];};
struct Telemetry {Progress latest,first_active;PredicateKey keys[TELEMETRY_KEYS];EpochRecord epochs[TELEMETRY_EPOCHS];};
struct HistogramScratch {int seen,key_count,overflow_facts,record_count;int head[TELEMETRY_BUCKETS],next[TELEMETRY_KEYS],counts[TELEMETRY_KEYS];};
static_assert(sizeof(unsigned)==4&&sizeof(int)==4&&alignof(Progress)>=16);
__device__ Telemetry* active_telemetry;
__device__ HistogramScratch* active_histogram;
__device__ void publish_detail(volatile Progress*status,const State*s,int epoch,int phase,int rule,int pivot,int chunk,int candidates,int serial_candidate){
 const unsigned prior=status->sequence;status->sequence=prior+1u;__threadfence_system();
 status->epoch=epoch;status->facts=s->fact_count;status->terms=s->term_count;status->error=s->error;
 status->phase=phase;status->rule=rule;status->pivot=pivot;status->chunk=chunk;
 status->candidates=candidates;status->serial_candidate=serial_candidate;
 __threadfence_system();status->sequence=prior+2u;__threadfence_system();
 // Preserve one in-flight sample even when a bounded run ends between polls.
 // It is marked historical in the host log, not reported as the current phase.
 volatile Progress*first=&active_telemetry->first_active;
 if(rule>=0&&first->sequence==0u){
  first->sequence=1u;__threadfence_system();
  first->epoch=epoch;first->facts=s->fact_count;first->terms=s->term_count;first->error=s->error;
  first->phase=phase;first->rule=rule;first->pivot=pivot;first->chunk=chunk;
  first->candidates=candidates;first->serial_candidate=serial_candidate;
  __threadfence_system();first->sequence=2u;__threadfence_system();
 }
}
__device__ void publish_progress(volatile Progress*status,const State*s,int epoch){
 publish_detail(status,s,epoch,INITIALIZE,-1,-1,-1,0,-1);
}
__device__ void initialize_histogram(Telemetry*t,HistogramScratch*h){
 active_telemetry=t;active_histogram=h;h->seen=0;h->key_count=0;h->overflow_facts=0;h->record_count=0;
 for(int i=0;i<TELEMETRY_BUCKETS;i++)h->head[i]=-1;
 for(int i=0;i<TELEMETRY_KEYS;i++){h->next[i]=-1;h->counts[i]=0;}
}
__device__ void publish_epoch(const State*s,int epoch){
 HistogramScratch*h=active_histogram;Telemetry*t=active_telemetry;
 // The caller holds the serial phase: no other lane mutates State.
 // Count only facts added since the prior boundary, not a repeated full scan.
 for(;h->seen<s->fact_count;h->seen++){
  const Term&f=s->terms[s->facts[h->seen].term];int tag=-1;
  if(f.arity&&s->terms[f.child[0]].arity==0)tag=s->terms[f.child[0]].symbol;
  unsigned hash=(static_cast<unsigned>(f.symbol)*73856093u^static_cast<unsigned>(f.arity)*19349663u^static_cast<unsigned>(tag)*83492791u)&(TELEMETRY_BUCKETS-1u);
  int key=h->head[hash];
  for(;key>=0;key=h->next[key]){const PredicateKey&k=t->keys[key];if(k.root_symbol==f.symbol&&k.arity==f.arity&&k.tag_symbol==tag)break;}
  if(key<0){
   if(h->key_count==TELEMETRY_KEYS){h->overflow_facts++;continue;}
   key=h->key_count++;t->keys[key]=PredicateKey{f.symbol,f.arity,tag};
   h->next[key]=h->head[hash];h->head[hash]=key;
  }
  h->counts[key]++;
 }
 // 1 initial +8192 completed epochs +1 terminal refusal fit without overwrite.
 // An observational overflow never changes State/error or admits anything.
 if(h->record_count>=TELEMETRY_EPOCHS)return;
 const int index=h->record_count++;volatile EpochRecord*e=&t->epochs[index];
 e->ready=1u;__threadfence_system();
 e->boundary_index=index;e->epoch=epoch;e->facts=s->fact_count;e->terms=s->term_count;e->error=s->error;
 e->key_count=h->key_count;e->overflow_facts=h->overflow_facts;
 for(int i=0;i<h->key_count;i++)e->counts[i]=h->counts[i];
 // Keys below key_count and this record never change after this publication.
 __threadfence_system();e->ready=2u;__threadfence_system();
}
struct ProgressSample {unsigned sequence;int epoch,facts,terms,error,phase,rule,pivot,chunk,candidates,serial_candidate;};
static bool read_progress(const volatile Progress*status,ProgressSample&out){
 for(int attempt=0;attempt<64;attempt++){
  const unsigned before=status->sequence;if(before&1u)continue;
  std::atomic_thread_fence(std::memory_order_seq_cst);
  const ProgressSample sample{before,status->epoch,status->facts,status->terms,status->error,status->phase,status->rule,status->pivot,status->chunk,status->candidates,status->serial_candidate};
  std::atomic_thread_fence(std::memory_order_seq_cst);
  const unsigned after=status->sequence;if(before==after&&!(after&1u)){out=sample;return true;}
 }
 return false;
}
class WriteOnceLog {
 std::FILE*file=nullptr;bool failed=false;
public:
 explicit WriteOnceLog(const std::string&name){
  int fd=-1;const int error=_sopen_s(&fd,name.c_str(),_O_WRONLY|_O_CREAT|_O_EXCL|_O_BINARY,_SH_DENYNO,_S_IREAD|_S_IWRITE);
  if(error||fd<0)throw std::runtime_error("telemetry output already present or unavailable: "+name);
  file=_fdopen(fd,"wb");if(!file){_close(fd);throw std::runtime_error("telemetry file handle");}
 }
 ~WriteOnceLog(){if(file)std::fclose(file);}
 void append(const std::string&line){
  if(failed)return;
  if(std::fwrite(line.data(),1,line.size(),file)!=line.size()||std::fflush(file)!=0){
   failed=true;std::cerr<<"telemetry_log_write_failed; closure continues without host acknowledgement\n"<<std::flush;
  }
 }
};
static std::string progress_json(const ProgressSample&s,long long elapsed,const char*sample="latest"){
 std::ostringstream o;o<<"{\"kind\":\"progress\",\"sample\":\""<<sample<<"\",\"elapsed_ms\":"<<elapsed<<",\"sequence\":"<<s.sequence<<",\"epoch\":"<<s.epoch<<",\"facts\":"<<s.facts<<",\"terms\":"<<s.terms<<",\"error\":"<<s.error<<",\"phase\":"<<s.phase<<",\"rule\":"<<s.rule<<",\"pivot\":"<<s.pivot<<",\"chunk\":"<<s.chunk<<",\"candidates\":"<<s.candidates<<",\"serial_candidate\":"<<s.serial_candidate<<"}\n";return o.str();
}
static void drain_first_progress(const volatile Telemetry*t,bool&done,WriteOnceLog&log,long long elapsed){
 if(done||t->first_active.sequence!=2u)return;ProgressSample sample{};
 if(read_progress(&t->first_active,sample)){log.append(progress_json(sample,elapsed,"first_active"));done=true;}
}
static void drain_epochs(const volatile Telemetry*t,int&next,WriteOnceLog&log){
 while(next<TELEMETRY_EPOCHS){
  const volatile EpochRecord&e=t->epochs[next];if(e.ready!=2u)return;
  std::atomic_thread_fence(std::memory_order_seq_cst);
  const int n=e.key_count;if(n<0||n>TELEMETRY_KEYS)throw std::runtime_error("telemetry key bound");
  std::ostringstream o;o<<"{\"kind\":\"epoch\",\"boundary_index\":"<<e.boundary_index<<",\"epoch\":"<<e.epoch<<",\"facts\":"<<e.facts<<",\"terms\":"<<e.terms<<",\"error\":"<<e.error<<",\"key_count\":"<<n<<",\"overflow_facts\":"<<e.overflow_facts<<",\"counts\":[";
  for(int i=0;i<n;i++){if(i)o<<',';const volatile PredicateKey&k=t->keys[i];o<<"{\"root_symbol\":"<<k.root_symbol<<",\"arity\":"<<k.arity<<",\"tag_symbol\":"<<k.tag_symbol<<",\"count\":"<<e.counts[i]<<'}';}
  o<<"]}\n";std::atomic_thread_fence(std::memory_order_seq_cst);
  if(e.ready!=2u)throw std::runtime_error("immutable telemetry publication changed");
  log.append(o.str());next++;
 }
}
