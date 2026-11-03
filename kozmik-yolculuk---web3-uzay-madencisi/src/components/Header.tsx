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
    dismissAnnouncement,
  } = useGame();

  const [soundOn, setSoundOn] = React.useState(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundOn(sounds.enabled);
    if (sounds.enabled) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-indigo-900/40">
      {/* Telegram Announcement Banner */}
      {adminSettings.showAnnouncement && adminSettings.announcementText && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-blue-900/90 text-indigo-100 text-xs py-1.5 px-3 flex items-center justify-between border-b border-indigo-500/30">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span className="truncate">{adminSettings.announcementText}</span>
          </div>
          <button
            onClick={dismissAnnouncement}
            className="text-indigo-300 hover:text-white ml-2 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* User Identity / Level */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-lg">
                {user.avatar}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1 rounded-full font-display border border-slate-900">
              Lv.{user.level}
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-100 font-display">
                @{user.telegramUsername}
              </span>
              {user.isBanned && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] px-1.5 rounded">
                  ASKIDA
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (user.exp / user.maxExp) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-indigo-300 font-mono">
                {user.exp}/{user.maxExp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Currency Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* USDT Balance */}
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/80 font-medium leading-none">USDT</div>
              <div className="font-bold text-sm text-emerald-300 font-mono leading-tight">
                ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Stardust Balance */}
          <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-purple-400/80 font-medium leading-none">Yıldız Tozu</div>
              <div className="font-bold text-sm text-purple-300 font-mono leading-tight">
                {user.stardustBalance}
              </div>
            </div>
          </div>

          {/* Energy */}
          <div className="hidden md:flex items-center gap-1.5 bg-amber-950/30 border border-amber-500/30 px-2.5 py-1.5 rounded-xl">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-amber-400/80 font-medium leading-none">Enerji</div>
              <div className="font-bold text-xs text-amber-300 font-mono">
                {user.energy}/{user.maxEnergy}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Admin Mode Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Deposit Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsDepositModalOpen(true);
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md shadow-emerald-950 transition active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yatır</span>
          </button>

          {/* Withdraw Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsWithdrawModalOpen(true);
            }}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-xl transition active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Çek</span>
          </button>

          {/* Web3 Wallet Connect / Status */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsWalletModalOpen(true);
            }}
            className={`flex items-center gap-1.5 text-xs font-medium px-2 sm:px-3 py-1.5 rounded-xl border transition active:scale-95 ${
              user.isConnected
                ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 animate-pulse'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">
              {user.isConnected ? user.walletAddress.substring(0, 7) + '...' : 'Cüzdan Bağla'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                user.isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Admin Switcher Toggle Button */}
          <button
            onClick={() => {
              sounds.playUpgrade();
              setIsAdminMode(!isAdminMode);
            }}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition shadow-sm ${
              isAdminMode
                ? 'bg-rose-950 border-rose-500/80 text-rose-300 shadow-rose-900/50 animate-pulse'
                : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/60'
            }`}
            title="Yönetim Paneli Geçişi"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAdminMode ? 'Yönetici Aktif' : 'Yönetim Paneli'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
