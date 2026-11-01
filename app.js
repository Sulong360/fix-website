
const CFG={url:'https://sjqarzyueqnjkjbcdcbk.supabase.co',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcWFyenl1ZXFuamtqYmNkY2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTM1MDAsImV4cCI6MjEwODk4OTUwMH0.dzpacbvXn-kwVrBVe9u9gA_6egDLjNhYHKprq0wNguo',adminEmail:'darrel.sulong360@gmail.com',ejsKey:'2erZTbQFFPOyXoJam',ejsService:'service_7oqivir',ejsTemplate:'template_tlh1mez'};
window.emailjs&&emailjs.init(CFG.ejsKey);
const sb=supabase.createClient(CFG.url,CFG.key),$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const php=n=>'₱'+Number(n||0).toLocaleString('en-PH');
const chip=s=>`<span class="chip ${['Offer Accepted','In Progress','Completed','Done','Accepted'].includes(s)?'g':['Cancelled','Declined','Withdrawn','Expired','Not started'].includes(s)?'x':''}">${esc(s)}</span>`;
const show=v=>['request','login','dash','proj','pw','admin','profile'].forEach(x=>$('v-'+x).hidden=x!==v);
let user=null;
sb.auth.onAuthStateChange((e,s)=>{if(e==='TOKEN_REFRESHED')return;user=s?.user||null;$('who').hidden=!user;$('login-link').hidden=!!user;$('who-email').textContent=user?.email||'';route()});
function showPw(){show('pw');$('pw-h').textContent='Create your new password';$('pw-s').textContent='For your security, please replace your temporary password before continuing.'}
async function expiredOut(){await sb.auth.signOut();location.hash='#login';show('login');$('lg-err').textContent='Your temporary password has expired. Please message FIX on WhatsApp (+63 992 812 2086) for a new one.'}
async function route(){const h=location.hash;if(!user)return show(h==='#login'?'login':'request');
 const {data:pr,error:pe}=await sb.from('profiles').select('role,must_change,temp_expires_at').eq('id',user.id).maybeSingle();
 if(pe){show('dash');$('plist').innerHTML='<p class="err">We could not load your account details. Please refresh, or message FIX on WhatsApp at +63 992 812 2086.</p>';return}
 if(pr?.must_change){if(pr.temp_expires_at&&new Date(pr.temp_expires_at)<new Date())return expiredOut();return showPw()}
 if(h==='#profile')return showProfile();
 if(pr?.role==='admin')return loadAdmin();
 if(h.startsWith('#project/'))return openProject(h.slice(9));loadDash()}
addEventListener('hashchange',route);
$('out').onclick=()=>sb.auth.signOut();$('new').onclick=()=>show('request');

$('req').onsubmit=async e=>{e.preventDefault();const f=e.target,btn=f.querySelector('.btn'),d=Object.fromEntries(new FormData(f));btn.disabled=true;$('req-err').textContent='';
 try{const r=await fetch(CFG.url+'/functions/v1/submit-project',{method:'POST',headers:{'Content-Type':'application/json',apikey:CFG.key,Authorization:'Bearer '+CFG.key},body:JSON.stringify(d)});
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error);
  $('done-email').textContent=d.email;f.hidden=true;$('req-done').hidden=false;scrollTo(0,0)}
 catch(x){$('req-err').textContent=x instanceof TypeError||!x.message?"We couldn't send your request. Please try again, or message us on WhatsApp at +63 992 812 2086.":x.message}
 btn.disabled=false};

$('lg').onsubmit=async e=>{e.preventDefault();$('lg-err').textContent='';const id=$('lg-email').value.trim();
 const {error}=await sb.auth.signInWithPassword({email:id.toLowerCase()==='fixadmin'?CFG.adminEmail:id,password:$('lg-pw').value});
 if(error)$('lg-err').textContent='Incorrect username or password.'};
$('pwf').onsubmit=async e=>{e.preventDefault();const a=$('pw1').value;$('pw-err').textContent='';
 if(a.length<8){$('pw-err').textContent='Use at least 8 characters.';return}
 if(a!==$('pw2').value){$('pw-err').textContent='Passwords do not match.';return}
 const {error}=await sb.auth.updateUser({password:a});
 if(error){$('pw-err').textContent=error.message;return}
 if((await sb.rpc('password_changed')).error){$('pw-err').textContent='Your temporary password has expired. Please contact FIX.';return}
 e.target.reset();route()};
$('adm-ref').onclick=()=>loadAdmin();
async function loadAdmin(){show('admin');
 const {data,error}=await sb.from('projects').select('id,title,location,budget_range,lot_sqm,notes,status,approved_at,profiles(full_name,email,mobile)').order('created_at',{ascending:false});
 if(error){$('adm-list').innerHTML='<p class="err">Could not load requests.</p>';return}
 const open=p=>!p.approved_at&&p.status!=='Cancelled';
 $('adm-sum').textContent=data.length+' projects · '+data.filter(open).length+' awaiting review';
 $('adm-list').innerHTML=data.map(p=>`<div class="card" style="margin-bottom:12px"><div class="row" style="align-items:flex-start"><div><b>${esc(p.title)}</b><div class="sub" style="margin:2px 0 0">${esc(p.profiles?.full_name)} · ${esc(p.profiles?.email)} · ${esc(p.profiles?.mobile)}<br>${esc(p.location)} · ${esc(p.budget_range)}${p.lot_sqm?' · '+esc(p.lot_sqm)+' sqm':''}</div>${p.notes?`<div class="sub" style="margin:6px 0 0;font-size:13px">${esc(p.notes)}</div>`:''}</div>${chip(p.status)}</div>${p.status==='Cancelled'?'':`<div style="margin-top:12px"><button class="btn s" data-i="${p.id}">${p.approved_at?'Reissue login':'Approve &amp; send login'}</button>${open(p)?` <button class="btn o s" data-r="${p.id}">Reject</button>`:''}</div>`}</div>`).join('')||'<p class="sub">No requests yet.</p>';
 $('adm-list').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>issue(b.dataset.i,b));
 $('adm-list').querySelectorAll('[data-r]').forEach(b=>b.onclick=async()=>{if(confirm('Reject this request?')){await sb.from('projects').update({status:'Cancelled'}).eq('id',b.dataset.r);loadAdmin()}})}
async function issue(id,btn){if(!confirm('Send login details to this client now?'))return;btn.disabled=true;btn.textContent='Sending...';
 const {data:{session}}=await sb.auth.getSession();
 const r=await fetch(CFG.url+'/functions/v1/issue-credentials',{method:'POST',headers:{'Content-Type':'application/json',apikey:CFG.key,Authorization:'Bearer '+session.access_token},body:JSON.stringify({project_id:id})});
 const d=await r.json().catch(()=>({}));
 if(!r.ok){alert(d.error||'Could not issue login.');return loadAdmin()}
 try{await emailjs.send(CFG.ejsService,CFG.ejsTemplate,{to_email:d.email,to_name:d.name,temp_password:d.temp_password,expires:d.expires,login_url:location.origin+'/portal#login'});alert('Login details sent to '+d.email)}
 catch(x){alert('Login created but the email failed. Send this manually.\nUsername: '+d.email+'\nTemporary password: '+d.temp_password+'\nExpires: '+d.expires)}
 loadAdmin()}

async function loadDash(){show('dash');
 $('demo-btn').textContent=showDemo?'Back to my projects':'Preview sample project';
 if(showDemo){$('plist').innerHTML=window.FIX_DEMO.map(projectCard).join('');return}
 const {data,error}=await sb.from('projects').select('id,title,project_type,location,status,contractor_name,progress_pct,approved_budget,amount_paid,next_milestone,pending_actions').order('created_at',{ascending:false});
 if(error){$('plist').innerHTML='<p class="err">Could not load your projects. Refresh to try again.</p>';return}
 $('plist').innerHTML=data.length?data.map(projectCard).join(''):'<p class="sub">No projects yet. Post your first project, or preview a sample project to see how your dashboard will look.</p>'}
async function openProject(id){show('proj');
 const [p,m,o]=await Promise.all([sb.from('projects').select('*').eq('id',id).single(),sb.from('milestones').select('*').eq('project_id',id).order('sort'),sb.from('offers').select('*').eq('project_id',id).order('price')]);
 if(p.error){$('pdetail').innerHTML='<p class="sub" style="margin-top:16px">Project not found.</p>';return}
 const P=p.data,O=o.data||[];
 $('pdetail').innerHTML=`<div class="row" style="margin:16px 0 6px"><h1>${esc(P.title)}</h1>${chip(P.status)}</div><p class="sub">${esc(P.location)} · ${esc(P.budget_range||'Budget not set')}</p>
 <div class="card" style="margin-bottom:16px"><label>Progress</label><ul class="tl">${(m.data||[]).map(x=>`<li><span class="dot ${x.status==='Done'?'d':x.status==='In progress'?'i':''}"></span>${esc(x.stage)}${chip(x.status)}</li>`).join('')}</ul></div>
 <div class="card"><label>Offers</label>${O.length?O.map(x=>`<div class="row" style="padding:14px 0;border-bottom:1px solid #F0F4F8"><div><b>${esc(x.contractor_name||'Verified contractor')}</b><div class="sub" style="margin:2px 0 0">${php(x.price)} · ${esc(x.weeks)} weeks<br>${esc(x.inclusions||'')}</div></div><div style="text-align:right">${chip(x.status)}${['Submitted','Viewed'].includes(x.status)?`<div style="margin-top:8px"><button class="btn s" data-a="1" data-id="${x.id}">Accept</button> <button class="btn o s" data-a="0" data-id="${x.id}">Decline</button></div>`:''}</div></div>`).join(''):'<p class="sub" style="margin:8px 0 0">No offers yet. FIX is reviewing your project and will match you with verified contractors.</p>'}</div>`;
 $('pdetail').querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{b.disabled=true;await sb.rpc('respond_offer',{p_offer:b.dataset.id,p_accept:b.dataset.a==='1'});openProject(id)})}

// ---- Phase 1: dashboard cards, sample preview, profile ----
let showDemo=false;
function projectCard(p){const F=FixFmt,pc=F.pct(p.progress_pct),T=p.demo?'div':'a',at=p.demo?'':' href="#project/'+p.id+'"';
 return `<${T}${at} class="card pc"><div class="row" style="align-items:flex-start"><div><span class="tag">${esc(F.kindLabel(p.project_type))}${p.demo?' · Sample':''}</span><b style="font-size:17px;display:block;margin-top:6px">${esc(p.title)}</b><div class="sub" style="margin:2px 0 0;font-size:13px">${esc(p.location||'Location to be confirmed')} · ${esc(p.contractor_name||'Contractor not assigned yet')}</div></div>${chip(p.status)}</div>
 <div class="row" style="margin:16px 0 6px"><span class="sub" style="margin:0;font-size:13px">Overall progress</span><b>${pc}%</b></div><div class="bar"><i style="width:${pc}%"></i></div>
 <div class="stats"><div><label>Approved budget</label><b>${p.approved_budget?F.php(p.approved_budget):'Pending quotation'}</b></div><div><label>Amount paid</label><b>${F.php(p.amount_paid)}</b></div><div><label>Next milestone</label><b>${esc(p.next_milestone||'To be scheduled')}</b></div><div><label>Pending actions</label><b>${p.pending_actions?p.pending_actions+' for you':'None'}</b></div></div></${T}>`}
$('demo-btn').onclick=()=>{showDemo=!showDemo;loadDash()};
async function showProfile(){show('profile');$('pf-ok').textContent='';$('pf-err').textContent='';$('pf-email').value=user.email;
 const {data}=await sb.from('profiles').select('full_name,mobile').eq('id',user.id).maybeSingle();$('pf-name').value=data?.full_name||'';$('pf-mobile').value=data?.mobile||''}
$('pf').onsubmit=async e=>{e.preventDefault();$('pf-err').textContent='';$('pf-ok').textContent='';
 const {error}=await sb.rpc('update_my_profile',{p_name:$('pf-name').value,p_mobile:$('pf-mobile').value});
 if(error)$('pf-err').textContent='Could not save your changes. Please try again.';else $('pf-ok').textContent='Saved.'};
