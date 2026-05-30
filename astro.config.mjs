import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeBlogImages from './src/utils/rehype-blog-images.mjs';

export default defineConfig({
  site: 'https://shan-verse.com',
  integrations: [mdx(), sitemap()],
  vite: {
    build: {
      // Three is lazy-loaded by the Journey page and isolated as its own vendor chunk.
      chunkSizeWarningLimit: 513,
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
    rehypePlugins: [rehypeBlogImages],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
