import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const json = async name => JSON.parse(await readFile(name,'utf8'));
const original = await readFile('vocabulary.js','utf8');
let vocabulary = JSON.parse(original.slice(original.indexOf('=')+1).trim().replace(/;$/,''));
const curriculum=await json('sources/curriculum-order.json');
const replacements=await json('sources/curriculum-replacements.json');
vocabulary=vocabulary.filter(word=>!Object.hasOwn(replacements.aliases,word.id));
for(const word of replacements.words)if(!vocabulary.some(item=>item.id===word.id))vocabulary.push({...word});
for(const [alias,id] of Object.entries(replacements.aliases)){
 const word=vocabulary.find(item=>item.id===id);if(!word)throw Error(`Missing canonical spelling: ${id}`);
 word.aliases=[...new Set([...(word.aliases||[]),alias])];
}
const source = await json('sources/vocab-duel-examples.json');
const examples = new Map(source.words.map(word=>[word.word.toLowerCase(),word]));
const supplemental = (await Promise.all([1,2,3].map(n=>json(`sources/curated-lexical-0${n}.json`)))).flat();
if(supplemental.length!==850 || new Set(supplemental.map(w=>w.id)).size!==850)throw Error('Expected 850 complete supplemental entries');
const repairs=(await Promise.all([1,2,3].map(n=>json(`sources/curated-senses-0${n}.json`)))).flat();
if(repairs.length!==703 || new Set(repairs.map(w=>w.id)).size!==703)throw Error('Expected 703 complete sense repairs');
const aligned=(await Promise.all(Array.from({length:8},(_,i)=>json(`sources/curated-alignment-${String(i+1).padStart(2,'0')}.json`)))).flat();
if(aligned.length!==5167||new Set(aligned.map(w=>w.id)).size!==5167)throw Error('Expected 5167 complete contextual sense alignments');
const edited = new Map([...supplemental,...repairs,...aligned,...await json('sources/curated-sense-overrides.json'),...replacements.words].map(w=>[w.id,w]));
const pos={n:'名詞',v:'動詞',adj:'形容詞',adv:'副詞',pron:'代名詞',det:'限定詞',prep:'介系詞',conj:'連接詞',aux:'助動詞',int:'感嘆詞',num:'數詞',phr:'片語'};
const irreg={shoot:['shot'],overcome:['overcame'],cling:['clung'],overtake:['overtook','overtaken'],'over-weight':['overweight'],be:['am','is','are','was','were','been','being'],have:['has','had'],do:['does','did','done'],go:['goes','went','gone'],make:['made'],take:['took','taken'],come:['came'],see:['saw','seen'],give:['gave','given'],get:['got','gotten'],buy:['bought'],bring:['brought'],teach:['taught'],think:['thought'],eat:['ate','eaten'],drink:['drank','drunk'],write:['wrote','written'],read:['read'],speak:['spoke','spoken'],tell:['told'],say:['said'],run:['ran'],swim:['swam','swum'],sing:['sang','sung'],begin:['began','begun'],break:['broke','broken'],choose:['chose','chosen'],fall:['fell','fallen'],feel:['felt'],find:['found'],fly:['flew','flown'],forget:['forgot','forgotten'],grow:['grew','grown'],hear:['heard'],hold:['held'],keep:['kept'],know:['knew','known'],leave:['left'],lend:['lent'],lose:['lost'],meet:['met'],pay:['paid'],ride:['rode','ridden'],rise:['rose','risen'],sell:['sold'],send:['sent'],sit:['sat'],sleep:['slept'],spend:['spent'],stand:['stood'],steal:['stole','stolen'],wear:['wore','worn'],win:['won'],child:['children'],person:['people'],man:['men'],woman:['women'],foot:['feet'],tooth:['teeth'],mouse:['mice'],wife:['wives'],knife:['knives'],life:['lives'],leaf:['leaves']};
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const contains=(sentence,form)=>new RegExp(`(^|[^a-z])${escape(form)}([^a-z]|$)`,'i').test(sentence);
function forms(w){const k=w.word.toLowerCase();return [...new Set([w.word,...w.aliases||[],...irreg[k]||[],k+'s',k+'es',k+'ed',k+'d',k+'ing',k.replace(/e$/,'')+'ing',k.replace(/y$/,'ies'),k.replace(/y$/,'ied'),k.replace(/f$/,'ves'),k.replace(/fe$/,'ves'),k+k.at(-1)+'ed',k+k.at(-1)+'ing'])];}
let reused=0;const noForm=[],references=[];
for(const word of vocabulary){
 const saved=word.exampleSource==='word-odyssey-seed'||word.meaningSource==='seed';
 const found=[word.word,...word.aliases||[]].map(key=>examples.get(key.toLowerCase())).find(Boolean);
 if(found){
  reused++;
  if(!saved){word.meaning=found.zh;word.pos=found.pos.map(p=>pos[p]||'詞語').join('／');word.meaningSource='vocab-duel-editorial';word.example=found.example;word.translation=found.example_zh;word.exampleSource='vocab-duel-editorial';word.reviewStatus='source-sample-reviewed';}
  else{word.exampleSource='word-odyssey-seed';word.reviewStatus='model-reviewed';}
 }
 const patch=edited.get(word.id);
 if(patch){for(const [key,value] of Object.entries(patch))if(key!=='id'&&key!=='word')word[key]=value;word.definitionSource='editorial';word.meaningSource='editorial';}
 // The old ECDICT phonetic strings mix systems. Do not teach them as verified IPA.
 delete word.phonetic;
 if(!word.example||!word.translation)throw Error(`No contextual example: ${word.id}`);
 const exampleForm=forms(word).find(form=>contains(word.example,form));
 if(exampleForm)word.exampleForm=exampleForm;else noForm.push({id:word.id,word:word.word,example:word.example,translation:word.translation});
 if(/\bsee (under|the note)|^pl\. of|^past (tense|participle) of|^imp\.\s/i.test(word.definition||''))references.push(word.id);
 if(/\p{Script=Han}/u.test(word.definition||''))throw Error(`Chinese in English definition: ${word.id}`);
}
if(noForm.length){await writeFile('artifacts/example-form-review.json',JSON.stringify(noForm,null,2));throw Error(`Examples needing target-form review: ${noForm.length}`);}
if(references.length)throw Error(`Unusable dictionary references: ${references.join(', ')}`);
const map=new Map(vocabulary.map(w=>[w.id,w]));
if(map.size!==7000||curriculum.order.length!==7000||new Set(curriculum.order).size!==7000)throw Error('Curriculum must contain 7000 distinct learning targets');
const ordered=curriculum.order.map(id=>{
 const word=map.get(id),difficultyBand=curriculum.bands[id];
 if(!word||!Number.isInteger(difficultyBand)||difficultyBand<1||difficultyBand>6)throw Error(`Invalid curriculum entry: ${id}`);
 return {...word,difficultyBand};
});
if(ordered.some((word,index)=>index&&word.difficultyBand<ordered[index-1].difficultyBand))throw Error('Difficulty bands must not move backwards');
const body='// Generated by scripts/build-vocabulary.py and scripts/enrich-vocabulary.mjs.\nexport const vocabulary = '+JSON.stringify(ordered,null,2)+';\n';
await writeFile('vocabulary.js',body);
const audit={date:'2026-10-03',total:ordered.length,uniqueIds:new Set(ordered.map(w=>w.id)).size,matchingVocabDuelSourceTargets:reused,activeExampleSources:ordered.reduce((a,w)=>(a[w.exampleSource]=(a[w.exampleSource]||0)+1,a),{}),authoredSupplementalSourceEntries:supplemental.length,senseRepairSourceEntries:repairs.length,contextualSenseAlignmentSourceEntries:aligned.length,mergedSpellingVariants:Object.keys(replacements.aliases).length,newLearningTargets:replacements.words.length,difficultyBands:ordered.reduce((a,w)=>(a[w.difficultyBand]=(a[w.difficultyBand]||0)+1,a),{}),exampleCount:ordered.filter(w=>w.example&&w.translation&&w.exampleForm).length,reviewStatusCounts:ordered.reduce((a,w)=>(a[w.reviewStatus]=(a[w.reviewStatus]||0)+1,a),{}),source:source.provenance,sha256:createHash('sha256').update(body).digest('hex'),note:'Source-entry counts precede spelling normalization; active final counts are reported separately. Contextual sense alignments and additions were model-reviewed, not independently teacher-reviewed. This is not evidence of learning efficacy.'};
await writeFile('docs/lexical-enrichment-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit));

const core=await json('docs/vocabulary-audit.json');
core.vocabularySha256=audit.sha256;
core.exampleCount=audit.exampleCount;
core.meaningSources=ordered.reduce((a,w)=>(a[w.meaningSource]=(a[w.meaningSource]||0)+1,a),{});
core.englishDefinitionSources=ordered.reduce((a,w)=>(a[w.definitionSource]=(a[w.definitionSource]||0)+1,a),{});
core.maxMeaningLength=Math.max(...ordered.map(w=>w.meaning.length));
core.maxEnglishDefinitionLength=Math.max(...ordered.map(w=>w.definition.length));
core.canonicalAliases={...core.canonicalAliases,...replacements.aliases};
core.supplementWords=ordered.filter(w=>w.sourceTags.every(tag=>tag.startsWith('supplement-'))).map(w=>w.id);
core.supplementCount=core.supplementWords.length;
core.basicDeferredAfter1200=ordered.slice(1200).filter(w=>w.sourceTags.includes('moe1200')).map(w=>w.id);
core.moeDeferredAfter2000=ordered.slice(2000).filter(w=>w.sourceTags.some(tag=>['moe1200','moe800'].includes(tag))).map(w=>w.id);
core.curriculumDifficultyBands=audit.difficultyBands;
core.limitations=core.limitations.filter(s=>!s.startsWith('Only seed')&&!s.startsWith('The first 1,200'));
core.limitations.push('All 7,000 entries have contextual bilingual examples. Source entries were sample-reviewed; additions were model-reviewed, not independently teacher-reviewed.');
core.limitations=[...new Set(core.limitations)];
for(const file of ['scripts/enrich-vocabulary.mjs','sources/curriculum-order.json','sources/curriculum-replacements.json','sources/vocab-duel-examples.json',...['lexical','senses'].flatMap(type=>[1,2,3].map(n=>`sources/curated-${type}-0${n}.json`)),'sources/curated-sense-overrides.json',...Array.from({length:8},(_,i)=>`sources/curated-alignment-${String(i+1).padStart(2,'0')}.json`)])core.inputSha256[file]=createHash('sha256').update(await readFile(file)).digest('hex');
await writeFile('docs/vocabulary-audit.json',JSON.stringify(core,null,2)+'\n');
