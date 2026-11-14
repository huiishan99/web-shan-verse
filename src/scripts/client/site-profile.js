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
  const report = (kind) => {
    if (signal.aborted || reports++ >= 8) return;
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
      transition: transition && { ...transition, readyMs: round(performance.now() - transition.start) },
      elements: document.querySelectorAll('*').length,
      images: document.images.length,
      longTasks: tasks.filter((task) => task.start >= (transition?.start ?? 0)),
      droppedTasks,
      resources,
    }));
    if (reports >= 8) stop();
  };
  document.addEventListener('astro:before-preparation', (event) => {
    transition = { start: performance.now(), to: event.to.pathname };
  }, { signal });
  document.addEventListener('astro:page-load', () => {
    if (transition) requestAnimationFrame(() => requestAnimationFrame(() => report('transition')));
  }, { signal });
  if (document.readyState === 'complete') report('load');
  else window.addEventListener('load', () => setTimeout(() => report('load'), 0), { once: true, signal });
}
