import React from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Globe2,
  Lock,
  CheckCircle2,
  Rocket,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlanetMap: React.FC = () => {
  const { user, planets, packages, unlockPlanet, travelToPlanet, setActiveTab } = useGame();

  const handleUnlock = async (planetId: number) => {
    const res = await unlockPlanet(planetId);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0d3f4f] via-[#094857] to-[#0a3b4a] border border-cyan-400/40 rounded-2xl p-4 shadow-xl glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-4 h-4 text-teal-300" />
            <span>Galaksi Haritası & Sektör Keşifleri</span>
          </div>
          <h2 className="text-xl font-black text-white font-display mt-0.5">Uzay Keşif Yolculuğu</h2>
          <p className="text-xs text-teal-100/90 mt-1 max-w-lg">
            İlerledikçe yeni gezegenlerin kilidini aç. Her gezegen daha yüksek üretim çarpanı (en fazla ×2.00) ve yeni
            ekipmanlar sunar.
          </p>
        </div>

        <div className="bg-[#052632] border border-cyan-400/50 rounded-2xl p-3 flex items-center gap-3 shrink-0 shadow-md">
          <div>
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Açılan Gezegenler</div>
            <div className="text-xl font-black text-emerald-300 font-mono">
              {user.unlockedPlanetIds.length} / {planets.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-200">
            <Rocket className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {planets.map((planet) => {
          const isUnlocked = user.unlockedPlanetIds.includes(planet.id);
          const isCurrent = user.currentPlanetId === planet.id;
          const levelOk = user.level >= planet.requiredLevel;
          const krdOk = user.krdBalance >= planet.unlockCostKRD;
          const planetPkgs = packages.filter((p) => p.planetId === planet.id && p.isActive);

          return (
            <div
              key={planet.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? 'border-cyan-300 bg-gradient-to-br from-[#0c3e50] to-[#072a37] shadow-xl glow-cyan ring-1 ring-cyan-400/50'
                  : isUnlocked
                  ? 'border-teal-500/35 bg-[#08303f]/90 hover:border-cyan-400/60 shadow-md'
                  : 'border-slate-800 bg-[#051e28]/80 opacity-80'
              }`}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${planet.gradient}`} />

              <div className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${planet.gradient} p-0.5 flex items-center justify-center shadow-lg`}
                      >
                        <div className="w-full h-full bg-[#06202c]/90 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                          <span className="text-[10px] text-cyan-300 font-mono font-bold">SEKTÖR</span>
                          <span className="text-lg font-black text-white font-display">0{planet.id}</span>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full font-display border border-[#06202c]">
                          BURADASIN
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white font-display">{planet.name}</h3>
                        <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />×{planet.miningMultiplier.toFixed(2)} üretim
                        </span>
                      </div>

                      <p className="text-xs text-teal-200/90 font-medium mt-0.5">{planet.tagline}</p>
                      <p className="text-xs text-teal-100/70 mt-1 max-w-xl line-clamp-2">{planet.description}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono text-teal-200/80">
                        <span className="bg-[#052430] px-2 py-0.5 rounded border border-teal-500/30 text-cyan-300">
                          ✨ {planet.specialOre}
                        </span>
                        <span className="bg-[#052430] px-2 py-0.5 rounded border border-teal-500/30">
                          🪐 {planet.gravity}
                        </span>
                        <span className="bg-[#052430] px-2 py-0.5 rounded border border-teal-500/30">
                          📦 {planetPkgs.length} paket
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-teal-500/20">
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-[#062a38] border border-cyan-400/40 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Aktif üssün</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => travelToPlanet(planet.id)}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Bu gezegene geç</span>
                      </button>
                    ) : (
                      <div className="space-y-2 w-full sm:w-auto">
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 sm:justify-end">
                          <span>Gereksinim:</span>
                          <span className={levelOk ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            Seviye {planet.requiredLevel}
                          </span>
                          <span className="text-teal-500/40">•</span>
                          <span className={krdOk ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {planet.unlockCostKRD} KRD
                          </span>
                        </div>

                        <button
                          onClick={() => handleUnlock(planet.id)}
                          disabled={!levelOk}
                          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Kilidi Aç ({planet.unlockCostKRD} KRD)</span>
                        </button>
                      </div>
                    )}

                    {planetPkgs.length > 0 && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setActiveTab('packages');
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 mt-2 font-medium flex items-center gap-1 sm:justify-end"
                      >
                        <span>Sektör paketlerini incele ({planetPkgs.length})</span>
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
