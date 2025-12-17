# Session Summary: Nuxt Notion Starter Kit Migration

## Feature Description
Migrate `nextjs-notion-starter-kit` (Next.js 15 + React 19) to **Nuxt 4** with a custom Vue-based Notion renderer.

## Requirements Summary
- **Target Framework**: Nuxt 4
- **Rendering Strategy**: Hybrid (SSG + ISR) for optimal SEO and performance
- **Notion Renderer**: Custom Vue-based renderer (not wrapping react-notion-x)
- **Core Features to Port**:
  - Notion page rendering with all block types
  - Dark mode support
  - Navigation (default + custom)
  - Search functionality
  - RSS feed generation
  - Sitemap generation
  - SEO optimization (meta tags, Open Graph)
  - Preview images (LQIP)
  - Analytics integration (Fathom, PostHog)
  - Redis caching (optional)

## Source Project Analysis (ref/nextjs-notion-starter-kit/)

### Architecture
```
pages/
├── index.tsx          # Root Notion page (getStaticProps)
├── [pageId].tsx       # Dynamic page routing (getStaticProps + getStaticPaths)
├── 404.tsx, _error.tsx
├── api/               # Server API routes
│   ├── search-notion.ts
│   └── social-image.tsx
├── sitemap.xml.tsx, robots.txt.tsx, feed.tsx
└── _app.tsx, _document.tsx

components/
├── NotionPage.tsx     # Main page component with NotionRenderer
├── NotionPageHeader.tsx
├── Footer.tsx, PageHead.tsx, PageAside.tsx
└── ... (11 components total)

lib/
├── notion.ts          # getPage(), search() functions
├── notion-api.ts      # NotionAPI client initialization
├── config.ts          # Site configuration
├── resolve-notion-page.ts  # Page resolution logic
└── ... (18 utility files)
```

### Key Dependencies
- `notion-client` - Unofficial Notion API client
- `notion-types` - TypeScript types for Notion
- `notion-utils` - Utility functions for Notion data
- `react-notion-x` - React Notion renderer (NOT portable to Vue)

## Constraints and Limitations
1. **No Vue Notion Renderer**: Must build custom Vue renderer from scratch
2. **Block Type Coverage**: Need to implement all Notion block types manually
3. **Testing**: Original project has no tests; we should add tests

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Notion Renderer | Custom Vue | Pure Vue solution, no React dependency |
| Nuxt Version | v4 | Latest features, better DX |
| SSR Strategy | Hybrid SSG+ISR | SEO + performance balance |

## Current Phase
**Phase 2: Codebase Exploration** - Completed

## Codebase Exploration Findings

### Source Architecture Summary

**Pages Structure (Next.js)**
- `pages/index.tsx` - Root page with `getStaticProps`
- `pages/[pageId].tsx` - Dynamic routing with `getStaticPaths` + ISR
- `pages/api/search-notion.ts` - Search API endpoint
- `pages/sitemap.xml.tsx`, `robots.txt.tsx`, `feed.tsx` - Static files

**Data Layer**
- `notion-client` for Notion API (unofficial)
- Page resolution: Direct ID → URL overrides → Redis cache → Site map lookup
- Caching: pMemoize (memory) + Keyv/Redis (persistence)
- Preview images: LQIP via `lqip-modern`
- Tweets: Pre-fetched via `react-tweet/api`

**Rendering Layer (react-notion-x)**
- NotionRenderer with custom components
- Dynamic imports for Code, Collection, Equation, PDF, Modal
- Property value renderers for dates, text, timestamps
- Dark mode via localStorage + body class

### Notion Block Types (40+ types)

**Basic Text**: text, header, sub_header, sub_sub_header, quote, divider
**Lists**: bulleted_list, numbered_list, to_do
**Layout**: column_list, column, toggle, callout
**Media**: image, video, audio, file, pdf, bookmark, embed
**Third-party**: tweet, gist, figma, codepen, replit, typeform, excalidraw, maps, miro
**Code/Math**: code (Prism), equation (KaTeX)
**Database**: collection_view, collection_view_page, table, table_row
**Reference**: transclusion_container, transclusion_reference, alias
**Special**: page, table_of_contents, breadcrumb, external_object_instance

### Key Files Identified
1. `lib/notion.ts` - Core getPage() with enrichment
2. `lib/resolve-notion-page.ts` - URL resolution logic
3. `lib/config.ts` - Site configuration
4. `lib/types.ts` - TypeScript interfaces
5. `components/NotionPage.tsx` - Main rendering orchestration
6. `lib/map-page-url.ts` - URL generation
7. `lib/preview-images.ts` - LQIP generation
8. `lib/get-site-map.ts` - SSG path generation
9. `lib/db.ts` - Redis/Keyv abstraction
10. `lib/use-dark-mode.ts` - Dark mode state

## Phase 3: Clarified Requirements

### Block Types Priority (Minimal MVP)
**Include:**
- Text blocks: text, header, sub_header, sub_sub_header, quote, divider
- Lists: bulleted_list, numbered_list, to_do
- Media: image, video, bookmark
- Layout: column_list, column, toggle, callout
- Code: code (with Prism syntax highlighting)
- Page: page (sub-page links)

**Defer to later:**
- Equations (KaTeX)
- PDF viewer
- Third-party embeds (tweet, gist, figma, codepen, etc.)
- Synced blocks (transclusion)

### Database Handling
- Simple HTML table rendering only
- No view switching (gallery, board, calendar)
- Basic property types: text, number, select, date, checkbox, url

### Package Structure
- **Package name**: `@pleaseai/notion-vue`
- **Type**: Separate publishable package
- **Location**: `packages/notion-vue/` in monorepo structure

### Analytics
- Skip Fathom and PostHog integration initially
- Add as optional feature later

## Phase 4: Architecture Design (Approved)

### Project Structure
```
nuxt-notion-starter-kit/
├── pnpm-workspace.yaml
├── packages/
│   └── notion-vue/                  # @pleaseai/notion-vue
│       ├── src/
│       │   ├── NotionRenderer.vue   # Entry point
│       │   ├── components/          # Block components
│       │   ├── composables/         # useNotionContext
│       │   └── styles.css           # From react-notion-x
│       └── package.json
└── apps/
    └── web/                         # Nuxt 4 app
        ├── nuxt.config.ts
        ├── site.config.ts
        ├── app/pages/               # Vue pages
        ├── app/components/          # App components
        └── server/                  # API routes
```

### Key Architecture Decisions
| Aspect | Decision |
|--------|----------|
| Package | Monorepo with @pleaseai/notion-vue |
| Renderer | Single NotionBlock.vue with switch |
| CSS | Copy react-notion-x styles |
| Context | Vue provide/inject |
| Rendering | Nuxt 4 hybrid SSG+ISR |
| Dark Mode | @nuxtjs/color-mode |

### Estimated Scope
- @pleaseai/notion-vue: ~900 LOC
- Nuxt app: ~600 LOC
- Total: ~1500 LOC + CSS

---

# Session: Collection Gallery View

## Feature Description
Implement Gallery View for Notion collection/database blocks. This displays database items as cards in a responsive grid layout, with cover images and selected property columns.

## Requirements Summary
- Grid layout display for collection view blocks
- Cover image support (external images, file uploads, page content)
- Property column display (configurable via collection view format)
- Responsive design (adapt columns to viewport)
- Integration with existing NotionCollection.vue component

## Reference Implementation
- `ref/react-notion-x/packages/react-notion-x/src/third-party/collection-view-gallery.tsx`

## Current Phase
**Phase 2: Codebase Exploration** - Completed

## Codebase Exploration Findings

### Reference Implementation (react-notion-x)
- `collection-view-gallery.tsx`: Main gallery component (100 lines)
  - Handles grouped/ungrouped collections
  - Extracts format options: `gallery_cover`, `gallery_cover_size`, `gallery_cover_aspect`
  - Grid uses CSS Grid with `auto-fill` and `minmax()` for responsive layout

- `collection-card.tsx`: Card component (247 lines)
  - Three cover types: `page_content` (first image in page), `page_cover`, `property` (file property)
  - Cover position calculation: `(1 - page_cover_position) * 100`
  - Properties rendered from `gallery_properties` format
  - Uses `mapImageUrl` for all image URLs

### Current Implementation (notion-vue)
- `NotionCollection.vue`: Table-only view (240 lines)
  - Accesses collection via `recordMap.collection[collectionId].value`
  - Gets rows from `recordMap.collection_query[collectionId][viewId].collection_group_results.blockIds`
  - Limited to 6 columns, no view type detection
  - Uses scoped styles (needs migration to global styles for gallery)

### Context Pattern
- `useNotionContext()` provides: `recordMap`, `mapPageUrl`, `mapImageUrl`
- Types in `types/index.ts` need extension for collection card props

### CSS Requirements
Gallery-specific classes NOT in notion-vue yet:
- `.notion-gallery`, `.notion-gallery-view`, `.notion-gallery-grid`
- `.notion-gallery-grid-size-{small|medium|large}`
- `.notion-collection-card`, `.notion-collection-card-cover`
- `.notion-collection-card-body`, `.notion-collection-card-property`

### Key Files for Implementation
1. `packages/notion-vue/src/components/NotionCollection.vue` - Extend for view switching
2. `packages/notion-vue/src/types/index.ts` - Add collection card types
3. `packages/notion-vue/src/styles.css` - Add gallery CSS classes
4. New: `NotionCollectionGallery.vue` - Gallery view component
5. New: `NotionCollectionCard.vue` - Reusable card component
6. New: `NotionCollectionGroup.vue` - Grouped collection sections

## Phase 3: Clarified Requirements

### Confirmed Scope
1. **Grouping Support**: YES - implement grouped collections with expand/collapse
2. **Cover Types**: All three types
   - `page_cover` - Page banner image
   - `page_content` - First image block in page
   - `property` - File property as cover
3. **Card Links**: Always link to page (no URL property linking)

### Implementation Scope
- Responsive grid layout with CSS Grid
- Three card sizes: small, medium (default), large
- Cover aspect options: cover, contain
- Property display based on `gallery_properties` format
- Grouped collections with expandable sections

## Phase 4: Architecture Decision

### Chosen Approach: Clean Architecture (~1,055 LOC)

**Component Structure**:
```
/packages/notion-vue/src/
├── components/
│   ├── NotionCollection.vue        # Modified (orchestrator)
│   └── collection/
│       ├── CollectionViewGallery.vue   # Gallery grid
│       ├── CollectionGroup.vue         # Expandable groups
│       ├── CollectionCard.vue          # Card container
│       ├── CollectionCardCover.vue     # Cover image
│       └── CollectionProperty.vue      # Property renderer
├── composables/
│   ├── useCollectionData.ts        # Data extraction
│   ├── useCollectionGroups.ts      # Group logic
│   └── useCollectionCover.ts       # Cover URL resolution
├── styles/
│   └── collection.css              # Gallery CSS
└── types/
    └── collection.ts               # Collection types
```

**Rationale**:
- Better testability with composables
- Reusable components for future Board/List views
- Clear separation of concerns
- Each component under 300 LOC (engineering standards compliant)
