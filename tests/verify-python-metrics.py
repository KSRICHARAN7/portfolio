"""Optional cross-check against a local benchmark checkout with its dependencies installed."""
import sys,json,subprocess
from pathlib import Path
from types import SimpleNamespace as N
import numpy as np
if len(sys.argv)!=2:raise SystemExit('Usage: python3 tests/verify-python-metrics.py /path/to/benchmark')
benchmark=Path(sys.argv[1]).resolve();sys.path.insert(0,str(benchmark/'src'))
from evaluation import summarize_streams
root=Path(__file__).resolve().parents[1]
script="""import {makeScenario,replay,metrics} from './emg/engine.mjs';let cases=[];for(const name of ['bursts','slow-release','wrong-command','chatter'])for(const family of ['raw','symmetric','asymmetric','majority']){const scenario=makeScenario(name),pred=replay(scenario.raw,family,2,3,4);cases.push({scenario,pred,observed:metrics(scenario,pred)});}console.log(JSON.stringify(cases));"""
cases=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=root))
p=json.loads((benchmark/'config/protocol_v1.0.json').read_text());warm=p['common_warmup_exclusion_ms'];assert warm==250
for case in cases:
 s=case['scenario'];pred=np.array(case['pred']);truth=np.r_[np.zeros(warm,int),np.repeat(s['truth'],25)]
 recording=N(fs=1000,truth=truth);block=N(role='selection',start=0,end=5000+warm,index=0)
 event={'role':'selection','block':0,'eligible':True,'onset_sample':1000+warm,'offset_sample':3000+warm,'label':1,'following_rest_samples':2000,'repetition':1}
 m,e=summarize_streams(recording,[block],np.arange(200)*25+warm,np.zeros(200,int),pred,[event],p);v=case['observed']
 assert v['onset']==e[0]['stable_onset_delay_ms'];assert v['release']==e[0]['stable_offset_delay_ms']
 for a,b in [('exposure','rest_exposure'),('coverage','active_command_coverage'),('correct','interior_correct_fraction'),('wrong','interior_wrong_active_fraction')]:assert np.isclose(v[a],100*m[b]),(a,v[a],m[b])
print('PASS: 16 scenario/controller metric sets match the Python raw-time scorer, with an excluded 250 ms silent prefix.')
