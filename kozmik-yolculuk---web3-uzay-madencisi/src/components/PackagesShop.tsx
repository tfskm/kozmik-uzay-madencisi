import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { MiningPackage } from '../types';
import {
  PackageCheck,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Wrench,
  Bot,
  Radio,
  Truck,
  Cpu,
  Compass,
  Rocket,
  Atom,
  Sparkles,
  Calculator,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ICON_MAP: Record<string, React.ElementType> = {
  Bot,
  Radio,
  Truck,
  Cpu,
  Compass,
  Rocket,
  Atom,
  Sparkles,
};

export const PackagesShop: React.FC = () => {
  const { user, planets, packages, buyPackage, setActiveTab, setIsDepositModalOpen } = useGame();

  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<number | 'all'>('all');
  const [calcInvestment, setCalcInvestment] = useState<number>(100);

  const filteredPackages = packages.filter((pkg) => {
    if (!pkg.isActive) return false;
    if (selectedPlanetFilter === 'all') return true;
    return pkg.planetId === selectedPlanetFilter;
  });

  const handleBuy = (pkg: MiningPackage) => {
    const res = buyPackage(pkg);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      });
      alert(res.message);
    } else {
      if (res.message.includes('Yetersiz USDT')) {
        if (confirm(`${res.message}\n\nHemen cüzdanınızdan bakiye yüklemek ister misiniz?`)) {
          setIsDepositModalOpen(true);
        }
      } else {
        alert(res.message);
      }
    }
  };

  // ROI Calculator projection
  const estimatedDaily = (calcInvestment * 0.58) / 100;
  const estimatedMonthly = estimatedDaily * 30;
  const estimated6Months = estimatedDaily * 180; // ~104% ROI (Full cover)
  const estimatedYearly = estimatedDaily * 365;  // ~210% ROI

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <PackageCheck className="w-4 h-4" />
              <span>Uzay Filosu Teçhizat Pazarı</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
              Madenci Paketleri (~6 Ay Amorti)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Tüm madencilerimiz sürdürülebilir matematiksel ekonomiyle ortalama <strong>~180 günde (6 ayda)</strong> kendini tamamen amorti eder (cover). Sonrasında tamir kiti ile sınırsız net pasif gelir üretmeye devam eder.
            </p>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 shrink-0">
            <div className="text-[10px] text-emerald-400 font-semibold">Cüzdan USDT Bakiyeniz</div>
            <div className="text-xl font-black text-emerald-300 font-mono">
              ${user.usdtBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Planet Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-indigo-900/40 no-scrollbar">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedPlanetFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedPlanetFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Tüm Gezegenler ({packages.length})
          </button>

          {planets.map((planet) => {
            const count = packages.filter((p) => p.planetId === planet.id).length;
            const isUnlocked = user.unlockedPlanetIds.includes(planet.id);

            return (
              <button
                key={planet.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedPlanetFilter(planet.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                  selectedPlanetFilter === planet.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-750 text-slate-400'
                }`}
              >
                {!isUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
                <span>{planet.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive ROI Calculator Accordion / Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              Kazanç ve Amorti Simülatörü
            </h3>
            <p className="text-[11px] text-slate-400">
              Yatırım tutarınızı seçerek 6 aylık cover ve 1 yıllık net kazanç projeksiyonunu görün
            </p>
          </div>
        </div>

        {/* Amount Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto mb-3">
          {[25, 75, 150, 350, 750, 1500, 3000].map((amt) => (
            <button
              key={amt}
              onClick={() => {
                sounds.playClick();
                setCalcInvestment(amt);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                calcInvestment === amt
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Projection Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">Günlük Hasılat</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              +${estimatedDaily.toFixed(2)} USDT
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">30 Günlük (1 Ay)</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
              +${estimatedMonthly.toFixed(2)} USDT
            </div>
          </div>
          <div className="bg-slate-950/60 border border-indigo-500/40 rounded-xl p-2.5 bg-indigo-950/20">
            <div className="text-[10px] text-indigo-300 font-bold">180 Gün (Tam Amorti)</div>
            <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
              +${estimated6Months.toFixed(2)} USDT (%104)
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">365 Gün (1 Yıl Net)</div>
            <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">
              +${estimatedYearly.toFixed(2)} USDT (%212)
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => {
          const Icon = ICON_MAP[pkg.iconName] || Bot;
          const planet = planets.find((p) => p.id === pkg.planetId);
          const isPlanetLocked = planet ? !user.unlockedPlanetIds.includes(planet.id) : false;

          return (
            <div
              key={pkg.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                pkg.tier === 'quantum'
                  ? 'border-pink-500/40 bg-gradient-to-br from-slate-900 via-pink-950/20 to-slate-950 glow-rose'
                  : pkg.tier === 'neon'
                  ? 'border-purple-500/40 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-950 glow-purple'
                  : pkg.tier === 'gold'
                  ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 glow-gold'
                  : 'border-cyan-500/30 bg-slate-900/80 hover:border-cyan-500/50'
              }`}
            >
              {/* Badge */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        pkg.tier === 'quantum'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                          : pkg.tier === 'neon'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : pkg.tier === 'gold'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono">
                          {pkg.badge}
                        </span>
                        {planet && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            🪐 {planet.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white font-display mt-0.5">
                        {pkg.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                      ${pkg.price}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold font-mono">
                      USDT Fiyatı
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300/90 mt-3 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Key Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Günlük Üretim</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      +${pkg.dailyProduction.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Amorti Süresi</div>
                    <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                      ~{pkg.coverDays} Gün
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400">Günlük Getiri</div>
                    <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5">
                      %{pkg.dailyReturnPercent}
                    </div>
                  </div>
                </div>

                {/* Durability info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    Aşınma: %{pkg.durabilityDecayPerDay}/gün (Tamir Edilebilir)
                  </span>
                  <span className="font-mono text-indigo-300">
                    {pkg.totalPurchased} Madenci Aktif
                  </span>
                </div>
              </div>

              {/* Purchase Action Button */}
              <div className="p-4 bg-slate-950/60 border-t border-white/5">
                {isPlanetLocked ? (
                  <button
                    onClick={() => setActiveTab('planets')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-950/50 border border-amber-600/40 text-amber-300 hover:bg-amber-900/60 transition flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Önce Bu Gezegenin Kilidini Açın</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(pkg)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold font-display tracking-wider transition shadow-md active:scale-98 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black shadow-emerald-500/20"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Hemen Filoya Kat (${pkg.price} USDT)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
