'use strict';
const METHODS = {
  combined: {name:'Combined quality + confidence',note:'Primary combined error ranker: waveform quality, confidence features, and predicted class.'},
  raw_confidence: {name:'Raw confidence',note:'Keeps the classifier’s most confident predictions. It is not a calibrated guarantee of correctness.'},
  confidence_adjusted: {name:'Confidence error ranker',note:'A fitted error ranker using confidence features and predicted class; this is the primary comparator.'},
  quality_only: {name:'Quality + predicted class',note:'The original “quality-only” ranker includes predicted class. It is different from the quality-without-class ablation.'},
  quality_no_class: {name:'Quality without predicted class',note:'Exploratory ablation without predicted class. The controls show the original benchmark; the followup below tests fresh seeds and new external records. The complete replication requirement was not met.'}
};
const COVERAGES=[.8,.9,.95];
const CONDITIONS={em_24:'24 dB',em_12:'12 dB',em_6:'6 dB',em_0:'0 dB',clean:'Clean (no added artifact)'};
const $=id=>document.getElementById(id);
const pct=x=>Number.isFinite(x)?`${(100*x).toFixed(2)}%`:'Undefined';
const num=x=>Math.round(x).toLocaleString('en-US');
let study;
function findRow(condition,method,coverage){return study.rows.find(r=>r.condition===condition&&r.method===method&&Math.abs(r.target_coverage-coverage)<1e-9);}
function render(){
  const condition=$('condition').value,method=$('method').value,coverage=COVERAGES[Number($('coverage').value)];
  const r=findRow(condition,method,coverage),totalAF=study.cohort.af_records;
  if(!r)throw new Error('The selected result is unavailable.');
  $('coverage-value').textContent=`${Math.round(coverage*100)}%`;
  $('coverage').setAttribute('aria-valuetext',`${Math.round(coverage*100)} percent`);
  $('method-note').textContent=METHODS[method].note;
  $('all-pct').textContent=pct(r.coverage);$('all-count').textContent=`${num(r.retained)} of ${num(r.N)} ECG records`;
  $('af-pct').textContent=pct(r.positive_retention);$('af-count').textContent=`${num(r.positive_retained)} of ${totalAF} AF records`;
  $('error-pct').textContent=pct(r.selective_error);$('balanced-pct').textContent=pct(r.balanced_selective_error);
  $('af-kept-bar').style.width=`${100*r.positive_retention}%`;$('af-deferred-bar').style.width=`${100*(1-r.positive_retention)}%`;
  $('af-bar').setAttribute('aria-label',`${num(r.positive_retained)} AF cases retained; ${num(totalAF-r.positive_retained)} deferred, out of ${totalAF}.`);
  $('af-story').textContent=`Of ${totalAF} AF cases, ${num(r.positive_retained)} were retained and ${num(totalAF-r.positive_retained)} were deferred.`;
  $('guardrail').textContent=r.positive_retention>=.8?'Meets this study’s 80% AF-retention criterion.':'Falls below this study’s 80% AF-retention criterion.';
  $('guardrail').classList.toggle('pass',r.positive_retention>=.8);
  $('tp').textContent=num(r.TP);$('fn').textContent=num(r.FN);$('af-deferred').textContent=num(totalAF-r.positive_retained);
  const baseline=findRow(condition,'raw_confidence',1);
  $('baseline').textContent=`Without filtering: all ${num(baseline.N)} ECGs and all ${totalAF} AF cases are retained. Overall error is ${pct(baseline.selective_error)}; balanced error is ${pct(baseline.balanced_selective_error)}. The classifier correctly calls ${num(baseline.TP)} of ${totalAF} AF cases.`;
  $('comparison-caption').textContent=`Final test set · ${CONDITIONS[condition]} · ${Math.round(coverage*100)}% target coverage. Select a method name to inspect it.`;
  $('comparison').replaceChildren(...Object.entries(METHODS).map(([key,m])=>{
    const row=findRow(condition,key,coverage),tr=document.createElement('tr');tr.classList.toggle('selected',key===method);
    const title=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='method-name';button.textContent=m.name;button.setAttribute('aria-pressed',String(key===method));button.addEventListener('click',()=>{$('method').value=key;render();});title.append(button);
    if(key==='quality_no_class'){const badge=document.createElement('span');badge.className='badge';badge.textContent='Exploratory';title.append(badge);}tr.append(title);
    for(const value of [pct(row.coverage),`${pct(row.positive_retention)} (${num(row.positive_retained)}/${totalAF})`,pct(row.selective_error),pct(row.balanced_selective_error),`${num(row.TP)} / ${totalAF}`]){const td=document.createElement('td');td.textContent=value;tr.append(td);}return tr;
  }));
  drawCurve(condition,method);drawWave(condition);
}
function drawCurve(condition,method){
  const svg=$('curve'),rows=COVERAGES.map(c=>findRow(condition,method,c));
  const x=c=>65+(c-.8)/.15*500,y=v=>190-v*150;
  let s='<title id="curve-title">Error and AF retention at three coverage settings</title><desc id="curve-desc">Blue: AF retention. Orange: balanced retained error. '+rows.map(r=>`${100*r.target_coverage}% target coverage: AF retention ${pct(r.positive_retention)}, balanced error ${pct(r.balanced_selective_error)}.`).join(' ')+'</desc>';
  for(const v of [0,.5,1])s+=`<line x1="65" y1="${y(v)}" x2="565" y2="${y(v)}" stroke="var(--line)"/><text x="54" y="${y(v)+4}" text-anchor="end" font-size="12" fill="var(--muted)">${v*100}%</text>`;
  for(const [field,color]of [['positive_retention','var(--blue)'],['balanced_selective_error','var(--ecg-warning)']]){s+=`<polyline points="${rows.map(r=>`${x(r.target_coverage)},${y(r[field])}`).join(' ')}" fill="none" stroke="${color}" stroke-width="3"/>`;for(const r of rows)s+=`<circle cx="${x(r.target_coverage)}" cy="${y(r[field])}" r="5" fill="${color}"><title>${100*r.target_coverage}% coverage: ${pct(r[field])}</title></circle>`;}
  for(const r of rows)s+=`<text x="${x(r.target_coverage)}" y="212" text-anchor="middle" font-size="12" fill="var(--muted)">${100*r.target_coverage}%</text>`;
  s+='<text x="315" y="238" text-anchor="middle" font-size="12" fill="var(--muted)">Target overall coverage</text><text x="65" y="20" fill="var(--blue)" font-size="13">AF retention</text><text x="225" y="20" fill="var(--ecg-warning)" font-size="13">Balanced retained error</text>';
  svg.innerHTML=s;
}
function syntheticSignal(condition){
  const clean=[],noise=[];const gauss=(x,mu,s)=>Math.exp(-.5*((x-mu)/s)**2);
  for(let i=0;i<1000;i++){const t=i/200,phase=t%.83;clean.push(.11*gauss(phase,.15,.028)-.14*gauss(phase,.32,.012)+gauss(phase,.35,.012)-.23*gauss(phase,.38,.016)+.24*gauss(phase,.58,.06));noise.push(.7*Math.sin(2*Math.PI*.65*t)+.25*Math.sin(2*Math.PI*33*t)+.2*Math.sin(2*Math.PI*47*t)+.65*gauss(t,2.22,.025)-.5*gauss(t,3.71,.04));}
  const power=a=>a.reduce((sum,v)=>sum+v*v,0)/a.length;
  const snr=condition==='clean'?null:Number(condition.split('_')[1]);const scale=snr===null?0:Math.sqrt(power(clean)/(power(noise)*10**(snr/10)));
  return {clean,noisy:clean.map((v,i)=>v+scale*noise[i]),snr};
}
function drawWave(condition){
  const {clean,noisy,snr}=syntheticSignal(condition);const max=2;const y=v=>120-v/max*85;
  const points=a=>a.map((v,i)=>`${i},${y(v).toFixed(2)}`).join(' ');let grid='';for(let x=0;x<=1000;x+=100)grid+=`<line x1="${x}" y1="20" x2="${x}" y2="210" stroke="var(--line)"/>`;for(let yy=35;yy<210;yy+=35)grid+=`<line x1="0" y1="${yy}" x2="1000" y2="${yy}" stroke="var(--line)"/>`;
  $('wave').innerHTML=`<title id="wave-title">Synthetic ECG illustration: ${CONDITIONS[condition]}</title><desc id="wave-desc">Generated clean signal in blue, with illustrative noise in orange. These traces have a shared vertical scale. No model is run on these waveforms.</desc>${grid}<polyline points="${points(noisy)}" stroke="var(--ecg-warning)" stroke-width="1.6" fill="none"/><polyline points="${points(clean)}" stroke="var(--blue)" stroke-width="1.8" fill="none"/>`;
  $('wave-label').textContent=snr===null?'Clean illustration · traces overlap':`${snr} dB illustration`;
}
async function init(){try{const response=await fetch('assets/ecg-results.json');if(!response.ok)throw new Error('Results could not be loaded.');study=await response.json();render();$('load-status').textContent='';$('results').hidden=false;for(const id of ['condition','method','coverage'])$(id).addEventListener('input',render);$('reset').addEventListener('click',()=>{$('condition').value='em_24';$('method').value='combined';$('coverage').value='1';render();});}catch(e){$('load-status').textContent='The interactive results could not load. Please reload or download the aggregate CSV below.';console.error(e);}}
init();
