import { writeFile } from 'node:fs/promises';
import { stages } from '../data.js';
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const theme = /\b(map|river|bridge|village|letter|book|garden|travell?er|path|road|train|forest|lantern|door|journey|walk|clue|story|compass|mountain|rain|library|friend|help|team|hope|discover|trust|courage)\b/i;
const missions = {};
for (const stage of stages) {
  const candidates = stage.words.filter(word => word.example && word.translation && new RegExp(`\\b${escape(word.word)}\\b`, 'i').test(word.example));
  const score = word => (theme.test(word.example) ? 20 : 0) + (theme.test(word.word) ? 10 : 0) + (word.exampleSource === 'word-odyssey-seed' ? 5 : 0) - Math.abs(word.example.split(/\s+/).length - 11) / 10;
  candidates.sort((a,b) => score(b) - score(a));
  const chosen = candidates.slice(0,3);
  if(chosen.length!==3) throw Error(`Stage ${stage.id} needs three suitable contextual examples`);
  missions[stage.id]=chosen.map(word=>({wordId:word.id,sentence:word.example,translation:word.translation}));
}
await writeFile('curated-missions.js','// Three source-traceable contextual field notes per stage. Rebuild with scripts/build-missions.mjs.\nexport const curatedMissions = '+JSON.stringify(missions,null,2)+';\n');
console.log('Built 100 stage-specific missions with 300 distinct target words.');
