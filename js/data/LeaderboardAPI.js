// js/data/LeaderboardAPI.js
import { db } from "./FirebaseConfig.js";
import { collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

/**
 * 上傳玩家成績到 Firebase Firestore
 * @param {Object} record - 由 buildScoreRecord 產生的成績物件
 */
export async function uploadScore(record) {
  try {
    const leaderboardCol = collection(db, 'leaderboard');
    await addDoc(leaderboardCol, {
      playerName: record.playerName || '匿名玩家',
      score: record.score || 0,
      stars: record.stars || 0,
      durationSec: record.durationSec || 0,
      timestamp: record.timestamp || new Date().toISOString()
    });
    console.log("成績已成功上傳至 Firestore 排行榜！");
  } catch (error) {
    console.error("成績上傳失敗：", error);
  }
}

/**
 * 從 Firebase Firestore 取得前 N 名的高分玩家
 * @param {number} limitNum - 取得的筆數
 * @returns {Promise<Array>}
 */
export async function fetchTopScores(limitNum = 10) {
  try {
    const leaderboardCol = collection(db, 'leaderboard');
    const q = query(leaderboardCol, orderBy('score', 'desc'), limit(limitNum));
    
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((doc) => {
      scores.push(doc.data());
    });
    
    return scores;
  } catch (error) {
    console.error("讀取排行榜失敗：", error);
    // 網路錯誤時回傳空陣列，讓 UI 可以顯示無資料
    return [];
  }
}
