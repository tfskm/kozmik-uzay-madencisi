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
  Coins,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

export const WalletAndHistory: React.FC = () => {
  const { user, transactions, setIsDepositModalOpen, setIsWalletModalOpen, adminSettings } = useGame();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'package_buy' | 'mine_claim' | 'repair'>('all');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    sounds.playClick();
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const filteredTxs = transactions.filter((tx) => (txFilter === 'all' ? true : tx.type === txFilter));

  const tonValue = (user.krdBalance / Math.max(0.0001, adminSettings.krdPerTon)).toFixed(2);

  return (
    <div className="space-y-6 pb-24">
      {/* Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e495d] via-[#093546] to-[#062432] border border-cyan-400/40 p-5 sm:p-6 shadow-2xl shadow-cyan-950/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {user.isConnected ? 'TON Cüzdan Bağlı' : 'Cüzdan Bağlı Değil'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 drop-shadow">
              {user.krdBalance.toFixed(2)}{' '}
              <span className="text-sm font-sans font-semibold text-teal-200">KRD</span>
            </h2>
            <div className="text-xs text-teal-200/80 font-mono mt-1 flex items-center gap-2 flex-wrap">
              <span>≈ {tonValue} TON değerinde</span>
              <span>•</span>
              <span className="text-cyan-300 font-semibold">{user.stardustBalance} Yıldız Tozu</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setIsDepositModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-teal-900/40 transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>TON ile KRD Yükle</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-5 pt-4 border-t border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-teal-200/70 shrink-0">Cüzdan:</span>
            <span className="font-mono text-cyan-200 font-bold truncate max-w-[200px] sm:max-w-xs">
              {user.walletAddress || 'Bağlı değil'}
            </span>
            {user.walletAddress && (
              <button
                onClick={() => copyToClipboard(user.walletAddress)}
                className="text-teal-300 hover:text-white p-1 rounded hover:bg-white/10 transition"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-[11px] text-cyan-300 hover:text-cyan-100 font-semibold underline underline-offset-2 self-start sm:self-auto"
          >
            {user.isConnected ? 'Cüzdanı yönet' : 'Cüzdan bağla'}
          </button>
        </div>
      </div>

      {/* How to load KRD */}
      <div className="bg-gradient-to-br from-[#0c3e4f] to-[#072936] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white font-display">KRD nasıl yüklenir?</h3>
            <ol className="text-xs text-teal-100/80 space-y-1 list-decimal list-inside">
              <li>Yukarıdaki <strong className="text-emerald-300">TON ile KRD Yükle</strong> düğmesine bas.</li>
              <li>Tonkeeper / Telegram Wallet ile cüzdanını bağla.</li>
              <li>Yüklemek istediğin TON miktarını seç ve ödemeyi onayla.</li>
              <li>Ödeme blokta onaylanınca KRD otomatik olarak hesabına eklenir.</li>
            </ol>
            <p className="text-[11px] text-teal-200/60">
              Kur: 1 TON = {adminSettings.krdPerTon} KRD · Minimum: {adminSettings.minTon} TON. KRD oyun içi para birimidir,
              nakde çevrilemez ve iade edilmez.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gradient-to-br from-[#0a3848] to-[#072633] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-300" />
            <h3 className="text-sm font-bold text-white font-display">İşlem Geçmişi ({filteredTxs.length})</h3>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['all', 'deposit', 'package_buy', 'mine_claim', 'repair'] as const).map((flt) => {
              const labelMap: Record<string, string> = {
                all: 'Tümü',
                deposit: 'Yüklemeler',
                package_buy: 'Paketler',
                mine_claim: 'Hasatlar',
                repair: 'Tamirler',
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
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md'
                      : 'bg-[#05222c] text-teal-200/80 hover:text-white border border-teal-500/20'
                  }`}
                >
                  {labelMap[flt]}
                </button>
              );
            })}
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <div className="text-center py-8 text-xs text-teal-300/50">
            Henüz bu kategoride işlem kaydı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'mine_claim' || tx.type === 'spin_win' || tx.type === 'daily';
              const isPending = tx.status === 'pending';
              const isRejected = tx.status === 'rejected';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#062633] border border-teal-500/25 hover:border-cyan-400/40 transition shadow-sm gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : tx.type === 'package_buy'
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                          : tx.type === 'repair'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : tx.type === 'package_buy' || tx.type === 'repair' ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Coins className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-teal-50 truncate">{tx.note}</div>
                      <div className="flex items-center gap-2 text-[10px] text-teal-300/60 font-mono mt-0.5">
                        <span>{new Date(tx.timestamp).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-teal-100'}`}>
                      {isPositive ? '+' : '−'}
                      {tx.currency === 'KRD' ? tx.amount.toFixed(2) : Math.round(tx.amount)}{' '}
                      <span className="text-[10px] text-teal-300/80 font-sans">{tx.currency}</span>
                    </div>

                    <span
                      className={`inline-block text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase mt-0.5 ${
                        isPending
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
                          : isRejected
                          ? 'bg-rose-400/20 text-rose-300 border border-rose-400/40'
                          : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
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

      <div className="bg-[#06222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-teal-100/70">
          <Sparkles className="w-3 h-3 inline text-amber-300" /> Tüm ödemeler TON ağı üzerinden alınır ve yalnızca KRD yüklemek
          içindir. KRD ve Yıldız Tozu'nun nakit değeri yoktur; geri çekme (withdraw) özelliği bulunmaz.
        </p>
      </div>
    </div>
  );
};
