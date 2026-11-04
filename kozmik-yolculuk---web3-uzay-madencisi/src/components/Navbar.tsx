import React from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Pickaxe,
  Globe2,
  PackageCheck,
  Disc3,
  ShoppingBag,
  Wallet,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, userMiners, isAdminMode, setIsAdminMode } = useGame();

  const unclaimedCount = userMiners.filter((m) => m.unclaimedYield > 0.005).length;
  const damagedCount = userMiners.filter((m) => m.durability < 40).length;

  const tabs = [
    {
      id: 'mining',
      label: 'Madencilik',
      icon: Pickaxe,
      badge: unclaimedCount > 0 ? `${unclaimedCount}` : undefined,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'planets',
      label: 'Gezegenler',
      icon: Globe2,
    },
    {
      id: 'packages',
      label: 'Paketler',
      icon: PackageCheck,
      highlight: true,
    },
    {
      id: 'luck',
      label: 'Şans & Çark',
      icon: Disc3,
      accent: true,
    },
    {
      id: 'market',
      label: 'Pazar',
      icon: ShoppingBag,
    },
    {
      id: 'wallet',
      label: 'Cüzdan',
      icon: Wallet,
    },
    {
      id: 'admin',
      label: 'Yönetim',
      icon: ShieldAlert,
      isAdminTab: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#082836]/95 backdrop-blur-xl border-t border-cyan-400/40 pb-safe shadow-2xl">
      <div className="max-w-xl mx-auto px-1.5 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (activeTab === tab.id && !isAdminMode) || (tab.id === 'admin' && isAdminMode);

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                sounds.triggerHaptic('light');
                if (tab.id === 'admin') {
                  setIsAdminMode(true);
                  setActiveTab('admin');
                } else {
                  setIsAdminMode(false);
                  setActiveTab(tab.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition duration-200 group ${
                isActive
                  ? 'text-cyan-300 font-bold'
                  : 'text-teal-200/60 hover:text-cyan-100'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500/30 via-teal-500/25 to-emerald-500/25 text-cyan-200 ring-1 ring-cyan-400/70 shadow-lg shadow-cyan-500/30'
                      : 'group-hover:bg-[#0b3648]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-cyan-300' : 'group-hover:scale-105'
                    } ${tab.accent && isActive ? 'animate-spin' : ''}`}
                  />
                </div>

                {/* Badge for unclaimed or alert */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[9px] font-black text-slate-950 px-1 rounded-full ${tab.badgeColor} animate-bounce`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.id === 'mining' && damagedCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight font-display">{tab.label}</span>

              {isActive && (
                <div className="absolute -bottom-1 w-6 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
