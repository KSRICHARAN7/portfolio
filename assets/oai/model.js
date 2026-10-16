/* Teaching formulas only. No fitted model or participant-level OAI data. */
(function(root){
'use strict';
const expected=[1,2,4,6,8];
const policies=[0,5,10,15,20];
function example(grade,pain){
 if(!Number.isInteger(grade)||grade<0||grade>4||!Number.isInteger(pain)||pain<0||pain>20)throw new RangeError('Choose an integer grade 0–4 and pain 0–20');
 const baselineExpected=expected[grade],signed=pain-baselineExpected,discordance=Math.abs(signed);
 return {id:grade*21+pain,grade,pain,expected:baselineExpected,signed,discordance,prediction:(pain+baselineExpected)/2,error:1+.25*discordance};
}
const cases=Array.from({length:105},(_,id)=>example(Math.floor(id/21),id%21));
function policy(grade,pain,percent){
 if(!policies.includes(percent))throw new RangeError('Use a listed policy');
 const selected=example(grade,pain),ranked=[...cases].sort((a,b)=>b.error-a.error||a.id-b.id),count=Math.ceil(cases.length*percent/100),deferred=new Set(ranked.slice(0,count).map(c=>c.id));
 return {selected,deferred,count,coverage:100*(cases.length-count)/cases.length,rank:ranked.findIndex(c=>c.id===selected.id)+1,threshold:count?ranked[count-1].error:null};
}
const study=[
 {deferred:0,coverage:100,n:8232,targeted:1.787213,random:1.787213,lo:1.787213,hi:1.787213},
 {deferred:5,coverage:95,n:7821,targeted:1.668512,random:1.787199,lo:1.777561,hi:1.796271},
 {deferred:10,coverage:90,n:7409,targeted:1.582299,random:1.787600,lo:1.774287,hi:1.801121},
 {deferred:15,coverage:85,n:6998,targeted:1.503552,random:1.787335,lo:1.769456,hi:1.804327},
 {deferred:20,coverage:80,n:6586,targeted:1.437338,random:1.787072,lo:1.767846,hi:1.806382}
];
const api={expected,policies,example,cases,policy,study};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ExplorerModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
