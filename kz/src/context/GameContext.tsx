import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
} from '../types';
import {
  INITIAL_PLANETS,
  INITIAL_PACKAGES,
  INITIAL_MARKET_ITEMS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_USER,
  MOCK_ALL_USERS,
  WHEEL_PRIZES,
  MYSTERY_BOXES,
} from '../data/initialData';
import { sounds } from '../utils/audio';

export interface ServerMeta { up: number; drill: number; upCost: number; drillCost: number; canDaily: boolean; streak: number }

interface GameContextType {
  gameAct: (a: Record<string, unknown>) => Promise<string | null>;
  serverMeta: ServerMeta | null;
  user: User;
  users: User[];
  planets: Planet[];
  packages: MiningPackage[];
  userMiners: UserMiner[];
  transactions: Transaction[];
  marketItems: MarketItem[];
  adminSettings: AdminSystemStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  // Modals
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (val: boolean) => void;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (val: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (val: boolean) => void;
  isRepairModalOpen: boolean;
  setIsRepairModalOpen: (val: boolean) => void;
  selectedMinerForRepair: UserMiner | null;
  setSelectedMinerForRepair: (miner: UserMiner | null) => void;
  // Active Random Encounter
  randomEvent: { id: string; title: string; rewardStardust: number; rewardUsdt: number; expiresAt: number } | null;
  claimRandomEvent: () => void;
  // Actions
  connectWallet: (type: 'ton' | 'metamask' | 'phantom') => void;
  disconnectWallet: () => void;
  applyPurchasedStardust: (amount: number) => void;
  deposit: (amount: number, currency: 'KRD' | 'TON') => void;
  requestWithdrawal: (amount: number, address: string, currency: 'KRD' | 'TON') => { success: boolean; message: string };
  buyPackage: (pkg: MiningPackage) => { success: boolean; message: string };
  claimSingleMiner: (instanceId: string) => void;
  claimAllMiners: () => { totalClaimed: number };
  repairMiner: (instanceId: string, useCurrency: 'KRD' | 'STARDUST') => { success: boolean; message: string };
  unlockPlanet: (planetId: number) => { success: boolean; message: string };
  travelToPlanet: (planetId: number) => void;
  spinWheel: () => Promise<WheelPrize>;
  openMysteryBox: (boxId: string) => Promise<{ prizeName: string; usdtAmount: number; stardustAmount: number }>;
  buyMarketItem: (itemId: string) => { success: boolean; message: string };
  // Admin actions
  adminApproveWithdrawal: (txId: string) => void;
  adminRejectWithdrawal: (txId: string) => void;
  adminToggleBanUser: (userId: string) => void;
  adminAdjustBalance: (userId: string, usdtDelta: number, stardustDelta: number) => void;
  adminCreatePackage: (newPkg: Omit<MiningPackage, 'id' | 'totalPurchased'>) => void;
  adminUpdatePackage: (pkg: MiningPackage) => void;
  adminDeletePackage: (pkgId: string) => void;
  adminUpdateSettings: (settings: Partial<AdminSystemStats>) => void;
  resetToDefaults: () => void;
  dismissAnnouncement: () => void;
  // Current Planet Info
  currentPlanet: Planet;
  // Space Battle & Visual Interactive Command
  currentBattle: SpaceBattle | null;
  startBattle: () => void;
  attackEnemy: (damage?: number) => { defeated: boolean; loot?: { usdt: number; stardust: number } };
  manualClickMine: () => { usdtEarned: number; stardustEarned: number };
  collectVoyageStar: (pointsOverride?: number) => number;
  destroyVoyageAsteroid: (pointsOverride?: number) => number;
  takeAsteroidHit: (decayAmount?: number, pointPenalty?: number) => void;
}

const STORAGE_KEYS = {
  USER: 'cosmic_user_v2',
  USERS: 'cosmic_users_list_v2',
  PACKAGES: 'cosmic_packages_v2',
  MINERS: 'cosmic_miners_v2',
  TRANSACTIONS: 'cosmic_txs_v2',
  MARKET: 'cosmic_market_v2',
  SETTINGS: 'cosmic_admin_settings_v2',
  PLANETS: 'cosmic_planets_v2',
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Safe load helper
  const loadLocal = <T,>(key: string, defaultVal: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  // State
  const [user, setUser] = useState<User>(() => loadLocal(STORAGE_KEYS.USER, INITIAL_USER));
  const [users, setUsers] = useState<User[]>(() => loadLocal(STORAGE_KEYS.USERS, MOCK_ALL_USERS));
  const [planets, setPlanets] = useState<Planet[]>(() => loadLocal(STORAGE_KEYS.PLANETS, INITIAL_PLANETS));
  const [packages, setPackages] = useState<MiningPackage[]>(() => loadLocal(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES));
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadLocal(STORAGE_KEYS.TRANSACTIONS, [
      {
        id: 'tx_init_1',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.telegramUsername,
        type: 'deposit',
        amount: 150,
        currency: 'KRD',
        status: 'completed',
        txHash: '0x9fa4...38c1',
        timestamp: Date.now() - 86400000 * 2,
        note: 'TON Ağı KRD Yatırımı',
      },
      {
        id: 'tx_init_2',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.telegramUsername,
        type: 'package_buy',
        amount: 25,
        currency: 'KRD',
        status: 'completed',
        timestamp: Date.now() - 86400000 * 2,
        note: 'Luna Scout Keşif Dronu Satın Alımı',
      },
      {
        id: 'tx_init_3',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.telegramUsername,
        type: 'withdraw',
        amount: 35,
        currency: 'KRD',
        status: 'completed',
        address: 'EQBvW_Z2tg958L0pL_y309Ksmz45nLQzB89M0qPrwXyt981T',
        timestamp: Date.now() - 86400000,
        note: 'Hızlı Otomatik Çekim Talebi',
      },
      {
        id: 'tx_init_4',
        userId: 'usr_cm_1001',
        userName: 'CryptoWhale_007',
        type: 'withdraw',
        amount: 250,
        currency: 'KRD',
        status: 'pending',
        address: 'EQC91vGkmZ940zLQpmc812kO94mzLK92104vB902',
        timestamp: Date.now() - 3600000 * 2,
        note: 'VIP Madenci Çekim Talebi (Beklemede)',
      },
    ]);
  });

  const [userMiners, setUserMiners] = useState<UserMiner[]>(() => {
    return loadLocal(STORAGE_KEYS.MINERS, [
      {
        instanceId: 'miner_inst_1',
        packageId: 'pkg-scout-drone',
        packageName: 'Luna Scout Keşif Dronu',
        tier: 'bronze',
        price: 25,
        dailyYield: 0.14,
        durability: 96,
        planetId: 1,
        purchaseDate: Date.now() - 86400000 * 2,
        lastClaimedAt: Date.now() - 3600000 * 4,
        unclaimedYield: 0.023,
        totalEarned: 0.28,
        isRunning: true,
        iconName: 'Bot',
      },
    ]);
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() =>
    loadLocal(STORAGE_KEYS.MARKET, INITIAL_MARKET_ITEMS)
  );

  const [adminSettings, setAdminSettings] = useState<AdminSystemStats>(() => {
    const loaded = loadLocal<AdminSystemStats>(STORAGE_KEYS.SETTINGS, INITIAL_ADMIN_SETTINGS);
    return {
      ...INITIAL_ADMIN_SETTINGS,
      ...loaded,
      voyageSettings: {
        ...INITIAL_ADMIN_SETTINGS.voyageSettings,
        ...(loaded?.voyageSettings || {}),
      },
    };
  });

  const [activeTab, setActiveTab] = useState<string>('mining');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedMinerForRepair, setSelectedMinerForRepair] = useState<UserMiner | null>(null);

  // Random Encounter (e.g. Passing meteor)
  const [randomEvent, setRandomEvent] = useState<{
    id: string;
    title: string;
    rewardStardust: number;
    rewardUsdt: number;
    expiresAt: number;
  } | null>(null);

  // Active Space Battle
  const [currentBattle, setCurrentBattle] = useState<SpaceBattle | null>(null);

  // Current planet
  const currentPlanet = planets.find((p) => p.id === user.currentPlanetId) || planets[0];

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MINERS, JSON.stringify(userMiners));
  }, [userMiners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKET, JSON.stringify(marketItems));
  }, [marketItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANETS, JSON.stringify(planets));
  }, [planets]);

  // Real-time Mining Accumulator Ticker (Runs every 2.5 seconds)
  useEffect(() => {
    if (adminSettings.maintenanceMode) return;

    const interval = setInterval(() => {
      setUserMiners((prevMiners) => {
        if (!prevMiners.length) return prevMiners;

        return prevMiners.map((m) => {
          if (!m.isRunning || m.durability <= 0) return m;

          // Planet multiplier
          const planet = planets.find((p) => p.id === m.planetId);
          const mult = planet ? planet.miningMultiplier : 1.0;

          // Efficiency scales with durability: 100% durability = 100% speed, 50% = 75%, 20% = 30%
          const durabilityFactor = Math.max(0.1, m.durability / 100);

          // 2.5 seconds out of 86400 seconds in a day
          const secondFraction = 2.5 / 86400;
          const addedYield = m.dailyYield * mult * durabilityFactor * secondFraction;

          // Tiny durability wear (decays over days)
          // 1.5% per day -> 1.5 / 86400 * 2.5 = 0.0000434% per tick
          const decay = (1.5 / 86400) * 2.5;
          const newDurability = Math.max(0, m.durability - decay);

          return {
            ...m,
            unclaimedYield: m.unclaimedYield + addedYield,
            durability: newDurability,
          };
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [adminSettings.maintenanceMode, planets]);

  // Random Space Event Trigger (Meteor / Solar Flare)
  useEffect(() => {
    const eventTimer = setInterval(() => {
      // 30% chance every 45 seconds if no active event
      if (!randomEvent && Math.random() < 0.4) {
        const events = [
          { title: '☄️ Parlayan Titanyum Meteoru Geçiyor!', stardust: 60, usdt: 0.15 },
          { title: '✨ Güneş Patlaması Enerji Sızıntısı!', stardust: 120, usdt: 0.30 },
          { title: '🛸 Terk Edilmiş Keşif Kapsülü Sinyali!', stardust: 200, usdt: 0.50 },
        ];
        const pick = events[Math.floor(Math.random() * events.length)];
        setRandomEvent({
          id: 'evt_' + Date.now(),
          title: pick.title,
          rewardStardust: pick.stardust,
          rewardUsdt: pick.usdt,
          expiresAt: Date.now() + 20000, // 20 seconds to click
        });
        sounds.playLaser();
      }
    }, 45000);

    return () => clearInterval(eventTimer);
  }, [randomEvent]);

  // Auto expire event
  useEffect(() => {
    if (!randomEvent) return;
    const timer = setTimeout(() => {
      setRandomEvent(null);
    }, 20000);
    return () => clearTimeout(timer);
  }, [randomEvent]);

  // Battle countdown ticker
  useEffect(() => {
    if (!currentBattle || currentBattle.isDefeated) return;
    const bTimer = setInterval(() => {
      setCurrentBattle((prev) => {
        if (!prev) return null;
        if (prev.timeRemainingSeconds <= 1) {
          return null; // Battle timed out
        }
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(bTimer);
  }, [currentBattle]);

  // Actions
  const startBattle = () => {
    if (currentBattle && !currentBattle.isDefeated) return;
    sounds.playLaser();
    sounds.triggerHaptic('heavy');
    const enemies = [
      { name: 'Kızıl Korsan Kruvazörü', type: 'pirate_frigate' as const, hp: 60, usdt: 0.75, dust: 120, avatar: '👾' },
      { name: 'Gölge Antimadde Akıncısı', type: 'void_reaper' as const, hp: 100, usdt: 1.50, dust: 220, avatar: '🛸' },
      { name: 'Siber Nebula Haydutu', type: 'plasma_corsair' as const, hp: 150, usdt: 2.25, dust: 350, avatar: '👹' },
    ];
    const picked = enemies[Math.floor(Math.random() * enemies.length)];
    setCurrentBattle({
      id: 'bat_' + Date.now(),
      enemyName: picked.name,
      enemyType: picked.type,
      maxHp: picked.hp,
      currentHp: picked.hp,
      usdtBounty: picked.usdt,
      stardustBounty: picked.dust,
      timeRemainingSeconds: 30,
      isDefeated: false,
      avatar: picked.avatar,
    });
  };

  const attackEnemy = (damage: number = 20) => {
    if (!currentBattle || currentBattle.isDefeated) return { defeated: false };
    sounds.playLaser();
    sounds.triggerHaptic('medium');

    // Extra damage boost from active fleet
    const fleetBonus = userMiners.filter(m => m.isRunning && m.durability > 0).length * 4;
    const totalDmg = damage + fleetBonus;

    const nextHp = Math.max(0, currentBattle.currentHp - totalDmg);
    if (nextHp <= 0) {
      // Enemy defeated!
      sounds.playWin();
      sounds.triggerHaptic('success');
      const vSettings = adminSettings.voyageSettings || INITIAL_ADMIN_SETTINGS.voyageSettings;
      const bountyPoints = vSettings.pirateBountyPoints || 500;

      setUser((prev) => ({
        ...prev,
        stardustBalance: prev.stardustBalance + bountyPoints,
        exp: prev.exp + 35,
      }));

      const newTx: Transaction = {
        id: 'tx_battle_' + Date.now(),
        userId: user.id,
        userName: user.telegramUsername,
        type: 'spin_win',
        amount: bountyPoints,
        currency: 'STARDUST',
        status: 'completed',
        timestamp: Date.now(),
        note: `⚔️ ${currentBattle.enemyName} Yok Edildi (Ödül: +${bountyPoints} PUAN ⭐)`,
      };
      setTransactions((prev) => [newTx, ...prev]);

      setCurrentBattle((prev) => (prev ? { ...prev, currentHp: 0, isDefeated: true } : null));
      setTimeout(() => setCurrentBattle(null), 2500);

      return { defeated: true, loot: { usdt: 0, stardust: bountyPoints } };
    } else {
      setCurrentBattle((prev) => (prev ? { ...prev, currentHp: nextHp } : null));
      return { defeated: false };
    }
  };

  const manualClickMine = () => {
    sounds.playClick();
    sounds.triggerHaptic('light');

    // Calculate small instant mining gain
    const usdtEarned = Number((0.005 * currentPlanet.miningMultiplier).toFixed(4));
    const stardustEarned = Math.floor(1 + Math.random() * 2);

    setUser((prev) => {
      const newEnergy = Math.max(0, prev.energy - 1);
      return {
        ...prev,
        usdtBalance: Number((prev.usdtBalance + usdtEarned).toFixed(4)),
        stardustBalance: prev.stardustBalance + stardustEarned,
        totalMined: Number((prev.totalMined + usdtEarned).toFixed(4)),
        energy: newEnergy,
        exp: prev.exp + 1,
      };
    });

    return { usdtEarned, stardustEarned };
  };

  const collectVoyageStar = (pointsOverride?: number) => {
    sounds.playCollectStar();
    sounds.triggerHaptic('success');
    const vSettings = adminSettings.voyageSettings || INITIAL_ADMIN_SETTINGS.voyageSettings;
    const basePts = pointsOverride !== undefined ? pointsOverride : vSettings.starPoints;
    const multiplier = vSettings.applyPlanetMultiplier ? currentPlanet.miningMultiplier : 1;
    const earnedPoints = Math.max(1, Math.round(basePts * multiplier));

    setUser((prev) => ({
      ...prev,
      stardustBalance: prev.stardustBalance + earnedPoints,
      exp: prev.exp + 5,
    }));
    return earnedPoints;
  };

  const destroyVoyageAsteroid = (pointsOverride?: number) => {
    sounds.playExplosion();
    sounds.triggerHaptic('heavy');
    const vSettings = adminSettings.voyageSettings || INITIAL_ADMIN_SETTINGS.voyageSettings;
    const basePts = pointsOverride !== undefined ? pointsOverride : vSettings.asteroidPoints;
    const multiplier = vSettings.applyPlanetMultiplier ? currentPlanet.miningMultiplier : 1;
    const earnedPoints = Math.max(1, Math.round(basePts * multiplier));

    setUser((prev) => ({
      ...prev,
      stardustBalance: prev.stardustBalance + earnedPoints,
      exp: prev.exp + 8,
    }));
    return earnedPoints;
  };

  const takeAsteroidHit = (decayAmount?: number, pointPenalty?: number) => {
    sounds.playLaser();
    sounds.triggerHaptic('warning');
    const vSettings = adminSettings.voyageSettings || INITIAL_ADMIN_SETTINGS.voyageSettings;
    const actualDecay = decayAmount !== undefined ? decayAmount : vSettings.asteroidHullDecayPercent;
    const actualPenalty = pointPenalty !== undefined ? pointPenalty : (vSettings.asteroidPointPenalty || 0);

    // Apply miner durability decay
    if (actualDecay > 0) {
      setUserMiners((prev) => {
        if (prev.length === 0) return prev;
        const idx = prev.findIndex((m) => m.durability > 0);
        if (idx === -1) return prev;
        return prev.map((m, i) =>
          i === idx ? { ...m, durability: Math.max(0, m.durability - actualDecay) } : m
        );
      });
    }

    // Apply point penalty if configured
    if (actualPenalty > 0) {
      setUser((prev) => ({
        ...prev,
        stardustBalance: Math.max(0, prev.stardustBalance - actualPenalty),
      }));
    }
  };

  const claimRandomEvent = () => {
    if (!randomEvent) return;
    sounds.playWin();
    sounds.triggerHaptic('success');
    setUser((prev) => ({
      ...prev,
      stardustBalance: prev.stardustBalance + randomEvent.rewardStardust,
      usdtBalance: Number((prev.usdtBalance + randomEvent.rewardUsdt).toFixed(4)),
      exp: prev.exp + 15,
    }));
    setRandomEvent(null);
  };

  const connectWallet = (type: 'ton' | 'metamask' | 'phantom') => {
    sounds.playUpgrade();
    sounds.triggerHaptic('medium');
    let prefix = 'EQB';
    if (type === 'metamask') prefix = '0x';
    if (type === 'phantom') prefix = 'SoL';
    const mockAddr = `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setUser((prev) => ({
      ...prev,
      isConnected: true,
      walletType: type,
      walletAddress: mockAddr,
    }));
    setIsWalletModalOpen(false);
  };

  const disconnectWallet = () => {
    sounds.playClick();
    setUser((prev) => ({
      ...prev,
      isConnected: false,
      walletType: null,
      walletAddress: '',
    }));
  };

  const applyPurchasedStardust = (amount: number) => {
    if (!(amount > 0)) return;
    sounds.playCoin();
    refreshServer(); // bakiye sunucudan gelir
  };

  const deposit = (amount: number, currency: 'KRD' | 'TON') => {
    sounds.playCoin();
    sounds.triggerHaptic('success');
    const usdtAmount = currency === 'TON' ? amount * 5.2 : amount; // 1 TON ≈ 5.2 KRD

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance + usdtAmount).toFixed(2)),
      totalDeposited: Number((prev.totalDeposited + usdtAmount).toFixed(2)),
      exp: prev.exp + Math.floor(usdtAmount * 2),
    }));

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'deposit',
      amount: usdtAmount,
      currency: 'KRD',
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substring(2, 12),
      timestamp: Date.now(),
      note: `${amount} ${currency} Yatırım Başarıyla Onaylandı`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsDepositModalOpen(false);
  };

  const requestWithdrawal = (amount: number, address: string, currency: 'KRD' | 'TON') => {
    return { success: false, message: 'Oyun içi bakiyeler nakde çevrilemez. Para çekme özelliği yoktur.' };
  };
  const _legacyRequestWithdrawal = (amount: number, address: string, currency: 'KRD' | 'TON') => {
    if (user.isBanned) {
      sounds.triggerHaptic('warning');
      return { success: false, message: 'Hesabınız askıya alınmıştır. Destek ile iletişime geçin.' };
    }
    if (amount < adminSettings.minWithdrawal) {
      sounds.triggerHaptic('warning');
      return { success: false, message: `Minimum çekim tutarı $${adminSettings.minWithdrawal} KRD'dir.` };
    }
    if (user.usdtBalance < amount) {
      sounds.triggerHaptic('warning');
      return { success: false, message: 'Yetersiz KRD bakiyesi.' };
    }

    const fee = (amount * adminSettings.withdrawalFeePercent) / 100;
    const finalAmount = amount - fee;
    const isAutoApprove = amount <= adminSettings.autoApproveWithdrawalsUnder;

    sounds.playCoin();
    sounds.triggerHaptic('medium');

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance - amount).toFixed(2)),
      totalWithdrawn: isAutoApprove ? Number((prev.totalWithdrawn + amount).toFixed(2)) : prev.totalWithdrawn,
    }));

    const newTx: Transaction = {
      id: 'tx_w_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'withdraw',
      amount: finalAmount,
      currency: 'KRD',
      status: isAutoApprove ? 'completed' : 'pending',
      address,
      timestamp: Date.now(),
      note: isAutoApprove
        ? `Otomatik Onaylı Çekim ($${fee.toFixed(2)} Fee Kesildi)`
        : `Yönetici Onayı Bekleniyor ($${fee.toFixed(2)} Fee Kesildi)`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsWithdrawModalOpen(false);

    return {
      success: true,
      message: isAutoApprove
        ? `Çekim işleminiz anında cüzdanınıza transfer edildi! Net: $${finalAmount.toFixed(2)} KRD`
        : `Çekim talebiniz (${finalAmount.toFixed(2)} KRD) yönetici onay kuyruğuna alındı.`,
    };
  };

  // ===== SUNUCU-OTORİTER OYUN MOTORU (server/economy.js) =====
  const userRef = useRef(user); userRef.current = user;
  const baseKrdRef = useRef(0);
  const baseStRef = useRef(0);
  const lastResultRef = useRef<any>(null);
  const [serverMeta, setServerMeta] = useState<ServerMeta | null>(null);

  const applyServer = (r: any) => {
    baseKrdRef.current = r.krd; baseStRef.current = r.stardust; lastResultRef.current = r.last;
    setMarketItems((prev) => prev.map((i) => ({ ...i, stock: r.stock?.[i.id] ?? i.stock })));
    setUser((prev) => ({ ...prev, stardustBalance: Math.floor(r.stardust), spinsAvailable: r.spins ?? prev.spinsAvailable, usdtBalance: Number(r.krd.toFixed(4)), currentPlanetId: r.planet + 1, unlockedPlanetIds: r.unlocked.map((i: number) => i + 1) }));
    setPackages((prev) => prev.map((pk) => ({ ...pk, price: r.prices[pk.id] ?? pk.price })));
    const mult = (1 + 0.05 * (r.up || 0)) * (1 + 0.04 * (r.drill || 0));
    setUserMiners(r.miners.map((m: any) => ({
      instanceId: String(m.id), packageId: m.pkgId || m.tier, packageName: r.meta.catalog[m.pkgId]?.name || m.tier, tier: m.tier,
      price: m.price, dailyYield: m.price * m.daily * mult * (m.mult ?? 1), durability: m.dur, planetId: m.planetId || 1,
      purchaseDate: m.born, lastClaimedAt: m.last, unclaimedYield: m.pending, totalEarned: 0, isRunning: m.running,
      iconName: r.meta.catalog[m.pkgId]?.iconName || 'Bot',
    })));
    setServerMeta({ up: r.up || 0, drill: r.drill || 0, upCost: r.upCost, drillCost: r.drillCost, canDaily: r.canDaily, streak: r.streak });
  };
  const gameAct = async (a: Record<string, unknown>): Promise<string | null> => {
    try { const r: any = await api('game/act', a); applyServer(r); return r.error; } catch { return 'Sunucuya ulaşılamadı'; }
  };
  const refreshServer = async () => {
    try {
      const gain = userRef.current.usdtBalance - baseKrdRef.current; // yerel aktivite kazancı (olay/savaş)
      const stGain = userRef.current.stardustBalance - baseStRef.current;
      if (gain > 0.001 || stGain > 0) await api('game/act', { type: 'activity', amount: Math.max(0, gain), stardust: Math.max(0, stGain) });
      applyServer(await api('game'));
    } catch { /* çevrimdışı: yerel durumla devam */ }
  };
  useEffect(() => { refreshServer(); const t = setInterval(refreshServer, 15000); return () => clearInterval(t); }, []);

  const buyPackage = (pkg: MiningPackage) => {
    if (user.isBanned) return { success: false, message: 'Hesabınız askıya alınmıştır.' };
    if (!user.unlockedPlanetIds.includes(pkg.planetId)) return { success: false, message: 'Bu ekipman için önce gezegeni açmalısın.' };
    if (user.usdtBalance < pkg.price) { sounds.triggerHaptic('warning'); return { success: false, message: 'Yetersiz KRD bakiyesi.' }; }
    sounds.playUpgrade(); sounds.triggerHaptic('heavy');
    setUser((prev) => ({ ...prev, exp: prev.exp + Math.floor(pkg.price * 1.5) }));
    gameAct({ type: 'buy', pkgId: pkg.id });
    return { success: true, message: `${pkg.name} filoya ekleniyor…` };
  };

  const claimSingleMiner = (instanceId: string) => {
    const m = userMiners.find((x) => x.instanceId === instanceId);
    if (!m || m.unclaimedYield <= 0.001) return;
    sounds.playCoin(); sounds.triggerHaptic('light');
    gameAct({ type: 'claim', id: Number(instanceId) });
  };

  const claimAllMiners = () => {
    const total = userMiners.reduce((s, m) => s + m.unclaimedYield, 0);
    if (total > 0.001) { sounds.playCoin(); gameAct({ type: 'claim' }); }
    return { totalClaimed: total };
  };

  const repairMiner = (instanceId: string, useCurrency: 'KRD' | 'STARDUST') => {
    if (useCurrency === 'STARDUST') return { success: false, message: 'Tamir şimdilik yalnızca KRD ile yapılır.' };
    const m = userMiners.find((x) => x.instanceId === instanceId);
    if (!m) return { success: false, message: 'Ekipman bulunamadı.' };
    const cost = m.price * 0.0037 * (100 - m.durability);
    if (user.usdtBalance < cost) return { success: false, message: 'Yetersiz KRD.' };
    sounds.playUpgrade(); gameAct({ type: 'repair', id: Number(instanceId) });
    return { success: true, message: 'Tamir ediliyor…' };
  };

  const unlockPlanet = (planetId: number) => {
    const pl = planets.find((p) => p.id === planetId);
    if (!pl || user.unlockedPlanetIds.includes(planetId)) return { success: false, message: 'Geçersiz gezegen.' };
    if (user.level < pl.requiredLevel) return { success: false, message: `Seviye ${pl.requiredLevel} gerekli.` };
    if (user.usdtBalance < pl.unlockCostKRD) return { success: false, message: 'Yetersiz KRD.' };
    sounds.playUpgrade(); gameAct({ type: 'unlock', planet: planetId - 1 });
    return { success: true, message: `${pl.name} açılıyor…` };
  };

  const travelToPlanet = (planetId: number) => {
    if (!user.unlockedPlanetIds.includes(planetId)) return;
    sounds.playLaser(); sounds.triggerHaptic('light');
    setUser((prev) => ({ ...prev, currentPlanetId: planetId }));
    gameAct({ type: 'travel', planet: planetId - 1 });
  };

  const spinWheel = async (): Promise<WheelPrize> => {
    const err = await gameAct({ type: 'spin' });
    if (err) throw new Error(err);
    const prize = WHEEL_PRIZES.find((w) => w.id === lastResultRef.current?.prizeId) || WHEEL_PRIZES[0];
    return prize;
  };

  const openMysteryBox = async (boxId: string) => {
    sounds.playUpgrade(); sounds.triggerHaptic('heavy');
    const err = await gameAct({ type: 'box', id: boxId });
    if (err) throw new Error(err);
    const r = lastResultRef.current;
    setUser((prev) => ({ ...prev, exp: prev.exp + 50 }));
    const prizeName = `${r.krd} KRD + ${r.st} Yıldız Tozu${r.spins ? ` + ${r.spins} Çevirme` : ''}`;
    return { prizeName, usdtAmount: r.krd as number, stardustAmount: r.st as number };
  };

  const buyMarketItem = (itemId: string) => {
    const item = marketItems.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Ürün bulunamadı.' };
    if (item.stock <= 0) return { success: false, message: 'Bu ürünün stoğu tükendi.' };
    if (user.usdtBalance < item.price) return { success: false, message: 'Yetersiz KRD!' };
    sounds.playUpgrade(); sounds.triggerHaptic('medium');
    gameAct({ type: 'market', id: itemId });
    return { success: true, message: `"${item.title}" satın alınıyor…` };
  };

  // Admin Actions
  const adminApproveWithdrawal = (txId: string) => {
    sounds.playCoin();
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, status: 'completed', note: tx.note + ' (Yönetici Onayladı)' } : tx))
    );
  };

  const adminRejectWithdrawal = (txId: string) => {
    sounds.playLaser();
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    // Refund user
    if (tx.userId === user.id) {
      setUser((prev) => ({ ...prev, usdtBalance: Number((prev.usdtBalance + tx.amount).toFixed(2)) }));
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === tx.userId ? { ...u, usdtBalance: Number((u.usdtBalance + tx.amount).toFixed(2)) } : u))
      );
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'rejected', note: t.note + ' (Yönetici Reddetti - İade Edildi)' } : t))
    );
  };

  const adminToggleBanUser = (userId: string) => {
    sounds.playRepair();
    if (userId === user.id) {
      setUser((prev) => ({ ...prev, isBanned: !prev.isBanned }));
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const adminAdjustBalance = (userId: string, usdtDelta: number, stardustDelta: number) => {
    sounds.playUpgrade();
    if (userId === user.id) {
      setUser((prev) => ({
        ...prev,
        usdtBalance: Math.max(0, Number((prev.usdtBalance + usdtDelta).toFixed(2))),
        stardustBalance: Math.max(0, prev.stardustBalance + stardustDelta),
      }));
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              usdtBalance: Math.max(0, Number((u.usdtBalance + usdtDelta).toFixed(2))),
              stardustBalance: Math.max(0, u.stardustBalance + stardustDelta),
            }
          : u
      )
    );

    const newTx: Transaction = {
      id: 'tx_adj_' + Date.now(),
      userId,
      userName: userId === user.id ? user.telegramUsername : 'Kullanıcı',
      type: 'admin_adjustment',
      amount: Math.abs(usdtDelta),
      currency: 'KRD',
      status: 'completed',
      timestamp: Date.now(),
      note: `Yönetici Bakiye Düzenlemesi: ${usdtDelta >= 0 ? '+' : ''}${usdtDelta} KRD / ${stardustDelta >= 0 ? '+' : ''}${stardustDelta} Toz`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const adminCreatePackage = (newPkg: Omit<MiningPackage, 'id' | 'totalPurchased'>) => {
    sounds.playUpgrade();
    const pkg: MiningPackage = {
      ...newPkg,
      id: 'pkg-custom-' + Date.now(),
      totalPurchased: 0,
    };
    setPackages((prev) => [...prev, pkg]);
  };

  const adminUpdatePackage = (pkg: MiningPackage) => {
    sounds.playUpgrade();
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
  };

  const adminDeletePackage = (pkgId: string) => {
    sounds.playLaser();
    setPackages((prev) => prev.filter((p) => p.id !== pkgId));
  };

  const adminUpdateSettings = (settings: Partial<AdminSystemStats>) => {
    sounds.playUpgrade();
    setAdminSettings((prev) => ({ ...prev, ...settings }));
  };

  const dismissAnnouncement = () => {
    setAdminSettings((prev) => ({ ...prev, showAnnouncement: false }));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setUsers(MOCK_ALL_USERS);
    setPlanets(INITIAL_PLANETS);
    setPackages(INITIAL_PACKAGES);
    setUserMiners([]);
    setTransactions([]);
    setMarketItems(INITIAL_MARKET_ITEMS);
    setAdminSettings(INITIAL_ADMIN_SETTINGS);
    sounds.playUpgrade();
  };

  return (
    <GameContext.Provider
      value={{
        applyPurchasedStardust,
        gameAct,
        serverMeta,
        user,
        users,
        planets,
        packages,
        userMiners,
        transactions,
        marketItems,
        adminSettings,
        activeTab,
        setActiveTab,
        isAdminMode,
        setIsAdminMode,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isRepairModalOpen,
        setIsRepairModalOpen,
        selectedMinerForRepair,
        setSelectedMinerForRepair,
        randomEvent,
        claimRandomEvent,
        connectWallet,
        disconnectWallet,
        deposit,
        requestWithdrawal,
        buyPackage,
        claimSingleMiner,
        claimAllMiners,
        repairMiner,
        unlockPlanet,
        travelToPlanet,
        spinWheel,
        openMysteryBox,
        buyMarketItem,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminToggleBanUser,
        adminAdjustBalance,
        adminCreatePackage,
        adminUpdatePackage,
        adminDeletePackage,
        adminUpdateSettings,
        resetToDefaults,
        dismissAnnouncement,
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
