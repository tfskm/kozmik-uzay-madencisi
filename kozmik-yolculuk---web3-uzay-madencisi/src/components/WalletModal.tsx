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
      color: 'border-cyan-400/40 bg-[#07303e]',
    },
    {
      id: 'metamask' as const,
      name: 'MetaMask / Web3 EVM',
      desc: 'BNB Smart Chain veya Ethereum USDT transferleri için',
      badge: 'BEP20 / ERC20',
      icon: '🦊',
      color: 'border-teal-400/40 bg-[#07303e]',
    },
    {
      id: 'phantom' as const,
      name: 'Phantom / Solflare',
      desc: 'Solana ağı üzerinden hızlı mikro ödemeler',
      badge: 'SOLANA',
      icon: '👻',
      color: 'border-cyan-400/40 bg-[#07303e]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03141c]/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a3848] via-[#08303e] to-[#062430] border border-cyan-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-cyan-950/60 relative">
        {/* Close Button */}
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
            <h3 className="text-base font-black text-white font-display">
              Web3 Cüzdanınızı Bağlayın
            </h3>
            <p className="text-xs text-teal-100/70">
              Ödeme almak ve kazançlarınızı anında çekmek için cüzdan seçin
            </p>
          </div>
        </div>

        {/* Current status if connected */}
        {user.isConnected && (
          <div className="my-4 bg-[#052834] border border-emerald-400/40 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Aktif Cüzdan Bağlı
              </div>
              <div className="text-xs font-mono text-cyan-200 font-bold truncate max-w-[200px] mt-0.5">
                {user.walletAddress}
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-xs font-bold text-rose-300 hover:text-rose-200 px-3 py-1 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-400/30 transition"
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
                className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between group shadow-sm ${
                  isSelected
                    ? 'border-emerald-400 bg-gradient-to-r from-[#0a3e4e] to-[#07323f] ring-2 ring-emerald-400/50'
                    : 'border-teal-500/25 bg-[#05222d] hover:border-cyan-400/50 hover:bg-[#072c3a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow">{w.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition">
                        {w.name}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 font-bold">
                        {w.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-100/70 mt-0.5">{w.desc}</p>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 stroke-[3]" />
                ) : (
                  <span className="text-xs text-cyan-300 font-bold group-hover:translate-x-0.5 transition">
                    Bağlan ➔
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center gap-2 text-[11px] text-teal-200/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tüm ödemeler akıllı kontrat ve güvenli Web3 API'si üzerinden korunur.</span>
        </div>
      </div>
    </div>
  );
};
