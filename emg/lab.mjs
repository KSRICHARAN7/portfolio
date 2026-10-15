import {HOP,replay,makeScenario,metrics} from './engine.mjs';
import {HAND_EXAMPLES,renderHandScene,momentDescription} from './hand.mjs';
import {getGuide} from './guides.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const form=$('#lab-controls');let scenario,filtered,rawMetrics,filteredMetrics,playing=false,frame,last=0,time=0,guideKey=null,guideStep=0;
const scenarioNotes={bursts:'Brief false commands in rest and short gaps during a correct movement.', 'slow-release':'The raw command continues after the movement annotation ends, with short rest flickers.', 'wrong-command':'The decoder initially chooses movement 2 while the annotation asks for grip (1).',chatter:'The decoder alternates between rest and grip near the start and stop.'};
function stop(){playing=false;cancelAnimationFrame(frame);$('#play').textContent='Play replay';}
function setTime(t){time=Math.min(4975,Math.max(0,Math.round(t/HOP)*HOP));$('#time').value=time;$('#time-value').textContent=time+' ms';const i=time/HOP,labels=['Rest','Grip','Other movement'];$('#command-state').innerHTML=`<span>Annotation <strong>${labels[scenario.truth[i]]}</strong></span><span>Raw decoder <strong>${labels[scenario.raw[i]]}</strong></span><span>Filtered command <strong>${labels[filtered[i]]}</strong></span>`;const poseKey=[scenario.truth[i],scenario.raw[i],filtered[i]].join(',');if($('#hand-scene').dataset.poseKey!==poseKey){$('#hand-scene').innerHTML=renderHandScene(scenario.truth[i],scenario.raw[i],filtered[i]);$('#hand-scene').dataset.poseKey=poseKey;}$('#hand-time').textContent=time+' ms';$('#hand-explanation').textContent=momentDescription(scenario.truth[i],scenario.raw[i],filtered[i]);const line=$('#playhead');if(line){const x=145+time/5000*825;line.setAttribute('x1',x);line.setAttribute('x2',x);}}
function timeline(){
 const colors=['#e2e7ee','#3863df','#e56d3c'];let svg='<svg viewBox="0 0 1000 235" role="img" aria-labelledby="timeline-title timeline-desc"><title id="timeline-title">Annotation, raw decoder, and filtered command over five seconds</title><desc id="timeline-desc">Rest is gray, grip is blue, and a different movement is orange. Movement annotation runs from one to three seconds. Use the time slider to inspect exact commands.</desc>';
 svg+='<rect x="310" y="10" width="330" height="176" fill="#fff4ca" rx="4"/>';
 [scenario.truth,scenario.raw,filtered].forEach((row,r)=>{const y=25+r*56;svg+=`<text x="5" y="${y+21}" fill="#39414f" font-size="15">${['Annotation','Raw decoder','Filtered command'][r]}</text>`;row.forEach((v,i)=>{svg+=`<rect x="${145+i*4.125}" y="${y}" width="4.2" height="34" fill="${colors[v]}"><title>${i*25} ms: ${['rest','grip','other movement'][v]}</title></rect>`;});});
 for(let i=0;i<=5;i++){let x=145+i*165;svg+=`<line x1="${x}" x2="${x}" y1="16" y2="184" stroke="#202329" stroke-opacity=".16"/><text x="${x}" y="213" text-anchor="middle" fill="#58616f" font-size="14">${i} s</text>`;}
 svg+='<line id="playhead" x1="145" x2="145" y1="12" y2="185" stroke="#17191d" stroke-width="3"/></svg>';$('#timeline').innerHTML=svg;
}
const pct=v=>v.toFixed(1)+'%',delay=v=>v===null?'Not reached':v+' ms';
function metricTable(){
 const rows=[['Confirmed onset',delay(rawMetrics.onset),delay(filteredMetrics.onset),'≤250 ms'],['Confirmed release',delay(rawMetrics.release),delay(filteredMetrics.release),'≤150 ms'],['Unwanted activation in rest',pct(rawMetrics.exposure),pct(filteredMetrics.exposure),'Lower is better'],['Active-interior coverage',pct(rawMetrics.coverage),pct(filteredMetrics.coverage),'Counts all nonzero output'],['Correct active-interior output',pct(rawMetrics.correct),pct(filteredMetrics.correct),'Correct movement only'],['Wrong active-interior output',pct(rawMetrics.wrong),pct(filteredMetrics.wrong),'Nonzero, wrong movement']];
 $('#metrics').innerHTML='<h3>Whole-example comparison</h3><div class="table-scroll"><table><caption class="sr-only">Synthetic example metrics for raw and filtered commands</caption><thead><tr><th scope="col">Measure</th><th scope="col">Raw</th><th scope="col">Filtered</th><th scope="col">Meaning</th></tr></thead><tbody>'+rows.map((r,i)=>`<tr data-metric="${['onset','release','exposure','coverage','correct','wrong'][i]}"><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')+'</tbody></table></div>';
 let text=[];const delta=filteredMetrics.exposure-rawMetrics.exposure;
 if(delta>0.001)text.push(`The filter adds ${delta.toFixed(1)} percentage points of unwanted activation in this example.`);
 else if(delta<-.001)text.push(`The filter removes ${(-delta).toFixed(1)} percentage points of unwanted activation in this example.`);
 else text.push('The filter leaves rest exposure unchanged in this example.');
 if(filteredMetrics.coverage-filteredMetrics.correct>.001)text.push('Coverage includes wrong movements: compare it with correct output before calling it reliable.');
 if(filteredMetrics.onset===null)text.push('A stable correct onset is never confirmed.');
 else if(!filteredMetrics.onsetMet)text.push('Correct onset misses the 250 ms timing budget.');
 if(!filteredMetrics.releaseMet)text.push('Stable release misses the 150 ms timing budget.');
 $('#interpretation').innerHTML='<strong>What to notice</strong><p>'+text.join(' ')+'</p><small>Timing checks apply to this single synthetic event, not to study feasibility.</small>';
}
function update(){stop();scenario=makeScenario($('#scenario').value);const family=$('#family').value,a=+$('#activation').value,r=+$('#release').value,n=+$('#n').value;
 $('#asymmetric-controls').hidden=family!=='asymmetric';$('#n-controls').hidden=!['symmetric','majority'].includes(family);
 for(const id of ['activation','release','n']){const v=+$('#'+id).value;$('#'+id+'-value').textContent=v+(v===1?' decision':' decisions');}
 $('#scenario-note').textContent=scenarioNotes[scenario.name];filtered=replay(scenario.raw,family,a,r,n);rawMetrics=metrics(scenario,scenario.raw);filteredMetrics=metrics(scenario,filtered);timeline();metricTable();setTime(time);
}
form.addEventListener('input',()=>{closeGuide();update()});form.addEventListener('submit',e=>e.preventDefault());$('#time').addEventListener('input',e=>{closeGuide();stop();setTime(+e.target.value)});
document.querySelectorAll('[data-hand-example]').forEach(button=>button.addEventListener('click',()=>{closeGuide();const p=HAND_EXAMPLES[button.dataset.handExample];for(const id of ['scenario','family','activation','release','n'])$('#'+id).value=p[id];time=p.time;update();}));
$('#reset').addEventListener('click',()=>{closeGuide();form.reset();time=0;update()});$('#restart').addEventListener('click',()=>{closeGuide();stop();setTime(0)});
$('#play').addEventListener('click',()=>{closeGuide();if(playing){stop();return;}if(time>=4975)setTime(0);playing=true;$('#play').textContent='Pause';last=0;let elapsed=time;
 const tick=now=>{if(!playing)return;if(last)elapsed+=Math.min(100,now-last);last=now;setTime(elapsed);if(elapsed>=4975){stop();return;}frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);
});
function closeGuide(){guideKey=null;$('#guide-panel').hidden=true;$('#metrics').dataset.focus='';document.querySelectorAll('[data-guide]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function openGuide(key,step=0){
 const entering=guideKey!==key;const g=getGuide(key);guideKey=key;guideStep=Math.max(0,Math.min(g.steps.length-1,step));const current=g.steps[guideStep];
 for(const id of ['scenario','family','activation','release','n'])$('#'+id).value=g.params[id];time=current.time;update();
 $('#guide-panel').hidden=false;$('#guide-counter').textContent='Step '+(guideStep+1)+' of '+g.steps.length+' · Synthetic example';$('#guide-title').textContent=g.title;
 $('#guide-settings').textContent='Separate start / stop persistence · Start '+g.params.activation+' · Stop '+g.params.release+' decisions';
 $('#guide-step-title').textContent=current.title;$('#guide-step-body').textContent=current.body;$('#guide-lesson').hidden=guideStep!==g.steps.length-1;$('#guide-lesson').textContent='Takeaway: '+g.lesson;
 $('#guide-prev').disabled=guideStep===0;$('#guide-next').disabled=guideStep===g.steps.length-1;$('#guide-timestamp').textContent=current.time.toLocaleString('en-US')+' ms';$('#metrics').dataset.focus=current.focus;
 document.querySelectorAll('[data-guide]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guide===key)));
 for(let i=0;i<g.steps.length;i++){$('#guide-step-'+i).setAttribute('aria-current',i===guideStep?'step':'false');$('#guide-step-'+i).setAttribute('aria-label','Step '+(i+1)+': '+g.steps[i].title);}
 if(entering)$('#guide-panel').scrollIntoView?.({block:'nearest'});
}
document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>openGuide(button.dataset.guide)));
$('#guide-close').addEventListener('click',closeGuide);$('#guide-prev').addEventListener('click',()=>{if(guideKey)openGuide(guideKey,guideStep-1)});$('#guide-next').addEventListener('click',()=>{if(guideKey)openGuide(guideKey,guideStep+1)});
for(let i=0;i<4;i++)$('#guide-step-'+i).addEventListener('click',()=>{if(guideKey)openGuide(guideKey,i)});
let results;
async function loadResults(){
 try{if(!results){const response=await fetch('emg/study-results.json');if(!response.ok)throw Error('Result file unavailable');results=await response.json();}renderResults();}catch(e){$('#study-summary').innerHTML='<p class="demo-notice">The result data could not be loaded. <a href="https://github.com/KSRICHARAN7/emg-command-filtering-benchmark/tree/main/results">Read the source results on GitHub ↗</a></p>';}
}
function renderResults(){const key=$('#comparison').value,d=results[key],ci=d.bootstrap_95_percentile_interval_pp;
 $('#study-summary').innerHTML=`<div class="study-numbers"><div><strong>+${d.mean_difference_pp.toFixed(3)} pp</strong><span>Mean change in rest exposure</span></div><div><strong>[${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}]</strong><span>Descriptive paired bootstrap 95% interval, pp</span></div><div><strong>${d.participants}</strong><span>Final-evaluation dataset participants</span></div></div><p>Asymmetric minus symmetric persistence. Positive means more unwanted activation during annotated rest.</p>`;
 const vals=d.participant_differences_pp,max=Math.ceil(Math.max(...vals)),bw=800/vals.length,start=key==='db5'?3:9;
 let svg=`<svg viewBox="0 0 940 310" role="img" aria-labelledby="study-title"><title id="study-title">${esc($('#comparison').selectedOptions[0].textContent)}: rest exposure increases for all ${vals.length} participants. Exact values appear below.</title><text x="52" y="20" font-size="14" fill="#58616f">Change in rest exposure (percentage points)</text>`;
 for(let j=0;j<=max;j++){const y=250-j/max*195;svg+=`<line x1="55" x2="875" y1="${y}" y2="${y}" stroke="#dde3ee"/><text x="43" y="${y+4}" text-anchor="end" font-size="13" fill="#58616f">${j}</text>`;}
 vals.forEach((v,i)=>{const h=v/max*195,x=65+i*bw;svg+=`<rect x="${x}" y="${250-h}" width="${bw*.72}" height="${h}" fill="#df7443"><title>Participant ${start+i}: +${v.toFixed(3)} percentage points</title></rect>`;if(vals.length===8||i%4===0)svg+=`<text x="${x+bw*.36}" y="271" text-anchor="middle" font-size="12" fill="#58616f">${start+i}</text>`;});
 svg+='<text x="465" y="300" text-anchor="middle" fill="#58616f" font-size="13">Dataset participant ID</text></svg>';
 $('#study-chart').innerHTML=svg+`<details class="exact-values"><summary>Exact participant differences</summary><div class="table-scroll"><table><caption>Asymmetric − symmetric rest exposure, percentage points</caption><thead><tr><th scope="col">Dataset participant</th><th scope="col">Difference (pp)</th></tr></thead><tbody>${vals.map((v,i)=>`<tr><th scope="row">${start+i}</th><td>+${v.toFixed(6)}</td></tr>`).join('')}</tbody></table></div></details>`;
 $('#result-source').href='https://github.com/KSRICHARAN7/emg-command-filtering-benchmark/blob/main/results/'+(key==='db5'?'db5/paired_statistics.json':'db2/paired_contrasts.json');
}
for(const [id,isResults]of [['sandbox-button',false],['results-button',true]])$('#'+id).addEventListener('click',()=>{if(isResults)closeGuide();stop();$('#sandbox').hidden=isResults;$('#study-results').hidden=!isResults;$('#sandbox-button').setAttribute('aria-pressed',String(!isResults));$('#results-button').setAttribute('aria-pressed',String(isResults));if(isResults)loadResults();});
$('#comparison').addEventListener('change',()=>{if(results)renderResults()});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});update();
