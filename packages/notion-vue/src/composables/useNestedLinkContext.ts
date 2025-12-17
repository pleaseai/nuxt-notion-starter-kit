import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/**
 * Context for nested link handling inside collection cards.
 * When inside a card, links should render as form/input to avoid invalid DOM.
 */
export interface NestedLinkContext {
  isInsideCard: boolean
}

const NestedLinkContextKey: InjectionKey<NestedLinkContext> = Symbol('NestedLinkContext')

export function provideNestedLinkContext(context: NestedLinkContext): void {
  provide(NestedLinkContextKey, context)
}

export function useNestedLinkContext(): NestedLinkContext {
  return inject(NestedLinkContextKey, { isInsideCard: false })
}
