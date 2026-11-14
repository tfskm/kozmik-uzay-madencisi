// Çark, sandık ve pazar: sunucuda RASTGELELİK ve ÖDÜL hesabı. Tüm ödüller oyun içidir.
export const WHEEL_COST = 100;   // Yıldız Tozu (beklenen ödül ~60 ST + 0.7 KRD -> net yakım)
export const WHEEL = [
  { id: 'wp-1', p: .30, kind: 'stardust', amt: 100 }, { id: 'wp-2', p: .25, kind: 'krd', amt: 0.5 },
  { id: 'wp-3', p: .18, kind: 'repair', amt: 50 },    { id: 'wp-4', p: .12, kind: 'stardust', amt: 250 },
  { id: 'wp-5', p: .08, kind: 'krd', amt: 2.5 },      { id: 'wp-6', p: .04, kind: 'spin', amt: 2 },
  { id: 'wp-7', p: .015, kind: 'krd', amt: 25 },      { id: 'wp-8', p: .015, kind: 'boost', amt: 1 },
];
// Beklenen KRD ödülü fiyatın ~%55-80'i (net yakım); stardust oyun içi harcanır
export const BOXES = {
  'box-bronze': { name: 'Bronz Asteroit Sandığı', price: 5,   krd: [0.5, 5],   st: [100, 400],   spins: 0 },
  'box-silver': { name: 'Gümüş Nebula Sandığı',   price: 15,  krd: [3, 18],    st: [400, 1400],  spins: 0 },
  'box-gold':   { name: 'Altın Pulsar Kasası',    price: 50,  krd: [15, 65],   st: [1200, 5000], spins: 1 },
  'box-cosmic': { name: 'Kozmik Tekillik Sandığı',price: 150, krd: [50, 190],  st: [5000, 15000],spins: 3 },
};
export const MARKET = {
  'mkt-nanobot-kit':   { price: 5,   cur: 'krd', stock: 45,  type: 'repair_kit' },
  'mkt-dust-pack-1k':  { price: 3.5, cur: 'krd', stock: 120, type: 'ore_bundle' },
  'mkt-plasma-cooler': { price: 8,   cur: 'krd', stock: 15,  type: 'overclock_chip' },
  'mkt-warp-fuel':     { price: 25,  cur: 'krd', stock: 8,   type: 'cosmic_pass' },
  // Silahlar (5 seviye)
  'wpn-1': { price: 5,   cur: 'krd', stock: 999, type: 'weapon', tier: 1, name: '1. Temel Lazer' },
  'wpn-2': { price: 20,  cur: 'krd', stock: 999, type: 'weapon', tier: 2, name: '2. Çift Lazer' },
  'wpn-3': { price: 50,  cur: 'krd', stock: 999, type: 'weapon', tier: 3, name: '3. Plazma Topu' },
  'wpn-4': { price: 120, cur: 'krd', stock: 999, type: 'weapon', tier: 4, name: '4. Alev Püskürtücü' },
  'wpn-5': { price: 250, cur: 'krd', stock: 999, type: 'weapon', tier: 5, name: '5. Kuantum Işını' },
  // Kalkanlar (5 seviye)
  'shd-1': { price: 5,   cur: 'krd', stock: 999, type: 'shield', tier: 1, name: '1. Temel Kalkan' },
  'shd-2': { price: 20,  cur: 'krd', stock: 999, type: 'shield', tier: 2, name: '2. Güçlü Kalkan' },
  'shd-3': { price: 50,  cur: 'krd', stock: 999, type: 'shield', tier: 3, name: '3. Plazma Kalkan' },
  'shd-4': { price: 120, cur: 'krd', stock: 999, type: 'shield', tier: 4, name: '4. Alev Kalkan' },
  'shd-5': { price: 250, cur: 'krd', stock: 999, type: 'shield', tier: 5, name: '5. Titan Kalkan' },
  // Roketler (5 seviye)
  'rkt-1': { price: 0,   cur: 'krd', stock: 999, type: 'rocket', tier: 1, name: '1. Başlangıç Roketi' },
  'rkt-2': { price: 25,  cur: 'krd', stock: 999, type: 'rocket', tier: 2, name: '2. Gelişmiş Roket' },
  'rkt-3': { price: 60,  cur: 'krd', stock: 999, type: 'rocket', tier: 3, name: '3. Savaş Roketi' },
  'rkt-4': { price: 140, cur: 'krd', stock: 999, type: 'rocket', tier: 4, name: '4. Titan Roket' },
  'rkt-5': { price: 300, cur: 'krd', stock: 999, type: 'rocket', tier: 5, name: '5. Efsane Roket' },
};
const r = (a, b) => a + Math.random() * (b - a);
export function spinPrize() { let x = Math.random(), acc = 0; for (const w of WHEEL) { acc += w.p; if (x <= acc) return w; } return WHEEL[0]; }
export const boxReward = id => { const b = BOXES[id]; return { krd: +r(...b.krd).toFixed(2), st: Math.floor(r(...b.st)), spins: b.spins }; };
