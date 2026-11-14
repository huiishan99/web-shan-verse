// A plain-link disclosure, not a menu widget or a scene controller.
export function setupExploreNavigation(rootDocument = document) {
  const controller = new AbortController();
  const { signal } = controller;
  const openDisclosures = () => [...rootDocument.querySelectorAll('[data-site-explore][open]')];
  const contains = (disclosure, target) => Boolean(target?.nodeType && disclosure.contains(target));
  const close = (disclosure, restoreFocus = false) => {
    disclosure.open = false;
    if (restoreFocus) disclosure.querySelector('[data-site-explore-toggle]')?.focus({ preventScroll: true });
  };

  rootDocument.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const disclosures = openDisclosures();
    if (!disclosures.length) return;
    const active = disclosures.find((disclosure) => contains(disclosure, event.target)
      || contains(disclosure, rootDocument.activeElement));
    // Capture gives the open disclosure ownership before graph/document Escape
    // handlers can close a selected work behind the navigation panel.
    event.preventDefault();
    event.stopImmediatePropagation();
    for (const disclosure of disclosures) close(disclosure, disclosure === active);
  }, { capture: true, signal });

  const dismissOutside = (event) => {
    for (const disclosure of openDisclosures()) {
      if (!contains(disclosure, event.target)) close(disclosure);
    }
  };
  rootDocument.addEventListener('pointerdown', dismissOutside, { signal });
  rootDocument.addEventListener('click', dismissOutside, { signal });
  rootDocument.addEventListener('focusout', (event) => {
    for (const disclosure of openDisclosures()) {
      if (contains(disclosure, event.target) && !contains(disclosure, event.relatedTarget)) close(disclosure);
    }
  }, { signal });
  rootDocument.addEventListener('astro:before-swap', () => {
    for (const disclosure of openDisclosures()) close(disclosure);
  }, { signal });

  return () => controller.abort();
}
