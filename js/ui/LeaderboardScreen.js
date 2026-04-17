/**
 * LeaderboardScreen.js — 排行榜畫面 UI（T021）
 * 從 localStorage 讀取歷史成績並渲染前 10 名
 * @module LeaderboardScreen
 */

import { fetchTopScores } from '../data/LeaderboardAPI.js';

export class LeaderboardScreen {
  /**
   * @param {HTMLElement} container - #screen-leaderboard 元素
   */
  constructor(container) {
    this._el       = container;
    this._tableEl  = container.querySelector('#leaderboard-table');
    this._backBtn  = container.querySelector('#btn-back-home');

    this._backBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('nav:home'));
    });
  }

  /** 非同步讀取資料並渲染排行榜 */
  async show() {
    this._tableEl.innerHTML = '<p class="leaderboard-loading">📡 正在載入雲端排行榜資料...</p>';

    const entries = await fetchTopScores(10);

    if (entries.length === 0) {
      this._tableEl.innerHTML =
        '<p class="leaderboard-empty">尚無紀錄或無法連線，快來挑戰！🚀</p>';
      return;
    }

    const rows = entries.map((e, idx) => {
      const rank    = idx + 1;
      const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
      const stars   = '⭐'.repeat(e.stars || 0);
      
      // 處理從 firebase 取回的 timestamp (例如 2026-04-18T10:00:00.000Z 轉為 YYYY-MM-DD)
      const dateObj = e.timestamp ? new Date(e.timestamp) : new Date();
      const dateStr = dateObj.toLocaleDateString();

      return `
        <tr class="rank-${rank <= 3 ? rank : 'other'}">
          <td>${rankEmoji}</td>
          <td>${_esc(e.playerName)}</td>
          <td>${e.score} 分</td>
          <td>${stars}</td>
          <td>${dateStr}</td>
        </tr>
      `;
    }).join('');

    this._tableEl.innerHTML = `
      <table class="leaderboard-table-el">
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th>分數</th>
            <th>星等</th>
            <th>日期</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

/** 簡單 HTML 跳脫 */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
