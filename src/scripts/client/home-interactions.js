(() => {
  const API_ROOT = 'https://github-contributions-api.jogruber.de/v4/';
  const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const githubCalendarState = window.__shanGithubCalendarState || {
    contributionRequests: new Map(),
    isListening: false,
  };
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
        contribution: contributionByDate.get(key) || { count: 0, level: 0 },
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
        const count = Number(day.contribution.count) || 0;
        const level = Math.max(0, Math.min(4, Number(day.contribution.level) || 0));
        const cell = document.createElement('span');
        cell.className = `github-calendar-day github-calendar-day--${level}`;
        cell.title = `${dateFormatter.format(day.date)}: ${count} GitHub contribution${count === 1 ? '' : 's'}`;
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

    if (!contributionRequests.has(username)) {
      contributionRequests.set(
        username,
        fetch(`${API_ROOT}${encodeURIComponent(username)}?y=last`).then(async (response) => {
          if (!response.ok) throw new Error(`GitHub contribution API returned ${response.status}`);
          const data = await response.json();
          if (!Array.isArray(data.contributions)) throw new Error('Invalid contribution payload');
          return data.contributions;
        })
      );
    }

    return contributionRequests.get(username);
  }

  async function setupGithubCalendar(root) {
    if (root.dataset.ready === 'true') return;
    root.dataset.ready = 'true';

    const username = root.dataset.username;
    const start = root.dataset.start;
    const end = root.dataset.end;
    const activity = root.closest('[data-github-activity]');
    if (!username || !start || !end || !activity) return;

    try {
      const contributions = await loadContributionData(username);
      const weeks = buildWeeks(start, end, contributions);
      renderCalendar(root, weeks);
      activity.classList.add('is-enhanced');
      activity.classList.remove('is-fallback');
    } catch (error) {
      console.warn('GitHub contribution calendar fallback:', error);
      root.dataset.ready = 'false';
      activity.classList.remove('is-enhanced');
      activity.classList.add('is-fallback');
    }
  }

  function setupGithubCalendars() {
    document
      .querySelectorAll('[data-github-calendar]')
      .forEach((root) => setupGithubCalendar(root));
  }

  window.__shanSetupGithubCalendars = setupGithubCalendars;
  setupGithubCalendars();

  if (!githubCalendarState.isListening) {
    document.addEventListener('astro:page-load', () => {
      window.__shanSetupGithubCalendars?.();
    });
    githubCalendarState.isListening = true;
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
