import assert from 'node:assert/strict';
import {getGuide} from '../emg/guides.mjs';
const expected={start:[[1,0,0],[1,1,0],[1,1,1],[1,1,1]],stop:[[0,1,1],[0,0,1],[0,0,1],[0,0,0]],wrong:[[1,2,2],[1,2,2],[1,1,1],[1,1,1]]};
for(const key of Object.keys(expected)){
 const g=getGuide(key);assert.equal(g.steps.length,4);
 g.steps.forEach((s,j)=>{assert.equal(s.time%25,0);const i=s.time/25;assert.deepEqual([g.scenario.truth[i],g.scenario.raw[i],g.filtered[i]],expected[key][j],`${key} step ${j+1}`);assert.ok(s.body.length>80);assert.ok(['onset','release','exposure','coverage','correct','wrong'].includes(s.focus));});
}
const a=getGuide('start');assert.ok(a.metrics.exposure<a.rawMetrics.exposure);assert.equal(a.metrics.onset,300);assert.equal(a.metrics.onsetMet,false);
const b=getGuide('stop');assert.equal(b.metrics.exposedMs-b.rawMetrics.exposedMs,175);assert.equal(b.metrics.release,475);assert.equal(b.rawMetrics.release,350);
const c=getGuide('wrong');assert.equal(c.metrics.coverage.toFixed(1),'98.3');assert.equal(c.metrics.correct.toFixed(1),'81.7');assert.equal(c.metrics.wrong.toFixed(1),'16.7');assert.equal(c.metrics.onset,850);
assert.throws(()=>getGuide('unknown'));
console.log('PASS: all 12 guide moments and numerical takeaways match the causal replay.');
