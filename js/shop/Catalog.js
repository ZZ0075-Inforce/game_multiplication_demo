// js/shop/Catalog.js

/**
 * 寵物清單
 */
export const PETS = [
  { id: 'pet_mochi', name: '麻糬獸', price: 0, emoji: '🐣', description: '最愛吃麻糬的小怪獸', unlockByDefault: true },
  { id: 'pet_dino', name: '小恐龍獸', price: 120, emoji: '🦖', description: '勇敢又威猛的小恐龍' },
  { id: 'pet_cloud', name: '棉花雲獸', price: 180, emoji: '☁️', description: '軟綿綿的雲朵好朋友' },
  { id: 'pet_cat', name: '貓貓獸', price: 250, emoji: '🐱', description: '調皮搗蛋的好奇貓貓' },
];

/**
 * 時裝與配件清單
 */
export const ITEMS = [
  // 帽子
  { id: 'hat_star', type: 'hat', name: '星星帽', price: 40, emoji: '🎩', description: '閃閃發亮的魔術師帽子' },
  { id: 'hat_crown', type: 'hat', name: '小皇冠', price: 80, emoji: '👑', description: '國王與公主專屬的皇冠' },
  { id: 'hat_ribbon', type: 'hat', name: '大蝴蝶結', price: 50, emoji: '🎀', description: '超級可愛的粉紅蝴蝶結' },
  
  // 衣服
  { id: 'cloth_cape', type: 'cloth', name: '超人披風', price: 60, emoji: '🦸', description: '穿上它感覺充滿了勇氣' },
  { id: 'cloth_uniform', type: 'cloth', name: '探險裝', price: 90, emoji: '🧥', description: '適合冒險的小小探險服' },
  { id: 'cloth_kimono', type: 'cloth', name: '漂亮和服', price: 100, emoji: '👘', description: '很有節慶感的華麗和服' },

  // 配件
  { id: 'acc_glasses', type: 'accessory', name: '紅眼鏡', price: 30, emoji: '👓', description: '看起來很有智慧的眼鏡' },
  { id: 'acc_magic_wand', type: 'accessory', name: '魔法棒', price: 70, emoji: '🪄', description: '可以變出驚喜的魔法棒' },
];

/**
 * 根據 ID 查找商品
 */
export function findItemById(id) {
  return ITEMS.find(item => item.id === id) || PETS.find(pet => pet.id === id);
}
