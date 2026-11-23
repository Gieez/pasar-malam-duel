// deck.js — the deck and the four suits of Pasar Malam.
// One job: know the suits, build a shuffled deck, deal hands.

// A suit is told apart by colour AND shape AND symbol, never by text alone.
export const SUITS = [
  { id: 'bulan', name: 'Bulan', symbol: '☾', color: '#f2c14e', dark: '#8a6d1f' },
  { id: 'ombak', name: 'Ombak', symbol: '∿', color: '#4ea8f2', dark: '#1f5a8a' },
  { id: 'daun', name: 'Daun', symbol: '❧', color: '#58b368', dark: '#1f6b2e' },
  { id: 'batu', name: 'Batu', symbol: '⬢', color: '#b8b0a4', dark: '#6b645a' },
];

export function suitById(id) {
  return SUITS.find((s) => s.id === id) || SUITS[0];
}

// Values 1..9 in each suit: 36 cards, no jokers, no duplicates.
export function buildDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 9; value++) {
      cards.push({ id: suit.id + '-' + value, suit: suit.id, value });
    }
  }
  return cards;
}

export function shuffle(deck, random) {
  const rand = random || Math.random;
  const cards = deck.slice();
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
  return cards;
}

// A seeded shuffle, so screenshot states and tests are reproducible.
export function seededRandom(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function deal(deck, handSize) {
  return {
    player: deck.slice(0, handSize),
    ai: deck.slice(handSize, handSize * 2),
    rest: deck.slice(handSize * 2),
  };
}

export function sortHand(hand) {
  const order = { bulan: 0, ombak: 1, daun: 2, batu: 3 };
  return hand.slice().sort((a, b) => {
    if (order[a.suit] !== order[b.suit]) return order[a.suit] - order[b.suit];
    return b.value - a.value;
  });
}
