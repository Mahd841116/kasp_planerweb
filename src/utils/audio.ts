/**
 * Web Audio API synthesizer for clean, zero-dependency feedback sounds & Ambient Focus Generator
 */

export type AmbientSoundType = 'none' | 'rain' | 'alpha432' | 'whitenoise' | 'cafe';

class SoundController {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  
  // Ambient Sound Nodes
  private ambientType: AmbientSoundType = 'none';
  private ambientSourceNode: AudioNode | null = null;
  private ambientGainNode: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  public ambientVolume: number = 0.3;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pleasant bell chime when a task or goal is completed
  public playCompleteSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: E5 (659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Harmony
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.6);
    } catch {
      // Audio not supported or blocked
    }
  }

  // Focus timer period finished bell (Singing bowl / gong style)
  public playTimerFinishedSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const freqs = [528, 1056, 1584];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const volume = 0.25 / (idx + 1);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch {
      // Fallback
    }
  }

  // Gentle Tick / Click for buttons
  public playClickSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      //
    }
  }

  // Part Reminder Alarm
  public playAlarmSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + (i * 0.25));

        gain.gain.setValueAtTime(0.12, now + (i * 0.25));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.25) + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (i * 0.25));
        osc.stop(now + (i * 0.25) + 0.15);
      }
    } catch {
      //
    }
  }

  // --- AMBIENT SOUND GENERATOR FOR FOCUS ---
  public startAmbient(type: AmbientSoundType) {
    this.stopAmbient();
    if (type === 'none') return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.ambientType = type;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.ambientVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.ambientGainNode = masterGain;

    if (type === 'alpha432') {
      // Binaural alpha wave: 432 Hz Left + 442 Hz Right (10 Hz Alpha state)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const oscWarmth = ctx.createOscillator();

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(432, ctx.currentTime);

      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(442, ctx.currentTime);

      oscWarmth.type = 'triangle';
      oscWarmth.frequency.setValueAtTime(216, ctx.currentTime); // sub octave

      const gainL = ctx.createGain();
      const gainR = ctx.createGain();
      const gainWarmth = ctx.createGain();

      gainL.gain.setValueAtTime(0.15, ctx.currentTime);
      gainR.gain.setValueAtTime(0.15, ctx.currentTime);
      gainWarmth.gain.setValueAtTime(0.05, ctx.currentTime);

      oscL.connect(gainL);
      gainL.connect(masterGain);

      oscR.connect(gainR);
      gainR.connect(masterGain);

      oscWarmth.connect(gainWarmth);
      gainWarmth.connect(masterGain);

      oscL.start();
      oscR.start();
      oscWarmth.start();

      this.ambientOscillators = [oscL, oscR, oscWarmth];
    } else if (type === 'rain' || type === 'whitenoise' || type === 'cafe') {
      // Generate procedural audio buffer noise
      const bufferSize = ctx.sampleRate * 2; // 2 seconds looped
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink / Brown filter for gentle rain pattern
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = (lastOut * 3.5) + (white * 0.05);
        } else if (type === 'cafe') {
          // Warm murmur rumble
          lastOut = (lastOut + 0.05 * white) / 1.05;
          data[i] = lastOut * 2.8;
        } else {
          // White noise soft
          data[i] = white * 0.3;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Lowpass Filter for soft pleasant ambient
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'whitenoise' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 800 : (type === 'cafe' ? 500 : 3000), ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();

      this.ambientSourceNode = noiseSource;
    }
  }

  public setAmbientVolume(val: number) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    this.ambientOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch {}
    });
    this.ambientOscillators = [];

    if (this.ambientSourceNode) {
      try {
        (this.ambientSourceNode as AudioBufferSourceNode).stop();
        this.ambientSourceNode.disconnect();
      } catch {}
      this.ambientSourceNode = null;
    }

    if (this.ambientGainNode) {
      try { this.ambientGainNode.disconnect(); } catch {}
      this.ambientGainNode = null;
    }

    this.ambientType = 'none';
  }

  public getActiveAmbient(): AmbientSoundType {
    return this.ambientType;
  }
}

export const soundManager = new SoundController();
