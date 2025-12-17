export interface NavigationLink {
  title: string
  pageId?: string
  url?: string
}

export type NavigationStyle = 'default' | 'custom'

export interface SiteConfig {
  rootNotionPageId: string
  rootNotionSpaceId?: string | null

  name: string
  domain: string
  author: string
  description?: string
  language?: string

  twitter?: string
  github?: string
  linkedin?: string
  newsletter?: string
  youtube?: string
  mastodon?: string

  defaultPageIcon?: string | null
  defaultPageCover?: string | null
  defaultPageCoverPosition?: number | null

  isPreviewImageSupportEnabled?: boolean
  isSearchEnabled?: boolean
  includeNotionIdInUrls?: boolean

  pageUrlOverrides?: Record<string, string> | null
  pageUrlAdditions?: Record<string, string> | null

  navigationStyle?: NavigationStyle
  navigationLinks?: NavigationLink[]
}

const config: SiteConfig = {
  // The site's root Notion page (required)
  rootNotionPageId: '2cc9accad7c6814ba67ad32dbdd2ffce',

  // If you want to restrict pages to a single notion workspace (optional)
  rootNotionSpaceId: null,

  // Basic site info (required)
  name: 'Nuxt Notion Starter Kit',
  domain: 'nuxt-notion-starter-kit.example.com',
  author: 'Minsu Lee',

  // Open graph metadata (optional)
  description: 'Example Nuxt Notion Starter Kit Site',

  // Language
  language: 'en',

  // Social usernames (optional)
  twitter: '',
  github: 'amondnet',
  linkedin: '',

  // Default notion icon and cover images for site-wide consistency (optional)
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // Whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: false,

  // Optional site search
  isSearchEnabled: true,

  // Whether to include Notion ID in URLs or just use slugs
  includeNotionIdInUrls: false,

  // Map of notion page IDs to URL paths (optional)
  pageUrlOverrides: null,

  // Navigation style: 'default' or 'custom'
  navigationStyle: 'default',
  // navigationLinks: [
  //   { title: 'About', pageId: 'f1199d37579b41cbabfc0b5174f4256a' },
  //   { title: 'Contact', pageId: '6a29ebcb935a4f0689fe661ab5f3b8d1' }
  // ]
}

export default config
