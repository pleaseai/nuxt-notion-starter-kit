<script setup lang="ts">
import type { Block, BookmarkBlock, EmbedBlock, ImageBlock, VideoBlock } from 'notion-types'
import { computed } from 'vue'
import { useImageLightbox } from '../composables/useImageLightbox'
import { useNotionContext } from '../composables/useNotionContext'
import NotionText from './NotionText.vue'

const props = defineProps<{
  block: Block
}>()

const { mapImageUrl } = useNotionContext()
const lightbox = useImageLightbox()

const blockType = computed(() => props.block?.type)

const source = computed(() => {
  const block = props.block as ImageBlock | VideoBlock | EmbedBlock
  // Try properties.source first (newer format), then format.display_source
  const src = block.properties?.source?.[0]?.[0]
    || (block as any).format?.display_source
    || (block as any).format?.source
  return src
})

const caption = computed(() => {
  const block = props.block as ImageBlock | VideoBlock
  return block.properties?.caption
})

const imageUrl = computed(() => {
  if (blockType.value !== 'image')
    return undefined
  const src = source.value
  if (!src)
    return undefined
  return mapImageUrl(src, props.block)
})

const videoUrl = computed(() => {
  if (blockType.value !== 'video')
    return undefined
  return source.value
})

const isYouTube = computed(() => {
  const url = videoUrl.value
  if (!url)
    return false
  return url.includes('youtube.com') || url.includes('youtu.be')
})

const youTubeId = computed(() => {
  const url = videoUrl.value
  if (!url)
    return undefined

  // Extract YouTube video ID
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match?.[1]
})

const bookmark = computed(() => {
  if (blockType.value !== 'bookmark')
    return undefined
  const block = props.block as BookmarkBlock
  return {
    link: block.properties?.link?.[0]?.[0],
    title: block.properties?.title?.[0]?.[0] || block.properties?.link?.[0]?.[0],
    description: block.properties?.description?.[0]?.[0],
    icon: (block as any).format?.bookmark_icon,
    cover: (block as any).format?.bookmark_cover,
  }
})

const embedUrl = computed(() => {
  if (blockType.value !== 'embed')
    return undefined
  return source.value
})

const imageFormat = computed(() => {
  const block = props.block as ImageBlock
  const format = block.format
  return {
    width: format?.block_width,
    aspectRatio: format?.block_aspect_ratio,
    blockFullWidth: format?.block_full_width,
    blockPageWidth: format?.block_page_width,
    blockPreserveScale: format?.block_preserve_scale,
  }
})

// Handle image click to open lightbox
function handleImageClick() {
  if (lightbox && imageUrl.value) {
    const alt = caption.value?.[0]?.[0] || ''
    lightbox.open(imageUrl.value, alt)
  }
}
</script>

<template>
  <figure class="notion-asset-wrapper">
    <!-- Image -->
    <div v-if="blockType === 'image'" class="notion-asset">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="caption?.[0]?.[0] || ''"
        class="notion-image"
        :class="{ 'notion-image-zoomable': lightbox }"
        :style="{
          width: imageFormat.blockFullWidth ? '100%' : (imageFormat.width ? `${imageFormat.width}px` : undefined),
          aspectRatio: imageFormat.aspectRatio ? String(imageFormat.aspectRatio) : undefined,
        }"
        loading="lazy"
        @click="handleImageClick"
      >
    </div>

    <!-- Video -->
    <div v-else-if="blockType === 'video'" class="notion-asset notion-video">
      <!-- YouTube embed -->
      <iframe
        v-if="isYouTube && youTubeId"
        :src="`https://www.youtube.com/embed/${youTubeId}`"
        class="notion-video-iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      />
      <!-- Native video -->
      <video
        v-else-if="videoUrl"
        :src="videoUrl"
        class="notion-video-native"
        controls
        preload="metadata"
      />
    </div>

    <!-- Bookmark -->
    <a
      v-else-if="blockType === 'bookmark' && bookmark"
      :href="bookmark.link"
      class="notion-bookmark"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="notion-bookmark-content">
        <div class="notion-bookmark-title">{{ bookmark.title }}</div>
        <div v-if="bookmark.description" class="notion-bookmark-description">
          {{ bookmark.description }}
        </div>
        <div class="notion-bookmark-link">
          <img
            v-if="bookmark.icon"
            :src="bookmark.icon"
            class="notion-bookmark-icon"
            loading="lazy"
          >
          <span>{{ bookmark.link }}</span>
        </div>
      </div>
      <div v-if="bookmark.cover" class="notion-bookmark-cover">
        <img :src="bookmark.cover" alt="" loading="lazy">
      </div>
    </a>

    <!-- Generic embed -->
    <div v-else-if="blockType === 'embed'" class="notion-asset notion-embed">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        class="notion-embed-iframe"
        loading="lazy"
        sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
      />
    </div>

    <!-- Caption -->
    <figcaption v-if="caption && caption.length > 0" class="notion-asset-caption">
      <NotionText :value="caption" :block="block" />
    </figcaption>
  </figure>
</template>

<style scoped>
.notion-asset-wrapper {
  margin: 0;
  padding: 0;
}

.notion-asset {
  position: relative;
  width: 100%;
}

.notion-image {
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.notion-image-zoomable {
  cursor: zoom-in;
}

.notion-video-iframe,
.notion-embed-iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
}

.notion-video-native {
  width: 100%;
  max-width: 100%;
}

.notion-bookmark {
  display: flex;
  border: 1px solid var(--fg-color-1, #e0e0e0);
  border-radius: 3px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.notion-bookmark-content {
  flex: 1;
  padding: 12px 14px;
  overflow: hidden;
}

.notion-bookmark-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notion-bookmark-description {
  font-size: 12px;
  color: var(--fg-color-2, #666);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.notion-bookmark-link {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--fg-color-2, #666);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notion-bookmark-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.notion-bookmark-cover {
  width: 33%;
  flex-shrink: 0;
}

.notion-bookmark-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notion-asset-caption {
  font-size: 14px;
  color: var(--fg-color-2, #666);
  padding: 6px 0;
  text-align: center;
}
</style>
