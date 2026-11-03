/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { RandomEventPopup } from './components/RandomEventPopup';
import { Smartphone, Monitor } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isAdminMode } = useGame();
  const [isTelegramMobileFrame, setIsTelegramMobileFrame] = useState(false);

  return (
    <div className="min-h-screen bg-[#050714] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Starfield and Galactic Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-2/3 right-1/4 w-[450px] h-[450px] bg-cyan-600/10 blur-[120px] rounded-full" />

        {/* Subtle grid pattern */}
        <div
          className="w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
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
