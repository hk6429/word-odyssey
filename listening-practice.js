import { stages } from './data.js';
import { bundledWords } from './audio-manifest.js';
import { requiresContextAudio } from './curriculum-support.js';
import { createVoiceController, stopSpeaking, voiceLabel } from './voice.js';
import { locale } from './i18n.js';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say = (zh, en) => locale === 'en' ? en : zh;
const shuffle = (items, random) => {
 const copy = [...items];
 for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
 return copy;
};
// Only recorded, context-independent words: no device voice installation is needed.
export function listeningQuestions(stageId, size = 5, random = Math.random) {
 const eligible = stages.flatMap(stage => stage.words).filter(w => bundledWords[w.word.trim().toLowerCase()] && !requiresContextAudio(w) && w.meaning);
 const allowed = new Set(eligible.map(w => w.id));
 const source = stages.find(s => s.id === stageId)?.words.filter(w => allowed.has(w.id)) || [];
 return shuffle(source, random).slice(0, [3,5,10].includes(size) ? size : 5).map(word => {
  const meanings = new Set([word.meaning]);
  const alternatives = shuffle(eligible, random).filter(w => { if (meanings.has(w.meaning)) return false; meanings.add(w.meaning); return true; }).slice(0, 3);
  return { word, options: shuffle([word, ...alternatives], random).map(w => ({id:w.id, meaning:w.meaning})) };
 });
}
export function openListening(stageId, size = 5) {
 stopSpeaking();
 const questions = listeningQuestions(stageId, size);
 const dialog = document.createElement('dialog'); dialog.className = 'practice-dialog listening-dialog';
 dialog.setAttribute('aria-labelledby', 'listening-title'); document.body.append(dialog);
 let index = 0, heard = false, answered = false, playing = false, closed = false, attempt = 0;
 const results = [];
 const player = createVoiceController({onChange: state => {
  const status = dialog.querySelector('[data-listening-status]');
  if (status) status.textContent = state.status ? voiceLabel(state.status) : '';
 }});
 function render() {
  player.stop({quiet:true}); attempt++; heard = false; answered = false; playing = false;
  const question = questions[index];
  dialog.innerHTML = `<h2 id="listening-title">${say('英聽練習・聽音選義','Listening · choose the meaning')}</h2><p>${say(`第 ${stageId} 章`,`Chapter ${stageId}`)} · ${say('獨立練習，不增加 XP 或熟練；結果僅供本次查看。','Independent practice; no XP or mastery. Results are shown for this session only.')}</p>`;
  if (!question) {
   dialog.innerHTML += questions.length ? `<h3>${say('本次練習完成','Practice complete')}</h3><p>${say('答對','Correct')}: ${results.filter(r=>r.correct).length} / ${questions.length}</p>${results.map(r=>`<p>${r.correct?'✓':'○'} <span lang="en">${esc(r.word.word)}</span> — ${esc(r.word.meaning)}</p>`).join('')}` : `<p>${say('本章暫無適合的內建單字音檔，請選擇其他章節。','No suitable recorded words in this chapter. Choose another chapter.')}</p>`;
  } else {
   dialog.innerHTML += `<p>${index+1} / ${questions.length}</p><p>${say('先播放英文單字，再選出中文意思。可重播或慢速播放。','Play the English word, then choose its Chinese meaning. Replay or use slow playback as needed.')}</p><div class="practice-actions"><button type="button" data-listening-play="normal">${say('播放／重播','Play / replay')}</button><button type="button" data-listening-play="slow">${say('慢速播放 0.8','Slow playback 0.8')}</button></div><p role="status" data-listening-status></p><div class="listening-options" role="group" aria-label="${say('選出聽到的字義','Choose the meaning you heard')}">${question.options.map((o,i)=>`<button type="button" data-listening-answer="${i}" disabled>${esc(o.meaning)}</button>`).join('')}</div><p role="status" data-listening-feedback></p><button type="button" data-listening-next hidden>${say('下一題','Next')}</button>`;
   const choices = [...dialog.querySelectorAll('[data-listening-answer]')];
   dialog.querySelectorAll('[data-listening-play]').forEach(button => button.onclick = async () => {
    const token = ++attempt; playing = true; choices.forEach(b=>b.disabled=true);
    player.setPreferences({preference:'natural', speed:button.dataset.listeningPlay});
    const success = await player.sayWord(question.word.word);
    if (closed || token !== attempt) return;
    playing = false; heard ||= success;
    choices.forEach(b=>b.disabled=answered || !heard);
   });
   choices.forEach(button => button.onclick = () => {
    if (!heard || answered || playing) return;
    answered = true; attempt++; player.stop({quiet:true});
    const chosen = question.options[Number(button.dataset.listeningAnswer)];
    const correct = chosen.id === question.word.id; results.push({word:question.word,correct});
    choices.forEach(b=>b.disabled=true);
    dialog.querySelector('[data-listening-feedback]').textContent = `${correct?say('答對！','Correct!'):say('再記一次：','Review:')} ${question.word.word} — ${question.word.meaning}`;
    dialog.querySelector('[data-listening-next]').hidden = false;
   });
   dialog.querySelector('[data-listening-next]').onclick = () => { index++; render(); };
  }
  const exit = document.createElement('button'); exit.type = 'button'; exit.textContent = say('離開英聽','Close listening'); exit.onclick = () => dialog.close(); dialog.append(exit);
 }
 dialog.addEventListener('close', () => { closed = true; attempt++; player.destroy(); dialog.remove(); });
 render(); dialog.showModal();
}
