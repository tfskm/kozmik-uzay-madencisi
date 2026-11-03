import React from 'react';
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
    claimSingleMiner,
    claimAllMiners,
    setIsRepairModalOpen,
    setSelectedMinerForRepair,
    setActiveTab,
  } = useGame();

  const totalUnclaimed = userMiners.reduce((acc, m) => acc + m.unclaimedYield, 0);
  const totalDailyYield = userMiners.reduce((acc, m) => {
    const factor = Math.max(0.1, m.durability / 100);
    return acc + m.dailyYield * currentPlanet.miningMultiplier * factor;
  }, 0);

  const avgDurability = userMiners.length
    ? Math.round(userMiners.reduce((acc, m) => acc + m.durability, 0) / userMiners.length)
    : 100;

  const handleClaimAll = () => {
    const res = claimAllMiners();
    if (res.totalClaimed > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#eab308'],
      });
    }
  };

  return (
    <div className="space-y-4 pb-20 w-full max-w-full overflow-hidden">
      {/* 3D Visual Cosmic Command Arena with Planets, Orbiting Ships and Pirate Battles */}
      <CosmicCommandArena />

      {/* Current Planet Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-orange-500/35 bg-gradient-to-br ${currentPlanet.gradient} p-4 sm:p-5 shadow-xl glow-orange`}
      >
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-2 right-3 flex items-center gap-2">
          <span className="bg-slate-950/80 border border-amber-400/40 text-amber-300 text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            {currentPlanet.codeName}
          </span>
          <button
            onClick={() => setActiveTab('planets')}
            className="bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 transition shadow-md"
          >
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Gezegen Değiştir</span>
          </button>
        </div>

        <div className="max-w-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <span>Sektör #{currentPlanet.id}</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-bold">Çarpan: x{currentPlanet.miningMultiplier.toFixed(2)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5 tracking-wide">
            {currentPlanet.name}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 line-clamp-2">
            {currentPlanet.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-[11px] text-slate-200 font-mono">
            <span className="bg-black/50 px-2 py-0.5 rounded border border-orange-400/30">
              💎 Cevher: <strong className="text-amber-300">{currentPlanet.specialOre}</strong>
            </span>
            <span className="bg-black/50 px-2 py-0.5 rounded border border-white/10">
              🪐 Yerçekimi: {currentPlanet.gravity}
            </span>
          </div>
        </div>
      </div>

      {/* Fleet Stats Overview - Warm Solar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Daily Yield */}
        <div className="bg-gradient-to-br from-[#241036]/90 to-[#150a24]/90 border border-orange-500/25 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
            <span>Günlük Getiri</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-300 font-mono">
            +${totalDailyYield.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono">24 Saatte USDT</div>
        </div>

        {/* Active Miners */}
        <div className="bg-gradient-to-br from-[#241036]/90 to-[#150a24]/90 border border-orange-500/25 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
            <span>Aktif Filo</span>
            <Bot className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-amber-300 font-mono">
            {userMiners.filter((m) => m.durability > 0).length} / {userMiners.length}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Çalışan Madenci</div>
        </div>

        {/* Fleet Durability */}
        <div className="bg-gradient-to-br from-[#241036]/90 to-[#150a24]/90 border border-orange-500/25 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
            <span>Ort. Kondisyon</span>
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className={`text-lg font-bold font-mono ${avgDurability > 70 ? 'text-emerald-300' : avgDurability > 40 ? 'text-amber-300' : 'text-rose-400'}`}>
            %{avgDurability}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Dayanıklılık</div>
        </div>

        {/* Total Mined */}
        <div className="bg-gradient-to-br from-[#241036]/90 to-[#150a24]/90 border border-orange-500/25 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
            <span>Toplam Hasat</span>
            <Pickaxe className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-orange-300 font-mono">
            ${user.totalMined.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Kazanılan USDT</div>
        </div>
      </div>

      {/* Main Claim All Master Button - Warm Amber/Orange Energy */}
      <div className="bg-gradient-to-r from-[#2a1138] via-[#200c2e] to-[#2a1138] border border-orange-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl glow-orange">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/50 flex items-center justify-center text-orange-400 shadow-inner">
            <Flame className="w-6 h-6 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              Bekleyen Hasılat (Canlı Sayıyor)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 font-mono">
              ${totalUnclaimed.toFixed(4)} <span className="text-sm text-emerald-400 font-sans">USDT</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClaimAll}
          disabled={totalUnclaimed <= 0.001}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-display font-black text-sm tracking-wide transition shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
            totalUnclaimed > 0.001
              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-orange-500/30 animate-pulse'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Tüm Hasılatı Cüzdana Aktar
        </button>
      </div>

      {/* Fleet Miners List Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-orange-400" />
          <h2 className="text-base font-bold text-white font-display">
            Filo Birimleriniz ({userMiners.length})
          </h2>
        </div>
        <button
          onClick={() => setActiveTab('packages')}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
        >
          <span>Yeni Paket Al</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Miners Grid / List */}
      {userMiners.length === 0 ? (
        <div className="bg-[#1c0c29]/70 border border-orange-500/25 border-dashed rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto mb-3">
            <Pickaxe className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white font-display">
            Henüz Aktif Madenci Bulunmuyor
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Gezegenlerde madencilik başlatmak ve 6 ayda kendini amorti eden günlük USDT kazancı elde etmek için ilk paketinizi seçin.
          </p>
          <button
            onClick={() => setActiveTab('packages')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition active:scale-95"
          >
            Madenci Paketlerini İncele
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {userMiners.map((miner) => {
            const Icon = ICON_MAP[miner.iconName] || Bot;
            const isDamaged = miner.durability < 40;
            const isDead = miner.durability <= 0;

            return (
              <div
                key={miner.instanceId}
                className={`relative bg-[#1f0e2d]/90 border rounded-2xl p-3.5 transition-all shadow-md ${
                  isDead
                    ? 'border-rose-900/60 bg-rose-950/20'
                    : isDamaged
                    ? 'border-amber-600/40 bg-amber-950/20'
                    : 'border-orange-500/25 hover:border-orange-500/60'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        miner.tier === 'quantum'
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                          : miner.tier === 'neon'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : miner.tier === 'gold'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 font-display leading-tight">
                        {miner.packageName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                        <span>Maliyet: ${miner.price}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">
                          +${miner.dailyYield.toFixed(2)}/gün
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                </div>

                {/* Durability Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-400" />
                      Dayanıklılık:
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        miner.durability > 70
                          ? 'text-emerald-400'
                          : miner.durability > 35
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      %{Math.round(miner.durability)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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

                {/* Live Output & Action Controls */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400">Üretilen Hasılat</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono">
                      ${miner.unclaimedYield.toFixed(4)}{' '}
                      <span className="text-[10px] text-slate-500 font-sans">USDT</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Repair button */}
                    {miner.durability < 100 && (
                      <button
                        onClick={() => {
                          setSelectedMinerForRepair(miner);
                          setIsRepairModalOpen(true);
                          sounds.playClick();
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          miner.durability < 40
                            ? 'bg-rose-950 border border-rose-500/60 text-rose-300 hover:bg-rose-900 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                        }`}
                        title="Dayanıklılığı %100 yap"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Tamir Et</span>
                      </button>
                    )}

                    {/* Claim Button */}
                    <button
                      onClick={() => claimSingleMiner(miner.instanceId)}
                      disabled={miner.unclaimedYield <= 0.001}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        miner.unclaimedYield > 0.001
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Topla</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sustainable Economy Tips banner */}
      <div className="bg-slate-900/40 border border-indigo-900/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-400">
        <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-semibold">Uzay Ekonomisi ve Amorti Mekaniği:</span>
          <p className="mt-0.5 text-slate-400">
            Madenciler ortalama <strong>~6 ay (180 gün)</strong> içinde yatırılan bedeli tamamen çıkarır (cover eder). Madencilerinizi düzenli tamir ederek üretim hızını maksimumda tutabilir, elde ettiğiniz Yıldız Tozları ile Pazar yerinde tamir kiti alabilir ya da USDT'ye dönüştürebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};
