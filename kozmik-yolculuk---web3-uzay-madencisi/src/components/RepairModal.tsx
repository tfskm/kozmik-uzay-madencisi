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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a3848] via-[#08303e] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-cyan-950/60 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsRepairModalOpen(false);
          }}
          className="absolute top-4 right-4 text-teal-200/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-display">
              Madenci Bakım & Tamir Hangarı
            </h3>
            <p className="text-xs text-teal-100/70">
              {selectedMinerForRepair.packageName} ünitesini %100 kondisyona getirin
            </p>
          </div>
        </div>

        {/* Current Condition Card */}
        <div className="my-3.5 bg-[#05222d] border border-teal-500/30 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-teal-200/70">Mevcut Kondisyon:</span>
            <span className="font-mono font-black text-amber-300">
              %{Math.round(selectedMinerForRepair.durability)} / %100
            </span>
          </div>

          <div className="w-full bg-[#03151e] rounded-full h-2.5 overflow-hidden border border-teal-500/20">
            <div
              className={`h-full rounded-full transition-all ${
                selectedMinerForRepair.durability > 70
                  ? 'bg-emerald-400'
                  : selectedMinerForRepair.durability > 35
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${selectedMinerForRepair.durability}%` }}
            />
          </div>

          <div className="mt-2 text-[11px] text-teal-200/75">
            Aşınma: <strong className="text-rose-300">%{Math.round(missingPercent)}</strong> performans kaybı oluşturur. Tamir sonrası madenciniz tam kapasiteyle (+${selectedMinerForRepair.dailyYield.toFixed(2)}/gün) üretmeye devam eder.
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-semibold text-teal-100">Ödeme Yöntemi Seçin:</div>

          {/* Stardust option */}
          <button
            onClick={() => {
              sounds.playClick();
              setUseCurrency('STARDUST');
            }}
            className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
              useCurrency === 'STARDUST'
                ? 'border-cyan-400 bg-gradient-to-r from-[#093e4e] to-[#07323f] text-cyan-200 ring-2 ring-cyan-400/50 shadow-md'
                : 'border-teal-500/25 bg-[#05222d] text-teal-200/70 hover:bg-[#072c3a]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-300 stroke-[2.5]" />
              <div>
                <div className="text-xs font-bold text-white">Yıldız Tozu ile Tamir</div>
                <div className="text-[10px] text-teal-200/60">
                  Madenlerden bedava toplanan tozları kullanın
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black font-mono text-cyan-300">
                {costStardust} Toz
              </div>
              <div className="text-[10px] text-teal-300/70 font-mono">
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
            className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
              useCurrency === 'USDT'
                ? 'border-emerald-400 bg-gradient-to-r from-[#093e4e] to-[#07323f] text-emerald-300 ring-2 ring-emerald-400/50 shadow-md'
                : 'border-teal-500/25 bg-[#05222d] text-teal-200/70 hover:bg-[#072c3a]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <div>
                <div className="text-xs font-bold text-white">USDT Bakiyesi ile Tamir</div>
                <div className="text-[10px] text-teal-200/60">
                  Doğrudan ana cüzdan bakiyenizden düşer
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black font-mono text-emerald-300">
                ${costUSDT} USDT
              </div>
              <div className="text-[10px] text-teal-300/70 font-mono">
                Mevcut: ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRepair}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs font-display uppercase tracking-wider transition shadow-lg shadow-teal-950 active:scale-95 flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4 stroke-[2.5]" />
          <span>Madenciyi %100 Yenile ve Tamir Et</span>
        </button>
      </div>
    </div>
  );
};
