import type { Repl } from "@strudel/core";
import { evalScope, setTime } from "@strudel/core";
import { webaudioRepl } from "@strudel/webaudio";
import { initAudioOnFirstClick, registerSynthSounds } from "superdough";
import { transpiler } from "@strudel/transpiler";
import { miniAllStrings } from "@strudel/mini";

let repl: Repl | null = null;
let initPromise: Promise<Repl> | null = null;

async function prebake(): Promise<void> {
  await evalScope(
    import("@strudel/core"),
    import("@strudel/mini"),
    import("@strudel/tonal"),
    import("@strudel/webaudio"),
    { evalScope, hush, evaluate } as Record<string, unknown>,
  );
  await registerSynthSounds();
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

export async function evaluate(
  code: string,
  autoplay = true,
): Promise<void> {
  if (!repl) {
    throw new Error("evaluate: strudel not initialised — call initStrudel() first");
  }
  await repl.evaluate(code, autoplay);
}

export function hush(): void {
  if (!repl) {
    throw new Error("hush: strudel not initialised — call initStrudel() first");
  }
  repl.stop();
}
