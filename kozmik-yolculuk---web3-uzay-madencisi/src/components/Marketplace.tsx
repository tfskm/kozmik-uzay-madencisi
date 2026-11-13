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
  Repeat,
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
  const { user, marketItems, adminSettings, buyMarketItem, swapStardustToUsdt } = useGame();

  const rate = adminSettings.stardustPerUsdt || 1000;
  const [sellDustAmount, setSellDustAmount] = useState<number>(() => Math.min(user.stardustBalance, rate));
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

  const usdtReturn = Number((sellDustAmount / rate).toFixed(2));

  const handleSellDust = () => {
    const res = swapStardustToUsdt(sellDustAmount);
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#fbbf24'],
      });
      setExchangeMsg(res.message);
      setTimeout(() => setExchangeMsg(null), 4000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              <span>Galaktik Serbest Ticaret İstasyonu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
              Pazar Yeri (Al & Sat)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Madencilikten topladığınız Uzay Tozlarını nakit USDT'ye bozdurun ya da filonuzu güçlendirecek elit ekipmanlar satın alın.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-2.5 text-right">
              <div className="text-[10px] text-cyan-800 font-bold">Uzay Tozunuz</div>
              <div className="text-sm font-black text-cyan-900 font-mono">
                {user.stardustBalance.toLocaleString()} Toz
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-right">
              <div className="text-[10px] text-emerald-800 font-bold">USDT Bakiyeniz</div>
              <div className="text-sm font-black text-emerald-700 font-mono">
                ${user.usdtBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STARDUST TO USDT EXCHANGE BOOTH */}
      <div className="bg-white border-2 border-cyan-300 rounded-3xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 border border-cyan-200 flex items-center justify-center shrink-0 shadow-xs">
              <Repeat className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Maden Bozdurma Gişesi (Swap ➔ USDT)
              </div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Uzay Tozunu Nakit USDT'ye Dönüştür
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Admin Tarafından Belirlenen Güncel Kur: <strong>{rate.toLocaleString()} Uzay Tozu = 1.00 USDT</strong>
              </p>
            </div>
          </div>

          {/* Sell Form */}
          <div className="flex flex-wrap items-center gap-2">
            {[250, 500, 1000, 2500].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  sounds.playClick();
                  setSellDustAmount(amt);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  sellDustAmount === amt
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {amt} Toz
              </button>
            ))}

            <button
              onClick={handleSellDust}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
            >
              Bozdur (+${usdtReturn.toFixed(2)} USDT)
            </button>
          </div>
        </div>

        {exchangeMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{exchangeMsg}</span>
          </div>
        )}
      </div>

      {/* Equipment Marketplace Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Özel Madencilik Ekipmanları & Donanımları
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Toplam {marketItems.length} Ürün Mevcut
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketItems.map((item) => {
            const Icon = ICON_MAP[item.iconName] || ShoppingBag;

            return (
              <div
                key={item.id}
                className="bg-white border border-teal-200 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-300 transition duration-200 shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Icon className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 font-mono leading-none">
                        ${item.price}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.currency}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5">
                    {item.description}
                  </p>

                  <div className="mt-2.5 bg-cyan-50/70 rounded-xl p-2 border border-cyan-200 text-[11px] text-cyan-900 font-semibold">
                    ⚡ <strong>Etki:</strong> {item.effectDescription}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Satıcı: {item.seller}
                  </span>

                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={item.stock <= 0}
                    className="px-4 py-1.5 rounded-xl text-xs font-black transition active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xs disabled:bg-slate-200 disabled:text-slate-400"
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
