const $=s=>document.querySelector(s),esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const me=sessionStorage.pid||(sessionStorage.pid='p'+Math.random().toString(36).slice(2,10));
let LC={},lang=localStorage.lang||'id',S=null,act=null,net=null,local=null,off=false,base=CONFIG.SELF_HOSTED,tm=0;
const t=k=>(LC[lang].ui[k]||k),nm=()=>(localStorage.nm||'');
const app=h=>{$('#app').innerHTML=`<h1>${t('title')}</h1>`+h};
if(localStorage.calm)document.body.classList.add('calm');
async function init(){for(const l of['id','en'])LC[l]=await(await fetch('locales/'+l+'.json')).json();home();}
function langSel(){return`<div class="row"><select onchange="lang=this.value;localStorage.lang=lang;S?draw():home()"><option value="id" ${lang=='id'?'selected':''}>Bahasa Indonesia</option><option value="en" ${lang=='en'?'selected':''}>English</option></select><button class="g" onclick="localStorage.calm=localStorage.calm?'':1;document.body.classList.toggle('calm')">${t('calm')}</button></div>`}
function home(){S=null;if(net){net.close();net=null}if(local){clearTimeout(local.T);local=null}
 app(`<div class="card"><input id="nm" placeholder="${t('name')}" value="${esc(nm())}" maxlength="16" oninput="localStorage.nm=this.value">
 <button onclick="sp('normal')">▶ ${t('sp')} — ${t('sp_d')}</button><div class="row"><button class="g" onclick="sp('easy')">${t('easy')}</button><button class="g" onclick="sp('normal')">${t('normal')}</button><button class="g" onclick="sp('hard')">${t('hard')}</button></div></div>
 <div class="card"><b>${t('rid')}</b><div class="sm">${t('rid_d')}</div><input id="rn" placeholder="Room" maxlength="20"><label class="sm"><input type="checkbox" id="pb" style="width:auto;min-height:0"> ${t('pubroom')}</label>
 <button onclick="online('create')">${t('create')}</button><input id="cd" placeholder="${t('code')}" maxlength="4" style="text-transform:uppercase;margin-top:8px"><button class="g" onclick="online('join')">${t('join')}</button></div>
 <div class="card"><button class="g" onclick="list()">🌐 ${t('srv')}</button><div class="sm">${t('srv_d')}</div></div>
 <div class="card"><b>${t('lan')}</b><div class="sm">${t('lan_d')}</div><input id="sv" placeholder="${t('server_url')}" value="${esc(localStorage.sv||'')}"><div class="sm">${t('suga')}</div></div>${langSel()}<div id="msg" class="err"></div>`)}
function useServer(){const v=($('#sv')||{}).value||localStorage.sv||'';localStorage.sv=v;base=v?{http:'http://'+v,ws:'ws://'+v}:CONFIG.SELF_HOSTED}
function sp(d){nm()||(localStorage.nm='Agent');const r=new Engine.Room({code:'LOCAL',words:LC[lang].words,gen:LC[lang].gen,diff:d,onChange:()=>{S=r.snapshot(me);draw()}});
 local=r;r.add(me,nm());for(let i=1;i<=4;i++)r.add('bot'+i,'Bot '+i,true);act=m=>r.act(me,m);r.act(me,{t:'start'});}
function conn(first){useServer();off=false;net=NetworkAdapter.connect('ws',base.ws,me,m=>{
 if(m.t==='status'){off=!m.ok;if(m.ok)first();else if(S)draw();else if($('#msg'))$('#msg').textContent=t('err_conn')}
 else if(m.t==='state'){S=m.s;draw()}else if(m.t==='err'){$('#msg')&&($('#msg').textContent=t(m.e))}else if(m.t==='left')home()});act=m=>net.send(m)}
function online(k){nm()||(localStorage.nm='Agent');const o=k==='create'?{t:'create',name:$('#rn').value||nm()+"'s room",pub:$('#pb').checked,lang,pname:nm()}:{t:'join',code:$('#cd').value,pname:nm()};
 conn(()=>net.send(o))}
async function list(){useServer();try{const r=await NetworkAdapter.rooms(base.http);
 app(`<div class="card"><button class="g" onclick="list()">↻ ${t('refresh')}</button>`+(r.length?r.map(x=>`<div class="rm card"><div><b>${esc(x.name)}</b><div class="sm">${t('host')}: ${esc(x.host)} · ${x.players}/${x.cap} · ${t(x.status)}</div></div><button ${x.status!='open'?'disabled':''} onclick="joinCode('${x.code}')">${t('join')}</button></div>`).join(''):`<p>${t('none')}</p>`)+`<button class="g" onclick="home()">${t('back')}</button></div>`)}
 catch{app(`<div class="card err">${t('err_conn')}</div><button class="g" onclick="home()">${t('back')}</button>`)}}
function joinCode(c){nm()||(localStorage.nm='Agent');conn(()=>net.send({t:'join',code:c,pname:nm()}))}
function leave(){local?home():net?net.send({t:'leave'}):home()}
function draw(){if(!S)return;const ps=S.players,mine=ps.find(p=>p.id===S.you)||{},host=S.hostId===S.you;
 const board=[...ps].sort((a,b)=>b.score-a.score).map(p=>`<div class="rm"><span class="${p.id===S.you?'me':''} ${p.alive?'':'dead'}">${esc(p.name)}${p.id===S.hostId?' ★':''}${p.on?'':' ⚠'}</span><b>${p.score}</b></div>`).join('');
 let b=`<div class="sm">${esc(S.name)} · ${S.code!=='LOCAL'?t('code')+': <b>'+S.code+'</b>':''} · ${t('match')} ${S.match}/3 · ${t('round')} ${S.round} ${off?'<span class="err">⚠</span>':''}</div>`;
 if(S.state==='lobby'){b+=`<div class="card"><b>${t('lobby')}</b>${board}${S.code!=='LOCAL'?`<button class="g" onclick="navigator.clipboard&&navigator.clipboard.writeText('${S.code}');this.textContent=t('copied')">${t('copy')}</button>`:''}${host?`<button ${ps.length<3?'disabled':''} onclick="act({t:'start'})">${t('start')}</button>${ps.length<3?`<div class=sm>${t('min3')}</div>`:''}`:`<div class=sm>${t('wait_host')}</div>`}</div>`}
 else{b+=`<div class="card"><div class="sm">${t('your_word')}</div><div class="word">${esc(S.word||'')}</div><div class="sm" style="text-align:center">${S.state=='hint'?t('hint_phase'):S.state=='vote'?t('vote_phase'):''} <b id="tm"></b></div></div>`;
  if(S.res&&S.state!=='result'&&S.state!=='final')b+=`<div class="sm">${S.res.out?t('out')+': '+esc(S.res.outName):t('tie')}</div>`;
  b+=`<div class="card">`+ps.map(p=>`<div class="rm"><span class="${p.alive?'':'dead'} ${p.id===S.you?'me':''}">${esc(p.name)}</span><span>${p.hint?esc(p.hint):''}${S.state=='vote'&&p.voted?' ✓':''}</span>${S.state=='vote'&&mine.alive&&!mine.voted&&p.alive&&p.id!==S.you?`<button onclick="act({t:'vote',target:'${p.id}'})">🗳</button>`:''}</div>`).join('')+`</div>`;
  if(S.state=='hint'&&mine.alive&&!mine.hint)b+=`<div class="row"><input id="hi" maxlength="30" placeholder="${t('hint_ph')}"><button style="width:90px" onclick="act({t:'hint',text:$('#hi').value})">${t('send')}</button></div>`;
  if(S.state=='result'||S.state=='final'){const r=S.res;b+=`<div class="card"><h2>${r.winner=='civ'?t('civ_win'):t('spy_win')}</h2>${t('spy_was')}: <b>${esc(r.spyName)}</b> (${esc(r.pair.s)} / ${esc(r.pair.c)})<h3>${S.state=='final'?t('final'):t('standings')}</h3>${board}`+
   (S.state=='final'?`<h2>🏆 ${t('champ')}: ${esc([...ps].sort((a,b)=>b.score-a.score)[0].name)}</h2>`:host?`<button onclick="act({t:'start'})">${t('next')}</button>`:`<div class=sm>${t('wait_host')}</div>`)+`</div>`}}
 if(S.code!=='LOCAL')b+=`<div class="card"><div class="sm">${t('chat')}</div><div class="chat">${S.chat.map(c=>`<div><b>${esc(c.n)}</b>: ${esc(c.x)}</div>`).join('')}</div><div class="row"><input id="ci" maxlength="120"><button style="width:90px" onclick="act({t:'chat',text:$('#ci').value});$('#ci').value=''">${t('send')}</button></div></div>`;
 const keep=($('#hi')||{}).value,keepC=($('#ci')||{}).value;app(b+`<button class="g" onclick="leave()">${t('leave')}</button>`);if($('#hi')&&keep)$('#hi').value=keep;if($('#ci')&&keepC)$('#ci').value=keepC;
 clearInterval(tm);const u=()=>{const e=$('#tm');e&&S.deadline&&(e.textContent=Math.max(0,Math.ceil((S.deadline-Date.now())/1000))+'s')};u();tm=setInterval(u,500);}
init();
