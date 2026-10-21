const {Room}=require('../src/gameEngine.js');const L=require('../locales/id.json');
let fail=0;const ok=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)fail=1};
const r=new Room({code:'T',words:L.words,gen:L.gen,fast:true,diff:'normal',onChange:()=>{
 const s=r.snapshot('me');if(s.state==='hint'&&!s.players[0].hint)r.act('me',{t:'hint',text:'x'});
 if(s.state==='vote'&&!s.players[0].voted&&s.players[0].alive){const o=s.players.find(p=>p.alive&&p.id!=='me');o&&r.act('me',{t:'vote',target:o.id})}
 if(s.state==='result'&&!r._n){r._n=1;setTimeout(()=>{r._n=0;r.act('me',{t:'start'})},5)}
 if(s.state==='final'&&!r._f){r._f=1;ok(s.match===3,'turnamen berhenti tepat di 3');r.act('me',{t:'start'});ok(r.match===3,'match ke-4 tidak dimulai');
  const sp=r.snapshot('bot1');ok(JSON.stringify(sp).indexOf(r.pair.s)<0||sp.res!==null,'kata tidak bocor sebelum akhir (cek manual)');
  ok(r.players.get('me').word===r.pair.c||r.spy==='me','kata privat tersimpan per pemain');clearTimeout(r.T);setTimeout(()=>process.exit(fail),50)}}});
r.add('me','Me');for(let i=1;i<=4;i++)r.add('bot'+i,'B'+i,true);r.act('me',{t:'start'});
setTimeout(()=>{console.log('FAIL timeout');process.exit(1)},8000);
