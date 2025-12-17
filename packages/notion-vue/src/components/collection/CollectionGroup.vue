<script setup lang="ts">
import type { Collection, CollectionPropertySchema } from 'notion-types'
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  collection: Collection
  schema: CollectionPropertySchema
  value: string
  total: number
  hidden?: boolean
  defaultOpen?: boolean
}>(), {
  hidden: false,
  defaultOpen: true,
})

defineSlots<{
  default: () => unknown
}>()

const isOpen = ref(props.defaultOpen)
</script>

<template>
  <details
    v-if="!hidden"
    class="notion-collection-group"
    :open="isOpen"
    @toggle="isOpen = ($event.target as HTMLDetailsElement).open"
  >
    <summary class="notion-collection-group-title">
      <span class="notion-collection-group-name">
        {{ value || `No ${schema.name}` }}
      </span>
      <span class="notion-board-th-count">
        {{ total }}
      </span>
    </summary>

    <div class="notion-collection-group-content">
      <slot />
    </div>
  </details>
</template>

<style>
.notion-collection-group {
  margin-bottom: 16px;
}

.notion-collection-group-title {
  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  font-size: 14px;
  color: var(--fg-color);
}

.notion-collection-group-title::-webkit-details-marker {
  margin-right: 8px;
}

.notion-collection-group-name {
  flex: 1;
}

.notion-board-th-count {
  margin-left: 6px;
  color: var(--fg-color-3, rgba(55, 53, 47, 0.5));
  font-size: 12px;
  font-weight: 400;
}

.dark-mode .notion-board-th-count {
  color: rgba(255, 255, 255, 0.5);
}

.notion-collection-group-content {
  padding-top: 8px;
}

.notion-collection-group[open] > .notion-collection-group-title {
  margin-bottom: 0;
}
</style>
