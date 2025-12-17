<script setup lang="ts">
import type { Collection, CollectionQueryResult, CollectionView, PageBlock } from 'notion-types'
import type {
  CollectionCardCover,
  CollectionCardCoverAspect,
  CollectionCardCoverSize,
  CollectionPropertyConfig,
  GalleryCollectionViewFormat,
} from '../../types/collection'
import { computed } from 'vue'
import { useCollectionGroups } from '../../composables/useCollectionGroups'
import { useNotionContext } from '../../composables/useNotionContext'
import CollectionCard from './CollectionCard.vue'
import CollectionGroup from './CollectionGroup.vue'

const props = defineProps<{
  collection: Collection
  collectionView: CollectionView
  collectionData: CollectionQueryResult
}>()

const { recordMap } = useNotionContext()

// Extract gallery format options
const format = computed<GalleryCollectionViewFormat>(() => {
  return (props.collectionView.format as GalleryCollectionViewFormat) || {}
})

const cover = computed<CollectionCardCover>(() => {
  return format.value.gallery_cover || { type: 'none' }
})

const coverSize = computed<CollectionCardCoverSize>(() => {
  return format.value.gallery_cover_size || 'medium'
})

const coverAspect = computed<CollectionCardCoverAspect>(() => {
  return format.value.gallery_cover_aspect || 'cover'
})

const galleryProperties = computed<CollectionPropertyConfig[] | undefined>(() => {
  return format.value.gallery_properties
})

// Use the groups composable
const { isGrouped, groups, ungroupedBlockIds } = useCollectionGroups({
  collection: () => props.collection,
  collectionView: () => props.collectionView,
  collectionData: () => props.collectionData,
})

// Helper to get block from recordMap
function getBlock(blockId: string): PageBlock | undefined {
  return recordMap.block[blockId]?.value as PageBlock | undefined
}
</script>

<template>
  <div class="notion-gallery">
    <div class="notion-gallery-view">
      <!-- Grouped Gallery -->
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
            class="notion-gallery-grid"
            :class="`notion-gallery-grid-size-${coverSize}`"
          >
            <CollectionCard
              v-for="blockId in group.blockIds"
              :key="blockId"
              :block="getBlock(blockId)!"
              :collection="collection"
              :cover="cover"
              :cover-size="coverSize"
              :cover-aspect="coverAspect"
              :properties="galleryProperties"
            />
          </div>
        </CollectionGroup>
      </template>

      <!-- Ungrouped Gallery -->
      <div
        v-else
        class="notion-gallery-grid"
        :class="`notion-gallery-grid-size-${coverSize}`"
      >
        <CollectionCard
          v-for="blockId in ungroupedBlockIds"
          :key="blockId"
          :block="getBlock(blockId)!"
          :collection="collection"
          :cover="cover"
          :cover-size="coverSize"
          :cover-aspect="coverAspect"
          :properties="galleryProperties"
        />
      </div>
    </div>
  </div>
</template>
