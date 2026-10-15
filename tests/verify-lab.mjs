import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {replay,confirm,metrics,makeScenario} from '../emg/engine.mjs';
const reference=JSON.parse(readFileSync(new URL('./python-reference.json',import.meta.url)));
for(const c of reference){const output=replay(c.labels,c.family,c.activation,c.release,c.n);assert.deepEqual(output,c.expected);assert.deepEqual([[0,0],[1,100],[2,500]].map(([target,start])=>confirm(output,target,start,Math.min(start+1500,output.length*25))),c.confirmation);}
// Hand checks exercise timing, held duration, wrong-command coverage, and causal independence.
const s=makeScenario('bursts'),m=metrics(s,s.truth);assert.equal(m.onset,100);assert.equal(m.release,100);assert.equal(m.exposure,0);assert.equal(m.correct,100);assert.equal(m.coverage,100);
const raw=metrics(s,s.raw);assert.equal(raw.exposedMs,250);assert.ok(Math.abs(raw.exposure-100*250/3000)<1e-10);assert.equal(raw.onset,175);assert.equal(raw.release,200);
const earlyWrong=[...s.truth];earlyWrong.fill(2,50,60);assert.equal(metrics(s,earlyWrong).correct,100);
const wrong=s.truth.map(x=>x===1?2:0),w=metrics(s,wrong);assert.equal(w.onset,null);assert.equal(w.coverage,100);assert.equal(w.correct,0);assert.equal(w.wrong,100);
const rest=metrics(s,Array(200).fill(0));assert.equal(rest.onset,null);assert.equal(rest.coverage,0);assert.equal(rest.release,100);
for(const family of ['raw','symmetric','asymmetric','majority']){const r=replay(s.raw,family,3,4,5),mutated=[...s.raw];mutated.fill(2,100);assert.deepEqual(replay(mutated,family,3,4,5).slice(0,100),r.slice(0,100));}
for(const scenario of ['bursts','slow-release','wrong-command','chatter'])for(const f of ['raw','symmetric','asymmetric','majority']){const t=makeScenario(scenario),p=replay(t.raw,f,1,2,3);const m=metrics(t,p);assert.ok(m.correct<=m.coverage);assert.ok(Math.abs(m.correct+m.wrong-m.coverage)<1e-8);assert.ok(m.exposure>=0&&m.exposure<=100);}
console.log(`PASS: ${reference.length} Python controller and confirmation comparisons; hand-scored timing, causality, correctness and coverage checks.`);
