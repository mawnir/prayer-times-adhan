import { AdhanSoundType } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentStopCallback: (() => void) | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stopSound(): void {
    if (this.currentStopCallback) {
      this.currentStopCallback();
      this.currentStopCallback = null;
    }
    this.isPlaying = false;
  }

  public async playSound(type: AdhanSoundType, volume: number = 0.8, onEnded?: () => void): Promise<void> {
    this.stopSound();

    if (type === 'silent') {
      if (onEnded) onEnded();
      return;
    }

    try {
      const ctx = this.getContext();
      this.isPlaying = true;

      let isCancelled = false;
      const timeouts: number[] = [];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1.0, volume)), ctx.currentTime);
      masterGain.connect(ctx.destination);

      const cleanup = () => {
        isCancelled = true;
        timeouts.forEach(t => clearTimeout(t));
        try {
          masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
          setTimeout(() => {
            try {
              masterGain.disconnect();
            } catch {
              // ignore
            }
          }, 100);
        } catch {
          // ignore
        }
        this.isPlaying = false;
        if (onEnded) onEnded();
      };

      this.currentStopCallback = cleanup;

      if (type === 'gentle_beep') {
        this.playGentleBeep(ctx, masterGain, cleanup);
      } else if (type === 'spiritual_chime') {
        this.playSpiritualChime(ctx, masterGain, cleanup);
      } else if (type === 'takbeer') {
        this.playTakbeerChant(ctx, masterGain, cleanup, () => isCancelled, timeouts);
      } else if (type === 'madinah_adhan') {
        this.playMadinahMelody(ctx, masterGain, cleanup, () => isCancelled, timeouts);
      } else {
        // default makkah_adhan
        this.playMakkahAdhan(ctx, masterGain, cleanup, () => isCancelled, timeouts);
      }
    } catch (e) {
      console.error('Failed to play adhan audio:', e);
      this.isPlaying = false;
      if (onEnded) onEnded();
    }
  }

  private playGentleBeep(ctx: AudioContext, destination: GainNode, onFinish: () => void) {
    const tones = [587.33, 880, 1174.66]; // D5, A5, D6
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.35);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(ctx.currentTime + idx * 0.18);
      osc.stop(ctx.currentTime + idx * 0.18 + 0.4);
    });

    setTimeout(onFinish, 800);
  }

  private playSpiritualChime(ctx: AudioContext, destination: GainNode, onFinish: () => void) {
    // Rich singing bowl / temple chime with multiple partials
    const baseFreq = 261.63; // C4
    const partials = [1, 2.76, 5.4, 8.93];
    const decays = [4.5, 3.2, 2.0, 1.2];
    const amplitudes = [0.4, 0.25, 0.15, 0.08];

    partials.forEach((p, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(amplitudes[idx], ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decays[idx]);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + decays[idx]);
    });

    setTimeout(onFinish, 4500);
  }

  // Melodic vocal tone with formant filtering to mimic human vocal chanting
  private playVocalNote(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    vibrato: boolean = true
  ) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const noteGain = ctx.createGain();

    // Human vocal formants simulation (Vowel 'Ah'/'Oh' filter)
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.value = 750; // F1 for 'a'
    formant1.Q.value = 4.0;

    const formant2 = ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.value = 1200; // F2
    formant2.Q.value = 3.5;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, startTime); // slight chorusing

    if (vibrato && duration > 0.8) {
      // Natural vibrato LFO after initial attack
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, startTime + 0.3);
      lfoGain.gain.setValueAtTime(0, startTime);
      lfoGain.gain.linearRampToValueAtTime(3.5, startTime + 0.6);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start(startTime + 0.3);
      lfo.stop(startTime + duration);
    }

    // Envelope
    const attack = Math.min(0.25, duration * 0.2);
    const release = Math.min(0.4, duration * 0.3);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.28, startTime + attack);
    noteGain.gain.setValueAtTime(0.25, startTime + duration - release);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(formant1);
    osc2.connect(formant1);
    osc.connect(formant2);
    osc2.connect(formant2);

    formant1.connect(noteGain);
    formant2.connect(noteGain);
    noteGain.connect(destination);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  private playTakbeerChant(
    ctx: AudioContext,
    destination: GainNode,
    onFinish: () => void,
    isCancelled: () => boolean,
    timeouts: number[]
  ) {
    // Canonical Takbeer phrase:
    // Al-la-hu Ak-bar, Al-la-hu Ak-bar
    // Notes in Bayati maqam: D4 (293.66), F4 (349.23), G4 (392.00), A4 (440.00), G4, F4, D4
    const D = 293.66;
    const EhalfFlat = 315.0;
    const F = 349.23;
    const G = 392.00;
    const A = 440.00;

    const melody = [
      { freq: D, dur: 0.5 },
      { freq: G, dur: 1.0 },
      { freq: A, dur: 0.8 },
      { freq: G, dur: 1.4 },
      { freq: F, dur: 0.6 },
      { freq: EhalfFlat, dur: 0.8 },
      { freq: D, dur: 1.8 },
      // Pause
      { freq: 0, dur: 0.4 },
      // Second Takbeer
      { freq: D, dur: 0.5 },
      { freq: G, dur: 1.2 },
      { freq: A, dur: 0.9 },
      { freq: G, dur: 1.5 },
      { freq: F, dur: 0.6 },
      { freq: EhalfFlat, dur: 0.7 },
      { freq: D, dur: 2.2 },
    ];

    let currentT = ctx.currentTime + 0.05;
    melody.forEach(note => {
      if (note.freq > 0) {
        this.playVocalNote(ctx, destination, note.freq, currentT, note.dur, true);
      }
      currentT += note.dur;
    });

    const totalDurMs = (currentT - ctx.currentTime + 0.2) * 1000;
    const tId = window.setTimeout(() => {
      if (!isCancelled()) {
        onFinish();
      }
    }, totalDurMs);
    timeouts.push(tId);
  }

  private playMadinahMelody(
    ctx: AudioContext,
    destination: GainNode,
    onFinish: () => void,
    isCancelled: () => boolean,
    timeouts: number[]
  ) {
    // Soothing meditative Rast maqam melody
    const C = 261.63;
    const D = 293.66;
    const EhalfFlat = 315.0;
    const F = 349.23;
    const G = 392.00;
    const A = 440.00;

    const notes = [
      { freq: C, dur: 0.8 },
      { freq: D, dur: 0.7 },
      { freq: EhalfFlat, dur: 1.1 },
      { freq: F, dur: 0.8 },
      { freq: G, dur: 1.6 },
      { freq: F, dur: 0.6 },
      { freq: EhalfFlat, dur: 0.8 },
      { freq: D, dur: 1.2 },
      { freq: C, dur: 2.0 },
    ];

    let currentT = ctx.currentTime + 0.05;
    notes.forEach(note => {
      this.playVocalNote(ctx, destination, note.freq, currentT, note.dur, true);
      currentT += note.dur;
    });

    const totalDurMs = (currentT - ctx.currentTime + 0.2) * 1000;
    const tId = window.setTimeout(() => {
      if (!isCancelled()) {
        onFinish();
      }
    }, totalDurMs);
    timeouts.push(tId);
  }

  private playMakkahAdhan(
    ctx: AudioContext,
    destination: GainNode,
    onFinish: () => void,
    isCancelled: () => boolean,
    timeouts: number[]
  ) {
    // Makkah style resonant adhan chant
    const D = 293.66;
    const EhalfFlat = 316.0;
    const F = 349.23;
    const G = 392.00;
    const A = 440.00;
    const BFlat = 466.16;
    const HighC = 523.25;

    // Phrase 1: Al-la-hu Ak-bar (Grand rising call)
    // Phrase 2: Ash-hadu alla ilaha illallah
    const phrase = [
      { freq: D, dur: 0.6 },
      { freq: G, dur: 1.3 },
      { freq: A, dur: 1.0 },
      { freq: BFlat, dur: 0.9 },
      { freq: A, dur: 1.4 },
      { freq: G, dur: 1.8 },
      { freq: 0, dur: 0.4 },
      // Ash-hadu an la ilaha illallah
      { freq: F, dur: 0.6 },
      { freq: G, dur: 0.9 },
      { freq: A, dur: 1.2 },
      { freq: G, dur: 1.1 },
      { freq: F, dur: 0.7 },
      { freq: EhalfFlat, dur: 0.8 },
      { freq: D, dur: 2.4 },
    ];

    let currentT = ctx.currentTime + 0.05;
    phrase.forEach(note => {
      if (note.freq > 0) {
        this.playVocalNote(ctx, destination, note.freq, currentT, note.dur, true);
      }
      currentT += note.dur;
    });

    const totalDurMs = (currentT - ctx.currentTime + 0.2) * 1000;
    const tId = window.setTimeout(() => {
      if (!isCancelled()) {
        onFinish();
      }
    }, totalDurMs);
    timeouts.push(tId);
  }
}

export const audioService = new AudioService();
