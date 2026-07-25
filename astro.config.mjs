import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeBlogImages from './src/utils/rehype-blog-images.mjs';

export default defineConfig({
  site: 'https://shan-verse.com',
  integrations: [mdx(), sitemap()],
  vite: {
    build: {
      // Three is lazy-loaded by the Journey page and isolated as its own vendor chunk.
      // The current 532 kB minified chunk is about 129 kB gzip and remains on-demand.
      chunkSizeWarningLimit: 535,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/three/')) {
              return 'three';
            }
          }
        }
      }
    }
  },
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeBlogImages],
    }),
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
