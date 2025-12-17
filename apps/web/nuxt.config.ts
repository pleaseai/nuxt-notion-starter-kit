import siteConfig from './site.config'
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/color-mode',
  ],

  // Hybrid rendering: SSG for known pages, ISR for dynamic
  routeRules: {
    '/': { isr: 60 },
    '/**': { isr: 60 },
    '/api/**': { cors: true },
  },

  // Expose site config to runtime
  runtimeConfig: {
    notionToken: process.env.NOTION_TOKEN || '',
    public: {
      siteConfig: siteConfig as Record<string, unknown>,
      host: process.env.NUXT_PUBLIC_HOST || `https://${siteConfig.domain}`,
    },
  },

  colorMode: {
    classSuffix: '-mode',
    preference: 'system',
    fallback: 'light',
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [],
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
    '@pleaseai/notion-vue/styles.css',
    '~/assets/css/global.css',
  ],

  alias: {
    '~/shared': resolve(__dirname, './shared'),
  },
})
