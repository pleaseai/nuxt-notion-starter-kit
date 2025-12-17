import type { ExtendedRecordMap } from 'notion-types'
import { parsePageId } from 'notion-utils'
import { getPage } from './notion'

export interface PageProps {
  recordMap: ExtendedRecordMap
  pageId: string
  error?: {
    message: string
    statusCode: number
  }
}

export interface PageError {
  error: {
    message: string
    statusCode: number
  }
}

interface SiteConfig {
  rootNotionPageId: string
  pageUrlOverrides?: Record<string, string> | null
}

export async function resolveNotionPage(
  rawPageId?: string
): Promise<PageProps | PageError> {
  const config = useRuntimeConfig()
  const siteConfig = config.public.siteConfig as SiteConfig

  let pageId: string | undefined
  let recordMap: ExtendedRecordMap

  if (rawPageId && rawPageId !== 'index') {
    pageId = parsePageId(rawPageId) || undefined

    if (!pageId) {
      // Check if there's a page URL override
      const override = siteConfig.pageUrlOverrides?.[rawPageId]
      if (override) {
        pageId = parsePageId(override) || undefined
      }
    }

    if (pageId) {
      try {
        recordMap = await getPage(pageId)
      } catch (err) {
        console.error(`Error fetching page ${pageId}:`, err)
        return {
          error: {
            message: `Error fetching page "${rawPageId}"`,
            statusCode: 500,
          },
        }
      }
    } else {
      return {
        error: {
          message: `Not found "${rawPageId}"`,
          statusCode: 404,
        },
      }
    }
  } else {
    // Root page
    pageId = siteConfig.rootNotionPageId
    try {
      recordMap = await getPage(pageId)
    } catch (err) {
      console.error(`Error fetching root page ${pageId}:`, err)
      return {
        error: {
          message: 'Error fetching root page',
          statusCode: 500,
        },
      }
    }
  }

  return {
    recordMap,
    pageId,
  }
}
