export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode', '@nuxt/eslint', '@nuxt/icon', '@nuxt/image'],
  compatibilityDate: '2025-07-22',
  css: [
    '@pleaseai/notion-vue/styles.css',
  ],

  colorMode: {
    classSuffix: '-mode',
    preference: 'system',
    fallback: 'light',
  },

  icon: {
    mode: 'svg',
    clientOnly: true,
  },

  image: {
    // Allow Notion image domains
    domains: [
      'www.notion.so',
      'notion.so',
      's3.us-west-2.amazonaws.com',
      'prod-files-secure.s3.us-west-2.amazonaws.com',
      'images.unsplash.com',
    ],
    // Default quality
    quality: 80,
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
