import type { InjectionKey } from 'vue'
import type { NotionContext } from '../types'
import { inject, provide } from 'vue'

const NotionContextKey: InjectionKey<NotionContext> = Symbol('NotionContext')

export function provideNotionContext(context: NotionContext): void {
  provide(NotionContextKey, context)
}

export function useNotionContext(): NotionContext {
  const context = inject(NotionContextKey)
  if (!context) {
    throw new Error('useNotionContext must be used within a NotionRenderer')
  }
  return context
}
