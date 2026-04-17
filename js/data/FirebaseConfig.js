// js/data/FirebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

// 您提供的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyA3VzxlY6x4MV5FkB5vUALApCOER4EdvIo",
  authDomain: "gen-lang-client-0781445958.firebaseapp.com",
  projectId: "gen-lang-client-0781445958",
  storageBucket: "gen-lang-client-0781445958.firebasestorage.app",
  messagingSenderId: "813440973270",
  appId: "1:813440973270:web:5bfa40f7d620a490000c77",
  // 通常需要加上 databaseURL 才能順利連接 Realtime Database
  databaseURL: "https://gen-lang-client-0781445958-default-rtdb.firebaseio.com"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出 Database 實例供其他模組使用
export const database = getDatabase(app);
