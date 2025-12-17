import { resolveNotionPage } from '../utils/resolve-notion-page'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ pageId?: string }>(event)

  const result = await resolveNotionPage(body?.pageId)

  if ('error' in result) {
    throw createError({
      statusCode: result.error.statusCode,
      message: result.error.message,
    })
  }

  return result
})
