<script setup lang="ts">
import { getBlockTitle, getBlockParentPage } from 'notion-utils'

interface SearchResult {
  id: string
  pageId: string
  title: string
  highlightHtml: string
  icon: string | null
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as { rootNotionPageId?: string }

const dialogRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const isLoading = ref(false)
const searchResults = ref<SearchResult[]>([])
const searchError = ref<string | null>(null)
const totalResults = ref(0)

let searchTimeout: ReturnType<typeof setTimeout> | undefined

// Focus trap handler
function handleFocusTrap(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !dialogRef.value) return

  const focusableElements = dialogRef.value.querySelectorAll<HTMLElement>(
    'input, button, [href], [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault()
    lastElement?.focus()
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault()
    firstElement?.focus()
  }
}

// Focus input when dialog opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        inputRef.value?.focus()
        document.addEventListener('keydown', handleFocusTrap)
      })
    } else {
      // Reset state when closed
      query.value = ''
      searchResults.value = []
      searchError.value = null
      document.removeEventListener('keydown', handleFocusTrap)
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  document.removeEventListener('keydown', handleFocusTrap)
})

// Throttled search
watch(query, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!newQuery.trim()) {
    isLoading.value = false
    searchResults.value = []
    searchError.value = null
    return
  }

  isLoading.value = true

  searchTimeout = setTimeout(async () => {
    await performSearch(newQuery)
  }, 300)
})

async function performSearch(searchQuery: string) {
  if (!searchQuery.trim()) return

  try {
    const response = await $fetch('/api/search-notion', {
      method: 'POST',
      body: {
        query: searchQuery,
        ancestorId: siteConfig.rootNotionPageId,
      },
    })

    if (!response || typeof response !== 'object') {
      searchError.value = 'Search failed'
      searchResults.value = []
      return
    }

    const result = response as any

    if (result.error || result.errorId) {
      searchError.value = result.error || 'Search error'
      searchResults.value = []
      return
    }

    // Process results
    const processedResults = (result.results || [])
      .map((item: any) => {
        const block = result.recordMap?.block?.[item.id]?.value
        if (!block) return null

        const title = getBlockTitle(block, result.recordMap)
        if (!title) return null

        const page = getBlockParentPage(block, result.recordMap, { inclusive: true }) || block
        if (!page?.id) return null

        let highlightHtml = ''
        if (item.highlight?.text) {
          highlightHtml = item.highlight.text
            .replace(/<gzknfouu>/gi, '<mark>')
            .replace(/<\/gzknfouu>/gi, '</mark>')
        }

        return {
          id: item.id,
          pageId: page.id,
          title,
          highlightHtml,
          icon: block.format?.page_icon || null,
        }
      })
      .filter(Boolean)

    // Dedupe by page ID
    const uniqueResults = Object.values(
      Object.fromEntries(processedResults.map((r: any) => [r.pageId, r]))
    )

    searchResults.value = uniqueResults as any[]
    totalResults.value = result.total || uniqueResults.length
    searchError.value = null
  } catch (err: unknown) {
    console.error('[SearchDialog] Search request failed:', {
      error: err,
      query: searchQuery,
      ancestorId: siteConfig.rootNotionPageId,
    })

    // Provide more specific error messages where possible
    if (err instanceof Error) {
      if (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        searchError.value = 'Network error. Check your connection and try again.'
      } else if (err.message.includes('timeout')) {
        searchError.value = 'Search timed out. Try a simpler query.'
      } else {
        searchError.value = 'Search failed. Please try again.'
      }
    } else {
      searchError.value = 'Search failed. Please try again.'
    }
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

function clearQuery() {
  query.value = ''
  inputRef.value?.focus()
}

function handleResultClick() {
  emit('close')
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function mapPageUrl(pageId: string): string {
  const cleanId = pageId.replace(/-/g, '')
  return `/${cleanId}`
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="notion-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-dialog-title"
      @click="handleBackdropClick"
    >
      <div ref="dialogRef" class="notion-search">
        <h2 id="search-dialog-title" class="sr-only">Search</h2>
        <div class="notion-search-bar">
          <div class="notion-search-icon" aria-hidden="true">
            <Icon v-if="isLoading" name="svg-spinners:ring-resize" />
            <Icon v-else name="ph:magnifying-glass" />
          </div>

          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="notion-search-input"
            placeholder="Search..."
            aria-label="Search pages"
          >

          <button
            v-if="query"
            type="button"
            class="notion-search-clear"
            aria-label="Clear search"
            @click="clearQuery"
          >
            <Icon name="ph:x" />
          </button>
        </div>

        <!-- Results -->
        <div v-if="query.trim() && !isLoading" class="notion-search-results">
          <template v-if="searchResults.length > 0">
            <div class="notion-search-results-list">
              <NuxtLink
                v-for="result in searchResults"
                :key="result.id"
                :to="mapPageUrl(result.pageId)"
                class="notion-search-result"
                @click="handleResultClick"
              >
                <span v-if="result.icon" class="notion-search-result-icon">
                  {{ result.icon }}
                </span>
                <span v-else class="notion-search-result-icon">
                  <Icon name="ph:file-text" />
                </span>

                <div class="notion-search-result-content">
                  <span class="notion-search-result-title">{{ result.title }}</span>
                  <span
                    v-if="result.highlightHtml"
                    class="notion-search-result-highlight"
                    v-html="result.highlightHtml"
                  />
                </div>
              </NuxtLink>
            </div>

            <div class="notion-search-footer">
              <span class="notion-search-count">{{ totalResults }}</span>
              {{ totalResults === 1 ? 'result' : 'results' }}
            </div>
          </template>

          <div v-else-if="searchError" class="notion-search-empty">
            <div class="notion-search-empty-title">Search error</div>
            <div class="notion-search-empty-message">{{ searchError }}</div>
          </div>

          <div v-else class="notion-search-empty">
            <div class="notion-search-empty-title">No results</div>
            <div class="notion-search-empty-message">Try different search terms</div>
          </div>
        </div>

        <!-- Empty state when no query -->
        <div v-else-if="!query.trim() && !isLoading" class="notion-search-hint">
          <div>Start typing to search...</div>
          <div class="notion-search-hint-shortcuts">
            <kbd>esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.notion-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  background: var(--overlay-background, rgba(15, 15, 15, 0.6));
  backdrop-filter: blur(2px);
}

.notion-search {
  width: 100%;
  max-width: 600px;
  margin: 0 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.notion-search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--fg-color-1);
}

.notion-search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-color-3);
}

.notion-search-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.notion-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--fg-color);
  outline: none;
}

.notion-search-input::placeholder {
  color: var(--fg-color-2);
}

.notion-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  background: var(--bg-color-0);
  border: none;
  border-radius: 4px;
  color: var(--fg-color-3);
  cursor: pointer;
}

.notion-search-clear:hover {
  color: var(--fg-color);
}

.notion-search-clear:focus {
  outline: 2px solid var(--notion-blue, #2383e2);
  outline-offset: 2px;
}

.notion-search-results {
  max-height: 400px;
  overflow-y: auto;
}

.notion-search-results-list {
  padding: 0.5rem;
}

.notion-search-result {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  color: var(--fg-color);
  transition: background 0.1s ease-out;
}

.notion-search-result:hover {
  background: var(--bg-color-0);
}

.notion-search-result-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.25rem;
  color: var(--fg-color-3);
}

.notion-search-result-content {
  flex: 1;
  min-width: 0;
}

.notion-search-result-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notion-search-result-highlight {
  display: block;
  font-size: 0.75rem;
  color: var(--fg-color-3);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notion-search-result-highlight :deep(mark) {
  background: var(--notion-yellow_background);
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}

.notion-search-footer {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  color: var(--fg-color-3);
  border-top: 1px solid var(--fg-color-1);
}

.notion-search-count {
  font-weight: 600;
}

.notion-search-empty {
  padding: 2rem 1rem;
  text-align: center;
}

.notion-search-empty-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fg-color);
  margin-bottom: 0.25rem;
}

.notion-search-empty-message {
  font-size: 0.75rem;
  color: var(--fg-color-3);
}

.notion-search-hint {
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--fg-color-3);
}

.notion-search-hint-shortcuts {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--fg-color-2);
}

.notion-search-hint-shortcuts kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  margin: 0 0.125rem;
  font-size: 0.6875rem;
  font-family: inherit;
  background: var(--bg-color-1);
  border-radius: 3px;
}

/* Mobile responsive styles */
@media (max-width: 640px) {
  .notion-search-overlay {
    padding-top: 5vh;
  }

  .notion-search-results {
    max-height: 60vh;
  }
}
</style>
