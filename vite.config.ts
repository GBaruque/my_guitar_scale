/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // base relativa: o build funciona em qualquer subpasta (ex.: GitHub Pages em /my_guitar_scale/).
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
