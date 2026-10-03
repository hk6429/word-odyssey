import { createAuthController, OWNER_KEY } from './auth-state.js';
let config=null, hooks=null, user=null, status='local', controller=null;
const en=()=>hooks?.getLocale()==='en';
const say=(zh,english)=>en()?english:zh;
const escape=text=>String(text||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function note(message){const el=document.querySelector('#auth-notice');if(el)el.textContent=message;}
async function request(path,options={}){const response=await fetch(path,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...options});let data;try{data=await response.json();}catch{throw Error('network');}if(!response.ok){const err=new Error(data.error||'network');err.data=data;err.status=response.status;throw err;}return data;}
function render(){
 const el=document.querySelector('#auth-controls');if(!el)return;
 const label={local:say('Google 登入','Sign in with Google'),saved:say('紀錄已同步','Progress synced'),saving:say('儲存中…','Saving…'),error:say('同步失敗，保留本機進度','Sync failed; progress kept locally')}[status];
 el.innerHTML=user?`<div class="account-block"><span class="account-name">${escape(user.name)}</span><small>${label}</small><button id="google-logout" class="text-button">${say('登出','Sign out')}</button></div>`:`<button id="google-login" class="google-login"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.3l-3.3-2.5a6 6 0 0 1-9-3H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14.2a6 6 0 0 1 0-4.4V7.2H3a10 10 0 0 0 0 9.6Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3 7.2l3.4 2.6A6 6 0 0 1 12 6Z"/></svg>${say('Google 登入','Google sign-in')}</button>`;
 if(user)document.querySelector('#google-logout').onclick=async()=>{try{await controller.logout();}catch{status='error';render();}};
 else document.querySelector('#google-login').onclick=openLogin;
 hooks?.onAuthChange?.({user,status});
}
async function openLogin(){
 let dialog=document.querySelector('#account-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='account-dialog';document.body.append(dialog);}
 dialog.innerHTML=`<div class="account-dialog-inner"><button class="icon-button account-close" aria-label="${say('關閉','Close')}">×</button><h2>${say('把你的旅程帶在身邊','Take your journey with you')}</h2><p>${say('登入後，將學習進度與冒險角色儲存在這個網站的伺服器。','Sign in to save your learning progress and adventure profile on this website’s server.')}</p><div id="google-button"></div><p id="auth-notice" role="status"></p></div>`;
 dialog.querySelector('.account-close').onclick=()=>dialog.close();dialog.showModal();
 if(!config?.configured){note(say('Google 登入尚待網站管理者完成設定。目前可以先以訪客開始，進度會保存在這個瀏覽器。','Google sign-in is awaiting site configuration. You can start as a guest; progress will stay in this browser.'));return;}
 try{
  if(!window.google?.accounts?.id){await new Promise((resolve,reject)=>{const existing=document.querySelector('#google-gsi');if(existing)existing.remove();const script=document.createElement('script');script.id='google-gsi';script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
  window.google.accounts.id.initialize({client_id:config.googleClientId,callback:credentialReceived,auto_select:false});
  window.google.accounts.id.renderButton(document.querySelector('#google-button'),{theme:'outline',size:'large',type:'standard',text:'signin_with',locale:en()?'en':'zh_TW'});
 }catch{note(say('登入服務暫時無法載入，請稍後再試。','The sign-in service could not load. Please try again.'));}
}
async function credentialReceived(response){
 try{if(await controller.signIn(response.credential))document.querySelector('#account-dialog')?.close();}
 catch{note(say('登入未完成。請確認 Google 登入設定後重試；本機進度仍保留。','Sign-in was not completed. Check the sign-in configuration and try again; local progress is safe.'));}
}
export async function initAuth(options){hooks=options;render();if(new URLSearchParams(location.search).has('test')){config={configured:false};return;}
 controller=createAuthController({storage:localStorage,request,getSnapshot:hooks.getSnapshot,applySnapshot:hooks.applySnapshot,onChange:next=>{user=next.user;status=next.status;render();}});
 try{config=await request('/api/config');await controller.restoreSession();}catch{status='error';render();}
}
export function refreshAuthLanguage(){render();}
export function queueCloudSave(snapshot){try{controller?.queue(snapshot);}catch{status='error';render();}}
export function canUseLocalSnapshot(options){return controller?.canUseLocalSnapshot(options)??true;}
window.addEventListener('storage',event=>{if(event.key===OWNER_KEY)controller?.canUseLocalSnapshot();});
window.addEventListener('online',()=>{void controller?.flush();});
