import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../engine.js';
const NOW = 1800000000000;
const make = (quotas = [23, 5]) => createEngine(quotas.map((quota, i) => ({id:i + 1, quota,
  words:Array.from({length:quota}, (_, j) => ({id:`s${i + 1}w${j}`,word:`word-${i}-${j}`}))})));
function finish(e, s, q, now = NOW) { while(q.phase !== 'complete') q.phase === 'learn' ? e.learnNext(s,q) : e.answer(s,q,true,now); }
function roundtrip(e,s,q) {
  const draft = JSON.parse(JSON.stringify(e.serializeSessionDraft(s,q)));
  const restored = e.restoreSessionDraft(s,draft);
  assert.deepEqual(restored,q); return restored;
}
test('mixed 3/5/10 batches roundtrip strictly and preserve legacy ten-word acquisition', () => {
  const e=make(), s=e.createState();
  for(const size of [3,5,10,5]) {
    const q=e.startSession(s,1,NOW,{size}); finish(e,s,q);
    assert.equal(q.earnedXp,size*10);
    assert.deepEqual(e.loadState(JSON.stringify(s),{strict:true}),s);
  }
  assert.equal(s.xp,230); assert.deepEqual(s.completed,[1]);
  const broken=structuredClone(s); broken.questBatches[0].reverse();
  assert.throws(()=>e.loadState(broken,{strict:true}));
  const legacy=make().createState(); finish(e,legacy,e.startSession(legacy,1,NOW));
  assert.equal(legacy.questBatches,undefined);
  finish(e,legacy,e.startSession(legacy,1,NOW,{size:3}));
  assert.equal(legacy.xp,130); assert.deepEqual(e.loadState(legacy,{strict:true}),legacy);
});
test('review prioritizes due words and chapter scope never escapes learned chapter words', () => {
  const e=make([3,5]),s=e.createState(); finish(e,s,e.startSession(s,1,NOW)); finish(e,s,e.startSession(s,2,NOW));
  const first='s1w0'; s.words[first].nextDue=NOW;
  const q=e.reviewSession(s,NOW); assert.equal(q.queue[0],first); assert.ok(q.queue.length>1);
  const chapter=e.reviewSession(s,NOW,{stageId:1}); assert.equal(chapter.queue.length,3);
  assert.ok(chapter.queue.every(id=>s.words[id].stageId===1));
});
test('assisted success grants neither first-attempt credit nor mastery, true errors lower mastery', () => {
  const e=make([1]),s=e.createState(); finish(e,s,e.startSession(s,1,NOW));
  let q=e.reviewSession(s,s.words.s1w0.nextDue); finish(e,s,q,s.words.s1w0.nextDue);
  const before=structuredClone(s.words.s1w0),time=before.nextDue;
  q=e.reviewSession(s,time); e.answer(s,q,true,time,{type:'recall',assisted:true});
  for(const key of ['correct','reviewCount','recallCount','mastery']) assert.equal(s.words.s1w0[key],before[key]);
  assert.equal(s.reviewHistory.at(-1).firstCorrect,0);
  q=e.reviewSession(s,time); e.answer(s,q,false,time,{assisted:true});
  assert.equal(s.words.s1w0.mastery,before.mastery-1);
  const fresh=e.createState(), learn=e.startSession(fresh,1,NOW);
  e.learnNext(fresh,learn); e.answer(fresh,learn,true,NOW,{assisted:true});
  assert.equal(fresh.xp,0); assert.equal(learn.phase,'challenge');
  e.answer(fresh,learn,true,NOW); assert.equal(fresh.xp,10);
});
test('draft restores learn, challenge, retry and review; replay never repeats review credit', () => {
  const e=make(),s=e.createState(); let q=e.startSession(s,1,NOW,{size:3});
  e.learnNext(s,q); q=roundtrip(e,s,q);
  while(q.phase==='learn')e.learnNext(s,q);
  e.answer(s,q,false,NOW); q=roundtrip(e,s,q); finish(e,s,q);
  assert.equal(e.serializeSessionDraft(s,q),null);
  q=e.startSession(s,1,NOW+86400000,{size:5});
  e.answer(s,q,false,NOW+86400000); const before=JSON.stringify(s); q=roundtrip(e,s,q);
  assert.equal(JSON.stringify(s),before);
  finish(e,s,q,NOW+86400000);
  assert.deepEqual(e.loadState(s,{strict:true}),s);
  assert.equal(s.reviewHistory.at(-1).completed,true);
});
test('malformed, forged and progress-conflicting drafts are rejected without mutating state', () => {
  const e=make(),s=e.createState(),q=e.startSession(s,1,NOW,{size:3}); e.learnNext(s,q);
  const good=e.serializeSessionDraft(s,q),before=JSON.stringify(s);
  for(const change of [d=>d.session.queue.reverse(),d=>d.session.index++,d=>d.session.phase='challenge',
    d=>d.session.attempts.s1w0={correct:1,incorrect:0,type:'recognition'},d=>d.events.push({kind:'answer',now:NOW-1,correct:true,type:'recognition',assisted:false,summaryId:null}),
    d=>d.stageId=2,d=>d.base.fingerprint='fake',d=>d.session.newWords.push('fake')]) {
    const bad=structuredClone(good);change(bad);assert.equal(e.restoreSessionDraft(s,bad),null);
  }
  assert.equal(JSON.stringify(s),before);
  finish(e,s,q); assert.equal(e.restoreSessionDraft(s,good),null);
});
test('draft size remains bounded with 7000 learned words', () => {
  const e=make([7000,10]),s=e.createState();
  // Build canonical legacy state directly to keep this focused check fast.
  for(let i=0;i<7000;i++)s.words[`s1w${i}`]={stageId:1,learnedAt:NOW,lastReviewed:NOW,correct:1,incorrect:0,streak:1,reviewCount:0,mastery:0,nextDue:NOW,recallCount:0,nextReviewMode:'recall'};
  const state=e.loadState(s),q=e.startSession(state,2,NOW,{size:3});
  for(let i=0;i<10;i++)e.answer(state,q,true,NOW);
  const draft=e.serializeSessionDraft(state,q);
  assert.ok(JSON.stringify(draft).length<60000);
  assert.ok(e.restoreSessionDraft(state,draft));
});
test('hint survives reload and cannot become independent first-attempt success', () => {
  const e=make([1]),s=e.createState(); finish(e,s,e.startSession(s,1,NOW));
  const time=s.words.s1w0.nextDue;
  let q=e.reviewSession(s,time);
  e.markSessionHint(s,q); e.markSessionHint(s,q);
  assert.equal(e.serializeSessionDraft(s,q).events.filter(event=>event.kind==='hint').length,1);
  q=roundtrip(e,s,q); assert.equal(q.currentAssisted,true);
  e.answer(s,q,true,time,{type:'recall',assisted:false});
  assert.equal(q.currentAssisted,false);
  assert.equal(s.words.s1w0.reviewCount,0);
  assert.equal(s.words.s1w0.recallCount,0);
  assert.equal(s.words.s1w0.mastery,0);
  assert.equal(s.reviewHistory.at(-1).firstCorrect,0);
  const fresh=e.createState(); q=e.startSession(fresh,1,NOW);
  e.learnNext(fresh,q); e.markSessionHint(fresh,q); q=roundtrip(e,fresh,q);
  e.answer(fresh,q,true,NOW);
  assert.equal(q.phase,'challenge'); assert.equal(fresh.xp,0); assert.equal(q.currentAssisted,false);
  q=roundtrip(e,fresh,q); e.answer(fresh,q,true,NOW); assert.equal(fresh.xp,10);
});
