import type { InjectionKey, Ref } from 'vue'
import { inject, provide, ref } from 'vue'

export interface ImageLightboxState {
  isOpen: Ref<boolean>
  imageUrl: Ref<string | null>
  imageAlt: Ref<string>
}

export interface ImageLightboxActions {
  open: (url: string, alt?: string) => void
  close: () => void
}

export type ImageLightboxContext = ImageLightboxState & ImageLightboxActions

const ImageLightboxKey: InjectionKey<ImageLightboxContext> = Symbol('ImageLightbox')

/**
 * Creates and provides the image lightbox context.
 * Should be called in NotionRenderer to provide lightbox state to descendants.
 */
export function provideImageLightbox(): ImageLightboxContext {
  const isOpen = ref(false)
  const imageUrl = ref<string | null>(null)
  const imageAlt = ref('')

  function open(url: string, alt = '') {
    imageUrl.value = url
    imageAlt.value = alt
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    // Delay clearing URL to allow fade-out animation
    setTimeout(() => {
      if (!isOpen.value) {
        imageUrl.value = null
        imageAlt.value = ''
      }
    }, 300)
  }

  const context: ImageLightboxContext = {
    isOpen,
    imageUrl,
    imageAlt,
    open,
    close,
  }

  provide(ImageLightboxKey, context)
  return context
}

/**
 * Injects the image lightbox context.
 * Returns null if used outside NotionRenderer (lightbox not available).
 */
export function useImageLightbox(): ImageLightboxContext | null {
  return inject(ImageLightboxKey, null)
}
