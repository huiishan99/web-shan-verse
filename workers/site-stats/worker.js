const COUNTER_KEYS = {
  views: 'counter:views',
  visitors: 'counter:visitors',
};

const ONLINE_CACHE_KEY = 'cache:online';
const ACTIVE_TTL_SECONDS = 300;
const ONLINE_CACHE_TTL_SECONDS = 180;
const DEFAULT_ALLOWED_ORIGINS = [
  'https://shan-verse.com',
  'https://www.shan-verse.com',
  'http://127.0.0.1:4321',
  'http://localhost:4321',
];

function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function corsHeaders(request, env) {
  const requestOrigin = request.headers.get('Origin') || '';
  const allowedOrigins = (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const headers = new Headers();
  if (allowedOrigins.includes(requestOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
    headers.set('Vary', 'Origin');
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getClientIp(request) {
  const forwarded = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')
    || request.headers.get('X-Real-IP')
    || '';

  return forwarded.split(',')[0].trim();
}

async function hashVisitor(ip, env) {
  const encoder = new TextEncoder();
  const salt = env.VISITOR_HASH_SALT || 'shan-verse-site-stats';
  const input = encoder.encode(`${salt}:${ip || 'unknown'}`);
  const digest = await crypto.subtle.digest('SHA-256', input);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function getCounter(kv, key) {
  const value = Number(await kv.get(key));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

async function incrementCounter(kv, key) {
  const nextValue = (await getCounter(kv, key)) + 1;
  await kv.put(key, String(nextValue));
  return nextValue;
}

async function listAllKeys(kv, prefix) {
  let cursor;
  const keys = [];

  do {
    const result = await kv.list({ prefix, cursor });
    keys.push(...result.keys);
    cursor = result.list_complete ? undefined : result.cursor;
  } while (cursor);

  return keys;
}

async function getOnlineCount(kv, minimum = 0) {
  const cachedOnline = Number(await kv.get(ONLINE_CACHE_KEY));
  if (Number.isFinite(cachedOnline) && cachedOnline >= 0) {
    return Math.max(cachedOnline, minimum);
  }

  const activeKeys = await listAllKeys(kv, 'active:');
  const onlineCount = Math.max(activeKeys.length, minimum);
  await kv.put(ONLINE_CACHE_KEY, String(onlineCount), {
    expirationTtl: ONLINE_CACHE_TTL_SECONDS,
  });

  return onlineCount;
}

async function handleStats(request, env) {
  if (!env.SITE_STATS) {
    return jsonResponse({ ok: false, error: 'SITE_STATS KV binding is missing' }, { status: 500 });
  }

  const payload = request.method === 'POST' ? await readJson(request) : {};
  const eventType = payload.event === 'heartbeat' ? 'heartbeat' : 'pageview';
  const visitorHash = await hashVisitor(getClientIp(request), env);
  const visitorKey = `visitor:${visitorHash}`;
  const activeKey = `active:${visitorHash}`;

  let views = await getCounter(env.SITE_STATS, COUNTER_KEYS.views);
  let visitors = await getCounter(env.SITE_STATS, COUNTER_KEYS.visitors);

  if (request.method === 'POST' && eventType === 'pageview') {
    views = await incrementCounter(env.SITE_STATS, COUNTER_KEYS.views);
  }

  const visitorSeen = await env.SITE_STATS.get(visitorKey);
  if (!visitorSeen) {
    await env.SITE_STATS.put(visitorKey, JSON.stringify({
      firstSeenAt: new Date().toISOString(),
    }));
    visitors = await incrementCounter(env.SITE_STATS, COUNTER_KEYS.visitors);
  }

  await env.SITE_STATS.put(activeKey, String(Date.now()), {
    expirationTtl: ACTIVE_TTL_SECONDS,
  });

  return jsonResponse({
    ok: true,
    views,
    visitors,
    online: await getOnlineCount(env.SITE_STATS, 1),
    updatedAt: new Date().toISOString(),
  });
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/api/site-stats') {
      return jsonResponse({ ok: false, error: 'Not found' }, { status: 404, headers });
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
    }

    const response = await handleStats(request, env);
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  },
};
