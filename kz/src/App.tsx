/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
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
import { RepairModal } from './components/RepairModal';
import { RandomEventPopup } from './components/RandomEventPopup';
import { Rocket, RefreshCw, Wrench } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isAdminMode, ready, error, refreshServer, adminSettings, isAdmin } = useGame();

  useEffect(() => {
    try {
      const tg = (window as unknown as {
        Telegram?: { WebApp?: { expand: () => void; ready: () => void; enableClosingConfirmation: () => void; disableVerticalSwipes?: () => void; onEvent?: (e: string, cb: () => void) => void; viewportStableHeight?: number; viewportHeight?: number } };
      }).Telegram?.WebApp;
      const applyVp = () => {
        const h = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;
        if (h) document.documentElement.style.setProperty('--tg-vh', `${h}px`);
      };
      if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
        applyVp();
        tg.onEvent?.('viewportChanged', applyVp);
      } else {
        applyVp();
      }
      window.addEventListener('resize', applyVp);
    } catch {
      /* tarayıcıda çalışıyor olabilir */
    }
  }, []);

  // İlk yükleme ekranı
  if (!ready && !error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#092b3a] via-[#083547] to-[#06202c] text-slate-100 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
          <div className="w-full h-full bg-[#082834] rounded-[14px] flex items-center justify-center">
            <Rocket className="w-7 h-7 text-cyan-300" />
          </div>
        </div>
        <p className="text-sm text-teal-200/80 font-display">Kozmik Yolculuk yükleniyor…</p>
      </div>
    );
  }

  // Bağlantı hatası
  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#092b3a] via-[#083547] to-[#06202c] text-slate-100 gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center">
          <Wrench className="w-6 h-6 text-rose-300" />
        </div>
        <div>
          <h2 className="text-lg font-black font-display">Sunucuya ulaşılamadı</h2>
          <p className="text-xs text-teal-200/70 mt-1 max-w-xs">{error}</p>
        </div>
        <button
          onClick={() => refreshServer()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-sm active:scale-95 transition"
        >
          <RefreshCw className="w-4 h-4" /> Tekrar Dene
        </button>
        <p className="text-[10px] text-teal-200/50 max-w-xs">
          Uygulama Telegram içinde açılmalıdır. Tarayıcıda test ediyorsanız sunucuyu DEV=1 ile başlatın.
        </p>
      </div>
    );
  }

  // Bakım modu
  if (adminSettings.maintenanceMode && !isAdmin) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#092b3a] via-[#083547] to-[#06202c] text-slate-100 gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl">
          🛠️
        </div>
        <h2 className="text-lg font-black font-display">Bakım çalışması</h2>
        <p className="text-xs text-teal-200/70 max-w-xs">
          Kozmik istasyon kısa bir bakımda. Lütfen birkaç dakika sonra tekrar aç.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-b from-[#092b3a] via-[#083547] to-[#06202c] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/22 via-teal-400/18 to-transparent blur-[110px] rounded-full" />
        <div className="absolute top-1/3 -left-20 w-[550px] h-[550px] bg-cyan-400/22 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-[600px] h-[600px] bg-teal-400/20 blur-[125px] rounded-full" />
        <div className="absolute top-2/3 left-1/4 w-[450px] h-[450px] bg-amber-400/14 blur-[115px] rounded-full" />
        <div
          className="w-full h-full opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #67e8f9 1.2px, transparent 0)`,
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      <div className="mx-auto w-full relative z-10 flex flex-col flex-1 max-w-5xl">
        <Header />
        <RandomEventPopup />

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

        <Navbar />

        <WalletModal />
        <DepositModal />
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
