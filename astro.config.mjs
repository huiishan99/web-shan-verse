import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeBlogImages from './src/utils/rehype-blog-images.mjs';

export default defineConfig({
  site: 'https://shan-verse.com',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeBlogImages],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
