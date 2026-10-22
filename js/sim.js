// Game state and rules: upgrades, spawning, enemies, towers, bullets, coins. No DOM or canvas access.
// API: Sim.state, reset(), update(dt, input), interact(obj), upgradeInfo(obj), objects(), objectAt(point);
// main.js sets Sim.onSound. Win/loss is reported as Sim.state.outcome ('win' | 'lose').
// Inside, S is the current game state.
const Sim = (() => {

  // ---------- State ----------
  let S, lastCoinSfx = 0;
  function reset() {
    S = {
      t: 0, gold: CFG.startGold, kills: 0, weaponLevel: 0,
      core: { kind: 'core', x: CFG.core.x, y: CFG.core.y, r: CFG.core.r, hp: CFG.core.maxHp, shake: 0, flash: 0 },
      forge: { kind: 'forge', x: CFG.forge.x, y: CFG.forge.y, r: CFG.forge.r, shake: 0 },
      spots: CFG.spots.map(([x, y]) => ({ kind: 'spot', x, y, r: CFG.spotR, level: -1, cooldown: 0, angle: -Math.PI / 2, shake: 0 })),
      player: { x: CFG.playerStart.x, y: CFG.playerStart.y, angle: 0, cooldown: 0 },
      enemies: [], bullets: [], coins: [], particles: [], texts: [],
      spawnCooldown: CFG.difficulty.firstSpawn, nextHorde: CFG.difficulty.hordeEvery, flyingCoins: [], goldBump: 0, shake: 0, toast: '', toastTime: 0, built: false, outcome: null,
    };
  }
  reset();
  const objects = () => [S.core, S.forge, ...S.spots];

  // The clickable town object under a world point, if any
  function objectAt(point) {
    // An enemy under the cursor wins, so you can shoot enemies hugging the core
    if (S.enemies.some(e => dist(e, point) < e.r + 4)) return null;
    return objects().find(o => dist(o, point) < o.r + 8) || null;
  }

  // ---------- Upgrades ----------
  function upgradeInfo(o) {
    if (o.kind === 'core') {
      const max = CFG.core.maxHp;
      if (o.hp >= max) return { title: 'Town Core', desc: `Health ${Math.ceil(o.hp)}/${max} — protect it!`, label: '', full: 'Town is at full health' };
      return { title: 'Town Core', desc: `Health ${Math.ceil(o.hp)}/${max} · Repair +${CFG.core.repairHp} HP`,
        cost: CFG.core.repairCost, label: `Repair ${CFG.core.repairCost}g`,
        apply: () => { o.hp = Math.min(max, o.hp + CFG.core.repairHp); } };
    }
    if (o.kind === 'forge') {
      const level = S.weaponLevel;
      if (level >= CFG.weapon.length - 1) return { title: `Forge · Weapon Lv${level + 1}`, desc: 'Weapon fully upgraded', label: 'Weapon MAX', full: 'Weapon is maxed out' };
      const a = CFG.weapon[level], b = CFG.weapon[level + 1], parts = [];
      if (b.dmg > a.dmg) parts.push(`Damage ${a.dmg}→${b.dmg}`);
      if (b.interval < a.interval) parts.push(`Fire rate +${Math.round((a.interval / b.interval - 1) * 100)}%`);
      if (b.shots > a.shots) parts.push('Triple shot!');
      return { title: `Forge · Weapon Lv${level + 1}`, desc: 'Upgrade: ' + parts.join(', '), cost: b.cost,
        label: `Weapon ${b.cost}g`, apply: () => { S.weaponLevel++; } };
    }
    // tower spot
    if (o.level < 0) {
      const c = CFG.tower[0].cost;
      return { title: 'Empty Tower Spot', desc: 'Build a tower that shoots automatically', cost: c, label: `Build ${c}g`,
        apply: () => { o.level = 0; o.cooldown = .3; S.built = true; } };
    }
    if (o.level >= CFG.tower.length - 1) return { title: `Tower Lv${o.level + 1}`, desc: 'Tower fully upgraded', label: 'MAX', full: 'Tower is maxed out' };
    const a = CFG.tower[o.level], b = CFG.tower[o.level + 1];
    return { title: `Tower Lv${o.level + 1}`, desc: `Upgrade: range ${a.range}→${b.range}, damage ${a.dmg}→${b.dmg}, faster`,
      cost: b.cost, label: `Upgrade ${b.cost}g`, apply: () => { o.level++; } };
  }

  function interact(o) {
    const info = upgradeInfo(o), textY = o.y - o.r - 14;
    if (!info.cost) { floatText(o.x, textY, info.full, '#e8e0c8'); return; }
    if (S.gold < info.cost) {
      o.shake = .35;
      floatText(o.x, textY, `Need ${info.cost - S.gold} more gold`, '#ff7b6b');
      sfx('deny');
      return;
    }
    S.gold -= info.cost;
    info.apply();
    burst(o.x, o.y, '#ffd166', 22, 160);
    floatText(o.x, textY, o.kind === 'core' ? 'Repaired!' : 'Upgraded!', '#ffd166');
    sfx('up');
  }

  // ---------- Effects ----------
  function burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), s = rand(speed * .3, speed);
      S.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.3, .6), max: .6, color, r: rand(1.5, 3.5) });
    }
  }
  function floatText(x, y, text, color) { S.texts.push({ x, y, text, color, life: 1.1 }); }
  function toast(msg) { S.toast = msg; S.toastTime = 2.5; }

  // ---------- Game actions ----------
  function spawnEnemy(ang) {
    const progress = Math.min(1, S.t / CFG.duration);
    const diff = CFG.difficulty;
    const type = random() < lerp(diff.bruteShareStart, diff.bruteShareEnd, progress) ? 'brute' : 'runner';
    const d = CFG.enemy[type];
    if (ang === undefined) ang = rand(0, Math.PI * 2);
    const cx = Math.cos(ang), cy = Math.sin(ang);
    const k = Math.min((W / 2 + 30) / Math.max(Math.abs(cx), 1e-6), (H / 2 + 30) / Math.max(Math.abs(cy), 1e-6));
    const hp = d.hp * (1 + S.t / diff.hpGrowthSec);
    S.enemies.push({ type, x: CFG.core.x + cx * k, y: CFG.core.y + cy * k, r: d.r, speed: d.speed * rand(.9, 1.1),
      hp, maxHp: hp, dmg: d.dmg, gold: d.gold, coins: d.coins, attackTimer: CFG.enemyAttack.first, hitFlash: 0, vx: 0, vy: 0, lunge: 0 });
  }

  function killEnemy(e) {
    e.dead = true;
    S.kills++;
    const d = CFG.enemy[e.type];
    burst(e.x, e.y, d.color, e.type === 'brute' ? 20 : 12, 170);
    let left = e.gold;
    for (let i = 0; i < e.coins; i++) {
      const value = i === e.coins - 1 ? left : Math.floor(e.gold / e.coins);
      left -= value;
      const a = rand(0, Math.PI * 2), s = rand(30, 90);
      S.coins.push({ x: clamp(e.x, 12, W - 12), y: clamp(e.y, 50, H - 12), vx: Math.cos(a) * s, vy: Math.sin(a) * s, value, life: CFG.coinLife, phase: rand(0, 6) });
    }
    sfx('kill');
  }

  function damageCore(n) {
    const c = S.core;
    c.hp -= n; c.flash = .15;
    S.shake = Math.max(S.shake, n >= 6 ? 8 : 3);
    floatText(c.x + rand(-20, 20), c.y - 60, `-${n}`, '#ff6b6b');
    sfx('hit');
    if (c.hp <= 0) { c.hp = 0; S.outcome = 'lose'; }
  }

  function fireBullet(shooter, heading, speed, dmg, life, tower) {
    S.bullets.push({ x: shooter.x + Math.cos(shooter.angle) * CFG.muzzle, y: shooter.y + Math.sin(shooter.angle) * CFG.muzzle,
      vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed, dmg, life, r: CFG.bulletR, tower });
  }

  function firePlayer() {
    const p = S.player, w = CFG.weapon[S.weaponLevel];
    const spread = w.shots > 1 ? CFG.spread : 0;
    for (let i = 0; i < w.shots; i++) {
      fireBullet(p, p.angle + (i - (w.shots - 1) / 2) * spread, CFG.bulletSpeed, w.dmg, CFG.bulletLife, false);
    }
    sfx('shoot');
  }

  // ---------- Update ----------
  // input: { move: {x, y} (each -1..1), aim: world point, firing: bool }
  function update(dt, input) {
    S.t += dt;
    if (S.t >= CFG.duration) { S.t = CFG.duration; S.outcome = 'win'; return; }
    updatePlayer(dt, input);
    updateSpawning(dt);
    updateEnemies(dt);
    if (S.outcome) return; // the core fell this frame
    separateEnemies();
    updateTowers(dt);
    updateBullets(dt);
    updateCoins(dt);
    updateEffects(dt);
    removeDead();
  }

  function updatePlayer(dt, input) {
    const p = S.player;
    const mx = input.move.x, my = input.move.y;
    if (mx || my) {
      const l = Math.hypot(mx, my);
      p.x += mx / l * CFG.playerSpeed * dt;
      p.y += my / l * CFG.playerSpeed * dt;
    }
    for (const o of [S.core, S.forge]) pushOutside(p, o, o.r + CFG.playerR);
    p.x = clamp(p.x, CFG.playerR, W - CFG.playerR);
    p.y = clamp(p.y, CFG.playerR, H - CFG.playerR);
    const m = input.aim;
    p.angle = Math.atan2(m.y - p.y, m.x - p.x);
    p.cooldown -= dt;
    if (input.firing && p.cooldown <= 0) { firePlayer(); p.cooldown = CFG.weapon[S.weaponLevel].interval; }
  }

  // Steady stream that speeds up, plus a horde every minute
  function updateSpawning(dt) {
    const diff = CFG.difficulty, progress = S.t / CFG.duration;
    S.spawnCooldown -= dt;
    if (S.spawnCooldown <= 0) {
      spawnEnemy();
      S.spawnCooldown = lerp(diff.spawnIntervalStart, diff.spawnIntervalEnd, progress) * rand(...diff.spawnJitter);
    }
    if (S.t >= S.nextHorde) {
      S.nextHorde += diff.hordeEvery;
      const n = diff.hordeBaseSize + Math.floor(S.t / diff.hordeGrowthSec), ang = rand(0, Math.PI * 2);
      for (let i = 0; i < n; i++) spawnEnemy(ang + rand(-diff.hordeSpread, diff.hordeSpread));
      toast('A horde approaches!');
    }
  }

  // Walk to the core, then attack it on a timer
  function updateEnemies(dt) {
    const core = S.core;
    for (const e of S.enemies) {
      const dx = core.x - e.x, dy = core.y - e.y, d = Math.hypot(dx, dy) || 1;
      const stop = core.r + e.r - 2;
      if (d > stop) {
        e.vx = dx / d * e.speed; e.vy = dy / d * e.speed;
        e.x += e.vx * dt; e.y += e.vy * dt;
      } else {
        e.vx = e.vy = 0;
        e.attackTimer -= dt;
        if (e.attackTimer <= 0) { e.attackTimer = CFG.enemyAttack.interval; e.lunge = CFG.lungeSec; damageCore(e.dmg); if (S.outcome) return; }
      }
      e.hitFlash -= dt; e.lunge -= dt;
    }
  }

  // Light separation so enemies don't stack into one blob
  function separateEnemies() {
    const enemies = S.enemies, core = S.core;
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        const a = enemies[i], b = enemies[j];
        const dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r;
        if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
        const d = Math.hypot(dx, dy) || .01;
        if (d < min) {
          const push = (min - d) / 2, nx = dx / d, ny = dy / d;
          const wa = b.r / min, wb = a.r / min; // bigger enemies get shoved less
          a.x -= nx * push * wa * 1.6; a.y -= ny * push * wa * 1.6;
          b.x += nx * push * wb * 1.6; b.y += ny * push * wb * 1.6;
        }
      }
    }
    for (const e of enemies) pushOutside(e, core, core.r + e.r - 4); // never get pushed inside the core
  }

  // Each tower shoots the enemy in range that is closest to the core
  function updateTowers(dt) {
    const core = S.core;
    for (const s of S.spots) {
      if (s.level < 0) continue;
      const stats = CFG.tower[s.level];
      s.cooldown -= dt;
      let target = null, best = Infinity;
      for (const e of S.enemies) {
        if (e.dead || dist(e, s) > stats.range) continue;
        const dc = dist(e, core);
        if (dc < best) { best = dc; target = e; }
      }
      if (!target) continue;
      // Lead the target a little so fast enemies get hit
      const tt = dist(target, s) / CFG.towerBulletSpeed;
      const ax = target.x + target.vx * tt, ay = target.y + target.vy * tt;
      s.angle = Math.atan2(ay - s.y, ax - s.x);
      if (s.cooldown <= 0) {
        s.cooldown = stats.interval;
        fireBullet(s, s.angle, CFG.towerBulletSpeed, stats.dmg, stats.range / CFG.towerBulletSpeed + .25, true);
        sfx('tower');
      }
    }
  }

  function updateBullets(dt) {
    for (const b of S.bullets) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { b.dead = true; continue; }
      for (const e of S.enemies) {
        if (e.dead) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          e.hp -= b.dmg; e.hitFlash = CFG.hitFlashSec; b.dead = true;
          burst(b.x, b.y, b.tower ? '#9bd5ff' : '#ffe08a', 3, 90);
          if (e.hp <= 0) killEnemy(e);
          break;
        }
      }
    }
  }

  // Coins slide to a stop, get pulled toward a nearby player, and credit gold on pickup
  function updateCoins(dt) {
    const p = S.player;
    for (const c of S.coins) {
      c.life -= dt;
      if (c.life <= 0) { c.dead = true; continue; }
      c.x += c.vx * dt; c.y += c.vy * dt;
      c.vx *= Math.max(0, 1 - CFG.coinFriction * dt); c.vy *= Math.max(0, 1 - CFG.coinFriction * dt);
      const d = dist(c, p);
      if (d < CFG.pickup) {
        c.dead = true; S.gold += c.value;
        S.flyingCoins.push({ x0: c.x, y0: c.y, t: 0, value: c.value });
      } else if (d < CFG.magnet) {
        const sp = CFG.magnetPull + (CFG.magnet - d) * CFG.magnetPullBoost;
        c.x += (p.x - c.x) / d * sp * dt; c.y += (p.y - c.y) / d * sp * dt;
      }
    }
  }

  function updateEffects(dt) {
    for (const q of S.particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .9; q.vy *= .9; q.life -= dt; }
    for (const t of S.texts) { t.y -= 34 * dt; t.life -= dt; }
    for (const o of objects()) o.shake = decay(o.shake, dt);
    S.core.flash = decay(S.core.flash, dt);
    S.shake = decay(S.shake, 30 * dt);
    S.toastTime = decay(S.toastTime, dt);
    for (const f of S.flyingCoins) {
      f.t += dt / CFG.coinFlightSec;
      if (f.t >= 1) {
        f.dead = true; S.goldBump = CFG.goldBumpSec;
        if (S.t - lastCoinSfx > .05) { sfx('coin'); lastCoinSfx = S.t; }
      }
    }
    S.flyingCoins = alive(S.flyingCoins);
    S.goldBump = decay(S.goldBump, dt);
  }

  const alive = list => list.filter(o => !o.dead);
  function removeDead() {
    S.enemies = alive(S.enemies);
    S.bullets = alive(S.bullets);
    S.coins = alive(S.coins);
    S.particles = S.particles.filter(q => q.life > 0);
    S.texts = S.texts.filter(t => t.life > 0);
  }

  const api = {
    get state() { return S; },
    onSound: () => {}, // main.js plugs in the audio
    reset, update, interact, upgradeInfo, objects, objectAt,
  };
  function sfx(name) { api.onSound(name); }
  return api;
})();
