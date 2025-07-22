import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置文档: https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 指定Vue应用的根目录
  root: 'src/renderer',
  build: {
    // 指定构建输出目录
    outDir: '../../dist/renderer',
    // 构建时清空输出目录
    emptyOutDir: true
  }
})
