// KRD ekonomisi: tüm sayılar burada. Gerçek paraya bağlı DEĞİL (test/oyun parası).
import { readFileSync } from 'fs';
import { WHEEL_COST, MARKET, BOXES, spinPrize, boxReward } from './shop.js';
export const CATALOG = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url)));
export const TIERS = {
  bronze:  { price: 10,  daily: 0.0060, decay: 1.5 },
  silver:  { price: 25,  daily: 0.0062, decay: 1.5 },
  gold:    { price: 60,  daily: 0.0065, decay: 1.5 },
  neon:    { price: 150, daily: 0.0068, decay: 1.5 },
  quantum: { price: 400, daily: 0.0072, decay: 1.5 },
};
export const PLANET_MULT = [1, 1.1, 1.25, 1.45, 1.7, 2.0];
export const PLANET_UNLOCK = [0, 30, 100, 250, 600, 1500];       // KRD (yakılır)
export const REPAIR_COST_PER_PCT = 0.0037;  // günlük bakım = %0.555, üretim %0.6 -> net marj ince
export const MINER_LIFESPAN_DAYS = 240;
export const DAILY_FAUCET = [2, 2, 3, 3, 4, 4, 6];                // 7 günlük seri ödülü (KAYNAK)
export const UP_BASE = 40, UP_GROWTH = 1.5, UP_BONUS = 0.05;      // Reaktör: +%5 üretim/seviye, maliyet üstel -> sonsuz yakım
export const upCost = l => Math.floor(UP_BASE * UP_GROWTH ** l);
export const DRILL_BASE = 60, DRILL_GROWTH = 1.55, DRILL_BONUS = 0.04;  // Matkap: ikinci üstel yakım kalemi
export const drillCost = l => Math.floor(DRILL_BASE * DRILL_GROWTH ** l);
export const maxMiners = p => 6 + 4 * p.planet;                     // slot sayısı gezegenle büyür
export const baseOf = a => (a.pkgId ? CATALOG[a.pkgId] : TIERS[a.tier]);
export const buyCost = (p, a) => Math.ceil((typeof a === 'string' ? TIERS[a] : baseOf(a)).price * 1.06 ** p.miners.filter(m => m.dur > 0).length);
export const DAY = 86400e3;

export const newPlayer = (now = Date.now()) => ({
  krd: 40, stardust: 0, planet: 0, unlocked: [0], miners: [], streak: 0, lastDaily: 0, nextId: 1, born: now, last: now,
  spins: 2, up: 0, ledger: { sources: 40, sinks: 0 },
});

// Sunucu-otoriter üretim: geçen süreye göre, dayanıklılık düştükçe üretim de düşer
export function accrue(p, now = Date.now()) {
  for (const m of p.miners) {
    if (!m.running || m.dur <= 0) continue;
    const t = { daily: m.daily, decay: m.decay }, start = Math.max(m.last, 0);
    let dtDays = (now - start) / DAY;
    dtDays = Math.min(dtDays, (m.born + MINER_LIFESPAN_DAYS * DAY - start) / DAY);
    if (dtDays <= 0) { m.last = now; continue; }
    const daysToZero = m.dur / t.decay, d = Math.min(dtDays, daysToZero);
    const avgDur = (m.dur + (m.dur - t.decay * d)) / 2;                    // doğrusal azalmanın ortalaması
    m.pending += m.price * t.daily * (avgDur / 100) * (m.mult ?? PLANET_MULT[p.planet]) * (1 + UP_BONUS * (p.up || 0)) * (1 + DRILL_BONUS * (p.drill || 0)) * ((p.boostUntil || 0) > now ? 1.25 : 1) * d;
    m.dur = Math.max(0, m.dur - t.decay * d);
    m.last = now;
  }
  p.miners = p.miners.filter(m => m.dur > 0 || m.pending > 0 || now - m.born < MINER_LIFESPAN_DAYS * DAY);
  p.last = now; return p;
}
const spend = (p, a) => { if (p.krd < a) return false; p.krd -= a; p.ledger.sinks += a; return true; };
const gain = (p, a) => { p.krd += a; p.ledger.sources += a; };

export function act(p, a, now = Date.now(), ctx = {}) {
  accrue(p, now);
  switch (a.type) {
    case 'buy': { const t = baseOf(a); if (!t) return 'geçersiz'; if (t.planetId && !p.unlocked.includes(t.planetId - 1)) return 'gezegen kilitli'; if (p.miners.filter(m => m.dur > 0).length >= maxMiners(p)) return 'slot dolu'; if (!spend(p, buyCost(p, a))) return 'yetersiz KRD';
      p.miners.push({ id: p.nextId++, pkgId: a.pkgId, tier: t.tier || a.tier, price: t.price, daily: t.daily, decay: t.decay, mult: a.pkgId ? 1 : undefined, planetId: t.planetId, dur: 100, born: now, last: now, pending: 0, running: true }); return null; }
    case 'claim': { let s = 0; for (const m of p.miners) if (a.id == null || m.id === a.id) { s += m.pending; m.pending = 0; } gain(p, s); return null; }
    case 'activity': { // olay/savaş/çark gibi aktivite ödülleri: saatte en fazla 15 KRD
      if (!p.act || now - p.act.ts > 3600e3) p.act = { ts: now, sum: 0 };
      const ok = Math.max(0, Math.min(Number(a.amount) || 0, 15 - p.act.sum)); p.act.sum += ok; gain(p, ok);
      p.act.st = p.act.st || 0; const st = Math.max(0, Math.min(Number(a.stardust) || 0, 300 - p.act.st)); p.act.st += st; p.stardust += st; return null; }
    case 'repair': { const m = p.miners.find(x => x.id === a.id); if (!m) return 'yok';
      const pct = Math.min(100 - m.dur, a.pct ?? 100); if (pct <= 0) return 'zaten tam';
      if (!spend(p, m.price * REPAIR_COST_PER_PCT * pct)) return 'yetersiz KRD'; m.dur += pct; return null; }
    case 'unlock': { const i = a.planet; if (!(i > 0 && i < PLANET_UNLOCK.length) || p.unlocked.includes(i)) return 'geçersiz';
      if (!p.unlocked.includes(i - 1)) return 'önce önceki gezegen'; if (!spend(p, PLANET_UNLOCK[i])) return 'yetersiz KRD';
      p.unlocked.push(i); return null; }
    case 'upgrade': if (!spend(p, upCost(p.up || 0))) return 'yetersiz KRD'; p.up = (p.up || 0) + 1; return null;
    case 'drill': if (!spend(p, drillCost(p.drill || 0))) return 'yetersiz KRD'; p.drill = (p.drill || 0) + 1; return null;
    case 'spin': {
      if ((p.spins || 0) > 0) p.spins--; else if (p.stardust >= WHEEL_COST) p.stardust -= WHEEL_COST; else return 'Yetersiz çevirme hakkı veya Yıldız Tozu';
      const w = spinPrize(); p.last_result = { kind: 'spin', prizeId: w.id };
      if (w.kind === 'stardust') p.stardust += w.amt; else if (w.kind === 'krd') gain(p, w.amt); else if (w.kind === 'spin') p.spins = (p.spins || 0) + w.amt;
      else if (w.kind === 'repair') { const m = p.miners.filter(x => x.dur > 0).sort((x, y) => x.dur - y.dur)[0]; if (m) m.dur = Math.min(100, m.dur + w.amt); }
      else if (w.kind === 'boost') p.boostUntil = Math.max(now, p.boostUntil || 0) + 6 * 3600e3;
      return null; }
    case 'box': { const b = BOXES[a.id]; if (!b) return 'geçersiz'; if (!spend(p, b.price)) return 'yetersiz KRD';
      const w = boxReward(a.id); gain(p, w.krd); p.stardust += w.st; p.spins = (p.spins || 0) + w.spins;
      p.last_result = { kind: 'box', krd: w.krd, st: w.st, spins: w.spins }; return null; }
    case 'market': { const it = MARKET[a.id]; if (!it) return 'geçersiz'; if (p.krd < it.price) return 'yetersiz KRD';
      if (it.type === 'cosmic_pass' && p.unlocked.length >= PLANET_UNLOCK.length) return 'tüm gezegenler açık';
      if (ctx.takeStock && !ctx.takeStock(a.id)) return 'stok tükendi';
      spend(p, it.price);
      if (it.type === 'repair_kit') p.miners.forEach(m => { if (m.dur > 0) m.dur = 100; });
      else if (it.type === 'ore_bundle') p.stardust += 1000;
      else if (it.type === 'overclock_chip') p.boostUntil = Math.max(now, p.boostUntil || 0) + 6 * 3600e3;
      else if (it.type === 'cosmic_pass') { const n = p.unlocked.length; p.unlocked.push(n); p.planet = n; }
      return null; }
    case 'travel': if (!p.unlocked.includes(a.planet)) return 'kilitli'; p.planet = a.planet; return null;
    case 'daily': { if (now - p.lastDaily < DAY * 0.9) return 'bugün alındı';
      p.streak = now - p.lastDaily < DAY * 2 ? (p.streak + 1) % 7 : 0; p.lastDaily = now; gain(p, DAILY_FAUCET[p.streak]); return null; }
  }
  return 'bilinmeyen';
}
export const pendingTotal = p => p.miners.reduce((s, m) => s + m.pending, 0);
