import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { WHEEL_PRIZES, MYSTERY_BOXES } from '../data/initialData';
import { WheelPrize, MysteryBox } from '../types';
import {
  Disc3,
  Gift,
  Sparkles,
  Zap,
  Coins,
  Trophy,
  HelpCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LuckyWheelAndBoxes: React.FC = () => {
  const {
    user,
    adminSettings,
    spinWheel,
    openMysteryBox,
    setIsDepositModalOpen,
  } = useGame();

  const [activeSubTab, setActiveSubTab] = useState<'wheel' | 'boxes'>('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [recentWin, setRecentWin] = useState<WheelPrize | null>(null);

  // Mystery Box modal state
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [openedBoxResult, setOpenedBoxResult] = useState<{
    prizeName: string;
    usdtAmount: number;
    stardustAmount: number;
  } | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = async () => {
    if (isSpinning) return;
    if (user.spinsAvailable <= 0 && user.stardustBalance < adminSettings.luckyWheelCostStardust) {
      alert(`Yetersiz bakiye! 1 çevirme için ${adminSettings.luckyWheelCostStardust} Uzay Tozu gerekir.`);
      return;
    }

    setIsSpinning(true);
    setRecentWin(null);
    sounds.playSpinTick();

    try {
      const prize = await spinWheel();
      const prizeIndex = WHEEL_PRIZES.findIndex((p) => p.id === prize.id);
      const segmentAngle = 360 / WHEEL_PRIZES.length;

      // Calculate target angle to land on that segment
      const randomExtraSpins = 5 + Math.floor(Math.random() * 3);
      const targetSegmentAngle = prizeIndex * segmentAngle + segmentAngle / 2;
      const finalAngle = wheelRotation + randomExtraSpins * 360 + (360 - (wheelRotation % 360)) + (360 - targetSegmentAngle);

      setWheelRotation(finalAngle);

      // Play tick sounds as it spins
      const tickInterval = setInterval(() => {
        sounds.playSpinTick();
      }, 250);

      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        setRecentWin(prize);
        sounds.playWin();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899'],
        });
      }, 4000);
    } catch {
      setIsSpinning(false);
    }
  };

  const handleOpenBox = async (box: MysteryBox) => {
    if (isOpeningBox) return;
    if (user.usdtBalance < box.price) {
      if (confirm(`Yetersiz USDT bakiyesi! ${box.price} USDT gerekir. Şimdi bakiye yüklemek ister misiniz?`)) {
        setIsDepositModalOpen(true);
      }
      return;
    }

    setIsOpeningBox(true);
    sounds.playUpgrade();

    try {
      const res = await openMysteryBox(box.id);
      setIsOpeningBox(false);
      setOpenedBoxResult(res);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: [box.color, '#10b981', '#06b6d4'],
      });
    } catch {
      setIsOpeningBox(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-full overflow-hidden text-slate-800">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Kozmik Şans & Ödül Merkezi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
            Şans Çarkı ve Gizemli Sandıklar
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Her gün şansınızı deneyin; anında nakit USDT, bedava tamir kitleri, uzay tozu ve efsanevi bonuslar kazanın!
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('wheel');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              activeSubTab === 'wheel'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Disc3 className="w-4 h-4" />
            <span>Şans Çarkı</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('boxes');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              activeSubTab === 'boxes'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gizemli Sandıklar</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LUCKY WHEEL */}
      {activeSubTab === 'wheel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Wheel Graphic */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Pointer at the top */}
              <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-500 drop-shadow-md" />

              {/* Glowing Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-teal-300 shadow-md" />

              {/* Rotating Canvas/SVG Wheel */}
              <div
                ref={wheelRef}
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
                }}
                className="w-full h-full rounded-full overflow-hidden shadow-xl relative border-4 border-white bg-slate-100"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {WHEEL_PRIZES.map((prize, idx) => {
                    const sliceAngle = 360 / WHEEL_PRIZES.length;
                    const startAngle = idx * sliceAngle;
                    const endAngle = startAngle + sliceAngle;

                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    const textAngle = startAngle + sliceAngle / 2;
                    const textX = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                    const textY = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                    return (
                      <g key={prize.id}>
                        <path d={pathData} fill={prize.color} stroke="#ffffff" strokeWidth="0.8" />
                        <text
                          x={textX}
                          y={textY}
                          fill="#ffffff"
                          fontSize="3.2"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                          className="font-mono tracking-tighter"
                        >
                          {prize.label.substring(0, 10)}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hub */}
                <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white border-2 border-teal-400 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              </div>
            </div>

            {/* Spin Controls */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-amber-800 font-bold bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
                  🎁 Ücretsiz Çevirme: <strong>{user.spinsAvailable}</strong>
                </span>
                <span className="text-cyan-800 font-bold bg-cyan-50 border border-cyan-300 px-3 py-1 rounded-full shadow-xs">
                  ✨ Uzay Tozu: <strong>{user.stardustBalance.toLocaleString()}</strong>
                </span>
              </div>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`mt-2 px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide uppercase font-display transition shadow-md active:scale-95 flex items-center gap-2 ${
                  isSpinning
                    ? 'bg-slate-200 text-slate-400 cursor-wait'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 hover:scale-105'
                }`}
              >
                <Disc3 className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>
                  {isSpinning
                    ? 'Kozmik Çark Dönüyor...'
                    : user.spinsAvailable > 0
                    ? 'Şimdi Çevir (Ücretsiz)'
                    : `Çevir (${adminSettings.luckyWheelCostStardust} Toz)`}
                </span>
              </button>

              {recentWin && (
                <div className="mt-3 bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-2 text-center animate-bounce shadow-md">
                  <div className="text-[11px] text-emerald-800 font-semibold">Tebrikler Kazandınız!</div>
                  <div className="text-sm font-black text-emerald-900 font-display">{recentWin.label}</div>
                </div>
              )}
            </div>
          </div>

          {/* Prize Table */}
          <div className="lg:col-span-5 bg-white border border-teal-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Çark Ödül Havuzu ve Oranları</span>
            </h3>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {WHEEL_PRIZES.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: prize.color }}
                    />
                    <span className="font-semibold text-slate-800">{prize.label}</span>
                  </div>
                  <span className="font-mono text-teal-700 text-[11px] font-bold">
                    %{(prize.probability * 100).toFixed(1)} Şans
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              💡 <strong>İpucu:</strong> Madencilik yaptıkça ve uçuş görevlerini tamamladıkça ücretsiz çevirme biletleri kazanırsınız.
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MYSTERY BOXES */}
      {activeSubTab === 'boxes' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MYSTERY_BOXES.map((box) => (
              <div
                key={box.id}
                className="bg-white border border-teal-200 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-300 transition duration-200 shadow-sm hover:shadow-md"
              >
                <div>
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-sm mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${box.color}20, #f8fafc)`,
                      border: `1px solid ${box.color}`,
                    }}
                  >
                    📦
                  </div>

                  <h3 className="text-center font-bold text-slate-900 font-display text-base">
                    {box.name}
                  </h3>

                  <div className="text-center text-xl font-black text-slate-900 font-mono mt-1">
                    ${box.price} <span className="text-xs text-slate-500 font-sans">USDT</span>
                  </div>

                  {/* Drop Table Preview */}
                  <div className="mt-3 bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                    <div className="text-[10px] text-slate-600 font-bold mb-1">
                      İçerebileceği Sürprizler:
                    </div>
                    <ul className="text-[11px] text-slate-700 space-y-1">
                      {box.possibleRewards.map((rew, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <span className="text-amber-500">✦</span>
                          <span className="truncate">{rew}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBox(box)}
                  disabled={isOpeningBox}
                  className="mt-4 w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider font-display transition active:scale-95 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black shadow-sm"
                >
                  {isOpeningBox ? 'Açılıyor...' : `Sandığı Aç ($${box.price})`}
                </button>
              </div>
            ))}
          </div>

          {/* Mystery Box Opened Result Modal */}
          {openedBoxResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white border border-teal-300 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-3xl mx-auto mb-3 animate-bounce">
                  ✨
                </div>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Tebrikler! Sandıktan Çıkan:
                </h3>
                <p className="text-base font-bold text-emerald-700 mt-2 font-mono">
                  {openedBoxResult.prizeName}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Kazanılan ödül anında bakiyenize aktarıldı.
                </p>

                <button
                  onClick={() => setOpenedBoxResult(null)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs font-display uppercase tracking-wider shadow-sm"
                >
                  Harika, Devam Et
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
