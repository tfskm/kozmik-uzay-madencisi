import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { UserMiner } from '../types';
import {
  Sparkles,
  Zap,
  Swords,
  Crosshair,
  ShieldAlert,
  Flame,
  Radio,
  Target,
  Wrench,
  Bot,
  Rocket,
  Compass,
  Cpu,
  Truck,
  Atom,
  RefreshCw,
  Globe2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const CosmicCommandArena: React.FC = () => {
  const {
    user,
    currentPlanet,
    userMiners,
    planets,
    travelToPlanet,
    currentBattle,
    startBattle,
    attackEnemy,
    manualClickMine,
    setIsRepairModalOpen,
    setSelectedMinerForRepair,
    setActiveTab,
  } = useGame();

  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [laserEffect, setLaserEffect] = useState<{ x: number; y: number } | null>(null);
  const [selectedOrbitShip, setSelectedOrbitShip] = useState<UserMiner | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  // Manual Click to Mine on Planet
  const handlePlanetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentBattle && !currentBattle.isDefeated) {
      // If battle is active, clicking planet attacks enemy
      handleAttackEnemy();
      return;
    }

    const rect = arenaRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 150;
    const y = rect ? e.clientY - rect.top : 150;

    const result = manualClickMine();

    // Floating text feedback
    const newFloat: FloatingNumber = {
      id: Date.now() + Math.random(),
      x,
      y: y - 20,
      text: `+$${result.usdtEarned} • +${result.stardustEarned} Toz`,
      color: '#34d399',
    };

    setFloatingNumbers((prev) => [...prev.slice(-8), newFloat]);

    // Laser tap spark
    setLaserEffect({ x, y });
    setTimeout(() => setLaserEffect(null), 300);
  };

  const handleAttackEnemy = () => {
    if (!currentBattle || currentBattle.isDefeated) return;
    const res = attackEnemy(30);

    const rect = arenaRef.current?.getBoundingClientRect();
    const x = rect ? rect.width / 2 : 200;
    const y = rect ? 80 : 80;

    const newFloat: FloatingNumber = {
      id: Date.now() + Math.random(),
      x: x + (Math.random() * 60 - 30),
      y: y + (Math.random() * 40 - 20),
      text: res.defeated ? `🏆 BOUNTY: +$${res.loot?.usdt} USDT!` : `💥 -${30 + userMiners.length * 4} HASAR!`,
      color: res.defeated ? '#fbbf24' : '#f87171',
    };

    setFloatingNumbers((prev) => [...prev.slice(-8), newFloat]);

    if (res.defeated) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#ef4444', '#fbbf24', '#38bdf8'],
      });
    }
  };

  // Clean floating numbers after 1.2s
  useEffect(() => {
    if (!floatingNumbers.length) return;
    const timer = setTimeout(() => {
      setFloatingNumbers((prev) => prev.slice(1));
    }, 1200);
    return () => clearTimeout(timer);
  }, [floatingNumbers]);

  // Planet specific visual styling
  const planetVisuals: Record<number, { bg: string; glow: string; shadow: string; surface: string }> = {
    1: {
      bg: 'radial-gradient(circle at 35% 35%, #93c5fd, #2563eb 45%, #0f172a 85%)',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.6)]',
      shadow: '#1e3a8a',
      surface: 'Ay Kraterleri & Titanyum Vadisi',
    },
    2: {
      bg: 'radial-gradient(circle at 35% 35%, #fca5a5, #dc2626 50%, #450a0a 90%)',
      glow: 'shadow-[0_0_55px_rgba(239,68,68,0.65)]',
      shadow: '#7f1d1d',
      surface: 'Kızıl Kanyon & Volkanik Plazma',
    },
    3: {
      bg: 'radial-gradient(circle at 35% 35%, #67e8f9, #0891b2 50%, #083344 90%)',
      glow: 'shadow-[0_0_60px_rgba(6,182,212,0.65)]',
      shadow: '#164e63',
      surface: 'Buzaltı Okyanusu & Süperiletkenler',
    },
    4: {
      bg: 'radial-gradient(circle at 35% 35%, #fde047, #d97706 50%, #451a03 90%)',
      glow: 'shadow-[0_0_65px_rgba(245,158,11,0.65)]',
      shadow: '#78350f',
      surface: 'Satürn Altın Halkaları & Asteroitler',
    },
    5: {
      bg: 'radial-gradient(circle at 35% 35%, #f472b6, #9333ea 50%, #2e1065 90%)',
      glow: 'shadow-[0_0_70px_rgba(168,85,247,0.7)]',
      shadow: '#581c87',
      surface: 'Siber Nebula İyon Gaz Bulutu',
    },
    6: {
      bg: 'radial-gradient(circle at 40% 40%, #fb7185, #be185d 40%, #000000 80%)',
      glow: 'shadow-[0_0_80px_rgba(236,72,153,0.85)]',
      shadow: '#831843',
      surface: 'Kuasar Tekillik & Olay Ufku',
    },
  };

  const pVis = planetVisuals[currentPlanet.id] || planetVisuals[1];

  return (
    <div className="space-y-4">
      {/* Planetary Sector Navigator Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {planets.map((planet) => {
          const isCurrent = planet.id === currentPlanet.id;
          const isUnlocked = user.unlockedPlanetIds.includes(planet.id);

          return (
            <button
              key={planet.id}
              onClick={() => {
                if (isUnlocked) {
                  travelToPlanet(planet.id);
                } else {
                  setActiveTab('planets');
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-600/30 border-cyan-400 text-white shadow-lg glow-cyan'
                  : isUnlocked
                  ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                  : 'bg-slate-950/60 border-slate-900 text-slate-600'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: planet.color }}
              />
              <span className="font-display">S{planet.id}: {planet.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-normal">
                x{planet.miningMultiplier.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN 3D COSMIC ARENA CANVAS */}
      <div
        ref={arenaRef}
        onClick={handlePlanetClick}
        className="relative h-96 sm:h-[420px] w-full rounded-3xl overflow-hidden border border-indigo-500/40 bg-gradient-to-b from-[#060818] via-[#090d29] to-[#040614] select-none cursor-crosshair shadow-2xl glow-purple"
      >
        {/* Deep Space Starfield & Cosmic Dust */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-12 left-16 animate-ping" />
          <div className="w-1 h-1 rounded-full bg-cyan-300 absolute top-28 right-24 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-purple-400/80 absolute bottom-24 left-32 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute top-1/2 right-12 animate-ping" />
        </div>

        {/* Top HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-500/30 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-black text-white font-display uppercase tracking-wider">
                {currentPlanet.name}
              </span>
              <span className="text-cyan-400 font-mono ml-2 font-bold text-[11px]">
                x{currentPlanet.miningMultiplier.toFixed(2)} Madencilik Çarpanı
              </span>
            </div>
          </div>

          {/* Quick Battle Summon / Alert */}
          {!currentBattle ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startBattle();
              }}
              className="pointer-events-auto flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black font-display uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg shadow-rose-950 transition active:scale-95 animate-pulse"
            >
              <Swords className="w-4 h-4" />
              <span>Korsan Avı Başlat</span>
            </button>
          ) : (
            <div className="bg-rose-950/80 border border-rose-500/60 px-3 py-1 rounded-xl flex items-center gap-2 animate-bounce">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-spin" />
              <span className="text-xs font-black text-rose-300 font-display">
                KORSAN BASKINI! ({currentBattle.timeRemainingSeconds}s)
              </span>
            </div>
          )}
        </div>

        {/* ACTIVE SPACE BATTLE ENEMY OVERLAY (IF IN COMBAT) */}
        {currentBattle && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAttackEnemy();
            }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-30 cursor-pointer group transition-transform active:scale-95"
          >
            <div className="bg-slate-950/90 border border-rose-500/70 p-3 rounded-2xl flex items-center gap-3 shadow-2xl glow-rose">
              <div className="w-14 h-14 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition animate-bounce">
                {currentBattle.avatar}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white font-display">
                    {currentBattle.enemyName}
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    Ödül: ${currentBattle.usdtBounty} USDT
                  </span>
                </div>

                {/* HP Bar */}
                <div className="w-40 sm:w-56 bg-slate-800 rounded-full h-3 mt-1.5 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-200"
                    style={{
                      width: `${Math.max(5, (currentBattle.currentHp / currentBattle.maxHp) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>
                    HP: {currentBattle.currentHp}/{currentBattle.maxHp}
                  </span>
                  <span className="text-cyan-400 font-bold animate-pulse">
                    🎯 VURMAK İÇİN TIKLA!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THE CENTRAL GLOWING 3D PLANET */}
        <div className="absolute inset-0 m-auto w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center pointer-events-none">
          {/* Outer Atmosphere Glow */}
          <div
            className={`absolute inset-0 rounded-full pointer-events-none ${pVis.glow} opacity-80 animate-pulse`}
          />

          {/* Saturn-like Ring if Planet 4 */}
          {currentPlanet.id === 4 && (
            <div className="absolute w-80 sm:w-96 h-20 rounded-full border-4 border-amber-400/40 rotate-[-25deg] shadow-lg pointer-events-none" />
          )}

          {/* Planet Sphere Body */}
          <div
            className="w-full h-full rounded-full shadow-2xl relative overflow-hidden transition-all duration-700 pointer-events-auto cursor-pointer"
            style={{ background: pVis.bg }}
          >
            {/* Crater & Texture shadows */}
            <div className="absolute inset-0 rounded-full shadow-[inset_-30px_-30px_60px_rgba(0,0,0,0.85)] pointer-events-none" />
            <div className="absolute inset-0 rounded-full shadow-[inset_15px_15px_30px_rgba(255,255,255,0.25)] pointer-events-none" />

            {/* Planet Center Label & Tap Hint */}
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
              <span className="text-xl sm:text-2xl drop-shadow-md">🪐</span>
              <span className="text-xs font-black text-white font-display drop-shadow tracking-wider mt-1 uppercase">
                {currentPlanet.name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-bold text-cyan-200 drop-shadow font-mono bg-black/40 px-2 py-0.5 rounded-full mt-1">
                ⛏️ Tıkla & Hasat Et
              </span>
            </div>
          </div>
        </div>

        {/* ORBITING USER MINER FLEET SHIPS (Real purchased ships!) */}
        {userMiners.map((miner, index) => {
          // Calculate orbital positions based on index
          const total = Math.max(1, userMiners.length);
          const angleOffset = (index * 360) / total;
          const orbitRadiusX = 135 + (index % 3) * 20;
          const orbitRadiusY = 75 + (index % 3) * 15;
          const animDuration = 12 + index * 3;

          return (
            <div
              key={miner.instanceId}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrbitShip(miner);
              }}
              style={{
                animation: `orbit-${index % 4} ${animDuration}s linear infinite`,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
            >
              {/* Ship Body */}
              <div
                className={`relative p-2 rounded-2xl backdrop-blur-md border transition-all duration-200 group-hover:scale-125 shadow-xl ${
                  miner.durability < 40
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : 'bg-slate-900/90 border-cyan-400/70 text-cyan-300 glow-cyan'
                }`}
                style={{
                  transform: `translate(${Math.cos((angleOffset * Math.PI) / 180) * orbitRadiusX}px, ${
                    Math.sin((angleOffset * Math.PI) / 180) * orbitRadiusY
                  }px)`,
                }}
              >
                {/* Engine Thruster Flame */}
                <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 blur-[2px] animate-ping" />

                <div className="flex items-center gap-1.5 text-xs font-bold font-display">
                  <Rocket className="w-4 h-4 transform rotate-45 text-cyan-400 group-hover:rotate-90 transition" />
                  <span className="hidden sm:inline text-[11px] truncate max-w-[80px]">
                    {miner.packageName.split(' ')[0]}
                  </span>
                </div>

                {/* Micro Durability & Earning tag */}
                <div className="text-[9px] font-mono text-emerald-300 flex items-center justify-between gap-1 mt-0.5">
                  <span>+${miner.unclaimedYield.toFixed(3)}</span>
                  <span
                    className={miner.durability < 40 ? 'text-rose-400 font-bold' : 'text-slate-400'}
                  >
                    %{Math.round(miner.durability)}
                  </span>
                </div>

                {/* Laser beam connecting ship to planet */}
                <div className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-gradient-to-r from-cyan-400/80 via-emerald-400/40 to-transparent pointer-events-none -z-10 rotate-45 transform origin-left" />
              </div>
            </div>
          );
        })}

        {/* If user has no miners, show a friendly tutorial probe in orbit */}
        {userMiners.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-950/85 border border-indigo-500/40 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xl">🛸</span>
            <div className="text-xs">
              <span className="font-bold text-white">Yörüngede Henüz Gemi Yok!</span>
              <p className="text-[11px] text-slate-400">
                Aşağıdan ilk paketinizi satın alarak madenci filonuzu buraya konuşlandırın.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('packages');
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition"
            >
              Gemi Al
            </button>
          </div>
        )}

        {/* Floating Numbers / Damage / Loot Popups */}
        {floatingNumbers.map((fn) => (
          <div
            key={fn.id}
            style={{ left: fn.x, top: fn.y, color: fn.color }}
            className="absolute z-40 text-xs sm:text-sm font-black font-mono pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce"
          >
            {fn.text}
          </div>
        ))}

        {/* Laser Tap Spark Feedback */}
        {laserEffect && (
          <div
            style={{ left: laserEffect.x - 16, top: laserEffect.y - 16 }}
            className="absolute z-30 w-8 h-8 rounded-full border-2 border-cyan-400 bg-cyan-400/30 blur-sm pointer-events-none animate-ping"
          />
        )}

        {/* Bottom Station Status Indicators */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 flex items-center gap-2 font-mono text-[11px]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-slate-300">Radar: Güvenli Bölge</span>
            <span className="text-emerald-400 font-bold ml-1">
              Filo: {userMiners.length} Birim
            </span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[11px] font-mono text-amber-300">
            ⚡ Enerji: {user.energy}/{user.maxEnergy}
          </div>
        </div>
      </div>

      {/* SELECTED SHIP QUICK INSPECT & REPAIR MODAL */}
      {selectedOrbitShip && (
        <div className="bg-slate-900/90 border border-indigo-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 glow-cyan animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xl shrink-0">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm font-display">
                  {selectedOrbitShip.packageName}
                </h4>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  +${selectedOrbitShip.dailyYield.toFixed(2)}/gün
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                Dayanıklılık: %{Math.round(selectedOrbitShip.durability)} • Biriken Hasılat: $
                {selectedOrbitShip.unclaimedYield.toFixed(4)} USDT
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedOrbitShip.durability < 100 && (
              <button
                onClick={() => {
                  setSelectedMinerForRepair(selectedOrbitShip);
                  setIsRepairModalOpen(true);
                  setSelectedOrbitShip(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Hangarda Tamir Et</span>
              </button>
            )}

            <button
              onClick={() => setSelectedOrbitShip(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
