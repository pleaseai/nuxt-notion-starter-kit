<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Block, Decoration } from 'notion-types'
import { useNotionContext } from '../composables/useNotionContext'
import { cs, getBlockColorClass, hasBlockChildren } from '../utils'
import NotionText from './NotionText.vue'
import NotionAsset from './NotionAsset.vue'

const props = defineProps<{
  block: Block
  level?: number
}>()

const { recordMap, mapPageUrl } = useNotionContext()

const isToggleOpen = ref(false)

const blockId = computed(() => props.block?.id)
const blockType = computed(() => props.block?.type)
const blockColor = computed(() => (props.block as any)?.format?.block_color)
const colorClass = computed(() => getBlockColorClass(blockColor.value))

const title = computed<Decoration[] | undefined>(() => (props.block as any)?.properties?.title)
const children = computed(() => props.block?.content || [])
const hasChildren = computed(() => hasBlockChildren(props.block))

function getChildBlock(childId: string): Block | undefined {
  return recordMap.block[childId]?.value
}

// List nesting level calculation
const listNestingLevel = computed(() => {
  let level = 0
  let currentBlock: Block | undefined = props.block

  while (currentBlock) {
    const parentId: string | undefined = currentBlock.parent_id
    if (!parentId) break

    const parentBlock: Block | undefined = recordMap.block[parentId]?.value
    if (!parentBlock) break

    if (
      parentBlock.type === 'bulleted_list' ||
      parentBlock.type === 'numbered_list'
    ) {
      level++
    }

    currentBlock = parentBlock
  }

  return level
})

const numberedListStyle = computed(() => {
  const styles = ['decimal', 'lower-alpha', 'lower-roman']
  return styles[listNestingLevel.value % 3]
})
</script>

<template>
  <div
    v-if="block"
    :class="cs('notion-block', `notion-block-${blockId}`)"
    :data-block-id="blockId"
  >
    <!-- Text block -->
    <div
      v-if="blockType === 'text'"
      :class="cs('notion-text', colorClass)"
    >
      <NotionText v-if="title" :value="title" :block="block" />
      <template v-if="hasChildren">
        <NotionBlock
          v-for="childId in children"
          :key="childId"
          :block="getChildBlock(childId)!"
          :level="(level || 0) + 1"
        />
      </template>
    </div>

    <!-- Header blocks -->
    <h2
      v-else-if="blockType === 'header'"
      :id="blockId"
      :class="cs('notion-h notion-h1', colorClass)"
    >
      <NotionText v-if="title" :value="title" :block="block" />
    </h2>

    <h3
      v-else-if="blockType === 'sub_header'"
      :id="blockId"
      :class="cs('notion-h notion-h2', colorClass)"
    >
      <NotionText v-if="title" :value="title" :block="block" />
    </h3>

    <h4
      v-else-if="blockType === 'sub_sub_header'"
      :id="blockId"
      :class="cs('notion-h notion-h3', colorClass)"
    >
      <NotionText v-if="title" :value="title" :block="block" />
    </h4>

    <!-- Divider -->
    <hr v-else-if="blockType === 'divider'" class="notion-hr" />

    <!-- Quote -->
    <blockquote
      v-else-if="blockType === 'quote'"
      :class="cs('notion-quote', colorClass)"
    >
      <NotionText v-if="title" :value="title" :block="block" />
      <template v-if="hasChildren">
        <NotionBlock
          v-for="childId in children"
          :key="childId"
          :block="getChildBlock(childId)!"
          :level="(level || 0) + 1"
        />
      </template>
    </blockquote>

    <!-- Callout -->
    <div
      v-else-if="blockType === 'callout'"
      :class="cs('notion-callout', colorClass)"
    >
      <div v-if="(block as any).format?.page_icon" class="notion-callout-icon">
        {{ (block as any).format.page_icon }}
      </div>
      <div class="notion-callout-text">
        <NotionText v-if="title" :value="title" :block="block" />
        <template v-if="hasChildren">
          <NotionBlock
            v-for="childId in children"
            :key="childId"
            :block="getChildBlock(childId)!"
            :level="(level || 0) + 1"
          />
        </template>
      </div>
    </div>

    <!-- Toggle -->
    <details
      v-else-if="blockType === 'toggle'"
      :class="cs('notion-toggle', colorClass)"
      :open="isToggleOpen"
    >
      <summary @click.prevent="isToggleOpen = !isToggleOpen">
        <NotionText v-if="title" :value="title" :block="block" />
      </summary>
      <div v-if="hasChildren && isToggleOpen" class="notion-toggle-content">
        <NotionBlock
          v-for="childId in children"
          :key="childId"
          :block="getChildBlock(childId)!"
          :level="(level || 0) + 1"
        />
      </div>
    </details>

    <!-- Bulleted list -->
    <ul
      v-else-if="blockType === 'bulleted_list'"
      class="notion-list notion-list-disc"
    >
      <li :class="colorClass">
        <NotionText v-if="title" :value="title" :block="block" />
        <template v-if="hasChildren">
          <NotionBlock
            v-for="childId in children"
            :key="childId"
            :block="getChildBlock(childId)!"
            :level="(level || 0) + 1"
          />
        </template>
      </li>
    </ul>

    <!-- Numbered list -->
    <ol
      v-else-if="blockType === 'numbered_list'"
      class="notion-list notion-list-numbered"
      :style="{ listStyleType: numberedListStyle }"
    >
      <li :class="colorClass">
        <NotionText v-if="title" :value="title" :block="block" />
        <template v-if="hasChildren">
          <NotionBlock
            v-for="childId in children"
            :key="childId"
            :block="getChildBlock(childId)!"
            :level="(level || 0) + 1"
          />
        </template>
      </li>
    </ol>

    <!-- To-do -->
    <div
      v-else-if="blockType === 'to_do'"
      :class="cs('notion-to-do', colorClass)"
    >
      <div class="notion-to-do-item">
        <input
          type="checkbox"
          :checked="(block as any).properties?.checked?.[0]?.[0] === 'Yes'"
          disabled
          class="notion-to-do-checkbox"
        />
        <span :class="{ 'notion-to-do-checked': (block as any).properties?.checked?.[0]?.[0] === 'Yes' }">
          <NotionText v-if="title" :value="title" :block="block" />
        </span>
      </div>
      <template v-if="hasChildren">
        <NotionBlock
          v-for="childId in children"
          :key="childId"
          :block="getChildBlock(childId)!"
          :level="(level || 0) + 1"
        />
      </template>
    </div>

    <!-- Column list -->
    <div
      v-else-if="blockType === 'column_list'"
      class="notion-row"
    >
      <NotionBlock
        v-for="childId in children"
        :key="childId"
        :block="getChildBlock(childId)!"
        :level="(level || 0) + 1"
      />
    </div>

    <!-- Column -->
    <div
      v-else-if="blockType === 'column'"
      class="notion-column"
      :style="{
        width: `calc((100% - ${(children.length - 1) * 46}px) * ${(block as any).format?.column_ratio || (1 / children.length)})`
      }"
    >
      <template v-if="hasChildren">
        <NotionBlock
          v-for="childId in children"
          :key="childId"
          :block="getChildBlock(childId)!"
          :level="(level || 0) + 1"
        />
      </template>
    </div>

    <!-- Code block -->
    <div
      v-else-if="blockType === 'code'"
      class="notion-code"
    >
      <pre>
        <code :class="`language-${(block as any).properties?.language?.[0]?.[0] || 'plain'}`">{{ title?.[0]?.[0] || '' }}</code>
      </pre>
      <div v-if="(block as any).properties?.caption" class="notion-code-caption">
        <NotionText :value="(block as any).properties.caption" :block="block" />
      </div>
    </div>

    <!-- Image, Video, Embed, Bookmark -->
    <NotionAsset
      v-else-if="['image', 'video', 'embed', 'bookmark'].includes(blockType || '')"
      :block="block"
    />

    <!-- Page link -->
    <a
      v-else-if="blockType === 'page'"
      :href="mapPageUrl(blockId || '')"
      class="notion-page-link"
    >
      <span v-if="(block as any).format?.page_icon" class="notion-page-icon">
        {{ (block as any).format.page_icon }}
      </span>
      <span class="notion-page-title">
        <NotionText v-if="title" :value="title" :block="block" />
      </span>
    </a>

    <!-- Fallback for unknown block types -->
    <div v-else class="notion-unknown-block">
      <!-- Unknown block type: {{ blockType }} -->
    </div>
  </div>
</template>
