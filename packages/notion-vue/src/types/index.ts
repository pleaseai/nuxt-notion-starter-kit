import type { Block, ExtendedRecordMap } from 'notion-types'
import type { Component } from 'vue'

export type MapPageUrlFn = (pageId: string) => string
export type MapImageUrlFn = (url: string, block: Block) => string

export interface NotionComponents {
  // Custom link component
  Link?: Component
  // Custom image component
  Image?: Component
  // Custom code component (for syntax highlighting)
  Code?: Component
  // Custom page link component
  PageLink?: Component
}

export interface NotionContext {
  recordMap: ExtendedRecordMap
  components: NotionComponents
  mapPageUrl: MapPageUrlFn
  mapImageUrl: MapImageUrlFn
  darkMode: boolean
  fullPage: boolean
  rootPageId?: string
  rootDomain?: string
  showTableOfContents: boolean
  minTableOfContentsItems: number
  defaultPageIcon?: string
  defaultPageCover?: string
  defaultPageCoverPosition: number
  // When true, collection cards link to URL property value instead of page
  isLinkCollectionToUrlProperty: boolean
}

export interface NotionRendererProps {
  recordMap: ExtendedRecordMap
  mapPageUrl?: MapPageUrlFn
  mapImageUrl?: MapImageUrlFn
  darkMode?: boolean
  fullPage?: boolean
  rootPageId?: string
  rootDomain?: string
  components?: Partial<NotionComponents>
  showTableOfContents?: boolean
  minTableOfContentsItems?: number
  defaultPageIcon?: string
  defaultPageCover?: string
  defaultPageCoverPosition?: number
  // When true, collection cards link to URL property value instead of page
  isLinkCollectionToUrlProperty?: boolean
}

export type { Block, ExtendedRecordMap } from 'notion-types'
