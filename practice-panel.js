import {stages} from './data.js';
import {locale,wordMeaning} from './i18n.js';
import {freshLearning,addActivity} from './learning-state.js';
import {judgeRecall,recallPrompt,transferTask} from './recall-support.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=(zh,en)=>locale==='en'?en:zh;
const all=stages.flatMap(s=>s.words);
export function activity(kind,stageId,response,evidence,result){return {id:crypto.randomUUID(),kind,stageId,response:String(response).slice(0,1200),evidence:String(evidence).slice(0,1200),result,at:new Date().toISOString()};}
export function mountPracticePanel(node,{getLearning,updateLearning,getState,onReview,onResume,onRead}){
 const learning=getLearning(),state=getState(),entries=Object.entries(state.words),now=Date.now(),due=entries.filter(([,e])=>e.nextDue<=now),future=entries.map(([,e])=>e.nextDue).filter(t=>t>now).sort((a,b)=>a-b)[0];
 const hard=entries.filter(([,e])=>e.incorrect>0).sort((a,b)=>b[1].incorrect-a[1].incorrect).slice(0,5).map(([id])=>all.find(w=>w.id===id)?.word).filter(Boolean);
 node.innerHTML=`<h2>${say('安排今天的練習','Plan today’s practice')}</h2><p>${say('先處理到期單字，再用適合自己的步伐學新字。','Review due words, then choose a comfortable new-word batch.')}</p><label>${say('每次新字數','New words per batch')} <select id="practice-size">${[3,5,10].map(n=>`<option ${learning.batchSize===n?'selected':''}>${n}</option>`).join('')}</select></label><div class="practice-actions"><button type="button" id="due-practice" ${entries.length?'':'disabled'}>${say(`今日到期 ${due.length} 字・先複習`,`Review ${due.length} due words first`)}</button>${learning.draft?`<button type="button" id="resume-draft">${say('接續未完成練習','Resume unfinished practice')}</button>`:''}<button type="button" id="placement-start">${say('已有基礎？檢查練習起點','Find a practice starting point')}</button></div><p>${future?say('下次到期：','Next due: ')+new Date(future).toLocaleString(locale==='en'?'en-GB':'zh-TW'):say('完成學習後，這裡會顯示下次回訪時間。','Complete a batch to see your next review time.')}</p>${hard.length?`<p>${say('曾出錯、可優先留意：','Previously missed: ')}${esc(hard.join('、'))}</p>`:''}<details><summary>${say('自由選章練習（不改冒險進度）','Choose a practice chapter (separate from journey progress)')}</summary><label>${say('練習章節','Practice chapter')} <select id="free-stage">${stages.map(s=>`<option value="${s.id}">${s.id} · ${esc(s.words[0]?.word)}</option>`).join('')}</select></label><label>${say('從第幾個詞開始','Start at word number')} <input id="free-offset" type="number" min="1" max="60" value="1"></label><button type="button" id="free-reading">${say('閱讀所選章節的故事','Read this chapter story')}</button><button id="free-start">${say('開始獨立練習','Start independent practice')}</button><p>${say('可先檢核或直接選章；結果另存，不增加已學字數、XP或熟練。','Check a starting point or choose any chapter; results do not award learned words, XP or mastery.')}</p></details>`;
 node.querySelector('#practice-size').onchange=e=>updateLearning({...getLearning(),batchSize:Number(e.target.value)});
 node.querySelector('#due-practice').onclick=()=>onReview();
 if(node.querySelector('#resume-draft'))node.querySelector('#resume-draft').onclick=onResume;
 node.querySelector('#placement-start').onclick=()=>openCheck({getLearning,updateLearning});
 node.querySelector('#free-reading').onclick=()=>onRead(Number(node.querySelector('#free-stage').value));
 node.querySelector('#free-stage').onchange=()=>{const input=node.querySelector('#free-offset');input.max=String(stages[Number(node.querySelector('#free-stage').value)-1].words.length);input.value='1';};
 node.querySelector('#free-start').onclick=()=>openCheck({getLearning,updateLearning,stageId:Number(node.querySelector('#free-stage').value),offset:Math.max(0,Math.min(stages[Number(node.querySelector('#free-stage').value)-1].words.length-1,(Number(node.querySelector('#free-offset').value)||1)-1))});
}
function openCheck({getLearning,updateLearning,stageId,offset=0}){
 const dialog=document.createElement('dialog');dialog.className='practice-dialog';document.body.append(dialog);
 const sample=stageId?stages[stageId-1].words.slice(offset,offset+getLearning().batchSize).map(w=>({w,stage:stageId})): [1,21,41].flatMap(id=>stages[id-1].words.slice(0,3).map(w=>({w,stage:id})));
 let index=0,answers=[];const save=r=>updateLearning(addActivity(getLearning(),r));
 function render(){
  const item=sample[index];
  if(!item){
   const correct=answers.filter(x=>x.correct).length;
   const suggested=stageId||[1,21,41].filter(id=>answers.filter(x=>x.stage===id&&x.correct).length>=2).at(-1)||1;
   save(activity(stageId?'level-practice':'placement',suggested,`${correct}/${sample.length}`,answers.map(x=>`${x.word}:${x.correct?'correct':'review'}`).join(', '),'suggestion'));
   dialog.innerHTML=`<h2>${say('檢核紀錄已保存','Practice check saved')}</h2><p>${correct} / ${sample.length}</p><p>${say(`可從第 ${suggested} 章的自由練習試起。這只是少量詞彙回想樣本，不是程度認證，也不會解鎖冒險或增加XP。`,`Try independent practice in chapter ${suggested}. This small recall sample is not a proficiency test and does not unlock chapters or award XP.`)}</p>${stageId&&offset+sample.length<stages[stageId-1].words.length?`<button id="check-continue">${say('接續本章下一批','Next batch in this chapter')}</button>`:''}<button id="check-close">${say('關閉','Close')}</button>`;dialog.querySelector('#check-close').onclick=()=>dialog.close();if(dialog.querySelector('#check-continue'))dialog.querySelector('#check-continue').onclick=()=>{dialog.close();openCheck({getLearning,updateLearning,stageId,offset:offset+sample.length});};return;
  }
  const p=recallPrompt(item.w);
  dialog.innerHTML=`<h2>${say(stageId?'自由章節練習':'練習起點檢核',stageId?'Independent practice':'Starting-point check')}</h2><p>${index+1} / ${sample.length} · ${say('不計XP或熟練','No XP or mastery')}</p><p>${esc(wordMeaning(item.w))}</p><p lang="en">${esc(p.sentence)}</p><p>${say(`本題目標字以 ${p.initial} 開頭，共 ${p.length} 個字元。`,`Target: starts with ${p.initial}, ${p.length} characters.`)}</p><form><label>${say('輸入目標英文','Target word')} <input maxlength="100" autocomplete="off" spellcheck="false"></label><button>${say('檢查','Check')}</button></form><div role="status" id="check-feedback"></div><button type="button" id="check-skip">${say('還不會・看答案','Not yet — show answer')}</button><button type="button" id="check-exit">${say('離開檢核','Leave check')}</button>`;
  const submit=(input,skip=false)=>{
   const result=judgeRecall(item.w,input,all,locale);
   const feedback=dialog.querySelector('#check-feedback');
   if(result.kind==='alternative'&&!skip){feedback.textContent=say(`這個回答與提示義相近，不算答錯。本題要回想 ${p.initial} 開頭、${p.length} 字元的目標；請再試一次。`,`This answer has a related gloss; it is not marked wrong. Recall the ${p.length}-character target starting with ${p.initial}.`);return;}
   const correct=!skip&&result.kind==='correct';answers.push({stage:item.stage,word:item.w.word,correct});
   feedback.textContent=`${correct?say('答對','Correct'):say('可以再練習','Needs practice')}：${item.w.word} — ${wordMeaning(item.w)}`;
   dialog.querySelector('form').hidden=true;dialog.querySelector('#check-skip').hidden=true;
   const next=document.createElement('button');next.textContent=say('下一題','Next');next.onclick=()=>{index++;render();};feedback.append(next);
  };
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();submit(dialog.querySelector('input').value);};
  dialog.querySelector('#check-skip').onclick=()=>submit('',true);dialog.querySelector('#check-exit').onclick=()=>dialog.close();
 }
 dialog.addEventListener('close',()=>dialog.remove());render();dialog.showModal();
}
export function mountTransfer(node,{word,stageId,records=[],onRecord}){
 const task=transferTask(word),previous=records.filter(r=>r.kind==='transfer'&&r.stageId===stageId&&r.id.startsWith(`transfer:${word.id}:`)).at(-1);
 node.innerHTML=`<h3>${say('換個情境，再用一次','Use it in a new context')}</h3><p>${say('獨立運用紀錄，不增加單字XP或熟練。','Separate application record; no vocabulary XP or mastery.')}</p>${task.kind==='guided'?`<p lang="en">${esc(task.sentence)}</p><p>${esc(task.translation)}</p><p>${say('目標單字：','Target word: ')}${esc(word.word)} · ${say('請填空並用自己的話說明句意。','Fill the gap and explain its meaning.')}</p>`:`<p>${say('請用','Write a new sentence with')} <strong>${esc(word.word)}</strong> ${say('寫一句不同於字卡的新句，再用中文或自己的英文說明情境。','and explain its context in your own words.')}</p>`}<label>${say('新句／句意說明','Sentence / meaning')}<textarea maxlength="1200" rows="3">${esc(previous?.response||'')}</textarea></label><label>${say('自我檢查：這個字在句中表示什麼？','Self-check: what does the word mean here?')}<textarea maxlength="1200" rows="2">${esc(previous?.evidence||'')}</textarea></label><button type="button">${say('保存運用紀錄','Save application record')}</button><p role="status">${previous?say('已有紀錄；可修改後再保存。','Previous record loaded.'):say('系統保存文字，不自動評定文法與語意；可交給老師或依辭典例句自評。','Text is saved, not automatically graded for grammar or meaning; review with a teacher or dictionary.')}</p>`;
 node.querySelector('button').onclick=()=>{const inputs=node.querySelectorAll('textarea'),response=inputs[0].value.trim(),evidence=inputs[1].value.trim();if(!response||!evidence){node.querySelector('[role=status]').textContent=say('請完成句子與自我檢查。','Complete both fields.');return;}const record=activity('transfer',stageId,response,evidence,'needs-review');record.id=`transfer:${word.id}:${record.id}`;onRecord(record);node.querySelector('[role=status]').textContent=say('已加入待自評／教師回饋的運用紀錄。','Saved for self-review or teacher feedback.');};
}
