/**
 * Synthesized audio notifications using Web Audio API.
 * 100% reliable, zero external MP3 network dependencies.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play a soft pleasant pop when adding item to cart
  playAddToCart() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Notification chime (double ping)
  playNotification() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { freq: 659.25, time: now }, // E5
        { freq: 880, time: now + 0.1 }, // A5
      ].forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, note.time);
        gain.gain.setValueAtTime(0.25, note.time);
        gain.gain.exponentialRampToValueAtTime(0.001, note.time + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(note.time);
        osc.stop(note.time + 0.35);
      });
    } catch {
      // Fallback
    }
  }

  // Order placed / payment success fanfare
  playSuccessFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 523.25, delay: 0 }, // C5
        { freq: 659.25, delay: 0.12 }, // E5
        { freq: 783.99, delay: 0.24 }, // G5
        { freq: 1046.5, delay: 0.38 }, // C6
      ];
      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.delay);
        gain.gain.setValueAtTime(0.22, now + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + n.delay);
        osc.stop(now + n.delay + 0.3);
      });
    } catch {
      // Fallback
    }
  }
}

export const sounds = new SoundEffectsService();
