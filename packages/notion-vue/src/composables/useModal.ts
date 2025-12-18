import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UseModalOptions {
  defaultOpen?: boolean
  onClose?: () => void
}

export interface UseModalReturn {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { defaultOpen = false, onClose } = options

  const isOpen = ref(defaultOpen)

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
    onClose?.()
  }

  function toggle(): void {
    if (isOpen.value) {
      close()
    }
    else {
      open()
    }
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
