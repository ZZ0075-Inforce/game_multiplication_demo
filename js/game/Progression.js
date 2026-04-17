// js/game/Progression.js

/**
 * 取得當前等級所需的經驗值目標
 * @param {number} level 當前等級
 * @returns {number} 目標經驗值
 */
export function getPetExpTarget(level) {
  // 每級所需經驗值：30, 60, 90...
  return level * 30;
}

/**
 * 為寵物增加經驗值並處理升級
 * @param {Object} pet 寵物物件
 * @param {number} expGain 獲得的經驗值
 * @returns {Object} 更新後的寵物物件
 */
export function applyPetExp(pet, expGain) {
  let level = pet.level || 1;
  let exp = (pet.exp || 0) + expGain;
  let mood = pet.mood || 80;

  // 檢查是否可以連跳多級
  while (exp >= getPetExpTarget(level)) {
    exp -= getPetExpTarget(level);
    level += 1;
  }

  // 答題也會讓心情變好
  mood = Math.min(100, mood + Math.floor(expGain / 5));

  return {
    ...pet,
    level,
    exp,
    mood,
  };
}

/**
 * 取得寵物心情描述
 * @param {number} mood 心情值 0-100
 */
export function getMoodText(mood) {
  if (mood >= 90) return '超級開心！💖';
  if (mood >= 70) return '很有精神 ✨';
  if (mood >= 50) return '還不錯 😊';
  if (mood >= 30) return '有一點累 💤';
  return '想休息了 🥺';
}
