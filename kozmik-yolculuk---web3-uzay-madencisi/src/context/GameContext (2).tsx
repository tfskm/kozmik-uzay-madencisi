import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface GameContextType {
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
  deposit: (amount: number, currency: 'USDT' | 'TON') => void;
  requestWithdrawal: (amount: number, address: string, currency: 'USDT' | 'TON') => { success: boolean; message: string };
  buyPackage: (pkg: MiningPackage) => { success: boolean; message: string };
  claimSingleMiner: (instanceId: string) => void;
  claimAllMiners: () => { totalClaimed: number };
  repairMiner: (instanceId: string, useCurrency: 'USDT' | 'STARDUST') => { success: boolean; message: string };
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
        currency: 'USDT',
        status: 'completed',
        txHash: '0x9fa4...38c1',
        timestamp: Date.now() - 86400000 * 2,
        note: 'TON Ağı USDT Yatırımı',
      },
      {
        id: 'tx_init_2',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.telegramUsername,
        type: 'package_buy',
        amount: 25,
        currency: 'USDT',
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
        currency: 'USDT',
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
        currency: 'USDT',
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

  const deposit = (amount: number, currency: 'USDT' | 'TON') => {
    sounds.playCoin();
    sounds.triggerHaptic('success');
    const usdtAmount = currency === 'TON' ? amount * 5.2 : amount; // 1 TON ≈ 5.2 USDT

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
      currency: 'USDT',
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substring(2, 12),
      timestamp: Date.now(),
      note: `${amount} ${currency} Yatırım Başarıyla Onaylandı`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsDepositModalOpen(false);
  };

  const requestWithdrawal = (amount: number, address: string, currency: 'USDT' | 'TON') => {
    if (user.isBanned) {
      sounds.triggerHaptic('warning');
      return { success: false, message: 'Hesabınız askıya alınmıştır. Destek ile iletişime geçin.' };
    }
    if (amount < adminSettings.minWithdrawal) {
      sounds.triggerHaptic('warning');
      return { success: false, message: `Minimum çekim tutarı $${adminSettings.minWithdrawal} USDT'dir.` };
    }
    if (user.usdtBalance < amount) {
      sounds.triggerHaptic('warning');
      return { success: false, message: 'Yetersiz USDT bakiyesi.' };
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
      currency: 'USDT',
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
        ? `Çekim işleminiz anında cüzdanınıza transfer edildi! Net: $${finalAmount.toFixed(2)} USDT`
        : `Çekim talebiniz (${finalAmount.toFixed(2)} USDT) yönetici onay kuyruğuna alındı.`,
    };
  };

  const buyPackage = (pkg: MiningPackage) => {
    if (user.isBanned) {
      sounds.triggerHaptic('warning');
      return { success: false, message: 'Hesabınız askıya alınmıştır.' };
    }
    if (user.usdtBalance < pkg.price) {
      sounds.triggerHaptic('warning');
      return { success: false, message: 'Yetersiz USDT bakiyesi! Lütfen cüzdanınızdan bakiye yükleyin.' };
    }

    sounds.playUpgrade();
    sounds.triggerHaptic('heavy');

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance - pkg.price).toFixed(2)),
      exp: prev.exp + Math.floor(pkg.price * 1.5),
    }));

    // Update package purchase count
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, totalPurchased: p.totalPurchased + 1 } : p))
    );

    const newMiner: UserMiner = {
      instanceId: 'miner_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      packageId: pkg.id,
      packageName: pkg.name,
      tier: pkg.tier,
      price: pkg.price,
      dailyYield: pkg.dailyProduction,
      durability: 100,
      planetId: pkg.planetId,
      purchaseDate: Date.now(),
      lastClaimedAt: Date.now(),
      unclaimedYield: 0,
      totalEarned: 0,
      isRunning: true,
      iconName: pkg.iconName,
    };

    setUserMiners((prev) => [newMiner, ...prev]);

    const newTx: Transaction = {
      id: 'tx_pkg_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'package_buy',
      amount: pkg.price,
      currency: 'USDT',
      status: 'completed',
      timestamp: Date.now(),
      note: `${pkg.name} Filoya Eklendi`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      message: `${pkg.name} madenciniz filoya katıldı! 24 saatlik kazanç: $${pkg.dailyProduction.toFixed(2)} USDT`,
    };
  };

  const claimSingleMiner = (instanceId: string) => {
    const miner = userMiners.find((m) => m.instanceId === instanceId);
    if (!miner || miner.unclaimedYield <= 0.001) return;

    sounds.playCoin();
    sounds.triggerHaptic('light');

    const yieldAmount = miner.unclaimedYield;

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance + yieldAmount).toFixed(4)),
      totalMined: Number((prev.totalMined + yieldAmount).toFixed(4)),
      stardustBalance: prev.stardustBalance + Math.ceil(yieldAmount * 5),
    }));

    setUserMiners((prev) =>
      prev.map((m) =>
        m.instanceId === instanceId
          ? {
              ...m,
              unclaimedYield: 0,
              totalEarned: m.totalEarned + yieldAmount,
              lastClaimedAt: Date.now(),
            }
          : m
      )
    );

    const newTx: Transaction = {
      id: 'tx_claim_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'mine_claim',
      amount: Number(yieldAmount.toFixed(4)),
      currency: 'USDT',
      status: 'completed',
      timestamp: Date.now(),
      note: `${miner.packageName} hasılatı toplandı`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const claimAllMiners = () => {
    const totalYield = userMiners.reduce((acc, m) => acc + m.unclaimedYield, 0);
    if (totalYield <= 0.001) return { totalClaimed: 0 };

    sounds.playCoin();
    sounds.triggerHaptic('medium');

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance + totalYield).toFixed(4)),
      totalMined: Number((prev.totalMined + totalYield).toFixed(4)),
      stardustBalance: prev.stardustBalance + Math.ceil(totalYield * 5),
      exp: prev.exp + 10,
    }));

    setUserMiners((prev) =>
      prev.map((m) => ({
        ...m,
        unclaimedYield: 0,
        totalEarned: m.totalEarned + m.unclaimedYield,
        lastClaimedAt: Date.now(),
      }))
    );

    const newTx: Transaction = {
      id: 'tx_claim_all_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'mine_claim',
      amount: Number(totalYield.toFixed(4)),
      currency: 'USDT',
      status: 'completed',
      timestamp: Date.now(),
      note: `Tüm Filo Hasılatı Toplandı ($${totalYield.toFixed(4)} USDT)`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { totalClaimed: totalYield };
  };

  const repairMiner = (instanceId: string, useCurrency: 'USDT' | 'STARDUST') => {
    const miner = userMiners.find((m) => m.instanceId === instanceId);
    if (!miner) return { success: false, message: 'Madenci bulunamadı.' };

    const missingPercent = Math.max(0, 100 - miner.durability);
    if (missingPercent <= 0) return { success: false, message: 'Bu madenci zaten %100 dayanıklılıkta!' };

    // Cost calculation: e.g. 20% wear costs 20 * 0.05 = 1 USDT OR 20 * 5 = 100 Stardust
    const costUSDT = Number((missingPercent * adminSettings.repairCostPerPercent).toFixed(2));
    const costStardust = Math.ceil(missingPercent * 8);

    if (useCurrency === 'USDT') {
      if (user.usdtBalance < costUSDT) {
        sounds.triggerHaptic('warning');
        return { success: false, message: `Yetersiz USDT bakiyesi! Gerekli: $${costUSDT} USDT` };
      }
      setUser((prev) => ({ ...prev, usdtBalance: Number((prev.usdtBalance - costUSDT).toFixed(2)) }));
    } else {
      if (user.stardustBalance < costStardust) {
        sounds.triggerHaptic('warning');
        return { success: false, message: `Yetersiz Yıldız Tozu! Gerekli: ${costStardust} Toz` };
      }
      setUser((prev) => ({ ...prev, stardustBalance: prev.stardustBalance - costStardust }));
    }

    sounds.playRepair();
    sounds.triggerHaptic('medium');

    setUserMiners((prev) =>
      prev.map((m) => (m.instanceId === instanceId ? { ...m, durability: 100 } : m))
    );

    const newTx: Transaction = {
      id: 'tx_rep_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'repair',
      amount: useCurrency === 'USDT' ? costUSDT : costStardust,
      currency: useCurrency,
      status: 'completed',
      timestamp: Date.now(),
      note: `${miner.packageName} %100 Yenilendi & Tamir Edildi`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsRepairModalOpen(false);
    setSelectedMinerForRepair(null);

    return {
      success: true,
      message: `${miner.packageName} başarıyla tamir edildi ve %100 verimle çalışmaya hazır!`,
    };
  };

  const unlockPlanet = (planetId: number) => {
    const planet = planets.find((p) => p.id === planetId);
    if (!planet) return { success: false, message: 'Gezegen bulunamadı.' };
    if (user.unlockedPlanetIds.includes(planetId)) return { success: true, message: 'Gezegen zaten açık.' };

    if (user.level < planet.requiredLevel) {
      sounds.triggerHaptic('warning');
      return { success: false, message: `Bu gezegen Seviye ${planet.requiredLevel} gerektirir!` };
    }

    if (user.usdtBalance < planet.unlockCostUSDT || user.stardustBalance < planet.unlockCostStardust) {
      sounds.triggerHaptic('warning');
      return {
        success: false,
        message: `Yetersiz bakiye! Gereken: $${planet.unlockCostUSDT} USDT & ${planet.unlockCostStardust} Yıldız Tozu`,
      };
    }

    sounds.playUpgrade();
    sounds.triggerHaptic('heavy');

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance - planet.unlockCostUSDT).toFixed(2)),
      stardustBalance: prev.stardustBalance - planet.unlockCostStardust,
      unlockedPlanetIds: [...prev.unlockedPlanetIds, planetId],
      currentPlanetId: planetId,
      exp: prev.exp + 100,
    }));

    return { success: true, message: `Tebrikler! ${planet.name} gezegeni keşfedildi ve üssünüz kuruldu!` };
  };

  const travelToPlanet = (planetId: number) => {
    if (!user.unlockedPlanetIds.includes(planetId)) return;
    sounds.playLaser();
    sounds.triggerHaptic('light');
    setUser((prev) => ({ ...prev, currentPlanetId: planetId }));
  };

  const spinWheel = async (): Promise<WheelPrize> => {
    if (user.spinsAvailable <= 0 && user.stardustBalance < adminSettings.luckyWheelCostStardust) {
      throw new Error('Yetersiz çevirme hakkı veya Yıldız Tozu!');
    }

    // Deduct
    if (user.spinsAvailable > 0) {
      setUser((prev) => ({ ...prev, spinsAvailable: prev.spinsAvailable - 1 }));
    } else {
      setUser((prev) => ({
        ...prev,
        stardustBalance: prev.stardustBalance - adminSettings.luckyWheelCostStardust,
      }));
    }

    // Select random prize based on weighted probability
    const rand = Math.random();
    let accumulated = 0;
    let chosenPrize = WHEEL_PRIZES[0];

    for (const prize of WHEEL_PRIZES) {
      accumulated += prize.probability;
      if (rand <= accumulated) {
        chosenPrize = prize;
        break;
      }
    }

    // Apply reward
    if (chosenPrize.rewardType === 'usdt') {
      setUser((prev) => ({ ...prev, usdtBalance: Number((prev.usdtBalance + chosenPrize.amount).toFixed(2)) }));
    } else if (chosenPrize.rewardType === 'stardust') {
      setUser((prev) => ({ ...prev, stardustBalance: prev.stardustBalance + chosenPrize.amount }));
    } else if (chosenPrize.rewardType === 'spin') {
      setUser((prev) => ({ ...prev, spinsAvailable: prev.spinsAvailable + chosenPrize.amount }));
    } else if (chosenPrize.rewardType === 'repair_kit') {
      // Repair lowest durability miner by 50%
      setUserMiners((prev) => {
        if (!prev.length) return prev;
        const sorted = [...prev].sort((a, b) => a.durability - b.durability);
        const targetId = sorted[0].instanceId;
        return prev.map((m) =>
          m.instanceId === targetId ? { ...m, durability: Math.min(100, m.durability + 50) } : m
        );
      });
    }

    const newTx: Transaction = {
      id: 'tx_spin_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'spin_win',
      amount: chosenPrize.amount,
      currency: chosenPrize.rewardType === 'usdt' ? 'USDT' : 'STARDUST',
      status: 'completed',
      timestamp: Date.now(),
      note: `Şans Çarkı Ödülü: ${chosenPrize.label}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return chosenPrize;
  };

  const openMysteryBox = async (boxId: string) => {
    const box = MYSTERY_BOXES.find((b) => b.id === boxId);
    if (!box) throw new Error('Sandık bulunamadı.');

    if (user.usdtBalance < box.price) {
      throw new Error(`Yetersiz USDT bakiyesi! Bu sandık $${box.price} USDT.`);
    }

    sounds.playUpgrade();
    sounds.triggerHaptic('heavy');

    // Deduct box cost
    setUser((prev) => ({ ...prev, usdtBalance: Number((prev.usdtBalance - box.price).toFixed(2)) }));

    let usdtReward = 0;
    let stardustReward = 0;
    let prizeName = '';

    if (box.tier === 'bronze') {
      usdtReward = Number((0.5 + Math.random() * 5).toFixed(2));
      stardustReward = Math.floor(100 + Math.random() * 300);
      prizeName = `$${usdtReward} USDT + ${stardustReward} Yıldız Tozu`;
    } else if (box.tier === 'silver') {
      usdtReward = Number((3 + Math.random() * 18).toFixed(2));
      stardustReward = Math.floor(400 + Math.random() * 1000);
      prizeName = `$${usdtReward} USDT + ${stardustReward} Yıldız Tozu`;
    } else if (box.tier === 'gold') {
      usdtReward = Number((15 + Math.random() * 70).toFixed(2));
      stardustReward = Math.floor(1500 + Math.random() * 3500);
      prizeName = `$${usdtReward} USDT + ${stardustReward} Yıldız Tozu + 1 Çevirme`;
      setUser((prev) => ({ ...prev, spinsAvailable: prev.spinsAvailable + 1 }));
    } else {
      // Cosmic box
      usdtReward = Number((50 + Math.random() * 350).toFixed(2));
      stardustReward = Math.floor(5000 + Math.random() * 10000);
      prizeName = `🏆 EFSANEVİ KOZMİK: $${usdtReward} USDT + ${stardustReward} Yıldız Tozu!`;
      setUser((prev) => ({ ...prev, spinsAvailable: prev.spinsAvailable + 3 }));
    }

    setUser((prev) => ({
      ...prev,
      usdtBalance: Number((prev.usdtBalance + usdtReward).toFixed(2)),
      stardustBalance: prev.stardustBalance + stardustReward,
      exp: prev.exp + 50,
    }));

    const newTx: Transaction = {
      id: 'tx_box_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'box_open',
      amount: usdtReward,
      currency: 'USDT',
      status: 'completed',
      timestamp: Date.now(),
      note: `${box.name} Açıldı: ${prizeName}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    return { prizeName, usdtAmount: usdtReward, stardustAmount: stardustReward };
  };

  const buyMarketItem = (itemId: string) => {
    const item = marketItems.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Ürün bulunamadı.' };
    if (item.stock <= 0) return { success: false, message: 'Bu ürünün stoğu tükendi.' };

    if (item.currency === 'USDT') {
      if (user.usdtBalance < item.price) return { success: false, message: 'Yetersiz USDT!' };
      setUser((prev) => ({ ...prev, usdtBalance: Number((prev.usdtBalance - item.price).toFixed(2)) }));
    } else {
      if (user.stardustBalance < item.price) return { success: false, message: 'Yetersiz Yıldız Tozu!' };
      setUser((prev) => ({ ...prev, stardustBalance: prev.stardustBalance - item.price }));
    }

    sounds.playUpgrade();
    sounds.triggerHaptic('medium');

    // Apply item effect
    if (item.type === 'repair_kit') {
      // Restore all user miners to 100%
      setUserMiners((prev) => prev.map((m) => ({ ...m, durability: 100 })));
    } else if (item.type === 'ore_bundle') {
      setUser((prev) => ({ ...prev, stardustBalance: prev.stardustBalance + 1000 }));
    } else if (item.type === 'cosmic_pass') {
      // Unlock next planet
      const nextPlanet = planets.find((p) => !user.unlockedPlanetIds.includes(p.id));
      if (nextPlanet) {
        setUser((prev) => ({
          ...prev,
          unlockedPlanetIds: [...prev.unlockedPlanetIds, nextPlanet.id],
          currentPlanetId: nextPlanet.id,
        }));
      }
    }

    // Decrement stock
    setMarketItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: Math.max(0, i.stock - 1) } : i))
    );

    const newTx: Transaction = {
      id: 'tx_mkt_' + Date.now(),
      userId: user.id,
      userName: user.telegramUsername,
      type: 'market_trade',
      amount: item.price,
      currency: item.currency,
      status: 'completed',
      timestamp: Date.now(),
      note: `Pazardan "${item.title}" Satın Alındı`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, message: `"${item.title}" satın alındı ve etkisi uygulandı!` };
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
      currency: 'USDT',
      status: 'completed',
      timestamp: Date.now(),
      note: `Yönetici Bakiye Düzenlemesi: ${usdtDelta >= 0 ? '+' : ''}${usdtDelta} USDT / ${stardustDelta >= 0 ? '+' : ''}${stardustDelta} Toz`,
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
