// node server/sim.js  -> 365 günlük ekonomi simülasyonu (800 oyuncu, 120 günde katılıyor)
import { newPlayer, act, CATALOG, PLANET_UNLOCK, DAY, upCost, drillCost, buyCost, maxMiners } from './economy.js';
const N = 800, DAYS = 365, T0 = 0, players = [];
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < N; i++) players.push({ join: Math.floor(rnd() * 120), churn: 20 + Math.floor(rnd() * 300), p: null });
const rows = [];
for (let d = 0; d < DAYS; d++) {
  const now = T0 + d * DAY; let supply = 0, active = 0, src = 0, snk = 0;
  for (const a of players) {
    if (d === a.join) a.p = newPlayer(now);
    if (!a.p || d > a.join + a.churn) continue; const p = a.p; active++;
    act(p, { type: 'daily' }, now); act(p, { type: 'claim' }, now);
    for (const m of p.miners) if (m.dur < 40) act(p, { type: 'repair', id: m.id, pct: 100 }, now);   // bakım yapan oyuncu
    const next = p.unlocked.length < PLANET_UNLOCK.length ? p.unlocked.length : -1;
    if (next > 0 && p.krd >= PLANET_UNLOCK[next] * 1.5 && act(p, { type: 'unlock', planet: next }, now) === null) act(p, { type: 'travel', planet: next }, now);
    const opts = Object.entries(CATALOG).filter(([, c]) => p.unlocked.includes(c.planetId - 1))
      .map(([id]) => ({ id, cost: buyCost(p, { pkgId: id }) })).filter(o => p.krd >= o.cost * 1.2).sort((a, b) => b.cost - a.cost);
    if (opts[0] && p.miners.filter(m => m.dur > 0).length < maxMiners(p)) act(p, { type: 'buy', pkgId: opts[0].id }, now);
    while (p.krd >= drillCost(p.drill || 0) * 1.3) act(p, { type: 'drill' }, now);
  }
  for (const a of players) if (a.p) { supply += a.p.krd; src += a.p.ledger.sources; snk += a.p.ledger.sinks; }
  if (d % 30 === 29) rows.push({ gün: d + 1, aktif: active, 'KRD stok': Math.round(supply), 'oyuncu başı': +(supply / Math.max(1, active)).toFixed(1), 'toplam kaynak': Math.round(src), 'toplam yakım': Math.round(snk), 'yakım/kaynak %': +(100 * snk / src).toFixed(0) });
}
console.table(rows);
