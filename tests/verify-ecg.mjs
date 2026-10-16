import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const data=JSON.parse(readFileSync(new URL('../assets/ecg-results.json',import.meta.url)));
const html=readFileSync(new URL('../ecg.html',import.meta.url),'utf8');
const code=readFileSync(new URL('../assets/ecg-explorer.js',import.meta.url),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
for(const match of code.matchAll(/\$\('([^']+)'\)/g)) assert(ids.has(match[1]),`Missing ECG DOM target ${match[1]}`);
for(const row of data.rows){assert.equal(row.N,data.cohort.records);assert.equal(row.retained,row.TP+row.FN+row.TN+row.FP);assert.equal(row.positive_retained,row.TP+row.FN);assert.ok(Math.abs(row.coverage-row.retained/row.N)<1e-12);assert.ok(Math.abs(row.positive_retention-row.positive_retained/data.cohort.af_records)<1e-12);assert.ok(Math.abs(row.selective_error-(row.FN+row.FP)/row.retained)<1e-12)}
// Exercise every selectable lookup and synthetic waveform through the actual rendering functions.
class Element {
 constructor(){this.value='';this.style={};this.dataset={};this.classList={toggle(){}};this.children=[];this.textContent='';this.innerHTML='';this.hidden=false;this.listeners={}}
 append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}setAttribute(k,v){this[k]=v}addEventListener(k,f){this.listeners[k]=f}
}
const elements=Object.fromEntries([...ids].map(id=>[id,new Element()]));
elements.condition.value="em_24";elements.method.value="combined";elements.coverage.value="1";
const document={getElementById:id=>{assert(elements[id],id);return elements[id]},createElement:()=>new Element()};
const context=vm.createContext({document,console,fetch:async()=>({ok:true,json:async()=>data})});
vm.runInContext(code,context);await new Promise(resolve=>setImmediate(resolve));
let count=0;
for(const condition of ['em_24','em_12','em_6','em_0','clean'])for(const method of ['combined','raw_confidence','confidence_adjusted','quality_only','quality_no_class'])for(const coverage of ['0','1','2']){
 elements.condition.value=condition;elements.method.value=method;elements.coverage.value=coverage;vm.runInContext('render()',context);assert.equal(elements.comparison.children.length,5);assert.ok(elements.wave.innerHTML.includes('polyline'));assert.ok(!elements.wave.innerHTML.includes('NaN'));assert.ok(elements['all-count'].textContent.includes('2,085'));count++;
}
elements.reset.listeners.click();assert.equal(elements.condition.value,'em_24');assert.equal(elements.method.value,'combined');assert.equal(elements.coverage.value,'1');
console.log(`PASS: ${data.rows.length} ECG source rows, ${count} rendered filter/condition/coverage combinations, waveform and reset.`);
