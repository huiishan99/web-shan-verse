import type { APIRoute } from 'astro';
import {
  getBlogCommentThreadKey,
  getBlogPosts,
  isBlogCommentsEnabled,
} from '../utils/blog';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getBlogPosts();
  const threads = [...new Set(
    posts
      .filter((post) => post.data.draft !== true && isBlogCommentsEnabled(post))
      .map(getBlogCommentThreadKey)
  )].sort();

  return new Response(JSON.stringify({ threads }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
