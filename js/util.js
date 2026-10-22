// Small math helpers and the seedable random generator, shared as plain globals.

// Deterministic generator: returns a function giving floats in [0, 1)
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Game RNG; seedable so tests can replay a run exactly (unseeded = Math.random)
let random = Math.random;
function seedRandom(n) { random = mulberry32(n); }
const rand = (a, b) => a + random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const decay = (v, dt) => Math.max(0, v - dt); // count a timer down to 0
// Move obj out to distance `min` from center if it is closer
function pushOutside(obj, center, min) {
  const d = dist(obj, center);
  if (d < min && d > 0) { obj.x = center.x + (obj.x - center.x) / d * min; obj.y = center.y + (obj.y - center.y) / d * min; }
}
const fmtTime = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
