import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CosmicCommandArena } from './CosmicCommandArena';
import { sounds } from '../utils/audio';
import {
  Pickaxe,
  Sparkles,
  Bot,
  Globe2,
  X,
  Wrench,
  Flame,
  ArrowRight,
  TrendingUp,
  Coins,
  Repeat,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ICON_MAP: Record<string, React.ElementType> = {
  Bot,
  Pickaxe,
  Wrench,
  Globe2,
};

export const MiningDashboard: React.FC = () => {
  const {
    user,
    userMiners,
    currentPlanet,
    planets,
    adminSettings,
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

  const rate = adminSettings.stardustPerUsdt || 1000;
  const totalUnclaimed = userMiners.reduce((acc, m) => acc + m.unclaimedYield, 0);
  const totalDailyDust = userMiners.reduce((acc, m) => {
    const factor = Math.max(0.1, m.durability / 100);
    return acc + (m.dailyYield * rate) * currentPlanet.miningMultiplier * factor;
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
        colors: ['#06b6d4', '#10b981', '#f59e0b'],
      });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-full space-y-2.5 pb-20 select-none overflow-x-hidden">
      {/* 1. TOP FULLSCREEN COSMIC COMMAND ARENA */}
      <CosmicCommandArena
        onOpenFleetDrawer={() => setIsFleetDrawerOpen(true)}
        onOpenPlanetDrawer={() => setIsPlanetDrawerOpen(true)}
        unclaimedYield={totalUnclaimed}
        onClaimAll={handleClaimAll}
      />

      {/* 2. BRIGHT CHEERFUL STATUS & CONTROL DOCK */}
      <div className="bg-white/95 border border-teal-200/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-md text-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Pending Uzay Tozu & Quick Claim Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-50 to-emerald-50 border border-teal-200 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse shrink-0" />
              <div>
                <div className="text-[9px] uppercase font-bold text-teal-800 font-mono leading-none">
                  Bekleyen Uzay Tozu
                </div>
                <div className="text-sm sm:text-base font-black text-cyan-900 font-mono leading-tight">
                  {Math.floor(totalUnclaimed).toLocaleString()} <span className="text-[10px] text-teal-700 font-sans font-bold">Toz</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimAll}
              disabled={totalUnclaimed < 1}
              className={`px-3 py-2 rounded-xl font-display font-black text-xs tracking-wider transition active:scale-95 flex items-center gap-1 shadow-sm ${
                totalUnclaimed >= 1
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              title="Birikmiş tüm Uzay Tozunu topla"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Topla</span>
            </button>

            {/* Quick Swap shortcut */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('wallet');
              }}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black px-2.5 py-2 rounded-xl flex items-center gap-1 transition active:scale-95 shadow-sm"
              title="Uzay Tozunu USDT'ye Swap Yap"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
              <span className="hidden xs:inline font-mono">Swap</span>
            </button>
          </div>

          {/* Center: Daily Rate & Active Fleet Micro-Chips */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700">
              <span className="text-slate-500 text-[10px]">Günlük: </span>
              <strong className="text-teal-800">+{Math.floor(totalDailyDust).toLocaleString()} Toz</strong>
              <span className="text-[10px] text-slate-400 ml-1">(≈${(totalDailyDust / rate).toFixed(2)})</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700">
              <span className="text-slate-500 text-[10px]">Kondisyon: </span>
              <strong className={avgDurability > 70 ? 'text-emerald-600' : 'text-amber-600'}>
                %{avgDurability}
              </strong>
            </div>
          </div>

          {/* Right: Drawer Triggers */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {/* Sector Details Trigger */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsPlanetDrawerOpen(true);
              }}
              className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-800 text-xs font-bold font-display px-2.5 sm:px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Gezegen ve Sektör Bilgilerini Görüntüle"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden xs:inline">{currentPlanet.name.split(' ')[0]}</span>
              <span className="xs:hidden">S{currentPlanet.id}</span>
            </button>

            {/* Fleet & Miner Units Trigger */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsFleetDrawerOpen(true);
              }}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-black font-display px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Filo Birimlerini ve Madencileri İncele / Tamir Et"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Filom ({userMiners.length})</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-bold">
                {activeMinersCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SLIDE-UP DRAWER MODAL: DETAILED FLEET & MINERS */}
      {isFleetDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl max-h-[85vh] bg-white border border-teal-200 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden text-slate-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-teal-100 flex items-center justify-between bg-teal-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Filo Birimleriniz & Madenciler
                  </h3>
                  <div className="text-xs text-teal-800 font-mono">
                    {activeMinersCount}/{userMiners.length} Aktif • Ort. Dayanıklılık: %{avgDurability}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsFleetDrawerOpen(false);
                    setActiveTab('packages');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-sm"
                >
                  <span>+ Yeni Al</span>
                </button>
                <button
                  onClick={() => setIsFleetDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Summary Chips inside Drawer */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500">Günlük Üretim</div>
                <div className="font-bold text-teal-700">+{Math.floor(totalDailyDust).toLocaleString()} Toz</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500">Bekleyen Toz</div>
                <div className="font-bold text-amber-600">{Math.floor(totalUnclaimed).toLocaleString()} Toz</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500">Sektör Çarpanı</div>
                <div className="font-bold text-cyan-700">x{currentPlanet.miningMultiplier.toFixed(2)}</div>
              </div>
            </div>

            {/* Scrollable Miner Cards */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 max-h-[55vh]">
              {userMiners.length === 0 ? (
                <div className="bg-cyan-50/50 border border-cyan-200 border-dashed rounded-2xl p-6 text-center">
                  <Pickaxe className="w-10 h-10 text-cyan-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">Henüz Aktif Madenci Yok</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 mb-3">
                    Günlük otomatik Uzay Tozu üretimi başlatmak için dükkandan ilk madenci biriminizi edinin.
                  </p>
                  <button
                    onClick={() => {
                      setIsFleetDrawerOpen(false);
                      setActiveTab('packages');
                    }}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md"
                  >
                    Paketleri İncele
                  </button>
                </div>
              ) : (
                userMiners.map((miner) => {
                  const Icon = ICON_MAP[miner.iconName] || Bot;
                  const isDamaged = miner.durability < 40;
                  const isDead = miner.durability <= 0;
                  const dailyMinerDust = Math.floor(miner.dailyYield * rate * currentPlanet.miningMultiplier * Math.max(0.1, miner.durability / 100));

                  return (
                    <div
                      key={miner.instanceId}
                      className={`relative bg-white border rounded-2xl p-3 transition shadow-sm ${
                        isDead
                          ? 'border-rose-300 bg-rose-50/30'
                          : isDamaged
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 font-display">
                              {miner.packageName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Getiri: <strong className="text-teal-700">+{dailyMinerDust} Toz/gün</strong> • Maliyet: ${miner.price}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            isDead
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : isDamaged
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isDead ? 'ARIZALI' : isDamaged ? 'AŞINMIŞ' : 'ÇALIŞIYOR'}
                        </span>
                      </div>

                      {/* Durability bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                          <span className="text-slate-500">Dayanıklılık:</span>
                          <span
                            className={
                              miner.durability > 70
                                ? 'text-emerald-700 font-bold'
                                : miner.durability > 35
                                ? 'text-amber-700 font-bold'
                                : 'text-rose-700 font-bold'
                            }
                          >
                            %{Math.round(miner.durability)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              miner.durability > 70
                                ? 'bg-emerald-500'
                                : miner.durability > 35
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(2, miner.durability)}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="font-mono text-xs text-teal-800 font-bold">
                          {Math.floor(miner.unclaimedYield).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">Toz</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {miner.durability < 100 && (
                            <button
                              onClick={() => {
                                setSelectedMinerForRepair(miner);
                                setIsRepairModalOpen(true);
                                sounds.playClick();
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3 text-amber-600" />
                              <span>Tamir Et</span>
                            </button>
                          )}

                          <button
                            onClick={() => claimSingleMiner(miner.instanceId)}
                            disabled={miner.unclaimedYield < 1}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              miner.unclaimedYield >= 1
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white active:scale-95 shadow-sm'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
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
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                💡 Tozları biriktirip Cüzdan'da anında USDT'ye dönüştürebilirsiniz
              </span>
              <button
                onClick={() => setIsFleetDrawerOpen(false)}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow-md"
              >
                Oyuna Dön 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SLIDE-UP DRAWER MODAL: PLANET & SECTOR DETAILS */}
      {isPlanetDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-white border border-teal-200 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden text-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-teal-100 flex items-center justify-between bg-teal-50/80">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 font-display">
                  Sektör & Gezegen Detayı
                </h3>
              </div>
              <button
                onClick={() => setIsPlanetDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Planet Card */}
            <div className="p-4 space-y-3">
              <div
                className={`relative overflow-hidden rounded-2xl border border-teal-300 bg-gradient-to-br from-teal-50 via-cyan-50 to-white p-4 shadow-sm`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-teal-800 uppercase font-mono">
                  <span>Sektör #{currentPlanet.id}</span>
                  <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Çarpan: x{currentPlanet.miningMultiplier.toFixed(2)}
                  </span>
                </div>

                <h4 className="text-xl font-black text-slate-900 font-display mt-1">
                  {currentPlanet.name}
                </h4>
                <p className="text-xs text-slate-600 mt-1">{currentPlanet.tagline}</p>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-700">
                  <span className="bg-white px-2 py-0.5 rounded border border-teal-200 shadow-xs">
                    💎 Cevher: <strong className="text-teal-800">{currentPlanet.specialOre}</strong>
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    🪐 {currentPlanet.gravity}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    🌌 {currentPlanet.atmosphere}
                  </span>
                </div>
              </div>

              {/* Quick Planet Hop Grid */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2 font-display">
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
                            ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-sm font-bold ring-1 ring-cyan-300'
                            : isUnlocked
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold font-display">{p.name.split(' ')[0]}</div>
                          <div className="text-[10px] font-mono text-emerald-700 font-bold">
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
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsPlanetDrawerOpen(false)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow-sm"
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
