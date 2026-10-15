import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {HAND_EXAMPLES,handState,renderHandScene,momentDescription} from '../emg/hand.mjs';
import {makeScenario,replay,HOP} from '../emg/engine.mjs';
// The selected instants must demonstrate the stated failure, not just show a matching caption.
const expected={start:[1,1,0],stop:[0,0,1],wrong:[1,2,2]};
for(const [key,p]of Object.entries(HAND_EXAMPLES)){
 const s=makeScenario(p.scenario),f=replay(s.raw,p.family,p.activation,p.release,p.n),i=p.time/HOP;
 const values=[s.truth[i],s.raw[i],f[i]];assert.deepEqual(values,expected[key],key);
 const html=renderHandScene(...values);assert.equal((html.match(/<svg /g)||[]).length,3);
 assert.ok(html.includes(`data-stream="filtered" data-command="${f[i]}"`));
 assert.ok(!handState(s.truth[i],f[i]).matches);assert.ok(momentDescription(...values).length>30);
}
assert.equal(handState(0,1).status,'Active during rest');assert.equal(handState(1,0).status,'Inactive during movement');assert.equal(handState(1,2).status,'Wrong movement');assert.equal(handState(1,1).status,'Matches annotation');
assert.throws(()=>handState(1,3));
// A small DOM adapter checks the actual lab event wiring without claiming browser/layout QA.
const html=readFileSync(new URL('../emg-lab.html',import.meta.url),'utf8');
class Element{
 constructor(id){this.id=id;this.value='';this.dataset={};this.handlers={};this.hidden=false;this.attributes={};this.innerHTML='';this.textContent='';}
 addEventListener(type,fn){this.handlers[type]=fn;}
 setAttribute(k,v){this.attributes[k]=v;}
 async click(){return this.handlers.click?.({target:this});}
}
const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element(m[1])]));
for(const [id,value]of Object.entries({scenario:'bursts',family:'asymmetric',activation:'1',release:'2',n:'3',time:'0',comparison:'db5'}))elements.get(id).value=value;
const guides=Object.keys(HAND_EXAMPLES).map(key=>{const e=new Element('guide-'+key);e.dataset.guide=key;return e;});
const buttons=Object.keys(HAND_EXAMPLES).map(key=>{const e=new Element('moment-'+key);e.dataset.handExample=key;return e;});
globalThis.document={querySelector:selector=>elements.get(selector.slice(1))||null,querySelectorAll:selector=>selector==='[data-hand-example]'?buttons:selector==='[data-guide]'?guides:[],addEventListener(){},hidden:false};
let frame;
globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>{frame=null;};
await import('../emg/lab.mjs');
for(const button of buttons){await button.click();const p=HAND_EXAMPLES[button.dataset.handExample];assert.equal(+elements.get('time').value,p.time);assert.equal(elements.get('scenario').value,p.scenario);assert.equal(elements.get('hand-scene').dataset.poseKey,expected[button.dataset.handExample].join(','));assert.equal(elements.get('hand-time').textContent,p.time+' ms');assert.ok(elements.get('hand-scene').innerHTML.includes('hand-mismatch'));}
// Scrubbing and playback use the same clock as the timeline and hand poses.
elements.get('time').handlers.input({target:{value:'0'}});assert.equal(elements.get('hand-scene').dataset.poseKey,'0,0,0');
await elements.get('play').click();assert.equal(elements.get('play').textContent,'Pause');frame(1000);frame(1100);assert.equal(elements.get('hand-time').textContent,'100 ms');
await elements.get('restart').click();assert.equal(elements.get('hand-time').textContent,'0 ms');assert.equal(elements.get('play').textContent,'Play replay');
// Guided navigation loads real filter parameters, stays within bounds, and exits on manual edits.
for(const button of guides){
 await button.click();assert.equal(elements.get('guide-panel').hidden,false);assert.equal(elements.get('guide-counter').textContent,'Step 1 of 4 · Synthetic example');assert.equal(elements.get('guide-prev').disabled,true);
 await elements.get('guide-prev').click();assert.ok(elements.get('guide-counter').textContent.startsWith('Step 1'));
 for(let j=1;j<4;j++)await elements.get('guide-next').click();
 assert.equal(elements.get('guide-counter').textContent,'Step 4 of 4 · Synthetic example');assert.equal(elements.get('guide-next').disabled,true);assert.equal(elements.get('guide-lesson').hidden,false);assert.ok(elements.get('guide-lesson').textContent.startsWith('Takeaway:'));
 await elements.get('guide-next').click();assert.ok(elements.get('guide-counter').textContent.startsWith('Step 4'));
 await elements.get('guide-step-1').click();assert.ok(elements.get('guide-counter').textContent.startsWith('Step 2'));assert.equal(elements.get('guide-lesson').hidden,true);
 await elements.get('guide-close').click();assert.equal(elements.get('guide-panel').hidden,true);assert.equal(elements.get('metrics').dataset.focus,'');
}
await guides[0].click();elements.get('lab-controls').handlers.input({});assert.equal(elements.get('guide-panel').hidden,true);
await guides[1].click();elements.get('time').handlers.input({target:{value:'0'}});assert.equal(elements.get('guide-panel').hidden,true);
await guides[2].click();await buttons[0].click();assert.equal(elements.get('guide-panel').hidden,true);
console.log('PASS: hand poses, playback, walkthrough navigation, step boundaries, metric focus and exit-on-edit wiring.');
