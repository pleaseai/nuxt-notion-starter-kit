import type { ExtendedRecordMap, PageBlock } from 'notion-types'
import type { ComputedRef, Ref } from 'vue'
import { getTextContent } from 'notion-utils'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { uuidToId } from '../utils'

export interface TableOfContentsEntry {
  id: string
  type: 'header' | 'sub_header' | 'sub_sub_header'
  text: string
  indentLevel: number
}

const indentLevels = {
  header: 0,
  sub_header: 1,
  sub_sub_header: 2,
} as const

type MapResult = TableOfContentsEntry | null | MapResult[]

/**
 * Extracts table of contents entries from a Notion page
 * Recursively processes content including synced blocks and columns
 */
function getPageTableOfContents(
  page: PageBlock,
  recordMap: ExtendedRecordMap,
): TableOfContentsEntry[] {
  function mapContentToEntries(content?: string[]): MapResult[] {
    return (content ?? []).map((blockId: string) => {
      const block = recordMap.block[blockId]?.value

      if (block) {
        const { type } = block

        if (type === 'header' || type === 'sub_header' || type === 'sub_sub_header') {
          return {
            id: uuidToId(blockId),
            type: type as 'header' | 'sub_header' | 'sub_sub_header',
            text: getTextContent((block as any).properties?.title),
            indentLevel: indentLevels[type],
          }
        }

        // Recursively process nested content containers
        if (type === 'transclusion_container' || type === 'column_list' || type === 'column') {
          return mapContentToEntries(block.content)
        }
      }

      return null
    })
  }

  function flattenResults(results: MapResult[]): TableOfContentsEntry[] {
    return results.flatMap((r) => {
      if (r == null)
        return []
      return Array.isArray(r) ? flattenResults(r) : [r]
    })
  }

  const toc = flattenResults(mapContentToEntries(page.content))

  // Normalize indent levels to prevent jumps > 1
  const indentLevelStack = [{ actual: -1, effective: -1 }]

  for (const tocItem of toc) {
    const { indentLevel } = tocItem
    const actual = indentLevel

    while (true) {
      const prevIndent = indentLevelStack.at(-1)!
      const { actual: prevActual, effective: prevEffective } = prevIndent

      if (actual > prevActual) {
        tocItem.indentLevel = prevEffective + 1
        indentLevelStack.push({ actual, effective: tocItem.indentLevel })
        break
      }
      else if (actual === prevActual) {
        tocItem.indentLevel = prevEffective
        break
      }
      else {
        indentLevelStack.pop()
      }
    }
  }

  return toc
}

/**
 * Throttle function for scroll spy
 */
function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = ms - (now - lastCall)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      fn(...args)
    }
    else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        fn(...args)
      }, remaining)
    }
  }) as T
}

export interface UseTableOfContentsReturn {
  entries: ComputedRef<TableOfContentsEntry[]>
  activeSection: Ref<string | null>
  hasToc: ComputedRef<boolean>
}

/**
 * Composable for Table of Contents with scroll spy
 *
 * @param recordMap - The Notion record map
 * @param pageBlock - The root page block
 * @param minItems - Minimum number of items to show TOC (default: 3)
 */
export function useTableOfContents(
  recordMap: ExtendedRecordMap,
  pageBlock: PageBlock | undefined,
  minItems: number = 3,
): UseTableOfContentsReturn {
  const activeSection = ref<string | null>(null)

  const entries = computed<TableOfContentsEntry[]>(() => {
    if (!pageBlock)
      return []
    return getPageTableOfContents(pageBlock, recordMap)
  })

  const hasToc = computed(() => entries.value.length >= minItems)

  const updateActiveSection = throttle(() => {
    const sections = document.getElementsByClassName('notion-h')

    let prevBBox: DOMRect | null = null
    let currentSectionId = activeSection.value

    for (const section of sections) {
      if (!section || !(section instanceof Element))
        continue

      if (!currentSectionId) {
        currentSectionId = (section as HTMLElement).dataset.id || null
      }

      const bbox = section.getBoundingClientRect()
      const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
      const offset = Math.max(150, prevHeight / 4)

      // GetBoundingClientRect returns values relative to the viewport
      if (bbox.top - offset < 0) {
        currentSectionId = (section as HTMLElement).dataset.id || null
        prevBBox = bbox
        continue
      }

      break
    }

    activeSection.value = currentSectionId
  }, 100)

  onMounted(() => {
    if (!hasToc.value)
      return

    window.addEventListener('scroll', updateActiveSection)
    updateActiveSection()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveSection)
  })

  return {
    entries,
    activeSection,
    hasToc,
  }
}
