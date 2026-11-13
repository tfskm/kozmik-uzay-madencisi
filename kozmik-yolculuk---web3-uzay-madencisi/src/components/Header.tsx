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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-teal-200/90 shadow-sm text-slate-800">
      {/* Telegram Announcement Banner */}
      {adminSettings.showAnnouncement && adminSettings.announcementText && (
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white text-xs py-1.5 px-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <Radio className="w-3.5 h-3.5 text-cyan-100 shrink-0 animate-pulse" />
            <span className="truncate font-medium">{adminSettings.announcementText}</span>
          </div>
          <button
            onClick={dismissAnnouncement}
            className="text-white hover:text-cyan-100 ml-2 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/20"
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 p-0.5 shadow-sm">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-lg shadow-inner">
                {user.avatar}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-emerald-500 text-slate-950 text-[9px] font-black px-1 rounded-full font-display border border-white shadow">
              Lv.{user.level}
            </div>
          </div>

          <div className="hidden xs:block sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm text-slate-900 font-display truncate max-w-[90px] sm:max-w-none">
                @{user.telegramUsername}
              </span>
              {user.isBanned && (
                <span className="bg-red-500/15 text-red-600 border border-red-400/40 text-[9px] px-1 rounded font-bold">
                  BAN
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-14 sm:w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, (user.exp / user.maxExp) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-teal-700 font-mono font-semibold">
                {user.exp}/{user.maxExp}
              </span>
            </div>
          </div>
        </div>

        {/* Currency Widgets */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* USDT Balance */}
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-xl shadow-sm">
            <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Coins className="w-3 h-3 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[9px] text-emerald-800 font-bold leading-none">USDT</div>
              <div className="font-black text-xs sm:text-sm text-emerald-700 font-mono leading-tight">
                ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Stardust Balance */}
          <div className="flex items-center gap-1 bg-cyan-50 border border-cyan-300 px-2.5 py-1 rounded-xl shadow-sm">
            <div className="w-5 h-5 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-3 h-3 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[9px] text-cyan-800 font-bold leading-none">Uzay Tozu</div>
              <div className="font-black text-xs sm:text-sm text-cyan-900 font-mono leading-tight">
                {user.stardustBalance.toLocaleString()}
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
            className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-white stroke-[3]" />
            <span className="hidden xs:inline sm:inline">Yatır</span>
          </button>

          {/* Web3 Wallet Connect / Status */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsWalletModalOpen(true);
            }}
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-xl border transition active:scale-95 ${
              user.isConnected
                ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm'
                : 'bg-cyan-50 border-cyan-300 text-cyan-800 animate-pulse'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-teal-600" />
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
                ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title="Yönetim Paneli"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">{isAdminMode ? 'Yönetici' : 'Admin'}</span>
          </button>

          {/* Guide / How to Play Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsGuideModalOpen(true);
            }}
            className="flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 text-xs font-bold px-2 py-1.5 rounded-xl transition active:scale-95 shadow-sm"
            title="Nasıl Oynanır? Rehber"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Rehber</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
