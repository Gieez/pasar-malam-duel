// render.js — everything the player sees on the table.
// One job: turn game state into DOM, and animate the cards that move.

import { suitById } from './deck.js';

export function cardElement(card, opts) {
  const o = opts || {};
  const suit = suitById(card.suit);
  const el = document.createElement('div');
  el.className = 'card suit-' + suit.id + (o.faceDown ? ' face-down' : '') + (o.played ? ' played' : '');
  el.dataset.cardId = card.id;
  if (o.faceDown) {
    el.innerHTML = '<div class="card-back">☾<span>Pasar<br>Malam</span></div>';
    return el;
  }
  el.innerHTML =
    '<div class="card-corner top"><span class="card-value">' + card.value + '</span>' +
    '<span class="card-symbol">' + suit.symbol + '</span></div>' +
    '<div class="card-center">' + suit.symbol + '</div>' +
    '<div class="card-suit-name">' + suit.name + '</div>' +
    '<div class="card-corner bottom"><span class="card-value">' + card.value + '</span>' +
    '<span class="card-symbol">' + suit.symbol + '</span></div>';
  el.style.setProperty('--suit', suit.color);
  el.style.setProperty('--suit-dark', suit.dark);
  if (o.onClick) {
    el.addEventListener('click', () => o.onClick(card));
    el.tabIndex = 0;
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') o.onClick(card);
    });
  }
  return el;
}

export function lifeBar(life, max) {
  const pct = Math.max(0, Math.min(100, (life / max) * 100));
  return '<div class="life-bar"><div class="life-fill" style="width:' + pct + '%"></div>' +
    '<span class="life-text">❤ ' + life + ' / ' + max + '</span></div>';
}

export function renderTable(root, state, handlers) {
  const trump = suitById(state.trump);
  root.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'table';
  table.innerHTML =
    '<header class="table-head">' +
    '<div class="brand">🌙 PASAR MALAM <span>Duel Kartu</span></div>' +
    '<div class="round-box">Ronde ' + state.round + ' · Trump: <b style="color:' + trump.color + '">' +
    trump.symbol + ' ' + trump.name + '</b></div>' +
    '<div class="score-box">Trik ' + state.tricksWon + ' – ' + state.tricksLost + '</div>' +
    '</header>' +
    '<section class="opponent-row">' +
    '<div class="player-label">🤖 Pak Darman — Rival</div>' +
    '<div class="life-wrap">' + lifeBar(state.aiLife, state.maxLife) + '</div>' +
    '<div class="hand ai-hand" id="ai-hand"></div>' +
    '</section>' +
    '<section class="center-row">' +
    '<div class="trick-zone" id="trick-zone">' +
    '<div class="trick-slot" id="lead-slot"><span class="slot-hint">Kartu pembuka</span></div>' +
    '<div class="vs">⚔</div>' +
    '<div class="trick-slot" id="follow-slot"><span class="slot-hint">Kartu penantang</span></div>' +
    '</div>' +
    '<div class="message" id="message">' + (state.message || 'Giliranmu — klik kartu atau tekan 1–5.') + '</div>' +
    '</section>' +
    '<section class="player-row">' +
    '<div class="player-label">😊 Kamu</div>' +
    '<div class="life-wrap">' + lifeBar(state.playerLife, state.maxLife) + '</div>' +
    '<div class="hand player-hand" id="player-hand"></div>' +
    '<div class="hint">Klik kartu untuk main · 1–5 dari keyboard · N = permainan baru · M = suara</div>' +
    '</section>';
  root.appendChild(table);

  const aiHand = root.querySelector('#ai-hand');
  state.aiHand.forEach((c) => aiHand.appendChild(cardElement(c, { faceDown: true })));

  const playerHand = root.querySelector('#player-hand');
  state.playerHand.forEach((c) => {
    const el = cardElement(c, {
      onClick: state.phase === 'player-turn' && !state.busy ? handlers.playCard : null,
    });
    if (state.phase === 'player-turn' && !state.busy) el.classList.add('playable');
    playerHand.appendChild(el);
  });

  if (state.leadCard) {
    const slot = root.querySelector('#lead-slot');
    slot.innerHTML = '';
    slot.appendChild(cardElement(state.leadCard, { played: true }));
  }
  if (state.followCard) {
    const slot = root.querySelector('#follow-slot');
    slot.innerHTML = '';
    slot.appendChild(cardElement(state.followCard, { played: true }));
  }
  return root;
}

export function renderTitle(root, handlers) {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen title-screen';
  screen.innerHTML =
    '<div class="title-lantern">🏮</div>' +
    '<h1>PASAR MALAM</h1>' +
    '<h2>Duel Kartu</h2>' +
    '<p class="tagline">Satu meja, empat suit, satu pedagang yang tidak pernah tidur.</p>' +
    '<div class="suit-row">' +
    '<span style="color:#f2c14e">☾ Bulan</span><span style="color:#4ea8f2">∿ Ombak</span>' +
    '<span style="color:#58b368">❧ Daun</span><span style="color:#b8b0a4">⬢ Batu</span></div>' +
    '<p class="rules-short">Menangkan trik dengan kartu lebih tinggi sesuit, atau trump. ' +
    'Selisih nilai jadi damage. Rantai suit yang sama = +2. Nyawa 20 — yang habis duluan kalah.</p>' +
    '<button class="big-button" id="start-btn">▶ MULAI BERMAIN</button>' +
    '<p class="hint">Klik kartu untuk main · 1–5 dari keyboard · N = permainan baru</p>';
  root.appendChild(screen);
  root.querySelector('#start-btn').addEventListener('click', handlers.start);
  return root;
}

export function renderEnd(root, result, state, handlers) {
  root.innerHTML = '';
  const win = result === 'player';
  const screen = document.createElement('div');
  screen.className = 'screen end-screen ' + (win ? 'win' : 'loss');
  screen.innerHTML =
    '<div class="end-emoji">' + (win ? '🏆' : '💔') + '</div>' +
    '<h1>' + (win ? 'MENANG!' : 'KALAH!') + '</h1>' +
    '<p class="end-line">' + (win
      ? 'Kamu menawar lebih cerdik dari Pak Darman. Meja ini milikmu malam ini!'
      : 'Pak Darman menutup lapaknya dengan senyuman. Coba lagi — trik berikutnya milikmu.') + '</p>' +
    '<p class="end-score">Skor trik ' + state.tricksWon + ' – ' + state.tricksLost +
    ' · Nyawa ' + Math.max(0, state.playerLife) + ' – ' + Math.max(0, state.aiLife) + '</p>' +
    '<button class="big-button" id="again-btn">↻ MAIN LAGI (N)</button>';
  root.appendChild(screen);
  root.querySelector('#again-btn').addEventListener('click', handlers.start);
  return root;
}
