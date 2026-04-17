// js/data/ProfileStorage.js
const PROFILE_KEY = 'multiplication-monster-profile-v1';

const DEFAULT_PROFILE = {
  version: 1,
  playerName: '玩家',
  coins: 0,
  stars: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestScore: 0,
  comboBest: 0,
  selectedPetId: 'pet_mochi',
  ownedPets: ['pet_mochi'],
  ownedItems: [],
  equipped: {
    hatId: null,
    clothId: null,
    accessoryId: null,
  },
  pets: {
    pet_mochi: {
      level: 1,
      exp: 0,
      mood: 80,
    },
  },
  history: [],
  updatedAt: null,
};

/**
 * 從 localStorage 載入玩家存檔
 * @returns {Object} 玩家存檔物件
 */
export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_PROFILE));

    const parsed = JSON.parse(raw);
    // 使用預設值進行合併，確保新欄位能正確載入
    return {
      ...JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
      ...parsed,
      equipped: {
        ...DEFAULT_PROFILE.equipped,
        ...(parsed.equipped || {}),
      },
      pets: {
        ...DEFAULT_PROFILE.pets,
        ...(parsed.pets || {}),
      },
      ownedPets: parsed.ownedPets || ['pet_mochi'],
      ownedItems: parsed.ownedItems || [],
      history: parsed.history || [],
    };
  } catch (err) {
    console.error('Failed to load profile:', err);
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  }
}

/**
 * 將玩家存檔儲存到 localStorage
 * @param {Object} profile 玩家存檔物件
 * @returns {Object} 儲存後的物件
 */
export function saveProfile(profile) {
  const next = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

/**
 * 更新部分玩家存檔
 * @param {Function} updater 接收當前存檔並返回更新後的存檔
 * @returns {Object} 儲存後的物件
 */
export function patchProfile(updater) {
  const current = loadProfile();
  const next = updater(JSON.parse(JSON.stringify(current)));
  return saveProfile(next);
}

/**
 * 取得完整的原始存檔物件 (供雲端同步使用)
 */
export function getProfileRaw() {
  return loadProfile();
}

/**
 * 完整替換目前的存檔 (供雲端同步覆蓋使用)
 */
export function replaceProfile(newProfile) {
  return saveProfile(newProfile);
}

/**
 * 重設玩家存檔 (家長功能)
 */
export function resetProfile() {
  localStorage.removeItem(PROFILE_KEY);
}
