(() => {
  let cleanup = () => {};

  function setupAboutNavigation() {
    cleanup();
    const root = document.querySelector('[data-about-navigation]');
    if (!root) return;

    const links = [...root.querySelectorAll('[data-about-jump]')];
    const headings = [...new Set(links.map((link) => document.getElementById(link.hash.slice(1))))]
      .filter(Boolean);
    const disclosure = root.querySelector('details');
    const summary = disclosure.querySelector('summary');
    const desktop = window.matchMedia('(min-width: 901px)');
    const controller = new AbortController();
    const { signal } = controller;
    let frame = 0;

    function updateCurrentSection() {
      frame = 0;
      const offset = desktop.matches ? 144 : 160;
      let current = '';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset) current = heading.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        current = headings.at(-1)?.id || current;
      }
      for (const link of links) {
        if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateCurrentSection);
    }

    root.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('[data-about-jump]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      disclosure.open = false;
      document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
    }, { signal });

    document.addEventListener('click', (event) => {
      if (event.target instanceof Node && !disclosure.contains(event.target)) disclosure.open = false;
    }, { signal });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !disclosure.open || event.defaultPrevented) return;
      disclosure.open = false;
      summary.focus();
      event.preventDefault();
    }, { signal });

    desktop.addEventListener('change', () => {
      disclosure.open = false;
      scheduleUpdate();
    }, { signal });
    window.addEventListener('scroll', scheduleUpdate, { passive: true, signal });
    window.addEventListener('resize', scheduleUpdate, { passive: true, signal });
    window.addEventListener('hashchange', scheduleUpdate, { signal });
    scheduleUpdate();

    cleanup = () => {
      controller.abort();
      window.cancelAnimationFrame(frame);
    };
  }

  setupAboutNavigation();
  document.addEventListener('astro:page-load', setupAboutNavigation);
  document.addEventListener('astro:before-swap', () => cleanup());
})();
