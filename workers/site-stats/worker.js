const COUNTER_KEYS = {
  views: 'counter:views',
  visitors: 'counter:visitors',
};
const INITIALIZED_KEY = 'meta:initialized';
const ACTIVE_PREFIX = 'active:';
const ACTIVE_BROWSER_PREFIX = `${ACTIVE_PREFIX}browser:`;
const ACTIVE_WINDOW_MS = 300_000;
const CLIENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

async function hashIdentity(identity, env) {
  if (!env.VISITOR_HASH_SALT) {
    throw new Error('VISITOR_HASH_SALT is missing');
  }

  const input = new TextEncoder().encode(`${env.VISITOR_HASH_SALT}:${identity}`);
  const digest = await crypto.subtle.digest('SHA-256', input);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function toCounter(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

async function getLegacyCounters(env) {
  if (!env.SITE_STATS) return { views: 0, visitors: 0 };

  const [views, visitors] = await Promise.all([
    env.SITE_STATS.get(COUNTER_KEYS.views),
    env.SITE_STATS.get(COUNTER_KEYS.visitors),
  ]);
  return { views: toCounter(views), visitors: toCounter(visitors) };
}

async function requestCounter(env, payload) {
  if (!env.SITE_STATS_COUNTER) {
    throw new Error('SITE_STATS_COUNTER Durable Object binding is missing');
  }

  const id = env.SITE_STATS_COUNTER.idFromName('global');
  const stub = env.SITE_STATS_COUNTER.get(id);
  return stub.fetch(new Request('https://site-stats.internal/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
}

export class SiteStatsCounter {
  constructor(state, env = {}) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const payload = await readJson(request);
    if (!payload || !['read', 'pageview', 'heartbeat'].includes(payload.action)) {
      return jsonResponse({ ok: false, error: 'Invalid counter action' }, { status: 400 });
    }

    return this.state.storage.transaction(async (storage) => {
      let views = toCounter(await storage.get(COUNTER_KEYS.views));
      let visitors = toCounter(await storage.get(COUNTER_KEYS.visitors));

      if (!(await storage.get(INITIALIZED_KEY))) {
        const legacy = await getLegacyCounters(this.env);
        views = Math.max(views, legacy.views);
        visitors = Math.max(visitors, legacy.visitors);
        await storage.put(COUNTER_KEYS.views, views);
        await storage.put(COUNTER_KEYS.visitors, visitors);
        await storage.put(INITIALIZED_KEY, true);
      }

      const now = Date.now();
      if (payload.action !== 'read') {
        if (!payload.visitorHash) {
          return jsonResponse({ ok: false, error: 'Visitor hash is required' }, { status: 400 });
        }

        if (payload.action === 'pageview') {
          views += 1;
          await storage.put(COUNTER_KEYS.views, views);
        }

        const visitorKey = `visitor:${payload.visitorHash}`;
        if ((await storage.get(visitorKey)) === undefined) {
          const legacyVisitor = this.env.SITE_STATS
            ? await this.env.SITE_STATS.get(visitorKey)
            : null;
          if (legacyVisitor === null) {
            visitors += 1;
            await storage.put(COUNTER_KEYS.visitors, visitors);
          }
          await storage.put(visitorKey, now);
        }
        if (payload.browserHash) {
          await storage.put(`${ACTIVE_BROWSER_PREFIX}${payload.browserHash}`, {
            lastActiveAt: now,
            visitorHash: payload.visitorHash,
          });
        } else {
          await storage.put(`${ACTIVE_PREFIX}${payload.visitorHash}`, now);
        }
      }

      const activeVisitors = await storage.list({ prefix: ACTIVE_PREFIX });
      const representedVisitorHashes = new Set();
      const legacyVisitorHashes = new Set();
      let onlineBrowsers = 0;
      for (const [key, entry] of activeVisitors) {
        const isBrowser = key.startsWith(ACTIVE_BROWSER_PREFIX);
        const lastActiveAt = isBrowser ? entry?.lastActiveAt : entry;
        if (now - toCounter(lastActiveAt) > ACTIVE_WINDOW_MS) {
          await storage.delete(key);
        } else if (isBrowser) {
          onlineBrowsers += 1;
          representedVisitorHashes.add(entry.visitorHash);
        } else {
          legacyVisitorHashes.add(key.slice(ACTIVE_PREFIX.length));
        }
      }
      let online = onlineBrowsers;
      for (const visitorHash of legacyVisitorHashes) {
        if (!representedVisitorHashes.has(visitorHash)) online += 1;
      }

      return jsonResponse({
        ok: true,
        views,
        visitors,
        online,
        updatedAt: new Date(now).toISOString(),
      });
    });
  }
}

async function handleStats(request, env) {
  if (request.method === 'GET') {
    return requestCounter(env, { action: 'read' });
  }

  const payload = await readJson(request);
  if (!payload || !['pageview', 'heartbeat'].includes(payload.event)) {
    return jsonResponse({ ok: false, error: 'Invalid stats event' }, { status: 400 });
  }

  const hasClientId = Object.hasOwn(payload, 'clientId');
  if (hasClientId && (
    typeof payload.clientId !== 'string'
    || payload.clientId.length !== 36
    || !CLIENT_ID_PATTERN.test(payload.clientId)
  )) {
    return jsonResponse({ ok: false, error: 'Invalid client ID' }, { status: 400 });
  }

  const visitorHash = await hashIdentity(getClientIp(request) || 'unknown', env);
  const browserHash = hasClientId
    ? await hashIdentity(`browser:${payload.clientId.toLowerCase()}`, env)
    : undefined;
  return requestCounter(env, { action: payload.event, visitorHash, browserHash });
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

    // Durable Object fetch responses have immutable headers; clone before adding CORS.
    const finalResponse = new Response(response.body, response);
    headers.forEach((value, key) => finalResponse.headers.set(key, value));
    return finalResponse;
  },
};
