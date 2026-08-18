/**
 * Procedural Alpine Soundscape Synthesizer
 * Uses Web Audio API to create calming mountain wind, stepping cadence, and summit chimes.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.windGain = null;
    this.windFilter = null;
    this.isPlaying = false;
    this.stepTimer = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.setupWindAmbience();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  setupWindAmbience() {
    if (!this.ctx) return;

    // Pink/Brown noise generator for realistic alpine wind
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter modulating wind frequency
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.value = 320;
    this.windFilter.Q.value = 2.5;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;

    whiteNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    whiteNoise.start();

    // Gentle LFO modulating wind swell
    this.startWindModulation();
  }

  startWindModulation() {
    if (!this.ctx || !this.windFilter) return;
    setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const targetFreq = 260 + Math.sin(now * 0.4) * 140 + Math.cos(now * 0.15) * 80;
      this.windFilter.frequency.setTargetAtTime(targetFreq, now, 1.2);
    }, 1500);
  }

  toggleSound() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.windGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.windGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.15, now, 0.4);
    }
    return !this.isMuted;
  }

  setAltitudeWindScale(normalizedAltitude) {
    if (this.isMuted || !this.windFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Higher elevation -> sharper, more whistling wind
    const freq = 220 + normalizedAltitude * 400;
    this.windFilter.frequency.setTargetAtTime(freq, now, 0.5);
  }

  playStepSound() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Subtle crunch / gravel contact tone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(90 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

      filter.type = "bandpass";
      filter.frequency.value = 800 + Math.random() * 300;

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      // Audio step fallback
    }
  }

  playSummitChime() {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = now + idx * 0.12;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.7);
      });
    } catch (e) {
      // Chime fallback
    }
  }
}

export const audioEngine = new AudioEngine();
