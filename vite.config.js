import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portfolio-1-todo/',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[name].[hash].[ext]', // CSSや画像などのアセットファイル
        chunkFileNames: '[name].[hash].js',   // 動的インポートのJSファイル
        entryFileNames: '[name].[hash].js',   // エントリーポイントのJSファイル
      },
    },
  },
});
