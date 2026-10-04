import {choiceHint} from './choice-keyboard.js';
const text = (en, zh) => ({ en, zh });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ');
export const firstChapterChecks = [
 {id:'reference',prompt:text('What does “it” in “A fox sits beside it” refer to?','「A fox sits beside it」中的 it 指什麼？'),options:[text('The red letter','紅色的信'),text('The fox','狐狸'),text('A named traveller','有名字的旅人')],answer:0,evidence:'A red letter is on the path. A fox sits beside it.'},
 {id:'inference',prompt:text('Which conclusion is supported by this passage?','哪一個判斷有這段原文支持？'),options:[text('The fox wrote the letter.','狐狸寫了這封信。'),text('We cannot identify the owner from a name on the letter.','我們無法根據信上的名字確認主人。'),text('The letter is addressed to the fox.','這封信是寄給狐狸的。')],answer:1,evidence:'The letter has no name.'},
];
export function checkInterpretation(reading, response, evidence) {
 if (!normalize(response)) return 'response-missing';
 const quote = normalize(evidence);
 return quote.length >= 8 && normalize(reading.storyText).includes(quote) ? 'needs-review' : 'evidence-missing';
}
export function makeReadingRecord(stageId, taskId, kind, response, evidence, result) {
 return {id:`${taskId}:${Date.now()}:${Math.random().toString(36).slice(2,10)}`,kind,stageId,response:String(response).slice(0,1200),evidence:String(evidence).slice(0,1000),result,at:new Date().toISOString()};
}
const reviewNotice = text('Only the quotation is checked against the story. Your interpretation has NOT been graded; review its reasoning yourself or with a teacher.','僅核對引句是否出現在主線原文；未自動評定解讀或推論是否正確，請自行檢核或與教師討論。');

export function buildReadingTasks(reading,locale='zh'){
 const pick=value=>value[locale==='en'?'en':'zh'];
 const checks=reading.id===1?firstChapterChecks.map(q=>({...q,type:'choice',prompt:pick(q.prompt),options:q.options.map(pick)})):[];
 const cloze=reading.quizzes.map((q,i)=>({id:`word-${i}`,type:'choice',kind:'reading-word',prompt:pick(text('Choose the word in the original sentence.','選出原句中的單字。')),context:q.prompt,options:q.options,answer:q.options.indexOf(q.answer),evidence:q.evidence}));
 const match=reading.missions.map((m,i)=>({id:`pair-${i}`,type:'match',prompt:locale==='en'?'Match the word to its sentence.':`詞義配對：哪個單字表示「${m.meaning}」？`,context:locale==='en'?reading.quizzes[i].prompt:m.translation,options:reading.quizzes[i].options,answer:reading.quizzes[i].options.indexOf(m.word),evidence:m.sentence}));
 const segments=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(reading.storyText)].map(x=>x.segment.trim()).filter(Boolean).slice(0,3);
 const order=segments.length<2?[]:[{id:'story-order',type:'order',prompt:pick(text('Tap these excerpts in the order they appear in the story.','依照原文出現的順序，逐一點選這些片段。')),options:[...segments.slice(1),segments[0]],answer:segments.map((_,i)=>(i+segments.length-1)%segments.length),evidence:segments.join(' ')}];
 return [...checks,...cloze,...match,...order];
}
export function createTaskRun(tasks){
 const run={index:0,selected:[],awaiting:false,results:[],get done(){return this.index>=tasks.length;},
 answer(option){
  if(this.done||this.awaiting)return null;
  const q=tasks[this.index];if(!Number.isInteger(option)||option<0||option>=q.options.length)return null;
  if(q.type==='order'){if(this.selected.includes(option))return null;this.selected.push(option);if(this.selected.length<q.options.length)return {pending:true};}
  const correct=q.type==='order'?this.selected.every((v,i)=>v===q.answer[i]):option===q.answer;
  const result={correct,task:q,response:q.type==='order'?this.selected.map(i=>q.options[i]).join(' → '):q.options[option]};
  this.results.push(result);this.awaiting=!correct;if(correct){this.index++;this.selected=[];}return result;
 },next(){if(!this.awaiting)return false;this.index++;this.selected=[];this.awaiting=false;return true;},undo(){if(!this.awaiting)this.selected.pop();}};
 return run;
}
export function bindTaskDeck(node,tasks,locale='zh',onResult=()=>{}){
 if(!node)return;
 const en=locale==='en',run=createTaskRun(tasks);let last='';
 function render(focus=false){
  if(run.done){node.innerHTML=`<div class="task-finish" role="status"><h4>${en?'This reading trail is complete':'這段閱讀任務完成了'}</h4><p>${en?'First answers correct':'首次作答答對'} ${run.results.filter(r=>r.correct).length} / ${tasks.length}</p><p>${en?'These practice records do not award vocabulary XP or unlock chapters.':'這些練習另存紀錄，不增加單字 XP 或解鎖大關。'}</p><button type="button" data-task-restart>${en?'Practise again':'再練一次'}</button></div>`;node.querySelector('[data-task-restart]').onclick=()=>bindTaskDeck(node,tasks,locale,onResult);return;}
  const q=tasks[run.index],label=q.type==='order'?(en?'Order':'排序'):q.type==='match'?(en?'Match':'配對'):(en?'Choose':'選擇');
  node.innerHTML=`<fieldset class="task-card" data-quiz-options tabindex="-1"><legend>${label} · ${run.index+1} / ${tasks.length}</legend><h4>${escape(q.prompt)}</h4>${q.context?`<p class="task-context">${escape(q.context)}</p>`:''}${q.type==='order'?`<ol class="task-order">${run.selected.map(i=>`<li>${escape(q.options[i])}</li>`).join('')}</ol><p>${en?'Tap to arrange; no dragging needed.':'點一下就能排列，不必拖曳。'}</p>`:''}<div class="task-options">${q.options.map((v,i)=>`<button type="button" data-quiz-choice data-task-option="${i}" ${run.awaiting||run.selected.includes(i)?'disabled':''}><small>${'ABCD'[i]}</small> ${escape(v)}</button>`).join('')}</div>${q.type==='order'?`<button type="button" data-task-undo ${!run.selected.length||run.awaiting?'disabled':''}>${en?'Undo last selection':'撤回上一個'}</button>`:''}<p class="task-feedback" role="status">${escape(last)}</p>${run.awaiting?`<button type="button" data-task-next>${en?'Read explanation, then continue':'看懂解析，繼續'}</button>`:''}</fieldset>`;
  node.querySelectorAll('[data-task-option]').forEach(b=>b.onclick=()=>{const result=run.answer(Number(b.dataset.taskOption));if(!result)return;if(!result.pending){onResult(result);last=result.correct?(en?'Correct — next task.':'答對了，進入下一題。'):(en?'Compare with the original: ':'請核對原文：')+result.task.evidence;}render(true);});
  const next=node.querySelector('[data-task-next]');if(next)next.onclick=()=>{run.next();last='';render(true);};
  const undo=node.querySelector('[data-task-undo]');if(undo)undo.onclick=()=>{run.undo();render(true);};
  if(focus)node.querySelector('fieldset').focus();
 }
 render();return run;
}
export function readingPracticeHtml(reading,locale='zh',records=[]){
 const en=locale==='en',old=records.filter(r=>r.stageId===reading.id&&r.kind==='reading-comprehension');
 return `<section class="story-comprehension" aria-label="${en?'Story understanding':'主線理解'}"><h4>${en?'Choose, match and order':'選一選、配一配、排一排'}</h4><p>${en?'One task at a time. No written response required.':'一次一題，不必輸入長篇文字。'}</p><p>${en?'Keys: A ← / 1 · B ↑ / 2 · C ↓ / 3 · D → / 4':choiceHint}</p><div data-reading-deck></div>${old.length?`<details class="saved-reading-notes"><summary>${en?'Your earlier written notes':'先前寫下的閱讀紀錄'}</summary>${old.map(r=>`<blockquote><p>${escape(r.response)}</p><p>${escape(r.evidence)}</p><small>${escape(en?reviewNotice.en:reviewNotice.zh)}</small></blockquote>`).join('')}</details>`:''}</section>`;
}
export function bindReadingPractice(container,reading,locale='zh',onPractice=()=>{}){
 return bindTaskDeck(container.querySelector('[data-reading-deck]'),buildReadingTasks(reading,locale),locale,r=>{const source=container.querySelector('.reading-source');if(source)source.open=false;onPractice(makeReadingRecord(reading.id,r.task.id,r.task.kind??'reading-check',r.response,r.task.evidence,r.correct?'correct':'incorrect'));});
}
