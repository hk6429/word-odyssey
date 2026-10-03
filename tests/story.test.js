import test from 'node:test';
import assert from 'node:assert/strict';
import { getReading, getAdventure, setAdventure, validateAdventure, getStoryStats, getEncounter, chooseEncounter, setStoryLocale, mountAdventure, mountEncounter, mountReading, getStoryOpening, getStoryReturn, getStoryEnding, storyBranches, roleObservations, roles } from '../story.js';
import { stages } from '../data.js';
import { chapterContinuations } from '../story-content.js';

const base=()=>({version:1,seed:20261003,role:'cartographer',choices:{}});
const chinese=/[\u3400-\u9fff]/;

test('100 bilingual readings use exactly three authored words from their own stage with three checks',()=>{
 const readings=Array.from({length:100},(_,i)=>getReading(i+1));
 assert.equal(new Set(readings.map(r=>r.text)).size,100);
 assert.equal(new Set(readings.map(r=>r.title.en)).size,100);
 assert.equal(new Set(readings.map(r=>r.sceneClass)).size,100);
 assert.equal(new Set(readings.map(r=>r.quiz.evidence)).size,100);
 for(const r of readings){
  assert.equal(chinese.test(r.text),false,`English passage ${r.id}`);
  assert.equal(chinese.test(r.translation),true,`Translation ${r.id}`);
  assert.equal(r.missions.length,3);
  assert.equal(new Set(r.missionWordIds).size,3);
  assert.deepEqual(r.focusWords,r.missions.map(m=>m.word));
  for(const mission of r.missions){
   assert.ok(stages[r.id-1].words.some(word=>word.id===mission.wordId&&word.word===mission.word),`Chapter ${r.id} owns ${mission.wordId}`);
   assert.ok(r.text.includes(mission.sentence));
   assert.equal(chinese.test(mission.translation),true);
   assert.doesNotMatch(mission.sentence,/I see the word|The word .+ is written|means the word/i);
  }
  assert.equal(r.quizzes.length,3);
  for(const quiz of r.quizzes){
   assert.equal(quiz.options.length,3);
   assert.equal(new Set(quiz.options).size,3);
   assert.ok(quiz.options.includes(quiz.answer));
   assert.ok(r.text.includes(quiz.evidence));
   assert.ok(quiz.prompt.includes('_____'));
   assert.match(quiz.evidence,new RegExp(`\\b${quiz.answer}\\b`,'i'));
  }
  if(r.id<=20){assert.equal(r.format,'short');assert.ok(r.storyWordCount<40);}
  else if(r.id<=40){assert.equal(r.format,'dialogue');assert.ok(r.storyText.includes('“'));}
  else{assert.equal(r.format,'passage');assert.ok(r.storyText.split(/(?<=[.!?])\s+/).length>=5,`Chapter ${r.id} needs at least five narrative sentences`);}
 }
 for(const invalid of [0,101,1.1,'1',null,NaN])assert.throws(()=>getReading(invalid),RangeError);
});

test('choices are stable, award one trait once, and pay off later without vocabulary fields',()=>{
 setAdventure(base());
 const initial=getEncounter(1,1);
 assert.deepEqual(initial,getEncounter(1,1));
 assert.equal(chooseEncounter(1,1,'kindness'),true);
 assert.equal(chooseEncounter(1,1,'courage'),false);
 assert.equal(getEncounter(1,1).choice.action,'kindness');
 assert.deepEqual(getStoryStats(),{curiosity:0,courage:0,kindness:1});
 assert.match(getEncounter(3,1).echo.en,/fox remembers/);
 assert.equal(getEncounter(3,2).echo,null,'a payoff appears only at one event in its chapter');
 const saved=getAdventure();
 setAdventure(saved);
 assert.deepEqual(getEncounter(1,1).choice,{action:'kindness',role:'cartographer'});
 assert.deepEqual(Object.keys(getAdventure()).sort(),['choices','role','seed','version']);
 saved.choices['1:1'].action='courage';
 assert.equal(getAdventure().choices['1:1'].action,'kindness','export must be a copy');
 const changed=getAdventure();changed.role='scout';setAdventure(changed);
 assert.equal(getEncounter(1,1).choice.role,'cartographer','old choice retains its role');
 assert.equal(chooseEncounter(1,2,'courage'),true);
 assert.equal(getEncounter(1,2).choice.role,'scout');
 assert.deepEqual(getStoryStats(),{curiosity:0,courage:1,kindness:1});
});

test('malformed snapshots and unknown choices cannot mutate existing state',()=>{
 setAdventure(base());
 const malformed=[null,{},[],{...base(),version:2},{...base(),seed:NaN},{...base(),seed:-1},{...base(),role:'admin'},{...base(),choices:[]},{...base(),choices:{'0:1':{action:'kindness',role:'scout'}}},{...base(),choices:{'1:10':{action:'kindness',role:'scout'}}},{...base(),choices:{'1:1':{action:'unlock',role:'scout'}}},{...base(),choices:{'1:1':{action:'kindness',role:'admin'}}}];
 for(const value of malformed){assert.throws(()=>setAdventure(value));assert.deepEqual(getAdventure(),base());}
 assert.throws(()=>chooseEncounter(1,1,'unlock'));
 assert.throws(()=>getEncounter(1,10),RangeError);
 setAdventure({...base(),role:null});assert.throws(()=>chooseEncounter(1,1,'kindness'));
 assert.deepEqual(validateAdventure({...base(),xp:999,words:{fake:true}}),base(),'extra mastery fields stripped');
});

// Minimal DOM contract checks; the root task separately exercises the real browser.
class NodeStub {
 constructor(dataset={}){this.dataset=dataset;this.textContent='';this.listeners={};this.classList={toggle(){}};}
 addEventListener(type,listener){this.listeners[type]=listener;}
 click(){this.listeners.click?.();}
}
class ContainerStub {
 constructor(){this.nodes=new Map();this.html='';}
 set innerHTML(value){this.html=value;this.nodes=new Map();}
 get innerHTML(){return this.html;}
 querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,new NodeStub());return this.nodes.get(selector);}
 querySelectorAll(selector){
  const attribute=selector.match(/^\[(data-[\w-]+)\]$/)?.[1];if(!attribute)return [];
  if(!this.nodes.has(selector)){
   const matches=[...this.html.matchAll(new RegExp(`<[^>]+${attribute}="[^"]+"[^>]*>`,'g'))];
   this.nodes.set(selector,matches.map(match=>new NodeStub(Object.fromEntries([...match[0].matchAll(/data-([\w-]+)="([^"]+)"/g)].map(([,name,value])=>[name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),value.replaceAll('&amp;','&').replaceAll('&#39;',"'")])))));
  }
  return this.nodes.get(selector);
 }
}

test('English story views have no Chinese and all 300 checks provide actual feedback',()=>{
 setAdventure(base());setStoryLocale('en');
 const cast=new ContainerStub();mountAdventure(cast);assert.equal(chinese.test(cast.innerHTML),false);
 for(let stageId=1;stageId<=100;stageId++){
  const reading=getReading(stageId),container=new ContainerStub();mountReading(container,{stageId});
  assert.equal(chinese.test(container.innerHTML),false,`Reading ${stageId}`);
  assert.equal(chinese.test(getStoryOpening(stageId).title+getStoryOpening(stageId).text),false);
  for(const [index,quiz] of reading.quizzes.entries()){
   const options=container.querySelectorAll('[data-reading-answer]').filter(option=>Number(option.dataset.readingQuiz)===index);
   options.find(option=>option.dataset.readingAnswer!==quiz.answer).click();
   assert.match(container.querySelector(`[data-reading-feedback="${index}"]`).textContent,/try again/);
   options.find(option=>option.dataset.readingAnswer===quiz.answer).click();
   assert.ok(container.querySelector(`[data-reading-feedback="${index}"]`).textContent.includes(quiz.evidence));
   container.querySelectorAll('[data-reading-reveal]')[index].click();
   assert.ok(container.querySelector(`[data-reading-feedback="${index}"]`).textContent.includes(quiz.answer));
  }
 }
 const encounter=new ContainerStub();mountEncounter(encounter,{stageId:1,quest:1});
 assert.equal(chinese.test(encounter.innerHTML),false);
 encounter.querySelectorAll('[data-story-choice]')[0].click();
 assert.equal(chinese.test(encounter.innerHTML),false);assert.match(encounter.innerHTML,/Your choice stays/);
 mountEncounter(encounter,{stageId:3,quest:1});assert.equal(chinese.test(encounter.innerHTML),false);
 setStoryLocale('zh');const translated=new ContainerStub();mountReading(translated,{stageId:41});
 assert.ok(translated.innerHTML.includes('展開中文對照'));assert.ok(translated.innerHTML.includes(getReading(41).translation));
});


test('each of ten arc decisions has three distinct later consequences and final details',()=>{
 assert.equal(storyBranches.length,10);
 for(const branch of storyBranches){
  assert.ok(branch.payoff>branch.start&&branch.payoff<=branch.start+9);
  const echoes=[],endings=[];
  for(const action of ['curiosity','courage','kindness']){
   const state=base();state.choices[branch.key]={action,role:'cartographer'};
   const start=getEncounter(branch.start,1,state),payoff=getEncounter(branch.payoff,1,state);
   assert.equal(start.isBranch,true);
   assert.equal(start.choice.action,action);
   assert.equal(chinese.test(start.actions[action].result.zh),true);
   assert.equal(payoff.echo.en,branch.choices[action].echo.en);
   assert.deepEqual(payoff.echoKeys,[branch.key]);
   for(let quest=2;quest<=9;quest++)assert.equal(getEncounter(branch.payoff,quest,state).echo,null);
   for(let stage=branch.start;stage<branch.payoff;stage++)assert.equal(getEncounter(stage,1,state).echo,null);
   const ending=getStoryEnding(state);
   assert.equal(ending.echoes.length,1);
   assert.ok(getStoryReturn(100,state).en.includes(ending.en));
   assert.ok(getStoryReturn(100,state).zh.includes(ending.zh));
   echoes.push(payoff.echo.en);endings.push(ending.en);
  }
  assert.equal(new Set(echoes).size,3,`distinct arc ${branch.start} payoffs`);
  assert.equal(new Set(endings).size,3,`distinct arc ${branch.start} ending details`);
 }
 const state=base();
 for(const branch of storyBranches)state.choices[branch.key]={action:'kindness',role:'scholar'};
 assert.equal(getStoryEnding(state).echoes.length,10);
 assert.deepEqual(getEncounter(100,1,state).echoKeys,storyBranches.map(branch=>branch.key));
 assert.equal(getEncounter(100,2,state).echo,null);
 assert.equal(getStoryEnding(base()).echoes.length,0,'no past decisions invented for an old or empty save');
});

test('all roles supply distinct arc interpretations while preserving vocabulary independence',()=>{
 assert.equal(roleObservations.length,10);
 const hints=[];
 for(let arc=0;arc<10;arc++){
  const observations=roles.map(role=>{
   const state={...base(),role:role.id};
   const encounter=getEncounter(arc*10+1,1,state);
   assert.deepEqual(encounter.observation,roleObservations[arc][role.id]);
   assert.equal(chinese.test(encounter.observation.zh),true);
   hints.push(encounter.observation.en);
   return encounter.observation.en;
  });
  assert.equal(new Set(observations).size,3);
 }
 assert.equal(new Set(hints).size,30,'each role observation has an authored purpose');
 setAdventure(base());
 for(const branch of storyBranches)chooseEncounter(branch.start,1,'curiosity');
 assert.deepEqual(Object.keys(getAdventure()).sort(),['choices','role','seed','version']);
});

test('encounters stay at their story node and respect companion introductions for every seed',()=>{
 for(const seed of [0,1,77,20261003,0xffffffff]){
  for(let stage=1;stage<=100;stage++){
   for(let quest=1;quest<=9;quest++){
    const event=getEncounter(stage,quest,{...base(),seed});
    if(stage<11){assert.notEqual(event.npc,'Rowan');assert.doesNotMatch(JSON.stringify(event),/Rowan|羅恩/);}
    if(stage<22){assert.notEqual(event.npc,'Iona');assert.doesNotMatch(JSON.stringify(event),/Iona|艾歐娜/);}
    assert.equal(event.title.en,getEncounter(stage,1,base()).title.en);
   }
  }
 }
 assert.equal(getEncounter(11,1,base()).npc,'Rowan');
 assert.equal(getEncounter(22,1,base()).npc,'Iona');
 assert.equal(new Set(Array.from({length:100},(_,i)=>getEncounter(i+1,1,base()).text.en)).size,100);
});

test('bilingual opening and return share the same chapter timeline at seven checkpoints',()=>{
 const checkpoints=[1,3,11,22,72,93,100];
 for(const stage of checkpoints){
  const state=base(),result=getStoryReturn(stage,state);
  setStoryLocale('en');assert.equal(getStoryOpening(stage).text,result.en);
  setStoryLocale('zh');assert.equal(getStoryOpening(stage).text,result.zh);
  assert.equal(chinese.test(result.en),false);
  assert.equal(chinese.test(result.zh),true);
 }
 assert.match(getStoryReturn(1,base()).en,/letter is on the path/);
 assert.doesNotMatch(getStoryReturn(1,base()).zh,/交到收信人|圓滿的結尾|歸還/);
 assert.match(getStoryReturn(3,base()).en,/knows about the letter/);
 assert.match(getStoryReturn(11,base()).en,/Rowan is waiting/);
 assert.match(getStoryReturn(22,base()).en,/I am Iona/);
 assert.match(getStoryReturn(72,base()).en,/recognise Elspeth/);
 assert.match(getStoryReturn(93,base()).en,/place the envelope on his table at last/);
 assert.match(getStoryReturn(100,base()).en,/visitor carries a folded account/);
 assert.equal(new Set(Array.from({length:100},(_,i)=>getStoryReturn(i+1,base()).en)).size,100);
});

test('later chapters have individual continuation and no rotating filler sentences',()=>{
 const sentences=new Map();
 assert.equal(Object.keys(chapterContinuations).length,60);
 for(let stage=41;stage<=100;stage++){
  const chapter=getStoryReturn(stage,base());
  const parts=chapter.en.split(/(?<=[.!?])\s+/);
  assert.ok(parts.length>=5,`Chapter ${stage} has ${parts.length} sentences`);
  assert.ok(chapter.en.includes(chapterContinuations[stage].en));
  for(const sentence of parts){
   assert.ok(!sentences.has(sentence),`Chapters ${sentences.get(sentence)} and ${stage} repeat: ${sentence}`);
   sentences.set(sentence,stage);
  }
  assert.doesNotMatch(chapter.en,/another part of the story is waiting|For a moment, I want the answer to be simple|I write down what we have learned/);
 }
});

test('legacy v1 arbitrary quest keys remain valid without inventing new branch flags',()=>{
 const state=base();
 for(let stage=1;stage<=100;stage++)for(let quest=1;quest<=9;quest++)state.choices[`${stage}:${quest}`]={action:'courage',role:'scout'};
 assert.deepEqual(validateAdventure(state),state);
 setAdventure(state);
 assert.deepEqual(getAdventure(),state);
 assert.equal(getStoryEnding(state).echoes.length,10);
 assert.equal(chooseEncounter(100,9,'curiosity'),false);
});


test('encounter UI renders role observations, branch results and a single remembered payoff',()=>{
 setAdventure(base());setStoryLocale('en');
 const container=new ContainerStub();
 mountEncounter(container,{stageId:11,quest:1});
 assert.equal(chinese.test(container.innerHTML),false);
 assert.ok(container.innerHTML.includes(roleObservations[1].cartographer.en));
 const choices=container.querySelectorAll('[data-story-choice]');
 assert.equal(choices.length,3);
 choices.find(button=>button.dataset.storyChoice==='kindness').click();
 assert.match(container.innerHTML,/You move your bag off the reading chair/);
 mountEncounter(container,{stageId:18,quest:1});
 assert.match(container.innerHTML,/Ada takes the seat you kept open/);
 mountEncounter(container,{stageId:18,quest:2});
 assert.doesNotMatch(container.innerHTML,/Ada takes the seat you kept open/);
 setStoryLocale('zh');mountEncounter(container,{stageId:11,quest:1});
 assert.ok(container.innerHTML.includes(roleObservations[1].cartographer.zh));
});
