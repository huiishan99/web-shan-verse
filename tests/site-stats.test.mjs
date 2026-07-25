import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../workers/site-stats/worker.js';

class MemoryKv {
  values = new Map();
  puts = [];

  async get(key) {
    return this.values.get(key) ?? null;
  }

  async put(key, value, options) {
    this.values.set(key, String(value));
    this.puts.push({ key, options });
  }

  async delete(key) {
    this.values.delete(key);
  }

  async list({ prefix = '' } = {}) {
    return {
      keys: [...this.values.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true,
    };
  }
}

function createEnv(kv = new MemoryKv()) {
  return {
    SITE_STATS: kv,
    VISITOR_HASH_SALT: 'test-only-random-salt',
    ALLOWED_ORIGINS: 'https://shan-verse.com',
  };
}

function createRequest(method, body, origin = 'https://shan-verse.com') {
  return new Request('https://shan-verse.com/api/site-stats', {
    method,
    headers: {
      Origin: origin,
      'CF-Connecting-IP': '203.0.113.10',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('GET reads counters without creating a visitor or active session', async () => {
  const kv = new MemoryKv();
  const response = await worker.fetch(createRequest('GET'), createEnv(kv));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.views, 0);
  assert.equal(body.visitors, 0);
  assert.equal(body.online, 0);
  assert.equal(Number.isNaN(Date.parse(body.updatedAt)), false);
  assert.equal([...kv.values.keys()].some((key) => key.startsWith('visitor:')), false);
  assert.equal([...kv.values.keys()].some((key) => key.startsWith('active:')), false);
  assert.deepEqual(
    kv.puts.find(({ key }) => key === 'cache:online')?.options,
    { expirationTtl: 60 }
  );
});

test('GET rebuilds a missing online cache from active visitor keys', async () => {
  const kv = new MemoryKv();
  kv.values.set('active:visitor-a', String(Date.now()));

  const response = await worker.fetch(createRequest('GET'), createEnv(kv));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.online, 1);
  assert.equal(await kv.get('cache:online'), '1');
});

test('pageviews increment once while heartbeats only refresh presence', async () => {
  const kv = new MemoryKv();
  const env = createEnv(kv);

  const pageview = await worker.fetch(
    createRequest('POST', { event: 'pageview', path: '/', title: 'Home' }),
    env
  );
  const pageviewBody = await pageview.json();

  assert.equal(pageview.status, 200);
  assert.equal(pageviewBody.views, 1);
  assert.equal(pageviewBody.visitors, 1);
  assert.equal(pageviewBody.online, 1);

  const heartbeat = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', path: '/', title: 'Home' }),
    env
  );
  const heartbeatBody = await heartbeat.json();

  assert.equal(heartbeat.status, 200);
  assert.equal(heartbeatBody.views, 1);
  assert.equal(heartbeatBody.visitors, 1);
  assert.equal(heartbeatBody.online, 1);
});

test('invalid events and disallowed origins cannot mutate counters', async () => {
  const kv = new MemoryKv();
  const env = createEnv(kv);

  const invalidEvent = await worker.fetch(
    createRequest('POST', { event: 'unknown' }),
    env
  );
  const disallowedOrigin = await worker.fetch(
    createRequest('POST', { event: 'pageview' }, 'https://example.com'),
    env
  );

  assert.equal(invalidEvent.status, 400);
  assert.equal(disallowedOrigin.status, 403);
  assert.equal(await kv.get('counter:views'), null);
  assert.equal(await kv.get('counter:visitors'), null);
});

test('writes fail closed when the visitor hash salt is missing', async () => {
  const env = createEnv();
  delete env.VISITOR_HASH_SALT;
  const originalConsoleError = console.error;
  console.error = () => {};
  let response;
  try {
    response = await worker.fetch(
      createRequest('POST', { event: 'pageview' }),
      env
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'Stats service unavailable',
  });
});
