import test from 'node:test';
import assert from 'node:assert/strict';
import {getMicroquests,renderJourneyProgress,getJourneyScene} from '../quest-visuals.js';
const stage={id:1,words:Array.from({length:23},(_,i)=>({id:`w${i}`}))};
test('ten-word milestones do not count partial batches; last small quest uses its real word count',()=>{
 const state={words:{w0:{},w1:{},w2:{}}};assert.equal(getMicroquests(stage,state).completed,0);
 assert.match(renderJourneyProgress(stage,state,'zh',3),/還差 7 字/);
 for(let i=0;i<20;i++)state.words[`w${i}`]={};
 assert.equal(getMicroquests(stage,state).completed,2);assert.match(renderJourneyProgress(stage,state,'zh'),/0\/3 字，還差 3 字/);
 for(let i=20;i<23;i++)state.words[`w${i}`]={};assert.equal(getMicroquests(stage,state).next,null);assert.match(renderJourneyProgress(stage,state,'en'),/All small quests complete/);
});

test('滿版情境跟著十字小關切換，部分完成不提早換景',()=>{
 const s={id:1,words:Array.from({length:60},(_,i)=>({id:`w${i}`}))},state={words:{}};
 assert.deepEqual(getJourneyScene(s,state),{image:'assets/quest-scenes/01-1.webp',tiled:false,x:65,y:50,number:1,label:{en:'Cottage Breakfast',zh:'小屋早餐'}});
 for(let i=0;i<9;i++)state.words[`w${i}`]={};assert.equal(getJourneyScene(s,state).number,1);
 state.words.w9={};assert.equal(getJourneyScene(s,state).number,2);assert.equal(getJourneyScene(s,state).image,'assets/quest-scenes/01-2.webp');
 for(let i=10;i<60;i++)state.words[`w${i}`]={};assert.equal(getJourneyScene(s,state).number,6);
});
