# Third-Party Licenses

## Grammar Quest

**Source:** [AstroMike101/grammar-quest](https://github.com/AstroMike101/grammar-quest)

**License:** Free use — the upstream README states: "Free use - feel free to integrate it however you want in whatever way, no credit needed."

**What was ported:** The fill-in-the-blank quiz mechanic and a subset of the `quizArr` question content (distilled into `grammar_quest` seed rounds in `src/lib/seedGames.ts`).

**What was NOT ported:** Upstream image/GIF/sound assets — those are third-party to the upstream itself and are not covered by the above license grant.

**Our original work:** The React/Tailwind component (`src/components/games/GrammarQuest.tsx`), the `GrammarQuestGame` Zod schema, and the feed integration are original work in this repository.

## Calculationster

**Source:** [es-rene99/calculationster](https://github.com/es-rene99/calculationster)

**License:** GNU General Public License v3 (GPL-3.0). Note: GPL-3.0 is copyleft — derivative works that incorporate GPL-licensed *source code* must also be GPL-3.0. However, game mechanics (rules, timers, scoring systems) are not copyrightable; only the specific code expression is. **No source code was copied from the upstream** — our React/Tailwind component is an independent implementation of the educational concept.

**What was ported:** The timed math-drill concept — solve binary arithmetic problems (+/−/×/÷) against a countdown timer; correct answers feed a monster mascot; reaching a target score passes the round.

**What was NOT ported:** The upstream's monster/wizard/egg artwork, HTML5 audio, start-page cutscene, level-progression meta-game, and items/powers system (armor, time freeze, resurrection, claw, wing-foot). Our component generates no external assets and uses original Tailwind visuals.

**Our original work:** The React/Tailwind component (`src/components/games/Calculationster.tsx`), the `CalculationsterGame` Zod schema, the seed rounds in `src/lib/seedGames.ts`, and the feed integration are original work in this repository.

## Fraction Golf

**Source:** [peterjjchen/fraction-golf](https://github.com/peterjjchen/fraction-golf)

**License:** ISC (declared in `package.json`).

**What was ported:** The educational core mechanic — pick numbered balls and place them into top (numerator) and bottom (denominator) "holes" to compose a target fraction.

**What was NOT ported:** The upstream's physics (drag-to-putt, ball collisions), levels, image/sound assets, and Firebase scoreboard. Our port uses tap-to-place and original CSS visuals.

**Our original work:** The React/Tailwind component (`src/components/games/FractionGolf.tsx`), the `FractionGolfGame` Zod schema, the seed rounds in `src/lib/seedGames.ts`, and the feed integration are original work in this repository.
