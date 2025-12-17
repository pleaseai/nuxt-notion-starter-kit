# Nuxt Notion Starter Kit

A Nuxt 4 starter kit for building websites powered by Notion as a CMS.

## Overview

This project is a Nuxt-based implementation inspired by [nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit). It provides:

- **@pleaseai/notion-vue**: A Vue 3 component library for rendering Notion content
- **apps/web**: A Nuxt 4 application that uses the Notion renderer

## Features

- 🎨 Full Notion block support (text, headers, lists, images, videos, code, etc.)
- 🌙 Dark mode support
- 📱 Responsive design
- ⚡ Hybrid SSG + ISR rendering with Nuxt
- 🔍 Search functionality
- 🎯 SEO optimized

## Project Structure

```
├── packages/
│   └── notion-vue/          # Vue 3 Notion renderer package
│       ├── src/
│       │   ├── components/  # Vue components
│       │   ├── composables/ # Vue composables
│       │   ├── types/       # TypeScript types
│       │   ├── utils.ts     # Utility functions
│       │   └── styles.css   # Notion styles
│       └── package.json
│
└── apps/
    └── web/                 # Nuxt 4 application
        ├── app/
        │   ├── pages/       # Nuxt pages
        │   ├── layouts/     # Nuxt layouts
        │   └── assets/      # CSS and assets
        ├── server/
        │   ├── api/         # API routes
        │   └── utils/       # Server utilities
        ├── site.config.ts   # Site configuration
        └── nuxt.config.ts   # Nuxt configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
pnpm install
```

### Configuration

1. Copy the example configuration:
   ```bash
   cp apps/web/site.config.ts.example apps/web/site.config.ts
   ```

2. Update `site.config.ts` with your Notion page ID and site details:
   ```typescript
   const config: SiteConfig = {
     rootNotionPageId: 'your-notion-page-id',
     name: 'Your Site Name',
     domain: 'your-domain.com',
     author: 'Your Name',
     description: 'Your site description',
     // ...
   }
   ```

3. (Optional) Set your Notion API token as an environment variable:
   ```bash
   export NOTION_TOKEN=your_notion_integration_token
   ```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm --filter @pleaseai/nuxt-notion-web preview
```

## Supported Block Types

The Notion renderer supports the following block types:

- Text blocks (paragraph, headings H1-H3)
- Lists (bulleted, numbered, to-do)
- Quote and callout
- Divider
- Toggle
- Columns
- Code blocks
- Images
- Videos (including YouTube embeds)
- Bookmarks
- Embeds
- Page links
- Collection views (simple table rendering)

## Customization

### Styling

The package includes default Notion styles from `@pleaseai/notion-vue/styles.css`. You can customize the appearance by:

1. Overriding CSS variables in your global CSS
2. Adding custom styles that target `.notion-*` classes

### Components

You can provide custom component overrides through the `components` prop on `NotionRenderer`:

```vue
<NotionRenderer
  :record-map="recordMap"
  :components="{
    Code: MyCustomCodeBlock,
    Image: MyCustomImage,
  }"
/>
```

## License

MIT
