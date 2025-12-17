import type { Block } from 'notion-types'
import { defaultMapImageUrl, defaultMapPageUrl } from 'notion-utils'

export { getTextContent, getBlockTitle, getPageProperty, parsePageId, uuidToId } from 'notion-utils'

/**
 * ClassNames utility (similar to classnames/clsx)
 */
export function cs(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Default map page URL function
 */
export function createMapPageUrl(rootPageId?: string) {
  return (pageId: string): string => {
    return defaultMapPageUrl(rootPageId)(pageId) || `/${pageId}`
  }
}

/**
 * Default map image URL function
 */
export function mapImageUrl(url: string, block: Block): string {
  return defaultMapImageUrl(url, block) || url
}

/**
 * Get block color class
 */
export function getBlockColorClass(color?: string): string | undefined {
  if (!color || color === 'default') return undefined
  return `notion-${color}`
}

/**
 * Check if block has children
 */
export function hasBlockChildren(block: Block): boolean {
  return Boolean(block.content && block.content.length > 0)
}
