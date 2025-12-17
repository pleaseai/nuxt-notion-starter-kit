export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode', '@nuxt/eslint', '@nuxt/icon'],
  compatibilityDate: '2025-07-22',
  future: {
    compatibilityVersion: 4,
  },
  css: [
    '@pleaseai/notion-vue/styles.css',
  ],

  colorMode: {
    classSuffix: '-mode',
    preference: 'system',
    fallback: 'light',
  },

  // Default route rules - can be overridden by extending app
  routeRules: {
    '/': { isr: 60 },
    '/**': { isr: 60 },
    '/api/**': { cors: true },
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [],
    },
  },
  eslint: {
    config: {
      standalone: false, // <---
    },
  },
})
