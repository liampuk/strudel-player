declare module '@strudel/core' {
  export class Pattern {
    play(): Pattern;
  }

  export interface ReplState {
    schedulerError: Error | undefined;
    evalError: Error | undefined;
    code: string;
    activeCode: string;
    pattern: Pattern | undefined;
    miniLocations: unknown[];
    widgets: unknown[];
    pending: boolean;
    started: boolean;
    isDirty?: boolean;
    error?: Error;
  }

  export interface Scheduler {
    now(): number;
    start(): void;
    stop(): void;
    pause(): void;
    cps: number;
    started: boolean;
    lastBegin: number;
    lastEnd: number;
    num_ticks_since_cps_change: number;
    num_cycles_at_cps_change: number;
    seconds_at_cps_change: number;
    pattern: unknown;
    setPattern(pattern: Pattern, autoplay?: boolean): Promise<void>;
    clock: {
      start(): void;
      stop(): void;
      pause(): void;
      duration: number;
      getPhase(): number;
    };
    getTime(): number;
  }

  export interface Repl {
    scheduler: Scheduler;
    evaluate(
      code: string,
      autoplay?: boolean,
      hush?: boolean
    ): Promise<Pattern | undefined>;
    start(): void;
    stop(): void;
    pause(): void;
    toggle(): void;
    setCps(cps: number): Repl;
    setPattern(pattern: Pattern, autoplay?: boolean): Promise<Pattern>;
    setCode(code: string): void;
    state: ReplState;
  }

  export function evalScope(
    ...modules: (Promise<unknown> | Record<string, unknown>)[]
  ): Promise<unknown[]>;

  export function setTime(fn: () => number): void;
  export function evaluate(
    code: string,
    transpiler?: unknown
  ): Promise<{ pattern: Pattern; meta: unknown }>;
}

declare module '@strudel/webaudio' {
  import type { Repl } from '@strudel/core';

  export interface WebaudioReplOptions {
    audioContext?: AudioContext;
    transpiler?: unknown;
    [key: string]: unknown;
  }

  export function webaudioRepl(options?: WebaudioReplOptions): Repl;
  export function webaudioOutput(...args: unknown[]): unknown;
}

declare module 'superdough' {
  export function initAudioOnFirstClick(options?: unknown): Promise<void>;
  export function registerSynthSounds(): void;
  export function getAudioContext(): AudioContext;
  export function samples(
    sampleMap: string | Record<string, unknown>,
    baseUrl?: string,
    options?: Record<string, unknown>,
  ): Promise<void>;
}

declare module '@strudel/soundfonts' {
  export function registerSoundfonts(): void;
}

declare module '@strudel/mini' {
  export function miniAllStrings(): void;
}

declare module '@strudel/transpiler' {
  export const transpiler: unknown;
  export function evaluate(
    code: string
  ): Promise<{ pattern: unknown; meta: unknown }>;
}

declare module '@strudel/tonal' {}

declare module '*.strudel?raw' {
  const content: string;
  export default content;
}

interface AudioSession {
  type:
    | 'auto'
    | 'playback'
    | 'ambient'
    | 'transient'
    | 'transient-solo'
    | 'play-and-record';
}

interface Navigator {
  audioSession?: AudioSession;
}
