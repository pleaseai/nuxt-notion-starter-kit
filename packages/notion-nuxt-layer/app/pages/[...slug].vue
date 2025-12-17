<script setup lang="ts">
import { getBlockTitle, NotionRenderer } from '@pleaseai/notion-vue'

const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as {
  rootNotionPageId: string
  name: string
  description?: string
}

const route = useRoute()
const slug = computed(() => {
  const slugParam = route.params.slug
  if (Array.isArray(slugParam)) {
    return slugParam.join('/')
  }
  return slugParam || ''
})

const { data: pageData, error } = await useAsyncData(
  `page-${slug.value}`,
  () => $fetch('/api/notion-page', {
    method: 'POST',
    body: { pageId: slug.value },
  }),
)

if (error.value || pageData.value?.error) {
  throw createError({
    statusCode: pageData.value?.error?.statusCode || 404,
    message: pageData.value?.error?.message || 'Page not found',
  })
}

const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')

// Get page title for SEO
const pageTitle = computed(() => {
  if (!pageData.value?.recordMap?.block)
    return siteConfig.name

  const keys = Object.keys(pageData.value.recordMap.block)
  const rootBlock = keys[0] ? pageData.value.recordMap.block[keys[0]]?.value : null

  if (rootBlock) {
    const title = getBlockTitle(rootBlock, pageData.value.recordMap)
    return title ? `${title} | ${siteConfig.name}` : siteConfig.name
  }

  return siteConfig.name
})

// SEO meta
useHead({
  title: pageTitle,
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
