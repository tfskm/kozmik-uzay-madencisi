import React from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Wallet,
  Zap,
  Sparkles,
  Shield,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Radio,
  UserCheck,
  BookOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    adminSettings,
    isAdminMode,
    setIsAdminMode,
    setIsWalletModalOpen,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsGuideModalOpen,
    dismissAnnouncement,
  } = useGame();

  const [soundOn, setSoundOn] = React.useState(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundOn(sounds.enabled);
    if (sounds.enabled) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#092d3c]/90 backdrop-blur-xl border-b border-cyan-500/35 shadow-lg">
      {/* Telegram Announcement Banner */}
      {adminSettings.showAnnouncement && adminSettings.announcementText && (
        <div className="bg-gradient-to-r from-teal-900/95 via-cyan-900/95 to-emerald-900/95 text-cyan-100 text-xs py-1.5 px-3 flex items-center justify-between border-b border-cyan-400/40">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <Radio className="w-3.5 h-3.5 text-cyan-300 shrink-0 animate-pulse" />
            <span className="truncate">{adminSettings.announcementText}</span>
          </div>
          <button
            onClick={dismissAnnouncement}
            className="text-cyan-200 hover:text-white ml-2 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 w-full overflow-hidden">
        {/* User Identity / Level */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 p-0.5 shadow-md shadow-cyan-500/30">
              <div className="w-full h-full bg-[#082834] rounded-[10px] flex items-center justify-center text-lg">
                {user.avatar}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-[9px] font-black px-1 rounded-full font-display border border-[#06202c] shadow">
              Lv.{user.level}
            </div>
          </div>

          <div className="hidden xs:block sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-cyan-50 font-display truncate max-w-[90px] sm:max-w-none">
                @{user.telegramUsername}
              </span>
              {user.isBanned && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] px-1 rounded">
                  BAN
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-14 sm:w-20 bg-[#06222c] rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                <div
                  className="bg-gradient-to-r from-teal-400 to-cyan-300 h-full rounded-full"
                  style={{ width: `${Math.min(100, (user.exp / user.maxExp) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-teal-300 font-mono">
                {user.exp}/{user.maxExp}
              </span>
            </div>
          </div>
        </div>

        {/* Currency Widgets */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* USDT Balance */}
          <div className="flex items-center gap-1 bg-[#07323f]/90 border border-emerald-400/50 px-2 py-1 rounded-xl shadow-md glow-emerald">
            <div className="w-5 h-5 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
              <Coins className="w-3 h-3" />
            </div>
            <div>
              <div className="text-[9px] text-emerald-300 font-bold leading-none">USDT</div>
              <div className="font-black text-xs sm:text-sm text-emerald-300 font-mono leading-tight">
                ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Stardust Balance */}
          <div className="flex items-center gap-1 bg-[#07323f]/90 border border-cyan-400/50 px-2 py-1 rounded-xl shadow-md">
            <div className="w-5 h-5 rounded-lg bg-cyan-500/25 flex items-center justify-center text-cyan-300 shrink-0">
              <Sparkles className="w-3 h-3 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] text-cyan-300 font-bold leading-none">Toz</div>
              <div className="font-black text-xs sm:text-sm text-amber-300 font-mono leading-tight">
                {user.stardustBalance}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Admin Mode Switch */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Deposit Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsDepositModalOpen(true);
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-xl shadow-md transition active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
            <span className="hidden xs:inline sm:inline">Yatır</span>
          </button>

          {/* Web3 Wallet Connect / Status */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsWalletModalOpen(true);
            }}
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-xl border transition active:scale-95 ${
              user.isConnected
                ? 'bg-teal-950/80 border-teal-400/60 text-teal-200'
                : 'bg-[#09394a] border-cyan-400/60 text-cyan-200 animate-pulse'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono text-[11px]">
              {user.isConnected ? user.walletAddress.substring(0, 6) + '...' : 'Cüzdan'}
            </span>
          </button>

          {/* Admin Switcher Toggle Button */}
          <button
            onClick={() => {
              sounds.playUpgrade();
              setIsAdminMode(!isAdminMode);
            }}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-xl border transition shadow-sm ${
              isAdminMode
                ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-rose-900/50 animate-pulse'
                : 'bg-[#07303e]/90 border-cyan-500/40 text-cyan-200 hover:text-white'
            }`}
            title="Yönetim Paneli"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{isAdminMode ? 'Yönetici' : 'Admin'}</span>
          </button>
          {/* Guide / How to Play Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsGuideModalOpen(true);
            }}
            className="flex items-center gap-1 bg-[#073240] hover:bg-[#0a3f52] text-cyan-200 border border-cyan-400/40 text-xs font-bold px-2 py-1.5 rounded-xl transition active:scale-95 shadow-sm"
            title="Nasıl Oynanır? Rehber"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Rehber</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1 text-cyan-300/70 hover:text-white rounded-lg hover:bg-cyan-500/20 transition"
            title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-teal-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
