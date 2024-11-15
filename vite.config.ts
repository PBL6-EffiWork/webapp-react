import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  base: '/',
  define: {
    'process.env': process.env
  },
  plugins: [
    react(),
    svgr()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
