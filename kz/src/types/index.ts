export interface User {
  id: string;
  telegramUsername: string;
  telegramId: string;
  avatar: string;
  walletAddress: string;
  walletName?: string;
  walletType: 'ton' | null;
  isConnected: boolean;
  krdBalance: number;        // Oyun içi KRD (nakde çevrilemez)
  stardustBalance: number;   // Oyun içi Yıldız Tozu
  level: number;
  exp: number;
  maxExp: number;
  energy: number;
  maxEnergy: number;
  currentPlanetId: number;
  unlockedPlanetIds: number[];
  isBanned: boolean;
  role: 'user' | 'admin';
  createdAt: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalMined: number;
  spinsAvailable: number;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  equippedWeapon?: string | null;
  equippedShield?: string | null;
}

export type MiningTier = 'bronze' | 'silver' | 'gold' | 'neon' | 'quantum';

export interface MiningPackage {
  id: string;
  name: string;
  subtitle: string;
  planetId: number;
  tier: MiningTier;
  price: number;                 // Sıradaki alım fiyatı (KRD)
  basePrice: number;             // Katalog taban fiyatı
  dailyReturnPercent: number;    // Tam kondisyonda günlük %
  dailyRate: number;             // 0.006 gibi
  coverDays: number;
  lifespanDays: number;
  durabilityDecayPerDay: number;
  planetMultiplier: number;
  dailyProduction: number;       // Tam kondisyonda KRD/gün
  description: string;
  iconName: string;
  badge: string;
  isActive: boolean;
  totalPurchased: number;
}

export interface UserMiner {
  instanceId: string;
  packageId: string;
  packageName: string;
  tier: MiningTier;
  price: number;
  dailyYield: number;            // Tam kondisyonda KRD/gün (gezegen + yükseltme dahil)
  dailyRate: number;
  decayPerDay: number;
  durability: number;            // 0 - 100
  planetId: number;
  purchaseDate: number;
  lastClaimedAt: number;
  unclaimedYield: number;
  totalEarned: number;
  isRunning: boolean;
  iconName: string;
}

export interface Planet {
  id: number;
  name: string;
  codeName: string;
  tagline: string;
  description: string;
  miningMultiplier: number;
  requiredLevel: number;
  unlockCostKRD: number;
  unlockCostStardust: number;
  color: string;
  gradient: string;
  specialOre: string;
  specialOreIcon: string;
  imagePrompt: string;
  gravity: string;
  atmosphere: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type:
    | 'deposit'
    | 'withdraw'
    | 'package_buy'
    | 'mine_claim'
    | 'repair'
    | 'spin_win'
    | 'box_open'
    | 'market_trade'
    | 'admin_adjustment'
    | 'planet_unlock'
    | 'daily';
  amount: number;
  currency: 'KRD' | 'TON' | 'STARDUST';
  status: 'completed' | 'pending' | 'rejected';
  txHash?: string;
  address?: string;
  timestamp: number;
  note: string;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  type: 'repair_kit' | 'energy_drink' | 'overclock_chip' | 'cosmic_pass' | 'ore_bundle' | 'weapon' | 'shield';
  price: number;
  currency: 'KRD' | 'STARDUST';
  iconName: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effectDescription: string;
  stock: number;
  seller: string;
}

export interface WheelPrize {
  id: string;
  label: string;
  rewardType: 'usdt' | 'stardust' | 'repair_kit' | 'spin' | 'booster';
  amount: number;
  probability: number;
  color: string;
  textColor: string;
}

export interface MysteryBox {
  id: string;
  name: string;
  price: number;
  currency: 'KRD' | 'STARDUST';
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'cosmic';
  possibleRewards: string[];
}

export interface VoyageSettings {
  starPoints: number;
  crystalPoints: number;
  asteroidPoints: number;
  asteroidShieldDamage: number;
  asteroidHullDecayPercent: number;
  asteroidPointPenalty: number;
  pirateBountyPoints: number;
  spawnIntervalSeconds: number;
  warpSpeedMultiplier: number;
  applyPlanetMultiplier: boolean;
}

export interface AdminSystemStats {
  maintenanceMode: boolean;
  announcementText: string;
  showAnnouncement: boolean;
  repairCostPerPercent: number;
  stRepairCostPerPercent: number;
  luckyWheelCostStardust: number;
  telegramChannelUrl: string;
  telegramSupportUrl: string;
  krdPerTon: number;
  minTon: number;
  stPerKrd: number;
  dailyStardust: number;
  voyageSettings: VoyageSettings;
}

export interface SpaceBattle {
  id: string;
  enemyName: string;
  enemyType: 'pirate_frigate' | 'alien_dreadnought' | 'void_reaper' | 'plasma_corsair';
  maxHp: number;
  currentHp: number;
  usdtBounty: number;
  stardustBounty: number;
  timeRemainingSeconds: number;
  isDefeated: boolean;
  avatar: string;
}

// Admin panelinin sunucudan aldığı tam durum
export interface AdminState {
  config: Record<string, unknown> & {
    announcementText: string;
    showAnnouncement: boolean;
    maintenanceMode: boolean;
    telegramChannelUrl: string;
    telegramSupportUrl: string;
    krdPerTon: number;
    minTon: number;
    repairCostPerPct: number;
    stRepairCostPerPct: number;
    wheelCost: number;
    dailyStardust: number;
    stPerKrd: number;
    planetUnlock: number[];
    planetMult: number[];
    requiredLevel: number[];
    dailyFaucet: number[];
  };
  catalog: Record<string, {
    name: string;
    planetId: number;
    tier: MiningTier;
    price: number;
    daily: number;
    decay: number;
    iconName: string;
    active?: boolean;
  }>;
  players: Array<{
    id: number;
    name: string;
    wallet: string;
    banned: boolean;
    krd: number;
    stardust: number;
    level: number;
    miners: number;
    planet: number;
    unlocked: number;
    pending: number;
  }>;
  totals: { krd: number; stardust: number; players: number };
  stock: Record<string, number>;
  treasury: string;
  adminId: number;
}
