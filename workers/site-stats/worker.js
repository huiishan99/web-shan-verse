const COUNTER_KEYS = {
  views: 'counter:views',
  visitors: 'counter:visitors',
};

const ONLINE_CACHE_KEY = 'cache:online';
const ACTIVE_TTL_SECONDS = 300;
const ACTIVE_REFRESH_INTERVAL_MS = 240000;
const ONLINE_CACHE_TTL_SECONDS = 60;
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

function getAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
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
  const requestOrigin = request.headers.get('Origin') || '';
  return getAllowedOrigins(env).includes(requestOrigin);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
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
  if (!env.VISITOR_HASH_SALT) {
    throw new Error('VISITOR_HASH_SALT is missing');
  }

  const salt = env.VISITOR_HASH_SALT;
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

async function incrementCounter(kv, key, currentValue) {
  const baseValue = Number.isFinite(currentValue) && currentValue >= 0
    ? currentValue
    : await getCounter(kv, key);
  const nextValue = baseValue + 1;
  await kv.put(key, String(nextValue));
  return nextValue;
}

async function refreshActiveVisitor(kv, key) {
  const now = Date.now();
  const lastActiveAt = Number(await kv.get(key));
  if (Number.isFinite(lastActiveAt) && now - lastActiveAt < ACTIVE_REFRESH_INTERVAL_MS) {
    return false;
  }

  await kv.put(key, String(now), {
    expirationTtl: ACTIVE_TTL_SECONDS,
  });
  await kv.delete(ONLINE_CACHE_KEY);
  return true;
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
  const cachedValue = await kv.get(ONLINE_CACHE_KEY);
  if (cachedValue !== null) {
    const cachedOnline = Number(cachedValue);
    if (Number.isFinite(cachedOnline) && cachedOnline >= 0) {
      return Math.max(cachedOnline, minimum);
    }
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

  let views = await getCounter(env.SITE_STATS, COUNTER_KEYS.views);
  let visitors = await getCounter(env.SITE_STATS, COUNTER_KEYS.visitors);

  if (request.method === 'GET') {
    return jsonResponse({
      ok: true,
      views,
      visitors,
      online: await getOnlineCount(env.SITE_STATS),
      updatedAt: new Date().toISOString(),
    });
  }

  const payload = await readJson(request);
  if (!payload || !['pageview', 'heartbeat'].includes(payload.event)) {
    return jsonResponse({ ok: false, error: 'Invalid stats event' }, { status: 400 });
  }

  const visitorHash = await hashVisitor(getClientIp(request), env);
  const visitorKey = `visitor:${visitorHash}`;
  const activeKey = `active:${visitorHash}`;

  if (payload.event === 'pageview') {
    views = await incrementCounter(env.SITE_STATS, COUNTER_KEYS.views, views);
  }

  const visitorSeen = await env.SITE_STATS.get(visitorKey);
  if (!visitorSeen) {
    await env.SITE_STATS.put(visitorKey, JSON.stringify({
      firstSeenAt: new Date().toISOString(),
    }));
    visitors = await incrementCounter(env.SITE_STATS, COUNTER_KEYS.visitors, visitors);
  }

  await refreshActiveVisitor(env.SITE_STATS, activeKey);

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

    if (request.method === 'POST' && !isAllowedWriteOrigin(request, env)) {
      return jsonResponse({ ok: false, error: 'Origin not allowed' }, { status: 403, headers });
    }

    let response;
    try {
      response = await handleStats(request, env);
    } catch (error) {
      console.error('Site stats request failed:', error);
      response = jsonResponse({ ok: false, error: 'Stats service unavailable' }, { status: 500 });
    }

    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  },
};
