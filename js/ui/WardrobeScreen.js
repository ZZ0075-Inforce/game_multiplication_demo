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

    // 初始化拖曳功能
    this._initDrag(container.querySelector('.layer-hat'), 'hat');
    this._initDrag(container.querySelector('.layer-cloth'), 'cloth');
    this._initDrag(container.querySelector('.layer-acc'), 'accessory');
  }

  _initDrag(el, type) {
    if (!el) return;
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialOffsetX = 0;
    let initialOffsetY = 0;

    const onPointerDown = (e) => {
      // 只有在該部位有裝備時才能拖曳
      const key = type === 'hat' ? 'hatId' : type === 'cloth' ? 'clothId' : 'accessoryId';
      if (!this._profile || !this._profile.equipped[key]) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const offsets = this._profile.equippedOffsets || {
        hat: { x: 0, y: -50 }, cloth: { x: 0, y: 30 }, accessory: { x: 40, y: 10 }
      };
      
      initialOffsetX = offsets[type].x;
      initialOffsetY = offsets[type].y;
      
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      // 防止預設行為 (例如捲動)
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = initialOffsetX + dx;
      const newY = initialOffsetY + dy;
      el.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      el.releasePointerCapture(e.pointerId);
      el.classList.remove('dragging');
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = initialOffsetX + dx;
      const newY = initialOffsetY + dy;
      
      document.dispatchEvent(new CustomEvent('wardrobe:offset', {
        detail: { type, x: newX, y: newY }
      }));
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
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
