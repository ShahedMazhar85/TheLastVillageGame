// Canvas setup and all drawing. API: Render.draw(view), Render.toWorld(screenX, screenY), Render.canvas
// Reads game state only; never changes it.
const Render = (() => {

  // ---------- Canvas / scaling ----------
  const canvas = document.getElementById('game');
  // Per-frame inputs, set by draw()
  let S, mode, hovered, pointer, muted;
  const ctx = canvas.getContext('2d');
  let scale = 1, offsetX = 0, offsetY = 0, dpr = 1;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    scale = Math.min(innerWidth / W, innerHeight / H) || 1;
    offsetX = (innerWidth - W * scale) / 2;
    offsetY = (innerHeight - H * scale) / 2;
  }
  addEventListener('resize', resize);
  resize();

  function fillCircle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  const hpColor = f => f > .5 ? '#6ad06a' : f > .25 ? '#f0c040' : '#e04848'; // f = health fraction

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // Static scenery (grass scenery, rocks); fixed seed so the layout is stable and never touches the game RNG
  const scenery = [];
  const sceneryRandom = mulberry32(2024);
  const sceneryRand = (a, b) => a + sceneryRandom() * (b - a);
  for (let i = 0; i < 160; i++) {
    const x = sceneryRand(0, W), y = sceneryRand(0, H);
    if (Math.hypot(x - CFG.core.x, y - CFG.core.y) < 250) continue;
    scenery.push({ x, y, rock: sceneryRandom() < .12, s: sceneryRand(.7, 1.3) });
  }

  // ---------- Render ----------
  function drawGround() {
    ctx.fillStyle = '#3f6b3a';
    ctx.fillRect(0, 0, W, H);
    for (const t of scenery) {
      if (t.rock) {
        ctx.fillStyle = '#6f7a6a';
        ctx.beginPath(); ctx.ellipse(t.x, t.y, 7 * t.s, 5 * t.s, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = '#356030'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(t.x - 4 * t.s, t.y); ctx.lineTo(t.x - 6 * t.s, t.y - 7 * t.s);
        ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y - 9 * t.s);
        ctx.moveTo(t.x + 4 * t.s, t.y); ctx.lineTo(t.x + 6 * t.s, t.y - 7 * t.s);
        ctx.stroke();
      }
    }
    const c = CFG.core;
    const g = ctx.createRadialGradient(c.x, c.y, 40, c.x, c.y, 240);
    g.addColorStop(0, '#a58b62'); g.addColorStop(.85, '#8f7752'); g.addColorStop(1, '#7a6646');
    ctx.fillStyle = g;
    fillCircle(c.x, c.y, 235);
    // Wooden palisade ring
    ctx.strokeStyle = '#5c4129'; ctx.lineWidth = 7; ctx.setLineDash([16, 10]);
    ctx.beginPath(); ctx.arc(c.x, c.y, 238, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // A couple of cottages for flavor (not clickable)
    for (const [x, y] of [[640, 250], [640, 552]]) {
      shadow(x, y + 10, 22, 7);
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      ctx.fillStyle = '#c9b28a'; ctx.fillRect(x - 15, y - 8, 30, 19); ctx.strokeRect(x - 15, y - 8, 30, 19);
      ctx.fillStyle = '#8a4630';
      ctx.beginPath(); ctx.moveTo(x - 19, y - 7); ctx.lineTo(x, y - 23); ctx.lineTo(x + 19, y - 7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a3322'; ctx.fillRect(x - 4, y + 2, 8, 9);
    }
  }

  // Soft contact shadow, offset down-right (light comes from the top-left)
  function shadow(x, y, rx, ry) {
    ctx.save(); ctx.translate(x + 3, y + 4); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.6, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; fillCircle(0, 0, rx);
    ctx.restore();
  }

  function shakeOff(o) { return o.shake > 0 ? Math.sin(o.shake * 90) * 4 : 0; }

  function drawCore() {
    const c = S.core;
    ctx.save(); ctx.translate(c.x + shakeOff(c), c.y);
    shadow(0, 30, 50, 14);
    const stone = c.flash > 0 ? '#ffdede' : '#9aa0a6';
    ctx.fillStyle = stone; ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
    ctx.fillRect(-36, -26, 72, 58); ctx.strokeRect(-36, -26, 72, 58);
    for (let i = 0; i < 5; i++) { ctx.fillRect(-36 + i * 15.5, -36, 10, 11); ctx.strokeRect(-36 + i * 15.5, -36, 10, 11); }
    ctx.fillStyle = '#3a2a1c';
    ctx.beginPath(); ctx.moveTo(-11, 32); ctx.lineTo(-11, 12); ctx.arc(0, 12, 11, Math.PI, 0); ctx.lineTo(11, 32); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4b5056'; ctx.fillRect(-24, -12, 8, 12); ctx.fillRect(16, -12, 8, 12);
    ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(0, -66); ctx.stroke();
    ctx.fillStyle = '#d64545';
    const wave = Math.sin(performance.now() / 200) * 3;
    ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(24, -59 + wave); ctx.lineTo(0, -52); ctx.closePath(); ctx.fill();
    ctx.restore();
    // HP bar under the core
    const f = c.hp / CFG.core.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(c.x - 40, c.y + 40, 80, 9, 4); ctx.fill();
    ctx.fillStyle = hpColor(f);
    rrect(c.x - 39, c.y + 41, 78 * f, 7, 3); ctx.fill();
  }

  function drawForge() {
    const o = S.forge;
    ctx.save(); ctx.translate(o.x + shakeOff(o), o.y);
    shadow(0, 20, 36, 10);
    ctx.fillStyle = '#5a5f66'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
    ctx.fillRect(10, -38, 10, 22); ctx.strokeRect(10, -38, 10, 22); // chimney
    const flick = .6 + .4 * Math.sin(performance.now() / 90);
    ctx.fillStyle = `rgba(255,140,40,${.5 * flick})`;
    fillCircle(15, -42, 6 + 2 * flick);
    ctx.fillStyle = '#6b4a2f'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
    ctx.fillRect(-26, -12, 52, 34); ctx.strokeRect(-26, -12, 52, 34);
    ctx.fillStyle = '#3d2b1d';
    ctx.beginPath(); ctx.moveTo(-32, -12); ctx.lineTo(0, -34); ctx.lineTo(32, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = `rgba(255,${120 + 60 * flick},40,1)`;
    ctx.fillRect(-9, 2, 18, 20);
    // anvil sign
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(-20, -6, 12, 4); ctx.fillRect(-17, -2, 6, 5); ctx.fillRect(-20, 3, 12, 3);
    ctx.restore();
  }

  function drawSpot(s, hovered) {
    ctx.save(); ctx.translate(s.x + shakeOff(s), s.y);
    if (s.level < 0) {
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      fillCircle(0, 0, 26);
      ctx.strokeStyle = '#e9dbb4'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#e9dbb4'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
    } else {
      if (hovered) {
        ctx.fillStyle = 'rgba(155,213,255,.10)'; ctx.strokeStyle = 'rgba(155,213,255,.5)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, CFG.tower[s.level].range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      shadow(0, 16, 30, 10);
      ctx.fillStyle = '#7d8590'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const head = ['#5aa0d8', '#4b8fd0', '#3f7fc8', '#e0b030'][s.level];
      ctx.save(); ctx.rotate(s.angle);
      ctx.fillStyle = '#2f3338'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      ctx.fillRect(4, -4, 22, 8); ctx.strokeRect(4, -4, 22, 8);
      ctx.restore();
      ctx.fillStyle = head; ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 0; i <= s.level; i++) {
        ctx.fillStyle = '#ffd166';
        fillCircle(-((s.level) * 7) / 2 + i * 7, -30, 3);
      }
    }
    ctx.restore();
  }

  function drawLabel(o, hovered) {
    const info = Sim.upgradeInfo(o);
    if (!info.label) return;
    const can = info.cost && S.gold >= info.cost;
    const near = o === hovered || dist(o, S.player) < 150;
    const firstBuild = o.kind === 'spot' && o.level < 0 && !S.built; // keep the first goal visible
    if (!info.cost && o !== hovered) return; // MAX labels only on hover
    if (!can && !near && !firstBuild) return;
    const y = o.y + o.r + (o.kind === 'core' ? 26 : 20);
    ctx.font = `800 13px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(info.label).width + 16;
    const pulse = can ? .8 + .2 * Math.sin(performance.now() / 160) : 1;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = can ? 'rgba(60,40,10,.85)' : 'rgba(0,0,0,.5)';
    rrect(o.x - w / 2, y - 10, w, 20, 10); ctx.fill();
    if (can) { ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.fillStyle = can ? '#ffd166' : (info.cost ? '#bfb69e' : '#e8e0c8');
    ctx.fillText(info.label, o.x, y + 1);
    ctx.globalAlpha = 1;
  }

  function drawEnemy(e) {
    const d = CFG.enemy[e.type];
    const ang = Math.atan2(S.core.y - e.y, S.core.x - e.x);
    const l = e.lunge > 0 ? Math.sin(e.lunge / CFG.lungeSec * Math.PI) * 6 : 0;
    ctx.save(); ctx.translate(e.x + Math.cos(ang) * l, e.y + Math.sin(ang) * l);
    shadow(0, e.r * .7, e.r * 1.1, e.r * .4);
    if (e.type === 'brute') {
      ctx.fillStyle = '#e8dcc0'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      for (const sgn of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(sgn * 10, -14); ctx.lineTo(sgn * 20, -28); ctx.lineTo(sgn * 16, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : d.color; ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
    ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const ex = Math.cos(ang) * e.r * .35, ey = Math.sin(ang) * e.r * .35, eyeR = e.r * .22;
    for (const sgn of [-1, 1]) {
      const px = ex + Math.cos(ang + Math.PI / 2) * sgn * e.r * .38, py = ey + Math.sin(ang + Math.PI / 2) * sgn * e.r * .38;
      ctx.fillStyle = '#fff'; fillCircle(px, py, eyeR);
      ctx.fillStyle = '#111'; fillCircle(px + Math.cos(ang) * eyeR * .4, py + Math.sin(ang) * eyeR * .4, eyeR * .5);
    }
    ctx.restore();
    if (e.hp < e.maxHp) {
      const w = e.r * 2;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(e.x - w / 2, e.y - e.r - 9, w, 4);
      ctx.fillStyle = '#ff5a5a'; ctx.fillRect(e.x - w / 2, e.y - e.r - 9, w * Math.max(0, e.hp / e.maxHp), 4);
    }
  }

  function drawPlayer() {
    const p = S.player;
    ctx.save(); ctx.translate(p.x, p.y);
    shadow(0, 10, 17, 6);
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = OUTLINE_W;
    ctx.save(); ctx.rotate(p.angle);
    ctx.fillStyle = '#b83245'; // cape trails behind the aim
    ctx.beginPath(); ctx.moveTo(-2, -15); ctx.quadraticCurveTo(-30, 0, -2, 15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a3f47'; ctx.lineWidth = 2;
    ctx.fillRect(6, -4, 20, 8); ctx.strokeRect(6, -4, 20, 8);
    if (S.weaponLevel >= 3) { for (const barrelY of [-10, 6]) { ctx.fillRect(6, barrelY, 15, 4); ctx.strokeRect(6, barrelY, 15, 4); } }
    ctx.restore();
    ctx.fillStyle = '#22b3a6'; ctx.lineWidth = OUTLINE_W;
    ctx.beginPath(); ctx.arc(0, 0, CFG.playerR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    fillCircle(-4, -4, 5);
    ctx.restore();
  }

  function drawTooltip(o) {
    const info = Sim.upgradeInfo(o);
    const lines = [info.desc];
    if (info.cost) lines.push(S.gold >= info.cost ? `Click to buy · ${info.cost} gold` : `Costs ${info.cost} gold (you have ${S.gold})`);
    ctx.font = `800 15px ${FONT}`;
    let w = ctx.measureText(info.title).width;
    ctx.font = `700 13px ${FONT}`;
    for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
    w += 24;
    const h = 30 + lines.length * 19;
    const m = pointer;
    const x = clamp(m.x + 18, 4, W - w - 4), y = clamp(m.y + 18, 4, H - h - 4);
    ctx.fillStyle = 'rgba(30,24,16,.94)'; ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2;
    rrect(x, y, w, h, 8); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffd166'; ctx.font = `800 15px ${FONT}`;
    ctx.fillText(info.title, x + 12, y + 9);
    ctx.font = `700 13px ${FONT}`;
    lines.forEach((l, i) => {
      ctx.fillStyle = i === 1 ? (S.gold >= info.cost ? '#8fe08f' : '#ff8b7b') : '#e8e0c8';
      ctx.fillText(l, x + 12, y + 32 + i * 19);
    });
  }

  function drawCoin(x, y, r) {
    ctx.fillStyle = '#b8860b';
    fillCircle(x, y + 1.5, r);
    ctx.fillStyle = '#ffd166'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff3c4';
    fillCircle(x - r * .35, y - r * .35, r * .3);
  }

  const HUD_COIN = { x: 38, y: 32 };
  function drawFlyingCoins() {
    for (const f of S.flyingCoins) {
      const e = f.t * f.t; // ease-in toward the counter
      const x = lerp(f.x0, HUD_COIN.x, e), y = lerp(f.y0, HUD_COIN.y, e) - Math.sin(f.t * Math.PI) * 40;
      drawCoin(x, y, lerp(6, 9, f.t));
    }
  }

  function drawCastleIcon(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#c7ccd1'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, 8); ctx.lineTo(-9, -7); ctx.lineTo(-5, -7); ctx.lineTo(-5, -3); ctx.lineTo(-2, -3); ctx.lineTo(-2, -7);
    ctx.lineTo(2, -7); ctx.lineTo(2, -3); ctx.lineTo(5, -3); ctx.lineTo(5, -7); ctx.lineTo(9, -7); ctx.lineTo(9, 8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = OUTLINE; ctx.fillRect(-2, 2, 4, 6);
    ctx.restore();
  }

  // HUD numbers get a dark stroke so they read on any background
  function hudText(text, x, y) {
    ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.6)';
    ctx.strokeText(text, x, y); ctx.fillText(text, x, y);
  }

  function drawHUD() {
    ctx.textBaseline = 'middle';
    // Gold
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rrect(14, 12, 150, 40, 10); ctx.fill();
    const bump = S.goldBump > 0 ? 1 + .25 * Math.sin(S.goldBump / CFG.goldBumpSec * Math.PI) : 1;
    const shown = Math.max(0, S.gold - S.flyingCoins.reduce((a, f) => a + f.value, 0));
    ctx.save(); ctx.translate(HUD_COIN.x, HUD_COIN.y); ctx.scale(bump, bump); drawCoin(0, 0, 11); ctx.restore();
    ctx.save(); ctx.translate(58, 33); ctx.scale(bump, bump);
    ctx.fillStyle = '#ffd166'; ctx.font = `800 24px ${FONT}`; ctx.textAlign = 'left';
    hudText(shown, 0, 0);
    ctx.restore();
    // Timer
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rrect(W / 2 - 120, 12, 240, 46, 10); ctx.fill();
    ctx.fillStyle = '#f4ecd8'; ctx.textAlign = 'center'; ctx.font = `800 20px ${FONT}`;
    hudText(`Survive  ${fmtTime(S.t)} / ${fmtTime(CFG.duration)}`, W / 2, 28);
    ctx.fillStyle = 'rgba(255,255,255,.15)'; rrect(W / 2 - 104, 44, 208, 6, 3); ctx.fill();
    ctx.fillStyle = '#ffd166'; rrect(W / 2 - 104, 44, 208 * (S.t / CFG.duration), 6, 3); ctx.fill();
    // Town HP
    const f = S.core.hp / CFG.core.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rrect(W - 274, 12, 260, 40, 10); ctx.fill();
    ctx.fillStyle = '#f4ecd8'; ctx.font = `800 15px ${FONT}`; ctx.textAlign = 'left';
    drawCastleIcon(W - 250, 32);
    ctx.fillStyle = 'rgba(255,255,255,.15)'; rrect(W - 214, 24, 188, 16, 6); ctx.fill();
    ctx.fillStyle = hpColor(f);
    rrect(W - 214, 24, 188 * f, 16, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 12px ${FONT}`; ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(S.core.hp)} / ${CFG.core.maxHp}`, W - 120, 33);
    // Footer
    ctx.font = `700 14px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(244,236,216,.85)';
    ctx.fillText(`Kills ${S.kills}   ·   Weapon Lv${S.weaponLevel + 1}   ·   M: sound ${muted ? 'off' : 'on'}`, 16, H - 16);
    // Early hint
    if (mode === 'play' && S.t < 40) {
      ctx.globalAlpha = S.t > 32 ? (40 - S.t) / 8 : 1;
      const msg = S.built ? 'Keep shooting, grab the gold, and click glowing labels to upgrade'
                          : 'Shoot enemies · walk over their gold · click a glowing “Build” spot';
      ctx.font = `800 16px ${FONT}`; ctx.textAlign = 'center';
      const w = ctx.measureText(msg).width + 30;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; rrect(W / 2 - w / 2, H - 58, w, 32, 16); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(msg, W / 2, H - 41);
      ctx.globalAlpha = 1;
    }
    // Toast
    if (S.toastTime > 0) {
      ctx.globalAlpha = Math.min(1, S.toastTime);
      ctx.font = `900 32px ${TITLE_FONT}`; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(S.toast, W / 2 + 2, 102);
      ctx.fillStyle = '#ff8b6b'; ctx.fillText(S.toast, W / 2, 100);
      ctx.globalAlpha = 1;
    }
  }

  let lastCursor = '';
  // view: { state, mode, hovered, pointer (world point), muted }
  function draw(view) {
    ({ state: S, mode, hovered, pointer, muted } = view);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1b2418';
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    // Screen shake uses Math.random so drawing never consumes the seeded game RNG
    const sx = S.shake > 0 ? (Math.random() * 2 - 1) * S.shake : 0, sy = S.shake > 0 ? (Math.random() * 2 - 1) * S.shake : 0;
    const base = (dx, dy) => ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (offsetX + dx * scale), dpr * (offsetY + dy * scale));
    base(sx, sy);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();

    const cursor = hovered ? 'pointer' : 'crosshair';
    if (cursor !== lastCursor) { canvas.style.cursor = cursor; lastCursor = cursor; }

    drawGround();
    if (hovered) {
      ctx.strokeStyle = 'rgba(255,209,102,.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(hovered.x, hovered.y, hovered.r + 10, 0, Math.PI * 2); ctx.stroke();
    }
    for (const s of S.spots) drawSpot(s, s === hovered);
    drawForge();
    drawCore();
    for (const c of S.coins) {
      if (c.life < 5 && Math.floor(c.life * 8) % 2) continue;
      const cy = c.y + Math.sin(performance.now() / 250 + c.phase) * 1.5;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,190,70,.22)';
      fillCircle(c.x, cy, 13);
      ctx.globalCompositeOperation = 'source-over';
      drawCoin(c.x, cy, 6);
    }
    for (const e of S.enemies) drawEnemy(e);
    for (const b of S.bullets) {
      ctx.strokeStyle = b.tower ? 'rgba(155,213,255,.5)' : 'rgba(255,224,138,.5)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .025, b.y - b.vy * .025); ctx.stroke();
      ctx.fillStyle = b.tower ? '#bfe4ff' : '#fff1b8';
      fillCircle(b.x, b.y, b.r);
    }
    drawPlayer();
    for (const q of S.particles) {
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.color;
      fillCircle(q.x, q.y, q.r);
    }
    ctx.globalAlpha = 1;
    for (const o of Sim.objects()) drawLabel(o, hovered);
    ctx.font = `800 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const t of S.texts) {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(t.text, t.x + 1, t.y + 1);
      ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Screen-space-ish layers (no shake)
    base(0, 0);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    const f = S.core.hp / CFG.core.maxHp;
    if (mode === 'play' && f < .3) {
      const a = (.3 - f) / .3 * (.45 + .2 * Math.sin(performance.now() / 180));
      const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .7);
      g.addColorStop(0, 'rgba(200,0,0,0)'); g.addColorStop(1, `rgba(200,0,0,${a})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    drawHUD();
    drawFlyingCoins();
    if (hovered) drawTooltip(hovered);
    ctx.restore();
  }

  return {
    canvas, draw,
    toWorld: (sx, sy) => ({ x: (sx - offsetX) / scale, y: (sy - offsetY) / scale }),
  };
})();
