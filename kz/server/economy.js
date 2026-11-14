// KRD ekonomisi: tüm sayılar burada. KRD ve Yıldız Tozu oyun içi para birimidir,
// nakde çevrilemez. Gerçek para yalnızca TON ile KRD yüklemek için kullanılır.
import { readFileSync } from 'fs';
import { WHEEL, MARKET, BOXES, spinPrize, boxReward } from './shop.js';

export const CATALOG = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url)));
export const DAY = 86400e3;
export const MINER_LIFESPAN_DAYS = 240;

// ---- Ayarlanabilir ekonomi (admin panelinden değiştirilir) ----
export const DEFAULT_CFG = {
  planetUnlock: [0, 30, 100, 250, 600, 1500],   // KRD
  planetMult: [1, 1.1, 1.25, 1.45, 1.7, 2.0],
  requiredLevel: [1, 2, 4, 7, 11, 16],
  repairCostPerPct: 0.0008,                       // paket fiyatının %0.08'i / 1% tamir (KRD)
  stRepairCostPerPct: 0.05,                       // paket fiyatının %5'i / 1% tamir (Toz)
  wheelCost: 100,                                 // Yıldız Tozu / çevirme
  dailyFaucet: [2, 2, 3, 3, 4, 4, 6],             // 7 günlük seri (KRD)
  dailyStardust: 50,
  upBase: 40, upGrowth: 1.5, upBonus: 0.05,       // Reaktör
  drillBase: 60, drillGrowth: 1.55, drillBonus: 0.04, // Matkap
  buyGrowth: 1.06,                                // her aktif madenci için alım fiyatı artışı
  maxMinersBase: 6,
  maxMinersPerPlanet: 4,
  krdPerTon: 20,                                  // 1 TON = 20 KRD
  minTon: 0.5,
  stPerKrd: 500,                                  // 500 Toz = 1 KRD (pazar bozdurma)
};

export const CFG = structuredClone(DEFAULT_CFG);

export function applyConfig(patch = {}) {
  for (const [k, v] of Object.entries(patch)) {
    if (!(k in CFG)) continue;
    if (Array.isArray(v)) CFG[k] = v.map(Number).map((n) => (Number.isFinite(n) ? n : 0));
    else if (typeof v === 'number' && Number.isFinite(v)) CFG[k] = v;
    else if (typeof v === 'boolean') CFG[k] = v;
  }
  CFG.krdPerTon = Math.max(0.0001, CFG.krdPerTon);
  CFG.minTon = Math.max(0, CFG.minTon);
  CFG.repairCostPerPct = Math.max(0, CFG.repairCostPerPct);
  CFG.stRepairCostPerPct = Math.max(0, CFG.stRepairCostPerPct);
  CFG.wheelCost = Math.max(0, Math.floor(CFG.wheelCost));
  CFG.dailyStardust = Math.max(0, Math.floor(CFG.dailyStardust));
  CFG.stPerKrd = Math.max(1, CFG.stPerKrd);
  CFG.buyGrowth = Math.max(1, CFG.buyGrowth);
  CFG.planetUnlock = CFG.planetUnlock.map((n) => Math.max(0, n));
  CFG.planetMult = CFG.planetMult.map((n) => Math.max(0, n));
  CFG.requiredLevel = CFG.requiredLevel.map((n) => Math.max(1, Math.floor(n)));
  CFG.dailyFaucet = CFG.dailyFaucet.map((n) => Math.max(0, n));
  if (CFG.planetUnlock.length < 6) CFG.planetUnlock = DEFAULT_CFG.planetUnlock.slice();
  if (CFG.planetMult.length < 6) CFG.planetMult = DEFAULT_CFG.planetMult.slice();
  if (CFG.requiredLevel.length < 6) CFG.requiredLevel = DEFAULT_CFG.requiredLevel.slice();
  if (CFG.dailyFaucet.length < 7) CFG.dailyFaucet = DEFAULT_CFG.dailyFaucet.slice();
}

export function applyCatalog(overrides = {}) {
  for (const [id, o] of Object.entries(overrides || {})) {
    if (!CATALOG[id] || !o) continue;
    if (typeof o.name === 'string' && o.name.trim()) CATALOG[id].name = o.name.trim().slice(0, 80);
    for (const k of ['price', 'daily', 'decay']) {
      if (Number.isFinite(o[k]) && o[k] >= 0) CATALOG[id][k] = o[k];
    }
    if (typeof o.active === 'boolean') CATALOG[id].active = o.active;
  }
}

// Eski arayüzle uyumluluk için seviye tabanlı paketler (katalog dışı).
export const TIERS = {
  bronze: { price: 10, daily: 0.006, decay: 1.0, tier: 'bronze', planetId: 1 },
  silver: { price: 25, daily: 0.006, decay: 1.1, tier: 'silver', planetId: 1 },
  gold: { price: 60, daily: 0.006, decay: 1.2, tier: 'gold', planetId: 1 },
  neon: { price: 150, daily: 0.006, decay: 1.3, tier: 'neon', planetId: 1 },
  quantum: { price: 400, daily: 0.006, decay: 1.4, tier: 'quantum', planetId: 1 },
};

export const baseOf = (a) => (a.pkgId ? CATALOG[a.pkgId] : TIERS[a.tier]);

export const buyCost = (p, a) => {
  const base = typeof a === 'string' ? TIERS[a] : baseOf(a);
  if (!base) return Infinity;
  return Math.ceil(base.price * CFG.buyGrowth ** p.miners.filter((m) => m.dur > 0).length);
};

export const upCost = (l) => Math.floor(CFG.upBase * CFG.upGrowth ** l);
export const drillCost = (l) => Math.floor(CFG.drillBase * CFG.drillGrowth ** l);

export const maxMiners = (p) =>
  CFG.maxMinersBase + CFG.maxMinersPerPlanet * Math.max(0, (p.unlocked?.length || 1) - 1);

export const levelOf = (exp = 0) => 1 + Math.floor(Math.sqrt(Math.max(0, exp)) / 3);
export const expForLevel = (lvl) => Math.max(0, ((Math.max(1, lvl) - 1) * 3) ** 2);
export const planetMultOf = (planetId = 1) => CFG.planetMult[(planetId || 1) - 1] ?? 1;

export const newPlayer = (now = Date.now()) => ({
  krd: 40,
  stardust: 0,
  planet: 0,
  unlocked: [0],
  miners: [],
  streak: 0,
  lastDaily: 0,
  nextId: 1,
  born: now,
  last: now,
  spins: 2,
  up: 0,
  drill: 0,
  exp: 0,
  ledger: { sources: 40, sinks: 0 },
  history: [],
  last_result: null,
  weapon: null,
  shield: null,
});

let histSeq = 0;
export function pushHist(p, type, amount, currency, note, status = 'completed') {
  p.history = p.history || [];
  p.history.push({
    id: `${Date.now()}_${histSeq++}`,
    type,
    amount: Number(amount) || 0,
    currency,
    status,
    note,
    ts: Date.now(),
  });
  if (p.history.length > 60) p.history = p.history.slice(-60);
}

// Sunucu-otoriter üretim: geçen süreye ve madencinin kendi gezegen çarpanına göre.
export function accrue(p, now = Date.now()) {
  for (const m of p.miners) {
    if (!m.running || m.dur <= 0) continue;
    const start = Math.max(m.last || 0, 0);
    let dtDays = (now - start) / DAY;
    const lifeLeft = (m.born + MINER_LIFESPAN_DAYS * DAY - start) / DAY;
    dtDays = Math.min(dtDays, lifeLeft);
    if (dtDays <= 0) {
      m.last = now;
      continue;
    }
    const decay = Math.max(0.0001, m.decay || 1);
    const daysToZero = m.dur / decay;
    const d = Math.min(dtDays, daysToZero);
    const avgDur = (m.dur + (m.dur - decay * d)) / 2; // doğrusal aşınmanın ortalaması
    const planetMult = planetMultOf(m.planetId);
    const upMult = 1 + CFG.upBonus * (p.up || 0);
    const drillMult = 1 + CFG.drillBonus * (p.drill || 0);
    const boostMult = (p.boostUntil || 0) > now ? 1.25 : 1;
    m.pending =
      (m.pending || 0) +
      m.price * (m.daily || 0) * (avgDur / 100) * planetMult * upMult * drillMult * boostMult * d;
    m.dur = Math.max(0, m.dur - decay * d);
    m.last = now;
  }
  p.miners = p.miners.filter(
    (m) => m.dur > 0 || m.pending > 0 || now - m.born < MINER_LIFESPAN_DAYS * DAY
  );
  p.last = now;
  return p;
}

const spend = (p, a) => {
  if (p.krd < a) return false;
  p.krd -= a;
  p.ledger.sinks += a;
  return true;
};
const gain = (p, a) => {
  p.krd += a;
  p.ledger.sources += a;
};

export function act(p, a, now = Date.now(), ctx = {}) {
  accrue(p, now);
  switch (a.type) {
    case 'buy': {
      const t = baseOf(a);
      if (!t || t.active === false) return 'geçersiz paket';
      const planetIdx = (t.planetId || 1) - 1;
      if (!p.unlocked.includes(planetIdx)) return 'gezegen kilitli';
      if (levelOf(p.exp) < (CFG.requiredLevel[planetIdx] || 1)) return 'seviye yetersiz';
      if (p.miners.filter((m) => m.dur > 0).length >= maxMiners(p)) return 'slot dolu';
      const cost = buyCost(p, a);
      if (!spend(p, cost)) return 'yetersiz KRD';
      p.miners.push({
        id: p.nextId++,
        pkgId: a.pkgId,
        tier: t.tier || a.tier,
        price: t.price,
        daily: t.daily,
        decay: t.decay,
        planetId: t.planetId || 1,
        dur: 100,
        born: now,
        last: now,
        pending: 0,
        running: true,
      });
      p.exp += Math.floor(t.price);
      pushHist(p, 'package_buy', cost, 'KRD', `${t.name || a.pkgId} filoya eklendi`);
      return null;
    }

    case 'claim': {
      let s = 0;
      for (const m of p.miners) {
        if (a.id == null || m.id === a.id) {
          s += m.pending || 0;
          m.pending = 0;
        }
      }
      if (s <= 0) return 'toplanacak üretim yok';
      gain(p, s);
      p.exp += Math.floor(s * 2);
      pushHist(p, 'mine_claim', s, 'KRD', 'Madenci hasılatı toplandı');
      return null;
    }

    // Olay/savaş/çark gibi aktivite ödülleri: saatte en fazla 15 KRD ve 300 Toz.
    case 'activity': {
      if (!p.act || now - p.act.ts > 3600e3) p.act = { ts: now, sum: 0, st: 0 };
      const ok = Math.max(0, Math.min(Number(a.amount) || 0, 15 - p.act.sum));
      p.act.sum += ok;
      gain(p, ok);
      const st = Math.max(0, Math.min(Number(a.stardust) || 0, 300 - p.act.st));
      p.act.st += st;
      p.stardust += st;
      p.exp += Math.floor(ok * 2 + st * 0.02);
      return null;
    }

    case 'repair': {
      const m = p.miners.find((x) => x.id === a.id);
      if (!m) return 'madenci yok';
      const pct = Math.min(100 - m.dur, Number(a.pct) || 100);
      if (pct <= 0.001) return 'zaten tam';
      if (a.currency === 'STARDUST') {
        const cost = Math.ceil(m.price * CFG.stRepairCostPerPct * pct);
        if (p.stardust < cost) return 'yetersiz Yıldız Tozu';
        p.stardust -= cost;
        pushHist(p, 'repair', cost, 'STARDUST', `${m.pkgId || m.tier} tamir edildi`);
      } else {
        const cost = m.price * CFG.repairCostPerPct * pct;
        if (!spend(p, cost)) return 'yetersiz KRD';
        pushHist(p, 'repair', cost, 'KRD', `${m.pkgId || m.tier} tamir edildi`);
      }
      m.dur = Math.min(100, m.dur + pct);
      p.exp += Math.floor(pct / 5);
      return null;
    }

    case 'unlock': {
      const i = Number(a.planet);
      if (!(i > 0 && i < CFG.planetUnlock.length) || p.unlocked.includes(i)) return 'geçersiz gezegen';
      if (!p.unlocked.includes(i - 1)) return 'önce önceki gezegen';
      if (levelOf(p.exp) < (CFG.requiredLevel[i] || 1)) return 'seviye yetersiz';
      const cost = CFG.planetUnlock[i];
      if (!spend(p, cost)) return 'yetersiz KRD';
      p.unlocked.push(i);
      pushHist(p, 'planet_unlock', cost, 'KRD', `Gezegen ${i + 1} açıldı`);
      return null;
    }

    case 'upgrade': {
      const c = upCost(p.up || 0);
      if (!spend(p, c)) return 'yetersiz KRD';
      p.up = (p.up || 0) + 1;
      p.exp += 10;
      pushHist(p, 'admin_adjustment', c, 'KRD', `Reaktör seviye ${p.up}`);
      return null;
    }

    case 'drill': {
      const c = drillCost(p.drill || 0);
      if (!spend(p, c)) return 'yetersiz KRD';
      p.drill = (p.drill || 0) + 1;
      p.exp += 10;
      pushHist(p, 'admin_adjustment', c, 'KRD', `Matkap seviye ${p.drill}`);
      return null;
    }

    case 'spin': {
      if ((p.spins || 0) > 0) p.spins--;
      else if (p.stardust >= CFG.wheelCost) p.stardust -= CFG.wheelCost;
      else return 'Yetersiz çevirme hakkı veya Yıldız Tozu';
      const w = spinPrize();
      p.last_result = { kind: 'spin', prizeId: w.id };
      if (w.kind === 'stardust') p.stardust += w.amt;
      else if (w.kind === 'krd') gain(p, w.amt);
      else if (w.kind === 'spin') p.spins = (p.spins || 0) + w.amt;
      else if (w.kind === 'repair') {
        const m = p.miners.filter((x) => x.dur > 0).sort((x, y) => x.dur - y.dur)[0];
        if (m) m.dur = Math.min(100, m.dur + w.amt);
      } else if (w.kind === 'boost') p.boostUntil = Math.max(now, p.boostUntil || 0) + 6 * 3600e3;
      p.exp += 5;
      pushHist(p, 'spin_win', w.kind === 'krd' ? w.amt : 0, w.kind === 'krd' ? 'KRD' : 'STARDUST', `Çark ödülü: ${w.id}`);
      return null;
    }

    case 'box': {
      const b = BOXES[a.id];
      if (!b) return 'geçersiz sandık';
      if (!spend(p, b.price)) return 'yetersiz KRD';
      const w = boxReward(a.id);
      gain(p, w.krd);
      p.stardust += w.st;
      p.spins = (p.spins || 0) + w.spins;
      p.last_result = { kind: 'box', krd: w.krd, st: w.st, spins: w.spins };
      p.exp += 20;
      pushHist(p, 'box_open', w.krd, 'KRD', `${b.name} açıldı (+${w.st} Toz)`);
      return null;
    }

    case 'market': {
      const it = MARKET[a.id];
      if (!it) return 'geçersiz ürün';
      if (it.type === 'cosmic_pass' && p.unlocked.length >= CFG.planetUnlock.length) return 'tüm gezegenler açık';
      if (p.krd < it.price) return 'yetersiz KRD';
      if (ctx.takeStock && !ctx.takeStock(a.id)) return 'stok tükendi';
      spend(p, it.price);
      if (it.type === 'repair_kit') p.miners.forEach((m) => { if (m.dur > 0) m.dur = 100; });
      else if (it.type === 'ore_bundle') p.stardust += 1000;
      else if (it.type === 'overclock_chip') p.boostUntil = Math.max(now, p.boostUntil || 0) + 6 * 3600e3;
      else if (it.type === 'cosmic_pass') {
        const n = p.unlocked.length;
        if (n < CFG.planetUnlock.length) {
          p.unlocked.push(n);
          p.planet = n;
        }
      }
      else if (it.type === 'weapon') { p.weapon = a.id; }
      else if (it.type === 'shield') { p.shield = a.id; }
      p.exp += 10;
      pushHist(p, 'market_trade', it.price, 'KRD', `Pazar alışverişi: ${a.id}`);
      return null;
    }

    case 'exchange': {
      const st = Math.floor(Number(a.stardust) || 0);
      if (st <= 0) return 'geçersiz miktar';
      if (p.stardust < st) return 'yetersiz Yıldız Tozu';
      const krd = st / CFG.stPerKrd;
      if (krd <= 0) return 'geçersiz miktar';
      p.stardust -= st;
      gain(p, krd);
      pushHist(p, 'market_trade', krd, 'KRD', `${st} Toz → ${krd.toFixed(2)} KRD`);
      return null;
    }

    case 'travel': {
      const i = Number(a.planet);
      if (!p.unlocked.includes(i)) return 'kilitli';
      p.planet = i;
      return null;
    }

    case 'daily': {
      if (now - p.lastDaily < DAY * 0.9) return 'bugün alındı';
      p.streak = now - p.lastDaily < DAY * 2 ? (p.streak + 1) % 7 : 0;
      p.lastDaily = now;
      const reward = CFG.dailyFaucet[p.streak] ?? 2;
      gain(p, reward);
      p.stardust += CFG.dailyStardust;
      p.exp += 10;
      pushHist(p, 'daily', reward, 'KRD', `Günlük ödül (${p.streak + 1}. gün) +${CFG.dailyStardust} Toz`);
      return null;
    }

    // Asteroid çarpması: en düşük kondisyonlu madencinin dayanıklılığını düşürür.
    case 'hit': {
      const pct = Math.max(0, Math.min(100, Number(a.pct) || 0));
      const m = p.miners.filter((x) => x.dur > 0).sort((x, y) => x.dur - y.dur)[0];
      if (m) m.dur = Math.max(0, m.dur - pct);
      return null;
    }
  }
  return 'bilinmeyen işlem';
}

export const pendingTotal = (p) => p.miners.reduce((s, m) => s + (m.pending || 0), 0);
