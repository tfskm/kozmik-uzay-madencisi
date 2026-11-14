import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import {
  CATALOG,
  CFG,
  DAY,
  applyCatalog,
  applyConfig,
  newPlayer,
  act as gameAct,
  accrue,
  pendingTotal,
  TIERS,
  buyCost,
  upCost,
  drillCost,
  levelOf,
  expForLevel,
  pushHist,
  maxMiners,
} from './economy.js';
import { MARKET } from './shop.js';

const {
  BOT_TOKEN,
  TREASURY_ADDRESS,
  TONCENTER_URL = 'https://toncenter.com',
  TONCENTER_KEY,
  DEV,
  PORT = 3000,
  ADMIN_IDS = '',
} = process.env;

const ADMIN_LIST = ADMIN_IDS.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
const ALLOW_ALL_ADMINS = ADMIN_IDS.trim() === '*';
const isAdmin = (uid) => DEV === '1' || ALLOW_ALL_ADMINS || ADMIN_LIST.includes(Number(uid));

if (!TREASURY_ADDRESS) console.warn('UYARI: TREASURY_ADDRESS yok, TON ödemeleri alınamaz.');
console.log(`BOT_TOKEN: ${BOT_TOKEN ? 'tanımlı ✓' : 'YOK ✗ — Telegram doğrulaması çalışmaz!'}`);
console.log(`ADMIN_IDS: ${ALLOW_ALL_ADMINS ? '*' : ADMIN_LIST.length ? `${ADMIN_LIST.length} yönetici ✓` : 'boş'}`);

const db = new Database(process.env.DB_PATH || 'game.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  name TEXT,
  pending REAL DEFAULT 0,
  points REAL DEFAULT 0,
  score_ts INTEGER DEFAULT 0,
  hour_pts REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS deposits(hash TEXT PRIMARY KEY, user_id INTEGER, nano TEXT, stardust REAL, ts INTEGER);
CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY, state TEXT);
CREATE TABLE IF NOT EXISTS market_stock(id TEXT PRIMARY KEY, stock INTEGER);
CREATE TABLE IF NOT EXISTS config(key TEXT PRIMARY KEY, value TEXT);
`);

// Eski veritabanlarına yeni kolonları güvenli şekilde ekle.
const addColumn = (sql) => { try { db.exec(sql); } catch { /* kolon zaten var */ } };
addColumn('ALTER TABLE users ADD COLUMN wallet TEXT');
addColumn('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0');
addColumn('ALTER TABLE users ADD COLUMN created INTEGER');

// ---- Telegram initData doğrulama ----
// Başarısız olunca sebep loglanır (token gizli tutulur): Coolify loglarında [auth] ile görünür.
function verify(initData) {
  if (!BOT_TOKEN) return { fail: 'sunucuda BOT_TOKEN tanımlı degil' };
  if (!initData) return { fail: 'initData bos (uygulama Telegram disinda mi acildi?)' };
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  p.delete('hash');
  const str = [...p.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const ok = crypto.createHmac('sha256', key).update(str).digest('hex') === hash;
  if (!ok) return { fail: 'hash uyusmadi (BOT_TOKEN baska bir bota ait olabilir)' };
  if (Date.now() / 1000 - Number(p.get('auth_date')) > 86400) return { fail: 'initData 24 saatten eski' };
  try { return { user: JSON.parse(p.get('user')) }; } catch { return { fail: 'initData user verisi bozuk' }; }
}

const auth = (req, res, next) => {
  const h = req.headers['x-init-data'];
  let u;
  if (DEV === '1' && !h) {
    u = { id: 1, first_name: 'dev' };
  } else {
    const v = verify(h);
    if (v.fail) {
      console.warn(`[auth] reddedildi: ${v.fail}`);
      return res.status(401).json({ error: 'auth' });
    }
    u = v.user;
  }
  db.prepare('INSERT OR IGNORE INTO users(id,name,created) VALUES(?,?,?)').run(
    u.id,
    u.username || u.first_name || '',
    Date.now()
  );
  req.uid = u.id;
  next();
};

const adminOnly = (req, res, next) => {
  if (!isAdmin(req.uid)) return res.status(403).json({ error: 'admin' });
  next();
};

// ---- Yapılandırma (admin panelinden yönetilir) ----
const CONFIG_DEFAULTS = {
  announcementText:
    '🚀 Kozmik Yolculuk yayında! TON ile KRD yükle, madenci filonu kur, gezegenleri keşfet.',
  showAnnouncement: true,
  maintenanceMode: false,
  telegramChannelUrl: 'https://t.me/CosmicMinerOfficial',
  telegramSupportUrl: 'https://t.me/CosmicMinerSupport',
  krdPerTon: 20,
  minTon: 0.5,
  repairCostPerPct: 0.0008,
  stRepairCostPerPct: 0.05,
  wheelCost: 100,
  dailyStardust: 50,
  stPerKrd: 500,
  planetUnlock: [0, 30, 100, 250, 600, 1500],
  planetMult: [1, 1.1, 1.25, 1.45, 1.7, 2.0],
  requiredLevel: [1, 2, 4, 7, 11, 16],
  dailyFaucet: [2, 2, 3, 3, 4, 4, 6],
  catalog: {},
};

const loadConfig = () => {
  try {
    const row = db.prepare("SELECT value FROM config WHERE key='main'").get();
    return row ? JSON.parse(row.value) : {};
  } catch { return {}; }
};
const saveConfig = (c) =>
  db.prepare("INSERT INTO config(key,value) VALUES('main',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(c));

let CONFIG = { ...CONFIG_DEFAULTS, ...loadConfig() };
if (!CONFIG.catalog || typeof CONFIG.catalog !== 'object') CONFIG.catalog = {};
applyConfig(CONFIG);
applyCatalog(CONFIG.catalog);

const publicSettings = () => ({
  announcementText: CONFIG.announcementText,
  showAnnouncement: !!CONFIG.showAnnouncement,
  maintenanceMode: !!CONFIG.maintenanceMode,
  telegramChannelUrl: CONFIG.telegramChannelUrl,
  telegramSupportUrl: CONFIG.telegramSupportUrl,
  krdPerTon: CFG.krdPerTon,
  minTon: CFG.minTon,
  wheelCost: CFG.wheelCost,
  repairCostPerPct: CFG.repairCostPerPct,
  stRepairCostPerPct: CFG.stRepairCostPerPct,
  stPerKrd: CFG.stPerKrd,
  dailyStardust: CFG.dailyStardust,
});

// ---- TON ödeme tarayıcı: yorumu "UID:<id>" olan transferleri KRD'ye çevirir ----
const credit = db.transaction((hash, uid, nano, krd) => {
  const inserted = db
    .prepare('INSERT OR IGNORE INTO deposits VALUES(?,?,?,?,?)')
    .run(hash, uid, nano, krd, Date.now()).changes;
  if (inserted) db.prepare('UPDATE users SET pending=pending+? WHERE id=?').run(krd, uid);
});

async function poll() {
  try {
    const r = await fetch(
      `${TONCENTER_URL}/api/v2/getTransactions?address=${TREASURY_ADDRESS}&limit=50&archival=true`,
      { headers: TONCENTER_KEY ? { 'X-API-Key': TONCENTER_KEY } : {} }
    );
    const j = await r.json();
    if (!j.ok) return;
    for (const tx of j.result || []) {
      const m = tx.in_msg;
      if (!m?.source || !m.value) continue;
      const mt = /^UID:(\d+)$/.exec((m.message || '').trim());
      if (!mt) continue;
      const uid = Number(mt[1]);
      if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(uid)) continue;
      const ton = Number(m.value) / 1e9;
      if (ton < Number(CFG.minTon)) continue;
      credit(tx.transaction_id.hash, uid, m.value, ton * Number(CFG.krdPerTon));
    }
  } catch (e) {
    console.error('poll', e.message);
  }
}
if (TREASURY_ADDRESS) setInterval(poll, 8000);

// ---- Oyuncu durumu ----
db.exec('CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY, state TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS market_stock(id TEXT PRIMARY KEY, stock INTEGER)');
for (const [k, v] of Object.entries(MARKET)) {
  db.prepare('INSERT OR IGNORE INTO market_stock VALUES(?,?)').run(k, v.stock);
}
const stockMap = () =>
  Object.fromEntries(db.prepare('SELECT id,stock FROM market_stock').all().map((r) => [r.id, r.stock]));
const ctx = {
  takeStock: (id) =>
    db.prepare('UPDATE market_stock SET stock=stock-1 WHERE id=? AND stock>0').run(id).changes === 1,
};

const userRow = (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id) || {};
const loadP = (id) => {
  const r = db.prepare('SELECT state FROM players WHERE id=?').get(id);
  if (!r) return newPlayer();
  try {
    const p = JSON.parse(r.state);
    // Eski kayıtlarla uyumluluk
    p.history = p.history || [];
    p.miners = p.miners || [];
    p.unlocked = Array.isArray(p.unlocked) && p.unlocked.length ? p.unlocked : [0];
    p.ledger = p.ledger || { sources: 0, sinks: 0 };
    p.krd = Number(p.krd) || 0;
    p.stardust = Number(p.stardust) || 0;
    p.spins = Number(p.spins) || 0;
    p.up = Number(p.up) || 0;
    p.drill = Number(p.drill) || 0;
    p.exp = Number(p.exp) || 0;
    p.planet = Number(p.planet) || 0;
    p.nextId = Math.max(Number(p.nextId) || 1, ...p.miners.map((m) => (Number(m.id) || 0) + 1), 1);
    return p;
  } catch {
    return newPlayer();
  }
};
const saveP = (id, p) =>
  db
    .prepare('INSERT INTO players(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state')
    .run(id, JSON.stringify(p));

// TON ile alınan KRD'yi atomik olarak teslim eder; iki kez verilmez.
const absorb = (id, p) =>
  db.transaction(() => {
    const row = db.prepare('SELECT pending FROM users WHERE id=?').get(id);
    const pending = row?.pending || 0;
    if (pending > 0) {
      db.prepare('UPDATE users SET pending=0 WHERE id=?').run(id);
      p.krd += pending;
      p.ledger.sources += pending;
      pushHist(p, 'deposit', pending, 'KRD', 'TON ödemesi onaylandı, KRD hesabına eklendi');
    }
    return pending;
  })();

// ---- API ----
const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/api/config', auth, (req, res) =>
  res.json({
    treasury: TREASURY_ADDRESS || '',
    uid: String(req.uid),
    perTon: Number(CFG.krdPerTon),
    minTon: Number(CFG.minTon),
    isAdmin: isAdmin(req.uid),
    wallet: userRow(req.uid).wallet || '',
    settings: publicSettings(),
  })
);

app.get('/api/whoami', auth, (req, res) => {
  const u = userRow(req.uid);
  res.json({
    uid: req.uid,
    name: u.name || '',
    isAdmin: isAdmin(req.uid),
    wallet: u.wallet || '',
    adminConfigured: ADMIN_LIST.length > 0 || ALLOW_ALL_ADMINS || DEV === '1',
  });
});

app.post('/api/wallet', auth, (req, res) => {
  const addr = String(req.body?.address || '').slice(0, 90);
  db.prepare('UPDATE users SET wallet=? WHERE id=?').run(addr, req.uid);
  res.json({ ok: true, wallet: addr });
});

// Bekleyen (onaylanmış) KRD'yi atomik olarak teslim eder.
const claimDeposit = (req, res) => {
  const p = loadP(req.uid);
  const c = absorb(req.uid, p);
  if (c > 0) saveP(req.uid, p);
  res.json({ credited: c, currency: 'KRD' });
};
app.post('/api/claim-stardust', auth, claimDeposit);
app.post('/api/claim-deposit', auth, claimDeposit);

// Skor: tek seferde en fazla 500, saatte en fazla 5000 puan.
app.post('/api/score', auth, (req, res) => {
  const add = Math.max(0, Math.min(500, Number(req.body.points) || 0));
  const now = Date.now();
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.uid);
  const hour = now - (u.score_ts || 0) > 3600e3 ? 0 : u.hour_pts || 0;
  const ok = Math.min(add, Math.max(0, 5000 - hour));
  db.prepare('UPDATE users SET points=points+?, hour_pts=?, score_ts=? WHERE id=?').run(
    ok,
    hour + ok,
    hour ? u.score_ts : now,
    req.uid
  );
  res.json({ added: ok });
});

app.get('/api/leaderboard', auth, (req, res) =>
  res.json(db.prepare('SELECT name, points FROM users ORDER BY points DESC LIMIT 50').all())
);

const gview = (p, uid) => {
  const u = userRow(uid);
  const level = levelOf(p.exp || 0);
  return {
    ...p,
    uid,
    name: u.name || '',
    wallet: u.wallet || '',
    banned: !!u.banned,
    pending: pendingTotal(p),
    now: Date.now(),
    stock: stockMap(),
    last: p.last_result || null,
    canDaily: Date.now() - (p.lastDaily || 0) >= DAY * 0.9,
    level,
    exp: p.exp || 0,
    expNext: expForLevel(level + 1),
    prices: Object.fromEntries(Object.keys(CATALOG).map((k) => [k, buyCost(p, { pkgId: k })])),
    upCost: upCost(p.up || 0),
    drillCost: drillCost(p.drill || 0),
    maxMiners: maxMiners(p),
    isAdmin: isAdmin(uid),
    settings: publicSettings(),
    meta: {
      catalog: CATALOG,
      tiers: TIERS,
      planetUnlock: CFG.planetUnlock,
      planetMult: CFG.planetMult,
      requiredLevel: CFG.requiredLevel,
      wheelCost: CFG.wheelCost,
      dailyFaucet: CFG.dailyFaucet,
      dailyStardust: CFG.dailyStardust,
      repairCostPerPct: CFG.repairCostPerPct,
      stRepairCostPerPct: CFG.stRepairCostPerPct,
      krdPerTon: CFG.krdPerTon,
      minTon: CFG.minTon,
      stPerKrd: CFG.stPerKrd,
      buyGrowth: CFG.buyGrowth,
    },
  };
};

app.get('/api/game', auth, (req, res) => {
  const p = accrue(loadP(req.uid));
  absorb(req.uid, p);
  saveP(req.uid, p);
  res.json(gview(p, req.uid));
});

app.post('/api/game/act', auth, (req, res) => {
  const p = accrue(loadP(req.uid));
  absorb(req.uid, p);
  if (userRow(req.uid).banned) {
    saveP(req.uid, p);
    return res.json({ ...gview(p, req.uid), error: 'Hesabınız askıya alındı. Destek ile iletişime geçin.' });
  }
  p.last_result = null;
  const err = gameAct(p, req.body || {}, Date.now(), ctx);
  saveP(req.uid, p);
  res.json({ ...gview(p, req.uid), error: err });
});

// ---- Admin API ----
app.get('/api/admin/state', auth, adminOnly, (req, res) => {
  const players = db
    .prepare('SELECT id,state FROM players')
    .all()
    .map((r) => {
      let p;
      try { p = JSON.parse(r.state); } catch { p = newPlayer(); }
      const u = userRow(r.id);
      return {
        id: r.id,
        name: u.name || '',
        wallet: u.wallet || '',
        banned: !!u.banned,
        krd: Number((p.krd || 0).toFixed(2)),
        stardust: Math.floor(p.stardust || 0),
        level: levelOf(p.exp || 0),
        miners: (p.miners || []).length,
        planet: (p.planet || 0) + 1,
        unlocked: (p.unlocked || []).length,
        pending: Number(pendingTotal(p).toFixed(4)),
      };
    })
    .sort((a, b) => b.krd - a.krd);
  const totals = players.reduce(
    (a, p) => ({ krd: a.krd + p.krd, stardust: a.stardust + p.stardust, players: a.players + 1 }),
    { krd: 0, stardust: 0, players: 0 }
  );
  res.json({
    config: CONFIG,
    catalog: CATALOG,
    players,
    totals,
    stock: stockMap(),
    treasury: TREASURY_ADDRESS || '',
    adminId: req.uid,
  });
});

app.post('/api/admin/settings', auth, adminOnly, (req, res) => {
  const allowed = [
    'announcementText',
    'showAnnouncement',
    'maintenanceMode',
    'telegramChannelUrl',
    'telegramSupportUrl',
    'krdPerTon',
    'minTon',
    'repairCostPerPct',
    'stRepairCostPerPct',
    'wheelCost',
    'dailyStardust',
    'stPerKrd',
    'planetUnlock',
    'planetMult',
    'requiredLevel',
    'dailyFaucet',
  ];
  const patch = {};
  for (const k of allowed) if (k in (req.body || {})) patch[k] = req.body[k];
  CONFIG = { ...CONFIG, ...patch };
  saveConfig(CONFIG);
  applyConfig(CONFIG);
  res.json({ ok: true, config: CONFIG, settings: publicSettings() });
});

app.post('/api/admin/catalog', auth, adminOnly, (req, res) => {
  const { id, ...rest } = req.body || {};
  if (!CATALOG[id]) return res.status(400).json({ error: 'unknown package' });
  const clean = {};
  if (typeof rest.name === 'string') clean.name = rest.name;
  for (const k of ['price', 'daily', 'decay']) if (Number.isFinite(rest[k])) clean[k] = rest[k];
  if (typeof rest.active === 'boolean') clean.active = rest.active;
  CONFIG.catalog[id] = { ...(CONFIG.catalog[id] || {}), ...clean };
  saveConfig(CONFIG);
  applyCatalog({ [id]: clean });
  res.json({ ok: true, catalog: CATALOG });
});

app.post('/api/admin/player', auth, adminOnly, (req, res) => {
  const { id, action, krd, stardust, banned } = req.body || {};
  const uid = Number(id);
  if (!Number.isFinite(uid)) return res.status(400).json({ error: 'bad id' });
  if (action === 'reset') {
    saveP(uid, newPlayer());
    db.prepare('UPDATE users SET banned=0 WHERE id=?').run(uid);
  } else if (action === 'ban') {
    db.prepare('UPDATE users SET banned=? WHERE id=?').run(banned ? 1 : 0, uid);
  } else if (action === 'adjust') {
    const p = loadP(uid);
    const dk = Number(krd) || 0;
    const ds = Number(stardust) || 0;
    p.krd = Math.max(0, (p.krd || 0) + dk);
    p.stardust = Math.max(0, (p.stardust || 0) + ds);
    if (dk > 0) p.ledger.sources += dk; else p.ledger.sinks += -dk;
    pushHist(
      p,
      'admin_adjustment',
      Math.abs(dk),
      'KRD',
      `Yönetici düzenlemesi: ${dk >= 0 ? '+' : ''}${dk} KRD, ${ds >= 0 ? '+' : ''}${ds} Toz`
    );
    saveP(uid, p);
  } else {
    return res.status(400).json({ error: 'bad action' });
  }
  res.json({ ok: true });
});

app.post('/api/admin/stock', auth, adminOnly, (req, res) => {
  const { id, stock } = req.body || {};
  if (!(id in MARKET)) return res.status(400).json({ error: 'unknown item' });
  db.prepare('UPDATE market_stock SET stock=? WHERE id=?').run(Math.max(0, Math.floor(Number(stock) || 0)), id);
  res.json({ ok: true, stock: stockMap() });
});

// TON Connect manifest: domain her zaman isteğin geldiği adres olur.
app.get('/tonconnect-manifest.json', (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const origin = `${proto}://${host}`;
  res.json({
    url: origin,
    name: 'Kozmik Yolculuk',
    iconUrl: `${origin}/assets/icon.png`,
  });
});

// ---- Statik dosyalar ----
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');

// Telegram Web App eski HTML'i önbellekte tutmasın; her açılışta güncel sürüm gelsin.
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html' || req.path === '/tonconnect-manifest.json') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  }
  next();
});

app.use(express.static(dist));
app.get('*', (_, res) =>
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(500).send('Uygulama derlenmemiş. Önce "npm run build" çalıştırın.');
  })
);

// Hem PORT (varsayılan 3000) hem de 80 üzerinden dinleriz. Böylece platform
// konteynerin portunu 80 ya da 3000 olarak yönlendirse de uygulama açılır.
const listenPorts = [...new Set([Number(PORT) || 3000, 80])];
for (const p of listenPorts) {
  const srv = app.listen(p, () => console.log(`Kozmik Yolculuk sunucusu: ${p}`));
  srv.on('error', (e) => {
    if (p !== 80) console.error(`Port ${p} dinlenemedi: ${e.message}`);
  });
}
