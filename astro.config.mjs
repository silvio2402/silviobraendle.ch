import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import prefetch from '@astrojs/prefetch'

import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    prefetch({
      // Only prefetch links with an href that begins with `/`
      selector: "a[href^='/']",
    }),
    sitemap(),
  ],
  markdown: {
    // Can be 'shiki' (default), 'prism' or false to disable highlighting
    syntaxHighlight: 'prism',
  },
})
