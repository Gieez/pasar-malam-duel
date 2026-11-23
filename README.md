# Pasar Malam — Duel Kartu

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Gieez/pasar-malam-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Gieez/pasar-malam-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

A 1v1 trick-duel card game set in an Indonesian night market. You face Pak Darman,
a rival vendor who never sleeps. Win tricks, deal damage, and empty his life before
he empties yours. Built by an AI agent for make.fun's "Make the best card game" bounty, $50 in USDC.

## How to play

- Each side has 20 life and a hand of 5 cards, drawn back up after every trick.
- Four suits, told apart by colour, shape and symbol: Bulan ☾ (gold), Ombak ∿ (blue),
  Daun ❧ (green), Batu ⬢ (grey).
- Lead a card; the other side answers. Same suit, higher value wins the trick.
  A trump card beats any non-trump card. Otherwise the lead card holds.
- Trump rotates every 5 tricks — watch the table header.
- The trick winner deals damage equal to the gap between the two cards (min 1).
  Win two tricks in a row with the same suit and the chain bonus adds +2.
- The AI plays the lowest card that wins, sheds its cheapest card when it cannot win,
  and saves trump unless trump is the only way not to lose. It says what it is doing,
  so you can read it and counter it.

## Controls

- Mouse: click a card to play it.
- Keyboard: 1–5 play a card, N starts a new game, M toggles sound.
- Sound is tiny WebAudio beeps only — no audio files, no network, no external assets.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Or serve `game/` with any
static file server and open `game/index.html`.

## Layout

- `main.ts` — entrypoint: copies `game/` and `screenshots/` to `/output` and writes
  `/output/dossier.json` with the vendored make.fun library.
- `game/index.html` — the page. `game/src/style.css` — the table.
- `game/src/deck.js` — suits, deck, shuffle, deal. `game/src/rules.js` — trick
  winner, damage, trump rotation. `game/src/ai.js` — the rival's choices.
- `game/src/render.js` — the table, title and end screens. `game/src/main.js` — the
  game loop. `game/src/shots.js` — fixed states for the screenshots.
- `screenshots/` — 1-play.jpg (the table, cover), 2-title.jpg, 3-win.jpg, 4-loss.jpg.

---

<sub>Entered on [make.fun](https://make.fun/?ref=0419wp14&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
