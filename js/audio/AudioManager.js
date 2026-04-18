/**
 * AudioManager.js — 音效管理模組
 * 具備網頁合成音效 (Web Audio API) Fallback 功能，確保無音檔時也有聲音！
 */

const AUDIO_FILES = {
  bgm:        './assets/audio/bgm.mp3',
  correct:    './assets/audio/correct.mp3',
  wrong:      './assets/audio/wrong.mp3',
  stageClear: './assets/audio/stage-clear.mp3',
  gameOver:   './assets/audio/game-over.mp3',
};

const _sounds = new Map();
let _initialized = false;
let _settings = JSON.parse(localStorage.getItem('monster-audio-settings') || '{"bgm":true,"sfx":true}');

let audioCtx = null;
let bgmInterval = null;

export const AudioManager = {
  get settings() { return _settings; },
  
  saveSettings() {
    localStorage.setItem('monster-audio-settings', JSON.stringify(_settings));
    if (!_settings.bgm) this.stop('bgm');
    else if (_initialized && _settings.bgm) this.play('bgm');
  },

  toggleBgm() {
    _settings.bgm = !_settings.bgm;
    this.saveSettings();
  },
  
  toggleSfx() {
    _settings.sfx = !_settings.sfx;
    this.saveSettings();
  },

  init() {
    if (_initialized) return;
    _initialized = true;

    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    } catch(e) {}

    for (const [name, src] of Object.entries(AUDIO_FILES)) {
      const audio = new Audio(src);
      if (name === 'bgm') {
        audio.loop = true;
        audio.volume = 0.3;
      } else {
        audio.volume = 0.6;
      }
      audio.preload = 'auto';
      _sounds.set(name, audio);
    }
    
    if (_settings.bgm) this.play('bgm');
  },

  playSynth(type, freq, duration, vol=0.1) {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  },

  startSynthBGM() {
    if (bgmInterval) return;
    // 簡單的 8-bit 風格琶音 BGM
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C4, E4, G4, C5, G4, E4
    let idx = 0;
    bgmInterval = setInterval(() => {
      if(!_settings.bgm) return;
      this.playSynth('triangle', notes[idx], 0.2, 0.05);
      idx = (idx + 1) % notes.length;
    }, 250);
  },

  play(name) {
    if (!_initialized) return;
    if (name === 'bgm' && !_settings.bgm) return;
    if (name !== 'bgm' && !_settings.sfx) return;

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const audio = _sounds.get(name);
    if (!audio) return;

    if (name !== 'bgm') {
      audio.currentTime = 0;
    }

    audio.play().catch(() => {
      // 檔案不存在或被擋時，使用 Web Audio API 的合成音效作為 Fallback
      if (name === 'bgm') {
        this.startSynthBGM();
      } else if (name === 'correct') {
        this.playSynth('sine', 880, 0.1, 0.2); // 答對: 高音
        setTimeout(() => this.playSynth('sine', 1108.73, 0.2, 0.2), 100);
      } else if (name === 'wrong') {
        this.playSynth('sawtooth', 150, 0.3, 0.2); // 答錯: 低沉聲
      }
    });
  },

  stop(name) {
    if (name === 'bgm') {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    const audio = _sounds.get(name);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }
};
