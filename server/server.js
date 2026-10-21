const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const {Room}=require('../src/gameEngine.js');
const ROOT=path.join(__dirname,'..'),PORT=process.env.PORT||3000;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const LOC={};['id','en'].forEach(l=>LOC[l]=JSON.parse(fs.readFileSync(path.join(ROOT,'locales',l+'.json'))));
const rooms=new Map(),conns=new Map();
const pub=r=>({code:r.code,name:r.name,host:(r.players.get(r.hostId)||{}).name||'-',players:r.humans().filter(p=>p.on).length,cap:r.cap,status:r.state==='lobby'?'open':'playing',match:r.match});
const srv=http.createServer((q,s)=>{
 if(q.url.startsWith('/api/rooms')){s.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  return s.end(JSON.stringify([...rooms.values()].filter(r=>r.pub).map(pub)));}
 let p=path.normalize(decodeURIComponent(q.url.split('?')[0]));if(p==='/'||p==='\\')p='/index.html';
 const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||/^[\\/]server|node_modules/.test(p)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){s.writeHead(404);return s.end('404');}
 s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(s);});
const send=(ws,o)=>ws&&ws.readyState===1&&ws.send(JSON.stringify(o));
const code=()=>{let c;do c=Math.random().toString(36).slice(2,6).toUpperCase();while(rooms.has(c)||/[01OIL]/.test(c));return c};
const wss=new WebSocketServer({server:srv,maxPayload:1024});
wss.on('connection',ws=>{let pid=null,n=0,t0=Date.now();
 ws.on('message',d=>{if(Date.now()-t0>1000){t0=Date.now();n=0}if(++n>10)return;let m;try{m=JSON.parse(d)}catch{return}
  if(m.t==='hello'){if(typeof m.id!=='string'||!/^[\w-]{4,24}$/.test(m.id))return;pid=m.id;
   const c=conns.get(pid)||{ws,room:null};c.ws=ws;conns.set(pid,c);
   if(c.room&&rooms.has(c.room.code)){c.room.add(pid);}else c.room=null;return send(ws,{t:'hello'});}
  const c=pid&&conns.get(pid);if(!c)return;
  if(m.t==='create'&&!c.room){const lang=m.lang==='en'?'en':'id';let r;
   r=new Room({code:code(),name:String(m.name||'Room').slice(0,20),pub:!!m.pub,cap:Math.min(10,Math.max(3,+m.cap||8)),words:LOC[lang].words,gen:LOC[lang].gen,
    onChange:()=>r.humans().forEach(p=>{const x=conns.get(p.id);p.on&&x&&send(x.ws,{t:'state',s:r.snapshot(p.id)})})});
   rooms.set(r.code,r);r.add(pid,m.pname);c.room=r;}
  else if(m.t==='join'&&!c.room){const r=rooms.get(String(m.code||'').toUpperCase());
   if(!r)return send(ws,{t:'err',e:'no_room'});if(!r.add(pid,m.pname))return send(ws,{t:'err',e:'full'});c.room=r;}
  else if(m.t==='leave'&&c.room){c.room.drop(pid);c.room=null;send(ws,{t:'left'});}
  else if(c.room)c.room.act(pid,m);});
 ws.on('close',()=>{const c=pid&&conns.get(pid);if(c&&c.ws===ws&&c.room)c.room.drop(pid);});});
setInterval(()=>{for(const [k,r] of rooms)if(!r.humans().some(p=>p.on)){r.empty=r.empty||Date.now();if(Date.now()-r.empty>60000){clearTimeout(r.T);rooms.delete(k)}}else r.empty=0},15000);
srv.listen(PORT,'0.0.0.0',()=>console.log('Who Is Spy server on :'+PORT));
