import { microquestScenes } from './microquest-scenes.js';
import { getReading } from './story.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const number = (value, locale) => new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'zh-TW').format(value);
const lantern = '<svg viewBox="0 0 24 30" aria-hidden="true"><path d="M8 8V5a4 4 0 0 1 8 0v3M5 9h14l-2 16H7ZM8 13h8M12 13v8M6 27h12"/><path class="lantern-glow" d="m12 15-2 4 2 3 2-3Z"/></svg>';

export function getMicroquests(stage, state) {
  const known = state.words ?? {};
  const quests = [];
  for (let offset = 0; offset < stage.words.length; offset += 10) {
    const words = stage.words.slice(offset, offset + 10);
    quests.push({ number: quests.length + 1, words, complete: words.every(word => Object.hasOwn(known, word.id)) });
  }
  return { quests, completed: quests.filter(quest => quest.complete).length, next: quests.find(quest => !quest.complete) ?? null };
}

export function renderChapterBanner(stage, locale) {
  const reading = getReading(stage.id);
  const title = reading.title[locale === 'en' ? 'en' : 'zh'];
  return `<div class="quest-chapter-banner"><div class="quest-chapter-picture story-scene ${reading.sceneClass}" role="img" aria-label="${esc(locale === 'en' ? `Chapter illustration: ${title}` : `章節插畫：${title}`)}"></div><span class="quest-postmark" aria-hidden="true">WORD<br>ODYSSEY<span>✦</span></span><span class="quest-banner-caption">${locale === 'en' ? 'A CHAPTER IN YOUR FIELD JOURNAL' : '旅途手札・一段新的風景'}</span></div>`;
}

export function renderMicroquestTrail(stage, state, locale, locked = false) {
  const { quests, completed, next } = getMicroquests(stage, state);
  const en = locale === 'en';
  const title = en ? 'One small quest at a time' : '把大章節，走成小步伐';
  const region = Math.floor((stage.id - 1) / 10) + 1;
  const imagePath = `assets/miniquests-${String(region).padStart(2, '0')}.webp`;
  const count = en ? `${number(completed, locale)} / ${number(quests.length, locale)} small quests complete` : `已完成 ${number(completed, locale)} / ${number(quests.length, locale)} 小關`;
  const goal = locked
    ? (en ? 'Your next chapter opens after the current chapter.' : '完成目前的大章節後，這條小徑就會開啟。')
    : next ? (en ? `Next: small quest ${number(next.number, locale)} · ${number(next.words.length, locale)} new words` : `下一小步：第 ${number(next.number, locale)} 小關・${number(next.words.length, locale)} 個新字`)
    : (en ? 'Every small quest in this chapter is complete.' : '這個大章節的每一小關，都留下你的足跡。');
  return `<section class="microquest-journal" aria-label="${esc(en ? 'Small quest route' : '小關卡探索路線')}"><div class="microquest-heading"><span>${title}</span><strong>${count}</strong></div><ol class="microquest-trail" tabindex="0" aria-label="${en ? 'Illustrated small quests. Scroll sideways to explore.' : '小關卡插畫路線，可左右捲動探索。'}">${quests.map((quest, questIndex) => {
    const current = !locked && quest === next;
    const status = quest.complete ? 'complete' : current ? 'current' : 'locked';
    const label = en ? (quest.complete ? 'Complete' : current ? 'Next step' : 'To come') : (quest.complete ? '已完成' : current ? '下一小步' : '待探索');
    const accessible = en ? `Small quest ${quest.number}, ${quest.words.length} words, ${label}` : `第 ${quest.number} 小關，${quest.words.length} 個單字，${label}`;
    const slot = (stage.id - 1 + questIndex) % 9;
    const sceneName=microquestScenes[region-1][slot][en?'en':'zh'];
    const imageLabel = en ? `Regional journey illustration for small quest ${quest.number}` : `第 ${quest.number} 小關的區域旅途插畫`;
    return `<li class="microquest-node is-${status}" aria-label="${esc(accessible)}"${current ? ' aria-current="step"' : ''}><div class="microquest-picture" role="img" aria-label="${esc(imageLabel)}" data-quest-image="${imagePath}" data-quest-slot="${slot}" style="background-image:url('${imagePath}');background-position:${slot % 3 * 50}% ${Math.floor(slot / 3) * 50}%"></div><span class="microquest-marker" aria-hidden="true">${current ? `<span class="microquest-lantern">${lantern}</span>` : ''}${quest.complete ? '<span class="microquest-seal">✦</span>' : ''}<b>${number(quest.number, locale)}</b></span><strong class="microquest-scene-title">${esc(sceneName)}</strong><span class="microquest-node-label">${label}</span><small class="microquest-word-count">${en ? `${number(quest.words.length, locale)} words` : `${number(quest.words.length, locale)} 個字`}</small></li>`;
  }).join('')}</ol><p class="microquest-scroll-hint">${en ? '↔ Follow the illustrated trail' : '↔ 左右滑動，看看前方風景'}</p><div class="microquest-next"><span aria-hidden="true">✧</span><p>${goal}</p></div><p class="microquest-rest">${en ? 'You can stop after any small quest. Your next step will be waiting.' : '每完成一小關就能休息，下次接著走。'}</p></section>`;
}

const wordScenes = [
  ['home', 'A welcoming British cottage', '溫暖的英倫小屋'],
  ['family', 'A family spending time together', '一家人相聚的時光'],
  ['friend', 'Two friends sharing a moment', '兩位朋友相伴'],
  ['breakfast', 'A breakfast laid out on a table', '餐桌上的早餐'],
  ['school', 'A British school building', '英倫校舍'],
  ['garden', 'A garden full of plants and flowers', '花草生長的庭園'],
  ['letter', 'A handwritten letter and an envelope', '手寫信與信封'],
  ['map', 'A traveller’s paper map', '旅人的紙本地圖'],
  ['ticket', 'A paper travel ticket', '紙本車票'],
  ['station', 'A British railway station', '英倫火車站'],
];

export function renderWordScene(word, stageId, locale) {
  const index = wordScenes.findIndex(scene => scene[0] === word.word.trim().toLowerCase());
  const en = locale === 'en';
  if (index >= 0) {
    const scene = wordScenes[index];
    return `<figure class="word-scene-card"><div class="word-scene-picture word-scene-${index}" role="img" aria-label="${esc(scene[en ? 1 : 2])}"></div><figcaption><span aria-hidden="true">✧</span> ${en ? 'WORD ILLUSTRATION' : '單字插畫'}</figcaption></figure>`;
  }
  const reading = getReading(stageId);
  return `<figure class="word-scene-card is-chapter-scene"><div class="word-scene-picture story-scene ${reading.sceneClass}" role="img" aria-label="${esc(en ? `Chapter scene: ${reading.title.en}` : `章節場景：${reading.title.zh}`)}"></div><figcaption><span aria-hidden="true">✧</span> ${en ? 'CHAPTER SCENE' : '章節場景'} · ${number(stageId, locale)}</figcaption></figure>`;
}

export function renderQuestPostcard(stage, state, locale, finished) {
  const { completed, quests } = getMicroquests(stage, state);
  const en = locale === 'en';
  return `<div class="quest-reward-postcard">${renderChapterBanner(stage, locale)}<div class="quest-reward-note"><span class="quest-reward-seal" aria-hidden="true">✦</span><div><span class="quest-reward-eyebrow">${en ? 'A FOOTPRINT TO KEEP' : '收藏這一小步'}</span><strong>${en ? `Chapter ${stage.id} · ${completed} / ${quests.length} small quests` : `第 ${stage.id} 大章節・${completed} / ${quests.length} 小關`}</strong><p>${finished ? (en ? 'A whole chapter of your journey, now in your journal.' : '一整段冒險，已收進你的旅途手札。') : (en ? 'Rest here, or follow the trail a little further.' : '在這裡歇歇腳，也可以再向前一小步。')}</p></div></div></div>`;
}

export function renderMicroquestArrival(stage,state,locale){
 const {next,quests}=getMicroquests(stage,state);if(!next)return '';
 const en=locale==='en',region=Math.floor((stage.id-1)/10)+1,slot=(stage.id-1+next.number-1)%9;
 const label=microquestScenes[region-1][slot][en?'en':'zh'],path=`assets/miniquests-${String(region).padStart(2,'0')}.webp`;
 return `<figure class="microquest-arrival"><div class="microquest-arrival-picture" role="img" aria-label="${esc(label)}" data-quest-image="${path}" style="background-image:url('${path}');background-position:${slot%3*50}% ${Math.floor(slot/3)*50}%"></div><figcaption><span>${en?`SMALL QUEST ${next.number} / ${quests.length}`:`第 ${next.number} / ${quests.length} 小關`}</span><strong>${esc(label)}</strong><small>${en?`${next.words.length} new words · a little further today`:`${next.words.length} 個新字・今天，往前一小步`}</small></figcaption></figure>`;
}
