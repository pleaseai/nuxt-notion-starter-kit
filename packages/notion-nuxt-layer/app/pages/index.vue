<script setup lang="ts">
import { NotionRenderer } from '@pleaseai/notion-vue'

const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as {
  rootNotionPageId: string
  name: string
  description?: string
}

const { data: pageData, error } = await useAsyncData(
  'index-page',
  () => $fetch('/api/notion-page', {
    method: 'POST',
    body: { pageId: undefined },
  }),
)

if (error.value || pageData.value?.error) {
  throw createError({
    statusCode: pageData.value?.error?.statusCode || 500,
    message: pageData.value?.error?.message || 'Failed to load page',
  })
}

const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')

// SEO meta
useHead({
  title: siteConfig.name,
  meta: [
    { name: 'description', content: siteConfig.description },
  ],
})

// Map page URL function
function mapPageUrl(pageId: string): string {
  return `/${pageId}`
}
</script>

<template>
  <div class="notion-page-wrapper">
    <NotionRenderer
      v-if="pageData?.recordMap"
      :record-map="pageData.recordMap"
      :root-page-id="siteConfig.rootNotionPageId"
      :dark-mode="isDarkMode"
      :full-page="true"
      :map-page-url="mapPageUrl"
    />
  </div>
</template>

<style scoped>
.notion-page-wrapper {
  min-height: 100vh;
}
</style>
