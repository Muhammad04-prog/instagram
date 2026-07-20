/**
 * Synthesized ring tones for the call screen — RINGING (incoming) gets the
 * classic double-beep burst, CALLING (outgoing) gets a single ringback tone.
 * No audio asset: a real ringtone file would mean either a licensing problem
 * (Apple's own tone) or a random stock clip; generating it with the Web Audio
 * API needs neither.
 */

let ctx: AudioContext | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

function tone(audioCtx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  // Short fades so each beep doesn't click at its edges.
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0.18, startTime + duration - 0.03);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export type RingKind = "incoming" | "outgoing";

export function startRingtone(kind: RingKind): void {
  stopRingtone();

  const audioCtx = new AudioContext();
  ctx = audioCtx;

  const ringOnce = () => {
    const now = audioCtx.currentTime;
    if (kind === "incoming") {
      // Dual-tone burst, twice — a generic phone-ring pattern.
      tone(audioCtx, 480, now, 0.4);
      tone(audioCtx, 620, now, 0.4);
      tone(audioCtx, 480, now + 0.55, 0.4);
      tone(audioCtx, 620, now + 0.55, 0.4);
    } else {
      // Ringback: one longer, lower tone.
      tone(audioCtx, 425, now, 1.2);
    }
  };

  ringOnce();
  intervalId = setInterval(ringOnce, kind === "incoming" ? 2000 : 3000);
}

export function stopRingtone(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (ctx) {
    void ctx.close();
    ctx = null;
  }
}
