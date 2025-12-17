<script setup lang="ts">
import type { Collection, PageBlock } from 'notion-types'
import type { CollectionCardCover, CollectionCardCoverAspect } from '../../types/collection'
import { useCollectionCover } from '../../composables/useCollectionCover'

const props = defineProps<{
  block: PageBlock
  collection: Collection
  cover: CollectionCardCover
  coverAspect: CollectionCardCoverAspect
}>()

const { coverUrl, coverPosition, hasCover } = useCollectionCover({
  block: () => props.block,
  collection: () => props.collection,
  cover: () => props.cover,
})
</script>

<template>
  <div class="notion-collection-card-cover">
    <img
      v-if="hasCover && coverUrl"
      :src="coverUrl"
      :alt="block.properties?.title?.[0]?.[0] || 'Cover image'"
      loading="lazy"
      :style="{
        objectFit: coverAspect,
        objectPosition: `center ${coverPosition}%`,
      }"
    >
    <div
      v-else
      class="notion-collection-card-cover-empty"
    />
  </div>
</template>
