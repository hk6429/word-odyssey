import test from 'node:test';
import assert from 'node:assert/strict';
import { getReading, getAdventure, setAdventure, validateAdventure, getStoryStats, getEncounter, chooseEncounter, setStoryLocale, mountAdventure, mountEncounter, mountReading, getStoryOpening } from '../story.js';

const base=()=>({version:1,seed:20261003,role:'cartographer',choices:{}});
const chinese=/[\u3400-\u9fff]/;

test('100 unique bilingual readings have real focus words and valid cloze evidence',()=>{
 const readings=Array.from({length:100},(_,i)=>getReading(i+1));
 assert.equal(new Set(readings.map(r=>r.text)).size,100);
 assert.equal(new Set(readings.map(r=>r.title.en)).size,100);
 assert.equal(new Set(readings.map(r=>r.sceneClass)).size,100);
 assert.equal(new Set(readings.map(r=>r.quiz.evidence)).size,100);
 for(const r of readings){
  assert.equal(chinese.test(r.text),false,`English passage ${r.id}`);
  assert.equal(chinese.test(r.translation),true,`Translation ${r.id}`);
  assert.equal(r.quiz.options.length,3);
  assert.equal(new Set(r.quiz.options).size,3);
  assert.ok(r.quiz.options.includes(r.quiz.answer));
  assert.ok(r.text.includes(r.quiz.evidence));
  assert.ok(r.quiz.prompt.includes('_____'));
  for(const word of r.focusWords) assert.match(r.text,new RegExp(`\\b${word}\\b`,'i'));
  assert.match(r.quiz.evidence,new RegExp(`\\b${r.quiz.answer}\\b`,'i'));
  if(r.id<=20){assert.equal(r.format,'short');assert.ok(r.wordCount<40);}
  else if(r.id<=40){assert.equal(r.format,'dialogue');assert.ok(r.text.includes('“'));}
  else{assert.equal(r.format,'passage');assert.ok(r.wordCount>=80&&r.wordCount<=130,`${r.id}: ${r.wordCount}`);}
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
   const key=attribute.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
   const matches=[...this.html.matchAll(new RegExp(`${attribute}="([^"]+)"`,'g'))];
   this.nodes.set(selector,matches.map(match=>new NodeStub({[key]:match[1]})));
  }
  return this.nodes.get(selector);
 }
}

test('English story views have no Chinese and all 100 checks provide actual feedback',()=>{
 setAdventure(base());setStoryLocale('en');
 const cast=new ContainerStub();mountAdventure(cast);assert.equal(chinese.test(cast.innerHTML),false);
 for(let stageId=1;stageId<=100;stageId++){
  const reading=getReading(stageId),container=new ContainerStub();mountReading(container,{stageId});
  assert.equal(chinese.test(container.innerHTML),false,`Reading ${stageId}`);
  assert.equal(chinese.test(getStoryOpening(stageId).title+getStoryOpening(stageId).text),false);
  const options=container.querySelectorAll('[data-reading-answer]');
  options.find(option=>option.dataset.readingAnswer!==reading.quiz.answer).click();
  assert.match(container.querySelector('.story-reading-feedback').textContent,/try again/);
  options.find(option=>option.dataset.readingAnswer===reading.quiz.answer).click();
  assert.ok(container.querySelector('.story-reading-feedback').textContent.includes(reading.quiz.evidence));
  container.querySelector('.story-reveal').click();
  assert.ok(container.querySelector('.story-reading-feedback').textContent.includes(reading.quiz.answer));
 }
 const encounter=new ContainerStub();mountEncounter(encounter,{stageId:1,quest:1});
 assert.equal(chinese.test(encounter.innerHTML),false);
 encounter.querySelectorAll('[data-story-choice]')[0].click();
 assert.equal(chinese.test(encounter.innerHTML),false);assert.match(encounter.innerHTML,/Your choice stays/);
 mountEncounter(encounter,{stageId:3,quest:1});assert.equal(chinese.test(encounter.innerHTML),false);
 setStoryLocale('zh');const translated=new ContainerStub();mountReading(translated,{stageId:41});
 assert.ok(translated.innerHTML.includes('展開中文對照'));assert.ok(translated.innerHTML.includes(getReading(41).translation));
});
