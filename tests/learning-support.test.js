import test from 'node:test';
import assert from 'node:assert/strict';
import {vocabulary} from '../vocabulary.js';
import {judgeRecall,recallPrompt,spellingHint,spellingDifference,transferTask} from '../recall-support.js';
import {freshLearning,validateLearning,addActivity} from '../learning-state.js';
import {freshAdventure,validateAdventure} from '../adventure-state.js';
import {mergeSnapshots} from '../auth-state.js';
import {createState,startSession,learnNext,answer,serializeSessionDraft,restoreSessionDraft,loadState} from '../engine.js';
const word=id=>vocabulary.find(w=>w.id===id);
test('ambiguous gloss alternatives clarify without marking correct or wrong',()=>{
 for(const [target,other] of [['big','large'],['small','little']])assert.equal(judgeRecall(word(target),other,vocabulary).kind,'alternative');
 assert.equal(judgeRecall(word('big'),'large',vocabulary,'en').kind,'alternative');
 assert.equal(judgeRecall(word('big'),'BIG',vocabulary).kind,'correct');
 assert.equal(judgeRecall(word('big'),'home',vocabulary).kind,'incorrect');
 assert.equal(judgeRecall(word('big'),'<script>',vocabulary).kind,'incorrect');
 assert.equal(judgeRecall(word('big'),'',vocabulary).kind,'incorrect');
});
test('prompts hide target in example and hints/differences support repair',()=>{
 assert.equal(recallPrompt(word('home')).sentence,'My _____ is near the school.');
 assert.equal(spellingHint(word('home'),1),'h _ _ _');
 assert.equal(spellingDifference('homes','home').firstDifference,4);
 assert.notEqual(transferTask(word('home')).sentence,word('home').example);
 assert.equal(transferTask(word('big')).kind,'open');
});
test('learning records stay separate from XP and roundtrip optional adventure schema',()=>{
 const record={id:'test-1',kind:'transfer',stageId:1,response:'My new sentence',evidence:'My explanation',result:'needs-review',at:new Date().toISOString()};
 const learning=addActivity(freshLearning(),record),adv={...freshAdventure(),learning};
 assert.deepEqual(validateAdventure(adv),adv);
 assert.deepEqual(validateAdventure(freshAdventure()).learning,undefined);
 assert.throws(()=>validateLearning({...learning,batchSize:2}));
 assert.throws(()=>validateLearning({...learning,activities:[{...record,response:'x'.repeat(1201)}]}));
 assert.equal(Array.from({length:45}).reduce((a,_,i)=>addActivity(a,{...record,id:String(i)}),learning).activities.length,20);
});
test('short-batch draft survives account snapshot merge and completes only once',()=>{
 const progress=createState(),session=startSession(progress,1,100,{size:3});learnNext(progress,session);
 const local={progress,adventure:{...freshAdventure(),learning:{...freshLearning(),batchSize:3,draft:serializeSessionDraft(progress,session)}},locale:'zh'};
 const merged=mergeSnapshots(local,local,{preferLocalProfile:true});
 const restored=restoreSessionDraft(merged.progress,merged.adventure.learning.draft);assert.ok(restored);assert.equal(restored.index,1);
 while(restored.phase==='learn')learnNext(merged.progress,restored);
 while(restored.phase==='challenge')answer(merged.progress,restored,true,200);
 assert.equal(merged.progress.xp,30);assert.equal(Object.keys(merged.progress.words).length,3);
 assert.deepEqual(loadState(merged.progress,{strict:true}),merged.progress);
 answer(merged.progress,restored,true,201);assert.equal(merged.progress.xp,30);
 assert.equal(serializeSessionDraft(merged.progress,restored),null);
});
test('same-account merge preserves independent activities from both devices without XP',()=>{
 const record=(id,day)=>({id,kind:'transfer',stageId:1,response:'Example',evidence:'Meaning',result:'needs-review',at:`2026-10-0${day}T00:00:00Z`});
 const progress=createState(),adventure=freshAdventure();
 const left={progress,adventure:{...adventure,learning:addActivity(freshLearning(),record('a',1))},locale:'zh'};
 const right={progress,adventure:{...adventure,learning:addActivity(freshLearning(),record('b',2))},locale:'zh'};
 const merged=mergeSnapshots(left,right,{preferLocalProfile:true});assert.deepEqual(merged.adventure.learning.activities.map(x=>x.id),['a','b']);assert.equal(merged.progress.xp,0);
});
test('reading records at the form limit fit account learning storage',async()=>{
 const {makeReadingRecord}=await import('../reading-practice.js');
 const record=makeReadingRecord(1,'interpretation','reading-comprehension','[inference] '+'文'.repeat(1150),'e'.repeat(1000),'needs-review');
 assert.doesNotThrow(()=>addActivity(freshLearning(),record));
 const max={...freshLearning(),draft:{text:'x'.repeat(59000)}};
 for(let i=0;i<20;i++)max.activities.push({...record,id:'record'+i,response:'r'.repeat(1200),evidence:'e'.repeat(1200)});
 assert.ok(JSON.stringify(validateLearning(max)).length<120000);
});
