# Visual Priority Plan

A step-by-step order for making The Last Village look high-end without redesigning it. Each phase is shippable on its own: the game should look better after every phase, not only at the end.

## What to change first: Phase 1, "One world, one style" (~1 day)

These steps set the art rules that everything later builds on, and fix the strongest "prototype" signals.

1. **Art rules:** shared `OUTLINE` colour and width, top-left light, soft offset shadows, cottages at full opacity. → [quick win 1](quick_wins.md)
2. **Fonts and type scale:** display font plus rounded sans, 4 sizes, text strokes on HUD numbers. → [quick win 2](quick_wins.md)
3. **Replace emoji with drawn icons** on the start screen and HUD. → [quick win 3](quick_wins.md)
4. **Distinct player look**, so the player never blends in with the towers. → [quick win 5](quick_wins.md)
5. **Declutter price labels:** affordable ones glow, unaffordable ones only show on hover or when nearby. → [extra quick wins](quick_wins.md)

**Done when:** a screenshot looks consistent, with no emoji, no system font and no mismatched outlines.

## Phase 2: "Feels good to play" (~1 day)

6. **Coin fly-to-HUD and gold counter bump.** → [quick win 4](quick_wins.md)
7. **Hit and death feedback:** overlay flash, scale pop, pop ring, smoke, splat. → [quick win 5](quick_wins.md)
8. **Tower recoil, muzzle flashes, glowing bullets, enemy walk bob.** → [extra quick wins](quick_wins.md)
9. **HP bars with lag segment;** horde edge chevron.

**Done when:** a 30-second clip of play looks lively even with the sound off.

## Phase 3: "A real place" (~1–1.5 days)

10. **Pre-rendered environment:** grass variation, roads, tree border filling the letterbox, palisade stakes, town floor props. → [upgrade 1](high_impact_upgrades.md)
11. **Redrawn castle with damage states, forge, and per-level tower silhouettes,** plus a build animation. → [upgrade 2](high_impact_upgrades.md)

**Done when:** the world fills the whole window, and you can tell tower level and core health without reading any numbers.

## Phase 4: "Premium finish" (~1.5–2 days)

12. **Lighting layer:** light pools, afternoon-to-dusk shift over 10 minutes, motes, edge fog. → [upgrade 3](high_impact_upgrades.md)
13. **Themed UI skin:** wooden or parchment HUD, hanging price tags, parchment tooltip, logo, icon-tile start screen, end-screen medals. → [upgrade 5](high_impact_upgrades.md)
14. **Win and lose sequences:** slow motion, fireworks or collapse, desaturate, panel fade-in. → [upgrade 4](high_impact_upgrades.md)

## What can wait until later

- Enemy limbs, ears and weapons (the circles read fine for an MVP).
- A camera that follows the player and punch-in zoom.
- Persistent battlefield decals beyond the death splats.
- A high-contrast or colour-blind mode.
- Animated title-screen scene (a static world snapshot behind the panel is enough at first).
- Sound design upgrades (layered SFX, music). Audio isn't visual, but it matters as much for "premium feel" once the visuals land.

## Guardrails while upgrading

- **Readability comes first.** Clickable objects (core, forge, tower spots and towers) must stay the highest-contrast things in the town. Decorative props should be lower contrast and never pulse.
- **Performance:**
  - Pre-render everything static.
  - Cap particles at about 400.
  - Use additive blending sparingly.
  - Test with 150+ enemies on screen late in the game (the bot test from the build can drive this).
- **Stay procedural.** Everything above can be drawn with Canvas 2D, so the game remains a single file with no asset pipeline.
- **Check scaling:** verify each phase at a small window (~800×500) and on a high-DPI screen. Text and outlines must stay crisp and readable.

## Effort summary

| Phase | Effort | Visual gain |
|-------|--------|-------------|
| 1. One world, one style | ~1 day | High (removes the "prototype" look) |
| 2. Feels good to play | ~1 day | High (motion and reward) |
| 3. A real place | ~1–1.5 days | Very high (screenshots) |
| 4. Premium finish | ~1.5–2 days | High (atmosphere and presentation) |
