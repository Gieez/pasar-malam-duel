// ai.js — the rival vendor's choices.
// One job: pick the AI's card, and say why in one short line the player can read.

// The AI is readable on purpose: it plays the lowest card that wins the trick,
// otherwise its lowest card, and it saves trump unless trump is the only way
// not to lose. A player who watches it can counter it.
export function chooseResponse(aiHand, lead, trump) {
  const sorted = aiHand.slice().sort((a, b) => a.value - b.value);
  const sameSuit = sorted.filter((c) => c.suit === lead.suit);
  const winningSame = sameSuit.filter((c) => c.value > lead.value);
  if (winningSame.length > 0) {
    return {
      card: winningSame[0],
      note: 'AI menaikkan ' + winningSame[0].value + ' ' + winningSame[0].suit + ' untuk merebut trik.',
    };
  }
  const trumps = sorted.filter((c) => c.suit === trump);
  const leadIsTrump = lead.suit === trump;
  if (!leadIsTrump && trumps.length > 0) {
    // Trump is the only way to steal this trick, so spend the cheapest one.
    return {
      card: trumps[0],
      note: 'AI terpaksa memakai trump ' + trumps[0].suit + ' — ia tidak bisa menang tanpa itu.',
    };
  }
  // Cannot win: shed the cheapest card and save the good ones.
  return {
    card: sorted[0],
    note: 'AI membuang kartu kecil ' + sorted[0].value + ' ' + sorted[0].suit + ' dan menyimpan kartu besar.',
  };
}

// When the AI leads a trick it opens with its lowest non-trump card,
// keeping trump and high cards for later.
export function chooseLead(aiHand, trump) {
  const sorted = aiHand.slice().sort((a, b) => a.value - b.value);
  const nonTrump = sorted.filter((c) => c.suit !== trump);
  const card = nonTrump.length > 0 ? nonTrump[0] : sorted[0];
  return {
    card,
    note: 'AI membuka dengan ' + card.value + ' ' + card.suit + ' — kartu kecil dulu.',
  };
}
