import test from 'node:test';
import assert from 'node:assert/strict';
import {getMicroquests,renderJourneyProgress} from '../quest-visuals.js';
const stage={id:1,words:Array.from({length:23},(_,i)=>({id:`w${i}`}))};
test('ten-word milestones do not count partial batches; last small quest uses its real word count',()=>{
 const state={words:{w0:{},w1:{},w2:{}}};assert.equal(getMicroquests(stage,state).completed,0);
 assert.match(renderJourneyProgress(stage,state,'zh',3),/還差 7 字/);
 for(let i=0;i<20;i++)state.words[`w${i}`]={};
 assert.equal(getMicroquests(stage,state).completed,2);assert.match(renderJourneyProgress(stage,state,'zh'),/0\/3 字，還差 3 字/);
 for(let i=20;i<23;i++)state.words[`w${i}`]={};assert.equal(getMicroquests(stage,state).next,null);assert.match(renderJourneyProgress(stage,state,'en'),/All small quests complete/);
});
