# Independent indexed reference for carrier 012 (authoring support / independent witness; not a runtime).
# Builds flags, overlaps and per-junction incidence from the motif table alone, then computes
# genesis-at-J17, d_G per junction, and overlap agreement. Pure index lookups; no serial matching.
import re,sys,itertools,collections,json,hashlib
h=open(sys.argv[1]).read(); b=h[h.index('mc_motif_junction_table[15][7]'):]
rows=[tuple(map(int,m)) for m in re.findall(r'\{(\d+), (\d+), (\d+), (\d+), (\d+)\}',b)][:105]
J={r[0]:frozenset(r[3:]) for r in rows}; jof={e:j for j,e in J.items()}
adj=collections.defaultdict(set)
for e in J.values(): a,c=tuple(e); adj[a].add(c); adj[c].add(a)
faces=[f for f in itertools.combinations(range(12),3) if all(y in adj[x] for x,y in itertools.combinations(f,2))]
# triads: CCC = 3 junctions of a face; CCD = domain + two corridors adjacent around that domain (share the domain and a face)
CCC=[tuple(sorted(jof[frozenset(p)] for p in itertools.combinations(f,2))) for f in faces]
CCD=[]
for d in range(12):
    js=[j for j in J if d in J[j]]
    for j1,j2 in itertools.combinations(js,2):
        # adjacent around the pentagon iff they share a face: the other domains of j1,j2 are adjacent
        o1=next(iter(J[j1]-{d})); o2=next(iter(J[j2]-{d}))
        if o2 in adj[o1]: CCD.append(('D',d,min(j1,j2),max(j1,j2)))
triads=[('CCC',)+t for t in CCC]+[('CCD',)+t[1:] for t in CCD]
def verts(t): return [('J',x) for x in t[1:]] if t[0]=='CCC' else [('D',t[1]),('J',t[2]),('J',t[3])]
flags=[]
for t in triads:
    V=verts(t)
    for v in V:
        for e in itertools.combinations(V,2):
            if v in e: flags.append((v,tuple(sorted(e)),t))
flags.sort(key=repr)
assert len(triads)==80 and len(CCC)==20 and len(CCD)==60 and len(flags)==480
# overlaps: flag pairs differing in exactly one coordinate (vertex | edge | triad) with the other two equal
idx=collections.defaultdict(list)
for i,(v,e,t) in enumerate(flags):
    idx[('ve',v,e)].append(i); idx[('vt',v,t)].append(i); idx[('et',e,t)].append(i)
overlaps=set()
for key,lst in idx.items():
    for a,c in itertools.combinations(lst,2): overlaps.add((min(a,c),max(a,c)))
assert len(overlaps)==720, len(overlaps)
# incidence index: junction -> flags whose vertex, edge or triad contains it
inc=collections.defaultdict(set)
for i,(v,e,t) in enumerate(flags):
    for x in {v}|set(e)|set(verts(t)):
        if x[0]=='J': inc[x[1]].add(i)
site=collections.defaultdict(set)
for i,(v,e,t) in enumerate(flags):
    if v[0]=='J': site[v[1]].add(i)
def dG(field,pred,j): return sum(1 for i in inc[j] if field[i]!=pred[i])
ground=['NO']*480
g1=list(ground)
for i in site[17]: g1[i]='THIS'
print('site flags J17:',len(site[17]))
for f in faces:
    js=sorted(jof[frozenset(p)] for p in itertools.combinations(f,2))
    if 17 in js: print('face',f,{j:dG(g1,ground,j) for j in js})
same=sum(1 for a,c in overlaps if g1[a]==g1[c]); print('overlaps SAME',same,'walls',720-same)
out={'triads':[list(map(str,t)) for t in triads],'flags':[[str(v),str(e),str(t)] for v,e,t in flags],
     'overlaps':sorted(overlaps),'incidence':{str(j):sorted(inc[j]) for j in sorted(inc)},'site':{str(j):sorted(site[j]) for j in sorted(site)}}
blob=json.dumps(out,sort_keys=True,separators=(',',':')).encode(); open('ref012_index.json','wb').write(blob)
print('index sha256',hashlib.sha256(blob).hexdigest().upper(),len(blob))
