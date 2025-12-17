<script setup lang="ts">
import type { Collection, CollectionQueryResult, CollectionView, PageBlock } from 'notion-types'
import type {
  BoardCollectionViewFormat,
  CollectionCardCover,
  CollectionCardCoverAspect,
  CollectionCardCoverSize,
  CollectionPropertyConfig,
} from '../../types/collection'
import { computed } from 'vue'
import { useBoardColumns } from '../../composables/useBoardColumns'
import { useCollectionGroups } from '../../composables/useCollectionGroups'
import { useNotionContext } from '../../composables/useNotionContext'
import EmptyIcon from '../icons/EmptyIcon.vue'
import CollectionCard from './CollectionCard.vue'
import CollectionGroup from './CollectionGroup.vue'
import CollectionProperty from './CollectionProperty.vue'

const props = defineProps<{
  collection: Collection
  collectionView: CollectionView
  collectionData: CollectionQueryResult
}>()

const { recordMap } = useNotionContext()

// Extract board format options
const format = computed<BoardCollectionViewFormat>(() => {
  return (props.collectionView.format as BoardCollectionViewFormat) || {}
})

const cover = computed<CollectionCardCover>(() => {
  return format.value.board_cover || { type: 'none' }
})

const coverSize = computed<CollectionCardCoverSize>(() => {
  return format.value.board_cover_size || 'medium'
})

const coverAspect = computed<CollectionCardCoverAspect>(() => {
  return format.value.board_cover_aspect || 'cover'
})

const boardProperties = computed<CollectionPropertyConfig[] | undefined>(() => {
  return format.value.board_properties
})

// Use the board columns composable
const { boardColumns } = useBoardColumns({
  collection: () => props.collection,
  collectionView: () => props.collectionView,
  collectionData: () => props.collectionData,
})

// Check if this board view is also grouped (collection-level grouping)
const { isGrouped, groups } = useCollectionGroups({
  collection: () => props.collection,
  collectionView: () => props.collectionView,
  collectionData: () => props.collectionData,
})

// Helper to get block from recordMap
function getBlock(blockId: string): PageBlock | undefined {
  return recordMap.block[blockId]?.value as PageBlock | undefined
}

// Get display value for column header
function getColumnDisplayValue(column: typeof boardColumns.value[0]): unknown {
  if (!column.value)
    return undefined

  // Format the value for Property component
  return [[column.value]]
}
</script>

<template>
  <div class="notion-board">
    <!-- If grouped at collection level, render groups first -->
    <template v-if="isGrouped">
      <CollectionGroup
        v-for="group in groups"
        :key="group.value"
        :collection="collection"
        :schema="group.schema"
        :value="group.value"
        :total="group.total"
        :hidden="group.hidden"
      >
        <div
          class="notion-board-view"
          :class="`notion-board-view-size-${coverSize}`"
        >
          <div class="notion-board-header">
            <div class="notion-board-header-inner">
              <div
                v-for="column in boardColumns"
                :key="`${column.property}-${column.value}`"
                class="notion-board-th"
              >
                <div class="notion-board-th-body">
                  <template v-if="column.value && column.schema">
                    <CollectionProperty
                      :schema="column.schema"
                      :data="getColumnDisplayValue(column)"
                      :collection="collection"
                    />
                  </template>
                  <span v-else>
                    <EmptyIcon class="notion-board-th-empty" />
                    {{ column.schema?.name ? `No ${column.schema.name}` : 'No Select' }}
                  </span>
                  <span class="notion-board-th-count">{{ column.total }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="notion-board-header-placeholder" />

          <div class="notion-board-body">
            <div
              v-for="column in boardColumns"
              :key="`${column.property}-${column.value}-body`"
              class="notion-board-group"
            >
              <template v-if="!column.hidden">
                <template v-for="blockId in column.blockIds" :key="blockId">
                  <CollectionCard
                    v-if="getBlock(blockId)"
                    class="notion-board-group-card"
                    :block="getBlock(blockId)!"
                    :collection="collection"
                    :cover="cover"
                    :cover-size="coverSize"
                    :cover-aspect="coverAspect"
                    :properties="boardProperties"
                  />
                </template>
              </template>
            </div>
          </div>
        </div>
      </CollectionGroup>
    </template>

    <!-- Standard board view (no collection-level grouping) -->
    <div
      v-else
      class="notion-board-view"
      :class="`notion-board-view-size-${coverSize}`"
    >
      <div class="notion-board-header">
        <div class="notion-board-header-inner">
          <div
            v-for="column in boardColumns"
            :key="`${column.property}-${column.value}`"
            class="notion-board-th"
          >
            <div class="notion-board-th-body">
              <template v-if="column.value && column.schema">
                <CollectionProperty
                  :schema="column.schema"
                  :data="getColumnDisplayValue(column)"
                  :collection="collection"
                />
              </template>
              <span v-else>
                <EmptyIcon class="notion-board-th-empty" />
                {{ column.schema?.name ? `No ${column.schema.name}` : 'No Select' }}
              </span>
              <span class="notion-board-th-count">{{ column.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="notion-board-header-placeholder" />

      <div class="notion-board-body">
        <div
          v-for="column in boardColumns"
          :key="`${column.property}-${column.value}-body`"
          class="notion-board-group"
        >
          <template v-if="!column.hidden">
            <template v-for="blockId in column.blockIds" :key="blockId">
              <CollectionCard
                v-if="getBlock(blockId)"
                class="notion-board-group-card"
                :block="getBlock(blockId)!"
                :collection="collection"
                :cover="cover"
                :cover-size="coverSize"
                :cover-aspect="coverAspect"
                :properties="boardProperties"
              />
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
