import {makeScenario,replay,metrics} from './engine.mjs';
import {HAND_EXAMPLES} from './hand.mjs';
export function getGuide(key){
 const params=HAND_EXAMPLES[key];if(!params)throw Error('Unknown walkthrough');
 const scenario=makeScenario(params.scenario),filtered=replay(scenario.raw,params.family,params.activation,params.release,params.n);
 const raw=metrics(scenario,scenario.raw),m=metrics(scenario,filtered),p=v=>v.toFixed(1)+'%';
 const cases={
 start:{title:'A quieter output can start too late',lesson:`Rest exposure falls from ${p(raw.exposure)} to ${p(m.exposure)}, but confirmed onset rises from ${raw.onset} to ${m.onset} ms and misses the 250 ms budget. A favorable exposure number is not enough.`,steps:[
  {time:1000,title:'The movement annotation begins',focus:'onset',body:'The reference changes from rest to grip at 1,000 ms. The raw decoder is still at rest, and so is the filter. The timing clock has started; no correct command has appeared yet.'},
  {time:1100,title:'The decoder is correct; the filter is waiting',focus:'onset',body:'Grip first appears in the raw stream at 1,075 ms. At 1,100 ms, only two consecutive grip decisions have arrived. This filter requires six, so its hand remains open while the reference and raw-decoder hands are closed.'},
  {time:1200,title:'The sixth matching decision activates grip',focus:'onset',body:'The filter sends its first grip at 1,200 ms. That is 200 ms after the annotation, but sending the first correct command is not the same as confirming a stable correct onset.'},
  {time:1300,title:'Stable confirmation arrives after the deadline',focus:'onset',body:`Five grip endpoints span 100 ms, so onset is confirmed at 1,300 ms: a ${m.onset} ms delay. The raw stream confirms at ${1000+raw.onset} ms. The filter removes some short rest bursts, but it fails this event’s 250 ms onset check.`}
 ]},
 stop:{title:'A persistent grip can be slow to stop',lesson:`The filter adds ${m.exposedMs-raw.exposedMs} ms of nonzero output during rest in this example. Confirmed release is ${m.release} ms after the offset, versus ${raw.release} ms for raw output. Both miss the 150 ms release budget.`,steps:[
  {time:3000,title:'The movement annotation ends',focus:'release',body:'The reference returns to rest at 3,000 ms. Both command streams still send grip. Every nonzero-command interval from this boundary onward contributes to unwanted activation during annotated rest.'},
  {time:3150,title:'A short rest decision is rejected',focus:'exposure',body:'The raw decoder briefly sends rest at 3,150 ms, then returns to grip. The filter requires six consecutive rest decisions, so this isolated zero does not release its grip.'},
  {time:3350,title:'Raw rest is confirmed while the filter holds on',focus:'release',body:'The continuous raw-rest run begins at 3,250 ms and reaches 100 ms at 3,350 ms. The filter has seen five consecutive zeros; it needs six. The raw hand is open, but the filtered hand is still closed.'},
  {time:3475,title:'Release confirmation arrives last',focus:'release',body:`The filtered command first becomes rest at 3,375 ms and is confirmed stable at 3,475 ms. Its release delay is ${m.release} ms. Some extra exposure also comes from suppressing the earlier brief rest decisions; exposure duration and confirmation delay measure different things.`}
 ]},
 wrong:{title:'High coverage can hide the wrong movement',lesson:`Filtered active-interior coverage is ${p(m.coverage)}, but correct output is only ${p(m.correct)}. Wrong active output occupies ${p(m.wrong)} of the interior. Coverage counts nonzero commands, even when they are wrong.`,steps:[
  {time:1100,title:'An active command is not necessarily correct',focus:'coverage',body:'The annotation asks for grip, label 1. Both command streams send label 2 instead. The turned hand makes this mismatch visible: the system is active, but it is doing the wrong movement.'},
  {time:1500,title:'The coverage-scoring interior begins',focus:'wrong',body:'Interior scoring starts 500 ms after onset, at 1,500 ms. Label 2 is still being sent. That interval counts toward active coverage and wrong active output, but not correct output.'},
  {time:1850,title:'Correct grip eventually becomes stable',focus:'onset',body:`The raw stream changes to correct grip at 1,750 ms. Stable correct onset is not confirmed until 1,850 ms, an ${m.onset} ms delay. Earlier wrong commands cannot count as correct onset.`},
  {time:2500,title:'Read coverage and correctness together',focus:'correct',body:`The hand is correct at this instant, but the whole-example table remembers the earlier errors. Coverage is ${p(m.coverage)}, correct output is ${p(m.correct)}, and wrong active output is ${p(m.wrong)}. These percentages all use the same 1,500–3,000 ms interior.`}
 ]}
 };
 return {key,params,scenario,filtered,rawMetrics:raw,metrics:m,...cases[key]};
}
