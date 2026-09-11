# 星塵工坊 | Stardust Workshop

一款可直接部署到 GitHub Pages 的中文點擊放置遊戲。

## 特色

- 點擊核心採集星塵，支援暴擊與粒子回饋
- 4 種升級：點擊力量、自動採集、產出倍率、暴擊機率
- 自動產出與離線收益，最多計算 8 小時
- 玩家等級、任務成就、統計資料
- Supabase 全球排行榜，離線時自動退回本機排行榜
- `localStorage` 自動保存，重新開啟瀏覽器可接續進度
- 響應式設計，支援手機與桌面
- 純 HTML、CSS、JavaScript，無建置工具與後端依賴

## 本機執行

直接用瀏覽器開啟 `index.html` 即可遊玩。若想在本機啟動靜態伺服器：

```bash
python -m http.server 5500
```

然後前往 <http://localhost:5500>。

## 發布到 GitHub Pages

1. 在 GitHub 建立一個新的 repository。
2. 將本資料夾內的檔案上傳，或執行：

```bash
git init
git add .
git commit -m "feat: create stardust workshop clicker game"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

3. 開啟 repository 的 **Settings > Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. 選擇 `main` 分支與 `/ (root)`，按下 **Save**。

幾分鐘後即可使用 GitHub Pages 網址遊玩。

## Supabase 全球排行榜

排行榜資料表定義位於 `supabase-schema.sql`。目前 project 使用 Supabase 免費方案，前端只使用公開 publishable key；資料表已透過 RLS 限制只能讀取或提交符合範圍的分數。

## 資料說明

遊戲資料只會儲存在玩家目前瀏覽器的 `localStorage`，不會上傳到伺服器。清除瀏覽器網站資料或按下右上角重置按鈕會刪除進度。
