<script setup lang="ts">
import type { ExtendedRecordMap, PageBlock } from 'notion-types'
import { computed, watch } from 'vue'
import { useTableOfContents } from '../composables/useTableOfContents'
import { cs } from '../utils'

const props = withDefaults(defineProps<{
  recordMap: ExtendedRecordMap
  pageBlock?: PageBlock
  minItems?: number
}>(), {
  minItems: 3,
})

const { entries, activeSection, hasToc } = useTableOfContents(
  props.recordMap,
  props.pageBlock,
  props.minItems,
)

// Re-initialize when pageBlock changes (reactive)
watch(
  () => props.pageBlock,
  () => {
    // The composable will recompute entries automatically
  },
)

const hasEntries = computed(() => hasToc.value && entries.value.length > 0)
</script>

<template>
  <div v-if="hasEntries" class="notion-aside-table-of-contents">
    <div class="notion-aside-table-of-contents-header">
      Table of Contents
    </div>
    <nav class="notion-table-of-contents">
      <a
        v-for="entry in entries"
        :key="entry.id"
        :href="`#${entry.id}`"
        :class="cs(
          'notion-table-of-contents-item',
          `notion-table-of-contents-item-indent-level-${entry.indentLevel}`,
          activeSection === entry.id && 'notion-table-of-contents-active-item',
        )"
      >
        <span class="notion-table-of-contents-item-body">
          {{ entry.text }}
        </span>
      </a>
    </nav>
  </div>
</template>
