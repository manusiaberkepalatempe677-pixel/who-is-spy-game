// Mesin game otoritatif: dipakai server (online/LAN) dan mode singleplayer lokal.
(function(g){const BotAI=typeof require!=='undefined'?require('./botAI.js'):g.BotAI;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
class Room{
constructor(o){Object.assign(this,{code:o.code,name:o.name||'Room',cap:o.cap||8,pub:!!o.pub,words:o.words,gen:o.gen,diff:o.diff||'normal',fast:!!o.fast,
 onChange:o.onChange||(()=>{}),hostId:null,state:'lobby',match:0,round:0,players:new Map(),chat:[],deadline:0,spy:null,pair:null,res:null,T:null,last:{}});}
humans(){return[...this.players.values()].filter(p=>!p.bot)}
alive(){return[...this.players.values()].filter(p=>p.alive)}
add(id,name,bot){const ex=this.players.get(id);if(ex){ex.on=true;this.onChange();return true}
 if(this.state!=='lobby'||this.players.size>=this.cap)return false;
 this.players.set(id,{id,name:String(name||'Agent').slice(0,16),bot:!!bot,alive:true,score:0,on:true,hint:null,vote:null,word:null});
 if(!bot&&!this.hostId)this.hostId=id;this.onChange();return true;}
drop(id){const p=this.players.get(id);if(!p)return;
 if(this.state==='lobby')this.players.delete(id);else p.on=false;
 if(this.hostId===id){const n=this.humans().find(x=>x.on&&x.id!==id);this.hostId=n?n.id:null}
 this.onChange();if(this.state==='hint'||this.state==='vote')this.check();}
act(id,m){const p=this.players.get(id);if(!p||!m)return;
 if(m.t==='start'&&id===this.hostId&&(this.state==='lobby'||this.state==='result'))this.start();
 else if(m.t==='hint')this.hint(id,m.text);else if(m.t==='vote')this.vote(id,m.target);
 else if(m.t==='chat'){const x=String(m.text||'').trim().slice(0,120),now=Date.now();
  if(!x||now-(this.last[id]||0)<700)return;this.last[id]=now;this.chat.push({n:p.name,x,at:now});this.chat=this.chat.slice(-50);this.onChange();}}
start(){if(this.players.size<3||this.match>=3)return;this.match++;this.round=1;this.res=null;
 this.pair=rnd(this.words);
 this.players.forEach(p=>{p.alive=p.on||p.bot;p.hint=null;p.vote=null});
 this.spy=rnd(this.alive()).id;this.players.forEach(p=>p.word=p.id===this.spy?this.pair.s:this.pair.c);this.phase('hint',45);}
phase(s,sec){this.state=s;this.deadline=Date.now()+sec*1000;clearTimeout(this.T);this.T=setTimeout(()=>this.adv(),sec*1000);
 this.alive().filter(p=>p.bot).forEach(b=>setTimeout(()=>{if(this.state!==s||!b.alive)return;
  s==='hint'?this.hint(b.id,BotAI.hint(b,this)):this.vote(b.id,BotAI.vote(b,this))},this.fast?5:1200+Math.random()*3000));
 this.onChange();}
hint(id,text){const p=this.players.get(id);if(this.state!=='hint'||!p||!p.alive||p.hint)return;
 p.hint=String(text||'').trim().slice(0,30)||'-';this.onChange();this.check();}
vote(id,tg){const p=this.players.get(id),t=this.players.get(tg);if(this.state!=='vote'||!p||!p.alive||p.vote||!t||!t.alive||tg===id)return;
 p.vote=tg;this.onChange();this.check();}
check(){const k=this.state==='hint'?'hint':'vote';if(this.alive().every(p=>p[k]||(!p.on&&!p.bot)))this.adv();}
adv(){if(this.state==='hint'){this.alive().forEach(p=>{if(!p.hint)p.hint='-';p.vote=null});this.phase('vote',30)}
 else if(this.state==='vote')this.tally();}
tally(){const c={};this.alive().forEach(p=>{if(p.vote)c[p.vote]=(c[p.vote]||0)+1});
 const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);let out=null;
 if(e.length&&(e.length===1||e[0][1]>e[1][1])){out=e[0][0];this.players.get(out).alive=false}
 this.res={out,outName:out&&this.players.get(out).name,counts:c};
 if(out===this.spy)return this.end('civ');if(this.alive().length<=2)return this.end('spy');
 this.round++;this.players.forEach(p=>{p.hint=null;p.vote=null});this.phase('hint',45);}
end(w){clearTimeout(this.T);this.players.forEach(p=>{if(w==='civ'&&p.id!==this.spy)p.score+=2;if(w==='spy'&&p.id===this.spy)p.score+=4});
 Object.assign(this.res,{winner:w,spy:this.spy,spyName:this.players.get(this.spy).name,pair:this.pair});
 this.state=this.match>=3?'final':'result';this.deadline=0;this.onChange();}
snapshot(pid){const me=this.players.get(pid);
 return{code:this.code,name:this.name,state:this.state,match:this.match,round:this.round,deadline:this.deadline,hostId:this.hostId,you:pid,
 word:this.state==='lobby'||!me?null:me.word,res:this.res,chat:this.chat.slice(-30),
 players:[...this.players.values()].map(p=>({id:p.id,name:p.name,alive:p.alive,score:p.score,on:p.on,bot:p.bot,hint:p.hint,voted:p.vote!=null}))};}}
if(typeof module!=='undefined')module.exports={Room};else g.Engine={Room};})(this);
