import {bindTaskDeck,makeReadingRecord} from './reading-practice.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const contextualWords = new Set(['lead', 'bow', 'minute', 'read']);

export function requiresContextAudio(word) {
  return contextualWords.has(String(word?.word ?? '').trim().toLowerCase());
}

export function renderContextAudioNotice(word, language = 'zh') {
  if (!requiresContextAudio(word)) return '';
  const text = language === 'en'
    ? 'For this word, audio reads the example to make its meaning clear.'
    : '這個字會朗讀完整例句，幫助你聽清楚它在句中的意思。';
  return `<p class="lesson-sub context-audio-note">${escape(text)}</p>`;
}

const pronouns = [
  { forms: ['I', 'my', 'me'], en: 'I have my bag. Please help me.', zh: '我帶著我的袋子。請幫幫我。' },
  { forms: ['he', 'his', 'him'], en: 'He has his key. Give it to him.', zh: '他有自己的鑰匙。把它交給他。' },
  { forms: ['she', 'her', 'her'], en: 'She has her book. I help her.', zh: '她帶著她的書。我幫助她。' },
  { forms: ['we', 'our', 'us'], en: 'We have our map. Come with us.', zh: '我們帶著我們的地圖。跟我們一起來。' },
  { forms: ['they', 'their', 'them'], en: 'They have their bags. I help them.', zh: '他們帶著他們的袋子。我幫助他們。' },
];

export function renderGrammarSupport(stageId, language = 'zh') {
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 3) return '';
  const en = language === 'en';
  const copy = en ? {
    title: 'Reading helper: people and be',
    note: 'These basic forms help you read. They do not add words to your 7,000-word progress.',
    caption: 'One person or group, different forms',
    headers: ['Subject', 'Before a noun', 'After a verb or preposition'],
    roles: 'Use the subject for who does something. Use my, his, her, our or their before a noun to show who it belongs to. Use me, him, her, us or them after a verb or preposition.',
    examples: 'Examples',
    theirs: 'Theirs stands alone: their bags → The bags are theirs.',
    be: 'Be changes to match the subject: I am; he, she or it is; you, we or they are.',
    beExample: 'I am ready. She is here. We are friends.',
  } : {
    title: '閱讀小幫手：人稱與 be 動詞',
    note: '這些基本形式幫助你閱讀，不會增加 7,000 字的學習進度。',
    caption: '同一個人或群體，放在不同位置的形式',
    headers: ['主詞', '名詞前：誰的', '動詞或介系詞後'],
    roles: '主詞表示誰做了某件事；my、his、her、our、their 放在名詞前，表示「誰的」；me、him、her、us、them 放在動詞或介系詞後。',
    examples: '例句',
    theirs: 'theirs 可單獨使用，不再接名詞：their bags → The bags are theirs.（這些袋子是他們的。）',
    be: 'be 動詞會隨主詞改變：I am；he、she、it 搭配 is；you、we、they 搭配 are。',
    beExample: '我準備好了。她在這裡。我們是朋友。',
  };
  const table = `<table style="width:100%;table-layout:fixed;border-collapse:collapse;text-align:left"><caption>${escape(copy.caption)}</caption><thead><tr>${copy.headers.map(header => `<th scope="col" style="padding:.5rem .25rem;overflow-wrap:anywhere">${escape(header)}</th>`).join('')}</tr></thead><tbody>${pronouns.map(row => `<tr>${row.forms.map((form, index) => index === 0 ? `<th scope="row" lang="en" style="padding:.35rem .25rem">${escape(form)}</th>` : `<td lang="en" style="padding:.35rem .25rem">${escape(form)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const examples = pronouns.map(row => `<p><span lang="en">${escape(row.en)}</span>${en ? '' : `<br><span>${escape(row.zh)}</span>`}</p>`).join('');
  return `<details class="story-translation grammar-support" style="text-align:left;line-height:1.8"><summary style="min-height:44px">${escape(copy.title)}</summary><p>${escape(copy.note)}</p><div data-grammar-deck></div><details class="grammar-reference"><summary>${en?'Look up the table and examples':'需要時再查：人稱表與例句'}</summary><p>${escape(copy.roles)}</p>${table}<p><strong>${escape(copy.examples)}</strong></p>${examples}<p>${escape(copy.theirs)}</p><p>${escape(copy.be)}</p><p><span lang="en">I am ready. She is here. We are friends.</span>${en ? '' : `<br>${escape(copy.beExample)}`}</p></details></details>`;
}

const difficultyLabels={
 zh:['生活入門','國中核心','國中延伸','高中銜接','高中中階','高中進階'],
 en:['Everyday foundations','Junior high core','Junior high expansion','Bridge to senior high','Senior high intermediate','Senior high advanced'],
};
export function difficultyLabel(stage,language='zh'){
 const bands=[...new Set(stage.words.map(word=>word.difficultyBand).filter(Boolean))];
 const labels=difficultyLabels[language==='en'?'en':'zh'];
 return bands.map(band=>labels[band-1]).join(' → ');
}

export const grammarTasks=[
 {id:'grammar-my',context:'I have _____ bag.',options:['me','my','I'],answer:1,evidence:'I have my bag. Please help me.'},
 {id:'grammar-him',context:'He has his key. Give it to _____.',options:['him','he','his'],answer:0,evidence:'He has his key. Give it to him.'},
 {id:'grammar-her',context:'She has _____ book.',options:['she','her','hers'],answer:1,evidence:'She has her book. I help her.'},
 {id:'grammar-us',context:'We have our map. Come with _____.',options:['we','our','us'],answer:2,evidence:'We have our map. Come with us.'},
 {id:'grammar-them',context:'They have their bags. I help _____.',options:['their','them','they'],answer:1,evidence:'They have their bags. I help them.'},
 {id:'grammar-be',context:'We _____ friends.',options:['am','is','are'],answer:2,evidence:'I am ready. She is here. We are friends.'},
];
export function bindGrammarSupport(container,stageId,locale='zh',onPractice=()=>{}){
 const tasks=grammarTasks.map(q=>({...q,type:'choice',prompt:locale==='en'?'Choose the form that fits this sentence.':'選出適合這個句子的形式。'}));
 return bindTaskDeck(container.querySelector('[data-grammar-deck]'),tasks,locale,r=>onPractice(makeReadingRecord(stageId,r.task.id,'reading-check',r.response,r.task.evidence,r.correct?'correct':'incorrect')));
}
