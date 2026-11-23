// main.js — the game loop of Pasar Malam.
// One job: own the state, run tricks, and hand screens to render.js.

import { SUITS, buildDeck, shuffle, deal, sortHand } from './deck.js';
import { TRICKS_PER_ROUND, START_LIFE, HAND_SIZE, trickWinner, trickDamage, isGameOver, winnerOf, trumpForRound } from './rules.js';
import { chooseResponse, chooseLead } from './ai.js';
import { renderTable, renderTitle, renderEnd } from './render.js';
import { applyShot } from './shots.js';

const app = document.getElementById('app');
const statusEl = document.getElementById('status');
let muted = false;
let audioCtx = null;

function beep(freq, ms) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + ms / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + ms / 1000);
  } catch (e) { /* sound is decoration, never a blocker */ }
}

function newGame() {
  const deck = shuffle(buildDeck());
  const hands = deal(deck, HAND_SIZE);
  return {
    phase: 'player-turn',
    busy: false,
    playerHand: sortHand(hands.player),
    aiHand: sortHand(hands.ai),
    deck: hands.rest,
    playerLife: START_LIFE,
    aiLife: START_LIFE,
    maxLife: START_LIFE,
    round: 1,
    trickCount: 0,
    tricksWon: 0,
    tricksLost: 0,
    trump: trumpForRound(1, SUITS),
    leadCard: null,
    followCard: null,
    leader: 'player',
    lastWinningSuit: null,
    message: 'Giliranmu — klik kartu atau tekan 1–5.',
  };
}

let state = newGame();
let screen = 'title';

function draw() {
  const root = app;
  if (screen === 'title') {
    renderTitle(root, { start: startGame });
  } else if (screen === 'end') {
    renderEnd(root, winnerOf(state), state, { start: startGame });
  } else {
    renderTable(root, state, { playCard: onPlayCard });
  }
  statusEl.textContent = state.message || '';
}

function startGame() {
  state = newGame();
  screen = 'table';
  beep(660, 120);
  draw();
}

function finishTrick(leadCard, followCard, leader) {
  const side = trickWinner(leadCard, followCard, state.trump);
  const winnerCard = side === 'lead' ? leadCard : followCard;
  const loserCard = side === 'lead' ? followCard : leadCard;
  const winnerIsPlayer = (side === 'lead') === (leader === 'player');
  const chained = state.lastWinningSuit === winnerCard.suit;
  const damage = trickDamage(winnerCard, loserCard, chained);
  if (winnerIsPlayer) {
    state.aiLife -= damage;
    state.tricksWon += 1;
    state.message = 'Kamu menang trik! ' + winnerCard.value + ' ' + winnerCard.suit +
      ' mengalahkan ' + loserCard.value + ' ' + loserCard.suit + ' — ' + damage + ' damage' +
      (chained ? ' (rantai suit +2!)' : '') + '.';
  } else {
    state.playerLife -= damage;
    state.tricksLost += 1;
    state.message = 'Pak Darman menang trik! ' + winnerCard.value + ' ' + winnerCard.suit +
      ' mengalahkan ' + loserCard.value + ' ' + loserCard.suit + ' — ' + damage + ' damage' +
      (chained ? ' (rantai suit +2!)' : '') + '.';
  }
  state.lastWinningSuit = winnerCard.suit;
  state.trickCount += 1;
  state.leader = winnerIsPlayer ? 'player' : 'ai';
  if (state.trickCount % TRICKS_PER_ROUND === 0) {
    state.round += 1;
    state.trump = trumpForRound(state.round, SUITS);
    state.message += ' Ronde ' + state.round + ' — trump baru: ' + state.trump + '.';
  }
  beep(winnerIsPlayer ? 880 : 220, 180);
  // Draw back up to a full hand, then clear the table after a beat.
  setTimeout(() => {
    state.leadCard = null;
    state.followCard = null;
    for (const who of ['playerHand', 'aiHand']) {
      while (state[who].length < HAND_SIZE && state.deck.length > 0) {
        state[who].push(state.deck.shift());
      }
      state[who] = sortHand(state[who]);
    }
    if (isGameOver(state)) {
      screen = 'end';
      beep(winnerOf(state) === 'player' ? 990 : 160, 400);
    } else {
      state.phase = 'player-turn';
      state.busy = false;
      if (state.leader === 'ai') aiLeads();
    }
    draw();
  }, 1100);
  state.busy = true;
  state.phase = 'resolving';
  draw();
}

function aiResponds(leadCard) {
  const pick = chooseResponse(state.aiHand, leadCard, state.trump);
  state.aiHand = state.aiHand.filter((c) => c.id !== pick.card.id);
  state.followCard = pick.card;
  state.message = pick.note;
  draw();
  setTimeout(() => finishTrick(leadCard, pick.card, 'player'), 900);
}

function aiLeads() {
  state.busy = true;
  state.phase = 'ai-turn';
  state.message = 'Pak Darman sedang memilih kartu...';
  draw();
  setTimeout(() => {
    const pick = chooseLead(state.aiHand, state.trump);
    state.aiHand = state.aiHand.filter((c) => c.id !== pick.card.id);
    state.leadCard = pick.card;
    state.message = pick.note + ' Giliranmu menjawab — mainkan kartu sesuit yang lebih tinggi, atau biarkan trik ini lewat.';
    state.phase = 'player-turn';
    state.busy = false;
    draw();
  }, 800);
}

function onPlayCard(card) {
  if (state.phase !== 'player-turn' || state.busy) return;
  state.playerHand = state.playerHand.filter((c) => c.id !== card.id);
  beep(520, 90);
  if (state.leader === 'player') {
    state.leadCard = card;
    state.message = 'Kamu membuka ' + card.value + ' ' + card.suit + '. Pak Darman menjawab...';
    state.phase = 'ai-turn';
    state.busy = true;
    draw();
    setTimeout(() => aiResponds(card), 750);
  } else {
    // Player answers the AI's lead.
    state.followCard = card;
    state.message = 'Kamu menjawab dengan ' + card.value + ' ' + card.suit + '.';
    draw();
    setTimeout(() => finishTrick(state.leadCard, card, 'ai'), 900);
  }
}

document.addEventListener('keydown', (e) => {
  if (screen === 'title' && (e.key === 'Enter' || e.key === ' ')) { startGame(); return; }
  if (e.key === 'n' || e.key === 'N') { startGame(); return; }
  if (e.key === 'm' || e.key === 'M') { muted = !muted; return; }
  if (screen !== 'table') return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= state.playerHand.length) onPlayCard(state.playerHand[n - 1]);
});

// A screenshot state (?shot=title|play|win|loss) replaces the live game.
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  const staged = applyShot(shot, newGame);
  if (staged) {
    state = staged.state;
    screen = staged.screen;
  }
}
draw();
