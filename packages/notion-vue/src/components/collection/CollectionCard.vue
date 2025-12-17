<script setup lang="ts">
import type { Collection, PageBlock } from 'notion-types'
import type {
  CollectionCardCover as CardCoverConfig,
  CollectionCardCoverAspect,
  CollectionCardCoverSize,
  CollectionPropertyConfig,
} from '../../types/collection'
import { computed } from 'vue'
import { provideNestedLinkContext } from '../../composables/useNestedLinkContext'
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

const { mapPageUrl, isLinkCollectionToUrlProperty } = useNotionContext()

// Provide nested link context - indicates we're inside a card
provideNestedLinkContext({ isInsideCard: true })

/**
 * Find URL from visible URL-type properties when isLinkCollectionToUrlProperty is enabled.
 */
const urlPropertyValue = computed<string | null>(() => {
  if (!isLinkCollectionToUrlProperty || !props.properties) {
    return null
  }

  // Find visible URL-type properties
  const urlProperties = props.properties
    .filter((p) => {
      if (!p.visible || p.property === 'title')
        return false
      const schema = props.collection.schema[p.property]
      return schema?.type === 'url'
    })
    .map((p) => {
      const data = (props.block.properties as Record<string, unknown>)?.[p.property]
      return data
    })
    .filter(Boolean)

  // Get the first URL value
  if (urlProperties.length > 0) {
    const urlData = urlProperties[0] as unknown[][]
    if (urlData?.[0]?.[0]) {
      return urlData[0][0] as string
    }
  }

  return null
})

/**
 * Determine the link URL:
 * - If isLinkCollectionToUrlProperty and URL property exists, use that URL
 * - Otherwise, use the page URL
 */
const cardUrl = computed(() => {
  return urlPropertyValue.value || mapPageUrl(props.block.id)
})

/**
 * Determine if the link is external (URL property)
 */
const isExternalLink = computed(() => {
  return !!urlPropertyValue.value
})

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
    :href="cardUrl"
    :target="isExternalLink ? '_blank' : undefined"
    :rel="isExternalLink ? 'noopener noreferrer' : undefined"
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
