import React from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { Wallet, Check, X, ShieldCheck } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const {
    user,
    isWalletModalOpen,
    setIsWalletModalOpen,
    connectWallet,
    disconnectWallet,
  } = useGame();

  if (!isWalletModalOpen) return null;

  const walletOptions = [
    {
      id: 'ton' as const,
      name: 'Tonkeeper / Telegram Wallet',
      desc: 'TON blokzinciri üzerinden doğrudan entegrasyon (Tavsiye Edilen)',
      badge: 'TON AĞI',
      icon: '💎',
    },
    {
      id: 'metamask' as const,
      name: 'MetaMask / Web3 EVM',
      desc: 'BNB Smart Chain veya Ethereum USDT transferleri için',
      badge: 'BEP20 / ERC20',
      icon: '🦊',
    },
    {
      id: 'phantom' as const,
      name: 'Phantom / Solflare',
      desc: 'Solana ağı üzerinden hızlı mikro ödemeler',
      badge: 'SOLANA',
      icon: '👻',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white border border-teal-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsWalletModalOpen(false);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">
              Web3 Cüzdanınızı Bağlayın
            </h3>
            <p className="text-xs text-slate-500">
              Ödeme almak ve kazançlarınızı anında çekmek için cüzdan seçin
            </p>
          </div>
        </div>

        {/* Current status if connected */}
        {user.isConnected && (
          <div className="my-4 bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Aktif Cüzdan Bağlı
              </div>
              <div className="text-xs font-mono text-emerald-900 font-bold truncate max-w-[200px] mt-0.5">
                {user.walletAddress}
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded-xl border border-rose-300 transition"
            >
              Bağlantıyı Kes
            </button>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-2.5 mt-4">
          {walletOptions.map((w) => {
            const isSelected = user.isConnected && user.walletType === w.id;

            return (
              <button
                key={w.id}
                onClick={() => connectWallet(w.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group shadow-xs ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400'
                    : 'border-slate-200 bg-slate-50/70 hover:border-teal-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow-xs">{w.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                        {w.name}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold">
                        {w.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{w.desc}</p>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
                ) : (
                  <span className="text-xs text-teal-700 font-bold group-hover:translate-x-0.5 transition">
                    Bağlan ➔
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tüm ödemeler akıllı kontrat ve güvenli Web3 API'si üzerinden korunur.</span>
        </div>
      </div>
    </div>
  );
};
