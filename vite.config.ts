import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repo name for gh-pages to serve assets correctly
  base: '/flash-pay-front/',
})
