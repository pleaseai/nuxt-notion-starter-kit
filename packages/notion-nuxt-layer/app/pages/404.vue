<script setup lang="ts">
definePageMeta({
  layout: false,
})

const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as { name?: string }

const title = computed(() => `Page Not Found - ${siteConfig.name || 'Notion Site'}`)

useSeoMeta({
  title: title.value,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="notion-error-page">
    <main class="notion-error-main">
      <h1>Page Not Found</h1>

      <p class="notion-error-message">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <p class="notion-error-hint">
        Make sure the Notion page is publicly accessible.
      </p>

      <div class="notion-error-actions">
        <NuxtLink to="/" class="notion-error-button">
          Go to Home
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.notion-error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: var(--bg-color);
  color: var(--fg-color);
}

.notion-error-main {
  text-align: center;
  max-width: 480px;
}

.notion-error-main h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--fg-color);
}

.notion-error-message {
  font-size: 1.125rem;
  color: var(--fg-color-3);
  margin-bottom: 0.5rem;
}

.notion-error-hint {
  font-size: 0.875rem;
  color: var(--fg-color-2);
  margin-bottom: 2rem;
}

.notion-error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.notion-error-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--notion-button-text, #fff);
  background: var(--notion-blue);
  border-radius: 4px;
  text-decoration: none;
  transition: opacity 0.1s ease-out;
}

.notion-error-button:hover {
  opacity: 0.85;
}
</style>
