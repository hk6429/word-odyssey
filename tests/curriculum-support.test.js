import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGrammarSupport, requiresContextAudio, renderContextAudioNotice } from '../curriculum-support.js';

test('grammar helper appears only in the first three chapters and stays collapsed', () => {
  for (const stageId of [1, 2, 3]) {
    const html = renderGrammarSupport(stageId, 'en');
    assert.match(html, /<details\b/);
    assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
    assert.match(html, /<summary\b/);
    assert.match(html, /do not add words to your 7,000-word progress/);
  }
  for (const stageId of [0, 4, 100, -1, 1.5, '1', null, undefined, NaN]) assert.equal(renderGrammarSupport(stageId, 'en'), '');
});

test('pronoun support labels the roles and includes natural examples and standalone theirs', () => {
  const html = renderGrammarSupport(1, 'en');
  assert.match(html, /<caption>/);
  assert.equal((html.match(/scope="col"/g) || []).length, 3);
  assert.equal((html.match(/scope="row"/g) || []).length, 5);
  for (const form of ['I', 'my', 'me', 'he', 'his', 'him', 'she', 'her', 'we', 'our', 'us', 'they', 'their', 'them']) assert.match(html, new RegExp(`>${form}<`));
  assert.match(html, /I have my bag\. Please help me\./);
  assert.match(html, /She has her book\. I help her\./);
  assert.match(html, /their bags → The bags are theirs\./);
  assert.match(html, /I am; he, she or it is; you, we or they are/);
  assert.match(html, /I am ready\. She is here\. We are friends\./);
  assert.match(html, /table-layout:fixed/);
});

test('English output has no Chinese, while Traditional Chinese keeps English forms', () => {
  const chinese = /[\u3400-\u9fff]/;
  for (const stageId of [1, 2, 3]) {
    assert.doesNotMatch(renderGrammarSupport(stageId, 'en'), chinese);
    assert.match(renderGrammarSupport(stageId, 'zh'), /閱讀小幫手/);
    assert.match(renderGrammarSupport(stageId, 'zh'), /不會增加 7,000 字的學習進度/);
    assert.match(renderGrammarSupport(stageId, 'zh'), /<span lang="en">I have my bag/);
  }
  assert.doesNotMatch(renderContextAudioNotice({ word: 'read' }, 'en'), chinese);
  assert.match(renderContextAudioNotice({ word: 'read' }, 'zh'), /朗讀完整例句/);
});

test('renderers never interpolate unsafe selectors or word content', () => {
  const injection = '<img src=x onerror="alert(1)">';
  assert.equal(renderGrammarSupport(injection, 'en'), '');
  assert.doesNotMatch(renderGrammarSupport(1, injection), /<img|onerror|alert\(1\)/);
  assert.equal(renderContextAudioNotice({ word: injection, example: injection }, 'en'), '');
  const notice = renderContextAudioNotice({ word: 'read', example: injection, id: injection }, injection);
  assert.doesNotMatch(notice, /<img|onerror|alert\(1\)/);
  assert.match(renderGrammarSupport(1, 'zh'), /their bags → The bags are theirs\./);
});

test('only the selected homographs require context and never depend on example availability', () => {
  for (const word of ['lead', 'bow', 'minute', 'read', ' READ ', 'Lead']) {
    assert.equal(requiresContextAudio({ word }), true);
    assert.equal(requiresContextAudio({ word, example: 'A clear example.' }), true);
    assert.match(renderContextAudioNotice({ word }, 'en'), /For this word, audio reads the example to make its meaning clear\./);
  }
  for (const word of ['reader', 'leader', 'bowling', 'minutes', 'home', '']) {
    assert.equal(requiresContextAudio({ word }), false);
    assert.equal(renderContextAudioNotice({ word }, 'en'), '');
  }
  assert.equal(requiresContextAudio(null), false);
  assert.equal(requiresContextAudio(undefined), false);
});
