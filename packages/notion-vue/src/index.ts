// Components
export { default as NotionAsset } from './components/NotionAsset.vue'
export { default as NotionBlock } from './components/NotionBlock.vue'
export { default as NotionCode } from './components/NotionCode.vue'
export { default as NotionCollection } from './components/NotionCollection.vue'
export { default as NotionRenderer } from './components/NotionRenderer.vue'
export { default as NotionText } from './components/NotionText.vue'
export { default as NotionTOC } from './components/NotionTOC.vue'

// Collection Components
export { default as CollectionCard } from './components/collection/CollectionCard.vue'
export { default as CollectionCardCoverComponent } from './components/collection/CollectionCardCover.vue'
export { default as CollectionGroup } from './components/collection/CollectionGroup.vue'
export { default as CollectionProperty } from './components/collection/CollectionProperty.vue'
export { default as CollectionViewGallery } from './components/collection/CollectionViewGallery.vue'

// Composables
export { provideNotionContext, useNotionContext } from './composables/useNotionContext'
export { useTableOfContents } from './composables/useTableOfContents'
export type { TableOfContentsEntry } from './composables/useTableOfContents'
export { useCollectionData } from './composables/useCollectionData'
export type { UseCollectionDataOptions, UseCollectionDataReturn } from './composables/useCollectionData'
export { useCollectionGroups } from './composables/useCollectionGroups'
export type { UseCollectionGroupsOptions, UseCollectionGroupsReturn } from './composables/useCollectionGroups'
export { useCollectionCover } from './composables/useCollectionCover'
export type { UseCollectionCoverOptions, UseCollectionCoverReturn } from './composables/useCollectionCover'

// Types
export type {
  MapImageUrlFn,
  MapPageUrlFn,
  NotionComponents,
  NotionContext,
  NotionRendererProps,
} from './types'

// Collection Types
export type {
  CollectionCardCover,
  CollectionCardCoverAspect,
  CollectionCardCoverSize,
  CollectionCardProps,
  CollectionGroupData,
  CollectionPropertyConfig,
  CollectionViewProps,
  GalleryCollectionViewFormat,
} from './types/collection'

// Utils
export {
  createMapPageUrl,
  cs,
  getBlockColorClass,
  getBlockTitle,
  getPageProperty,
  getTextContent,
  hasBlockChildren,
  mapImageUrl,
  parsePageId,
  uuidToId,
} from './utils'

// Re-export useful types from notion-types
export type { Block, Decoration, ExtendedRecordMap, PageBlock } from 'notion-types'
