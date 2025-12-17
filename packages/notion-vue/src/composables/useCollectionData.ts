import type {
  Collection,
  CollectionPropertySchema,
  CollectionQueryResult,
  CollectionView,
  CollectionViewBlock,
} from 'notion-types'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { CollectionViewType } from '../types/collection'
import { getTextContent } from 'notion-utils'
import { computed, toValue } from 'vue'
import { useNotionContext } from './useNotionContext'

export interface UseCollectionDataOptions {
  block: MaybeRefOrGetter<CollectionViewBlock>
}

export interface UseCollectionDataReturn {
  collectionId: ComputedRef<string | undefined>
  viewId: ComputedRef<string | undefined>
  collection: ComputedRef<Collection | undefined>
  collectionView: ComputedRef<CollectionView | undefined>
  collectionData: ComputedRef<CollectionQueryResult | undefined>
  collectionName: ComputedRef<string>
  schema: ComputedRef<Record<string, CollectionPropertySchema>>
  blockIds: ComputedRef<string[]>
  viewType: ComputedRef<CollectionViewType>
}

/**
 * Composable for extracting collection data from the Notion record map.
 * Provides reactive access to collection, view, query results, and metadata.
 */
export function useCollectionData(options: UseCollectionDataOptions): UseCollectionDataReturn {
  const { recordMap } = useNotionContext()

  const collectionId = computed(() => {
    const block = toValue(options.block)
    return block?.collection_id
  })

  const viewId = computed(() => {
    const block = toValue(options.block)
    return block?.view_ids?.[0]
  })

  const collection = computed<Collection | undefined>(() => {
    const id = collectionId.value
    if (!id)
      return undefined
    return recordMap.collection?.[id]?.value
  })

  const collectionView = computed<CollectionView | undefined>(() => {
    const id = viewId.value
    if (!id)
      return undefined
    return recordMap.collection_view?.[id]?.value
  })

  const collectionData = computed<CollectionQueryResult | undefined>(() => {
    const colId = collectionId.value
    const vId = viewId.value
    if (!colId || !vId)
      return undefined
    return recordMap.collection_query?.[colId]?.[vId]
  })

  const collectionName = computed(() => {
    const coll = collection.value
    if (!coll)
      return ''
    return getTextContent(coll.name) || 'Untitled'
  })

  const schema = computed<Record<string, CollectionPropertySchema>>(() => {
    return collection.value?.schema || {}
  })

  const blockIds = computed<string[]>(() => {
    const data = collectionData.value
    if (!data)
      return []

    // Try collection_group_results first
    if (data.collection_group_results?.blockIds) {
      return data.collection_group_results.blockIds
    }

    // Try relation results
    const relationKey = 'results:relation:uncategorized'
    const relationData = (data as unknown as Record<string, { blockIds?: string[] }>)[relationKey]
    if (relationData?.blockIds) {
      return relationData.blockIds
    }

    // Fallback to direct blockIds
    return data.blockIds || []
  })

  const viewType = computed<CollectionViewType>(() => {
    const view = collectionView.value
    if (!view?.type)
      return 'table'
    return view.type as CollectionViewType
  })

  return {
    collectionId,
    viewId,
    collection,
    collectionView,
    collectionData,
    collectionName,
    schema,
    blockIds,
    viewType,
  }
}
