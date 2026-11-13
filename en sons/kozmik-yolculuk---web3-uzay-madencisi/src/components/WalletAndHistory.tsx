import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  ExternalLink,
  ShieldCheck,
  Share2,
  Users,
  Coins,
  History,
  QrCode,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/40 p-5 sm:p-6 shadow-2xl glow-purple">
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
                Web3 Güvenli Cüzdan Bağlantısı
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              ${user.usdtBalance.toFixed(2)}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">USDT</span>
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              ≈ {(user.usdtBalance / 5.2).toFixed(2)} TON • {user.stardustBalance} Yıldız Tozu
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setIsDepositModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Yatır (Deposit)</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setIsWithdrawModalOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              <span>Çek (Withdraw)</span>
            </button>
          </div>
        </div>

        {/* Address and Provider */}
        <div className="mt-5 pt-4 border-t border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Cüzdan Adresi:</span>
            <span className="font-mono text-cyan-300 font-medium truncate max-w-[200px] sm:max-w-xs">
              {user.walletAddress || 'Cüzdan Bağlı Değil'}
            </span>
            {user.walletAddress && (
              <button
                onClick={() => copyToClipboard(user.walletAddress, 'addr')}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-[11px] text-indigo-300 hover:text-white underline underline-offset-2 self-start sm:self-auto"
          >
            Ağ veya Cüzdanı Değiştir
          </button>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Telegram Arkadaş Davet Sistemi (Referral)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Davet ettiğiniz her arkadaşınızın madencilik gelirinden <strong>%10 doğrudan komisyon</strong> ve anında <strong>100 Yıldız Tozu</strong> kazanın!
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-medium">Toplam Ref Kazancı</div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              ${user.referralEarnings.toFixed(2)} USDT
            </div>
          </div>
        </div>

        {/* Ref Link copy box */}
        <div className="mt-4 flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={refLink}
            className="bg-transparent text-xs text-cyan-300 font-mono flex-1 outline-none px-2 select-all"
          />
          <button
            onClick={() => copyToClipboard(refLink, 'ref')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-display">
              İşlem ve Finans Geçmişi ({filteredTxs.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs no-scrollbar">
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
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                    txFilter === flt
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
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
          <div className="text-center py-8 text-xs text-slate-500">
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
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.type === 'withdraw'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : tx.type === 'package_buy'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === 'withdraw' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <Coins className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {tx.note}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{new Date(tx.timestamp).toLocaleString('tr-TR')}</span>
                        {tx.txHash && <span>• Hash: {tx.txHash}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isPositive ? '+' : '-'}${tx.amount.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">{tx.currency}</span>
                    </div>

                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase mt-0.5 ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : isRejected
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300'
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
