import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // đường dẫn tương đối -> mở được bằng file:// (bản 1 file HTML)
  base: './',
  build: {
    // gộp hết vào ít file nhất có thể để script inline dễ làm việc
    assetsInlineLimit: 100 * 1024 * 1024, // nhúng mọi ảnh thành data URI
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
  server: {
    port: 5180,
    strictPort: true,
  },
})
