import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { OAuth2Client } from 'google-auth-library';
import { loadState } from './engine.js';
import { validateAdventure } from './adventure-state.js';
const hash = text => createHash('sha256').update(text).digest('hex');
export function createAuthService({dbPath,clientId,origin,verifyToken}={}) {
 const google = new OAuth2Client({clientId:clientId||undefined});
 const verify = verifyToken || (async credential => (await google.verifyIdToken({idToken:credential,audience:clientId})).getPayload());
 if(dbPath!==':memory:')mkdirSync(dirname(dbPath),{recursive:true});
 const db=new DatabaseSync(dbPath);
 db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS progress (user_id TEXT PRIMARY KEY,snapshot TEXT NOT NULL,revision INTEGER NOT NULL,updated_at INTEGER NOT NULL);`);
 const isSecure=origin.startsWith('https:');
 const send=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));};
 const cookie=(token,age)=>`word_odyssey_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${isSecure?'; Secure':''}`;
 const userFor=req=>{const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('word_odyssey_session='))?.slice(21);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT users.id,users.name,users.email FROM sessions JOIN users ON sessions.user_id=users.id WHERE sessions.token=? AND expires>?').get(hash(token),Date.now());};
 async function body(req){let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>3_000_000)throw new Error('too_large');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
 function rowFor(id){const row=db.prepare('SELECT snapshot,revision,updated_at FROM progress WHERE user_id=?').get(id);return row?{snapshot:JSON.parse(row.snapshot),revision:row.revision,updatedAt:row.updated_at}:{snapshot:null,revision:0,updatedAt:null};}
 async function handle(req,res){
  const pathname=new URL(req.url,origin).pathname;if(!pathname.startsWith('/api/'))return false;
  try{
   if(req.method==='GET'&&pathname==='/api/config'){send(res,200,{googleClientId:clientId||null,configured:Boolean(clientId),storage:'server-sqlite'});return true;}
   if(!['GET','POST','PUT'].includes(req.method)){send(res,405,{error:'method_not_allowed'});return true;}
   if(req.method!=='GET'&&(req.headers.origin!==origin||!String(req.headers['content-type']||'').startsWith('application/json'))){send(res,403,{error:'origin_rejected'});return true;}
   if(req.method==='POST'&&pathname==='/api/auth/google'){
    if(!clientId){send(res,503,{error:'google_not_configured'});return true;}
    const input=await body(req);if(typeof input.credential!=='string'||input.credential.length>20000){send(res,400,{error:'invalid_credential'});return true;}
    let payload;try{payload=await verify(input.credential);}catch{send(res,401,{error:'invalid_credential'});return true;}
    if(!payload?.sub||payload.email_verified!==true){send(res,401,{error:'invalid_identity'});return true;}
    const user={id:String(payload.sub),name:String(payload.name||'Traveller').slice(0,120),email:String(payload.email||'').slice(0,254)};
    db.prepare('INSERT INTO users(id,name,email) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email').run(user.id,user.name,user.email);
    db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
    const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)').run(hash(token),user.id,Date.now()+7*86400000);
    send(res,200,{user,...rowFor(user.id)},{'Set-Cookie':cookie(token,604800)});return true;
   }
   const user=userFor(req);
   if(req.method==='GET'&&pathname==='/api/session'){send(res,200,{user:user||null,...(user?rowFor(user.id):{})});return true;}
   if(req.method==='POST'&&pathname==='/api/logout'){
    const input=await body(req);
    if(input.expectedAccountId!==(user?.id??null)){send(res,409,{error:'account_changed'});return true;}
    const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('word_odyssey_session='))?.slice(21);
    // Revoke only the request's session. Clearing the shared browser cookie in a
    // delayed response could erase a newer login completed by another tab.
    if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));send(res,200,{ok:true});return true;
   }
   if(!user){send(res,401,{error:'sign_in_required'});return true;}
   if(req.method==='GET'&&pathname==='/api/progress'){send(res,200,rowFor(user.id));return true;}
   if(req.method==='PUT'&&pathname==='/api/progress'){
    const input=await body(req);
    if(input.expectedAccountId!==user.id){send(res,409,{error:'account_changed'});return true;}
    const current=rowFor(user.id);
    if(!Number.isSafeInteger(input.revision)||input.revision!==current.revision){send(res,409,{error:'revision_conflict',...current});return true;}
    let clean;try{clean=loadState(input.snapshot?.progress,{strict:true});}catch{send(res,400,{error:'invalid_progress'});return true;}
    let adventure;try{if(JSON.stringify(input.snapshot?.adventure).length>120000)throw Error();adventure=validateAdventure(input.snapshot?.adventure);}catch{send(res,400,{error:'invalid_adventure'});return true;}
    if(current.snapshot&&Object.keys(clean.words).length<Object.keys(current.snapshot.progress.words).length){send(res,409,{error:'newer_progress_exists',...current});return true;}
    const snapshot={progress:clean,adventure,locale:input.snapshot.locale==='en'?'en':'zh'},now=Date.now(),revision=current.revision+1;
    db.prepare('INSERT INTO progress(user_id,snapshot,revision,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET snapshot=excluded.snapshot,revision=excluded.revision,updated_at=excluded.updated_at').run(user.id,JSON.stringify(snapshot),revision,now);
    send(res,200,{revision,updatedAt:now});return true;
   }
   send(res,404,{error:'not_found'});return true;
  }catch(error){send(res,error.message==='too_large'?413:400,{error:'invalid_request'});return true;}
 }
 return {handle,close:()=>db.close()};
}
