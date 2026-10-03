import test from 'node:test';
import assert from 'node:assert/strict';
import { createAutoAdvance } from '../auto-advance.js';
function fixture(){const tasks=[];const flow=createAutoAdvance({schedule:fn=>(tasks.push(fn),tasks.length),unschedule(){}});return {flow,tasks};}
test('a correct answer advances once after feedback; early click cannot double-save',()=>{
 const {flow,tasks}=fixture();let saves=0;const click=flow.prepare(()=>saves++,true);
 assert.equal(saves,0);click();tasks[0]();click();assert.equal(saves,1);
 const next=flow.prepare(()=>saves++,true);tasks[1]();next();assert.equal(saves,2);
});
test('wrong answers wait for a learner; closing or replacing a question cancels stale timers',()=>{
 const {flow,tasks}=fixture();let saves=0;const wrong=flow.prepare(()=>saves++,false);
 assert.equal(tasks.length,0);wrong();assert.equal(saves,1);
 flow.prepare(()=>saves++,true);flow.cancel();tasks[0]();assert.equal(saves,1);
 flow.prepare(()=>saves++,true);const fresh=flow.prepare(()=>saves++,false);tasks[1]();assert.equal(saves,1);fresh();assert.equal(saves,2);
});
