(function(g){const rnd=a=>a[Math.floor(Math.random()*a.length)];
const BotAI={
hint(p,r){const spy=r.spy===p.id,d=r.diff;
 return(!spy||d==='hard'||(d==='normal'&&Math.random()<.5))?rnd(r.pair.h):rnd(r.gen);},
vote(p,r){const c=[...r.players.values()].filter(x=>x.alive&&x.id!==p.id);
 const known=r.pair.h.map(x=>x.toLowerCase()),n=r.diff==='easy'?2:r.diff==='normal'?1:.4;
 const sc=x=>(x.hint&&!known.includes(String(x.hint).toLowerCase())?1:0)+Math.random()*n;
 return(r.spy===p.id?rnd(c):c.sort((a,b)=>sc(b)-sc(a))[0]).id;}};
if(typeof module!=='undefined')module.exports=BotAI;else g.BotAI=BotAI;})(this);
