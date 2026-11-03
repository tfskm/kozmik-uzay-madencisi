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
      alert(`Yetersiz bakiye! 1 çevirme için ${adminSettings.luckyWheelCostStardust} Yıldız Tozu gerekir.`);
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
      // Segment center is index * segmentAngle + segmentAngle / 2
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
        sounds.triggerHaptic('success');
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: [prize.color, '#eab308', '#ffffff'],
        });
      }, 4000);
    } catch (err: unknown) {
      setIsSpinning(false);
      alert(err instanceof Error ? err.message : 'Çevirme hatası');
    }
  };

  const handleOpenBox = async (box: MysteryBox) => {
    if (user.usdtBalance < box.price) {
      if (confirm(`Yetersiz USDT bakiyesi! Bu sandık $${box.price} USDT gerektirir.\n\nYatırım yapmak ister misiniz?`)) {
        setIsDepositModalOpen(true);
      }
      return;
    }

    setIsOpeningBox(true);
    sounds.playUpgrade();

    try {
      const result = await openMysteryBox(box.id);
      setTimeout(() => {
        setIsOpeningBox(false);
        setOpenedBoxResult(result);
        sounds.playWin();
        sounds.triggerHaptic('success');
        confetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.5 },
          colors: [box.color, '#10b981', '#38bdf8', '#f59e0b'],
        });
      }, 1500);
    } catch (err: unknown) {
      setIsOpeningBox(false);
      alert(err instanceof Error ? err.message : 'Sandık açılamadı');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>Kozmik Şans & Ödül Merkezi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
            Şans Çarkı ve Gizemli Sandıklar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Her gün şansınızı deneyin; anında nakit USDT, bedava tamir kitleri, yıldız tozu ve efsanevi bonuslar kazanın!
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('wheel');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'wheel'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'boxes'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
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
              <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]" />

              {/* Glowing Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 glow-gold animate-pulse" />

              {/* Rotating Canvas/SVG Wheel */}
              <div
                ref={wheelRef}
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
                }}
                className="w-full h-full rounded-full overflow-hidden shadow-2xl relative border-4 border-slate-900 bg-slate-950"
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

                    // Middle text rotation
                    const textAngle = startAngle + sliceAngle / 2;
                    const textX = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                    const textY = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                    return (
                      <g key={prize.id}>
                        <path d={pathData} fill={prize.color} stroke="#050714" strokeWidth="0.8" />
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
                <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                </div>
              </div>
            </div>

            {/* Spin Controls */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
                  🎁 Ücretsiz Çevirme: <strong>{user.spinsAvailable}</strong>
                </span>
                <span className="text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full">
                  ✨ Yıldız Tozu: <strong>{user.stardustBalance}</strong>
                </span>
              </div>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`mt-2 px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide uppercase font-display transition shadow-xl active:scale-95 flex items-center gap-2 ${
                  isSpinning
                    ? 'bg-slate-800 text-slate-500 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 shadow-amber-500/30 hover:scale-105 glow-gold'
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
                <div className="mt-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl px-4 py-2 text-center animate-bounce">
                  <div className="text-[11px] text-emerald-300 font-semibold">Tebrikler Kazandınız!</div>
                  <div className="text-sm font-black text-white font-display">{recentWin.label}</div>
                </div>
              )}
            </div>
          </div>

          {/* Prize Table */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Çark Ödül Havuzu ve Oranları</span>
            </h3>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {WHEEL_PRIZES.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: prize.color }}
                    />
                    <span className="font-semibold text-slate-200">{prize.label}</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-[11px]">
                    %{(prize.probability * 100).toFixed(1)} Şans
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              💡 <strong>İpucu:</strong> Madencilik yaptıkça ve günlük görevleri tamamladıkça ücretsiz çevirme biletleri kazanırsınız.
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
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition duration-200"
              >
                <div>
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${box.color}40, rgba(15, 23, 42, 0.9))`,
                      border: `1px solid ${box.color}`,
                    }}
                  >
                    📦
                  </div>

                  <h3 className="text-center font-bold text-white font-display text-base">
                    {box.name}
                  </h3>

                  <div className="text-center text-xl font-black text-amber-400 font-mono mt-1">
                    ${box.price} <span className="text-xs text-slate-400 font-sans">USDT</span>
                  </div>

                  {/* Drop Table Preview */}
                  <div className="mt-3 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                    <div className="text-[10px] text-indigo-300 font-bold mb-1">
                      İçerebileceği Sürprizler:
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1">
                      {box.possibleRewards.map((rew, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <span className="text-amber-400">✦</span>
                          <span className="truncate">{rew}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBox(box)}
                  disabled={isOpeningBox}
                  className="mt-4 w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider font-display transition active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-950"
                >
                  {isOpeningBox ? 'Açılıyor...' : `Sandığı Aç ($${box.price})`}
                </button>
              </div>
            ))}
          </div>

          {/* Mystery Box Opened Result Modal */}
          {openedBoxResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-purple-500/50 rounded-2xl p-6 max-w-sm w-full text-center glow-purple">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-3xl mx-auto mb-3 animate-bounce">
                  ✨
                </div>
                <h3 className="text-lg font-black text-white font-display">
                  Tebrikler! Sandıktan Çıkan:
                </h3>
                <p className="text-base font-bold text-amber-300 mt-2 font-mono">
                  {openedBoxResult.prizeName}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Kazanılan ödül anında cüzdan bakiyenize aktarıldı.
                </p>

                <button
                  onClick={() => setOpenedBoxResult(null)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-display uppercase tracking-wider"
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
