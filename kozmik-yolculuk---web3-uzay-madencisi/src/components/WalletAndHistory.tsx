import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  History,
  Users,
  Coins,
  ShieldCheck,
  Sparkles,
  Repeat,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalletAndHistory: React.FC = () => {
  const {
    user,
    transactions,
    adminSettings,
    swapStardustToUsdt,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsWalletModalOpen,
  } = useGame();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdraw' | 'stardust_swap' | 'package_buy' | 'mine_claim'>('all');

  // Swap State
  const rate = adminSettings.stardustPerUsdt || 1000;
  const [swapDustAmount, setSwapDustAmount] = useState<number>(() => Math.min(user.stardustBalance, 1000));
  const [swapMsg, setSwapMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const calculatedUsdt = Number((swapDustAmount / rate).toFixed(2));

  const copyToClipboard = (text: string, type: 'addr' | 'ref') => {
    navigator.clipboard.writeText(text);
    sounds.playClick();
    if (type === 'addr') {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (swapDustAmount <= 0) {
      setSwapMsg({ type: 'error', text: 'Lütfen geçerli bir Uzay Tozu miktarı girin.' });
      return;
    }
    const res = swapStardustToUsdt(swapDustAmount);
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#fbbf24'],
      });
      setSwapMsg({ type: 'success', text: res.message });
      setSwapDustAmount(0);
      setTimeout(() => setSwapMsg(null), 4000);
    } else {
      setSwapMsg({ type: 'error', text: res.message });
      setTimeout(() => setSwapMsg(null), 4000);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    return tx.type === txFilter;
  });

  const refLink = `https://t.me/CosmicMinerBot?start=${user.referralCode}`;

  return (
    <div className="space-y-5 pb-24 text-slate-800">
      {/* 1. Main Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-cyan-50/70 to-emerald-50/60 border border-teal-200 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider">
                Web3 Güvenli Cüzdan Bağlantısı
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono mt-1">
              ${user.usdtBalance.toFixed(2)}{' '}
              <span className="text-sm font-sans font-bold text-emerald-600">USDT</span>
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-2 font-medium">
              <span>≈ {(user.usdtBalance / 5.2).toFixed(2)} TON</span>
              <span>•</span>
              <span className="text-cyan-800 font-bold bg-cyan-100/70 px-2 py-0.5 rounded-md">
                {user.stardustBalance.toLocaleString()} Uzay Tozu
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setIsDepositModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Yatır (Deposit)</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setIsWithdrawModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 transition active:scale-95 shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-600 stroke-[2.5]" />
              <span>Çek (Withdraw)</span>
            </button>
          </div>
        </div>

        {/* Address and Provider */}
        <div className="mt-5 pt-4 border-t border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-slate-500 font-medium">Cüzdan Adresi:</span>
            <span className="font-mono text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs">
              {user.walletAddress || 'Cüzdan Bağlı Değil'}
            </span>
            {user.walletAddress && (
              <button
                onClick={() => copyToClipboard(user.walletAddress, 'addr')}
                className="text-slate-500 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-[11px] text-teal-700 hover:text-teal-900 font-bold underline underline-offset-2 self-start sm:self-auto"
          >
            Ağ veya Cüzdanı Değiştir
          </button>
        </div>
      </div>

      {/* 2. UZAY TOZU ⇄ USDT SWAP / DÖNÜŞTÜRÜCÜ (KULLANICI TALEBİ) */}
      <div className="bg-white border-2 border-cyan-400/80 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-400 text-white flex items-center justify-center shadow-sm">
              <Repeat className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-display">
                  Uzay Tozu ⇄ USDT Swap Paneli
                </h3>
                <span className="bg-cyan-100 text-cyan-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-cyan-300">
                  ANINDA BOZDUR
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Oyunda topladığınız Uzay Tozlarını anında likit USDT'ye çevirin
              </p>
            </div>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-xl text-right">
            <div className="text-[10px] text-slate-500 font-medium">Güncel Swap Kuru</div>
            <div className="text-xs font-mono font-black text-teal-800">
              1 USDT = {rate.toLocaleString()} Toz
            </div>
          </div>
        </div>

        <form onSubmit={handleExecuteSwap} className="space-y-3.5">
          {/* Swap Input Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Bozdurulacak Uzay Tozu:</span>
              <div className="flex items-center gap-1 font-mono text-xs">
                <span className="text-slate-500">Mevcut:</span>
                <strong className="text-teal-700">{user.stardustBalance.toLocaleString()} Toz</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={user.stardustBalance}
                value={swapDustAmount || ''}
                onChange={(e) => setSwapDustAmount(Math.max(0, Number(e.target.value)))}
                placeholder="Örn: 1000"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-base font-black outline-none focus:border-cyan-500 transition shadow-xs"
              />

              <div className="flex items-center gap-1">
                {[0.25, 0.5, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSwapDustAmount(Math.floor(user.stardustBalance * pct))}
                    className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-2 py-2 rounded-xl transition shadow-xs"
                  >
                    {pct === 1 ? 'Maks' : `%${pct * 100}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Swap Outcome Preview Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-slate-700">Cüzdana Aktarılacak Net USDT:</span>
            </div>
            <div className="text-lg font-black text-emerald-700 font-mono">
              +${calculatedUsdt.toFixed(2)} USDT
            </div>
          </div>

          {/* Feedback msg */}
          {swapMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                swapMsg.type === 'success'
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                  : 'bg-rose-100 border border-rose-300 text-rose-800'
              }`}
            >
              {swapMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{swapMsg.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={user.stardustBalance < 1 || swapDustAmount < 1}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xs uppercase font-display tracking-wider transition shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Repeat className="w-4 h-4 stroke-[2.5]" />
            <span>Hemen USDT'ye Dönüştür (Swap Yap)</span>
          </button>
        </form>
      </div>

      {/* 3. Referral Program Card */}
      <div className="bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Telegram Arkadaş Davet Sistemi (Referral)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Davet ettiğiniz her arkadaşınızın hasat gelirinden <strong className="text-emerald-700">%10 komisyon</strong> ve anında <strong className="text-cyan-800">100 Uzay Tozu</strong> kazanın!
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-right shrink-0">
            <div className="text-[10px] text-slate-500 font-medium">Toplam Ref Kazancı</div>
            <div className="text-base font-black text-emerald-600 font-mono">
              ${user.referralEarnings.toFixed(2)} USDT
            </div>
          </div>
        </div>

        {/* Ref Link copy box */}
        <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={refLink}
            className="bg-transparent text-xs text-cyan-900 font-mono flex-1 outline-none px-2 select-all font-semibold"
          />
          <button
            onClick={() => copyToClipboard(refLink, 'ref')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{copiedRef ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* 4. Transaction History */}
      <div className="bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              İşlem ve Finans Geçmişi ({filteredTxs.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['all', 'deposit', 'withdraw', 'stardust_swap', 'package_buy', 'mine_claim'] as const).map((flt) => {
              const labelMap: Record<string, string> = {
                all: 'Tümü',
                deposit: 'Yatırımlar',
                withdraw: 'Çekimler',
                stardust_swap: 'Swaplar',
                package_buy: 'Paketler',
                mine_claim: 'Hasatlar',
              };

              return (
                <button
                  key={flt}
                  onClick={() => {
                    sounds.playClick();
                    setTxFilter(flt);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                    txFilter === flt
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {labelMap[flt]}
                </button>
              );
            })}
          </div>
        </div>

        {/* History List */}
        {filteredTxs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Henüz bu kategoride işlem kaydı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'mine_claim' || tx.type === 'stardust_swap';
              const isPending = tx.status === 'pending';
              const isRejected = tx.status === 'rejected';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-teal-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : tx.type === 'withdraw'
                          ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                          : tx.type === 'stardust_swap'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-teal-100 text-teal-700 border-teal-200'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : tx.type === 'withdraw' ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : tx.type === 'stardust_swap' ? (
                        <Repeat className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Coins className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {tx.note}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{new Date(tx.timestamp).toLocaleString('tr-TR')}</span>
                        {tx.txHash && <span>• Hash: {tx.txHash}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-black text-sm ${
                        isPositive ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {isPositive ? '+' : '-'}{tx.currency === 'STARDUST' ? tx.amount.toLocaleString() : `$${tx.amount.toFixed(2)}`}{' '}
                      <span className="text-[10px] text-slate-500 font-sans">{tx.currency}</span>
                    </div>

                    <span
                      className={`inline-block text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase mt-0.5 ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isPending ? 'ONAY BEKLİYOR' : isRejected ? 'REDDEDİLDİ' : 'TAMAMLANDI'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
