// js/ui/WardrobeScreen.js
import { findItemById } from '../shop/Catalog.js';

export class WardrobeScreen {
  constructor(container, petHomeScreen) {
    this._el = container;
    this._petHomeScreen = petHomeScreen; // 複用其更新邏輯
    this._previewEl = container.querySelector('.wardrobe-preview-box');
    this._listEl = container.querySelector('#wardrobe-list');

    container.querySelector('#btn-back-pet-home-from-wardrobe')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:pet-home')));
  }

  /**
   * 渲染衣櫃
   * @param {Object} profile 玩家存檔
   */
  render(profile) {
    this._profile = profile;
    this._petHomeScreen.updatePetDisplay(this._previewEl, profile);
    this.refreshList();
  }

  /**
   * 重新整理衣櫃內容
   */
  refreshList() {
    this._listEl.innerHTML = '';

    // 1. 先列出寵物 (更換底座)
    this._profile.ownedPets.forEach(petId => {
      const pet = findItemById(petId);
      const isSelected = this._profile.selectedPetId === petId;
      this._addItemToGrid(pet, isSelected, () => this._handleEquip('pet', petId));
    });

    // 2. 再列出所有擁有的道具
    this._profile.ownedItems.forEach(itemId => {
      const item = findItemById(itemId);
      const isEquipped = Object.values(this._profile.equipped).includes(itemId);
      this._addItemToGrid(item, isEquipped, () => this._handleEquip(item.type, itemId));
    });
  }

  _addItemToGrid(item, active, onClick) {
    const itemEl = document.createElement('div');
    itemEl.className = `wardrobe-item ${active ? 'equipped' : ''}`;
    itemEl.textContent = item.emoji;
    itemEl.title = item.name;
    itemEl.addEventListener('click', onClick);
    this._listEl.appendChild(itemEl);
  }

  _handleEquip(type, id) {
    document.dispatchEvent(new CustomEvent('wardrobe:equip', {
      detail: { type, id }
    }));
  }
}
