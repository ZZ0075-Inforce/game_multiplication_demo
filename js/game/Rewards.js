// js/game/Rewards.js

/**
 * 計算單題答對的獎勵
 * @param {Object} options
 * @param {boolean} options.correct 是否答對
 * @param {number} options.combo 當前連對次數
 * @returns {Object} 獎勵物件 { coins, stars, exp }
 */
export function getAnswerReward({ correct, combo }) {
  if (!correct) {
    return { coins: 0, stars: 0, exp: 0 };
  }

  // 基礎獎勵
  let coins = 5;
  let stars = 1;
  let exp = 8;

  // 連對加成 (每 3 題連對送額外金幣)
  if (combo > 0 && combo % 3 === 0) {
    coins += 3;
    exp += 4;
  }

  return { coins, stars, exp };
}

/**
 * 計算遊戲結束後的結算獎勵
 * @param {Object} options
 * @param {number} options.score 本局分數
 * @returns {Object} 結算獎勵 { coins, stars }
 */
export function getSessionBonus({ score }) {
  // 每 100 分換 1-3 枚金幣 (上限 30 枚)
  const coins = Math.min(30, Math.floor(score / 100));
  
  // 根據分數給予 1-3 顆星星評分
  let stars = 1;
  if (score >= 800) stars = 3;
  else if (score >= 500) stars = 2;

  return { coins, stars };
}
