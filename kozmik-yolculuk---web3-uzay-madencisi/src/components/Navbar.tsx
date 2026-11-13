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
      label: 'Cüzdan & Swap',
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-teal-200/90 pb-safe shadow-lg text-slate-700">
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
                  ? 'text-teal-900 font-black'
                  : 'text-slate-500 hover:text-teal-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400'
                      : 'group-hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-white' : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight font-display ${isActive ? 'font-black text-teal-900' : 'font-medium'}`}>
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
