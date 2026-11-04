import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import {
  ShoppingBag,
  Wrench,
  Sparkles,
  Zap,
  Rocket,
  Shield,
  Coins,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Sparkles,
  Zap,
  Rocket,
  Shield,
};

export const Marketplace: React.FC = () => {
  const { user, marketItems, buyMarketItem, adminAdjustBalance } = useGame();

  const [sellDustAmount, setSellDustAmount] = useState<number>(250);
  const [exchangeMsg, setExchangeMsg] = useState<string | null>(null);

  const handleBuy = (itemId: string) => {
    const res = buyMarketItem(itemId);
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#a855f7'],
      });
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  // Convert Stardust to USDT: 500 Stardust = 1 USDT
  const dustToUsdtRate = 0.002;
  const usdtReturn = Number((sellDustAmount * dustToUsdtRate).toFixed(2));

  const handleSellDust = () => {
    if (user.stardustBalance < sellDustAmount) {
      alert('Yetersiz Yıldız Tozu!');
      return;
    }
    sounds.playCoin();
    sounds.triggerHaptic('success');

    // Adjust user
    adminAdjustBalance(user.id, usdtReturn, -sellDustAmount);
    setExchangeMsg(`${sellDustAmount} Yıldız Tozu başarıyla satıldı! +$${usdtReturn} USDT cüzdanınıza eklendi.`);
    setTimeout(() => setExchangeMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d3f4f] via-[#094857] to-[#0a3b4a] border border-cyan-400/40 rounded-2xl p-4 sm:p-5 shadow-xl glow-cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-teal-300" />
              <span>Galaktik Serbest Ticaret İstasyonu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
              Pazar Yeri (Al & Sat)
            </h2>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
              Madencilik ve şans çarkından topladığınız madenleri ve yıldız tozunu satın ya da madenci filonuzu güçlendirecek özel teçhizatları edinin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#052632] border border-cyan-400/40 rounded-xl p-2.5 text-right">
              <div className="text-[10px] text-cyan-300">Yıldız Tozunuz</div>
              <div className="text-sm font-bold text-amber-300 font-mono">
                {user.stardustBalance} Toz
              </div>
            </div>
            <div className="bg-[#052632] border border-emerald-400/50 rounded-xl p-2.5 text-right">
              <div className="text-[10px] text-emerald-300">USDT Bakiyeniz</div>
              <div className="text-sm font-bold text-emerald-300 font-mono">
                ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STARDUST TO USDT EXCHANGE BOOTH */}
      <div className="bg-gradient-to-r from-[#0b3848] via-[#072c39] to-[#0b3848] border border-teal-400/40 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
              <ArrowRightLeft className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Maden Bozdurma Gişesi (Stardust ➔ USDT)
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Yıldız Tozunu Nakit USDT'ye Dönüştür
              </h3>
              <p className="text-[11px] text-teal-100/80">
                Sabit Kur: 500 Yıldız Tozu = 1.00 USDT (Geri Alım Garantili)
              </p>
            </div>
          </div>

          {/* Sell Form */}
          <div className="flex flex-wrap items-center gap-2">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  sounds.playClick();
                  setSellDustAmount(amt);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  sellDustAmount === amt
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black'
                    : 'bg-[#052430] text-teal-200 hover:bg-[#093546] border border-teal-500/30'
                }`}
              >
                {amt} Toz
              </button>
            ))}

            <button
              onClick={handleSellDust}
              className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition active:scale-95"
            >
              Sat ➔ +${usdtReturn} USDT Al
            </button>
          </div>
        </div>

        {exchangeMsg && (
          <div className="mt-3 bg-[#062e3c] border border-emerald-400/60 rounded-xl p-2.5 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exchangeMsg}</span>
          </div>
        )}
      </div>

      {/* Equipment Marketplace Grid */}
      <div>
        <h3 className="text-base font-bold text-white font-display mb-3">
          Özel Teçhizat ve Destek Parçaları
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketItems.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Wrench;

            return (
              <div
                key={item.id}
                className="bg-[#083546]/90 border border-teal-500/35 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-400/60 transition duration-200 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          item.rarity === 'legendary'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : item.rarity === 'epic'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                            : item.rarity === 'rare'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-[#062430] text-teal-200 border border-teal-500/30'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded font-mono ${
                              item.rarity === 'legendary'
                                ? 'bg-amber-500/20 text-amber-300'
                                : item.rarity === 'epic'
                                ? 'bg-teal-500/20 text-teal-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {item.rarity}
                          </span>
                          <span className="text-[10px] text-teal-300/60 font-mono">
                            Stok: {item.stock}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white font-display mt-0.5">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-300 font-mono leading-none">
                        ${item.price}
                      </div>
                      <div className="text-[10px] text-teal-300/60 font-mono">
                        {item.currency}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-teal-100/70 mt-2.5">
                    {item.description}
                  </p>

                  <div className="mt-2.5 bg-[#05222c] rounded-lg p-2 border border-teal-500/25 text-[11px] text-emerald-300 font-medium">
                    ⚡ <strong>Etki:</strong> {item.effectDescription}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-teal-300/60 font-mono">
                    Satıcı: {item.seller}
                  </span>

                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={item.stock <= 0}
                    className="px-4 py-1.5 rounded-xl text-xs font-black transition active:scale-95 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-md disabled:bg-[#062430] disabled:text-teal-200/40"
                  >
                    {item.stock > 0 ? `Satın Al (${item.price} ${item.currency})` : 'Tükendi'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
