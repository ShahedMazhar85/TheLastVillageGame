THE LAST VILLAGE
================

Author: Md Majharul Islam

A top-down town defense shooter that runs in the browser.
Enemies never stop coming. Defend the village, collect gold, and upgrade
your defenses while the fight goes on. Survive 10 minutes to win.


HOW TO START
------------
Double-click index.html. It opens in Chrome, Edge or Firefox.
No install, no internet connection and no server needed.
(With an internet connection the game also loads its two web fonts.)


CONTROLS
--------
  W A S D / Arrow keys   Move
  Mouse                  Aim
  Left click (hold)      Shoot
  Left click on a town   Build, upgrade or repair (see below)
  object
  M                      Sound on / off
  Enter / Space          Start or play again


THE GAME LOOP
-------------
  Shoot enemies -> collect gold -> click town objects to upgrade -> survive longer

- Enemies walk toward the town core and attack it.
- Defeated enemies drop gold coins. Walk near them to collect them.
- Spend gold by clicking objects in the town. There is no shop menu and
  the game never pauses.
- A price label glows gold when you can afford it.


UPGRADES
--------
1. Tower spots (4)
   - Empty spot: click to build a tower (40 gold).
   - Built tower: click to upgrade it (60 / 100 / 160 gold, up to level 4).
   - Towers shoot automatically at the nearest enemy to the core.

2. Town core (the castle)
   - Click to repair +50 health for 25 gold (max health 200).

3. Forge
   - Click to upgrade your weapon: more damage, faster firing, and a
     triple shot from level 4 (50 / 80 / 120 / 170 / 230 gold).


ENEMIES
-------
- Runner (small, red): fast and weak.
- Brute (large, purple, horned): slow and strong.
Enemies come faster and get tougher over time, and a bigger horde
arrives every minute.


WIN / LOSE
----------
- Win:  survive for 10 minutes.
- Lose: the town core's health reaches 0.


PROJECT FILES
-------------
  index.html         The page: start/end screens and styles
  js/config.js       All game settings (prices, enemy stats, difficulty)
  js/util.js         Small math helpers and the random number generator
  js/sim.js          Game rules (no drawing)
  js/render.js       All drawing on the canvas
  js/audio.js        Sound effects
  js/main.js         Keyboard/mouse input, game flow and the main loop
  tests/             Automated tests
  audit/             Notes on improving the game's visuals

To change balance (prices, enemy speed, difficulty), edit js/config.js.


RUNNING THE TESTS
-----------------
The tests need a small local server (Python 3). From the project folder:

  python3 tests/serve.py

Then open http://localhost:8765/tests/ in your browser.
All tests should show PASS.


Copyright (c) Md Majharul Islam. All rights reserved.
