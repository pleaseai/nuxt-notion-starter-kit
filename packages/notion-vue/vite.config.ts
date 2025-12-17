import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NotionVue',
      formats: ['es'],
      fileName: 'index',
    },
    minify: 'terser',
    terserOptions: {
      mangle: {
        // Reserve Vue's 'h' function name to avoid conflicts
        reserved: ['h'],
      },
    },
    rollupOptions: {
      external: ['vue', 'notion-types', 'notion-utils'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
