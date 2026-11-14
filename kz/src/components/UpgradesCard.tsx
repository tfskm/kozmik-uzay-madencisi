import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';

export const UpgradesCard: React.FC = () => {
  const { user, serverMeta: m, gameAct } = useGame();
  const [msg, setMsg] = useState('');
  if (!m) return <div className="text-xs text-teal-200/70 p-3">Sunucuya bağlanılıyor…</div>;

  const run = async (a: Record<string, unknown>) => {
    sounds.playClick();
    const e = await gameAct(a);
    setMsg(e || '');
  };

  const Btn = ({ label, cost, on, type }: { label: string; cost: number; on: string; type: string }) => (
    <button
      disabled={user.krdBalance < cost}
      onClick={() => run({ type })}
      className="flex-1 bg-[#07303f] border border-teal-400/40 rounded-xl p-3 text-left disabled:opacity-40 active:scale-95 transition"
    >
      <div className="text-sm font-bold text-white">{label}</div>
      <div className="text-[11px] text-teal-200/80">{on}</div>
      <div className="text-xs font-mono text-cyan-300 mt-1">{cost.toLocaleString()} KRD</div>
    </button>
  );

  return (
    <div className="bg-[#083444]/90 border border-cyan-400/40 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Filo Yükseltmeleri</h3>
        <button
          disabled={!m.canDaily}
          onClick={() => run({ type: 'daily' })}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 disabled:opacity-40 active:scale-95 transition"
        >
          {m.canDaily ? 'Günlük Ödülü Al' : 'Bugün alındı'}
        </button>
      </div>
      <div className="flex gap-2">
        <Btn type="upgrade" label={`⚛️ Reaktör Sv.${m.up}`} on="Tüm üretim +%5" cost={m.upCost} />
        <Btn type="drill" label={`⛏️ Matkap Sv.${m.drill}`} on="Tüm üretim +%4" cost={m.drillCost} />
      </div>
      <p className="text-[10px] text-teal-200/60">
        Reaktör ve matkap seviyeleri tüm madencilerin üretimini kalıcı olarak artırır. Maliyet her seviyede yükselir.
      </p>
      {msg && <p className="text-[11px] text-amber-300">{msg}</p>}
    </div>
  );
};
