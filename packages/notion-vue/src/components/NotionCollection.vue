<script setup lang="ts">
import type { Block, Collection, CollectionPropertySchema, CollectionViewBlock } from 'notion-types'
import { getTextContent } from 'notion-utils'
import { computed } from 'vue'
import { useNotionContext } from '../composables/useNotionContext'

const props = defineProps<{
  block: Block
}>()

const { recordMap, mapPageUrl } = useNotionContext()

const collectionId = computed(() => {
  const block = props.block as CollectionViewBlock
  return block.collection_id
})

const collection = computed<Collection | undefined>(() => {
  if (!collectionId.value)
    return undefined
  return recordMap.collection?.[collectionId.value]?.value
})

const collectionName = computed(() => {
  if (!collection.value)
    return ''
  return getTextContent(collection.value.name) || 'Untitled'
})

const schema = computed<Record<string, CollectionPropertySchema>>(() => {
  return collection.value?.schema || {}
})

const visibleColumns = computed(() => {
  const cols: string[] = []

  // Get columns in order, prioritizing title column
  for (const [key, value] of Object.entries(schema.value)) {
    if (value.type === 'title') {
      cols.unshift(key)
    }
    else {
      cols.push(key)
    }
  }

  // Limit to first 6 columns for MVP
  return cols.slice(0, 6)
})

interface RowData {
  id: string
  properties: Record<string, unknown>
}

const rows = computed<RowData[]>(() => {
  const block = props.block as CollectionViewBlock
  const viewId = block.view_ids?.[0]

  if (!viewId || !collectionId.value)
    return []

  // Get collection query results
  const query = recordMap.collection_query?.[collectionId.value]?.[viewId]
  const blockIds = query?.collection_group_results?.blockIds || []

  return blockIds.map((blockId: string) => {
    const rowBlock = recordMap.block[blockId]?.value
    if (!rowBlock)
      return null

    const properties = (rowBlock as any).properties || {}
    return {
      id: blockId,
      properties,
    }
  }).filter((row): row is RowData => row !== null)
})

function getColumnHeader(columnId: string): string {
  const col = schema.value[columnId]
  return col?.name || columnId
}

function getCellValue(row: RowData, columnId: string): string {
  const value = row.properties[columnId]
  if (!value)
    return ''

  // Handle different property types
  const propertyType = schema.value[columnId]?.type

  switch (propertyType) {
    case 'title':
    case 'text':
      return getTextContent(value as any) || ''
    case 'number':
      return String((value as any)?.[0]?.[0] || '')
    case 'select':
    case 'status':
      return (value as any)?.[0]?.[0] || ''
    case 'multi_select':
      return ((value as any)?.[0]?.[0] || '').split(',').join(', ')
    case 'date': {
      const dateValue = (value as any)?.[0]?.[1]?.[0]?.[1]
      if (dateValue?.start_date) {
        return dateValue.start_date
      }
      return ''
    }
    case 'checkbox':
      return (value as any)?.[0]?.[0] === 'Yes' ? '✓' : ''
    case 'url':
    case 'email':
    case 'phone_number':
      return (value as any)?.[0]?.[0] || ''
    default:
      return getTextContent(value as any) || ''
  }
}

function isTitle(columnId: string): boolean {
  return schema.value[columnId]?.type === 'title'
}
</script>

<template>
  <div v-if="collection" class="notion-collection">
    <div class="notion-collection-header">
      <h3 class="notion-collection-title">
        {{ collectionName }}
      </h3>
    </div>

    <div class="notion-table-wrapper">
      <table class="notion-table">
        <thead>
          <tr>
            <th
              v-for="columnId in visibleColumns"
              :key="columnId"
              class="notion-table-header"
            >
              {{ getColumnHeader(columnId) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="notion-table-row"
          >
            <td
              v-for="columnId in visibleColumns"
              :key="columnId"
              class="notion-table-cell"
            >
              <a
                v-if="isTitle(columnId)"
                :href="mapPageUrl(row.id)"
                class="notion-page-link"
              >
                {{ getCellValue(row, columnId) }}
              </a>
              <span v-else>{{ getCellValue(row, columnId) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="rows.length === 0" class="notion-collection-empty">
      No items
    </div>
  </div>
</template>

<style scoped>
.notion-collection {
  margin: 16px 0;
}

.notion-collection-header {
  margin-bottom: 8px;
}

.notion-collection-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.notion-table-wrapper {
  overflow-x: auto;
}

.notion-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.notion-table-header {
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid var(--fg-color-1, #e0e0e0);
  font-weight: 500;
  white-space: nowrap;
}

.notion-table-row {
  border-bottom: 1px solid var(--fg-color-1, #e0e0e0);
}

.notion-table-row:hover {
  background-color: var(--bg-color-1, #f7f7f7);
}

.notion-table-cell {
  padding: 8px 12px;
  vertical-align: middle;
}

.notion-page-link {
  color: inherit;
  text-decoration: underline;
}

.notion-page-link:hover {
  color: var(--notion-blue, #2f80ed);
}

.notion-collection-empty {
  padding: 16px;
  text-align: center;
  color: var(--fg-color-2, #666);
}
</style>
