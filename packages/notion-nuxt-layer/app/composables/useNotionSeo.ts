import type { ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getPageProperty } from 'notion-utils'

export interface NotionSeoOptions {
  recordMap?: ExtendedRecordMap
  pageId?: string
  title?: string
  description?: string
  image?: string
  url?: string
  isBlogPost?: boolean
}

export interface SiteConfig {
  name?: string
  domain?: string
  author?: string
  description?: string
  twitter?: string
}

export function useNotionSeo(options: NotionSeoOptions = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteConfig = (config.public.siteConfig || {}) as SiteConfig

  const {
    recordMap,
    pageId,
    title: customTitle,
    description: customDescription,
    image: customImage,
    url: customUrl,
    isBlogPost = false,
  } = options

  // Extract title from recordMap if not provided
  const title = computed(() => {
    if (customTitle) return customTitle

    if (recordMap && pageId) {
      const block = recordMap.block[pageId]?.value
      if (block) {
        return getBlockTitle(block, recordMap) || siteConfig.name || 'Notion Page'
      }
    }

    return siteConfig.name || 'Notion Page'
  })

  // Extract description from page properties or use site default
  const description = computed(() => {
    if (customDescription) return customDescription

    if (recordMap && pageId) {
      const block = recordMap.block[pageId]?.value
      if (block) {
        const pageDescription = getPageProperty<string>('Description', block, recordMap)
        if (pageDescription) return pageDescription
      }
    }

    return siteConfig.description || ''
  })

  // Build canonical URL
  const canonicalUrl = computed(() => {
    if (customUrl) return customUrl

    const domain = siteConfig.domain || ''
    if (!domain) return ''

    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const path = route.path === '/' ? '' : route.path

    return `${protocol}://${domain}${path}`
  })

  // Social image URL
  const socialImage = computed(() => {
    if (customImage) return customImage

    // Could implement social image generation here
    // For now, extract from page cover if available
    if (recordMap && pageId) {
      const block = recordMap.block[pageId]?.value
      if (block && 'format' in block && block.format?.page_cover) {
        return block.format.page_cover
      }
    }

    return ''
  })

  // Set all SEO meta tags
  function setSeoMeta() {
    const seoTitle = title.value
    const seoDescription = description.value
    const seoUrl = canonicalUrl.value
    const seoImage = socialImage.value

    // Basic meta tags
    useSeoMeta({
      title: seoTitle,
      description: seoDescription,
      robots: 'index, follow',

      // Open Graph
      ogType: 'website',
      ogTitle: seoTitle,
      ogDescription: seoDescription,
      ogUrl: seoUrl || undefined,
      ogSiteName: siteConfig.name,
      ogImage: seoImage || undefined,

      // Twitter
      twitterCard: seoImage ? 'summary_large_image' : 'summary',
      twitterTitle: seoTitle,
      twitterDescription: seoDescription,
      twitterImage: seoImage || undefined,
      twitterCreator: siteConfig.twitter ? `@${siteConfig.twitter}` : undefined,
    })

    // Additional head elements
    useHead({
      link: seoUrl
        ? [{ rel: 'canonical', href: seoUrl }]
        : [],
      meta: [
        {
          name: 'theme-color',
          content: '#fefffe',
          media: '(prefers-color-scheme: light)',
        },
        {
          name: 'theme-color',
          content: '#2d3439',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      script: isBlogPost && seoUrl
        ? [
            {
              type: 'application/ld+json',
              innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                '@id': `${seoUrl}#BlogPosting`,
                mainEntityOfPage: seoUrl,
                url: seoUrl,
                headline: seoTitle,
                name: seoTitle,
                description: seoDescription,
                author: {
                  '@type': 'Person',
                  name: siteConfig.author,
                },
                image: seoImage || undefined,
              }),
            },
          ]
        : [],
    })
  }

  // Auto-apply SEO meta on mount
  setSeoMeta()

  return {
    title,
    description,
    canonicalUrl,
    socialImage,
    setSeoMeta,
  }
}
