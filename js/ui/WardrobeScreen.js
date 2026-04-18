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

    // 拖曳初始化移至 refreshList 內部動態綁定
  }

  _initAllDrags() {
    const layers = this._previewEl.querySelectorAll('.pet-wear-layer');
    layers.forEach(el => {
      const itemId = el.dataset.id;
      if (!itemId) return;

      let isDragging = false;
      let startX = 0, startY = 0;
      let initialX = 0, initialY = 0;

      el.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const offsets = this._profile.equippedOffsets || {};
        initialX = offsets[itemId] ? offsets[itemId].x : 0;
        initialY = offsets[itemId] ? offsets[itemId].y : 0;
        
        el.setPointerCapture(e.pointerId);
        el.classList.add('dragging');
        e.preventDefault();
      });

      el.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        el.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
      });

      const onUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove('dragging');
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        document.dispatchEvent(new CustomEvent('wardrobe:offset', {
          detail: { id: itemId, x: initialX + dx, y: initialY + dy }
        }));
      };

      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });
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
    
    const equippedList = this._profile.equippedList || [];

    // 1. 先列出寵物 (更換底座)
    this._profile.ownedPets.forEach(petId => {
      const pet = findItemById(petId);
      const isSelected = this._profile.selectedPetId === petId;
      this._addItemToGrid(pet, isSelected, () => this._handleEquip('pet', petId));
    });

    // 2. 再列出所有擁有的道具
    this._profile.ownedItems.forEach(itemId => {
      const item = findItemById(itemId);
      const isEquipped = equippedList.includes(itemId) || Object.values(this._profile.equipped || {}).includes(itemId);
      this._addItemToGrid(item, isEquipped, () => this._handleEquip(item.type, itemId));
    });

    // 重新綁定拖曳
    this._initAllDrags();
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
