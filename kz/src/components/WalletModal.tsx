import React from 'react';
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { Wallet, Check, X, ShieldCheck, ExternalLink } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { user, isWalletModalOpen, setIsWalletModalOpen, setIsDepositModalOpen } = useGame();
  const [tonUI] = useTonConnectUI();
  const address = useTonAddress();
  const wallet = useTonWallet();

  if (!isWalletModalOpen) return null;

  const short = (a: string) => (a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-5)}` : a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a3848] via-[#08303e] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-cyan-950/60 relative">
        <button
          onClick={() => {
            sounds.playClick();
            setIsWalletModalOpen(false);
          }}
          className="absolute top-4 right-4 text-teal-200/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-display">TON Cüzdanı Bağla</h3>
            <p className="text-xs text-teal-100/70">
              Yalnızca TON ağı desteklenir. Cüzdan, TON ile KRD yüklemek için kullanılır.
            </p>
          </div>
        </div>

        {address ? (
          <div className="my-4 bg-[#052834] border border-emerald-400/40 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div className="min-w-0">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cüzdan Bağlı
              </div>
              <div className="text-xs font-mono text-cyan-200 font-bold truncate mt-0.5" title={address}>
                {short(address)}
              </div>
              <div className="text-[10px] text-teal-200/60 mt-0.5">
                {wallet?.device?.appName || user.walletName || 'TON Cüzdan'}
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                tonUI.disconnect();
              }}
              className="text-xs font-bold text-rose-300 hover:text-rose-200 px-3 py-1 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-400/30 transition shrink-0"
            >
              Bağlantıyı Kes
            </button>
          </div>
        ) : (
          <div className="my-4 bg-[#05222d] border border-teal-500/25 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">💎</div>
            <p className="text-xs text-teal-100/80">
              Tonkeeper, Telegram Wallet veya MyTonWallet ile bağlanabilirsin.
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                tonUI.openModal();
              }}
              className="mt-3 w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 shadow-lg active:scale-95 transition"
            >
              Cüzdan Bağla
            </button>
          </div>
        )}

        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-[11px] text-teal-200/80">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>TON Connect ile güvenli bağlantı; özel anahtarın asla paylaşılmaz.</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-teal-200/80">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>KRD ve Yıldız Tozu oyun içi para birimidir, nakde çevrilemez.</span>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setIsWalletModalOpen(false);
            setIsDepositModalOpen(true);
          }}
          className="mt-4 w-full py-2.5 rounded-xl bg-[#07303f] border border-teal-400/40 text-teal-100 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0b3c4f] transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          KRD Yükleme Ekranına Git
        </button>
      </div>
    </div>
  );
};
