export class TourPlayer{
 constructor(scenes,{voice=null,onScene=()=>{},onState=()=>{},clock=null}={}){
  this.scenes=scenes;this.voice=voice;this.onScene=onScene;this.onState=onState;this.clock=clock||{now:()=>Date.now(),set:(f,t)=>setInterval(f,t),clear:id=>clearInterval(id)};this.index=0;this.mode='captions';this.playing=false;this.elapsed=0;this.generation=0;this.timer=null;this.started=0;this.pausedVoice=false;this.message='Ready';this.onScene(this.index);this.emit();
 }
 state(){const prior=this.scenes.slice(0,this.index).reduce((a,s)=>a+s.seconds,0),total=this.scenes.reduce((a,s)=>a+s.seconds,0);return{index:this.index,mode:this.mode,playing:this.playing,progress:Math.min(100,(prior+Math.min(this.elapsed,this.scenes[this.index].seconds))/total*100),message:this.message};}
 emit(){this.onState(this.state());}
 stopVoice(){this.generation++;this.voice?.cancel();this.pausedVoice=false;}
 pause(){if(!this.playing)return;this.elapsed+=(this.clock.now()-this.started)/1000;this.playing=false;this.clock.clear(this.timer);this.timer=null;if(this.mode==='voice'){this.voice?.pause();this.pausedVoice=true;}this.message='Paused';this.emit();}
 play(mode='voice'){
  if(this.message==='Tour complete')this.seek(0);
  if(this.playing&&this.mode===mode){this.pause();return;}
  const supported=mode==='voice'&&this.voice;
  if(mode!==this.mode){this.stopVoice();this.elapsed=0;}
  this.mode=supported?'voice':'captions';
  if(this.playing)this.clock.clear(this.timer);this.playing=true;this.started=this.clock.now();
  this.message=mode==='voice'&&!supported?'Browser narration is unavailable. Playing captions instead.':this.mode==='voice'?'Narration playing':'Captions playing';
  if(this.mode==='voice'){
   if(this.pausedVoice){this.voice.resume();this.pausedVoice=false;}
   else{const token=++this.generation;this.voice.speak(this.scenes[this.index].narration,()=>{if(token===this.generation&&this.playing)this.advance();},()=>{if(token===this.generation)this.fallback();});}
  }
  this.timer=this.clock.set(()=>{if(!this.playing)return;const t=this.elapsed+(this.clock.now()-this.started)/1000;
   if(this.mode==='captions'&&t>=this.scenes[this.index].seconds){this.advance();return;}
   if(this.mode==='voice'&&t>this.scenes[this.index].seconds+15){this.fallback();return;}
   const saved=this.elapsed;this.elapsed=t;this.emit();this.elapsed=saved;
  },200);this.emit();
 }
 fallback(){this.stopVoice();this.clock.clear(this.timer);this.playing=false;this.elapsed=0;this.play('captions');this.message='Narration could not continue. Playing captions instead.';this.emit();}
 advance(){const mode=this.mode;this.stopVoice();this.clock.clear(this.timer);this.playing=false;this.elapsed=0;
  if(this.index===this.scenes.length-1){this.elapsed=this.scenes[this.index].seconds;this.message='Tour complete';this.emit();return;}
  this.index++;this.onScene(this.index);this.play(mode);
 }
 seek(index){this.stopVoice();this.clock.clear(this.timer);this.timer=null;this.playing=false;this.index=Math.max(0,Math.min(this.scenes.length-1,index));this.elapsed=0;this.message='Paused at scene '+(this.index+1);this.onScene(this.index);this.emit();}
 restart(){this.seek(0);this.message='Ready';this.emit();}
}
