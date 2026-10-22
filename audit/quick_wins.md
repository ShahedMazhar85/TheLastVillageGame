# Quick Wins

Small, low-risk changes (each about 15–60 minutes) that make a visible difference. None of them change gameplay.

## Top 5 quick wins

### 1. Unify outlines, shadows and remove ghosting (~30 min)
- Define two constants: `OUTLINE = '#2a1d14'` and `OUTLINE_W = 2.5`. Use them on the core, forge, towers, enemies and player.
- Remove the white outline from the player. Give the player a distinct fill colour instead (see quick win 5).
- Offset every shadow ellipse a little to the bottom-right (`+3, +4`) and soften it with a radial gradient instead of a flat fill.
- Draw the cottages at full opacity.

**Effect:** everything immediately looks like one art set.

### 2. Real fonts and a type scale (~30 min)
- Load two Google Fonts:
  - A display face (**Cinzel** or **MedievalSharp**) for the title, end screens and horde warning.
  - A rounded sans (**Nunito**, weights 700 and 800) for numbers and labels.
- Use 4 sizes only: 12 / 15 / 20 / 32, scaled up on small windows.
- Raise the footer to 14px at 85% opacity.
- Add a 2px dark text stroke behind the HUD numbers (`strokeText` before `fillText`) so they read on any background.

**Effect:** the single fastest jump from "prototype" to "game".

### 3. Replace emoji with drawn icons (~45 min)
- On the start screen, swap 🎯🪙🏗️⬆️🏰🔨 for small inline SVGs that match the game:
  - A coin.
  - A crosshair.
  - A tower outline.
  - An up arrow.
  - A castle.
  - An anvil.
- Use the same gold-on-dark style for all of them.
- In the HUD, add a small castle or heart icon before the "Town" bar to match the coin icon on the gold counter.

**Effect:** removes the strongest cheap-template signal, and the icons look the same on every OS.

### 4. Juice for the gold counter and coins (~45 min)
- When a coin is collected, instead of deleting it, keep it as a "flying coin": tween it in screen space to the HUD coin icon over 0.35s with ease-in.
- When it arrives, increment the visible gold and scale-bump the number (1.0 → 1.25 → 1.0 over 0.15s).
- Show the displayed gold counting up toward the real value.
- Give each coin on the ground a soft additive glow and a slow bob (`y + sin(t*4)*1.5`).
- Add a dark outline to coins so they stand out on the tan ground.

**Effect:** the reward moment, which is the core loop, suddenly feels great.

### 5. Better hit and death feedback (~45 min)
- **Hit:** replace the pure white fill with a 70% white overlay, plus a 1.15× scale pop that settles back over 0.1s.
- **Death:**
  - Spawn a short "pop" ring: a circle stroke expanding from `r` to `r*2` while fading.
  - Add 6–10 particles in the enemy's colour plus 3 grey smoke puffs that grow and fade.
  - Drop a dark splat decal that fades over 4s.
- **Player:** give the player a distinct look (teal fill with a darker cape crescent behind, and a 1-frame muzzle flash: a small yellow star at the barrel tip each shot).

**Effect:** shooting feels punchy, and the player never blends in with the towers.

## Extra quick wins

- **Show price labels only when relevant.** Show full-colour labels when affordable. Show grey labels only while hovered or within 150px of the player. This cuts clutter by half.
- **Permanent soft vignette** (8–12% black at the edges) to frame the play area. Increase it and tint it red at low HP, as now.
- **Add-blend bullet glow:** draw bullets with `globalCompositeOperation = 'lighter'` and a soft radial sprite.
- **Tower recoil:** when a tower fires, pull the barrel back 4px and ease it out over 0.12s. Add a muzzle flash.
- **Enemy walk bob:** `y += Math.abs(Math.sin(t * speed * .12)) * -2`, plus a slight squash at the low point.
- **HP bar polish:** dark frame, a light highlight strip on top of the fill, and a white "lag" segment that trails the real value when damage is taken.
- **Horde warning:** add a red pulsing chevron at the screen edge where the horde spawns, plus a low drum hit sound.
- **Hover ring:** make it rotate slowly with dashes, or use a soft glow, instead of a static stroke.
