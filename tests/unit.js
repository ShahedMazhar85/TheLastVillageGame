// Unit tests for the game rules. Sim, CFG and the helpers are loaded directly (no canvas or DOM needed).
(() => {
  function eq(actual, expected, what) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }
  const idle = (extra = {}) => ({ move: { x: 0, y: 0 }, aim: { x: 0, y: 0 }, firing: false, ...extra });
  function run(seconds, input = idle()) {
    for (let i = 0; i < Math.round(seconds * 60); i++) Sim.update(1 / 60, input);
  }
  function fresh() {
    seedRandom(1);
    Sim.reset();
    const S = Sim.state;
    S.spawnCooldown = 1e9; // no surprise spawns unless a test wants them
    return S;
  }
  function addRunner(x, y) {
    const d = CFG.enemy.runner;
    const e = { type: 'runner', x, y, r: d.r, speed: d.speed, hp: d.hp, maxHp: d.hp, dmg: d.dmg, gold: d.gold,
      coins: d.coins, attackTimer: CFG.enemyAttack.first, hitFlash: 0, vx: 0, vy: 0, lunge: 0 };
    Sim.state.enemies.push(e);
    return e;
  }
  const lastText = () => Sim.state.texts[Sim.state.texts.length - 1].text;
  const sum = list => list.reduce((a, b) => a + b, 0);

  window.unitTests = {
    'build: costs the first tower price and creates a level-1 tower'() {
      const S = fresh();
      S.gold = CFG.tower[0].cost;
      Sim.interact(S.spots[0]);
      eq(S.spots[0].level, 0, 'tower level');
      eq(S.gold, 0, 'gold left');
    },
    'build: not enough gold changes nothing and says how much is missing'() {
      const S = fresh();
      S.gold = CFG.tower[0].cost - 1;
      Sim.interact(S.spots[0]);
      eq(S.spots[0].level, -1, 'tower level');
      eq(S.gold, CFG.tower[0].cost - 1, 'gold left');
      eq(lastText(), 'Need 1 more gold', 'message');
    },
    'tower: upgrades follow CFG prices and stop at max level'() {
      const S = fresh();
      S.gold = 1000;
      for (let i = 0; i < CFG.tower.length + 1; i++) Sim.interact(S.spots[1]);
      eq(S.spots[1].level, CFG.tower.length - 1, 'tower level');
      eq(S.gold, 1000 - sum(CFG.tower.map(t => t.cost)), 'gold left');
      eq(lastText(), 'Tower is maxed out', 'message');
    },
    'forge: weapon upgrades follow CFG prices and stop at max level'() {
      const S = fresh();
      S.gold = 5000;
      for (let i = 0; i < CFG.weapon.length + 1; i++) Sim.interact(S.forge);
      eq(S.weaponLevel, CFG.weapon.length - 1, 'weapon level');
      eq(S.gold, 5000 - sum(CFG.weapon.slice(1).map(w => w.cost)), 'gold left');
    },
    'forge: upgrade info describes the next level'() {
      fresh();
      const info = Sim.upgradeInfo(Sim.state.forge);
      eq(info.cost, CFG.weapon[1].cost, 'cost');
      eq(info.desc, `Upgrade: Damage ${CFG.weapon[0].dmg}→${CFG.weapon[1].dmg}`, 'description');
    },
    'core: repair heals and caps at max health'() {
      const S = fresh();
      S.gold = 100;
      S.core.hp = CFG.core.maxHp - 20;
      Sim.interact(S.core);
      eq(S.core.hp, CFG.core.maxHp, 'health');
      eq(S.gold, 100 - CFG.core.repairCost, 'gold after repair');
      Sim.interact(S.core);
      eq(S.gold, 100 - CFG.core.repairCost, 'no charge at full health');
      eq(lastText(), 'Town is at full health', 'message');
    },
    'coins: pickup credits gold at once, then the coin flies to the counter'() {
      const S = fresh();
      const p = S.player;
      S.coins.push({ x: p.x + 5, y: p.y, vx: 0, vy: 0, value: 7, life: CFG.coinLife, phase: 0 });
      const before = S.gold;
      run(1 / 60);
      eq(S.gold, before + 7, 'gold credited');
      eq(S.coins.length, 0, 'coin removed');
      eq(S.flyingCoins.length, 1, 'coin in flight');
      run(CFG.coinFlightSec + .05);
      eq(S.flyingCoins.length, 0, 'coin landed');
      eq(S.goldBump > 0, true, 'counter bumps');
    },
    'towers: aim at the enemy in range that is closest to the core'() {
      const S = fresh();
      S.gold = 100;
      const spot = S.spots[0];
      Sim.interact(spot);
      addRunner(spot.x, spot.y - 125);            // in range, far from the core
      const near = addRunner(spot.x + 65, spot.y + 55); // in range, near the core
      run(1 / 60);
      const want = Math.atan2(near.y - spot.y, near.x - spot.x);
      eq(Math.abs(spot.angle - want) < .3, true, `tower angle ${spot.angle.toFixed(2)} vs ${want.toFixed(2)}`);
    },
    'enemies: damage the core on their attack timer'() {
      const S = fresh();
      const e = addRunner(S.core.x + S.core.r + CFG.enemy.runner.r - 3, S.core.y);
      run(CFG.enemyAttack.first + .05);
      eq(S.core.hp, CFG.core.maxHp - e.dmg, 'one hit landed');
      run(CFG.enemyAttack.interval);
      eq(S.core.hp, CFG.core.maxHp - 2 * e.dmg, 'second hit after the interval');
    },
    'flow: surviving the full duration wins'() {
      const S = fresh();
      S.t = CFG.duration - .01;
      Sim.update(.02, idle());
      eq(S.outcome, 'win', 'outcome');
      eq(S.t, CFG.duration, 'clock stops at the duration');
    },
    'flow: core at 0 health loses'() {
      const S = fresh();
      S.core.hp = 1;
      const e = addRunner(S.core.x + S.core.r + CFG.enemy.runner.r - 3, S.core.y);
      e.attackTimer = .001;
      Sim.update(1 / 60, idle());
      eq(S.outcome, 'lose', 'outcome');
      eq(S.core.hp, 0, 'health clamps to 0');
    },
    'spawning: horde size grows each minute'() {
      const S = fresh();
      S.t = 179.99; S.nextHorde = 180;
      Sim.update(.02, idle());
      eq(S.enemies.length, CFG.difficulty.hordeBaseSize + 3, 'horde at minute 3');
      eq(S.toast, 'A horde approaches!', 'warning shown');
    },
    'clicks: an enemy under the cursor beats the building behind it'() {
      const S = fresh();
      const point = { x: S.core.x, y: S.core.y - 50 };
      eq(Sim.objectAt(point) === S.core, true, 'core is clickable');
      addRunner(point.x, point.y);
      eq(Sim.objectAt(point), null, 'enemy takes priority');
    },
  };
})();
