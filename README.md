# Cycle Focus

一個 iOS 優先的 React + TypeScript + Vite 月曆原型，將每日筆記與生理週期放在同一個可規劃生活的月曆裡。

## 目前功能

- 月曆瀏覽、每日筆記與今日標示
- 生理期起始日／天數紀錄，依「平均週期長度」推算接下來四個週期
- 玫瑰、薰衣草、薄荷三種可切換色系
- 瀏覽器 `localStorage` 儲存資料
- JSON 匯出與匯入：可把檔案存進 iCloud Drive 進行手動雲端備份
- PWA manifest 與 service worker，iPhone Safari 可「加入主畫面」使用

## 啟動

```bash
pnpm install
pnpm dev
```

## 雲端同步的下一步

目前的「備份」不會把私密生理資料自動上傳到第三方；使用者自行選擇將 JSON 放進 iCloud Drive 等雲端。若需要跨裝置自動同步，建議加上 Supabase Auth 與一張依 `user_id` 隔離且啟用 RLS 的資料表，再把 `localStorage` 讀寫抽換成同步層。

> 週期預測僅為規劃提示，不能作為醫療、避孕或懷孕判斷用途。
