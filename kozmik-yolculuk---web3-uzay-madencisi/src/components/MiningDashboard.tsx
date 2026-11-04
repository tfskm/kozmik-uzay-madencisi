import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Pickaxe,
  Wrench,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Flame,
  Globe2,
  Cpu,
  Bot,
  Radio,
  Truck,
  Compass,
  Rocket,
  Atom,
  X,
  Layers,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { CosmicCommandArena } from './CosmicCommandArena';

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

export const MiningDashboard: React.FC = () => {
  const {
    user,
    currentPlanet,
    userMiners,
    planets,
    travelToPlanet,
    claimSingleMiner,
    claimAllMiners,
    setIsRepairModalOpen,
    setSelectedMinerForRepair,
    setActiveTab,
  } = useGame();

  // Slide-up Drawers / Modals state for detailed info
  const [isFleetDrawerOpen, setIsFleetDrawerOpen] = useState(false);
  const [isPlanetDrawerOpen, setIsPlanetDrawerOpen] = useState(false);

  const totalUnclaimed = userMiners.reduce((acc, m) => acc + m.unclaimedYield, 0);
  const totalDailyYield = userMiners.reduce((acc, m) => {
    const factor = Math.max(0.1, m.durability / 100);
    return acc + m.dailyYield * currentPlanet.miningMultiplier * factor;
  }, 0);

  const avgDurability = userMiners.length
    ? Math.round(userMiners.reduce((acc, m) => acc + m.durability, 0) / userMiners.length)
    : 100;

  const activeMinersCount = userMiners.filter((m) => m.durability > 0).length;

  const handleClaimAll = () => {
    const res = claimAllMiners();
    if (res.totalClaimed > 0) {
      sounds.playCoin();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#eab308'],
      });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-full space-y-2.5 pb-20 select-none overflow-x-hidden">
      {/* 1. TOP FULLSCREEN 3D COSMIC COMMAND ARENA */}
      <CosmicCommandArena
        onOpenFleetDrawer={() => setIsFleetDrawerOpen(true)}
        onOpenPlanetDrawer={() => setIsPlanetDrawerOpen(true)}
        unclaimedYield={totalUnclaimed}
        onClaimAll={handleClaimAll}
      />

      {/* 2. ULTRA-COMPACT BOTTOM STATUS & CONTROL DOCK (EKRANA TAM SIĞAR, GÖZ YORMAZ) */}
      <div className="bg-gradient-to-r from-[#0d3b4a]/95 via-[#083342]/95 to-[#0d3b4a]/95 border border-cyan-400/40 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl glow-cyan">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Pending Yield & Quick Claim Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#052430]/90 border border-teal-400/30 px-2.5 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <div>
                <div className="text-[9px] uppercase font-bold text-teal-300 font-mono leading-none">
                  Bekleyen Hasat
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-300 font-mono leading-tight">
                  ${totalUnclaimed.toFixed(4)} <span className="text-[10px] text-teal-200/70 font-sans">USDT</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimAll}
              disabled={totalUnclaimed <= 0.001}
              className={`px-3 py-2 rounded-xl font-display font-black text-xs tracking-wider transition active:scale-95 flex items-center gap-1 shadow-md ${
                totalUnclaimed > 0.001
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 animate-pulse'
                  : 'bg-[#082b38] text-teal-200/40 cursor-not-allowed border border-teal-500/20'
              }`}
              title="Tüm birikmiş hasılatı cüzdana aktar"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Topla</span>
            </button>
          </div>

          {/* Center: Daily Rate & Active Fleet Micro-Chips */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <div className="bg-[#052430]/90 border border-cyan-500/25 px-2.5 py-1.5 rounded-xl text-teal-100">
              <span className="text-teal-300/70 text-[10px]">Günlük: </span>
              <strong className="text-emerald-300">+${totalDailyYield.toFixed(2)}</strong>
            </div>

            <div className="bg-[#052430]/90 border border-cyan-500/25 px-2.5 py-1.5 rounded-xl text-teal-100">
              <span className="text-teal-300/70 text-[10px]">Kondisyon: </span>
              <strong className={avgDurability > 70 ? 'text-emerald-300' : 'text-amber-300'}>
                %{avgDurability}
              </strong>
            </div>
          </div>

          {/* Right: Drawer Triggers ("Tıklayınca Açılan Detay Panelleri") */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {/* Sector Details Trigger */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsPlanetDrawerOpen(true);
              }}
              className="bg-[#08303f] hover:bg-[#0b3c4f] border border-cyan-400/50 text-cyan-200 text-xs font-bold font-display px-2.5 sm:px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md"
              title="Gezegen ve Sektör Bilgilerini Görüntüle"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden xs:inline">{currentPlanet.name.split(' ')[0]}</span>
              <span className="xs:hidden">S{currentPlanet.id}</span>
            </button>

            {/* Fleet & Miner Units Trigger */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsFleetDrawerOpen(true);
              }}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black font-display px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-lg border border-teal-300/60"
              title="Filo Birimlerini ve Madencileri İncele / Tamir Et"
            >
              <Bot className="w-3.5 h-3.5 text-slate-950" />
              <span>Filom ({userMiners.length})</span>
              <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.2 rounded font-mono text-emerald-200 font-bold">
                {activeMinersCount} Aktif
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SLIDE-UP DRAWER MODAL: DETAILED FLEET & MINERS ("TIKLAYINCA AÇILAN ARAYÜZ") */}
      {isFleetDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl max-h-[85vh] bg-gradient-to-b from-[#0a3544] to-[#062430] border border-cyan-400/50 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between bg-[#0e4052]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    Filo Birimleriniz & Madenciler
                  </h3>
                  <div className="text-xs text-teal-200/80 font-mono">
                    {activeMinersCount}/{userMiners.length} Aktif Çalışan • Ort. Dayanıklılık: %{avgDurability}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsFleetDrawerOpen(false);
                    setActiveTab('packages');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition shadow-md"
                >
                  <span>+ Yeni Al</span>
                </button>
                <button
                  onClick={() => setIsFleetDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#082a36] hover:bg-[#0c3848] text-teal-200 flex items-center justify-center transition border border-teal-500/30"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Summary Chips inside Drawer */}
            <div className="p-3 bg-[#05222c]/80 border-b border-cyan-500/20 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-[#082e3c] p-2 rounded-xl border border-teal-400/25">
                <div className="text-[10px] text-teal-300/70">Günlük Üretim</div>
                <div className="font-bold text-emerald-300">+${totalDailyYield.toFixed(2)}</div>
              </div>
              <div className="bg-[#082e3c] p-2 rounded-xl border border-teal-400/25">
                <div className="text-[10px] text-teal-300/70">Bekleyen Hasılat</div>
                <div className="font-bold text-amber-300">${totalUnclaimed.toFixed(4)}</div>
              </div>
              <div className="bg-[#082e3c] p-2 rounded-xl border border-teal-400/25">
                <div className="text-[10px] text-teal-300/70">Sektör Çarpanı</div>
                <div className="font-bold text-cyan-300">x{currentPlanet.miningMultiplier.toFixed(2)}</div>
              </div>
            </div>

            {/* Scrollable Miner Cards */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 max-h-[55vh]">
              {userMiners.length === 0 ? (
                <div className="bg-[#072d3b]/80 border border-cyan-400/30 border-dashed rounded-2xl p-6 text-center">
                  <Pickaxe className="w-10 h-10 text-cyan-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Henüz Aktif Madenci Yok</h4>
                  <p className="text-xs text-teal-200/70 max-w-xs mx-auto mt-1 mb-3">
                    Günlük otomatik USDT üretimi başlatmak için dükkandan ilk madenci biriminizi edinin.
                  </p>
                  <button
                    onClick={() => {
                      setIsFleetDrawerOpen(false);
                      setActiveTab('packages');
                    }}
                    className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg"
                  >
                    Paketleri İncele
                  </button>
                </div>
              ) : (
                userMiners.map((miner) => {
                  const Icon = ICON_MAP[miner.iconName] || Bot;
                  const isDamaged = miner.durability < 40;
                  const isDead = miner.durability <= 0;

                  return (
                    <div
                      key={miner.instanceId}
                      className={`relative bg-[#082f3e]/90 border rounded-2xl p-3 transition shadow-sm ${
                        isDead
                          ? 'border-rose-900/60 bg-rose-950/20'
                          : isDamaged
                          ? 'border-amber-500/50 bg-[#16272e]'
                          : 'border-teal-400/35 hover:border-cyan-400/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/35 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-100 font-display">
                              {miner.packageName}
                            </div>
                            <div className="text-[10px] text-teal-200/70 font-mono">
                              Getiri: <strong className="text-emerald-300">+${miner.dailyYield.toFixed(2)}/gün</strong> • Maliyet: ${miner.price}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            isDead
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isDamaged
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isDead ? 'ARIZALI' : isDamaged ? 'AŞINMIŞ' : 'ÇALIŞIYOR'}
                        </span>
                      </div>

                      {/* Durability bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                          <span className="text-teal-200/70">Dayanıklılık:</span>
                          <span
                            className={
                              miner.durability > 70
                                ? 'text-emerald-300 font-bold'
                                : miner.durability > 35
                                ? 'text-amber-300 font-bold'
                                : 'text-rose-400 font-bold'
                            }
                          >
                            %{Math.round(miner.durability)}
                          </span>
                        </div>
                        <div className="w-full bg-[#051e28] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              miner.durability > 70
                                ? 'bg-emerald-400'
                                : miner.durability > 35
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(2, miner.durability)}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="mt-2.5 pt-2 border-t border-teal-500/20 flex items-center justify-between gap-2">
                        <div className="font-mono text-xs text-amber-300">
                          ${miner.unclaimedYield.toFixed(4)} <span className="text-[10px] text-teal-200/60">USDT</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {miner.durability < 100 && (
                            <button
                              onClick={() => {
                                setSelectedMinerForRepair(miner);
                                setIsRepairModalOpen(true);
                                sounds.playClick();
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0a394a] hover:bg-[#0e485e] text-teal-200 border border-teal-400/40 flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3 text-amber-300" />
                              <span>Tamir Et</span>
                            </button>
                          )}

                          <button
                            onClick={() => claimSingleMiner(miner.instanceId)}
                            disabled={miner.unclaimedYield <= 0.001}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              miner.unclaimedYield > 0.001
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 active:scale-95'
                                : 'bg-[#06202a] text-teal-200/40 cursor-not-allowed border border-teal-500/10'
                            }`}
                          >
                            Topla
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer Close */}
            <div className="p-3 border-t border-cyan-500/25 bg-[#072834] flex items-center justify-between">
              <span className="text-[11px] text-teal-200/70 font-mono">
                💡 Madencilerinizi tamir ederek hasılatı %100 hızda tutun
              </span>
              <button
                onClick={() => setIsFleetDrawerOpen(false)}
                className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow-md"
              >
                Oyuna Dön 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SLIDE-UP DRAWER MODAL: PLANET & SECTOR DETAILS ("TIKLAYINCA AÇILAN ARAYÜZ") */}
      {isPlanetDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-gradient-to-b from-[#0a3544] to-[#062430] border border-cyan-400/50 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between bg-[#0e4052]">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base font-black text-white font-display">
                  Sektör & Gezegen Detayı
                </h3>
              </div>
              <button
                onClick={() => setIsPlanetDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#082a36] hover:bg-[#0c3848] text-teal-200 flex items-center justify-center transition border border-teal-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Planet Card */}
            <div className="p-4 space-y-3">
              <div
                className={`relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br ${currentPlanet.gradient} p-4 shadow-lg`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-cyan-200 uppercase font-mono">
                  <span>Sektör #{currentPlanet.id}</span>
                  <span className="bg-[#062430]/90 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Çarpan: x{currentPlanet.miningMultiplier.toFixed(2)}
                  </span>
                </div>

                <h4 className="text-xl font-black text-white font-display mt-1">
                  {currentPlanet.name}
                </h4>
                <p className="text-xs text-teal-100/90 mt-1">{currentPlanet.tagline}</p>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-200">
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-cyan-400/40">
                    💎 Cevher: <strong className="text-cyan-200">{currentPlanet.specialOre}</strong>
                  </span>
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    🪐 {currentPlanet.gravity}
                  </span>
                  <span className="bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    🌌 {currentPlanet.atmosphere}
                  </span>
                </div>
              </div>

              {/* Quick Planet Hop Grid */}
              <div>
                <div className="text-xs font-bold text-white mb-2 font-display">
                  Diğer Sektörlere Yolculuk:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {planets.map((p) => {
                    const isCurrent = p.id === currentPlanet.id;
                    const isUnlocked = user.unlockedPlanetIds.includes(p.id);

                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (isUnlocked) {
                            travelToPlanet(p.id);
                            setIsPlanetDrawerOpen(false);
                            sounds.playClick();
                          } else {
                            setIsPlanetDrawerOpen(false);
                            setActiveTab('planets');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                          isCurrent
                            ? 'bg-cyan-500/25 border-cyan-300 text-cyan-100 shadow-md ring-1 ring-cyan-400/50'
                            : isUnlocked
                            ? 'bg-[#093240] border-teal-500/35 text-teal-100 hover:border-cyan-400/60'
                            : 'bg-[#051e26] border-slate-800 text-teal-300/40'
                        }`}
                      >
                        <div>
                          <div className="font-bold font-display">{p.name.split(' ')[0]}</div>
                          <div className="text-[10px] font-mono text-emerald-300">
                            x{p.miningMultiplier.toFixed(1)} Kat
                          </div>
                        </div>
                        <span className="text-[10px] font-mono">
                          {isCurrent ? 'Buradasınız' : isUnlocked ? 'Işınlan' : 'Kilitli 🔒'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-cyan-500/25 bg-[#072834] flex justify-end">
              <button
                onClick={() => setIsPlanetDrawerOpen(false)}
                className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow-md"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
