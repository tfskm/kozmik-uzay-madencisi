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
    <div className="space-y-6 pb-24 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d3f4f] via-[#094857] to-[#0a3b4a] border border-cyan-400/40 rounded-2xl p-4 sm:p-5 shadow-xl glow-cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Uzay Filosu Teçhizat Pazarı</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
              Madenci Paketleri (~6 Ay Amorti)
            </h2>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
              Tüm madencilerimiz sürdürülebilir matematiksel ekonomiyle ortalama <strong>~180 günde (6 ayda)</strong> kendini tamamen amorti eder (cover). Sonrasında tamir kiti ile sınırsız net pasif gelir üretmeye devam eder.
            </p>
          </div>

          <div className="bg-[#052632] border border-emerald-400/60 rounded-2xl p-3 shrink-0 shadow-md">
            <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Cüzdan USDT Bakiyeniz</div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              ${user.usdtBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Planet Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-cyan-500/25 max-w-full scrollbar-none">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedPlanetFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 ${
              selectedPlanetFilter === 'all'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-md'
                : 'bg-[#07303e] hover:bg-[#0b3c4e] text-teal-200 border border-teal-500/30'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                  selectedPlanetFilter === planet.id
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 border-teal-300 shadow-md'
                    : 'bg-[#07303e]/70 hover:bg-[#0b3c4e] text-teal-200/80 border-teal-500/20'
                }`}
              >
                {!isUnlocked && <Lock className="w-3 h-3 text-amber-300" />}
                <span>{planet.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive ROI Calculator Accordion / Card */}
      <div className="bg-[#083444]/90 border border-cyan-400/40 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/25 text-teal-300 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              Kazanç ve Amorti Simülatörü
            </h3>
            <p className="text-[11px] text-teal-200/70">
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
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black'
                  : 'bg-[#052430] text-teal-200 hover:bg-[#0b394c] border border-teal-500/30'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Projection Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-[#05222c] border border-teal-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-teal-300/70">Günlük Hasılat</div>
            <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
              +${estimatedDaily.toFixed(2)} USDT
            </div>
          </div>
          <div className="bg-[#05222c] border border-teal-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-teal-300/70">30 Günlük (1 Ay)</div>
            <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
              +${estimatedMonthly.toFixed(2)} USDT
            </div>
          </div>
          <div className="bg-[#062e3c] border border-cyan-400/50 rounded-xl p-2.5">
            <div className="text-[10px] text-cyan-300 font-bold">180 Gün (Tam Amorti)</div>
            <div className="text-sm font-black text-amber-300 font-mono mt-0.5">
              +${estimated6Months.toFixed(2)} USDT (%104)
            </div>
          </div>
          <div className="bg-[#05222c] border border-teal-500/30 rounded-xl p-2.5">
            <div className="text-[10px] text-teal-300/70">365 Gün (1 Yıl Net)</div>
            <div className="text-sm font-bold text-teal-200 font-mono mt-0.5">
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
                  ? 'border-cyan-400/50 bg-gradient-to-br from-[#0c4052] via-[#093240] to-[#062532] shadow-xl glow-cyan'
                  : pkg.tier === 'neon'
                  ? 'border-teal-400/50 bg-gradient-to-br from-[#0a3f4c] via-[#08303a] to-[#06242c] shadow-lg'
                  : pkg.tier === 'gold'
                  ? 'border-emerald-400/50 bg-gradient-to-br from-[#0a4240] via-[#073230] to-[#052725] shadow-lg glow-emerald'
                  : 'border-cyan-500/35 bg-gradient-to-br from-[#0b3848] via-[#082d3a] to-[#06232e] hover:border-cyan-400/60 shadow-md'
              }`}
            >
              {/* Badge */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                        pkg.tier === 'quantum'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-pink-500/20'
                          : pkg.tier === 'neon'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-purple-500/20'
                          : pkg.tier === 'gold'
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-amber-500/20'
                          : 'bg-orange-500/25 text-orange-300 border border-orange-500/50 shadow-orange-500/20'
                      }`}
                    >
                      <Icon className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-amber-300 border border-orange-500/30 font-mono">
                          {pkg.badge}
                        </span>
                        {planet && (
                          <span className="text-[10px] text-amber-200/70 font-mono">
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
                    <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono leading-none">
                      ${pkg.price}
                    </div>
                    <div className="text-[10px] text-orange-400 font-bold font-mono">
                      USDT Fiyatı
                    </div>
                  </div>
                </div>

                <p className="text-xs text-teal-100/80 mt-3 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Key Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-[#052430]/90 border border-teal-500/25 rounded-xl p-2">
                    <div className="text-[10px] text-teal-300/70">Günlük Üretim</div>
                    <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">
                      +${pkg.dailyProduction.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-[#052430]/90 border border-teal-500/25 rounded-xl p-2">
                    <div className="text-[10px] text-cyan-300/80">Amorti Süresi</div>
                    <div className="text-xs font-black text-amber-300 font-mono mt-0.5">
                      ~{pkg.coverDays} Gün
                    </div>
                  </div>

                  <div className="bg-[#052430]/90 border border-teal-500/25 rounded-xl p-2">
                    <div className="text-[10px] text-teal-300/70">Günlük Oran</div>
                    <div className="text-xs font-bold text-teal-200 font-mono mt-0.5">
                      %{pkg.dailyReturnPercent}
                    </div>
                  </div>
                </div>

                {/* Durability info */}
                <div className="flex items-center justify-between text-[11px] text-teal-200/70 mt-3 pt-2.5 border-t border-cyan-500/20">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-300" />
                    Aşınma: %{pkg.durabilityDecayPerDay}/gün (Tamir Edilebilir)
                  </span>
                  <span className="font-mono text-cyan-200 font-bold">
                    {pkg.totalPurchased} Madenci Aktif
                  </span>
                </div>
              </div>

              {/* Purchase Action Button */}
              <div className="p-4 bg-[#05202a]/95 border-t border-cyan-500/25">
                {isPlanetLocked ? (
                  <button
                    onClick={() => setActiveTab('planets')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#093240] border border-cyan-500/40 text-cyan-200 hover:bg-[#0c3e50] transition flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Önce Bu Gezegenin Kilidini Açın</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(pkg)}
                    className="w-full py-2.5 rounded-xl text-xs font-display tracking-wider transition shadow-lg active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black shadow-teal-500/30"
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
