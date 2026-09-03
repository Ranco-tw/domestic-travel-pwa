# 旅途收藏

台灣國內旅遊 PWA：收藏想去的地方、整理去過的評價、安排旅行行程。

## 開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`。

## 環境變數

複製 `.env.example` 成 `.env.local`，填入：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_MAPS_API_KEY=
```

`GOOGLE_MAPS_API_KEY` 只會在 server API route 使用，不會送到前端。

## Supabase

1. 建立 Supabase 專案。
2. 到 SQL Editor 執行 `supabase/schema.sql`。
3. 到 Authentication 建立第一版固定登入帳號。
4. 把 Supabase URL 和 anon key 放到 Vercel Environment Variables。

目前第一版先用本機 localStorage 示範完整流程。Supabase schema 和 client 已預留，後續可把資料操作換成雲端同步。

## Google Maps API

目前沒有 Google Maps API key 時，探索頁會提示使用手動新增。之後取得 key 後，把它加到 Vercel：

```env
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

後端 endpoint：`POST /api/places/resolve`。

## iPhone 加入主畫面

部署到 Vercel 後，用 iPhone Safari 開啟網址，點分享，選「加入主畫面」。
