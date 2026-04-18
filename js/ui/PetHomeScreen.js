// js/ui/PetHomeScreen.js
import { getPetExpTarget, getMoodText } from '../game/Progression.js';
import { findItemById } from '../shop/Catalog.js';

export class PetHomeScreen {
  constructor(container) {
    this._el = container;
    this._playerEl = container.querySelector('#pet-home-player');
    this._coinsEl = container.querySelector('#pet-home-coins');
    this._starsEl = container.querySelector('#pet-home-stars');
    
    this._petNameEl = container.querySelector('#pet-name');
    this._petLevelEl = container.querySelector('#pet-level');
    this._petMoodEl = container.querySelector('#pet-mood');
    this._expBarEl = container.querySelector('#pet-exp-bar');
    this._playBtn = container.querySelector('#btn-play-from-pet-home');
    this._resumeBtn = container.querySelector('#btn-resume-game-from-pet-home');
    this._syncBtn = container.querySelector('#btn-cloud-sync');

    // 綁定按鈕事件
    this._playBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:play')));

    this._resumeBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:resume-game')));

    this._syncBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('cloud:sync-requested')));

    container.querySelector('#btn-edit-name')
      .addEventListener('click', () => this._handleRename());

    container.querySelector('#btn-open-shop')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:shop')));

    container.querySelector('#btn-open-wardrobe')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:wardrobe')));

    container.querySelector('#btn-open-leaderboard')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:leaderboard')));
  }

  _handleRename() {
    const newName = prompt('請輸入新的名字：', this._playerEl.textContent);
    if (newName && newName.trim() !== '') {
      document.dispatchEvent(new CustomEvent('profile:rename', {
        detail: { name: newName.trim() }
      }));
    }
  }

  /**
   * 控制是否顯示「繼續遊戲」按鈕
   * @param {boolean} hasPausedGame 
   */
  setResumeState(hasPausedGame) {
    if (this._resumeBtn) this._resumeBtn.style.display = hasPausedGame ? 'block' : 'none';
    if (this._playBtn) this._playBtn.style.display = hasPausedGame ? 'none' : 'block';
  }

  /**
   * 更新雲端同步按鈕狀態
   * @param {'idle'|'syncing'|'synced'|'error'} status 
   */
  setSyncStatus(status) {
    if (!this._syncBtn) return;
    
    this._syncBtn.classList.remove('syncing', 'synced');
    
    switch (status) {
      case 'syncing':
        this._syncBtn.textContent = '☁️ 同步中...';
        this._syncBtn.classList.add('syncing');
        break;
      case 'synced':
        this._syncBtn.textContent = '☁️ 已同步';
        this._syncBtn.classList.add('synced');
        break;
      case 'error':
        this._syncBtn.textContent = '☁️ 同步失敗';
        break;
      default:
        this._syncBtn.textContent = '☁️ 雲端同步';
    }
  }

  /**
   * 渲染寵物小屋
   * @param {Object} profile 玩家存檔
   */
  render(profile) {
    const petId = profile.selectedPetId;
    const petData = profile.pets[petId];
    const petBase = findItemById(petId);

    this._playerEl.textContent = profile.playerName;
    this._coinsEl.textContent = `🪙 ${profile.coins}`;
    this._starsEl.textContent = `⭐ ${profile.stars}`;
    
    this._petNameEl.textContent = petBase.name;
    this._petLevelEl.textContent = petData.level;
    this._petMoodEl.textContent = `今天心情：${getMoodText(petData.mood)}`;

    // 更新經驗條
    const targetExp = getPetExpTarget(petData.level);
    const progress = Math.min(100, (petData.exp / targetExp) * 100);
    this._expBarEl.style.width = `${progress}%`;

    // 更新寵物外觀展示
    const displayContainer = this._el.querySelector('.pet-display-container');
    this.updatePetDisplay(displayContainer, profile);
  }

  /**
   * 通用的寵物外觀渲染邏輯
   * @param {HTMLElement} container 包含 .pet-display-container 的容器
   * @param {Object} profile 玩家存檔
   */
  updatePetDisplay(container, profile) {
    const petId = profile.selectedPetId;
    const petBase = findItemById(petId);
    
    // 清空並只保留寵物本體
    container.innerHTML = `<div class="pet-character">${petBase.emoji}</div>`;

    const offsets = profile.equippedOffsets || {};

    // 相容舊資料，若沒有 equippedList 則自動轉換
    const equippedList = profile.equippedList || [];
    if (profile.equipped && equippedList.length === 0) {
      if (profile.equipped.hatId) equippedList.push(profile.equipped.hatId);
      if (profile.equipped.clothId) equippedList.push(profile.equipped.clothId);
      if (profile.equipped.accessoryId) equippedList.push(profile.equipped.accessoryId);
    }

    // 渲染所有已裝備的物品
    equippedList.forEach(itemId => {
      const item = findItemById(itemId);
      if (!item) return;
      
      const layer = document.createElement('div');
      layer.className = 'pet-wear-layer';
      layer.dataset.id = itemId;
      layer.textContent = item.emoji;
      
      let zIndex = 5;
      if (item.type === 'cloth') zIndex = 2; // 怪獸上方，帽子下方
      if (item.type === 'hat') zIndex = 5;
      if (item.type === 'accessory') zIndex = 10;
      layer.style.zIndex = zIndex;
      
      const off = offsets[itemId] || { x: 0, y: 0 };
      layer.style.transform = `translate(${off.x}px, ${off.y}px)`;
      
      container.appendChild(layer);
    });
  }
}
