"use client";

/**
 * ScrollLearn audio system.
 *
 * SFX: generated on the fly with the Web Audio API — no asset files needed.
 * Music: per-subject background loops loaded from /public/music/<subject>.mp3.
 *        Drop in `math.mp3`, `english.mp3`, `science.mp3` and they'll
 *        cross-cut as the student scrolls between subjects. If a file is
 *        missing, music silently no-ops (SFX still work).
 */

const STORAGE_KEY = "sl-muted-v1";
const MUSIC_VOLUME = 0.22;

let _ctx: AudioContext | null = null;
let _muted = false;
let _music: HTMLAudioElement | null = null;
let _currentTrack: string | null = null;
const _listeners = new Set<(muted: boolean) => void>();

if (typeof window !== "undefined") {
  _muted = localStorage.getItem(STORAGE_KEY) === "true";
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
  }
  return _ctx;
}

export function isMuted(): boolean {
  return _muted;
}

export function setMuted(m: boolean): void {
  _muted = m;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, String(m));
  }
  if (_music) _music.muted = m;
  // Stop any in-progress narration when muting; re-fetching is fine.
  if (m) stopVoice();
  for (const cb of _listeners) cb(m);
}

export function toggleMute(): boolean {
  setMuted(!_muted);
  // If we just unmuted and have a track queued, try to start it.
  if (!_muted && _currentTrack) {
    playMusic(_currentTrack as MusicTrack);
  }
  return _muted;
}

export function subscribeMute(cb: (muted: boolean) => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

// ─── SFX ──────────────────────────────────────────────────────────

export type Sfx = "tap" | "correct" | "wrong" | "win";

export function playSfx(kind: Sfx): void {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  switch (kind) {
    case "tap":
      tone(ctx, 620, 0, 0.06, "sine", 0.10);
      break;
    case "correct":
      // Happy two-note chime: C5 → G5
      tone(ctx, 523.25, 0, 0.10, "triangle", 0.18);
      tone(ctx, 783.99, 0.07, 0.16, "triangle", 0.18);
      break;
    case "wrong":
      // Soft descending buzz — friendly, not punishing
      tone(ctx, 320, 0, 0.10, "sawtooth", 0.10);
      tone(ctx, 220, 0.08, 0.18, "sawtooth", 0.10);
      break;
    case "win":
      // Arpeggio: C E G C
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(ctx, f, i * 0.06, 0.14, "triangle", 0.16),
      );
      break;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  delay: number,
  duration: number,
  type: OscillatorType = "sine",
  peak = 0.16,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = type;
  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

// ─── Music ────────────────────────────────────────────────────────

export type MusicTrack = "math" | "english" | "science";

export function playMusic(track: MusicTrack): void {
  if (typeof window === "undefined") return;

  // Same track already playing — nothing to do.
  if (_currentTrack === track && _music && !_music.paused) return;

  // Different track: tear down the old one.
  if (_currentTrack !== track && _music) {
    _music.pause();
    _music = null;
  }
  _currentTrack = track;

  if (_muted) return;

  if (!_music) {
    const audio = new Audio(`/music/${track}.mp3`);
    audio.loop = true;
    audio.volume = MUSIC_VOLUME;
    audio.muted = _muted;
    audio.preload = "auto";
    _music = audio;
  }

  // Browsers block autoplay until a user gesture; silently no-op if rejected.
  // It'll succeed on the next call after any tap.
  _music.play().catch(() => {});
}

export function stopMusic(): void {
  if (_music) {
    _music.pause();
    _music = null;
  }
  _currentTrack = null;
}

// ─── Voice (ElevenLabs) ────────────────────────────────────────────

let _voice: HTMLAudioElement | null = null;
const _voiceCache = new Map<string, string>(); // text → blob URL
const _voiceFetching = new Map<string, Promise<string | null>>();

async function fetchVoiceUrl(text: string): Promise<string | null> {
  const cached = _voiceCache.get(text);
  if (cached) return cached;
  const inflight = _voiceFetching.get(text);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      _voiceCache.set(text, url);
      return url;
    } catch {
      return null;
    } finally {
      _voiceFetching.delete(text);
    }
  })();
  _voiceFetching.set(text, promise);
  return promise;
}

/** Speak `text` with the ElevenLabs teacher voice. Idempotent and cached. */
export async function playVoice(text: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (_muted) return;

  // Stop whatever's currently being spoken.
  stopVoice();

  const url = await fetchVoiceUrl(text);
  if (!url || _muted) return;

  const audio = new Audio(url);
  audio.volume = 0.95;
  _voice = audio;
  audio.play().catch(() => {});
}

export function stopVoice(): void {
  if (_voice) {
    _voice.pause();
    _voice.currentTime = 0;
    _voice = null;
  }
}
