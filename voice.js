import { bundledWords } from './audio-manifest.js';

const labels = {
  settings: ['語音與速度', 'Voice and speed'], preference: ['語音偏好', 'Voice preference'],
  natural: ['自然語音', 'Natural voice'], british: ['英式語音', 'British voice'],
  speed: ['朗讀速度', 'Reading speed'], normal: ['正常', 'Normal'], slow: ['慢速 0.8', 'Slow 0.8'],
  stop: ['停止朗讀', 'Stop reading'], example: ['朗讀例句', 'Read example'], passage: ['朗讀全文', 'Read passage'],
  hint: ['自然語音：單字優先使用美式 AI 音檔；例句、文章使用裝置語音。英式語音需裝置提供英國英語聲線。', 'Natural voice: American AI audio for available words; device speech for examples and passages. British voice requires a UK English voice on your device.'],
  playing: ['朗讀中…', 'Reading…'], stopped: ['已停止朗讀', 'Reading stopped'], complete: ['朗讀完畢', 'Reading complete'],
  unsupported: ['此瀏覽器不支援裝置朗讀，請改用支援語音的瀏覽器；有內建音檔的單字仍可播放。', 'Device speech is unavailable in this browser. Try a browser with speech support. Bundled word audio can still play.'],
  noEnglish: ['此裝置沒有可用的英語聲線。請在系統的文字轉語音設定安裝英語聲線。', 'No English voice is available. Install an English voice in your device’s text-to-speech settings.'],
  noBritish: ['此裝置沒有英國英語聲線。請安裝 en-GB 聲線，或改選「自然語音」。', 'No UK English voice is available. Install an en-GB voice or choose Natural voice.'],
  fallback: ['內建音檔無法播放，已改用裝置語音。', 'Bundled audio could not play. Using device speech.'],
  failed: ['朗讀失敗，請再試一次，或檢查裝置的語音設定。', 'Speech playback failed. Try again or check your device’s speech settings.'],
};
let getLocale = () => 'zh';
export function voiceLabel(key, language = getLocale()) { return labels[key]?.[language === 'en' ? 1 : 0] || key; }
const normalize = value => String(value || '').trim().toLowerCase();
export function selectVoice(voices, preference = 'natural') {
  const eligible = voices.filter(voice => {
    const lang = (voice.lang || '').replaceAll('_', '-').toLowerCase();
    return preference === 'british' ? lang === 'en-gb' : /^en(?:-|$)/.test(lang);
  });
  const score = voice => (/natural|neural|premium|enhanced/i.test(voice.name) ? 100 : 0)
    + (/samantha|ava|daniel|serena|sonia|libby|ryan/i.test(voice.name) ? 50 : 0)
    + (/^en[-_]US$/i.test(voice.lang) ? 10 : 0) + (voice.localService ? 2 : 0);
  return eligible.sort((a, b) => score(b) - score(a))[0] || null;
}
export function splitSentences(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  const sentences = typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(raw)].map(part => part.segment.trim())
    : raw.match(/[^.!?]+(?:[.!?]+|$)/g).map(part => part.trim());
  // Bound unusually long sentences to keep device engines responsive to Stop.
  return sentences.flatMap(sentence => sentence.match(/.{1,220}(?:\s|$)|\S{1,220}/g) || []).map(part => part.trim()).filter(Boolean);
}
const spokenWord = text => ({ Mrs: 'missus', 'Mrs.': 'missus', Ms: 'miz', 'Ms.': 'miz', 'Dr.': 'doctor', OK: 'okay' }[text] || (/^[A-Z]{2,5}$/.test(text) ? [...text].join(', ') : text));

// Dependency injection keeps cancellation, fallback and voice loading testable without audio hardware.
export function createVoiceController({ synthesis = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance,
  AudioClass = globalThis.Audio, storage = null, wordAudio = bundledWords, onChange = () => {}, onNotice = () => {}, voiceWaitMs = 1500 } = {}) {
  const key = 'word-odyssey-voice-v1';
  let preferences = { preference: 'natural', speed: 'normal' };
  try { const saved = JSON.parse(storage?.getItem(key) || 'null'); if (saved?.preference === 'british') preferences.preference = 'british'; if (saved?.speed === 'slow') preferences.speed = 'slow'; } catch { /* Device preferences are optional. */ }
  let generation = 0, audio = null, settle = null, playing = false, status = '', waiters = new Set();
  let voices = synthesis?.getVoices?.() || [], voicesReady = voices.length > 0;
  const state = () => ({ ...preferences, playing, status });
  const update = (nextStatus = status) => { status = nextStatus; onChange(state()); };
  const notice = code => { update(code); onNotice(code); };
  const voicesChanged = () => { voices = synthesis?.getVoices?.() || []; if (voices.length) { voicesReady = true; for (const resolve of waiters) resolve(); waiters.clear(); } };
  synthesis?.addEventListener?.('voiceschanged', voicesChanged);
  const stop = ({ quiet = false } = {}) => {
    generation++;
    if (audio) { audio.onended = audio.onerror = null; try { audio.pause(); audio.currentTime = 0; } catch { /* Detached audio. */ } audio = null; }
    const pending = settle; settle = null; pending?.(false);
    try { synthesis?.cancel(); } catch { /* An unavailable engine cannot keep speaking. */ }
    playing = false; update(quiet ? '' : 'stopped');
  };
  const waitForVoices = () => {
    voicesChanged();
    if (voicesReady || !synthesis) return Promise.resolve();
    return new Promise(resolve => {
      const finish = () => { clearTimeout(timer); waiters.delete(finish); resolve(); };
      const timer = setTimeout(() => { voicesReady = true; finish(); }, voiceWaitMs);
      waiters.add(finish);
    });
  };
  async function tts(text, token) {
    if (!synthesis || !Utterance) { notice('unsupported'); return false; }
    await waitForVoices();
    if (token !== generation) return false;
    const voice = selectVoice(voices, preferences.preference);
    if (!voice) { notice(preferences.preference === 'british' ? 'noBritish' : 'noEnglish'); return false; }
    return new Promise(resolve => {
      let done = false;
      const finish = result => { if (done) return; done = true; if (settle === finish) settle = null; resolve(result); };
      settle = finish;
      try {
        const utterance = new Utterance(text); utterance.lang = voice.lang.replaceAll('_', '-'); utterance.voice = voice;
        utterance.rate = preferences.speed === 'slow' ? 0.8 : 0.9;
        utterance.onend = () => finish(token === generation);
        utterance.onerror = () => { if (!done && token === generation) notice('failed'); finish(false); };
        synthesis.speak(utterance);
      } catch { notice('failed'); finish(false); }
    });
  }
  function bundled(id, token) {
    return new Promise(resolve => {
      let done = false, current;
      const finish = result => { if (done) return; done = true; if (settle === finish) settle = null; if (current) { current.onended = current.onerror = null; try { current.pause(); } catch { /* Already stopped. */ } } if (audio === current) audio = null; resolve(result); };
      settle = finish;
      try {
        current = audio = new AudioClass(`audio/words/${id}.mp3`);
        current.playbackRate = preferences.speed === 'slow' ? 0.8 : 1;
        current.onended = () => finish(token === generation); current.onerror = () => finish(false);
        const result = current.play(); result?.catch(() => finish(false));
      } catch { finish(false); }
    });
  }
  async function say(text, { word = false } = {}) {
    stop({ quiet: true });
    const raw = String(text || '').trim(); if (!raw) return false;
    const token = generation; playing = true; update('playing');
    let success = false;
    const id = word && preferences.preference === 'natural' && AudioClass ? wordAudio[normalize(raw)] : null;
    if (id && /^w\d+$/.test(id)) {
      success = await bundled(id, token);
      if (!success && token === generation) notice('fallback');
    }
    if (!success && token === generation) {
      const chunks = word ? [spokenWord(raw)] : splitSentences(raw);
      for (const chunk of chunks) { success = await tts(chunk, token); if (!success || token !== generation) break; }
    }
    if (token === generation) { playing = false; update(success ? 'complete' : status); }
    return success && token === generation;
  }
  return {
    sayWord: text => say(text, { word: true }), sayText: text => say(text), stop, getState: state,
    setPreferences(value) { stop({ quiet: true }); preferences = { preference: value.preference === 'british' ? 'british' : value.preference === 'natural' ? 'natural' : preferences.preference, speed: value.speed === 'slow' ? 'slow' : value.speed === 'normal' ? 'normal' : preferences.speed }; try { storage?.setItem(key, JSON.stringify(preferences)); } catch { /* Playback works without storage. */ } update(); },
    destroy() { stop({ quiet: true }); synthesis?.removeEventListener?.('voiceschanged', voicesChanged); for (const resolve of waiters) resolve(); waiters.clear(); },
  };
}
let controller;
function current() {
  if (!controller) { let storage; try { storage = globalThis.localStorage; } catch { /* Storage denied. */ } controller = createVoiceController({ storage, onChange: refreshVoiceControls }); }
  return controller;
}
export const speakWord = text => current().sayWord(text);
export const speakText = text => current().sayText(text);
export const stopSpeaking = () => controller?.stop({ quiet: true });
export function initVoice({ getLanguage = () => 'zh' } = {}) {
  getLocale = getLanguage; current();
  window.addEventListener('pagehide', stopSpeaking);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeaking(); });
}
export function mountVoiceControls(container) {
  if (!container) return;
  container.classList.add('voice-toolbar'); container.dataset.voicePanel = '';
  container.innerHTML = `<details class="voice-preferences"><summary data-voice-label="settings"></summary><div class="voice-options"><label><span data-voice-label="preference"></span><select data-voice-preference><option value="natural" data-voice-label="natural"></option><option value="british" data-voice-label="british"></option></select></label><label><span data-voice-label="speed"></span><select data-voice-speed><option value="normal" data-voice-label="normal"></option><option value="slow" data-voice-label="slow"></option></select></label><p data-voice-label="hint"></p></div></details><button class="voice-stop" type="button" data-voice-stop data-voice-label="stop"></button><span class="voice-status" role="status" aria-live="polite" data-voice-status></span>`;
  container.querySelector('[data-voice-preference]').onchange = event => current().setPreferences({ preference: event.target.value });
  container.querySelector('[data-voice-speed]').onchange = event => current().setPreferences({ speed: event.target.value });
  container.querySelector('[data-voice-stop]').onclick = () => current().stop();
  refreshVoiceControls();
}
export function refreshVoiceControls() {
  if (typeof document === 'undefined' || !controller) return;
  const state = controller.getState();
  document.querySelectorAll('[data-voice-panel]').forEach(panel => {
    panel.querySelectorAll('[data-voice-label]').forEach(el => { el.textContent = voiceLabel(el.dataset.voiceLabel); });
    panel.querySelector('[data-voice-preference]').value = state.preference;
    panel.querySelector('[data-voice-speed]').value = state.speed;
    panel.querySelector('[data-voice-stop]').disabled = !state.playing;
    panel.querySelector('[data-voice-status]').textContent = state.status ? voiceLabel(state.status) : '';
  });
}
