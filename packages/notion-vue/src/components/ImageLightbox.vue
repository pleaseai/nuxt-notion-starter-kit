<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useImageLightbox } from '../composables/useImageLightbox'

const lightbox = useImageLightbox()
const dialogRef = ref<HTMLElement | null>(null)

// Handle escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && lightbox?.isOpen.value) {
    lightbox.close()
  }
}

// Handle backdrop click
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    lightbox?.close()
  }
}

// Focus trap
function handleFocusTrap(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !dialogRef.value)
    return

  const focusableElements = dialogRef.value.querySelectorAll<HTMLElement>(
    'button, [href], [tabindex]:not([tabindex="-1"])',
  )
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

// Setup keyboard handlers when lightbox opens
watch(
  () => lightbox?.isOpen.value,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('keydown', handleFocusTrap)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }
    else {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keydown', handleFocusTrap)
      // Restore body scroll
      document.body.style.overflow = ''
    }
  },
)

onMounted(() => {
  if (lightbox?.isOpen.value) {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keydown', handleFocusTrap)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keydown', handleFocusTrap)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="lightbox?.isOpen.value && lightbox?.imageUrl.value"
        ref="dialogRef"
        class="notion-lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        @click="handleBackdropClick"
      >
        <div class="notion-lightbox-content">
          <img
            :src="lightbox.imageUrl.value"
            :alt="lightbox.imageAlt.value"
            class="notion-lightbox-image"
          >
        </div>

        <button
          type="button"
          class="notion-lightbox-close"
          aria-label="Close image viewer"
          @click="lightbox?.close()"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.notion-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  cursor: zoom-out;
}

.notion-lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.notion-lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.notion-lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notion-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notion-lightbox-close:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Transition animations */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.lightbox-fade-enter-active .notion-lightbox-image,
.lightbox-fade-leave-active .notion-lightbox-image {
  transition: transform 0.3s ease;
}

.lightbox-fade-enter-from .notion-lightbox-image {
  transform: scale(0.95);
}

.lightbox-fade-leave-to .notion-lightbox-image {
  transform: scale(0.95);
}
</style>
