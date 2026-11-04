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
    <div className="space-y-5 pb-24 w-full max-w-full overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#2c123a] via-[#1a0928] to-[#2c123a] border border-orange-500/35 rounded-2xl p-4 shadow-xl glow-orange">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-4 h-4 animate-spin text-orange-400" />
            <span>Galaksi Haritası & Sektör Keşifleri</span>
          </div>
          <h2 className="text-xl font-black text-white font-display mt-0.5">
            Uzay Keşif Yolculuğu
          </h2>
          <p className="text-xs text-amber-100/80 mt-1 max-w-lg">
            İlerledikçe yeni gezegenlerin kilidini açın. Her yeni gezegen daha yüksek madencilik çarpanı (x4.00'e kadar!), nadir cevherler ve elit yatırım paketleri sunar.
          </p>
        </div>

        <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3 flex items-center gap-3 shrink-0 shadow-md">
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Keşfedilen Gezegenler</div>
            <div className="text-xl font-black text-amber-300 font-mono">
              {user.unlockedPlanetIds.length} / {planets.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/25 border border-orange-500/40 flex items-center justify-center text-amber-300">
            <Rocket className="w-5 h-5" />
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
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? 'border-orange-400 bg-gradient-to-br from-[#2a1138] to-[#180a25] shadow-xl glow-orange ring-1 ring-orange-400/40'
                  : isUnlocked
                  ? 'border-orange-500/25 bg-[#1c0c29]/80 hover:border-orange-500/50'
                  : 'border-slate-800/80 bg-slate-950/60 opacity-85'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${planet.gradient}`} />

              <div className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Planet Core Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Visual Sphere Badge */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${planet.gradient} p-0.5 flex items-center justify-center shadow-lg`}
                      >
                        <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                          <span className="text-[10px] text-cyan-300 font-mono font-bold">
                            SEKTÖR
                          </span>
                          <span className="text-lg font-black text-white font-display">
                            0{planet.id}
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full font-display border border-slate-900">
                          BURADASINIZ
                        </div>
                      )}
                    </div>

                    {/* Titles & Specs */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white font-display">
                          {planet.name}
                        </h3>
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          x{planet.miningMultiplier.toFixed(2)} Üretim
                        </span>
                      </div>

                      <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                        {planet.tagline}
                      </p>

                      <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                        {planet.description}
                      </p>

                      {/* Micro Specs */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono text-slate-400">
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                          ✨ Özel Cevher: <strong>{planet.specialOre}</strong>
                        </span>
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          🪐 Yerçekimi: {planet.gravity}
                        </span>
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          📦 {planetPkgs.length} Özel Paket
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Control / Actions */}
                  <div className="flex flex-col sm:items-end justify-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>Mevcut Aktif Üssünüz</span>
                      </div>
                    ) : isUnlocked ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => travelToPlanet(planet.id)}
                          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          <span>Bu Gezegene Işınlan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 w-full sm:w-auto">
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 sm:justify-end">
                          <span>Gereksinim:</span>
                          <span
                            className={
                              canUnlock ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                            }
                          >
                            Seviye {planet.requiredLevel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnlock(planet.id)}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
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
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-2 font-medium flex items-center gap-1 sm:justify-end"
                      >
                        <span>Sektör Paketlerini İncele ({planetPkgs.length})</span>
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
