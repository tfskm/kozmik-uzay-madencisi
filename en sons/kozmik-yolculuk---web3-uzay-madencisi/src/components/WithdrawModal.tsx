import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { ArrowUpRight, X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const {
    user,
    adminSettings,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    requestWithdrawal,
  } = useGame();

  const [amount, setAmount] = useState<number>(25);
  const [address, setAddress] = useState<string>(user.walletAddress || '');
  const [selectedCurrency, setSelectedCurrency] = useState<'USDT' | 'TON'>('USDT');
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isWithdrawModalOpen) return null;

  const feeAmount = (amount * adminSettings.withdrawalFeePercent) / 100;
  const netAmount = Math.max(0, amount - feeAmount);
  const isAuto = amount <= adminSettings.autoApproveWithdrawalsUnder;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('Lütfen geçerli bir alıcı cüzdan adresi girin.');
      return;
    }

    const res = requestWithdrawal(amount, address, selectedCurrency);
    if (res.success) {
      setResultMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setResultMsg(null);
        setIsWithdrawModalOpen(false);
      }, 2500);
    } else {
      setResultMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl relative glow-cyan">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsWithdrawModalOpen(false);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Kazanç Çekimi (Withdraw)
            </h3>
            <p className="text-xs text-slate-400">
              Madencilik hasılatınızı doğrudan kişisel kripto cüzdanınıza çekin
            </p>
          </div>
        </div>

        {/* User Balance overview */}
        <div className="my-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">Kullanılabilir Bakiye:</span>
          <span className="font-mono font-bold text-sm text-emerald-400">
            ${user.usdtBalance.toFixed(2)} USDT
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Target Address */}
          <div>
            <label className="text-xs text-slate-300 font-medium mb-1 block">
              Alıcı Cüzdan Adresi (TON / TRC20 / BEP20):
            </label>
            <input
              type="text"
              required
              placeholder="EQB... veya 0x... veya T..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="text-slate-300 font-medium">Çekilecek Tutar (USDT):</label>
              <button
                type="button"
                onClick={() => setAmount(Math.floor(user.usdtBalance))}
                className="text-cyan-400 font-bold hover:underline"
              >
                Maksimum
              </button>
            </div>
            <input
              type="number"
              min={adminSettings.minWithdrawal}
              max={user.usdtBalance}
              step="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Çekim Tutarı:</span>
              <span>${amount.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Ağ ve Servis Ücreti (%{adminSettings.withdrawalFeePercent}):</span>
              <span className="text-rose-400">-${feeAmount.toFixed(2)} USDT</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-white font-bold">
              <span>Cüzdanınıza Geçecek Net:</span>
              <span className="text-emerald-400 text-sm">${netAmount.toFixed(2)} USDT</span>
            </div>
          </div>

          {/* Feedback Msg */}
          {resultMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={user.usdtBalance < amount || amount < adminSettings.minWithdrawal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase font-display tracking-wider transition shadow-lg active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {isAuto
              ? `Anında Çekimi Onayla ($${netAmount.toFixed(2)} Net)`
              : `Yönetici Onayına Gönder ($${netAmount.toFixed(2)} Net)`}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Minimum çekim: ${adminSettings.minWithdrawal} USDT. ${adminSettings.autoApproveWithdrawalsUnder} USDT ve altı anında onaylanır.</span>
        </div>
      </div>
    </div>
  );
};
