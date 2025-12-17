export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
  ],

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
})
