import test from 'node:test';
import assert from 'node:assert/strict';
import {getReading} from '../story.js';
import {checkInterpretation,readingPracticeHtml,buildReadingTasks,createTaskRun,makeReadingRecord} from '../reading-practice.js';
import {validateLearning,freshLearning,addActivity} from '../learning-state.js';

test('100 章都有選擇、配對、原文排序；答案與引文來自教材',()=>{
 for(let id=1;id<=100;id++){
  const reading=getReading(id),tasks=buildReadingTasks(reading,'en');
  assert.ok(tasks.some(t=>t.type==='choice'));assert.ok(tasks.some(t=>t.type==='match'));assert.ok(tasks.some(t=>t.type==='order'));
  assert.doesNotMatch(readingPracticeHtml(reading,'en'),/<textarea|<input|[\u3400-\u9fff]/);
  assert.doesNotMatch(JSON.stringify(tasks),/[\u3400-\u9fff]/);
  for(const task of tasks){
   assert.ok(reading.text.includes(task.evidence),`${id}: ${task.id}`);
   if(task.type==='order'){assert.equal(task.answer.map(i=>task.options[i]).join(' '),task.evidence);assert.equal(new Set(task.options).size,task.options.length);}
   else{assert.ok(task.options[task.answer]);assert.equal(new Set(task.options).size,task.options.length);}
  }
 }
});
test('答對直接前進，答錯保留解析，重複送出與越界選項不會灌入紀錄',()=>{
 const tasks=buildReadingTasks(getReading(1),'zh'),run=createTaskRun(tasks);
 assert.equal(run.answer(0).correct,true);assert.equal(run.index,1);
 assert.equal(run.answer(0).correct,false);assert.equal(run.index,1);assert.equal(run.awaiting,true);
 assert.equal(run.answer(1),null);assert.equal(run.results.length,2);
 assert.equal(run.next(),true);assert.equal(run.index,2);assert.equal(run.next(),false);
 assert.equal(run.answer(99),null);
});
test('排序能撤回，重複片段不可重選，完整順序才評分且錯序會停留',()=>{
 const q=buildReadingTasks(getReading(1),'zh').find(t=>t.type==='order'),run=createTaskRun([q]);
 assert.equal(run.answer(q.answer[0]).pending,true);assert.equal(run.answer(q.answer[0]),null);
 run.undo();assert.equal(run.selected.length,0);
 for(const i of [0,1,2])run.answer(i);
 assert.equal(run.awaiting,true);assert.equal(run.results[0].correct,false);run.next();assert.equal(run.done,true);
 const correct=createTaskRun([q]);for(const i of q.answer)correct.answer(i);assert.equal(correct.done,true);
});
test('舊文字紀錄安全保留，只作人工檢視，不轉成客觀答對',()=>{
 const record=makeReadingRecord(1,'interpretation','reading-comprehension','<img src=x onerror=alert(1)>','</textarea><script>alert(1)</script>','needs-review');
 const html=readingPracticeHtml(getReading(1),'zh',[record]);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<script>|<textarea/);
 assert.match(html,/未自動評定/);assert.doesNotMatch(readingPracticeHtml(getReading(2),'zh',[record]),/onerror/);
 assert.equal(checkInterpretation(getReading(1),'猜測',getReading(1).storyText),'needs-review');
 const r=makeReadingRecord(1,'story-order','reading-check','A → B','A B','correct');
 assert.equal(validateLearning(addActivity(freshLearning(),r)).activities[0].result,'correct');
});
