import type { Repl } from '@strudel/core';
import { evalScope, setTime } from '@strudel/core';
import { webaudioRepl } from '@strudel/webaudio';
import { initAudioOnFirstClick, registerSynthSounds, samples } from 'superdough';
import { registerSoundfonts } from '@strudel/soundfonts';
import { transpiler } from '@strudel/transpiler';
import { miniAllStrings } from '@strudel/mini';

export const DURATION_SECONDS = 60;

const CDN = "https://strudel.b-cdn.net";

let repl: Repl | null = null;
let initPromise: Promise<Repl> | null = null;

let wallClockStart = 0;
let offsetSeconds = 0;
let playing = false;

async function prebake(): Promise<void> {
  await evalScope(
    import('@strudel/core'),
    import('@strudel/mini'),
    import('@strudel/tonal'),
    import('@strudel/webaudio'),
    import('@strudel/soundfonts'),
    { evalScope, hush, evaluate } as Record<string, unknown>
  );
  await Promise.all([
    registerSynthSounds(),
    registerSoundfonts(),
    samples("github:tidalcycles/dirt-samples"),
    samples(`${CDN}/piano.json`, `${CDN}/piano/`, { prebake: true }),
    samples(`${CDN}/vcsl.json`, `${CDN}/VCSL/`, { prebake: true }),
    samples(`${CDN}/tidal-drum-machines.json`, `${CDN}/tidal-drum-machines/machines/`, {
      prebake: true,
      tag: "drum-machines",
    }),
  ]);
}

export async function initStrudel(): Promise<Repl> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    initAudioOnFirstClick();
    miniAllStrings();

    const r = webaudioRepl({ transpiler });
    repl = r;
    setTime(() => r.scheduler.now());

    await prebake();
    return r;
  })();

  return initPromise;
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
  if (!repl) {
    throw new Error(
      'evaluate: strudel not initialised — call initStrudel() first'
    );
  }
  wallClockStart = performance.now() / 1000;
  playing = true;
  await repl.evaluate(stripVisualWidgets(code), autoplay);

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
