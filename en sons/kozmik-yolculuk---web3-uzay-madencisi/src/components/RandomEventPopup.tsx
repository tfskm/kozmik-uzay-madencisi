import React from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Zap, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RandomEventPopup: React.FC = () => {
  const { randomEvent, claimRandomEvent } = useGame();

  if (!randomEvent) return null;

  const handleClick = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#06b6d4', '#f59e0b', '#ec4899'],
    });
    claimRandomEvent();
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-bounce">
      <div
        onClick={handleClick}
        className="cursor-pointer bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-0.5 rounded-2xl shadow-2xl glow-gold active:scale-95 transition"
      >
        <div className="bg-slate-950/90 backdrop-blur-md rounded-[14px] p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
              ☄️
            </div>
            <div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Sürpriz Uzay Olayı! (Tıkla & Al)</span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight font-display">
                {randomEvent.title}
              </h4>
              <div className="text-[11px] text-emerald-300 font-mono font-bold mt-0.5">
                Ödül: +${randomEvent.rewardUsdt} USDT & +{randomEvent.rewardStardust} Toz
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-xl font-display uppercase tracking-wider shadow">
            YAKALA!
          </div>
        </div>
      </div>
    </div>
  );
};
