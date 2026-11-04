export interface User {
  id: string;
  telegramUsername: string;
  telegramId: string;
  avatar: string;
  walletAddress: string;
  walletType: 'ton' | 'metamask' | 'phantom' | 'telegram' | null;
  isConnected: boolean;
  usdtBalance: number;       // Main stable balance for deposits/withdrawals/packages
  stardustBalance: number;   // In-game cosmic dust for repairs, boosts & mini-rewards
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
}

export type MiningTier = 'bronze' | 'silver' | 'gold' | 'neon' | 'quantum';

export interface MiningPackage {
  id: string;
  name: string;
  subtitle: string;
  planetId: number;
  tier: MiningTier;
  price: number;              // In USDT
  dailyReturnPercent: number; // e.g. 0.55% daily (~180 days to 100% cover)
  coverDays: number;          // e.g. 180 days (6 months amorti süresi)
  lifespanDays: number;       // e.g. 365 days or unlimited with repairs
  durabilityDecayPerDay: number; // % durability lost per 24h (e.g. 1.5% -> needs occasional repair)
  dailyProduction: number;    // USDT per day
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
  dailyYield: number;
  durability: number;        // 0 - 100%
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
  miningMultiplier: number;  // Multiplier on production or unlocks higher tier packages
  requiredLevel: number;
  unlockCostUSDT: number;
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
  type: 'deposit' | 'withdraw' | 'package_buy' | 'mine_claim' | 'repair' | 'spin_win' | 'box_open' | 'market_trade' | 'admin_adjustment';
  amount: number;
  currency: 'USDT' | 'TON' | 'STARDUST';
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
  type: 'repair_kit' | 'energy_drink' | 'overclock_chip' | 'cosmic_pass' | 'ore_bundle';
  price: number;
  currency: 'USDT' | 'STARDUST';
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
  currency: 'USDT' | 'STARDUST';
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'cosmic';
  possibleRewards: string[];
}

export interface VoyageSettings {
  starPoints: number; // default: 15
  crystalPoints: number; // default: 50
  asteroidPoints: number; // default: 25
  asteroidShieldDamage: number; // default: 25
  asteroidHullDecayPercent: number; // default: 2
  asteroidPointPenalty: number; // default: 0
  pirateBountyPoints: number; // default: 500
  spawnIntervalSeconds: number; // default: 1.5
  warpSpeedMultiplier: number; // default: 1.8
  applyPlanetMultiplier: boolean; // default: true
}

export interface AdminSystemStats {
  maintenanceMode: boolean;
  announcementText: string;
  showAnnouncement: boolean;
  minWithdrawal: number;
  withdrawalFeePercent: number;
  autoApproveWithdrawalsUnder: number;
  repairCostPerPercent: number; // Stardust or USDT needed per 1% repair
  luckyWheelCostStardust: number;
  telegramChannelUrl: string;
  telegramSupportUrl: string;
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

