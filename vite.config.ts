import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到 GitHub Pages 時,base 要改成你的 repo 名稱,例如:
// base: '/rhythm-diary/'
// 如果 repo 名稱就是 <你的帳號>.github.io,則維持 '/' 即可
export default defineConfig({
  plugins: [react()],
  base: '/feidudu/',
})
