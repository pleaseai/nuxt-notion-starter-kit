import type {
  Block,
  Collection,
  CollectionPropertySchema,
  CollectionQueryResult,
  CollectionView,
  PageBlock,
  PropertyID,
} from 'notion-types'

// Re-export for convenience
export type {
  Block,
  Collection,
  CollectionPropertySchema,
  CollectionQueryResult,
  CollectionView,
  PageBlock,
  PropertyID,
}

/**
 * Collection view types supported by Notion
 */
export type CollectionViewType = 'table' | 'gallery' | 'list' | 'board' | 'calendar'

/**
 * Cover image source type for gallery/board cards
 */
export type CollectionCardCoverType = 'page_cover' | 'page_content' | 'property' | 'none' | 'file'

/**
 * Cover image configuration
 */
export interface CollectionCardCover {
  type: CollectionCardCoverType
  property?: PropertyID
}

/**
 * Cover size variants
 */
export type CollectionCardCoverSize = 'small' | 'medium' | 'large'

/**
 * Cover aspect ratio options
 */
export type CollectionCardCoverAspect = 'cover' | 'contain'

/**
 * Property visibility configuration in gallery views
 */
export interface CollectionPropertyConfig {
  property: PropertyID
  visible: boolean
}

/**
 * Gallery-specific collection view format
 */
export interface GalleryCollectionViewFormat {
  gallery_cover: CollectionCardCover
  gallery_cover_size: CollectionCardCoverSize
  gallery_cover_aspect: CollectionCardCoverAspect
  gallery_properties?: CollectionPropertyConfig[]
  collection_group_by?: PropertyID
  collection_groups?: CollectionGroupConfig[]
}

/**
 * Board column configuration from collection view format
 */
export interface BoardColumnConfig {
  property: PropertyID
  hidden: boolean
  value: {
    type: string
    value: string | undefined
  }
}

/**
 * Board-specific collection view format
 */
export interface BoardCollectionViewFormat {
  board_cover: CollectionCardCover
  board_cover_size: CollectionCardCoverSize
  board_cover_aspect: CollectionCardCoverAspect
  board_properties?: CollectionPropertyConfig[]
  board_columns?: BoardColumnConfig[]
  board_groups2?: BoardColumnConfig[]
  board_columns_by?: {
    groupBy: PropertyID
  }
  collection_group_by?: PropertyID
  collection_groups?: CollectionGroupConfig[]
}

/**
 * Processed board column data for rendering
 */
export interface BoardColumnData {
  property: PropertyID
  schema: CollectionPropertySchema | undefined
  value: string | undefined
  valueType: string
  hidden: boolean
  blockIds: string[]
  total: number
}

/**
 * Group configuration from collection view format
 */
export interface CollectionGroupConfig {
  property: PropertyID
  hidden: boolean
  value: {
    type: string
    value: string
  }
}

/**
 * Processed group data for rendering
 */
export interface CollectionGroupData {
  property: PropertyID
  schema: CollectionPropertySchema
  value: string
  hidden: boolean
  blockIds: string[]
  total: number
}

/**
 * Props for collection view components
 */
export interface CollectionViewProps {
  collection: Collection
  collectionView: CollectionView
  collectionData: CollectionQueryResult
}

/**
 * Props for collection card component
 */
export interface CollectionCardProps {
  collection: Collection
  block: PageBlock
  cover: CollectionCardCover
  coverSize: CollectionCardCoverSize
  coverAspect: CollectionCardCoverAspect
  properties?: CollectionPropertyConfig[]
}

/**
 * Props for collection card cover component
 */
export interface CollectionCardCoverProps {
  block: PageBlock
  collection: Collection
  cover: CollectionCardCover
  coverAspect: CollectionCardCoverAspect
  coverPosition?: number
}

/**
 * Props for collection property component
 */
export interface CollectionPropertyProps {
  schema: CollectionPropertySchema
  data: unknown
  block?: Block
  collection?: Collection
  inline?: boolean
}

/**
 * Props for collection group component
 */
export interface CollectionGroupProps {
  collection: Collection
  schema: CollectionPropertySchema
  value: string
  total: number
  hidden?: boolean
  defaultOpen?: boolean
}
