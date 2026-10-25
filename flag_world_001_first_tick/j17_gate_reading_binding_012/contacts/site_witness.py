#!/usr/bin/env python3
"""Site of the carrier from incidence alone; witnesses WHICH / HOW / WHERE.
Overlap kinds: pairs P_ct (δ-edge), P_dt (γ-edge), P_dc (τ-edge); singles F_d (domain fibre), F_c (corridor fibre), F_t (triad fibre).
Gluing verdict per overlap: SAME (all its flags enact one gate) or NOT_SAME (they differ).
WHICH: for every non-empty set S of kinds, witnesses that S's verdicts fail to fix the full verdict (two states, same on S, differ in full).
HOW: whether each fibre verdict is fixed by the pair verdicts inside it (fibre connectivity through its own pair kinds).
WHERE: count of NOT_SAME overlaps by kind on sampled states."""
exec(open('flag_rederive.py').read().split('# (1) carrier law')[0])
import random, json, hashlib, itertools
def canon(o):
  if isinstance(o,frozenset): return tuple(sorted(canon(x) for x in o))
  if isinstance(o,tuple): return tuple(canon(x) for x in o)
  return (o,)
from collections import Counter, defaultdict
THIS,NO='THIS','NO'
pairs={'P_ct':sorted({frozenset((f,dl(f))) for f in flags},key=canon),
       'P_dt':sorted({frozenset((f,gm(f))) for f in flags},key=canon),
       'P_dc':sorted({frozenset((f,ta(f))) for f in flags},key=canon)}
fib={'F_d':defaultdict(list),'F_c':defaultdict(list),'F_t':defaultdict(list)}
for f in flags: fib['F_d'][f[0]].append(f); fib['F_c'][f[1]].append(f); fib['F_t'][f[2]].append(f)
KINDS=['P_ct','P_dt','P_dc','F_d','F_c','F_t']
def verdicts(x):
  V={}
  for k in ('P_ct','P_dt','P_dc'): V[k]=tuple(len({x[f] for f in p})==1 for p in pairs[k])
  for k in ('F_d','F_c','F_t'): V[k]=tuple(len({x[f] for f in fib[k][key]})==1 for key in sorted(fib[k],key=canon))
  return V
random.seed(9090); states=[]
for trial in range(6000):
  mode=random.randrange(4)
  if mode==0: p=random.random(); x={f:(THIS if random.random()<p else NO) for f in flags}
  else:
    k=['F_d','F_c','F_t'][mode-1]; keys=sorted(fib[k],key=canon); val={kk:random.choice((THIS,NO)) for kk in keys}
    x={f:val[f[{'F_d':0,'F_c':1,'F_t':2}[k]]] for f in flags}
    for f in random.sample(flags,random.randrange(0,4)): x[f]={THIS:NO,NO:THIS}[x[f]]
  states.append(verdicts(x))
full=lambda V: tuple(V[k] for k in KINDS)
which={}
for r in range(1,7):
  for S in itertools.combinations(KINDS,r):
    seen={}; wit=0
    for V in states:
      key=tuple(V[k] for k in S); fv=full(V)
      if key in seen and seen[key]!=fv: wit+=1
      else: seen.setdefault(key,fv)
    which["+".join(S)]=wit
# HOW: fibre verdict fixed by internal pair verdicts
inner={'F_d':('P_dt','P_dc'),'F_c':('P_ct','P_dc'),'F_t':('P_ct','P_dt')}
how=Counter()
for trial in range(3000):
  p=random.random(); x={f:(THIS if random.random()<p else NO) for f in flags}
  for k,(a,b) in inner.items():
    for key,fs in fib[k].items():
      S=set(fs); internal=[e for kk in (a,b) for e in pairs[kk] if e<=S]
      same_fibre=len({x[f] for f in fs})==1; all_pairs=all(len({x[f] for f in e})==1 for e in internal)
      how[(k,"fixed_by_internal_pairs" if same_fibre==all_pairs else "NOT_fixed")]+=1
where=Counter()
for V in states[:1000]:
  for k in KINDS: where[k]+=sum(1 for v in V[k] if not v)
determining=[s for s,w in which.items() if w==0]
out={"WHICH_witnesses_of_information_loss_(0=no loss found)":which,
     "WHICH_sets_with_no_loss":determining,
     "HOW_fibre_verdict_from_internal_pairs":{str(k):v for k,v in sorted(how.items())},
     "WHERE_NOT_SAME_overlaps_by_kind_(1000_states)":dict(where),
     "sha256":hashlib.sha256(open(__file__,'rb').read()).hexdigest()}
json.dump(out,open("site_witness.json","w"),indent=1,sort_keys=True)
print(json.dumps({k:out[k] for k in ("WHICH_sets_with_no_loss","HOW_fibre_verdict_from_internal_pairs","WHERE_NOT_SAME_overlaps_by_kind_(1000_states)")},indent=1))
print("single-kind losses:",{k:which[k] for k in KINDS}); print("pairs-only:",which["P_ct+P_dt+P_dc"],"fibres-only:",which["F_d+F_c+F_t"])
