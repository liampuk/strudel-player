declare module "@strudel/core" {
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
    cps: number;
  }

  export interface Repl {
    scheduler: Scheduler;
    evaluate(
      code: string,
      autoplay?: boolean,
      hush?: boolean,
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
    transpiler?: unknown,
  ): Promise<{ pattern: Pattern; meta: unknown }>;
}

declare module "@strudel/webaudio" {
  import type { Repl } from "@strudel/core";

  export interface WebaudioReplOptions {
    audioContext?: AudioContext;
    transpiler?: unknown;
    [key: string]: unknown;
  }

  export function webaudioRepl(options?: WebaudioReplOptions): Repl;
  export function webaudioOutput(...args: unknown[]): unknown;
}

declare module "superdough" {
  export function initAudioOnFirstClick(options?: unknown): Promise<void>;
  export function registerSynthSounds(): void;
  export function getAudioContext(): AudioContext;
}

declare module "@strudel/mini" {
  export function miniAllStrings(): void;
}

declare module "@strudel/transpiler" {
  export const transpiler: unknown;
  export function evaluate(code: string): Promise<{ pattern: unknown; meta: unknown }>;
}

declare module "@strudel/tonal" {}
