import type { Collection, CollectionQueryResult, CollectionView } from 'notion-types'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { CollectionGroupData, GalleryCollectionViewFormat } from '../types/collection'
import { computed, toValue } from 'vue'

export interface UseCollectionGroupsOptions {
  collection: MaybeRefOrGetter<Collection | undefined>
  collectionView: MaybeRefOrGetter<CollectionView | undefined>
  collectionData: MaybeRefOrGetter<CollectionQueryResult | undefined>
}

export interface UseCollectionGroupsReturn {
  isGrouped: ComputedRef<boolean>
  groups: ComputedRef<CollectionGroupData[]>
  ungroupedBlockIds: ComputedRef<string[]>
}

/**
 * Composable for extracting and processing grouped collection data.
 * Handles the complex logic of mapping collection groups to block IDs.
 */
export function useCollectionGroups(options: UseCollectionGroupsOptions): UseCollectionGroupsReturn {
  const isGrouped = computed(() => {
    const view = toValue(options.collectionView)
    if (!view?.format)
      return false
    const format = view.format as GalleryCollectionViewFormat
    return !!format.collection_group_by
  })

  const groups = computed<CollectionGroupData[]>(() => {
    const coll = toValue(options.collection)
    const view = toValue(options.collectionView)
    const data = toValue(options.collectionData)

    if (!coll || !view || !data || !isGrouped.value) {
      return []
    }

    const format = view.format as GalleryCollectionViewFormat
    const groupByProperty = format.collection_group_by
    if (!groupByProperty)
      return []

    const schema = coll.schema[groupByProperty]
    if (!schema)
      return []

    const groupConfigs = format.collection_groups || []
    const groupResults = data.collection_group_results

    if (!groupResults?.type || groupResults.type !== 'results') {
      return []
    }

    // Build groups from collection_group_results
    const result: CollectionGroupData[] = []

    // Handle aggregation results if available
    const dataRecord = data as unknown as Record<string, unknown>
    const aggregationResults = dataRecord.aggregationResults as Array<{
      type: string
      value: string
      id?: string
    }> | undefined

    if (aggregationResults) {
      for (const aggResult of aggregationResults) {
        const groupValue = aggResult.value?.toString() || ''
        const groupKey = `results:${groupByProperty}:${groupValue}`
        const groupData = dataRecord[groupKey] as { blockIds: string[] } | undefined

        if (groupData?.blockIds) {
          const config = groupConfigs.find(g => g.value?.value === groupValue)

          result.push({
            property: groupByProperty,
            schema,
            value: groupValue,
            hidden: config?.hidden || false,
            blockIds: groupData.blockIds,
            total: groupData.blockIds.length,
          })
        }
      }
    }

    // Fallback: try to extract from collection_group_results directly
    if (result.length === 0 && groupResults.blockIds) {
      result.push({
        property: groupByProperty,
        schema,
        value: '',
        hidden: false,
        blockIds: groupResults.blockIds,
        total: groupResults.blockIds.length,
      })
    }

    return result
  })

  const ungroupedBlockIds = computed<string[]>(() => {
    if (isGrouped.value) {
      // For grouped collections, return empty (use groups instead)
      return []
    }

    const data = toValue(options.collectionData)
    if (!data)
      return []

    // Try collection_group_results first
    if (data.collection_group_results?.blockIds) {
      return data.collection_group_results.blockIds
    }

    // Try relation results
    const relationKey = 'results:relation:uncategorized'
    const dataRecord = data as unknown as Record<string, { blockIds?: string[] }>
    const relationData = dataRecord[relationKey]
    if (relationData?.blockIds) {
      return relationData.blockIds
    }

    // Fallback to direct blockIds
    return data.blockIds || []
  })

  return {
    isGrouped,
    groups,
    ungroupedBlockIds,
  }
}
