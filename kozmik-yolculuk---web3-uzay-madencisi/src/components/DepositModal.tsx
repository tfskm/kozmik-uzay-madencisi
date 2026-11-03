import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { ArrowDownLeft, X, Copy, Check, QrCode, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, deposit } = useGame();

  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [selectedCurrency, setSelectedCurrency] = useState<'USDT' | 'TON'>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<'TON' | 'TRC20' | 'BEP20'>('TON');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isDepositModalOpen) return null;

  const depositAddresses: Record<string, string> = {
    TON: 'EQBvW_Z2tg958L0pL_y309Ksmz45nLQzB89M0qPrwXyt981T',
    TRC20: 'TYu8aN7cQ38mK1094vL8192K3b109McsQ',
    BEP20: '0x71C...38A91F2B45',
  };

  const currentDepositAddress = depositAddresses[selectedNetwork];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDepositAddress);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = () => {
    setIsProcessing(true);
    sounds.playCoin();

    setTimeout(() => {
      setIsProcessing(false);
      deposit(depositAmount, selectedCurrency);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#fbbf24'],
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl relative glow-emerald">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsDepositModalOpen(false);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Bakiye Yükleme (Deposit)
            </h3>
            <p className="text-xs text-slate-400">
              Paket satın almak ve filonuzu büyütmek için USDT veya TON yatırın
            </p>
          </div>
        </div>

        {/* Currency & Network Selector */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedCurrency('USDT');
            }}
            className={`p-2.5 rounded-xl border text-center transition ${
              selectedCurrency === 'USDT'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="text-xs">Tether (USDT)</div>
            <div className="text-[10px] opacity-75">1 USDT = $1.00</div>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSelectedCurrency('TON');
            }}
            className={`p-2.5 rounded-xl border text-center transition ${
              selectedCurrency === 'TON'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="text-xs">Toncoin (TON)</div>
            <div className="text-[10px] opacity-75">1 TON ≈ $5.20 USDT</div>
          </button>
        </div>

        {/* Network Pills */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] text-slate-400 font-medium">Ağ:</span>
          {(['TON', 'TRC20', 'BEP20'] as const).map((net) => (
            <button
              key={net}
              onClick={() => {
                sounds.playClick();
                setSelectedNetwork(net);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition ${
                selectedNetwork === net
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {net}
            </button>
          ))}
        </div>

        {/* Quick Amount Selectors */}
        <div className="mt-3.5">
          <label className="text-xs text-slate-300 font-medium mb-1.5 block">
            Yatırmak İstediğiniz Tutar ({selectedCurrency}):
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[25, 50, 100, 250].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  sounds.playClick();
                  setDepositAmount(amt);
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  depositAmount === amt
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="5"
            value={depositAmount}
            onChange={(e) => setDepositAmount(Math.max(5, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Deposit Address Box */}
        <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Yatırım Cüzdan Adresi ({selectedNetwork}):</span>
            <button
              onClick={handleCopy}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-slate-200 select-all break-all bg-black/40 p-2 rounded border border-white/5">
            {currentDepositAddress}
          </div>
        </div>

        {/* Confirmation Button */}
        <button
          onClick={handleConfirmDeposit}
          disabled={isProcessing}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs font-display uppercase tracking-wider transition shadow-lg shadow-emerald-950 active:scale-95 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Blokzincir Onayı Doğrulanıyor...</span>
          ) : (
            <span>Ödemeyi Tamamla (${depositAmount} {selectedCurrency})</span>
          )}
        </button>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ağ onayından sonra bakiye 1-3 dakika içinde otomatik geçer.</span>
        </div>
      </div>
    </div>
  );
};
