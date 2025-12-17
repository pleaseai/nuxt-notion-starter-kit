import type { ExtendedRecordMap, PageBlock } from 'notion-types'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { getTextContent } from 'notion-utils'
import { computed, onScopeDispose, ref, toValue, watch } from 'vue'
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
 * Creates a throttled function with cleanup capability
 */
function createThrottle<T extends (...args: any[]) => void>(fn: T, ms: number): { throttled: T, cleanup: () => void } {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttled = ((...args: Parameters<T>) => {
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

  const cleanup = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return { throttled, cleanup }
}

export interface UseTableOfContentsReturn {
  entries: ComputedRef<TableOfContentsEntry[]>
  activeSection: Ref<string | null>
  hasToc: ComputedRef<boolean>
}

/**
 * Composable for Table of Contents with scroll spy
 *
 * @param recordMap - The Notion record map (can be ref or getter)
 * @param pageBlock - The root page block (can be ref or getter)
 * @param minItems - Minimum number of items to show TOC (default: 3)
 */
export function useTableOfContents(
  recordMap: MaybeRefOrGetter<ExtendedRecordMap>,
  pageBlock: MaybeRefOrGetter<PageBlock | undefined>,
  minItems: MaybeRefOrGetter<number> = 3,
): UseTableOfContentsReturn {
  const activeSection = ref<string | null>(null)

  const entries = computed<TableOfContentsEntry[]>(() => {
    const page = toValue(pageBlock)
    const map = toValue(recordMap)
    if (!page)
      return []
    return getPageTableOfContents(page, map)
  })

  const hasToc = computed(() => entries.value.length >= toValue(minItems))

  // Scroll spy state
  let scrollListenerActive = false
  let throttleCleanup: (() => void) | null = null
  let scrollHandler: (() => void) | null = null

  const updateActiveSection = (): void => {
    // SSR guard
    if (typeof document === 'undefined')
      return

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
  }

  const setupScrollListener = (): void => {
    // SSR guard
    if (typeof window === 'undefined')
      return

    if (scrollListenerActive)
      return

    const { throttled, cleanup } = createThrottle(updateActiveSection, 100)
    throttleCleanup = cleanup
    scrollHandler = throttled

    window.addEventListener('scroll', throttled)
    scrollListenerActive = true

    // Initial update
    throttled()
  }

  const cleanupScrollListener = (): void => {
    if (!scrollListenerActive)
      return

    if (typeof window !== 'undefined' && scrollHandler) {
      window.removeEventListener('scroll', scrollHandler)
      scrollHandler = null
    }

    if (throttleCleanup) {
      throttleCleanup()
      throttleCleanup = null
    }

    scrollListenerActive = false
  }

  // Watch hasToc to dynamically add/remove scroll listener
  watch(
    hasToc,
    (hasTableOfContents) => {
      if (hasTableOfContents) {
        setupScrollListener()
      }
      else {
        cleanupScrollListener()
        activeSection.value = null
      }
    },
    { immediate: true },
  )

  // Cleanup on scope dispose
  onScopeDispose(() => {
    cleanupScrollListener()
  })

  return {
    entries,
    activeSection,
    hasToc,
  }
}
