// Backend aktif: server Node.js sendiri. Suga: implementasikan SugaTransport setelah API diterima.
class WsTransport{
 constructor(url,id,on){this.url=url;this.id=id;this.on=on;this.tries=0;this.closed=false;this.open();}
 open(){this.ws=new WebSocket(this.url);const to=setTimeout(()=>this.ws.close(),8000);
  this.ws.onopen=()=>{clearTimeout(to);this.tries=0;this.ws.send(JSON.stringify({t:'hello',id:this.id}));this.on({t:'status',ok:true})};
  this.ws.onmessage=e=>{try{this.on(JSON.parse(e.data))}catch{}};
  this.ws.onclose=()=>{clearTimeout(to);this.on({t:'status',ok:false});if(!this.closed)setTimeout(()=>this.open(),Math.min(8000,500*2**this.tries++))};}
 send(o){this.ws.readyState===1&&this.ws.send(JSON.stringify(o))}
 close(){this.closed=true;this.ws.close()}}
class NetworkAdapter{
 static async rooms(base){const r=await fetch(base+'/api/rooms',{cache:'no-store'});if(!r.ok)throw new Error('http');return r.json()}
 static connect(kind,url,id,on){if(kind==='suga')throw new Error('SUGA_NOT_CONFIGURED');return new WsTransport(url,id,on)}}
