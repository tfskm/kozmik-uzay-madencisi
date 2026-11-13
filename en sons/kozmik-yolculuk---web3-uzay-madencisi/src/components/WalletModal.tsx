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
      color: 'border-blue-500/40 bg-blue-950/20',
    },
    {
      id: 'metamask' as const,
      name: 'MetaMask / Web3 EVM',
      desc: 'BNB Smart Chain veya Ethereum USDT transferleri için',
      badge: 'BEP20 / ERC20',
      icon: '🦊',
      color: 'border-amber-500/40 bg-amber-950/20',
    },
    {
      id: 'phantom' as const,
      name: 'Phantom / Solflare',
      desc: 'Solana ağı üzerinden hızlı mikro ödemeler',
      badge: 'SOLANA',
      icon: '👻',
      color: 'border-purple-500/40 bg-purple-950/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl relative glow-cyan">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsWalletModalOpen(false);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Web3 Cüzdanınızı Bağlayın
            </h3>
            <p className="text-xs text-slate-400">
              Ödeme almak ve kazançlarınızı anında çekmek için cüzdan seçin
            </p>
          </div>
        </div>

        {/* Current status if connected */}
        {user.isConnected && (
          <div className="my-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                Aktif Cüzdan Bağlı
              </div>
              <div className="text-xs font-mono text-emerald-300 font-bold truncate max-w-[200px]">
                {user.walletAddress}
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 bg-rose-950/50 rounded-lg border border-rose-500/30"
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
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                        {w.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">
                        {w.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{w.desc}</p>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-xs text-indigo-400 font-bold group-hover:translate-x-0.5 transition">
                    Bağlan ➔
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tüm ödemeler akıllı kontrat ve güvenli Web3 API'si üzerinden korunur.</span>
        </div>
      </div>
    </div>
  );
};
