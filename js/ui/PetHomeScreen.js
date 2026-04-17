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

    // 綁定按鈕事件
    this._playBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:play')));

    this._resumeBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:resume-game')));

    container.querySelector('#btn-open-shop')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:shop')));

    container.querySelector('#btn-open-wardrobe')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:wardrobe')));

    container.querySelector('#btn-open-leaderboard')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:leaderboard')));
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
    this.updatePetDisplay(this._el, profile);
  }

  /**
   * 通用的寵物外觀渲染邏輯
   * @param {HTMLElement} container 包含 .pet-display-container 的容器
   * @param {Object} profile 玩家存檔
   */
  updatePetDisplay(container, profile) {
    const petId = profile.selectedPetId;
    const petBase = findItemById(petId);
    
    const charEl = container.querySelector('.pet-character');
    const hatEl = container.querySelector('.layer-hat');
    const clothEl = container.querySelector('.layer-cloth');
    const accEl = container.querySelector('.layer-acc');

    if (charEl) charEl.textContent = petBase.emoji;

    // 清空並更新時裝
    if (hatEl) {
      const item = profile.equipped.hatId ? findItemById(profile.equipped.hatId) : null;
      hatEl.textContent = item ? item.emoji : '';
    }
    if (clothEl) {
      const item = profile.equipped.clothId ? findItemById(profile.equipped.clothId) : null;
      clothEl.textContent = item ? item.emoji : '';
    }
    if (accEl) {
      const item = profile.equipped.accessoryId ? findItemById(profile.equipped.accessoryId) : null;
      accEl.textContent = item ? item.emoji : '';
    }
  }
}
