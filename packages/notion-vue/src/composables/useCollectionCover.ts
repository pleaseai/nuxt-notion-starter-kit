import type { Collection, ImageBlock, PageBlock } from 'notion-types'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { CollectionCardCover } from '../types/collection'
import { computed, toValue } from 'vue'
import { useNotionContext } from './useNotionContext'

export interface UseCollectionCoverOptions {
  block: MaybeRefOrGetter<PageBlock>
  collection: MaybeRefOrGetter<Collection>
  cover: MaybeRefOrGetter<CollectionCardCover>
}

export interface UseCollectionCoverReturn {
  coverUrl: ComputedRef<string | undefined>
  coverPosition: ComputedRef<number>
  hasCover: ComputedRef<boolean>
}

/**
 * Composable for resolving collection card cover images.
 * Handles all cover types: page_cover, page_content, property, none.
 */
export function useCollectionCover(options: UseCollectionCoverOptions): UseCollectionCoverReturn {
  const { recordMap, mapImageUrl } = useNotionContext()

  const coverUrl = computed<string | undefined>(() => {
    const block = toValue(options.block)
    const coll = toValue(options.collection)
    const cover = toValue(options.cover)

    if (!block || !cover || cover.type === 'none') {
      return undefined
    }

    // Handle page_cover type
    if (cover.type === 'page_cover') {
      const pageCover = (block.format as Record<string, unknown>)?.page_cover as string | undefined
      if (pageCover) {
        return mapImageUrl(pageCover, block)
      }
      return undefined
    }

    // Handle page_content type - find first image in page content
    if (cover.type === 'page_content') {
      const content = block.content
      if (!content?.length)
        return undefined

      for (const blockId of content) {
        const contentBlock = recordMap.block[blockId]?.value
        if (contentBlock?.type === 'image') {
          const imageBlock = contentBlock as ImageBlock
          const props = imageBlock.properties as Record<string, unknown[][]> | undefined
          const format = imageBlock.format as Record<string, unknown> | undefined
          const source
            = (props?.source as unknown[][] | undefined)?.[0]?.[0] as string | undefined
              || format?.display_source as string | undefined

          if (source) {
            return mapImageUrl(source, imageBlock)
          }
        }
      }
      return undefined
    }

    // Handle property type - use a file property as cover
    if (cover.type === 'property' || cover.type === 'file') {
      const { property } = cover
      if (!property || !coll)
        return undefined

      const schema = coll.schema[property]
      const data = (block.properties as Record<string, unknown>)?.[property] as unknown[][] | undefined

      if (schema?.type === 'file' && data) {
        // File property format: [[filename, [[url]]]] or [[filename, url]]
        const files = data
          .filter(v => v.length === 2)
          .map(f => (f as unknown[]).flat().flat())

        const file = files[0]
        if (file && file[2]) {
          return mapImageUrl(file[2] as string, block)
        }
      }

      return undefined
    }

    return undefined
  })

  const coverPosition = computed<number>(() => {
    const block = toValue(options.block)
    if (!block?.format)
      return 50

    const format = block.format as Record<string, unknown>
    const pageCoverPosition = format.page_cover_position as number | undefined
    const cardCoverPosition = format.card_cover_position as number | undefined

    // Use card cover position if available, otherwise page cover position
    const position = cardCoverPosition ?? pageCoverPosition ?? 0.5

    // Convert from 0-1 to percentage (inverted for CSS)
    return (1 - position) * 100
  })

  const hasCover = computed(() => {
    return !!coverUrl.value
  })

  return {
    coverUrl,
    coverPosition,
    hasCover,
  }
}
