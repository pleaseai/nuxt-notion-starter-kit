<script setup lang="ts">
/**
 * NestedFormLink renders links as form/input when inside a collection card.
 * This avoids invalid DOM with nested <a> tags.
 *
 * When used inside a card (where the outer element is already an <a>),
 * clicking the input submits the form which navigates to the URL.
 */
import { useNestedLinkContext } from '../../composables/useNestedLinkContext'

defineProps<{
  href: string
  label?: string
}>()

const { isInsideCard } = useNestedLinkContext()
</script>

<template>
  <!-- When inside a card, render as form/input to avoid nested <a> -->
  <form
    v-if="isInsideCard"
    :action="href"
    target="_blank"
    class="nested-form-link-wrapper"
    @click.stop
  >
    <input
      type="submit"
      :value="label || href"
      class="nested-form-link notion-link"
    >
  </form>
  <!-- Otherwise render as normal link -->
  <a
    v-else
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="notion-link"
  >
    <slot>{{ label || href }}</slot>
  </a>
</template>

<style>
.nested-form-link-wrapper {
  display: inline;
}

.nested-form-link {
  /* Reset button/input styles */
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  cursor: pointer;
  /* Link-like appearance */
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 1px;
}

.nested-form-link:hover {
  color: var(--notion-blue, #2f80ed);
}
</style>
