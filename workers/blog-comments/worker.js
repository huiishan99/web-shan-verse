const DEFAULT_ALLOWED_ORIGINS = [
  'https://shan-verse.com',
  'https://www.shan-verse.com',
  'http://127.0.0.1:4321',
  'http://localhost:4321',
];
const DEFAULT_ALLOWED_THREADS = ['happiness-is-not-the-end'];
const DEFAULT_EXPECTED_HOSTNAMES = [
  'shan-verse.com',
  'www.shan-verse.com',
  '127.0.0.1',
  'localhost',
];
const COMMENT_LIMIT = 100;
const MAX_NAME_LENGTH = 40;
const MAX_BODY_LENGTH = 2_000;
const MAX_LINKS = 3;
const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;

function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function parseList(value, fallback) {
  return (value || fallback.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAllowedOrigins(env) {
  return parseList(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);
}

function getAllowedThreads(env) {
  return parseList(env.ALLOWED_COMMENT_THREADS, DEFAULT_ALLOWED_THREADS);
}

function getExpectedHostnames(env) {
  return parseList(env.TURNSTILE_EXPECTED_HOSTNAMES, DEFAULT_EXPECTED_HOSTNAMES);
}

function corsHeaders(request, env) {
  const requestOrigin = request.headers.get('Origin') || '';
  const headers = new Headers();
  if (getAllowedOrigins(env).includes(requestOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}

function isAllowedWriteOrigin(request, env) {
  return getAllowedOrigins(env).includes(request.headers.get('Origin') || '');
}

function getClientIp(request) {
  const value = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')
    || request.headers.get('X-Real-IP')
    || '';
  return value.split(',')[0].trim();
}

function normalizeText(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').replace(/\r\n?/g, '\n').trim()
    : '';
}

function codePointLength(value) {
  return [...value].length;
}

function isValidThreadKey(value) {
  return /^[a-z0-9][a-z0-9-]{0,119}$/.test(value);
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 10_000) return null;

  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function hashClient(ip, env) {
  if (!env.COMMENT_HASH_SALT) {
    throw new Error('COMMENT_HASH_SALT is missing');
  }
  const input = new TextEncoder().encode(`${env.COMMENT_HASH_SALT}:${ip || 'unknown'}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyTurnstile(token, request, env, fetchImpl) {
  if (!env.TURNSTILE_SECRET_KEY) {
    throw new Error('TURNSTILE_SECRET_KEY is missing');
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const remoteIp = getClientIp(request);
  if (remoteIp) body.set('remoteip', remoteIp);

  const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  if (!response.ok) return false;

  const result = await response.json();
  return result.success === true && getExpectedHostnames(env).includes(result.hostname);
}

function publicComment(row) {
  return {
    id: row.id,
    displayName: row.display_name,
    body: row.body,
    locale: row.locale,
    createdAt: row.created_at,
  };
}

async function listComments(threadKey, env) {
  const result = await env.COMMENTS_DB.prepare(`
    SELECT id, display_name, body, locale, created_at
    FROM comments
    WHERE thread_key = ?1
    ORDER BY created_at ASC, id ASC
    LIMIT ?2
  `).bind(threadKey, COMMENT_LIMIT).all();

  return (result.results || []).map(publicComment);
}

function validateComment(payload, env) {
  if (!payload || typeof payload !== 'object') {
    return { error: 'invalid_request' };
  }

  const threadKey = normalizeText(payload.threadKey);
  const displayName = normalizeText(payload.displayName);
  const body = normalizeText(payload.body);
  const locale = normalizeText(payload.locale);
  const turnstileToken = normalizeText(payload.turnstileToken);
  const website = normalizeText(payload.website);

  if (website) return { honeypot: true };
  if (!isValidThreadKey(threadKey) || !getAllowedThreads(env).includes(threadKey)) {
    return { error: 'thread_not_allowed' };
  }
  if (!displayName || codePointLength(displayName) > MAX_NAME_LENGTH) {
    return { error: 'invalid_name' };
  }
  if (!body || codePointLength(body) > MAX_BODY_LENGTH) {
    return { error: 'invalid_body' };
  }
  if ((body.match(/https?:\/\//gi) || []).length > MAX_LINKS) {
    return { error: 'too_many_links' };
  }
  if (!['en', 'zh', 'ja'].includes(locale)) {
    return { error: 'invalid_locale' };
  }
  if (!turnstileToken) {
    return { error: 'turnstile_required' };
  }

  return { threadKey, displayName, body, locale, turnstileToken };
}

async function createComment(request, env, fetchImpl) {
  const payload = await readJson(request);
  const validated = validateComment(payload, env);
  if (validated.honeypot) {
    return jsonResponse({ ok: true, comment: null }, { status: 201 });
  }
  if (validated.error) {
    return jsonResponse({ ok: false, error: validated.error }, { status: 400 });
  }

  const turnstileValid = await verifyTurnstile(
    validated.turnstileToken,
    request,
    env,
    fetchImpl
  );
  if (!turnstileValid) {
    return jsonResponse({ ok: false, error: 'turnstile_failed' }, { status: 400 });
  }

  const authorHash = await hashClient(getClientIp(request), env);
  const now = new Date();
  const rateLimitSince = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS).toISOString();
  const rateLimit = await env.COMMENTS_DB.prepare(`
    SELECT COUNT(*) AS count
    FROM comments
    WHERE author_hash = ?1 AND created_at >= ?2
  `).bind(authorHash, rateLimitSince).first();

  if (Number(rateLimit?.count || 0) >= RATE_LIMIT_COUNT) {
    return jsonResponse({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const comment = {
    id: crypto.randomUUID(),
    displayName: validated.displayName,
    body: validated.body,
    locale: validated.locale,
    createdAt: now.toISOString(),
  };

  await env.COMMENTS_DB.prepare(`
    INSERT INTO comments (
      id, thread_key, display_name, body, locale, author_hash, created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  `).bind(
    comment.id,
    validated.threadKey,
    comment.displayName,
    comment.body,
    comment.locale,
    authorHash,
    comment.createdAt
  ).run();

  return jsonResponse({ ok: true, comment }, { status: 201 });
}

export function createBlogCommentsWorker({ fetchImpl = fetch } = {}) {
  return {
    async fetch(request, env) {
      const headers = corsHeaders(request, env);

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
      }

      const url = new URL(request.url);
      if (url.pathname !== '/api/comments') {
        return jsonResponse({ ok: false, error: 'not_found' }, { status: 404, headers });
      }
      if (request.method !== 'GET' && request.method !== 'POST') {
        return jsonResponse({ ok: false, error: 'method_not_allowed' }, { status: 405, headers });
      }
      if (request.method === 'POST' && !isAllowedWriteOrigin(request, env)) {
        return jsonResponse({ ok: false, error: 'origin_not_allowed' }, { status: 403, headers });
      }

      let response;
      try {
        if (request.method === 'GET') {
          const threadKey = normalizeText(url.searchParams.get('threadKey'));
          if (!isValidThreadKey(threadKey) || !getAllowedThreads(env).includes(threadKey)) {
            response = jsonResponse({ ok: false, error: 'thread_not_allowed' }, { status: 400 });
          } else {
            response = jsonResponse({ ok: true, comments: await listComments(threadKey, env) });
          }
        } else {
          response = await createComment(request, env, fetchImpl);
        }
      } catch (error) {
        console.error('Blog comments request failed:', error);
        response = jsonResponse({ ok: false, error: 'service_unavailable' }, { status: 500 });
      }

      headers.forEach((value, key) => response.headers.set(key, value));
      return response;
    },
  };
}

export default createBlogCommentsWorker();
