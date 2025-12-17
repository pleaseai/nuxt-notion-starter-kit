import type { Collection, CollectionQueryResult, CollectionView } from 'notion-types'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { BoardCollectionViewFormat, BoardColumnData } from '../types/collection'
import { computed, toValue } from 'vue'

export interface UseBoardColumnsOptions {
  collection: MaybeRefOrGetter<Collection | undefined>
  collectionView: MaybeRefOrGetter<CollectionView | undefined>
  collectionData: MaybeRefOrGetter<CollectionQueryResult | undefined>
}

export interface UseBoardColumnsReturn {
  boardColumns: ComputedRef<BoardColumnData[]>
  boardGroupBy: ComputedRef<string | undefined>
}

/**
 * Composable for extracting and processing board column data.
 * Handles the complex logic of mapping board columns to block IDs.
 */
export function useBoardColumns(options: UseBoardColumnsOptions): UseBoardColumnsReturn {
  const boardGroupBy = computed<string | undefined>(() => {
    const view = toValue(options.collectionView)
    if (!view?.format)
      return undefined
    const format = view.format as BoardCollectionViewFormat
    return format.board_columns_by?.groupBy
  })

  const boardColumns = computed<BoardColumnData[]>(() => {
    const coll = toValue(options.collection)
    const view = toValue(options.collectionView)
    const data = toValue(options.collectionData)

    if (!coll || !view || !data || view.type !== 'board') {
      return []
    }

    const format = view.format as BoardCollectionViewFormat
    const columnConfigs = format.board_columns || format.board_groups2 || []
    const groupByProperty = format.board_columns_by?.groupBy

    if (columnConfigs.length === 0) {
      return []
    }

    const dataRecord = data as unknown as Record<string, unknown>

    // Get board column results for metadata (totals, values)
    const boardColumnsResults = (dataRecord.board_columns as {
      results?: Array<{
        value?: { value?: string | Record<string, string> }
        total?: number
      }>
    })?.results || []

    return columnConfigs.map((config, index) => {
      const schema = coll.schema[config.property]
      const columnResult = boardColumnsResults[index]

      // Build the dynamic key for block IDs
      const valueType = config.value?.type || 'select'
      const valueValue = config.value?.value
      const queryKey = `results:${valueType}:${valueValue || 'uncategorized'}`
      const groupData = dataRecord[queryKey] as { blockIds?: string[] } | undefined

      // Extract display value
      let displayValue: string | undefined
      if (columnResult?.value?.value) {
        const val = columnResult.value.value
        if (typeof val === 'object' && groupByProperty && val[groupByProperty]) {
          displayValue = val[groupByProperty]
        }
        else if (typeof val === 'string') {
          displayValue = val
        }
        else {
          displayValue = valueValue
        }
      }
      else {
        displayValue = valueValue
      }

      return {
        property: config.property,
        schema,
        value: displayValue,
        valueType,
        hidden: config.hidden || false,
        blockIds: groupData?.blockIds || [],
        total: columnResult?.total ?? groupData?.blockIds?.length ?? 0,
      }
    })
  })

  return {
    boardColumns,
    boardGroupBy,
  }
}
