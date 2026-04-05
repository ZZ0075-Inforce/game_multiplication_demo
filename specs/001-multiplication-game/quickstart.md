# Quickstart: 太空射擊風格乘法練習網頁遊戲

**Date**: 2026-04-05  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

---

## 前置需求

| 項目 | 需求 |
|------|------|
| 瀏覽器 | Chrome 80+ / Edge 80+ / Firefox 75+ / Safari 14+ |
| 本機開發伺服器 | 任一：VS Code Live Server 擴充、`npx serve .`、`python -m http.server` |
| Git | 選用（部署至 GitHub Pages 需要） |

> ⚠️ 直接雙擊 `index.html` 開啟（`file://` 協定）**不支援** ES Modules，必須透過本機 HTTP 伺服器。

---

## 本機開發

### 選項 A：VS Code Live Server（推薦）

1. 安裝 VS Code 擴充功能 **Live Server**（ritwickdey.LiveServer）
2. 在 VS Code 開啟專案資料夾
3. 點選右下角 **Go Live** 或按 `Alt+L Alt+O`
4. 瀏覽器自動開啟 `http://127.0.0.1:5500`

### 選項 B：Node.js serve

```bash
# 安裝（一次性）
npm install -g serve

# 啟動
cd game_multiplication_demo
serve .
# → 開啟 http://localhost:3000
```

### 選項 C：Python

```bash
cd game_multiplication_demo
python -m http.server 8000
# → 開啟 http://localhost:8000
```

---

## 專案結構說明

```text
game_multiplication_demo/
├── index.html          ← 唯一 HTML 入口
├── css/                ← 樣式（main / game / result）
├── js/
│   ├── main.js         ← 程式進入點（載入此檔即啟動）
│   ├── game/           ← 業務邏輯（可獨立測試）
│   ├── ui/             ← DOM 操作與畫面控制
│   ├── data/           ← localStorage 與 CSV 匯出
│   └── audio/          ← 音效管理
└── assets/
    ├── images/         ← SVG/PNG 圖片資源
    └── audio/          ← mp3 音效檔
```

---

## 新增檔案規範

### JS 模組

每個 `.js` 檔案須：
1. 使用 ES Module 語法（`export`/`import`）
2. 相對引入**必須包含副檔名**：`import './Timer.js'`（不可省略 `.js`）
3. 業務邏輯函式（`game/` 目錄下）**不得直接操作 DOM**
4. 繁體中文注解說明業務邏輯；英文用於技術說明

### 音效資源

將 `.mp3` 檔案放至 `assets/audio/`，在 `AudioManager.js` 中統一管理路徑。

### 圖片資源

優先使用 SVG（可縮放、無失真）；動畫 sprite 可使用 PNG。

---

## 部署至 GitHub Pages

```bash
# 1. 建立 GitHub repository
# 2. 推送程式碼
git init
git add .
git commit -m "初始提交：乘法練習遊戲"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main

# 3. 在 GitHub repository settings → Pages
#    Source: Deploy from a branch → main → / (root) → Save

# 4. 等待約 1 分鐘後，遊戲可於以下 URL 存取：
# https://<username>.github.io/<repo>/
```

---

## 核心業務函式驗證（快速測試）

在瀏覽器 Console 貼上以下程式碼，驗證核心邏輯正確性：

```javascript
// 星等計算驗證
import('./js/game/Scoring.js').then(({ calcStars }) => {
  console.assert(calcStars(0)   === 1,  '0 分應為 1 星');
  console.assert(calcStars(50)  === 1,  '50 分應為 1 星');
  console.assert(calcStars(51)  === 2,  '51 分應為 2 星');
  console.assert(calcStars(500) === 10, '500 分應為 10 星');
  console.assert(calcStars(451) === 10, '451 分應為 10 星');
  console.log('✅ 星等計算驗證通過');
});

// CSV 檔名驗證
import('./js/data/CsvExporter.js').then(({ buildCsvFilename }) => {
  const filename = buildCsvFilename('2026-04-05 14:30:25');
  console.assert(filename === 'game_score_20260405_143025.csv', '檔名格式不符');
  console.log('✅ CSV 檔名驗證通過');
});
```

---

## 常見問題

| 問題 | 原因 | 解法 |
|------|------|------|
| Console 出現 `Failed to fetch` 或 CORS 錯誤 | 以 `file://` 直接開啟 | 改用本機 HTTP 伺服器（見上方選項） |
| 音效不播放 | 瀏覽器自動播放政策 | 確認在使用者互動後（點擊按鈕）才呼叫 `AudioManager` |
| localStorage 資料消失 | 瀏覽器無痕/隱私模式 | 一般模式下可正常存取；無痕模式下 localStorage 僅限當次 session |
| GitHub Pages 404 | 路徑大小寫錯誤 | GitHub Pages 在 Linux 伺服器執行，路徑大小寫敏感 |
