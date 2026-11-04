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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a3848] via-[#08303e] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-cyan-950/60 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsDepositModalOpen(false);
          }}
          className="absolute top-4 right-4 text-teal-200/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-display">
              Bakiye Yükleme (Deposit)
            </h3>
            <p className="text-xs text-teal-100/70">
              Paket satın almak ve filonuzu büyütmek için USDT veya TON yatırın
            </p>
          </div>
        </div>

        {/* Currency & Network Selector */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedCurrency('USDT');
            }}
            className={`p-3 rounded-2xl border text-center transition ${
              selectedCurrency === 'USDT'
                ? 'bg-[#093d4e] border-emerald-400 text-emerald-300 font-black shadow-md ring-1 ring-emerald-400/50'
                : 'bg-[#05222d] border-teal-500/25 text-teal-200/70 hover:text-white hover:bg-[#072c3a]'
            }`}
          >
            <div className="text-xs font-bold">Tether (USDT)</div>
            <div className="text-[10px] opacity-75 font-mono">1 USDT = $1.00</div>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSelectedCurrency('TON');
            }}
            className={`p-3 rounded-2xl border text-center transition ${
              selectedCurrency === 'TON'
                ? 'bg-[#093d4e] border-cyan-400 text-cyan-300 font-black shadow-md ring-1 ring-cyan-400/50'
                : 'bg-[#05222d] border-teal-500/25 text-teal-200/70 hover:text-white hover:bg-[#072c3a]'
            }`}
          >
            <div className="text-xs font-bold">Toncoin (TON)</div>
            <div className="text-[10px] opacity-75 font-mono">1 TON ≈ $5.20 USDT</div>
          </button>
        </div>

        {/* Network Pills */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] text-teal-200/70 font-medium">Ağ:</span>
          {(['TON', 'TRC20', 'BEP20'] as const).map((net) => (
            <button
              key={net}
              onClick={() => {
                sounds.playClick();
                setSelectedNetwork(net);
              }}
              className={`px-3 py-1 rounded-xl text-[10px] font-mono font-black transition ${
                selectedNetwork === net
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-md'
                  : 'bg-[#05222d] text-teal-200/80 border border-teal-500/25 hover:text-white'
              }`}
            >
              {net}
            </button>
          ))}
        </div>

        {/* Quick Amount Selectors */}
        <div className="mt-4">
          <label className="text-xs text-teal-100 font-semibold mb-1.5 block">
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
                className={`py-1.5 rounded-xl text-xs font-mono font-black transition ${
                  depositAmount === amt
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md'
                    : 'bg-[#05222d] text-teal-200/80 border border-teal-500/25 hover:bg-[#08303f]'
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
            className="w-full bg-[#05202b] border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-200 font-mono text-sm outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Deposit Address Box */}
        <div className="mt-4 bg-[#05202b] border border-teal-500/30 rounded-2xl p-3">
          <div className="flex items-center justify-between text-[11px] text-teal-200/70 mb-1">
            <span>Yatırım Cüzdan Adresi ({selectedNetwork}):</span>
            <button
              onClick={handleCopy}
              className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-bold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-cyan-100 select-all break-all bg-[#03151d] p-2.5 rounded-xl border border-teal-500/20">
            {currentDepositAddress}
          </div>
        </div>

        {/* Confirmation Button */}
        <button
          onClick={handleConfirmDeposit}
          disabled={isProcessing}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs font-display uppercase tracking-wider transition shadow-lg shadow-teal-950 active:scale-95 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Blokzincir Onayı Doğrulanıyor...</span>
          ) : (
            <span>Ödemeyi Tamamla (${depositAmount} {selectedCurrency})</span>
          )}
        </button>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-teal-300/70 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ağ onayından sonra bakiye 1-3 dakika içinde otomatik geçer.</span>
        </div>
      </div>
    </div>
  );
};
