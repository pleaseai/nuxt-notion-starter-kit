<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { CodeBlock } from 'notion-types'
import { getBlockTitle } from 'notion-utils'
import { createHighlighter, type Highlighter } from 'shiki'
import { useNotionContext } from '../composables/useNotionContext'
import NotionText from './NotionText.vue'

const props = withDefaults(
  defineProps<{
    block: CodeBlock
    defaultLanguage?: string
  }>(),
  {
    defaultLanguage: 'typescript',
  }
)

const { recordMap } = useNotionContext()

const isCopied = ref(false)
const copyError = ref(false)
const highlightedCode = ref('')
const highlighter = ref<Highlighter | null>(null)
let copyTimeout: ReturnType<typeof setTimeout> | undefined

const content = computed(() => getBlockTitle(props.block, recordMap))

const language = computed(() => {
  const languageNotion = (
    props.block.properties?.language?.[0]?.[0] || props.defaultLanguage
  ).toLowerCase()

  const languageMap: Record<string, string> = {
    'c++': 'cpp',
    'c#': 'csharp',
    'f#': 'fsharp',
    'objective-c': 'objc',
    'objective-c++': 'objc',
    'html/css': 'html',
    'plain text': 'text',
    'shell': 'bash',
    'zsh': 'bash',
  }

  return languageMap[languageNotion] || languageNotion
})

const caption = computed(() => props.block.properties?.caption)

async function initHighlighter() {
  try {
    highlighter.value = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'html',
        'css',
        'json',
        'markdown',
        'python',
        'java',
        'go',
        'rust',
        'bash',
        'sql',
        'yaml',
        'toml',
        'cpp',
        'csharp',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'vue',
        'svelte',
        'text',
      ],
    })
    highlight()
  } catch (err) {
    console.error('[NotionCode] Shiki highlighter initialization failed:', {
      error: err,
      language: language.value,
      blockId: props.block.id,
    })
    highlightedCode.value = escapeHtml(content.value)
  }
}

function highlight() {
  if (!highlighter.value || !content.value) {
    highlightedCode.value = escapeHtml(content.value)
    return
  }

  try {
    const loadedLangs = highlighter.value.getLoadedLanguages()
    const lang = loadedLangs.includes(language.value) ? language.value : 'text'

    highlightedCode.value = highlighter.value.codeToHtml(content.value, {
      lang,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    })
  } catch (err) {
    console.error('[NotionCode] Shiki highlight failed:', {
      error: err,
      language: language.value,
      blockId: props.block.id,
    })
    highlightedCode.value = escapeHtml(content.value)
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(content.value)
    isCopied.value = true
    copyError.value = false

    if (copyTimeout) {
      clearTimeout(copyTimeout)
    }

    copyTimeout = setTimeout(() => {
      isCopied.value = false
    }, 1200)
  } catch (err) {
    console.error('[NotionCode] Clipboard copy failed:', err)
    copyError.value = true
    isCopied.value = false

    if (copyTimeout) {
      clearTimeout(copyTimeout)
    }

    copyTimeout = setTimeout(() => {
      copyError.value = false
    }, 2000)
  }
}

onMounted(() => {
  initHighlighter()
})

onUnmounted(() => {
  if (copyTimeout) {
    clearTimeout(copyTimeout)
  }
})

watch(content, () => {
  highlight()
})
</script>

<template>
  <div class="notion-code-wrapper">
    <pre
      class="notion-code"
      :class="`language-${language}`"
      tabindex="0"
    >
      <div class="notion-code-copy">
        <button
          class="notion-code-copy-button"
          :class="{ 'notion-code-copy-error': copyError }"
          :title="copyError ? 'Copy failed' : isCopied ? 'Copied!' : 'Copy code'"
          :aria-label="copyError ? 'Copy failed' : isCopied ? 'Copied!' : 'Copy code'"
          @click="copyToClipboard"
        >
          <svg v-if="copyError" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <svg v-else-if="isCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <div v-if="isCopied" class="notion-code-copy-tooltip">
          Copied
        </div>
        <div v-if="copyError" class="notion-code-copy-tooltip notion-code-copy-tooltip-error">
          Failed
        </div>
      </div>
      <code
        v-if="highlightedCode"
        :class="`language-${language}`"
        v-html="highlightedCode"
      />
      <code v-else :class="`language-${language}`">{{ content }}</code>
    </pre>

    <figcaption v-if="caption" class="notion-asset-caption">
      <NotionText :value="caption" :block="block" />
    </figcaption>
  </div>
</template>

<style scoped>
.notion-code-wrapper {
  margin: 4px 0;
}

.notion-code {
  position: relative;
  padding: 30px 16px 32px;
  background: var(--bg-color-1);
  border-radius: 4px;
  overflow: auto;
  font-size: 0.85em;
  line-height: 1.5;
  tab-size: 2;
}

.notion-code:focus {
  outline: 2px solid var(--notion-blue, #2383e2);
  outline-offset: 2px;
}

.notion-code code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  background: transparent;
  padding: 0;
  white-space: pre;
}

/* Shiki dual theme support */
.notion-code :deep(.shiki) {
  background: transparent !important;
}

.notion-code :deep(.shiki code) {
  display: block;
}

/* Light mode */
.notion-code :deep(.shiki .shiki-light) {
  display: block;
}

.notion-code :deep(.shiki .shiki-dark) {
  display: none;
}

/* Dark mode */
.dark-mode .notion-code :deep(.shiki .shiki-light) {
  display: none;
}

.dark-mode .notion-code :deep(.shiki .shiki-dark) {
  display: block;
}

.notion-code-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notion-code-copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  background: var(--bg-color);
  border: 1px solid var(--fg-color-1);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease-out, background 0.1s ease-out;
}

.notion-code:hover .notion-code-copy-button,
.notion-code:focus-within .notion-code-copy-button {
  opacity: 1;
}

/* Always show copy button on touch devices */
@media (hover: none) {
  .notion-code-copy-button {
    opacity: 0.7;
  }
}

.notion-code-copy-error {
  border-color: var(--notion-red, #e03e3e);
}

.notion-code-copy-button:hover {
  background: var(--bg-color-0);
}

.notion-code-copy-button svg {
  width: 16px;
  height: 16px;
  color: var(--fg-color-3);
}

.notion-code-copy-tooltip {
  font-size: 0.75rem;
  color: var(--fg-color-3);
  background: var(--bg-color);
  border: 1px solid var(--fg-color-1);
  border-radius: 4px;
  padding: 4px 8px;
}

.notion-code-copy-tooltip-error {
  color: var(--notion-red, #e03e3e);
  border-color: var(--notion-red, #e03e3e);
}

.notion-asset-caption {
  font-size: 0.875em;
  color: var(--fg-color-3);
  padding: 6px 0 6px 2px;
}
</style>
