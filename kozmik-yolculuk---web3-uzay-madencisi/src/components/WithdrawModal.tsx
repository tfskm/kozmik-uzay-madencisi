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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a3848] via-[#08303e] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-cyan-950/60 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsWithdrawModalOpen(false);
          }}
          className="absolute top-4 right-4 text-teal-200/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-display">
              Kazanç Çekimi (Withdraw)
            </h3>
            <p className="text-xs text-teal-100/70">
              Madencilik hasılatınızı doğrudan kişisel kripto cüzdanınıza çekin
            </p>
          </div>
        </div>

        {/* User Balance overview */}
        <div className="my-3 bg-[#05222d] border border-teal-500/30 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs text-teal-200/80">Kullanılabilir Bakiye:</span>
          <span className="font-mono font-black text-sm text-emerald-400">
            ${user.usdtBalance.toFixed(2)} USDT
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Target Address */}
          <div>
            <label className="text-xs text-teal-100 font-semibold mb-1 block">
              Alıcı Cüzdan Adresi (TON / TRC20 / BEP20):
            </label>
            <input
              type="text"
              required
              placeholder="EQB... veya 0x... veya T..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#05202b] border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-100 font-mono text-xs outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="text-teal-100 font-semibold">Çekilecek Tutar (USDT):</label>
              <button
                type="button"
                onClick={() => setAmount(Math.floor(user.usdtBalance))}
                className="text-cyan-300 font-bold hover:text-cyan-100 hover:underline"
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
              className="w-full bg-[#05202b] border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-200 font-mono text-sm outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Calculation Breakdown */}
          <div className="bg-[#05202b] rounded-2xl p-3 border border-teal-500/30 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-teal-200/70">
              <span>Çekim Tutarı:</span>
              <span className="text-white font-bold">${amount.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center justify-between text-teal-200/70">
              <span>Ağ ve Servis Ücreti (%{adminSettings.withdrawalFeePercent}):</span>
              <span className="text-rose-300 font-bold">-${feeAmount.toFixed(2)} USDT</span>
            </div>
            <div className="pt-1.5 border-t border-teal-500/25 flex items-center justify-between text-white font-black">
              <span>Cüzdanınıza Geçecek Net:</span>
              <span className="text-emerald-300 text-sm font-black">${netAmount.toFixed(2)} USDT</span>
            </div>
          </div>

          {/* Feedback Msg */}
          {resultMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-400/50 text-emerald-300'
                  : 'bg-rose-950/70 border border-rose-400/50 text-rose-300'
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase font-display tracking-wider transition shadow-lg shadow-teal-950 active:scale-95 disabled:bg-[#062430] disabled:text-teal-200/30 disabled:cursor-not-allowed"
          >
            {isAuto
              ? `Anında Çekimi Onayla ($${netAmount.toFixed(2)} Net)`
              : `Yönetici Onayına Gönder ($${netAmount.toFixed(2)} Net)`}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-teal-200/70">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Minimum çekim: ${adminSettings.minWithdrawal} USDT. ${adminSettings.autoApproveWithdrawalsUnder} USDT ve altı anında onaylanır.</span>
        </div>
      </div>
    </div>
  );
};
