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

// Minimal BOC: TON transferine "UID:<id>" yorumu ekler (sunucu ödemeyi bu yorumla eşleştirir)
export function commentPayload(text: string): string {
  const d = new TextEncoder().encode(text);
  const data = new Uint8Array([0, 0, 0, 0, ...d]);
  const cell = new Uint8Array([0, data.length * 2, ...data]);
  const boc = new Uint8Array([0xb5, 0xee, 0x9c, 0x72, 0x01, 0x01, 0x01, 0x01, 0x00, cell.length, 0x00, ...cell]);
  return btoa(String.fromCharCode(...boc));
}
