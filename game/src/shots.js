// shots.js — fixed, deterministic states for screenshots.
// One job: stage one exact table for each ?shot= value, no randomness.

import { SUITS, sortHand } from './deck.js';

function card(suit, value) {
  return { id: suit + '-' + value, suit, value };
}

// A mid-game table: both hands visible, life 20 vs 14, trump Ombak,
// one trick half-played so the table reads as a game in progress.
function playState(makeGame) {
  const s = makeGame();
  s.phase = 'player-turn';
  s.playerHand = sortHand([
    card('bulan', 9), card('ombak', 7), card('daun', 5), card('batu', 8), card('ombak', 3),
  ]);
  s.aiHand = [card('daun', 2), card('batu', 4), card('bulan', 6), card('ombak', 9), card('daun', 8)];
  s.playerLife = 20;
  s.aiLife = 14;
  s.trump = 'ombak';
  s.round = 2;
  s.tricksWon = 3;
  s.tricksLost = 2;
  s.leadCard = card('daun', 7);
  s.message = 'Pak Darman membuka 7 Daun. Jawab dengan Daun yang lebih tinggi — atau biarkan lewat.';
  return { state: s, screen: 'table' };
}

function winState(makeGame) {
  const s = makeGame();
  s.playerLife = 9;
  s.aiLife = 0;
  s.tricksWon = 7;
  s.tricksLost = 4;
  s.playerHand = sortHand([card('bulan', 9), card('ombak', 8), card('daun', 6)]);
  s.aiHand = [card('batu', 2), card('daun', 3)];
  return { state: s, screen: 'end' };
}

function lossState(makeGame) {
  const s = makeGame();
  s.playerLife = 0;
  s.aiLife = 11;
  s.tricksWon = 4;
  s.tricksLost = 7;
  s.playerHand = sortHand([card('batu', 3), card('daun', 4)]);
  s.aiHand = [card('bulan', 8), card('ombak', 9), card('daun', 7)];
  return { state: s, screen: 'end' };
}

export function applyShot(shot, makeGame) {
  if (shot === 'title') return { state: makeGame(), screen: 'title' };
  if (shot === 'play') return playState(makeGame);
  if (shot === 'win') return winState(makeGame);
  if (shot === 'loss') return lossState(makeGame);
  return null;
}

export { SUITS };
