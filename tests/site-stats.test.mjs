import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { SiteStatsCounter } from '../workers/site-stats/worker.js';

class MemoryKv {
  values = new Map();

  async get(key) {
    return this.values.get(key) ?? null;
  }
}

class MemoryDurableStorage {
  values = new Map();
  transactionQueue = Promise.resolve();

  async get(key) {
    return this.values.get(key);
  }

  async put(key, value) {
    this.values.set(key, value);
  }

  async delete(key) {
    this.values.delete(key);
  }

  async list({ prefix = '' } = {}) {
    return new Map(
      [...this.values.entries()].filter(([key]) => key.startsWith(prefix))
    );
  }

  transaction(callback) {
    const result = this.transactionQueue.then(() => callback(this));
    this.transactionQueue = result.catch(() => {});
    return result;
  }
}

class MemoryDurableObjectNamespace {
  storage = new MemoryDurableStorage();
  object = new SiteStatsCounter({ storage: this.storage });

  idFromName(name) {
    return name;
  }

  get() {
    return {
      fetch: (request) => this.object.fetch(request),
    };
  }
}

function createEnv({ kv = new MemoryKv(), namespace = new MemoryDurableObjectNamespace() } = {}) {
  return {
    SITE_STATS: kv,
    SITE_STATS_COUNTER: namespace,
    VISITOR_HASH_SALT: 'test-only-random-salt',
    ALLOWED_ORIGINS: 'https://shan-verse.com',
  };
}

function createRequest(
  method,
  body,
  origin = 'https://shan-verse.com',
  ip = '203.0.113.10'
) {
  return new Request('https://shan-verse.com/api/site-stats', {
    method,
    headers: {
      Origin: origin,
      'CF-Connecting-IP': ip,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('GET initializes counters without creating a visitor or active session', async () => {
  const namespace = new MemoryDurableObjectNamespace();
  const response = await worker.fetch(createRequest('GET'), createEnv({ namespace }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.views, 0);
  assert.equal(body.visitors, 0);
  assert.equal(body.online, 0);
  assert.equal(Number.isNaN(Date.parse(body.updatedAt)), false);
  assert.equal([...namespace.storage.values.keys()].some((key) => key.startsWith('visitor:')), false);
  assert.equal([...namespace.storage.values.keys()].some((key) => key.startsWith('active:')), false);
});

test('first request migrates legacy KV totals into the Durable Object', async () => {
  const kv = new MemoryKv();
  kv.values.set('counter:views', '120');
  kv.values.set('counter:visitors', '45');

  const response = await worker.fetch(createRequest('GET'), createEnv({ kv }));
  const body = await response.json();

  assert.equal(body.views, 120);
  assert.equal(body.visitors, 45);
});

test('pageviews increment once while heartbeats only refresh presence', async () => {
  const env = createEnv();

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

test('concurrent pageviews cannot overwrite each other', async () => {
  const env = createEnv();
  const requests = Array.from({ length: 25 }, (_, index) => worker.fetch(
    createRequest(
      'POST',
      { event: 'pageview', path: '/', title: 'Home' },
      'https://shan-verse.com',
      `203.0.113.${index + 1}`
    ),
    env
  ));

  await Promise.all(requests);
  const response = await worker.fetch(createRequest('GET'), env);
  const body = await response.json();

  assert.equal(body.views, 25);
  assert.equal(body.visitors, 25);
  assert.equal(body.online, 25);
});

test('invalid events and disallowed origins cannot mutate counters', async () => {
  const namespace = new MemoryDurableObjectNamespace();
  const env = createEnv({ namespace });

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
  assert.equal(namespace.storage.values.size, 0);
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
