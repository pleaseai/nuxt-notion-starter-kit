import siteConfig from './site.config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-22',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },
  devServer: { port: 3900 },

  // Expose site config to runtime
  runtimeConfig: {
    notionToken: process.env.NOTION_TOKEN || '',
    public: {
      siteConfig: siteConfig as Record<string, unknown>,
      host: process.env.NUXT_PUBLIC_HOST || `https://${siteConfig.domain}`,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: siteConfig.language || 'en' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: [
    '~/assets/css/global.css',
  ],

  modules: ['@nuxt/eslint'],
  eslint: {
    config: {
      standalone: false, // <---
    },
  },
})
