<script setup lang="ts">
import { computed } from 'vue'
import { getBlockTitle } from 'notion-utils'
import type { Block, PageBlock } from 'notion-types'
import { provideNotionContext } from '../composables/useNotionContext'
import { createMapPageUrl, mapImageUrl as defaultMapImageUrl, cs } from '../utils'
import type { NotionRendererProps, NotionContext } from '../types'
import NotionBlock from './NotionBlock.vue'
import NotionCollection from './NotionCollection.vue'

const props = withDefaults(defineProps<NotionRendererProps>(), {
  darkMode: false,
  fullPage: true,
  showTableOfContents: false,
  minTableOfContentsItems: 3,
  defaultPageCoverPosition: 0.5,
})

// Create context
const context = computed<NotionContext>(() => ({
  recordMap: props.recordMap,
  components: props.components || {},
  mapPageUrl: props.mapPageUrl || createMapPageUrl(props.rootPageId),
  mapImageUrl: props.mapImageUrl || defaultMapImageUrl,
  darkMode: props.darkMode,
  fullPage: props.fullPage,
  rootPageId: props.rootPageId,
  rootDomain: props.rootDomain,
  showTableOfContents: props.showTableOfContents,
  minTableOfContentsItems: props.minTableOfContentsItems,
  defaultPageIcon: props.defaultPageIcon,
  defaultPageCover: props.defaultPageCover,
  defaultPageCoverPosition: props.defaultPageCoverPosition,
}))

provideNotionContext(context.value)

// Get root block
const rootBlock = computed<Block | undefined>(() => {
  const keys = Object.keys(props.recordMap?.block || {})
  const rootId = keys[0]
  return rootId ? props.recordMap.block[rootId]?.value : undefined
})

const rootPageBlock = computed<PageBlock | undefined>(() => {
  if (rootBlock.value?.type !== 'page') return undefined
  return rootBlock.value as PageBlock
})

// Page metadata
const pageTitle = computed(() => {
  if (!rootBlock.value) return ''
  return getBlockTitle(rootBlock.value, props.recordMap) || ''
})

const pageIcon = computed(() => {
  return rootPageBlock.value?.format?.page_icon || props.defaultPageIcon
})

const pageCover = computed(() => {
  const cover = rootPageBlock.value?.format?.page_cover
  if (!cover) return props.defaultPageCover
  return context.value.mapImageUrl(cover, rootBlock.value!)
})

const pageCoverPosition = computed(() => {
  return rootPageBlock.value?.format?.page_cover_position ?? props.defaultPageCoverPosition
})

// Child blocks
const childBlocks = computed(() => {
  return rootBlock.value?.content || []
})

function getChildBlock(childId: string): Block | undefined {
  return props.recordMap.block[childId]?.value
}

// Check if block is collection view
function isCollectionView(block: Block): boolean {
  return block.type === 'collection_view' || block.type === 'collection_view_page'
}
</script>

<template>
  <div
    :class="cs(
      'notion',
      'notion-app',
      darkMode && 'dark-mode',
      fullPage && 'notion-full-page',
      rootPageBlock?.id === rootPageId && 'index-page'
    )"
  >
    <!-- Page Cover -->
    <div v-if="pageCover && fullPage" class="notion-page-cover-wrapper">
      <img
        :src="pageCover"
        alt="Page cover"
        class="notion-page-cover"
        :style="{ objectPosition: `center ${pageCoverPosition * 100}%` }"
        loading="lazy"
      />
    </div>

    <main
      :class="cs(
        'notion-page',
        !pageCover && 'notion-page-no-cover',
        pageIcon && 'notion-page-has-icon',
        pageCover && 'notion-page-has-cover'
      )"
    >
      <!-- Page Header -->
      <header v-if="fullPage" class="notion-page-header">
        <!-- Page Icon -->
        <div v-if="pageIcon" class="notion-page-icon-wrapper">
          <span class="notion-page-icon-image notion-page-icon">
            {{ pageIcon }}
          </span>
        </div>

        <!-- Page Title -->
        <h1 class="notion-title">
          {{ pageTitle }}
        </h1>
      </header>

      <!-- Slot for custom header -->
      <slot name="header" />

      <!-- Page Content -->
      <div class="notion-page-content">
        <article class="notion-page-content-inner">
          <template v-for="childId in childBlocks" :key="childId">
            <!-- Collection View -->
            <NotionCollection
              v-if="getChildBlock(childId) && isCollectionView(getChildBlock(childId)!)"
              :block="getChildBlock(childId)!"
            />
            <!-- Regular Block -->
            <NotionBlock
              v-else-if="getChildBlock(childId)"
              :block="getChildBlock(childId)!"
              :level="0"
            />
          </template>
        </article>

        <!-- Slot for aside -->
        <aside v-if="$slots.aside" class="notion-aside">
          <slot name="aside" />
        </aside>
      </div>

      <!-- Slot for footer -->
      <slot name="footer" />
    </main>
  </div>
</template>

<style>
.notion {
  --notion-max-width: 720px;
  --notion-header-height: 45px;
}

.notion-page-cover-wrapper {
  width: 100%;
  max-height: 30vh;
  overflow: hidden;
}

.notion-page-cover {
  width: 100%;
  height: 30vh;
  object-fit: cover;
}

.notion-page {
  max-width: var(--notion-max-width);
  margin: 0 auto;
  padding: 0 40px;
}

.notion-page-has-cover {
  margin-top: -60px;
}

.notion-page-header {
  margin-bottom: 24px;
}

.notion-page-icon-wrapper {
  margin-bottom: 8px;
}

.notion-page-icon {
  font-size: 72px;
  line-height: 1;
}

.notion-title {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.notion-page-content {
  display: flex;
}

.notion-page-content-inner {
  flex: 1;
  min-width: 0;
}

.notion-aside {
  flex-shrink: 0;
  margin-left: 40px;
  width: 200px;
}

@media (max-width: 900px) {
  .notion-aside {
    display: none;
  }
}

@media (max-width: 720px) {
  .notion-page {
    padding: 0 16px;
  }

  .notion-title {
    font-size: 32px;
  }
}
</style>
