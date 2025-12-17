<script setup lang="ts">
import type { Block, CollectionViewBlock, Decoration } from 'notion-types'
import { getTextContent } from 'notion-utils'
import { computed } from 'vue'
import { useCollectionData } from '../composables/useCollectionData'
import { useNotionContext } from '../composables/useNotionContext'
import CollectionViewGallery from './collection/CollectionViewGallery.vue'

const props = defineProps<{
  block: Block
}>()

const { mapPageUrl } = useNotionContext()

// Use the collection data composable for data extraction
const {
  collection,
  collectionView,
  collectionData,
  collectionName,
  schema,
  blockIds,
  viewType,
} = useCollectionData({
  block: () => props.block as CollectionViewBlock,
})

// Table-specific computed values (for backward compatibility)
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
  return blockIds.value.map((blockId: string) => {
    const { recordMap } = useNotionContext()
    const rowBlock = recordMap.block[blockId]?.value
    if (!rowBlock)
      return null

    const properties = (rowBlock as unknown as Record<string, unknown>).properties as Record<string, unknown> || {}
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
      return getTextContent(value as Decoration[]) || ''
    case 'number':
      return String((value as unknown[][])?.[0]?.[0] || '')
    case 'select':
    case 'status':
      return (value as unknown[][])?.[0]?.[0]?.toString() || ''
    case 'multi_select':
      return ((value as unknown[][])?.[0]?.[0]?.toString() || '').split(',').join(', ')
    case 'date': {
      const arr = value as unknown[][]
      const dateValue = arr?.[0]?.[1] as Array<[string, Record<string, string>]> | undefined
      const dateData = dateValue?.[0]?.[1]
      if (dateData?.start_date) {
        return dateData.start_date
      }
      return ''
    }
    case 'checkbox':
      return (value as unknown[][])?.[0]?.[0] === 'Yes' ? '✓' : ''
    case 'url':
    case 'email':
    case 'phone_number':
      return (value as unknown[][])?.[0]?.[0]?.toString() || ''
    default:
      return getTextContent(value as Decoration[]) || ''
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

    <!-- Gallery View -->
    <CollectionViewGallery
      v-if="viewType === 'gallery' && collectionView && collectionData"
      :collection="collection"
      :collection-view="collectionView"
      :collection-data="collectionData"
    />

    <!-- Table View (default) -->
    <template v-else>
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
    </template>
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
