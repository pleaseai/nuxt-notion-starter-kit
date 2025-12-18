<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  isOpen: boolean
  title?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}>(), {
  title: 'Dialog',
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const dialogRef = ref<HTMLElement | null>(null)

const ariaLabelledBy = computed(() => `notion-modal-title-${props.title?.replace(/\s+/g, '-').toLowerCase()}`)

function handleFocusTrap(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !dialogRef.value)
    return

  const focusableElements = dialogRef.value.querySelectorAll<HTMLElement>(
    'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
  )

  if (focusableElements.length === 0)
    return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault()
    lastElement?.focus()
  }
  else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault()
    firstElement?.focus()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEscape) {
    emit('close')
  }
  handleFocusTrap(e)
}

function handleBackdropClick(e: MouseEvent) {
  if (props.closeOnBackdrop && e.target === e.currentTarget) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown)
    }
    else {
      document.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="notion-modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="ariaLabelledBy"
      @click="handleBackdropClick"
    >
      <div ref="dialogRef" class="notion-modal">
        <span :id="ariaLabelledBy" class="sr-only">{{ title }}</span>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.notion-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  background: var(--overlay-background, rgba(15, 15, 15, 0.6));
  backdrop-filter: blur(2px);
}

.notion-modal {
  width: 100%;
  max-width: 600px;
  margin: 0 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

@media (max-width: 640px) {
  .notion-modal-overlay {
    padding-top: 5vh;
  }
}
</style>
