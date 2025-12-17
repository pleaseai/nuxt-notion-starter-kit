<script setup lang="ts">
/**
 * NotionImage - NuxtImg wrapper for notion-vue Image component interface.
 *
 * This component adapts NuxtImg to work with the notion-vue LazyImage component,
 * providing optimized image loading with Nuxt Image.
 */
import type { CSSProperties } from 'vue'

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  width?: number | null
  height?: number | null
  style?: CSSProperties
  className?: string
  placeholder?: 'blur' | 'empty'
  placeholderSrc?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
}>(), {
  alt: '',
  loading: 'lazy',
  priority: false,
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

// Determine loading behavior
const loadingAttr = computed(() => {
  if (props.priority)
    return 'eager'
  return props.loading
})

// Handle placeholder
const placeholderValue = computed(() => {
  if (props.placeholder === 'blur' && props.placeholderSrc) {
    return props.placeholderSrc
  }
  return undefined
})
</script>

<template>
  <NuxtImg
    v-if="src"
    :src="src"
    :alt="alt"
    :width="width ?? undefined"
    :height="height ?? undefined"
    :class="className"
    :style="style"
    :loading="loadingAttr"
    :placeholder="placeholderValue"
    :preload="priority"
    @load="emit('load', $event)"
    @error="emit('error', $event)"
  />
</template>
