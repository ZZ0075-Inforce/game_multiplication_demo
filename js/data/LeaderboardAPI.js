// js/data/LeaderboardAPI.js
import { database } from "./FirebaseConfig.js";
import { ref, push, query, orderByChild, limitToLast, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

/**
 * 上傳玩家成績到 Firebase
 * @param {Object} record - 由 buildScoreRecord 產生的成績物件
 */
export async function uploadScore(record) {
  try {
    const leaderboardRef = ref(database, 'leaderboard');
    // Firebase orderByChild 預設是升冪排列（低分到高分）
    // 所以直接存入即可，抓取時再拉最高分並反轉
    await push(leaderboardRef, {
      playerName: record.playerName || '匿名玩家',
      score: record.score || 0,
      stars: record.stars || 0,
      durationSec: record.durationSec || 0,
      timestamp: record.timestamp || new Date().toISOString()
    });
    console.log("成績已成功上傳至雲端排行榜！");
  } catch (error) {
    console.error("成績上傳失敗：", error);
  }
}

/**
 * 從 Firebase 取得前 N 名的高分玩家
 * @param {number} limit - 取得的筆數
 * @returns {Promise<Array>}
 */
export async function fetchTopScores(limit = 10) {
  try {
    const leaderboardRef = ref(database, 'leaderboard');
    // 依分數排序並抓取最後（最高）的 N 筆
    const topScoresQuery = query(leaderboardRef, orderByChild('score'), limitToLast(limit));
    
    const snapshot = await get(topScoresQuery);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const scores = Object.values(data);
      // Firebase orderByChild 會將結果以升冪排序回傳 (但物件的 key 可能不按順序)
      // 我們在前端自己重新排序成降冪 (由高到低)
      scores.sort((a, b) => b.score - a.score);
      return scores;
    } else {
      return [];
    }
  } catch (error) {
    console.error("讀取排行榜失敗：", error);
    // 網路錯誤時回傳空陣列，讓 UI 可以顯示無資料
    return [];
  }
}
