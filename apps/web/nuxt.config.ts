import siteConfig from './site.config'

export default defineNuxtConfig({
  extends: ['@pleaseai/notion-nuxt-layer'],

  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

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
})
