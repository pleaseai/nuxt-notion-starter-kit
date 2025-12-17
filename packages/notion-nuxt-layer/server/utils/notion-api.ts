import { NotionAPI } from 'notion-client'

let notionClient: NotionAPI | null = null

export function getNotionClient(): NotionAPI {
  if (!notionClient) {
    const config = useRuntimeConfig()
    notionClient = new NotionAPI({
      authToken: config.notionToken || undefined,
    })
  }
  return notionClient
}

export const notion = {
  getPage: async (pageId: string, options?: Parameters<NotionAPI['getPage']>[1]) => {
    return getNotionClient().getPage(pageId, options)
  },
  search: async (params: Parameters<NotionAPI['search']>[0]) => {
    return getNotionClient().search(params)
  },
}
