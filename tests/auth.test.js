import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createAuthService} from '../auth-service.mjs';
import {createState,startSession,learnNext,answer} from '../engine.js';
import {validateAdventure} from '../adventure-state.js';
const origin='http://localhost:4186';
async function fixture(run,{configured=true}={}){
 const api=createAuthService({dbPath:':memory:',clientId:configured?'test-client':null,origin,verifyToken:async token=>{if(!['valid-a','valid-b'].includes(token))throw Error('forged');return{sub:token,name:token,email:`${token}@example.com`,email_verified:true};}});
 const server=http.createServer((req,res)=>api.handle(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const request=async(path,{method='GET',cookie,body,requestOrigin=origin}={})=>{const response=await fetch(base+path,{method,headers:{Origin:requestOrigin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return{status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};};
 try{await run(request);}finally{await new Promise(resolve=>server.close(resolve));api.close();}
}
function earnedState(){const state=createState(),q=startSession(state,1);while(q.phase!=='complete'){if(q.phase==='learn')learnNext(state,q);else answer(state,q,true);}return state;}
test('Google endpoint rejects forged credentials, cross-origin writes and unconfigured login',async()=>{
 await fixture(async request=>{assert.equal((await request('/api/auth/google',{method:'POST',body:{credential:'forged'}})).status,401);assert.equal((await request('/api/auth/google',{method:'POST',body:{credential:'valid-a'},requestOrigin:'https://attacker.invalid'})).status,403);assert.equal((await request('/api/progress')).status,401);});
 await fixture(async request=>assert.equal((await request('/api/auth/google',{method:'POST',body:{credential:'valid-a'}})).status,503),{configured:false});
});
test('authenticated progress persists, belongs to one account and rejects stale or regressive saves',async()=>{
 await fixture(async request=>{
  const a=await request('/api/auth/google',{method:'POST',body:{credential:'valid-a'}});assert.equal(a.status,200);assert.ok(a.cookie);
  assert.equal((await request('/api/session',{cookie:a.cookie})).data.user.id,'valid-a');
  const snapshot={progress:earnedState(),adventure:{version:1,seed:123,role:'cartographer',choices:{'1:1':{action:'kindness',role:'cartographer'}}},locale:'en'};
  const saved=await request('/api/progress',{method:'PUT',cookie:a.cookie,body:{expectedAccountId:'valid-a',revision:0,snapshot}});assert.equal(saved.status,200);assert.equal(saved.data.revision,1);
  const read=await request('/api/progress',{cookie:a.cookie});assert.equal(Object.keys(read.data.snapshot.progress.words).length,10);
  const stale=await request('/api/progress',{method:'PUT',cookie:a.cookie,body:{expectedAccountId:'valid-a',revision:0,snapshot}});assert.equal(stale.status,409);
  const reset=await request('/api/progress',{method:'PUT',cookie:a.cookie,body:{expectedAccountId:'valid-a',revision:1,snapshot:{...snapshot,progress:createState()}}});assert.equal(reset.status,409);
  const b=await request('/api/auth/google',{method:'POST',body:{credential:'valid-b'}});assert.equal((await request('/api/progress',{cookie:b.cookie})).data.snapshot,null);
  const invalid=await request('/api/progress',{method:'PUT',cookie:a.cookie,body:{expectedAccountId:'valid-a',revision:1,snapshot:{progress:{version:2,words:{}}}}});assert.equal(invalid.status,400);
  const logout=await request('/api/logout',{method:'POST',cookie:a.cookie,body:{expectedAccountId:'valid-a'}});
  assert.equal(logout.cookie,undefined);assert.equal((await request('/api/progress',{cookie:a.cookie})).status,401);
  assert.equal((await request('/api/session',{cookie:b.cookie})).data.user.id,'valid-b');
 });
});

test('API rejects every adventure shape that the browser rejects without incrementing revision',async()=>{
 await fixture(async request=>{
  const account=await request('/api/auth/google',{method:'POST',body:{credential:'valid-a'}});
  const adventure={version:1,seed:123,role:'cartographer',choices:{'1:1':{action:'kindness',role:'cartographer'}}};
  const snapshot={progress:createState(),adventure,locale:'en'};
  assert.equal((await request('/api/progress',{method:'PUT',cookie:account.cookie,body:{expectedAccountId:'valid-a',revision:0,snapshot}})).data.revision,1);
  const invalid=[null,undefined,{role:'cartographer'},{...adventure,seed:-1},{...adventure,role:'unknown'},{...adventure,choices:{'1:1':{action:'flight',role:'cartographer'}}},{...adventure,choices:{'101:1':{action:'kindness',role:'cartographer'}}}];
  for(const value of invalid){
   assert.throws(()=>validateAdventure(value));
   const result=await request('/api/progress',{method:'PUT',cookie:account.cookie,body:{expectedAccountId:'valid-a',revision:1,snapshot:{...snapshot,adventure:value}}});
   assert.equal(result.status,400);assert.equal(result.data.error,'invalid_adventure');
   const read=await request('/api/progress',{cookie:account.cookie});assert.equal(read.data.revision,1);assert.deepEqual(read.data.snapshot,snapshot);
  }
 });
});

test('a stale tab cannot write into or log out the account selected in another tab',async()=>{
 await fixture(async request=>{
  const b=await request('/api/auth/google',{method:'POST',body:{credential:'valid-b'}});
  const snapshot={progress:earnedState(),adventure:{version:1,seed:123,role:'scout',choices:{}},locale:'en'};
  for(const expectedAccountId of ['valid-a',undefined]){
   const write=await request('/api/progress',{method:'PUT',cookie:b.cookie,body:{expectedAccountId,revision:0,snapshot}});
   assert.equal(write.status,409);assert.deepEqual(write.data,{error:'account_changed'});
   const logout=await request('/api/logout',{method:'POST',cookie:b.cookie,body:{expectedAccountId}});
   assert.equal(logout.status,409);assert.equal(logout.cookie,undefined);
   const session=await request('/api/session',{cookie:b.cookie});assert.equal(session.data.user.id,'valid-b');assert.equal(session.data.snapshot,null);assert.equal(session.data.revision,0);
  }
 });
});
