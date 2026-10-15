export const label = id => id === 'intact' ? 'None (intact)' : id === 'missing_all' ? 'All 16 channels' : id === 'missing_01_to_08' ? 'Channels 1–8' : id === 'missing_09_to_16' ? 'Channels 9–16' : `Channel ${Number(id.slice(-2))}`;
export function comparisonRows(data, controller) {
 const rows=data.conditions.filter(r=>r.controller===controller);
 const singles=rows.filter(r=>/^missing_\d\d$/.test(r.condition));
 const mean=Object.fromEntries(Object.keys(singles[0].means).map(k=>[k,singles.reduce((s,r)=>s+r.means[k],0)/singles.length]));
 return [rows.find(r=>r.condition==='intact'),{condition:'single_average',means:mean},...['missing_01_to_08','missing_09_to_16','missing_all'].map(c=>rows.find(r=>r.condition===c))];
}
const pct=n=>(100*n).toFixed(2)+'%';
if(typeof document!=='undefined') {
 try {
 const response=await fetch('emg/channel-dropout-results.json');if(!response.ok)throw Error('Result data unavailable');const data=await response.json();
 const controller=document.querySelector('#drop-controller'),condition=document.querySelector('#drop-condition');
 condition.replaceChildren(...data.conditions.filter(r=>r.controller==='asymmetric').map(r=>new Option(label(r.condition),r.condition)));condition.value='missing_01';
 function render(){
 const rows=data.conditions.filter(r=>r.controller===controller.value),r=rows.find(r=>r.condition===condition.value),m=r.means;
 document.querySelector('#drop-status').textContent=`${label(r.condition)} · ${r.participants} people · Correct output change: ${r.delta_from_intact_pp.interior_correct_fraction.toFixed(2)} percentage points from intact.`;
 const cards=document.querySelector('#drop-metrics');cards.replaceChildren();
 for(const [key,title] of [['interior_correct_fraction','Correct active-interior output'],['interior_wrong_active_fraction','Wrong active-interior output'],['active_command_coverage','Active-interior command coverage'],['rest_exposure','Command exposure during rest']]){const div=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=pct(m[key]);span.textContent=title;div.append(strong,span);cards.append(div)}
 const bars=document.querySelector('#drop-bars');bars.replaceChildren();
 for(const row of comparisonRows(data,controller.value)){const c=row.means.interior_correct_fraction,w=row.means.interior_wrong_active_fraction,i=1-c-w;const div=document.createElement('div');div.className='drop-bar';const title=document.createElement('strong');title.textContent=row.condition==='single_average'?'Single-channel loss (average of 16 masks)':label(row.condition);const track=document.createElement('div');track.className='drop-track';track.setAttribute('aria-hidden','true');for(const [name,v] of [['correct',c],['wrong',w],['inactive',i]]){const span=document.createElement('span');span.className=name;span.style.width=`${100*v}%`;track.append(span)}const text=document.createElement('small');text.textContent=`Correct ${pct(c)} · Wrong active ${pct(w)} · Inactive ${pct(i)}`;div.append(title,track,text);bars.append(div)}
 const tbody=document.querySelector('#drop-rows');tbody.replaceChildren();for(const row of rows){const tr=document.createElement('tr');for(const value of [label(row.condition),...['interior_correct_fraction','interior_wrong_active_fraction','active_command_coverage','rest_exposure'].map(k=>pct(row.means[k])),row.delta_from_intact_pp.interior_correct_fraction.toFixed(2)+' pp']){const td=document.createElement('td');td.textContent=value;tr.append(td)}tbody.append(tr)}
 }
 controller.addEventListener('change',render);condition.addEventListener('change',render);render();
 }catch(error){document.querySelector('#drop-status').textContent='Could not load the explorer. Please use the linked report or CSV below.';console.error(error)}
}
