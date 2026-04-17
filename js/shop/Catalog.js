// js/shop/Catalog.js

/**
 * 寵物清單
 */
export const PETS = [
  { id: 'pet_mochi', name: '麻糬獸', price: 0, emoji: '🐣', description: '最愛吃麻糬的小怪獸', unlockByDefault: true },
  { id: 'pet_dino', name: '小恐龍獸', price: 120, emoji: '🦖', description: '勇敢又威猛的小恐龍' },
  { id: 'pet_cloud', name: '棉花雲獸', price: 180, emoji: '☁️', description: '軟綿綿的雲朵好朋友' },
  { id: 'pet_cat', name: '貓貓獸', price: 250, emoji: '🐱', description: '調皮搗蛋的好奇貓貓' },
  { id: 'pet_dog', name: '汪汪獸', price: 250, emoji: '🐶', description: '最忠心的狗狗好夥伴' },
  { id: 'pet_fox', name: '狐狸獸', price: 300, emoji: '🦊', description: '聰明機靈的小狐狸' },
  { id: 'pet_lion', name: '獅子獸', price: 350, emoji: '🦁', description: '萬獸之王的縮小版' },
  { id: 'pet_frog', name: '青蛙獸', price: 150, emoji: '🐸', description: '喜歡在雨天唱歌' },
  { id: 'pet_panda', name: '熊貓獸', price: 400, emoji: '🐼', description: '愛吃竹子的小胖子' },
  { id: 'pet_unicorn', name: '獨角獸', price: 500, emoji: '🦄', description: '傳說中的奇幻生物' }
];

/**
 * 時裝與配件清單
 */
export const ITEMS = [
  // 帽子 (hat)
  { id: 'hat_star', type: 'hat', name: '星星帽', price: 40, emoji: '🎩', description: '閃閃發亮的魔術師帽子' },
  { id: 'hat_crown', type: 'hat', name: '小皇冠', price: 80, emoji: '👑', description: '國王與公主專屬的皇冠' },
  { id: 'hat_ribbon', type: 'hat', name: '大蝴蝶結', price: 50, emoji: '🎀', description: '超級可愛的粉紅蝴蝶結' },
  { id: 'hat_cap', type: 'hat', name: '鴨舌帽', price: 45, emoji: '🧢', description: '運動風的棒球帽' },
  { id: 'hat_chef', type: 'hat', name: '廚師帽', price: 60, emoji: '🧑‍🍳', description: '準備煮頓大餐' },
  { id: 'hat_grad', type: 'hat', name: '畢業帽', price: 70, emoji: '🎓', description: '恭喜你畢業了！' },
  { id: 'hat_cowboy', type: 'hat', name: '牛仔帽', price: 65, emoji: '🤠', description: '狂野的西部風情' },
  { id: 'hat_helmet', type: 'hat', name: '安全帽', price: 55, emoji: '🪖', description: '出門探險要注意安全' },
  
  // 衣服 (cloth)
  { id: 'cloth_cape', type: 'cloth', name: '超人披風', price: 60, emoji: '🦸', description: '穿上它感覺充滿了勇氣' },
  { id: 'cloth_uniform', type: 'cloth', name: '探險裝', price: 90, emoji: '🧥', description: '適合冒險的小小探險服' },
  { id: 'cloth_kimono', type: 'cloth', name: '漂亮和服', price: 100, emoji: '👘', description: '很有節慶感的華麗和服' },
  { id: 'cloth_dress', type: 'cloth', name: '洋裝', price: 85, emoji: '👗', description: '輕飄飄的美麗洋裝' },
  { id: 'cloth_suit', type: 'cloth', name: '西裝', price: 110, emoji: '👔', description: '非常正式的帥氣西裝' },
  { id: 'cloth_shirt', type: 'cloth', name: '休閒T恤', price: 40, emoji: '👕', description: '輕鬆自在的舒適服裝' },
  { id: 'cloth_scarf', type: 'cloth', name: '保暖圍巾', price: 50, emoji: '🧣', description: '冬天必備的溫暖圍巾' },

  // 配件 (accessory)
  { id: 'acc_glasses', type: 'accessory', name: '紅眼鏡', price: 30, emoji: '👓', description: '看起來很有智慧的眼鏡' },
  { id: 'acc_magic_wand', type: 'accessory', name: '魔法棒', price: 70, emoji: '🪄', description: '可以變出驚喜的魔法棒' },
  { id: 'acc_balloon', type: 'accessory', name: '氣球', price: 35, emoji: '🎈', description: '一不小心就會飛走喔' },
  { id: 'acc_flower', type: 'accessory', name: '小花', price: 25, emoji: '🌸', description: '散發淡淡的香味' },
  { id: 'acc_sword', type: 'accessory', name: '玩具劍', price: 60, emoji: '🗡️', description: '勇者的第一把武器' },
  { id: 'acc_shield', type: 'accessory', name: '玩具盾', price: 60, emoji: '🛡️', description: '可以擋住所有攻擊' },
  { id: 'acc_lollipop', type: 'accessory', name: '棒棒糖', price: 20, emoji: '🍭', description: '甜甜的滋味最棒了' },
  { id: 'acc_bag', type: 'accessory', name: '小背包', price: 55, emoji: '🎒', description: '可以裝很多零食' },
  { id: 'acc_umbrella', type: 'accessory', name: '雨傘', price: 45, emoji: '🌂', description: '下雨天也不怕' }
];

/**
 * 根據 ID 查找商品
 */
export function findItemById(id) {
  return ITEMS.find(item => item.id === id) || PETS.find(pet => pet.id === id);
}
