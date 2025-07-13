'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'muggins_2p_game';

  function loadGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse saved game state:', e);
      }
    }
    return {
      players: [
        { name: 'Player 1', score: 0, history: [] },
        { name: 'Player 2', score: 0, history: [] }
      ]
    };
  }

  function saveGame(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }

  const state = loadGame();

  function render(state) {
    state.players.forEach((player, index) => {
      document.querySelector(`.player-name[data-player="${index}"]`).textContent = player.name;
      document.querySelector(`.player-score[data-player="${index}"]`).textContent = player.score;
      const controlsEl = document.querySelector(`.controls[data-player="${index}"]`);
      controlsEl.innerHTML = '';

      [5, 10, 15, 20, 25, 30, 35].forEach(inc => {
        const btn = document.createElement('button');
        btn.textContent = `+${inc}`;
        btn.addEventListener('click', () => addScore(index, inc));
        controlsEl.appendChild(btn);
      });

      const undoBtn = document.createElement('button');
      undoBtn.textContent = 'Undo';
      undoBtn.addEventListener('click', () => undoScore(index));
      controlsEl.appendChild(undoBtn);

      const histBtn = document.createElement('button');
      histBtn.textContent = 'History';
      histBtn.addEventListener('click', () => showHistory(index));
      controlsEl.appendChild(histBtn);
    });
  }

  function addScore(playerIndex, points) {
    const player = state.players[playerIndex];
    if (player.score + points > 2000) return;
    player.history.push({ points, timestamp: new Date().toISOString() });
    player.score += points;
    saveGame(state);
    render(state);
  }

  function undoScore(playerIndex) {
    const player = state.players[playerIndex];
    if (!player.history.length) return;
    const last = player.history.pop();
    player.score -= last.points;
    saveGame(state);
    render(state);
  }

  function showHistory(playerIndex) {
    const modal = document.getElementById('history-modal');
    const listEl = document.getElementById('history-list');
    listEl.innerHTML = '';

    state.players[playerIndex].history.slice().reverse().forEach(entry => {
      const li = document.createElement('li');
      const ts = new Date(entry.timestamp).toISOString().replace('T',' ').substring(0,19);
      li.textContent = `+${entry.points} points @ ${ts}`;
      listEl.appendChild(li);
    });

    modal.hidden = false;
  }

  function closeHistory() {
    const modal = document.getElementById('history-modal');
    const listEl = document.getElementById('history-list');
    listEl.innerHTML = '';
    modal.hidden = true;
  }

  render(state);

  document.querySelectorAll('.player-name').forEach(el => {
    el.addEventListener('blur', () => {
      const idx = +el.getAttribute('data-player');
      state.players[idx].name = el.textContent.trim() || `Player ${idx + 1}`;
      saveGame(state);
    });
  });

  document.getElementById('close-history').addEventListener('click', closeHistory);
  document.getElementById('reset-scores').addEventListener('click', () => {
    state.players.forEach(p => { p.score = 0; p.history = []; });
    closeHistory();
    saveGame(state);
    render(state);
  });

  document.getElementById('new-game').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
});