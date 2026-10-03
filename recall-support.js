export const normalizeAnswer=s=>String(s).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const parts=s=>String(s).split(/[;；、／/]/u).map(x=>x.replace(/\([^)]*\)|（[^）]*）/gu,'').trim()).filter(Boolean);
export function judgeRecall(word,input,words,locale='zh'){
 const value=normalizeAnswer(input);
 if([word.word,...(word.aliases||[])].some(x=>normalizeAnswer(x)===value))return {kind:'correct'};
 // A matching gloss is ambiguous, not proof of synonymy in every context.
 const other=words.find(w=>[w.word,...(w.aliases||[])].some(x=>normalizeAnswer(x)===value));
 const gloss=locale==='en'?word.definition:word.meaning,otherGloss=locale==='en'?other?.definition:other?.meaning;
 if(other&&(parts(gloss).some(x=>parts(otherGloss||'').includes(x))||word.pos===other.pos&&parts(word.meaning).some(x=>parts(other.meaning).includes(x))))return {kind:'alternative',word:other.word};
 return {kind:'incorrect'};
}
export function recallPrompt(word){
 const forms=[word.exampleForm,word.word,...(word.aliases||[])].filter(Boolean).sort((a,b)=>b.length-a.length);
 const pattern=new RegExp('\\b(?:'+forms.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
 return {sentence:(word.example||'').replace(pattern,'_____'),length:word.word.length,initial:word.word[0]};
}
export function spellingHint(word,level){return level===1?`${word.word[0]}${' _'.repeat(Math.max(0,word.word.length-1))}`:level===2?[...word.word].map((c,i)=>i%2===0?c:'_').join(' '):word.word;}
export function spellingDifference(input,target){return {input:String(input),target,firstDifference:(()=>{const a=String(input);let i=0;while(i<Math.max(a.length,target.length)&&a[i]===target[i])i++;return i;})()};}
const transfer={
 home:['After the trip, I went back ____ to my family.','旅行後，我回家與家人相聚。'],
 family:['My parents and I are a ____.','我和父母是一個家庭。'],
 friend:['Lina helps me when I am sad. She is my ____.','Lina在我難過時幫助我。她是我的朋友。'],
 breakfast:['It is seven in the morning. Let us eat ____.','早上七點了。我們來吃早餐。'],
 school:['The children study with their teachers at ____.','孩子們在學校跟老師學習。'],
 garden:['We grow vegetables in our ____.','我們在花園種蔬菜。'],
 letter:['I wrote a ____ and put it in an envelope.','我寫了一封信，把它放進信封。'],
 map:['We used a ____ to find the road to the town.','我們用地圖找通往小鎮的路。'],
 ticket:['You need a ____ before you get on the train.','上火車之前，你需要一張票。'],
 station:['The train stops at this ____.','火車停靠這座車站。']
};
export function transferTask(word){return transfer[word.id]?{kind:'guided',sentence:transfer[word.id][0],translation:transfer[word.id][1],target:word.word}:{kind:'open',target:word.word};}
