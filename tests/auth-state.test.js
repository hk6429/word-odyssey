import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthController,mergeSnapshots,OWNER_KEY,backupKey} from '../auth-state.js';
import {createState,startSession,learnNext,answer} from '../engine.js';

const adventure=(role=null,choices={})=>({version:1,seed:123,role,choices});
const snapshot=(role=null,locale='zh',progress=createState())=>({progress,adventure:adventure(role),locale});
const record=(id,value,revision=0)=>({user:{id,name:id},snapshot:value,revision});
function earnedState(){const state=createState(),q=startSession(state,1);while(q.phase!=='complete'){if(q.phase==='learn')learnNext(state,q);else answer(state,q,true);}return state;}
function memoryStorage(){const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};}
function setup({local=snapshot(),storage=memoryStorage(),request}={}){
 let current=structuredClone(local);const applied=[],scheduled=[];
 const controller=createAuthController({storage,request,getSnapshot:()=>structuredClone(current),applySnapshot:async value=>{current=structuredClone(value);applied.push(current);},schedule:fn=>{scheduled.push(fn);return fn;},cancel:()=>{}});
 return{controller,storage,applied,get local(){return current;},edit(value){current=structuredClone(value);controller.queue(value);}};
}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}

test('zero-word server role, locale and choices win over a fresh device and trigger no upload',async()=>{
 const remote=snapshot('cartographer','en');remote.adventure.choices={'1:1':{action:'kindness',role:'cartographer'}};
 const requests=[];
 const app=setup({request:async(path,options)=>{requests.push(path);return record('a',remote,7);}});
 await app.controller.restoreSession();await app.controller.flush();
 assert.deepEqual(app.local,remote);assert.equal(app.controller.getState().revision,7);assert.equal(app.controller.getState().pending,null);
 assert.deepEqual(requests,['/api/session']);
});

test('word coverage never chooses profile; explicit pending changes for this account may override it',async()=>{
 const remote=snapshot('cartographer','en'),local=snapshot('scout','zh',earnedState());
 const merged=mergeSnapshots(local,remote);assert.equal(Object.keys(merged.progress.words).length,10);assert.deepEqual(merged.adventure,remote.adventure);assert.equal(merged.locale,'en');
 const storage=memoryStorage();storage.setItem(OWNER_KEY,JSON.stringify({owner:'a',pending:true}));
 const app=setup({storage,local,request:async()=>record('a',remote,2)});
 await app.controller.restoreSession();assert.deepEqual(app.local,local);assert.deepEqual(app.controller.getState().pending,local);
});

test('logout preserves account and guest backups; B receives neither A progress nor A settings',async()=>{
 const a=snapshot('cartographer','en',earnedState());a.adventure.choices={'1:1':{action:'kindness',role:'cartographer'}};
 const guest=snapshot('scout','zh');const uploads=[],storage=memoryStorage();
 storage.setItem(OWNER_KEY,JSON.stringify({owner:'guest',pending:false}));
 const app=setup({local:guest,storage,request:async(path,options)=>{
  if(path==='/api/session')return record('a',a,3);
  if(path==='/api/auth/google')return record('b',null);
  if(path==='/api/progress'){uploads.push(JSON.parse(options.body));return{revision:1};}
  return{};
 }});
 await app.controller.restoreSession();await app.controller.logout();assert.deepEqual(app.local,guest);
 assert.deepEqual(JSON.parse(app.storage.getItem(backupKey('a'))).snapshot,a);
 await app.controller.signIn('b-token');await app.controller.flush();
 assert.equal(uploads.length,1);assert.equal(Object.keys(uploads[0].snapshot.progress.words).length,0);
 assert.deepEqual(uploads[0].snapshot.adventure,guest.adventure);assert.equal(uploads[0].snapshot.locale,'zh');
 assert.equal(JSON.parse(app.storage.getItem(OWNER_KEY)).owner,'b');
});

test('a persisted owner mismatch on reload restores B or blank and safely backs up A',async()=>{
 for(const remote of [snapshot('scholar','zh'),null]){
  const storage=memoryStorage(),a=snapshot('cartographer','en',earnedState());
  storage.setItem(OWNER_KEY,JSON.stringify({owner:'a',pending:true}));
  const app=setup({storage,local:a,request:async()=>record('b',remote,remote?4:0)});
  await app.controller.restoreSession();
  assert.equal(Object.keys(app.local.progress.words).length,0);assert.equal(app.local.adventure.role,remote?.adventure.role??null);assert.equal(app.local.locale,'zh');
  assert.deepEqual(JSON.parse(storage.getItem(backupKey('a'))),{snapshot:a,pending:true});
 }
});

test('pending A changes survive logout and return to A without contaminating B',async()=>{
 const serverA=snapshot('cartographer','en'),edited=snapshot('scout','zh',earnedState());
 const app=setup({request:async(path,options)=>path==='/api/session'?record('a',serverA,1):path==='/api/auth/google'?record(JSON.parse(options.body).credential,JSON.parse(options.body).credential==='a'?serverA:null,1):{}});
 await app.controller.restoreSession();app.edit(edited);await app.controller.logout();await app.controller.signIn('b');
 assert.equal(Object.keys(app.local.progress.words).length,0);
 await app.controller.logout();await app.controller.signIn('a');assert.deepEqual(app.local,edited);
 assert.deepEqual(app.controller.getState().pending,edited);
});

for(const lateResult of ['success','conflict'])test(`late A ${lateResult} cannot change B revision, snapshot or upload`,async()=>{
 const waiting=deferred(),a=snapshot('cartographer','en'),b=snapshot('scholar','zh'),uploads=[];
 const app=setup({request:async(path,options)=>{
  if(path==='/api/session')return record('a',a,1);
  if(path==='/api/auth/google')return record('b',b,8);
  if(path==='/api/progress'){uploads.push(JSON.parse(options.body));return waiting.promise;}
  return{};
 }});
 await app.controller.restoreSession();app.edit(snapshot('scout','en',earnedState()));const oldSave=app.controller.flush();
 await app.controller.logout();await app.controller.signIn('b');const appliedCount=app.applied.length;
 if(lateResult==='success')waiting.resolve({revision:99});else waiting.reject(Object.assign(Error('conflict'),{status:409,data:{revision:99,snapshot:snapshot('scout','en',earnedState())}}));
 await oldSave;await app.controller.flush();
 assert.deepEqual(app.local,b);assert.equal(app.controller.getState().revision,8);assert.equal(app.controller.getState().pending,null);assert.equal(app.applied.length,appliedCount);assert.equal(uploads.length,1);
});

test('a late session response cannot replace a newer explicit login',async()=>{
 const old=deferred(),b=snapshot('scholar','en');
 const app=setup({request:async path=>path==='/api/session'?old.promise:record('b',b,4)});
 const restore=app.controller.restoreSession();await app.controller.signIn('b');old.resolve(record('a',snapshot('scout','zh',earnedState()),99));await restore;
 assert.deepEqual(app.local,b);assert.equal(app.controller.getState().user.id,'b');assert.equal(app.controller.getState().revision,4);
});

test('upgrading an already signed-in device does not relabel A records as guest records',async()=>{
 const a=snapshot('cartographer','en',earnedState());
 const app=setup({local:a,request:async path=>path==='/api/session'?record('a',a,3):path==='/api/auth/google'?record('b',null):{}});
 await app.controller.restoreSession();await app.controller.logout();await app.controller.signIn('b');
 assert.equal(Object.keys(app.local.progress.words).length,0);assert.equal(app.local.adventure.role,null);assert.equal(app.local.locale,'zh');
 assert.deepEqual(JSON.parse(app.storage.getItem(backupKey('a'))).snapshot,a);
});

test('cookie-setting login and logout requests are serialized across account transitions',async()=>{
 const first=deferred(),seen=[];
 const app=setup({request:async(path,options)=>{seen.push(path);return path==='/api/auth/google'?first.promise:{};}});
 const login=app.controller.signIn('a');await Promise.resolve();
 const logout=app.controller.logout();await Promise.resolve();assert.deepEqual(seen,['/api/auth/google']);
 first.resolve(record('a',snapshot('scout','en'),1));await login;await logout;
 assert.deepEqual(seen,['/api/auth/google','/api/logout']);assert.equal(app.controller.getState().user,null);
});

test('two tabs keep their snapshot owners when another tab changes the shared account',async()=>{
 const storage=memoryStorage(),a=snapshot('scout','en',earnedState()),b=snapshot('scholar','zh');let cookie='a';
 storage.setItem(OWNER_KEY,JSON.stringify({owner:'a',pending:false}));
 const requests=[],request=async(path,options)=>{
  requests.push(path);
  if(path==='/api/auth/google')cookie=JSON.parse(options.body).credential;
  if(path==='/api/logout')throw Error('stale tab must refresh before logout');
  return record(cookie,cookie==='a'?a:b,2);
 };
 const first=setup({storage,local:a,request}),second=setup({storage,local:a,request});
 await first.controller.restoreSession();await second.controller.restoreSession();
 await second.controller.signIn('b');second.edit(b);
 // This is the app's storage-event gate: do not copy B progress into A's snapshot.
 assert.equal(first.controller.canUseLocalSnapshot(),false);
 await first.controller.syncAccount();
 assert.deepEqual(JSON.parse(storage.getItem(backupKey('a'))).snapshot,a);
 assert.deepEqual(JSON.parse(storage.getItem(backupKey('b'))).snapshot,b);
 assert.deepEqual(first.local,b);assert.equal(first.controller.getState().user.id,'b');
 assert.equal(requests.includes('/api/logout'),false);
});

test('stale-tab logout refreshes the account without overwriting its backup or sending logout',async()=>{
 const storage=memoryStorage(),a=snapshot('scout','en',earnedState()),b=snapshot('scholar','zh');let cookie='a';
 storage.setItem(OWNER_KEY,JSON.stringify({owner:'a',pending:false}));
 const request=async(path,options)=>{
  if(path==='/api/logout')throw Error('must not log out the other tab');
  if(path==='/api/auth/google')cookie='b';
  return record(cookie,cookie==='a'?a:b,2);
 };
 const first=setup({storage,local:a,request}),second=setup({storage,local:a,request});
 await first.controller.restoreSession();await second.controller.restoreSession();await second.controller.signIn('b');second.edit(b);
 await first.controller.logout();
 assert.deepEqual(first.local,b);assert.equal(first.controller.getState().user.id,'b');
 assert.deepEqual(JSON.parse(storage.getItem(backupKey('b'))).snapshot,b);
 assert.deepEqual(JSON.parse(storage.getItem(backupKey('a'))).snapshot,a);
});

test('delayed storage progress must belong to this tab owner even after metadata switches back',async()=>{
 const storage=memoryStorage(),a=snapshot('scout','en',earnedState()),b=snapshot('scholar','zh');
 storage.setItem(OWNER_KEY,JSON.stringify({owner:'a',pending:false}));
 const app=setup({storage,local:a,request:async()=>record('a',a,1)});await app.controller.restoreSession();
 storage.setItem(backupKey('b'),JSON.stringify({snapshot:b,pending:false}));
 // A delayed B progress event is delivered after the shared owner has returned to A.
 assert.equal(app.controller.canUseLocalSnapshot({rawProgress:JSON.stringify(b.progress)}),false);
 assert.equal(app.controller.canUseLocalSnapshot({rawProgress:JSON.stringify(a.progress)}),true);
 assert.deepEqual(app.local,a);
});

for(const action of ['flush','logout'])test(`cookie changes before owner metadata: stale ${action} refreshes without touching B`,async()=>{
 const storage=memoryStorage(),waiting=deferred(),entered=deferred(),a=snapshot('cartographer','en'),edited=snapshot('scout','en',earnedState()),b=snapshot('scholar','zh');let cookie='a';const writes=[];
 storage.setItem(OWNER_KEY,JSON.stringify({owner:'a',pending:false}));
 const request=async(path,options)=>{
  if(path==='/api/auth/google'){cookie='b';entered.resolve();await waiting.promise;return record('b',b,1);}
  if(path==='/api/session')return record(cookie,cookie==='a'?a:b,1);
  const body=JSON.parse(options.body);writes.push({path,body,cookie});
  if(body.expectedAccountId!==cookie)throw Object.assign(Error('account changed'),{status:409,data:{error:'account_changed'}});
  throw Error('no write or logout should match B');
 };
 const first=setup({storage,local:a,request}),second=setup({storage,local:a,request});
 await first.controller.restoreSession();await second.controller.restoreSession();first.edit(edited);
 const login=second.controller.signIn('b');await entered.promise;
 assert.equal(JSON.parse(storage.getItem(OWNER_KEY)).owner,'a');
 await first.controller[action]();waiting.resolve();await login;await first.controller.flush();
 assert.equal(writes.length,1);assert.equal(writes[0].body.expectedAccountId,'a');assert.equal(writes[0].cookie,'b');
 assert.equal(first.controller.getState().user.id,'b');assert.equal(first.controller.getState().pending,null);assert.deepEqual(first.local,b);
 assert.deepEqual(JSON.parse(storage.getItem(backupKey('b'))).snapshot,b);
});

test('app rejects invalid adventure before changing progress, locale, or story',async()=>{
 const {readFile}=await import('node:fs/promises'),vm=await import('node:vm'),{loadState}=await import('../engine.js'),{validateAdventure}=await import('../adventure-state.js');
 const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
 const applySource=source.slice(source.indexOf('async function applySnapshot(incoming){'),source.indexOf('\ninitVoice('));
 const original=earnedState();let mutations=0;
 const context=vm.createContext({loadState,validateAdventure,state:original,applyingCloud:false,session:{active:true},pendingResult:true,setAdventure:()=>mutations++,setLocale:()=>mutations++,save:()=>mutations++,$:()=>{mutations++;return{open:false};}});
 vm.runInContext(applySource,context);
 await assert.rejects(()=>context.applySnapshot({progress:createState(),adventure:{role:'cartographer'},locale:'zh'}));
 assert.equal(context.state,original);assert.equal(context.applyingCloud,false);assert.equal(mutations,0);assert.equal(context.session.active,true);
});
