from pathlib import Path
import sys,json,numpy as np
if len(sys.argv)!=2: raise SystemExit('Usage: python3 tests/generate-python-reference.py /path/to/emg-command-filtering-benchmark')
sys.path.insert(0,str((Path(sys.argv[1])/'src').resolve()))
from controllers import Persistence,Majority,replay
from emg_pipeline import confirm_stable
rng=np.random.default_rng(20261015); cases=[]
for i in range(40):
 labels=rng.integers(0,3,200).tolist() if i<20 else sum(([int(x)]*int(rng.integers(1,15)) for x in rng.integers(0,3,30)),[])
 for family in ['raw','symmetric','asymmetric','majority']:
  a,r,n=[int(v) for v in rng.integers(1,11,3)]
  policy=Persistence(n,n,n) if family=='symmetric' else Persistence(a,r,a) if family=='asymmetric' else Majority(n) if family=='majority' else None
  expected=labels if policy is None else replay(policy,labels)
  ends=np.arange(len(labels))*25
  confirmation=[confirm_stable(ends,np.array(expected),target,ref,min(ref+1500,len(labels)*25),100,25) for target,ref in [(0,0),(1,100),(2,500)]]
  cases.append(dict(labels=labels,family=family,activation=a,release=r,n=n,expected=expected,confirmation=confirmation))
(Path(__file__).resolve().parent/'python-reference.json').write_text(json.dumps(cases,separators=(',',':'))+'\n')
