# Research: 太空射擊風格乘法練習網頁遊戲

**Date**: 2026-04-05  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

---

## R-001：計時器暫停機制（pure JS）

**Decision**: 使用 `performance.now()` 記錄暫停點，以「剩餘毫秒數」取代「目前 interval 秒數」管理計時狀態。

**Rationale**:
`setInterval` 本身不支援暫停，Naive 作法為 `clearInterval` 後重新倒數——但此法會在暫停時遺失精確剩餘時間（精度為整秒）。改用 `performance.now()` 方案：
```
pause()  → remaining = deadline - performance.now()
resume() → deadline = performance.now() + remaining
```
此方案精確至毫秒，且不依賴任何外部函式庫。

**Alternatives considered**:
- `clearInterval + 保存整秒`：精度差 ±1 秒，不採用
- `requestAnimationFrame`：可行但複雜度高；`setInterval(fn, 100)` 精度已足夠遊戲計時

---

## R-002：動畫策略（CSS Animation vs Canvas）

**Decision**: 採 **CSS Animation + CSS Custom Properties**，不使用 Canvas API。

**Rationale**:
- 敵機擊落、戰機受損、過關特效皆為離散事件，觸發頻率低（每題一次），不需連續繪製
- CSS Animation 由瀏覽器 GPU 加速，效能佳且程式碼量少
- `@keyframes` 搭配 `animation-play-state` 可輕鬆控制播放/停止
- Canvas API 適合需要逐幀繪製的射擊彈幕，本遊戲不需要此能力

**Implementation pattern**:
```css
.enemy-ship.exploding {
  animation: explode 0.5s ease-out forwards;
}
@keyframes explode {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.5); opacity: 0.7; }
  100% { transform: scale(2); opacity: 0; }
}
```
JS 只需 `element.classList.add('exploding')`，聆聽 `animationend` 後清除。

**Alternatives considered**:
- Canvas API：功能強大但本遊戲不需要，開發成本高
- GIF 動畫：檔案大、無法程式控制
- Web Animations API：與 CSS @keyframes 等效，增加複雜度無益

---

## R-003：localStorage 結構設計（排行榜）

**Decision**: 以單一 key `'multiplicationGame_leaderboard'` 儲存 JSON 陣列，最多保留 10 筆，按 `score` 降序排列。

**Rationale**:
排行榜為簡單列表，不需關聯式結構。單一 key 存取最簡單，且 localStorage 值大小限制約 5MB，10 筆成績記錄（每筆約 200 bytes）遠低於上限。

**Schema**:
```json
[
  {
    "rank": 1,
    "playerName": "小明",
    "score": 480,
    "stars": 10,
    "correctCount": 48,
    "wrongCount": 2,
    "durationSec": 856,
    "date": "2026-04-05"
  }
]
```

**Write policy**: 每局結束後將新成績插入陣列，依 `score` 降序排序，截斷至前 10 筆後寫回。

**Alternatives considered**:
- IndexedDB：功能強大但 API 異步複雜，對 10 筆資料過度工程化
- 多個 localStorage key（每筆獨立）：讀取需遍歷，刪除困難

---

## R-004：CSV 下載（無後端）

**Decision**: 使用 `Blob` + `URL.createObjectURL` + 動態 `<a>` 標籤觸發下載。

**Rationale**:
瀏覽器原生 API，不需任何函式庫，IE 11+ 以上均支援（GitHub Pages 目標瀏覽器已全數支援）。

**Implementation pattern**:
```javascript
function downloadCsv(content, filename) {
  // 加入 BOM 確保 Excel 正確顯示繁體中文
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // e.g. game_score_20260405_143025.csv
  a.click();
  URL.revokeObjectURL(url);
}
```

**CSV format**（UTF-8 with BOM）:
```
日期時間,玩家名稱,總分,答對題數,答錯題數,完成時間(秒),星星等級
2026-04-05 14:30:25,小明,380,38,12,923,8
```

**Alternatives considered**:
- `data:` URI：舊方案，部分瀏覽器有 URL 長度限制，不採用
- `FileSaver.js` 函式庫：功能一致但引入外部依賴，違反「無 CDN」限制

---

## R-005：ES Module 在 GitHub Pages 的相容性

**Decision**: 使用 `<script type="module">` 直接在 HTML 引入 ES Modules，無需 bundler。

**Rationale**:
ES Modules 已被 Chrome 61+、Firefox 60+、Safari 10.1+、Edge 16+ 原生支援，覆蓋率 >95%（2026 年）。GitHub Pages 伺服器提供正確 MIME type（`application/javascript`），ES Modules 可直接運作。

**Caveats**:
- ES Modules 必須透過 HTTP/HTTPS 載入（不能直接開啟本機 `file://`），本機開發需使用 `live-server` 或 VS Code Live Preview
- 相對路徑必須包含副檔名（`import './Timer.js'` 而非 `import './Timer'`）

**Local development**:
```bash
# VS Code Live Server 擴充功能，或
npx serve .
```

**Alternatives considered**:
- Webpack / Vite / Rollup：可行但引入建構工具複雜度，違反「純前端工具」精神
- 單一 `<script>` 全域命名空間：維護困難，模組邊界不清

---

## R-006：難度關卡題目範圍設計（數學驗證）

**Decision**: 採用以下分段，確保所有組合乘積 ≤ 999。

| 關卡 | 被乘數範圍 | 乘數範圍 | 最大乘積 |
|------|-----------|---------|---------|
| 1–2  | 10–30     | 1–3     | 90 ✅   |
| 3–4  | 20–50     | 2–5     | 250 ✅  |
| 5–6  | 30–70     | 3–7     | 490 ✅  |
| 7–8  | 40–90     | 4–8     | 720 ✅  |
| 9–10 | 50–99     | 5–9     | 891 ✅  |

**Validation**: 99 × 9 = 891 ≤ 999；系統仍需過濾（例如關卡 9–10 若隨機產生 112 × 9 需排除）但實際上被乘數上限 99 × 乘數上限 9 = 891，不可能超過 999，無需額外過濾。

**Note**: 系統仍保留過濾邏輯以防邊界外的隨機值。

---

## R-007：干擾選項生成策略

**Decision**: 採用「正確答案 ± 偏移量」策略，偏移量從預定義集合隨機選取，確保 6 個選項不重複且合理。

**Rationale**:
純隨機數字對兒童無教育意義。選用接近正確答案的偏移可測試「接近但不準確」的錯誤模式。

**Algorithm**:
```
offsets = [-20, -10, -5, +5, +10, +20, -1, +1, -50, +50]
候選答案 = 正確答案 + 隨機 shuffle 後的前 5 個 offset
過濾條件: 候選答案 > 0 且 ≠ 正確答案 且不重複
若候選不足 5 個則補充其他偏移量
```

**Alternatives considered**:
- 完全隨機：對學習無意義，且可能產生 0 或負數
- 同個位數/十位數錯誤：需複雜算式解析，過度工程化

---

## 結論

| 未知項目 | 決策 | 狀態 |
|---------|------|------|
| 計時器暫停 | `performance.now()` 記錄剩餘時間 | ✅ 已解決 |
| 動畫策略 | CSS Animation + classList | ✅ 已解決 |
| localStorage 結構 | 單一 key JSON 陣列，10 筆上限 | ✅ 已解決 |
| CSV 下載 | Blob + URL.createObjectURL + BOM | ✅ 已解決 |
| ES Module 相容性 | 原生支援，需 HTTP 伺服器開發 | ✅ 已解決 |
| 難度分段設計 | 5 段關卡範圍，最大乘積 891 | ✅ 已解決 |
| 干擾選項生成 | ±偏移量策略 | ✅ 已解決 |
