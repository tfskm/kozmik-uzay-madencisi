import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/audio';
import { UserMiner } from '../types';
import {
  Sparkles,
  Zap,
  Swords,
  ShieldAlert,
  Flame,
  Wrench,
  Bot,
  Radio,
  Truck,
  Cpu,
  Compass,
  Atom,
  Rocket,
  Shield,
  Crosshair,
  Gauge,
  Navigation,
  Globe2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Info,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface InFlightEntity {
  id: number;
  type: 'star' | 'asteroid' | 'crystal';
  x: number; // percentage 0 - 100
  y: number; // percentage 10 - 90
  speed: number;
  size: number;
  tier: number; // 1-4 for asteroids (size/severity), 1 for stars/crystals
  hp: number;
  rewardPoints: number;
  rotation: number;
  destroyed?: boolean;
}

interface LaserShot {
  id: number;
  targetX: number;
  targetY: number;
  color: string;
  core: string;
  width: number;
  tier: number;
}

export interface CosmicCommandArenaProps {
  onOpenFleetDrawer?: () => void;
  onOpenPlanetDrawer?: () => void;
  unclaimedYield?: number;
  onClaimAll?: () => void;
}

const WEAPONS: Record<string, { name: string; tier: number; color: string; core: string; width: number; damage: number }> = {
  'wpn-1': { name: '1. Temel Lazer', tier: 1, color: '#f59e0b', core: '#fff7ed', width: 2.5, damage: 1 },
  'wpn-2': { name: '2. Çift Lazer', tier: 2, color: '#fb923c', core: '#ffedd5', width: 4, damage: 2 },
  'wpn-3': { name: '3. Plazma Topu', tier: 3, color: '#ef4444', core: '#fde68a', width: 7, damage: 3 },
  'wpn-4': { name: '4. Alev Püskürtücü', tier: 4, color: '#dc2626', core: '#fef08a', width: 11, damage: 4 },
  'wpn-5': { name: '5. Kuantum Alev', tier: 5, color: '#3b82f6', core: '#e0f2fe', width: 14, damage: 5 },
  // Eski id uyumluluğu
  'wpn-laser': { name: '1. Temel Lazer', tier: 1, color: '#f59e0b', core: '#fff7ed', width: 2.5, damage: 1 },
  'wpn-plasma': { name: '2. Çift Lazer', tier: 2, color: '#fb923c', core: '#ffedd5', width: 4, damage: 2 },
  'wpn-flame': { name: '3. Plazma Topu', tier: 3, color: '#ef4444', core: '#fde68a', width: 7, damage: 3 },
  'wpn-quantum': { name: '4. Alev Püskürtücü', tier: 4, color: '#dc2626', core: '#fef08a', width: 11, damage: 4 },
  'wpn-nova': { name: '5. Kuantum Alev', tier: 5, color: '#3b82f6', core: '#e0f2fe', width: 14, damage: 5 },
  'wpn-saber': { name: '5. Kuantum Alev', tier: 5, color: '#3b82f6', core: '#e0f2fe', width: 14, damage: 5 },
};

const SHIELDS: Record<string, { tier: number; color: string; name: string }> = {
  'shd-1': { tier: 1, color: '#38bdf8', name: '1. Temel Kalkan' },
  'shd-2': { tier: 2, color: '#22d3ee', name: '2. Güçlü Kalkan' },
  'shd-3': { tier: 3, color: '#34d399', name: '3. Plazma Kalkan' },
  'shd-4': { tier: 4, color: '#fb923c', name: '4. Alev Kalkan' },
  'shd-5': { tier: 5, color: '#fbbf24', name: '5. Titan Kalkan' },
  // Eski id uyumluluğu
  'shd-basic': { tier: 1, color: '#38bdf8', name: '1. Temel Kalkan' },
  'shd-medium': { tier: 2, color: '#22d3ee', name: '2. Güçlü Kalkan' },
  'shd-heavy': { tier: 3, color: '#34d399', name: '3. Plazma Kalkan' },
  'shd-titan': { tier: 4, color: '#fb923c', name: '4. Alev Kalkan' },
};

const ROCKETS: Record<string, { tier: number; name: string; hull: string; wing: string; accent: string }> = {
  'rkt-1': { tier: 1, name: 'Başlangıç Roketi', hull: '#475569', wing: '#64748b', accent: '#38bdf8' },
  'rkt-2': { tier: 2, name: 'Gelişmiş Roket', hull: '#334155', wing: '#0ea5e9', accent: '#22d3ee' },
  'rkt-3': { tier: 3, name: 'Savaş Roketi', hull: '#1e293b', wing: '#f97316', accent: '#fb923c' },
  'rkt-4': { tier: 4, name: 'Titan Roket', hull: '#312e81', wing: '#a855f7', accent: '#f472b6' },
  'rkt-5': { tier: 5, name: 'Efsane Roket', hull: '#3f1d0a', wing: '#f59e0b', accent: '#fef08a' },
};

const ASTEROID_REWARDS = [0, 10, 20, 35, 55, 80]; // tier 1..5
const ASTEROID_DAMAGE = [0, 6, 10, 15, 22, 30];  // gövde hasarı % (kalkan yok/yetersiz) tier 1..5
const DRONE_ICONS: Record<string, React.ElementType> = { Bot, Radio, Truck, Cpu, Compass, Rocket, Atom, Sparkles };
const DRONE_STYLES = [
  { border: 'border-cyan-400/70', bg: 'bg-cyan-950/80', text: 'text-cyan-300', glow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
  { border: 'border-amber-400/70', bg: 'bg-amber-950/80', text: 'text-amber-300', glow: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]' },
  { border: 'border-fuchsia-400/70', bg: 'bg-fuchsia-950/80', text: 'text-fuchsia-300', glow: 'shadow-[0_0_10px_rgba(232,121,249,0.5)]' },
];

const SHIELD_CAPACITY = [0, 40, 60, 80, 100, 120]; // kalkan ömrü/kapasitesi tier 1..5

export const CosmicCommandArena: React.FC<CosmicCommandArenaProps> = ({
  onOpenFleetDrawer,
  onOpenPlanetDrawer,
  unclaimedYield = 0,
  onClaimAll,
}) => {
  const {
    user,
    currentPlanet,
    userMiners,
    planets,
    travelToPlanet,
    currentBattle,
    startBattle,
    attackEnemy,
    collectVoyageStar,
    destroyVoyageAsteroid,
    takeAsteroidHit,
    adminSettings,
    setActiveTab,
  } = useGame();

  // Ship flight position (Y axis 15% to 85%)
  const [rocketY, setRocketY] = useState<number>(50);
  const [targetRocketY, setTargetRocketY] = useState<number>(50);

  // Fullscreen toggle state for immersive space flight experience
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Flight Stats
  const [distanceKm, setDistanceKm] = useState<number>(142850);
  const [warpSpeed, setWarpSpeed] = useState<number>(3.6);
  const [shieldHealth, setShieldHealth] = useState<number>(100);
  const [isWarpBoosting, setIsWarpBoosting] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Entities & Visuals
  const [entities, setEntities] = useState<InFlightEntity[]>([]);
  const [lasers, setLasers] = useState<LaserShot[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [collisionFlash, setCollisionFlash] = useState<boolean>(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(Date.now());

  // Mutable refs to prevent calling external context setState inside React state updater functions
  const entitiesRef = useRef<InFlightEntity[]>([]);
  const rocketYRef = useRef<number>(rocketY);
  const shieldHealthRef = useRef<number>(shieldHealth);

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    rocketYRef.current = rocketY;
  }, [rocketY]);

  useEffect(() => {
    shieldHealthRef.current = shieldHealth;
  }, [shieldHealth]);

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Increment distance smoothly
  useEffect(() => {
    const distTimer = setInterval(() => {
      const speedKmPerSec = Math.floor(25000 * warpSpeed);
      setDistanceKm((prev) => prev + Math.floor(speedKmPerSec / 10));
    }, 100);
    return () => clearInterval(distTimer);
  }, [warpSpeed]);

  // Kalkan ömrü/kapasitesi: seviyeye göre belirlenir, tükenir, yenilenmez. Yeni kalkan alınca sıfırlanır.
  useEffect(() => {
    const tier = user.equippedShield ? (SHIELDS[user.equippedShield]?.tier || 0) : 0;
    const cap = SHIELD_CAPACITY[tier] ?? 0;
    setShieldHealth(cap);
    shieldHealthRef.current = cap;
  }, [user.equippedShield]);

  // Smooth rocket Y interpolation towards targetRocketY
  useEffect(() => {
    let animId: number;
    const smoothFollow = () => {
      setRocketY((curr) => {
        const diff = targetRocketY - curr;
        if (Math.abs(diff) < 0.2) return targetRocketY;
        return curr + diff * 0.15;
      });
      animId = requestAnimationFrame(smoothFollow);
    };
    animId = requestAnimationFrame(smoothFollow);
    return () => cancelAnimationFrame(animId);
  }, [targetRocketY]);

  // Spawn in-flight entities (stars, crystals, and asteroids) - Calm & eye-friendly pace
  const spawnEntity = useCallback(() => {
    const vSettings = adminSettings.voyageSettings || {
      starPoints: 15,
      crystalPoints: 50,
      asteroidPoints: 25,
      asteroidShieldDamage: 25,
      asteroidHullDecayPercent: 2,
      asteroidPointPenalty: 0,
      pirateBountyPoints: 500,
      spawnIntervalSeconds: 4.5,
      warpSpeedMultiplier: 1.6,
      applyPlanetMultiplier: true,
    };

    const isStar = Math.random() < 0.55;
    const type: 'star' | 'asteroid' | 'crystal' = isStar
      ? Math.random() < 0.35
        ? 'crystal'
        : 'star'
      : 'asteroid';

    const pts =
      type === 'crystal'
        ? vSettings.crystalPoints
        : type === 'star'
        ? vSettings.starPoints
        : vSettings.asteroidPoints;

    // Göktaşı seviyesi (1-5)
    const asteroidTier = type === 'asteroid' ? 1 + Math.floor(Math.random() * 5) : 1;
    const asteroidSize =
      type === 'asteroid'
        ? 24 + asteroidTier * 7 + Math.random() * 4
        : 30 + Math.random() * 10;
    const reward =
      type === 'asteroid'
        ? (ASTEROID_REWARDS[asteroidTier] || 10)
        : type === 'crystal'
        ? vSettings.crystalPoints
        : vSettings.starPoints;

    const newEnt: InFlightEntity = {
      id: Date.now() + Math.random(),
      type,
      x: 104, // starts just off the right edge
      y: 18 + Math.random() * 64, // random altitude between 18% and 82%
      // Gentle, calm speed that doesn't cause eye fatigue or rapid flinching
      speed:
        (type === 'asteroid' ? 0.20 + Math.random() * 0.08 : 0.18 + Math.random() * 0.06) *
        (isWarpBoosting ? (vSettings.warpSpeedMultiplier || 1.6) : 1),
      size: asteroidSize,
      tier: asteroidTier,
      hp: 1,
      rewardPoints: reward,
      rotation: Math.floor(Math.random() * 360),
    };

    const currentEntities = entitiesRef.current;
    const activeScreenItems = currentEntities.filter((e) => !e.destroyed && e.x > 0);
    if (activeScreenItems.length >= (isWarpBoosting ? 3 : 2)) {
      return;
    }
    const updated = [...activeScreenItems, newEnt];
    entitiesRef.current = updated;
    setEntities(updated);
  }, [isWarpBoosting, adminSettings.voyageSettings]);

  // Trigger floating feedback text
  const addFloatingNumber = (x: number, y: number, text: string, color: string) => {
    const newFloat: FloatingNumber = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
    };
    setFloatingNumbers((prev) => [...prev.slice(-8), newFloat]);
  };

  // Rocket fires laser towards a specific point
  const fireRocketLaser = (targetX: number, targetY: number): boolean => {
    const weaponId = user.equippedWeapon;
    const w = weaponId ? WEAPONS[weaponId] : null;
    if (!w) {
      sounds.playClick();
      addFloatingNumber(22, rocketY - 6, '⚠️ SİLAH YOK', '#fbbf24');
      addFloatingNumber(22, rocketY + 2, 'Marketten silah al veya kaç/topla', '#94a3b8');
      return false;
    }
    sounds.playLaser();
    sounds.triggerHaptic('light');

    const shot: LaserShot = {
      id: Date.now() + Math.random(),
      targetX,
      targetY,
      color: w.color,
      core: w.core,
      width: w.width,
      tier: w.tier,
    };

    setLasers((prev) => [...prev.slice(-4), shot]);
    const life = 200 + w.tier * 40;
    setTimeout(() => {
      setLasers((prev) => prev.filter((l) => l.id !== shot.id));
    }, life);
    return true;
  };

  // Main In-Flight Update Loop (Physics & Collision Detection)
  useEffect(() => {
    let lastTime = performance.now();
    const vSettings = adminSettings.voyageSettings || {
      starPoints: 15,
      crystalPoints: 50,
      asteroidPoints: 25,
      asteroidShieldDamage: 25,
      asteroidHullDecayPercent: 2,
      asteroidPointPenalty: 0,
      pirateBountyPoints: 500,
      spawnIntervalSeconds: 4.5,
      warpSpeedMultiplier: 1.6,
      applyPlanetMultiplier: true,
    };

    // Calm spawn interval: At least 2.8s, default 4.5s
    const spawnDelayMs = Math.max(
      2800,
      ((vSettings.spawnIntervalSeconds || 4.5) * 1000) / (isWarpBoosting ? (vSettings.warpSpeedMultiplier || 1.6) : 1)
    );

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Spawn check
      if (Date.now() - lastSpawnTime.current > spawnDelayMs) {
        spawnEntity();
        lastSpawnTime.current = Date.now();
      }

      const currentEntities = entitiesRef.current;
      const next: InFlightEntity[] = [];
      const collectedBonuses: InFlightEntity[] = [];
      let asteroidHitEvent: InFlightEntity | null = null;

      const currentRocketY = rocketYRef.current;
      const rocketXPos = 20;

      for (const ent of currentEntities) {
        if (ent.destroyed) continue;

        // Move object from right to left
        const newX = ent.x - ent.speed * (dt * 60);

        // Çarpışma: kalkan varsa dış çizgisinde, yoksa roket gövdesinde
        const shieldActive = shieldHealthRef.current > 0 && !!user.equippedShield;
        // Dış halkaya temas: kalkan aktifken nesneler dış halkada yakalanır/patlar
        const hitRadiusX = shieldActive ? 13 : 6;
        const hitRadiusY = shieldActive ? 16 : 14;
        const isAtRocketX = newX <= rocketXPos + hitRadiusX && newX >= rocketXPos - 8;
        const isAtRocketY = Math.abs(ent.y - currentRocketY) < hitRadiusY;

        if (isAtRocketX && isAtRocketY) {
          if (ent.type === 'star' || ent.type === 'crystal') {
            collectedBonuses.push({ ...ent, x: rocketXPos, y: currentRocketY });
          } else if (ent.type === 'asteroid') {
            asteroidHitEvent = { ...ent, x: rocketXPos, y: currentRocketY };
          }
          // Consumed
          continue;
        }

        // If entity flew past left edge without hitting
        if (newX < -10) {
          continue;
        }

        next.push({
          ...ent,
          x: newX,
          rotation: (ent.rotation + 1) % 360,
        });
      }

      // 1. Update entities state cleanly with pure values (no nested side-effects)
      entitiesRef.current = next;
      setEntities(next);

      // 2. Safely trigger rewards / impacts outside of state updater functions
      for (const item of collectedBonuses) {
        const earnedPts = collectVoyageStar(item.rewardPoints);
        addFloatingNumber(
          rocketXPos + 5,
          item.y - 5,
          item.type === 'crystal' ? `+${earnedPts} KRİSTAL PUANI 💎` : `+${earnedPts} PUAN ⭐`,
          '#fbbf24'
        );
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { x: 0.22, y: item.y / 100 },
          colors: ['#fbbf24', '#f59e0b', '#38bdf8'],
        });
      }

      if (asteroidHitEvent) {
        setScreenShake(true);
        setCollisionFlash(true);
        setTimeout(() => setScreenShake(false), 350);
        setTimeout(() => setCollisionFlash(false), 200);

        const shd = user.equippedShield ? SHIELDS[user.equippedShield] : null;
        const shieldTier = shd ? shd.tier : 0;
        const asteroidTier = asteroidHitEvent.tier || 1;
        const shieldHolds = shieldTier >= asteroidTier;
        const hullDamage = ASTEROID_DAMAGE[asteroidTier] ?? 10;
        const impactCost = 10 + asteroidTier * 8; // kalkan ömründen düşen miktar

        if (shieldHealthRef.current > 0 && shieldHolds) {
          // Kalkan yeterli: taş kalkanın dış çizgisinde patlar, hasar engellenir (puan yok)
          const newShield = Math.max(0, shieldHealthRef.current - impactCost);
          shieldHealthRef.current = newShield;
          setShieldHealth(newShield);
          sounds.playExplosion();
          sounds.triggerHaptic('heavy');
          confetti({
            particleCount: 35,
            spread: 80,
            origin: { x: 0.22, y: asteroidHitEvent.y / 100 },
            colors: [shd?.color || '#38bdf8', '#fbbf24', '#ffffff'],
          });
          addFloatingNumber(rocketXPos + 8, asteroidHitEvent.y - 6, `🛡️ ${hullDamage}% HASAR ENGELLENDİ`, '#38bdf8');
          addFloatingNumber(rocketXPos + 8, asteroidHitEvent.y + 4, `Taş kalkanın dışında patladı`, '#94a3b8');
          if (newShield <= 0) {
            addFloatingNumber(rocketXPos + 8, asteroidHitEvent.y + 14, `Kalkan tükendi`, '#f87171');
          }
        } else {
          // Kalkan yok, kırık veya yetersiz seviye: gövde hasarı
          takeAsteroidHit(hullDamage, 0);
          sounds.playExplosion();
          sounds.triggerHaptic('heavy');
          confetti({
            particleCount: 20,
            spread: 50,
            origin: { x: 0.22, y: asteroidHitEvent.y / 100 },
            colors: ['#ef4444', '#f97316', '#ffffff'],
          });
          const reason = shieldHealthRef.current <= 0
            ? `Kalkan yok`
            : `Kalkan seviyesi yetersiz (Kalkan ${shieldTier} < Taş ${asteroidTier})`;
          addFloatingNumber(rocketXPos + 6, asteroidHitEvent.y - 8, `⚠️ -${hullDamage}% GÖVDE HASARI`, '#ef4444');
          addFloatingNumber(rocketXPos + 6, asteroidHitEvent.y + 4, reason, '#f87171');
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isWarpBoosting, collectVoyageStar, takeAsteroidHit, spawnEntity, adminSettings.voyageSettings]);

  // Handle direct tap/shoot on entity
  const handleEntityDirectClick = (ent: InFlightEntity, fired: boolean) => {
    // Yıldız/kristal: toplanabilir (ateşle veya hedefleyerek)
    if (ent.type !== 'asteroid') {
      const updated = entitiesRef.current.map((item) =>
        item.id === ent.id ? { ...item, destroyed: true } : item
      );
      entitiesRef.current = updated;
      setEntities(updated);
      const earned = collectVoyageStar(ent.rewardPoints);
      addFloatingNumber(
        ent.x,
        ent.y - 5,
        ent.type === 'crystal' ? `+${earned} KRİSTAL 💎` : `+${earned} PUAN ⭐`,
        ent.type === 'crystal' ? '#38bdf8' : '#fbbf24'
      );
      return;
    }

    // Asteroit: silah şart
    if (!fired) return; // silah yoksa ateş edilemez, sadece kaç/dodge

    const weaponTier = user.equippedWeapon ? (WEAPONS[user.equippedWeapon]?.tier || 0) : 0;
    if (weaponTier < (ent.tier || 1)) {
      sounds.playClick();
      addFloatingNumber(ent.x, ent.y - 8, `YETERSİZ SİLAH SEVİYESİ`, '#f87171');
      addFloatingNumber(ent.x, ent.y + 2, `Gereken: Sev.${ent.tier} silah (Sende: Sev.${weaponTier || 0})`, '#fbbf24');
      return;
    }

    const updated = entitiesRef.current.map((item) =>
      item.id === ent.id ? { ...item, destroyed: true } : item
    );
    entitiesRef.current = updated;
    setEntities(updated);
    const earned = destroyVoyageAsteroid(ent.rewardPoints);
    const w = user.equippedWeapon ? WEAPONS[user.equippedWeapon] : null;
    addFloatingNumber(ent.x, ent.y - 8, `GÖKTAŞI KIRILDI! +${earned} PUAN`, w?.color || '#f97316');
    confetti({
      particleCount: w ? w.tier * 10 : 25,
      spread: 60,
      origin: { x: ent.x / 100, y: ent.y / 100 },
      colors: w ? [w.color, w.core, '#ffffff'] : ['#f97316', '#fbbf24', '#ffffff'],
    });
  };

  // Handle tap / click inside arena
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clickXPercent = (clickX / rect.width) * 100;
    const clickYPercent = (clickY / rect.height) * 100;

    // Fire laser beam from rocket to click target (silah yoksa uyarı verir)
    const fired = fireRocketLaser(clickX, clickY);

    const vSettings = adminSettings.voyageSettings || { pirateBountyPoints: 500 };

    // If pirate battle is active and click is near top/center, attack boss
    if (currentBattle && !currentBattle.isDefeated && clickYPercent < 35 && fired) {
      const res = attackEnemy(35);
      addFloatingNumber(
        clickXPercent,
        clickYPercent - 5,
        res.defeated ? `KORSAN YOK EDİLDİ! +${res.loot?.stardust || vSettings.pirateBountyPoints} PUAN` : `-35 HASAR`,
        res.defeated ? '#fbbf24' : '#f87171'
      );
      return;
    }

    // Check if clicked directly on an approaching entity
    const currentList = entitiesRef.current;
    let hitObject: InFlightEntity | null = null;

    for (const ent of currentList) {
      if (ent.destroyed) continue;
      const distX = Math.abs(ent.x - clickXPercent);
      const distY = Math.abs(ent.y - clickYPercent);
      if (distX < 12 && distY < 12) {
        hitObject = ent;
        break;
      }
    }

    if (hitObject) {
      handleEntityDirectClick(hitObject, fired);
    }
  };

  // Pointer move / touch move steering for the rocket
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pointerY = e.clientY - rect.top;
    const percentY = (pointerY / rect.height) * 100;
    // Clamp rocket altitude - kalkan dahil üst HUD ve alt kontrol barına girmesin
    const clampedY = Math.max(30, Math.min(80, percentY));
    setTargetRocketY(clampedY);
  };

  // Clean floating numbers
  useEffect(() => {
    if (!floatingNumbers.length) return;
    const timer = setTimeout(() => {
      setFloatingNumbers((prev) => prev.slice(1));
    }, 1100);
    return () => clearTimeout(timer);
  }, [floatingNumbers]);

  // Sector Environment Visual Theme based on current planet - Vibrant, Colorful & Atmospheric
  const sectorThemes: Record<
    number,
    {
      bg: string;
      nebulaColor1: string;
      nebulaColor2: string;
      nebulaColor3: string;
      planetOrbColor: string;
      sectorName: string;
      debrisName: string;
    }
  > = {
    1: {
      bg: 'from-[#3b1262] via-[#240e44] to-[#4c167d]',
      nebulaColor1: 'bg-indigo-500/40',
      nebulaColor2: 'bg-amber-500/40',
      nebulaColor3: 'bg-fuchsia-500/35',
      planetOrbColor: 'radial-gradient(circle at 35% 35%, #93c5fd, #3b82f6 50%, #1e3a8a 90%)',
      sectorName: 'Sektör 1: Ay Kraterleri & Titanyum Vadisi',
      debrisName: 'Titanyum Asteroitleri',
    },
    2: {
      bg: 'from-[#66162a] via-[#4d0c1e] to-[#7a1f33]',
      nebulaColor1: 'bg-rose-500/45',
      nebulaColor2: 'bg-orange-500/50',
      nebulaColor3: 'bg-amber-400/40',
      planetOrbColor: 'radial-gradient(circle at 35% 35%, #fecaca, #ef4444 50%, #881337 90%)',
      sectorName: 'Sektör 2: Mars Kızıl Kanyon & Plazma Fırtınası',
      debrisName: 'Volkanik Bazalt Taşları',
    },
    3: {
      bg: 'from-[#0e4475] via-[#092e52] to-[#165a94]',
      nebulaColor1: 'bg-cyan-400/45',
      nebulaColor2: 'bg-teal-400/40',
      nebulaColor3: 'bg-blue-500/45',
      planetOrbColor: 'radial-gradient(circle at 35% 35%, #a5f3fc, #06b6d4 50%, #164e63 90%)',
      sectorName: 'Sektör 3: Europa Buzaltı Okyanusu & Kutup Yıldızları',
      debrisName: 'Buz Kristal Kuyrukluyıldızları',
    },
    4: {
      bg: 'from-[#5a2c06] via-[#3d1c04] to-[#703908]',
      nebulaColor1: 'bg-amber-400/45',
      nebulaColor2: 'bg-yellow-500/40',
      nebulaColor3: 'bg-orange-500/45',
      planetOrbColor: 'radial-gradient(circle at 35% 35%, #fef08a, #f59e0b 50%, #78350f 90%)',
      sectorName: 'Sektör 4: Satürn Altın Kuşakları & Cevher Halkası',
      debrisName: 'Altın-Platin Göktaşları',
    },
    5: {
      bg: 'from-[#54126d] via-[#3a094e] to-[#6c1a8a]',
      nebulaColor1: 'bg-fuchsia-500/45',
      nebulaColor2: 'bg-violet-500/50',
      nebulaColor3: 'bg-cyan-400/40',
      planetOrbColor: 'radial-gradient(circle at 35% 35%, #f472b6, #a855f7 50%, #4c1d95 90%)',
      sectorName: 'Sektör 5: Siber Nebula İyon Bulutu & Kozmik Ağ',
      debrisName: 'İyonik Plazma Parçacıkları',
    },
    6: {
      bg: 'from-[#521147] via-[#35072e] to-[#6d1a5d]',
      nebulaColor1: 'bg-rose-500/45',
      nebulaColor2: 'bg-purple-600/45',
      nebulaColor3: 'bg-pink-500/40',
      planetOrbColor: 'radial-gradient(circle at 40% 40%, #fda4af, #e11d48 45%, #4c0519 85%)',
      sectorName: 'Sektör 6: Kuasar Tekillik & Olay Ufku',
      debrisName: 'Karanlık Madde Kalıntıları',
    },
  };

  const currentTheme = sectorThemes[currentPlanet.id] || sectorThemes[1];

  return (
    <div className="space-y-3.5 w-full max-w-full overflow-hidden">
      {/* Sector Quick Switcher Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
        {planets.map((planet) => {
          const isCurrent = planet.id === currentPlanet.id;
          const isUnlocked = user.unlockedPlanetIds.includes(planet.id);

          return (
            <button
              key={planet.id}
              onClick={() => {
                if (isUnlocked) {
                  travelToPlanet(planet.id);
                } else {
                  setActiveTab('planets');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                isCurrent
                  ? 'bg-gradient-to-r from-orange-500/25 via-amber-500/20 to-purple-600/30 border-orange-400 text-white shadow-lg glow-orange'
                  : isUnlocked
                  ? 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-orange-500/50'
                  : 'bg-slate-950/60 border-slate-900 text-slate-600'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: planet.color }}
              />
              <span className="font-display">S{planet.id}: {planet.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                x{planet.miningMultiplier.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN REALISTIC SPACE VOYAGE ARENA - Expansive / Fullscreen Experience */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        onPointerMove={handlePointerMove}
        className={`relative ${
          isFullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen rounded-none'
            : 'h-[52vh] sm:h-[58vh] min-h-[340px] max-h-[680px] w-full rounded-3xl'
        } overflow-hidden border ${
          isFullscreen ? 'border-0' : 'border-orange-500/40'
        } bg-gradient-to-r ${
          currentTheme.bg
        } select-none cursor-crosshair shadow-2xl glow-orange touch-none transition-all duration-300 ${
          screenShake ? 'animate-screen-shake ring-2 ring-rose-500' : ''
        }`}
      >
        {/* Red Hull Impact Flash */}
        {collisionFlash && (
          <div className="absolute inset-0 bg-rose-600/30 z-30 pointer-events-none transition-opacity duration-150" />
        )}

        {/* Dynamic Multi-Color Nebula Clouds Passing By (Luminous Cosmic Atmosphere) */}
        <div
          className={`absolute -top-16 -left-10 w-96 h-96 rounded-full ${currentTheme.nebulaColor1} blur-3xl pointer-events-none opacity-90`}
        />
        <div
          className={`absolute top-1/2 right-6 w-[26rem] h-[26rem] rounded-full ${currentTheme.nebulaColor2} blur-3xl pointer-events-none opacity-85`}
        />
        <div
          className={`absolute bottom-[-15%] left-1/4 w-80 h-80 rounded-full ${currentTheme.nebulaColor3} blur-3xl pointer-events-none opacity-80`}
        />
        {/* Ambient Warm Galactic Sunflare Center Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />

        {/* Distant Celestial Planet/Moon in background (gives true sensation of deep space flight) */}
        <div className="absolute top-10 right-6 sm:right-16 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-70 pointer-events-none overflow-hidden shadow-2xl">
          <div
            className="w-full h-full rounded-full shadow-[inset_-12px_-12px_25px_rgba(0,0,0,0.85)]"
            style={{ background: currentTheme.planetOrbColor }}
          />
          {currentPlanet.id === 4 && (
            <div className="absolute inset-0 m-auto w-40 h-8 border-2 border-amber-400/40 rounded-full rotate-[-25deg]" />
          )}
        </div>

        {/* PARALLAX FAST-MOVING STARFIELD STREAKS (Visual Flight Speed) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Layer 1: Hyper-drive Warp Speed Lines drifting Right-to-Left */}
          {[...Array(16)].map((_, i) => (
            <div
              key={`warp-${i}`}
              className="absolute h-0.5 rounded-full bg-gradient-to-r from-transparent via-amber-200/90 to-transparent"
              style={{
                width: `${40 + (i % 5) * 35}px`,
                top: `${(i * 7.5 + 4) % 95}%`,
                left: `${(i * 19) % 100}%`,
                animation: `warp-drift-fast ${0.7 + (i % 3) * 0.4}s linear infinite`,
                opacity: 0.45 + (i % 4) * 0.15,
              }}
            />
          ))}

          {/* Layer 2: Multi-Colored Shimmering Stardust Particles */}
          {[...Array(24)].map((_, i) => {
            const starColors = ['#ffffff', '#fbbf24', '#38bdf8', '#f472b6', '#34d399', '#f97316'];
            const color = starColors[i % starColors.length];
            return (
              <div
                key={`star-${i}`}
                className="absolute rounded-full"
                style={{
                  backgroundColor: color,
                  width: i % 3 === 0 ? '3.5px' : '2px',
                  height: i % 3 === 0 ? '3.5px' : '2px',
                  top: `${(i * 5.2 + 8) % 92}%`,
                  left: `${(i * 13.7) % 100}%`,
                  opacity: 0.55 + (i % 3) * 0.25,
                  boxShadow: `0 0 8px ${color}`,
                }}
              />
            );
          })}
        </div>

        {/* TOP FLIGHT TELEMETRY HUD BAR */}
        <div className="absolute top-1.5 left-1.5 right-1.5 z-20 flex flex-wrap items-center justify-between pointer-events-none gap-1 pb-1 border-b border-orange-500/25">
          {/* Sector & Telemetry badge */}
          <div className="flex items-center gap-1.5 bg-[#120722]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-orange-500/40 pointer-events-auto shadow-md">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            <div className="text-left">
              <div className="text-[9px] font-black text-white font-display tracking-wider uppercase flex items-center gap-1">
                  <span className="text-amber-400 font-mono text-[9px]">
                    WARP {warpSpeed.toFixed(1)}
                  </span>
              </div>
              <div className="text-[8px] text-amber-200/70 font-mono leading-none">
                {distanceKm.toLocaleString()} KM • x{currentPlanet.miningMultiplier.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Defense, Battles & Fullscreen Controls */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <div className="bg-[#120722]/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-cyan-500/40 flex items-center gap-1 pointer-events-auto shadow-md">
              <Shield className="w-3 h-3 text-cyan-400" />
              <div className="text-right">
                <div className="text-[8px] text-slate-300 font-bold uppercase font-display leading-none">
                  KALKAN {user.equippedShield ? `S${SHIELDS[user.equippedShield]?.tier || 0}` : ''}
                </div>
                <div
                  className={`text-[9px] font-black font-mono leading-none ${
                    shieldHealth > 0 ? 'text-cyan-300' : 'text-rose-400'
                  }`}
                >
                  {user.equippedShield ? `${shieldHealth}` : 'YOK'}
                </div>
              </div>
            </div>

            <div className="bg-[#120722]/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-orange-500/40 flex items-center gap-1 pointer-events-auto shadow-md">
              <Crosshair className="w-3 h-3 text-orange-400" />
              <div className="text-right">
                <div className="text-[8px] text-slate-300 font-bold uppercase font-display leading-none">SİLAH</div>
                <div className="text-[9px] font-black font-mono leading-none text-orange-300">
                  {user.equippedWeapon ? `Sev.${WEAPONS[user.equippedWeapon]?.tier || 0}` : 'YOK'}
                </div>
              </div>
            </div>

            <div className="bg-[#120722]/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-emerald-500/40 flex items-center gap-1 pointer-events-auto shadow-md">
              <Rocket className="w-3 h-3 text-emerald-400" />
              <div className="text-right">
                <div className="text-[8px] text-slate-300 font-bold uppercase font-display leading-none">ROKET</div>
                <div className="text-[9px] font-black font-mono leading-none text-emerald-300">
                  Sev.{ROCKETS[user.equippedRocket || 'rkt-1']?.tier || 1}
                </div>
              </div>
            </div>

            {/* Pirate Raid Summon / Alert */}
            {!currentBattle ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startBattle();
                }}
                className="pointer-events-auto flex items-center gap-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black font-display uppercase tracking-wider text-[9px] px-2 py-1 rounded-lg shadow-lg transition active:scale-95 animate-pulse"
              >
                <Swords className="w-3 h-3" />
                <span className="hidden sm:inline">Korsan Avı</span>
                <span className="sm:hidden">Korsan</span>
              </button>
            ) : (
              <div className="bg-rose-950/90 border border-rose-500/70 px-1.5 py-0.5 rounded-lg flex items-center gap-1 animate-bounce pointer-events-auto">
                <ShieldAlert className="w-3 h-3 text-rose-400 animate-spin" />
                <span className="text-[9px] font-black text-rose-300 font-display">
                  BASKIN! ({currentBattle.timeRemainingSeconds}s)
                </span>
              </div>
            )}

            {/* Fullscreen Expand / Shrink Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                setIsFullscreen((prev) => !prev);
              }}
              className={`pointer-events-auto flex items-center gap-1 px-1.5 py-1 rounded-lg text-[9px] font-bold font-display uppercase tracking-wider transition active:scale-95 shadow-md border ${
                isFullscreen
                  ? 'bg-rose-500/30 border-rose-500/60 text-rose-200 hover:bg-rose-500/50'
                  : 'bg-[#120722]/90 border-amber-500/50 text-amber-300 hover:border-amber-400 hover:bg-[#1c0c32]'
              }`}
              title={isFullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran Moduna Geç'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3 h-3 text-rose-400" />
                  <span className="hidden sm:inline">Küçült</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Tam Ekran</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ACTIVE SPACE PIRATE BOSS OVERLAY (IF ENGAGED) */}
        {currentBattle && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleArenaClick(e);
            }}
            className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-30 cursor-pointer group transition-transform active:scale-95 w-[88%] max-w-[280px] pointer-events-auto"
          >
            <div className="bg-slate-950/95 border border-rose-500/80 p-2 rounded-xl flex items-center gap-2 shadow-2xl glow-rose">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition animate-bounce">
                {currentBattle.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-white font-display truncate">
                    {currentBattle.enemyName}
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold shrink-0">
                    +{adminSettings.voyageSettings?.pirateBountyPoints || 500} PUAN ⭐
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2.5 mt-1 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-200"
                    style={{
                      width: `${Math.max(5, (currentBattle.currentHp / currentBattle.maxHp) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                  <span>
                    HP: {currentBattle.currentHp}/{currentBattle.maxHp}
                  </span>
                  <span className="text-amber-400 font-bold animate-pulse">
                    🎯 VURMAK İÇİN TIKLA!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IN-FLIGHT PASSING ENTITIES (STARS, CRYSTALS & ASTEROIDS) */}
        {entities.map((ent) => {
          if (ent.destroyed) return null;

          if (ent.type === 'star') {
            return (
              <div
                key={ent.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEntityDirectClick(ent);
                }}
                className="absolute z-20 cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${ent.x}%`,
                  top: `${ent.y}%`,
                  width: `${ent.size}px`,
                  height: `${ent.size}px`,
                }}
              >
                {/* Glowing Stellar Aura */}
                <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-md animate-ping" />
                <div className="relative w-full h-full flex items-center justify-center animate-star-gleam">
                  <span className="text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]">
                    ⭐
                  </span>
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-300 bg-black/70 px-1 rounded whitespace-nowrap opacity-90">
                  +{ent.rewardPoints} Puan
                </span>
              </div>
            );
          }

          if (ent.type === 'crystal') {
            return (
              <div
                key={ent.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEntityDirectClick(ent);
                }}
                className="absolute z-20 cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${ent.x}%`,
                  top: `${ent.y}%`,
                  width: `${ent.size}px`,
                  height: `${ent.size}px`,
                }}
              >
                <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-md animate-pulse" />
                <div className="relative w-full h-full flex items-center justify-center animate-bounce">
                  <span className="text-xl sm:text-2xl drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]">
                    💎
                  </span>
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-cyan-300 bg-black/70 px-1 rounded whitespace-nowrap">
                  +{ent.rewardPoints} Puan
                </span>
              </div>
            );
          }

          if (ent.type === 'asteroid') {
            const asteroidTier = ent.tier || 1;
            const asteroidColor = asteroidTier === 1 ? '#60a5fa'
              : asteroidTier === 2 ? '#f97316'
              : asteroidTier === 3 ? '#ef4444'
              : asteroidTier === 4 ? '#a855f7'
              : '#fbbf24';
            return (
              <div
                key={ent.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEntityDirectClick(ent);
                }}
                className="absolute z-20 cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${ent.x}%`,
                  top: `${ent.y}%`,
                  width: `${ent.size}px`,
                  height: `${ent.size}px`,
                }}
              >
                {/* Burning Fiery Plasma Tail behind the asteroid */}
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-transparent blur-[2px] opacity-80" />

                {/* Tumbling Asteroid Rock */}
                <div
                  className="w-full h-full flex items-center justify-center animate-asteroid-spin transition-transform group-hover:scale-125"
                  style={{ transform: `rotate(${ent.rotation}deg)` }}
                >
                  <span className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ fontSize: `${Math.max(16, ent.size * 0.6)}px` }}>
                    ☄️
                  </span>
                </div>

                {/* Tier badge */}
                <span
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border whitespace-nowrap"
                  style={{ color: asteroidColor, borderColor: asteroidColor, backgroundColor: 'rgba(0,0,0,0.7)' }}
                >
                  Sev.{asteroidTier} • +{ent.rewardPoints}
                </span>
              </div>
            );
          }

          return null;
        })}

        {/* ACTIVE LASER BEAMS SHOT FROM ROCKET TO TARGETS */}
        {lasers.map((shot) => {
          const arenaW = arenaRef.current?.clientWidth || 360;
          const arenaH = arenaRef.current?.clientHeight || 380;
          const rocketW = arenaW < 640 ? 112 : 144;
          const startX = arenaW * 0.20 + rocketW / 2; // roket burnu (sabit X)
          const startY = (arenaH * rocketY) / 100;    // roket hareketini takip eder
          const dx = shot.targetX - startX;
          const dy = shot.targetY - startY;
          const len = Math.max(1, Math.hypot(dx, dy));
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const flame = shot.tier >= 3;
          return (
            <div key={shot.id} className="absolute inset-0 w-full h-full pointer-events-none z-30">
              <svg className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id={`beam-${shot.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={shot.core} stopOpacity="0.95" />
                    <stop offset={flame ? '35%' : '60%'} stopColor={shot.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={shot.color} stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                {/* Dış parlama */}
                <line x1={startX} y1={startY} x2={shot.targetX} y2={shot.targetY} stroke={shot.color} strokeWidth={shot.width + (flame ? 10 : 6)} strokeLinecap="round" opacity={0.28} className="blur-sm" />
                {/* Ana ışın/alev gövdesi */}
                <line x1={startX} y1={startY} x2={shot.targetX} y2={shot.targetY} stroke={`url(#beam-${shot.id})`} strokeWidth={shot.width} strokeLinecap="round" className="drop-shadow-[0_0_12px_currentColor]" />
                {/* Sıcak çekirdek */}
                <line x1={startX} y1={startY} x2={shot.targetX} y2={shot.targetY} stroke={shot.core} strokeWidth={Math.max(1, shot.width - (flame ? 3 : 2))} strokeLinecap="round" opacity={0.95} />
              </svg>
              {/* Roketten çıkan alev/enerji (güçlendikçe arkadaki thruster gibi) */}
              {shot.tier >= 2 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: startX,
                    top: startY,
                    transform: `translate(0, -50%) rotate(${angle}deg)`,
                    transformOrigin: '0 50%',
                  }}
                >
                  {/* Dış alev püskürmesi - tıklanan noktaya kadar */}
                  <div
                    className={`${shot.tier >= 4 ? 'animate-rocket-flame' : ''}`}
                    style={{
                      width: len,
                      height: 12 + shot.tier * 7,
                      background: `linear-gradient(90deg, ${shot.core} 0%, ${shot.color} 25%, ${shot.tier >= 5 ? '#60a5fa' : '#fb923c'} 55%, ${shot.color}88 85%, transparent 100%)`,
                      borderRadius: '999px',
                      filter: `blur(${shot.tier >= 4 ? 3 : 2}px)`,
                      opacity: 0.9,
                    }}
                  />
                  {/* İç sıcak çekirdek jet - hedefe kadar */}
                  <div
                    className="absolute top-1/2 left-0 -translate-y-1/2"
                    style={{
                      width: len,
                      height: 5 + shot.tier * 3,
                      background: `linear-gradient(90deg, #ffffff 0%, ${shot.core} 30%, ${shot.color} 70%, transparent 100%)`,
                      borderRadius: '999px',
                      filter: 'blur(1px)',
                      opacity: 0.95,
                    }}
                  />
                </div>
              )}
              {/* Alev dalgaları / kıvılcımlar (yüksek seviye) */}
              {shot.tier >= 3 && [0.15, 0.35, 0.55, 0.75].slice(0, shot.tier).map((t, i) => (
                <span
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: startX + dx * t,
                    top: startY + dy * t + Math.sin(i * 2) * (shot.tier * 1.5),
                    width: 6 + shot.tier * 3,
                    height: 6 + shot.tier * 3,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${shot.core}, ${shot.color} 45%, ${shot.tier >= 5 ? '#93c5fd' : '#f97316'} 80%, transparent 100%)`,
                    boxShadow: `0 0 ${8 + shot.tier * 3}px ${shot.color}`,
                    opacity: 0.8 - i * 0.08,
                  }}
                />
              ))}
              {/* Namlu ağzı (roket ucundan çıkan alev) */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: startX,
                  top: startY,
                  transform: `translate(-10%, -50%) rotate(${angle}deg)`,
                  transformOrigin: '0 50%',
                }}
              >
                <div
                  className="animate-rocket-flame"
                  style={{
                    width: 18 + shot.tier * 8,
                    height: 10 + shot.tier * 5,
                    background: `linear-gradient(90deg, #fff 0%, ${shot.core} 25%, ${shot.color} 55%, ${shot.tier >= 5 ? '#60a5fa' : 'transparent'} 85%, transparent 100%)`,
                    borderRadius: '999px',
                    filter: 'blur(2px)',
                    boxShadow: `0 0 ${14 + shot.tier * 4}px ${shot.color}`,
                  }}
                />
              </div>
              {/* Hedefte çarpma parlaması */}
              <div
                className="absolute rounded-full animate-ping pointer-events-none"
                style={{
                  left: shot.targetX,
                  top: shot.targetY,
                  width: 14 + shot.tier * 2,
                  height: 14 + shot.tier * 2,
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, ${shot.core}, ${shot.color} 55%, transparent 75%)`,
                }}
              />
            </div>
          );
        })}

        {/* THE HERO: REALISTIC SCI-FI STARSHIP ROCKET CRUISING THROUGH SPACE */}
        <div
          className="absolute z-25 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform duration-75"
          style={{
            left: '20%',
            top: `${rocketY}%`,
          }}
        >
          {/* Subtle hovering float */}
          <div className="relative animate-rocket-hover">
            {/* Kalkan balonu — seviyeye göre şekil değişir */}
            {user.equippedShield && SHIELDS[user.equippedShield] && (
              <>
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: '-18px',
                    background: `radial-gradient(circle at 50% 50%, ${SHIELDS[user.equippedShield].color}22 0%, ${SHIELDS[user.equippedShield].color}55 55%, ${SHIELDS[user.equippedShield].color}11 70%, transparent 75%)`,
                    border: `${SHIELDS[user.equippedShield].tier >= 3 ? 3 : 2}px solid ${SHIELDS[user.equippedShield].color}`,
                    boxShadow: `0 0 ${SHIELDS[user.equippedShield].tier >= 3 ? 46 : 28}px ${SHIELDS[user.equippedShield].color}, inset 0 0 18px ${SHIELDS[user.equippedShield].color}88`,
                    opacity: 0.85,
                    animation: 'pulse-subtle 2.2s ease-in-out infinite',
                  }}
                />
                {SHIELDS[user.equippedShield].tier >= 2 && (
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      inset: '-24px',
                      border: `2px dashed ${SHIELDS[user.equippedShield].color}`,
                      opacity: 0.55,
                      animation: 'radar-sweep 6s linear infinite',
                    }}
                  />
                )}
                {SHIELDS[user.equippedShield].tier >= 4 && (
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      inset: '-30px',
                      border: `2px solid ${SHIELDS[user.equippedShield].color}`,
                      boxShadow: `0 0 18px ${SHIELDS[user.equippedShield].color}`,
                      opacity: 0.45,
                      animation: 'pulse-subtle 1.4s ease-in-out infinite',
                    }}
                  />
                )}
                {SHIELDS[user.equippedShield].tier >= 3 &&
                  Array.from({ length: SHIELDS[user.equippedShield].tier + 2 }).map((_, i) => {
                    const sh = SHIELDS[user.equippedShield!];
                    const n = sh.tier + 2;
                    return (
                      <span
                        key={`sp-${i}`}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: sh.tier >= 4 ? 6 : 4,
                          height: sh.tier >= 4 ? 6 : 4,
                          left: `${50 + Math.cos((i * 2 * Math.PI) / n) * 44}%`,
                          top: `${50 + Math.sin((i * 2 * Math.PI) / n) * 44}%`,
                          background: sh.color,
                          boxShadow: `0 0 ${sh.tier >= 4 ? 12 : 8}px ${sh.color}`,
                          animation: `pulse-subtle ${0.8 + i * 0.12}s ease-in-out infinite`,
                        }}
                      />
                    );
                  })}
              </>
            )}
            {/* Plasma Thruster Flame & Particle Trail at the Rocket Tail */}
            <div className="absolute top-1/2 -left-12 sm:-left-16 -translate-y-1/2 flex items-center pointer-events-none">
              {/* Outer Roaring Orange/Amber Flame Plume */}
              <div className="w-14 sm:w-18 h-7 sm:h-9 bg-gradient-to-l from-orange-500 via-amber-400 to-transparent rounded-l-full blur-[2px] animate-rocket-flame" />
              {/* Inner Hyper-Drive Blue-White Core Jet */}
              <div className="absolute right-0 w-8 sm:w-11 h-3.5 sm:h-4 bg-gradient-to-l from-white via-cyan-300 to-transparent rounded-l-full blur-[1px] animate-pulse" />
              {/* Spark particles trailing back */}
              <span className="absolute -left-3 top-1 w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
              <span className="absolute -left-6 bottom-1 w-1 h-1 rounded-full bg-orange-400 animate-ping" />
            </div>

            {/* REALISTIC HIGH-FIDELITY STARSHIP ROCKET SVG */}
            {(() => {
              const rk = ROCKETS[user.equippedRocket || 'rkt-1'] || ROCKETS['rkt-1'];
              return (
            <div className="relative w-28 sm:w-36 h-14 sm:h-16 flex items-center justify-center" style={{ filter: `drop-shadow(0 0 16px ${rk.accent}66)` }}>
              <svg
                viewBox="0 0 160 80"
                className="w-full h-full overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="fuselageGradDyn" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor={rk.hull} />
                    <stop offset="40%" stopColor="#475569" />
                    <stop offset="70%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  <linearGradient id="wingGradDyn" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={rk.wing} />
                    <stop offset="100%" stopColor={rk.accent} />
                  </linearGradient>
                  <linearGradient id="cockpitVisorDyn" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={rk.accent} />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                  <linearGradient id="heatShieldGradDyn" x1="0%" y1="100%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor={rk.hull} />
                  </linearGradient>
                </defs>

                {/* Top Swept Wing */}
                <path d="M38 32 L15 10 L52 16 L75 32 Z" fill="url(#wingGradDyn)" stroke={rk.accent} strokeWidth={rk.tier >= 3 ? 1.6 : 1.2} />
                <circle cx="15" cy="10" r={2 + rk.tier * 0.3} fill={rk.accent} className="animate-pulse" />

                {/* Bottom Swept Wing */}
                <path d="M38 48 L15 70 L52 64 L75 48 Z" fill="url(#wingGradDyn)" stroke={rk.accent} strokeWidth={rk.tier >= 3 ? 1.6 : 1.2} />
                <circle cx="15" cy="70" r={2 + rk.tier * 0.3} fill={rk.accent} className="animate-pulse" />

                {/* Main Fuselage */}
                <path d="M20 30 Q50 26 110 32 L148 40 L110 48 Q50 54 20 50 Z" fill="url(#fuselageGradDyn)" stroke="#64748b" strokeWidth="1.5" />

                {/* Heat Shield Underside */}
                <path d="M25 44 Q60 51 110 48 L148 40 L110 44 Q50 48 25 44 Z" fill="url(#heatShieldGradDyn)" opacity="0.85" />

                {/* Cockpit */}
                <path d="M92 34 Q115 35 128 40 Q115 45 92 46 Q100 40 92 34 Z" fill="url(#cockpitVisorDyn)" filter={`drop-shadow(0 0 4px ${rk.accent})`} />

                {/* Reactor Core */}
                <ellipse cx="62" cy="40" rx={7 + rk.tier} ry={4 + rk.tier * 0.3} fill={rk.wing} className="animate-pulse" />
                <ellipse cx="62" cy="40" rx={3 + rk.tier * 0.4} ry={2} fill={rk.accent} />

                {/* Thruster Nozzle */}
                <path d="M18 32 L8 28 L8 52 L18 48 Z" fill="#0f172a" stroke={rk.wing} strokeWidth="1.5" />

                {/* Hull seams */}
                <line x1="45" y1="30" x2="45" y2="50" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.6" />
                <line x1="78" y1="31" x2="78" y2="49" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.6" />
                <line x1="110" y1="33" x2="110" y2="47" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.6" />
                {rk.tier >= 4 && <line x1="130" y1="36" x2="130" y2="44" stroke={rk.accent} strokeWidth="1.2" opacity="0.9" />}
              </svg>
            </div>
              );
            })()}

            {/* Roket seviyesi göstergesi */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#120722]/90 border border-emerald-500/40 px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black font-display text-emerald-200 tracking-wide">
                ROKET SEV.{ROCKETS[user.equippedRocket || 'rkt-1']?.tier || 1}
              </span>
            </div>
          </div>
        </div>

        {/* ESCORT DRONES - roketin gövdesinin üstünde/altında, gövdeden biraz uzakta */}
        {userMiners.slice(0, 4).map((miner, i) => {
          const offsets = [
            { left: '16%', y: -62 },
            { left: '24%', y: -42 },
            { left: '16%', y: 62 },
            { left: '24%', y: 42 },
          ];
          const off = offsets[i] || offsets[0];
          const style = DRONE_STYLES[i % DRONE_STYLES.length];
          const Icon = DRONE_ICONS[miner.iconName] || [Bot, Cpu, Atom, Radio][i] || Bot;
          return (
            <div
              key={miner.instanceId}
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: off.left, top: `calc(${rocketY}% + ${off.y}px)` }}
              title={miner.packageName}
            >
              <div className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border ${style.border} ${style.bg} ${style.glow}`}>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${style.text}`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
              </div>
              <div className={`mt-0.5 text-[7px] sm:text-[8px] font-bold text-center ${style.text} whitespace-nowrap max-w-[56px] truncate px-0.5`}>
                {miner.packageName?.split(' ').slice(0,2).join(' ') || 'Drone'}
              </div>
            </div>
          );
        })}

        {/* FLOATING DAMAGE / LOOT NUMBERS */}
        {floatingNumbers.map((item) => (
          <div
            key={item.id}
            className="absolute z-40 pointer-events-none font-display font-black text-xs sm:text-sm animate-float-up drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              color: item.color,
            }}
          >
            {item.text}
          </div>
        ))}

        {/* BOTTOM VOYAGE CONTROLS & FLIGHT STATS BAR */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 z-20 flex items-center justify-between gap-2 pointer-events-none pt-1 border-t border-orange-500/25">
          <div className="flex items-center gap-1 bg-[#120722]/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-orange-500/30 text-[9px] text-amber-200/90 font-mono pointer-events-auto">
            <span>⭐ Topla</span>
            <span className="text-orange-400">•</span>
            <span>☄️ Vur</span>
            {unclaimedYield > 0.001 && onClaimAll && (
              <>
                <span className="text-orange-400">•</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClaimAll();
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold font-mono underline ml-0.5"
                >
                  ${unclaimedYield.toFixed(2)} Al
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Quick Fleet Drawer Button */}
            {onOpenFleetDrawer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFleetDrawer();
                }}
                className="flex items-center gap-1 bg-[#120722]/90 hover:bg-[#1e0e33] border border-orange-500/40 text-amber-300 text-[9px] font-bold font-display px-2 py-1 rounded-lg transition shadow-md active:scale-95"
                title="Filo Birimlerini ve Madencileri İncele"
              >
                <Bot className="w-3 h-3 text-orange-400" />
                <span>Filom ({userMiners.length})</span>
              </button>
            )}

            {/* Hyper-Warp Drive Booster Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playUpgrade();
                sounds.triggerHaptic('medium');
                setIsWarpBoosting(true);
                setWarpSpeed(6.8);
                confetti({
                  particleCount: 30,
                  spread: 50,
                  origin: { x: 0.8, y: 0.8 },
                  colors: ['#f97316', '#38bdf8', '#fbbf24'],
                });
                setTimeout(() => {
                  setIsWarpBoosting(false);
                  setWarpSpeed(3.6);
                }, 4000);
              }}
              disabled={isWarpBoosting}
              className={`flex items-center gap-1 text-[9px] font-black uppercase font-display px-2 py-1 rounded-lg transition shadow-lg active:scale-95 ${
                isWarpBoosting
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-slate-950" />
              <span>{isWarpBoosting ? 'WARP 6.8!' : 'WARP HIZ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
