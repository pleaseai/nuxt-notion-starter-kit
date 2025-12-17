<script setup lang="ts">
import type { Collection, CollectionQueryResult, CollectionView, PageBlock } from 'notion-types'
import type {
  CollectionPropertyConfig,
  ListCollectionViewFormat,
} from '../../types/collection'
import { computed } from 'vue'
import { useCollectionGroups } from '../../composables/useCollectionGroups'
import { useNotionContext } from '../../composables/useNotionContext'
import CollectionGroup from './CollectionGroup.vue'
import CollectionProperty from './CollectionProperty.vue'

const props = defineProps<{
  collection: Collection
  collectionView: CollectionView
  collectionData: CollectionQueryResult
}>()

const { recordMap, mapPageUrl } = useNotionContext()

// Extract list format options
const format = computed<ListCollectionViewFormat>(() => {
  return (props.collectionView.format as ListCollectionViewFormat) || {}
})

const listProperties = computed<CollectionPropertyConfig[]>(() => {
  return format.value.list_properties?.filter(p => p.visible) || []
})

// Use the groups composable
const { isGrouped, groups, ungroupedBlockIds } = useCollectionGroups({
  collection: () => props.collection,
  collectionView: () => props.collectionView,
  collectionData: () => props.collectionData,
})

// Get block from recordMap
function getBlock(blockId: string): PageBlock | undefined {
  return recordMap.block[blockId]?.value as PageBlock | undefined
}

// Get page icon from block format
function getPageIcon(block: PageBlock): string | undefined {
  return (block as unknown as { format?: { page_icon?: string } }).format?.page_icon
}

// Get title schema and data from block
function getTitleData(block: PageBlock) {
  const titleSchema = props.collection.schema.title
  const titleData = block?.properties?.title
  return { schema: titleSchema, data: titleData }
}

// Get property data for a block
function getPropertyData(block: PageBlock, propertyId: string) {
  const schema = props.collection.schema[propertyId]
  const data = block?.properties?.[propertyId as keyof typeof block.properties]
  return { schema, data }
}
</script>

<template>
  <div class="notion-list-collection">
    <div class="notion-list-view">
      <!-- Grouped List -->
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
          <div class="notion-list-body">
            <template v-for="blockId in group.blockIds" :key="blockId">
              <a
                v-if="getBlock(blockId)"
                :href="mapPageUrl(blockId)"
                class="notion-list-item notion-page-link"
              >
                <div class="notion-list-item-title">
                  <span
                    v-if="getPageIcon(getBlock(blockId)!)"
                    class="notion-page-icon"
                  >
                    {{ getPageIcon(getBlock(blockId)!) }}
                  </span>
                  <CollectionProperty
                    v-if="getTitleData(getBlock(blockId)!).schema"
                    :schema="getTitleData(getBlock(blockId)!).schema!"
                    :data="getTitleData(getBlock(blockId)!).data"
                    :block="getBlock(blockId)"
                    :collection="collection"
                  />
                </div>

                <div v-if="listProperties.length > 0" class="notion-list-item-body">
                  <template v-for="prop in listProperties" :key="prop.property">
                    <div
                      v-if="getPropertyData(getBlock(blockId)!, prop.property).schema"
                      class="notion-list-item-property"
                    >
                      <CollectionProperty
                        :schema="getPropertyData(getBlock(blockId)!, prop.property).schema!"
                        :data="getPropertyData(getBlock(blockId)!, prop.property).data"
                        :block="getBlock(blockId)"
                        :collection="collection"
                      />
                    </div>
                  </template>
                </div>
              </a>
            </template>
          </div>
        </CollectionGroup>
      </template>

      <!-- Ungrouped List -->
      <div v-else class="notion-list-body">
        <template v-for="blockId in ungroupedBlockIds" :key="blockId">
          <a
            v-if="getBlock(blockId)"
            :href="mapPageUrl(blockId)"
            class="notion-list-item notion-page-link"
          >
            <div class="notion-list-item-title">
              <span
                v-if="getPageIcon(getBlock(blockId)!)"
                class="notion-page-icon"
              >
                {{ getPageIcon(getBlock(blockId)!) }}
              </span>
              <CollectionProperty
                v-if="getTitleData(getBlock(blockId)!).schema"
                :schema="getTitleData(getBlock(blockId)!).schema!"
                :data="getTitleData(getBlock(blockId)!).data"
                :block="getBlock(blockId)"
                :collection="collection"
              />
            </div>

            <div v-if="listProperties.length > 0" class="notion-list-item-body">
              <template v-for="prop in listProperties" :key="prop.property">
                <div
                  v-if="getPropertyData(getBlock(blockId)!, prop.property).schema"
                  class="notion-list-item-property"
                >
                  <CollectionProperty
                    :schema="getPropertyData(getBlock(blockId)!, prop.property).schema!"
                    :data="getPropertyData(getBlock(blockId)!, prop.property).data"
                    :block="getBlock(blockId)"
                    :collection="collection"
                  />
                </div>
              </template>
            </div>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>
