'use strict';
const M=window.ExplorerModel,$=id=>document.getElementById(id);
let studyIndex=2;
const grades=['No radiographic changes','Doubtful radiographic changes','Mild radiographic osteoarthritis','Moderate radiographic osteoarthritis','Severe radiographic osteoarthritis'];
M.expected.forEach((_,i)=>{const b=document.createElement('button');b.textContent=i;b.type='button';b.setAttribute('aria-label',`KL grade ${i}`);b.addEventListener('click',()=>{$('kl').value=i;updateCase();});$('grade-buttons').appendChild(b);});
function updateCase(){
 const grade=Number($('kl').value),pain=Number($('pain').value),percent=M.policies[Number($('deferral').value)],r=M.policy(grade,pain,percent),c=r.selected;
 $('pain-value').textContent=`${pain} / 20`;
 $('grade-description').textContent=grades[grade]+'.';
 [...$('grade-buttons').children].forEach((b,i)=>{b.classList.toggle('active',i===grade);b.setAttribute('aria-pressed',i===grade?'true':'false');});
 $('expected-number').textContent=c.expected;$('reported-number').textContent=pain;
 $('expected-marker').style.left=`${c.expected*5}%`;$('pain-marker').style.left=`${pain*5}%`;
 $('gap').style.left=`${Math.min(pain,c.expected)*5}%`;$('gap').style.width=`${c.discordance*5}%`;
 $('discordance-value').textContent=c.discordance.toFixed(1);$('prediction-value').textContent=c.prediction.toFixed(1);$('error-value').textContent=c.error.toFixed(2);
 $('mismatch-label').textContent=c.discordance===0?'Aligned teaching example':`${c.discordance} points apart`;
 const direction=c.signed>0?'above':c.signed<0?'below':'equal to';
 $('case-story').textContent=c.discordance===0?`The reported pain matches the teaching expectation for KL grade ${grade}. The toy formula assigns its lowest illustrative error score. That does not guarantee a reliable real-world prediction.`:`Reported pain is ${c.discordance} points ${direction} the teaching expectation for KL grade ${grade}. The toy formula assigns a larger error score as this gap grows. The actual study used a separately trained error model.`;
 $('deferral-value').textContent=`${percent}%`;
 const isDeferred=r.deferred.has(c.id);
 $('decision').textContent=isDeferred?'Deferred in toy example':'Retained in toy example';
 $('decision-icon').textContent=isDeferred?'↗':'✓';$('decision-icon').classList.toggle('is-deferred',isDeferred);
 $('decision-reason').textContent=percent===0?'The policy retains all 105 fictional cases, even those with high illustrative error scores.':`This case ranks ${r.rank} of 105 by descending toy error score. The policy defers the top ${r.count} cases. ${isDeferred?'This example falls inside that set.':'This example falls outside that set.'} Ties use fixed grade/pain order.`;
 const grid=$('case-grid');grid.replaceChildren();
 M.cases.forEach(x=>{const s=document.createElement('span');s.className='case-dot'+(r.deferred.has(x.id)?' deferred':'')+(x.id===c.id?' current':'');s.title=`Fictional KL ${x.grade}, pain ${x.pain}: ${r.deferred.has(x.id)?'deferred':'retained'}`;grid.appendChild(s);});
 grid.setAttribute('aria-label',`105 fictional cases: ${r.count} deferred, ${105-r.count} retained. Selected case ${isDeferred?'deferred':'retained'}.`);
 $('grid-summary').textContent=`5 grade rows × 21 pain scores. Actual toy coverage: ${r.coverage.toFixed(1)}% (${105-r.count}/105), after rounding the deferred count up. This is not an OAI cohort.`;
}
$('pain').addEventListener('input',updateCase);$('kl').addEventListener('change',updateCase);$('deferral').addEventListener('input',updateCase);
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{$('kl').value=b.dataset.grade;$('pain').value=b.dataset.pain;updateCase();}));
$('reset').addEventListener('click',()=>{$('kl').value=2;$('pain').value=4;$('deferral').value=2;updateCase();});
const NS='http://www.w3.org/2000/svg';
function svg(tag,attrs,text){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;}
function updateStudy(){
 const d=M.study[studyIndex];$('study-deferral').textContent=`${d.deferred}%`;$('study-coverage').textContent=`${d.coverage}%`;$('study-mae').textContent=d.targeted.toFixed(3);
 const improvement=100*(1-d.targeted/M.study[0].targeted);
 $('study-comparison').textContent=d.deferred===0?'All 8,232 knees receive a held-out prediction. This is the full-coverage reference error.':`${d.n.toLocaleString('en-US')} knees retained. Their MAE is ${improvement.toFixed(2)}% lower than the full-coverage reference. Random ${d.deferred}% deferral gave an MAE of ${d.random.toFixed(3)}.`;
 [...$('chart-options').children].forEach((b,i)=>{b.classList.toggle('active',i===studyIndex);b.setAttribute('aria-pressed',i===studyIndex?'true':'false');});
 drawChart();
}
M.study.forEach((d,i)=>{const b=document.createElement('button');b.textContent=`${d.deferred}% deferred`;b.addEventListener('click',()=>{studyIndex=i;updateStudy();});$('chart-options').appendChild(b);
 const tr=document.createElement('tr');[`${d.deferred}%`,`${d.coverage}%`,d.n.toLocaleString('en-US'),d.targeted.toFixed(6),d.random.toFixed(6)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td);});$('risk-table').appendChild(tr);});
function drawChart(){
 const chart=$('risk-chart');chart.querySelectorAll('g').forEach(e=>e.remove());const g=svg('g',{});chart.appendChild(g);
 const x=v=>75+(v-80)/20*585,y=v=>275-(v-1.4)/.45*220;
 [1.4,1.5,1.6,1.7,1.8].forEach(v=>{g.appendChild(svg('line',{x1:75,x2:660,y1:y(v),y2:y(v),stroke:'#dbe2ef','stroke-width':1}));g.appendChild(svg('text',{x:59,y:y(v)+4,'text-anchor':'end',fill:'#4f5763','font-size':15},v.toFixed(1)));});
 [80,85,90,95,100].forEach(v=>g.appendChild(svg('text',{x:x(v),y:300,'text-anchor':'middle',fill:'#4f5763','font-size':15},`${v}%`)));
 g.appendChild(svg('text',{x:365,y:331,'text-anchor':'middle',fill:'#4f5763','font-size':15},'Retained coverage'));
 g.appendChild(svg('text',{x:-160,y:20,transform:'rotate(-90)','text-anchor':'middle',fill:'#4f5763','font-size':15},'Retained-case MAE (WOMAC points)'));
 const sorted=[...M.study].sort((a,b)=>a.coverage-b.coverage);
 const band=sorted.map(d=>`${x(d.coverage)},${y(d.hi)}`).concat([...sorted].reverse().map(d=>`${x(d.coverage)},${y(d.lo)}`)).join(' ');
 g.appendChild(svg('polygon',{points:band,fill:'#889493','fill-opacity':'.13'}));
 [['random','#737c8d','6 5'],['targeted','#1749cf','']].forEach(([key,color,dash])=>{g.appendChild(svg('polyline',{points:sorted.map(d=>`${x(d.coverage)},${y(d[key])}`).join(' '),fill:'none',stroke:color,'stroke-width':2.5,'stroke-dasharray':dash}));});
 const active=M.study[studyIndex];g.appendChild(svg('line',{x1:x(active.coverage),x2:x(active.coverage),y1:38,y2:275,stroke:'#9eb2e7','stroke-dasharray':'3 5'}));
 M.study.forEach((d,i)=>{const hit=svg('g',{'aria-hidden':'true'});const c=svg('circle',{cx:x(d.coverage),cy:y(d.targeted),r:i===studyIndex?7:4.5,fill:'#1749cf',stroke:'white','stroke-width':2});hit.appendChild(c);hit.style.cursor='pointer';hit.addEventListener('click',()=>{studyIndex=i;updateStudy();});g.appendChild(hit);});
 const labelX=Math.max(123,Math.min(610,x(active.coverage)));g.appendChild(svg('rect',{x:labelX-56,y:y(active.targeted)-41,width:112,height:30,rx:2,fill:'#171b22'}));g.appendChild(svg('text',{x:labelX,y:y(active.targeted)-23,'text-anchor':'middle',fill:'white','font-size':15},`MAE ${active.targeted.toFixed(3)}`));
}
updateCase();updateStudy();

