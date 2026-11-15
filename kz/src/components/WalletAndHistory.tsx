import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, Check, History, Coins, ShieldCheck, Sparkles, Info, Send, Clock } from 'lucide-react';

export const WalletAndHistory: React.FC = () => {
  const { user, transactions, setIsDepositModalOpen, setIsWalletModalOpen, adminSettings, withdrawals, refreshWithdrawals, requestWithdraw } = useGame();
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'package_buy' | 'mine_claim' | 'repair' | 'withdraw'>('all');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [wBusy, setWBusy] = useState(false);
  const [wMsg, setWMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { refreshWithdrawals(); }, [refreshWithdrawals]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    sounds.playClick();
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const filteredTxs = transactions.filter((tx) => (txFilter === 'all' ? true : tx.type === txFilter));
  const tonValue = (user.krdBalance / Math.max(0.0001, adminSettings.krdPerTon)).toFixed(4);
  const minW = adminSettings.minWithdrawKrd ?? 200;
  const rateW = adminSettings.withdrawRateKrdPerTon ?? 100;

  const submitWithdraw = async () => {
    const amt = Math.floor(Number(withdrawAmt));
    if (!Number.isFinite(amt) || amt <= 0) return;
    setWBusy(true); setWMsg(null);
    const r = await requestWithdraw(amt);
    setWBusy(false);
    setWMsg({ ok: r.success, text: r.message });
    if (r.success) setWithdrawAmt('');
  };

  const statusLabel = (s: string) => s === 'pending' ? 'BEKLİYOR' : s === 'approved' ? 'ONAYLANDI' : s === 'rejected' ? 'REDDEDİLDİ' : s === 'paid' ? 'ÖDENDİ' : s;

  return (
    <div className="space-y-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e495d] via-[#093546] to-[#062432] border border-cyan-400/40 p-5 sm:p-6 shadow-2xl shadow-cyan-950/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">{user.isConnected ? 'TON Cüzdan Bağlı' : 'Cüzdan Bağlı Değil'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 drop-shadow">{user.krdBalance.toFixed(2)} <span className="text-sm font-sans font-semibold text-teal-200">KRD</span></h2>
            <div className="text-xs text-teal-200/80 font-mono mt-1 flex items-center gap-2 flex-wrap">
              <span>≈ {tonValue} TON (yükleme değeri)</span><span>•</span><span className="text-cyan-300 font-semibold">{user.stardustBalance} Yıldız Tozu</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <button onClick={() => { sounds.playClick(); setIsDepositModalOpen(true); }} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /><span>TON ile KRD Yükle</span>
            </button>
          </div>
        </div>
        <div className="relative z-10 mt-5 pt-4 border-t border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-teal-200/70 shrink-0">Cüzdan:</span>
            <span className="font-mono text-cyan-200 font-bold truncate max-w-[200px] sm:max-w-xs">{user.walletAddress || 'Bağlı değil'}</span>
            {user.walletAddress && (<button onClick={() => copyToClipboard(user.walletAddress)} className="text-teal-300 hover:text-white p-1 rounded hover:bg-white/10 transition">{copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}</button>)}
          </div>
          <button onClick={() => setIsWalletModalOpen(true)} className="text-[11px] text-cyan-300 hover:text-cyan-100 font-semibold underline underline-offset-2 self-start sm:self-auto">{user.isConnected ? 'Cüzdanı yönet' : 'Cüzdan bağla'}</button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0c3e4f] to-[#072936] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40"><Send className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">TON (Gram) Çekim Talebi</h3>
            <p className="text-[11px] text-teal-100/75 mt-0.5">Kazanılan KRD, admin onayıyla TON olarak çekilebilir. Kur: <b className="text-cyan-300">{rateW} KRD = 1 TON</b> • Min: <b>{minW} KRD</b> • Bekleme: {adminSettings.withdrawCooldownHours ?? 72}s • Haftalık: {adminSettings.weeklyWithdrawCapKrd ?? 500} KRD</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input type="number" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} placeholder={`Miktar (min ${minW} KRD)`} className="flex-1 bg-[#05222d] border border-teal-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400/70" />
          <button onClick={submitWithdraw} disabled={wBusy || !adminSettings.withdrawEnabled} className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs disabled:opacity-50">{wBusy ? '...' : 'Talep Oluştur'}</button>
        </div>
        {wMsg && <div className={`text-[11px] ${wMsg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{wMsg.text}</div>}
        {!adminSettings.withdrawEnabled && <div className="text-[11px] text-amber-300">Çekimler geçici olarak kapalı.</div>}
        <div className="text-[10px] text-teal-200/60">Talepte KRD ayrılır; admin onayı ve manuel TON gönderimi sonrası “Ödendi” olur. Reddedilirse KRD iade edilir.</div>
        {withdrawals.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-teal-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Çekim Taleplerim</div>
            {withdrawals.slice(0, 10).map((w) => (
              <div key={w.id} className="flex items-center justify-between bg-[#05222d] border border-teal-500/25 rounded-xl p-2.5 text-[11px]">
                <div><div className="text-white font-bold">{Number(w.krd).toFixed(2)} KRD → {Number(w.ton).toFixed(4)} TON</div><div className="text-teal-300/60">{new Date(w.created).toLocaleString('tr-TR')}</div></div>
                <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${w.status==='paid'||w.status==='approved' ? 'bg-emerald-500/20 text-emerald-300' : w.status==='rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{statusLabel(w.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#0c3e4f] to-[#072936] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40"><Info className="w-5 h-5" /></div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white font-display">KRD nasıl yüklenir?</h3>
            <ol className="text-xs text-teal-100/80 space-y-1 list-decimal list-inside">
              <li><strong className="text-emerald-300">TON ile KRD Yükle</strong> düğmesine bas.</li>
              <li>Cüzdanınla ödemeyi onayla.</li>
              <li>Onaylanınca KRD hesabına eklenir.</li>
            </ol>
            <p className="text-[11px] text-teal-200/60">Yükleme kuru: 1 TON = {adminSettings.krdPerTon} KRD • Min: {adminSettings.minTon} TON.</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0a3848] to-[#072633] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2"><History className="w-4 h-4 text-cyan-300" /><h3 className="text-sm font-bold text-white font-display">İşlem Geçmişi ({filteredTxs.length})</h3></div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['all','deposit','package_buy','mine_claim','repair','withdraw'] as const).map((flt) => {
              const labelMap: Record<string,string> = { all:'Tümü', deposit:'Yüklemeler', package_buy:'Paketler', mine_claim:'Hasatlar', repair:'Tamirler', withdraw:'Çekim' };
              return (<button key={flt} onClick={() => { sounds.playClick(); setTxFilter(flt); }} className={`px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${txFilter===flt ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md' : 'bg-[#05222c] text-teal-200/80 hover:text-white border border-teal-500/20'}`}>{labelMap[flt]}</button>);
            })}
          </div>
        </div>
        {filteredTxs.length === 0 ? (<div className="text-center py-8 text-xs text-teal-300/50">Bu kategoride işlem kaydı yok.</div>) : (
          <div className="space-y-2">
            {filteredTxs.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'mine_claim' || tx.type === 'spin_win' || tx.type === 'daily';
              const isPending = tx.status === 'pending'; const isRejected = tx.status === 'rejected';
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-[#062633] border border-teal-500/25 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${tx.type==='deposit' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'}`}>
                      {isPositive ? <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /> : <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />}
                    </div>
                    <div className="min-w-0"><div className="text-xs font-bold text-teal-50 truncate">{tx.note}</div><div className="text-[10px] text-teal-300/60 font-mono mt-0.5">{new Date(tx.timestamp).toLocaleString('tr-TR')}</div></div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-teal-100'}`}>{isPositive ? '+' : '-'}{tx.currency === 'KRD' ? tx.amount.toFixed(2) : Math.round(tx.amount)} <span className="text-[10px] text-teal-300/80 font-sans">{tx.currency}</span></div>
                    <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase mt-0.5 ${isPending ? 'bg-amber-400/20 text-amber-300' : isRejected ? 'bg-rose-400/20 text-rose-300' : 'bg-emerald-400/20 text-emerald-300'}`}>{isPending ? 'BEKLİYOR' : isRejected ? 'REDDEDİLDİ' : 'TAMAMLANDI'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#06222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-teal-100/70"><Sparkles className="w-3 h-3 inline text-amber-300" /> Yüklemeler TON ağı üzerinden alınır. Çekimler limit/kura tabidir ve <b>admin onayı</b> sonrası manuel olarak ödenir; gelir garantisi yoktur.</p>
      </div>
    </div>
  );
};
