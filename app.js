import { createAutoAdvance } from './auto-advance.js';
import { validateAdventure } from './adventure-state.js';
import { initVoice, mountVoiceControls, refreshVoiceControls, speakWord, speakText, stopSpeaking, voiceLabel } from './voice.js';
import { locale, t, setLocale, applyTranslations, wordMeaning, wordPos, hasEnglishDefinition, stageTitle, stagePlace, stageStory } from './i18n.js';
import { initAuth, queueCloudSave, refreshAuthLanguage, canUseLocalSnapshot } from './auth.js';
import { getAdventure, setAdventure, setStoryLocale, mountAdventure, getStoryOpening, getStoryReturn, getReading, mountEncounter, mountReading } from './story.js';
import { stages, MILESTONES, TARGET_WORDS } from './data.js';
import { MAP_SCENES, MAP_POINTS } from './map-scenes.js';
import { renderGrammarSupport, requiresContextAudio, renderContextAudioNotice, difficultyLabel } from './curriculum-support.js';
import { getMicroquests, renderChapterBanner, renderMicroquestTrail, renderWordScene, renderQuestPostcard, renderMicroquestArrival } from './quest-visuals.js';
import { createState, loadState, startSession, reviewSession, answer, learnNext, questionType, masteryLevel, getStats } from './engine.js';
const feedbackAdvance = createAutoAdvance();
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const KEY = 'word-odyssey-v2' + (new URLSearchParams(location.search).has('test') ? '-test' : '');
const wordMap = new Map(stages.flatMap(s=>s.words.map(w=>[w.id,w])));
const icons = {
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/><path d="m10 10 4 4"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/>',
 book:'<path d="M12 5C8 2 5 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-6-2-10 1Zm0 0v15"/>',
 feather:'<path d="M20 3C9 0 3 9 6 17L3 21M6 17 17 6M6 17h6l3-4h-5l7-1c4-3 5-7 3-9Z"/>',
 arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
 flag:'<path d="M5 21V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
 leaf:'<path d="M20 3C6 2 1 8 6 16s17 1 14-13ZM4 21 17 7"/>',
 spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
 repeat:'<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5m-4 8a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 sound:'<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
 trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0Zm5 12v6m-4 0h8M7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4"/>'
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function applyIcons(){ $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon)); }
let storageOK = true;
let state, persistedSnapshot=null;
try{persistedSnapshot=localStorage.getItem(KEY);state=loadState(persistedSnapshot);}catch{state=createState();storageOK=false;}
let selected = Math.min(state.completed.length+1,100);
let mapPage = Math.floor((selected-1)/10);
let currentView='journey', session=null, pendingResult=null, pendingImport=null, toastTimer;
let applyingCloud=false, activeQuestionType='recognition';
const snapshot=()=>({progress:state,adventure:getAdventure(),locale});
const adventureChanged=()=>{if(!applyingCloud&&storageOK)queueCloudSave(snapshot());};
function toast(message){ $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4200); }
function localStatus(){ $('.local-note').innerHTML=`<span class="status-dot"></span>${t(storageOK?'local':'temporary')}`; }
function syncProgress(raw){
 persistedSnapshot=raw;state=loadState(raw);session=null;pendingResult=null;
 if($('#lesson-dialog').open)$('#lesson-dialog').close();
 selected=unlocked();mapPage=Math.floor((selected-1)/10);render();
 toast(t('synced'));
}
async function save({replace=false,cloud=true}={}){
 const candidate=JSON.stringify(state), expected=persistedSnapshot;
 const commit=()=>{
  if(!canUseLocalSnapshot({allowTransition:applyingCloud}))return false;
  try{const latest=localStorage.getItem(KEY);if(!replace&&latest!==expected){if(canUseLocalSnapshot({rawProgress:latest}))syncProgress(latest);return false;}
   localStorage.setItem(KEY,candidate);persistedSnapshot=candidate;storageOK=true;
  }catch{storageOK=false;toast(t('saveFailed'));}
  localStatus();
  if(storageOK&&cloud&&!applyingCloud)queueCloudSave(snapshot());
  return true;
 };
 return navigator.locks? navigator.locks.request(KEY,commit):commit();
}
window.addEventListener('storage',event=>{if(event.key!==KEY)return;const latest=localStorage.getItem(KEY);if(latest!==persistedSnapshot&&canUseLocalSnapshot({rawProgress:latest}))syncProgress(latest);});
function unlocked(){return Math.min(state.completed.length+1,100);}
function rank(){return t(state.completed.length>=100?'rank4':state.completed.length>=40?'rank3':state.completed.length>=20?'rank2':'rank1');}
function learnedIn(stage){return stage.words.filter(w=>state.words[w.id]).length;}
function updateLanguageButton(){const b=$('#language-toggle');b.textContent=locale==='en'?'中文':'English';b.disabled=$('#lesson-dialog').open;b.setAttribute('aria-label',locale==='en'?'Switch to Traditional Chinese':'Switch to English');b.title=t(b.disabled?'languageLocked':'language');}
function translateShell(){
 applyTranslations();setStoryLocale(locale);refreshVoiceControls();localStatus();updateLanguageButton();
 $('#page-label').textContent=t(currentView);
 [...$('#chapter-select').options].forEach((option,i)=>{const s=stages[i*10];option.textContent=`${t('chapterRange',{from:s.id,to:s.id+9})} · ${stagePlace(s)}`;});
 refreshAuthLanguage();
}
function render(){
 const stats=getStats(state);const current=stages[unlocked()-1];
 $('#bag-count').textContent=stats.learned.toLocaleString();$('#stat-words').textContent=stats.learned.toLocaleString();
 $('#stat-stages').innerHTML=`${state.completed.length}<span> / 100</span>`;
 $('#stat-xp').innerHTML=`${stats.xp.toLocaleString()}<span> XP</span>`;$('#stat-review').textContent=stats.due.toLocaleString();
 $('#stat-level').textContent=`Lv. ${stats.level} ${rank()}`;
 $('#rank-label').textContent=rank();$('#side-level').textContent=`LEVEL ${String(stats.level).padStart(2,'0')} · ${t('keepGoing')}`;
 $('#start-adventure').innerHTML=t(state.completed.length===100?'revisit':stats.learned?'resume':'start')+' '+icon('arrow');
 const smallQuest=getMicroquests(current,state),totalQuests=stages.reduce((total,stage)=>total+Math.ceil(stage.words.length/10),0);
 $('#hero-footnote').textContent=state.completed.length===100?t('allDone'):(locale==='en'?`Chapter ${current.id} · Small quest ${smallQuest.next?.number||smallQuest.quests.length} / ${smallQuest.quests.length} · Up to 10 new words`:`第 ${current.id} 大章節・第 ${smallQuest.next?.number||smallQuest.quests.length} / ${smallQuest.quests.length} 小關・每次最多 10 個新字`);
 $('.map-tag').textContent=locale==='en'?`100 chapters · ${totalQuests.toLocaleString()} small quests`:`100 大章節・${totalQuests.toLocaleString()} 小關`;
 $('[data-i18n="mapSubtitle"]').textContent=locale==='en'?`${totalQuests.toLocaleString()} small quests. 7,000 words.`:`${totalQuests.toLocaleString()} 個小關，累積 7,000 字`;
 mountAdventure($('#adventure-panel'),adventureChanged);
 renderMilestones(stats);renderMap();renderChapter();if(currentView==='words')renderWords();if(currentView==='journal')renderJournal();updateLanguageButton();
}
function renderMilestones(stats){
 $('#milestones').innerHTML=MILESTONES.map((band,i)=>`<button class="milestone ${stats.learned>=band.target?'achieved':''}" data-band="${band.from}"><span class="milestone-index">0${i+1}</span><div><small>${t('chapterRange',{from:band.from,to:band.to})} · ${esc(locale==='en'?band.english:band.title)}</small><strong>${band.target.toLocaleString()}<em> ${t('cumulative')}</em></strong><div class="milestone-track"><span style="width:${Math.min(100,stats.learned/band.target*100)}%"></span></div></div>${icon(stats.learned>=band.target?'check':'arrow')}</button>`).join('');
 $$('[data-band]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.band);mapPage=Math.floor((selected-1)/10);renderMap();renderChapter();$('#map-title').scrollIntoView({behavior:'smooth',block:'center'});});
}
const mapImages=new Map();
let displayedMap=-1,mapImageRequest=0,mapImageStatus='loading',mapSelection=null;
function preloadMapImage(page){
 const scene=MAP_SCENES[page];
 if(!scene)return Promise.resolve(null);
 if(!mapImages.has(page)){
  const pending=new Promise((resolve,reject)=>{
   const image=new Image();
   image.onload=()=>resolve(image);
   image.onerror=()=>reject(new Error(`Map scene unavailable: ${scene.id}`));
   image.src=scene.src;
  });
  mapImages.set(page,pending);
  pending.catch(()=>{if(mapImages.get(page)===pending)mapImages.delete(page);});
 }
 return mapImages.get(page);
}
function describeMapImage(){
 const image=$('#map-scene'),status=$('#map-scene-status');
 const loaded=Number(image.dataset.page);
 image.alt=image.dataset.page!==undefined&&MAP_SCENES[loaded]
  ? `${locale==='en'?'Watercolour map: ':'水彩旅程地圖：'}${MAP_SCENES[loaded][locale==='en'?'en':'zh']}`
  : locale==='en'?'A preview of the British countryside journey':'英倫鄉野旅程預覽';
 status.hidden=mapImageStatus==='ready';
 status.textContent=mapImageStatus==='error'
  ? (locale==='en'?'Landscape unavailable · journey preview':'地景暫時無法載入 · 旅程預覽')
  : (locale==='en'?'Unfolding the landscape…':'正在展開地景⋯');
 $('.map-canvas').setAttribute('aria-busy',String(mapImageStatus==='loading'));
}
function updateMapImage(page){
 if(displayedMap===page&&mapImageStatus!=='error'){describeMapImage();return;}
 displayedMap=page;mapImageStatus='loading';describeMapImage();
 const request=++mapImageRequest;
 preloadMapImage(page).then(image=>{
  if(request!==mapImageRequest)return;
  $('#map-scene').src=image.src;$('#map-scene').dataset.page=String(page);
  mapImageStatus='ready';describeMapImage();
 }).catch(()=>{
  if(request!==mapImageRequest)return;
  $('#map-scene').src='assets/hero-journey.webp';delete $('#map-scene').dataset.page;
  mapImageStatus='error';describeMapImage();
 });
 [page-1,page+1].forEach(neighbour=>preloadMapImage(neighbour).catch(()=>{}));
}
function revealMapStage(id,{smooth=false}={}){
 const viewport=$('#map-viewport'),node=$(`[data-stage="${id}"]`);
 if(!node||viewport.scrollWidth<=viewport.clientWidth)return;
 const left=node.offsetLeft-viewport.clientWidth/2;
 viewport.scrollTo({left:Math.max(0,Math.min(left,viewport.scrollWidth-viewport.clientWidth)),behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});
}
function renderMap(){
 const pageStages=stages.slice(mapPage*10,mapPage*10+10);
 const focusStage=document.activeElement?.dataset.stage;
 $('#map-nodes').innerHTML=pageStages.map((s,i)=>{const complete=state.completed.includes(s.id),current=s.id===unlocked()&&!complete;return `<button class="map-node ${complete?'complete':current?'current':'locked'} ${selected===s.id?'selected':''}" style="left:${MAP_POINTS[i][0]}%;top:${MAP_POINTS[i][1]}%" data-stage="${s.id}" aria-label="${esc(t('stageLabel',{id:s.id,title:stageTitle(s),status:t(complete?'completed':current?'available':'locked')}))}" aria-pressed="${selected===s.id}" ${current?'aria-current="step"':''}>${current?`<span class="node-flag">${icon('flag')} ${locale==='en'?'YOU ARE HERE':'你的足跡'}</span>`:''}<span class="node-circle">${complete?icon('check'):s.id}${!complete&&!current?`<span class="node-lock">${icon('lock')}</span>`:''}</span><span class="node-title">${String(s.id).padStart(2,'0')} · ${esc(stageTitle(s))}</span></button>`}).join('');
 $$('[data-stage]').forEach(b=>{
  b.onclick=()=>{selected=Number(b.dataset.stage);renderMap();renderChapter();};
  b.onfocus=()=>revealMapStage(Number(b.dataset.stage),{smooth:true});
 });
 if(focusStage)$(`[data-stage="${focusStage}"]`)?.focus({preventScroll:true});
 $('#chapter-select').value=String(mapPage);$('#previous-map').disabled=mapPage===0;$('#next-map').disabled=mapPage===9;
 $('#region-name').textContent=stagePlace(pageStages[0]);
 $('#region-number').textContent=`${locale==='en'?'REGION':'旅程區域'} ${String(mapPage+1).padStart(2,'0')} / 10`;
 $('#map-range').textContent=t('chapterRange',{from:pageStages[0].id,to:pageStages.at(-1).id});
 $('#map-pan-hint').textContent=locale==='en'?'↔ Swipe to explore the whole landscape':'↔ 左右滑動，探索整片地景';
 $('#map-viewport').setAttribute('aria-label',locale==='en'?`${stagePlace(pageStages[0])} journey map, scroll horizontally to explore`:`${stagePlace(pageStages[0])}旅程地圖，可左右滑動探索`);
 updateMapImage(mapPage);
 if(mapSelection!==selected){const smooth=mapSelection!==null;mapSelection=selected;requestAnimationFrame(()=>revealMapStage(selected,{smooth}));}
}
function renderChapter(){
 stopSpeaking(); const s=stages[selected-1],complete=state.completed.includes(s.id),locked=s.id>unlocked(),available=s.words.length===s.quota,remaining=s.quota-learnedIn(s);
 const opening=getStoryOpening(s.id),smallQuest=getMicroquests(s,state),en=locale==='en';
 const startLabel=locked?t('waitChapter'):!available?t('dataPending'):complete?t('reviewLearned'):(en?`Start small quest ${smallQuest.next?.number||1} · ${Math.min(10,remaining)} words`:`出發・第 ${smallQuest.next?.number||1} 小關・${Math.min(10,remaining)} 字`);
 $('#chapter-panel').innerHTML=`${renderChapterBanner(s,locale)}<div class="chapter-overline"><span>${en?'CHAPTER':'大章節'} ${String(s.id).padStart(3,'0')} / 100</span><span class="chapter-seal">✦</span></div><h3>${esc(stageTitle(s))}</h3>${en?'':`<p class="chapter-english">${esc(getReading(s.id).title.en)}</p>`}<p class="chapter-story">${esc(opening?.text||stageStory(s))}</p><div class="chapter-meta"><span>${icon('book')} ${learnedIn(s)} / ${t('wordCount',{n:s.quota})}</span><span>${icon('flag')} ${esc(stagePlace(s))}</span><span>${esc(difficultyLabel(s,locale))}</span><span>${icon('spark')} ${t('chapterTotal',{n:s.cumulative.toLocaleString()})}</span></div>${renderMicroquestTrail(s,state,locale,locked)}<button class="primary" id="chapter-start" ${locked||!available?'disabled':''}>${startLabel} ${icon(locked?'lock':'arrow')}</button><p class="chapter-hint">${t(locked?'lockedHint':complete?'completeHint':'questHint')}</p>`;
 $('#chapter-start').onclick=()=>complete?beginReview():beginStage(s.id);
 const current=$('.microquest-node.is-current');if(current)current.parentElement.scrollLeft=Math.max(0,current.offsetLeft-current.parentElement.offsetLeft-12);
}
function setView(view){stopSpeaking();currentView=view;$$('.view').forEach(v=>v.hidden=v.id!==view+'-view');$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});$('#page-label').textContent=t(view);if(view==='words')renderWords();if(view==='journal')renderJournal();history.replaceState(null,'','#'+view);window.scrollTo({top:0,behavior:'instant'});}
function speak(id){const w=wordMap.get(id);if(w)requiresContextAudio(w)?speakText(w.example):speakWord(w.word);}
function wireSounds(){ $$('[data-speak]').forEach(b=>b.onclick=()=>speak(b.dataset.speak));$$('[data-speak-example]').forEach(b=>b.onclick=()=>{const w=wordMap.get(b.dataset.speakExample);if(w?.example)speakText(w.example);}); }
function beginStage(id){stopSpeaking();try{session=startSession(state,id);pendingResult=null;$('#lesson-dialog').showModal();updateLanguageButton();renderInvitation();}catch(e){console.error(e);toast(t(e instanceof RangeError?'startError':'dataError'));}}
function beginReview(){stopSpeaking();if(!Object.keys(state.words).length){toast(t('noReview'));return;}session=reviewSession(state);pendingResult=null;$('#lesson-dialog').showModal();updateLanguageButton();renderLesson();}
function reviewRoundNote(){return `<p class="review-round-note">${t('reviewRound',{due:getStats(state).due,n:new Set(session.queue.slice(session.index)).size,total:session.phaseTotal})}</p>`;}
function renderInvitation(){
 const s=stages[session.stageId-1],opening=getStoryOpening(s.id);
 $('#lesson-progress').innerHTML=phaseBar('invitation');
 $('#lesson-body').innerHTML=`<div class="lesson-inner invitation"><p class="lesson-kicker">THE CALL · ${t('callLocation',{id:s.id,place:stagePlace(s)})}</p><h2 id="lesson-title">${esc(opening?.title||stageTitle(s))}</h2><p class="lesson-sub">${esc(opening?.text||stageStory(s,'invitation'))}</p>${renderMicroquestArrival(s,state,locale)}<details class="chapter-reading-fold"><summary>${locale==='en'?'Open the chapter story and reading missions':'展開本章故事與閱讀任務'}</summary><div id="reading-panel"></div></details>${renderGrammarSupport(s.id,locale)}<div class="invitation-plan"><div>${icon('repeat')}<strong>${t('mentor')}</strong><span>${t('mentorPlan',{due:getStats(state).due,n:session.phase==='review'?session.phaseTotal:0})}</span></div><div>${icon('book')}<strong>${t('threshold')}</strong><span>${t('newPlan',{n:session.newWords.length})}</span></div><div>${icon('flag')}<strong>${t('trial')}</strong><span>${t('trialHint')}</span></div><div>${icon('spark')}<strong>${t('reward')}</strong><span>${t('rewardHint')}</span></div></div><div class="lesson-actions"><button class="primary" id="accept-call">${t('ready')} ${icon('arrow')}</button></div></div>`;
 mountReading($('#reading-panel'),{stageId:s.id});$('#accept-call').onclick=renderLesson;
}
function phaseBar(phase){const active={invitation:0,review:1,learn:2,challenge:3,complete:4}[phase];return ['phaseCall','mentor','threshold','trial','phaseReward'].map((key,i)=>`<div class="phase ${active===i?'current':active>i?'done':''}">${i+1} ${t(key)}</div>`).join('');}
function renderLesson(){
 feedbackAdvance.cancel();
 stopSpeaking(); pendingResult=null;$('#lesson-progress').innerHTML=phaseBar(session.phase);
 if(session.phase==='complete'){renderCompletion();return;}
 const w=wordMap.get(session.queue[session.index]);if(!w){toast(t('missingWord'));$('#lesson-dialog').close();return;}
 const n=session.index+1,total=session.queue.length;
 const sourceNote=w.example?`<p class="example" lang="en">${esc(w.example)}</p><button class="voice-read" type="button" data-speak-example="${esc(w.id)}">${voiceLabel('example')}</button>${locale==='en'?'':`<p class="example-zh">${esc(w.translation||'')}</p>`}`:`<p class="example-zh">${t('imagine')}</p>`;
 if(session.phase==='learn'){
 $('#lesson-body').innerHTML=`<div class="lesson-inner"><p class="lesson-kicker">CROSS THE THRESHOLD · ${t('newWord')} ${n} / ${total}</p><h2 id="lesson-title">${t('newPower')}</h2><p class="lesson-sub">${t('studyHint')}</p><p class="learning-save-note">${t('newWordsSave')}</p><div class="flashcard illustrated-flashcard">${renderWordScene(w,session.stageId,locale)}<div class="flashcard-word-copy"><button class="icon-button" data-speak="${esc(w.id)}" aria-label="${esc(t('pronounce',{word:w.word}))}">${icon('sound')}</button><h3 lang="en">${esc(w.word)}</h3><p class="part-of-speech">${esc(wordPos(w))}</p><p class="meaning">${esc(wordMeaning(w))}</p>${renderContextAudioNotice(w,locale)}${sourceNote}</div></div><div class="lesson-bottom"><small>${t('practiceSoon')}</small><button class="primary" id="learn-next">${t(n===total?'readyTrial':'carryWord')} ${icon('arrow')}</button></div></div>`;
 $('#learn-next').onclick=()=>{learnNext(state,session);renderLesson();};wireSounds();return;
 }
 const copyPractice=locale==='en'&&!hasEnglishDefinition(w);
 activeQuestionType=copyPractice?'copy':questionType(state,session);
 const recall=activeQuestionType!=='recognition';
 $('#lesson-body').innerHTML=`<div class="lesson-inner"><p class="lesson-kicker">${session.phase==='review'?'MENTOR’S GUIDANCE':'THE TRIAL'} · ${t(session.phase==='review'?'oldWords':'wordTrial')} ${n} / ${total}</p><h2 id="lesson-title">${t(copyPractice?'copyPractice':recall?'recall':'recognise')}</h2><p class="lesson-sub">${t(session.phase==='review'?'reviewHint':'challengeHint')}</p>${session.phase==='review'?reviewRoundNote():`<p class="learning-save-note">${t('newWordsSave')}</p>`}<div class="quiz-prompt">${copyPractice?`<span lang="en">${esc(w.word)}</span><br><button class="secondary" data-speak="${esc(w.id)}">${icon('sound')} ${t('listen')}</button><p class="lesson-sub">${t('definitionMissing')}</p>`:esc(recall?wordMeaning(w):w.word)}</div><div id="answer-area"></div><div id="feedback" aria-live="polite"></div><div id="quiz-actions" class="lesson-actions"></div></div>`;
 if(recall){$('#answer-area').innerHTML=`<form class="answer-form"><label for="spelling">${t('spellLabel')}</label><input id="spelling" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Your word…" lang="en" required><button class="primary" type="submit">${t('checkAnswer')} ${icon('check')}</button></form>`;$('.answer-form').onsubmit=e=>{e.preventDefault();const value=$('#spelling').value.trim();if(!value)return;showFeedback([w.word,...(w.aliases||[])].some(form=>normalize(value)===normalize(form)),w);};wireSounds();
 }else{
 const familiarIds=new Set([...Object.keys(state.words),...session.queue,...(session.newWords||[])]);
 const pool=[...wordMap.values()].filter(x=>familiarIds.has(x.id)&&x.id!==w.id&&!meaningsOverlap(wordMeaning(x),wordMeaning(w))&&(locale!=='en'||hasEnglishDefinition(x)));
 const distractors=[];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 for(const item of pool){if(!distractors.some(x=>meaningsOverlap(wordMeaning(x),wordMeaning(item))))distractors.push(item);if(distractors.length===3)break;}
 const choices=[w,...distractors].sort(()=>Math.random()-.5);
 $('#answer-area').innerHTML=`<div class="options">${choices.map((x,i)=>`<button class="option" data-answer="${esc(x.id)}"><span class="option-label">${'ABCD'[i]}</span><span>${esc(wordMeaning(x))}</span></button>`).join('')}</div>`;
 $$('[data-answer]').forEach(b=>b.onclick=()=>showFeedback(b.dataset.answer===w.id,w,b));
 }
}
const meaningParts=value=>new Set(value.normalize('NFKC').toLowerCase().split(/[;；、／/]|\s+or\s+/u).map(part=>part.replace(/\([^)]*\)|（[^）]*）/gu,'').replace(/[\p{P}\p{S}\s]/gu,'')).filter(Boolean));
function meaningsOverlap(left,right){const a=meaningParts(left),b=meaningParts(right);return [...a].some(part=>b.has(part));}
const normalize=value=>value.trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
function showFeedback(correct,w,button){
 if(pendingResult!==null)return;pendingResult=correct;
 $$('[data-answer]').forEach(b=>{b.disabled=true;if(b.dataset.answer===w.id)b.classList.add('correct');});if(button&&!correct)button.classList.add('wrong');
 if($('.answer-form')){$('.answer-form input').disabled=true;$('.answer-form button').disabled=true;}
 $('#feedback').innerHTML=`<div class="feedback ${correct?'':'wrong'}"><strong>${t(correct?'correct':'incorrect')}</strong><p><span lang="en">${esc(w.word)}</span> — ${esc(wordMeaning(w))}${correct?'':` · ${t('retry')}`}</p></div>`;
 $('#quiz-actions').innerHTML=`<button class="secondary" data-speak="${esc(w.id)}">${icon('sound')} ${t('listen')}</button><button class="primary" id="next-question">${correct?(locale==='en'?'Next question…':'自動前往下一題…'):t('nextHint')} ${icon('arrow')}</button>`;
 const questionSession=session;
 const advance=feedbackAdvance.prepare(async()=>{
  if(!$('#lesson-dialog').open||session!==questionSession)return;
  $('#next-question').disabled=true;
  answer(state,session,correct,Date.now(),{type:activeQuestionType});
  if(!await save()||session!==questionSession||!$('#lesson-dialog').open)return;
  render();renderLesson();
 },correct);
 $('#next-question').onclick=advance;wireSounds();$('#next-question').focus({preventScroll:true});
}
function renderCompletion(){
 const isReview=session.mode==='review',s=stages[session.stageId-1],finished=session.stageComplete,due=getStats(state).due,gained=(session.newWords||[]).map(id=>wordMap.get(id)).filter(Boolean);
 $('#lesson-body').innerHTML=`<div class="lesson-inner completion">${isReview?`<div class="complete-illustration">${icon('spark')}</div>`:renderQuestPostcard(s,state,locale,finished)}<p class="lesson-kicker">RETURN WITH YOUR REWARD</p><h2 id="lesson-title">${t(isReview?'reviewDone':finished?'stageDone':'questDone')}</h2><p class="lesson-sub">${isReview?t('reviewReturn'):esc(finished?getStoryReturn(s.id)[locale]:t('questReturn'))}</p>${isReview?`<p class="review-round-note">${t('reviewRemaining',{n:due})}</p>${session.reviewSummary?reviewSummary(session.reviewSummary):''}`:''}${!isReview?`<div class="earned-xp">+${session.earnedXp||0} XP</div><div class="reward-words">${gained.map(w=>`<span lang="en">${esc(w.word)}</span>`).join('')}</div><p class="lesson-sub">${t('progressLine',{id:s.id,n:learnedIn(s),quota:s.quota,total:Object.keys(state.words).length.toLocaleString()})}</p><div id="story-encounter"></div>`:''}<div class="lesson-actions"><button class="secondary" id="return-map">${t('returnMap')}</button>${isReview&&due>0?`<button class="primary" id="continue-review">${t('continueReview')} ${icon('arrow')}</button>`:''}${!isReview&&state.completed.length<100?`<button class="primary" id="continue-quest">${t(finished?'nextChapter':'continueChapter')} ${icon('arrow')}</button>`:''}</div><p class="saved-note">${t(storageOK?'saved':'notSaved')}</p></div>`;
 if(!isReview)mountEncounter($('#story-encounter'),{stageId:s.id,quest:Math.ceil(learnedIn(s)/10),isStageComplete:finished,onChange:adventureChanged});
 selected=unlocked();mapPage=Math.floor((selected-1)/10);render();
 $('#return-map').onclick=()=>{$('#lesson-dialog').close();setView('journey');};
 if($('#continue-review'))$('#continue-review').onclick=()=>{$('#lesson-dialog').close();beginReview();};
 if($('#continue-quest'))$('#continue-quest').onclick=()=>{$('#lesson-dialog').close();beginStage(unlocked());};
}
function renderWords(){
 stopSpeaking(); const query=$('#word-search').value.trim().toLowerCase(),filter=$('#word-filter').value,now=Date.now(),known=[...wordMap.values()].filter(w=>state.words[w.id]);
 const words=known.filter(w=>{const meta=state.words[w.id];return (!query||`${w.word} ${wordMeaning(w)}`.toLowerCase().includes(query))&&(filter==='all'||filter==='due'&&meta.nextDue<=now||filter==='mastered'&&masteryLevel(meta)>=3||filter==='growing'&&masteryLevel(meta)<3);});
 $('#word-summary').textContent=t('wordSummary',{n:known.length.toLocaleString(),target:TARGET_WORDS.toLocaleString(),shown:Math.min(words.length,100).toLocaleString()})+(words.length>100?` · ${t('first100')}`:'');$('#review-all').disabled=known.length===0;
 $('#word-grid').innerHTML=words.length?words.slice(0,100).map(w=>{const meta=state.words[w.id];return `<article class="word-card"><div class="word-card-head"><h3 lang="en">${esc(w.word)}</h3><button class="icon-button" data-speak="${esc(w.id)}" aria-label="${esc(t('pronounce',{word:w.word}))}">${icon('sound')}</button></div><p class="word-meaning">${esc(wordMeaning(w))}</p>${renderContextAudioNotice(w,locale)}${w.example?`<blockquote lang="en">${esc(w.example)}</blockquote><button class="voice-read" type="button" data-speak-example="${esc(w.id)}">${voiceLabel('example')}</button>${locale==='en'?'':`<p class="translation">${esc(w.translation||'')}</p>`}`:''}<div class="word-card-bottom"><span>${t(meta.nextDue<=now?'dueNow':masteryLevel(meta)>=3?'mastered':'growing')}</span><span class="mastery-dots" aria-label="${t('mastery',{n:masteryLevel(meta)})}">${[1,2,3].map(n=>`<i class="${masteryLevel(meta)>=n?'filled':''}"></i>`).join('')}</span></div>${meta.reviewCount>=3&&!meta.recallCount?`<p class="mastery-note">${t('recallNeeded')}</p>`:''}</article>`}).join(''):`<div class="empty-state">${icon('book')}<h2>${t(known.length?'notFound':'emptyBag')}</h2><p>${t(known.length?'searchAgain':'firstQuest')}</p>${known.length?'':`<button class="primary" id="empty-start">${t('start')} →</button>`}</div>`;
 if($('#empty-start'))$('#empty-start').onclick=()=>beginStage(unlocked());wireSounds();
}
function reviewSummary(item){return `<p class="review-summary">${t('reviewSummary',{count:item.count,attempts:item.firstAttempts,correct:item.firstCorrect,retries:item.retries})} · ${t(item.completed?'reviewFinished':'reviewInterrupted')}</p>`;}
function renderJournal(){
 const stats=getStats(state),visited=stages.filter(s=>learnedIn(s)>0);
 const reviews=state.reviewHistory.slice().reverse().map(item=>`<article class="review-entry"><time datetime="${new Date(item.date).toISOString()}">${new Date(item.date).toLocaleString(locale==='en'?'en-GB':'zh-TW')}</time>${reviewSummary(item)}</article>`).join('');
 $('#journal-content').innerHTML=`<div class="journal-summary"><div><strong>${stats.learned.toLocaleString()}</strong><small>${t('learned')} / 7,000</small></div><div><strong>${stats.mastered.toLocaleString()}</strong><small>${t('spacedWords')}</small></div><div><strong>${state.completed.length} / 100</strong><small>${t('completedChapters')}</small></div></div>`+(visited.length?visited.slice().reverse().map(s=>`<article class="journal-entry"><span class="entry-number">${String(s.id).padStart(2,'0')}</span><div><h3>${esc(stagePlace(s))} · ${esc(stageTitle(s))}</h3><p>${t(state.completed.includes(s.id)?'completed':'travelling')} · ${learnedIn(s)} / ${t('wordCount',{n:s.quota})}</p></div><span class="entry-xp">${learnedIn(s)*10} XP</span></article>`).join(''):`<div class="empty-state">${icon('feather')}<h2>${t('firstPage')}</h2><p>${t('firstPageHint')}</p></div>`)+`<section class="review-history"><h2>${t('reviewHistory')}</h2><p class="muted">${t('reviewHistoryHint')}</p>${reviews||`<p>${t('noReviewHistory')}</p>`}</section>`;
}
function exportData(){const blob=new Blob([JSON.stringify({app:'word-odyssey',exportedAt:new Date().toISOString(),state,adventure:getAdventure(),locale},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`word-odyssey-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t('exported'));}
async function applySnapshot(incoming){
 const restored=loadState(incoming?.progress,{strict:true}), restoredAdventure=validateAdventure(incoming?.adventure);
 applyingCloud=true;
 try{state=restored;session=null;pendingResult=null;if($('#lesson-dialog').open)$('#lesson-dialog').close();setAdventure(restoredAdventure);if(incoming.locale==='en'||incoming.locale==='zh')setLocale(incoming.locale);await save({replace:true,cloud:false});selected=unlocked();mapPage=Math.floor((selected-1)/10);translateShell();render();toast(t('cloudApplied'));}finally{applyingCloud=false;}
}
initVoice({getLanguage:()=>locale});
const pageVoiceControls=document.createElement('div');pageVoiceControls.id='page-voice-controls';$('.topbar').after(pageVoiceControls);mountVoiceControls(pageVoiceControls);
const lessonVoiceControls=document.createElement('div');lessonVoiceControls.id='lesson-voice-controls';$('.lesson-top').after(lessonVoiceControls);mountVoiceControls(lessonVoiceControls);
applyIcons();
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('.brand').onclick=e=>{e.preventDefault();setView('journey');};
$('#start-adventure').onclick=()=>state.completed.length===100?beginReview():beginStage(unlocked());$('#review-all').onclick=beginReview;
$('#word-search').oninput=renderWords;$('#word-filter').onchange=renderWords;
$('#language-toggle').onclick=()=>{if($('#lesson-dialog').open)return;setLocale(locale==='en'?'zh':'en');$('#toast').textContent='';$('#toast').classList.remove('visible');translateShell();render();adventureChanged();};
$('#close-lesson').onclick=()=>{$('#lesson-dialog').close();toast(t('left'));};
$('#lesson-dialog').addEventListener('close',()=>{feedbackAdvance.cancel();stopSpeaking();render();});
$('#previous-map').onclick=()=>{mapPage=Math.max(0,mapPage-1);selected=mapPage*10+1;renderMap();renderChapter();};
$('#next-map').onclick=()=>{mapPage=Math.min(9,mapPage+1);selected=mapPage*10+1;renderMap();renderChapter();};
$('#chapter-select').onchange=e=>{mapPage=Number(e.target.value);selected=mapPage*10+1;renderMap();renderChapter();};
$('#export-data').onclick=exportData;
$('#import-data').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error();const data=JSON.parse(await file.text());if(data.app!=='word-odyssey'||data.state?.version!==2||!data.state.words)throw Error();const restored=loadState(data.state,{strict:true});if(Object.keys(restored.words).length!==Object.keys(data.state.words).length)throw Error();pendingImport={progress:restored,adventure:data.adventure,locale:data.locale};$('#confirm-dialog').showModal();}catch{toast(t('invalidBackup'));}e.target.value='';};
$('#cancel-import').onclick=()=>{pendingImport=null;$('#confirm-dialog').close();};
$('#confirm-import').onclick=async()=>{if(!pendingImport)return;const imported=pendingImport;pendingImport=null;state=imported.progress;if(imported.adventure)setAdventure(imported.adventure);if(imported.locale==='en'||imported.locale==='zh')setLocale(imported.locale);await save({replace:true});selected=unlocked();mapPage=Math.floor((selected-1)/10);$('#confirm-dialog').close();translateShell();render();toast(t('imported'));};
initAuth({getSnapshot:snapshot,applySnapshot,getLocale:()=>locale,onAuthChange:()=>{}});
translateShell();render();if(['words','journal'].includes(location.hash.slice(1)))setView(location.hash.slice(1));
if(!storageOK)toast(t('storageUnavailable'));
