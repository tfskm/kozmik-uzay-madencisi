import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  ShoppingBag,
  Wrench,
  Sparkles,
  Zap,
  Rocket,
  Shield,
  ArrowRightLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Gem,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type TabId = 'rockets' | 'weapons' | 'shields' | 'stones' | 'bundles' | 'support';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'rockets', label: 'Roketler', icon: Rocket },
  { id: 'weapons', label: 'Silahlar', icon: Zap },
  { id: 'shields', label: 'Kalkanlar', icon: Shield },
  { id: 'stones', label: 'Taşlar', icon: Target },
  { id: 'bundles', label: 'Paketler', icon: Gem },
  { id: 'support', label: 'Destek', icon: Wrench },
];

const STONES = [
  { tier: 1, damage: 6, reward: 10, color: '#60a5fa' },
  { tier: 2, damage: 10, reward: 20, color: '#f97316' },
  { tier: 3, damage: 15, reward: 35, color: '#ef4444' },
  { tier: 4, damage: 22, reward: 55, color: '#a855f7' },
  { tier: 5, damage: 30, reward: 80, color: '#fbbf24' },
];

const SHIELD_CAP = [0, 40, 60, 80, 100, 120];

export const Marketplace: React.FC = () => {
  const { user, marketItems, buyMarketItem, exchangeStardust, adminSettings } = useGame();

  const [tab, setTab] = useState<TabId>('rockets');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sellDustAmount, setSellDustAmount] = useState<number>(250);
  const [exchangeMsg, setExchangeMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rate = Math.max(1, adminSettings.stPerKrd);
  const krdReturn = Number((sellDustAmount / rate).toFixed(2));

  const byType = useMemo(() => {
    const rockets = marketItems.filter((i) => i.type === 'rocket').sort((a, b) => a.price - b.price);
    const weapons = marketItems.filter((i) => i.type === 'weapon').sort((a, b) => a.price - b.price);
    const shields = marketItems.filter((i) => i.type === 'shield').sort((a, b) => a.price - b.price);
    const bundles = marketItems.filter((i) => i.type === 'bundle').sort((a, b) => a.price - b.price);
    const support = marketItems
      .filter((i) => ['repair_kit', 'ore_bundle', 'overclock_chip', 'cosmic_pass', 'energy_drink'].includes(i.type))
      .sort((a, b) => a.price - b.price);
    return { rockets, weapons, shields, bundles, support };
  }, [marketItems]);

  const equipped = {
    rocket: user.equippedRocket || 'rkt-1',
    weapon: user.equippedWeapon || null,
    shield: user.equippedShield || null,
  };

  const isEquipped = (itemId: string, type: string) =>
    (type === 'rocket' && equipped.rocket === itemId) ||
    (type === 'weapon' && equipped.weapon === itemId) ||
    (type === 'shield' && equipped.shield === itemId);

  const handleBuy = async (itemId: string) => {
    if (busy) return;
    setBusy(true);
    const res = await buyMarketItem(itemId);
    setBusy(false);
    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#06b6d4', '#10b981', '#a855f7'] });
    }
    alert(res.message);
  };

  const handleSellDust = async () => {
    if (user.stardustBalance < sellDustAmount) {
      alert('Yetersiz Yıldız Tozu!');
      return;
    }
    if (busy) return;
    setBusy(true);
    sounds.playCoin();
    sounds.triggerHaptic('success');
    const res = await exchangeStardust(sellDustAmount);
    setBusy(false);
    setExchangeMsg(res.message);
    setTimeout(() => setExchangeMsg(null), 4000);
  };

  const tierOf = (id: string) => {
    const m = id.match(/-(\d)$/);
    return m ? Number(m[1]) : 0;
  };

  const renderBuyRow = (
    item: any,
    extra: { tier: number; power: string; capacity?: string },
  ) => {
    const active = isEquipped(item.id, item.type);
    const canAfford = user.krdBalance >= item.price;
    const open = expanded === item.id;
    return (
      <div key={item.id} className={`rounded-xl border ${active ? 'border-emerald-400/70 bg-emerald-500/10' : 'border-teal-500/30 bg-[#052430]/80'}`}>
        <button
          onClick={() => { sounds.playClick(); setExpanded(open ? null : item.id); }}
          className="w-full text-left p-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black font-display text-sm ${active ? 'bg-emerald-400 text-slate-950' : 'bg-[#083546] text-cyan-300 border border-cyan-500/30'}`}>
              S{extra.tier}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white font-display truncate">{item.title}</div>
              <div className="text-[11px] text-teal-200/80 truncate">{extra.power}{extra.capacity ? ` • ${extra.capacity}` : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-sm font-black text-amber-300 font-mono">{item.price}</div>
              <div className="text-[10px] text-teal-300/60">KRD</div>
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-teal-300" /> : <ChevronDown className="w-4 h-4 text-teal-300" />}
          </div>
        </button>
        {open && (
          <div className="px-3 pb-3 pt-0 border-t border-teal-500/20">
            <p className="text-xs text-teal-100/80 mt-2">{item.description}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#06222c] border border-teal-500/20 rounded-lg p-2"><span className="text-teal-300/70">Seviye</span><div className="text-white font-bold">S{extra.tier}</div></div>
              <div className="bg-[#06222c] border border-teal-500/20 rounded-lg p-2"><span className="text-teal-300/70">Fiyat</span><div className="text-amber-300 font-bold font-mono">{item.price} KRD</div></div>
              <div className="bg-[#06222c] border border-teal-500/20 rounded-lg p-2 col-span-2"><span className="text-teal-300/70">Özellik</span><div className="text-emerald-300 font-bold">{extra.power}{extra.capacity ? ` • ${extra.capacity}` : ''}</div></div>
            </div>
            <button
              onClick={() => handleBuy(item.id)}
              disabled={busy || item.stock <= 0 || (!canAfford && !active) || (active && item.price === 0)}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-black transition active:scale-95 ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : canAfford
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950'
                  : 'bg-[#062430] text-teal-200/40'
              }`}
            >
              {active ? 'Kuşanıldı ✓' : item.stock <= 0 ? 'Tükendi' : !canAfford ? `Yetersiz KRD (${item.price})` : `Satın Al / Kuşan (${item.price} KRD)`}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d3f4f] via-[#094857] to-[#0a3b4a] border border-cyan-400/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-teal-300" />
              <span>Galaktik Pazar</span>
            </div>
            <h2 className="text-xl font-black text-white font-display mt-0.5">Ekipman & Bilgi</h2>
            <p className="text-xs text-teal-100/80 mt-1">Sekmeden kategori seç: roket, silah, kalkan ve taş bilgileri tek ekranda.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#052632] border border-cyan-400/40 rounded-xl p-2 text-right">
              <div className="text-[10px] text-cyan-300">Yıldız Tozu</div>
              <div className="text-sm font-bold text-amber-300 font-mono">{user.stardustBalance}</div>
            </div>
            <div className="bg-[#052632] border border-emerald-400/50 rounded-xl p-2 text-right">
              <div className="text-[10px] text-emerald-300">KRD</div>
              <div className="text-sm font-bold text-emerald-300 font-mono">{user.krdBalance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { sounds.playClick(); setTab(t.id); setExpanded(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/20 border-cyan-400 text-white'
                  : 'bg-[#052430] border-teal-500/30 text-teal-200/80 hover:border-cyan-500/50'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="space-y-2">
        {tab === 'rockets' && (
          <div className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-white font-display">Roket Seviyeleri (5)</h3>
              <span className="text-[11px] text-emerald-300 font-mono">Sende: S{tierOf(equipped.rocket)}</span>
            </div>
            <div className="grid grid-cols-3 text-[10px] text-teal-300/70 font-mono px-1">
              <span>Seviye</span><span>Güç</span><span className="text-right">Fiyat</span>
            </div>
            {byType.rockets.map((item) => renderBuyRow(item, { tier: tierOf(item.id), power: `Roket gücü S${tierOf(item.id)}` }))}
          </div>
        )}

        {tab === 'weapons' && (
          <div className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-white font-display">Silahlar (5 Seviye)</h3>
              <span className="text-[11px] text-orange-300 font-mono">{equipped.weapon ? `Sende: S${tierOf(equipped.weapon)}` : 'Silah yok'}</span>
            </div>
            <p className="text-[11px] text-teal-100/70">Sev.N silah, Sev.N ve altı taşları kırar. Silahsız ateş edemezsin.</p>
            <div className="grid grid-cols-3 text-[10px] text-teal-300/70 font-mono px-1">
              <span>Seviye</span><span>Kırdığı Taş</span><span className="text-right">Fiyat</span>
            </div>
            {byType.weapons.map((item) => {
              const t = tierOf(item.id);
              return renderBuyRow(item, { tier: t, power: `Sev.1-${t} taşları kırar` });
            })}
          </div>
        )}

        {tab === 'shields' && (
          <div className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-white font-display">Kalkanlar (5 Seviye)</h3>
              <span className="text-[11px] text-cyan-300 font-mono">{equipped.shield ? `Sende: S${tierOf(equipped.shield)}` : 'Kalkan yok'}</span>
            </div>
            <p className="text-[11px] text-teal-100/70">Sev.N kalkan, Sev.N ve altı taşları durdurur. Çarptıkça ömrü azalır.</p>
            <div className="grid grid-cols-3 text-[10px] text-teal-300/70 font-mono px-1">
              <span>Seviye</span><span>Koruma / Ömür</span><span className="text-right">Fiyat</span>
            </div>
            {byType.shields.map((item) => {
              const t = tierOf(item.id);
              return renderBuyRow(item, { tier: t, power: `Sev.1-${t} taş engel`, capacity: `Ömür ${SHIELD_CAP[t]}` });
            })}
          </div>
        )}

        {tab === 'stones' && (
          <div className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-3 space-y-2">
            <div className="mb-1">
              <h3 className="text-sm font-black text-white font-display">Göktaşları (5 Seviye)</h3>
              <p className="text-[11px] text-teal-100/70 mt-0.5">Taşlar satın alınmaz; oyunda gelir. Hasar/kazanç bilgisi aşağıdadır.</p>
            </div>
            <div className="grid grid-cols-4 text-[10px] text-teal-300/70 font-mono px-1">
              <span>Seviye</span><span>Zarar</span><span>Ödül</span><span>Gereken</span>
            </div>
            {STONES.map((s) => (
              <div key={s.tier} className="rounded-xl border border-teal-500/30 bg-[#052430]/80 p-3">
                <div className="grid grid-cols-4 items-center gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55` }}>S{s.tier}</span>
                  </div>
                  <div className="text-rose-300 font-bold">-%{s.damage}</div>
                  <div className="text-amber-300 font-bold">+{s.reward} puan</div>
                  <div className="text-cyan-200 text-[11px]">Silah≥S{s.tier} kırar • Kalkan≥S{s.tier} korur</div>
                </div>
                <div className="mt-2 text-[11px] text-teal-100/70 bg-[#06222c] border border-teal-500/20 rounded-lg p-2">
                  Kalkan yeterliyse taş kalkanın dış çizgisinde patlar: <span className="text-cyan-300 font-bold">%{s.damage} hasar engellenir</span> (ekstra puan yok). Yetersizse gövdeye <span className="text-rose-300 font-bold">%{s.damage} hasar</span>.
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'bundles' && (
          <div className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-3 space-y-2">
            <div className="mb-1">
              <h3 className="text-sm font-black text-white font-display">İndirimli Paketler</h3>
              <p className="text-[11px] text-teal-100/70 mt-0.5">Set halinde alım tek tek alımdan daha ucuzdur. İçerikler otomatik kuşanılır/eklenir.</p>
            </div>
            {byType.bundles.map((item) => {
              const open = expanded === item.id;
              const canAfford = user.krdBalance >= item.price;
              const separate = item.id === 'bndl-1' ? 11 : item.id === 'bndl-2' ? 67 : item.id === 'bndl-3' ? 164 : item.id === 'bndl-4' ? 810 : item.price;
              const contents = item.id === 'bndl-1' ? ['Silah S1', 'Kalkan S1', '500 Toz']
                : item.id === 'bndl-2' ? ['Roket S2', 'Silah S2', 'Kalkan S2', '1000 Toz']
                : item.id === 'bndl-3' ? ['Roket S3', 'Silah S3', 'Kalkan S3', '2000 Toz']
                : ['Roket S5', 'Silah S5', 'Kalkan S5', '5000 Toz'];
              const save = Math.max(0, separate - item.price);
              return (
                <div key={item.id} className="rounded-xl border border-teal-500/30 bg-[#052430]/80">
                  <button onClick={() => { sounds.playClick(); setExpanded(open ? null : item.id); }} className="w-full text-left p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white font-display truncate">{item.title}</div>
                      <div className="text-[11px] text-emerald-300 truncate">{contents.join(' • ')}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-teal-300/60 line-through">{separate} KRD</div>
                        <div className="text-sm font-black text-amber-300 font-mono">{item.price} KRD</div>
                      </div>
                      {open ? <ChevronUp className="w-4 h-4 text-teal-300" /> : <ChevronDown className="w-4 h-4 text-teal-300" />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-3 pb-3 pt-0 border-t border-teal-500/20">
                      <p className="text-xs text-teal-100/80 mt-2">{item.description}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-[#06222c] border border-teal-500/20 rounded-lg p-2"><span className="text-teal-300/70">Ayrı toplam</span><div className="text-white font-bold font-mono">{separate} KRD</div></div>
                        <div className="bg-[#06222c] border border-teal-500/20 rounded-lg p-2"><span className="text-teal-300/70">Paket fiyatı</span><div className="text-amber-300 font-bold font-mono">{item.price} KRD</div></div>
                        <div className="bg-[#06222c] border border-emerald-500/30 rounded-lg p-2 col-span-2"><span className="text-teal-300/70">Kazancın</span><div className="text-emerald-300 font-bold">{save} KRD indirim ({Math.round((save / separate) * 100)}%)</div></div>
                      </div>
                      <div className="mt-2 text-[11px] text-cyan-200">İçerik: {contents.join(', ')}</div>
                      <button
                        onClick={() => handleBuy(item.id)}
                        disabled={busy || item.stock <= 0 || !canAfford}
                        className={`mt-3 w-full py-2 rounded-xl text-xs font-black transition active:scale-95 ${canAfford ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950' : 'bg-[#062430] text-teal-200/40'}`}
                      >
                        {item.stock <= 0 ? 'Tükendi' : !canAfford ? `Yetersiz KRD (${item.price})` : `Paketi Al (${item.price} KRD)`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {byType.bundles.length === 0 && <div className="text-xs text-teal-200/60">Paket bulunamadı.</div>}
          </div>
        )}

        {tab === 'support' && (
          <div className="space-y-3">
            {/* Exchange */}
            <div className="bg-gradient-to-r from-[#0b3848] via-[#072c39] to-[#0b3848] border border-teal-400/40 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-teal-300 uppercase tracking-wider">Toz → KRD</div>
                  <div className="text-sm font-bold text-white">Kur: {rate} Toz = 1 KRD</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { sounds.playClick(); setSellDustAmount(amt); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      sellDustAmount === amt
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950'
                        : 'bg-[#052430] text-teal-200 border border-teal-500/30'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
                <button
                  onClick={handleSellDust}
                  disabled={busy}
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl disabled:opacity-50"
                >
                  Çevir → +{krdReturn} KRD
                </button>
              </div>
              {exchangeMsg && (
                <div className="mt-3 bg-[#062e3c] border border-emerald-400/60 rounded-xl p-2 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> <span>{exchangeMsg}</span>
                </div>
              )}
            </div>

            {/* Consumables */}
            <div className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-3 space-y-2">
              <h3 className="text-sm font-black text-white font-display mb-1">Destek & Sarf Malzemeleri</h3>
              {byType.support.map((item) => (
                <div key={item.id} className="rounded-xl border border-teal-500/30 bg-[#052430]/80 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#083546] text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
                      {item.type === 'ore_bundle' ? <Sparkles className="w-4 h-4" /> : item.type === 'overclock_chip' ? <Zap className="w-4 h-4" /> : item.type === 'cosmic_pass' ? <Rocket className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-teal-200/70 truncate">{item.effectDescription}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-black text-amber-300 font-mono">{item.price}</span>
                    <button
                      onClick={() => handleBuy(item.id)}
                      disabled={busy || item.stock <= 0 || user.krdBalance < item.price}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 disabled:bg-[#062430] disabled:text-teal-200/40"
                    >
                      Al
                    </button>
                  </div>
                </div>
              ))}
              {byType.support.length === 0 && <div className="text-xs text-teal-200/60">Destek ürünü yok.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
