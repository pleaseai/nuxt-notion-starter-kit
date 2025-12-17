import type { SearchParams } from 'notion-types'
import { search } from '../utils/notion'
import siteConfig from '../../site.config'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ query: string }>(event)

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
  } catch (error) {
    console.error('Search error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to search Notion',
    })
  }
})
