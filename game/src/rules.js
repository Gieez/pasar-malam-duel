// rules.js — the trick rules of Pasar Malam.
// One job: decide who wins a trick and how much damage the loser takes.

// Trump rotates every TRICKS_PER_ROUND tricks: a new round, a new trump suit.
export const TRICKS_PER_ROUND = 5;
export const START_LIFE = 20;
export const HAND_SIZE = 5;
export const CHAIN_BONUS = 2;

export function trumpForRound(round, suits) {
  return suits[(round - 1) % suits.length].id;
}

export function trickWinner(lead, follow, trump) {
  // Trump beats any non-trump card.
  const leadTrump = lead.suit === trump;
  const followTrump = follow.suit === trump;
  if (followTrump && !leadTrump) return 'follow';
  if (leadTrump && !followTrump) return 'lead';
  // Same suit: the higher value wins.
  if (follow.suit === lead.suit) {
    return follow.value > lead.value ? 'follow' : 'lead';
  }
  // Different suits, neither trump: the lead card holds the trick.
  return 'lead';
}

// Damage is the gap between the two cards, at least 1. Win two tricks in a
// row with the same suit and the chain bonus adds +2.
export function trickDamage(winnerCard, loserCard, chained) {
  let damage = Math.max(1, winnerCard.value - loserCard.value);
  if (chained) damage += CHAIN_BONUS;
  return damage;
}

export function isGameOver(state) {
  return state.playerLife <= 0 || state.aiLife <= 0;
}

export function winnerOf(state) {
  if (state.aiLife <= 0 && state.playerLife <= 0) return 'draw';
  if (state.aiLife <= 0) return 'player';
  if (state.playerLife <= 0) return 'ai';
  return null;
}
