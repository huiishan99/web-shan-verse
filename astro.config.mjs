import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeBlogImages from './src/utils/rehype-blog-images.mjs';

export default defineConfig({
  site: 'https://shan-verse.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [rehypeBlogImages],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
