// Tarayıcıda Node.js global'leri: @ton/core (TON Connect) Buffer ve process bekler.
// Vite bunları paketlemediği için burada elle sağlıyoruz. main.tsx'te EN ÜSTTE import edilir.
import { Buffer } from 'buffer';

const g = globalThis as unknown as Record<string, unknown>;

if (typeof g.Buffer === 'undefined') g.Buffer = Buffer;
if (typeof g.global === 'undefined') g.global = globalThis;
if (typeof g.process === 'undefined') {
  g.process = {
    env: {},
    version: '',
    browser: true,
    nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) =>
      queueMicrotask(() => fn(...args)),
  };
}

export {};
