// Causal ports of src/controllers.py. One decoder decision every 25 ms.
export const HOP=25, STABLE=100;
export function replay(labels,family='asymmetric',activation=1,release=2,n=3){
 if(!['raw','symmetric','asymmetric','majority'].includes(family))throw Error('Unknown controller');
 if(![activation,release,n].every(x=>Number.isInteger(x)&&x>=1&&x<=20))throw Error('Invalid count');
 let state=0,pending=null,count=0,history=[];
 return labels.map(label=>{
  if(!Number.isInteger(label)||label<0)throw Error('Invalid command');
  if(family==='raw')return label;
  if(family==='majority'){
   history.push(label);if(history.length>n)history.shift();const counts=new Map();history.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
   const best=Math.max(...counts.values());const tied=[...counts.keys()].filter(v=>counts.get(v)===best);
   if(!tied.includes(state))state=[...history].reverse().find(v=>tied.includes(v));return state;
  }
  if(label===state){pending=null;count=0;return state;}
  if(label===pending)count++;else{pending=label;count=1;}
  const threshold=family==='symmetric'?n:state===0?activation:label===0?release:activation;
  if(count>=threshold){state=label;pending=null;count=0;}return state;
 });
}
export function confirm(pred,target,start,end){
 let runStart=null;
 for(let i=0;i<pred.length;i++){const t=i*HOP;if(t<start)continue;if(t>=end)break;
  if(pred[i]!==target)runStart=null;else if(runStart===null)runStart=t;
  if(runStart!==null&&t-runStart>=STABLE)return t;
 }return null;
}
export function makeScenario(name='bursts'){
 const length=200,truth=Array(length).fill(0),raw=Array(length).fill(0); // 5 seconds, one 2-second movement.
 for(let i=40;i<120;i++)truth[i]=1;
 for(let i=43;i<124;i++)raw[i]=1;
 if(name==='bursts'){[12,13,25,135,136,170].forEach(i=>raw[i]=1);[66,67,89].forEach(i=>raw[i]=0);}
 else if(name==='slow-release'){for(let i=120;i<130;i++)raw[i]=1;raw[126]=0;raw[128]=0;}
 else if(name==='wrong-command'){for(let i=43;i<70;i++)raw[i]=2;[78,79,98].forEach(i=>raw[i]=0);}
 else if(name==='chatter'){for(let i=36;i<55;i++)raw[i]=i%2;for(let i=112;i<135;i++)raw[i]=i%2;[14,15,155].forEach(i=>raw[i]=2);}
 else throw Error('Unknown scenario');
 return {name,truth,raw,onset:1000,offset:3000,end:5000,label:1};
}
export function metrics(s,pred){
 if(pred.length!==s.truth.length)throw Error('Mismatched stream');
 const on=confirm(pred,s.label,s.onset,s.offset),off=confirm(pred,0,s.offset,s.end);
 let rest=0,exposed=0,interior=0,active=0,correct=0,wrong=0;
 s.truth.forEach((y,i)=>{const t=i*HOP;if(y===0){rest+=HOP;if(pred[i]!==0)exposed+=HOP;}
 if(t>=s.onset+500&&t<s.offset){interior+=HOP;if(pred[i]!==0)active+=HOP;if(pred[i]===y)correct+=HOP;else if(pred[i]!==0)wrong+=HOP;}});
 return {onset:on===null?null:on-s.onset,release:off===null?null:off-s.offset,exposure:100*exposed/rest,exposedMs:exposed,coverage:100*active/interior,correct:100*correct/interior,wrong:100*wrong/interior,onsetMet:on!==null&&on-s.onset<=250,releaseMet:off!==null&&off-s.offset<=150};
}
