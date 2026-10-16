import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url),m=require('../assets/oai/model.js');
assert.equal(m.cases.length,105);assert.equal(new Set(m.cases.map(c=>c.id)).size,105);
for(const p of m.policies){
 let deferred=0;
 for(const c of m.cases){const r=m.policy(c.grade,c.pain,p);if(r.deferred.has(c.id))deferred++;assert.equal(r.count,Math.ceil(105*p/100));assert(c.prediction>=0&&c.prediction<=20);assert.equal(c.discordance,Math.abs(c.pain-c.expected));}
 assert.equal(deferred,Math.ceil(105*p/100));
}
assert(!m.policy(2,4,20).deferred.has(46));assert(m.policy(0,20,10).deferred.has(20));
assert.equal(m.example(1,14).discordance,12);assert.equal(m.example(4,1).discordance,7);
assert.throws(()=>m.example(5,4),RangeError);
const rows=JSON.parse(readFileSync(new URL('../assets/oai/study-data.json',import.meta.url))).rows;
for(let i=0;i<rows.length;i++){assert.equal(m.study[i].targeted,Number(rows[i].targeted_mae));assert.equal(m.study[i].random,Number(rows[i].random_abstention_mean_mae));assert.equal(m.study[i].n,Number(rows[i].retained_n));assert.equal(m.study[i].lo,Number(rows[i].random_abstention_ci_2_5));assert.equal(m.study[i].hi,Number(rows[i].random_abstention_ci_97_5));}
const html=readFileSync(new URL('../oai-lab.html',import.meta.url),'utf8'),app=readFileSync(new URL('../assets/oai/app.js',import.meta.url),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
for(const match of app.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(match[1]),'Missing DOM id: '+match[1]);
assert(!/fetch\(|localStorage|XMLHttpRequest|sendBeacon/.test(app));
console.log('PASS: all 105 synthetic cases, five policies, edge cases, study values, DOM targets, and no data collection.');
