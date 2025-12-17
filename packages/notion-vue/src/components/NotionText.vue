<script setup lang="ts">
import type { Block, Decoration } from 'notion-types'
import type { VNode } from 'vue'
import { computed, h } from 'vue'
import { useNotionContext } from '../composables/useNotionContext'

const props = defineProps<{
  value?: Decoration[]
  block?: Block
  linkProps?: Record<string, unknown>
}>()

const { mapPageUrl, components } = useNotionContext()

interface DecorationItem {
  text: string
  decorations: Array<['b'] | ['i'] | ['s'] | ['_'] | ['c'] | ['h', string] | ['a', string] | ['p', string] | ['u', string] | ['d', unknown] | ['e', string]>
}

function renderDecoration(item: DecorationItem): VNode {
  let content: VNode | string = item.text

  if (!item.decorations || item.decorations.length === 0) {
    return h('span', {}, content)
  }

  // Apply decorations in reverse order (innermost first)
  for (const decoration of [...item.decorations].reverse()) {
    const [type, value] = decoration

    switch (type) {
      case 'b':
        content = h('b', {}, content)
        break
      case 'i':
        content = h('em', {}, content)
        break
      case 's':
        content = h('s', {}, content)
        break
      case '_':
        content = h('span', { class: 'notion-inline-underscore' }, content)
        break
      case 'c':
        content = h('code', { class: 'notion-inline-code' }, content)
        break
      case 'h':
        content = h('span', { class: `notion-${value}` }, content)
        break
      case 'a': {
        const href = value as string | undefined
        if (!href) break
        const isInternal = href.startsWith('/')

        if (isInternal && components.Link) {
          content = h(components.Link, { to: href, ...props.linkProps }, () => content)
        }
        else {
          content = h('a', {
            href,
            class: 'notion-link',
            target: isInternal ? undefined : '_blank',
            rel: isInternal ? undefined : 'noopener noreferrer',
            ...props.linkProps,
          }, content)
        }
        break
      }
      case 'p': {
        // Page mention
        const pageId = value as string
        const href = mapPageUrl(pageId)

        if (components.Link) {
          content = h(components.Link, { to: href, class: 'notion-page-link' }, () => content)
        }
        else {
          content = h('a', { href, class: 'notion-page-link' }, content)
        }
        break
      }
      case 'u': {
        // User mention - just render the text
        content = h('span', { class: 'notion-user' }, content)
        break
      }
      case 'd': {
        // Date - render the text as-is
        content = h('span', { class: 'notion-date' }, content)
        break
      }
      case 'e': {
        // Inline equation - for MVP, just render as code
        const equation = value as string
        content = h('code', { class: 'notion-inline-equation' }, equation)
        break
      }
      default:
        // Unknown decoration, keep content as-is
        break
    }
  }

  return typeof content === 'string' ? h('span', {}, content) : content
}

const renderedContent = computed(() => {
  if (!props.value || props.value.length === 0) {
    return []
  }

  return props.value.map((item, index) => {
    const [text, decorations = []] = item
    return h('span', { key: index }, renderDecoration({ text, decorations: decorations as DecorationItem['decorations'] }))
  })
})
</script>

<template>
  <component :is="() => renderedContent" />
</template>
