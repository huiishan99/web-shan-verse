import { validateGithubSnapshot } from '../../utils/github-contributions.js';

(() => {
  const SNAPSHOT_URL = '/data/github-contributions.json';
  const REQUEST_TIMEOUT_MS = 3000;
  const CACHE_TTL_MS = 300000;
  const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const githubCalendarState = window.__shanGithubCalendarState || {
    contributionRequests: new Map(),
    isListening: false,
  };
  if (githubCalendarState.source !== SNAPSHOT_URL) {
    githubCalendarState.contributionRequests = new Map();
    githubCalendarState.source = SNAPSHOT_URL;
  }
  window.__shanGithubCalendarState = githubCalendarState;
  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  function parseUTCDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);
    return nextDate;
  }

  function toDateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function buildWeeks(startKey, endKey, contributions) {
    const start = parseUTCDate(startKey);
    const end = parseUTCDate(endKey);
    const contributionByDate = new Map(
      contributions.map((item) => [item.date, item])
    );
    const days = [];

    for (let date = start; date <= end; date = addDays(date, 1)) {
      const key = toDateKey(date);
      days.push({
        date: new Date(date),
        key,
        contribution: contributionByDate.get(key),
      });
    }

    const weeks = [];
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }

    return weeks;
  }

  function filterCrowdedLabels(labels, minGap = 3) {
    const filteredLabels = [...labels];
    let previousLabelIndex = -1;

    labels.forEach((label, index) => {
      if (!label) return;

      if (previousLabelIndex >= 0 && index - previousLabelIndex < minGap) {
        filteredLabels[previousLabelIndex] = '';
      }

      previousLabelIndex = index;
    });

    return filteredLabels;
  }

  function createLabelRow(className, weeks, getLabelDate, options = {}) {
    const row = document.createElement('div');
    row.className = className;
    row.setAttribute('aria-hidden', 'true');

    const labels = weeks.map((week, weekIndex) => {
      const labelDate = getLabelDate(week, weekIndex);
      return labelDate ? labelDate : '';
    });
    const visibleLabels = options.filterCrowded ? filterCrowdedLabels(labels) : labels;

    visibleLabels.forEach((labelText) => {
      const label = document.createElement('span');
      label.textContent = labelText;
      row.append(label);
    });

    return row;
  }

  function renderCalendar(root, weeks) {
    const years = createLabelRow('github-calendar-years', weeks, (week, weekIndex) => {
      const firstOfYear = week.find((day) => (
        day.date.getUTCMonth() === 0 && day.date.getUTCDate() === 1
      ));
      const labelDate = firstOfYear?.date || (weekIndex === 0 ? week[0]?.date : null);
      return labelDate ? String(labelDate.getUTCFullYear()) : '';
    });

    const months = createLabelRow('github-calendar-months', weeks, (week, weekIndex) => {
      const firstOfMonth = week.find((day) => day.date.getUTCDate() === 1);
      const labelDate = firstOfMonth?.date || (weekIndex === 0 ? week[0]?.date : null);
      return labelDate ? monthFormatter.format(labelDate) : '';
    }, { filterCrowded: true });

    const weekdays = document.createElement('div');
    weekdays.className = 'github-calendar-weekdays';
    weekdays.setAttribute('aria-hidden', 'true');
    WEEKDAYS.forEach((weekday) => {
      const label = document.createElement('span');
      label.textContent = weekday;
      weekdays.append(label);
    });

    const grid = document.createElement('div');
    grid.className = 'github-calendar-grid';
    weeks.forEach((week) => {
      const weekEl = document.createElement('div');
      weekEl.className = 'github-calendar-week';

      week.forEach((day) => {
        const count = day.contribution?.count;
        const level = day.contribution?.level ?? 0;
        const cell = document.createElement('span');
        cell.className = `github-calendar-day github-calendar-day--${count === undefined ? 'unknown' : level}`;
        cell.title = count === undefined
          ? `${dateFormatter.format(day.date)}: GitHub activity unavailable`
          : `${dateFormatter.format(day.date)}: ${count} GitHub contribution${count === 1 ? '' : 's'}`;
        cell.setAttribute('aria-label', cell.title);
        weekEl.append(cell);
      });

      grid.append(weekEl);
    });

    const body = document.createElement('div');
    body.className = 'github-calendar-body';
    body.append(weekdays, grid);

    root.replaceChildren(years, months, body);
  }

  function loadContributionData(username) {
    const { contributionRequests } = githubCalendarState;
    const cached = contributionRequests.get(username);
    if (cached?.expiresAt > Date.now()) return cached.promise;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const entry = { expiresAt: Infinity, promise: null };
    entry.promise = fetch(SNAPSHOT_URL, {
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`GitHub contribution snapshot returned ${response.status}`);
      const snapshot = validateGithubSnapshot(await response.json(), username);
      entry.expiresAt = Date.now() + CACHE_TTL_MS;
      return snapshot;
    }).catch((error) => {
      if (contributionRequests.get(username) === entry) contributionRequests.delete(username);
      throw error;
    }).finally(() => window.clearTimeout(timeout));
    contributionRequests.set(username, entry);
    return entry.promise;
  }

  async function setupGithubActivity(activity) {
    if (activity.dataset.source !== SNAPSHOT_URL) {
      activity.dataset.ready = 'false';
      activity.dataset.source = SNAPSHOT_URL;
    }
    if (activity.dataset.ready === 'true' || activity.dataset.ready === 'loading') return;
    const roots = [...activity.querySelectorAll('[data-github-calendar]')];
    const username = roots[0]?.dataset.username;
    if (!username || !roots.length || roots.some((root) => !root.dataset.start || !root.dataset.end)) return;
    activity.dataset.ready = 'loading';

    for (const root of roots) renderCalendar(root, buildWeeks(root.dataset.start, root.dataset.end, []));
    activity.classList.add('is-loading');
    activity.classList.remove('is-enhanced', 'is-unavailable', 'is-fallback', 'is-image-unavailable');
    activity.setAttribute('aria-busy', 'true');
    const request = loadContributionData(username);

    try {
      const snapshot = await request;
      const today = toDateKey(new Date());
      const calendars = roots.map((root) => buildWeeks(root.dataset.start, root.dataset.end, snapshot.contributions));
      for (const weeks of calendars) {
        const pastDays = weeks.flat().filter((day) => day.key <= today);
        if (!pastDays.some((day) => day.contribution)) {
          throw new Error('GitHub contribution snapshot does not overlap the displayed dates');
        }
      }
      if (!activity.isConnected) return;
      roots.forEach((root, index) => renderCalendar(root, calendars[index]));
      activity.dataset.ready = 'true';
      activity.classList.add('is-enhanced');
      activity.classList.remove('is-loading', 'is-unavailable');
      activity.setAttribute('aria-busy', 'false');
    } catch (error) {
      const cached = githubCalendarState.contributionRequests.get(username);
      if (cached?.promise === request) githubCalendarState.contributionRequests.delete(username);
      if (!activity.isConnected) return;
      console.warn('GitHub contribution calendar unavailable:', error);
      activity.dataset.ready = 'false';
      activity.classList.remove('is-loading', 'is-enhanced');
      activity.classList.add('is-unavailable');
      activity.setAttribute('aria-busy', 'false');
    }
  }

  function setupGithubCalendars() {
    document
      .querySelectorAll('[data-github-activity]')
      .forEach((activity) => setupGithubActivity(activity));
  }

  window.__shanSetupGithubCalendars = setupGithubCalendars;
  setupGithubCalendars();

  if (!githubCalendarState.isListening) {
    document.addEventListener('astro:page-load', () => {
      window.__shanSetupGithubCalendars?.();
    });
    githubCalendarState.isListening = true;
  }
  if (!githubCalendarState.isOnlineListening) {
    window.addEventListener('online', () => window.__shanSetupGithubCalendars?.());
    githubCalendarState.isOnlineListening = true;
  }
})();

(() => {
  if (window.__shanJourneyTextureWarmupReady) return;
  window.__shanJourneyTextureWarmupReady = true;

  const warmup = window.__shanJourneyTextureWarmup || {
    urls: new Set(),
  };
  window.__shanJourneyTextureWarmup = warmup;

  const usesMobileTexture = window.matchMedia('(max-width: 719px)').matches
    || ('deviceMemory' in navigator && Number(navigator.deviceMemory) <= 4);
  const textureUrl = usesMobileTexture
    ? '/images/earth-natural-muted-2048.jpg'
    : '/images/earth-natural-muted-4096.jpg';

  function warmImage(url) {
    if (warmup.urls.has(url)) return;
    warmup.urls.add(url);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'low';
    document.head.append(link);
  }

  function warmJourneyTextures() {
    warmImage(textureUrl);
  }

  function maybeWarmFromEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-journey-preload]')) warmJourneyTextures();
  }

  document.addEventListener('pointerover', maybeWarmFromEvent, { passive: true });
  document.addEventListener('touchstart', maybeWarmFromEvent, { passive: true });
  document.addEventListener('focusin', maybeWarmFromEvent);
})();
