import { beginCell } from '@ton/core';

type TG = { Telegram?: { WebApp?: { initData?: string } } };
const initData = () => (window as unknown as TG).Telegram?.WebApp?.initData || '';

export async function api<T = any>(path: string, body?: unknown): Promise<T> {
  const r = await fetch('/api/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Init-Data': initData() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) throw new Error('api ' + r.status);
  return r.json();
}

// TON transferine "UID:<telegramId>" yorumu ekler. Sunucu ödemeyi bu yorumla eşleştirir.
export function commentPayload(text: string): string {
  return beginCell().storeUint(0, 32).storeStringTail(text).endCell().toBoc().toString('base64');
}
