# Visual Summary — The Last Village

Scope: visuals, presentation and polish only. Gameplay and balance are out of scope.
Reviewed: `index.html` (all art is drawn in code with Canvas 2D; there are no image assets) and in-game screenshots of the start screen, mid-game at 03:32 and the end screen.

## Overall impression

The game reads clearly. Every object is easy to tell apart and the upgrade loop is easy to follow. It still looks like a **well-organised prototype** rather than a finished game. The main reasons:

- **The world is mostly empty.** About 75% of the screen is flat green with tiny grass strokes. Nothing on screen has depth.
- **Shapes look like diagrams.** The town is a tan disc with a dashed ring, tower spots are dashed circles with a "+", and the player is a plain circle. They work as icons but not as places or characters.
- **There is no lighting.** Every surface is one flat colour. Shadows are the same grey ellipse everywhere, and nothing glows or casts light.
- **The UI is generic.** It uses system fonts, translucent black pills, emoji on the start screen and a 12px footer that is hard to read.
- **Effects are thin.** Hits, kills, upgrades and coin pickups all use the same small burst of round dots. Nothing animates in or out.
- **Dark letterbox bars** show on any screen that isn't 16:10, so the game looks like it sits in a box.

## What already works (keep it)

- **Readability.** Silhouettes are distinct: the castle, forge, round towers, small red runners and horned purple brutes are recognisable at a glance.
- **A warm, coherent palette.** Gold, brown, stone grey and grass green already sit together well. The gold accent (`#ffd166`) is a good brand colour.
- **The castle flag** waves, and the forge has a flickering glow. Small touches like these are the right instinct.
- **Enemy eyes** that look toward the core give the enemies personality cheaply.
- **Glowing price labels and tooltips.** Gold pulse when affordable and grey when not is a good system that only needs restyling.
- **Low-HP red vignette and screen shake.** Both are good foundations for the damage feedback.

## Is there a clear style?

Partly. The game is heading toward **flat cartoon vector**, but with no rules: outline widths vary from 2 to 3px, outline colours vary (grey, brown, near-black), the player has a white outline that nothing else has, and the cottages are drawn at 75% opacity, so they look ghosted.

**Recommended direction: "storybook tabletop."** Think a lighter Kingdom Rush or Bad North:
- One warm light source from the top-left.
- Soft contact shadows.
- A consistent 2.5px dark-brown outline on every gameplay object.
- Slightly chunky proportions and a few gradients for volume.

All of this can stay procedural canvas code, with no art pipeline needed.

## What to improve first

1. **Fill and texture the world:** ground, path and palisade (biggest jump per hour of work).
2. **Unify the art rules:** outline, shadow and light direction.
3. **Upgrade feedback juice:** hit flashes, death pops, coins flying to the HUD, tower build animation.
4. **Restyle the HUD and panels:** a display font, framed panels, icons instead of emoji.

Details are in:
- [visual_problems.md](visual_problems.md)
- [quick_wins.md](quick_wins.md)
- [high_impact_upgrades.md](high_impact_upgrades.md)
- [visual_priority_plan.md](visual_priority_plan.md)

## Section-by-section notes

### Art style
- **Mismatched assets.**
  - The player (blue circle, white outline) shares a visual language with the tower heads (blue circle, dark outline), so the player can blend into the turrets near the core.
  - The cottages are semi-transparent and look like placeholders.
  - The start screen uses OS emoji (🎯🪙🏗️), which look different on each platform and clash with the drawn art.
- **Too simple.**
  - Tower spots and the town ring are drawn as dashed strokes, a UI convention rather than world art.
  - Towers are a disc on a disc with a black rectangle barrel, and there is little visual difference between levels 1 and 3. Only the head colour shifts slightly, plus the pips.
- **Blurry or stretched:** nothing. Drawing respects `devicePixelRatio`, so lines stay crisp when scaled.

### Color and lighting
- The colours are attractive but have **low value contrast in the middle of the screen**. The tan town floor (`#a58b62`), grey castle and grey towers are all mid-tones, so they blur together. The light HP bar and price pills are what separate them.
- Enemies separate well from the grass (red and purple on green). Coins on the tan ground are weaker: yellow on tan.
- **Missing:**
  - Ambient occlusion where objects meet the ground.
  - Lit faces versus shadowed faces on buildings.
  - Glow on bullets, coins and the forge.
  - A subtle permanent vignette to frame the play area.
  - Atmosphere such as drifting light motes, embers or a day-to-dusk shift over the 10 minutes.

### UI quality
- **HUD panels** are plain `rgba(0,0,0,.5)` rounded rectangles: functional, but basic.
  - Gold has a coin icon, but "Town" is just a word.
  - The timer reads "Survive 03:32 / 10:00". That's clear, but the small progress bar is visually weak.
- **Fonts:** everything is `system-ui`, which looks different on Mac and Windows and has no character. Sizes jump between 12, 13, 15, 16, 20, 24 and 30px with no type scale.
- **Footer** (Kills, Weapon, Sound) is 12px at 60% opacity, and is hard to read once scaled down on smaller windows.
- **World labels:** six price pills are visible at once. The greyed-out ones add clutter without telling the player anything they can act on.
- **Start and end panels** (brown with a gold border) are decent, but read as a generic web modal: emoji bullet list, flat button, no art, no logo treatment.

### Animation and feedback
- **Present:**
  - Particle bursts.
  - Floating text.
  - Screen shake on core hits.
  - Enemy hit flash (a full white fill for 0.08s).
  - Enemy lunge when attacking.
  - Object shake on "not enough gold".
- **Missing or stiff:**
  - Enemies glide with no walk bob or squash.
  - Deaths just vanish into dots.
  - Towers have no recoil or muzzle flash.
  - Building a tower pops it in on one frame.
  - Coins vanish on pickup, and the gold counter doesn't react.
  - Upgrading the weapon has no visible effect on the player beyond the barrels.
  - Hordes are announced only by text.
  - The win and lose moments are just a modal appearing instantly.

### Background and environment
- The world feels **empty and flat**: uniform green, uniform tufts, no edges, no paths, no reason enemies come from where they do.
- The background doesn't distract, which is good, but it doesn't support the theme ("last village", under siege) either.
- **Biggest upgrades:**
  - Grass texture with colour variation.
  - Dirt roads leading into town.
  - Trees and rocks framing the edges.
  - A real wooden palisade.
  - Filling the letterbox area so the world never ends in a hard dark bar.
