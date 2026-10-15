import{TOUR_SCENES}from'./tour-data.mjs';
import{TourPlayer}from'./tour-player.mjs';
import{getGuide}from'./guides.mjs';
import{renderHandScene}from'./hand.mjs';
const $=s=>document.querySelector(s);let study=null;
const total=TOUR_SCENES.reduce((a,s)=>a+s.seconds,0);$('#tour-duration').textContent='About '+Math.round(total)+' seconds · 6 scenes';
$('#tour-transcript').innerHTML=TOUR_SCENES.map((s,i)=>`<h3>${i+1}. ${s.title}</h3><p>${s.narration}</p>`).join('');
function visual(kind){
 if(kind==='question')return '<p class="tour-callout">Reject a burst.<br>Delay a start.<br>Hold a command too long.</p><p class="tour-tag">The engineering problem is the tradeoff between all three.</p>';
 if(kind==='protocol')return '<div class="tour-rules"><div><strong>≤250 ms</strong><span>Stable-correct onset in at least 90% of events</span></div><div><strong>≤150 ms</strong><span>Stable-rest confirmation in at least 90% of events</span></div><div><strong>≥80%</strong><span>Nonzero active-interior coverage, including wrong commands</span></div></div>';
 if(kind==='start'||kind==='stop'){const g=getGuide(kind),t=kind==='start'?1100:3350,i=t/25;return `<p class="tour-tag">Synthetic illustration · paused at ${t.toLocaleString()} ms · Start ${g.params.activation}, stop ${g.params.release} decisions</p><div class="tour-hands">${renderHandScene(g.scenario.truth[i],g.scenario.raw[i],g.filtered[i])}</div>`;}
 if(kind==='results'){
  if(!study)return '<p class="tour-callout">No tested development family met the joint requirements.</p><p class="tour-limit">DB5 primary rest exposure increased by 1.077 percentage points. Both DB2 contrasts were also positive.</p>';
  return '<p class="tour-tag">Actual study results · asymmetric minus symmetric rest exposure</p><div class="tour-result-rows">'+[['db5','DB5 primary'],['transport','DB2 transported'],['reselected','DB2 reselected']].map(([k,name])=>{const r=study[k],ci=r.bootstrap_95_percentile_interval_pp;return `<div><span>${name}</span><strong>+${r.mean_difference_pp.toFixed(3)} pp</strong><small>Descriptive 95% interval<br>[${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}] pp</small></div>`}).join('')+'</div>';
 }
 return '<p class="tour-callout">A reproducible benchmark.<br>An unsupported hypothesis.<br>An explanation of the tradeoffs.</p><p class="tour-limit">Offline intact-limb replay. Retrospective annotations are not measured intention. No clinical or closed-loop validation is claimed.</p>';
}
function renderScene(index){const s=TOUR_SCENES[index];$('#tour-title').textContent=s.title;$('#tour-caption').textContent=s.narration;$('#tour-count').textContent='Scene '+(index+1)+' of '+TOUR_SCENES.length;$('#tour-position').textContent=(index+1)+' / '+TOUR_SCENES.length;$('#tour-visual').innerHTML=visual(s.kind);$('#tour-prev').disabled=index===0;$('#tour-next').disabled=index===TOUR_SCENES.length-1;}
let voice=null;
if('speechSynthesis'in window&&'SpeechSynthesisUtterance'in window){voice={
 speak(text,end,error){const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.98;const available=speechSynthesis.getVoices();const english=available.find(v=>v.lang==='en-US'&&v.localService)||available.find(v=>v.lang.startsWith('en'));if(english)u.voice=english;u.onend=end;u.onerror=error;speechSynthesis.speak(u);},cancel(){speechSynthesis.cancel();},pause(){speechSynthesis.pause();},resume(){speechSynthesis.resume();}
};}
const player=new TourPlayer(TOUR_SCENES,{voice,onScene:renderScene,onState:s=>{
 $('#tour-mode').textContent=s.message;$('#tour-status').textContent=s.message==='Ready'?'Narration uses your browser’s available voice. It is a scripted guide, not a recording of Sri. Captions and the transcript are available below.':s.message;
 $('#tour-play').textContent=s.mode==='voice'?(s.playing?'Pause narration':'Play / resume narration'):'Play with narration';$('#tour-silent').textContent=s.mode==='captions'&&s.playing?'Pause captions':'Play captions only';$('#tour-progress-fill').style.width=s.progress+'%';$('#tour-progress').setAttribute('aria-valuenow',String(Math.round(s.progress)));
}});
$('#tour-play').addEventListener('click',()=>player.play('voice'));$('#tour-silent').addEventListener('click',()=>player.play('captions'));$('#tour-restart').addEventListener('click',()=>player.restart());$('#tour-prev').addEventListener('click',()=>player.seek(player.index-1));$('#tour-next').addEventListener('click',()=>player.seek(player.index+1));document.addEventListener('visibilitychange',()=>{if(document.hidden)player.pause()});window.addEventListener('pagehide',()=>player.seek(player.index));
fetch('emg/study-results.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{study=d;if(TOUR_SCENES[player.index].kind==='results')renderScene(player.index)}).catch(()=>{});
