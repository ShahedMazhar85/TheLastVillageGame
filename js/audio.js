// Tiny WebAudio sound effects. API: Sound.play(name), Sound.toggleMute(), Sound.muted
const Sound = (() => {
  let ac = null, muted = false;
  const SFX = {
    shoot: ['square', 600, 320, .05, .025],
    tower: ['triangle', 900, 500, .06, .03],
    hit:   ['sawtooth', 160, 70, .12, .07],
    kill:  ['triangle', 300, 120, .1, .05],
    coin:  ['sine', 900, 1400, .08, .06],
    up:    ['triangle', 440, 990, .25, .1],
    deny:  ['square', 200, 150, .12, .05],
  };
  function play(name) {
    if (muted) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      const [type, f0, f1, dur, vol] = SFX[name];
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) { /* audio is optional */ }
  }

  return { play, toggleMute() { muted = !muted; }, get muted() { return muted; } };
})();
