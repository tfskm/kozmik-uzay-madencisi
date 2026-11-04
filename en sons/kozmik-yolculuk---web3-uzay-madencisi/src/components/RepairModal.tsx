import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { Wrench, X, Sparkles, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RepairModal: React.FC = () => {
  const {
    user,
    adminSettings,
    isRepairModalOpen,
    setIsRepairModalOpen,
    selectedMinerForRepair,
    repairMiner,
  } = useGame();

  const [useCurrency, setUseCurrency] = useState<'USDT' | 'STARDUST'>('STARDUST');

  if (!isRepairModalOpen || !selectedMinerForRepair) return null;

  const missingPercent = Math.max(0, 100 - selectedMinerForRepair.durability);
  const costUSDT = Number((missingPercent * adminSettings.repairCostPerPercent).toFixed(2));
  const costStardust = Math.ceil(missingPercent * 8);

  const handleRepair = () => {
    const res = repairMiner(selectedMinerForRepair.instanceId, useCurrency);
    if (res.success) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#34d399'],
      });
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl relative glow-gold">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsRepairModalOpen(false);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Madenci Bakım & Tamir Hangarı
            </h3>
            <p className="text-xs text-slate-400">
              {selectedMinerForRepair.packageName} ünitesini %100 kondisyona getirin
            </p>
          </div>
        </div>

        {/* Current Condition Card */}
        <div className="my-3.5 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Mevcut Kondisyon:</span>
            <span className="font-mono font-bold text-amber-400">
              %{Math.round(selectedMinerForRepair.durability)} / %100
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                selectedMinerForRepair.durability > 70
                  ? 'bg-emerald-500'
                  : selectedMinerForRepair.durability > 35
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${selectedMinerForRepair.durability}%` }}
            />
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            Aşınma: <strong className="text-rose-300">%{Math.round(missingPercent)}</strong> performans kaybı oluşturur. Tamir sonrası madenciniz tam kapasiteyle (+${selectedMinerForRepair.dailyYield.toFixed(2)}/gün) üretmeye devam eder.
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-semibold text-slate-300">Ödeme Yöntemi Seçin:</div>

          {/* Stardust option */}
          <button
            onClick={() => {
              sounds.playClick();
              setUseCurrency('STARDUST');
            }}
            className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
              useCurrency === 'STARDUST'
                ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-1 ring-purple-500'
                : 'border-slate-800 bg-slate-950/50 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Yıldız Tozu ile Tamir</div>
                <div className="text-[10px] text-slate-400">
                  Madenlerden bedava toplanan tozları kullanın
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-purple-300">
                {costStardust} Toz
              </div>
              <div className="text-[10px] text-slate-500">
                Mevcut: {user.stardustBalance}
              </div>
            </div>
          </button>

          {/* USDT option */}
          <button
            onClick={() => {
              sounds.playClick();
              setUseCurrency('USDT');
            }}
            className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
              useCurrency === 'USDT'
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                : 'border-slate-800 bg-slate-950/50 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">USDT Bakiyesi ile Tamir</div>
                <div className="text-[10px] text-slate-400">
                  Doğrudan ana cüzdan bakiyenizden düşer
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-emerald-300">
                ${costUSDT} USDT
              </div>
              <div className="text-[10px] text-slate-500">
                Mevcut: ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRepair}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs font-display uppercase tracking-wider transition shadow-lg shadow-amber-950 active:scale-95 flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          <span>Madenciyi %100 Yenile ve Tamir Et</span>
        </button>
      </div>
    </div>
  );
};
