import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {listeningQuestions} from '../listening-practice.js';
import {stages} from '../data.js';
import {bundledWords} from '../audio-manifest.js';
import {requiresContextAudio} from '../curriculum-support.js';
test('all chapters offer recorded listening with unique meanings and one answer',()=>{
 for(const stage of stages){
  const questions=listeningQuestions(stage.id,10);
  assert.ok(questions.length>0,`chapter ${stage.id}`);
  assert.ok(questions.length<=10);
  assert.equal(new Set(questions.map(q=>q.word.id)).size,questions.length);
  for(const q of questions){
   assert.ok(stage.words.some(w=>w.id===q.word.id));
   assert.ok(!requiresContextAudio(q.word));
   assert.ok(existsSync(`audio/words/${bundledWords[q.word.word.trim().toLowerCase()]}.mp3`));
   assert.equal(q.options.length,4);
   assert.equal(new Set(q.options.map(o=>o.meaning)).size,4);
   assert.equal(q.options.filter(o=>o.id===q.word.id).length,1);
  }
 }
});
test('question generation respects batch sizes, invalid chapters, and leaves curriculum intact',()=>{
 const before=JSON.stringify(stages);
 for(const n of [3,5,10])assert.ok(listeningQuestions(1,n).length<=n);
 assert.deepEqual(listeningQuestions(0),[]);
 assert.deepEqual(listeningQuestions(101),[]);
 assert.equal(JSON.stringify(stages),before);
});
