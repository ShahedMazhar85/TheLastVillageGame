// Game tunables and shared style constants. W x H is the logical world size; the canvas scales it to fit.

const W = 1280, H = 800;
const CFG = {
  duration: 600,
  startGold: 30,
  core: { x: 640, y: 400, r: 44, maxHp: 200, repairHp: 50, repairCost: 25 },
  forge: { x: 515, y: 400, r: 32 },
  spots: [[515, 275], [765, 275], [515, 525], [765, 525]],
  // weapon[i].cost = price to reach level i+1
  weapon: [
    { dmg: 10, interval: .25, shots: 1 },
    { dmg: 15, interval: .25, shots: 1, cost: 50 },
    { dmg: 15, interval: .20, shots: 1, cost: 80 },
    { dmg: 15, interval: .20, shots: 3, cost: 120 },
    { dmg: 20, interval: .17, shots: 3, cost: 170 },
    { dmg: 26, interval: .14, shots: 3, cost: 230 },
  ],
  // tower[0].cost = build price, the rest are upgrade prices
  tower: [
    { range: 160, dmg: 8,  interval: .80, cost: 40 },
    { range: 180, dmg: 12, interval: .60, cost: 60 },
    { range: 200, dmg: 16, interval: .45, cost: 100 },
    { range: 220, dmg: 22, interval: .35, cost: 160 },
  ],
  enemy: {
    runner: { r: 11, speed: 110, hp: 20, dmg: 2,  gold: 3,  coins: 1, color: '#e05a47' },
    brute:  { r: 20, speed: 45,  hp: 90, dmg: 6,  gold: 10, coins: 3, color: '#8d5bc1' },
  },
  // Continuous pressure: everything ramps with elapsed time t (seconds)
  difficulty: {
    firstSpawn: 1.2,
    spawnIntervalStart: 2.0, spawnIntervalEnd: .3, spawnJitter: [.75, 1.25],
    bruteShareStart: .1, bruteShareEnd: .45,
    hpGrowthSec: 180,            // enemy HP multiplier = 1 + t / hpGrowthSec
    hordeEvery: 60, hordeBaseSize: 5, hordeGrowthSec: 60, hordeSpread: .35,
  },
  enemyAttack: { first: .4, interval: 1 },
  spotR: 28,
  playerStart: { x: 770, y: 400 },
  playerSpeed: 220, playerR: 14,
  bulletSpeed: 650, towerBulletSpeed: 520,
  bulletLife: 1.1, bulletR: 4, muzzle: 22, spread: .14,
  magnet: 110, pickup: 20, coinLife: 25,
  magnetPull: 260, magnetPullBoost: 5, coinFriction: 5,
  coinFlightSec: .45, goldBumpSec: .18,
  hitFlashSec: .08, lungeSec: .15,
};

const OUTLINE = '#2a1d14', OUTLINE_W = 2.5;
const FONT = 'Nunito, system-ui, sans-serif', TITLE_FONT = 'Cinzel, Georgia, serif';
