// Telegram Mini App initData doğrulama — iki yol:
// 1) Klasik: hash = HMAC_SHA256(data-check-string, HMAC_SHA256(bot_token, "WebAppData"))
// 2) Bağımsız: Telegram'ın Ed25519 imzası (BOT_TOKEN yanlış/bozuksa bile doğrulayabilir;
//    sadece bot_id gerekir). Resmi kural:
//    https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
import crypto from 'crypto';

// Telegram'ın yayımladığı Ed25519 açık anahtarları (hex, 32 bayt ham).
export const TG_PUBLIC_KEYS_HEX = [
  'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d', // üretim
  '40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec', // test ortamı
];

// Coolify'da değerin başına/sonuna tırnak veya boşluk kaçarsa temizle.
export function normalizeToken(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
}

// "123456:AA..." → "123456" (yoksa null)
export function botIdOf(token) {
  const m = /^(\d+):/.exec(String(token || ''));
  return m ? m[1] : null;
}

const keyCache = new Map();
function ed25519Key(hex) {
  if (keyCache.has(hex)) return keyCache.get(hex);
  let key = null;
  try {
    // 32 bayt ham anahtar → SPKI DER → KeyObject
    const spki = Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      Buffer.from(hex, 'hex'),
    ]);
    key = crypto.createPublicKey({ key: spki, format: 'der', type: 'spki' });
  } catch {
    key = null; // geçersiz hex uzunluğu vb. — anahtar atlanır
  }
  keyCache.set(hex, key);
  return key;
}

// Alanları bir kez URL-decode edip (Telegram kuralı) alfabetik sırala.
// hash ve signature kontrol dizisine girmez.
function parse(initData) {
  const p = new URLSearchParams(initData);
  const fields = [...p.entries()]
    .filter(([k]) => k !== 'hash' && k !== 'signature')
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return { p, fields };
}

const checkString = (fields) => fields.map(([k, v]) => `${k}=${v}`).join('\n');

function staleReason(p) {
  const t = Number(p.get('auth_date'));
  if (!Number.isFinite(t) || t <= 0) return 'auth_date yok/bozuk';
  if (Date.now() / 1000 - t > 86400) return 'initData 24 saatten eski';
  return null;
}

function userOf(p) {
  try {
    return { user: JSON.parse(p.get('user') || '') };
  } catch {
    return { fail: 'initData user verisi bozuk' };
  }
}

// 1) Klasik yol: bot token'ı ile hash doğrulama
export function verifyHash(initData, token) {
  if (!initData) return { fail: 'initData bos (uygulama Telegram disinda mi acildi?)' };
  const { p, fields } = parse(initData);
  const hash = p.get('hash');
  if (!hash) return { fail: 'initData icinde hash yok' };
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(checkString(fields)).digest('hex');
  const ok =
    hash.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  if (!ok) return { fail: 'hash uyusmadi (BOT_TOKEN baska veya bozuk bir bota ait olabilir)' };
  const u = userOf(p);
  if (u.fail) return u;
  return { ok: true, method: 'hash', user: u.user };
}

// 2) Bağımsız yol: Telegram imzası. bot_id adayları verilir; Telegram'ın
//    açık anahtarlarıyla Ed25519 doğrulaması yapılır.
export function verifySignature(initData, botIds, keys = TG_PUBLIC_KEYS_HEX) {
  if (!initData) return { fail: 'initData bos' };
  const { p, fields } = parse(initData);
  const sigRaw = p.get('signature');
  if (!sigRaw) return { fail: 'initData icinde signature yok (eski Telegram surumu olabilir)' };
  let sig = null;
  try {
    const b = Buffer.from(sigRaw.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    if (b.length >= 64) sig = b.subarray(0, 64);
  } catch {
    sig = null;
  }
  if (!sig) return { fail: 'signature verisi bozuk' };
  const ids = [...new Set(botIds.filter(Boolean))];
  if (!ids.length) return { fail: 'imza dogrulamasi icin bot_id bilinmiyor (BOT_TOKEN yok)' };
  const body = Buffer.from(checkString(fields), 'utf8');
  for (const id of ids) {
    const cs = Buffer.concat([Buffer.from(`${id}:WebAppData\n`, 'utf8'), body]);
    for (const hex of keys) {
      const key = ed25519Key(hex);
      if (!key) continue;
      if (crypto.verify(null, cs, key, sig)) {
        const u = userOf(p);
        if (u.fail) return u;
        return { ok: true, method: 'signature', user: u.user };
      }
    }
  }
  return { fail: `imza dogrulanamadi (bot_id adaylari: ${ids.join(', ') || 'yok'})` };
}

// Ana giriş: önce hash (token varsa), olmazsa Telegram imzası.
export function verifyInitData(initData, token, keys) {
  if (!initData) return { fail: 'initData bos (uygulama Telegram disinda mi acildi?)' };
  const { p } = parse(initData);
  const stale = staleReason(p);
  if (stale) return { fail: stale };
  const reasons = [];
  if (token) {
    const h = verifyHash(initData, token);
    if (h.ok) return h;
    reasons.push(`hash: ${h.fail}`);
  } else {
    reasons.push('hash: sunucuda BOT_TOKEN tanimli degil');
  }
  if (p.get('signature')) {
    const s = verifySignature(initData, [botIdOf(token)], keys);
    if (s.ok) return s;
    reasons.push(`imza: ${s.fail}`);
  }
  return { fail: reasons.join(' | ') };
}
