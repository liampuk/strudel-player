// strudelEngine.ts

import { repl } from '@strudel/core';
import { webaudioOutput } from '@strudel/webaudio';

export async function createStrudel() {
  const r = repl({
    defaultOutput: webaudioOutput,
  });

  await r.init();

  return r;
}
