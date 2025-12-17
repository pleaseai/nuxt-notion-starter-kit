<script setup lang="ts">
import type { Collection, PageBlock } from 'notion-types'
import type {
  CollectionCardCover as CardCoverConfig,
  CollectionCardCoverAspect,
  CollectionCardCoverSize,
  CollectionPropertyConfig,
} from '../../types/collection'
import { computed } from 'vue'
import { useNotionContext } from '../../composables/useNotionContext'
import CardCover from './CollectionCardCover.vue'
import CollectionProperty from './CollectionProperty.vue'

const props = defineProps<{
  collection: Collection
  block: PageBlock
  cover: CardCoverConfig
  coverSize: CollectionCardCoverSize
  coverAspect: CollectionCardCoverAspect
  properties?: CollectionPropertyConfig[]
}>()

const { mapPageUrl } = useNotionContext()

const pageUrl = computed(() => mapPageUrl(props.block.id))

const showCover = computed(() => props.cover?.type !== 'none')

const visibleProperties = computed(() => {
  if (!props.properties)
    return []

  return props.properties
    .filter(p => p.visible && p.property !== 'title' && props.collection.schema[p.property])
    .map((p) => {
      const schema = props.collection.schema[p.property]
      const data = (props.block.properties as Record<string, unknown>)?.[p.property]
      return {
        property: p.property,
        schema,
        data,
      }
    })
})
</script>

<template>
  <a
    :href="pageUrl"
    class="notion-collection-card"
    :class="`notion-collection-card-size-${coverSize}`"
  >
    <!-- Cover Image -->
    <CardCover
      v-if="showCover"
      :block="block"
      :collection="collection"
      :cover="cover"
      :cover-aspect="coverAspect"
    />

    <!-- Card Body -->
    <div class="notion-collection-card-body">
      <!-- Title Property (always first) -->
      <div v-if="collection.schema.title" class="notion-collection-card-property">
        <CollectionProperty
          :schema="collection.schema.title"
          :data="block.properties?.title"
          :block="block"
          :collection="collection"
        />
      </div>

      <!-- Additional Visible Properties -->
      <div
        v-for="prop in visibleProperties"
        :key="prop.property"
        class="notion-collection-card-property"
      >
        <CollectionProperty
          v-if="prop.schema"
          :schema="prop.schema"
          :data="prop.data"
          :block="block"
          :collection="collection"
          inline
        />
      </div>
    </div>
  </a>
</template>
