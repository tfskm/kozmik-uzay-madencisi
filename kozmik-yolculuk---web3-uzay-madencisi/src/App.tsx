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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-b from-[#092b3a] via-[#083547] to-[#06202c] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Luminous Celestial & Emerald/Cyan Auroras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Vibrant Emerald & Mint Solar Aurora */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/22 via-teal-400/18 to-transparent blur-[110px] rounded-full" />
        {/* Radiant Cyan & Azure Flare */}
        <div className="absolute top-1/3 -left-20 w-[550px] h-[550px] bg-cyan-400/22 blur-[120px] rounded-full" />
        {/* Deep Ocean Turquoise Glow */}
        <div className="absolute bottom-10 right-0 w-[600px] h-[600px] bg-teal-400/20 blur-[125px] rounded-full" />
        {/* Warm Golden Stardust Accent */}
        <div className="absolute top-2/3 left-1/4 w-[450px] h-[450px] bg-amber-400/14 blur-[115px] rounded-full" />

        {/* Subtle Stardust texture */}
        <div
          className="w-full h-full opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #67e8f9 1.2px, transparent 0)`,
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      {/* Frame Mode Switcher for Desktop Viewers */}
      <div className="hidden lg:flex fixed top-3 right-4 z-50 items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 p-1 rounded-xl shadow-lg backdrop-blur-md">
        <button
          onClick={() => setIsTelegramMobileFrame(false)}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition ${
            !isTelegramMobileFrame
              ? 'bg-cyan-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
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
              ? 'bg-cyan-500 text-slate-950'
              : 'text-slate-400 hover:text-white'
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
            ? 'max-w-md my-4 border border-indigo-500/40 rounded-3xl shadow-2xl bg-slate-950/95 overflow-hidden'
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
