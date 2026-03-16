import type { Repl } from '@strudel/core';
import { evalScope, Pattern, setTime } from '@strudel/core';
import { webaudioRepl } from '@strudel/webaudio';
import {
  getAudioContext,
  initAudioOnFirstClick,
  loadWorklets,
  registerSynthSounds,
  samples,
} from 'superdough';
import { registerSoundfonts } from '@strudel/soundfonts';
import { transpiler } from '@strudel/transpiler';
import { miniAllStrings } from '@strudel/mini';

// AudioWorkletNode is unavailable in non-secure contexts (HTTP, not localhost).
// superdough uses `instanceof AudioWorkletNode` in its node-pool and cleanup code
// for ALL audio nodes, so an undefined constructor causes ReferenceErrors even for
// sample playback. Shimming a dummy class lets those checks return false safely.
if (typeof AudioWorkletNode === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).AudioWorkletNode = class AudioWorkletNode {};
}

export const DURATION_SECONDS = 60;

const CDN = 'https://strudel.b-cdn.net';

let repl: Repl | null = null;
let initPromise: Promise<Repl> | null = null;

let wallClockStart = 0;
let offsetSeconds = 0;
let playing = false;

let iosUnmuteDone = false;

/**
 * Add REPL-only methods as no-ops. These configure editor/punchcard display
 * (fontFamily, theme, color) which we don't have — they just return this for chaining.
 */
function patchReplOnlyMethods(): void {
  const proto = Pattern.prototype as unknown as Record<string, unknown>;
  const noop = function (this: unknown) {
    return this;
  };
  if (!proto.fontFamily) proto.fontFamily = noop;
  if (!proto.theme) proto.theme = noop;
  if (!proto.color) proto.color = noop;
}

/**
 * Unblock Web Audio on iOS when the mute switch is on.
 * - iOS 17+: use navigator.audioSession.type = "playback" (proper fix)
 * - Older iOS: fallback to silent HTML5 audio trick
 * Must run on user gesture (e.g. when Play is tapped).
 */
function unmuteIosAudioOnce(): void {
  if (iosUnmuteDone || typeof navigator === 'undefined') return;
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIos) return;

  iosUnmuteDone = true;

  if (
    'audioSession' in navigator &&
    navigator.audioSession?.type !== undefined
  ) {
    navigator.audioSession.type = 'playback';
    return;
  }

  if (typeof document === 'undefined') return;
  const silentWav =
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  const audio = document.createElement('audio');
  audio.setAttribute('x-webkit-airplay', 'deny');
  audio.preload = 'auto';
  audio.loop = true;
  audio.src = silentWav;
  void audio.play().catch(() => {});
}

/**
 * No-op for slider(): returns the default value. The transpiler rewrites
 * slider(value, min?, max?) to sliderWithID(id, value, min?, max?) — we need
 * sliderWithID in the eval scope but have no UI, so we just return the value.
 */
function sliderWithID(_id: string, value: number): number {
  return value;
}

async function prebake(): Promise<void> {
  await evalScope(
    import('@strudel/core'),
    import('@strudel/mini'),
    import('@strudel/tonal'),
    import('@strudel/webaudio'),
    import('@strudel/soundfonts'),
    { evalScope, hush, evaluate, sliderWithID } as Record<string, unknown>
  );
  await Promise.all([
    registerSynthSounds(),
    registerSoundfonts(),
    samples('github:tidalcycles/dirt-samples'),
    samples(`${CDN}/piano.json`, `${CDN}/piano/`, { prebake: true }),
    samples(`${CDN}/vcsl.json`, `${CDN}/VCSL/`, { prebake: true }),
    samples(
      `${CDN}/tidal-drum-machines.json`,
      `${CDN}/tidal-drum-machines/machines/`,
      {
        prebake: true,
        tag: 'drum-machines',
      }
    ),
  ]);
}

export async function initStrudel(): Promise<Repl> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    initAudioOnFirstClick();
    miniAllStrings();
    patchReplOnlyMethods();

    const r = webaudioRepl({ transpiler });
    repl = r;
    setTime(() => r.scheduler.now());

    await prebake();
    return r;
  })();

  return initPromise;
}

/**
 * When AudioWorkletNode is unavailable (older iOS Safari, some in-app WebViews),
 * replace worklet-based synth names with the closest built-in oscillator type.
 *   supersaw → sawtooth  (single saw instead of detuned unison, but audible)
 *   pulse    → square    (fixed 50% duty cycle, loses pw modulation)
 */
function fallbackWorkletSynths(code: string): string {
  if (typeof AudioWorkletNode !== 'undefined') return code;
  return code
    .replace(/\bsupersaw\b/g, 'sawtooth')
    .replace(/\bpulse\b/g, 'square');
}

/**
 * Strip `._widgetName(...)` calls from strudel code.
 * These are visual editor widgets (pianoroll, scope, pitchwheel, etc.)
 * that only exist in the strudel REPL UI — not in the audio packages.
 */
function stripVisualWidgets(code: string): string {
  let result = '';
  let i = 0;

  while (i < code.length) {
    if (code[i] === '.' && code[i + 1] === '_') {
      let j = i + 2;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      if (j > i + 2) {
        let k = j;
        while (k < code.length && /\s/.test(code[k])) k++;
        if (code[k] === '(') {
          let depth = 1;
          let m = k + 1;
          while (m < code.length && depth > 0) {
            const ch = code[m];
            if (ch === '"' || ch === "'" || ch === '`') {
              m++;
              while (m < code.length && code[m] !== ch) {
                if (code[m] === '\\') m++;
                m++;
              }
            } else if (ch === '(') {
              depth++;
            } else if (ch === ')') {
              depth--;
            }
            m++;
          }
          i = m;
          continue;
        }
      }
    }
    result += code[i];
    i++;
  }

  return result;
}

export async function evaluate(code: string, autoplay = true): Promise<void> {
  unmuteIosAudioOnce();
  if (!repl) {
    throw new Error(
      'evaluate: strudel not initialised — call initStrudel() first'
    );
  }
  await initAudioOnFirstClick();

  // superdough's initAudio() has an operator-precedence bug where
  // audioCtx.resume() is never called ((!ctx) instanceof ... is always false).
  // On iOS the context stays suspended and audioWorklet.addModule() silently
  // fails, so AudioWorklet synths (supersaw, pulse) produce no sound.
  // Explicitly resume + reload worklets here to work around it.
  const ac = getAudioContext();
  if (ac.state === 'suspended') {
    await ac.resume();
  }
  if (ac.audioWorklet) {
    try {
      await loadWorklets();
    } catch {
      // Worklet loading can fail (e.g. unsupported WebView); non-worklet sounds still work.
    }
  }
  // Reset position only when at end (song finished); keep it when resuming from pause
  if (offsetSeconds >= DURATION_SECONDS) {
    offsetSeconds = 0;
  }
  wallClockStart = performance.now() / 1000;
  playing = true;
  await repl.evaluate(fallbackWorkletSynths(stripVisualWidgets(code)), autoplay);
  if (offsetSeconds > 0) {
    seekTo(offsetSeconds);
  }
}

export function hush(): void {
  if (!repl) return;
  playing = false;
  repl.stop();
}

export function isPlaying(): boolean {
  return playing;
}

export function getElapsedSeconds(): number {
  if (!playing) return offsetSeconds;
  const elapsed = performance.now() / 1000 - wallClockStart + offsetSeconds;
  return Math.min(elapsed, DURATION_SECONDS);
}

export function seekTo(seconds: number): void {
  if (!repl) return;
  const clamped = Math.max(0, Math.min(seconds, DURATION_SECONDS));

  const wasPlaying = playing;
  const { scheduler } = repl;

  if (wasPlaying) {
    scheduler.clock.pause();
    scheduler.started = false;
  }

  const targetCycle = clamped * scheduler.cps;
  scheduler.lastEnd = targetCycle;
  scheduler.lastBegin = targetCycle;

  offsetSeconds = clamped;
  wallClockStart = performance.now() / 1000;

  if (wasPlaying) {
    scheduler.num_ticks_since_cps_change = 0;
    scheduler.num_cycles_at_cps_change = 0;
    scheduler.clock.start();
    scheduler.started = true;
  }
}

export function checkDurationLimit(): boolean {
  if (playing && getElapsedSeconds() >= DURATION_SECONDS) {
    hush();
    offsetSeconds = DURATION_SECONDS;
    return true;
  }
  return false;
}
