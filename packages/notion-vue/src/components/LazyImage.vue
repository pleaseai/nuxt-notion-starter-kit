<script setup lang="ts">
/**
 * LazyImage component for progressive image loading.
 *
 * Features:
 * - Native lazy loading with loading="lazy"
 * - LQIP (Low Quality Image Placeholder) support via preview_images
 * - Custom Image component support via NotionContext
 * - Smooth fade-in transition when image loads
 */
import type { Block } from 'notion-types'
import type { CSSProperties } from 'vue'
import { normalizeUrl } from 'notion-utils'
import { computed, ref } from 'vue'
import { useNotionContext } from '../composables/useNotionContext'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  block?: Block
  style?: CSSProperties
  className?: string
  priority?: boolean
}>(), {
  alt: '',
  priority: false,
})

const { recordMap, components } = useNotionContext()

// Track loading state
const isLoaded = ref(false)
const hasError = ref(false)

// Get preview image data if available
const previewImage = computed(() => {
  const previewImages = recordMap.preview_images
  if (!previewImages || !props.src)
    return null

  return previewImages[props.src] ?? previewImages[normalizeUrl(props.src)] ?? null
})

// Calculate aspect ratio for placeholder
const aspectRatio = computed(() => {
  if (!previewImage.value)
    return null
  return previewImage.value.originalHeight / previewImage.value.originalWidth
})

// Has custom Image component?
const hasCustomImage = computed(() => !!components.Image)

function onLoad() {
  isLoaded.value = true
}

function onError() {
  hasError.value = true
  isLoaded.value = true
}
</script>

<template>
  <!-- Custom Image component (e.g., NuxtImg) -->
  <component
    :is="components.Image"
    v-if="hasCustomImage"
    :src="src"
    :alt="alt"
    :class="className"
    :style="style"
    :width="previewImage?.originalWidth"
    :height="previewImage?.originalHeight"
    :placeholder="previewImage?.dataURIBase64 ? 'blur' : undefined"
    :placeholder-src="previewImage?.dataURIBase64"
    :loading="priority ? 'eager' : 'lazy'"
    @load="onLoad"
    @error="onError"
  />

  <!-- LQIP with blur preview -->
  <div
    v-else-if="previewImage"
    class="lazy-image-wrapper"
    :class="{ 'lazy-image-loaded': isLoaded }"
    :style="{ paddingBottom: `${(aspectRatio ?? 0) * 100}%` }"
  >
    <!-- Blurred preview -->
    <img
      class="lazy-image-preview"
      :src="previewImage.dataURIBase64"
      :alt="alt"
      :style="style"
      aria-hidden="true"
    >
    <!-- Full image -->
    <img
      class="lazy-image-real"
      :class="className"
      :src="src"
      :alt="alt"
      :style="style"
      :width="previewImage.originalWidth"
      :height="previewImage.originalHeight"
      :loading="priority ? 'eager' : 'lazy'"
      decoding="async"
      @load="onLoad"
      @error="onError"
    >
  </div>

  <!-- Standard lazy image without preview -->
  <img
    v-else
    class="lazy-image"
    :class="[className, { 'lazy-image-loaded': isLoaded }]"
    :src="src"
    :alt="alt"
    :style="style"
    :loading="priority ? 'eager' : 'lazy'"
    decoding="async"
    @load="onLoad"
    @error="onError"
  >
</template>

<style>
.lazy-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.lazy-image-preview,
.lazy-image-real {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lazy-image-preview {
  filter: blur(8px);
  transform: scale(1.05);
  transition: opacity 0.3s ease-out;
}

.lazy-image-real {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.lazy-image-wrapper.lazy-image-loaded .lazy-image-preview {
  opacity: 0;
}

.lazy-image-wrapper.lazy-image-loaded .lazy-image-real {
  opacity: 1;
}

/* Standard image fade-in */
.lazy-image {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.lazy-image.lazy-image-loaded {
  opacity: 1;
}
</style>
