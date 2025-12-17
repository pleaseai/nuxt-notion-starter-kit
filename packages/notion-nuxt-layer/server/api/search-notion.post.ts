import type { SearchParams } from 'notion-types'
import { search } from '../utils/notion'

interface SiteConfig {
  rootNotionPageId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string }>(event)
  const config = useRuntimeConfig()
  const siteConfig = config.public.siteConfig as SiteConfig

  if (!body?.query) {
    throw createError({
      statusCode: 400,
      message: 'Query is required',
    })
  }

  const searchParams: SearchParams = {
    query: body.query,
    ancestorId: siteConfig.rootNotionPageId,
  }

  try {
    const results = await search(searchParams)
    return results
  }
  catch (error) {
    console.error('Search error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to search Notion',
    })
  }
})
