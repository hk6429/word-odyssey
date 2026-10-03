import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createVoiceController, selectVoice, splitSentences, voiceLabel } from '../voice.js';
import { bundledWords, audioProvenance } from '../audio-manifest.js';
import { vocabulary } from '../vocabulary.js';
import { wordPos } from '../i18n.js';
const enUS={name:'Samantha',lang:'en-US',localService:true}, enGB={name:'Daniel',lang:'en-GB',localService:true};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture({voices=[enUS,enGB],audioFailure=false,unsupported=false}={}){
 const utterances=[],audios=[],notices=[],events=new Map();
 const synth={getVoices:()=>voices,speak:u=>utterances.push(u),cancel(){this.cancelCount=(this.cancelCount||0)+1;},addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
 class Utterance{constructor(text){this.text=text;}}
 class Audio{constructor(src){this.src=src;audios.push(this);}play(){return audioFailure?Promise.reject(Error('missing')):Promise.resolve();}pause(){this.paused=true;}}
 const controller=createVoiceController({synthesis:unsupported?null:synth,Utterance:unsupported?null:Utterance,AudioClass:Audio,wordAudio:{home:'w1',fox:'w2'},voiceWaitMs:15,onNotice:code=>notices.push(code)});
 return {controller,synth,utterances,audios,notices,setVoices(next){voices=next;events.get('voiceschanged')?.();}};
}
test('natural words use bundled MP3 without device TTS, including unsupported browsers',async()=>{
 const f=fixture({unsupported:true});const result=f.controller.sayWord('Home');assert.equal(f.audios[0].src,'audio/words/w1.mp3');assert.equal(f.audios[0].playbackRate,1);f.audios[0].onended();assert.equal(await result,true);assert.equal(f.utterances.length,0);f.controller.destroy();
});
test('new word cancels previous audio and ignores its stale failure callback',async()=>{
 const f=fixture();const old=f.controller.sayWord('home'),staleError=f.audios[0].onerror;
 const next=f.controller.sayWord('fox');assert.equal(f.audios[0].paused,true);staleError();assert.equal(await old,false);await tick();assert.equal(f.utterances.length,0);f.audios[1].onended();assert.equal(await next,true);f.controller.destroy();
});
test('an MP3 rejection falls back once to English TTS with a visible notice',async()=>{
 const f=fixture({audioFailure:true});const result=f.controller.sayWord('home');await tick();assert.deepEqual(f.notices,['fallback']);assert.equal(f.utterances.length,1);assert.equal(f.utterances[0].text,'home');f.utterances[0].onend();assert.equal(await result,true);f.controller.destroy();
});
test('British preference skips American audio and uses only en-GB device voice',async()=>{
 const f=fixture();f.controller.setPreferences({preference:'british',speed:'slow'});const result=f.controller.sayWord('home');await tick();assert.equal(f.audios.length,0);assert.equal(f.utterances[0].voice,enGB);assert.equal(f.utterances[0].rate,.8);f.utterances[0].onend();assert.equal(await result,true);f.controller.destroy();
});
test('missing British voice is reported and does not substitute American audio or voice',async()=>{
 const f=fixture({voices:[enUS]});f.controller.setPreferences({preference:'british'});assert.equal(await f.controller.sayWord('home'),false);assert.deepEqual(f.notices,['noBritish']);assert.equal(f.audios.length+f.utterances.length,0);assert.equal(f.controller.getState().playing,false);f.controller.destroy();
});
test('voiceschanged resolves delayed English voices and initial click',async()=>{
 const f=fixture({voices:[]});const result=f.controller.sayText('Hello.');f.setVoices([enGB]);await tick();assert.equal(f.utterances[0].voice,enGB);f.utterances[0].onend();assert.equal(await result,true);f.controller.destroy();
});
test('empty voices produce a bilingual actionable message after loading grace',async()=>{
 const f=fixture({voices:[]});assert.equal(await f.controller.sayText('Hello.'),false);assert.deepEqual(f.notices,['noEnglish']);assert.match(voiceLabel('noEnglish','en'),/Install/);assert.match(voiceLabel('noEnglish','zh'),/安裝/);f.controller.destroy();
});
test('stop during delayed voices never starts speech when voices arrive',async()=>{
 const f=fixture({voices:[]});const result=f.controller.sayText('Hello.');f.controller.stop();f.setVoices([enUS]);assert.equal(await result,false);assert.equal(f.utterances.length,0);f.controller.destroy();
});
test('long passages read sentence by sentence and stop cancels the remaining queue',async()=>{
 const f=fixture();const result=f.controller.sayText('First sentence. Second sentence! Third sentence?');await tick();assert.equal(f.utterances.length,1);assert.equal(f.utterances[0].text,'First sentence.');f.utterances[0].onend();await tick();assert.equal(f.utterances.length,2);assert.equal(f.utterances[1].text,'Second sentence!');const staleEnd=f.utterances[1].onend;f.controller.stop();staleEnd();assert.equal(await result,false);assert.equal(f.utterances.length,2);f.controller.destroy();
});
test('stop cancels TTS before a new word and stale events cannot change its state',async()=>{
 const f=fixture();const old=f.controller.sayText('A sample sentence.');await tick();const staleError=f.utterances[0].onerror;const next=f.controller.sayWord('home');staleError();assert.equal(await old,false);assert.deepEqual(f.notices,[]);assert.equal(f.controller.getState().playing,true);f.audios[0].onended();assert.equal(await next,true);f.controller.destroy();
});
test('slow rate applies to bundled audio and changed preferences stop playback',async()=>{
 const f=fixture();f.controller.setPreferences({speed:'slow'});const result=f.controller.sayWord('home');assert.equal(f.audios[0].playbackRate,.8);f.controller.setPreferences({speed:'normal'});assert.equal(await result,false);assert.equal(f.audios[0].paused,true);f.controller.destroy();
});
test('unsupported text speech and device errors are visible and recoverable',async()=>{
 const a=fixture({unsupported:true});assert.equal(await a.controller.sayText('Hello.'),false);assert.deepEqual(a.notices,['unsupported']);a.controller.destroy();
 const f=fixture();const result=f.controller.sayText('Hello.');await tick();f.utterances[0].onerror();assert.equal(await result,false);assert.deepEqual(f.notices,['failed']);assert.equal(f.controller.getState().playing,false);f.controller.destroy();
});
test('voice selection respects locale and text splitting preserves words',()=>{
 assert.equal(selectVoice([{name:'French',lang:'fr-FR'},enUS],'british'),null);
 assert.equal(selectVoice([{name:'UK Neural',lang:'en_GB'}],'british').lang,'en_GB');
 const source=('A rather long sentence contains a collection of words ').repeat(12).trim()+'.';
 const chunks=splitSentences(source);assert.ok(chunks.length>1);assert.ok(chunks.every(chunk=>chunk.length<=221));assert.equal(chunks.join(' '),source);
 assert.deepEqual(splitSentences(''),[]);
});
test('all bundled files exactly match recorded SHA-256, with no unrelated words or files',()=>{
 const inventory=JSON.parse(readFileSync(new URL('../docs/audio-inventory.json',import.meta.url)));
 const words=new Set(vocabulary.map(word=>word.word.toLowerCase()));
 assert.equal(Object.keys(bundledWords).length,6148);assert.equal(audioProvenance.accent,'en-US');
 const ids=new Set(Object.values(bundledWords));assert.equal(ids.size,inventory.fileCount);assert.equal(readdirSync(new URL('../audio/words/',import.meta.url)).length,ids.size);
 let bytes=0;for(const [word,id]of Object.entries(bundledWords)){assert.ok(words.has(word));assert.match(id,/^w\d+$/);const file=readFileSync(new URL(`../audio/words/${id}.mp3`,import.meta.url));assert.equal(file.length,inventory.files[id].bytes);assert.equal(createHash('sha256').update(file).digest('hex'),inventory.files[id].sha256);bytes+=file.length;}
 assert.equal(bytes,inventory.totalBytes);
});
test('all vocabulary parts of speech have English labels without Chinese leakage',()=>{
 for(const word of vocabulary){assert.ok(wordPos(word,'en'),word.word);assert.doesNotMatch(wordPos(word,'en'),/[\u3400-\u9fff]/);assert.equal(wordPos(word,'zh'),word.pos);}
 for(const key of ['settings','preference','natural','british','speed','normal','slow','stop','example','passage','hint','playing','stopped','complete','unsupported','noEnglish','noBritish','fallback','failed']){assert.doesNotMatch(voiceLabel(key,'en'),/[\u3400-\u9fff]/);assert.match(voiceLabel(key,'zh'),/[\u3400-\u9fff]/);}
});
