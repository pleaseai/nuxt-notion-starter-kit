<script setup lang="ts">
import type { Collection, PageBlock } from 'notion-types'
import type { CollectionCardCover, CollectionCardCoverAspect } from '../../types/collection'
import { computed } from 'vue'
import { useCollectionCover } from '../../composables/useCollectionCover'
import LazyImage from '../LazyImage.vue'

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

const altText = computed(() => {
  const title = props.block.properties?.title
  if (title && Array.isArray(title) && title[0] && Array.isArray(title[0])) {
    return title[0][0] as string || 'Cover image'
  }
  return 'Cover image'
})

const imageStyle = computed(() => ({
  objectFit: props.coverAspect,
  objectPosition: `center ${coverPosition.value}%`,
}))
</script>

<template>
  <div class="notion-collection-card-cover">
    <LazyImage
      v-if="hasCover && coverUrl"
      :src="coverUrl"
      :alt="altText"
      :block="block"
      :style="imageStyle"
    />
    <div
      v-else
      class="notion-collection-card-cover-empty"
    />
  </div>
</template>
