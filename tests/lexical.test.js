import test from 'node:test';
import assert from 'node:assert/strict';
import { vocabulary } from '../vocabulary.js';
import { stages } from '../data.js';
import { wordPos } from '../i18n.js';
import { readFileSync } from 'node:fs';
const words=new Map(vocabulary.map(word=>[word.id,word]));
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

test('all 7000 targets retain source attribution and usable bilingual context, not cross-reference-only glosses',()=>{
 assert.equal(words.size,7000);
 for(const word of vocabulary){
  assert.match(word.meaning,/\p{Script=Han}/u,word.id);
  assert.match(word.translation,/\p{Script=Han}/u,word.id);
  assert.ok(word.definition?.length>=3,word.id);
  assert.doesNotMatch(word.definition,/\p{Script=Han}|\bsee (?:under|the note)|^pl\. of|^past (?:tense|participle) of/iu,word.id);
  assert.ok(word.exampleSource,word.id);
  assert.ok(word.reviewStatus,word.id);
  assert.ok(word.sourceTags.length,word.id);
  assert.ok(word.exampleForm,word.id);
  assert.match(word.example,new RegExp(`(^|[^a-z])${escape(word.exampleForm)}([^a-z]|$)`,'i'),word.id);
  assert.ok(wordPos(word,'en'),word.id);
  assert.equal(word.phonetic,undefined,`Unreviewed IPA must not return: ${word.id}`);
 }
 const primary=JSON.parse(readFileSync(new URL('../sources/official-primary-headwords.json',import.meta.url),'utf8'));
 const entries=Array.isArray(primary)?primary:primary.words;
 const covered=new Set(vocabulary.flatMap(w=>[w.id,...(w.aliases||[])]));
 for(const entry of entries)assert.ok(covered.has(entry.word.toLowerCase()),entry.word);
});

test('known mismatched senses now agree across English, Chinese and contextual examples',()=>{
 for(const [id,pos,meaning,definition] of [
  ['well','副詞','很好地',/successful/],['right','形容詞','正確的',/Correct/],
  ['fall','動詞','落下',/ground/],['charge','動詞','充電',/battery/],
  ['persist','動詞','堅持',/keep trying/],['confer','動詞','授予',/officially give/],
  ['post office','名詞','郵局',/letters/],['ours','代名詞','我們的（東西）',/Belonging to us/],
  ['bow','動詞','鞠躬',/bend/],['stepchild','名詞','繼子女',/earlier relationship/],
 ]){const word=words.get(id);assert.equal(word.pos,pos,id);assert.equal(word.meaning,meaning,id);assert.match(word.definition,definition,id);}
 for(const id of ['lead','bow','minute','read'])assert.ok(words.get(id).example);
 for(const id of ['his','her','their','your','our'])assert.ok(vocabulary.slice(0,300).some(w=>w.id===id),`${id} belongs near the beginning`);
 assert.ok(vocabulary.slice(0,1323).some(w=>w.id==='ours'),'ours belongs in the core band');
 assert.equal(stages.slice(0,20).flatMap(s=>s.words).length,1200);
 assert.equal(stages.slice(0,40).flatMap(s=>s.words).length,2000);
});

test('curriculum bands rise from everyday foundations to advanced words, retaining spelling alternatives',()=>{
 const curriculum=JSON.parse(readFileSync(new URL('../sources/curriculum-order.json',import.meta.url),'utf8'));
 assert.deepEqual(vocabulary.map(w=>w.id),curriculum.order);
 assert.equal(vocabulary.filter(w=>w.difficultyBand===1).length,300);
 for(let i=1;i<vocabulary.length;i++)assert.ok(vocabulary[i].difficultyBand>=vocabulary[i-1].difficultyBand,vocabulary[i].id);
 const replacements=JSON.parse(readFileSync(new URL('../sources/curriculum-replacements.json',import.meta.url),'utf8'));
 for(const [alias,id] of Object.entries(replacements.aliases)){assert.equal(words.has(alias),false);assert.ok(words.get(id).aliases.includes(alias));}
 for(const id of ['me','my','him','us','them'])assert.ok(vocabulary.slice(0,300).some(w=>w.id===id));
});
