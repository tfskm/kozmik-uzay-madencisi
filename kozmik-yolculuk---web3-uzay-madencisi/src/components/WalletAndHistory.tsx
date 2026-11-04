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
} from 'lucide-react';

export const WalletAndHistory: React.FC = () => {
  const {
    user,
    transactions,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    setIsWalletModalOpen,
  } = useGame();

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdraw' | 'package_buy' | 'mine_claim'>('all');

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

  const filteredTxs = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    return tx.type === txFilter;
  });

  const refLink = `https://t.me/CosmicMinerBot?start=${user.referralCode}`;

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
                Web3 Güvenli Cüzdan Bağlantısı
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 drop-shadow">
              ${user.usdtBalance.toFixed(2)}{' '}
              <span className="text-sm font-sans font-semibold text-teal-200">USDT</span>
            </h2>
            <div className="text-xs text-teal-200/80 font-mono mt-1 flex items-center gap-2">
              <span>≈ {(user.usdtBalance / 5.2).toFixed(2)} TON</span>
              <span>•</span>
              <span className="text-cyan-300 font-semibold">{user.stardustBalance} Yıldız Tozu</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setIsDepositModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-teal-900/40 transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Yatır (Deposit)</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setIsWithdrawModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#07303f] hover:bg-[#0a3b4e] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-teal-400/40 transition active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-300 stroke-[2.5]" />
              <span>Çek (Withdraw)</span>
            </button>
          </div>
        </div>

        {/* Address and Provider */}
        <div className="relative z-10 mt-5 pt-4 border-t border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-teal-200/70">Cüzdan Adresi:</span>
            <span className="font-mono text-cyan-200 font-bold truncate max-w-[200px] sm:max-w-xs">
              {user.walletAddress || 'Cüzdan Bağlı Değil'}
            </span>
            {user.walletAddress && (
              <button
                onClick={() => copyToClipboard(user.walletAddress, 'addr')}
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
            Ağ veya Cüzdanı Değiştir
          </button>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="bg-gradient-to-br from-[#0c3e4f] to-[#072936] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Telegram Arkadaş Davet Sistemi (Referral)
              </h3>
              <p className="text-xs text-teal-100/75 mt-0.5">
                Davet ettiğiniz her arkadaşınızın madencilik gelirinden <strong className="text-emerald-300">%10 doğrudan komisyon</strong> ve anında <strong className="text-cyan-300">100 Yıldız Tozu</strong> kazanın!
              </p>
            </div>
          </div>

          <div className="bg-[#05212b] border border-teal-500/30 rounded-xl p-2.5 text-right shrink-0">
            <div className="text-[10px] text-teal-300/80 font-medium">Toplam Ref Kazancı</div>
            <div className="text-base font-black text-emerald-400 font-mono">
              ${user.referralEarnings.toFixed(2)} USDT
            </div>
          </div>
        </div>

        {/* Ref Link copy box */}
        <div className="mt-4 flex items-center gap-2 bg-[#05202b] border border-teal-500/30 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={refLink}
            className="bg-transparent text-xs text-cyan-200 font-mono flex-1 outline-none px-2 select-all"
          />
          <button
            onClick={() => copyToClipboard(refLink, 'ref')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{copiedRef ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gradient-to-br from-[#0a3848] to-[#072633] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-300" />
            <h3 className="text-sm font-bold text-white font-display">
              İşlem ve Finans Geçmişi ({filteredTxs.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['all', 'deposit', 'withdraw', 'package_buy', 'mine_claim'] as const).map((flt) => {
              const labelMap: Record<string, string> = {
                all: 'Tümü',
                deposit: 'Yatırımlar',
                withdraw: 'Çekimler',
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

        {/* History List */}
        {filteredTxs.length === 0 ? (
          <div className="text-center py-8 text-xs text-teal-300/50">
            Henüz bu kategoride işlem kaydı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'mine_claim' || tx.type === 'spin_win';
              const isPending = tx.status === 'pending';
              const isRejected = tx.status === 'rejected';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#062633] border border-teal-500/25 hover:border-cyan-400/40 transition shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : tx.type === 'withdraw'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : tx.type === 'package_buy'
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : tx.type === 'withdraw' ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Coins className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-teal-50">
                        {tx.note}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-teal-300/60 font-mono mt-0.5">
                        <span>{new Date(tx.timestamp).toLocaleString('tr-TR')}</span>
                        {tx.txHash && <span>• Hash: {tx.txHash}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-black text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-teal-100'
                      }`}
                    >
                      {isPositive ? '+' : '-'}${tx.amount.toFixed(2)}{' '}
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
    </div>
  );
};
