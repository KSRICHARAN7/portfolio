// Illustrative poses only: the replay engine remains the source of command timing.
export const HAND_EXAMPLES = Object.freeze({
 start:{scenario:'bursts',family:'asymmetric',activation:6,release:2,n:3,time:1100},
 stop:{scenario:'slow-release',family:'asymmetric',activation:1,release:6,n:3,time:3350},
 wrong:{scenario:'wrong-command',family:'asymmetric',activation:1,release:2,n:3,time:1250}
});
export function handState(annotation,command){
 if(![0,1,2].includes(annotation)||![0,1,2].includes(command))throw Error('Unknown demonstration label');
 const pose=['Open hand','Closed grip','Turned hand'][command];
 const matches=annotation===command;
 const status=matches?'Matches annotation':annotation===0?'Active during rest':command===0?'Inactive during movement':'Wrong movement';
 return {command,pose,matches,status};
}
function handSVG(command,id){
 const closed=command===1,turned=command===2;
 const fingers=closed
 ?[72,99,126,153].map((x,i)=>`<rect x="${x}" y="128" width="25" height="58" rx="11" fill="${i%2?'#d5deef':'#e4eaf5'}"/><path d="M${x+5} 151h15M${x+6} 169h13" fill="none" stroke="#9aaac5" stroke-width="2"/><rect x="${x+5}" y="133" width="15" height="13" rx="4" fill="#f7f9fd" stroke="none"/>`).join('')
 :[[72,71,84],[99,47,106],[126,54,103],[153,78,82]].map(([x,y,h])=>`<rect x="${x}" y="${y}" width="24" height="${h}" rx="11" fill="#e2e9f5"/><path d="M${x+4} ${y+h*.48}h16M${x+5} ${y+h*.73}h14" stroke="#9aaac5" stroke-width="2" fill="none"/><rect x="${x+5}" y="${y+7}" width="14" height="17" rx="5" fill="#f7f9fd" stroke="none"/>`).join('');
 return `<svg viewBox="0 0 250 290" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${['Open hand representing rest, command zero','Closed grip representing command one','Turned open hand representing other movement, command two'][command]}</title><ellipse cx="125" cy="269" rx="66" ry="9" fill="#dce4f0"/><g transform="${turned?'rotate(-24 125 230)':'rotate(0 125 230)'}" stroke="#63748e" stroke-width="2.3" stroke-linejoin="round"><path d="M104 231h52l6 36h-64z" fill="#8797af"/><rect x="98" y="226" width="65" height="17" rx="5" fill="#c3cedf"/><path d="M72 143Q71 130 86 130h73q19 0 19 18v49q0 32-31 38h-24q-25-4-36-25l-15-28z" fill="#edf2fa"/>${fingers}${closed?'<path d="M84 181q2-13 15-10l46 14q13 5 7 16-4 9-16 5l-37-11-3 18q-2 12-13 6-9-6-4-18z" fill="#d5deef"/><path d="m104 178-5 17m25-10-4 17" stroke="#9aaac5" fill="none"/>':'<path d="M82 176 61 153q-8-9-15-1-7 8 0 18l31 47q7 11 16 4l8-6" fill="#d5deef"/><path d="m58 173 13-9" stroke="#9aaac5"/>'}<path d="M112 218h34" stroke="#aebbd1" stroke-width="3" stroke-linecap="round"/><circle cx="125" cy="235" r="3" fill="#63748e" stroke="none"/></g>${turned?'<path d="M187 73q25 22 21 50m0 0-10-10m10 10 8-12" fill="none" stroke="#df7443" stroke-width="3" stroke-linecap="round"/>':''}</svg>`;
}
export function renderHandScene(annotation,raw,filtered){
 const streams=[['annotation','Annotation',annotation],['raw','Raw decoder',raw],['filtered','Filtered',filtered]];
 return streams.map(([id,name,command])=>{
  const state=handState(annotation,command),reference=id==='annotation';
  return `<article class="hand-card ${reference?'hand-reference':state.matches?'hand-match':'hand-mismatch'}" data-stream="${id}" data-command="${command}"><h4>${name}</h4>${handSVG(command,'hand-'+id)}<p class="hand-pose">${state.pose}</p><span class="hand-code">Command ${command}</span><p class="hand-status">${reference?'Reference annotation':state.status}</p></article>`;
 }).join('');
}
export function momentDescription(annotation,raw,filtered){
 const f=handState(annotation,filtered),r=handState(annotation,raw);
 if(annotation===0&&filtered!==0&&raw===0)return 'The raw decoder has returned to rest, but the filter is still sending an active command. This makes the extra release delay visible.';
 if(annotation===0&&filtered!==0)return 'The annotation says rest, but the filtered command is active. This interval contributes to unwanted activation in annotated rest.';
 if(annotation!==0&&filtered===0&&raw===annotation)return 'The decoder is already correct, but the filter has not activated. Waiting for repeated decisions adds start delay.';
 if(annotation!==0&&filtered===0)return 'The annotation asks for movement, but the filtered command is inactive. Use the timeline to see whether activation follows.';
 if(annotation!==0&&filtered!==annotation)return 'The hand shows the wrong movement. A nonzero command can increase coverage while still being incorrect.';
 if(!r.matches)return 'The filtered command matches the annotation at this instant, while the raw decoder does not. Compare the whole-example metrics before judging the tradeoff.';
 return annotation===0?'All three are at rest. Press Play or choose a highlighted moment to watch the commands diverge.':'The command matches the movement annotation at this instant. This alone does not mean the stable-onset requirement has been confirmed.';
}
