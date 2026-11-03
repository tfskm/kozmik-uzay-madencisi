import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { MiningPackage, User, Planet } from '../types';
import {
  ShieldAlert,
  Users,
  PackagePlus,
  Coins,
  Settings,
  Ban,
  UserCheck,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Radio,
  RefreshCw,
  Globe2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPanel: React.FC = () => {
  const {
    users,
    packages,
    transactions,
    planets,
    adminSettings,
    adminApproveWithdrawal,
    adminRejectWithdrawal,
    adminToggleBanUser,
    adminAdjustBalance,
    adminCreatePackage,
    adminUpdatePackage,
    adminDeletePackage,
    adminUpdateSettings,
    resetToDefaults,
    setIsAdminMode,
  } = useGame();

  const [currentAdminTab, setCurrentAdminTab] = useState<
    'overview' | 'users' | 'packages' | 'withdrawals' | 'planets' | 'settings'
  >('overview');

  // Search & filter for users
  const [userSearch, setUserSearch] = useState('');

  // Balance adjustment modal state
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<User | null>(null);
  const [adjustUsdt, setAdjustUsdt] = useState<number>(0);
  const [adjustDust, setAdjustDust] = useState<number>(0);

  // New Package Form State
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgSubtitle, setNewPkgSubtitle] = useState('');
  const [newPkgPlanetId, setNewPkgPlanetId] = useState(1);
  const [newPkgTier, setNewPkgTier] = useState<'bronze' | 'silver' | 'gold' | 'neon' | 'quantum'>('silver');
  const [newPkgPrice, setNewPkgPrice] = useState(100);
  const [newPkgCoverDays, setNewPkgCoverDays] = useState(180); // ~6 months
  const [newPkgDurabilityDecay, setNewPkgDurabilityDecay] = useState(1.4);
  const [newPkgBadge, setNewPkgBadge] = useState('YENİ');
  const [newPkgIcon, setNewPkgIcon] = useState('Bot');
  const [newPkgDescription, setNewPkgDescription] = useState('');

  // Settings form local state
  const [announcementInput, setAnnouncementInput] = useState(adminSettings.announcementText);
  const [minWithdrawalInput, setMinWithdrawalInput] = useState(adminSettings.minWithdrawal);
  const [feePercentInput, setFeePercentInput] = useState(adminSettings.withdrawalFeePercent);
  const [autoApproveInput, setAutoApproveInput] = useState(adminSettings.autoApproveWithdrawalsUnder);
  const [repairCostInput, setRepairCostInput] = useState(adminSettings.repairCostPerPercent);
  const [maintenanceInput, setMaintenanceInput] = useState(adminSettings.maintenanceMode);

  // Calculations for overview stats
  const totalDeposited = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === 'withdraw' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const systemReserve = totalDeposited - totalWithdrawn;
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdraw' && t.status === 'pending');

  const filteredUsers = users.filter(
    (u) =>
      u.telegramUsername.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.telegramId.includes(userSearch) ||
      u.walletAddress.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust) return;
    adminAdjustBalance(selectedUserForAdjust.id, adjustUsdt, adjustDust);
    alert(`Bakiye başarıyla güncellendi!`);
    setSelectedUserForAdjust(null);
    setAdjustUsdt(0);
    setAdjustDust(0);
  };

  const handleCreatePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName || newPkgPrice <= 0) {
      alert('Lütfen geçerli paket bilgileri girin.');
      return;
    }

    // Daily return based on cover days: 100 / coverDays %
    const dailyReturnPercent = Number((100 / newPkgCoverDays).toFixed(2));
    const dailyProduction = Number(((newPkgPrice * dailyReturnPercent) / 100).toFixed(2));

    adminCreatePackage({
      name: newPkgName,
      subtitle: newPkgSubtitle || `${newPkgCoverDays} Gün Amorti Süreli Uzay Madencisi`,
      planetId: Number(newPkgPlanetId),
      tier: newPkgTier,
      price: Number(newPkgPrice),
      dailyReturnPercent,
      coverDays: Number(newPkgCoverDays),
      lifespanDays: 360,
      durabilityDecayPerDay: Number(newPkgDurabilityDecay),
      dailyProduction,
      description: newPkgDescription || `${newPkgName} uzay aracı ile günlük sabit $${dailyProduction} USDT kazanın.`,
      iconName: newPkgIcon,
      badge: newPkgBadge,
      isActive: true,
    });

    confetti({ particleCount: 50, spread: 60 });
    alert('Yeni madenci paketi başarıyla oluşturuldu ve mağazada yayına alındı!');
    setIsCreatingPackage(false);
    setNewPkgName('');
  };

  const handleSaveSettings = () => {
    adminUpdateSettings({
      announcementText: announcementInput,
      showAnnouncement: true,
      minWithdrawal: Number(minWithdrawalInput),
      withdrawalFeePercent: Number(feePercentInput),
      autoApproveWithdrawalsUnder: Number(autoApproveInput),
      repairCostPerPercent: Number(repairCostInput),
      maintenanceMode: maintenanceInput,
    });
    alert('Sistem ve ekonomi parametreleri güncellendi!');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Admin Header Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-500/40 rounded-2xl p-4 sm:p-5 glow-rose">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                  SÜPER YÖNETİCİ KONSOLU
                </span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/40">
                  TAM YETKİ
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                Kozmik Madenci Yönetim Paneli
              </h2>
              <p className="text-xs text-slate-300">
                Kullanıcıları denetleyin, paket ekleyin, çekim onaylayın ve ekonomi parametrelerini yönetin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminMode(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition"
            >
              Oyuncu Moduna Dön
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-rose-900/40 no-scrollbar">
          {[
            { id: 'overview', label: 'Genel Bakış & Kasa', icon: TrendingUp },
            { id: 'users', label: `Kullanıcılar (${users.length})`, icon: Users },
            { id: 'packages', label: `Paketler (${packages.length})`, icon: PackagePlus },
            {
              id: 'withdrawals',
              label: `Çekim Kuyruğu (${pendingWithdrawals.length})`,
              icon: Coins,
              badge: pendingWithdrawals.length,
            },
            { id: 'planets', label: `Gezegen Çarpanları`, icon: Globe2 },
            { id: 'settings', label: 'Ekonomi Ayarları', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentAdminTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setCurrentAdminTab(tab.id as typeof currentAdminTab);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 rounded-full animate-bounce">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & CASHFLOW */}
      {currentAdminTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Toplam Kayıtlı Madenci</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {users.length}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                {users.filter((u) => !u.isBanned).length} Aktif • {users.filter((u) => u.isBanned).length} Banlı
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Toplam Yatırım (Deposits)</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ${totalDeposited.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">Sisteme Giren USDT</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Toplam Ödenen Çekim</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                ${totalWithdrawn.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">Kullanıcılara Aktarılan</div>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 bg-emerald-950/20">
              <div className="text-xs text-emerald-300 font-semibold">Net Rezerv / Kasa</div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                ${systemReserve.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">Sağlıklı Likidite</div>
            </div>
          </div>

          {/* Quick Pending Alert if any */}
          {pendingWithdrawals.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    Bekleyen {pendingWithdrawals.length} Çekim Talebi Bulunuyor!
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Kullanıcıların çekim taleplerini onaylamak veya reddetmek için Çekim Kuyruğu sekmesine geçin.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentAdminTab('withdrawals')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl shrink-0"
              >
                Kuyruğu Aç
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {currentAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Telegram Kullanıcı Adı, ID veya Cüzdan ile ara..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-500 font-mono"
            />
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Kullanıcı</th>
                    <th className="py-3 px-3">Cüzdan</th>
                    <th className="py-3 px-3">USDT / Toz Bakiye</th>
                    <th className="py-3 px-3">Yatırım / Çekim</th>
                    <th className="py-3 px-3">Durum</th>
                    <th className="py-3 px-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{u.avatar}</span>
                          <div>
                            <div className="font-bold text-slate-200">
                              @{u.telegramUsername}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {u.telegramId} • Lv.{u.level}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                        {u.walletAddress ? u.walletAddress.substring(0, 10) + '...' : 'Bağlı Değil'}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-emerald-400">
                          ${u.usdtBalance.toFixed(2)} USDT
                        </div>
                        <div className="text-[10px] text-purple-300">
                          {u.stardustBalance} Toz
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="text-emerald-400">+${u.totalDeposited.toFixed(0)}</span> /{' '}
                        <span className="text-rose-400">-${u.totalWithdrawn.toFixed(0)}</span>
                      </td>

                      <td className="py-3 px-3">
                        {u.isBanned ? (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                            BANLI
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                            AKTİF
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Balance Adjust Button */}
                          <button
                            onClick={() => {
                              setSelectedUserForAdjust(u);
                              setAdjustUsdt(0);
                              setAdjustDust(0);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition"
                            title="Bakiye Düzenle"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>

                          {/* Ban / Unban Button */}
                          <button
                            onClick={() => adminToggleBanUser(u.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              u.isBanned
                                ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/30'
                            }`}
                            title={u.isBanned ? 'Ban Kaldır' : 'Kullanıcıyı Banla'}
                          >
                            {u.isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Balance Adjustment Modal */}
          {selectedUserForAdjust && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
                <h3 className="text-base font-bold text-white font-display mb-1">
                  Bakiye Düzenleme: @{selectedUserForAdjust.telegramUsername}
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Pozitif değer ekler (+), negatif değer çıkarır (-).
                </p>

                <form onSubmit={handleAdjustSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">USDT Değişimi:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustUsdt}
                      onChange={(e) => setAdjustUsdt(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Yıldız Tozu Değişimi:</label>
                    <input
                      type="number"
                      step="1"
                      value={adjustDust}
                      onChange={(e) => setAdjustDust(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForAdjust(null)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Değişikliği Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PACKAGES MANAGEMENT */}
      {currentAdminTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">
              Mevcut Madenci Paketleri ({packages.length})
            </h3>

            <button
              onClick={() => setIsCreatingPackage(!isCreatingPackage)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Paket Oluştur</span>
            </button>
          </div>

          {/* New Package Creation Wizard Form */}
          {isCreatingPackage && (
            <form
              onSubmit={handleCreatePackageSubmit}
              className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 space-y-4 glow-emerald"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-emerald-400" />
                  <span>Yeni Madencilik Paketi Sihirbazı</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingPackage(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Kapat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Paket Adı:</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kuasar Plazma Kruvazörü"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Alt Başlık / Rozet:</label>
                  <input
                    type="text"
                    placeholder="Örn: YÜKSEK GETİRİ / VIP"
                    value={newPkgBadge}
                    onChange={(e) => setNewPkgBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Sektör / Gezegen:</label>
                  <select
                    value={newPkgPlanetId}
                    onChange={(e) => setNewPkgPlanetId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    {planets.map((p) => (
                      <option key={p.id} value={p.id}>
                        Sektör {p.id}: {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Fiyat ($ USDT):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">
                    Amorti (Cover) Süresi (Gün):
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={newPkgCoverDays}
                    onChange={(e) => setNewPkgCoverDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                    Günlük Getiri: %{(100 / newPkgCoverDays).toFixed(2)} ($
                    {((newPkgPrice * (100 / newPkgCoverDays)) / 100).toFixed(2)}/gün)
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Günlük Aşınma Oranı (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPkgDurabilityDecay}
                    onChange={(e) => setNewPkgDurabilityDecay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">Açıklama:</label>
                <input
                  type="text"
                  placeholder="Madencinin çalışma mantığı ve getiri potansiyeli..."
                  value={newPkgDescription}
                  onChange={(e) => setNewPkgDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPackage(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs font-display uppercase tracking-wider"
                >
                  Paketi Yayınla
                </button>
              </div>
            </form>
          )}

          {/* Existing Packages Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Paket Adı</th>
                    <th className="py-3 px-3">Gezegen</th>
                    <th className="py-3 px-3">Fiyat</th>
                    <th className="py-3 px-3">Günlük Getiri</th>
                    <th className="py-3 px-3">Amorti (Cover)</th>
                    <th className="py-3 px-3">Satış</th>
                    <th className="py-3 px-3">Durum</th>
                    <th className="py-3 px-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{pkg.name}</div>
                        <div className="text-[10px] text-slate-400">{pkg.badge}</div>
                      </td>

                      <td className="py-3 px-3 text-cyan-300 font-mono">
                        Sektör #{pkg.planetId}
                      </td>

                      <td className="py-3 px-3 font-bold text-white font-mono">
                        ${pkg.price} USDT
                      </td>

                      <td className="py-3 px-3 font-mono text-emerald-400">
                        +${pkg.dailyProduction.toFixed(2)} (%{pkg.dailyReturnPercent})
                      </td>

                      <td className="py-3 px-3 font-mono text-amber-300">
                        ~{pkg.coverDays} Gün
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400">
                        {pkg.totalPurchased} adet
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => adminUpdatePackage({ ...pkg, isActive: !pkg.isActive })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            pkg.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {pkg.isActive ? 'YAYINDA' : 'PASİF'}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`"${pkg.name}" paketini silmek istediğinize emin misiniz?`)) {
                              adminDeletePackage(pkg.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition"
                          title="Paketi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WITHDRAWALS QUEUE */}
      {currentAdminTab === 'withdrawals' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-display">
            Bekleyen ve Tamamlanan Çekim Talepleri
          </h3>

          {transactions.filter((t) => t.type === 'withdraw').length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Henüz çekim talebi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions
                .filter((t) => t.type === 'withdraw')
                .map((tx) => {
                  const isPending = tx.status === 'pending';

                  return (
                    <div
                      key={tx.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-500/50'
                          : tx.status === 'completed'
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-rose-950/20 border-rose-900/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            @{tx.userName}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                              isPending
                                ? 'bg-amber-500 text-slate-950'
                                : tx.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-md">
                          Hedef Cüzdan: <strong className="text-cyan-300">{tx.address}</strong>
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Tarih: {new Date(tx.timestamp).toLocaleString('tr-TR')} • {tx.note}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-black text-emerald-400 font-mono">
                            ${tx.amount.toFixed(2)} USDT
                          </div>
                          <div className="text-[10px] text-slate-400">Net Ödeme</div>
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                sounds.playCoin();
                                adminApproveWithdrawal(tx.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Onayla</span>
                            </button>

                            <button
                              onClick={() => {
                                sounds.playLaser();
                                adminRejectWithdrawal(tx.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PLANETS MULTIPLIERS */}
      {currentAdminTab === 'planets' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white font-display">
            Gezegen Madencilik Çarpanları & Kilitleri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {planets.map((planet) => (
              <div
                key={planet.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Sektör {planet.id}: {planet.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Gereken Seviye: {planet.requiredLevel} • Kilit: ${planet.unlockCostUSDT} USDT
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    x{planet.miningMultiplier.toFixed(2)} Kat
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS & PARAMETERS */}
      {currentAdminTab === 'settings' && (
        <div className="space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>Sistem ve Finans Parametreleri</span>
            </h3>

            {/* Announcement text */}
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">
                Genel Telegram / Sistem Duyuru Bandı:
              </label>
              <textarea
                rows={2}
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Min. Çekim Tutarı ($ USDT):</label>
                <input
                  type="number"
                  value={minWithdrawalInput}
                  onChange={(e) => setMinWithdrawalInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">Çekim Komisyonu (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={feePercentInput}
                  onChange={(e) => setFeePercentInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">Otomatik Onay Limiti ($ USDT):</label>
                <input
                  type="number"
                  value={autoApproveInput}
                  onChange={(e) => setAutoApproveInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">
                  Tamir Masrafı (1% aşınma = $):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={repairCostInput}
                  onChange={(e) => setRepairCostInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="maint"
                  checked={maintenanceInput}
                  onChange={(e) => setMaintenanceInput(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0"
                />
                <label htmlFor="maint" className="text-xs font-bold text-rose-400 cursor-pointer">
                  🚨 Bakım Modunu Aktif Et (Madenciliği Durdurur)
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Ayarları Kaydet ve Uygula
            </button>
          </div>

          {/* Reset Factory Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-300">Fabrika Ayarlarına Sıfırla</div>
              <div className="text-[11px] text-slate-400">
                Tüm mock kullanıcıları, paketleri ve işlem geçmişini başlangıç durumuna sıfırlar.
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Tüm veritabanını fabrika ayarlarına sıfırlamak istediğinize emin misiniz?')) {
                  resetToDefaults();
                  alert('Sistem başlangıç verilerine sıfırlandı.');
                }
              }}
              className="bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition shrink-0"
            >
              Verileri Sıfırla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
