import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           
    port: 80,
    proxy: {
      '/items': {                    
        target: 'http://backend-dev:3000', 
        changeOrigin: true,
      },
      '/gigachat-oauth': {
      target: 'https://ngw.devices.sberbank.ru:9443',
      changeOrigin: true,
      secure: false,     
      rewrite: (path) => path.replace(/^\/gigachat-oauth/, '/api/v2/oauth'),
    },
    
    '/gigachat-chat': {
      target: 'https://gigachat.devices.sberbank.ru',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/gigachat-chat/, '/api/v1/chat/completions'),
    },
    },
    strictPort: true,
    watch: {
      usePolling: true    
    }
  },
})
