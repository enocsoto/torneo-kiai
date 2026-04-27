/**
 * Haptic and sound feedback (Web Audio). No external assets.
 * Honors prefers-reduced-motion: no buzz or audio when enabled.
 */

const CRITICAL_DMG_THRESHOLD = 52;

function reducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playTone(freq: number, durationMs: number, volume = 0.08): void {
  if (typeof window === "undefined" || reducedMotion()) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + durationMs / 1000,
    );
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
    window.setTimeout(() => void ctx.close(), durationMs + 80);
  } catch {
    /* no audio */
  }
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || reducedMotion()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* */
  }
}

/** Hit landed; `critical` when shown damage is above the threshold. */
export function feedbackHit(critical: boolean): void {
  if (critical) {
    playTone(520, 90, 0.1);
    playTone(380, 120, 0.08);
    vibrate([35, 40, 35]);
  } else {
    playTone(320, 65, 0.06);
    vibrate(18);
  }
}

export function feedbackKO(): void {
  playTone(440, 100, 0.09);
  window.setTimeout(() => playTone(220, 180, 0.1), 90);
  window.setTimeout(() => playTone(110, 260, 0.11), 220);
  vibrate([80, 50, 80, 50, 120]);
}

export function isCriticalDamage(amount: number): boolean {
  return amount >= CRITICAL_DMG_THRESHOLD;
}
