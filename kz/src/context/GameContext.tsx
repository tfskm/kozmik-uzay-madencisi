import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { api } from '../lib/api';
import {
  User,
  MiningPackage,
  UserMiner,
  Planet,
  Transaction,
  MarketItem,
  WheelPrize,
  AdminSystemStats,
  SpaceBattle,
  AdminState,
} from '../types';
import {
  INITIAL_PLANETS,
  INITIAL_PACKAGES,
  INITIAL_MARKET_ITEMS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_USER,
  WHEEL_PRIZES,
} from '../data/initialData';
import { sounds } from '../utils/audio';

export interface ServerMeta {
  up: number;
  drill: number;
  upCost: number;
  drillCost: number;
  canDaily: boolean;
  streak: number;
  maxMiners: number;
  krdPerTon: number;
  minTon: number;
  stPerKrd: number;
  repairCostPerPct: number;
  stRepairCostPerPct: number;
  wheelCost: number;
  dailyStardust: number;
}

type ActionResult = { success: boolean; message: string };

interface GameContextType {
  ready: boolean;
  error: string | null;
  isAdmin: boolean;
  user: User;
  planets: Planet[];
  packages: MiningPackage[];
  userMiners: UserMiner[];
  transactions: Transaction[];
  marketItems: MarketItem[];
  adminSettings: AdminSystemStats;
  serverMeta: ServerMeta | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;

  // Modals
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (val: boolean) => void;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (val: boolean) => void;
  isRepairModalOpen: boolean;
  setIsRepairModalOpen: (val: boolean) => void;
  selectedMinerForRepair: UserMiner | null;
  setSelectedMinerForRepair: (miner: UserMiner | null) => void;

  // Random event
  randomEvent: { id: string; title: string; rewardStardust: number; rewardKrd: number; expiresAt: number } | null;
  claimRandomEvent: () => void;
  dismissAnnouncement: () => void;

  // Server bridge
  gameAct: (a: Record<string, unknown>) => Promise<string | null>;
  refreshServer: () => Promise<void>;
  applyPurchasedStardust: (amount: number) => void;

  // Game actions
  buyPackage: (pkg: MiningPackage) => Promise<ActionResult>;
  claimSingleMiner: (instanceId: string) => Promise<void>;
  claimAllMiners: () => Promise<{ totalClaimed: number }>;
  repairMiner: (instanceId: string, useCurrency: 'KRD' | 'STARDUST') => Promise<ActionResult>;
  unlockPlanet: (planetId: number) => Promise<ActionResult>;
  travelToPlanet: (planetId: number) => Promise<void>;
  spinWheel: () => Promise<WheelPrize>;
  openMysteryBox: (boxId: string) => Promise<{ prizeName: string; krdAmount: number; stardustAmount: number }>;
  buyMarketItem: (itemId: string) => Promise<ActionResult>;
  exchangeStardust: (amount: number) => Promise<ActionResult>;

  // Admin
  adminState: AdminState | null;
  adminRefresh: () => Promise<void>;
  adminUpdateSettings: (patch: Record<string, unknown>) => Promise<string | null>;
  adminUpdateCatalog: (patch: Record<string, unknown>) => Promise<string | null>;
  adminUpdatePlayer: (id: number, body: Record<string, unknown>) => Promise<string | null>;
  adminUpdateStock: (id: string, stock: number) => Promise<string | null>;

  // Battle & voyage mini-games
  currentPlanet: Planet;
  currentBattle: SpaceBattle | null;
  startBattle: () => void;
  attackEnemy: (damage?: number) => { defeated: boolean; loot?: { stardust: number } };
  manualClickMine: () => { krdEarned: number; stardustEarned: number };
  collectVoyageStar: (pointsOverride?: number) => number;
  destroyVoyageAsteroid: (pointsOverride?: number) => number;
  takeAsteroidHit: (decayAmount?: number, pointPenalty?: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DISMISS_KEY = 'kz_dismissed_announcement';

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tonAddress = useTonAddress();
  const tonWallet = useTonWallet();
  const tonAddressRef = useRef(tonAddress);
  tonAddressRef.current = tonAddress;
  const tonWalletNameRef = useRef('');
  tonWalletNameRef.current = tonWallet?.device?.appName || '';
  const lastPostedWallet = useRef('');

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [planets, setPlanets] = useState<Planet[]>(INITIAL_PLANETS);
  const [packages, setPackages] = useState<MiningPackage[]>(INITIAL_PACKAGES);
  const [userMiners, setUserMiners] = useState<UserMiner[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET_ITEMS);
  const [adminSettings, setAdminSettings] = useState<AdminSystemStats>(INITIAL_ADMIN_SETTINGS);
  const [serverMeta, setServerMeta] = useState<ServerMeta | null>(null);

  const [activeTab, setActiveTabState] = useState('mining');
  const [isAdminMode, setIsAdminModeState] = useState(false);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedMinerForRepair, setSelectedMinerForRepair] = useState<UserMiner | null>(null);

  const [randomEvent, setRandomEvent] = useState<GameContextType['randomEvent']>(null);
  const [currentBattle, setCurrentBattle] = useState<SpaceBattle | null>(null);
  const [adminState, setAdminState] = useState<AdminState | null>(null);

  const lastResultRef = useRef<Record<string, unknown> | null>(null);
  const readyRef = useRef(false);
  const dismissedRef = useRef<string>(
    (() => {
      try { return localStorage.getItem(DISMISS_KEY) || ''; } catch { return ''; }
    })()
  );

  const currentPlanet = planets.find((p) => p.id === user.currentPlanetId) || planets[0];

  const applyServer = useCallback((r: Record<string, any>) => {
    lastResultRef.current = (r.last as Record<string, unknown>) || null;
    readyRef.current = true;
    setReady(true);
    setError(null);
    setIsAdmin(!!r.isAdmin);

    const address = tonAddressRef.current || '';
    setUser((prev) => ({
      ...prev,
      id: String(r.uid ?? prev.id),
      telegramId: String(r.uid ?? prev.telegramId),
      telegramUsername: r.name || prev.telegramUsername || 'Misafir',
      walletAddress: address,
      walletName: tonWalletNameRef.current || (r.wallet ? 'TON Cüzdan' : ''),
      walletType: address ? 'ton' : null,
      isConnected: !!address,
      krdBalance: Number((r.krd ?? 0).toFixed(4)),
      stardustBalance: Math.floor(r.stardust ?? 0),
      level: r.level ?? 1,
      exp: r.exp ?? 0,
      maxExp: r.expNext ?? 9,
      currentPlanetId: (r.planet ?? 0) + 1,
      unlockedPlanetIds: ((r.unlocked as number[]) || [0]).map((i) => i + 1),
      spinsAvailable: r.spins ?? 0,
      isBanned: !!r.banned,
      role: r.isAdmin ? 'admin' : 'user',
      equippedWeapon: (r.weapon as string | null) ?? prev.equippedWeapon ?? null,
      equippedShield: (r.shield as string | null) ?? prev.equippedShield ?? null,
    }));

    const cat = (r.meta?.catalog || {}) as Record<string, any>;
    const planetMult = (r.meta?.planetMult || [1]) as number[];
    const upMult = 1 + 0.05 * (r.up || 0);
    const drillMult = 1 + 0.04 * (r.drill || 0);

    setUserMiners(
      ((r.miners as any[]) || []).map((m) => {
        const c = cat[m.pkgId] || {};
        const pm = planetMult[(m.planetId || 1) - 1] ?? 1;
        const dailyRate = (m.daily || c.daily || 0) * pm * upMult * drillMult;
        return {
          instanceId: String(m.id),
          packageId: m.pkgId || m.tier,
          packageName: c.name || m.tier || 'Madenci',
          tier: m.tier || c.tier || 'bronze',
          price: m.price,
          dailyYield: m.price * dailyRate,
          dailyRate,
          decayPerDay: m.decay || c.decay || 1,
          durability: m.dur,
          planetId: m.planetId || 1,
          purchaseDate: m.born,
          lastClaimedAt: m.last,
          unclaimedYield: m.pending || 0,
          totalEarned: 0,
          isRunning: m.running,
          iconName: c.iconName || 'Bot',
        } as UserMiner;
      })
    );

    setTransactions(
      ((r.history as any[]) || [])
        .slice()
        .reverse()
        .map((h) => ({
          id: h.id,
          userId: String(r.uid ?? ''),
          userName: r.name || '',
          type: h.type,
          amount: Number(h.amount) || 0,
          currency: h.currency,
          status: h.status || 'completed',
          timestamp: h.ts,
          note: h.note,
        })) as Transaction[]
    );

    setMarketItems(INITIAL_MARKET_ITEMS.map((i) => ({ ...i, stock: r.stock?.[i.id] ?? i.stock })));

    const s = (r.settings || {}) as Record<string, any>;
    const showAnnouncement =
      !!s.showAnnouncement && String(s.announcementText || '') !== dismissedRef.current;
    setAdminSettings((prev) => ({
      ...prev,
      maintenanceMode: !!s.maintenanceMode,
      announcementText: s.announcementText || prev.announcementText,
      showAnnouncement,
      telegramChannelUrl: s.telegramChannelUrl || prev.telegramChannelUrl,
      telegramSupportUrl: s.telegramSupportUrl || prev.telegramSupportUrl,
      repairCostPerPercent: r.meta?.repairCostPerPct ?? prev.repairCostPerPercent,
      stRepairCostPerPercent: r.meta?.stRepairCostPerPct ?? prev.stRepairCostPerPercent,
      luckyWheelCostStardust: r.meta?.wheelCost ?? prev.luckyWheelCostStardust,
      krdPerTon: r.meta?.krdPerTon ?? prev.krdPerTon,
      minTon: r.meta?.minTon ?? prev.minTon,
      stPerKrd: r.meta?.stPerKrd ?? prev.stPerKrd,
      dailyStardust: r.meta?.dailyStardust ?? prev.dailyStardust,
    }));

    const unlocks = (r.meta?.planetUnlock || []) as number[];
    const mults = (r.meta?.planetMult || []) as number[];
    const levels = (r.meta?.requiredLevel || []) as number[];
    setPlanets(
      INITIAL_PLANETS.map((p, i) => ({
        ...p,
        unlockCostKRD: unlocks[i] ?? p.unlockCostKRD,
        unlockCostStardust: 0,
        miningMultiplier: mults[i] ?? p.miningMultiplier,
        requiredLevel: levels[i] ?? p.requiredLevel,
      }))
    );

    setPackages(
      Object.entries(cat).map(([id, c]) => {
        const base = INITIAL_PACKAGES.find((p) => p.id === id);
        const pm = planetMult[(c.planetId || 1) - 1] ?? 1;
        return {
          id,
          name: c.name || base?.name || id,
          subtitle: base?.subtitle || '',
          planetId: c.planetId,
          tier: c.tier,
          price: r.prices?.[id] ?? c.price,
          basePrice: c.price,
          dailyReturnPercent: Number(((c.daily || 0) * 100).toFixed(2)),
          dailyRate: c.daily || 0,
          coverDays: Math.round(1 / Math.max(0.0001, c.daily || 0.0001)),
          lifespanDays: 240,
          durabilityDecayPerDay: c.decay || 1,
          planetMultiplier: pm,
          dailyProduction: Number((c.price * (c.daily || 0) * pm).toFixed(4)),
          description: base?.description || '',
          iconName: c.iconName || base?.iconName || 'Bot',
          badge: base?.badge || '',
          isActive: c.active !== false,
          totalPurchased: 0,
        } as MiningPackage;
      })
    );

    setServerMeta({
      up: r.up || 0,
      drill: r.drill || 0,
      upCost: r.upCost || 0,
      drillCost: r.drillCost || 0,
      canDaily: !!r.canDaily,
      streak: r.streak || 0,
      maxMiners: r.maxMiners || r.meta?.maxMiners || 6,
      krdPerTon: r.meta?.krdPerTon ?? 20,
      minTon: r.meta?.minTon ?? 0.5,
      stPerKrd: r.meta?.stPerKrd ?? 500,
      repairCostPerPct: r.meta?.repairCostPerPct ?? 0.0008,
      stRepairCostPerPct: r.meta?.stRepairCostPerPct ?? 0.05,
      wheelCost: r.meta?.wheelCost ?? 100,
      dailyStardust: r.meta?.dailyStardust ?? 50,
    });
  }, []);

  const refreshServer = useCallback(async () => {
    try {
      const r = await api<Record<string, any>>('game');
      applyServer(r);
    } catch {
      // İlk yükleme başarısızsa tam ekran hata göster; sonraki senkron hataları oyunu bozmasın.
      if (!readyRef.current) setError('Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.');
    }
  }, [applyServer]);

  const gameAct = useCallback(
    async (a: Record<string, unknown>) => {
      try {
        const r = await api<Record<string, any>>('game/act', a);
        applyServer(r);
        return (r.error as string) || null;
      } catch {
        return 'Sunucuya ulaşılamadı, tekrar dene.';
      }
    },
    [applyServer]
  );

  // İlk yükleme + 5 saniyelik senkron
  useEffect(() => {
    refreshServer();
    const t = setInterval(refreshServer, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') refreshServer(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshServer]);

  // TON cüzdan adresi değişince sunucuya kaydet
  useEffect(() => {
    if (!tonAddress || tonAddress === lastPostedWallet.current) return;
    lastPostedWallet.current = tonAddress;
    api('wallet', { address: tonAddress })
      .then(() => refreshServer())
      .catch(() => { /* cüzdan kaydı kritik değil */ });
  }, [tonAddress, refreshServer]);

  const setActiveTab = (tab: string) => {
    if (tab === 'admin' && !isAdmin) return;
    setActiveTabState(tab);
    if (tab === 'admin') setIsAdminModeState(true);
  };

  const setIsAdminMode = (val: boolean) => {
    if (val && !isAdmin) {
      setActiveTabState('mining');
      return;
    }
    setIsAdminModeState(val);
    if (val) setActiveTabState('admin');
  };

  const dismissAnnouncement = () => {
    dismissedRef.current = adminSettings.announcementText;
    try { localStorage.setItem(DISMISS_KEY, adminSettings.announcementText); } catch { /* yoksay */ }
    setAdminSettings((prev) => ({ ...prev, showAnnouncement: false }));
  };

  // ---- Oyun aksiyonları ----
  const buyPackage = async (pkg: MiningPackage): Promise<ActionResult> => {
    if (user.isBanned) return { success: false, message: 'Hesabınız askıya alınmıştır.' };
    if (!user.unlockedPlanetIds.includes(pkg.planetId)) return { success: false, message: 'Bu ekipman için önce gezegeni açmalısın.' };
    const planet = planets.find((p) => p.id === pkg.planetId);
    if (planet && user.level < planet.requiredLevel) return { success: false, message: `Seviye ${planet.requiredLevel} gerekli.` };
    if (user.krdBalance < pkg.price) return { success: false, message: 'Yetersiz KRD. Cüzdan sekmesinden TON ile KRD yükleyebilirsin.' };
    sounds.playUpgrade();
    sounds.triggerHaptic('heavy');
    const err = await gameAct({ type: 'buy', pkgId: pkg.id });
    return err ? { success: false, message: err } : { success: true, message: `${pkg.name} filoya eklendi.` };
  };

  const claimSingleMiner = async (instanceId: string) => {
    const m = userMiners.find((x) => x.instanceId === instanceId);
    if (!m || m.unclaimedYield <= 0.001) return;
    sounds.playCoin();
    sounds.triggerHaptic('light');
    await gameAct({ type: 'claim', id: Number(instanceId) });
  };

  const claimAllMiners = async () => {
    const total = userMiners.reduce((s, m) => s + m.unclaimedYield, 0);
    if (total > 0.001) {
      sounds.playCoin();
      await gameAct({ type: 'claim' });
    }
    return { totalClaimed: total };
  };

  const repairMiner = async (instanceId: string, useCurrency: 'KRD' | 'STARDUST'): Promise<ActionResult> => {
    const m = userMiners.find((x) => x.instanceId === instanceId);
    if (!m) return { success: false, message: 'Ekipman bulunamadı.' };
    const missing = Math.max(0, 100 - m.durability);
    if (missing <= 0.001) return { success: false, message: 'Ekipman zaten tam kondisyonda.' };
    if (useCurrency === 'KRD') {
      const cost = m.price * adminSettings.repairCostPerPercent * missing;
      if (user.krdBalance < cost) return { success: false, message: 'Yetersiz KRD.' };
    } else {
      const cost = Math.ceil(m.price * adminSettings.stRepairCostPerPercent * missing);
      if (user.stardustBalance < cost) return { success: false, message: 'Yetersiz Yıldız Tozu.' };
    }
    sounds.playUpgrade();
    const err = await gameAct({ type: 'repair', id: Number(instanceId), currency: useCurrency });
    return err ? { success: false, message: err } : { success: true, message: 'Madenci tamir edildi.' };
  };

  const unlockPlanet = async (planetId: number): Promise<ActionResult> => {
    const pl = planets.find((p) => p.id === planetId);
    if (!pl || user.unlockedPlanetIds.includes(planetId)) return { success: false, message: 'Geçersiz gezegen.' };
    if (user.level < pl.requiredLevel) return { success: false, message: `Seviye ${pl.requiredLevel} gerekli.` };
    if (user.krdBalance < pl.unlockCostKRD) return { success: false, message: 'Yetersiz KRD.' };
    sounds.playUpgrade();
    const err = await gameAct({ type: 'unlock', planet: planetId - 1 });
    return err ? { success: false, message: err } : { success: true, message: `${pl.name} açıldı.` };
  };

  const travelToPlanet = async (planetId: number) => {
    if (!user.unlockedPlanetIds.includes(planetId)) return;
    sounds.playLaser();
    sounds.triggerHaptic('light');
    await gameAct({ type: 'travel', planet: planetId - 1 });
  };

  const spinWheel = async (): Promise<WheelPrize> => {
    const err = await gameAct({ type: 'spin' });
    if (err) throw new Error(err);
    const id = lastResultRef.current?.prizeId as string | undefined;
    return WHEEL_PRIZES.find((w) => w.id === id) || WHEEL_PRIZES[0];
  };

  const openMysteryBox = async (boxId: string) => {
    sounds.playUpgrade();
    sounds.triggerHaptic('heavy');
    const err = await gameAct({ type: 'box', id: boxId });
    if (err) throw new Error(err);
    const r = lastResultRef.current || {};
    const krd = Number(r.krd) || 0;
    const st = Number(r.st) || 0;
    const spins = Number(r.spins) || 0;
    return {
      prizeName: `${krd} KRD + ${st} Yıldız Tozu${spins ? ` + ${spins} Çevirme` : ''}`,
      krdAmount: krd,
      stardustAmount: st,
    };
  };

  const buyMarketItem = async (itemId: string): Promise<ActionResult> => {
    const item = marketItems.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Ürün bulunamadı.' };
    if (item.stock <= 0) return { success: false, message: 'Bu ürünün stoğu tükendi.' };
    if (user.krdBalance < item.price) return { success: false, message: 'Yetersiz KRD.' };
    sounds.playUpgrade();
    sounds.triggerHaptic('medium');
    const err = await gameAct({ type: 'market', id: itemId });
    return err ? { success: false, message: err } : { success: true, message: `"${item.title}" satın alındı.` };
  };

  const exchangeStardust = async (amount: number): Promise<ActionResult> => {
    if (amount <= 0) return { success: false, message: 'Geçersiz miktar.' };
    if (user.stardustBalance < amount) return { success: false, message: 'Yetersiz Yıldız Tozu.' };
    sounds.playCoin();
    sounds.triggerHaptic('success');
    const err = await gameAct({ type: 'exchange', stardust: amount });
    return err
      ? { success: false, message: err }
      : { success: true, message: `${amount} Toz → ${(amount / adminSettings.stPerKrd).toFixed(2)} KRD` };
  };

  const applyPurchasedStardust = (_amount: number) => {
    sounds.playCoin();
    refreshServer();
  };

  // ---- Admin ----
  const adminRefresh = async () => {
    try {
      const r = await api<AdminState>('admin/state');
      setAdminState(r);
    } catch {
      setAdminState(null);
    }
  };

  const adminUpdateSettings = async (patch: Record<string, unknown>) => {
    try {
      await api('admin/settings', patch);
      await adminRefresh();
      await refreshServer();
      return null;
    } catch {
      return 'Ayarlar kaydedilemedi.';
    }
  };

  const adminUpdateCatalog = async (patch: Record<string, unknown>) => {
    try {
      await api('admin/catalog', patch);
      await adminRefresh();
      await refreshServer();
      return null;
    } catch {
      return 'Paket kaydedilemedi.';
    }
  };

  const adminUpdatePlayer = async (id: number, body: Record<string, unknown>) => {
    try {
      await api('admin/player', { id, ...body });
      await adminRefresh();
      return null;
    } catch {
      return 'Oyuncu güncellenemedi.';
    }
  };

  const adminUpdateStock = async (id: string, stock: number) => {
    try {
      await api('admin/stock', { id, stock });
      await adminRefresh();
      await refreshServer();
      return null;
    } catch {
      return 'Stok güncellenemedi.';
    }
  };

  // ---- Rastgele olay ----
  useEffect(() => {
    const eventTimer = setInterval(() => {
      if (!randomEvent && Math.random() < 0.4) {
        const events = [
          { title: '☄️ Parlayan Titanyum Meteoru Geçiyor!', stardust: 60, krd: 0.15 },
          { title: '✨ Güneş Patlaması Enerji Sızıntısı!', stardust: 120, krd: 0.3 },
          { title: '🛸 Terk Edilmiş Keşif Kapsülü Sinyali!', stardust: 200, krd: 0.5 },
        ];
        const pick = events[Math.floor(Math.random() * events.length)];
        setRandomEvent({
          id: 'evt_' + Date.now(),
          title: pick.title,
          rewardStardust: pick.stardust,
          rewardKrd: pick.krd,
          expiresAt: Date.now() + 20000,
        });
        sounds.playLaser();
      }
    }, 45000);
    return () => clearInterval(eventTimer);
  }, [randomEvent]);

  useEffect(() => {
    if (!randomEvent) return;
    const timer = setTimeout(() => setRandomEvent(null), 20000);
    return () => clearTimeout(timer);
  }, [randomEvent]);

  const claimRandomEvent = () => {
    if (!randomEvent) return;
    sounds.playWin();
    sounds.triggerHaptic('success');
    gameAct({ type: 'activity', amount: randomEvent.rewardKrd, stardust: randomEvent.rewardStardust });
    setRandomEvent(null);
  };

  // ---- Savaş ----
  useEffect(() => {
    if (!currentBattle || currentBattle.isDefeated) return;
    const bTimer = setInterval(() => {
      setCurrentBattle((prev) => {
        if (!prev) return null;
        if (prev.timeRemainingSeconds <= 1) return null;
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(bTimer);
  }, [currentBattle]);

  const startBattle = () => {
    if (currentBattle && !currentBattle.isDefeated) return;
    sounds.playLaser();
    sounds.triggerHaptic('heavy');
    const enemies = [
      { name: 'Kızıl Korsan Kruvazörü', type: 'pirate_frigate' as const, hp: 60, dust: 60, avatar: '👾' },
      { name: 'Gölge Antimadde Akıncısı', type: 'void_reaper' as const, hp: 100, dust: 100, avatar: '🛸' },
      { name: 'Siber Nebula Haydutu', type: 'plasma_corsair' as const, hp: 150, dust: 150, avatar: '👹' },
    ];
    const picked = enemies[Math.floor(Math.random() * enemies.length)];
    setCurrentBattle({
      id: 'bat_' + Date.now(),
      enemyName: picked.name,
      enemyType: picked.type,
      maxHp: picked.hp,
      currentHp: picked.hp,
      usdtBounty: 0,
      stardustBounty: picked.dust,
      timeRemainingSeconds: 30,
      isDefeated: false,
      avatar: picked.avatar,
    });
  };

  const attackEnemy = (damage = 20) => {
    if (!currentBattle || currentBattle.isDefeated) return { defeated: false };
    sounds.playLaser();
    sounds.triggerHaptic('medium');
    const fleetBonus = userMiners.filter((m) => m.isRunning && m.durability > 0).length * 4;
    const nextHp = Math.max(0, currentBattle.currentHp - (damage + fleetBonus));
    if (nextHp <= 0) {
      sounds.playWin();
      sounds.triggerHaptic('success');
      const bounty = currentBattle.stardustBounty;
      gameAct({ type: 'activity', stardust: bounty });
      setCurrentBattle((prev) => (prev ? { ...prev, currentHp: 0, isDefeated: true } : null));
      setTimeout(() => setCurrentBattle(null), 2500);
      return { defeated: true, loot: { stardust: bounty } };
    }
    setCurrentBattle((prev) => (prev ? { ...prev, currentHp: nextHp } : null));
    return { defeated: false };
  };

  const manualClickMine = () => {
    sounds.playClick();
    sounds.triggerHaptic('light');
    const krdEarned = 0.01;
    const stardustEarned = 2;
    gameAct({ type: 'activity', amount: krdEarned, stardust: stardustEarned });
    return { krdEarned, stardustEarned };
  };

  const collectVoyageStar = (pointsOverride?: number) => {
    sounds.playCollectStar();
    sounds.triggerHaptic('success');
    const v = adminSettings.voyageSettings;
    const base = pointsOverride !== undefined ? pointsOverride : v.starPoints;
    const earned = Math.max(1, Math.round(base * (v.applyPlanetMultiplier ? currentPlanet.miningMultiplier : 1)));
    gameAct({ type: 'activity', stardust: earned });
    return earned;
  };

  const destroyVoyageAsteroid = (pointsOverride?: number) => {
    sounds.playExplosion();
    sounds.triggerHaptic('heavy');
    const v = adminSettings.voyageSettings;
    const base = pointsOverride !== undefined ? pointsOverride : v.asteroidPoints;
    const earned = Math.max(1, Math.round(base * (v.applyPlanetMultiplier ? currentPlanet.miningMultiplier : 1)));
    gameAct({ type: 'activity', stardust: earned });
    return earned;
  };

  const takeAsteroidHit = (decayAmount?: number, _pointPenalty?: number) => {
    sounds.playLaser();
    sounds.triggerHaptic('warning');
    const v = adminSettings.voyageSettings;
    const decay = decayAmount !== undefined ? decayAmount : v.asteroidHullDecayPercent;
    if (decay > 0) gameAct({ type: 'hit', pct: decay });
  };

  return (
    <GameContext.Provider
      value={{
        ready,
        error,
        isAdmin,
        user,
        planets,
        packages,
        userMiners,
        transactions,
        marketItems,
        adminSettings,
        serverMeta,
        activeTab,
        setActiveTab,
        isAdminMode,
        setIsAdminMode,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isRepairModalOpen,
        setIsRepairModalOpen,
        selectedMinerForRepair,
        setSelectedMinerForRepair,
        randomEvent,
        claimRandomEvent,
        dismissAnnouncement,
        gameAct,
        refreshServer,
        applyPurchasedStardust,
        buyPackage,
        claimSingleMiner,
        claimAllMiners,
        repairMiner,
        unlockPlanet,
        travelToPlanet,
        spinWheel,
        openMysteryBox,
        buyMarketItem,
        exchangeStardust,
        adminState,
        adminRefresh,
        adminUpdateSettings,
        adminUpdateCatalog,
        adminUpdatePlayer,
        adminUpdateStock,
        currentPlanet,
        currentBattle,
        startBattle,
        attackEnemy,
        manualClickMine,
        collectVoyageStar,
        destroyVoyageAsteroid,
        takeAsteroidHit,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
