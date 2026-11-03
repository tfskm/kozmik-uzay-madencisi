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
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Planetary Sector Navigator Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
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
                  ? 'bg-gradient-to-r from-orange-500/25 via-amber-500/20 to-purple-600/30 border-orange-400 text-white shadow-lg glow-orange'
                  : isUnlocked
                  ? 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-orange-500/50'
                  : 'bg-slate-950/60 border-slate-900 text-slate-600'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: planet.color }}
              />
              <span className="font-display">S{planet.id}: {planet.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
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
        className="relative h-96 sm:h-[420px] w-full max-w-full rounded-3xl overflow-hidden border border-orange-500/35 bg-gradient-to-b from-[#1c0b29] via-[#120820] to-[#090412] select-none cursor-crosshair shadow-2xl glow-orange"
      >
        {/* Warm Galactic Nebula Clouds */}
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-12 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 rounded-full bg-pink-600/15 blur-3xl pointer-events-none" />

        {/* Deep Space Starfield & Cosmic Dust */}
        <div className="absolute inset-0 pointer-events-none opacity-80">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-200 absolute top-12 left-16 animate-ping" />
          <div className="w-1 h-1 rounded-full bg-orange-300 absolute top-28 right-24 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-pink-400/80 absolute bottom-24 left-32 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1/2 right-12 animate-ping" />
          <div className="w-1 h-1 rounded-full bg-yellow-200 absolute bottom-12 right-28 animate-pulse" />
        </div>

        {/* Top HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-orange-500/30 pointer-events-auto shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-black text-white font-display uppercase tracking-wider">
                {currentPlanet.name}
              </span>
              <span className="text-amber-400 font-mono ml-1.5 font-bold text-[11px]">
                x{currentPlanet.miningMultiplier.toFixed(2)}
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
              className="pointer-events-auto flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black font-display uppercase tracking-wider text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-lg shadow-orange-950 transition active:scale-95 animate-pulse"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Korsan Avı</span>
            </button>
          ) : (
            <div className="bg-rose-950/90 border border-rose-500/70 px-2 sm:px-3 py-1 rounded-xl flex items-center gap-1.5 animate-bounce">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              <span className="text-[11px] sm:text-xs font-black text-rose-300 font-display">
                KORSAN! ({currentBattle.timeRemainingSeconds}s)
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
            className="absolute top-14 left-1/2 -translate-x-1/2 z-30 cursor-pointer group transition-transform active:scale-95 w-[92%] max-w-sm"
          >
            <div className="bg-slate-950/95 border border-rose-500/70 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-2xl glow-rose">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition animate-bounce">
                {currentBattle.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-white font-display truncate">
                    {currentBattle.enemyName}
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold shrink-0">
                    +${currentBattle.usdtBounty} USDT
                  </span>
                </div>

                {/* HP Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 sm:h-3 mt-1.5 overflow-hidden border border-white/10">
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
                  <span className="text-amber-400 font-bold animate-pulse">
                    🎯 VURMAK İÇİN TIKLA!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THE CENTRAL GLOWING 3D PLANET */}
        <div className="absolute inset-0 m-auto w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center pointer-events-none">
          {/* Outer Atmosphere Glow */}
          <div
            className={`absolute inset-0 rounded-full pointer-events-none ${pVis.glow} opacity-90 animate-pulse`}
          />

          {/* Saturn-like Ring if Planet 4 */}
          {currentPlanet.id === 4 && (
            <div className="absolute w-56 sm:w-72 h-14 sm:h-18 rounded-full border-4 border-amber-400/50 rotate-[-25deg] shadow-lg pointer-events-none" />
          )}

          {/* Planet Sphere Body */}
          <div
            className="w-full h-full rounded-full shadow-2xl relative overflow-hidden transition-all duration-700 pointer-events-auto cursor-pointer"
            style={{ background: pVis.bg }}
          >
            {/* Crater & Texture shadows */}
            <div className="absolute inset-0 rounded-full shadow-[inset_-25px_-25px_50px_rgba(0,0,0,0.85)] pointer-events-none" />
            <div className="absolute inset-0 rounded-full shadow-[inset_12px_12px_24px_rgba(255,255,255,0.3)] pointer-events-none" />

            {/* Planet Center Label & Tap Hint */}
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2.5">
              <span className="text-xl sm:text-2xl drop-shadow-md">🪐</span>
              <span className="text-[11px] sm:text-xs font-black text-white font-display drop-shadow tracking-wider mt-0.5 uppercase truncate max-w-full">
                {currentPlanet.name.split(' ')[0]}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-amber-300 drop-shadow font-mono bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-amber-400/40 glow-orange">
                ⛏️ Tıkla & Hasat Et
              </span>
            </div>
          </div>
        </div>

        {/* ORBITING USER MINER FLEET SHIPS (Real purchased ships!) */}
        {userMiners.map((miner, index) => {
          // Responsive orbital radius scaling so ships never clip or wobble mobile
          const total = Math.max(1, userMiners.length);
          const angleOffset = (index * 360) / total;
          // Scale down orbit radius on mobile to prevent any horizontal overflow
          const baseRadiusX = 82 + (index % 3) * 12;
          const baseRadiusY = 44 + (index % 3) * 8;
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
                className={`relative p-1.5 sm:p-2 rounded-xl backdrop-blur-md border transition-all duration-200 group-hover:scale-125 shadow-xl ${
                  miner.durability < 40
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300'
                    : 'bg-[#220f38]/95 border-amber-400/80 text-amber-300 glow-orange'
                }`}
                style={{
                  transform: `translate(${Math.cos((angleOffset * Math.PI) / 180) * baseRadiusX}px, ${
                    Math.sin((angleOffset * Math.PI) / 180) * baseRadiusY
                  }px)`,
                }}
              >
                {/* Engine Thruster Flame */}
                <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 blur-[2px] animate-ping" />

                <div className="flex items-center gap-1 text-[11px] font-bold font-display">
                  <Rocket className="w-3.5 h-3.5 transform rotate-45 text-orange-400 group-hover:rotate-90 transition" />
                  <span className="text-[10px] truncate max-w-[65px] sm:max-w-[80px]">
                    {miner.packageName.split(' ')[0]}
                  </span>
                </div>

                {/* Micro Durability & Earning tag */}
                <div className="text-[9px] font-mono text-emerald-300 flex items-center justify-between gap-1 mt-0.5">
                  <span>+${miner.unclaimedYield.toFixed(3)}</span>
                  <span
                    className={miner.durability < 40 ? 'text-rose-400 font-bold' : 'text-amber-400/80'}
                  >
                    %{Math.round(miner.durability)}
                  </span>
                </div>

                {/* Laser beam connecting ship to planet */}
                <div className="absolute top-1/2 left-1/2 w-16 sm:w-20 h-0.5 bg-gradient-to-r from-orange-400/80 via-amber-300/40 to-transparent pointer-events-none -z-10 rotate-45 transform origin-left" />
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
