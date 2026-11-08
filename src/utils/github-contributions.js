const DAY_MS = 86_400_000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const USERNAME = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

/**
 * @typedef {{ date: string, count: number, level: number }} GithubContribution
 * @typedef {{
 *   schemaVersion: 1,
 *   username: string,
 *   source: string,
 *   fetchedAt: string,
 *   rangeStart: string,
 *   rangeEnd: string,
 *   contributions: GithubContribution[]
 * }} GithubSnapshot
 */

function dateValue(value) {
  if (typeof value !== 'string' || !DATE_KEY.test(value)) {
    throw new Error('Invalid GitHub snapshot date');
  }
  const milliseconds = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid GitHub snapshot date');
  }
  return milliseconds;
}

/**
 * Validate source identity and a complete, chronological year of observed days.
 * Missing days are invalid data, never inferred zero-contribution days.
 * This function does not read the clock, mutate input, or perform any I/O.
 *
 * @param {unknown} data
 * @param {string} [expectedUsername]
 * @returns {GithubSnapshot}
 */
export function validateGithubSnapshot(data, expectedUsername = 'huiishan99') {
  if (!USERNAME.test(expectedUsername) || expectedUsername.includes('--')) {
    throw new Error('Invalid expected GitHub username');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid GitHub snapshot object');
  }
  const snapshot = /** @type {Record<string, unknown>} */ (data);
  if (snapshot.schemaVersion !== 1) throw new Error('Unsupported GitHub snapshot schema version');
  if (snapshot.username !== expectedUsername) throw new Error('Unexpected GitHub snapshot username');
  if (snapshot.source !== `https://github.com/users/${expectedUsername}/contributions`) {
    throw new Error('Unexpected GitHub snapshot source');
  }
  if (typeof snapshot.fetchedAt !== 'string' || !UTC_TIMESTAMP.test(snapshot.fetchedAt)) {
    throw new Error('Invalid GitHub snapshot fetchedAt timestamp');
  }
  const timestamp = Date.parse(snapshot.fetchedAt);
  const normalizedTimestamp = snapshot.fetchedAt.replace(/(?:\.(\d{1,3}))?Z$/, (_, fraction = '') =>
    `.${fraction.padEnd(3, '0')}Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalizedTimestamp) {
    throw new Error('Invalid GitHub snapshot fetchedAt timestamp');
  }

  const days = snapshot.contributions;
  if (!Array.isArray(days) || (days.length !== 365 && days.length !== 366)) {
    throw new Error('GitHub snapshot must contain 365 or 366 consecutive days');
  }
  let previousDate;
  for (const day of days) {
    if (!day || typeof day !== 'object' || Array.isArray(day)) {
      throw new Error('Invalid GitHub contribution day');
    }
    const currentDate = dateValue(day.date);
    if (previousDate !== undefined && currentDate - previousDate !== DAY_MS) {
      throw new Error('GitHub snapshot dates must be sorted, unique and consecutive');
    }
    if (!Number.isSafeInteger(day.count) || day.count < 0) {
      throw new Error('Invalid GitHub contribution count');
    }
    if (!Number.isInteger(day.level) || day.level < 0 || day.level > 4) {
      throw new Error('Invalid GitHub contribution level');
    }
    previousDate = currentDate;
  }
  dateValue(snapshot.rangeStart);
  dateValue(snapshot.rangeEnd);
  if (snapshot.rangeStart !== days[0].date || snapshot.rangeEnd !== days.at(-1).date) {
    throw new Error('GitHub snapshot range must match its first and last dates');
  }
  if (snapshot.rangeEnd > snapshot.fetchedAt.slice(0, 10)) {
    throw new Error('GitHub snapshot contains future contribution dates');
  }
  return /** @type {GithubSnapshot} */ (data);
}
