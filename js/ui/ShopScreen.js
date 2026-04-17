// js/ui/ShopScreen.js
import { PETS, ITEMS } from '../shop/Catalog.js';

export class ShopScreen {
  constructor(container) {
    this._el = container;
    this._coinsEl = container.querySelector('#shop-coins');
    this._listEl = container.querySelector('#shop-list');
    this._currentTab = 'pets';

    // 綁定頁籤事件
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this._currentTab = e.target.dataset.tab;
        this.refreshList();
      });
    });

    container.querySelector('#btn-back-pet-home-from-shop')
      .addEventListener('click', () => document.dispatchEvent(new CustomEvent('nav:pet-home')));
  }

  /**
   * 渲染商城
   * @param {Object} profile 玩家存檔
   */
  render(profile) {
    this._profile = profile;
    this._coinsEl.textContent = `🪙 ${profile.coins}`;
    this.refreshList();
  }

  /**
   * 重新整理商品列表
   */
  refreshList() {
    this._listEl.innerHTML = '';
    const catalog = this._currentTab === 'pets' ? PETS : ITEMS;

    catalog.forEach(item => {
      const isOwned = this._currentTab === 'pets' 
        ? this._profile.ownedPets.includes(item.id)
        : this._profile.ownedItems.includes(item.id);

      const itemEl = document.createElement('div');
      itemEl.className = `shop-item ${isOwned ? 'owned' : ''}`;
      itemEl.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-price">${isOwned ? '已擁有' : '🪙 ' + item.price}</div>
      `;

      if (!isOwned) {
        itemEl.addEventListener('click', () => this._handleBuy(item));
      }
      this._listEl.appendChild(itemEl);
    });
  }

  /**
   * 處理購買邏輯
   */
  _handleBuy(item) {
    if (this._profile.coins < item.price) {
      alert('金幣不足喔！快去答題賺金幣吧 🚀');
      return;
    }

    if (confirm(`確定要買「${item.name}」嗎？`)) {
      document.dispatchEvent(new CustomEvent('shop:buy', {
        detail: { item }
      }));
    }
  }
}
