<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const config = useRuntimeConfig()
const siteConfig = config.public.siteConfig as { name?: string }

const title = computed(() => `Error - ${siteConfig.name || 'Notion Site'}`)

useSeoMeta({
  title: title.value,
  robots: 'noindex, nofollow',
})

const is404 = computed(() => props.error.statusCode === 404)

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="notion-error-page">
    <main class="notion-error-main">
      <h1 v-if="is404">
        Page Not Found
      </h1>
      <h1 v-else>
        Error Loading Page
      </h1>

      <p v-if="error.statusCode" class="notion-error-code">
        Error code: {{ error.statusCode }}
      </p>

      <p v-if="error.message" class="notion-error-message">
        {{ error.message }}
      </p>

      <p v-if="is404" class="notion-error-hint">
        Make sure the Notion page is publicly accessible.
      </p>

      <div class="notion-error-actions">
        <button class="notion-error-button" @click="handleError">
          Go to Home
        </button>
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
  font-family: var(--notion-font);
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

.notion-error-code {
  font-size: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--fg-color-2);
  margin-bottom: 0.5rem;
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
  margin-top: 1.5rem;
}

.notion-error-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--notion-button-text, #fff);
  background: var(--notion-blue);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.1s ease-out;
}

.notion-error-button:hover {
  opacity: 0.85;
}
</style>
