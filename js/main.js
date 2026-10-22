// Input, game flow, main loop and the test hook.
(() => {

  // ---------- Input ----------
  const keys = {};
  const mouse = { sx: 0, sy: 0, down: false };
  let aimOverride = null; // set by tests to aim in exact world coordinates
  const mouseWorld = () => aimOverride || Render.toWorld(mouse.sx, mouse.sy);
  const canvas = Render.canvas;
  let mode = 'start';
  Sim.onSound = Sound.play;

  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyM') Sound.toggleMute();
    if ((e.code === 'Enter' || e.code === 'Space') && mode !== 'play') { e.preventDefault(); startGame(); }
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.down = false; });
  canvas.addEventListener('mousemove', e => { mouse.sx = e.clientX; mouse.sy = e.clientY; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('mousedown', e => {
    mouse.sx = e.clientX; mouse.sy = e.clientY;
    if (e.button !== 0 || mode !== 'play') return;
    const o = Sim.objectAt(mouseWorld());
    if (o) Sim.interact(o); else mouse.down = true;
  });
  addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; });

  function readInput() {
    let mx = 0, my = 0;
    if (keys.KeyW || keys.ArrowUp) my--;
    if (keys.KeyS || keys.ArrowDown) my++;
    if (keys.KeyA || keys.ArrowLeft) mx--;
    if (keys.KeyD || keys.ArrowRight) mx++;
    return { move: { x: mx, y: my }, aim: mouseWorld(), firing: mouse.down };
  }

  // ---------- Flow ----------
  const startScreen = document.getElementById('startScreen');
  const endScreen = document.getElementById('endScreen');
  function startGame() {
    Sim.reset();
    mode = 'play';
    mouse.down = false;
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
  }
  function endGame(win) {
    const S = Sim.state;
    mode = 'end';
    mouse.down = false;
    document.getElementById('endTitle').textContent = win ? 'You saved the village!' : 'The village has fallen';
    document.getElementById('endText').textContent = win
      ? `You held out for 10 minutes and defeated ${S.kills} enemies.`
      : `You survived ${fmtTime(S.t)} and defeated ${S.kills} enemies.`;
    endScreen.classList.remove('hidden');
  }
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('againBtn').addEventListener('click', startGame);

  function step(dt) {
    Sim.update(dt, readInput());
    const outcome = Sim.state.outcome;
    if (outcome) endGame(outcome === 'win');
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (mode === 'play' && !document.hidden) step(dt);
    Render.draw({ state: Sim.state, mode, hovered: mode === 'play' ? Sim.objectAt(mouseWorld()) : null, pointer: mouseWorld(), muted: Sound.muted });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Debug/test hook
  // target: 'core' | 'forge' | tower spot index
  const objectFor = target => {
    const S = Sim.state;
    return target === 'core' ? S.core : target === 'forge' ? S.forge : S.spots[target];
  };
  window.__lv = {
    get state() { return Sim.state; }, get mode() { return mode; },
    start: startGame, gold(n) { Sim.state.gold += n; },
    setTime(t) { const S = Sim.state; S.t = t; S.nextHorde = Math.max(60, Math.ceil(t / 60) * 60); },
    tick(sec) { for (let i = 0; i < sec * 60 && mode === 'play'; i++) step(1 / 60); },
    // Stable test API: the golden tests only go through these, so internals can be renamed freely
    seed: seedRandom,
    aimWorld(x, y) { aimOverride = { x, y }; },
    fire(on) { mouse.down = on; },
    click(target) { Sim.interact(objectFor(target)); },
    // Draw one frame synchronously with a chosen hover target (render snapshot test)
    drawFrame(target) {
      Render.draw({ state: Sim.state, mode, hovered: target == null ? null : objectFor(target),
        pointer: { x: 700, y: 300 }, muted: false });
    },
    dropCoin(x, y, value) { Sim.state.coins.push({ x, y, vx: 0, vy: 0, value, life: CFG.coinLife, phase: 0 }); },
    view() {
      const S = Sim.state;
      return { player: S.player, core: S.core, enemies: S.enemies, coins: S.coins, gold: S.gold,
        weaponLevel: S.weaponLevel, towerLevels: S.spots.map(s => s.level), texts: S.texts.map(t => t.text) };
    },
    snapshot() {
      const S = Sim.state;
      const pos = list => Math.round(list.reduce((a, o) => a + o.x * 3 + o.y, 0));
      return { mode, t: +S.t.toFixed(3), gold: S.gold, hp: +S.core.hp.toFixed(3), kills: S.kills,
        weapon: S.weaponLevel, towers: S.spots.map(s => s.level).join(','), enemies: S.enemies.length,
        enemyHp: Math.round(S.enemies.reduce((a, e) => a + e.hp, 0)), enemyPos: pos(S.enemies),
        coins: S.coins.length, coinPos: pos(S.coins), bullets: S.bullets.length, flying: S.flyingCoins.length };
    },
  };
})();
