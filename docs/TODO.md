# TODO - Unimplemented Features

Quick reference for features not yet implemented in nuxt-notion-starter-kit.

## High Priority (COMPLETED)

### Layout Components
- [x] **Navigation Header** - Site navigation with breadcrumbs
  - Implemented: `packages/notion-nuxt-layer/app/components/NotionHeader.vue`
- [x] **Footer** - Site footer with social links
  - Implemented: `packages/notion-nuxt-layer/app/components/NotionFooter.vue`
- [x] **Search Dialog** - In-page search UI
  - Implemented: `packages/notion-nuxt-layer/app/components/SearchDialog.vue`

### Error Pages
- [x] **404 Page** - Not found page
  - Implemented: `packages/notion-nuxt-layer/app/pages/404.vue`
- [x] **Error Page** - Generic error display
  - Implemented: `packages/notion-nuxt-layer/app/error.vue`

### Code Enhancement
- [x] **Syntax Highlighting** - Shiki integration
  - Implemented: `packages/notion-vue/src/components/NotionCode.vue`

### SEO
- [x] **useNotionSeo Composable** - Complete meta tag management
  - Implemented: `packages/notion-nuxt-layer/app/composables/useNotionSeo.ts`

---

## Medium Priority

### Collection Views
- [x] **Gallery View** - Grid layout with cover images
  - Implemented: `packages/notion-vue/src/components/collection/CollectionViewGallery.vue`
- [x] **Board View** - Kanban-style view
  - Implemented: `packages/notion-vue/src/components/collection/CollectionViewBoard.vue`
- [x] **List View** - Simplified list layout
  - Implemented: `packages/notion-vue/src/components/collection/CollectionViewList.vue`

### Components
- [x] **Page Aside (TOC)** - Table of contents sidebar
  - Implemented: `packages/notion-vue/src/components/NotionTOC.vue`
- [ ] **Loading States** - Page loading components
  - Ref: `ref/nextjs-notion-starter-kit/components/Loading.tsx`
  - Ref: `ref/nextjs-notion-starter-kit/components/LoadingIcon.tsx`
- [ ] **Full Image Viewer** - Lightbox for images
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/components/lazy-image-full.tsx`
- [ ] **Modal System** - Modal/dialog infrastructure
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/modal.tsx`

### Third-Party Integrations
- [ ] **Math Equations (KaTeX)** - Render LaTeX math
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/equation.tsx`
- [ ] **Tweet Embedding** - Twitter/X embeds
  - Ref: `ref/nextjs-notion-starter-kit/lib/get-tweets.ts`

### Utilities
- [ ] **Database/Cache Layer** - Response caching
  - Ref: `ref/nextjs-notion-starter-kit/lib/db.ts`
- [ ] **Access Control (ACL)** - Page visibility control
  - Ref: `ref/nextjs-notion-starter-kit/lib/acl.ts`

### SEO
- [ ] **Social Image Generation** - OG image generation
  - Ref: `ref/nextjs-notion-starter-kit/lib/get-social-image-url.ts`
- [ ] **XML Sitemap** - SEO sitemap
  - Ref: `ref/nextjs-notion-starter-kit/lib/get-site-map.ts`

---

## Low Priority

### Collection Views
- [ ] **Calendar View** - Date-based view
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/collection-view-calendar.tsx`

### Components
- [ ] **Page Actions** - Share/edit buttons
  - Ref: `ref/nextjs-notion-starter-kit/components/PageActions.tsx`
- [ ] **Social Links** - Social media buttons
  - Ref: `ref/nextjs-notion-starter-kit/components/PageSocial.tsx`
- [ ] **Mention Preview Card** - Rich link previews
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/components/mention-preview-card.tsx`
- [ ] **Synced Blocks** - Synced block rendering
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/components/sync-pointer-block.tsx`

### Third-Party Integrations
- [ ] **PDF Viewer** - In-page PDF viewing
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/pdf.tsx`
- [ ] **Formula Evaluation** - Calculate database formulas
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/eval-formula.ts`

### Utilities
- [ ] **Preview Images** - Blur placeholder images
  - Ref: `ref/nextjs-notion-starter-kit/lib/preview-images.ts`
- [ ] **oEmbed Integration** - Rich embed metadata
  - Ref: `ref/nextjs-notion-starter-kit/lib/oembed.ts`
- [ ] **Canonical URLs** - URL canonicalization
  - Ref: `ref/nextjs-notion-starter-kit/lib/get-canonical-page-id.ts`

---

## Already Implemented

### Core Components
- [x] NotionRenderer - Main page renderer
- [x] NotionBlock - All basic block types
- [x] NotionText - All text decorations
- [x] NotionAsset - Image, Video, Embed, Bookmark
- [x] NotionCollection - Table view (MVP) + Gallery view + Board view + List view
- [x] NotionCode - Syntax highlighting with Shiki
- [x] CollectionViewGallery - Gallery view with cover images and grouping
- [x] CollectionViewBoard - Board (Kanban) view with columns
- [x] CollectionViewList - List view with title and properties

### Layout Components
- [x] NotionHeader - Site navigation header
- [x] NotionFooter - Site footer with social links
- [x] SearchDialog - In-page search UI
- [x] Default layout - Header + Content + Footer

### Error Handling
- [x] 404 Page - Not found page
- [x] Error Page - Generic error display

### APIs
- [x] Notion page fetching
- [x] Notion search

### SEO
- [x] useNotionSeo - Complete meta tag composable

### Configuration
- [x] Site configuration
- [x] Color mode (dark/light)
- [x] ISR caching
- [x] Custom URL mapping

### Styling
- [x] Full CSS styles with CSS variables
- [x] Dark mode support
- [x] Responsive design
