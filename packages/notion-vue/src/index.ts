// Components
export { default as NotionRenderer } from './components/NotionRenderer.vue'
export { default as NotionBlock } from './components/NotionBlock.vue'
export { default as NotionText } from './components/NotionText.vue'
export { default as NotionAsset } from './components/NotionAsset.vue'
export { default as NotionCollection } from './components/NotionCollection.vue'

// Composables
export { useNotionContext, provideNotionContext } from './composables/useNotionContext'

// Types
export type {
  NotionRendererProps,
  NotionContext,
  NotionComponents,
  MapPageUrlFn,
  MapImageUrlFn,
} from './types'

// Utils
export {
  cs,
  createMapPageUrl,
  mapImageUrl,
  getBlockColorClass,
  hasBlockChildren,
  getTextContent,
  getBlockTitle,
  getPageProperty,
  parsePageId,
  uuidToId,
} from './utils'

// Re-export useful types from notion-types
export type { ExtendedRecordMap, Block, PageBlock, Decoration } from 'notion-types'
