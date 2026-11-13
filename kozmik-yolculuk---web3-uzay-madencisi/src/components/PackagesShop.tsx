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
  const { user, planets, packages, adminSettings, buyPackage, setActiveTab, setIsDepositModalOpen } = useGame();

  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<number | 'all'>('all');
  const [calcInvestment, setCalcInvestment] = useState<number>(100);

  const rate = adminSettings.stardustPerUsdt || 1000;

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

  // ROI Calculator estimations
  const estimatedDaily = (calcInvestment * 0.58) / 100;
  const estimatedDailyDust = Math.floor(estimatedDaily * rate);
  const estimatedMonthly = estimatedDaily * 30;
  const estimated6Months = estimatedDaily * 180;
  const estimatedYearly = estimatedDaily * 365;

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-teal-200 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Rocket className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider">
                  Madencilik Filosu Mağazası
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  OTOMATİK ÜRETİM
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
                Kozmik Madenci Paketleri
              </h2>
              <p className="text-xs text-slate-500">
                Satın aldığınız her madenci 7/24 kesintisiz <strong>Uzay Tozu</strong> üretir. Tozları cüzdanda dilediğiniz an USDT'ye çevirebilirsiniz.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Kullanılabilir Bakiye</div>
              <div className="text-base font-black text-emerald-600 font-mono">
                ${user.usdtBalance.toFixed(2)} USDT
              </div>
            </div>
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-sm active:scale-95"
            >
              + Bakiye Yükle
            </button>
          </div>
        </div>

        {/* Planet Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedPlanetFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedPlanetFilter === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tüm Sektörler ({packages.length})
          </button>

          {planets.map((planet) => (
            <button
              key={planet.id}
              onClick={() => {
                sounds.playClick();
                setSelectedPlanetFilter(planet.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedPlanetFilter === planet.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🪐 {planet.name.split(' ')[0]} (x{planet.miningMultiplier}x)
            </button>
          ))}
        </div>
      </div>

      {/* ROI & Amorti Simulator Calculator */}
      <div className="bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Kazanç ve Amorti (ROI) Simülatörü
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Ortalama Amorti Süresi: <strong>160 - 180 Gün</strong>
          </span>
        </div>

        {/* Quick Slider / Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-500 font-medium">Yatırım Tutarı:</span>
          {[25, 75, 150, 300, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setCalcInvestment(amt)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                calcInvestment === amt
                  ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ${amt}
            </button>
          ))}
          <input
            type="number"
            min="10"
            value={calcInvestment}
            onChange={(e) => setCalcInvestment(Math.max(10, Number(e.target.value)))}
            className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-slate-900 font-mono outline-none"
          />
        </div>

        {/* Return Projections */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-500">Günlük Üretim</div>
            <div className="text-sm font-bold text-teal-700 font-mono mt-0.5">
              +{estimatedDailyDust.toLocaleString()} Toz
            </div>
            <div className="text-[10px] text-slate-400 font-mono">≈${estimatedDaily.toFixed(2)} USDT</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-500">30 Günlük (1 Ay)</div>
            <div className="text-sm font-bold text-cyan-800 font-mono mt-0.5">
              +${estimatedMonthly.toFixed(2)} USDT
            </div>
          </div>
          <div className="bg-cyan-50/70 border border-cyan-300 rounded-xl p-2.5">
            <div className="text-[10px] text-cyan-800 font-bold">180 Gün (Tam Amorti)</div>
            <div className="text-sm font-black text-amber-600 font-mono mt-0.5">
              +${estimated6Months.toFixed(2)} USDT (%104)
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-500">365 Gün (1 Yıl Net)</div>
            <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
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
          const dailyDust = Math.floor(pkg.dailyProduction * rate);

          return (
            <div
              key={pkg.id}
              className="relative overflow-hidden rounded-3xl border border-teal-200 bg-white hover:border-cyan-400 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-mono">
                          {pkg.badge}
                        </span>
                        {planet && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            🪐 {planet.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 font-display mt-0.5">
                        {pkg.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 font-mono leading-none">
                      ${pkg.price}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold font-mono">
                      USDT Fiyatı
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Key Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                    <div className="text-[10px] text-slate-500">Günlük Üretim</div>
                    <div className="text-xs font-black text-teal-700 font-mono mt-0.5">
                      +{dailyDust.toLocaleString()} Toz
                    </div>
                    <div className="text-[9px] text-slate-400">≈${pkg.dailyProduction.toFixed(2)} USDT</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                    <div className="text-[10px] text-slate-500">Amorti Süresi</div>
                    <div className="text-xs font-black text-amber-600 font-mono mt-0.5">
                      ~{pkg.coverDays} Gün
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                    <div className="text-[10px] text-slate-500">Günlük Oran</div>
                    <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                      %{pkg.dailyReturnPercent}
                    </div>
                  </div>
                </div>

                {/* Durability info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    Aşınma: %{pkg.durabilityDecayPerDay}/gün
                  </span>
                  <span className="font-mono text-cyan-800 font-bold">
                    {pkg.totalPurchased} Madenci Aktif
                  </span>
                </div>
              </div>

              {/* Purchase Action Button */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                {isPlanetLocked ? (
                  <button
                    onClick={() => setActiveTab('planets')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Önce Bu Gezegenin Kilidini Açın</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(pkg)}
                    className="w-full py-2.5 rounded-xl text-xs font-display tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black"
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
