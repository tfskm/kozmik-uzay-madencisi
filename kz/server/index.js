import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const { BOT_TOKEN, TREASURY_ADDRESS, TONCENTER_URL = 'https://toncenter.com', TONCENTER_KEY,
  STARDUST_PER_TON = '2000', MIN_TON = '0.5', DEV, PORT = 3000 } = process.env;
if (!TREASURY_ADDRESS) console.warn('UYARI: TREASURY_ADDRESS yok, ödemeler alınamaz');

const db = new Database(process.env.DB_PATH || 'game.db');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, pending REAL DEFAULT 0, points REAL DEFAULT 0, score_ts INTEGER DEFAULT 0, hour_pts REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS deposits(hash TEXT PRIMARY KEY, user_id INTEGER, nano TEXT, stardust REAL, ts INTEGER);`);

// ---- Telegram initData doğrulama ----
function verify(initData) {
  if (!initData || !BOT_TOKEN) return null;
  const p = new URLSearchParams(initData); const hash = p.get('hash'); p.delete('hash');
  const str = [...p.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const ok = crypto.createHmac('sha256', key).update(str).digest('hex') === hash;
  if (!ok || Date.now() / 1000 - Number(p.get('auth_date')) > 86400) return null;
  return JSON.parse(p.get('user'));
}
const auth = (req, res, next) => {
  const h = req.headers['x-init-data'];
  const u = DEV === '1' && !h ? { id: 1, first_name: 'dev' } : verify(h);
  if (!u) return res.status(401).json({ error: 'auth' });
  db.prepare('INSERT OR IGNORE INTO users(id,name) VALUES(?,?)').run(u.id, u.username || u.first_name || '');
  req.uid = u.id; next();
};

// ---- TON ödeme tarayıcı: yorumu "UID:<id>" olan gelen transferleri Stardust'a çevirir ----
const credit = db.transaction((hash, uid, nano, sd) => {
  if (db.prepare('INSERT OR IGNORE INTO deposits VALUES(?,?,?,?,?)').run(hash, uid, nano, sd, Date.now()).changes)
    db.prepare('UPDATE users SET pending=pending+? WHERE id=?').run(sd, uid);
});
async function poll() {
  try {
    const r = await fetch(`${TONCENTER_URL}/api/v2/getTransactions?address=${TREASURY_ADDRESS}&limit=50&archival=true`,
      { headers: TONCENTER_KEY ? { 'X-API-Key': TONCENTER_KEY } : {} });
    const j = await r.json(); if (!j.ok) return;
    for (const tx of j.result) {
      const m = tx.in_msg; if (!m?.source || !m.value) continue;
      const mt = /^UID:(\d+)$/.exec((m.message || '').trim()); if (!mt) continue;
      const uid = Number(mt[1]); if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(uid)) continue;
      const ton = Number(m.value) / 1e9; if (ton < Number(MIN_TON)) continue;
      credit(tx.transaction_id.hash, uid, m.value, ton * Number(STARDUST_PER_TON));
    }
  } catch (e) { console.error('poll', e.message); }
}
if (TREASURY_ADDRESS) setInterval(poll, 8000);

// ---- Oyun motoru (sunucu-otoriter, test parası KRD) ----
import { MARKET } from './shop.js';
import { newPlayer, act as gameAct, accrue, pendingTotal, TIERS, PLANET_UNLOCK, CATALOG, buyCost, upCost, drillCost, DAY } from './economy.js';
db.exec('CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY, state TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS market_stock(id TEXT PRIMARY KEY, stock INTEGER)');
for (const [k, v] of Object.entries(MARKET)) db.prepare('INSERT OR IGNORE INTO market_stock VALUES(?,?)').run(k, v.stock);
const stockMap = () => Object.fromEntries(db.prepare('SELECT id,stock FROM market_stock').all().map(r => [r.id, r.stock]));
const ctx = { takeStock: id => db.prepare('UPDATE market_stock SET stock=stock-1 WHERE id=? AND stock>0').run(id).changes === 1 };
// TON ile satın alınan (zincirde onaylanmış) Yıldız Tozu oyuncu durumuna aktarılır
const absorb = (id, p) => db.transaction(() => { const { pending } = db.prepare('SELECT pending FROM users WHERE id=?').get(id) || { pending: 0 };
  if (pending > 0) { db.prepare('UPDATE users SET pending=0 WHERE id=?').run(id); p.stardust += pending; } return pending; })();
const loadP = id => { const r = db.prepare('SELECT state FROM players WHERE id=?').get(id); return r ? JSON.parse(r.state) : newPlayer(); };
const saveP = (id, p) => db.prepare('INSERT INTO players(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(id, JSON.stringify(p));
// ---- API ----
const app = express(); app.use(express.json());
app.get('/api/config', auth, (req, res) => res.json({ treasury: TREASURY_ADDRESS, uid: String(req.uid), perTon: Number(STARDUST_PER_TON) }));
// Bekleyen (onaylanmış) Stardust'ı atomik olarak teslim eder; iki kez verilmez.
app.post('/api/claim-stardust', auth, (req, res) => { const p = loadP(req.uid); const c = absorb(req.uid, p); if (c > 0) saveP(req.uid, p); res.json({ credited: c }); });
// Skor: tek seferde en fazla 500, saatte en fazla 5000 puan (kaba hile sınırı)
app.post('/api/score', auth, (req, res) => {
  const add = Math.max(0, Math.min(500, Number(req.body.points) || 0)), now = Date.now();
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.uid);
  const hour = now - u.score_ts > 3600e3 ? 0 : u.hour_pts;
  const ok = Math.min(add, Math.max(0, 5000 - hour));
  db.prepare('UPDATE users SET points=points+?, hour_pts=?, score_ts=? WHERE id=?').run(ok, hour + ok, hour ? u.score_ts : now, req.uid);
  res.json({ added: ok });
});
app.get('/api/leaderboard', auth, (req, res) =>
  res.json(db.prepare('SELECT name, points FROM users ORDER BY points DESC LIMIT 50').all()));

const gview = p => ({ ...p, pending: pendingTotal(p), now: Date.now(), stock: stockMap(), last: p.last_result || null, canDaily: Date.now() - p.lastDaily >= DAY * 0.9,
  prices: Object.fromEntries(Object.keys(CATALOG).map(k => [k, buyCost(p, { pkgId: k })])), upCost: upCost(p.up || 0), drillCost: drillCost(p.drill || 0),
  meta: { catalog: CATALOG, tiers: TIERS, planetUnlock: PLANET_UNLOCK } });
app.get('/api/game', auth, (req, res) => { const p = accrue(loadP(req.uid)); absorb(req.uid, p); saveP(req.uid, p); res.json(gview(p)); });
app.post('/api/game/act', auth, (req, res) => { const p = loadP(req.uid); absorb(req.uid, p); p.last_result = null; const err = gameAct(p, req.body || {}, Date.now(), ctx); saveP(req.uid, p); res.json({ ...gview(p), error: err }); });

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(dist));
app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(PORT, () => console.log('Sunucu', PORT));
