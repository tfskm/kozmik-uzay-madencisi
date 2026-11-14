import React, { useEffect, useState } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { X, Sparkles, ShieldCheck, Wallet, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { api, commentPayload } from '../lib/api';

const PACKS = [1, 5, 10, 25]; // TON

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, applyPurchasedStardust, adminSettings, setIsWalletModalOpen } = useGame();
  const [tonUI] = useTonConnectUI();
  const wallet = useTonAddress();
  const [ton, setTon] = useState(5);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [cfg, setCfg] = useState<{ treasury: string; uid: string; perTon: number; minTon: number } | null>(null);

  useEffect(() => {
    if (!isDepositModalOpen) return;
    api<{ treasury: string; uid: string; perTon: number; minTon: number }>('config')
      .then(setCfg)
      .catch(() => setMsg('Sunucu yapılandırması alınamadı.'));
  }, [isDepositModalOpen]);

  if (!isDepositModalOpen) return null;

  const perTon = cfg?.perTon ?? adminSettings.krdPerTon;
  const minTon = cfg?.minTon ?? adminSettings.minTon;
  const krd = Math.floor(ton * perTon);

  const pollCredit = async () => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const j = await api<{ credited: number }>('claim-deposit', {});
        if (j.credited > 0) {
          applyPurchasedStardust(j.credited);
          setMsg(`✨ ${j.credited.toFixed(2)} KRD hesabına eklendi!`);
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          setBusy(false);
          return;
        }
      } catch {
        /* tekrar dene */
      }
    }
    setMsg('Ödeme henüz görünmedi. Blok onayı birkaç dakika sürebilir; "Ödemeyi Kontrol Et" ile tekrar deneyebilirsin.');
    setBusy(false);
  };

  const checkNow = async () => {
    try {
      const j = await api<{ credited: number }>('claim-deposit', {});
      if (j.credited > 0) {
        applyPurchasedStardust(j.credited);
        setMsg(`✨ ${j.credited.toFixed(2)} KRD hesabına eklendi!`);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        return;
      }
      setMsg('Henüz onaylanmış ödeme yok. Birkaç dakika sonra tekrar dene.');
    } catch {
      setMsg('Kontrol edilemedi. Bağlantını kontrol et.');
    }
  };

  const pay = async () => {
    if (!wallet) {
      setIsWalletModalOpen(true);
      return;
    }
    if (!cfg?.treasury) {
      setMsg('Ödeme alıcısı yapılandırılmamış (TREASURY_ADDRESS). Yöneticiye bildir.');
      return;
    }
    if (ton < minTon) {
      setMsg(`Minimum ödeme ${minTon} TON.`);
      return;
    }
    try {
      setBusy(true);
      setMsg('');
      await tonUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: cfg.treasury,
            amount: String(Math.round(ton * 1e9)),
            payload: commentPayload(`UID:${cfg.uid}`),
          },
        ],
      });
      sounds.playCoin();
      setMsg('Ödeme gönderildi. Blok onayı bekleniyor…');
      pollCredit();
    } catch {
      setMsg('İşlem iptal edildi veya başarısız oldu.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4">
      <div className="bg-gradient-to-b from-[#0a3848] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 relative">
        <button
          onClick={() => {
            sounds.playClick();
            setIsDepositModalOpen(false);
          }}
          className="absolute top-4 right-4 text-teal-200/70 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-300" /> KRD Yükle
        </h2>
        <p className="text-xs text-teal-100/80 mt-1">
          TON ile öde, KRD hesabına anında yüklensin. 1 TON = <strong className="text-emerald-300">{perTon} KRD</strong>.
          KRD oyun içi para birimidir; nakde çevrilemez.
        </p>

        <div className="mt-4 flex items-center justify-between bg-[#052632] border border-cyan-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-teal-100">
            <Wallet className="w-4 h-4 text-cyan-300" />
            {wallet ? (
              <span className="font-mono text-cyan-200">{wallet.slice(0, 6)}…{wallet.slice(-5)}</span>
            ) : (
              <span className="text-amber-300">Cüzdan bağlı değil</span>
            )}
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              if (wallet) tonUI.disconnect();
              else tonUI.openModal();
            }}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#07303f] border border-teal-400/40 text-teal-100"
          >
            {wallet ? 'Değiştir' : 'Bağla'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {PACKS.map((p) => (
            <button
              key={p}
              onClick={() => setTon(p)}
              className={`py-2 rounded-xl text-sm font-bold border transition ${
                ton === p
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                  : 'bg-[#07303f] text-white border-teal-400/30 hover:border-cyan-400/60'
              }`}
            >
              {p} TON
              <div className={`text-[10px] font-mono ${ton === p ? 'text-slate-800' : 'text-emerald-300'}`}>
                {Math.floor(p * perTon)} KRD
              </div>
            </button>
          ))}
        </div>

        <button
          disabled={busy}
          onClick={pay}
          className="w-full mt-4 py-3 rounded-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 disabled:opacity-40 active:scale-95 transition"
        >
          {busy ? 'Ödeme bekleniyor…' : wallet ? `${ton} TON öde → ${krd} KRD` : 'Önce cüzdanını bağla'}
        </button>

        <button
          onClick={checkNow}
          disabled={busy}
          className="mt-2 w-full py-2 rounded-xl text-[11px] font-bold bg-[#07303f] border border-teal-400/30 text-teal-100 flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <RefreshCw className="w-3 h-3" /> Ödemeyi Kontrol Et
        </button>

        {cfg && !cfg.treasury && (
          <p className="text-[11px] text-amber-300 mt-3 text-center">
            Uyarı: sunucuda TREASURY_ADDRESS tanımlı değil, ödeme alınamaz.
          </p>
        )}
        {msg && <p className="text-xs text-cyan-200 mt-3 text-center">{msg}</p>}

        <p className="text-[10px] text-teal-200/60 mt-4 flex gap-1.5">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          Ödeme yorumu UID:TelegramID olarak gönderilir. Yalnızca TON ağı. KRD iade edilmez, yatırım getirisi vaadi yoktur.
        </p>
      </div>
    </div>
  );
};
