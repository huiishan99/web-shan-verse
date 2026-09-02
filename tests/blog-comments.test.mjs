import assert from 'node:assert/strict';
import test from 'node:test';
import { createBlogCommentsWorker } from '../workers/blog-comments/worker.js';

class MemoryD1Statement {
  values = [];

  constructor(database, sql) {
    this.database = database;
    this.sql = sql.replace(/\s+/g, ' ').trim();
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async all() {
    if (!this.sql.includes('FROM comments') || !this.sql.includes('thread_key = ?1')) {
      throw new Error(`Unsupported all query: ${this.sql}`);
    }
    const [threadKey, limit] = this.values;
    const results = this.database.rows
      .filter((row) => row.thread_key === threadKey)
      .sort((left, right) => (
        left.created_at.localeCompare(right.created_at) || left.id.localeCompare(right.id)
      ))
      .slice(0, limit)
      .map(({ id, display_name, body, locale, created_at }) => ({
        id,
        display_name,
        body,
        locale,
        created_at,
      }));
    return { results };
  }

  async first() {
    if (!this.sql.includes('COUNT(*) AS count')) {
      throw new Error(`Unsupported first query: ${this.sql}`);
    }
    const [authorHash, since] = this.values;
    return {
      count: this.database.rows.filter((row) => (
        row.author_hash === authorHash && row.created_at >= since
      )).length,
    };
  }

  async run() {
    if (!this.sql.startsWith('INSERT INTO comments')) {
      throw new Error(`Unsupported run query: ${this.sql}`);
    }
    const [id, threadKey, displayName, body, locale, authorHash, createdAt] = this.values;
    this.database.rows.push({
      id,
      thread_key: threadKey,
      display_name: displayName,
      body,
      locale,
      author_hash: authorHash,
      created_at: createdAt,
    });
    return { success: true };
  }
}

class MemoryD1 {
  rows = [];

  prepare(sql) {
    return new MemoryD1Statement(this, sql);
  }
}

function createEnv(database = new MemoryD1()) {
  return {
    COMMENTS_DB: database,
    ALLOWED_ORIGINS: 'https://shan-verse.com',
    ALLOWED_COMMENT_THREADS: 'happiness-is-not-the-end',
    TURNSTILE_EXPECTED_HOSTNAMES: 'shan-verse.com',
    TURNSTILE_SECRET_KEY: 'test-secret',
    COMMENT_HASH_SALT: 'test-only-comment-salt',
  };
}

function createRequest(method, body, {
  origin = 'https://shan-verse.com',
  ip = '203.0.113.10',
  threadKey = 'happiness-is-not-the-end',
} = {}) {
  const url = new URL('https://shan-verse.com/api/comments');
  if (method === 'GET') url.searchParams.set('threadKey', threadKey);
  return new Request(url, {
    method,
    headers: {
      Origin: origin,
      'CF-Connecting-IP': ip,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function validComment(overrides = {}) {
  return {
    threadKey: 'happiness-is-not-the-end',
    displayName: 'Reader',
    body: 'A thoughtful response.',
    locale: 'en',
    turnstileToken: 'verified-token',
    website: '',
    ...overrides,
  };
}

function createWorker({ turnstileSuccess = true } = {}) {
  return createBlogCommentsWorker({
    fetchImpl: async () => new Response(JSON.stringify({
      success: turnstileSuccess,
      hostname: 'shan-verse.com',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
}

test('comments publish immediately and can be read from the shared thread', async () => {
  const env = createEnv();
  const worker = createWorker();
  const createResponse = await worker.fetch(createRequest('POST', validComment()), env);
  const created = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(created.ok, true);
  assert.equal(created.comment.displayName, 'Reader');
  assert.equal(env.COMMENTS_DB.rows.length, 1);
  assert.notEqual(env.COMMENTS_DB.rows[0].author_hash, '203.0.113.10');

  const listResponse = await worker.fetch(createRequest('GET'), env);
  const listed = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.deepEqual(listed.comments, [created.comment]);
  assert.equal('authorHash' in listed.comments[0], false);
});

test('writes reject unknown threads and disallowed origins', async () => {
  const env = createEnv();
  const worker = createWorker();
  const unknownThread = await worker.fetch(
    createRequest('POST', validComment({ threadKey: 'hidden-thread' })),
    env
  );
  const disallowedOrigin = await worker.fetch(
    createRequest('POST', validComment(), { origin: 'https://example.com' }),
    env
  );

  assert.equal(unknownThread.status, 400);
  assert.equal(disallowedOrigin.status, 403);
  assert.equal(env.COMMENTS_DB.rows.length, 0);
});

test('failed Turnstile checks and oversized comments fail closed', async () => {
  const env = createEnv();
  const failedTurnstile = await createWorker({ turnstileSuccess: false }).fetch(
    createRequest('POST', validComment()),
    env
  );
  const oversized = await createWorker().fetch(
    createRequest('POST', validComment({ body: 'x'.repeat(2001) })),
    env
  );

  assert.equal(failedTurnstile.status, 400);
  assert.equal((await failedTurnstile.json()).error, 'turnstile_failed');
  assert.equal(oversized.status, 400);
  assert.equal((await oversized.json()).error, 'invalid_body');
  assert.equal(env.COMMENTS_DB.rows.length, 0);
});

test('one client can publish at most three comments per ten minutes', async () => {
  const env = createEnv();
  const worker = createWorker();

  for (let index = 0; index < 3; index += 1) {
    const response = await worker.fetch(
      createRequest('POST', validComment({ body: `Comment ${index + 1}` })),
      env
    );
    assert.equal(response.status, 201);
  }

  const limited = await worker.fetch(createRequest('POST', validComment({ body: 'Fourth' })), env);
  assert.equal(limited.status, 429);
  assert.equal((await limited.json()).error, 'rate_limited');
  assert.equal(env.COMMENTS_DB.rows.length, 3);
});

test('honeypot submissions return a neutral success without writing', async () => {
  const env = createEnv();
  const worker = createWorker({ turnstileSuccess: false });
  const response = await worker.fetch(
    createRequest('POST', validComment({ website: 'https://spam.example' })),
    env
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, comment: null });
  assert.equal(env.COMMENTS_DB.rows.length, 0);
});
