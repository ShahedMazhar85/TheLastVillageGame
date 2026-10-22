# High-Impact Upgrades

Bigger changes (half a day to two days each) that change how the game looks overall. They keep the current architecture: a single HTML file with procedural Canvas 2D drawing and no image assets. Each one builds on the art rules from quick win #1 (unified outline, shadow and light direction).

## Top 5 high-impact upgrades

### 1. A living environment, pre-rendered (~1 day)
Build the static world once into an offscreen canvas at startup and on resize, then draw it with a single `drawImage` each frame.

- **Grass:**
  - Base gradient from lighter in the centre to darker at the edges.
  - Two or three noise layers of slightly different greens, made from blotchy circles at low alpha.
  - Hundreds of varied tufts, small flowers (white or yellow dots) and pebbles.
- **Roads:** four dirt paths from the screen edges to the town, with soft edges and wheel ruts. They also explain where enemies come from.
- **Border framing:**
  - Clusters of round-canopy trees (dark green with a lighter top-left highlight and a shadow) along the edges and corners.
  - Rocks and bushes along the same edges.
  - The trees should extend into the letterbox area so the world never ends in a hard bar.
- **Town floor:** packed dirt with a cobblestone ring around the castle and small details such as a well, crates, hay bales and fence bits. All of these are non-interactive and lower contrast than the clickable objects.
- **Palisade:** individual pointed wooden stakes around the ring, each with a light side, a dark side and a shadow. Leave gaps at the four road entrances.

**Why:** this one change turns "shapes on green" into "a village in a clearing".

### 2. Redrawn hero objects: castle, forge and towers (~1 day)
These are the objects the player clicks, so they deserve the most detail.

- **Castle core:**
  - Stone-block texture (offset rectangles with light and dark faces).
  - A lit top face and a shadowed front, plus corner turrets.
  - A banner that waves with the existing flag animation, and window glow.
  - **Visible damage states:** cracks at under 66%, smoke at under 33%, fire flicker at under 15%. The core's health becomes readable without the bar.
- **Forge:** a stone base with a timber frame, a glowing hearth casting a warm light pool on the ground, chimney smoke puffs and an anvil out front. Show a spark burst on every weapon upgrade.
- **Towers:** level changes the silhouette.

  | Level | Look |
  |-------|------|
  | 1 | Wooden watchtower with a crossbow |
  | 2 | Stone base with a wooden top |
  | 3 | Full stone with crenellations and a banner |
  | 4 | Taller, with a gold trim, a glowing crystal or brazier, and a ballista |

  - Building animates: scaffold, then rises with a dust ring over 0.5s.
  - Firing adds recoil and a muzzle flash.
- **Empty spots:** stone foundation slabs, with a gentle pulsing gold outline only when affordable.

**Why:** progression becomes visible. Players see their town grow stronger, which is the emotional payoff of the loop.

### 3. Lighting and atmosphere layer (~half a day)
Draw this after the world and before the HUD.

- **Warm light pools** using additive radial gradients: the forge hearth, castle windows, tower braziers at level 4, and a faint one on bullets.
- **Ambient time-of-day over the 10 minutes:** start golden afternoon and drift to dusk by minute 8, as a multiply overlay moving from `#fff4e0` to `#6a6fa8` at low alpha. Light pools then pop more as night falls. This also communicates pressure rising.
- **Drifting motes:** 20–30 slow pollen or ember particles. Make them embers when the core is low.
- **Soft fog at the screen edges** where enemies spawn, so they emerge from it instead of popping in.

**Why:** lighting is what separates "flat vector" from "polished vector". The dusk shift turns the 10-minute timer into something you can see.

### 4. A full juice pass on every event (~1 day)
Design a distinct effect for each event, built on a small reusable particle and tween helper.

| Event | Effect |
|-------|--------|
| Player shot | Muzzle flash, 1px kick-back on the player, bullet glow trail |
| Enemy hit | 70% white flash, scale pop, 3 sparks in the bullet direction, small knockback |
| Enemy death | Squash then pop ring, coloured chunks, smoke puff, fading ground splat |
| Brute death | The above plus a small screen shake and a dust ring |
| Coin drop | Coins arc up and bounce once (fake z-height with a shadow) |
| Coin collect | Fly to the HUD, counter bump, rising chime pitch on combos |
| Build or upgrade | Dust ring, gold sparkle column, object scale 0.8 → 1.1 → 1.0, "LEVEL 2" banner text |
| Repair | Green "+50" and hammer sparks, HP bar fills with a tween |
| Core hit | Red flash on the castle, stone debris, HP bar lag segment, light shake |
| Not enough gold | Shake (exists), red flash on the price label, short buzz |
| Horde | Edge chevron, red edge pulse, drum, toast slides in with a scale bounce |
| Win | Slow motion for 1s, remaining enemies flee or fade, fireworks over the castle, banner panel |
| Lose | Slow motion, castle cracks and smoke, screen desaturates over 1s, then the panel fades in |

**Why:** this is the biggest "premium feel" lever per line of code, and it makes the core loop more satisfying.

### 5. Themed UI skin (~1 day)
- **HUD:**
  - Replace the black pills with carved-wood or parchment frames, drawn on canvas as a rounded rectangle with a dark border, an inner light line and a subtle grain.
  - The gold counter gets a coin-stack icon.
  - The Town bar gets a castle icon and the lag segment.
  - The timer becomes a sun or moon dial or a banner that fills over 10 minutes, matching the time-of-day shift.
- **World price labels:** small hanging wooden signs or parchment tags with a coin icon and the number, not text pills. Affordable tags glow gold. Unaffordable ones are hidden unless hovered or nearby.
- **Tooltip:** parchment card with a title ribbon, an icon, before→after stat rows with arrows, and the cost with a coin icon.
- **Start and end screens:**
  - A painted-style title logo (display font, gold gradient fill, dark outline, slight bevel).
  - A short animated scene behind it (the live game world idling with a few enemies).
  - The six instructions as icon tiles in a 2×3 grid instead of a bullet list.
  - End screen: stars or medals for time survived, kills and tower levels.
- **Buttons:** wood or gold style with a pressed state, hover glow and a short click sound.

**Why:** the UI is the first and last thing players see. A themed skin makes the whole product feel deliberate.

## Also worth considering later
- **Character silhouettes for enemies:** keep the circles but add small feet or arms that animate, a weapon for brutes, and goblin ears for runners.
- **Camera polish:** a very subtle camera follow toward the player (±20px) and a punch-in on big events.
- **Ground decals that persist:** scorch marks and footprints that fade slowly, so the battlefield tells the story of the run.
- **Accessibility:** a high-contrast toggle and a colour-blind-safe enemy palette (shape already separates the two types, which is good).
