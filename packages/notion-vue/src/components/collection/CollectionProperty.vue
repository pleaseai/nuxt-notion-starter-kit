<script setup lang="ts">
import type { Block, Collection, CollectionPropertySchema, Decoration } from 'notion-types'
import { getTextContent } from 'notion-utils'
import { computed } from 'vue'
import NotionText from '../NotionText.vue'

const props = defineProps<{
  schema: CollectionPropertySchema
  data: unknown
  block?: Block
  collection?: Collection
  inline?: boolean
}>()

/**
 * Get color class for select/multi_select options
 */
function getColorClass(color?: string): string {
  if (!color || color === 'default')
    return 'notion-item-default'
  return `notion-item-${color}`
}

/**
 * Extract hostname from URL safely
 */
function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  }
  catch {
    return url
  }
}

/**
 * Check if data is a valid Decoration array for NotionText
 */
function isDecorationArray(data: unknown): data is Decoration[] {
  return Array.isArray(data) && data.length > 0
}

const textContent = computed(() => {
  const data = props.data
  if (!data)
    return ''

  switch (props.schema.type) {
    case 'title':
    case 'text':
      return getTextContent(data as Decoration[]) || ''

    case 'number': {
      const value = (data as unknown[][])?.[0]?.[0]
      return value?.toString() || ''
    }

    case 'select':
    case 'status': {
      return (data as unknown[][])?.[0]?.[0]?.toString() || ''
    }

    case 'multi_select': {
      const value = (data as unknown[][])?.[0]?.[0]?.toString() || ''
      return value.split(',').map(v => v.trim()).filter(Boolean)
    }

    case 'date': {
      const arr = data as unknown[][]
      const dateValue = arr?.[0]?.[1] as Array<[string, Record<string, string>]> | undefined
      const dateData = dateValue?.[0]?.[1]
      if (dateData?.start_date) {
        return dateData.start_date
      }
      return ''
    }

    case 'checkbox': {
      const value = (data as unknown[][])?.[0]?.[0]
      return value === 'Yes' ? '✓' : ''
    }

    case 'url':
    case 'email':
    case 'phone_number': {
      return (data as unknown[][])?.[0]?.[0]?.toString() || ''
    }

    default:
      return getTextContent(data as Decoration[]) || ''
  }
})

const selectOptions = computed(() => {
  if (props.schema.type === 'multi_select') {
    const content = textContent.value
    if (Array.isArray(content)) {
      return content.map((value) => {
        const option = props.schema.options?.find(o => o.value === value)
        return {
          value,
          color: option?.color || 'default',
        }
      })
    }
  }

  if (props.schema.type === 'select' || props.schema.type === 'status') {
    const value = textContent.value
    if (value && typeof value === 'string') {
      const option = props.schema.options?.find(o => o.value === value)
      return [{
        value,
        color: option?.color || 'default',
      }]
    }
  }

  return []
})
</script>

<template>
  <div class="notion-property" :class="{ 'notion-property-inline': inline }">
    <!-- Title/Text property - use NotionText for rich formatting -->
    <template v-if="schema.type === 'title' || schema.type === 'text'">
      <NotionText
        v-if="isDecorationArray(data)"
        :value="data as Decoration[]"
        :block="block"
      />
      <span v-else>{{ textContent }}</span>
    </template>

    <!-- Select/Multi-select properties -->
    <template v-else-if="schema.type === 'select' || schema.type === 'multi_select' || schema.type === 'status'">
      <span
        v-for="opt in selectOptions"
        :key="opt.value"
        class="notion-property-select-item"
        :class="getColorClass(opt.color)"
      >
        {{ opt.value }}
      </span>
    </template>

    <!-- Checkbox -->
    <template v-else-if="schema.type === 'checkbox'">
      <span class="notion-property-checkbox">
        {{ textContent }}
      </span>
    </template>

    <!-- URL -->
    <template v-else-if="schema.type === 'url'">
      <a
        v-if="textContent"
        :href="textContent as string"
        target="_blank"
        rel="noopener noreferrer"
        class="notion-link"
      >
        {{ inline ? getHostname(textContent as string) : textContent }}
      </a>
    </template>

    <!-- Email -->
    <template v-else-if="schema.type === 'email'">
      <a
        v-if="textContent"
        :href="`mailto:${textContent}`"
        class="notion-link"
      >
        {{ textContent }}
      </a>
    </template>

    <!-- Phone -->
    <template v-else-if="schema.type === 'phone_number'">
      <a
        v-if="textContent"
        :href="`tel:${textContent}`"
        class="notion-link"
      >
        {{ textContent }}
      </a>
    </template>

    <!-- Default: plain text -->
    <template v-else>
      <span>{{ textContent }}</span>
    </template>
  </div>
</template>

<style>
.notion-property {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.notion-property-inline {
  display: inline;
}

.notion-property-select-item {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
}

.notion-property-checkbox {
  font-size: 14px;
}

/* Select option colors */
.notion-item-default {
  background: var(--bg-color-1, rgba(206, 205, 202, 0.5));
  color: var(--fg-color, inherit);
}

.notion-item-gray {
  background: rgba(155, 154, 151, 0.4);
  color: rgb(50, 48, 44);
}

.notion-item-brown {
  background: rgba(140, 46, 0, 0.2);
  color: rgb(68, 42, 30);
}

.notion-item-orange {
  background: rgba(245, 93, 0, 0.2);
  color: rgb(73, 41, 14);
}

.notion-item-yellow {
  background: rgba(233, 168, 0, 0.2);
  color: rgb(64, 44, 27);
}

.notion-item-green {
  background: rgba(0, 135, 107, 0.2);
  color: rgb(28, 56, 41);
}

.notion-item-blue {
  background: rgba(0, 120, 223, 0.2);
  color: rgb(24, 51, 71);
}

.notion-item-purple {
  background: rgba(103, 36, 222, 0.2);
  color: rgb(65, 36, 84);
}

.notion-item-pink {
  background: rgba(221, 0, 129, 0.2);
  color: rgb(76, 35, 55);
}

.notion-item-red {
  background: rgba(255, 0, 26, 0.2);
  color: rgb(93, 23, 21);
}

/* Dark mode colors */
.dark-mode .notion-item-default {
  background: rgba(255, 255, 255, 0.13);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-gray {
  background: rgba(155, 154, 151, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-brown {
  background: rgba(140, 46, 0, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-orange {
  background: rgba(245, 93, 0, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-yellow {
  background: rgba(233, 168, 0, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-green {
  background: rgba(0, 135, 107, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-blue {
  background: rgba(0, 120, 223, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-purple {
  background: rgba(103, 36, 222, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-pink {
  background: rgba(221, 0, 129, 0.3);
  color: rgba(255, 255, 255, 0.81);
}

.dark-mode .notion-item-red {
  background: rgba(255, 0, 26, 0.3);
  color: rgba(255, 255, 255, 0.81);
}
</style>
