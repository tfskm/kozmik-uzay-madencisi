// Bağımsız auth testi: node server/auth.test.js  (better-sqlite3 gerekmez)
import crypto from 'crypto';
import assert from 'assert';
import {
  normalizeToken,
  botIdOf,
  verifyHash,
  verifySignature,
  verifyInitData,
  TG_PUBLIC_KEYS_HEX,
} from './auth.js';

let pass = 0;
let fail = 0;
const t = (name, fn) => {
  try {
    fn();
    pass++;
    console.log('  OK', name);
  } catch (e) {
    fail++;
    console.log('  HATA', name, '—', e.message);
  }
};

const TOKEN = '123456:AATestToken';
const USER = { id: 42, first_name: 'Ada', username: 'ada' };

// Telegram'ın ürettiği biçimde initData kurar (URL-kodlu alanlar + hash)
function build({ authDate = Math.floor(Date.now() / 1000), token = TOKEN, user = USER, extra = {} } = {}) {
  const parts = {
    auth_date: String(authDate),
    query_id: 'AAF',
    user: JSON.stringify(user),
    ...extra,
  };
  const str = Object.entries(parts)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(str).digest('hex');
  return new URLSearchParams(Object.entries(parts)).toString() + '&hash=' + hash;
}

// Kendi Ed25519 anahtar çiftimizle imzalar (Telegram'ın imza yolunu simüle eder)
function signData(parts, botId, privateKey) {
  const str =
    `${botId}:WebAppData\n` +
    Object.entries(parts)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
  return crypto.sign(null, Buffer.from(str, 'utf8'), privateKey).toString('base64url');
}

function makeSigned({ botId = '123456', authDate = Math.floor(Date.now() / 1000), user = USER } = {}) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const pubHex = publicKey.export({ format: 'der', type: 'spki' }).subarray(12).toString('hex');
  const parts = { auth_date: String(authDate), query_id: 'AAF', user: JSON.stringify(user) };
  const sig = signData(parts, botId, privateKey);
  // hash'i SAHTE üretiyoruz (yanlış token simülasyonu için bozuk olacak)
  const qs = new URLSearchParams(Object.entries(parts)).toString();
  return { data: `${qs}&signature=${sig}&hash=${'0'.repeat(64)}`, pubHex };
}

console.log('--- auth.test.js ---');

t('normalizeToken: tırnak ve boşluk temizler', () => {
  assert.strictEqual(normalizeToken(' 123456:AA\n'), '123456:AA');
  assert.strictEqual(normalizeToken('"123456:AA"'), '123456:AA');
  assert.strictEqual(normalizeToken("'  123456:AA  '"), '123456:AA');
  assert.strictEqual(normalizeToken(undefined), '');
});

t('botIdOf: token ön ekini bulur', () => {
  assert.strictEqual(botIdOf('123456:AA'), '123456');
  assert.strictEqual(botIdOf(''), null);
  assert.strictEqual(botIdOf('notatoken'), null);
});

t('verifyHash: geçerli initData kabul', () => {
  const v = verifyHash(build(), TOKEN);
  assert.ok(v.ok && v.method === 'hash');
  assert.strictEqual(v.user.id, 42);
});

t('verifyHash: hash değiştirilirse red', () => {
  const d = build();
  const v = verifyHash(d.replace(/hash=[0-9a-f]{64}/, 'hash=' + 'f'.repeat(64)), TOKEN);
  assert.ok(!v.ok && /hash uyusmadi/.test(v.fail));
});

t('verifyHash: yanlış token red', () => {
  const v = verifyHash(build(), '999999:Other');
  assert.ok(!v.ok);
});

t('verifyInitData: doğru token → hash yolu', () => {
  const v = verifyInitData(build(), TOKEN);
  assert.ok(v.ok && v.method === 'hash');
});

t('verifyInitData: 24 saatten eski initData red', () => {
  const v = verifyInitData(build({ authDate: Math.floor(Date.now() / 1000) - 90000 }), TOKEN);
  assert.ok(!v.ok && /eski/.test(v.fail));
});

t('verifyInitData: boş initData red', () => {
  const v = verifyInitData('', TOKEN);
  assert.ok(!v.ok && /initData bos/.test(v.fail));
});

t('imza yolu: doğru bot_id + Telegram formatı kabul (hash bozukken bile)', () => {
  const d = makeSigned({ botId: '123456' });
  const v = verifySignature(d.data, ['123456'], [d.pubHex]);
  assert.ok(v.ok && v.method === 'signature');
  assert.strictEqual(v.user.id, 42);
});

t('imza yolu: yanlış bot_id red', () => {
  const d = makeSigned({ botId: '123456' });
  const v = verifySignature(d.data, ['777777'], [d.pubHex]);
  assert.ok(!v.ok);
});

t('imza yolu: imza değiştirilirse red', () => {
  const d = makeSigned({ botId: '123456' });
  const v = verifySignature(
    d.data.replace(/signature=[A-Za-z0-9_-]+/, 'signature=' + 'A'.repeat(86)),
    ['123456'],
    [d.pubHex]
  );
  assert.ok(!v.ok);
});

t('verifyInitData: token bozuk ama öneki doğru → imza yolu kurtarır', () => {
  // token'ın gizli kısmı bozuk (hash patlar), ama bot_id 123456 doğru → imza geçer
  const d = makeSigned({ botId: '123456' });
  const v = verifyInitData(d.data, '123456:BROKEN', [d.pubHex]);
  assert.ok(v.ok && v.method === 'signature');
});

t('verifyInitData: token yoksa imza yolu da çalışamaz (açık sebep)', () => {
  const d = makeSigned({ botId: '123456' });
  const v = verifyInitData(d.data, '');
  assert.ok(!v.ok && /tanimli degil/.test(v.fail));
});

t('verifyInitData: hash ve imza geçerliyken hash tercih edilir', () => {
  // hash'i doğru token'la kur + geçerli imza ekle
  const { privateKey } = crypto.generateKeyPairSync('ed25519');
  const parts = { auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'AAF', user: JSON.stringify(USER) };
  const sig = signData(parts, '123456', privateKey);
  const qs = new URLSearchParams(Object.entries(parts)).toString();
  const str = Object.entries(parts)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(str).digest('hex');
  const v = verifyInitData(`${qs}&signature=${sig}&hash=${hash}`, TOKEN);
  assert.ok(v.ok && v.method === 'hash');
});

t('Telegram açık anahtarları 32 bayt çözülür', () => {
  assert.ok(TG_PUBLIC_KEYS_HEX.length >= 1);
  for (const hex of TG_PUBLIC_KEYS_HEX) assert.strictEqual(Buffer.from(hex, 'hex').length, 32);
});

console.log(`--- SONUÇ: ${pass} geçti, ${fail} hata ---`);
process.exit(fail ? 1 : 0);
