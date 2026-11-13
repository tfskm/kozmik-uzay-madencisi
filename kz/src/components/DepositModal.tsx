import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { api, commentPayload } from '../lib/api';

const PACKS = [1, 5, 10, 25]; // TON

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, applyPurchasedStardust } = useGame();
  const [tonUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [ton, setTon] = useState(5);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  if (!isDepositModalOpen) return null;

  const pollCredit = async () => {
    for (let i = 0; i < 40; i++) { // ~3 dk boyunca blok onayını bekle
      await new Promise(r => setTimeout(r, 5000));
      try {
        const j = await api<{ credited: number }>('claim-stardust', {});
        if (j.credited > 0) {
          applyPurchasedStardust(j.credited);
          setMsg(`✨ ${j.credited} Yıldız Tozu hesabına eklendi!`);
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          setBusy(false); return;
        }
      } catch { /* tekrar dene */ }
    }
    setMsg('Ödeme henüz görünmedi. Gelirse otomatik eklenir; uygulamayı yeniden açabilirsin.');
    setBusy(false);
  };

  const pay = async () => {
    try {
      setBusy(true); setMsg('');
      const cfg = await api<{ treasury: string; uid: string }>('config');
      await tonUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: cfg.treasury, amount: String(Math.round(ton * 1e9)), payload: commentPayload(`UID:${cfg.uid}`) }],
      });
      setMsg('Ödeme gönderildi, blok onayı bekleniyor…'); sounds.playCoin(); pollCredit();
    } catch { setMsg('İşlem iptal edildi veya başarısız.'); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4">
      <div className="bg-gradient-to-b from-[#0a3848] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 relative">
        <button onClick={() => { sounds.playClick(); setIsDepositModalOpen(false); }} className="absolute top-4 right-4 text-teal-200/70 hover:text-white p-1"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-black text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-300" /> Yıldız Tozu Satın Al</h2>
        <p className="text-xs text-teal-100/80 mt-1">TON ile ödersin, Yıldız Tozu oyun içinde tamir, hızlandırma ve gezegen açmak için harcanır.</p>
        <div className="mt-4 flex justify-center"><TonConnectButton /></div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {PACKS.map(p => (
            <button key={p} onClick={() => setTon(p)} className={`py-2 rounded-xl text-sm font-bold border ${ton === p ? 'bg-cyan-400 text-slate-950 border-cyan-300' : 'bg-[#07303f] text-white border-teal-400/30'}`}>{p} TON</button>
          ))}
        </div>
        <button disabled={!wallet || busy} onClick={pay} className="w-full mt-4 py-3 rounded-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 disabled:opacity-40">
          {busy ? 'Bekleniyor…' : wallet ? `${ton} TON öde` : 'Önce cüzdanını bağla'}
        </button>
        {msg && <p className="text-xs text-cyan-200 mt-3 text-center">{msg}</p>}
        <p className="text-[10px] text-teal-200/60 mt-4 flex gap-1.5"><ShieldCheck className="w-3 h-3 shrink-0" /> Yıldız Tozu nakde çevrilemez, iade edilmez ve yatırım getirisi içermez. Oyun içi dijital üründür.</p>
      </div>
    </div>
  );
};
