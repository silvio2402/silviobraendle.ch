import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import prefetch from '@astrojs/prefetch'
import sitemap from '@astrojs/sitemap'

import UrlPattern from 'url-pattern'

const sitemapExclusions: Array<UrlPattern> = [new UrlPattern('/posts/:tag')]

// https://astro.build/config
export default defineConfig({
  integrations: [
    preact(),
    prefetch({
      // Only prefetch links with an href that begins with `/`
      selector: "a[href^='/']",
    }),
    sitemap({
      filter: (page) =>
        sitemapExclusions.every(
          (sitemapExclusion) => !sitemapExclusion.match(new URL(page).pathname)
        ),
    }),
  ],
  markdown: {
    // Can be 'shiki' (default), 'prism' or false to disable highlighting
    syntaxHighlight: 'prism',
  },
  site: 'https://silviobraendle.ch',
})
