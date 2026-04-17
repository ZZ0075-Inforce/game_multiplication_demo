/**
 * main.js — 程式進入點 (寵物養成系統整合版)
 * @module main
 */

import { HomeScreen } from './ui/HomeScreen.js';
import { GameScreen } from './ui/GameScreen.js';
import { ResultScreen } from './ui/ResultScreen.js';
import { LeaderboardScreen } from './ui/LeaderboardScreen.js';
import { PetHomeScreen } from './ui/PetHomeScreen.js';
import { ShopScreen } from './ui/ShopScreen.js';
import { WardrobeScreen } from './ui/WardrobeScreen.js';

import { buildScoreRecord } from './game/Scoring.js';
import { saveToLeaderboard } from './data/Storage.js';
import { loadProfile, saveProfile, patchProfile, replaceProfile } from './data/ProfileStorage.js';
import { getAnswerReward, getSessionBonus } from './game/Rewards.js';
import { applyPetExp } from './game/Progression.js';
import { initCloudSync, login, isAuthorized, sync, uploadSave } from './data/CloudSync.js';
import { ITEMS } from './shop/Catalog.js';
import { AudioManager } from './audio/AudioManager.js';

// ---------- 畫面元素 ----------
const screens = {
  home: document.getElementById('screen-home'),
  petHome: document.getElementById('screen-pet-home'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  shop: document.getElementById('screen-shop'),
  wardrobe: document.getElementById('screen-wardrobe'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

/**
 * 切換顯示指定畫面
 * @param {keyof typeof screens} name
 */
export function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('screen--hidden', key !== name);
    el.classList.toggle('screen--active', key === name);
  }
}

// ---------- 模組實例 ----------
let homeScreen = null;
let petHomeScreen = null;
let gameScreen = null;
let resultScreen = null;
let shopScreen = null;
let wardrobeScreen = null;
let leaderboardScreen = null;

let profile = loadProfile();

// ---------- 初始化 ----------
async function init() {
  homeScreen = new HomeScreen(document.getElementById('screen-home'));
  petHomeScreen = new PetHomeScreen(document.getElementById('screen-pet-home'));
  gameScreen = new GameScreen(document.getElementById('screen-game'));
  resultScreen = new ResultScreen(document.getElementById('screen-result'));
  shopScreen = new ShopScreen(document.getElementById('screen-shop'));
  wardrobeScreen = new WardrobeScreen(document.getElementById('screen-wardrobe'), petHomeScreen);
  leaderboardScreen = new LeaderboardScreen(document.getElementById('screen-leaderboard'));

  registerEvents();

  // 初始化雲端同步 (但不自動強制登入)
  initCloudSync();

  // 檢查每日獎勵
  checkDailyReward();

  // 如果已經有玩家名稱，直接進小屋，否則進首頁命名
  if (profile.playerName && profile.playerName !== '玩家') {
    petHomeScreen.render(profile);
    showScreen('petHome');
  } else {
    showScreen('home');
  }
}

/**
 * 檢查是否為新的一天登入，並彈出獎勵視窗
 */
function checkDailyReward() {
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastLoginDate === today) return;

  // 篩選玩家尚未擁有的服飾
  const unowned = ITEMS.filter(item => !profile.ownedItems.includes(item.id));
  const modal = document.getElementById('modal-daily-reward');
  const container = document.getElementById('daily-reward-options');
  
  if (unowned.length === 0) {
    // 若全都有了，給金幣
    profile = updateProfile(draft => {
      draft.coins += 50;
      draft.lastLoginDate = today;
      return draft;
    });
    return;
  }

  // 隨機挑選 3 件 (或更少)
  const choices = unowned.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  container.innerHTML = '';
  choices.forEach(item => {
    const card = document.createElement('div');
    card.className = 'reward-option-card';
    card.innerHTML = `
      <div class="reward-emoji">${item.emoji}</div>
      <div class="reward-name">${item.name}</div>
    `;
    card.addEventListener('click', () => {
      profile = updateProfile(draft => {
        draft.ownedItems.push(item.id);
        draft.lastLoginDate = today;
        return draft;
      });
      modal.classList.add('modal-overlay--hidden');
      petHomeScreen.render(profile);
      alert(`領取成功！獲得了 ${item.name} ✨`);
    });
    container.appendChild(card);
  });

  modal.classList.remove('modal-overlay--hidden');
}

/**
 * 封裝存檔更新，加入雲端自動同步
 */
function updateProfile(updater) {
  profile = patchProfile(updater);
  // 如果已連線雲端，則在背景上傳
  if (isAuthorized()) {
    uploadSave(profile).catch(err => console.error('Auto-upload failed:', err));
  }
  return profile;
}

// ---------- 事件監聽 ----------
function registerEvents() {
  // -1. 改名事件
  document.addEventListener('profile:rename', (e) => {
    profile = updateProfile(draft => {
      draft.playerName = e.detail.name;
      return draft;
    });
    petHomeScreen.render(profile);
  });

  // 0. 雲端同步事件
  document.addEventListener('cloud:sync-requested', async () => {
    if (!isAuthorized()) {
      login();
    } else {
      await handleCloudSync();
    }
  });

  document.addEventListener('cloud:authorized', async () => {
    await handleCloudSync();
  });

  async function handleCloudSync() {
    try {
      petHomeScreen.setSyncStatus('syncing');
      const result = await sync(profile);
      
      if (result.status === 'cloud_to_local') {
        profile = replaceProfile(result.updatedProfile);
        petHomeScreen.render(profile);
        alert('已從雲端載入最新的寵物進度！✨');
      }
      
      petHomeScreen.setSyncStatus('synced');
    } catch (err) {
      console.error('Cloud sync error:', err);
      petHomeScreen.setSyncStatus('error');
    }
  }

  // 1. 導覽事件
  document.addEventListener('nav:home', () => {
    if (profile.playerName && profile.playerName !== '玩家') {
      petHomeScreen.render(profile);
      showScreen('petHome');
    } else {
      showScreen('home');
    }
  });

  document.addEventListener('nav:pet-home-paused', () => {
    petHomeScreen.setResumeState(true);
    petHomeScreen.render(profile);
    showScreen('petHome');
  });

  document.addEventListener('nav:resume-game', () => {
    petHomeScreen.setResumeState(false);
    showScreen('game');
  });

  document.addEventListener('game:start', (e) => {
    const { playerName } = e.detail;
    profile = updateProfile(draft => {
      draft.playerName = playerName || draft.playerName;
      return draft;
    });
    petHomeScreen.render(profile);
    showScreen('petHome');
  });

  document.addEventListener('nav:play', () => {
    gameScreen.start(profile.playerName);
    showScreen('game');
  });

  document.addEventListener('nav:pet-home', () => {
    petHomeScreen.render(profile);
    showScreen('petHome');
  });

  document.addEventListener('nav:shop', () => {
    shopScreen.render(profile);
    showScreen('shop');
  });

  document.addEventListener('nav:wardrobe', () => {
    wardrobeScreen.render(profile);
    showScreen('wardrobe');
  });

  document.addEventListener('nav:leaderboard', () => {
    leaderboardScreen.show();
    showScreen('leaderboard');
  });

  document.addEventListener('game:restart', () => {
    petHomeScreen.render(profile);
    showScreen('petHome');
  });

  // 2. 遊戲中即時獎勵
  document.addEventListener('game:reward-earned', (e) => {
    const reward = getAnswerReward(e.detail);
    profile = updateProfile(draft => {
      draft.coins += reward.coins;
      draft.stars += reward.stars;
      draft.totalCorrect += 1;
      
      const petId = draft.selectedPetId;
      draft.pets[petId] = applyPetExp(draft.pets[petId], reward.exp);
      return draft;
    });
    // 不必每次都重新 render 整個小屋，但可以更新背景資料
  });

  // 3. 遊戲結束結算
  document.addEventListener('game:over', (e) => {
    petHomeScreen.setResumeState(false);
    const { session, totalPausedMs } = e.detail;
    const record = buildScoreRecord(session, totalPausedMs);
    saveToLeaderboard(record);

    const sessionBonus = getSessionBonus({ score: record.score });

    profile = updateProfile(draft => {
      draft.bestScore = Math.max(draft.bestScore, record.score);
      draft.coins += sessionBonus.coins;
      draft.stars += sessionBonus.stars;
      draft.totalWrong += (session.wrongCount || 0);
      
      // 存入歷史紀錄
      draft.history.unshift({
        playedAt: new Date().toISOString(),
        score: record.score,
        coinsEarned: sessionBonus.coins
      });
      draft.history = draft.history.slice(0, 10);
      return draft;
    });

    resultScreen.show(session, record, sessionBonus, profile);
    showScreen('result');
  });

  // 4. 商城與衣櫃互動
  document.addEventListener('shop:buy', (e) => {
    const { item } = e.detail;
    profile = updateProfile(draft => {
      draft.coins -= item.price;
      if (item.id.startsWith('pet_')) {
        draft.ownedPets.push(item.id);
        draft.pets[item.id] = { level: 1, exp: 0, mood: 80 };
      } else {
        draft.ownedItems.push(item.id);
      }
      return draft;
    });
    shopScreen.render(profile);
  });

  document.addEventListener('wardrobe:equip', (e) => {
    const { type, id } = e.detail;
    profile = updateProfile(draft => {
      if (type === 'pet') {
        draft.selectedPetId = id;
      } else {
        const key = type === 'hat' ? 'hatId' : type === 'cloth' ? 'clothId' : 'accessoryId';
        // 如果已經裝備了同一個，就卸下
        draft.equipped[key] = draft.equipped[key] === id ? null : id;
      }
      return draft;
    });
    wardrobeScreen.render(profile);
  });

  document.addEventListener('wardrobe:offset', (e) => {
    const { type, x, y } = e.detail;
    profile = updateProfile(draft => {
      if (!draft.equippedOffsets) {
        draft.equippedOffsets = {
          hat: { x: 0, y: -50 }, cloth: { x: 0, y: 30 }, accessory: { x: 40, y: 10 }
        };
      }
      draft.equippedOffsets[type] = { x, y };
      return draft;
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
