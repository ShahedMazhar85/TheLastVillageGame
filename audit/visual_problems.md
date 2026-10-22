# Visual Problems

Ranked by how much each one makes the game look unfinished. Code references are to `index.html`.

## Top 5 visual problems

### 1. The world is flat and empty
- **Where:** `drawGround()` (~line 453)
- **What:** one solid `#3f6b3a` fill, about 140 identical 3-stroke tufts and a few grey ellipse rocks. There are no paths, no trees, no edges and no colour variation.
- **Why it looks cheap:** 75% of the screen has no information and no depth. The eye reads "default background".
- **Fix direction:**
  - Noise-tinted grass.
  - Dirt roads from the edges to the gate.
  - Tree clusters around the border.
  - A pre-rendered background canvas, so the extra detail costs nothing per frame.

### 2. Diagram-style shapes stand in for world objects
- **Where:** the town ring, tower spots and towers in `drawGround()` and `drawSpot()`.
- **What:**
  - The town wall is a dashed stroke (`setLineDash([16,10])`).
  - Empty tower spots are dashed circles with a "+".
  - A built tower is a grey disc with a blue disc and a black bar.
- **Why it looks cheap:** dashed outlines are a UI or editor convention. The town reads as a selection circle, not a village wall.
- **Fix direction:**
  - A palisade made of individual stakes with tips and shadows.
  - Tower spots as stone foundation slabs, with a subtle pulsing ring only when the player can afford one.
  - Towers drawn as stone bases with a wooden or crenellated top. Each level should change the silhouette, not just the colour.

### 3. No lighting, no consistent shading rules
- **Where:** every `draw*` function.
- **What:**
  - Fills are single flat colours.
  - Outline widths vary (2, 2.5 and 3px) and so do outline colours (`#4b5056`, `#3d2b1d`, `#3f444b`, white on the player).
  - Shadows are the same `rgba(0,0,0,.25)` ellipse everywhere.
  - Cottages are drawn at `globalAlpha = .75`, so they look ghosted.
- **Why it looks cheap:** the objects don't feel like they belong to one world, and nothing has volume.
- **Fix direction:** one light direction (top-left). Each object gets:
  - A lit face and a shade face (or a vertical gradient).
  - The same 2.5px warm dark outline (`#2a1d14`).
  - A soft contact shadow offset to the bottom-right.

### 4. Feedback effects are thin and all look the same
- **Where:** `burst()`, `floatText()`, `killEnemy()`, `interact()`.
- **What:**
  - Hits, kills, upgrades and coin pickups all use round dots that fade out.
  - Enemies vanish on death.
  - Coins disappear on pickup.
  - Towers fire with no muzzle flash or recoil, and building one has no animation.
  - The gold counter never reacts.
- **Why it looks cheap:** actions don't feel rewarding. That "juice" is most of what makes a small game feel premium.
- **Fix direction:**
  - Different effects per event (spark, smoke puff, gold shimmer, dust ring).
  - Squash-and-pop on enemy death.
  - Coins that fly to the HUD counter, with the counter bumping when they arrive.
  - A build-up animation for towers, plus muzzle flash and recoil when they fire.

### 5. UI looks like a generic web template
- **Where:** the CSS panel and button styles (lines ~14–24), `drawHUD()`, `drawLabel()`, `drawTooltip()` and the start-screen HTML.
- **What:**
  - Everything is set in `system-ui`.
  - HUD boxes are plain 50% black pills.
  - The start screen uses OS emoji as icons.
  - The footer is 12px at 60% opacity.
  - Six price pills are visible at once.
  - Font sizes are spread across 7 values with no type scale.
- **Why it looks cheap:** emoji and system fonts are the strongest "prototype" signal. They also render differently on Windows, Mac and Linux.
- **Fix direction:**
  - One display font (for example Cinzel or Germania One for titles, Nunito or Inter for numbers and body).
  - Framed wood-and-parchment panels.
  - Drawn icons that match the in-game art.
  - Hide or dim price labels until they're affordable or hovered.

## Other issues (lower priority)

| # | Problem | Where | Note |
|---|---------|-------|------|
| 6 | Dark letterbox bars on non-16:10 screens | `render()` fills `#1b2418` outside the world | Extend grass and trees into the margin, or fade to a dark forest edge |
| 7 | Player blends in with the tower heads near the core | `drawPlayer()` | Both are blue discs. Give the player a distinct shape (a hooded figure seen from above, with a cape) and colour (a warm red or teal accent) |
| 8 | Enemies glide without animation | `drawEnemy()` | No walk bob, squash or footstep dust. They look like sliding tokens |
| 9 | Hit flash fills the whole enemy pure white | `drawEnemy()` | Harsh. Use a white overlay at about 70% with a scale pop |
| 10 | Coins are weak on the tan town floor | `drawCoin()` | Yellow on tan has low contrast. Add a dark outline and a glow |
| 11 | Castle is a flat grey box | `drawCore()` | No stone texture, roof or depth. It's the centrepiece and should be the most detailed object |
| 12 | Tower levels look nearly identical | `drawSpot()` | Only the head colour shifts and pips appear. Silhouettes should grow per level |
| 13 | Horde warning is text only | `drawHUD()` toast | No arrow toward where it comes from, no red edge pulse, no drum hit |
| 14 | Win/lose screens appear abruptly | `endGame()` | No slow-motion moment, fade, or castle collapse or celebration |
| 15 | Bullets are tiny circles with a short line | `render()` bullet loop | Fine, but adding additive-blend glow would read much better |
| 16 | Floating texts all use the same style | `floatText()` | Damage, gold and messages look alike. Use a different colour, size and motion for each |
| 17 | Cottages look like ghosts | `drawGround()` | `globalAlpha = .75` makes them look unfinished. Draw them solid and slightly smaller |
