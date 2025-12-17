# TODO - Unimplemented Features

Quick reference for features not yet implemented in nuxt-notion-starter-kit.

## High Priority

### Layout Components
- [ ] **Navigation Header** - Site navigation with breadcrumbs
  - Ref: `ref/nextjs-notion-starter-kit/components/NotionPageHeader.tsx`
- [ ] **Footer** - Site footer with social links
  - Ref: `ref/nextjs-notion-starter-kit/components/Footer.tsx`
- [ ] **Search Dialog** - In-page search UI
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/components/search-dialog.tsx`

### Error Pages
- [ ] **404 Page** - Not found page
  - Ref: `ref/nextjs-notion-starter-kit/components/Page404.tsx`
- [ ] **Error Page** - Generic error display
  - Ref: `ref/nextjs-notion-starter-kit/components/ErrorPage.tsx`

### Code Enhancement
- [ ] **Syntax Highlighting** - Prism.js or Shiki integration
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/code.tsx`

### SEO
- [ ] **PageHead Component** - Complete meta tag management
  - Ref: `ref/nextjs-notion-starter-kit/components/PageHead.tsx`

---

## Medium Priority

### Collection Views
- [ ] **Gallery View** - Grid layout with cover images
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/collection-view-gallery.tsx`
- [ ] **Board View** - Kanban-style view
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/collection-view-board.tsx`
- [ ] **List View** - Simplified list layout
  - Ref: `ref/react-notion-x/packages/react-notion-x/src/third-party/collection-view-list.tsx`

### Components
- [ ] **Page Aside (TOC)** - Table of contents sidebar
  - Ref: `ref/nextjs-notion-starter-kit/components/PageAside.tsx`
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
- [x] NotionCollection - Table view (MVP)

### APIs
- [x] Notion page fetching
- [x] Notion search

### Configuration
- [x] Site configuration
- [x] Color mode (dark/light)
- [x] ISR caching
- [x] Custom URL mapping

### Styling
- [x] Full CSS styles with CSS variables
- [x] Dark mode support
- [x] Responsive design
