import React from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Globe2,
  Lock,
  CheckCircle2,
  Rocket,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlanetMap: React.FC = () => {
  const {
    user,
    planets,
    packages,
    unlockPlanet,
    travelToPlanet,
    setActiveTab,
  } = useGame();

  const handleUnlock = (planetId: number) => {
    const res = unlockPlanet(planetId);
    if (res.success) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#ec4899', '#3b82f6'],
      });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-5 pb-24 w-full max-w-full overflow-hidden text-slate-800">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Galaksi Haritası & Sektör Keşifleri</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
            Uzay Keşif Yolculuğu
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-lg">
            İlerledikçe yeni gezegenlerin kilidini açın. Her yeni gezegen daha yüksek madencilik çarpanı (x4.00'e kadar!), nadir cevherler ve elit yatırım paketleri sunar.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3 shrink-0 shadow-xs">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Keşfedilen Gezegenler</div>
            <div className="text-xl font-black text-teal-700 font-mono">
              {user.unlockedPlanetIds.length} / {planets.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs">
            <Rocket className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Planetary Stellar Chain */}
      <div className="space-y-4">
        {planets.map((planet) => {
          const isUnlocked = user.unlockedPlanetIds.includes(planet.id);
          const isCurrent = user.currentPlanetId === planet.id;
          const canUnlock = user.level >= planet.requiredLevel;
          const planetPkgs = packages.filter((p) => p.planetId === planet.id);

          return (
            <div
              key={planet.id}
              className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                isCurrent
                  ? 'border-cyan-400 bg-gradient-to-br from-white via-cyan-50/60 to-white shadow-md ring-2 ring-cyan-400/40'
                  : isUnlocked
                  ? 'border-teal-200 bg-white hover:border-cyan-300 shadow-sm'
                  : 'border-slate-200 bg-slate-50/80 opacity-85'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${planet.gradient}`} />

              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Planet Core Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Visual Sphere Badge */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${planet.gradient} p-0.5 flex items-center justify-center shadow-sm`}
                      >
                        <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                          <span className="text-[10px] text-teal-700 font-mono font-bold">
                            SEKTÖR
                          </span>
                          <span className="text-lg font-black text-slate-900 font-display">
                            0{planet.id}
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full font-display border border-white shadow-xs">
                          BURADASINIZ
                        </div>
                      )}
                    </div>

                    {/* Titles & Specs */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                          {planet.name}
                        </h3>
                        <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          x{planet.miningMultiplier.toFixed(2)} Üretim
                        </span>
                      </div>

                      <p className="text-xs text-teal-800 font-semibold mt-0.5">
                        {planet.tagline}
                      </p>

                      <p className="text-xs text-slate-600 mt-1 max-w-xl line-clamp-2">
                        {planet.description}
                      </p>

                      {/* Micro Specs */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono text-slate-600">
                        <span className="bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-cyan-900 font-semibold">
                          ✨ Özel Cevher: <strong>{planet.specialOre}</strong>
                        </span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          🪐 Yerçekimi: {planet.gravity}
                        </span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          📦 {planetPkgs.length} Özel Paket
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Control / Actions */}
                  <div className="flex flex-col sm:items-end justify-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-300 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mevcut Aktif Üssünüz</span>
                      </div>
                    ) : isUnlocked ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => travelToPlanet(planet.id)}
                          className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          <span>Bu Gezegene Işınlan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 w-full sm:w-auto">
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 sm:justify-end">
                          <span>Gereksinim:</span>
                          <span
                            className={
                              canUnlock ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'
                            }
                          >
                            Seviye {planet.requiredLevel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnlock(planet.id)}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Kilidi Aç (${planet.unlockCostUSDT} USDT + {planet.unlockCostStardust} Toz)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* View Packages Button */}
                    {planetPkgs.length > 0 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setActiveTab('packages');
                        }}
                        className="text-[11px] text-teal-700 hover:text-teal-900 mt-2 font-bold flex items-center gap-1 sm:justify-end"
                      >
                        <span>Sektör Paketlerini İncele ({planetPkgs.length}) ➔</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
