"use client";

import { useCallback, useRef } from "react";

export function useGameSounds() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClick = useCallback(() => {
    try {
      const ctx = initAudio();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      // Quick high pitched pop
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio play failed, likely due to lack of user interaction", e);
    }
  }, []);

  const playLevelUp = useCallback(() => {
    try {
      const ctx = initAudio();
      
      // Play a quick arpeggio (C major chord: C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const duration = 0.15;
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * duration);
        
        // Gentle attack and release
        gainNode.gain.setValueAtTime(0, ctx.currentTime + index * duration);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * duration + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * duration + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime + index * duration);
        osc.stop(ctx.currentTime + index * duration + duration);
      });
      
    } catch (e) {
      console.warn("Audio play failed, likely due to lack of user interaction", e);
    }
  }, []);

  return { playClick, playLevelUp };
}
