import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import theme from './src/styles/theme.ts'
import typography from './src/styles/typography.ts'

// BoardUI tokens enter Tailwind through a virtual stylesheet; app styling uses utility classes.
const boardStyles = `@import "tailwindcss"; ${theme} ${typography}`
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { host: '127.0.0.1', port: 3006, strictPort: true },
    plugins: [
      {
        name: 'boardui-foundation',
        resolveId(id) {
          if (id.includes('/src/styles/boardui.css')) return id
          if (id === 'virtual:boardui.css' || id === 'virtual:boardui.css?url')
            return (
              fileURLToPath(new URL('./src/styles/boardui.css', import.meta.url)) +
              (id.endsWith('?url') ? '?url' : '')
            )
        },
        load(id) {
          if (id.includes('/src/styles/boardui.css') && !id.includes('?url')) return boardStyles
        },
      },
      tailwind(),
      tanstackStart(),
      react(),
    ],
  }
})
