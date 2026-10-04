import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createAutoAdvance} from '../auto-advance.js';
const code=readFileSync(new URL('../app.js',import.meta.url),'utf8').split('async function showFeedback(')[1].split('\nfunction renderCompletion')[0];
function harness(save=async()=>true){
 const nodes=new Map();let renders=0,answers=0;const session={phase:'challenge',attempts:{},reviewAttempts:{}};
 const $=selector=>selector==='.answer-form'?null:nodes.get(selector)??nodes.set(selector,{open:true,innerHTML:'',setAttribute(){},focus(){}}).get(selector);
 const context=vm.createContext({pendingResult:null,session,activeQuestionType:'recognition',assisted:false,state:{},answer:()=>answers++,save,$,$$:()=>[],render(){},renderLesson:()=>renders++,esc:String,t:x=>x,say:x=>x,locale:'zh',icon:()=>'',wordMeaning:w=>w.meaning,wordMap:new Map(),wireSounds(){},feedbackAdvance:createAutoAdvance()});
 vm.runInContext('async function showFeedback('+code,context);
 return {context,$,submit:correct=>context.showFeedback(correct,{id:'x',word:'apple',meaning:'蘋果'}),renders:()=>renders,answers:()=>answers};
}
test('correct answers go directly to next question after save, without a timer',async()=>{const h=harness();await h.submit(true);assert.equal(h.renders(),1);assert.equal(h.answers(),1);await h.submit(true);assert.equal(h.answers(),1);});
test('wrong answer shows explanation and advances only after learner continues',async()=>{const h=harness();await h.submit(false);assert.equal(h.renders(),0);assert.match(h.$('#feedback').innerHTML,/蘋果/);await h.$('#next-question').onclick();assert.equal(h.renders(),1);await h.$('#next-question').onclick();assert.equal(h.renders(),1);});
test('failed save or closed lesson cannot advance after an awaited save',async()=>{const failed=harness(async()=>false);await failed.submit(true);assert.equal(failed.renders(),0);let release;const h=harness(()=>new Promise(r=>release=r));const pending=h.submit(true);h.$('#lesson-dialog').open=false;release(true);await pending;assert.equal(h.renders(),0);});
