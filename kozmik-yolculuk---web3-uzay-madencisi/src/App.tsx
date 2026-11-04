/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MiningDashboard } from './components/MiningDashboard';
import { PlanetMap } from './components/PlanetMap';
import { PackagesShop } from './components/PackagesShop';
import { LuckyWheelAndBoxes } from './components/LuckyWheelAndBoxes';
import { Marketplace } from './components/Marketplace';
import { WalletAndHistory } from './components/WalletAndHistory';
import { AdminPanel } from './components/AdminPanel';
import { WalletModal } from './components/WalletModal';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { RepairModal } from './components/RepairModal';
import { GuideModal } from './components/GuideModal';
import { RandomEventPopup } from './components/RandomEventPopup';
import { Smartphone, Monitor } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isAdminMode, isGuideModalOpen, setIsGuideModalOpen } = useGame();
  const [isTelegramMobileFrame, setIsTelegramMobileFrame] = useState(false);

  // Auto-expand Telegram WebApp to 100% full mobile screen
  useEffect(() => {
    try {
      const tg = (window as unknown as { Telegram?: { WebApp?: { expand: () => void; ready: () => void; enableClosingConfirmation: () => void } } }).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
      }
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-b from-[#edf9fb] via-[#e5f5f8] to-[#d9f1f4] text-slate-800 flex flex-col relative selection:bg-cyan-400 selection:text-slate-950">
      {/* Background Luminous Celestial Daytime & Sun/Mint Auroras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Sunny Mint & Emerald Solar Halo */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-gradient-to-b from-emerald-200/40 via-teal-200/30 to-transparent blur-[120px] rounded-full" />
        {/* Bright Cyan & Sky Azure Light Flare */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-cyan-200/45 blur-[130px] rounded-full" />
        {/* Radiant Warm Amber Solar Beam */}
        <div className="absolute top-1/2 right-0 w-[550px] h-[550px] bg-amber-200/35 blur-[120px] rounded-full" />
        {/* Soft Turquoise Ocean Glow */}
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-teal-200/35 blur-[125px] rounded-full" />

        {/* Subtle Stardust texture */}
        <div
          className="w-full h-full opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0891b2 1.2px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Frame Mode Switcher for Desktop Viewers */}
      <div className="hidden lg:flex fixed top-3 right-4 z-50 items-center gap-1.5 bg-white/90 border border-teal-200 p-1 rounded-xl shadow-md backdrop-blur-md">
        <button
          onClick={() => setIsTelegramMobileFrame(false)}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition ${
            !isTelegramMobileFrame
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Geniş Ekran Modu"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Geniş</span>
        </button>
        <button
          onClick={() => setIsTelegramMobileFrame(true)}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition ${
            isTelegramMobileFrame
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Telegram Mini App Çerçeve Modu"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Telegram Mini App</span>
        </button>
      </div>

      {/* App Container */}
      <div
        className={`mx-auto w-full transition-all duration-300 relative z-10 flex flex-col flex-1 ${
          isTelegramMobileFrame
            ? 'max-w-md my-4 border border-teal-200 rounded-3xl shadow-2xl bg-white/95 overflow-hidden'
            : 'max-w-5xl'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Surprise Random Encounter */}
        <RandomEventPopup />

        {/* Dynamic Content Views */}
        <main className="flex-1 px-3 sm:px-5 py-4">
          {isAdminMode ? (
            <AdminPanel />
          ) : activeTab === 'mining' ? (
            <MiningDashboard />
          ) : activeTab === 'planets' ? (
            <PlanetMap />
          ) : activeTab === 'packages' ? (
            <PackagesShop />
          ) : activeTab === 'luck' ? (
            <LuckyWheelAndBoxes />
          ) : activeTab === 'market' ? (
            <Marketplace />
          ) : activeTab === 'wallet' ? (
            <WalletAndHistory />
          ) : (
            <MiningDashboard />
          )}
        </main>

        {/* Floating Bottom Telegram Navbar */}
        <Navbar />

        {/* Interactive Modals */}
        <WalletModal />
        <DepositModal />
        <WithdrawModal />
        <RepairModal />
        <GuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}
