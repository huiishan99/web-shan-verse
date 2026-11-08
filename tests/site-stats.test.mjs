import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:http';
import test from 'node:test';
import worker, { SiteStatsCounter } from '../workers/site-stats/worker.js';

const CLIENT_A = '11111111-1111-4111-8111-aaaaaaaaaaaa';
const CLIENT_B = '22222222-2222-4222-8222-bbbbbbbbbbbb';
const CLIENT_C = '33333333-3333-4333-8333-cccccccccccc';

class MemoryKv {
  values = new Map();
  getCalls = [];

  async get(key) {
    this.getCalls.push(key);
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
  object;
  env = {};

  idFromName(name) {
    return name;
  }

  get() {
    this.object ??= new SiteStatsCounter({ storage: this.storage }, this.env);
    return {
      fetch: (request) => this.object.fetch(request),
    };
  }
}

function createEnv({ kv = new MemoryKv(), namespace = new MemoryDurableObjectNamespace() } = {}) {
  const env = {
    SITE_STATS: kv,
    SITE_STATS_COUNTER: namespace,
    VISITOR_HASH_SALT: 'test-only-random-salt',
    ALLOWED_ORIGINS: 'https://shan-verse.com',
  };
  namespace.env = env;
  return env;
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

test('immutable upstream responses preserve stats, cache headers and CORS without mutating upstream headers', async (t) => {
  const namespace = new MemoryDurableObjectNamespace();
  const env = createEnv({ namespace });
  const counter = namespace.get();
  const upstreamResponses = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const counterResponse = await counter.fetch(new Request('https://site-stats.internal/update', {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.concat(chunks).toString('utf8'),
    }));
    response.statusCode = counterResponse.status;
    counterResponse.headers.forEach((value, key) => response.setHeader(key, value));
    response.setHeader('X-DO-Upstream', 'preserved');
    response.end(await counterResponse.text());
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const upstreamUrl = `http://127.0.0.1:${server.address().port}/update`;
  t.mock.method(namespace, 'get', () => ({
    fetch: async (request) => {
      const response = await fetch(upstreamUrl, {
        method: request.method,
        headers: request.headers,
        body: await request.text(),
      });
      assert.throws(() => response.headers.set('X-Immutable-Check', 'blocked'), TypeError);
      upstreamResponses.push({ response, headers: [...response.headers] });
      return response;
    },
  }));

  const requests = [
    { method: 'GET', views: 0, visitors: 0, online: 0 },
    { method: 'POST', views: 1, visitors: 1, online: 1 },
    { method: 'GET', views: 1, visitors: 1, online: 1 },
  ];
  for (const expected of requests) {
    const response = await worker.fetch(createRequest(
      expected.method,
      expected.method === 'POST' ? { event: 'pageview', clientId: CLIENT_A } : undefined
    ), env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://shan-verse.com');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assert.equal(response.headers.get('X-DO-Upstream'), 'preserved');
    const body = await response.json();
    assert.equal(body.views, expected.views);
    assert.equal(body.visitors, expected.visitors);
    assert.equal(body.online, expected.online);
  }

  assert.equal(upstreamResponses.length, 3);
  for (const { response, headers } of upstreamResponses) {
    assert.deepEqual([...response.headers], headers);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
    assert.throws(() => response.headers.set('X-Immutable-Check', 'blocked'), TypeError);
  }
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

test('legacy totals migrate once and known visitors and reads do not keep querying KV', async () => {
  const kv = new MemoryKv();
  kv.values.set('counter:views', '120');
  kv.values.set('counter:visitors', '45');
  const namespace = new MemoryDurableObjectNamespace();
  namespace.storage.values.set('counter:views', 200);
  namespace.storage.values.set('counter:visitors', 75);
  const env = createEnv({ kv, namespace });

  const initialized = await worker.fetch(createRequest('GET'), env);
  const initialBody = await initialized.json();
  assert.equal(initialBody.views, 200);
  assert.equal(initialBody.visitors, 75);
  assert.deepEqual(kv.getCalls, ['counter:views', 'counter:visitors']);

  kv.values.set('counter:views', '9999');
  kv.values.set('counter:visitors', '9999');
  const reads = await Promise.all(Array.from({ length: 10 }, () => worker.fetch(createRequest('GET'), env)));
  for (const response of reads) {
    const body = await response.json();
    assert.equal(body.views, 200);
    assert.equal(body.visitors, 75);
  }
  const heartbeat = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', clientId: CLIENT_A }),
    env
  );
  const heartbeatBody = await heartbeat.json();
  assert.equal(heartbeatBody.views, 200);
  assert.equal(heartbeatBody.visitors, 76);
  assert.equal(heartbeatBody.online, 1);
  assert.equal(kv.getCalls.length, 3);
  const visitorLookup = kv.getCalls[2];
  assert.match(visitorLookup, /^visitor:[0-9a-f]{64}$/);
  await worker.fetch(createRequest('POST', { event: 'heartbeat', clientId: CLIENT_A }), env);
  await worker.fetch(createRequest('GET'), env);
  assert.deepEqual(kv.getCalls, ['counter:views', 'counter:visitors', visitorLookup]);
});

test('a returning legacy visitor preserves the existing total and is remembered by the Durable Object', async () => {
  const kv = new MemoryKv();
  kv.values.set('counter:views', '2000');
  kv.values.set('counter:visitors', '124');
  const namespace = new MemoryDurableObjectNamespace();
  const env = createEnv({ kv, namespace });
  const oldVisitorKey = `visitor:${createHash('sha256')
    .update(`${env.VISITOR_HASH_SALT}:203.0.113.10`)
    .digest('hex')}`;
  const oldVisitorRecord = '{"firstSeenAt":"2026-05-17T00:00:00Z"}';
  kv.values.set(oldVisitorKey, oldVisitorRecord);
  const originalKv = [...kv.values];

  const returned = await worker.fetch(
    createRequest('POST', { event: 'pageview', clientId: CLIENT_A }),
    env
  );
  const returnedBody = await returned.json();
  assert.equal(returned.status, 200);
  assert.equal(returnedBody.views, 2001);
  assert.equal(returnedBody.visitors, 124);
  assert.equal(returnedBody.online, 1);
  assert.equal(namespace.storage.values.has(oldVisitorKey), true);

  const secondBrowser = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', clientId: CLIENT_B }),
    env
  );
  const secondBody = await secondBrowser.json();
  assert.equal(secondBody.views, 2001);
  assert.equal(secondBody.visitors, 124);
  assert.equal(secondBody.online, 2);
  await worker.fetch(createRequest('GET'), env);
  assert.deepEqual(kv.getCalls, ['counter:views', 'counter:visitors', oldVisitorKey]);
  assert.deepEqual([...kv.values], originalKv);
});

test('a new IP increments a migrated visitor total only once across browser IDs and reads', async () => {
  const kv = new MemoryKv();
  kv.values.set('counter:views', '2000');
  kv.values.set('counter:visitors', '124');
  const env = createEnv({ kv });

  for (const [index, clientId] of [CLIENT_A, CLIENT_B].entries()) {
    const response = await worker.fetch(createRequest('POST', { event: 'pageview', clientId }), env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.views, 2001 + index);
    assert.equal(body.visitors, 125);
    assert.equal(body.online, index + 1);
  }
  const heartbeat = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', clientId: CLIENT_A }),
    env
  );
  assert.equal((await heartbeat.json()).visitors, 125);
  const observed = await worker.fetch(createRequest('GET'), env);
  const body = await observed.json();
  assert.equal(body.views, 2002);
  assert.equal(body.visitors, 125);
  assert.equal(body.online, 2);
  assert.equal(kv.getCalls.length, 3);
  assert.match(kv.getCalls[2], /^visitor:[0-9a-f]{64}$/);
  assert.equal(kv.values.get('counter:visitors'), '124');
  assert.equal(kv.values.get('counter:views'), '2000');
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

test('browser IDs distinguish same-IP devices and expire independently after five minutes', async (t) => {
  let now = Date.parse('2026-01-01T00:00:00Z');
  t.mock.method(Date, 'now', () => now);
  const env = createEnv();

  for (const [index, clientId] of [CLIENT_A, CLIENT_B].entries()) {
    const response = await worker.fetch(createRequest('POST', { event: 'pageview', clientId }), env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.views, index + 1);
    assert.equal(body.visitors, 1);
    assert.equal(body.online, index + 1);
  }

  now += 240_000;
  const heartbeat = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', clientId: CLIENT_B }),
    env
  );
  assert.equal((await heartbeat.json()).online, 2);

  now += 60_001;
  const observed = await worker.fetch(createRequest('GET'), env);
  const body = await observed.json();
  assert.equal(body.online, 1);
  assert.equal(body.visitors, 1);
  assert.equal(body.views, 2);
});

test('one browser ID is case-normalized across concurrent requests and IP changes without storing raw IDs', async () => {
  const namespace = new MemoryDurableObjectNamespace();
  const env = createEnv({ namespace });
  const responses = await Promise.all([CLIENT_A, CLIENT_A.toUpperCase(), CLIENT_A].map((clientId) =>
    worker.fetch(createRequest('POST', { event: 'pageview', clientId }), env)
  ));
  for (const response of responses) {
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.online, 1);
    assert.equal(body.visitors, 1);
  }

  const moved = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', clientId: CLIENT_A }, 'https://shan-verse.com', '203.0.113.20'),
    env
  );
  const body = await moved.json();
  assert.equal(body.online, 1);
  assert.equal(body.visitors, 2);
  assert.equal(body.views, 3);
  const stored = JSON.stringify([...namespace.storage.values]);
  assert.equal(stored.includes(CLIENT_A), false);
  assert.equal(stored.includes(CLIENT_A.toUpperCase()), false);
  assert.equal(stored.includes('203.0.113.20'), false);
});

test('provided malformed browser IDs are rejected before storage or legacy migration', async () => {
  const kv = new MemoryKv();
  const namespace = new MemoryDurableObjectNamespace();
  const env = createEnv({ kv, namespace });
  const invalidIds = [null, 0, [], {}, '', 'not-a-uuid', CLIENT_A.replaceAll('-', ''), `${CLIENT_A}\n`, ` ${CLIENT_A}`];

  for (const clientId of invalidIds) {
    const response = await worker.fetch(createRequest('POST', { event: 'pageview', clientId }), env);
    assert.equal(response.status, 400, `Invalid client ID: ${JSON.stringify(clientId)}`);
    assert.equal(namespace.storage.values.size, 0);
    assert.equal(kv.getCalls.length, 0);
  }
});

test('mixed browser and legacy clients do not double-count an IP represented by a browser', async () => {
  const env = createEnv();
  const arrivals = [
    { ip: '203.0.113.1', online: 1, visitors: 1 },
    { ip: '203.0.113.1', clientId: CLIENT_A, online: 1, visitors: 1 },
    { ip: '203.0.113.2', online: 2, visitors: 2 },
    { ip: '203.0.113.1', clientId: CLIENT_B, online: 3, visitors: 2 },
    { ip: '203.0.113.2', clientId: CLIENT_C, online: 3, visitors: 2 },
  ];
  for (const [index, arrival] of arrivals.entries()) {
    const response = await worker.fetch(
      createRequest('POST', { event: 'pageview', clientId: arrival.clientId }, 'https://shan-verse.com', arrival.ip),
      env
    );
    const body = await response.json();
    assert.equal(body.online, arrival.online);
    assert.equal(body.visitors, arrival.visitors);
    assert.equal(body.views, index + 1);
  }
  const observed = await worker.fetch(createRequest('GET'), env);
  const body = await observed.json();
  assert.equal(body.online, 3);
  assert.equal(body.visitors, 2);
  assert.equal(body.views, 5);
});

test('expired browser records no longer suppress a still-active legacy client', async (t) => {
  const startedAt = Date.parse('2026-01-01T00:00:00Z');
  let now = startedAt;
  t.mock.method(Date, 'now', () => now);
  const env = createEnv();
  await worker.fetch(createRequest('POST', { event: 'pageview' }), env);

  now = startedAt + 60_000;
  await worker.fetch(createRequest('POST', { event: 'pageview', clientId: CLIENT_A }), env);
  now = startedAt + 240_000;
  const renewed = await worker.fetch(createRequest('POST', { event: 'heartbeat' }), env);
  assert.equal((await renewed.json()).online, 1);

  now = startedAt + 360_001;
  const browserExpired = await worker.fetch(createRequest('GET'), env);
  assert.equal((await browserExpired.json()).online, 1);
  now = startedAt + 540_001;
  const allExpired = await worker.fetch(createRequest('GET'), env);
  const body = await allExpired.json();
  assert.equal(body.online, 0);
  assert.equal(body.visitors, 1);
  assert.equal(body.views, 2);
});

test('GET observes distinct visitors joining online 1 to 2 to 3 without adding views', async () => {
  const env = createEnv();

  for (let count = 1; count <= 3; count += 1) {
    const joined = await worker.fetch(
      createRequest('POST', { event: 'pageview', path: '/' }, 'https://shan-verse.com', `203.0.113.${count}`),
      env
    );
    assert.equal(joined.status, 200);
    assert.equal((await joined.json()).online, count);

    const observed = await worker.fetch(
      createRequest('GET', undefined, 'https://shan-verse.com', '198.51.100.250'),
      env
    );
    const body = await observed.json();
    assert.equal(observed.status, 200);
    assert.equal(body.online, count);
    assert.equal(body.visitors, count);
    assert.equal(body.views, count);
  }
});

test('concurrent pageviews and heartbeats from one IP share one visitor and presence', async () => {
  const env = createEnv();
  const events = [
    { event: 'pageview', path: '/' },
    { event: 'pageview', path: '/projects' },
    { event: 'pageview', path: '/zh/about' },
    { event: 'heartbeat', path: '/' },
  ];
  const responses = await Promise.all(events.map((event) =>
    worker.fetch(createRequest('POST', event), env)
  ));

  for (const response of responses) {
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.visitors, 1);
    assert.equal(body.online, 1);
  }

  const observed = await worker.fetch(createRequest('GET'), env);
  const body = await observed.json();
  assert.equal(body.views, 3);
  assert.equal(body.visitors, 1);
  assert.equal(body.online, 1);
});

test('an expired visitor leaves online while another visitor heartbeat renews presence', async (t) => {
  let now = Date.parse('2026-01-01T00:00:00Z');
  t.mock.method(Date, 'now', () => now);
  const env = createEnv();

  for (const ip of ['203.0.113.1', '203.0.113.2']) {
    const joined = await worker.fetch(
      createRequest('POST', { event: 'pageview', path: '/' }, 'https://shan-verse.com', ip),
      env
    );
    assert.equal(joined.status, 200);
  }

  now += 240_000;
  const renewed = await worker.fetch(
    createRequest('POST', { event: 'heartbeat', path: '/' }, 'https://shan-verse.com', '203.0.113.2'),
    env
  );
  const renewedBody = await renewed.json();
  assert.equal(renewedBody.online, 2);
  assert.equal(renewedBody.views, 2);

  now += 60_001;
  const observed = await worker.fetch(createRequest('GET'), env);
  const body = await observed.json();
  assert.equal(body.online, 1);
  assert.equal(body.visitors, 2);
  assert.equal(body.views, 2);
});

test('GET does not renew presence at or before the five-minute expiry boundary', async (t) => {
  const startedAt = Date.parse('2026-01-01T00:00:00Z');
  let now = startedAt;
  t.mock.method(Date, 'now', () => now);
  const env = createEnv();
  const joined = await worker.fetch(
    createRequest('POST', { event: 'pageview', path: '/' }),
    env
  );
  assert.equal(joined.status, 200);

  for (const [elapsed, expectedOnline] of [[240_000, 1], [300_000, 1], [300_001, 0]]) {
    now = startedAt + elapsed;
    const observed = await worker.fetch(createRequest('GET'), env);
    const body = await observed.json();
    assert.equal(observed.status, 200);
    assert.equal(body.online, expectedOnline, `Online after ${elapsed} ms`);
    assert.equal(body.visitors, 1);
    assert.equal(body.views, 1);
  }
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
