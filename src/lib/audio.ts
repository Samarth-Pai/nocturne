// src/lib/audio.ts

// Maintain a single audio context for the application
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (browser auto-play policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a soft, short, ascending chime for correct answers.
 */
export function playSuccessSound() {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  
  // Quick frequency sweep (C5 to E5 roughly)
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);

  // Quick Attack, gentle decay
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Soft peak volume
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  osc.start(now);
  osc.stop(now + 0.5);
}

/**
 * Plays a subdued, low-pitched thud for incorrect answers.
 */
export function playErrorSound() {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  
  // Low pitch (A3) dropping slightly
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

  // Very short decay
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Plays a fast, energetic melodic arpeggio for leveling up.
 */
export function playLevelUpSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Notes: C4, E4, G4, C5
  const notes = [261.63, 329.63, 392.00, 523.25];
  
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = now + index * 0.1; // Play each note 100ms apart
    
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}
