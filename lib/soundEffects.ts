// Web Audio API Synthesizer for notifications and ambient focus noise
// Completely zero external dependencies, 100% offline & instant

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseGain: GainNode | null = null;
  private isPlayingAmbient = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pleasant notification bell/chime
  playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // E5 (659.25Hz) and B5 (987.77Hz) harmonious chord
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(987.77, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Click / tick sound for button or second
  playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // ignore
    }
  }

  // Play ambient focus sound: 'rain', 'whitenoise', 'waves'
  startAmbient(type: 'rain' | 'whitenoise' | 'binaural', volume = 0.2) {
    this.stopAmbient();
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'rain' || type === 'whitenoise') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Brown / Pink filtered noise for rain sound
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else {
            // Soft white noise
            data[i] = white * 0.15;
          }
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 800 : 1000;

        const gain = this.ctx.createGain();
        gain.gain.value = volume;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        this.noiseNode = noise;
        this.noiseGain = gain;
        this.isPlayingAmbient = true;
      } else if (type === 'binaural') {
        // Binaural focus beats (432Hz deep focus alpha wave)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const merger = this.ctx.createChannelMerger(2);
        const gain = this.ctx.createGain();

        osc1.frequency.value = 216; // Left
        osc2.frequency.value = 224; // Right (8Hz Alpha beat)

        gain.gain.value = volume * 0.4;

        osc1.connect(merger, 0, 0);
        osc2.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();

        this.noiseNode = osc1; // primary reference
        this.noiseGain = gain;
        this.isPlayingAmbient = true;
      }
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  }

  stopAmbient() {
    try {
      if (this.noiseNode) {
        if ('stop' in this.noiseNode && typeof this.noiseNode.stop === 'function') {
          this.noiseNode.stop();
        }
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      this.isPlayingAmbient = false;
    } catch (e) {
      // ignore
    }
  }

  setAmbientVolume(volume: number) {
    if (this.noiseGain && this.ctx) {
      this.noiseGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  get isPlaying() {
    return this.isPlayingAmbient;
  }
}

export const soundFx = new SoundSynthesizer();
