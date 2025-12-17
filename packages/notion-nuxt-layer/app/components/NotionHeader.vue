<script setup lang="ts">
import type { Block } from 'notion-types'
import { getBlockIcon } from 'notion-utils'

const props = defineProps<{
  block?: Block
  recordMap?: any
}>()

const colorMode = useColorMode()
const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as {
  name?: string
  isSearchEnabled?: boolean
  navigationStyle?: 'default' | 'custom'
  navigationLinks?: Array<{ title: string; pageId?: string; url?: string }>
}

const isDark = computed(() => colorMode.value === 'dark')

const isSearchEnabled = computed(() => siteConfig.isSearchEnabled ?? true)
const navigationStyle = computed(() => siteConfig.navigationStyle ?? 'default')
const navigationLinks = computed(() => siteConfig.navigationLinks ?? [])

const showSearchDialog = ref(false)

function toggleDarkMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

function openSearch() {
  showSearchDialog.value = true
}

function closeSearch() {
  showSearchDialog.value = false
}

// Get page icon from block
const pageIcon = computed(() => {
  if (!props.block || !props.recordMap) return null
  return getBlockIcon(props.block, props.recordMap)
})

// Keyboard shortcut for search - handler stored for cleanup
function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    showSearchDialog.value = !showSearchDialog.value
  }
  if (e.key === 'Escape') {
    showSearchDialog.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Map page URL for navigation
function mapPageUrl(pageId: string): string {
  const cleanId = pageId.replace(/-/g, '')
  return `/${cleanId}`
}
</script>

<template>
  <header class="notion-header">
    <div class="notion-nav-header">
      <!-- Breadcrumbs / Site title -->
      <div class="notion-nav-header-lhs">
        <NuxtLink to="/" class="notion-nav-breadcrumb">
          <span v-if="pageIcon" class="notion-nav-icon">
            {{ pageIcon }}
          </span>
          <span class="notion-nav-title">{{ siteConfig.name || 'Home' }}</span>
        </NuxtLink>
      </div>

      <!-- Right side: Navigation links, theme toggle, search -->
      <div class="notion-nav-header-rhs">
        <!-- Navigation links -->
        <template v-if="navigationStyle === 'custom' && navigationLinks.length > 0">
          <template v-for="(link, index) in navigationLinks" :key="index">
            <NuxtLink
              v-if="link.pageId"
              :to="mapPageUrl(link.pageId)"
              class="notion-nav-link"
            >
              {{ link.title }}
            </NuxtLink>
            <a
              v-else-if="link.url"
              :href="link.url"
              class="notion-nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.title }}
            </a>
          </template>
        </template>

        <!-- Theme toggle -->
        <ClientOnly>
          <button
            class="notion-nav-button"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleDarkMode"
          >
            <Icon v-if="isDark" icon="ph:moon-fill" />
            <Icon v-else icon="ph:sun-bold" />
          </button>
        </ClientOnly>

        <!-- Search button -->
        <button
          v-if="isSearchEnabled"
          class="notion-nav-button notion-nav-search-button"
          title="Search (⌘K)"
          @click="openSearch"
        >
          <Icon icon="ph:magnifying-glass" />
          <span class="notion-nav-search-label">Search</span>
          <kbd class="notion-nav-search-kbd">⌘K</kbd>
        </button>
      </div>
    </div>

    <!-- Search Dialog -->
    <SearchDialog
      v-if="showSearchDialog"
      :is-open="showSearchDialog"
      @close="closeSearch"
    />
  </header>
</template>

<style scoped>
.notion-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-color);
  border-bottom: 1px solid var(--fg-color-1);
}

.notion-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--notion-header-height, 45px);
  padding: 0 1rem;
  max-width: 100%;
}

.notion-nav-header-lhs {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.notion-nav-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fg-color);
  text-decoration: none;
}

.notion-nav-breadcrumb:hover {
  opacity: 0.8;
}

.notion-nav-icon {
  font-size: 1.25rem;
}

.notion-nav-header-rhs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notion-nav-link {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: var(--fg-color-3);
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.1s ease-out, color 0.1s ease-out;
}

.notion-nav-link:hover {
  background: var(--bg-color-0);
  color: var(--fg-color);
}

.notion-nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--fg-color-3);
  cursor: pointer;
  transition: background 0.1s ease-out, color 0.1s ease-out;
}

.notion-nav-button:hover {
  background: var(--bg-color-0);
  color: var(--fg-color);
}

.notion-nav-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.notion-nav-search-button {
  width: auto;
  padding: 0.375rem 0.625rem;
  gap: 0.5rem;
  border: 1px solid var(--fg-color-1);
}

.notion-nav-search-label {
  font-size: 0.8125rem;
  color: var(--fg-color-2);
}

.notion-nav-search-kbd {
  font-size: 0.6875rem;
  font-family: inherit;
  padding: 0.125rem 0.375rem;
  background: var(--bg-color-1);
  border-radius: 3px;
  color: var(--fg-color-3);
}

@media (max-width: 640px) {
  .notion-nav-search-label,
  .notion-nav-search-kbd {
    display: none;
  }

  .notion-nav-search-button {
    min-width: 2.75rem;
    padding: 0;
    border: none;
  }

  .notion-nav-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
  }
}
</style>
