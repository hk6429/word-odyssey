import test from 'node:test';
import assert from 'node:assert/strict';
import {getReading} from '../story.js';
import {checkInterpretation,readingPracticeHtml,bindReadingPractice,firstChapterChecks,makeReadingRecord} from '../reading-practice.js';

test('all chapters have a main-story interpretation task; an existing quote never grades reasoning',()=>{
 for(let id=1;id<=100;id++){
  const reading=getReading(id);
  assert.equal(checkInterpretation(reading,'unsupported conclusion',reading.storyText),'needs-review');
  assert.equal(checkInterpretation(reading,'my reading',reading.missions[0].sentence),'evidence-missing');
  assert.equal(checkInterpretation(reading,'',reading.storyText),'response-missing');
  assert.equal(checkInterpretation(reading,'my reading','A'),'evidence-missing');
  const html=readingPracticeHtml(reading,'en');
  assert.doesNotMatch(html,/[\u3400-\u9fff]/);
  assert.match(html,/has NOT been graded/);
  for(const focus of ['purpose','cause','reference','inference'])assert.match(html,new RegExp(`value="${focus}"`));
 }
 for(const check of firstChapterChecks)assert.ok(getReading(1).storyText.includes(check.evidence));
});

test('rendered saved responses are account-supplied, escaped and stage scoped',()=>{
 const record=makeReadingRecord(1,'interpretation','reading-comprehension','[inference] <img src=x onerror=alert(1)>','</textarea><script>alert(1)</script>','evidence-missing');
 const html=readingPracticeHtml(getReading(1),'zh',[record]);
 assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<script>/);
 assert.match(html,/value="inference" selected/);
 assert.match(html,/is made of/);assert.match(html,/beside/);assert.match(html,/path/);
 assert.doesNotMatch(readingPracticeHtml(getReading(2),'zh',[record]),/onerror/);
 assert.deepEqual(Object.keys(record).sort(),['id','kind','stageId','response','evidence','result','at'].sort());
});

test('submission records interpretation and quotation, then restores them after rerender',()=>{
 const handlers={},feedback={},prompt={};
 const form={elements:{focus:{value:'inference',addEventListener:()=>{}},response:{value:'It is too early to identify the owner.'},evidence:{value:'The letter has no name.'}},querySelector:selector=>selector.includes('prompt')?prompt:feedback,addEventListener:(name,callback)=>{handlers[name]=callback;}};
 const container={querySelectorAll:()=>[],querySelector:()=>form};
 const records=[];
 bindReadingPractice(container,getReading(1),'en',record=>records.push(record));
 handlers.submit({preventDefault(){}});
 assert.equal(records.length,1);assert.equal(records[0].result,'needs-review');
 assert.match(feedback.textContent,/NOT been graded/);
 const restored=readingPracticeHtml(getReading(1),'en',records);
 assert.match(restored,/It is too early to identify the owner/);
 assert.match(restored,/The letter has no name/);
 form.elements.evidence.value='The fox wrote the letter.';
 handlers.submit({preventDefault(){}});
 assert.equal(records[1].result,'evidence-missing');
 assert.match(feedback.textContent,/Quotation not found/);
});
