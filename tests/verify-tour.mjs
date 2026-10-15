import assert from'node:assert/strict';
import{TOUR_SCENES}from'../emg/tour-data.mjs';
import{TourPlayer}from'../emg/tour-player.mjs';
assert.equal(TOUR_SCENES.length,6);const total=TOUR_SCENES.reduce((a,s)=>a+s.seconds,0);assert.ok(total>=110&&total<=140);
let now=0,serial=0;const timers=new Map(),clock={now:()=>now,set:fn=>{timers.set(++serial,fn);return serial;},clear:id=>timers.delete(id)};
function tick(seconds){now+=seconds*1000;for(const fn of [...timers.values()])fn();}
let current=-1,state;const p=new TourPlayer(TOUR_SCENES,{clock,onScene:i=>current=i,onState:s=>state=s});
p.play('captions');tick(3);p.pause();const progress=state.progress;tick(30);assert.equal(state.progress,progress);assert.equal(current,0);
p.play('captions');tick(TOUR_SCENES[0].seconds);assert.equal(current,1);p.seek(4);assert.equal(p.playing,false);assert.equal(current,4);p.restart();assert.equal(current,0);
p.play('voice');assert.equal(p.mode,'captions');assert.ok(state.message.includes('unavailable'));p.restart();p.play('captions');for(const s of TOUR_SCENES)tick(s.seconds+.1);assert.equal(state.message,'Tour complete');assert.equal(state.progress,100);assert.equal(p.playing,false);p.play('captions');assert.equal(current,0);
p.restart();let ended,failed,cancelled=0,paused=0,resumed=0;
const voice={speak:(text,end,error)=>{ended=end;failed=error;},cancel:()=>cancelled++,pause:()=>paused++,resume:()=>resumed++};
const v=new TourPlayer(TOUR_SCENES,{clock,voice});v.play('voice');const old=ended;v.seek(2);old();assert.equal(v.index,2);assert.equal(v.playing,false);v.play('voice');v.pause();assert.equal(paused,1);v.play('voice');assert.equal(resumed,1);ended();assert.equal(v.index,3);failed();assert.equal(v.mode,'captions');assert.ok(v.message.includes('could not continue'));assert.ok(cancelled>0);
v.restart();v.play('voice');tick(TOUR_SCENES[0].seconds+16);assert.equal(v.mode,'captions');
console.log('PASS: six scenes, ~126-second script, caption timing, pause/resume, restart, seek, stale voice callbacks and speech-error/watchdog fallback.');
