// Opt-in local diagnostics. Imported only in development; never sends telemetry.
export function setupSiteProfile() {
  if (window.__shanSiteProfile || !new URLSearchParams(location.search).has('site-profile')) return;
  window.__shanSiteProfile = true;
  const controller = new AbortController();
  const { signal } = controller;
  const tasks = [];
  let transition;
  let reports = 0;
  let droppedTasks = 0;
  const observer = typeof PerformanceObserver === 'function'
    && PerformanceObserver.supportedEntryTypes.includes('longtask')
    ? new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (tasks.length < 128) tasks.push({ start: entry.startTime, duration: entry.duration });
        else droppedTasks++;
      }
    }) : null;
  observer?.observe({ type: 'longtask', buffered: true });
  const stop = () => { observer?.disconnect(); controller.abort(); clearTimeout(timeout); };
  const timeout = setTimeout(stop, 180_000);
  window.addEventListener('pagehide', stop, { once: true, signal });
  const round = (number) => Math.round(number * 10) / 10;
  const typography = () => ['.logo-text', '.nav-links a', 'main h1', 'main h2', 'main p',
    '.hero-tagline', '.hero-description', '.beyond-subtitle', '.post-title', '.post-excerpt']
    .flatMap((selector) => {
      const element = document.querySelector(selector);
      if (!element) return [];
      const style = getComputedStyle(element);
      const range = document.createRange();
      range.selectNodeContents(element);
      const rects = [...range.getClientRects()].map((rect) => ({
        width: round(rect.width), height: round(rect.height),
      }));
      return [{ selector, text: element.textContent?.trim(), family: style.fontFamily,
        weight: style.fontWeight, style: style.fontStyle, size: style.fontSize,
        lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, rects }];
    });
  const report = (kind) => {
    if (signal.aborted || reports++ >= 8) return;
    if (kind === 'fonts-ready') document.documentElement.dataset.siteFontProfile = 'ready';
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource')
      .filter((entry) => entry.startTime >= (transition?.start ?? 0))
      .map((entry) => ({
        url: entry.name, type: entry.initiatorType, duration: round(entry.duration),
        transfer: entry.transferSize, encoded: entry.encodedBodySize,
      }));
    console.info('[site-profile]', JSON.stringify({
      kind, path: location.pathname, navigation: navigation && {
        ttfb: round(navigation.responseStart), dcl: round(navigation.domContentLoadedEventEnd),
        load: round(navigation.loadEventEnd), redirects: navigation.redirectCount,
      },
      viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
      transition: transition && { ...transition, readyMs: round(performance.now() - transition.start) },
      elements: document.querySelectorAll('*').length,
      images: document.images.length,
      fonts: { status: document.fonts.status, observedAtMs: round(performance.now()),
        loaded: [...document.fonts].filter((face) => face.status === 'loaded')
          .map((face) => ({ family: face.family, style: face.style, weight: face.weight })),
        typography: typography() },
      longTasks: tasks.filter((task) => task.start >= (transition?.start ?? 0)),
      droppedTasks,
      resources,
    }));
    if (reports >= 8) stop();
  };
  document.addEventListener('astro:before-preparation', (event) => {
    document.documentElement.dataset.siteFontProfile = 'loading';
    transition = { start: performance.now(), to: event.to.pathname };
  }, { signal });
  document.addEventListener('astro:page-load', () => {
    if (transition) requestAnimationFrame(() => requestAnimationFrame(() => {
      report('transition');
      document.fonts.ready.then(() => report('fonts-ready'));
    }));
  }, { signal });
  document.fonts.ready.then(() => report('fonts-ready'));
  if (document.readyState === 'complete') report('load');
  else window.addEventListener('load', () => setTimeout(() => report('load'), 0), { once: true, signal });
}
