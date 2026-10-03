const text = (en, zh) => ({ en, zh });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ');
export const firstChapterChecks = [
 {id:'reference',prompt:text('What does “it” in “A fox sits beside it” refer to?','「A fox sits beside it」中的 it 指什麼？'),options:[text('The red letter','紅色的信'),text('The fox','狐狸'),text('A named traveller','有名字的旅人')],answer:0,evidence:'A red letter is on the path. A fox sits beside it.'},
 {id:'inference',prompt:text('Which conclusion is supported by this passage?','哪一個判斷有這段原文支持？'),options:[text('The fox wrote the letter.','狐狸寫了這封信。'),text('We cannot identify the owner from a name on the letter.','我們無法根據信上的名字確認主人。'),text('The letter is addressed to the fox.','這封信是寄給狐狸的。')],answer:1,evidence:'The letter has no name.'},
];
export const interpretationTasks = [
 {id:'purpose',label:text('Purpose','人物目的'),prompt:text('Choose a character or speaker. What might they want? Explain which action or words support your reading. If the purpose is unstated, say what is still unknown.','選一位人物或說話者：他可能想達成什麼？用動作或話語說明理由；若原文沒說，指出仍不知道的部分。')},
 {id:'cause',label:text('Cause and effect','前因後果'),prompt:text('Explain how one event affects the next. Distinguish a stated cause from your guess; if no cause is given, explain what is missing.','說明一件事如何影響後續。分清楚原文明說的原因與你的猜測；若沒有交代因果，說明缺少什麼資訊。')},
 {id:'reference',label:text('Reference and connection','指涉連結'),prompt:text('Choose a pronoun or repeated description. Explain who or what it refers to, using a nearby sentence. If there is no pronoun, explain how two mentions connect.','選一個代名詞或重複出現的描述，用前後句說明它指誰或什麼；若沒有代名詞，說明兩處提及的內容如何連結。')},
 {id:'inference',label:text('Inference and uncertainty','推論與疑問'),prompt:text('Make one inference about the scene. Explain how your quotation supports it, and name one thing the passage does not yet establish.','對這個場景提出一個推論，說明引句如何支持它，再指出一件原文仍無法確定的事。')},
];
export function checkInterpretation(reading, response, evidence) {
 if (!normalize(response)) return 'response-missing';
 const quote = normalize(evidence);
 return quote.length >= 8 && normalize(reading.storyText).includes(quote) ? 'needs-review' : 'evidence-missing';
}
export function makeReadingRecord(stageId, taskId, kind, response, evidence, result) {
 return {id:`${taskId}:${Date.now()}:${Math.random().toString(36).slice(2,10)}`,kind,stageId,response:String(response).slice(0,1200),evidence:String(evidence).slice(0,1000),result,at:new Date().toISOString()};
}
function latest(records, stageId, taskId, kind) {
 return [...records].reverse().find(record => record.stageId === stageId && record.kind === kind && String(record.id).startsWith(`${taskId}:`));
}
const reviewNotice = text('Only the quotation is checked against the story. Your interpretation has NOT been graded; review its reasoning yourself or with a teacher.','僅核對引句是否出現在主線原文；未自動評定解讀或推論是否正確，請自行檢核或與教師討論。');
export function readingPracticeHtml(reading, locale='zh', records=[]) {
 const pick = value => value[locale === 'en' ? 'en' : 'zh'];
 const previous = latest(records, reading.id, 'interpretation', 'reading-comprehension');
 const glossary = reading.id === 1 ? `<details class="story-translation"><summary>${pick(text('Word and phrase support','詞句支援'))}</summary><dl><dt>path</dt><dd>${pick(text('a small way for walking; “on the path” tells where the letter is','小路；on the path 說明信的位置'))}</dd><dt>beside</dt><dd>${pick(text('next to; “beside it” means next to the letter','在……旁邊；beside it 指在那封信旁'))}</dd><dt>is made of</dt><dd>${pick(text('tells what material something uses; the bridge uses stone','由……製成；手札例句中的橋以石頭建造'))}</dd></dl></details>` : '';
 return `${glossary}<section class="story-comprehension" aria-label="${pick(text('Story understanding','主線理解'))}"><h4>${pick(text('Understand the main story','讀懂主線故事'))}</h4>${reading.id===1?firstChapterChecks.map(check=>`<fieldset><legend>${escape(pick(check.prompt))}</legend>${check.options.map((option,index)=>`<button type="button" class="story-button" data-story-check="${check.id}" data-story-option="${index}">${escape(pick(option))}</button>`).join('')}<p data-story-check-feedback="${check.id}" aria-live="polite">${(()=>{const saved=latest(records,reading.id,check.id,'reading-check');return saved?escape(`${pick(saved.result==='correct'?text('Correct','答對了'):text('Revisit the evidence','再核對證據'))} ${saved.evidence}`):'';})()}</p></fieldset>`).join(''):''}<form data-interpretation><label>${pick(text('Choose a reading focus','選擇解讀角度'))}<select name="focus">${interpretationTasks.map(task=>`<option value="${task.id}" ${previous?.response.startsWith(`[${task.id}]`)?'selected':''}>${pick(task.label)}</option>`).join('')}</select></label><p data-interpretation-prompt></p><label>${pick(text('Your interpretation and reasoning (Chinese or English)','你的解讀與理由（中文或英文皆可）'))}<textarea name="response" rows="4" maxlength="1150" required>${escape(previous?.response.replace(/^\[[a-z]+\] /,'')||'')}</textarea></label><label>${pick(text('Quote at least 8 characters from the English main story above','引用上方英文主線原文（至少 8 個字元）'))}<textarea name="evidence" rows="2" maxlength="1000" required>${escape(previous?.evidence||'')}</textarea></label><button type="submit" class="story-button">${pick(text('Record and check quotation','記錄並核對引文'))}</button><p data-interpretation-feedback aria-live="polite">${previous?escape(pick(previous.result==='needs-review'?reviewNotice:text('This quotation was not found in the main story. Revise it and explain your reasoning.','上次引句未在主線原文找到，請修正引句並說明理由。'))):''}</p><small>${pick(reviewNotice)}</small></form></section>`;
}
export function bindReadingPractice(container, reading, locale='zh', onPractice=()=>{}) {
 const pick=value=>value[locale==='en'?'en':'zh'];
 container.querySelectorAll('[data-story-check]').forEach(button=>button.addEventListener('click',()=>{
  const check=firstChapterChecks.find(item=>item.id===button.dataset.storyCheck);
  const option=Number(button.dataset.storyOption),correct=option===check.answer;
  container.querySelector(`[data-story-check-feedback="${check.id}"]`).textContent=`${pick(correct?text('Correct. Evidence:','答對了。證據：'):text('Revisit the evidence:','再核對證據：'))} ${check.evidence}`;
  onPractice(makeReadingRecord(reading.id,check.id,'reading-check',check.options[option].en,check.evidence,correct?'correct':'incorrect'));
 }));
 const form=container.querySelector('[data-interpretation]');
 if(!form?.elements)return;
 const updatePrompt=()=>{form.querySelector('[data-interpretation-prompt]').textContent=pick(interpretationTasks.find(task=>task.id===form.elements.focus.value).prompt);};
 updatePrompt();form.elements.focus.addEventListener('change',updatePrompt);
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const response=form.elements.response.value.trim(),evidence=form.elements.evidence.value.trim();
  const result=checkInterpretation(reading,response,evidence);
  form.querySelector('[data-interpretation-feedback]').textContent=pick(result==='needs-review'?reviewNotice:result==='response-missing'?text('Write your interpretation first.','請先寫下你的解讀。'):text('Quotation not found. Copy a complete phrase or sentence from the English main story, then explain its connection.','未找到這段引文。請從英文主線原文複製完整片語或句子，再說明與解讀的關聯。'));
  if(result!=='response-missing')onPractice(makeReadingRecord(reading.id,'interpretation','reading-comprehension',`[${form.elements.focus.value}] ${response}`,evidence,result));
 });
}
