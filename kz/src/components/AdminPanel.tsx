import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { INITIAL_MARKET_ITEMS } from '../data/initialData';
import {
  LayoutDashboard,
  Settings,
  PackageCheck,
  Globe2,
  Users,
  Store,
  Save,
  RefreshCw,
  Ban,
  RotateCcw,
  ShieldAlert,
  Coins,
  Sparkles,
  Megaphone,
  Wrench,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

type Tab = 'overview' | 'general' | 'economy' | 'packages' | 'planets' | 'market' | 'withdrawals' | 'players';

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'general', label: 'Duyuru & Bakım', icon: Megaphone },
  { id: 'economy', label: 'Ekonomi', icon: Coins },
  { id: 'packages', label: 'Paketler', icon: PackageCheck },
  { id: 'planets', label: 'Gezegenler', icon: Globe2 },
  { id: 'market', label: 'Pazar Stoğu', icon: Store },
  { id: 'withdrawals', label: 'Çekimler', icon: ArrowUpRight },
  { id: 'players', label: 'Oyuncular', icon: Users },
];

const num = (v: string, fallback = 0) => {
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
};

const parseList = (v: string, len: number, fallback: number[] = []) => {
  const arr = String(v)
    .split(/[,\s]+/)
    .map((s) => Number(s.replace(',', '.')))
    .filter((n) => Number.isFinite(n));
  while (arr.length < len) arr.push(fallback[arr.length] ?? 0);
  return arr.slice(0, len);
};

const Card: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; desc?: string }> = ({
  title,
  icon: Icon,
  children,
  desc,
}) => (
  <div className="bg-[#083444]/90 border border-cyan-400/35 rounded-2xl p-4 shadow-lg">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="w-4 h-4 text-cyan-300" />}
      <h3 className="text-sm font-bold text-white font-display">{title}</h3>
    </div>
    {desc && <p className="text-[11px] text-teal-200/60 mb-3">{desc}</p>}
    <div className="space-y-3">{children}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
  step?: string;
}> = ({ label, value, onChange, hint, type = 'text', step }) => (
  <label className="block">
    <span className="text-[11px] font-semibold text-teal-200/80">{label}</span>
    <input
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full bg-[#05222d] border border-teal-500/30 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400/70"
    />
    {hint && <span className="block text-[10px] text-teal-300/50 mt-1">{hint}</span>}
  </label>
);

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; desc?: string }> = ({
  label,
  value,
  onChange,
  desc,
}) => (
  <button
    onClick={() => onChange(!value)}
    className="w-full flex items-center justify-between gap-3 bg-[#05222d] border border-teal-500/30 rounded-xl px-3 py-2.5 text-left"
  >
    <div>
      <div className="text-xs font-bold text-white">{label}</div>
      {desc && <div className="text-[10px] text-teal-300/60">{desc}</div>}
    </div>
    <span
      className={`w-10 h-5 rounded-full relative transition shrink-0 ${
        value ? 'bg-emerald-400' : 'bg-[#0a2c38] border border-teal-500/40'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
          value ? 'left-5' : 'left-0.5'
        }`}
      />
    </span>
  </button>
);

export const AdminPanel: React.FC = () => {
  const {
    adminState,
    adminRefresh,
    adminUpdateSettings,
    adminUpdateCatalog,
    adminUpdatePlayer,
    adminUpdateStock,
    adminHandleWithdrawal,
    isAdmin,
  } = useGame();

  const [tab, setTab] = useState<Tab>('overview');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [catEdit, setCatEdit] = useState<Record<string, { name: string; price: string; daily: string; decay: string; active: boolean }>>({});
  const [openPlayer, setOpenPlayer] = useState<number | null>(null);
  const [adjust, setAdjust] = useState<{ krd: string; stardust: string }>({ krd: '0', stardust: '0' });

  useEffect(() => {
    if (isAdmin) adminRefresh();
  }, [isAdmin, adminRefresh]);

  useEffect(() => {
    if (!adminState) return;
    const c = adminState.config;
    setForm({
      announcementText: String(c.announcementText ?? ''),
      telegramChannelUrl: String(c.telegramChannelUrl ?? ''),
      telegramSupportUrl: String(c.telegramSupportUrl ?? ''),
      krdPerTon: String(c.krdPerTon ?? 20),
      minTon: String(c.minTon ?? 0.5),
      repairCostPerPct: String(c.repairCostPerPct ?? 0.0008),
      stRepairCostPerPct: String(c.stRepairCostPerPct ?? 0.05),
      wheelCost: String(c.wheelCost ?? 100),
      dailyStardust: String(c.dailyStardust ?? 50),
      stPerKrd: String(c.stPerKrd ?? 600),
      withdrawEnabled: String(c.withdrawEnabled ?? true),
      withdrawRateKrdPerTon: String(c.withdrawRateKrdPerTon ?? 100),
      minWithdrawKrd: String(c.minWithdrawKrd ?? 200),
      withdrawCooldownHours: String(c.withdrawCooldownHours ?? 72),
      minWithdrawAccountAgeDays: String(c.minWithdrawAccountAgeDays ?? 7),
      minWithdrawLevel: String(c.minWithdrawLevel ?? 3),
      weeklyWithdrawCapKrd: String(c.weeklyWithdrawCapKrd ?? 500),
      planetUnlock: (c.planetUnlock || []).join(', '),
      planetMult: (c.planetMult || []).join(', '),
      requiredLevel: (c.requiredLevel || []).join(', '),
      dailyFaucet: (c.dailyFaucet || []).join(', '),
    });
    setCatEdit(
      Object.fromEntries(
        Object.entries(adminState.catalog).map(([id, p]) => [
          id,
          {
            name: p.name,
            price: String(p.price),
            daily: String(Number((p.daily * 100).toFixed(3))),
            decay: String(p.decay),
            active: p.active !== false,
          },
        ])
      )
    );
  }, [adminState]);

  const flash = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const saveSettings = async (patch: Record<string, unknown>, label = 'Ayarlar kaydedildi.') => {
    if (saving) return;
    setSaving(true);
    const err = await adminUpdateSettings(patch);
    setSaving(false);
    flash(!err, err || label);
  };

  const saveGeneral = () =>
    saveSettings(
      {
        announcementText: form.announcementText,
        telegramChannelUrl: form.telegramChannelUrl,
        telegramSupportUrl: form.telegramSupportUrl,
        showAnnouncement: adminState?.config.showAnnouncement,
        maintenanceMode: adminState?.config.maintenanceMode,
      },
      'Duyuru ve bakım ayarları kaydedildi.'
    );

  const saveEconomy = () =>
    saveSettings(
      {
        krdPerTon: num(form.krdPerTon, 20),
        minTon: num(form.minTon, 0.5),
        repairCostPerPct: num(form.repairCostPerPct, 0.0008),
        stRepairCostPerPct: num(form.stRepairCostPerPct, 0.05),
        wheelCost: num(form.wheelCost, 100),
        dailyStardust: num(form.dailyStardust, 50),
        stPerKrd: num(form.stPerKrd, 500),
      },
      'Ekonomi ayarları kaydedildi.'
    );

  const savePlanets = () =>
    saveSettings(
      {
        planetUnlock: parseList(form.planetUnlock, 6, [0, 30, 100, 250, 600, 1500]),
        planetMult: parseList(form.planetMult, 6, [1, 1.1, 1.25, 1.45, 1.7, 2]),
        requiredLevel: parseList(form.requiredLevel, 6, [1, 2, 4, 7, 11, 16]),
        dailyFaucet: parseList(form.dailyFaucet, 7, [2, 2, 3, 3, 4, 4, 6]),
      },
      'Gezegen ve günlük ödül ayarları kaydedildi.'
    );

  const savePackage = async (id: string) => {
    const e = catEdit[id];
    if (!e) return;
    setSaving(true);
    const err = await adminUpdateCatalog({
      id,
      name: e.name,
      price: num(e.price, 0),
      daily: num(e.daily, 0) / 100,
      decay: num(e.decay, 1),
      active: e.active,
    });
    setSaving(false);
    flash(!err, err || 'Paket güncellendi.');
  };

  const players = useMemo(() => {
    if (!adminState) return [];
    const q = search.trim().toLowerCase();
    if (!q) return adminState.players;
    return adminState.players.filter(
      (p) => String(p.id).includes(q) || (p.name || '').toLowerCase().includes(q) || (p.wallet || '').toLowerCase().includes(q)
    );
  }, [adminState, search]);

  if (!isAdmin) {
    return (
      <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-6 text-center">
        <ShieldAlert className="w-8 h-8 text-rose-300 mx-auto mb-2" />
        <h2 className="text-base font-black text-white">Yönetim paneline erişim yok</h2>
        <p className="text-xs text-rose-200/70 mt-1">
          Sunucuda ADMIN_IDS ortam değişkenine kendi Telegram ID'ni ekle.
        </p>
      </div>
    );
  }

  if (!adminState) {
    return (
      <div className="bg-[#083444]/90 border border-cyan-400/35 rounded-2xl p-6 text-center">
        <RefreshCw className="w-6 h-6 text-cyan-300 mx-auto mb-2 animate-spin" />
        <p className="text-xs text-teal-200/70">Yönetim verileri yükleniyor…</p>
        <button
          onClick={() => adminRefresh()}
          className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const c = adminState.config;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2a0f2e] via-[#0d3f4f] to-[#0a3b4a] border border-rose-400/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Sunucu Yönetim Paneli</span>
            </div>
            <h2 className="text-xl font-black text-white font-display">Kozmik Kontrol Merkezi</h2>
            <p className="text-[11px] text-teal-100/70">
              Yönetici ID: {adminState.adminId} · Kasa: {adminState.treasury ? `${adminState.treasury.slice(0, 6)}…${adminState.treasury.slice(-4)}` : 'tanımsız'}
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              adminRefresh();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#07303f] border border-cyan-400/40 text-cyan-200 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Yenile
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pt-3 border-t border-cyan-500/25 no-scrollbar">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playClick();
                  setTab(t.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-md'
                    : 'bg-[#07303f] text-teal-200/80 border border-teal-500/25'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl p-3 text-xs flex items-center gap-2 border ${
            msg.ok
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#083444]/90 border border-emerald-400/35 rounded-2xl p-3">
              <div className="text-[10px] text-emerald-300 font-bold uppercase">Toplam KRD</div>
              <div className="text-lg font-black text-emerald-300 font-mono">
                {adminState.totals.krd.toFixed(0)}
              </div>
            </div>
            <div className="bg-[#083444]/90 border border-cyan-400/35 rounded-2xl p-3">
              <div className="text-[10px] text-cyan-300 font-bold uppercase">Toplam Toz</div>
              <div className="text-lg font-black text-cyan-200 font-mono">
                {adminState.totals.stardust.toFixed(0)}
              </div>
            </div>
            <div className="bg-[#083444]/90 border border-teal-400/35 rounded-2xl p-3">
              <div className="text-[10px] text-teal-300 font-bold uppercase">Oyuncu</div>
              <div className="text-lg font-black text-white font-mono">{adminState.totals.players}</div>
            </div>
            <div className="bg-[#083444]/90 border border-amber-400/35 rounded-2xl p-3">
              <div className="text-[10px] text-amber-300 font-bold uppercase">Kur</div>
              <div className="text-lg font-black text-amber-300 font-mono">{c.krdPerTon} KRD/TON</div>
            </div>
          </div>

          <Card title="Hızlı Durum" icon={Settings}>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-teal-100">
              <div className="bg-[#05222d] rounded-xl p-2.5">
                <div className="text-teal-300/60">Duyuru</div>
                <div className="font-bold">{c.showAnnouncement ? 'Açık' : 'Kapalı'}</div>
              </div>
              <div className="bg-[#05222d] rounded-xl p-2.5">
                <div className="text-teal-300/60">Bakım modu</div>
                <div className={`font-bold ${c.maintenanceMode ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {c.maintenanceMode ? 'AÇIK' : 'Kapalı'}
                </div>
              </div>
              <div className="bg-[#05222d] rounded-xl p-2.5">
                <div className="text-teal-300/60">Çark maliyeti</div>
                <div className="font-bold">{c.wheelCost} Toz</div>
              </div>
              <div className="bg-[#05222d] rounded-xl p-2.5">
                <div className="text-teal-300/60">Toz → KRD</div>
                <div className="font-bold">{c.stPerKrd} Toz = 1 KRD</div>
              </div>
            </div>
          </Card>

          <Card title="Ekonomi Özeti" icon={Coins} desc="Paket fiyatına göre tam kondisyonda günlük üretim.">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-teal-300/70 text-left">
                    <th className="py-1">Paket</th>
                    <th>Fiyat</th>
                    <th>Günlük</th>
                    <th>Amorti</th>
                  </tr>
                </thead>
                <tbody className="text-teal-100">
                  {Object.entries(adminState.catalog).map(([id, p]) => (
                    <tr key={id} className="border-t border-teal-500/15">
                      <td className="py-1.5 pr-2">{p.name}</td>
                      <td className="font-mono">{p.price}</td>
                      <td className="font-mono text-emerald-300">{(p.daily * 100).toFixed(2)}%</td>
                      <td className="font-mono text-amber-300">~{Math.round(1 / Math.max(0.0001, p.daily))} gün</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* GENERAL */}
      {tab === 'general' && (
        <Card title="Duyuru & Bakım" icon={Megaphone} desc="Tüm oyunculara gösterilen mesaj ve bakım durumu.">
          <Toggle
            label="Duyuru şeridini göster"
            desc="Kullanıcı kapatana kadar üstte görünür."
            value={!!c.showAnnouncement}
            onChange={(v) => saveSettings({ showAnnouncement: v }, v ? 'Duyuru açıldı.' : 'Duyuru kapatıldı.')}
          />
          <Toggle
            label="Bakım modu"
            desc="Açıkken oyuncular bakım ekranı görür; adminler girebilir."
            value={!!c.maintenanceMode}
            onChange={(v) => saveSettings({ maintenanceMode: v }, v ? 'Bakım modu açıldı.' : 'Bakım modu kapatıldı.')}
          />
          <label className="block">
            <span className="text-[11px] font-semibold text-teal-200/80">Duyuru metni</span>
            <textarea
              value={form.announcementText || ''}
              onChange={(e) => setForm((f) => ({ ...f, announcementText: e.target.value }))}
              rows={3}
              className="mt-1 w-full bg-[#05222d] border border-teal-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/70"
            />
          </label>
          <Field
            label="Telegram kanal linki"
            value={form.telegramChannelUrl || ''}
            onChange={(v) => setForm((f) => ({ ...f, telegramChannelUrl: v }))}
          />
          <Field
            label="Destek linki"
            value={form.telegramSupportUrl || ''}
            onChange={(v) => setForm((f) => ({ ...f, telegramSupportUrl: v }))}
          />
          <button
            onClick={saveGeneral}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Kaydet
          </button>
        </Card>
      )}

      {/* ECONOMY */}
      {tab === 'economy' && (
        <Card title="Ekonomi Ayarları" icon={Coins} desc="Tüm değerler sunucuda anında geçerli olur.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="1 TON kaç KRD?" type="number" step="0.1" value={form.krdPerTon || ''} onChange={(v) => setForm((f) => ({ ...f, krdPerTon: v }))} />
            <Field label="Minimum TON" type="number" step="0.1" value={form.minTon || ''} onChange={(v) => setForm((f) => ({ ...f, minTon: v }))} />
            <Field
              label="KRD tamir maliyeti (paket fiyatı × % / 1%)"
              type="number"
              step="0.0001"
              value={form.repairCostPerPct || ''}
              onChange={(v) => setForm((f) => ({ ...f, repairCostPerPct: v }))}
              hint="0.0008 = fiyatın %0.08'i her %1 kondisyon için"
            />
            <Field
              label="Toz tamir maliyeti (paket fiyatı × / 1%)"
              type="number"
              step="0.01"
              value={form.stRepairCostPerPct || ''}
              onChange={(v) => setForm((f) => ({ ...f, stRepairCostPerPct: v }))}
              hint="0.05 = fiyatın %5'i her %1 kondisyon için"
            />
            <Field label="Çark maliyeti (Toz)" type="number" value={form.wheelCost || ''} onChange={(v) => setForm((f) => ({ ...f, wheelCost: v }))} />
            <Field label="Günlük ödül Tozu" type="number" value={form.dailyStardust || ''} onChange={(v) => setForm((f) => ({ ...f, dailyStardust: v }))} />
            <Field label="Kaç Toz = 1 KRD?" type="number" value={form.stPerKrd || ''} onChange={(v) => setForm((f) => ({ ...f, stPerKrd: v }))} />
          </div>
          <div className="border-t border-teal-500/25 pt-3 mt-2">
            <div className="text-[11px] font-bold text-cyan-200 mb-2">Kazanç Matematiği (Hesap Özeti)</div>
            <div className="text-[10px] text-teal-200/70 mb-2">Mevcut form/katalog değerlerine göre tahmini hesap. Değerleri değiştirip kaydettikten sonra etkisini buradan takip edebilirsin (garanti değil, tahmindir).</div>
            {(() => {
              const repairPct = num(form.repairCostPerPct || '0.0006', 0.0006);
              const stRepairPct = num(form.stRepairCostPerPct || '0.04', 0.04);
              const faucet = parseList(form.dailyFaucet || '1,1,2,2,2,3,3', 7, [1,1,2,2,2,3,3]);
              const dailySt = num(form.dailyStardust || '30', 30);
              const stPerKrd = Math.max(1, num(form.stPerKrd || '600', 600));
              const mults = parseList(form.planetMult || '1,1.12,1.3,1.55,1.85,2.2', 6, [1,1.12,1.3,1.55,1.85,2.2]);
              const upBonus = 0.06, drillBonus = 0.05; // varsayılan seviye başı
              const pkgs = Object.entries(adminState.catalog || {}).map(([id,p]: any)=>({id,...p})).sort((a:any,b:any)=> (a.price||0)-(b.price||0));
              const weeklyKrd = faucet.reduce((s,n)=>s+n,0);
              const monthlyFreeKrd = weeklyKrd * 4.345 + (dailySt / stPerKrd) * 30;
              return (
                <div className="space-y-3">
                  <div className="bg-[#05222d] border border-teal-500/25 rounded-xl p-2.5">
                    <div className="text-[11px] font-bold text-white mb-1">Yatırımsız (Free) Tahmini</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-teal-100">
                      <div>7 gün seri KRD: <b className="text-emerald-300">{weeklyKrd.toFixed(1)}</b></div>
                      <div>Aylık seri ~KRD: <b className="text-emerald-300">{(weeklyKrd*4.345).toFixed(1)}</b></div>
                      <div>Günlük Toz: <b className="text-cyan-300">{dailySt}</b> (~{(dailySt/stPerKrd).toFixed(3)} KRD)</div>
                      <div>Aylık Toz→KRD ~: <b className="text-cyan-300">{((dailySt*30)/stPerKrd).toFixed(1)}</b></div>
                      <div className="col-span-2">Toplam aylık (günlük+seri, arena hariç) ~ <b className="text-amber-300">{monthlyFreeKrd.toFixed(1)} KRD/ay</b> (çekime ulaşma yavaştır)</div>
                    </div>
                  </div>
                  <div className="bg-[#05222d] border border-teal-500/25 rounded-xl p-2.5 overflow-x-auto">
                    <div className="text-[11px] font-bold text-white mb-1">Madenci Paketleri (Verimli Oyuncu Tahmini)</div>
                    <div className="text-[10px] text-teal-300/60 mb-2">Brüt = fiyat×günlük oran (tam kondisyon). Tamir/gün ≈ fiyat×tamir%×aşınma. Net ≈ brüt−tamir (ortalama kondisyon düşüşü hariç basit model). Amorti ≈ fiyat/net.</div>
                    <table className="w-full text-[10px] min-w-[520px]">
                      <thead><tr className="text-teal-300/70 text-left"><th className="py-1">Paket</th><th>Fiyat</th><th>Günlük%</th><th>Aşınma</th><th>Brüt/gün</th><th>Tamir/gün</th><th>Net/gün</th><th>Amorti (P1)</th><th>Amorti (en iyi gez.)</th></tr></thead>
                      <tbody className="text-teal-100">
                        {pkgs.map((p:any)=>{
                          const price = Number(p.price)||0; const daily = Number(p.daily)||0; const decay = Number(p.decay)||1;
                          const gross = price*daily; const repair = price*repairPct*decay; const net = gross-repair;
                          const bestMult = Math.max(...mults); const grossB = gross*bestMult; const netB = grossB-repair; // tamir sabit varsayımı basit
                          const days = net>0 ? (price/net) : Infinity; const daysB = netB>0 ? (price/netB) : Infinity;
                          return (
                            <tr key={p.id} className="border-t border-teal-500/15">
                              <td className="py-1.5 pr-1">{p.name}</td>
                              <td className="font-mono">{price}</td>
                              <td className="font-mono">{(daily*100).toFixed(2)}%</td>
                              <td className="font-mono">{decay}</td>
                              <td className="font-mono text-emerald-300">{gross.toFixed(3)}</td>
                              <td className="font-mono text-rose-300">{repair.toFixed(3)}</td>
                              <td className="font-mono text-cyan-300">{net.toFixed(3)}</td>
                              <td className="font-mono text-amber-300">{isFinite(days)?Math.round(days)+'g':'∞'}</td>
                              <td className="font-mono text-amber-200">{isFinite(daysB)?Math.round(daysB)+'g':'∞'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="text-[10px] text-teal-300/50 mt-1">Not: "En iyi gezegen" brüt üretime çarpan uygular (tamir maliyeti sabit kabul). Gerçekte ortalama kondisyon, yükseltmeler, gezegen/slot ve bakım sıklığı sonucu değiştirir; hedef ~180 gün civarıdır.</div>
                  </div>
                  <div className="bg-[#05222d] border border-teal-500/25 rounded-xl p-2.5 text-[10px] text-teal-100">
                    <div className="font-bold text-white mb-1">Çekim Özeti</div>
                    <div>Kur: <b>{form.withdrawRateKrdPerTon || 100} KRD = 1 TON</b> • Min: <b>{form.minWithdrawKrd || 200} KRD</b> • Bekleme: {form.withdrawCooldownHours || 72}s • Haftalık: {form.weeklyWithdrawCapKrd || 500} KRD • Min hesap: {form.minWithdrawAccountAgeDays || 7} gün • Min seviye: {form.minWithdrawLevel || 3}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="border-t border-teal-500/25 pt-3 mt-2">
            <div className="text-[11px] font-bold text-cyan-200 mb-2">Çekim (TON/Gram) Ayarları</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Çekim açık? (true/false)" value={form.withdrawEnabled || 'true'} onChange={(v) => setForm((f) => ({ ...f, withdrawEnabled: v }))} />
              <Field label="Çekim kuru (KRD/1 TON)" type="number" value={form.withdrawRateKrdPerTon || ''} onChange={(v) => setForm((f) => ({ ...f, withdrawRateKrdPerTon: v }))} />
              <Field label="Min çekim (KRD)" type="number" value={form.minWithdrawKrd || ''} onChange={(v) => setForm((f) => ({ ...f, minWithdrawKrd: v }))} />
              <Field label="Bekleme (saat)" type="number" value={form.withdrawCooldownHours || ''} onChange={(v) => setForm((f) => ({ ...f, withdrawCooldownHours: v }))} />
              <Field label="Min hesap yaşı (gün)" type="number" value={form.minWithdrawAccountAgeDays || ''} onChange={(v) => setForm((f) => ({ ...f, minWithdrawAccountAgeDays: v }))} />
              <Field label="Min seviye" type="number" value={form.minWithdrawLevel || ''} onChange={(v) => setForm((f) => ({ ...f, minWithdrawLevel: v }))} />
              <Field label="Haftalık limit (KRD)" type="number" value={form.weeklyWithdrawCapKrd || ''} onChange={(v) => setForm((f) => ({ ...f, weeklyWithdrawCapKrd: v }))} />
            </div>
          </div>
          <button
            onClick={saveEconomy}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Ekonomi ve Çekimi Kaydet
          </button>
          <div className="bg-[#05222d] border border-amber-500/30 rounded-xl p-2.5 text-[10px] text-amber-200/80">
            Uyarı: Değerleri değiştirmek tüm oyuncuları etkiler. Önce simülasyonla test etmek için
            <code className="mx-1 text-amber-300">node server/sim.js</code> çalıştır.
          </div>
        </Card>
      )}

      {/* PACKAGES */}
      {tab === 'packages' && (
        <Card title="Paket Kataloğu" icon={PackageCheck} desc="Fiyat, günlük oran (%), aşınma ve aktiflik.">
          <div className="space-y-3">
            {Object.entries(catEdit).map(([id, p]) => (
              <div key={id} className="bg-[#05222d] border border-teal-500/25 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-white truncate">{p.name || id}</div>
                  <button
                    onClick={() => setCatEdit((s) => ({ ...s, [id]: { ...s[id], active: !s[id].active } }))}
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      p.active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {p.active ? 'AKTİF' : 'KAPALI'}
                  </button>
                </div>
                <input
                  value={p.name}
                  onChange={(e) => setCatEdit((s) => ({ ...s, [id]: { ...s[id], name: e.target.value } }))}
                  className="w-full bg-[#041c25] border border-teal-500/25 rounded-lg px-2 py-1.5 text-[11px] text-white outline-none focus:border-cyan-400/60"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Fiyat" type="number" value={p.price} onChange={(v) => setCatEdit((s) => ({ ...s, [id]: { ...s[id], price: v } }))} />
                  <Field label="Günlük %" type="number" step="0.01" value={p.daily} onChange={(v) => setCatEdit((s) => ({ ...s, [id]: { ...s[id], daily: v } }))} />
                  <Field label="Aşınma/gün" type="number" step="0.1" value={p.decay} onChange={(v) => setCatEdit((s) => ({ ...s, [id]: { ...s[id], decay: v } }))} />
                </div>
                <button
                  onClick={() => savePackage(id)}
                  disabled={saving}
                  className="w-full py-1.5 rounded-lg bg-[#0a394a] border border-cyan-400/40 text-cyan-200 text-[11px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-3 h-3" /> Kaydet
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* PLANETS */}
      {tab === 'planets' && (
        <Card title="Gezegen Ayarları" icon={Globe2} desc="Virgülle ayrılmış 6 değer girin (1. gezegen dahil).">
          <Field
            label="Kilit maliyeti (KRD)"
            value={form.planetUnlock || ''}
            onChange={(v) => setForm((f) => ({ ...f, planetUnlock: v }))}
            hint="Örnek: 0, 30, 100, 250, 600, 1500"
          />
          <Field
            label="Üretim çarpanı"
            value={form.planetMult || ''}
            onChange={(v) => setForm((f) => ({ ...f, planetMult: v }))}
            hint="Örnek: 1, 1.1, 1.25, 1.45, 1.7, 2"
          />
          <Field
            label="Gerekli seviye"
            value={form.requiredLevel || ''}
            onChange={(v) => setForm((f) => ({ ...f, requiredLevel: v }))}
            hint="Örnek: 1, 2, 4, 7, 11, 16"
          />
          <Field
            label="7 günlük ödül serisi (KRD)"
            value={form.dailyFaucet || ''}
            onChange={(v) => setForm((f) => ({ ...f, dailyFaucet: v }))}
            hint="Örnek: 2, 2, 3, 3, 4, 4, 6"
          />
          <button
            onClick={savePlanets}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Gezegenleri Kaydet
          </button>
        </Card>
      )}

      {/* MARKET STOCK */}
      {tab === 'market' && (
        <Card title="Pazar Stoğu" icon={Store} desc="Ürün stoğu 0 olduğunda satın alınamaz.">
          {INITIAL_MARKET_ITEMS.map((item) => (
            <div key={item.id} className="bg-[#05222d] border border-teal-500/25 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">{item.title}</div>
                <div className="text-[10px] text-teal-300/60">{item.price} KRD</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => adminUpdateStock(item.id, Math.max(0, (adminState.stock[item.id] ?? 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-[#0a2c38] border border-teal-500/30 text-teal-200 text-sm font-black"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono text-xs text-cyan-200">{adminState.stock[item.id] ?? 0}</span>
                <button
                  onClick={() => adminUpdateStock(item.id, (adminState.stock[item.id] ?? 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#0a2c38] border border-teal-500/30 text-teal-200 text-sm font-black"
                >
                  +
                </button>
                <button
                  onClick={() => adminUpdateStock(item.id, 50)}
                  className="px-2 h-7 rounded-lg bg-[#0a394a] border border-cyan-400/40 text-cyan-200 text-[10px] font-bold"
                >
                  50
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

            {/* WITHDRAWALS */}
      {tab === 'withdrawals' && (
        <Card title="Çekim Talepleri" icon={ArrowUpRight} desc="Onayla/Ödendi/Reddet (redde KRD iade).">
          <div className="space-y-2">
            {((adminState as any).withdrawals || []).length === 0 && <p className="text-xs text-teal-300/60 text-center py-4">Çekim talebi yok.</p>}
            {(((adminState as any).withdrawals || []) as any[]).map((w) => (
              <div key={w.id} className="bg-[#05222d] border border-teal-500/25 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white">#{w.id} • {w.name || w.user_id} ({w.user_id})</div>
                    <div className="text-[10px] text-teal-200/70 font-mono">{Number(w.krd).toFixed(2)} KRD → {Number(w.ton).toFixed(4)} TON • kur {w.rate}</div>
                    <div className="text-[10px] text-teal-300/60 break-all">{w.note || ''} • {w.user_wallet || ''}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${w.status==='paid'||w.status==='approved' ? 'bg-emerald-500/20 text-emerald-300' : w.status==='rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{w.status}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button disabled={saving} onClick={async()=>{setSaving(true); const err=await adminHandleWithdrawal(w.id,'approve'); setSaving(false); flash(!err, err||'Onaylandı.');}} className="px-2.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 text-[10px] font-black">Onayla</button>
                  <button disabled={saving} onClick={async()=>{setSaving(true); const err=await adminHandleWithdrawal(w.id,'paid'); setSaving(false); flash(!err, err||'Ödendi.');}} className="px-2.5 py-1.5 rounded-lg bg-cyan-400 text-slate-950 text-[10px] font-black">Ödendi</button>
                  <button disabled={saving} onClick={async()=>{setSaving(true); const err=await adminHandleWithdrawal(w.id,'reject'); setSaving(false); flash(!err, err||'Reddedildi, iade.');}} className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[10px] font-bold">Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

{/* PLAYERS */}
      {tab === 'players' && (
        <Card title={`Oyuncular (${players.length})`} icon={Users} desc="Bakiye düzenle, banla veya sıfırla.">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-teal-300/60 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ID, isim veya cüzdan ara…"
              className="w-full bg-[#05222d] border border-teal-500/30 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-400/70"
            />
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {players.length === 0 && (
              <p className="text-xs text-teal-300/60 text-center py-6">Oyuncu bulunamadı.</p>
            )}
            {players.map((p) => (
              <div key={p.id} className="bg-[#05222d] border border-teal-500/25 rounded-xl p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">
                      {p.name || 'İsimsiz'} <span className="text-teal-400/60 font-mono">#{p.id}</span>
                      {p.banned && <span className="ml-1 text-rose-400 text-[9px] font-black">BAN</span>}
                    </div>
                    <div className="text-[10px] text-teal-300/60 font-mono">
                      {p.krd} KRD · {p.stardust} Toz · Sv.{p.level} · {p.miners} madenci · Gez.{p.planet}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOpenPlayer(openPlayer === p.id ? null : p.id);
                      setAdjust({ krd: '0', stardust: '0' });
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#0a394a] border border-cyan-400/40 text-cyan-200 shrink-0"
                  >
                    {openPlayer === p.id ? 'Kapat' : 'Düzenle'}
                  </button>
                </div>

                {openPlayer === p.id && (
                  <div className="mt-2 pt-2 border-t border-teal-500/20 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="KRD değişimi (+/−)" type="number" value={adjust.krd} onChange={(v) => setAdjust((a) => ({ ...a, krd: v }))} />
                      <Field label="Toz değişimi (+/−)" type="number" value={adjust.stardust} onChange={(v) => setAdjust((a) => ({ ...a, stardust: v }))} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={async () => {
                          const err = await adminUpdatePlayer(p.id, {
                            action: 'adjust',
                            krd: num(adjust.krd, 0),
                            stardust: num(adjust.stardust, 0),
                          });
                          flash(!err, err || 'Bakiye güncellendi.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 text-[10px] font-black"
                      >
                        Bakiyeyi Uygula
                      </button>
                      <button
                        onClick={async () => {
                          const err = await adminUpdatePlayer(p.id, { action: 'ban', banned: !p.banned });
                          flash(!err, err || (p.banned ? 'Ban kaldırıldı.' : 'Oyuncu banlandı.'));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" /> {p.banned ? 'Banı Kaldır' : 'Banla'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`${p.name || p.id} oyuncusunun tüm ilerlemesi sıfırlansın mı?`)) return;
                          const err = await adminUpdatePlayer(p.id, { action: 'reset' });
                          flash(!err, err || 'Oyuncu sıfırlandı.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Sıfırla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="bg-[#06222d] border border-teal-500/25 rounded-2xl p-3 flex items-start gap-2">
        <Wrench className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
        <p className="text-[10px] text-teal-100/60">
          Tüm değişiklikler sunucuda saklanır ve tüm oyunculara yansır. KRD ve Yıldız Tozu oyun içi para birimidir;
          nakit değeri yoktur, çekim yapılamaz.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-teal-300/40 pb-4">
        <Sparkles className="w-3 h-3" /> Kozmik Yolculuk Yönetim v2
      </div>
    </div>
  );
};
