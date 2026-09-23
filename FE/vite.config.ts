import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const r = (p: string) => path.resolve(__dirname, p)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['color-functions', 'global-builtin', 'import'],
      },
    },
  },
  resolve: {
    alias: [
      { find: '~utils', replacement: r('src/utils') },
      { find: '~components', replacement: r('src/components') },
      { find: '~constants', replacement: r('src/constants') },
      { find: '~services', replacement: r('src/services') },
      { find: '~hooks', replacement: r('src/hooks') },
      { find: '~assets', replacement: r('src/assets') },
      { find: '~types', replacement: r('src/types') },
      { find: '~theme', replacement: r('src/theme') },
      { find: '~', replacement: r('src') },
    ],
  },
})
