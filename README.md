# 膽子真是肥嘟嘟的 · 節律日記

React + TypeScript + Vite 打造的私密日記 PWA。資料只存在瀏覽器 localStorage,可匯出/匯入 JSON 備份。iOS 上用 Safari「加到主畫面」即可當 app 使用。

## 本機開發

```bash
npm install
npm run dev
```

會啟動本機開發伺服器,瀏覽器打開顯示的網址即可即時預覽。

## 建置

```bash
npm run build
```

會產生 `dist/` 資料夾,裡面是打包好的靜態網站。

## 部署到 GitHub Pages

**方法一:GitHub Actions 自動部署(推薦)**

1. 把整個專案 push 到 GitHub repo
2. 到 repo 的 **Settings → Pages**,Source 選 **GitHub Actions**
3. 之後每次 push 到 `main` branch,`.github/workflows/deploy.yml` 會自動 build 並部署,不需要手動操作

**重要:記得改 `vite.config.ts` 裡的 `base`**

```ts
export default defineConfig({
  plugins: [react()],
  base: '/你的repo名稱/',   // 例如 '/rhythm-diary/'
})
```

如果你的 repo 名稱本身就是 `你的帳號.github.io`,則 `base` 維持 `'/'` 即可。

## 這次新增的功能:JSON 備份與還原

- **匯出備份**:把目前所有紀錄打包成一個帶時間戳的 `.json` 檔案下載
- **匯入備份**:選擇之前匯出的 json 檔案還原,有兩種模式:
  - **合併**:同一天的紀錄以匯入檔案為準,其餘保留原本資料
  - **覆蓋**:完全取代目前所有紀錄

建議定期匯出備份,存到 iCloud 雲端硬碟或其他雲端空間,換裝置或重灌瀏覽器時就能匯入救回資料。
